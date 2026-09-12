# BUGS｜双阶段治理测试 PhaseGate（B7，2026-09-12）

| Bug ID | Priority | Stage P0 Blocking? | Repro | Status | Current Task | 备注（截图/日志一句） |
|---|---|---:|---|---|---|---|
| PHASEGATE-7.1 Phase1正向 dry-run | P0 | YES | 口令`第一阶段，计划`→PLAN→Sol Planner出PRODUCT PLAN→TM派Reviewer→反馈自动回→用户不搬运，走读四文件 | PASS（dry-run，零新烧Sol） | B7 | 三口令四文件命中；AGENTS:6＋TM:10＋编排者:15链齐 |
| PHASEGATE-7.2 Readiness84＋2×P1留PLAN | P0 | YES | 设Readiness=84，P0=0，blocking P1=2，对PRODUCT_PLAN:32 Gate判 | PASS（dry-run） | B7 | Gate=AND，blocking P1≠0→留PLAN，TM自动打回Planner，不找人 |
| PHASEGATE-7.3 Readiness92进WAITING＋停循环＋找Human＋禁Builder | P0 | YES | 设Readiness=92，P0=0，blocking P1=0（关键事实已验证），对Gate判 | PASS（门禁四项之一） | B7 | PROJECT_PHASE=WAITING_HUMAN_APPROVAL＋PLAN_GATE=READY_FOR_HUMAN_REVIEW；循环停，只找人一次 |
| PHASEGATE-7.4 Human Gate negative拒派Builder | P0 | YES | WAITING期间未说`第二阶段，开发`即试派Builder，TM＋supervisor双卡点判 | PASS（P0必过项） | B7 | AGENTS:7＋TM:11＋编排者:16＋supervisor:45四重拒派；本轮零业务改动 |
| PHASEGATE-7.5 Phase2正向＋基线锁定＋V4.1主链 | P0 | YES | 口令`第二阶段，开发`→DEVELOP＋PLAN_GATE=APPROVED＋DEV_BASELINE锁定→V4.1主链 | PASS（门禁四项之一） | B7 | AGENTS:8/:36＋TM:11-12＋编排者:15＋builder:9＋HANDOFF:10齐 |
| PHASEGATE-7.6 独立Reviewer | P0 | YES | Reviewer Session隔离＋输入件＋PASS/FAIL＋FAIL回链，走读 | PASS（dry-run，未起活Session） | B7 | reviewer:3独立Session＋六输入件＋七查:4；FAIL经TM重派原Builder通道 |
| PHASEGATE-7.7 两轮升级Sol mock | P0 | YES | Attempt1 FAIL→整改→Attempt2 FAIL→停V4.1链升senior-expert，mock | PASS（mock，零新烧Sol） | B7 | builder:11＋AGENTS:47-50；Sol证据引ModelGate§3（09-11 read-only rc0 pong） |
| PHASEGATE-7.8 Change A留DEVELOP | P1 | NO | `变更请求：按钮间距改大一点`→A→V4.1链，不召Planner | PASS（dry-run分类） | B7 | AGENTS:9＋TM:13＋编排者:16＋builder:10一致 |
| PHASEGATE-7.9 Change B留DEVELOP | P1 | NO | `变更请求：已有i18n加俄语泰语`→B→更局部DoD留DEVELOP，不召Sol | PASS（dry-run分类） | B7 | 同上三处＋builder:10（B等TM更新局部Req/DoD后做） |
| PHASEGATE-7.10 Change C受控重开＋Human＋新版本＋新基线 | P0 | YES | `变更请求：无i18n重做完整多语言体系`→PLAN_REOPEN_REQUIRED→Sol＋Reviewer＋Human＋新版本＋新基线回DEVELOP | PASS（门禁四项之一） | B7 | AGENTS:9＋TM:13＋编排者:16＋planner:5＋reviewer:4＋HANDOFF:7/:10/:11＋PLAN:4-5齐 |
| PHASEGATE-7.11 supervisor防停摆＋watchdog唤醒不代做 | P0 | YES | supervisor五查#5＋链ID＋协议顶注＋watchdog `bash -n`回归＋双validator回归 | PASS（只回归，不断言部署，不改逻辑） | B7 | `bash -n` EXIT:0；TASK/DISPATCH好例各EXIT:0；部署断言留Orca任务单 |
| PHASEGATE-7.12 真机Canary七项 | P2 | NO | qa:4七项（读屏/截图/点击/输入/滚动/判UI/端到端）本窗口逐项可执行性判 | PENDING / NOT VERIFIED（非阻塞） | B7 | 本窗口无桌面控制能力，七项全PENDING；禁编造支持，未写“已启用” |

## Fix Attempt Fingerprint

- Task ID: B7｜双阶段治理测试（qa）
- Root Cause Hypothesis: B1–B6已写完两阶段治理（AGENTS/三口令/七卡/双新模板/HANDOFF六字段/README/协议顶注），须按方案§7.1–§7.12逐项证明门禁语义可执行且Human Gate不可绕过；Sol只许mock，Canary无能力只许标PENDING，watchdog只许回归。
- Approach: 只测不改。全静态dry-run：rg字面命中＋枚举＋Gate逻辑走读＋supervisor双validator好例＋watchdog `bash -n`；Sol零新烧（引ModelGate§3近期PASS证据）；Canary判能力缺席标PENDING；全程零业务改动、零watchdog改动。
- Files Changed: 仅新建本报告 `docs/qa/BUGS-2026-09-12-PhaseGate.md`；B1–B6产出及业务文件一字未动。
- Verification: 见§2–§5（exit码逐条贴）；门禁四项7.4/7.3/7.5/7.10全PASS；FAIL清单空。
- Failure Reason: 无（FAIL清单空；7.12 PENDING为能力缺席非失败，方案§7.12＋qa:4明示允许）。
- Difference From Previous Attempt: 首轮PhaseGate（ModelGate A4为模型门禁；本轮为治理门禁，无旧PhaseGate报告）。

> Attempt ID / Dispatch ID / Model-Backend 系字段 2.0 已废弃，不填（模型轨迹记账本）。

## 1. 方法与约束遵守声明

- 派工槽位：role=qa｜model=`deepseek-v4.1-flash`｜used主｜runtime=codebuddy，备用=无（MANUAL_ONLY）。本轮实际执行面为本窗口静态dry-run（rg/validator/`bash -n`只读），未发起codebuddy活派工，故-y不适用（N/A）；无任何GO调用。
- Sol：零新烧。7.1/7.7均为mock/dry-run＋引 `docs/qa/BUGS-2026-09-12-ModelGate.md` §3近期PASS证据（Sol read-only rc0 pong tokens 12,310；terra QA-04短名rc0；禁Benchmark遵守）。
- Canary：本窗口无桌面控制能力，7.12七项逐项标PENDING/NOT VERIFIED，未编造任何“已支持”。
- watchdog：只跑 `bash -n` 回归＋既有部署任务单取证，未改逻辑、未断言本机launchctl部署状态。
- 只测不改：除本报告新建外，全仓零改动（`git status`级语义；commit按任务要求不做）。

## 2. 逐项证据（§7.1–§7.12）

### 7.1 Phase1正向（PASS，dry-run）

- 三口令字面命中四文件，EXIT:0：`rg -n "第一阶段，计划|第二阶段，开发|变更请求" docs/prompts/编排者提示词.md README.md AGENTS.md docs/roles/task-manager.md`（编排者:14三口令；README:7-9；AGENTS:6/:7/:9；TM:9-13）。
- Phase1准入：AGENTS:6只许TM/supervisor/planner(Sol)/product-reviewer(FREE)，禁builder/code-reviewer/qa派工＋禁业务改动＋禁Release；派工顺序:36 Phase1链 planner(Sol)→product-reviewer→planner→…→Readiness→Human。
- 自动回传：TM:10（收Planner→派Reviewer→收Reviewer→打回Planner，不找用户搬运）；编排者:16（PLAN铁律：用户不搬运，TM自动回传）。
- 两端模型：planner:6 Sol；product-reviewer:5 FREE本窗口；Phase2默认停用两卡各有（planner:5，reviewer:4）。
- 走读链：`第一阶段，计划`→PROJECT_PHASE=PLAN→Sol Planner出PRODUCT PLAN→TM派Reviewer→RESEARCH_REVIEW→FAIL回Planner修订→用户不搬运。全节点有字面依据，PASS。

### 7.2 Readiness84＋2×P1留PLAN（PASS）

- Gate定义唯一正典 PRODUCT_PLAN:32：`Readiness >= 90 AND P0 = 0 AND blocking P1 = 0 AND 关键事实已验证 AND 核心假设已合理验证`。
- 留PLAN依据：TM:10（`<90 留 PLAN 继续循环`）；编排者:16（`<90 留 PLAN 自动打回 Planner`）。
- 代入84＋blocking P1=2：两条件皆假→继续PLAN→TM自动打回Planner→不找用户宣布开发。PASS。

### 7.3 Readiness Gate 92进WAITING（PASS，门禁）

- 代入92＋P0=0＋blocking P1=0（设关键事实/假设已验证）：Gate真→`PROJECT_PHASE=WAITING_HUMAN_APPROVAL`＋`PLAN_GATE=READY_FOR_HUMAN_REVIEW`（AGENTS:7；TM:10；编排者:15）。
- 三连带：停Planner↔Reviewer循环＋找人一次（AGENTS:7/TM:10-11/编排者:15）；Builder仍禁（AGENTS:7“不可自行启动builder”；supervisor:45）。HANDOFF枚举支撑（HANDOFF.template:6/:9）。PASS。

### 7.4 Human Gate negative（PASS，P0必过）

- 四重拒派字面齐，同一rg EXIT:0：AGENTS:7（不自动跨越＋不可自行启动builder＋只有`第二阶段，开发`才进）；TM:11（WAITING停循环/不跨越/不自启builder）；编排者:16（未经批准禁开发，WAITING派Builder拒绝）；supervisor:45（未说口令即派Builder必须打回）。
- dry-run：WAITING态＋无口令＋试派Builder→TM拒＋supervisor打回（双卡点）。本轮实际零派工、零业务改动，与“拒绝”语义一致。P0 PASS。

### 7.5 Phase2正向（PASS，门禁）

- 口令→状态：用户明确说`第二阶段，开发`才进（AGENTS:7；TM:11；编排者:15）；进后`PROJECT_PHASE=DEVELOP`＋`PLAN_GATE=APPROVED`＋锁定`DEV_BASELINE=PRODUCT_PLAN_Vx.x`（AGENTS:8；TM:11；编排者:15）。
- 默认主链：V4.1 Builder→V4.1 Reviewer→V4.1 QA→Supervisor→TM（AGENTS:8/:36；TM:12；编排者:15）；Research Reviewer默认不派（AGENTS:8/:36；TM:12）。
- 基线强制：builder:9开工必读DEV_BASELINE＋Req/DoD；supervisor:46 DEVELOP缺基线即打回；HANDOFF.template:10 DEVELOP必填。PASS。

### 7.6 独立Reviewer（PASS，dry-run）

- 会话隔离：reviewer:3“独立Session（与Builder非同一审查上下文）”；AGENTS External Runtime注＋:36独立复核链佐证。
- 输入六件：reviewer:3 Requirement＋DEV_BASELINE＋DoD＋Diff＋测试结果＋必要代码上下文（方案§5.8五件＋必要上下文全覆盖）。
- 目标与七查：找错/找回归/找越界，不维护原方案（:3）；七查:4（基线一致/需求覆盖/DoD/越界/回归/P0-P2/可回滚）。
- PASS/FAIL＋FAIL回链：:3过/打回＋改法；回链走TM重派当前Builder通道＋基础设施续原Session（TM:8；编排者:11）；:7不直接改代码、不加Spark Gate。本轮未起活Session（只测不改正确），判dry-run PASS。

### 7.7 两轮升级Sol（PASS，mock）

- 规则：builder:11（第一次实现→Review/QA FAIL→整改一次→仍FAIL即停V4.1链升senior-expert(Sol)，不第三轮无限磨；P0-hard可直升当次有效）；AGENTS:47-50（同Task累计supervisor打回2次自动升；senior再被打回2次停线找人）；senior-expert:4 Sol只接升级。
- mock走读：Attempt1 FAIL→V4.1整改→Attempt2 FAIL→停链→新链senior-expert(Sol)→原因＋返工数记账（TM:8/AGENTS:58）。
- 零新烧依据：引ModelGate§3（Sol `codex exec -m "gpt-5.6-sol" -s read-only --skip-git-repo-check` rc0 pong；09-11三连PASS）。PASS。

### 7.8 Change A（PASS）／7.9 Change B（PASS）

- 分类三处一致（同一rg EXIT:0）：AGENTS:9；TM:13；编排者:16。A=开发内小改留DEVELOP不召Planner；B=局部功能变化更新局部Req/DoD留DEVELOP不召Sol Planner。
- A例“按钮间距改大”→V4.1 Builder→Review→QA（builder:10 A小改可做）。B例“已有i18n加俄/泰”→TM更新局部Req/DoD后同链做（builder:10 B等TM更新后做）。PASS×2。

### 7.10 Change C受控重开（PASS，门禁）

- 触发与状态：C=产品/架构变更进`PLAN_REOPEN_REQUIRED`＋局部暂停（AGENTS:9；TM:13；编排者:16；supervisor:47禁绕）。
- 重开链：Sol Planner＋Research Reviewer＋Human Approval＋新Plan版本＋新DEV_BASELINE回DEVELOP，不全量重跑（AGENTS:9；TM:13；编排者:16）。
- 两端入口：planner:5仅Controlled Reopen/明确重规划进入，输出新版本＋新基线；reviewer:4仅Controlled Reopen/TM明确指派进入。
- 落盘位：HANDOFF.template:7/:10/:11（PLAN_VERSION/DEV_BASELINE/CHANGE_REQUEST A/B/C）＋PLAN.template:4-5（DEV_BASELINE/CHANGE_REQUEST）。C例“无i18n重做完整多语言体系”命中方案§5.10 C类示例，判C。PASS。

### 7.11 supervisor防停摆＋watchdog（PASS，回归-only）

- 五查在位：`rg supervisor.md` EXIT:0（:43-48：PLAN禁Builder/QA、WAITING禁自开发、DEVELOP必基线、C禁绕Reopen、TM停摆沿用watchdog唤醒不代做）；链ID校验:51（TM只记录/引用，不手造）。
- 协议顶注：收编说明:7两阶段优先句在位；:6 L3仅外部/终端部署、本窗口链不常驻（与“唤醒不代做、不由用户充当watchdog”一致）。
- watchdog回归：`bash -n scripts/orchestration/coordinator-watchdog-standalone.sh` EXIT:0（BASH-N-EXIT:0）；脚本＋README在 `scripts/orchestration/`（2文件）。
- 部署任务单取证（不断言本机部署）：`docs/handoff/HANDOFF-2026-09-12-watchdog部署测试.md`存在，部署验收交Orca编排者（launchctl三件套＋旧部署共存查），本B7不代验。
- supervisor能力未坏：双validator好例重跑 TASK-EXIT:0＋DISPATCH-EXIT:0（卡内命令原文只读）。逻辑未改。PASS。

### 7.12 Canary七项（PENDING / NOT VERIFIED，非阻塞）

- 口径：qa:4七项（读屏/截图/点击/输入/滚动/判断UI状态/真实端到端）全过才写“V4.1真机QA已启用”，未过标PENDING/NOT VERIFIED禁编造（rg EXIT:0）。
- 本窗口能力：无桌面控制能力→七项逐项不可执行→全PENDING，总体NOT VERIFIED；全仓未写“已启用”断言（语义守恒）。按任务约束与方案§7.12，此为允许的未验证项，不判FAIL，不阻塞Gate。

## 3. B1–B6前置完整性确认（B7准入）

- AGENTS两阶段：`rg AGENTS.md`全命中（状态:5、三态:5、Phase1:6、Human:7、Phase2:8、Change:9、Research Reviewer:15/:25、派工Phase-aware:36）。PASS。
- 旧单线残留：`rg "planner→builder→|→product→supervisor"` 无匹配 EXIT:1；Phase-aware废止声明双文件在位（AGENTS:34、编排者:15）。PASS。
- 三口令：§2首条rg EXIT:0。README三口令:7-9＋模型口径:13-16齐。PASS。
- 七卡增量：TM Phase owner/Human/Change（:9-13）；supervisor五查（:43-48）；planner产品Planner（:3-7）；reviewer标题`product-reviewer（Research Reviewer / 研究审查者）`＋ID不变（:1/:3）；builder Phase2 only＋疑C立返＋两轮升级（:9-11）；reviewer独立Session＋七查（:3-4）；qa七查＋Canary（:3-4）。PASS。
- 双新模板：PRODUCT_PLAN字段rg全命中（含Readiness七维＋Gate:32＋PLAN_GATE:34）；RESEARCH_REVIEW十四字段全命中（含四项强制输出＋Next Action:19）。PASS。
- PLAN.template两行：:4-5 DEV_BASELINE/CHANGE_REQUEST。HANDOFF六字段＋枚举：:6-11。协议顶注：收编说明:7。PASS。
- 9+1：`ls docs/roles/` 10文件（TM/supervisor/planner/builder/reviewer/qa/product-reviewer/recorder/neat/senior），无第11角色文件；独立重申AGENTS:10（TM/supervisor不合并，无Spark Gate，无额度状态机）。PASS。
- GO冻结延续：MANUAL_ONLY三文件在位（override:22、AGENTS:43、README:16）。PASS。

## 4. 未验证项

- 7.12 Canary七项：PENDING/NOT VERIFIED（本窗口无桌面控制能力；待有 desktop-use 通道时按qa:4七项重测，通过才写“已启用”）。
- Sol活链：7.1/7.7/7.10中Sol节点均为mock＋引ModelGate§3证据，未做新Sol最小连接；需新证据须用户另批额度（拆活单Human Decisions口径）。
- watchdog本机launchctl部署三件套：属 `HANDOFF-2026-09-12-watchdog部署测试.md` 的Orca任务，本B7只回归`bash -n`，部署状态不断言。
- 两包同步＋ZIP＋全回归：属BatchC（C1/C2），不在本B7范围。
- FREE真故障注入GO-negative真注：沿用ModelGate§4 dry-run结论，未重复拔通道。

## 5. 任务挂／模型挂判定

- 任务挂：无。12项中11项PASS＋1项允许PENDING；门禁四项（7.4/7.3/7.5/7.10）全PASS；FAIL清单空；B1–B6前置齐；约束（Sol零新烧/Canary不编造/watchdog不改逻辑/只测不改/不commit）全遵守。
- 模型挂：无。全部rg/validator/`bash -n` exit码符合预期（命中项EXIT:0、应无匹配项EXIT:1、双账本好例EXIT:0、watchdog EXIT:0）；7.12 PENDING系通道能力缺席（任务范围事项），非模型故障；无超限、无切备（qa无备用，MANUAL_ONLY下停派条件未触发）。
- 结论：Gate过（条件PASS，尾巴仅Canary待验证）。任一FAIL打回对应Task（本轮无）；supervisor累计打回数不增加（0/2）。

## 6. 门禁四项速查

- 7.4 Human Gate negative：PASS（P0）。
- 7.3 Readiness92进WAITING：PASS。
- 7.5 Phase2正向：PASS。
- 7.10 Change C受控重开：PASS。
- FAIL清单：空。
