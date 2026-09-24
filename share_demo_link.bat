@echo off
title Guardrailed Text-to-SQL - Live Client Demo Tunnel
echo ====================================================================
echo 🚀 Launching Public Client Demo Tunnel (Cloudflare HTTPS)
echo ====================================================================
echo.

:: Check if platform is running
python -c "import urllib.request; urllib.request.urlopen('http://localhost:8501')" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [1/2] Starting backend and frontend platform...
    start /b python run.py
    timeout /t 4 >nul
) else (
    echo [1/2] Platform is already running on port 8501.
)

echo [2/2] Connecting to Cloudflare Global Edge Network...
echo.
echo ====================================================================
echo Copy the https://*.trycloudflare.com link below and share it with your client!
echo ====================================================================
echo.

cloudflared.exe tunnel --url http://localhost:8501
pause
