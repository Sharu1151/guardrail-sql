"""FastAPI Backend Application for Guardrailed Text-to-SQL Analytics Engine.

Manages the complete pipeline: Natural Language -> LLM SQL -> SQLGlot AST Firewall
-> EXPLAIN Cost Pre-Check -> PostgreSQL/SQLite Execution -> Dynamic PII Masking
-> KPI Extraction & Auto-Visualization.
"""

import os
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from backend.database.connection import (
    check_health,
    get_schema_metadata,
    execute_query
)
from backend.security.ast_guardrail import validate_ast, get_ast_tree_representation
from backend.security.cost_checker import precheck_query_cost
from backend.security.pii_masker import mask_dataframe_pii
from backend.nlp.llm_engine import generate_sql_query
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


@app.get("/api/health")
def health_endpoint():
    """System health check and database connectivity status."""
    db_health = check_health()
    return {
        "status": "healthy",
        "databases": db_health,
        "firewall": "SQLGlot AST Active",
        "pii_protection": "SHA-256 Enabled"
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


@app.post("/api/query", response_model=QueryResponse)
def execute_natural_language_query(req: QueryRequest):
    """Full Guardrailed Text-to-SQL Pipeline:
    1. Schema Metadata Extraction
    2. LLM / Synthesizer SQL Generation
    3. AST-Based SQL Compiler Firewall
    4. EXPLAIN Performance & Cost Pre-Check
    5. Database Execution (PostgreSQL / SQLite)
    6. Dynamic PII Masking (SHA-256)
    7. Automated KPI Card Extraction
    8. Auto-Generated Visualization Spec
    """
    question = req.question.strip()
    if not question:
        raise HTTPException(status_code=400, detail="Query prompt cannot be empty.")

    AUDIT_LOGS["total_queries"] += 1

    # 1. Schema metadata
    try:
        schema = get_schema_metadata(db_type=req.database_type)
        active_engine = schema.get("engine", "sqlite")
    except Exception as e:
        active_engine = "sqlite"
        schema = {"engine": "sqlite", "tables": {}}

    # 2. LLM SQL Generation
    llm_result = generate_sql_query(
        question=question,
        schema=schema,
        api_key=req.api_key,
        engine_dialect=active_engine
    )
    generated_sql = llm_result.get("sql", "").strip()

    # 3. AST Security Guardrail Firewall
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
        df = execute_query(validated_sql, db_type=active_engine)
    except Exception as e:
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
    direct_answer = generate_direct_answer(df_masked, question, kpis)

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
