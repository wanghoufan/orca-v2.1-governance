#!/bin/bash
# pre-commit-guard.sh｜提交前卡点：禁止把「原始输入副本 / 证据卡」扫进仓。
#
# 为什么要有这道机器卡点（2026-10-14 P0-3 教训）：
#   纪律早就有（「证据副本禁入仓」「母版只留 _example 空壳」），但**只写在文字里**。
#   实际后果：`git add -A` 把两个 input-*.jsonl（028 真实业务账本 503 行）扫进公开仓，
#   一直推到 GitHub 才被独立审查发现。人工纪律挡不住习惯性命令。
#   ⇒ 纪律必须有机器约束，commit 时当场拦，不给「忘了」留空间。
#
# 卡点范围（母版公开仓）：
#   · input-*.jsonl        —— 账本逐字节副本（含真实业务内容）
#   · 证据-*.json          —— 证据卡（可能已路径归一，但含业务哈希/出错行）
#   · docs/model/ 下的非 _example 真实行（TASK-MODEL-LOG / DISPATCH-LOG /
#     TASK-MANAGER-QUALIFICATION-EVENTS / JEV-DECISION-LOG）
#   · .evidence/ 目录      —— 证据落位目录本体
#
# 用法：可作为 git hook（.git/hooks/pre-commit）安装，也可手动跑。
set -u
rc=0
bad=()

# ① 暂存区里的证据副本 / 证据卡
while IFS= read -r f; do
  [ -n "$f" ] || continue
  case "$f" in
    input-*.jsonl|*/input-*.jsonl|证据-*.json|*/证据-*.json|.evidence/*|*/.evidence/*)
      bad+=("$f")
      ;;
  esac
done < <(git diff --cached --name-only --diff-filter=ACMR 2>/dev/null)

# ② 母版账本不得含真实行（只允许 _example 空壳）
for lg in TASK-MODEL-LOG DISPATCH-LOG TASK-MANAGER-QUALIFICATION-EVENTS JEV-DECISION-LOG; do
  f="docs/model/$lg.jsonl"
  git diff --cached --name-only --diff-filter=ACMR -- "$f" | grep -q . || continue
  if git show ":$f" 2>/dev/null | grep -v '^\s*$' | grep -qv '"_example"'; then
    bad+=("$f（含真实行；母版只允许 _example 空壳）")
  fi
done

if [ "${#bad[@]}" -gt 0 ]; then
  echo "PRE-COMMIT-GUARD 拦截：以下内容不得进入本仓（${#bad[@]} 项）" >&2
  for b in "${bad[@]}"; do echo "  ✗ $b" >&2; done
  echo "" >&2
  echo "  · input-*.jsonl / 证据-*.json / .evidence/ 是**原始输入副本**，含业务内容，本机留存不入仓" >&2
  echo "  · 母版 docs/model/*.jsonl 永远只留 _example 空壳；真实行落各项目自己的账本" >&2
  echo "  · 确需提交请显式 `git rm --cached` 后再提交，或改写到项目仓内" >&2
  rc=1
fi
exit "$rc"
