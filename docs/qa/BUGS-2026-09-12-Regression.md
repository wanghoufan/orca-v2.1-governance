# BUGS｜回归测试 Regression（C1，2026-09-12）

| Bug ID | Priority | Stage P0 Blocking? | Repro | Status | Current Task | 备注（截图/日志一句） |
|---|---|---:|---|---|---|---|
| REG-01 双validator好exit0/坏exit1（TASK＋DISPATCH，supervisor卡命令原文） | P0 | YES | 现文件整文件第二道×2＋/tmp单行坏例×2 | PASS（好0/0，坏1/1） | C1 | DISPATCH现文件含7行真实派工，好例exit0即连带验过新增行；坏例走/tmp，不污染账本，已清 |
| REG-02 watchdog回归（`bash -n`＋只读launchd三件套验现状，不改逻辑） | P0 | YES | `bash -n`＋`launchctl list/print`只读＋log/plist只读查 | PASS（回归-only） | C1 | `bash -n` EXIT:0；通用部署本机未装（与HANDOFF§8一致）；0907项目级job现状只读记录（last exit 2，既有状态，修归未来编排，不属C1改动域） |
| REG-03 精确路由三元组（V4.1→codebuddy、Sol→codex、FREE→本窗口，无新别名） | P0 | YES | override十行＋十卡模型行＋别名rg三查 | PASS | C1 | 6V4.1＋2Sol全ID＋2FREE三元组全对上；terra/luna/mimo零命中；`deepseek-flash`仅2处standby语境 |
| REG-04 全仓`rg -n "opencode-go/"`无主动自动fallback | P0 | YES | 母版主动域＋全仓逐命中分类 | PASS（母版主动域零命中；残留=两包C2待同步＋历史/报告引用语境） | C1 | 母版三处EXIT:1；全仓余命中无新增主动fallback，明细见§5 |

## Fix Attempt Fingerprint

- Task ID: C1｜回归测试（qa，前置B7条件PASS）
- Root Cause Hypothesis: BatchA/B已改模型表＋两阶段治理，须按方案§8证明既有能力未坏：账本校验器、watchdog脚本、精确路由、GO冻结。
- Approach: 只测不改。supervisor卡两validator原文各跑好/坏；watchdog只`bash -n`＋launchd只读三件套（禁kickstart/禁部署/禁改逻辑）；路由三元组静态对表＋别名rg；全仓opencode-go逐命中分类；Sol零新烧。
- Files Changed: 仅新建本报告 `docs/qa/BUGS-2026-09-12-Regression.md`；其余全仓一字未动。
- Verification: 见§2–§5（exit码逐条贴）；四项全PASS；FAIL清单空。
- Failure Reason: 无（FAIL清单空；§6观察项均为既有状态/C2定义工作，非失败）。
- Difference From Previous Attempt: 首轮C1回归（A4为模型门禁、B7为治理门禁；本轮为§8回归）。

> Attempt ID / Dispatch ID / Model-Backend 系字段 2.0 已废弃，不填（模型轨迹记账本）。

## 1. 方法与约束遵守声明

- 派工槽位：role=qa｜model=`deepseek-v4.1-flash`｜used主｜runtime=codebuddy，备用=无（MANUAL_ONLY）。本轮实际执行面为本窗口静态只读（rg/python-validator/`bash -n`/launchctl只读），未发起codebuddy活派工，故-y不适用（N/A）；无任何GO调用。
- Sol：零新烧。③中Sol节点只做路由静态确认（表＋卡＋别名rg），未跑任何codex活命令；禁Benchmark遵守。
- watchdog：只跑`bash -n`＋只读launchd三件套验现状（list grep/print读/log-tail读/plist读），未跑`kickstart`（主动唤醒属干预，禁），未部署任何东西，逻辑零改。
- Bridge合同：零改（只读核对，命中仅standby语境）。
- 只测不改：除本报告新建外全仓零改动；不commit（任务要求）。

## 2. REG-01 双validator（PASS）

- TASK好例（现文件 `docs/model/TASK-MODEL-LOG.jsonl`，_example单行，卡内命令原文）：静默，EXIT:0（TASK_GOOD_EXIT:0）。
- DISPATCH好例（现文件 `docs/model/DISPATCH-LOG.jsonl`，_example＋7行09-12真实派工，卡内命令原文）：静默，EXIT:0（DISPATCH_GOOD_EXIT:0；A4后新增7行真实派工连带验过）。
- TASK坏例（/tmp单行：result=`MAYBE`＋rework=`"0"`字符串）：`L1: result枚举错: MAYBE`＋`L1: rework非int: 0`，EXIT:1（TASK_BAD_EXIT:1）。
- DISPATCH坏例（/tmp单行：used=`主备`）：`L1: used枚举错: 主备`，EXIT:1（DISPATCH_BAD_EXIT:1）。
- /tmp坏例文件已删（`/tmp/c1_task_bad.jsonl`、`/tmp/c1_disp_bad.jsonl`），账本现文件未污染。

## 3. REG-02 watchdog回归（PASS，回归-only）

- `bash -n scripts/orchestration/coordinator-watchdog-standalone.sh`→EXIT:0（BASH_N_EXIT:0）；`scripts/orchestration/`含脚本（可执行）＋README，2文件在位。
- 通用部署本机状态（只读）：`launchctl list | grep -i watchdog`无`coordinator-watchdog`通用job；`/tmp/coordinator-watchdog.log`不存在→通用部署未安装，与HANDOFF§8“通用部署尚未在任何项目安装”一致；按约束禁为测试部署，故三件套中kickstart未跑（正确）。
- 既有项目级job现状（只读记录，非C1改动域）：`com.orca.watchdog.ing丨0907懒得打字安卓版本`已安装（`~/Library/LaunchAgents/`同名plist在位），`state = not running`，`last exit code = 2`，`runs = 1509`，program指向0907项目自有`watchdog.sh`（非本包脚本）；与HANDOFF§8“launchctl状态码2待下次编排时验证”既有注记一致，修归未来编排验证，不判C1 FAIL（判FAIL亦无Batch可修：包脚本`bash -n`已过，项目job逻辑禁动）。
- 结论：包脚本回归PASS；部署现状只读取证完整；逻辑零改。

## 4. REG-03 精确路由三元组（PASS）

- V4.1→codebuddy（6行）：supervisor/builder/code-reviewer/qa/experience-recorder/neat-freak，override L10/L11/L13/L14/L16/L17主=`deepseek-v4.1-flash`＋Runtime=`codebuddy`；六卡模型行逐一对上（supervisor:23、builder:4、code-reviewer:5、qa:5、recorder:4、neat:4）。PASS。
- Sol→codex（2行）：planner/senior-expert，override L12/L18主=`codex/gpt-5.6-sol`＋Runtime=`codex`；两卡对上（planner:6、senior:4）；全表`gpt-5.6`命中仅全ID`codex/gpt-5.6-sol`（无裸别名）。PASS。
- FREE→本窗口（2行）：task-manager/product-reviewer，override L9/L15主=`opencode/muse-spark-1.3-contributor-free`＋Runtime=本窗口subagent；product卡:5对上；TM卡:4为“读表”句式（A2既定不动卡，冲突以表为准）。PASS。
- 无新别名：`rg "gpt-5.6-terra|gpt-5.6-luna|mimo-v2"`→零命中EXIT:1；`rg "deepseek-flash"`仅2处且均为standby语境（override:24、AGENTS:43）；`rg "opencode-go/" USER_MODEL_OVERRIDE.md AGENTS.md docs/roles/`→零命中EXIT:1。PASS。

## 5. REG-04 全仓opencode-go（PASS，逐命中分类）

- 母版主动域：`USER_MODEL_OVERRIDE.md`＋`AGENTS.md`＋`docs/roles/`→`rg -n "opencode-go/"`零命中（EXIT:1）；`OPENCODE_GO = MANUAL_ONLY`在位（override:22、AGENTS:43）。PASS。
- 全仓余命中分类（`rg -n "opencode-go/" .` EXIT:0，逐条已验，无新增主动fallback）：
  - (a) 两包旧表（`新项目模板包/USER_MODEL_OVERRIDE.md` L9-L17＋`老项目迁移模板包/`同）：09-11旧模型表＋GO备列，C2定义工作（拆活单In Scope“同步只在C2做，BatchA/B不碰两包”＋A4§6既定非阻塞口径），不计C1 FAIL（判FAIL将死锁C2入口）。
  - (b) 历史/报告引用语境（允许）：`docs/history/`方案副本（命令行引用行）、`docs/handoff/HANDOFF-2026-09-11-override主备.md`（旧实录存档）、`docs/qa/BUGS-2026-09-11-override主备.md`＋`docs/review/CODE_REVIEW-2026-09-11-override主备.md`（09-11历史报告）、`docs/qa/BUGS-2026-09-12-ModelGate.md`＋`docs/review/CODE_REVIEW-2026-09-12-ModelGate.md`（A4门禁证据引用）、`docs/pm/PLAN-2026-09-12-整改.md`（任务书rg命令字面）。
  - (c) `docs/prompts/`、双新模板、HANDOFF.template、README、scripts、docs/model/*.jsonl→零命中（无扩散）。
- 结论：无主动自动fallback新增；残留(a)交C2，(b)为历史证据不动。

## 6. 未验证项（非阻塞，留后）

- Sol活链：零新烧（静态确认；需新证据须用户另批额度，拆活单Human Decisions口径）。
- 通用watchdog launchd部署三件套活验：属`HANDOFF-2026-09-12-watchdog部署测试.md`的Orca任务，本C1只回归`bash -n`＋只读现状，不断言、不部署。
- 0907项目级job last exit 2：既有状态，待下次编排时验证（HANDOFF§8已有注记）。
- 两包同步＋ZIP：C2定义工作，不在本C1范围。
- FREE真故障注入：沿用A4§4 dry-run结论，未重复拔通道。

## 7. 任务挂／模型挂判定

- 任务挂：无。四项全PASS；FAIL清单空；约束（Sol零新烧/禁部署/禁改逻辑/Bridge零改/只测不改/不commit）全遵守；supervisor累计打回数不增加（0/2）。
- 模型挂：无。全部validator/`bash -n`/rg exit码符合预期（应过项EXIT:0、应无匹配项EXIT:1）；无超限、无切备（qa无备用，MANUAL_ONLY下停派条件未触发）。
- 结论：回归过，四项全PASS，可进C2（残留(a)即C2工作本身）。

## C2抽验（qa只读，2026-09-12）

- 派工槽位：role=qa｜model=`deepseek-v4.1-flash`｜used主｜runtime=codebuddy，备用=无，-y已带（本轮纯只读：Read/diff/unzip -l/grep/ls，未发起模型调用，无 codebuddy 活派工，故-y N/A；无GO调用）。
- ① 两包override表10行与母版diff零差：`diff USER_MODEL_OVERRIDE.md 新项目模板包/USER_MODEL_OVERRIDE.md` EXIT:0；`diff USER_MODEL_OVERRIDE.md 老项目迁移模板包/USER_MODEL_OVERRIDE.md` EXIT:0；三处10角色行均为10/10。PASS。
- ② 两包HANDOFF.template六字段齐：母版/新包/老包 `grep -c PROJECT_PHASE|PLAN_VERSION|PLAN_READINESS_SCORE|PLAN_GATE|DEV_BASELINE|CHANGE_REQUEST` 均为6/6（PROJECT_PHASE/PLAN_VERSION/PLAN_READINESS_SCORE/PLAN_GATE/DEV_BASELINE/CHANGE_REQUEST逐行在位）。PASS。
- ③ unzip -l两ZIP含双新模板：新包.zip含 `docs/pm/PRODUCT_PLAN.template.md`（1160B 09-12）＋`docs/review/RESEARCH_REVIEW.template.md`（956B 09-12）；老包.zip同样双文件在位（同大小同日期）；在盘六文件 `ls -l` 均在位。PASS。
- ④ GOVERNANCE_VERSION三处均为2.1：包根/`新项目模板包/`/`老项目迁移模板包/` cat 均为 `2.1`。PASS。
- 结论：C2抽验过，四项全PASS；只读零改动（除本节追加外）。

## 升2.2抽验（qa只读，2026-09-12）

- 派工槽位：role=qa｜model=`deepseek-v4.1-flash`｜used主｜runtime=codebuddy，备用=无，-y已带（本轮纯只读：cat/unzip -p/rg/python-validator，未发起模型调用，无 codebuddy 活派工，故-y N/A；无GO调用）。
- ① cat三处GOVERNANCE_VERSION均为2.2：包根`2.2`／`新项目模板包/`2.2`／`老项目迁移模板包/`2.2`。PASS。
- ② unzip -p两ZIP内GOVERNANCE_VERSION均为2.2：`unzip -p 新项目模板包.zip 新项目模板包/GOVERNANCE_VERSION`→`2.2` EXIT:0；`unzip -p 老项目迁移模板包.zip 老项目迁移模板包/GOVERNANCE_VERSION`→`2.2` EXIT:0。PASS。
- ③ `rg -n "保持2\.1|先不动，2\.2|2\.2留用户" .`→2命中（非README，均历史存档非未决）：`docs/history/2.1-更新说明.md:7` Amendment段“保持2.1，2.2留用户拍板”（同文件:8已记“升2.2（用户定，Amendment转正）”闭环）＋`docs/review/CODE_REVIEW-2026-09-12-ModelGate.md:52` ModelGate时点取证“保持2.1，2.2留用户拍板”（ dated冻结报告，不改历史）；`先不动，2.2`严格串零命中（`先不动`散串仅PLAN任务书历史约束语，不在本次三元模式内）；README单列：`rg … README.md`零命中EXIT:1（无provenance行需除外）。未决残留0。PASS（语义；句法2均为历史，非待办）。
- ④ 双账本校验exit 0：TASK `docs/model/TASK-MODEL-LOG.jsonl`（_example单行跳过）EXIT:0；DISPATCH `docs/model/DISPATCH-LOG.jsonl`（_example＋9行09-12真实派工）EXIT:0（supervisor卡命令原文）。PASS。
- 结论：升2.2抽验过，四项全PASS；只读零改动（除本节追加外）。观察项（非阻塞）：包根`README.md:23`仍写“版本（2.1）”，与GOVERNANCE_VERSION=2.2滞后一行，交收尾neat顺手改，不计本轮FAIL。
