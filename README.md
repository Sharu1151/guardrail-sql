# Guardrailed Text-to-SQL Engine with Web Dashboard

An enterprise-ready **Guardrailed Text-to-SQL Analytics Platform** with an AST-based SQL Compiler Firewall, execution cost pre-checks, dynamic PII masking, and a reactive web dashboard.

---

## Architecture & Engineering Highlights

```
                                  [ User Question ]
                                         │
                                         ▼
                            ┌────────────────────────┐
                            │  LangChain NLP Engine  │
                            │   (Schema Reflection)  │
                            └────────────┬───────────┘
                                         │ Raw SQL
                                         ▼
                            ┌────────────────────────┐
                            │   SQLGlot AST Firewall │ ◄── [Blocks DROP/DELETE/ALTER/etc.]
                            └────────────┬───────────┘
                                         │ Validated SELECT
                                         ▼
                            ┌────────────────────────┐
                            │  EXPLAIN Cost Pre-Check│ ◄── [Blocks Resource-Heavy Queries]
                            └────────────┬───────────┘
                                         │ Safe Query
                                         ▼
                            ┌────────────────────────┐
                            │  PostgreSQL 16 Engine  │ (Dual-mode with SQLite)
                            │  (Read-Only Role)      │
                            └────────────┬───────────┘
                                         │ Raw Records
                                         ▼
                            ┌────────────────────────┐
                            │ Dynamic PII Masker     │ ◄── [SHA-256 for Emails & Phones]
                            └────────────┬───────────┘
                                         │ Masked Data
                                         ▼
                            ┌────────────────────────┐
                            │   FastAPI Core API     │ (:8000)
                            └────────────┬───────────┘
                                         │ JSON Payload
                                         ▼
                            ┌────────────────────────┐
                            │ Streamlit Dashboard UI │ (:8501)
                            │ - 3 KPI Summary Cards  │
                            │ - Auto Plotly Chart    │
                            │ - Paginated Data Grid  │
                            └────────────────────────┘
```

### 1. AST-Based SQL Compiler Firewall (`backend/security/ast_guardrail.py`)
- Statically parses SQL queries into an Abstract Syntax Tree using `sqlglot`.
- Enforces strict read-only access (allowing only `SELECT` and `WITH ... SELECT`).
- Instantly blocks `DROP`, `DELETE`, `UPDATE`, `ALTER`, `INSERT`, `CREATE`, `TRUNCATE`, and stacked semicolon injections.
- Emits structured badge: `[AST Read-Only OK]`.

### 2. Execution Pre-Check (`backend/security/cost_checker.py`)
- Runs `EXPLAIN (FORMAT JSON)` on PostgreSQL (or `EXPLAIN QUERY PLAN` on SQLite).
- Inspects query plan cost and estimated row count before execution.
- Prevents resource exhaustion and runaway Cartesian joins over 1,000,000+ rows.

### 3. Dynamic PII Masking (`backend/security/pii_masker.py`)
- Automatically detects sensitive columns (`email`, `phone`, `contact`, `ssn`).
- Dynamically applies cryptographic SHA-256 hashing to sensitive records.

### 4. Enterprise Dual-Engine Database (`backend/database/`)
- **PostgreSQL 16**: Connected via `psycopg2` with restricted read-only credentials (`readonly_analyst`).
- **SQLite**: Local zero-configuration engine with B-Tree indexes for fast local runs.
- Loaded with enterprise sales data (65,500+ records) and sample 2026 wireframe dataset.

### 5. Reactive Web Dashboard (`frontend/app.py`)
- Built with **Streamlit + Plotly**.
- Implements the exact layout from the project wireframe:
  - **Top Section**: Natural Language Query Input Bar + quick example buttons.
  - **Middle Section**: 3 Automated Summary KPI Cards (`Total Records`, `Primary Aggregate`, `Security Status`).
  - **Bottom Section**: Auto-generated Plotly trend/bar chart and paginated data table grid with 1-Click CSV and JSON export.

---

## Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Configure Environment (Optional)
Copy `.env.example` to `.env`. If you have a Google Gemini API key, add it:
```env
GOOGLE_API_KEY=your_key_here
```
*(The system includes an intelligent built-in synthesizer, so it works immediately even without an external API key!)*

### 3. Initialize Databases
```bash
python -m backend.database.db_setup
```

### 4. Run the Platform
```bash
python run.py
```
- **Dashboard UI**: [http://localhost:8501](http://localhost:8501)
- **FastAPI Backend**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## Testing

Run automated security and pipeline unit tests:
```bash
# Security AST Guardrail tests
python -m unittest tests.test_guardrail

# End-to-end pipeline test
python -m unittest tests.test_pipeline
```
