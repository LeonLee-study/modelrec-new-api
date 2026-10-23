#!/usr/bin/env bash
# LG-09 API regression
# Usage: bash scripts/test/api-regression.sh [BASE_URL]
# Default: https://modelrec.net

set -u
BASE="${1:-https://modelrec.net}"
PASS=0
FAIL=0

ok() { PASS=$((PASS + 1)); echo "[PASS] $1"; }
bad() { FAIL=$((FAIL + 1)); echo "[FAIL] $1 — $2"; }

req() {
  local path="$1"
  curl -sS -o /tmp/lg09_body.txt -w "%{http_code}" -m 30 "${BASE}${path}" 2>/tmp/lg09_err.txt || true
}

echo "LG-09 API regression"
echo "BaseUrl: $BASE"
echo

code=$(req /api/status)
body=$(cat /tmp/lg09_body.txt 2>/dev/null || true)
if [[ "$code" == "200" ]] && echo "$body" | grep -q '"success"[[:space:]]*:[[:space:]]*true'; then
  ok "R1 GET /api/status"
else
  bad "R1 GET /api/status" "code=$code"
fi

code=$(req /api/pricing)
if [[ "$code" == "200" ]]; then ok "R2 GET /api/pricing"; else bad "R2 GET /api/pricing" "code=$code"; fi

code=$(req /api/notice)
if [[ "$code" == "200" ]]; then ok "R3 GET /api/notice"; else bad "R3 GET /api/notice" "code=$code"; fi

code=$(req /api/about)
if [[ "$code" == "200" ]]; then ok "R4 GET /api/about"; else bad "R4 GET /api/about" "code=$code"; fi

code=$(req /)
if [[ "$code" == "200" ]]; then ok "R5 GET /"; else bad "R5 GET /" "code=$code"; fi

code=$(req /pricing)
if [[ "$code" == "200" ]]; then ok "R6 GET /pricing"; else bad "R6 GET /pricing" "code=$code"; fi

code=$(req /v1/models)
if [[ "$code" =~ ^5 ]] || [[ -z "$code" ]]; then
  bad "R7 GET /v1/models (no token)" "code=$code"
else
  ok "R7 GET /v1/models (no token) -> $code (not 5xx)"
fi

echo
echo "Result: PASS=$PASS FAIL=$FAIL"
if [[ "$FAIL" -gt 0 ]]; then exit 1; else exit 0; fi
