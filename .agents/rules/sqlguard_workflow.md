# SQL Guard Project Rules & Architecture Memory

## 1. Core Architecture
- **Backend**: FastAPI (`backend/main.py`), SQLite (`data/sales_data.db`), PostgreSQL connector, AST SQL validation firewall (`backend/security/sql_validator.py`).
- **AI Engine**: `backend/nlp/llm_engine.py` using `google.genai` (`gemini-3.5-flash-lite`, `gemini-3.5-flash`, `gemini-2.5-flash`).
- **Frontend**: Streamlit app (`frontend/app.py`).
- **Mobile**: React 18 + Vite + Tailwind/Vanilla CSS + Capacitor 6 (`mobile/src/App.jsx`, `mobile/android`).
- **Deployment**: Render Web Service (`https://guardrail-sql-api.onrender.com`), synced via `main` branch on GitHub repository `Sharu1151/guardrail-sql`.

## 2. Query Interpretation & Direct Answer Rules
- **Never bypass the AI model**: Do not reintroduce keyword benchmark matchers or hardcoded SQL templates that bypass Gemini.
- **Strict Intent-to-SQL Mapping**:
  - Totals: `SUM()`
  - Averages: `AVG()`
  - Rankings: `ORDER BY ... LIMIT` or `ROW_NUMBER() OVER (...)`
  - Grouped comparisons: `GROUP BY`
  - Unanswerable/missing schema: Return informative message `SELECT 'The requested information is not available...' AS message` rather than hallucinating.
- **Grounded Direct Answers**:
  - Direct answers must be synthesized by `generate_ai_direct_answer(question, sql, df)` by feeding the actual execution records directly to Gemini.
  - Never fabricate numbers or use regex fallback that arbitrarily reads row 0.

## 3. UI Guidelines & Feature Preferences
- **Preserve**: Export (CSV/JSON), Hide UI toggle, Voice Input (speech-to-text microphone via Web Speech API).
- **Remove / Do Not Show**:
  - Read Aloud (text-to-speech) must NOT be shown in the UI.
  - Import tab must NOT be shown in mobile view.
  - Version tags/badges (`v1.0.5`, `v1.1.0`, etc.) must NOT be displayed on mobile headers or settings. Keep the UI clean.

## 4. Release & Versioning Workflow
- Every major build or batch of fixes must be archived in `versions/vX.X.X/`:
  - `versions/vX.X.X/apk-output/` containing `SQL_Guard_vX.X.X.apk` and `SQLGuard-Mobile.apk`
  - `versions/vX.X.X/mobile-web-pwa/` containing the compiled Vite bundle
  - `versions/vX.X.X/RELEASE_NOTES.md` documenting all changes and instructions
  - Root shortcut: update `SQL_Guard.apk` in root
  - Update `versions/README.md` version history table
- Tests: Maintain and run `tests/test_query_accuracy.py` to verify accuracy before every release.
