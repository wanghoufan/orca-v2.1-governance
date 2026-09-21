#!/bin/bash
# check-sync.sh｜母版↔两包同步校验（替代 HANDOFF 人工计数）
# 用法：在母版根执行 `bash scripts/check-sync.sh`，exit 0 即过。
# 预期差白名单（仅布局裸名）：AGENTS.md:37、scripts/orchestration/README.md:3。其余文件必须字节一致。
set -u
fail=0
check() { # $1=母版文件 $2=包文件
  if ! diff -q "$1" "$2" >/dev/null 2>&1; then echo "DIFF: $1 vs $2"; fail=1; fi
}
for pkg in "新项目模板包" "老项目迁移模板包"; do
  # AGENTS 白名单：仅允许 :37 裸名差 1 行（diff 输出恰 2 行 markers）
  n=$(diff AGENTS.md "$pkg/AGENTS.md" | grep -c "^[<>]" || true)
  [ "$n" = "2" ] || { echo "AGENTS 非预期差: $pkg ($n 行)"; fail=1; }
  check USER_MODEL_OVERRIDE.md "$pkg/USER_MODEL_OVERRIDE.md"
  for f in docs/roles/*.md docs/sop/*.md; do check "$f" "$pkg/$f"; done
  for f in docs/pm/PLAN.template.md docs/pm/PRODUCT_PLAN.template.md \
           docs/qa/BUGS.template.md docs/review/CODE_REVIEW.template.md \
           docs/review/RESEARCH_REVIEW.template.md docs/review/PRODUCT_BACKLOG.template.md \
           docs/handoff/HANDOFF.template.md docs/handoff/EXT-WORKLOG.template.md \
           docs/model/TASK-MODEL-LOG.jsonl docs/model/DISPATCH-LOG.jsonl \
           经验一句话.md; do
    check "$f" "$pkg/$f"
  done
  check "docs/templates/归位表.template.md" "$pkg/归位表.template.md" # 包根平铺布局
done
# 白名单外零容忍：上方仅报告“是否不同”；AGENTS:37 与 scripts README:3 的裸名差为预期，需人工确认仅此两处：
echo "--- 预期差确认（应仅 2 处） ---"
diff AGENTS.md "新项目模板包/AGENTS.md" | grep -c "^[<>]" || true
diff scripts/orchestration/README.md "新项目模板包/scripts/orchestration/README.md" | grep -c "^[<>]" || true
[ "$fail" -eq 0 ] && echo "SYNC-OK" || echo "SYNC-FAIL"
exit "$fail"
