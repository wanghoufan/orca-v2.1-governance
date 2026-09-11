# ORCA V2.1 External Builder Runtime 送审包（2026-09-11）

> 基线：`2026-09-09 丨 MAC 丨 ORCA V2.1 治理模板 丨 正式版`（`GOVERNANCE_VERSION=2.1`）。只改2.1包，未碰V1.10/V2.0封存，未push，无secrets真值。任务书：`ORCA V2.1 执行优化者｜DeepSeek Bridge 原生适配.md`（§1–§16）。总体结论见末尾。

## 1. 修改文件清单（主5+扩3，ledger未动）

| # | 文件 | 改动 |
|---|---|---|
| 1 | `AGENTS.md:29` | 新增External通用插座一句：builder仍是builder（9+1不新增），Runtime仅执行通道，基础设施自动调，自检≠替代四检，permission单点 |
| 2 | `USER_MODEL_OVERRIDE.md:6` | 表头加「执行通道/Runtime」列（可选，空=原行为）；各行填—默认subagent，零回归 |
| 3 | `USER_MODEL_OVERRIDE.md:25` | DeepSeek段一律待Contract核对，禁编造，无Contract填待接入 |
| 4 | `编排者提示词.md:10-11` | 外部Runtime由基础设施自动调（不算起终端）；TM禁人工六项；反馈重派当前通道续原Session；打回2次停原链升senior；换模型/换Runtime/升级开新链 |
| 5 | `docs/roles/builder.md:7` | 执行通道无关契约；禁第11角色；不自切模型/通道；feedback/permission走TM单点 |
| 6 | `docs/handoff/HANDOFF.template.md:9` | 加可选执行链/Session行（真resume填，subagent可空，TM只记不造，返工验原链，senior更新） |
| 7 | `docs/roles/task-manager.md:7` | TM不开终端+回链落TM卡 |
| 8 | `外部开发者提示词.md:3` | 边界句：本文件=manual fallback保留，External走builder通道，两者并存 |
| 9 | `docs/roles/supervisor.md` | HANDOFF加字段同步校验口径（留空合法等） |

原文摘录（审查对照）：

- `AGENTS.md:29`：`External Builder Runtime 通用插座：builder 仍是 builder（9+1 不新增），Runtime 仅为执行通道（本窗口 subagent / codex / opencode / External Runtime），由 override「执行通道/Runtime」列或口头指定、派工基础设施自动调用；Runtime 自带 internal reviewer/QA/self-check 仅为自检证据，不能替代 code-reviewer/qa/product-reviewer/supervisor；permission_request 走机器可读→ORCA/TM 审批单点→用户定→回 runtime，builder 不直聊用户。`
- `USER_MODEL_OVERRIDE.md:6`：表头含 `执行通道/Runtime（可选，空=本窗口 subagent 原行为；有值由派工基础设施自动调用，TM 不手动开终端）`；builder行模型仍 `codex/gpt-5.6-terra`，Runtime为 `—（默认本窗口 subagent，原行为零回归）`。
- `USER_MODEL_OVERRIDE.md:25`：DeepSeek通道待Contract核对，无文件时一律「待接入」，不得编造 `deepseek-official/xxx` 等；既有占位字样仅待核对不当真值。
- `编排者提示词.md:10`：override列指定的外部Runtime由基础设施自动调用，不算起终端；无Contract按待接入处理不编造；TM禁人工开终端/搬Prompt·feedback·Session/补上下文；真resume仅codex/外部通道用。
- `编排者提示词.md:11`：自检≠四检；反馈重派当前通道续原Session；打回2次停原链升senior新链并更新HANDOFF；permission单点；换模型/换Runtime/升级开新链。
- `builder.md:7`：四通道职责同；禁 `deepseek-builder/official-builder/bridge-builder`；Runtime/Session由基础设施维护。
- `HANDOFF.template.md:9`：`执行链/Session（可选，仅真 resume 通道填，普通 subagent 可空；TM 只记录/引用，ID 由基础设施返回，不手造、不要求用户复制；返工确认是否原链；senior 升级开新链后更新）`。
- `task-manager.md:7`：外部通道基础设施自动发；反馈重派续原Session；累计打回2/2停原链升senior并更新链。
- `外部开发者提示词.md:3`：manual fallback保留，External走builder通道，不改Bridge专用，无配置仍可用。

## 2. 每个文件为什么改

- AGENTS：消除“Runtime自检替代四检”歧义，定通用插座+权限单点。
- override表头：模型≠通道，二者分开表达；空值零回归是场景A/G的依据。
- override第25行：无Contract禁编造的落盘闸。
- 编排者：TM免人工搬运是场景B/C的依据；升级口径一字未改是场景D依据。
- builder：通道无关+禁第11角色。
- template：真resume缺口补可选字段，不扩散。
- task-manager/supervisor/外部：把同一句话落到责任卡+边界，避免两套口径。

## 3. diff摘要（非git包，无git diff；等价变更面）

- 主5：AGENTS 1句、override表头1列+规则1段、编排者2段、builder 1段、template 1行。
- 扩3：task-manager 1段、外部1行、supervisor 1句。
- 未改：`docs/model/TASK-MODEL-LOG.jsonl` schema不动（T6结论：仅真实Model ID够用，runtime记HANDOFF）。

## 4. 任务书§16十六问

1. 修改文件清单：见§1。
2. 为什么改：见§2。
3. diff摘要：见§3。
4. 新增角色：NO（roles仍10文件=9+1，builder明禁三类新角色）。
5. 新增Registry/Promotion：NO。
6. 改变默认Builder：NO（仍`codex/gpt-5.6-terra`，Runtime默认空）。
7. 保留一句话切模型：YES（改表/口头即生效，档位仍口头）。
8. Runtime治理定义：builder的执行通道，非角色；override列或口头指定；基础设施自动调；TM不开终端。
9. Bridge接入点：builder行Runtime列填channel ID（待接入）+模型列填Contract精确ID（待接入）；无Contract不启用。
10. Resume归属：基础设施维护续接；TM只记/引用；senior新链更新。
11. 反馈路径：TM重派当前通道、基础设施续原Session；2次打回停原链升senior。
12. 升级规则：保持原规则（累计被supervisor打回2次，senior停线）。
13. Permission：机器可读→TM审批单点→用户定→回runtime；不写DeepSeek专用路径。
14. Terra零回归：YES（默认空=原行为；场景A PASS）。
15. 场景A–G：全PASS（静态Contract Review，未跑Canary）。
16. 待Bridge真实值：Contract本体、channel ID、官方精确Model ID、route/envelope/Session映射、permission机器格式与接线、Prefix/KV实现归属、Session发放与返工确认方式。

## 5. 证据链（本包内可查）

- `docs/pm/PLAN-2.1-RUNTIME-2026-09-11.md`（T1–T7，P0×4，待值×7，场景A–G）
- `docs/review/CODE_REVIEW-2.1-RUNTIME-2026-09-11.md`（PASS零打回）
- `docs/qa/BUGS-2.1-RUNTIME-2026-09-11.md`（10/10 PASS）
- `docs/review/PRODUCT_BACKLOG-2.1-RUNTIME-2026-09-11.md`（PASS）
- `docs/handoff/HANDOFF.md §9`（派工口令含模型+supervisor播报trace）
- `docs/model/TASK-MODEL-LOG.jsonl`第3行（2.1-RUNTIME，rework=0，escalated=NO）
- 自查：全包无裸可用 `deepseek-official/xxx`（仅禁令引文+待接入占位）；roles无第11个；默认builder未切。

## 6. 总体结论

ORCA V2.1 External Builder Runtime Adaptation = CONDITIONAL PASS（治理侧全PASS；Bridge激活待Contract本体与7项真实值，届时只填override两列，不动治理）。
