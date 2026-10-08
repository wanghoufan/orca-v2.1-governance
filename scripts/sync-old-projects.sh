#!/bin/bash
# sync-old-projects.sh｜把母版最新治理规则批量铺到所有老项目（备份不覆盖铁律）
# 用法：在母版根执行 `bash scripts/sync-old-projects.sh`（先加 --dry-run 预演）
# 配套：scripts/migration-status.sh（查全表状态）
#
# 铁律（与《迁移整理提示词》一致）：
#   1) 不删、不静默覆盖：目标文件与母版不同 → 先把原文件改名为「原名.旧版-YYYY-MM-DD」留同级
#   2) 账本内容零改动（实绩历史）：只确保 docs/model/ 两本账存在，不铺、不改内容
#   3) AGENTS.md 特殊：若项目版与老包版不同（含项目专属规矩）→ 不覆盖，只改名留档并标记
#      「需人工合并」，避免抹掉项目自己的规矩
#   4) 概览 ORCA治理体系说明.md 不铺：老项目没有两包概念，概览无对外用途（母版才需要）
set -u
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PROJECTS_ROOT="${PROJECTS_ROOT:-/Users/zzymima0000/Developer/coding/1.Active}"
PKG="$ROOT/老项目迁移模板包"
# 跳过清单（2026-10-08 新增）：逗号分隔的项目名，照原样跳过。
#   SKIP_LIST="a,b"    —— 显式跳过指定项目
#   SKIP_DEV_TODAY=1   —— 自动跳过「今天(当天)有 commit」的项目（用户口径：今天有 commit 就算在开发，不动）
SKIP_LIST="${SKIP_LIST:-}"
SKIP_DEV_TODAY="${SKIP_DEV_TODAY:-0}"
TODAY="$(date +%F)"
STAMP="${STAMP:-2026-10-08}"
RULES_VERSION="2026-10-08-APP基础能力"
DRY_RUN="${1:-}"
BLOCK_BEGIN="<!-- ORCA-RULES-BLOCK:BEGIN -->"
export BLOCK_BEGIN

# 要铺的文件（相对路径）——全部来自老项目迁移模板包，保证两包一致性由 check-sync 兜底
FILES="
AGENTS.md
经验一句话.md
docs/roles/builder.md
docs/roles/code-reviewer.md
docs/roles/db-admin.md
docs/roles/experience-recorder.md
docs/roles/neat-freak.md
docs/roles/planner.md
docs/roles/product-reviewer.md
docs/roles/qa.md
docs/roles/senior-expert.md
docs/roles/supervisor.md
docs/roles/task-manager.md
docs/sop/android-machine-profile.md
docs/sop/android.md
docs/sop/app-theme-i18n.md
docs/sop/decision-router.md
docs/sop/docker.md
docs/sop/sqlite.md
docs/sop/supabase.md
docs/sop/webqa.md
docs/pm/PLAN.template.md
docs/pm/PRODUCT_PLAN.template.md
docs/qa/BUGS.template.md
docs/qa/产品验收追踪矩阵.template.md
docs/review/CODE_REVIEW.template.md
docs/review/PRODUCT_BACKLOG.template.md
docs/review/RESEARCH_REVIEW.template.md
docs/handoff/HANDOFF.template.md
docs/handoff/EXT-WORKLOG.template.md
scripts/model/check-ledger.mjs
scripts/model/tm-qualification.mjs
scripts/model/tm-qualification.test.mjs
scripts/detect-client.sh
scripts/check-channel-preflight.sh
docs/sop/background-services.md
GOVERNANCE_VERSION
Orca 编排治理监督者提示词.md
Orca 通用编排者持续推进协议.md
归位表.template.md
编排者提示词.md
外部开发者提示词.md
"

[ -d "$PKG" ] || { echo "FATAL: 找不到老包 $PKG"; exit 1; }
[ -d "$PROJECTS_ROOT" ] || { echo "FATAL: 找不到项目根 $PROJECTS_ROOT"; exit 1; }

backed=0; copied=0; skipped=0; needmerge=0; agentinj=0; nproj=0
nskip=0

for dir in "$PROJECTS_ROOT"/*/; do
  d="${dir%/}"; name="$(basename "$d")"
  case "$name" in 0-规则与索引|999-*|临时备份*|0-*) continue;; esac
  if [ -n "$SKIP_LIST" ]; then
    case ",$SKIP_LIST," in *",$name,"*) echo "SKIP(清单): $name"; continue;; esac
  fi
  if [ "$SKIP_DEV_TODAY" = "1" ] && [ -d "$d/.git" ]; then
    lastc="$(git -C "$d" log -1 --format=%cd --date=short 2>/dev/null)"
    if [ "$lastc" = "$TODAY" ]; then echo "SKIP(今天有commit=$lastc): $name"; nskip=$((nskip+1)); continue; fi
  fi
  # 治理根：根 AGENTS.md；否则向下一层找唯一含 ORCA-RULES-BLOCK 的子目录（2026-10-05，救 043 这类 software/ 内治理）
  govroot="$d"
  if [ ! -f "$d/AGENTS.md" ]; then
    hit=""
    d="$d/"   # 保证 glob 逐层展开（"$d"*/ 在无尾斜杠时只匹配自身）
    for sub in "$d"*/; do
      [ -f "$sub/AGENTS.md" ] || continue
      grep -q "$BLOCK_BEGIN" "$sub/AGENTS.md" 2>/dev/null && { [ -z "$hit" ] && hit="${sub%/}" || hit="__multi__"; }
    done
    case "$hit" in
      "") continue ;;                                  # 还没有治理文件的仓不在本轮范围
      __multi__) echo "WARN 治理根多候选，跳过: $name"; continue ;;
      *) govroot="${hit%/}" ;;
    esac
  fi
  nproj=$((nproj+1))

  # AGENTS.md：全部项目都含专属规矩 → 不整份替换，改为**顶部注入带标记的增量区块**（不删任何原有行）
  # 已注入过则原地更新区块内容（幂等），未注入则插到标题首行之后
  agents_injected=0
  if [ -f "$govroot/AGENTS.md" ]; then
    if grep -q "$BLOCK_BEGIN" "$govroot/AGENTS.md" 2>/dev/null; then
      agents_injected=1
    fi
  fi

  # 用 while read 而非 for（条目含空格，如 "Orca 编排治理监督者提示词.md"）
  while IFS= read -r f; do
    [ -n "$f" ] || continue
    src="$PKG/$f"
    [ -f "$src" ] || continue
    dst="$govroot/$f"
    if [ "$f" = "AGENTS.md" ]; then
      if [ "$agents_injected" = "1" ]; then
        if [ -z "$DRY_RUN" ]; then
          python3 "$ROOT/scripts/_inject-agents-block.py" "$dst" "$STAMP" "$RULES_VERSION"
        fi
        skipped=$((skipped+1)); continue
      fi
      # 未注入：先备份整份，再注入区块（只增不删）
      if [ -z "$DRY_RUN" ]; then
        [ -f "$dst.旧版-$STAMP" ] || cp "$dst" "$dst.旧版-$STAMP"
        python3 "$ROOT/scripts/_inject-agents-block.py" "$dst" "$STAMP" "$RULES_VERSION"
      fi
      backed=$((backed+1)); copied=$((copied+1)); agentinj=$((agentinj+1)); needmerge=$((needmerge+1))
      continue
    fi
    # 包根平铺文件 -> 项目落位（归位表入 docs/templates/；两份 Orca 协议提示词入 docs/prompts/）
    case "$f" in
      归位表.template.md) dst="$govroot/docs/templates/$f" ;;
      Orca*.md) dst="$govroot/docs/prompts/$f" ;;
    esac
    if [ -f "$dst" ] && diff -q "$src" "$dst" >/dev/null 2>&1; then
      skipped=$((skipped+1)); continue
    fi
    if [ -f "$dst" ]; then
      if [ ! -f "$dst.旧版-$STAMP" ]; then
        if [ -z "$DRY_RUN" ]; then cp "$dst" "$dst.旧版-$STAMP"; fi
        backed=$((backed+1))
      fi
    fi
    if [ -z "$DRY_RUN" ]; then mkdir -p "$(dirname "$dst")"; cp "$src" "$dst"; fi
    copied=$((copied+1))
  done < <(printf '%s\n' "$FILES")

  # 账本：只确保存在，内容零改动
  if [ -z "$DRY_RUN" ]; then mkdir -p "$govroot/docs/model"
    for lg in TASK-MODEL-LOG.jsonl DISPATCH-LOG.jsonl; do
      [ -f "$govroot/docs/model/$lg" ] || printf '%s\n' '{"_example":true,"note":"模板示例行，不参与统计，首个真实任务前删除"}' > "$d/docs/model/$lg"
    done
    # 统一状态标记（可机读，供 migration-status.sh 汇总）
    ph="UNKNOWN"
    [ -f "$govroot/docs/handoff/HANDOFF.md" ] && ph=$(grep -oE "PROJECT_PHASE[=：: ]+[A-Z_]+" "$govroot/docs/handoff/HANDOFF.md" 2>/dev/null | head -1 | sed 's/.*[=：: ]//')
    [ -z "$ph" ] && ph="ABSENT"
    lgr=0; [ -f "$govroot/docs/model/TASK-MODEL-LOG.jsonl" ] && lgr=$(( $(wc -l < "$govroot/docs/model/TASK-MODEL-LOG.jsonl" | tr -d ' ') - 1 ))
    cat > "$govroot/docs/model/GOVERNANCE-STATE.json" <<EOF
{
  "rules_version": "$RULES_VERSION",
  "synced_at": "$STAMP",
  "project_phase_field": "$ph",
  "task_ledger_rows": $lgr,
  "agents_block_injected": true,
  "product_acceptance_ac_added": false
}
EOF
  fi
done

echo "项目数: $nproj ｜ 新铺: $copied ｜ 备份留档: $backed ｜ 已是新版(跳过): $skipped ｜ AGENTS区块注入: $agentinj"
[ -n "$DRY_RUN" ] && echo "(DRY-RUN：以上为预演，未真正写入)"
exit 0
