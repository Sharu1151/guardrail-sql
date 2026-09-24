"""AST-Based SQL Compiler Firewall.

Uses SQLGlot to statically analyze SQL queries, parse the Abstract Syntax Tree (AST),
and strictly enforce read-only (SELECT / CTE) operations. Disallowed expressions
such as DROP, DELETE, UPDATE, ALTER, INSERT, CREATE, and TRUNCATE are blocked instantly.
"""

from typing import Dict, Any, List
import sqlglot
from sqlglot import exp


# Disallowed expression types in AST
DISALLOWED_EXPRESSION_TYPES = (
    exp.Drop,
    exp.Delete,
    exp.Update,
    exp.Insert,
    exp.Alter,
    exp.Create,
    exp.TruncateTable,
    exp.Command,
    exp.Set,
    exp.Kill,
    exp.Transaction,
    exp.Commit,
    exp.Rollback,
)

DISALLOWED_KEYWORDS = {
    "DROP", "DELETE", "UPDATE", "INSERT", "ALTER", "TRUNCATE",
    "CREATE", "GRANT", "REVOKE", "EXEC", "EXECUTE", "SHUTDOWN"
}


def validate_ast(sql: str, dialect: str = "postgres") -> Dict[str, Any]:
    """Parse and validate SQL string using SQLGlot AST inspection.

    Returns:
        Dict with keys:
            - is_safe (bool)
            - status (str): "[AST Read-Only OK]" or "[BLOCKED: ...]"
            - query (str or None)
            - node_types (List[str])
            - error (str or None)
    """
    if not sql or not sql.strip():
        return {
            "is_safe": False,
            "status": "[BLOCKED: Empty Query]",
            "query": None,
            "node_types": [],
            "error": "Query is empty."
        }

    raw_sql = sql.strip()

    # Pre-parse keyword scan for instant defense-in-depth
    tokens = [t.strip().upper() for t in raw_sql.replace(";", " ").replace("(", " ").replace(")", " ").split()]
    for kw in DISALLOWED_KEYWORDS:
        if kw in tokens:
            return {
                "is_safe": False,
                "status": f"[BLOCKED: Disallowed keyword '{kw}']",
                "query": None,
                "node_types": [kw],
                "error": f"Keyword '{kw}' violates strict read-only policy."
            }

    try:
        # SQLGlot parse into statements list
        statements = sqlglot.parse(raw_sql, read=dialect)
    except Exception as e:
        # If postgres dialect fails, try generic sql
        try:
            statements = sqlglot.parse(raw_sql)
        except Exception as e2:
            return {
                "is_safe": False,
                "status": "[BLOCKED: Syntax Error / Unparseable]",
                "query": None,
                "node_types": [],
                "error": f"Failed to parse SQL into AST: {str(e2)}"
            }

    if not statements:
        return {
            "is_safe": False,
            "status": "[BLOCKED: No Valid SQL Statement]",
            "query": None,
            "node_types": [],
            "error": "No valid SQL statement detected."
        }

    # Strict single-statement enforcement (prevents stacked query injection like: SELECT 1; DROP TABLE ...)
    if len(statements) > 1:
        return {
            "is_safe": False,
            "status": "[BLOCKED: Multiple Statements / Semicolon Injection]",
            "query": None,
            "node_types": ["MultiStatement"],
            "error": "Multiple statements detected. Stacked query execution is prohibited."
        }

    stmt = statements[0]
    if stmt is None:
        return {
            "is_safe": False,
            "status": "[BLOCKED: Null Expression]",
            "query": None,
            "node_types": [],
            "error": "Empty or null expression node."
        }

    detected_node_types: List[str] = []

    # Check root expression must be Select or CTE (With)
    root_type = type(stmt).__name__
    detected_node_types.append(root_type)

    if not isinstance(stmt, (exp.Select, exp.Union)):
        return {
            "is_safe": False,
            "status": f"[BLOCKED: Root statement is {root_type}, expected SELECT]",
            "query": None,
            "node_types": detected_node_types,
            "error": f"Only SELECT queries are allowed. Root statement is {root_type}."
        }

    # Recursive AST walk: inspect every child node
    for node in stmt.walk():
        node_name = type(node).__name__
        if isinstance(node, DISALLOWED_EXPRESSION_TYPES):
            detected_node_types.append(node_name)
            return {
                "is_safe": False,
                "status": f"[BLOCKED: Disallowed AST node <{node_name}>]",
                "query": None,
                "node_types": list(set(detected_node_types)),
                "error": f"Query contains forbidden modification node: {node_name}."
            }

    # Re-generate clean formatted SQL from validated AST
    try:
        clean_sql = stmt.sql(dialect=dialect, pretty=True)
    except Exception:
        clean_sql = raw_sql

    tree_nodes = []
    try:
        for node in stmt.walk():
            tree_nodes.append({
                "type": type(node).__name__,
                "content": str(node)[:60].replace("\n", " ").strip()
            })
    except Exception:
        pass

    return {
        "is_safe": True,
        "status": "[AST Read-Only OK]",
        "query": clean_sql,
        "node_types": list(set(detected_node_types)),
        "tree_nodes": tree_nodes[:15],
        "error": None
    }


def get_ast_tree_representation(sql: str) -> List[Dict[str, Any]]:
    """Generate human-readable AST node hierarchy for visual inspection in UI."""
    try:
        stmt = sqlglot.parse_one(sql)
        nodes = []
        for i, node in enumerate(stmt.walk()):
            name = type(node).__name__
            is_disallowed = isinstance(node, DISALLOWED_EXPRESSION_TYPES)
            nodes.append({
                "index": i + 1,
                "node_type": name,
                "status": "Disallowed" if is_disallowed else "Permitted",
                "preview": str(node)[:50].replace("\n", " ").strip()
            })
            if len(nodes) >= 20:
                break
        return nodes
    except Exception as e:
        return [{"index": 1, "node_type": "ParseError", "status": "Invalid", "preview": str(e)}]
