## 整改回执（2026-10-27 同日，用户令「修」）

| 报告项 | 处置 | 证据 |
|---|---|---|
| P1 AC 矩阵无卡点 | 已修：`check-ledger.mjs` 新增 `checkAcceptanceMatrix`，DEVELOP＋非 solo＋无矩阵 ⇒ FAIL；其余分级 WARN/SKIP | fixtures case36–39 ＋ CASE 表 4 条，`ledger-fields.test.mjs` ALL PASS 57/0 |
| P1 签收只挂可选 hook | 部分修：AC 门已进项目侧收工必跑命令；签收门仍在 hook | 同上；签收转收工门待下一批 |
| P1 ACROOT 写死路径 | 已修：三级探测＋取不到输出 `AC-SKIP` | `check-sync.sh` 实跑输出 `AC-ROOT:` 行；换机场景改输出 SKIP 不再 `0/0` |
| P1 ROLE-COVERAGE 噪音 | 已修：solo 豁免＋按阶段分组；报警 8→6 条且均为真缺口 | 同次 `check-sync.sh` 实跑 |
| P2 版本比较误报 | 已修：`low==minreq` → `low==cv` | `check-channel-preflight.sh` 实跑 `OK codex 0.164.0 meets requirement 0.159.2` |
| P2 CHANGELOG 状态过期 | 已修：本轮 CHANGELOG 顶部正「已 commit/push（d3afe72、81b9a6b）」，此前三条以本条为准 | `CHANGELOG.md` 首条 |
| P2 门禁偶发 FAIL | 未定位：连续 3 次复跑通过；`run-gates.sh` 只留 `tail -6`，建议失败落完整日志 | 见第 6 项 |
| P2 关键词三处循环／固定文件名 | 未修，待下一批 | — |

本轮改动：母版 4 文件＋4 夹具，两包已同步；`SYNC-OK`；`GATES-OK（14 项）`。未 commit、未 push。

---

# ORCA 体系自查报告（2026-10-27）

- 范围：母版 `2026-09-09 丨 MAC 丨 ORCA V2.1 治理模板 丨 分发版-2026-09-11` ＋ 两包 ＋ `~/Developer/coding/1.Active` 下 24 个有账本的项目
- 方式：`orca-system-self-check-local-zh` 七项检查；静态审查与实跑分开标注
- 基线：无上一份体系自查报告 ⇒ 取最近 3 条 `CHANGELOG.md` 条目（2026-10-27 planner 换模型、口令改名、第一批整改）
- 门禁：`GATES-OK（14 项通过）`

## 结论摘要

| 级别 | 数量 | 说明 |
|---|---|---|
| P0 | 0 | 无阻断性缺陷 |
| P1 | 5 | 红线无卡点 2 项、巡检写死路径 1 项、账本口径 2 项 |
| P2 | 5 | 文档状态滞后、版本比较误报、关键词清单重复维护等 |

**能否收工**：可以收工（门禁全过），但 P1 中「产品验收矩阵」「首次发布签收」属于**红线只有文字、没有机器卡点**，与体系自我宣称的「纪律必须有机器约束」不一致，建议下一批优先修。

## 1. 矛盾 / 不一致 / 两包对齐

- 两包对齐：实跑 `bash scripts/check-sync.sh` → `SYNC-OK`；`AGENTS.md`、`README.en.md` 归一化差异均为 `0`。**通过**
- 交叉引用：`AGENTS.md`、`ORCA治理体系说明.md`、`docs/sop/*.md`、`docs/roles/*.md` 对「体系管家」「planner=Terra」「交付单元复核」表述一致。**通过**
- **不一致（P2）**：`CHANGELOG.md` 最近三条均写「**未 commit、未 push**」，但 `git log` 已有 `d3afe72`、`81b9a6b` 两条对应提交并已推送。
  - 证据：`CHANGELOG.md` 2026-10-27 三条的「Git 状态」段；`git log --oneline -8`。
  - 影响：后续自查若引用 CHANGELOG 判断「哪些改动还没进仓」会误判。

## 2. 预期能否落实

| 机制 | 机器卡点 | 本轮实跑 | 结论 |
|---|---|---|---|
| 产品验收追踪矩阵（红线：未落盘不得完工） | **无**（只报不拦） | `AC-MATRIX: 10/24 有落盘；缺失 14`，同时 `SYNC-OK`、`GATES-OK` | **落不了地（P1）** |
| 首次发布签收 | 仅 pre-commit hook，需手动安装 | 12 个项目装了 `.git/hooks/pre-commit`，1.Active 24 个有账本项目 | **覆盖不足（P1）** |
| 产品双审（planner + product-reviewer） | 有 `check-product-review.sh`（零输出也 FAIL） | 传入 `--help` 被当文件名并报 `PRODUCT-REVIEW-EMPTY`，退出非 0 | 可落实 |
| APP 基础能力（APP-BASELINE） | 有，`check-ledger.mjs` 判 FAIL | `ledger-fields.test.mjs` 含 `APP-BASELINE-MISSING` 用例，`run-gates` PASS | 可落实 |
| 原型 Gate | 有 | `prototype-gate` 回归 PASS | 可落实 |

证据：
- `scripts/check-sync.sh:229-246`：AC 巡检注释明写「只报不阻塞」，且缺失时仅 `echo` 不置 `fail=1`。
- `scripts/install-governance-hooks.sh:5`：签收/AC/账本三道门只能通过 pre-commit hook 触发。
- `scripts/model/check-ledger.mjs:659`：`APP-BASELINE-MISSING` 进 `fails`。

## 3. 账本与派工覆盖

样本：`1.Active` 下 24 个有 `TASK-MODEL-LOG.jsonl` 的项目。

- **主开发者模式（builder 单角色，合规）**：010、011、048、049、051、053、057 等。抽验 010 实跑 `check-ledger.mjs` → `LEDGER-OK (含 WARN)`，`DISPATCH-LOG` 空账本被判「首个派工前正常」。**不构成缺失**。
- **多智能体模式（应有全链）**：028/039 有 `TASK-MODEL-LOG` 223 行、`DISPATCH-LOG` 280 行，覆盖 builder/qa/code-reviewer/supervisor/planner/product-reviewer/senior-expert，正常。
- **真缺口**：
  - 056 账本出现角色 `orchestrator`，`AGENTS.md` 无此角色（应为 `task-manager`）→ 口径漂移（P2）。
  - 054 有 `planner`/`product-reviewer`、缺 `code-reviewer`/`qa`/`supervisor`，实为 PLAN 阶段；检查器不区分 phase 直接报 missing（P2）。
- **结论**：账本足以评估 builder/qa/code-reviewer 的模型表现；**TM/supervisor 多数项目为 0 行**，不足以支撑这两类角色的换模型决策（P1）。

## 4. 其他问题与漏洞

- **P1｜巡检写死个人路径**：`scripts/check-sync.sh:230` `ACROOT="${AC_SCAN_ROOT:-$HOME/Developer/coding/1.Active}"`。换机后目录不存在时 `ac_total=0`，输出「0/0 有落盘」并 `SYNC-OK`，静默失效。
- **P1｜ROLE-COVERAGE 口径窄且噪音大**：`scripts/check-sync.sh:300-320` 只查 `builder/code-reviewer/qa/supervisor` 四角色，与 8 角色口径不一致；且不区分主开发者/多智能体/PLAN 阶段，实测 8 条报警中多数为合规项目。
- **P1｜AC 红线无卡点**：见第 2 项，与 `AGENTS.md` 红线「产品验收未落盘 ⇒ 不得报完工」不匹配。
- **P2｜版本比较误报**：`check-channel-preflight.sh` 报 `codex 0.164.0 is below the table requirement 0.159.2`（字符串比较，0.164 < 0.159 为真），仍输出 `CHANNEL-OK`，长期 WARN 会钝化告警。
- **P2｜概览关键词三处循环**：`check-sync.sh:211/217/221` 三个 `for kw` 清单分开维护，新增机制需同时改多处；脚本注释自述曾漏加。
- **P2｜AC 巡检只认固定文件名**：仅识别 `docs/qa/产品验收追踪矩阵.md`，自定义命名会误报缺失。

## 5. 体系说明是否更新

- `check-sync.sh` 概览新鲜度检查全过（三组关键词均命中）。
- 本轮机制在概览均有对应表述：`体系管家`（:38）、`planner（Terra）`（:44）、交付单元复核、`ROLE-COVERAGE`。**通过**

## 6. 迭代后是否实测

- 最近三条 CHANGELOG 均附可复核证据：`codex debug models` 输出、真调 `codex exec ... "只回复 pong"` 回 `pong`、`GATES-OK（14 项）`、`SYNC-OK`。**有证据（引述历史）**
- 本轮复跑：`run-gates.sh` → `GATES-OK（14 项通过）`；`check-sync.sh` → `SYNC-OK`；`check-ledger.mjs` → `LEDGER-OK`。**本次实跑通过**
- 唯一不一致：CHANGELOG 的 Git 状态陈述过期（见第 1 项）。
- **门禁稳定性（P2，本次新发现）**：写报告后首次跑 `run-gates.sh` 得到 `GATES-FAIL（失败 1 项）`，随后连续 3 次复跑均为 `GATES-OK（14 项）`，未复现。`run-gates.sh:22-30` 失败时只保留 `tail -6`，不落完整日志，无法归因；疑似 `7-Skill`（依赖外部 `validate_skillset.py`）或 `codebuddy-rotate` 的时间/端口相关用例。建议失败时把完整输出写入 `.evidence/`。

## 7. 概览内容准确性

- 模型：`planner（Terra）` 正确，全文无「planner（Sol）」残留（`grep Sol` 仅命中历史与 senior-expert 说明）。**通过**
- 角色数量、文件落点、口令名与 `AGENTS.md`、`USER_MODEL_OVERRIDE.md` 一致。**通过**
- 流程图与正文对「体系管家不是第三种执行方式」表述一致。**通过**

## 修复建议（按优先级）

1. **P1** 给 AC 矩阵加机器卡点：`run-gates` 在「项目已进入 DEVELOP 或已有真实任务行」时，缺失/空矩阵直接 FAIL；主开发者模式可豁免但需在账本 `chain_status` 留痕。
2. **P1** 把签收/AC 校验从「可选 pre-commit」改为「收工前必跑」：纳入 `run-gates` 或 `check-ledger`，不依赖各项目是否装 hook。
3. **P1** `AC_SCAN_ROOT` 默认值改为「向上探测或从 `GOVERNANCE-STATE.json` 读取」，取不到时输出 `AC-SKIP` 而不是 `0/0`。
4. **P1** ROLE-COVERAGE 按执行方式与 phase 分组判定，并把角色清单与 `AGENTS.md` 对齐（含 `task-manager`/`planner`/`product-reviewer`/`senior-expert`）。
5. **P2** CHANGELOG 补一条「已 commit/push：d3afe72、81b9a6b」，或改为记录 commit 号而非「未提交」。
6. **P2** 修 `check-channel-preflight.sh` 的版本比较（按数字段比较）。
7. **P2** 三组概览关键词合并为单一清单文件。
8. **P2** `check-ledger` 增加角色枚举校验，拒绝 `orchestrator` 这类非法角色名。

## 限制

- AC 矩阵只校验「文件存在 + 有 AC 行」，未逐条核对 AC 内容与证据真实性。
- pre-commit hook 只统计安装数量，未在真实提交上验证拦截效果。
- 未在第二个体系仓库完整跑过一轮七项自检。
- 未验证 `1.Active` 之外的项目（`2.Scratch`、`4.Templates` 其他版本）。
- 门禁偶发失败 1 次未复现，根因未定位（见第 6 项）。
