@echo off
title SQL Guard - Live Mobile Cloud Server
echo ====================================================================
echo 🚀 Launching SQL Guard Backend with Cloudflare 5G Public Tunnel
echo ====================================================================
echo.

:: 1. Start FastAPI backend
start "SQL Guard Backend (Port 8000)" cmd /k "python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000"
timeout /t 3 >nul

:: 2. Start Cloudflare Tunnel
echo Starting Cloudflare Edge Tunnel...
echo.
cloudflared.exe tunnel --url http://localhost:8000
pause
