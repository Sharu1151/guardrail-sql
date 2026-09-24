"""Database Connection and Execution Engine.

Supports dual-engine connections (PostgreSQL 16 under restricted read-only role,
with seamless SQLite fallback), schema reflection, and query execution.
"""

import os
import sqlite3
import pandas as pd
import psycopg2
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
SQLITE_PATH = os.getenv("SQLITE_DB_PATH", os.path.join(BASE_DIR, "data", "sales_data.db"))
if not os.path.exists(SQLITE_PATH):
    alt_path = os.path.join(os.getcwd(), "data", "sales_data.db")
    if os.path.exists(alt_path):
        SQLITE_PATH = alt_path

PG_HOST = os.getenv("POSTGRES_HOST", "localhost")
PG_PORT = int(os.getenv("POSTGRES_PORT", "5432"))
PG_DB = os.getenv("POSTGRES_DB", "text_to_sql_db")
PG_RO_USER = os.getenv("POSTGRES_READONLY_USER", "readonly_analyst")
PG_RO_PASS = os.getenv("POSTGRES_READONLY_PASSWORD", "readonly_secure_pass_2026")
PG_USER = os.getenv("POSTGRES_USER", "postgres")
PG_PASS = os.getenv("POSTGRES_PASSWORD", "postgres")


def get_sqlite_connection():
    if not os.path.exists(SQLITE_PATH):
        raise FileNotFoundError(f"SQLite database not found at {SQLITE_PATH}. Run db_setup.py first.")
    return sqlite3.connect(SQLITE_PATH)


def get_postgres_connection(readonly: bool = True):
    """Connect to PostgreSQL, preferring the restricted read-only role if available."""
    user = PG_RO_USER if readonly else PG_USER
    password = PG_RO_PASS if readonly else PG_PASS
    try:
        conn = psycopg2.connect(
            host=PG_HOST, port=PG_PORT, user=user, password=password, dbname=PG_DB, connect_timeout=3
        )
        return conn
    except Exception as e:
        # If readonly user connection fails, attempt with main user
        if readonly:
            return psycopg2.connect(
                host=PG_HOST, port=PG_PORT, user=PG_USER, password=PG_PASS, dbname=PG_DB, connect_timeout=3
            )
        raise e


def check_health() -> dict:
    status = {"postgres": False, "sqlite": False, "active_engine": "none"}

    # Check SQLite
    if os.path.exists(SQLITE_PATH):
        try:
            conn = get_sqlite_connection()
            cur = conn.cursor()
            cur.execute("SELECT 1;")
            cur.fetchone()
            conn.close()
            status["sqlite"] = True
        except Exception:
            status["sqlite"] = False

    # Check PostgreSQL
    try:
        conn = get_postgres_connection(readonly=True)
        cur = conn.cursor()
        cur.execute("SELECT 1;")
        cur.fetchone()
        cur.close()
        conn.close()
        status["postgres"] = True
    except Exception:
        status["postgres"] = False

    if status["postgres"]:
        status["active_engine"] = "postgres"
    elif status["sqlite"]:
        status["active_engine"] = "sqlite"

    return status


def get_schema_metadata(db_type: str = "auto") -> dict:
    """Extract schema metadata (tables, columns, types, row counts) for LLM context."""
    health = check_health()
    use_pg = (db_type == "postgres" and health["postgres"]) or (db_type == "auto" and health["postgres"])

    schema = {"engine": "postgres" if use_pg else "sqlite", "tables": {}}

    if use_pg:
        conn = get_postgres_connection(readonly=True)
        cur = conn.cursor()
        cur.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name;
        """)
        tables = [row[0] for row in cur.fetchall()]

        for table in tables:
            cur.execute("""
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = %s 
                ORDER BY ordinal_position;
            """, (table,))
            columns = [{"name": r[0], "type": r[1]} for r in cur.fetchall()]

            cur.execute(f"SELECT COUNT(*) FROM \"{table}\";")
            count = cur.fetchone()[0]

            schema["tables"][table] = {
                "columns": columns,
                "row_count": count
            }
        cur.close()
        conn.close()
    else:
        conn = get_sqlite_connection()
        cur = conn.cursor()
        cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';")
        tables = [row[0] for row in cur.fetchall()]

        for table in tables:
            cur.execute(f"PRAGMA table_info(\"{table}\");")
            columns = [{"name": r[1], "type": r[2]} for r in cur.fetchall()]

            cur.execute(f"SELECT COUNT(*) FROM \"{table}\";")
            count = cur.fetchone()[0]

            schema["tables"][table] = {
                "columns": columns,
                "row_count": count
            }
        conn.close()

    return schema


def execute_query(sql: str, db_type: str = "auto") -> pd.DataFrame:
    """Execute a read-only SQL query against PostgreSQL or SQLite."""
    health = check_health()
    use_pg = (db_type == "postgres" and health["postgres"]) or (db_type == "auto" and health["postgres"])

    if use_pg:
        conn = get_postgres_connection(readonly=True)
        try:
            cur = conn.cursor()
            cur.execute(sql)
            if cur.description is not None:
                columns = [desc[0] for desc in cur.description]
                rows = cur.fetchall()
                df = pd.DataFrame(rows, columns=columns)
                for col in df.columns:
                    try:
                        df[col] = pd.to_numeric(df[col])
                    except (ValueError, TypeError):
                        pass
            else:
                df = pd.DataFrame()
            cur.close()
            return df
        finally:
            conn.close()
    else:
        conn = get_sqlite_connection()
        try:
            cur = conn.cursor()
            cur.execute(sql)
            if cur.description is not None:
                columns = [desc[0] for desc in cur.description]
                rows = cur.fetchall()
                df = pd.DataFrame(rows, columns=columns)
            else:
                df = pd.DataFrame()
            cur.close()
            return df
        finally:
            conn.close()
