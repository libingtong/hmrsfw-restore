#!/bin/zsh
# HM-34 fast-lane helper. Usage:
#   fl.sh new <name>            worktree wt/<name> at restore/fast-lane tip, node_modules linked
#   fl.sh land <name> <msg>     commit worktree changes, cherry-pick onto restore/fast-lane
#   fl.sh base                  point local origin/integration at fast-lane tip (self-check scope base)
set -e
W=${FL_WORK:?set FL_WORK to the batch work dir}; V=$W/fl-vue
case $1 in
  base) git -C $V update-ref refs/remotes/origin/integration restore/fast-lane ;;
  new)
    D=$W/wt/$2
    git -C $V worktree add -q -B wip/$2 $D restore/fast-lane
    ln -sfn "$(readlink $V/node_modules)" $D/node_modules
    grep -qx "/node_modules" $V/.git/info/exclude || echo "/node_modules" >> $V/.git/info/exclude
    echo $D ;;
  land)
    D=$W/wt/$2
    git -C $D add -A
    git -C $D diff --cached --quiet && { echo "nothing to land"; exit 0; }
    git -C $D commit -q -m "$3"
    C=$(git -C $D rev-parse HEAD)
    git -C $V cherry-pick $C >/dev/null
    echo landed $(git -C $V rev-parse --short HEAD) ;;
  drop) git -C $V worktree remove --force $W/wt/$2; git -C $V branch -D wip/$2 >/dev/null ;;
esac
