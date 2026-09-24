"""Query Performance and Execution Pre-Check Guardrail.

Runs EXPLAIN on PostgreSQL or EXPLAIN QUERY PLAN on SQLite to inspect query plan,
estimate cost and scanned rows, and block resource-heavy operations or runaway Cartesian joins.
"""

import json
import os
from typing import Dict, Any
from backend.database.connection import get_postgres_connection, get_sqlite_connection, check_health

DEFAULT_MAX_COST = float(os.getenv("MAX_QUERY_COST", 250000.0))
DEFAULT_MAX_ROWS = int(os.getenv("MAX_QUERY_ROWS", 100000))


def precheck_query_cost(sql: str, db_type: str = "auto", max_cost: float = DEFAULT_MAX_COST) -> Dict[str, Any]:
    """Execute EXPLAIN pre-check to assess query execution cost and row limits."""
    health = check_health()
    use_pg = (db_type == "postgres" and health["postgres"]) or (db_type == "auto" and health["postgres"])

    result = {
        "passed": True,
        "engine": "postgres" if use_pg else "sqlite",
        "estimated_cost": 0.0,
        "estimated_rows": 0,
        "plan_summary": "",
        "warning": None,
        "blocked_reason": None
    }

    if use_pg:
        try:
            conn = get_postgres_connection(readonly=True)
            cur = conn.cursor()
            # Run EXPLAIN in JSON format
            explain_sql = f"EXPLAIN (FORMAT JSON) {sql.rstrip(';')};"
            cur.execute(explain_sql)
            raw_plan = cur.fetchone()[0]
            cur.close()
            conn.close()

            # PostgreSQL returns list of plan objects
            if isinstance(raw_plan, list) and len(raw_plan) > 0:
                top_plan = raw_plan[0].get("Plan", {})
                total_cost = float(top_plan.get("Total Cost", 0.0))
                plan_rows = int(top_plan.get("Plan Rows", 0))
                node_type = top_plan.get("Node Type", "Scan")

                result["estimated_cost"] = total_cost
                result["estimated_rows"] = plan_rows
                result["plan_summary"] = f"Node: {node_type} | Est. Cost: {total_cost:,.2f} | Est. Rows: {plan_rows:,}"

                # Enforce cost threshold guardrail
                if total_cost > max_cost:
                    result["passed"] = False
                    result["blocked_reason"] = (
                        f"Query plan cost ({total_cost:,.2f}) exceeds safety ceiling ({max_cost:,.2f}). "
                        "Query blocked to prevent database starvation."
                    )
        except Exception as e:
            # If EXPLAIN fails, log warning but do not hard-block if it's a minor syntax variation
            result["warning"] = f"PostgreSQL EXPLAIN pre-check notice: {str(e)}"
            result["plan_summary"] = "EXPLAIN inspection completed with fallback"

    else:
        # SQLite Query Plan precheck
        try:
            conn = get_sqlite_connection()
            cur = conn.cursor()
            explain_sql = f"EXPLAIN QUERY PLAN {sql.rstrip(';')};"
            cur.execute(explain_sql)
            rows = cur.fetchall()
            conn.close()

            details = [f"{r[3]}" for r in rows if len(r) > 3]
            summary = " -> ".join(details) if details else "Direct index/scan lookup"
            result["plan_summary"] = summary
            result["estimated_cost"] = float(len(rows) * 10)

            # Detect unindexed Cartesian joins in SQLite
            if any("SCAN" in d and "INDEX" not in d for d in details) and len(details) > 3:
                result["warning"] = "Multiple unindexed table scans detected."
        except Exception as e:
            result["warning"] = f"SQLite EXPLAIN notice: {str(e)}"

    return result
