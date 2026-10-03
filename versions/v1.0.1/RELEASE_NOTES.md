# Release Notes - SQL Guard v1.0.1

**Release Date:** October 2026  
**Type:** Minor Update / Network & Connectivity Patch  
**Version Code:** 2  
**Version Name:** 1.0.1  

---

## 🚀 Key Improvements in v1.0.1

1. **Cleartext HTTP Traffic Allowed**:
   - Added `android:usesCleartextTraffic="true"` in AndroidManifest.xml.
   - Resolves the Android OS security block preventing connection to local Wi-Fi IP servers.

2. **Smart Auto-Discovery**:
   - The app now automatically detects the computer's local Wi-Fi IP (`http://10.65.140.42:8000`) on launch.
   - Zero-configuration connection: no need to enter IP addresses in settings.

3. **Intelligent Offline Demo Fallback**:
   - If the device is disconnected from Wi-Fi, the app seamlessly provides realistic interactive demo responses for preset business queries and attack simulations.

4. **Android SDK 36 Compatibility**:
   - Native build compiled against official Android 36 SDK with accepted licenses.

---

## 📦 Version Artifacts

- **APK File**: [`apk-output/SQL_Guard_v1.0.1.apk`](file:///c:/Users/MSI/Desktop/text-to-sql/versions/v1.0.1/apk-output/SQL_Guard_v1.0.1.apk) (4.2 MB)
- **Web PWA Bundle**: [`mobile-web-pwa/`](file:///c:/Users/MSI/Desktop/text-to-sql/versions/v1.0.1/mobile-web-pwa)
- **Zip Archive**: [`SQL_Guard_Mobile_v1.0.1.zip`](file:///c:/Users/MSI/Desktop/text-to-sql/versions/v1.0.1/SQL_Guard_Mobile_v1.0.1.zip)
