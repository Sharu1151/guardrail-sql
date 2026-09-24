"""Master Application Launcher.

Starts FastAPI backend service (port 8000) and Streamlit web dashboard (port 8501).
"""

import os
import sys
import time
import subprocess
from dotenv import load_dotenv

# Ensure console supports unicode on Windows
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

load_dotenv()


def main():
    print("==================================================================")
    print("[START] Starting Guardrailed Text-to-SQL Analytics Platform")
    print("==================================================================")

    # 1. Verify database exists
    sqlite_db = os.getenv("SQLITE_DB_PATH", "data/sales_data.db")
    if not os.path.exists(sqlite_db):
        print("Initializing enterprise database tables...")
        from backend.database.db_setup import main as setup_db
        setup_db()

    os.makedirs("logs", exist_ok=True)
    fastapi_log = open("logs/fastapi.log", "a", encoding="utf-8")
    streamlit_log = open("logs/streamlit.log", "a", encoding="utf-8")

    DETACHED_PROCESS = 0x00000008

    # 2. Launch FastAPI backend
    print("\n[1/2] Launching FastAPI Backend on http://localhost:8000 ...")
    fastapi_proc = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "backend.main:app", "--host", "127.0.0.1", "--port", "8000"],
        stdout=fastapi_log,
        stderr=fastapi_log,
        creationflags=DETACHED_PROCESS,
        cwd=os.getcwd()
    )

    time.sleep(2)

    # 3. Launch Streamlit Frontend
    print("[2/2] Launching Streamlit Web Dashboard on http://localhost:8501 ...")
    streamlit_proc = subprocess.Popen(
        [sys.executable, "-m", "streamlit", "run", "frontend/app.py", "--server.port", "8501", "--server.headless", "true"],
        stdout=streamlit_log,
        stderr=streamlit_log,
        creationflags=DETACHED_PROCESS,
        cwd=os.getcwd()
    )

    time.sleep(2)

    print("\n==================================================================")
    print("[ONLINE] Guardrailed Text-to-SQL Platform is LIVE!")
    print("  -> Dashboard UI:  http://localhost:8501")
    print("  -> FastAPI Docs:  http://localhost:8000/docs")
    print("  -> System Health: http://localhost:8000/api/health")
    print(f"  -> FastAPI PID:   {fastapi_proc.pid} (Logs: logs/fastapi.log)")
    print(f"  -> Streamlit PID: {streamlit_proc.pid} (Logs: logs/streamlit.log)")
    print("==================================================================")
    print("Press Ctrl+C to terminate all services.\n")

    try:
        while True:
            time.sleep(1)
            if fastapi_proc.poll() is not None or streamlit_proc.poll() is not None:
                break
    except KeyboardInterrupt:
        print("\nShutting down services...")
    finally:
        fastapi_proc.terminate()
        streamlit_proc.terminate()


if __name__ == "__main__":
    main()
