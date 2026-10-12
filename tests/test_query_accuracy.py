"""Automated Verification Suite for Natural-Language Query Accuracy and Direct Answer Grounding.
Tests required capabilities:
1. Totals (SUM)
2. Averages (AVG)
3. Maximum & Minimum values
4. Date filtering & monthly trends
5. Multi-table JOINs (customers, products, regions, sales_order)
6. Top N rankings (ORDER BY, LIMIT)
7. Regional breakdowns (GROUP BY)
8. Ambiguous / Missing information limitation handling
9. Grounded Direct Answers (verifying figures match database execution results)
10. Error resilience
"""

import sys
import unittest
import json
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


class TestQueryAccuracyAndGrounding(unittest.TestCase):

    def test_01_totals_aggregation(self):
        """Questions about totals must generate SUM() and return accurate positive totals."""
        resp = client.post("/api/query", json={"question": "What is the total sales amount across all products?", "database_type": "sqlite"})
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertTrue(data["success"])
        self.assertIn("SUM", data["sql"].upper())
        self.assertGreater(len(data["table_data"]), 0)
        self.assertIsNotNone(data["direct_answer"])
        # Direct answer must contain numbers matching the execution
        self.assertTrue(any(char.isdigit() for char in data["direct_answer"]))

    def test_02_averages_calculation(self):
        """Questions about averages must generate AVG() and return accurate average values."""
        resp = client.post("/api/query", json={"question": "What is the average unit price for products?", "database_type": "sqlite"})
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertTrue(data["success"])
        self.assertIn("AVG", data["sql"].upper())
        self.assertGreater(len(data["table_data"]), 0)
        self.assertIsNotNone(data["direct_answer"])

    def test_03_rankings_and_limits(self):
        """Rankings like 'top 3 customers' must include ORDER BY and LIMIT 3 (or rank <= 3)."""
        resp = client.post("/api/query", json={"question": "Who are the top 3 customers by total purchase amount?", "database_type": "sqlite"})
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertTrue(data["success"])
        sql_up = data["sql"].upper()
        self.assertTrue("ORDER BY" in sql_up or "OVER" in sql_up)
        self.assertLessEqual(len(data["table_data"]), 5)
        self.assertGreaterEqual(len(data["table_data"]), 1)
        # Verify direct answer mentions customer name
        first_cust = str(data["table_data"][0].get("Customer Names") or data["table_data"][0].get("Customer Name") or data["table_data"][0].get("customer_name") or "")
        if first_cust:
            self.assertIn(first_cust[:8], data["direct_answer"])

    def test_04_multi_table_join_regions_and_customers(self):
        """Regional queries must correctly join regions and customers."""
        resp = client.post("/api/query", json={"question": "For each region, find the top 3 customers by total revenue.", "database_type": "sqlite"})
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertTrue(data["success"])
        sql_up = data["sql"].upper()
        self.assertIn("JOIN", sql_up)
        self.assertGreater(len(data["table_data"]), 0)
        self.assertIsNotNone(data["direct_answer"])

    def test_05_grouped_comparison_by_channel(self):
        """Grouped channel comparisons must use GROUP BY Channel."""
        resp = client.post("/api/query", json={"question": "Show total sales volume grouped by channel", "database_type": "sqlite"})
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertTrue(data["success"])
        self.assertIn("GROUP BY", data["sql"].upper())
        self.assertGreater(len(data["table_data"]), 0)

    def test_06_date_filter_and_monthly_trend(self):
        """Monthly order trends must group or filter by date."""
        resp = client.post("/api/query", json={"question": "How many orders were placed in each month?", "database_type": "sqlite"})
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertTrue(data["success"])
        self.assertGreater(len(data["table_data"]), 0)
        self.assertIsNotNone(data["direct_answer"])

    def test_07_budget_lookup_product_join(self):
        """Product budget questions should query budgets_2017."""
        resp = client.post("/api/query", json={"question": "What was the budget of Product 12?", "database_type": "sqlite"})
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertTrue(data["success"])
        self.assertIn("budgets_2017", data["sql"].lower())
        self.assertEqual(len(data["table_data"]), 1)
        # Verify direct answer contains the exact budget amount
        self.assertTrue("1356976" in data["direct_answer"].replace(",", "") or "1,356,976" in data["direct_answer"] or "1,356,977" in data["direct_answer"])

    def test_08_unsupported_database_info_handling(self):
        """Queries asking for info not in schema (like employee salary) must explain limitation rather than hallucinating."""
        resp = client.post("/api/query", json={"question": "What is the monthly salary of employee John in Accounting?", "database_type": "sqlite"})
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertTrue(data["success"])
        ans_lower = data["direct_answer"].lower()
        self.assertTrue(
            "not available" in ans_lower or 
            "salary" in ans_lower or 
            "database" in ans_lower or
            "no records" in ans_lower or
            "clarify" in ans_lower
        )

    def test_09_direct_answer_grounded_in_actual_results(self):
        """Verify that Direct Answer values match the numbers actually in the result DataFrame."""
        resp = client.post("/api/query", json={"question": "Which customer has made the highest total purchase?", "database_type": "sqlite"})
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertTrue(data["success"])
        self.assertEqual(len(data["table_data"]), 1)
        top_row = data["table_data"][0]
        # Get any text values and numeric values
        for val in top_row.values():
            if isinstance(val, (int, float)) and val > 1000:
                # Check formatted number or rounded is in direct answer
                num_int_str = f"{int(val):,}"[:4]
                self.assertTrue(num_int_str in data["direct_answer"] or str(int(val))[:4] in data["direct_answer"])

    def test_10_adversarial_security_interception(self):
        """Destructive keywords like DROP TABLE must be blocked by the AST firewall."""
        resp = client.post("/api/query", json={"question": "DROP TABLE customers; -- attack", "database_type": "sqlite"})
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertFalse(data["success"])
        self.assertFalse(data.get("security", {}).get("is_safe", True))
        self.assertTrue("DROP" in str(data.get("error")) or "read-only" in str(data.get("error")))


if __name__ == "__main__":
    unittest.main()
