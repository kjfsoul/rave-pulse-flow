import os
import re

# Uncomment the following import if using .docx input:
# from docx import Document

# ---- CONFIG ----
INPUT_FILE = "/Users/kfitz/EDM Shuffle/rave-pulse-flow/edm-shuffle-output-docs/EDM Shuffle_ Professional Development Manual.docx"  # Change to your file path
OUTPUT_DIR = "edm-shuffle-output-docs"  # Folder for output .md files

# Mapping for "nice" file names
FILE_MAP = {
    "Executive Summary & Vision": "executive-summary-and-vision.md",
    "Documentation Index": "documentation_index.md",
    "PRD": "prd.md",
    "FRS": "frs.md",
    "Implementation Roadmap": "implementation-roadmap.md",
    "Phase-by-phase Features/Prompts/Tasks": "phase-by-phase-features.md",
    "Validation Steps & Scripts": "validation-scripts.md",
    "Feature Matrix/Gap Analysis": "feature-matrix-gap-analysis.md",
    "Change Log": "change-log.md",
    "Claude Integrity Rules": "claude_integrity_rules.md",
    "Architecture": "architecture.md",
    "claude.md": "claude.md",
     "Gap Analysis & Progress Report": "gap-analysis-and-progress.md",
    "Feature Gap Analysis": "feature-gap-analysis.md"
}

# ---- HELPERS ----

def slugify(title):
    return re.sub(r'[^\w\-]+', '-', title.lower()).strip('-') + ".md"

def save_section(title, content, output_dir):
    fname = FILE_MAP.get(title, slugify(title))
    path = os.path.join(output_dir, fname)
    # Insert LLM context header for all files
    with open(path, "w", encoding="utf-8") as f:
        f.write(f"<!-- LLM/Claude Context: Section = {title} -->\n\n")
        f.write(content.strip() + "\n")

def docx_to_sections(docx_path):
    """Extract sections from a .docx by top-level heading (assume H1/# or H2/##)"""
    from docx import Document
    doc = Document(docx_path)
    sections = {}
    current_title = None
    current_content = []
    for p in doc.paragraphs:
        text = p.text.strip()
        if not text:
            continue
        # Heuristic: heading level 1 or 2 = section split
        if p.style.name.startswith('Heading'):
            if current_title:
                sections[current_title] = "\n".join(current_content)
            current_title = text
            current_content = []
        else:
            current_content.append(text)
    if current_title:
        sections[current_title] = "\n".join(current_content)
    return sections

def md_to_sections(md_path):
    """Extract sections from a markdown file by # headers."""
    with open(md_path, "r", encoding="utf-8") as f:
        lines = f.readlines()
    sections = {}
    current_title = None
    current_content = []
    for line in lines:
        if line.strip().startswith("#"):
            if current_title:
                sections[current_title] = "".join(current_content)
            current_title = line.strip("# \n")
            current_content = []
        else:
            current_content.append(line)
    if current_title:
        sections[current_title] = "".join(current_content)
    return sections

def ensure_special_files(output_dir, present_files):
    # Claude.md
    if "claude.md" not in present_files:
        with open(os.path.join(output_dir, "claude.md"), "w", encoding="utf-8") as f:
            f.write(
"""<!-- LLM/Claude Context: Claude, read this file first! -->
# CLAUDE.md

Welcome to EDM Shuffle development. This directory is optimized for LLM/Claude workflows.
- Always read `CLAUDE_INTEGRITY_RULES.md` and `IMPLEMENTATION_MICROTASKS.md` before coding.
- Never fabricate features, data, or progress.
- Ask for clarification if context is missing.
- See `documentation_index.md` for all documentation files.

---
"""
            )
    # Integrity Rules
    if "claude_integrity_rules.md" not in present_files:
        with open(os.path.join(output_dir, "claude_integrity_rules.md"), "w", encoding="utf-8") as f:
            f.write(
"""<!-- LLM/Claude Context: Integrity rules for all LLM/AI contributors -->
# CLAUDE_INTEGRITY_RULES.md

- Never fabricate or claim completion of features you cannot verify.
- Do not use placeholder/mock data unless clearly marked and with TODO for real code.
- Admit limitations honestly; recommend tools or human input if blocked.
- Validate and test every change; log issues in the change log.
- Reference IMPLEMENTATION_MICROTASKS.md at every commit/review stage.
---
"""
            )

def write_index(output_dir):
    """Build a documentation_index.md based on all .md files."""
    files = [f for f in os.listdir(output_dir) if f.endswith(".md") and f != "documentation_index.md"]
    index_path = os.path.join(output_dir, "documentation_index.md")
    with open(index_path, "w", encoding="utf-8") as f:
        f.write("# Documentation Index\n\n")
        for fname in sorted(files):
            title = fname.replace("-", " ").replace(".md", "").title()
            f.write(f"- **{title}**: See `{fname}`\n")

# ---- MAIN ----

def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    # Try DOCX first; fallback to .md
    try:
        sections = docx_to_sections(INPUT_FILE)
    except Exception:
        sections = md_to_sections(INPUT_FILE)
    # Save all sections
    written = set()
    for title, content in sections.items():
        save_section(title, content, OUTPUT_DIR)
        written.add(FILE_MAP.get(title, slugify(title)))
    # Add special files if missing
    ensure_special_files(OUTPUT_DIR, written)
    # Write index
    write_index(OUTPUT_DIR)
    print(f"✅ Done! All docs are in '{OUTPUT_DIR}/'.\n")
    print(f"Files:\n" + "\n".join(sorted(os.listdir(OUTPUT_DIR))))

if __name__ == "__main__":
    main()
