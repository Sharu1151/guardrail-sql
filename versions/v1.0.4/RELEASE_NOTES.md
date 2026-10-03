# Release Notes - SQL Guard v1.0.4

**Release Date:** October 2026  
**Type:** Clean Text UI & Full Website Feature Parity Upgrade  
**Version Code:** 5  
**Version Name:** 1.0.4  

---

## 🚀 Key Improvements & Feature Parity in v1.0.4

1. **Clean AI Direct Answer & Markdown Text Formatter ([`FormattedMarkdown.jsx`](file:///c:/Users/MSI/Desktop/text-to-sql/mobile/src/components/FormattedMarkdown.jsx))**:
   - **Problem Solved**: Markdown symbols like `**50 Customer Names segments**` and `**Wordtune Company**` were rendering as raw literal asterisks.
   - **Fix**: Implemented a dedicated `FormattedMarkdown` parser component. All bold metrics and entity names now render as glowing, styled highlight pills without raw asterisks.
   - Designed an ultra-premium executive answer card (`ai-answer-card`) with glassmorphism gradient borders and high-contrast typography.

2. **Full Website Feature Parity**:
   - **Categorized Question Explorer (18+ Enterprise Queries)**: Added an interactive accordion with 6 business categories (*Financial & Sales, Customer & PII, Product & Budget, Geographic & Population, Database Schema, Red-Team Security*) just like the desktop website.
   - **One-Click Export to CSV & JSON**: Added export buttons to the query results table so users can download or share data directly from their phone.
   - **SQLGlot AST Parse Tree Inspector**: Added an expandable compiler node inspector detailing token types (`Select`, `From`, `Table`, `Limit`, etc.) and validation status.
   - **Relational Schema Live Catalog**: Updated `SchemaView` to display live row counts (`sales_order`: 65,524 rows, `regions`: 994, `customers`: 175, etc.) and column PII tags.
   - **Viva Voce & Architecture Dossier**: Added an architecture and interview guide in the Guardrail tab explaining AST static analysis vs regex, cost checking, and cryptographic SHA-256 masking.

3. **Bottom Navigation Overlap Fix**:
   - Increased content padding to `calc(96px + safe-bottom)` so query cards, charts, and table rows are never cut off by the bottom navigation bar.

---

## 📦 Version Artifacts

- **APK File**: [`apk-output/SQL_Guard_v1.0.4.apk`](file:///c:/Users/MSI/Desktop/text-to-sql/versions/v1.0.4/apk-output/SQL_Guard_v1.0.4.apk)
- **Root Quick-Access APK**: [`SQL_Guard_v1.0.4.apk`](file:///c:/Users/MSI/Desktop/text-to-sql/SQL_Guard_v1.0.4.apk)
- **Web PWA Bundle**: [`mobile-web-pwa/`](file:///c:/Users/MSI/Desktop/text-to-sql/versions/v1.0.4/mobile-web-pwa)
- **Zip Archive**: [`SQL_Guard_Mobile_v1.0.4.zip`](file:///c:/Users/MSI/Desktop/text-to-sql/versions/v1.0.4/SQL_Guard_Mobile_v1.0.4.zip)
