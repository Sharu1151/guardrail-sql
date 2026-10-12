# AGENTS.md — SQL Guard Knowledge & Behavior Guidelines

## Architecture Overview
- **FastAPI Backend**: `backend/main.py` (serves API, AST validation, schema retrieval, direct answer synthesis, and APK download).
- **AI Engine**: `backend/nlp/llm_engine.py` using `google.genai` (`gemini-3.5-flash-lite`, `gemini-3.5-flash`, `gemini-2.5-flash`).
- **Database**: SQLite `data/sales_data.db` and PostgreSQL (`text_to_sql_db`).
- **Mobile App**: `mobile/` React + Vite + Capacitor Android app.
- **Versions Archive**: `versions/` containing all historical APKs and web bundles.

## Permanent Rules & User Preferences
1. **Accurate Natural-Language Processing**:
   - Every supported query must call the configured Gemini model. Never re-introduce hardcoded benchmark templates that intercept user queries.
   - User queries must be answered with SQL reflecting real intent (`SUM`, `AVG`, `ORDER BY`, `LIMIT`, `GROUP BY`).
   - Direct answers must be grounded in actual returned database records via `generate_ai_direct_answer`.
2. **UI Constraints**:
   - Keep Read Aloud (text-to-speech) removed.
   - Keep Import tab removed / hidden from mobile view.
   - Do not display version badges or tags (`v1.0.5`, `v1.1.0`) on mobile headers or settings.
   - Keep Voice Search (microphone input), Hide UI, and Export working.
3. **Release Structure**:
   - Place releases in `versions/v1.0.X/` with `apk-output/`, `mobile-web-pwa/`, and `RELEASE_NOTES.md`.
   - Keep root APKs updated (`SQL_Guard.apk`, `SQL_Guard_v1.0.X.apk`).
4. **Cloud Deployment**:
   - Deployed at `https://guardrail-sql-api.onrender.com` via GitHub repository `Sharu1151/guardrail-sql` on the `main` branch.
