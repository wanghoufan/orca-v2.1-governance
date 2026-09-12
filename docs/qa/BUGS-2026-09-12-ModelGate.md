# BUGS｜Model Gate（BatchA 门禁，2026-09-12）

| Bug ID | Priority | Stage P0 Blocking? | Repro | Status | Current Task | 备注（截图/日志一句） |
|---|---|---:|---|---|---|---|
| MODELGATE-01 双账本示例行模型ID过期 | P0 | YES | 读双JSONL：TASK示例role=builder配terra、DISPATCH示例配mimo＋本窗口，与A1新表不一致 | PASS（已改示例行，schema键不动） | A4 | 仅改两示例行model（＋DISPATCH runtime→codebuddy），好例exit0回归PASS |
| MODELGATE-02 静态§4.1四项 | P0 | YES | 方案§4.1四条rg重跑 | PASS（4/4，exit码见§2） | A4 | 母版主动域零自动GO；两包旧表留C2，不计本门禁FAIL |
| MODELGATE-03 smoke（FREE＋B＋四角色只读） | P0 | YES | FREE单发／B只读＋单发(-y)／四角色只读复用B链／Sol静态 | PASS（新烧仅FREE×1＋B×1，用户已批额度） | A4 | B验正文不看rc；Sol零新烧，引用09-11三连PASS |
| MODELGATE-04 GO negative | P0 | YES | 静态表内零GO＋FREE不可用dry-run判 | PASS（dry-run，未真注故障） | A4 | TM备=V4.1/codebuddy；双超限停派找人，禁GO |
| MODELGATE-05 双账本supervisor校验块 | P0 | YES | 卡内两validator各跑好例＋坏例 | PASS（好exit0／坏exit1） | A4 | 好例为改后现文件；坏例走/tmp单行，不污染账本 |

## Fix Attempt Fingerprint

- Task ID: A4｜双账本示例行＋Model Gate验证（qa）
- Root Cause Hypothesis: A1–A3已切新表，旧示例行ID（terra/mimo）与新表语义冲突；须先证静态＋通道＋GO冻结＋账本校验全PASS才可放BatchB。
- Approach: 只改两_example行model（＋runtime）；§4.1四项rg重跑贴exit；FREE×1＋B只读×1＋B单发(-y)×1最小smoke；四角色各一次只读复用B链；Sol引用09-11证据零新烧；GO静态＋dry-run；双validator好/坏各跑。
- Files Changed: `docs/model/TASK-MODEL-LOG.jsonl`（model→`deepseek-v4.1-flash`，其余键/note不动）、`docs/model/DISPATCH-LOG.jsonl`（model→`deepseek-v4.1-flash`、runtime本窗口→`codebuddy`，其余键/note不动）；本报告新建。
- Verification: 见§2–§5（exit码逐条贴）；§4.4十五项15/15 PASS。
- Failure Reason: 无（FAIL清单空）。
- Difference From Previous Attempt: 首轮A4 Gate（09-11为旧表全量真测；本轮为新表最小量验证＋示例行对齐）。

> Attempt ID / Dispatch ID / Model-Backend 系字段 2.0 已废弃，不填（模型轨迹记账本）。

## 1. §4.4十五项checklist（BatchA门禁结论）

| # | 项 | 结果 | 证据 |
|---|---|---|---|
| 1 | Task Manager = FREE Muse | PASS | override L9主`opencode/muse-spark-1.3-contributor-free` |
| 2 | Supervisor = V4.1 | PASS | override L10＋`docs/roles/supervisor.md:23` V4.1/codebuddy一致 |
| 3 | Builder = V4.1 | PASS | override L11＋`docs/roles/builder.md:4`一致 |
| 4 | Code Reviewer = V4.1 | PASS | override L13＋`docs/roles/code-reviewer.md:4`一致 |
| 5 | QA = V4.1 | PASS | override L14＋`docs/roles/qa.md:4`一致 |
| 6 | Experience Recorder = V4.1 | PASS | override L16＋`docs/roles/experience-recorder.md:4`一致 |
| 7 | Neat Freak = V4.1 | PASS | override L17＋`docs/roles/neat-freak.md:4`一致 |
| 8 | Planner = Sol | PASS | override L12 `codex/gpt-5.6-sol`＋`docs/roles/planner.md:4`一致 |
| 9 | Research Reviewer技术槽位 = FREE Muse | PASS | override L15 FREE＋`docs/roles/product-reviewer.md:4`一致（职责改留BatchB） |
| 10 | Senior Expert = Sol | PASS | override L18＋`docs/roles/senior-expert.md:4`一致 |
| 11 | GO自动fallback = 0 | PASS | `rg -n "opencode-go/" USER_MODEL_OVERRIDE.md`→无匹配EXIT:1；`OPENCODE_GO = MANUAL_ONLY`在位（override:22＋AGENTS:33） |
| 12 | V4.1 CodeBuddy smoke PASS | PASS | 见§3（--help rc0＋单发正文pong，-y显式） |
| 13 | FREE Muse smoke PASS | PASS | 见§3（单发rc0含pong） |
| 14 | 无静默付费路径 | PASS | 主备均不可用停派找人（override:5/:22）；换模型用户定；GO仅用户明确单次启用 |
| 15 | 无A/B双路线歧义 | PASS | 主动仅`deepseek-v4.1-flash`；`deepseek-flash`仅standby/历史语境（override:24＋AGENTS:33）；supervisor校验块＋builder通道无关段原文在位 |

## 2. 静态§4.1四项（重跑贴exit码）

- 检查1 主动表零自动GO：`rg -n "opencode-go/" USER_MODEL_OVERRIDE.md`→无匹配，EXIT:1（PASS；比“仅MANUAL_ONLY文字”更严；`rg -n "GO"`仅L5/L22规则文字命中）。
- 检查2 Builder不用FREE：`rg -n "builder.*muse-spark.*free" USER_MODEL_OVERRIDE.md`→无匹配，EXIT:1（PASS）。
- 检查3 V4.1统一：`rg -n "deepseek-v4|deepseek-flash" USER_MODEL_OVERRIDE.md docs/roles AGENTS.md`→主动全为`deepseek-v4.1-flash`（override 7处＋5卡各1＋AGENTS:33），`deepseek-flash`仅override:24/AGENTS:33 standby语境，EXIT:0（PASS）。
- 检查4 Terra/Luna/MiMo不出高频：`rg -n "opencode-go/|gpt-5.6-terra|gpt-5.6-luna|mimo-v2.5|muse-spark-1.3-contributor-free" docs/roles/`→仅`product-reviewer.md:4` FREE一处（允许），EXIT:0（PASS）；planner/senior另验为`codex/gpt-5.6-sol`（PASS）。
- 全仓`rg -n "opencode-go/" .`命中仅两包旧表（C2同步范围）＋历史review/qa/handoff/PLAN引用（历史证据，允许），母版主动三处（override/AGENTS/roles）零自动fallback（PASS，见备注§6）。

## 3. Smoke记录（最小量，新烧FREE×1＋B×1）

- FREE（TM/product槽位代表）：`opencode run -m opencode/muse-spark-1.3-contributor-free "reply with exactly: pong"`→stdout含`> build · muse-spark-1.3-contributor-free`＋`pong`，EXIT:0（PASS）。
- B只读：`codebuddy --model deepseek-v4.1-flash --effort high --help`→usage输出，EXIT:0（PASS；--effort未报错即容忍，判据只看rc0）。
- B单发（-y已带，显式标注）：`codebuddy --model deepseek-v4.1-flash --effort high -y -p "reply with exactly: pong"`→正文`pong`，EXIT:0（PASS；按-y规则验正文不看rc，正文命中即PASS）。
- supervisor只读：`rg -n "模型" docs/roles/supervisor.md`→L23命中，EXIT:0（PASS；通道证据复用B单发，不重复烧）。
- builder dry-run只读：`rg -n "模型|B通道" docs/roles/builder.md`→L4/L7/L8命中（含-y/正文判据原文），EXIT:0（PASS；同上复用B链）。
- reviewer只读：`rg -n "模型" docs/roles/code-reviewer.md`→L4命中，EXIT:0（PASS）。
- qa只读：`rg -n "模型" docs/roles/qa.md`→L4命中，EXIT:0（PASS）。
- Sol静态确认（零新烧）：引用09-11近期PASS证据——sol（BUGS全表真测-codex§：`codex exec -m "gpt-5.6-sol" -s read-only --skip-git-repo-check` rc0 pong，tokens 12,310）＋luna（同式rc0 pong，tokens 12,665）＋terra（QA-04短名rc0 pong）；路由语义override:21（codex实调用剥前缀，表内记全ID）仍在位（PASS；禁Benchmark遵守）。

## 4. GO negative记录

- 静态：母版`USER_MODEL_OVERRIDE.md`内`opencode-go/`零命中（EXIT:1）；10行主/备列无GO；`OPENCODE_GO = MANUAL_ONLY`（override:22，AGENTS:33复述一致）（PASS）。
- 逻辑dry-run（未真注故障）：设FREE不可用→TM按表切同角色备用`deepseek-v4.1-flash`/codebuddy（-y＋记HANDOFF＋账本，override L9备列）；主备均不可用→停派找人（override:5/:22），禁自动进GO；GO仅用户明确“这次可用GO”单次启用，不写表（PASS）。

## 5. 双账本supervisor校验块（卡内命令原文，好exit0／坏exit1）

- TASK好例（改后现文件）：整文件第二道→静默，EXIT:0（PASS；现文件仅_example一行，自动跳过）。
- DISPATCH好例（改后现文件）：整文件第二道→静默，EXIT:0（PASS；同上）。
- TASK坏例（/tmp单行，不入库）：result=`MAYBE`＋rework=`"0"`→`L1: result枚举错: MAYBE`＋`L1: rework非int: 0`，EXIT:1（PASS；/tmp已清）。
- DISPATCH坏例（/tmp单行，不入库）：used=`主备`→`L1: used枚举错: 主备`，EXIT:1（PASS；/tmp已清）。
- 改后示例行原文：TASK `{"_example":true,…"model":"deepseek-v4.1-flash",…,"role":"builder",…}`；DISPATCH `{"_example":true,…"model":"deepseek-v4.1-flash",…,"role":"experience-recorder","runtime":"codebuddy",…}`；schema键全保留，note保留“首个真实任务/派工前删除”。

## 6. 未验证项（非门禁阻塞，留后批）

- 两本地包（`新项目模板包/`、`老项目迁移模板包/`）仍为旧模型表＋GO备用：BatchC（C2）同步范围，本轮只静态点名，不判FAIL（母版门禁只看母版主动域）。
- 真实FREE不可用故障注入未做：GO逻辑仅dry-run判，未拔通道；真注需用户另批。
- Sol最小新连接未做：按任务约束用09-11证据＋静态确认代替；若用户要新证据需另批额度。
- BatchB双阶段治理（§5–§7）、回归（§8：watchdog `bash -n`/launchctl、JSONL外validator、精确三元组重验）、ZIP重建均未在本轮验证。
- 真机Canary（读屏/截图/点击/输入/滚动/端到端）未做；V4.1无桌面能力声明不属本门禁。
