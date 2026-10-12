"""FastAPI Backend Application for Guardrailed Text-to-SQL Analytics Engine.

Manages the complete pipeline: Natural Language -> LLM SQL -> SQLGlot AST Firewall
-> EXPLAIN Cost Pre-Check -> PostgreSQL/SQLite Execution -> Dynamic PII Masking
-> KPI Extraction & Auto-Visualization.
"""

import os
import re
import io
import time
import urllib.request
import urllib.parse
from typing import Optional, List, Dict, Any
import pandas as pd
from fastapi import FastAPI, HTTPException, Query, File, UploadFile, Response
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from pydantic import BaseModel
from dotenv import load_dotenv

from backend.database.connection import (
    check_health,
    get_schema_metadata,
    execute_query,
    get_sqlite_connection,
    get_postgres_connection,
    PG_USER,
    PG_PASS,
    PG_HOST,
    PG_PORT,
    PG_DB,
    PG_RO_USER
)
import logging
from backend.security.ast_guardrail import validate_ast, get_ast_tree_representation
from backend.security.cost_checker import precheck_query_cost
from backend.security.pii_masker import mask_dataframe_pii
from backend.nlp.llm_engine import generate_sql_query, generate_ai_direct_answer

logger = logging.getLogger("sqlguard.api")
if not logger.handlers:
    _h = logging.StreamHandler()
    _h.setFormatter(logging.Formatter("[%(asctime)s] [%(levelname)s] [SQLGuard.API] %(message)s", datefmt="%H:%M:%S"))
    logger.addHandler(_h)
    logger.setLevel(logging.INFO)
from backend.analytics import (
    extract_kpi_cards,
    auto_generate_chart,
    explain_query_plain_english,
    generate_executive_insights,
    generate_direct_answer
)

load_dotenv()

# Audit & Compliance Counters for Academic Project Defense
AUDIT_LOGS = {
    "total_queries": 0,
    "safe_queries": 0,
    "blocked_attacks": 0,
    "pii_masked_columns_count": 0,
    "recent_events": []
}

app = FastAPI(
    title="Guardrailed Text-to-SQL Analytics API",
    description="Enterprise Text-to-SQL engine with AST compiler firewall, execution cost limits, and PII masking",
    version="1.0.0"
)

# Enable CORS for local dashboards and web clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class NormalizeSlashesMiddleware(BaseHTTPMiddleware):
    """Normalize redundant slashes like //api/health to /api/health."""
    async def dispatch(self, request: Request, call_next):
        path = request.scope.get("path", "")
        if "//" in path:
            request.scope["path"] = re.sub(r"/+", "/", path)
        return await call_next(request)


app.add_middleware(NormalizeSlashesMiddleware)


class QueryRequest(BaseModel):
    question: str
    database_type: str = "auto"  # "auto", "postgres", "sqlite"
    pii_masking: bool = True
    api_key: Optional[str] = None


class QueryResponse(BaseModel):
    success: bool
    question: str
    sql: Optional[str] = None
    security: Dict[str, Any]
    cost_check: Dict[str, Any]
    kpis: Dict[str, Any]
    chart: Optional[Dict[str, Any]] = None
    table_data: List[Dict[str, Any]] = []
    columns: List[str] = []
    pii_masked_columns: List[str] = []
    query_explanation: Optional[str] = None
    direct_answer: Optional[str] = None
    executive_insights: List[str] = []
    ast_tree: List[Dict[str, Any]] = []
    active_engine: str = "sqlite"
    error: Optional[str] = None


@app.get("/")
def root():
    """Root endpoint for status check and API documentation link."""
    return {
        "status": "online",
        "service": "SQL Guard API",
        "docs": "/docs",
        "health": "/api/health"
    }


@app.get("/health")
def simple_health():
    """Simple health probe for cloud deployers."""
    return {"status": "ok"}


@app.get("/api/health")
def health_endpoint():
    """System health check and database connectivity status."""
    db_health = check_health()
    return {
        "status": "healthy",
        "databases": db_health,
        "firewall": "Enterprise AST Firewall Active",
        "pii_protection": "Active Dynamic Masking"
    }


@app.get("/api/audit")
def audit_endpoint():
    """Security and compliance audit metrics for project defense & reporting."""
    return {
        "success": True,
        "audit": AUDIT_LOGS
    }


@app.get("/api/schema")
def schema_endpoint(db_type: str = Query("auto", description="postgres or sqlite")):
    """Returns database schema metadata and table row counts."""
    try:
        schema = get_schema_metadata(db_type=db_type)
        return {"success": True, "schema": schema}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch schema: {str(e)}")


@app.post("/api/upload-csv")
async def upload_csv_dataset(file: UploadFile = File(...)):
    """Upload and ingest a CSV or Excel spreadsheet into SQLite/Postgres as an active table (Point 2)."""
    try:
        content = await file.read()
        filename = file.filename.lower()
        base_name = filename.replace(".csv", "").replace(".xlsx", "").replace(".xls", "").strip()
        table_name = re.sub(r"[^a-zA-Z0-9_]", "_", base_name).lower()
        if not table_name or table_name[0].isdigit():
            table_name = f"tbl_{table_name}"

        if filename.endswith(".csv"):
            df = pd.read_csv(io.BytesIO(content))
        elif filename.endswith((".xlsx", ".xls")):
            df = pd.read_excel(io.BytesIO(content))
        else:
            raise HTTPException(status_code=400, detail="Only CSV or Excel (.xlsx, .xls) files are supported.")

        # Clean column names and drop empty/unnamed index columns
        unnamed_cols = [c for c in df.columns if str(c).lower().startswith("unnamed:")]
        if unnamed_cols:
            df = df.drop(columns=unnamed_cols)
        df.columns = [re.sub(r'[^a-zA-Z0-9_ ]', '', str(c)).strip() or f"col_{i}" for i, c in enumerate(df.columns)]

        # Ingest into SQLite
        sqlite_conn = get_sqlite_connection()
        df.to_sql(table_name, sqlite_conn, if_exists="replace", index=False)
        sqlite_conn.close()

        # Ingest into Postgres if available
        try:
            health = check_health()
            if health.get("postgres"):
                import sqlalchemy
                from sqlalchemy import create_engine
                pg_url = f"postgresql://{PG_USER}:{PG_PASS}@{PG_HOST}:{PG_PORT}/{PG_DB}"
                pg_engine = create_engine(pg_url)
                df.to_sql(table_name, pg_engine, if_exists="replace", index=False)
                with pg_engine.connect() as pconn:
                    pconn.execute(sqlalchemy.text(f'GRANT SELECT ON TABLE "{table_name}" TO {PG_RO_USER};'))
                    pconn.commit()
                pg_engine.dispose()
        except Exception:
            pass

        # Return updated schema
        updated_schema = get_schema_metadata()

        return {
            "success": True,
            "message": f"Dataset imported successfully as '{table_name}' with {len(df):,} records and {len(df.columns)} columns.",
            "table_name": table_name,
            "row_count": len(df),
            "columns": list(df.columns),
            "schema": updated_schema
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to ingest dataset: {str(e)}")


@app.get("/api/test-queries")
def get_benchmark_test_queries():
    """Retrieve all 41 Sales Database benchmark test queries categorized by difficulty."""
    try:
        from backend.nlp.sales_test_queries import TEST_QUERIES
    except ImportError:
        from nlp.sales_test_queries import TEST_QUERIES
        
    queries_list = [
        {
            "id": item["id"],
            "tier": item["tier"],
            "question": item["question"]
        }
        for item in TEST_QUERIES.values()
    ]
    return {"total": len(queries_list), "queries": queries_list}


class ExportRequest(BaseModel):
    table_data: List[Dict[str, Any]]
    columns: Optional[List[str]] = None
    filename: Optional[str] = "sql_guard_export"




@app.get("/api/download-apk")
@app.get("/SQLGuard-Mobile.apk")
def download_mobile_apk():
    """Serves the compiled Android APK for direct mobile installation."""
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    apk_candidates = [
        os.path.join(root_dir, "SQLGuard-Mobile.apk"),
        os.path.join(root_dir, "mobile", "public", "SQLGuard-Mobile.apk"),
        os.path.join(root_dir, "mobile", "android", "app", "build", "outputs", "apk", "debug", "app-debug.apk")
    ]
    for p in apk_candidates:
        if os.path.exists(p):
            return FileResponse(
                path=p,
                filename="SQLGuard-Mobile.apk",
                media_type="application/vnd.android.package-archive"
            )
    raise HTTPException(status_code=404, detail="APK binary not found.")


@app.post("/api/export/{export_format}")
def export_dataset(export_format: str, req: ExportRequest):
    """Exports query result dataset as CSV or JSON with proper attachment headers."""
    if not req.table_data:
        raise HTTPException(status_code=400, detail="No records to export")
    
    df = pd.DataFrame(req.table_data)
    if req.columns:
        valid_cols = [c for c in req.columns if c in df.columns]
        if valid_cols:
            df = df[valid_cols]
            
    base_name = req.filename or f"sql_guard_{int(time.time())}"
    if export_format.lower() == "csv":
        csv_buf = io.StringIO()
        df.to_csv(csv_buf, index=False)
        return Response(
            content=csv_buf.getvalue(),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={base_name}.csv"}
        )
    elif export_format.lower() == "json":
        json_buf = df.to_json(orient="records", indent=2)
        return Response(
            content=json_buf,
            media_type="application/json",
            headers={"Content-Disposition": f"attachment; filename={base_name}.json"}
        )
    else:
        raise HTTPException(status_code=400, detail="Supported formats: csv, json")


@app.post("/api/query", response_model=QueryResponse)
def execute_natural_language_query(req: QueryRequest):
    """Full Guardrailed Text-to-SQL Pipeline:
    1. Input Threat Pre-Check (Defense in Depth)
    2. Schema Metadata Extraction
    3. LLM / Synthesizer SQL Generation
    4. AST-Based SQL Compiler Firewall
    5. EXPLAIN Performance & Cost Pre-Check
    6. Database Execution (PostgreSQL / SQLite)
    7. Dynamic PII Masking
    8. Automated KPI Card Extraction
    9. Auto-Generated Visualization Spec
    """
    question = req.question.strip()
    if not question:
        raise HTTPException(status_code=400, detail="Query prompt cannot be empty.")

    AUDIT_LOGS["total_queries"] += 1

    # Active engine check
    try:
        schema = get_schema_metadata(db_type=req.database_type)
        active_engine = schema.get("engine", "sqlite")
    except Exception:
        active_engine = "sqlite"
        schema = {"engine": "sqlite", "tables": {}}

    # 0. Immediate Threat Pre-Check (Point 8 Defense in Depth)
    # Intercept explicit adversarial SQL injection statements (e.g. DROP TABLE, DELETE, stacked injections)
    q_upper = question.strip().upper()
    destructive_keywords = {"DROP", "DELETE", "UPDATE", "INSERT", "ALTER", "TRUNCATE", "CREATE", "GRANT", "REVOKE", "EXEC", "EXECUTE", "SHUTDOWN"}
    is_explicit_sql_attack = bool(re.match(r'^\s*(DROP|DELETE|ALTER|TRUNCATE|CREATE|UPDATE|INSERT|GRANT|REVOKE|EXEC|SHUTDOWN)\b', q_upper)) or \
                             bool(re.search(r';\s*(DROP|DELETE|ALTER|TRUNCATE|UPDATE|INSERT|GRANT|REVOKE)\b', q_upper)) or \
                             ("--" in question and any(dk in q_upper for dk in destructive_keywords)) or \
                             ("/*" in question and any(dk in q_upper for dk in destructive_keywords))

    if is_explicit_sql_attack:
        raw_ast_check = validate_ast(question, dialect=active_engine)
        if not raw_ast_check["is_safe"]:
            AUDIT_LOGS["blocked_attacks"] += 1
            AUDIT_LOGS["recent_events"].insert(0, {
                "query": question,
                "status": "BLOCKED",
                "reason": raw_ast_check["status"]
            })
            AUDIT_LOGS["recent_events"] = AUDIT_LOGS["recent_events"][:10]
            ast_tree = get_ast_tree_representation(question)
            return QueryResponse(
                success=False,
                question=question,
                sql=question,
                security=raw_ast_check,
                cost_check={"passed": False, "plan_summary": "Execution aborted due to security violation"},
                kpis=extract_kpi_cards(None, security_status=raw_ast_check["status"]),
                chart=None,
                table_data=[],
                columns=[],
                pii_masked_columns=[],
                query_explanation=f"Query rejected: {raw_ast_check['status']}. Unauthorized DDL/DML or destructive statement detected.",
                executive_insights=["Security Incident: AST Compiler Firewall intercepted destructive syntax prior to execution."],
                ast_tree=ast_tree,
                active_engine=active_engine,
                error=raw_ast_check["error"] or f"Statement rejected: {raw_ast_check['status']}"
            )

    # 1. LLM / Synthesizer SQL Generation
    llm_result = generate_sql_query(
        question=question,
        schema=schema,
        api_key=req.api_key,
        engine_dialect=active_engine
    )
    generated_sql = llm_result.get("sql", "").strip()

    # 2. AST Security Guardrail Firewall
    ast_result = validate_ast(generated_sql, dialect=active_engine)
    ast_tree = get_ast_tree_representation(generated_sql)

    if not ast_result["is_safe"]:
        # Update audit statistics
        AUDIT_LOGS["blocked_attacks"] += 1
        AUDIT_LOGS["recent_events"].insert(0, {
            "query": question,
            "status": "BLOCKED",
            "reason": ast_result["status"]
        })
        AUDIT_LOGS["recent_events"] = AUDIT_LOGS["recent_events"][:10]

        # Blocked query returned immediately
        return QueryResponse(
            success=False,
            question=question,
            sql=generated_sql,
            security=ast_result,
            cost_check={"passed": False, "plan_summary": "Skipped due to security block"},
            kpis=extract_kpi_cards(None, security_status=ast_result["status"]),
            chart=None,
            table_data=[],
            columns=[],
            pii_masked_columns=[],
            query_explanation="Query was intercepted by the Compiler Firewall before compilation.",
            executive_insights=["No business insights generated: Query blocked by security firewall."],
            ast_tree=ast_tree,
            active_engine=active_engine,
            error=ast_result["error"] or "Query was blocked by the AST Security Guardrail."
        )

    validated_sql = ast_result["query"] or generated_sql

    # 4. EXPLAIN Cost Pre-Check
    cost_result = precheck_query_cost(validated_sql, db_type=active_engine)
    if not cost_result["passed"]:
        AUDIT_LOGS["blocked_attacks"] += 1
        return QueryResponse(
            success=False,
            question=question,
            sql=validated_sql,
            security=ast_result,
            cost_check=cost_result,
            kpis=extract_kpi_cards(None, security_status="[BLOCKED: Resource Heavy]"),
            chart=None,
            table_data=[],
            columns=[],
            pii_masked_columns=[],
            query_explanation="Query plan exceeded resource execution limits.",
            executive_insights=["Execution blocked: High-cost resource footprint."],
            ast_tree=ast_tree,
            active_engine=active_engine,
            error=cost_result["blocked_reason"]
        )

    # 5. Database Execution
    try:
        logger.info(f"[EXECUTION] Executing on {active_engine}: {validated_sql}")
        df = execute_query(validated_sql, db_type=active_engine)
        logger.info(f"[EXECUTION SUCCESS] {len(df)} rows returned")
    except Exception as e:
        logger.error(f"[EXECUTION FAILED] Database execution error on {active_engine}: {str(e)}")
        return QueryResponse(
            success=False,
            question=question,
            sql=validated_sql,
            security=ast_result,
            cost_check=cost_result,
            kpis=extract_kpi_cards(None, security_status="[Execution Error]"),
            chart=None,
            table_data=[],
            columns=[],
            pii_masked_columns=[],
            query_explanation="Database execution returned an error.",
            executive_insights=[],
            ast_tree=ast_tree,
            active_engine=active_engine,
            error=f"Database execution error: {str(e)}"
        )

    # 6. Dynamic PII Masking
    df_masked, masked_cols = mask_dataframe_pii(df, enabled=req.pii_masking)
    if masked_cols:
        AUDIT_LOGS["pii_masked_columns_count"] += len(masked_cols)

    # 7. Automatic KPI Extraction
    kpis = extract_kpi_cards(df_masked, security_status=ast_result["status"])

    # 8. Auto-Generated Visualization Spec
    chart_spec = auto_generate_chart(df_masked)

    # 9. Plain English Explanation & AI Business Insights
    query_explanation = explain_query_plain_english(validated_sql, question)
    executive_insights = generate_executive_insights(df_masked, question)
    direct_answer = generate_ai_direct_answer(question, validated_sql, df_masked, api_key=req.api_key)
    logger.info(f"[DIRECT ANSWER OUTPUT] {direct_answer[:120]}...")

    # Update audit records
    AUDIT_LOGS["safe_queries"] += 1
    AUDIT_LOGS["recent_events"].insert(0, {
        "query": question,
        "status": "APPROVED",
        "rows": len(df_masked)
    })
    AUDIT_LOGS["recent_events"] = AUDIT_LOGS["recent_events"][:10]

    # Format table records (limit to 1,000 for browser responsiveness)
    display_df = df_masked.head(1000)
    records = display_df.to_dict(orient="records")
    columns = [str(c) for c in display_df.columns]

    return QueryResponse(
        success=True,
        question=question,
        sql=validated_sql,
        security=ast_result,
        cost_check=cost_result,
        kpis=kpis,
        chart=chart_spec,
        table_data=records,
        columns=columns,
        pii_masked_columns=masked_cols,
        query_explanation=query_explanation,
        direct_answer=direct_answer,
        executive_insights=executive_insights,
        ast_tree=ast_tree,
        active_engine=active_engine,
        error=None
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
