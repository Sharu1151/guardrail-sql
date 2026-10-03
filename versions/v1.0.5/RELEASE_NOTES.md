# 🚀 Release Notes - SQL Guard Mobile v1.0.5 (24/7 Cloud Engine)

**Release Date:** October 3, 2026  
**Status:** Current Stable Production Release  
**APK Build:** [`SQL_Guard_v1.0.5.apk`](file:///c:/Users/MSI/Desktop/text-to-sql/SQL_Guard_v1.0.5.apk) / [`SQL_Guard.apk`](file:///c:/Users/MSI/Desktop/text-to-sql/SQL_Guard.apk)

---

## 🌟 What's New in v1.0.5

### 1. 24/7 Permanent Cloud Architecture
- Configured default connection to **Render.com Cloud Web Service** (`https://guardrail-sql-api.onrender.com`).
- Eliminates dependency on local laptops or ephemeral tunnels. The mobile app stays online 24/7 even when your laptop is turned off or asleep.

### 2. URL Sanitization & Trailing Slash Redundancy
- Added client-side trailing-slash stripping (`.replace(/\/+$/, '')`) so typing URLs with `/` never produces `//api/health` 404 errors.
- Added `NormalizeSlashesMiddleware` to the FastAPI backend to transparently rewrite duplicate slashes into valid REST routes.

### 3. Quick Cloud Reset Button
- Added a 1-tap **Reset Cloud** button in Settings (⚙️) to restore the permanent 24/7 cloud backend URL with one touch.
