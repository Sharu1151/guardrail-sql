# 🚀 SQL Guard Mobile — Release v1.0.6

**Release Date:** October 12, 2026  
**Build Status:** Verified (10/10 automated tests passing)  
**APK Location:** [`versions/v1.0.6/apk-output/SQL_Guard_v1.0.6.apk`](file:///c:/Users/MSI/Desktop/text-to-sql/versions/v1.0.6/apk-output/SQL_Guard_v1.0.6.apk) (Also available at root: [`SQL_Guard.apk`](file:///c:/Users/MSI/Desktop/text-to-sql/SQL_Guard.apk))

---

## 🌟 Major Highlights & Fixes in v1.0.6

### 1. Grounded Direct Answers via Real AI Execution
- Replaced ungrounded regex / row-0 direct answers with `generate_ai_direct_answer(question, sql, df)`.
- The actual returned database records (as JSON) are fed to Gemini to synthesize precise, 1–2 sentence factual responses.
- Figures in direct answers strictly match executed database rows with zero fabrication.

### 2. Elimination of AI Benchmark Bypasses
- Completely removed `match_sales_test_query` and keyword interception templates from `backend/nlp/llm_engine.py`.
- Every supported natural-language query directly invokes the configured Gemini model (`gemini-3.5-flash-lite`, `gemini-3.5-flash`, `gemini-2.5-flash`).

### 3. Real SQLite Schema & Intent-Driven Prompting
- Real schema inspection via `get_sqlite_schema()` feeds actual tables (`budgets_2017`, `customers`, `products`, `regions`, `sales_order`, `state_regions`) and foreign key relationships.
- Strictly maps user intent:
  - Totals $\rightarrow$ `SUM()`
  - Averages $\rightarrow$ `AVG()`
  - Rankings $\rightarrow$ `ORDER BY ... LIMIT` / `ROW_NUMBER() OVER (...)`
  - Grouped comparisons $\rightarrow$ `GROUP BY`
  - Unavailable info $\rightarrow$ `SELECT 'The requested information is not available...' AS message`

### 4. UI Polish & Clean Aesthetics
- Removed Read Aloud audio buttons and text-to-speech overhead.
- Removed all version tags and badges (`v1.1.0`, etc.) from mobile Header and Settings screens as requested.
- Removed / hid the Import tab from mobile view to prevent Android storage sandbox conflicts and keep the bottom navigation focused and responsive.
- Preserved Voice Search (speech-to-text microphone input), Hide UI toggle, and CSV/JSON export.

### 5. Automated Verification Suite
- Comprehensive automated test suite in `tests/test_query_accuracy.py` verifying:
  - Totals (`SUM`)
  - Averages (`AVG`)
  - Top 3 Rankings (`ORDER BY`, `LIMIT`)
  - Multi-table JOINs across customers, sales, and regions
  - Grouped comparisons by channel
  - Date trends by month
  - Product budget lookups
  - Missing info / database limitation explanation
  - Direct Answer grounding
  - AST security firewall (`DROP TABLE` blocked)

---

## 📱 How to Install and Check

### Option 1: Install on Android Device
1. Transfer [`SQL_Guard_v1.0.6.apk`](file:///c:/Users/MSI/Desktop/text-to-sql/versions/v1.0.6/apk-output/SQL_Guard_v1.0.6.apk) or [`SQL_Guard.apk`](file:///c:/Users/MSI/Desktop/text-to-sql/SQL_Guard.apk) to your Android phone.
2. Tap the file to install (allow "Install unknown apps" if prompted).
3. The app automatically connects to your local server on Wi-Fi or fallback 24/7 cloud server (`https://guardrail-sql-api.onrender.com`).

### Option 2: Test Mobile Web App Locally
Open PowerShell in the workspace:
```powershell
cd mobile
npm run dev
```
Navigate to `http://localhost:5173` in your browser.
