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
           docs/model/TASK-MANAGER-QUALIFICATION.md docs/model/TASK-MANAGER-QUALIFICATION-EVENTS.jsonl \
           docs/model/JEV-DECISION-LOG.jsonl \
           scripts/model/tm-qualification.mjs scripts/model/tm-qualification.test.mjs \
           经验一句话.md ORCA治理体系说明.md; do
    check "$f" "$pkg/$f"
  done
  check "docs/templates/归位表.template.md" "$pkg/归位表.template.md" # 包根平铺布局
  if [ "$pkg" = "老项目迁移模板包" ]; then check "docs/prompts/迁移整理提示词.md" "$pkg/迁移整理提示词.md"; fi # 迁移提示词仅老包有（根平铺）
  for f in scripts/decision/orca-decide.mjs scripts/decision/run-shadow.mjs scripts/decision/test-filter.mjs scripts/decision/test-mock.mjs scripts/decision/test-slow.mjs scripts/decision/test-partition.mjs scripts/decision/partition-validate.mjs scripts/decision/test-secrets.mjs scripts/decision/build-index.mjs scripts/decision/partition-validate.mjs scripts/decision/test-slow.mjs scripts/decision/test-partition.mjs scripts/decision/partition-validate.mjs scripts/decision/test-secrets.mjs scripts/decision/build-index.mjs scripts/decision/test-slow.mjs scripts/decision/test-partition.mjs scripts/decision/partition-validate.mjs scripts/decision/policy.json scripts/decision/package.json scripts/decision/package-lock.json scripts/decision/README.md scripts/decision/evals/skill-manifest.json scripts/decision/evals/glm-exact-smoke.log scripts/decision/evals/slow-test.log scripts/model/check-ledger.mjs scripts/decision/fixtures/T01.json scripts/decision/fixtures/T02.json scripts/decision/fixtures/T03.json scripts/decision/fixtures/T04.json scripts/decision/fixtures/T05.json scripts/decision/fixtures/T06.json scripts/decision/fixtures/T07.json scripts/decision/fixtures/T08.json scripts/decision/fixtures/T09.json scripts/decision/fixtures/T10.json scripts/decision/fixtures/S01.json scripts/decision/fixtures/S02.json scripts/decision/fixtures/S03.json scripts/decision/fixtures/S04.json scripts/decision/fixtures/S05.json scripts/decision/fixtures/S06.json scripts/decision/fixtures/S07.json scripts/decision/fixtures/S08.json scripts/decision/fixtures/X01.json scripts/decision/fixtures/X02.json scripts/decision/fixtures/F01.json scripts/decision/fixtures/F02.json scripts/decision/fixtures/F03.json scripts/decision/fixtures/F04.json scripts/decision/fixtures/P01.json scripts/decision/fixtures/P02.json scripts/decision/fixtures/P03.json scripts/decision/fixtures/P04.json scripts/decision/fixtures/PX1.json scripts/decision/fixtures/PV_GOOD.json scripts/decision/fixtures/PV_BAD.json; do check "$f" "$pkg/$f"; done
  if ! diff -rq --exclude=node_modules scripts/decision "$pkg/scripts/decision" >/dev/null 2>&1; then echo "DIFFDIR: scripts/decision vs $pkg"; diff -rq --exclude=node_modules scripts/decision "$pkg/scripts/decision" | head -5; fail=1; fi
done
# 白名单外零容忍：上方仅报告“是否不同”；AGENTS:37 与 scripts README:3 的裸名差为预期，需人工确认仅此两处：
echo "--- 预期差确认（应仅 2 处） ---"
diff AGENTS.md "新项目模板包/AGENTS.md" | grep -c "^[<>]" || true
diff scripts/orchestration/README.md "新项目模板包/scripts/orchestration/README.md" | grep -c "^[<>]" || true
[ "$fail" -eq 0 ] && echo "SYNC-OK" || echo "SYNC-FAIL"
exit "$fail"
