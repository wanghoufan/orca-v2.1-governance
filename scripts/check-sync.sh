#!/bin/bash
# check-sync.sh｜母版↔两包同步校验（替代 HANDOFF 人工计数）
# 用法：在母版根执行 `bash scripts/check-sync.sh`，exit 0 即过。
# 归一化比对（2026-10-05，替代旧"数 marker"白名单）：
#   AGENTS.md 与 scripts/orchestration/README.md 的两处差异是**布局裸名差**（docs/prompts/xxx ↔ xxx）。
#   旧做法只数 diff 行数＝2 就放行，导致那两行的内容本身写错也照样 SYNC-OK（已实证可绕过）。
#   现做法：先把母版侧的 docs/prompts/ 归一化成裸名，再逐字节比对；任何内容差都会 DIFF 并 fail。
# 预期差白名单：无（归一化后应为零差异）。
set -u
# ============ 体积闸 / 入口闸（2026-10-27）============
# 背景：AGENTS.md 被客户端每会话自动加载，HANDOFF 与经验条目是开工必读。
# 三者一旦无限增长，等于把「读全量规则」的成本又加回来。
# 做法：给常驻位设硬上限；事实/风险/踩坑各自独立位，超限先迁移再精简。
# 项目侧只报 WARN，不阻塞（存量项目口径由各项目自决）。
HANDOFF_MAX_LINES=100
HANDOFF_MAX_BYTES=8192
LESSONS_MAX_BYTES=8192
FACTS_MAX_LINES=150
FACTS_MAX_BYTES=10240
RISKS_MAX_LINES=100
RISKS_MAX_BYTES=8192
PITFALL_MAX_LINES=200
PITFALL_MAX_BYTES=12288
ROUTE_MARKER='入口路由（全体系唯一）'
LEGACY_RE='读盘顺序|读取顺序|开工读盘|恢复读盘|read order|reading order'
ROUTE_FILES="AGENTS.md README.md README.en.md ORCA治理体系说明.md 经验一句话.md docs/prompts/编排者提示词.md docs/handoff/HANDOFF.md docs/handoff/HANDOFF.template.md"
gate_rc=0
gate_bad() { if [ "${1:-fail}" = "warn" ]; then :; else gate_rc=1; fi; }
size_one() { # root label rel maxlines|- maxbytes mode
  local root="$1" label="$2" rel="$3" maxl="$4" maxb="$5" mode="${6:-fail}"
  local f="$root/$rel" l b
  if [ ! -f "$f" ]; then echo "${label}-MISSING: $rel"; gate_bad "$mode"; return 0; fi
  l=$(awk 'END{print NR}' "$f")
  b=$(wc -c < "$f" | tr -d ' ')
  if [ "$maxl" != "-" ] && [ "$l" -gt "$maxl" ]; then
    echo "${label}: $rel ${l} 行 > 上限 ${maxl}（先迁移再精简）"; gate_bad "$mode"
  fi
  if [ "$b" -gt "$maxb" ]; then
    echo "${label}: $rel ${b} 字节 > 上限 ${maxb}（先迁移再精简）"; gate_bad "$mode"
  fi
}
entry_gate() { # root mode
  local root="$1" mode="${2:-fail}" m c f
  if [ ! -f "$root/AGENTS.md" ]; then echo "ENTRY-DUP-MISSING: AGENTS.md"; gate_bad "$mode"; return 0; fi
  m=$(grep -cF "$ROUTE_MARKER" "$root/AGENTS.md" 2>/dev/null || true)
  if [ "$m" != "1" ]; then echo "ENTRY-DUP: AGENTS.md 标记「${ROUTE_MARKER}」出现 ${m} 次（应为 1）"; gate_bad "$mode"; fi
  for f in $ROUTE_FILES; do
    # 提示词在母版是 docs/prompts/、在项目/包里是根级裸名 ⇒ 两种布局都认
    if [ "$f" = "docs/prompts/编排者提示词.md" ] && [ ! -f "$root/$f" ] && [ -f "$root/编排者提示词.md" ]; then f="编排者提示词.md"; fi
    if [ ! -f "$root/$f" ]; then echo "ENTRY-DUP-MISSING: $f"; gate_bad "$mode"; continue; fi
    c=$(grep -Ec "$LEGACY_RE" "$root/$f" 2>/dev/null || true)
    if [ "${c:-0}" != "0" ]; then echo "ENTRY-LEGACY: $f 仍有旧读盘顺序表述 ${c} 行（唯一真源应为 AGENTS.md 入口路由）"; gate_bad "$mode"; fi
  done
}
self_test_size() { # dir：对给定目录跑一遍与母版相同的体积闸/入口闸
  local d="$1"
  gate_rc=0
  size_one "$d" "HANDOFF-SIZE" "docs/handoff/HANDOFF.md" "$HANDOFF_MAX_LINES" "$HANDOFF_MAX_BYTES" fail
  size_one "$d" "LESSONS-SIZE" "经验一句话.md" - "$LESSONS_MAX_BYTES" fail
  size_one "$d" "FACTS-SIZE" "docs/architecture-facts.md" "$FACTS_MAX_LINES" "$FACTS_MAX_BYTES" fail
  size_one "$d" "RISKS-SIZE" "docs/risks.md" "$RISKS_MAX_LINES" "$RISKS_MAX_BYTES" fail
  size_one "$d" "PITFALL-SIZE" "agent.md" "$PITFALL_MAX_LINES" "$PITFALL_MAX_BYTES" fail
  entry_gate "$d" fail
  return "$gate_rc"
}
if [ "${1:-}" = "--self-test-size" ]; then
  self_test_size "${2:-.}"
  exit $?
fi
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
# AGENTS.md 体积闸（2026-10-22 新增）：
# 背景：AGENTS.md 会被**每个会话自动加载**（客户端把它当系统规则读）。2026-10-22 实测
# 母版 AGENTS.md 3.3 万字 ≈ 2 万 tokens —— 治理细则把干活的上下文挤掉了。
# 处置：AGENTS.md 只留「红线 + 索引」（现 6 千字），细则下沉到 docs/sop/governance-*.md。
# 体积回涨 ⇒ 细则又被塞回总纲 ⇒ 直接判失败，防止旧问题复发。
AGENTS_MAX_CHARS=12000
agents_chars=$(wc -m < AGENTS.md | tr -d ' ')
if [ "$agents_chars" -gt "$AGENTS_MAX_CHARS" ]; then
  echo "AGENTS-SIZE: ${agents_chars} 字 > 上限 ${AGENTS_MAX_CHARS}（细则请下沉到 docs/sop/governance-*.md，勿塞回总纲）"; fail=1
fi
echo "AGENTS-SIZE: ${agents_chars} 字（上限 ${AGENTS_MAX_CHARS}）"
# 常驻位体积闸 + 入口路由唯一性（2026-10-27）
gate_rc=0
size_one "." "HANDOFF-SIZE-LINES" "docs/handoff/HANDOFF.md" "$HANDOFF_MAX_LINES" "$HANDOFF_MAX_BYTES" fail
size_one "." "LESSONS-SIZE" "经验一句话.md" - "$LESSONS_MAX_BYTES" fail
size_one "." "FACTS-SIZE" "docs/architecture-facts.md" "$FACTS_MAX_LINES" "$FACTS_MAX_BYTES" fail
size_one "." "RISKS-SIZE" "docs/risks.md" "$RISKS_MAX_LINES" "$RISKS_MAX_BYTES" fail
size_one "." "PITFALL-SIZE" "agent.md" "$PITFALL_MAX_LINES" "$PITFALL_MAX_BYTES" fail
if [ -f "docs/handoff/体系管家-HANDOFF.md" ]; then
  size_one "." "STEWARD-SIZE" "docs/handoff/体系管家-HANDOFF.md" "$HANDOFF_MAX_LINES" "$HANDOFF_MAX_BYTES" fail
fi
entry_gate "." fail
[ "$gate_rc" = "0" ] || fail=1
for pkg in "新项目模板包" "老项目迁移模板包"; do
  # AGENTS.md：归一化 docs/prompts/ 裸名后逐字节比对（不接受"只数行数"的白名单）
  norm_a=$(mktemp); norm_md AGENTS.md > "$norm_a"
  if ! cmp -s "$norm_a" "$pkg/AGENTS.md"; then
    echo "AGENTS 非预期差: $pkg"; diff "$norm_a" "$pkg/AGENTS.md" | grep "^[<>]" | head -5; fail=1
  fi
  rm -f "$norm_a"
  check USER_MODEL_OVERRIDE.md "$pkg/USER_MODEL_OVERRIDE.md"
  # 2026-10-22：AGENTS 瘦身下沉后，docs/sop/governance-*.md 内含 docs/prompts/ 路径引用，
  # 包内是裸名 ⇒ 需归一化后比对（与 AGENTS/README 同口径）。docs/assets 是二进制，走逐字节 check。
  for f in docs/roles/*.md docs/sop/*.md; do check_norm "$f" "$pkg/$f"; done
  for f in docs/assets/*; do check "$f" "$pkg/$f"; done
  for f in docs/pm/PLAN.template.md docs/pm/PRODUCT_PLAN.template.md \
           docs/plan/后续开发计划.template.md \
           docs/qa/BUGS.template.md docs/qa/产品验收追踪矩阵.template.md \
           docs/review/CODE_REVIEW.template.md \
           docs/review/RESEARCH_REVIEW.template.md docs/review/PRODUCT_BACKLOG.template.md \
           docs/handoff/HANDOFF.template.md docs/handoff/EXT-WORKLOG.template.md \
           docs/architecture-facts.template.md docs/risks.template.md \
           docs/history/经验-归档-2026-10-27.md \
           docs/model/TASK-MODEL-LOG.jsonl docs/model/DISPATCH-LOG.jsonl \
           docs/model/TASK-MANAGER-QUALIFICATION.md docs/model/TASK-MANAGER-QUALIFICATION-EVENTS.jsonl \
           docs/model/JEV-DECISION-LOG.jsonl \
           scripts/model/tm-qualification.mjs scripts/model/tm-qualification.test.mjs \
            scripts/model/prototype-gate.test.mjs \
            scripts/model/ui-leak.mjs scripts/model/ui-leak.test.mjs \
           scripts/model/delivery-unit.test.mjs scripts/model/continuous-push.test.mjs \
           经验一句话.md; do
    check "$f" "$pkg/$f"
  done
  check "docs/templates/归位表.template.md" "$pkg/归位表.template.md" # 包根平铺布局
  check_norm "README.md" "$pkg/README.md"
  check "scripts/detect-client.sh" "$pkg/scripts/detect-client.sh"
  check "scripts/check-channel-preflight.sh" "$pkg/scripts/check-channel-preflight.sh"  # 2026-10-08 补纳管
  for f in scripts/check-product-review.sh scripts/check-dispatch-output.sh scripts/install-governance-hooks.sh scripts/pre-commit-guard.sh scripts/orca-gitignore.sh \
           scripts/orca-public-guard.sh scripts/orca-public-ignore.txt scripts/restore-framework.sh scripts/run-gates.sh \
           scripts/migration-status.sh scripts/_inject-agents-block.py; do
    check "$f" "$pkg/$f"   # 2026-10-17：AGENTS/概览硬引用却只在母版 ⇒ 新项目必然 no such file
  done
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
  # 回归夹具整树比对（2026-10-09 修 P1-2）：原只验 proto-gate，nav-gate/tm-qual 漂移无卡点。
  # 夹具被改＝测试失去意义，故按整树卡。
  # evidence/ 只在母版（隔离证据含本机绝对路径与随机临时目录名，不随包分发，见 _sync-packages.py TREE_EXCLUDE）
  if ! diff -rq --exclude=.DS_Store scripts/model/fixtures "$pkg/scripts/model/fixtures" >/dev/null 2>&1; then
    echo "DIFFDIR: scripts/model/fixtures vs $pkg"; fail=1
  fi
  # scripts/model 其余文件整树比对（2026-10-14 洁癖补）：原先只逐个列了 check-ledger.mjs，
  # 其余**测试脚本**（solo-agent.test.mjs / ledger-fields.test.mjs / ui-leak.* 等）
  # 与 NEXT-TASKS.md / TASK-MANAGER-QUALIFICATION.md 都没进比对范围 ⇒ 包内漂移无卡点。
  # 这里按整树卡；幽灵（包有母版无）由下方 GHOST 检查兜住。
  if ! diff -rq --exclude=fixtures --exclude=.DS_Store scripts/model "$pkg/scripts/model" >/dev/null 2>&1; then
    echo "DIFFDIR: scripts/model vs $pkg"
    diff -rq --exclude=fixtures --exclude=.DS_Store scripts/model "$pkg/scripts/model" | head -5
    fail=1
  fi
  if [ "$pkg" = "老项目迁移模板包" ]; then check_norm "docs/prompts/迁移整理提示词.md" "$pkg/迁移整理提示词.md"; fi # 迁移提示词仅老包有（根平铺）
  for f in scripts/decision/orca-decide.mjs scripts/decision/run-shadow.mjs scripts/decision/test-filter.mjs scripts/decision/test-mock.mjs scripts/decision/test-slow.mjs scripts/decision/test-partition.mjs scripts/decision/partition-validate.mjs scripts/decision/test-secrets.mjs scripts/decision/build-index.mjs scripts/decision/partition-validate.mjs scripts/decision/test-slow.mjs scripts/decision/test-partition.mjs scripts/decision/partition-validate.mjs scripts/decision/test-secrets.mjs scripts/decision/build-index.mjs scripts/decision/test-slow.mjs scripts/decision/test-partition.mjs scripts/decision/partition-validate.mjs scripts/decision/policy.json scripts/decision/package.json scripts/decision/package-lock.json scripts/decision/README.md scripts/decision/evals/skill-manifest.json scripts/decision/evals/glm-exact-smoke.log scripts/decision/evals/slow-test.log scripts/model/check-ledger.mjs scripts/decision/fixtures/T01.json scripts/decision/fixtures/T02.json scripts/decision/fixtures/T03.json scripts/decision/fixtures/T04.json scripts/decision/fixtures/T05.json scripts/decision/fixtures/T06.json scripts/decision/fixtures/T07.json scripts/decision/fixtures/T08.json scripts/decision/fixtures/T09.json scripts/decision/fixtures/T10.json scripts/decision/fixtures/S01.json scripts/decision/fixtures/S02.json scripts/decision/fixtures/S03.json scripts/decision/fixtures/S04.json scripts/decision/fixtures/S05.json scripts/decision/fixtures/S06.json scripts/decision/fixtures/S07.json scripts/decision/fixtures/S08.json scripts/decision/fixtures/X01.json scripts/decision/fixtures/X02.json scripts/decision/fixtures/F01.json scripts/decision/fixtures/F02.json scripts/decision/fixtures/F03.json scripts/decision/fixtures/F04.json scripts/decision/fixtures/P01.json scripts/decision/fixtures/P02.json scripts/decision/fixtures/P03.json scripts/decision/fixtures/P04.json scripts/decision/fixtures/PX1.json scripts/decision/fixtures/PV_GOOD.json scripts/decision/fixtures/PV_BAD.json; do check "$f" "$pkg/$f"; done
  if ! diff -rq --exclude=node_modules --exclude=.DS_Store scripts/decision "$pkg/scripts/decision" >/dev/null 2>&1; then echo "DIFFDIR: scripts/decision vs $pkg"; diff -rq --exclude=node_modules --exclude=.DS_Store scripts/decision "$pkg/scripts/decision" | head -5; fail=1; fi
  # 幽灵文件检测（2026-10-14 洁癖新增）：包里有、**母版没有**的文件 = 退役残留。
  # 背景：_sync-packages.py 长期「只增不减」，母版删掉的 ledger-evidence.mjs /
  # ledger-stock-scan.mjs 在包里活了下来；老项目同步脚本按包枚举 ⇒ 死文件被铺进
  # 全部 36 个项目。check-sync 原来只查「母版有而包没有/不一致」，**查不出反向的
  # 多余文件**，所以这个污染一路绿灯通过。必须补反向检查，否则删除永远传不下去。
  # 注意：不要用 cd 子 shell（会带偏后续相对路径）；用绝对路径判断。
  ghosts=""
  for d in docs/roles docs/sop scripts/model docs/model; do
    [ -d "$pkg/$d" ] || continue
    for f in "$pkg/$d"/*; do
      [ -f "$f" ] || continue
      rel="${f#$pkg/}"
      [ -e "$rel" ] || ghosts="$ghosts$rel
"
    done
  done
  if [ -n "$ghosts" ]; then
    echo "GHOST(母版已删、包内残留，会被铺进项目): $pkg"; echo "$ghosts" | sed 's/^/  /'
    fail=1
  fi
done
# 预期差确认：归一化后两包与母版应零差异；非零即 fail（不再只 echo）
echo "--- 归一化后预期差（应为 0） ---"
# README.en.md（2026-10-08 增）：此前不在比对范围，英文导航无限漂移且两包英文链接是死链
for f in AGENTS.md README.en.md scripts/orchestration/README.md; do
  case "$f" in
    README.en.md) src=$(mktemp); sed 's#docs/prompts/编排者提示词#编排者提示词#g; s#docs/prompts/Orca 编排治理监督者提示词#Orca 编排治理监督者提示词#g; s#docs/prompts/Orca 通用编排者持续推进协议#Orca 通用编排者持续推进协议#g; s#docs/templates/归位表.template#归位表.template#g' "$f" > "$src";;
    AGENTS.md) src=$(mktemp); sed 's#docs/prompts/编排者提示词#编排者提示词#g; s#docs/prompts/Orca 编排治理监督者提示词#Orca 编排治理监督者提示词#g; s#docs/prompts/Orca 通用编排者持续推进协议#Orca 通用编排者持续推进协议#g' "$f" > "$src";;
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
for kw in "产品验收" "关键 AC" "首次发布" "签收" "不问不报" "detect-client" "window_subagent" "channel_cli" "半套最差" "四类红线" "≤10 行" "Task Manager Qualification" "何时起" "CHANNEL-OK" "产品验收追踪矩阵" "产品审查" "APP 基础能力" "app-theme-i18n" "APP-BASELINE" "background-services" "品牌资产" "app-brand-assets" "app-navigation" "底部导航" "NavigationBar" "同一核心页面" "CHANGELOG" "app-ui-layers" "信息分层" "app-simplicity" "产品简化门槛" "DEPENDENCY-MISSING" "DEPENDENCY-STALE" "你是主开发者" "你是唯一开发者" "体系管家"; do
  grep -q "$kw" ORCA治理体系说明.md || { echo "OVERVIEW-STALE: 概览缺 $kw"; fail=1; }
done
# 2026-10-14 体系自查补：上列关键词只覆盖旧机制，本轮新增的账本/证据/跨目录机制
# **一个都不在清单里** ⇒ 概览漏更新也照样 OVERVIEW-OK 通过（这是个漏卡点）。
# 措辞用「概览里的原文写法」做锚，避免同义词对不上造成永久误报。
for kw in "一路推到底" "连续推进" "交付单元" "你是主开发者" "主开发者" "子代理" "执行层" "判定层" "check-dispatch-output" "additive-only" "heartbeat" "心跳" "GOVERNANCE-SCRIPTS" "ROLE-COVERAGE" "LEDGER-XREF" "双阈值" "可并发" "免派工"  "codebuddy" "429" "自动切账号" "elapsed_sec" "model-perf" "ACCEPTED-MISSING" "SIGNOFF-MISSING" "pre-commit" "check-product-review" "编排者自做" "neat-freak" "governance-dispatch" "细则下沉" "入口路由" "HANDOFF-SIZE" "ENTRY-DUP" "architecture-facts" "docs/risks.md" "8192"; do
  grep -q -- "$kw" ORCA治理体系说明.md || { echo "OVERVIEW-STALE: 概览缺 $kw"; fail=1; }
done
for kw in "派工逐派不漏记" "supersedes" "有效拦截" "违规分级" "未测不按满分算" "响应速度只认时间戳" "原始输入留存" "--auto" "取消历史豁免" "升级触发机器校验"; do
  grep -q -- "$kw" ORCA治理体系说明.md || { echo "OVERVIEW-STALE: 概览缺 $kw"; fail=1; }
done
# 项目治理完整度：产品验收落盘（2026-10-07 增；**只报不阻塞**，与上方 SYNC 主结论解耦）
# AGENTS.md 红线要求「产品验收未落盘或关键 AC 未测不得报完工」，但此前无任何机器校验点，
# 实测 31 个项目仅 1 个建了矩阵 ⇒ 覆盖率 3%。此处补一个只读巡检口径。
# 识别真实项目：有 docs/model/TASK-MODEL-LOG.jsonl 且不在母版/两包内。
# ACROOT 探测（2026-10-27 体系自查 P1 修）：原写法写死 $HOME/.../1.Active，
# 换机后目录不存在时 ac_total=0，输出「0/0 有落盘」看似健康、实为静默失效。
# 现按 环境变量 → 母版根相对位置 → 本机惯例 逐级探测，取不到时四项巡检整体跳过并明示。
if [ -n "${AC_SCAN_ROOT:-}" ]; then ACROOT="$AC_SCAN_ROOT"
elif [ -d "../../1.Active" ]; then ACROOT="$(cd ../../1.Active && pwd)"
elif [ -d "$HOME/Developer/coding/1.Active" ]; then ACROOT="$HOME/Developer/coding/1.Active"
else ACROOT=""; fi
if [ -d "${ACROOT:-/nonexistent-orca-acroot}" ]; then
echo "AC-ROOT: $ACROOT"
echo "--- 产品验收落盘巡检（只报，不影响 SYNC 主结论；强制卡点在项目侧 check-ledger） ---"
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
    echo "AC-MATRIX-EMPTY: ${m}（文件在但无 AC 条目）"
    ac_missing=$((ac_missing+1))
  fi
done
echo "AC-MATRIX: $((ac_total-ac_missing))/$ac_total 有落盘；缺失 $ac_missing"
# 项目侧常驻位体积巡检（2026-10-27；**只报不阻塞**）
# 存量项目 HB 可能很大；这里只提示「该迁移了」，判定与处置由各项目自决。
hb_warn=0
for d in "$ACROOT"/*/; do
  [ -d "$d" ] || continue
  [ -f "$d/docs/model/TASK-MODEL-LOG.jsonl" ] || continue
  h="$d/docs/handoff/HANDOFF.md"
  [ -f "$h" ] || continue
  hl=$(awk 'END{print NR}' "$h"); hb=$(wc -c < "$h" | tr -d ' ')
  if [ "$hl" -gt "$HANDOFF_MAX_LINES" ] || [ "$hb" -gt "$HANDOFF_MAX_BYTES" ]; then
    echo "HANDOFF-SIZE-WARN: $d ${hl} 行 / ${hb} 字节（建议 ≤${HANDOFF_MAX_LINES} 行 / ≤${HANDOFF_MAX_BYTES} 字节，先迁移再精简）"
    hb_warn=$((hb_warn+1))
  fi
  ls="$d/经验一句话.md"
  if [ -f "$ls" ]; then
    lb=$(wc -c < "$ls" | tr -d ' ')
    if [ "$lb" -gt "$LESSONS_MAX_BYTES" ]; then echo "LESSONS-SIZE-WARN: $d ${lb} 字节（建议 ≤${LESSONS_MAX_BYTES}，先归档再精简）"; hb_warn=$((hb_warn+1)); fi
  fi
done
echo "HANDOFF-SIZE-WARN 计数: ${hb_warn}（只报，不影响 SYNC 主结论）"

# 角色覆盖巡检（2026-10-17 G11 补；**只报不阻塞**）：
# 背景：schema 对 11 个角色全开放，但**没有任何门保证都真被记** —— db-admin 至今零记录，
# supervisor(54样本/仅1种模型) 与 product-reviewer(86%单一模型) 无对照数据，
# 「按能力换模型」因此缺依据。此处只提示覆盖缺口，不新增 Gate、不改判定。
# 治理脚本齐备巡检（2026-10-17；**只报不阻塞**）：
# 背景：项目编排者实测发现「codebuddy-auto.sh 只在母版仓存在、某项目 software/scripts/ 里没有」，
# 换机或断软链就失效；更普遍的是已铺项目可能缺 check-product-review / pre-commit-guard 等
# AGENTS 硬引用的脚本 ⇒ 照规则执行必然 no such file。
# 为什么不阻塞：做成 SYNC-OK 阻塞＝母版门禁被**别人项目**的状态绑架，且治理侧无权代改他人项目。
# 与产品验收巡检同惯例：报出来，由各项目自己补。
echo "--- 治理脚本齐备巡检（只报，不影响 SYNC 主结论） ---"
gov_ok=0; gov_bad=0
for d in "$ACROOT"/*/; do
  [ -d "$d" ] || continue
  base="$(basename "$d")"
  case "$base" in 0-*|999-*|临时备份*) continue ;; esac      # 治理根与索引类目录不是项目
  # 治理根：项目根，或下一层里唯一含 AGENTS.md 的目录（043 这类 software/ 内治理）
  g="${d%/}"
  if [ ! -f "$d/AGENTS.md" ]; then
    hit=""; multi=0
    for sub in "${d%/}"/*/; do
      [ -f "$sub/AGENTS.md" ] || continue
      if [ -z "$hit" ]; then hit="${sub%/}"; else multi=1; fi
    done
    [ "$multi" = "1" ] && continue
    [ -n "$hit" ] || continue
    g="$hit"
  fi
  # 只认**确实铺过治理包**的项目（有角色卡目录），否则会把一堆普通目录算成缺失
  [ -d "$g/docs/roles" ] || [ -f "$g/docs/model/TASK-MODEL-LOG.jsonl" ] || continue
  miss=""
  for need in scripts/check-product-review.sh scripts/check-dispatch-output.sh scripts/pre-commit-guard.sh scripts/codebuddy-auto.sh scripts/orca-gitignore.sh; do
    [ -f "$g/$need" ] || miss="$miss $(basename "$need")"
  done
  if [ -z "$miss" ]; then gov_ok=$((gov_ok+1)); else
    gov_bad=$((gov_bad+1))
    echo "GOVERNANCE-SCRIPTS-MISSING: $base 缺:${miss}"
  fi
done
echo "GOVERNANCE-SCRIPTS: ${gov_ok} ok / $((gov_ok+gov_bad)) synced-projects (missing=${gov_bad}, report-only)"

echo "--- 角色账本覆盖巡检（只报，不影响 SYNC 主结论） ---"
for d in "$ACROOT"/*/; do
  [ -d "$d" ] || continue
  lg=""
  for cand in "$d/docs/model/TASK-MODEL-LOG.jsonl" "$d"/software/docs/model/TASK-MODEL-LOG.jsonl; do
    [ -f "$cand" ] && { lg="$cand"; break; }
  done
  [ -n "$lg" ] || continue
  roles="$(grep -o '"role"[[:space:]]*:[[:space:]]*"[^"]*"' "$lg" 2>/dev/null | sed 's/.*: *"//; s/"//' | sort -u | tr '\n' ' ')"
  [ -n "$roles" ] || continue
  # 分组判定（2026-10-27 体系自查 P1 修）：原实现不分执行方式，主开发者模式的
  # 合规项目（010/011 等）被批量报 missing，噪音掩盖真问题；角色清单也与 8 角色口径不一致。
  gsf="$d/docs/model/GOVERNANCE-STATE.json"
  _mode=""; _phase=""
  if [ -f "$gsf" ]; then
    _mode=$(grep -o '"execution_mode"[[:space:]]*:[[:space:]]*"[^"]*"' "$gsf" 2>/dev/null | head -1 | sed 's/.*: *"//; s/"//')
    _phase=$(grep -o '"project_phase_field"[[:space:]]*:[[:space:]]*"[^"]*"' "$gsf" 2>/dev/null | head -1 | sed 's/.*: *"//; s/"//')
  fi
  if [ "$_mode" = "solo" ]; then continue; fi   # 主开发者模式：不派角色链，合规
  need="builder code-reviewer qa supervisor"
  case "$_phase" in
    PLAN|WAITING_HUMAN_APPROVAL|PLAN_REOPEN_REQUIRED|ABSENT) need="planner product-reviewer task-manager" ;;
  esac
  miss=""
  for req in $need; do
    case " $roles " in *" $req "*) ;; *) miss="$miss $req";; esac
  done
  if [ -n "$miss" ]; then
    echo "ROLE-COVERAGE: $(basename "$d") missing:${miss} (has:${roles})"
  fi
done
else
  echo "AC-SKIP: 未找到活跃项目根（设置 AC_SCAN_ROOT 后重跑）；产品验收/体积/脚本/角色四项巡检未执行"
fi
[ "$fail" -eq 0 ] && echo "SYNC-OK" || echo "SYNC-FAIL"
exit "$fail"
