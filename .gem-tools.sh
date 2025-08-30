#!/usr/bin/env bash
set -euo pipefail

# Models (free tier supports these)
: "${MODEL_PRO:=gemini-2.5-pro}"
: "${MODEL_FLASH:=gemini-2.5-flash}"

# Require BRAND env for nice filenames (e.g., edm-shuffle / mystic-arcana / birthdaygen)
: "${BRAND:=unknown}"

# Ensure header exists
HEADER="prompts/_text_only_header.txt"
if [[ ! -f "$HEADER" ]]; then
  mkdir -p prompts
  cat > "$HEADER" <<'HEOF'
TEXT-ONLY MODE
Do NOT call any tools or shell. Output plaintext only.
If you produce a unified diff, wrap it like:
<<<PATCH
<unified diff here>
>>>PATCH
HEOF
fi

gemrun() {
  # usage: gemrun <name> <model> <prompt-file>
  local name="$1"; local model="$2"; local prompt="$3"
  mkdir -p logs
  local ts; ts="$(date +%Y%m%d_%H%M%S)"
  local log="logs/${BRAND}_${name}_${ts}.txt"
  cat "$HEADER" "$prompt" | gemini -m "$model" | tee "$log"
  echo "Saved output → $log"
}

# extract first <<<PATCH…>>>PATCH block from a saved log to patch.diff
gempatch() {
  # usage: gempatch <logfile> [outfile]
  local log="$1"; local out="${2:-patch.diff}"
  sed -n '/^<<<PATCH/,/^>>>PATCH/p' "$log" | sed '1d;$d' > "$out"
  echo "Extracted patch → $out"
}
