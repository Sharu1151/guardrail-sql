# Release Notes - SQL Guard v1.0.3

**Release Date:** October 2026  
**Type:** Blank Screen Fix & Crash Interceptor Patch  
**Version Code:** 4  
**Version Name:** 1.0.3  

---

## 🚀 Key Improvements & Bug Fixes in v1.0.3

1. **Fixed Query Execution Blank Screen Crash**:
   - **Root Cause Identified**: The backend API analytics engine returns chart data formatted as an object `{"x": [...], "y": [...]}` rather than an array. When rendering queries on the mobile client, `MobileChart.jsx` called `.slice()` on the object, causing an uncaught `TypeError: chartData.data.slice is not a function`.
   - In React 19, an uncaught render error causes the entire DOM tree to unmount, resulting in a blank white screen on mobile WebView.
   - **Fix**: Completely rewrote [MobileChart.jsx](file:///c:/Users/MSI/Desktop/text-to-sql/mobile/src/components/MobileChart.jsx) to defensively parse both object `{ x: [], y: [] }` and array `[{...}]` formats, handle null/undefined values, and prevent all render exceptions.

2. **React Error Boundary Crash Interceptor Added**:
   - Added [ErrorBoundary.jsx](file:///c:/Users/MSI/Desktop/text-to-sql/mobile/src/components/ErrorBoundary.jsx) wrapping all active views.
   - If any component ever throws an unexpected error, instead of wiping out the screen to blank white, the app intercepts the exception, displays an in-app error card with error details, and provides a **"Reset & Try Again"** button alongside a diagnostic copy tool.

3. **Defensive Parsing Across All Views**:
   - Safeguarded [QueryView.jsx](file:///c:/Users/MSI/Desktop/text-to-sql/mobile/src/components/QueryView.jsx) for `lastResult.kpis`, `table_data`, `columns`, and `executive_insights`.
   - Validates all data types before iterating to guarantee resilience even with unusual SQL results.

4. **Zero-Config Global Tunnel Preserved**:
   - Defaults directly to Cloudflare HTTPS tunnel (`https://cos-leon-limitation-philips.trycloudflare.com`) for seamless connectivity on Wi-Fi and 5G cellular networks.

---

## 📦 Version Artifacts

- **APK File**: [`apk-output/SQL_Guard_v1.0.3.apk`](file:///c:/Users/MSI/Desktop/text-to-sql/versions/v1.0.3/apk-output/SQL_Guard_v1.0.3.apk)
- **Root Quick-Access APK**: [`SQL_Guard_v1.0.3.apk`](file:///c:/Users/MSI/Desktop/text-to-sql/SQL_Guard_v1.0.3.apk)
- **Web PWA Bundle**: [`mobile-web-pwa/`](file:///c:/Users/MSI/Desktop/text-to-sql/versions/v1.0.3/mobile-web-pwa)
- **Zip Archive**: [`SQL_Guard_Mobile_v1.0.3.zip`](file:///c:/Users/MSI/Desktop/text-to-sql/versions/v1.0.3/SQL_Guard_Mobile_v1.0.3.zip)
