import subprocess
import importlib.util
import sys

def is_installed(pkg):
    return importlib.util.find_spec(pkg) is not None

if not is_installed("agentic_memory"):
    print("🧠 A-mem not found in this virtualenv. Installing in editable mode...")
    subprocess.run([sys.executable, "-m", "pip", "install", "-e", "./A-mem"])
else:
    print("✅ A-mem is already installed and available.")
