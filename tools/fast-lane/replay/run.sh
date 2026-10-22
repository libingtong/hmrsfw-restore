#!/bin/bash
# Offline HAR-replay regression for a hmrsfw-vue checkout, using the existing POC tools unchanged.
# Usage: replay/run.sh <hmrsfw-vue checkout> [--env-file F] [--ids c01,c02,...] [--skip-build] [--no-legacy10] [--only-legacy10]
#   builds the checkout (npm run build -> dist/portal, dist/uc), wires dist into skeleton/dist/{portal,uc}-{s,a},
#   runs tools/verify-confirm.mjs (20 confirm pages, group s) and tools/verify.mjs (10 early pages, group a),
#   prints one PASS/FAIL line per page and totals. Exit 0 only if everything ran passes.
# Keys: the HAR bodies are SM4-encrypted, so the BUILD needs VITE_HMRSFW_* (SM2 public key, SM4 keys) or the page cannot
# decrypt responses. They are read from the environment only; pass --env-file <path> to export just the VITE_HMRSFW_* lines of
# an existing gitignored .env.local into the build process (never printed, never copied). Without keys every page FAILs.
# Offline: pages are answered from HAR (/xf-api/ routed to HAR); guard.mjs additionally makes Chromium unable to resolve
# any host except 127.0.0.1. No login, no network. Env knobs: POC (read-only data), DEPS (node_modules cache),
# HMRSFW_NO_WHITELIST=1 (passed through to verify-confirm), REPLAY_FIXED_TIME=off|<ISO time> (page clock, see guard.mjs).
set -u
HERE="$(cd "$(dirname "$0")" && pwd)"
POC="${POC:-/Users/dylan/Projects/hmrsfw-restore-poc}"
RESTORE="${RESTORE:-$HERE/../hmrsfw-restore}"
DEPS="${DEPS:-$(ls -d /Users/dylan/Projects/hmrsfw-restore-deps/root-*/ | head -1)}"
CK=""; IDS=""; BUILD=1; L10=1; C20=1; ENVF=""
while [ $# -gt 0 ]; do case "$1" in
  --ids) IDS="${2//,/ }"; shift 2;;
  --env-file) ENVF="$2"; shift 2;;
  --skip-build) BUILD=0; shift;;
  --no-legacy10) L10=0; shift;;
  --only-legacy10) C20=0; shift;;
  -*) echo "unknown option $1" >&2; exit 64;;
  *) CK="$1"; shift;;
esac; done
[ -n "$CK" ] && [ -d "$CK/apps" ] || { echo "usage: run.sh <hmrsfw-vue checkout> [options]" >&2; exit 64; }
CK="$(cd "$CK" && pwd)"
[ -d "$POC/har/confirm-replay" ] && [ -d "$POC/.auth" ] || { echo "POC data not found at $POC" >&2; exit 66; }

# ---- 1. wire the run directory (idempotent). POC data is only symlinked (read-only use); tools are copies. ----
cd "$HERE" || exit 1
mkdir -p tools out har skeleton/dist
# .auth: per-file links into the POC (read-only). The early-10 tool gives the RESTORED usercenter side the POC-era
# usercenter-restored.json, which lacks userCenterInfo; the faithfully restored E3 guard then redirects to /login exactly
# as the original build does with that file. Both sides get the same state (usercenter-original.json) instead: input data
# only, judgement logic unchanged (HM-34).
rm -rf .auth; mkdir .auth
for f in "$POC"/.auth/*.json; do ln -sfn "$f" ".auth/$(basename "$f")"; done
ln -sfn "$POC/.auth/usercenter-original.json" .auth/usercenter-restored.json
ln -sfn "$POC/har/confirm-replay" har/confirm-replay
ln -sfn "$POC/har/portal" har/portal
ln -sfn "$POC/har/usercenter" har/usercenter
ln -sfn "$POC/legacy-dist" legacy-dist
ln -sfn "${DEPS%/}/node_modules" node_modules
# verify-confirm.mjs: the POC copy is the newer one (shell-mount wait + origRuns retry); the hmrsfw-restore copy is older.
# verify.mjs / samples.json are identical in both; confirm-orders.json is identical in both.
cp "$POC/tools/verify-confirm.mjs" tools/
cp "$POC/tools/verify.mjs" tools/
for f in samples.json confirm-orders.json; do cp "$RESTORE/tools/$f" tools/; done
cp "$POC/out/whitelist-confirmed.json" "$POC/out/capture-routes.json" out/

# ---- 2. build ----
if [ $BUILD = 1 ]; then
  echo "== build $CK"
  if [ -n "$ENVF" ]; then
    [ -f "$ENVF" ] || { echo "env file not found" >&2; exit 66; }
    while IFS= read -r line; do k="${line%%=*}"; v="${line#*=}"; v="${v%\"}"; v="${v#\"}"; v="${v%\'}"; v="${v#\'}"; export "$k=$v"; done < <(grep -E '^VITE_HMRSFW_[A-Z0-9_]+=' "$ENVF")
  fi
  [ -n "${VITE_HMRSFW_SM4_KEY:-}" ] || [ -f "$CK/.env.local" ] || echo "WARNING: no VITE_HMRSFW_SM4_KEY in environment and no .env.local in checkout: responses cannot be decrypted, expect FAIL everywhere" >&2
  ( cd "$CK" && npm run build ) > "$HERE/out/build.log" 2>&1 || { tail -30 "$HERE/out/build.log"; echo "BUILD FAILED (see $HERE/out/build.log)"; exit 2; }
fi
for a in portal uc; do [ -f "$CK/dist/$a/index.html" ] || { echo "missing $CK/dist/$a/index.html" >&2; exit 2; }; done
for g in s a; do ln -sfn "$CK/dist/portal" "skeleton/dist/portal-$g"; ln -sfn "$CK/dist/uc" "skeleton/dist/uc-$g"; done

# ---- 3. run (fresh results each time) ----
# (with --ids, results of other pages from earlier invocations are kept, so a full run can be done in chunks)
if [ -z "$IDS" ]; then rm -f out/blocked-requests.jsonl out/offhost-requests.log; [ $C20 = 1 ] && rm -rf out/verify-confirm; [ $L10 = 1 ] && rm -rf out/verify; fi
for i in $IDS; do rm -f out/verify-confirm/s/$i.*; done
G="node --import ./guard.mjs"; RC=0
if [ $C20 = 1 ]; then
  echo "== verify-confirm (group s)"
  $G tools/verify-confirm.mjs s $IDS > out/confirm.log 2>&1 || echo "verify-confirm exited non-zero (see out/confirm.log)"
fi
if [ $L10 = 1 ] && [ -z "$IDS" ]; then
  for site in portal usercenter; do
    echo "== verify $site (group a)"
    $G tools/verify.mjs $site a > out/legacy10-$site.log 2>&1 || echo "verify $site exited non-zero (see out/legacy10-$site.log)"
  done
fi

# ---- 4. report ----
echo; echo "=== RESULT (checkout: $CK) ==="
if [ $C20 = 1 ]; then node summarize.mjs confirm out/verify-confirm/s "confirm/" "$IDS" || RC=1; fi
if [ $L10 = 1 ] && [ -z "$IDS" ]; then
  node summarize.mjs legacy10 out/verify/portal-a/summary.json "legacy10/portal/" || RC=1
  node summarize.mjs legacy10 out/verify/usercenter-a/summary.json "legacy10/uc/" || RC=1
fi
if [ -s out/offhost-requests.log ]; then echo "NOTE: requests to non-local hosts were attempted and blocked (host: count):"; sort out/offhost-requests.log | uniq -c; else echo "offhost requests: none"; fi
[ -s out/blocked-requests.jsonl ] && echo "whitelist-aborted /xf-api/ requests: $(wc -l < out/blocked-requests.jsonl) (out/blocked-requests.jsonl)"
exit $RC
