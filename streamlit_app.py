"""Root entrypoint for Streamlit Community Cloud.

Seamlessly loads and runs frontend/app.py.
"""
import os
import sys

# Ensure repository root is on sys.path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

# Load and execute main dashboard
app_file = os.path.join(BASE_DIR, "frontend", "app.py")
with open(app_file, "r", encoding="utf-8") as f:
    code = f.read()

exec(code, globals())
