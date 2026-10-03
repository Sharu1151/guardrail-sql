@echo off
title SQL Guard - Mobile App Launcher
echo ====================================================================
echo 📱 Launching SQL Guard Mobile Application
echo ====================================================================
echo.

:: 1. Ensure FastAPI backend is running
python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/api/health')" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [1/2] Starting FastAPI backend on http://0.0.0.0:8000 ...
    start "FastAPI Backend" cmd /c "python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000"
    timeout /t 3 >nul
) else (
    echo [1/2] FastAPI backend is already running on port 8000.
)

:: 2. Launch Vite Mobile Web Server
echo [2/2] Launching Mobile Frontend Server on http://0.0.0.0:5173 ...
echo.
echo ====================================================================
echo 📲 Open in your phone's browser (same Wi-Fi):
echo    http://10.65.140.42:5173
echo.
echo 💻 Open on this computer:
echo    http://localhost:5173
echo ====================================================================
echo.

cd mobile
npm run dev
pause
