"""Unit Tests for SQLGlot AST Compiler Firewall & Execution Pre-Check."""

import unittest
from backend.security.ast_guardrail import validate_ast
from backend.security.cost_checker import precheck_query_cost
from backend.security.pii_masker import mask_dataframe_pii, hash_value
import pandas as pd


class TestASTCompilerFirewall(unittest.TestCase):
    def test_safe_queries_pass(self):
        safe_queries = [
            'SELECT * FROM customers;',
            'SELECT COUNT(*) FROM sales_order WHERE "OrderDate" >= \'2026-01-01\';',
            'SELECT "Channel", SUM("Line Total") FROM sales_order GROUP BY "Channel";',
            'WITH monthly AS (SELECT SUBSTR("OrderDate", 1, 7) as m, "Line Total" FROM sales_order) SELECT m, SUM("Line Total") FROM monthly GROUP BY m;'
        ]
        for q in safe_queries:
            res = validate_ast(q)
            self.assertTrue(res["is_safe"], f"Query should be safe: {q}")
            self.assertEqual(res["status"], "[AST Read-Only OK]")

    def test_dangerous_queries_blocked(self):
        dangerous_queries = [
            ('DROP TABLE customers;', "DROP"),
            ('DELETE FROM sales_order WHERE 1=1;', "DELETE"),
            ('UPDATE customers SET "Customer Names" = \'Hacked\';', "UPDATE"),
            ('INSERT INTO customers VALUES (999, \'Malicious Corp\');', "INSERT"),
            ('ALTER TABLE products ADD COLUMN secret TEXT;', "ALTER"),
            ('TRUNCATE TABLE sales_order;', "TRUNCATE"),
            ('CREATE TABLE evil (id INT);', "CREATE"),
            ('SELECT * FROM customers; DROP TABLE sales_order;', "Multiple Statements"),
        ]
        for q, expected_threat in dangerous_queries:
            res = validate_ast(q)
            self.assertFalse(res["is_safe"], f"Query should be blocked: {q}")
            self.assertIn("BLOCKED", res["status"])
            print(f"Blocked dangerous query: '{q}' -> Status: {res['status']}")

    def test_pii_dynamic_masking(self):
        sample_data = {
            "Customer Index": [1, 2],
            "Customer Names": ["Alice Corp", "Bob Industries"],
            "Email": ["alice@corp.com", "bob@industries.net"],
            "Phone Number": ["+1-555-123-4567", "+1-555-987-6543"]
        }
        df = pd.DataFrame(sample_data)
        masked_df, masked_cols = mask_dataframe_pii(df, enabled=True)

        self.assertIn("Email", masked_cols)
        self.assertIn("Phone Number", masked_cols)
        self.assertTrue(str(masked_df["Email"].iloc[0]).startswith("SHA256:"))
        self.assertTrue(str(masked_df["Phone Number"].iloc[0]).startswith("SHA256:"))
        self.assertEqual(masked_df["Customer Names"].iloc[0], "Alice Corp")  # Non-PII untouched


if __name__ == "__main__":
    unittest.main()
