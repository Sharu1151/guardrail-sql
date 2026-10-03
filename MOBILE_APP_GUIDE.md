# 📱 SQL Guard Mobile Application Guide

This guide explains how to run, install, and package the **SQL Guard Mobile Application** for Android and iOS.

---

## 🚀 Quick Start (Running Locally)

To launch both the FastAPI backend and the Mobile Web Application:

1. Double click **`run_mobile.bat`** in the project root.
2. Alternatively, open your terminal and run:
   ```bash
   # Terminal 1: Backend
   python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000

   # Terminal 2: Mobile App
   cd mobile
   npm run dev
   ```

3. **Accessing on your PC:**
   - Open [http://localhost:5173](http://localhost:5173) in your browser.
   - Press `F12` and switch to the **Mobile Device Toggle** (iPhone 14 / Pixel) for an authentic mobile view.

---

## 📲 How to Open on Your Mobile Phone

### Method 1: Local Wi-Fi (Same Network)
1. Make sure your phone is connected to the same Wi-Fi network as your computer.
2. Open your phone's browser (Chrome on Android or Safari on iOS).
3. Navigate to:
   ```
   http://10.65.140.42:5173
   ```
   *(Note: If your computer's IP changes, check with `ipconfig` in CMD).*

### Method 2: Remote Public Tunnel (Anywhere in the World)
If you want to use the app on mobile data (4G/5G) or outside your home Wi-Fi:
1. Run `share_demo_link.bat` to generate a free secure Cloudflare tunnel link (`https://*.trycloudflare.com`).
2. Open the link on your mobile phone!

---

## 📥 How to Install as an App (PWA - No App Store Needed)

The mobile app includes a full **Progressive Web App (PWA)** configuration (`manifest.json`, app icons, mobile viewport):

- **Android (Chrome):**
  1. Open `http://10.65.140.42:5173` in Chrome.
  2. Tap the **three dots menu (⋮)** in the top right.
  3. Tap **"Install app"** or **"Add to Home Screen"**.
  4. The app will appear on your phone's home screen with the SQL Guard icon and run in full-screen standalone mode!

- **iOS (iPhone Safari):**
  1. Open the URL in Safari.
  2. Tap the **Share button** (square with upward arrow at bottom).
  3. Scroll down and tap **"Add to Home Screen"**.
  4. Tap **Add**. It opens like an official App Store app!

---

## 🤖 How to Build a Standalone Android `.apk` (Capacitor)

The mobile app includes [capacitor.config.json](file:///c:/Users/MSI/Desktop/text-to-sql/mobile/capacitor.config.json). To compile into a native Android APK:

1. Install Capacitor packages:
   ```bash
   cd mobile
   npm install @capacitor/core @capacitor/cli @capacitor/android
   ```

2. Build the production web bundle:
   ```bash
   npm run build
   ```

3. Add the Android platform:
   ```bash
   npx cap add android
   ```

4. Open the project in Android Studio:
   ```bash
   npx cap open android
   ```

5. In Android Studio:
   - Click **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
   - Transfer the generated `.apk` to any Android phone and install!

---

## ✨ Mobile App Features

- 🎙️ **Voice Query Input**: Tap the microphone icon to speak database queries hands-free (Web Speech API).
- 💬 **Conversational AI Query Feed**: Instant AI answers, formatted SQL code, and one-tap Copy button.
- 🛡️ **Multi-Tier Guardrail Badges**: Live indicators for AST SQLGlot firewall, EXPLAIN execution cost limits, and dynamic SHA-256 PII masking.
- 📊 **Touch-Optimized Charts**: Interactive SVG Bar charts, Donut charts, and Line charts.
- 📋 **Responsive Data Tables**: Horizontal swipeable result tables with masked PII column tags.
- 🗄️ **Schema Explorer**: Browse tables, column types, and test queries with a single tap.
- ⚙️ **Configurable Endpoint**: Easily switch backend URL between localhost, Wi-Fi IP, and Cloudflare tunnel.
