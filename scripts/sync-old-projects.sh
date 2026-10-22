#!/bin/bash
# sync-old-projects.sh｜把母版最新治理规则批量铺到所有老项目（备份不覆盖铁律）
# 用法：在母版根执行 `bash scripts/sync-old-projects.sh`（先加 --dry-run 预演）
#
# --additive-only（2026-10-17 新增）：**只补缺失文件，绝不覆盖任何已存在的文件**。
#   为什么需要：原默认会覆盖已有治理文件，而规则是**每轮开工时读的**——
#   正在开发中的项目中途拿到新规则（如「neat-freak 不再派工」）会与它本轮已按旧规则的
#   行为冲突，同一轮里两套口径并存。原先只能用「跳过整个项目」来规避，代价是
#   有未提交业务改动的项目（大概率只是刚跑过、并非正在跑）也一并被跳过，缺 4 份 APP SOP
#   与 8 个治理脚本长期补不上。
#   本模式下写入面＝「该文件此前不存在」，**不产生任何既有文件的改动**，
#   因此可安全用于正在开发中的项目；代价是已存在的旧版本不会被更新到最新。
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
# ONLY_LIST（2026-10-17 补）：**只处理列出的这几个项目**，其余一律不碰。
# 起因：给单个项目（043）的编排者下指令时，只给了 SKIP_LIST 排除项，
# 结果对方跑了批量铺包、把另外 39 个项目一起改了 —— 越权改动他人项目。
# 单项目铺包必须用 ONLY_LIST，不要用「批量 + 排除清单」凑，那等于让一个项目去动别人的仓。
ONLY_LIST="${ONLY_LIST:-}"
# **默认 1（开）** —— 2026-10-12 用户口径：「有项目今天可能正在跑，先别动今天在跑的项目」。
# 原默认 0（关）属「忘了开就出事」的不安全默认值。要铺今天在跑的项目需显式 SKIP_DEV_TODAY=0。
SKIP_DEV_TODAY="${SKIP_DEV_TODAY:-1}"
# 业务文件有未提交改动时是否跳过（默认 1）
SKIP_DIRTY="${SKIP_DIRTY:-1}"
TODAY="$(date +%F)"
STAMP="${STAMP:-2026-10-12}"
RULES_VERSION="${RULES_VERSION:-2026-10-12-单智能体+账本机器校验+证据留存}"
DRY_RUN=""
for a in "$@"; do [ "$a" = "--dry-run" ] && DRY_RUN=1; [ "$a" = "--additive-only" ] && ADDITIVE_ONLY=1; done
ADDITIVE_ONLY="${ADDITIVE_ONLY:-0}"
BLOCK_BEGIN="<!-- ORCA-RULES-BLOCK:BEGIN -->"
export BLOCK_BEGIN

# 要铺的文件（相对路径）——全部来自老项目迁移模板包，保证两包一致性由 check-sync 兜底
FILES="
AGENTS.md
README.md
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
docs/sop/app-brand-assets.md
docs/sop/app-navigation.md
docs/sop/app-ui-layers.md
docs/sop/app-simplicity.md
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
scripts/codebuddy-auto.sh
scripts/check-product-review.sh
scripts/check-dispatch-output.sh
scripts/install-governance-hooks.sh
scripts/pre-commit-guard.sh
scripts/check-sync.sh
scripts/migration-status.sh
scripts/orca-gitignore.sh
scripts/orca-public-guard.sh
scripts/orca-public-ignore.txt
scripts/restore-framework.sh
scripts/_cb-rotate.py
scripts/_cb-active.py
scripts/_cb-count.py
scripts/model/tm-qualification.mjs
scripts/model/tm-qualification.test.mjs
scripts/detect-client.sh
scripts/check-channel-preflight.sh
docs/sop/background-services.md
USER_MODEL_OVERRIDE.md
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
  case "$name" in 0-规则与索引|999-*|临时备份*|0-*) continue;;
  esac
  if [ -n "$ONLY_LIST" ]; then
    case ",$ONLY_LIST," in
      *",$name,"*) : ;;
      *) continue ;;
    esac
  fi
  if [ -n "$SKIP_LIST" ]; then
    case ",$SKIP_LIST," in *",$name,"*) echo "SKIP(清单): $name"; continue;; esac
  fi
  if [ "$SKIP_DEV_TODAY" = "1" ] && [ -d "$d/.git" ]; then
    lastc="$(git -C "$d" log -1 --format=%cd --date=short 2>/dev/null)"
    if [ "$lastc" = "$TODAY" ]; then echo "SKIP(今天有commit=$lastc): $name"; nskip=$((nskip+1)); continue; fi
    # 业务文件有未提交改动 ⇒ 可能正在写代码，铺规则会与之打架 ⇒ 跳过。
    # 纯治理文件未提交**不跳** —— 那通常就是上次铺规则留下的，正好该被这次覆盖。
    # 排除表必须覆盖**全部治理脚本路径**（2026-10-17 实测踩坑）：原先只排除 scripts/model/，
    # 于是 `scripts/_cb-active.py` 这类治理脚本被当成「业务文件有未提交改动」⇒
    # 几乎每个项目都被跳过（实测 36 个里 33 个），整轮铺包等于没跑。
    # 判据必须用「源码扩展名白名单」而非「排除治理路径」的反向写法：
    # 反向写法实测把「经验一句话.md」「agents.md」误判成业务文件 ⇒ 36 个里 33 个被跳过。
    if [ "$SKIP_DIRTY" = "1" ]; then
      dirtybiz="$(git -C "$d" status --porcelain 2>/dev/null | grep -E '\.(ts|tsx|js|jsx|mjs|py|java|kt|swift|go|rs|rb|php|css|scss|html|json|yaml|yml|sql|sh|gradle|xml)$' | grep -vE 'AGENTS|agents|README|经验一句话|编排者|外部开发者|归位表|Orca|GOVERNANCE|CHANGELOG|[Ss]cripts/model/|[Ss]cripts/_cb-|[Ss]cripts/codebuddy-auto|[Ss]cripts/(check|orca|restore|migration|detect|weekly|verify|install|pre-commit|codebuddy)[A-Za-z-]*\.[a-z]+|[Ss]cripts/_[a-z-]+\.(py|sh)|\.project\.yaml|\.arts/' | head -1)"
      if [ -n "$dirtybiz" ]; then
        echo "SKIP(业务文件有未提交改动，可能正在写代码): $name → ${dirtybiz:0:44}"
        nskip=$((nskip+1)); continue
      fi
    fi
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
  # 清单 $FILES 是**手写枚举**，新增文件极易漏铺（2026-10-12 实测：老包 scripts/model
  # 有 11 个文件，枚举里只有 3 个 ⇒ ui-leak/solo-agent/ledger-fields/prototype-gate
  # 与两份 docs/model 文档全部没铺，老项目拿不到新机制）。
  # 现在**从老包实际内容自动枚举**，并把包内存在的 scripts/model 测试一并纳入
  # （测试是机制的回归保护：只铺实现不铺测试，等于老项目出问题无人发现）。
  FILES="$(
    {
      printf '%s\n' "$FILES"
      # 包内 scripts/model 全部纳入（含 .mjs 与夹具树），排除母版本机专属产物
      cd "$PKG" 2>/dev/null && find scripts/model -type f ! -path '*/evidence/*' | sort
      cd "$ROOT" 2>/dev/null || true
      # 包内 docs/model 的规范正文（非 .jsonl）
      cd "$PKG" 2>/dev/null && find docs/model -type f ! -name '*.jsonl' | sort
      cd "$ROOT" 2>/dev/null || true
      # 2026-10-17 G1 补：docs/sop 与治理脚本改为**从老包自动枚举**。
      # 原先只枚举 scripts/model/docs/model，于是新增的 app-* 四份 SOP 与
      # check-product-review / pre-commit-guard / orca-* 等脚本永远漏铺 ——
      # 老项目照 AGENTS 执行必然 no such file，正是「有体系、铺不下去」。
      cd "$PKG" 2>/dev/null && find docs/sop -maxdepth 1 -type f -name '*.md' | sort
      cd "$ROOT" 2>/dev/null || true
      cd "$PKG" 2>/dev/null && find scripts -maxdepth 1 -type f ! -name '_sync-packages.py' ! -name 'weekly-channel-check.sh' | sort
      cd "$ROOT" 2>/dev/null || true
    } | awk 'NF && !seen[$0]++'
  )"
  while IFS= read -r f; do
    [ -n "$f" ] || continue
    src="$PKG/$f"
    [ -f "$src" ] || continue
    dst="$govroot/$f"
    if [ "$f" = "AGENTS.md" ]; then
      # additive-only：**AGENTS 区块也不碰**。否则会出现「新 AGENTS 区块 + 旧角色卡/旧提示词」
      # 这种必然的半套组合 —— 规则之间正是这个模式声称要避免的打架。
      if [ "$ADDITIVE_ONLY" = "1" ]; then
        echo "  [additive-only 跳过] AGENTS.md 注入区块（已存在则不改，防新规则与旧角色卡打架）"
        skipped=$((skipped+1)); continue
      fi
      if [ "$agents_injected" = "1" ]; then
        if [ -z "$DRY_RUN" ]; then
          python3 "$ROOT/scripts/_inject-agents-block.py" "$dst" "$STAMP" "$RULES_VERSION" "$PKG/AGENTS.md"
        fi
        skipped=$((skipped+1)); continue
      fi
      # 未注入：先备份整份，再注入区块（只增不删）
      if [ -z "$DRY_RUN" ]; then
        [ -f "$dst.旧版-$STAMP" ] || cp "$dst" "$dst.旧版-$STAMP"
        python3 "$ROOT/scripts/_inject-agents-block.py" "$dst" "$STAMP" "$RULES_VERSION" "$PKG/AGENTS.md"
      fi
      backed=$((backed+1)); copied=$((copied+1)); agentinj=$((agentinj+1)); needmerge=$((needmerge+1))
      continue
    fi
    # 包根平铺文件 -> 项目落位（归位表入 docs/templates/；两份 Orca 协议提示词入 docs/prompts/）
    case "$f" in
      归位表.template.md) dst="$govroot/docs/templates/$f" ;;
      Orca*.md) dst="$govroot/docs/prompts/$f" ;;
    esac
    # USER_MODEL_OVERRIDE.md：**不拷实文件，落母版软链**（母版规矩：分工表单一真源＝母版，
    # 各项目根表均为软链；拷实文件＝立刻分叉，改表只改得到一份）。
    # 2026-10-17 实测漏洞：FILES 手写枚举里没有它 ⇒ 批量铺包从来没铺过分工表，
    # 18 个已铺项目只有 10 个根目录有，其余 8 个只能靠猜模型 ID。
    if [ "$f" = "USER_MODEL_OVERRIDE.md" ]; then
      tgt="$ROOT/USER_MODEL_OVERRIDE.md"
      if [ ! -f "$tgt" ]; then echo "  ! 母版缺 USER_MODEL_OVERRIDE.md，跳过软链"; continue; fi
      if [ -L "$dst" ] && [ "$(readlink "$dst")" = "$tgt" ]; then
        skipped=$((skipped+1)); continue
      fi
      # additive-only：已存在但不是指向母版的软链（早年的实文件拷贝）也不碰，
      # 避免在正在开发的项目里把它改名+替换 —— 那是一次真实的口径突变。
      if [ "$ADDITIVE_ONLY" = "1" ] && { [ -e "$dst" ] || [ -L "$dst" ]; }; then
        echo "  [additive-only 跳过] $(basename "$dst") 已存在但非母版软链，需人工确认后再换"
        skipped=$((skipped+1)); continue
      fi
      # 已存在但不是指向母版的软链（多为早年的实文件拷贝）→ 备份后改成软链，禁静默删
      if [ -e "$dst" ] || [ -L "$dst" ]; then
        if [ ! -e "$dst.旧版-$STAMP" ]; then mv "$dst" "$dst.旧版-$STAMP"; backed=$((backed+1)); fi
        rm -f "$dst"
      fi
      if [ -z "$DRY_RUN" ]; then ln -s "$tgt" "$dst"; fi
      copied=$((copied+1)); continue
    fi
    if [ -f "$dst" ] && diff -q "$src" "$dst" >/dev/null 2>&1; then
      skipped=$((skipped+1)); continue
    fi
    # 夹具/测试数据：直接覆盖，不留「旧版-」备份。
    # 理由：夹具是**母版本机专属的测试输入**，不是项目资产 —— 留一堆
    # fixtures/tm-qual/good.jsonl.旧版-2026-10-08 只会在项目里堆垃圾，
    # 且下一个 STAMP 又会再堆一份。旧夹具的唯一价值是「本轮修了什么」，
    # 那是 Git 的事（且这些文件本就在母版仓的版本控制里）。
    case "$f" in
      scripts/model/fixtures/*)
        if [ -z "$DRY_RUN" ]; then mkdir -p "$(dirname "$dst")"; cp "$src" "$dst"; fi
        copied=$((copied+1)); continue ;;
    esac
    if [ "$ADDITIVE_ONLY" = "1" ] && [ -e "$dst" ]; then
      skipped=$((skipped+1)); continue      # 已存在 -> 不碰（零覆盖）
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
      [ -f "$govroot/docs/model/$lg" ] || printf '%s\n' '{"_example":true,"note":"模板示例行，不参与统计，首个真实任务前删除"}' > "$govroot/docs/model/$lg"
    done
    # 统一状态标记（可机读，供 migration-status.sh 汇总）
    ph="UNKNOWN"
    [ -f "$govroot/docs/handoff/HANDOFF.md" ] && ph=$(grep -oE "PROJECT_PHASE[=：: ]+[A-Z_]+" "$govroot/docs/handoff/HANDOFF.md" 2>/dev/null | head -1 | sed 's/.*[=：: ]//')
    [ -z "$ph" ] && ph="ABSENT"
    lgr=0; [ -f "$govroot/docs/model/TASK-MODEL-LOG.jsonl" ] && lgr=$(( $(wc -l < "$govroot/docs/model/TASK-MODEL-LOG.jsonl" | tr -d ' ') - 1 ))
    # 2026-10-17 修：**合并写**，不再整份覆盖。
    # 整份覆盖会抹掉项目自己声明的 `execution_mode:"solo"` —— 而 check-ledger 正是靠该字段
    # 豁免「派工零记录」与「ACCEPTED-MISSING」；被铺包工具自己抹掉，等于豁免声明形同虚设。
    GS="$govroot/docs/model/GOVERNANCE-STATE.json"
    if [ -f "$GS" ]; then
      python3 - "$GS" "$RULES_VERSION" "$STAMP" "$ph" "$lgr" <<'PYEOF'
import json, sys
fp, rv, st, ph, lgr = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4], int(sys.argv[5])
try:
    d = json.load(open(fp, encoding="utf-8"))
    if not isinstance(d, dict):
        d = {}
except Exception:
    d = {}
d.update({"rules_version": rv, "synced_at": st, "project_phase_field": ph,
          "task_ledger_rows": lgr, "agents_block_injected": True})
json.dump(d, open(fp, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
PYEOF
    else
      cat > "$GS" <<EOF
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
  fi
done

echo "项目数: $nproj ｜ 新铺: $copied ｜ 备份留档: $backed ｜ 已是新版(跳过): $skipped ｜ AGENTS区块注入: $agentinj"
[ -n "$DRY_RUN" ] && echo "(DRY-RUN：以上为预演，未真正写入)"
exit 0
