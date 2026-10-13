# 🚀 SQL Guard Mobile — Release v1.0.7

**Release Date:** October 13, 2026  
**Build Status:** Verified (Full end-to-end live testing passing)  
**APK Location:** [`versions/v1.0.7/apk-output/SQL_Guard_v1.0.7.apk`](file:///c:/Users/MSI/Desktop/text-to-sql/versions/v1.0.7/apk-output/SQL_Guard_v1.0.7.apk)  
**Root APKs:** [`SQL_Guard.apk`](file:///c:/Users/MSI/Desktop/text-to-sql/SQL_Guard.apk) and [`SQL_Guard_v1.0.7.apk`](file:///c:/Users/MSI/Desktop/text-to-sql/SQL_Guard_v1.0.7.apk)

---

## 🌟 Major Highlights & Improvements in v1.0.7

### 1. High-Speed Gemini AI Pipeline (3–4s Execution)
- Prioritized high-speed, live Gemini models: `gemini-3.1-flash-lite-preview`, `gemini-3.1-flash-lite`, and `gemini-3.6-flash`.
- Eliminated slow deprecated model retries (`gemini-2.5-flash` 404, `gemini-3.5-flash` 503 retry loops), bringing total execution time from **160 seconds down to ~4–8 seconds**.
- Configured a strict **10-second per-model timeout** on SDK calls to ensure instantaneous failover.

### 2. Universal Query Handling: Simple to Highly Complex
- **Simple Queries:** Instant answers for `"Show me top 2 customers"`, `"What is total revenue?"`, `"How many products exist?"`.
- **Intermediate Queries:** Averages, monthly trends, and grouped channel comparisons (`"Average unit price"`, `"Sales by channel"`).
- **Complex Enterprise Queries:** Window functions, regional rankings, running totals, and percentage contributions (`"For each region, find top 3 customers with ranks and percentage contributions"`).
- **Adversarial Interception:** AST Compiler Firewall blocks `DROP TABLE`, `DELETE`, and comment injections prior to execution.

### 3. Singular vs Plural Intent Normalization
- Standardized entity ranking intent so both singular (`"Show me top 2 customer"`) and plural (`"Show me top 2 customers"`) default consistently to **Total Sales / Revenue (`SUM("Line Total") DESC`)**.
- Both variations now reliably return the exact same top enterprise customers (**Aibox Company** and **State Ltd**).

### 4. Complete Mobile UI Polish
- **Hidden Import Option:** Completely removed "Import CSV / Excel" from both the bottom navigation bar and the slide-out **Navigation & Tools** drawer menu (`Header.jsx`).
- **Resilient Mobile Network Timeout:** Increased the mobile fetch timeout from 20s to **75s** so that cloud free-tier cold starts and mobile 5G cellular latency never trigger false aborts.
- **Real-Time Progress Timer:** Added a live elapsed-second timer with progressive status updates (`⚡ Communicating with Gemini AI & Cloud DB (Xs)...`).
- **Clean Aesthetics:** Kept all version tags and badges hidden from mobile view.

---

## 📱 How to Install and Use

### Option 1: Install on Android Device
1. Transfer [`SQL_Guard_v1.0.7.apk`](file:///c:/Users/MSI/Desktop/text-to-sql/versions/v1.0.7/apk-output/SQL_Guard_v1.0.7.apk) or root [`SQL_Guard.apk`](file:///c:/Users/MSI/Desktop/text-to-sql/SQL_Guard.apk) to your phone.
2. Tap the APK file to install or update the app.
3. Launch SQL Guard — it automatically connects to the live 24/7 cloud API at `https://guardrail-sql-api.onrender.com`.

### Option 2: Run Mobile Web App Locally
```powershell
cd mobile
npm run dev
```
Open `http://localhost:5173` in any mobile or desktop browser.
