#!/bin/bash
# Serialises run.sh across every run on this machine (verify-confirm uses fixed ports 4701-4704). Same arguments as run.sh.
# Copy this directory (run.sh, guard.mjs, summarize.mjs, run-locked.sh) to a scratch dir OUTSIDE any repo and run it there;
# it writes HAR copies and page text (test data) into out/ — never commit that directory.
L=/Users/dylan/Projects/hmrsfw-restore-state/locks/replay.lock
until mkdir "$L" 2>/dev/null; do sleep 5; done
trap 'rmdir "$L"' EXIT
"$(dirname "$0")/run.sh" "$@"
