# ORCA V2.1 治理体系再审查报告（全面复查）

- 审查对象：`2026-09-09 丨 MAC 丨 ORCA V2.1 治理模板 丨 正式版`
- 基线对照：`2026-09-08 丨 MAC 丨 ORCA V2.0 治理模板 丨 正式版`＋ V2.0 审查报告（`治理审查报告/ORCA-V2.0-治理审查报告-2026-09-09.md`）
- 审查日期：2026-09-09（与 V2.1 同日，即发即审）
- 方式：全量重读 2.1 所有文件＋与 2.0 正式版逐项 diff＋关键命令实测验证
- 结论先行：上轮 3P0+9P1 已确认修复 12/13，但复查发现 **1 个新的 P1 潜伏缺陷（账本满 2 行即爆）＋3 个新增 P1（2.1 新写内容自带）＋2 个上轮漏网（迁移 scripts/GOVERNANCE 残留）**。判定：V2.1 可用，但建议修完 §2 的 4 个 P1 后再冻结分发；§3 的 P2 可下个版本修。

严重度：P0=照做必错；P1=特定条件下必错或执行分支；P2=脏数据/ stale 文案/可优化。

---

## 1. 上轮问题核验（V2.0 报告 → V2.1 现状，逐条实测）

| 上轮编号 | 问题 | V2.1 状态 | 证据 |
|---|---|---|---|
| P0-1 | supervisor 校验 `sys.argv[1]` 取不到 | 已修，整文件/单行两命令实测通过 | `docs/roles/supervisor.md:4`；但见本报告 §2.1 新变体 |
| P0-2 | HANDOFF.template 是 V1 残留 | 已修，重写为 2.0 七字段＋V1 废弃声明 | `docs/handoff/HANDOFF.template.md` |
| P0-3 | override 路径写 `docs/model/` | 已修，重塑说明改为根文件 | `2.0-重塑说明.md:6` |
| P1-1 | builder 越界写 docs/pm | 已修，只写业务仓库 | `docs/roles/builder.md:5` |
| P1-2 | 账本 schema 三处对不上 | 已修，三卡收敛到 AGENTS 基准 | builder/task-manager/senior-expert 卡 |
| P1-3 | 到期必填 vs 全填无 | 已修，表头改写 | `USER_MODEL_OVERRIDE.md:6` |
| P1-4 | 模板残留 V1 机器字段 | 已修，BUGS/CODE_REVIEW 标废弃，PRODUCT_BACKLOG 指回 PLAN | 三模板实测 |
| P1-5 | 全链 vs 三件套无跳步规则 | 已修，AGENTS 加跳步＋分歧裁决 | `AGENTS.md:27` |
| P1-6 | P0 无定义 | 已修，PLAN.template 定义＋PRODUCT_BACKLOG 引用 | `docs/pm/PLAN.template.md:13` |
| P1-7 | 升级计数无口径 | 已修，supervisor 打回计数 | `AGENTS.md:37` |
| P1-8 | 不起终端 vs 真调命令 | 已修，派发口加三类例外 | 编排者提示词 `:10` |
| P1-9 | push/commit 口径 | 已修，AGENTS 红线明确 | `AGENTS.md:60`；builder 卡缺 commit 半句，见 §3.6 |
| P2-1 | GOVERNANCE_VERSION 缺失 | 已修，根文件内容 `2.1` | 实测 |
| P2-2 | docs/experience 空目录 | 已修，2.1 无此目录 | `ls docs/` 实测 |
| P2-3/4 | EXT-WORKLOG/归位表无模板 | 已修，两模板新增 | 实测两文件 |
| 其余 P2 | neat-freak 落点/HANDOFF 实例标注/重塑说明待写/池子规则/监督者例外 | 已修 | 见各文件 |

**漏网 2 项**（上轮报告提过、2.1 仍未修）：迁移步骤里的 `scripts` 目录（§2.2）、builder 模型 `medium` 档无执行位（§3.7）。

**2.1-更新说明核验**："相对 2.0 只加缓存五条"基本属实。与 2.0 正式版 diff 确认：AGENTS 增缓存五条＋续 session 一行，编排者提示词增读盘顺序＋返工续 session，GOVERNANCE 2.0→2.1，其余一致。表述可接受（"缓存五条"是主体，另两行是配套）。

---

## 2. P1：本次复查发现（4 项，修完再冻结）

### P1-1（潜伏必爆）supervisor 整文件校验命令在账本满 2 行时必 FAIL——已实测

- 位置：`docs/roles/supervisor.md:4`，`json.load(open(...))`
- 现状：当前账本只有 1 行，命令能跑通（实测 `LEDGER_SINGLE_LINE_OK`），具有迷惑性。
- 实测：第 2 个任务落盘后，`json.load` 读 `.jsonl` 抛 `JSONDecodeError: Extra data: line 2 column 1`（已用双行复现，见下）。即：**模板刚交付时是好的，第一个真实任务收工后监督者开始误杀所有账本**。
- 修复（替换整文件校验半句）：
  `python3 -c "import json,sys;[json.loads(l) for l in open(sys.argv[1]) if l.strip()]" docs/model/TASK-MODEL-LOG.jsonl`
  该命令已实测双行通过（`PER_LINE_VALIDATOR_OK`）。单行粘贴命令保留不动。
- 顺带：卡内"返工数对派工次数"在 2.x 无派工台账（Dispatch ID 已废），监督者无从核对，建议改为"返工数对本 Task 上下文中的打回次数"，否则该半句不可执行（降为 P2 若不改）。

### P1-2 迁移整理提示词两处版本残留（上轮漏网＋2.1 未碰）

- 位置：`迁移整理提示词.md:8,13`，标题 `｜2.0`
- 问题 ①：第 1 步"该进 scripts 的进 scripts"——2.x 已删 scripts，模板内无此目录，整理工按此执行会建出体系外目录（上轮分析提到过，正文漏收，2.1 仍在）。
- 问题 ②：第 6 步"写 GOVERNANCE_VERSION=2.0"——本包实际是 `2.1`，照做即版本倒挂。
- 修复：第 1 步改为"该进 docs 的进 docs；2.x 无 scripts，不新建"；第 6 步改为"写 GOVERNANCE_VERSION=2.1（以包内根文件为准）"。

### P1-3（2.1 新增自带）"返工续 session（codex 用 resume）"与"不起终端"存在执行断层，且与升级换模型冲突

- 位置：`AGENTS.md:28`、编排者提示词 `:10`、缓存五条 `:52`
- 矛盾 A：派发口"本窗口内派 subagent…不起终端"，但"codex 用 resume"是 CLI 动作——谁来执行 resume？编排者在终端敲，还是 subagent 基础设施自动续？两处都没写。若需编排者开终端，即违反"不起终端"；若基础设施自动续，"codex 用 resume"就是错位的实现细节，不应写进治理。
- 矛盾 B：缓存"一链之内不换 prompt/工具/skill"，但升级流程要求 builder→senior-expert 换模型重派——返工链恰恰是必须换装备的场景。按字面，升级即违规。
- 修复（三选一，推荐 A）：A）在 AGENTS 续 session 行加例外："升级换 senior-expert 时开新链，不续旧 session"＋"resume 由派工基础设施保持，编排者不手动开终端"。B）删掉"codex 用 resume"六个字，只保留"返工派必须续同一链"。C）若确需手动 resume，写明操作主体与命令。另：opencode 侧是否有 compaction/session 能力也需一句实话（见 §3.8）。

### P1-4 HANDOFF.md §4 "全修完/剩无"失实，`LEDGER_VALID` 无定义

- 位置：`docs/handoff/HANDOFF.md:34-38`
- 问题：§4 宣称"P0-1～P1-9、P2-1～P2-10 全修完""剩：无"，但 §2.2（scripts）、§3.7（medium 档）、§3.5（BUGS Evidence 列）仍在；"supervisor 命令验过 LEDGER_VALID"中的 LEDGER_VALID 在全包无定义、无出处，无法复核。
- 修复：§4 改为"本轮修复清单见 V2.0 审查报告 §5；已知残留见 V2.1 再审查报告 §2–§3"，删掉"剩：无"与 LEDGER_VALID，或给 LEDGER_VALID 下定义（哪条命令、什么输出算过）。

---

## 3. P2：脏数据与文案债（不拦分发，建议下版清）

1. **2.0-重塑说明两处 stale**：`:3` 仍写"只描述 2.0 草稿"（包已是正式版）；`:13` "仅保留 GOVERNANCE_VERSION=2.0"（实物 2.1）。各改 1–2 字。
2. **外部开发者提示词版本滞后**：标题/代号仍 `2.0`；`:14` "根六件套"未覆盖 2.1 新增（`2.1-更新说明.md`、`归位表.template.md`、`治理审查报告/`）；`:34` "继续 2.0 正常派工"。六件套建议改为点名保护"根 *.md＋GOVERNANCE_VERSION＋治理审查报告"，一劳永逸。
3. **HANDOFF.md 实例 stale**：`:27` "一切只改 2.0 DRAFT"（DRAFT 已摘帽）；`:32` "经验一句话（4 条）"（现 6 条）；`:11` "roles 9 张卡"（实物 10 个 role 文件，9 常驻+1 升级——"9 张"指常驻则加注，否则改 10）。
4. **文件标题 2.0 残留**（功能无碍，观感旧）：`经验一句话.md｜2.0`、`USER_MODEL_OVERRIDE｜2.0`、迁移/外部标题。建议统一为"2.x 通用"或升 2.1。
5. **BUGS.template Evidence 列未定义**：`:4` 表头仍有 Evidence 列，而 `:17` 只废弃了 Attempt/Dispatch/Model-Backend。补一句"Evidence=复现截图路径或日志片段，一句"即可闭环。
6. **builder 卡缺 commit 半句**：AGENTS 红线已有 commit 规则，builder 卡 `:7` 只写 push。加 8 个字"commit 同需编排者指令"。
7. **medium 档无执行位**（上轮遗留）：重塑说明 `:7` 与 override `:10` 备注都写 medium，但模型列只有 `codex/gpt-5.6-terra`，无档位字段。明确档位写在哪（模型列后缀还是派工口头），否则 medium 只是注释。
8. **缓存五条术语**："不追 99%"（标题）、"compaction"（`:54`，Claude Code 术语，opencode 侧能力未确认）、"用完不急着关，关了重开更贵"（`:28`，常驻 session 的费用/串话风险未提）。各加半句限定，或删虚词。
9. **读盘顺序两处口径差**：AGENTS 缓存 `:50` 列 3 文件，编排者 `:11` 列 6 步（含 HANDOFF/经验/任务目标）。前三顺一致，建议 AGENTS 补"完整顺序见编排者提示词"一句指回。
10. **模板自带 чужой 账本行**：`docs/model/TASK-MODEL-LOG.jsonl` 仍是雷达副本 2026-09-08 的一行。新项目拷包即继承 чужой 统计，污染"跨项目拼接"口径。建议分发时清空为 0 行，或首行加 `{"_example":true,…}` 并在 AGENTS 注明"example 行不参与统计、首个真实任务前删除"。
11. **治理审查报告随包分发**：`治理审查报告/` 含 V2.0 报告（内有本机绝对路径与实验细节）。若 2.1 对外分发，建议移出模板包或首行加分发说明；且外部者"六件套"未覆盖该目录，权责空白（见本节第 2 条一并修）。
12. **更新说明 paraphrase 漂移**：`2.1-更新说明.md:3` "不换装备"在 AGENTS 正文无此词（正文为"不换 prompt/工具/skill"）。小事，统一措辞即可。

---

## 4. 重复项（本轮无新增，上轮已收敛，维持）

心跳/P0/升级/经验四组重复已在 2.0 正式版收敛为"AGENTS 基准＋各卡指回"，2.1 未反弹。supervisor/task-manager 两行同模型保留现状（改表一次改两行，成本可接受，不修）。

---

## 5. 修复清单（按顺序，总量约 15 行改动）

- [ ] §2.1：supervisor 整文件校验换逐行命令（1 行，必做，附实测）。
- [ ] §2.2：迁移第 1 步删 scripts、第 6 步改 2.1（2 行）。
- [ ] §2.3：续 session 加升级例外＋resume 主体说明（2–3 行，需用户拍板选 A/B/C）。
- [ ] §2.4：HANDOFF §4 去"全修完/剩无/LEDGER_VALID"（3 行）。
- [ ] §3：stale 文案批处理（重塑说明/外部/HANDOFF/标题/BUGS Evidence/builder commit/medium/术语/读盘指回/账本清空/审查报告分发/更新说明措辞）。

---

## 6. 附：实测证据（本机复现）

```
# 当前 1 行账本：旧命令能过（迷惑性通过）
python3 -c "import json,sys;json.load(open(sys.argv[1]))" docs/model/TASK-MODEL-LOG.jsonl
→ LEDGER_SINGLE_LINE_OK

# 追加第 2 行后：旧命令必爆
printf '%s\n%s\n' '{"task":"A"}' '{"task":"B"}' > /tmp/ledger2.jsonl
python3 -c "import json,sys;json.load(open(sys.argv[1]))" /tmp/ledger2.jsonl
→ json.decoder.JSONDecodeError: Extra data: line 2 column 1

# 替换命令：双行通过
python3 -c "import json,sys;[json.loads(l) for l in open(sys.argv[1]) if l.strip()]" /tmp/ledger2.jsonl
→ PER_LINE_VALIDATOR_OK
```

## 7. 附：核验矩阵（抽查）

| 断言 | 2.0 正式版 | 2.1 现状 | 结论 |
|---|---|---|---|
| supervisor 命令可用 | argv 修好 | 单行过/双行爆 | §2.1 |
| HANDOFF 模板 2.0 化 | 已重写 | 未动 | 通过 |
| override 路径 | 根 | 根 | 通过 |
| 账本 schema | AGENTS 基准 | 未动 | 通过 |
| 跳步/P0/升级口径 | 已加 | 未动 | 通过 |
| 迁移 scripts/GOVERNANCE | 残留 | 残留 | §2.2 |
| 续 session 新机制 | 无 | 新增但断层 | §2.3 |
| HANDOFF 全修完声明 | 无 | 新增但失实 | §2.4 |
| 更新说明准确性 | — | 基本属实 | 通过 |
| experience 空目录 | 已删 | 仍无 | 通过 |

*目标/剩 P0/下一步：目标=2.1 全面再审查并落盘；剩 P0=0（本轮无 P0，被审体系剩 4 个 P1 待修）；下一步=按 §5 修 §2.1→§2.4，其中 §2.3 需用户拍一个选项（A/B/C）。*
