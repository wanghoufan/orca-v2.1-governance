# CODE REVIEW

- Task: override主备复核（USER_MODEL_OVERRIDE.md 本轮 diff，只读不改）
- Commit: 无（非 git 仓库分发冻结实例；HANDOFF §6 分发冻结；被检文件根 `USER_MODEL_OVERRIDE.md` 共 29 行，表头+分隔行+10 数据行）
- Reviewer: code-reviewer
- Result: 过（P0=0；下述 P1×2+P2×3+P3×1 由 builder/TM 后续顺手修，不阻塞本轮；复核只给改法，不直接改代码）

> Dispatch / Evidence ID 系字段 2.0 已废弃，不填。

## P0 / P1 Findings

- P1-1（builder 行备注 A/B 混写，改法一句）：第 11 行 builder 备注写“主用=pi默认/codebuddy……Runtime是否切pi待确认”，但同行 Runtime 列已填 `deepseek-bridge`（=规则第 27 条之 A 通道，已测正式默认）。备注把 A 通道主用描述成 B 通道（pi默认待测），与 Runtime 列矛盾。改法：备注改为“主用模型同 pi 默认同款（显示 `deepseek-v4.1-flash` 仅显示名），通道走 `deepseek-bridge`（A 已测）；是否切 pi（B）待 B 测完由用户定”。不升 P0 的理由：派工按 Runtime 列自动调用（备注不驱动派工），且第 27 条已有兜底“表内混写一律以本条为准拆分”，功能无损。
- P1-2（task-manager 备用跨池字面冲突，补 guardrail 措辞）：第 9 行 TM 主用 `opencode-go/muse-spark-1.3-contributor`（GO 池），备用 `deepseek-flash`（pi 默认/B 通道待测），与第 22 条“TM 只走 OPENCODE_GO”字面冲突；且备用 Runtime 为空（=本窗口 subagent 原行为），B 未测前切备通道未定。改法（二选一，不推翻用户已定备用归属）：① TM 行备注追加“ B 未测完前 TM 主用超限不得静默走未验证 Runtime，主备均超限按停派找人”；② 或第 22 条括号补“TM 主用只走 OPENCODE_GO，备用按用户定名单例外（见 TM 行备注）”。用户备用决策本身不动，只补执行护栏。

## P2 / P3 Backlog Findings

- P2-1（规则冲突结论①：主备自动切不算自作主张）：第 5/24/25 条“主用额度受限时编排者在同角色备用名单内自行切备+记 HANDOFF+账本、双超限停派找人”不违反 AGENTS 红线。理由：文件头三处标“2026-09-11用户定”，本轮用户逐条口述、TM 记录（口述记录核验属 TM 职责，不在本次被检文件内，复核采信文件内用户定标注）；授权范围锁死“同角色已授权名单内”，属执行非决策；“双超限停派、不静默扣费”护栏完整。条件：每次切换必须兑现“记 HANDOFF+账本”，由 supervisor 抽查。
- P2-2（规则冲突结论②：FREE 耗尽整批升 GO 触发式不算恢复类条件违规）：第 29 条触发器是用户显式说一句“FREE用完了”（非到期时间、非自动探测），且“FREE恢复是否切回由用户再说一句定”（无自动恢复）。与 HANDOFF §3 禁的“等免费模型恢复/到期条件”语义不同，合规。字眼风险：该条含“FREE恢复”字样，与 HANDOFF §3“相关字眼已清完”字面相碰；改法：HANDOFF §3 口径澄清（“用户显式触发式不算恢复类条件”）由 TM/supervisor 定，reviewer 不扩权改 HANDOFF，本条仅提示。
- P2-3（mimo GO 后缀与 FREE Spark 映射结论：成立，不打回，留 QA 真机验证）：`opencode-go/mimo-v2.5`（qa/experience-recorder 备用）去 `-free` 后缀与 Spark GO 行（`opencode-go/muse-spark-1.3-contributor` 同去 `-free`）模式一致，非缺失；两行备注均已诚实标注“精确后缀待确认”。`opencode-free/muse-spark-1.3-contributor-free` 在 supervisor 主/builder 备/neat-freak 主三行一致成对（FREE=`opencode-free/`前缀+`-free`后缀，GO 对应行去后缀），格式成立。改法：均不改表，由 qa 按第 28 条派工显式心跳真机验证，首派即见分晓。
- P3-1（显示名口径抛光）：`deepseek-v4.1-flash` 机检确认零进入 Model 列（两模型列别名/旧 alias 扫描干净：无裸 `gpt-5.6`、无 `deepseek-v4.1-flash`、无旧 `deepseek-bridge/deepseek-v4-flash`）；仅在 TM/builder 备注作“显示……”与第 26/27 条规则正文出现，允许。改法（可选）：两处备注统一为“显示 `deepseek-v4.1-flash`（仅显示名，禁入 Model 列）”，与第 26 条禁令措辞对齐。
- 结论③（双通道 A/B 不混不删表述清楚）：第 27 条“A=Bridge（`deepseek-flash`+`deepseek-bridge`，已测）/B=PI（显示名，精确 ID 暂按 `deepseek-flash`，Runtime 待测后定）+勿混勿删+测试只测 B+测后用户定归属”+第 26 条“route 只记备注禁入 Model 列”+第 22 条换池须改表，三层互锁，表述清楚；唯一混写即 P1-1，已给改法。

## 机检证据（本轮实跑）

- 表结构：管道行 12（含表头+分隔行），数据行 10，每行精确 5 列（role/主用/备用/Runtime/备注），角色 10 个无缺无重：task-manager、supervisor、builder、planner、code-reviewer、qa、product-reviewer、experience-recorder、neat-freak、senior-expert。
- Model 列扫描：零裸 `gpt-5.6` 别名（三处 codex 行均为 `codex/gpt-5.6-sol|terra|luna` 全 ID）；零 `deepseek-v4.1-flash` 入列；零旧兼容 alias 入列。

## P1P2修复复核（2026-09-11，code-reviewer只读复核，被检文件未改）

- 范围：根 `USER_MODEL_OVERRIDE.md`（29行实测）＋supervisor卡L23＋`2.1-更新说明.md:6`＋`HANDOFF.md:18/:28/:36`＋AGENTS账本/缓存/sop＋`2.0-重塑说明.md:7`＋`HANDOFF.template.md:14`＋task-manager卡L7＋`HANDOFF-2026-09-11-override主备.md:9/:10/:27-31`＋账本1行。机检：`rg deepseek-v4.1-flash`／`rg opencode-free`／`rg 待真测`＋`ls Contract路径`（不读内容）。

- ①P1-1禁令作用域闭环：`rg -n "deepseek-v4.1-flash" USER_MODEL_OVERRIDE.md` 现命中L9/L11/L25/L26/L27共5处，逐处归属：L9 TM备模型列＋L11 builder主模型列（Runtime均为codebuddy）→PI许（L27 B通道）；L25分工“B=codebuddy（`deepseek-v4.1-flash --effort high`，已测）”＋池映射`PI=codebuddy/`→PI定义位，许；L27 B通道“模型列`deepseek-v4.1-flash`，Runtime已填codebuddy”→PI许；L26为裁决规则本身：“禁把`deepseek-v4.1-flash`（PI显示名）填入Bridge模型列（Bridge只许`deepseek-flash`），PI列允许（见下条B通道）”＋“禁编造`deepseek-official/xxx`/测试期`…-expires-on-0910`/未验证ID”→Bridge禁＋PI许分开写，无一命中属Bridge禁。Bridge精确ID`deepseek-flash`仅出现在规则L25/L26/L27，表Model列零占用（当前主用B，A保留可切回），无混写。原“同ID既主用又禁造”自杀已解，闭环。
- ②P1-5独立行错开成立：supervisor卡L23现为“读USER_MODEL_OVERRIDE.md的supervisor行（独立行，与task-manager行错开，保复检独立性；冲突以模型表为准）”，不再是“同task-manager行”。TM L9（主`opencode-go/muse-spark-1.3-contributor`／备`deepseek-v4.1-flash`＋codebuddy）vs supervisor L10（主`opencode/muse-spark-1.3-contributor-free`／备`opencode-go/muse-spark-1.3-contributor`／Runtime空）主备池全错开（TM备PI vs supervisor备GO），TM双超限时监督者不共陷一池，独立性满足。闭环。
- ③P1-7路径ls确认（不读内容）：`ls Infrastructure/orca-deepseek-bridge/docs/V2.1_BRIDGE_INTEGRATION_CONTRACT.md`→`No such file`（分发包内无本体，符合L26“Contract存业务仓，分发包仅记本条结论，激活前回仓重放probe”之B选项）；`rg Contract`包内仅命中override:26自述＋`BUGS-2026-09-11:32`“不在包内，回业务仓重放”，与编排者:10“无Contract一律按待接入，不编造”一致（分发态记结论、激活前重放）。业务仓路径真值超出分发包边界，本轮只验引用一致＋包内缺席符合设计，留激活前回仓验证，不阻塞。条件过。
- ④P2别字/行号漂移：override行号全对上（L9 TM／L11 builder清“待真测”改已测＋BUGS指回；L22池子“B走codebuddy／TM主用只走OPENCODE_GO，备用B名单例外”；L25“已测＋FREE=`opencode/`＋`PI=codebuddy/`”；L26作用域＋业务仓路径＋仅记结论＋回仓重放；L27 Runtime已填＋只读rc0＋单发pong PASS＋主备已定，残留“批量压测待批”系额度后续非stale；L29“主用含`opencode/`且`-free`结尾＋旧`opencode-free/`视为`opencode/`＋Spark/mimo举例与现表L10/L11/L14/L16/L17一致）。`rg 待真测`零命中；`rg opencode-free/`仅L29历史引用1处，数据行零命中，触发器恒假已解。HANDOFF.md:18触发式括号／:5/:28/:36统一“日期最新一份”／:36“账本已恢复_example行（3行移入HANDOFF-2026-09-11存档）”；AGENTS:47 result任务级定义／:62 sop红线／:50缓存Runtime括号／:44 example行；2.0:7现主力指回override builder行；HANDOFF.template:14 permission行；task-manager:7“累计…2次（计数n/2…）”；HANDOFF-2026-09-11:9 verdict指回CODE_REVIEW/BUGS＋:10 `ses_***`脱敏＋:27-31母版实绩存档；账本现1行`_example`单行。历史快照（HANDOFF-2026-09-11:8/:20旧前缀、BUGS旧ID、本文P1/P3修前快照）neat-freak已记“行号无错故不改原文”，不算漂移。无新错别字。
- Result: 过，P0=0。

## P1-7改A复核（2026-09-11，code-reviewer只读复核，被检三件未改）

- 范围：包根 `V2.1_BRIDGE_INTEGRATION_CONTRACT.md`（149行实测）＋`USER_MODEL_OVERRIDE.md:26`＋`HANDOFF-2026-09-11-override主备.md:27`＋`编排者提示词.md:10`。被检增量与任务口径一致（Contract拷入＋L26改随包分发＋HANDOFF加修订行）。
- ①敏感信息结论：宜分发，无敏感外泄。实测：Contract内绝对路径全为占位符（`<ABS_WS>/<ABS_TASK>/<DSH_HOME>/wsKey/sessionId//abs/task.md`），无本机真实 `Users/home` 路径、无key/secret/token（`rg /Users/|/home/|sk-|api[_-]?key|secret` 仅命中§4 `--text` 说明行1处系英文单词误报）；session ID（`0018f7b3/bf3c06d6/20ea1b09…/67574c75…`）为Canary/Probe取证ID非密钥；`tools/orca/supervisor.mjs|dispatch.mjs|telemetry.mjs`＋`runtime/evidence/|runtime/bridge-state/`＋`ARCHITECTURE.md(§8-§10)`在分发包内均悬空（包内无`tools/`、无`ARCHITECTURE.md`），属“实现指回”非泄密，读者按L26/分发注记“更新以业务仓为准、激活前回仓重放”即不误用。P2 hygiene提示（不阻塞）：Contract L6 `[ARCHITECTURE.md](ARCHITECTURE.md)` 在分发态为死链，下轮可在分发注记补半句“ARCHITECTURE/tools/runtime只存业务仓”或去链；Contract §0/§18仍写旧route启用句，与§1/L26 canonical三元组并存，属业务仓原件内部stale，回仓修，不在分发侧改。
- ②字面冲突结论：无冲突，`:10`无需同步。`ls`包根文件名 `V2.1_BRIDGE_INTEGRATION_CONTRACT.md` 与L26引用逐字一致（含大小写）；L26“§1三元组”在Contract §1可查（`deepseek-flash`＋`deepseek-bridge`＋`deepseek-bridge/deepseek-flash`），“Probe session `0018f7b3`”与Contract §1同ID对上，“业务仓原件 `Infrastructure/orca-deepseek-bridge/docs/`＋更新重拷＋包内核对＋回仓重放”与Contract L8分发注记同路径同口径。编排者:10“channel/model ID以Contract/真实运行为准，无Contract一律按待接入，不编造”为条件句：现包内有Contract即走前半句（以Contract为准），后半句休眠作兜底，不与“随包分发”相斥。原件一致性超出分发包边界（TM已diff称仅多分发注记＋修正一处转录差），本轮采信＋激活前回仓核对覆盖，不阻塞。
- ③B转A闭环：闭环。P1-7三选一要求“选一个＋与:10对齐”：B轮（分发包无本体＋L26记结论＋回仓重放）已条件过；本轮A轮（Contract随包＋L26补包根路径＋HANDOFF:27记“Contract拷入包根…L26改随包分发”）满足A选项全件（本体在包＋路径可核＋:10前半句生效），B被A替代，无双轨残留。
- Result: 过，P0=0。

## B源修+P2复核（2026-09-11，code-reviewer只读复核，被检文件未改）

- 范围：业务仓源 `Infrastructure/orca-deepseek-bridge/docs/V2.1_BRIDGE_INTEGRATION_CONTRACT.md`（147行）＋包根拷贝 `V2.1_BRIDGE_INTEGRATION_CONTRACT.md`（149行）＋根 `USER_MODEL_OVERRIDE.md`（29行）＋`docs/handoff/HANDOFF.template.md:14`＋`外部开发者提示词.md:16`＋`AGENTS.md`＋`docs/handoff/HANDOFF-2026-09-11-override主备.md:1`＋`docs/qa/BUGS-2026-09-11-override主备.md:8`＋`2.1-更新说明.md:1`。被检增量与任务口径一致（源§0①②已落地＋§1-route/§16/§18.1新正典＋包拷同步＋override L22/L21/L9/L11＋HANDOFF.template/外部/AGENTS/HANDOFF-override/BUGS/更新说明尾巴）。
- ①源与包拷贝一致（除注记）：`diff -u 业务仓源 包根拷贝` 仅 `7a8,9` 两行新增（`> 分发注记…`＋`> 空行`，与包根L8-L9一致）；`wc -l` 业务147／包根149（149=147+2）。PASS。
- 源新正典在位（包拷同文）：§0 L12“①②已落地——模板侧Runtime列＋编排者派发口在位，2026-09-11复核”＋L14-L15双✅已落地；§1-route L20“禁别名…禁作新默认”＋L22 canonical三元组（Gate APPROVED＋`deepseek-flash`＋`deepseek-bridge`＋`deepseek-bridge/deepseek-flash`＋Probe `0018f7b3`＋“§0/§16/§18.1旧route一律读作兼容alias，不得再作新默认canonical”）；§16 L132账本`model`写`deepseek-flash`＋`rework`=supervisor打回；§18.1 L142 builder行A写法＋L145升级规则。两文件逐行同文（行号差2系注记位移）。PASS。
- ②旧alias合法命中只剩兼容声明：`rg -c "deepseek-bridge/deepseek-v4-flash"` 源=4／包=4，行位对应（源L14/L20/L132/L142＝包L16/L22/L134/L144，差2系注记位移），逐处均为“为兼容alias”＋“禁作新默认/不写虚构别名”，零实操默认；§1三元组行内“§0/§16/§18.1中的旧route一律读作兼容alias”系通用指称无字面旧串，不计入实操（任务口径）；Canary L29 `deepseek-v4-flash`（无前缀，42处实证）系Harness历史取证非alias。PASS。
- ③P2尾巴无漂移、Runtime瘦身未丢A：override L9/L11 Runtime列实测均为精确`codebuddy`（余8行均为`—（默认本窗口subagent）`，列值零`pi/codebuddy`）；L22“池子…builder主用B走codebuddy，A=Bridge保留可切回；TM主用只走OPENCODE_GO，备用B名单例外”无B真测前半句（`rg 待真测|待测`全表仅L27标题“留测待切”＋“批量压测待批”系额度后续，按既往复核非stale）；L21含“codebuddy通道用其原生ID见:27，调用形见备注`--model`”半句在位；A保留三处在位（L11“A已测保留”＋L22“A=Bridge保留可切回”＋L25/L27双轨“A保留可切回”），备注`pi默认glm/codebuddy默认hy3`系磁盘现状说明非Runtime列，未丢A。HANDOFF.template:14“格式见包根Contract §10 decisionFile＋approval”在位；外部:16“（EXT-WORKLOG 例外，见 §一.2）”在位；AGENTS L39“换模型/换 Runtime即开新链”＋L50“换 Runtime/换模型/升级即开新链”＋L29插座句在位拼写无漂移；HANDOFF-override首行“过程存档，现状以修订节＋复验报告为准”在位；BUGS QA-04状态PASS＋“已落地见override:21”在位；更新说明标题“（相对 2.0 只加缓存五条；09-11 增量见末节）”scope在位；全表`codebuddy/deepseek-flash/deepseek-v4.1-flash/deepseek-bridge`拼写零漂移。PASS。
- Result: 过，P0=0。

## 排布搬家复核（2026-09-11，只读）

- 范围：包根（两包冻结未看，`.git/`排除）＋`git diff HEAD`（git mv保留历史：3提示词→`docs/prompts/`、2说明→`docs/history/`、归位表→`docs/templates/`、6报告git rm、README新建、`.gitignore`加两包）。
- ①裸文件名：现行5处均带新前缀PASS；本文件历史节旧路径引用系搬家前快照，按包内历史不动冻结不改。
- ②`治理审查报告`字样：README已删上下文PASS；外部`:16`括号已改“历史审查报告已删见 README”（TM返工）。
- ③README地图与`ls -R`实测一致（roles×10/prompts×3/history×2/templates×1）；④Contract两处新路径`ls`在位。
- Result: 打回转PASS（外部:16一处TM已改），P0=0。

## 路径迁移注记（搬家前后对照，历史引用解码）

- `编排者提示词.md`→`docs/prompts/编排者提示词.md`；`外部开发者提示词.md`→`docs/prompts/外部开发者提示词.md`；`迁移整理提示词.md`→`docs/prompts/迁移整理提示词.md`；`2.0-重塑说明.md`→`docs/history/2.0-重塑说明.md`；`2.1-更新说明.md`→`docs/history/2.1-更新说明.md`；`归位表.template.md`→`docs/templates/归位表.template.md`；`治理审查报告/`已删（用户令，结论已落实）。本文件历史节旧路径按此表解码。

## y轮P2P3+逐派复核（2026-09-11，只读）

- 范围：builder:7/:8＋override:27/:28＋supervisor域隔离/抽查行＋BUGS残留句＋AGENTS逐派行＋TM卡逐派行＋HANDOFF.template主备句＋DISPATCH-LOG两行＋经验新一句。
- ①y轮六处：标题分层、判据放宽不致误判、三处判据互锁、A未删、域隔离、残留诚实——全PASS。
- ②逐派互锁：AGENTS/TM卡/监督卡/模板/显式五处同义、无新打回权；切备零行空过成立（正式备派须补三处，否则打回）。
- ③DISPATCH两行8键齐，TASK-MODEL-LOG仍示例单行。
- Result: 过，P0=0。

## -y备注补齐复核（2026-09-11，只读）

- 范围：`docs/roles/builder.md:8`新增行 vs `USER_MODEL_OVERRIDE.md:28`新增-y标注句 vs 已终检`:27`＋BUGS -y卡点验证节。
- ①无矛盾：builder:8为:27子集转述；:28系:27行为可观测化，证据支撑“rc不可判、须标注”。
- ②“漏标按缺派工要素打回”无打回权冲突：打回权仍在reviewer/supervisor，被动语义成立（polish可选，不阻塞）。
- Result: 过，P0=0。

## -y规则复核（2026-09-11，code-reviewer只读复核，被检override未改）

- 范围：根 `USER_MODEL_OVERRIDE.md:27` 新增 `-y` 半句 vs `docs/qa/BUGS-2026-09-11-override主备.md`“## -y卡点验证”（L149-162）。
- ①表述与证据一致（三点全对上，PASS）：
  - `-y` 名：override写“`-y`（`--dangerously-skip-permissions`）” vs BUGS L152 `--help` 原文“`-y, --dangerously-skip-permissions`”逐字一致。PASS。
  - 安全语义：override写“常规放行、HIGH/CRITICAL仍问” vs BUGS L152原文“`Bypass permission prompts (HIGH/CRITICAL still ask).`”准确转述，未夸大为全放行；`(default: false)` 未转述不影响（override侧是派工默认带参，非改CLI默认）。PASS。
  - rc判读：override写“无-y时模型Bash审批被拒且rc仍为0，验成功只看正文回显不看rc” vs BUGS L154 A无-y rc=0＋正文“`无法执行：Bash 工具权限被拒绝（非交互模式下无审批弹窗）。`”＋L156“预期输出…只是推断，不是实际运行结果”＋L158-161 B有-y rc=0＋正文“`probe-ok`”＋L162判定“A的rc=0是进程码，拒绝体现在正文而非非零退出码”。“rc仍0＋看正文”与证据一致，无反转。PASS。
- ②默认带-y与“不静默扣费/审批fail-closed”冲突结论：不冲突，过。
  - 不静默扣费（override:5/:24/:29，主备均超限停派找人）管的是模型额度/切备计费域；`-y` 管的是B通道单次Bash工具审批域，两者正交；BUGS B单发L66“tokens/费用回显：无”，-y未引入新扣费面。无冲突。
  - 审批fail-closed：A无-y被拒且无实跑输出证明默认拒绝闭合；-y后“HIGH/CRITICAL仍问”保留高风险护栏（--help原文），非全bypass；作用域锁死“L27 B非交互派工默认”，非全局默认；且L27头标“2026-09-11用户定”属授权执行。常规放行vs HIGH仍问成立，不违fail-closed。
- Result: 过，P0=0。

## 槽禁令S1E1复核（2026-09-11，只读）

- 槽禁令与:27/:28/换链无矛盾：“只走表定主用”指不经改表不自切（切回A须改表＋开新链）；禁顶指基础设施后端擅自顶替，非禁表定备用；B故障域与额度切备正交；在飞派收尾不断链。
- S1断言块三处字节同（45行，exit 0）；E1包内无报告自洽（经验:12通用落点规则非指回）；A1缺席正确（死指引不进包），旧挂重裁为预期差。
- Result: 过，P0=0。
