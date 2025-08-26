#!/usr/bin/env python3

import json
import os
import sys
import subprocess

# Directories to exclude
EXCLUDE_DIRS = {
    'node_modules',
    '.venv',
    '.git',
    '__pycache__',
    'venv_crewai',
    'dist',
    'edm-shuffle-output-docs',
    '.vercel',
    '.vscode',
    'supabase/.temp'
}

def list_directory(path):
    """List contents of a directory using the filesystem MCP tool."""
    try:
        # Use subprocess to call the MCP tool
        # The command is: uv mcp use filesystem list_directory --arguments '{"path": "path"}'
        cmd = [
            "uv", "mcp", "use", "filesystem", "list_directory",
            "--arguments", json.dumps({"path": path})
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        output_lines = result.stdout.strip().split('\n')
        return output_lines
    except subprocess.CalledProcessError as e:
        print(f"Error listing directory {path}: {e.stderr}", file=sys.stderr)
        return []
    except Exception as e:
        print(f"Unexpected error listing directory {path}: {e}", file=sys.stderr)
        return []

def should_exclude(path):
    """Check if a path should be excluded."""
    path_parts = path.split(os.sep)
    return any(part in EXCLUDE_DIRS for part in path_parts)

def generate_tree(path, prefix="", is_last=True):
    """Recursively generate a tree structure."""
    if should_exclude(path):
        return ""
    
    output = ""
    items = list_directory(path)
    
    # Separate directories and files
    dirs = [item for item in items if item.startswith("[DIR]")]
    files = [item for item in items if item.startswith("[FILE]")]
    
    # Sort them for consistent output
    dirs.sort()
    files.sort()
    
    # Combine dirs and files, with dirs first
    all_items = dirs + files
    total_items = len(all_items)
    
    for i, item in enumerate(all_items):
        is_last_item = (i == total_items - 1)
        marker = "└── " if is_last_item else "├── "
        
        if item.startswith("[DIR]"):
            dir_name = item[6:]  # Remove "[DIR] "
            output += f"{prefix}{marker}{dir_name}\n"
            dir_path = os.path.join(path, dir_name) if path != "." else dir_name
            extension = "    " if is_last_item else "│   "
            output += generate_tree(dir_path, prefix + extension, is_last_item)
        elif item.startswith("[FILE]"):
            file_name = item[7:]  # Remove "[FILE] "
            output += f"{prefix}{marker}{file_name}\n"
    
    return output

if __name__ == "__main__":
    tree = generate_tree(".")
    print(tree)
