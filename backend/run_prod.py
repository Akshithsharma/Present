from waitress import serve
import warnings

# Suppress sklearn version warnings
warnings.filterwarnings("ignore", category=UserWarning, module="sklearn")

from app import app
import os

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"Starting production server on port {port}...")
    # threads=6 is a reasonable default for typical workloads
    serve(app, host='0.0.0.0', port=port, threads=6)
