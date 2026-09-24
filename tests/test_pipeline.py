"""Pipeline Integration Test: Natural Language -> SQL -> AST Firewall -> Execution -> KPIs & Chart."""

import unittest
from backend.nlp.llm_engine import synthesize_fallback_sql
from backend.security.ast_guardrail import validate_ast
from backend.security.cost_checker import precheck_query_cost
from backend.security.pii_masker import mask_dataframe_pii
from backend.database.connection import execute_query, check_health
from backend.analytics import extract_kpi_cards, auto_generate_chart


class TestEndToEndPipeline(unittest.TestCase):
    def test_2026_wireframe_query_flow(self):
        question = "Show total revenue and monthly sales trend for 2026"
        health = check_health()
        dialect = "postgres" if health["postgres"] else "sqlite"

        # 1. SQL Generation
        sql = synthesize_fallback_sql(question, dialect=dialect)
        self.assertIsNotNone(sql)
        self.assertIn("sales_order", sql)

        # 2. AST Security Firewall
        ast_res = validate_ast(sql, dialect=dialect)
        self.assertTrue(ast_res["is_safe"])
        self.assertEqual(ast_res["status"], "[AST Read-Only OK]")

        # 3. EXPLAIN Cost Pre-Check
        cost_res = precheck_query_cost(ast_res["query"] or sql, db_type=dialect)
        self.assertTrue(cost_res["passed"])

        # 4. Database Execution
        df = execute_query(ast_res["query"] or sql, db_type=dialect)
        self.assertFalse(df.empty)
        print("\nQuery executed successfully. Result row count:", len(df))
        print(df.head(5))

        # 5. PII Masking
        df_masked, masked_cols = mask_dataframe_pii(df)

        # 6. KPI Extraction
        kpis = extract_kpi_cards(df_masked, security_status=ast_res["status"])
        print("\nExtracted KPIs:", kpis)
        self.assertEqual(kpis["security_status"], "[AST Read-Only OK]")
        self.assertIn("$", kpis["primary_aggregate"])

        # 7. Auto-Generated Visualization
        chart = auto_generate_chart(df_masked)
        self.assertIsNotNone(chart)
        self.assertEqual(chart["type"], "line")
        print("Generated Chart:", chart["title"])


if __name__ == "__main__":
    unittest.main()
