#!/usr/bin/env bash
# auto-commit-todo.sh
# Claude Code PostToolUse 훅 — TODO.md 작업 완료 시 자동 커밋 & 푸시

set -euo pipefail

PAYLOAD=$(cat)

PARSE_RESULT=$(HOOK_PAYLOAD="$PAYLOAD" python - <<'PYEOF'
import sys, json, re, os

try:
    payload = json.loads(os.environ.get('HOOK_PAYLOAD', '{}'))
except json.JSONDecodeError:
    sys.exit(0)

tool_input = payload.get("tool_input", {})
file_path  = tool_input.get("file_path", "")
old_str    = tool_input.get("old_string", "")
new_str    = tool_input.get("new_string", "")

if "TODO.md" not in file_path:
    sys.exit(0)

# 상대 경로 추출 (한국어 경로 인코딩 문제 회피)
rel_path = None
for marker in ("frontend/TODO.md", "backend/TODO.md"):
    if marker.replace("/", os.sep) in file_path or marker in file_path:
        rel_path = marker
        break
if not rel_path:
    sys.exit(0)

TASK_PATTERN = re.compile(r"-\s\[\s\]\s+(\S+)\s+(.*)")
old_match = TASK_PATTERN.search(old_str)
if not old_match:
    sys.exit(0)

task_id   = old_match.group(1).strip()
task_desc = old_match.group(2).encode('ascii', 'ignore').decode('ascii').strip()

DONE_PATTERN = re.compile(r"-\s\[x\]\s+" + re.escape(task_id), re.IGNORECASE)
if not DONE_PATTERN.search(new_str):
    sys.exit(0)

print(f"{rel_path}\t{task_id}\t{task_desc}")
PYEOF
)

if [[ -z "$PARSE_RESULT" ]]; then
  exit 0
fi

FILE_PATH=$(echo "$PARSE_RESULT" | cut -f1)
TASK_ID=$(echo "$PARSE_RESULT"   | cut -f2)
TASK_DESC=$(echo "$PARSE_RESULT" | cut -f3)

REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null)
if [[ -z "$REPO_ROOT" ]]; then
  echo "[auto-commit-todo] ERROR: Could not determine git repo root" >&2
  exit 0
fi

echo "[auto-commit-todo] Staging $FILE_PATH"
git add "$FILE_PATH"

COMMIT_MSG="chore: complete ${TASK_ID} - ${TASK_DESC}"
echo "[auto-commit-todo] Committing: $COMMIT_MSG"

if ! git commit -m "$COMMIT_MSG"; then
  echo "[auto-commit-todo] Nothing to commit." >&2
  exit 0
fi

echo "[auto-commit-todo] Pushing to origin..."
if ! git push; then
  echo "[auto-commit-todo] WARNING: git push failed. Commit is local." >&2
fi

echo "[auto-commit-todo] Done: ${TASK_ID} committed and pushed."
