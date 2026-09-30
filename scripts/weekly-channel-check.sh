#!/bin/bash
# weekly-channel-check.sh | Weekly channel health check (macOS launchd job)
# Runs the dispatch preflight once a week, logs the result, and raises a macOS notification
# when something needs a human: a role model missing from its channel catalog, or the
# channel client version changed (which can silently invalidate models in the table).
#
# It NEVER installs a client update on its own: an upgrade changes catalog / auth /
# sandbox defaults and can invalidate the whole model table. Upgrading stays a human call.
#
# Scheduled by: ~/Library/LaunchAgents/com.orca.channel-check.plist (weekly, Mon 09:00)
# Manual run:   bash scripts/weekly-channel-check.sh
set -u

# launchd gives a minimal PATH, so the channel CLIs are not found unless we build it here.
# (Observed 2026-09-30: first launchd run reported "codex CLI: unknown" and CHANNEL-FAIL.)
export PATH="$HOME/.local/bin:$HOME/Library/pnpm/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
NVM_BIN="$(ls -d "$HOME"/.nvm/versions/node/*/bin 2>/dev/null | sort -V | tail -1)"
[ -n "$NVM_BIN" ] && export PATH="$PATH:$NVM_BIN"
# opencode may also live in a pnpm global dir
for d in "$HOME/Library/pnpm"; do [ -d "$d" ] && export PATH="$PATH:$d"; done

# SAFETY GUARD (user rule 2026-09-29): this job is READ-ONLY about clients.
# It must never upgrade or install anything -- especially NOT opencode.
# Upgrading changes catalog / auth / sandbox defaults and can invalidate the whole model table,
# so upgrades stay a human decision. If a forbidden call ever appears in this file, refuse to run.
forbidden="$(grep -nE '^[^#]*(codex|opencode|codebuddy)[[:space:]]+(update|install|upgrade)' "$0" || true)"
if [ -n "$forbidden" ]; then
  echo "SAFETY: forbidden client-update call found in this script; refusing to run:"
  echo "$forbidden"
  exit 1
fi

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LOG="$HOME/Library/Logs/orca-channel-check.log"
STATE="$HOME/.orca-channel-check.state"
PREFLIGHT="$ROOT/scripts/check-channel-preflight.sh"
NOTIFY_TITLE="ORCA channel check"

mkdir -p "$(dirname "$LOG")" 2>/dev/null
notify() { osascript -e "display notification \"$1\" with title \"$NOTIFY_TITLE\"" >/dev/null 2>&1; }
stamp() { date "+%Y-%m-%d %H:%M:%S"; }

[ -x "$PREFLIGHT" ] || bash "$PREFLIGHT" >/dev/null 2>&1 || true
out="$(cd "$ROOT" && LC_ALL=C bash "$PREFLIGHT" 2>&1)"
rc=$?
ver="$(codex --version 2>&1 | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -1)"

prev_ver=""
[ -f "$STATE" ] && prev_ver="$(grep -oE '[0-9]+\.[0-9]+\.[0-9]+' "$STATE" 2>/dev/null | head -1)"

{
  echo "===== $(stamp) ====="
  echo "codex CLI: ${ver:-unknown}"
  echo "result: $( [ "$rc" -eq 0 ] && echo CHANNEL-OK || echo CHANNEL-FAIL )"
  echo "$out"
  echo ""
} >> "$LOG"

# keep log bounded
tail -n 400 "$LOG" > "$LOG.tmp" 2>/dev/null && mv "$LOG.tmp" "$LOG" 2>/dev/null
echo "${ver:-unknown}" > "$STATE"

if [ "$rc" -ne 0 ]; then
  notify "CHANNEL-FAIL: a model in the dispatch table is missing from its channel. Open the governance repo and run scripts/check-channel-preflight.sh"
elif [ -n "$prev_ver" ] && [ "$prev_ver" != "${ver:-unknown}" ]; then
  notify "codex CLI changed: $prev_ver -> ${ver:-unknown}. Channel catalog may have changed; dispatch table re-verified OK this run, but re-check if dispatch fails."
fi

echo "$(stamp) done rc=$rc ver=${ver:-unknown} (was ${prev_ver:-none})"
exit 0
