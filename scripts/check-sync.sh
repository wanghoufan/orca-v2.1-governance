#!/bin/bash
# check-sync.sh｜母版↔两包同步校验（替代 HANDOFF 人工计数）
# 用法：在母版根执行 `bash scripts/check-sync.sh`，exit 0 即过。
# 归一化比对（2026-10-05，替代旧"数 marker"白名单）：
#   AGENTS.md 与 scripts/orchestration/README.md 的两处差异是**布局裸名差**（docs/prompts/xxx ↔ xxx）。
#   旧做法只数 diff 行数＝2 就放行，导致那两行的内容本身写错也照样 SYNC-OK（已实证可绕过）。
#   现做法：先把母版侧的 docs/prompts/ 归一化成裸名，再逐字节比对；任何内容差都会 DIFF 并 fail。
# 预期差白名单：无（归一化后应为零差异）。
set -u
fail=0
# 布局裸名归一化：把母版侧的 docs/prompts/xxx 归一成包内裸名 xxx，之后逐字节比对
norm_md() { sed 's#docs/prompts/编排者提示词#编排者提示词#g; s#docs/prompts/Orca 编排治理监督者提示词#Orca 编排治理监督者提示词#g; s#docs/prompts/Orca 通用编排者持续推进协议#Orca 通用编排者持续推进协议#g; s#docs/prompts/迁移整理提示词#迁移整理提示词#g; s#docs/templates/归位表.template#归位表.template#g' "$1"; }
check_norm() { # 母版含 docs/prompts/ 裸名引用、需归一化后比对的文件
  local src="$1" pkgf="$2" n1
  n1=$(mktemp); norm_md "$src" > "$n1"
  if ! cmp -s "$n1" "$pkgf"; then echo "DIFF(norm): $src vs $pkgf"; diff "$n1" "$pkgf" | grep "^[<>]" | cut -c1-160 | head -3; fail=1; fi
  rm -f "$n1"
}
check() { # $1=母版文件 $2=包文件
  if ! diff -q "$1" "$2" >/dev/null 2>&1; then echo "DIFF: $1 vs $2"; fail=1; fi
}
for pkg in "新项目模板包" "老项目迁移模板包"; do
  # AGENTS.md：归一化 docs/prompts/ 裸名后逐字节比对（不接受"只数行数"的白名单）
  norm_a=$(mktemp); norm_md AGENTS.md > "$norm_a"
  if ! cmp -s "$norm_a" "$pkg/AGENTS.md"; then
    echo "AGENTS 非预期差: $pkg"; diff "$norm_a" "$pkg/AGENTS.md" | grep "^[<>]" | head -5; fail=1
  fi
  rm -f "$norm_a"
  check USER_MODEL_OVERRIDE.md "$pkg/USER_MODEL_OVERRIDE.md"
  for f in docs/roles/*.md docs/sop/*.md docs/assets/*; do check "$f" "$pkg/$f"; done
  for f in docs/pm/PLAN.template.md docs/pm/PRODUCT_PLAN.template.md \
           docs/qa/BUGS.template.md docs/review/CODE_REVIEW.template.md \
           docs/review/RESEARCH_REVIEW.template.md docs/review/PRODUCT_BACKLOG.template.md \
           docs/handoff/HANDOFF.template.md docs/handoff/EXT-WORKLOG.template.md \
           docs/model/TASK-MODEL-LOG.jsonl docs/model/DISPATCH-LOG.jsonl \
           docs/model/TASK-MANAGER-QUALIFICATION.md docs/model/TASK-MANAGER-QUALIFICATION-EVENTS.jsonl \
           docs/model/JEV-DECISION-LOG.jsonl \
           scripts/model/tm-qualification.mjs scripts/model/tm-qualification.test.mjs \
           经验一句话.md; do
    check "$f" "$pkg/$f"
  done
  check "docs/templates/归位表.template.md" "$pkg/归位表.template.md" # 包根平铺布局
  check_norm "README.md" "$pkg/README.md"
  check "scripts/detect-client.sh" "$pkg/scripts/detect-client.sh"
  # 包根平铺的四份提示词（母版在 docs/prompts/，包内平铺到根）
  check_norm "docs/prompts/编排者提示词.md" "$pkg/编排者提示词.md"
  check_norm "docs/prompts/外部开发者提示词.md" "$pkg/外部开发者提示词.md"
  check_norm "docs/prompts/Orca 编排治理监督者提示词.md" "$pkg/Orca 编排治理监督者提示词.md"
  check_norm "docs/prompts/Orca 通用编排者持续推进协议.md" "$pkg/Orca 通用编排者持续推进协议.md"
  check GOVERNANCE_VERSION "$pkg/GOVERNANCE_VERSION"
  # scripts/orchestration/README.md 同样是布局裸名差，归一化后比对
  norm_o=$(mktemp); norm_md scripts/orchestration/README.md > "$norm_o"
  if ! cmp -s "$norm_o" "$pkg/scripts/orchestration/README.md"; then echo "DIFF: scripts/orchestration/README.md vs $pkg"; diff "$norm_o" "$pkg/scripts/orchestration/README.md" | grep "^[<>]" | head -3; fail=1; fi
  rm -f "$norm_o"
  if [ "$pkg" = "老项目迁移模板包" ]; then check_norm "docs/prompts/迁移整理提示词.md" "$pkg/迁移整理提示词.md"; fi # 迁移提示词仅老包有（根平铺）
  for f in scripts/decision/orca-decide.mjs scripts/decision/run-shadow.mjs scripts/decision/test-filter.mjs scripts/decision/test-mock.mjs scripts/decision/test-slow.mjs scripts/decision/test-partition.mjs scripts/decision/partition-validate.mjs scripts/decision/test-secrets.mjs scripts/decision/build-index.mjs scripts/decision/partition-validate.mjs scripts/decision/test-slow.mjs scripts/decision/test-partition.mjs scripts/decision/partition-validate.mjs scripts/decision/test-secrets.mjs scripts/decision/build-index.mjs scripts/decision/test-slow.mjs scripts/decision/test-partition.mjs scripts/decision/partition-validate.mjs scripts/decision/policy.json scripts/decision/package.json scripts/decision/package-lock.json scripts/decision/README.md scripts/decision/evals/skill-manifest.json scripts/decision/evals/glm-exact-smoke.log scripts/decision/evals/slow-test.log scripts/model/check-ledger.mjs scripts/decision/fixtures/T01.json scripts/decision/fixtures/T02.json scripts/decision/fixtures/T03.json scripts/decision/fixtures/T04.json scripts/decision/fixtures/T05.json scripts/decision/fixtures/T06.json scripts/decision/fixtures/T07.json scripts/decision/fixtures/T08.json scripts/decision/fixtures/T09.json scripts/decision/fixtures/T10.json scripts/decision/fixtures/S01.json scripts/decision/fixtures/S02.json scripts/decision/fixtures/S03.json scripts/decision/fixtures/S04.json scripts/decision/fixtures/S05.json scripts/decision/fixtures/S06.json scripts/decision/fixtures/S07.json scripts/decision/fixtures/S08.json scripts/decision/fixtures/X01.json scripts/decision/fixtures/X02.json scripts/decision/fixtures/F01.json scripts/decision/fixtures/F02.json scripts/decision/fixtures/F03.json scripts/decision/fixtures/F04.json scripts/decision/fixtures/P01.json scripts/decision/fixtures/P02.json scripts/decision/fixtures/P03.json scripts/decision/fixtures/P04.json scripts/decision/fixtures/PX1.json scripts/decision/fixtures/PV_GOOD.json scripts/decision/fixtures/PV_BAD.json; do check "$f" "$pkg/$f"; done
  if ! diff -rq --exclude=node_modules scripts/decision "$pkg/scripts/decision" >/dev/null 2>&1; then echo "DIFFDIR: scripts/decision vs $pkg"; diff -rq --exclude=node_modules scripts/decision "$pkg/scripts/decision" | head -5; fail=1; fi
done
# 预期差确认：归一化后两包与母版应零差异；非零即 fail（不再只 echo）
echo "--- 归一化后预期差（应为 0） ---"
for f in AGENTS.md scripts/orchestration/README.md; do
  case "$f" in
    AGENTS.md) src=$(mktemp); sed 's#docs/prompts/编排者提示词#编排者提示词#g; s#docs/prompts/Orca 编排治理监督者提示词#Orca 编排治理监督者提示词#g; s#docs/prompts/Orca 通用编排者持续推进协议#Orca 通用编排者持续推进协议#g' AGENTS.md.tmpnorm 2>/dev/null; sed 's#docs/prompts/编排者提示词#编排者提示词#g; s#docs/prompts/Orca 编排治理监督者提示词#Orca 编排治理监督者提示词#g; s#docs/prompts/Orca 通用编排者持续推进协议#Orca 通用编排者持续推进协议#g' "$f" > "$src";;
    scripts/orchestration/README.md) src=$(mktemp); norm_md "$f" > "$src";;
    *) src="$f";;
  esac
  n=$(diff "$src" "新项目模板包/$f" | grep -c "^[<>]" || true)
  echo "$f: $n"
  [ "$n" = "0" ] || fail=1
done
# 概览新鲜度（2026-09-29 起，只跑一次、不放在上方 for pkg 循环内）：
# 维护约定——将来新增/改动影响体系对外表述的机制（Gate、完成口径、账本字段、通道、验收制度等）时，
# 必须把该机制的对外必现关键词补进下方清单，并同步更新 ORCA治理体系说明.md；否则该机制漏检。
# 母版 1 次即可（两包一致性已由上方白名单保证）。
for kw in "产品验收" "关键 AC" "首次发布" "签收" "不问不报" "detect-client" "window_subagent" "channel_cli" "半套最差" "四类红线" "≤10 行" "Task Manager Qualification" "何时起" "CHANNEL-OK" "产品验收追踪矩阵" "产品审查" "APP 基础能力" "app-theme-i18n"; do
  grep -q "$kw" ORCA治理体系说明.md || { echo "OVERVIEW-STALE: 概览缺 $kw"; fail=1; }
done
# 项目治理完整度：产品验收落盘（2026-10-07 增；**只报不阻塞**，与上方 SYNC 主结论解耦）
# AGENTS.md 红线要求「产品验收未落盘或关键 AC 未测不得报完工」，但此前无任何机器校验点，
# 实测 31 个项目仅 1 个建了矩阵 ⇒ 覆盖率 3%。此处补一个只读巡检口径。
# 识别真实项目：有 docs/model/TASK-MODEL-LOG.jsonl 且不在母版/两包内。
echo "--- 产品验收落盘巡检（只报，不影响 SYNC 主结论） ---"
ACROOT="${AC_SCAN_ROOT:-$HOME/Developer/coding/1.Active}"
ac_missing=0; ac_total=0
for d in "$ACROOT"/*/; do
  [ -d "$d" ] || continue
  [ -f "$d/docs/model/TASK-MODEL-LOG.jsonl" ] || continue
  ac_total=$((ac_total+1))
  m="$d/docs/qa/产品验收追踪矩阵.md"
  if [ ! -f "$m" ]; then
    echo "AC-MATRIX-MISSING: $d"
    ac_missing=$((ac_missing+1))
  elif ! grep -qE '^\| *AC-[0-9]+' "$m"; then
    echo "AC-MATRIX-EMPTY: $m（文件在但无 AC 条目）"
    ac_missing=$((ac_missing+1))
  fi
done
echo "AC-MATRIX: $((ac_total-ac_missing))/$ac_total 有落盘；缺失 $ac_missing"
[ "$fail" -eq 0 ] && echo "SYNC-OK" || echo "SYNC-FAIL"
exit "$fail"
