import json
import subprocess
from subprocess import run

def list_directory(path):
    command = [
        "uv",
        "mcp",
        "use_mcp_tool",
        "--server_name",
        "filesystem",
        "--tool_name",
        "list_directory",
        "--arguments",
        json.dumps({"path": path}),
    ]
    result = subprocess.run(command, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Error listing directory {path}: {result.stderr}")
        return []
    try:
        # Parse the output as JSON
        data = json.loads(result.stdout)
        # Extract the relevant file/directory names from the JSON structure
        items = data.get("result", "").splitlines()
        return items
    except json.JSONDecodeError:
        print(f"Error decoding JSON: {result.stdout}")
        return []


def generate_tree(path, indent=""):
    excluded_dirs = [
        "node_modules",
        ".venv",
        ".git",
        "__pycache__",
        "venv_crewai",
        "dist",
        "edm-shuffle-output-docs",
        ".vercel",
        ".vscode",
        "supabase/.temp"
    ]
    items = list_directory(path)
    tree = ""
    if items:
        for i, item in enumerate(items):
            is_last = i == len(items) - 1
            prefix = "└── " if is_last else "├── "
            if item.startswith("[DIR]"):
                dir_name = item[6:].strip()
                if dir_name not in excluded_dirs:
                    tree += indent + prefix + dir_name + "\\n"
                    subdir_path = f"{path}/{dir_name}" if path != "." else dir_name
                    tree += generate_tree(subdir_path, indent + ("    " if is_last else "│   "))
            elif item.startswith("[FILE]"):
                file_name = item[7:].strip()
                tree += indent + prefix + file_name + "\\n"
    return tree

if __name__ == "__main__":
    tree = generate_tree(".")
    print(tree)
