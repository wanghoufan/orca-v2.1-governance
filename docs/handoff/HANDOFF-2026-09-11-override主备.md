# HANDOFF｜override主备+双通道+显式+FREE规则（2026-09-11，过程存档，现状以修订节＋复验报告为准）

- Captured at（YYYY-MM-DD HH:MM）：2026-09-11
- Stage ID（本阶段叫什么）：override主备表结构+冒烟（分发版内治理改）
- 剩 P0（没完的才列，多一条都不行）：
  - Q1：TM备Runtime填pi/codebuddy还是留空+护栏（L9+L27），附B只读探针语句
  - Q2：GO mimo精确ID（L14/L16 `opencode-go/mimo-v2.5`是否即正式）
  - Q3：FREE Spark精确ID书面认领（L10/L11/L17 `opencode-free/muse-spark-1.3-contributor-free`是否即正式）
- 当前 Task（正干到哪）（累计打回 n/2，supervisor每次打回时TM同步更新）：结论见 CODE_REVIEW/BUGS 对应节，本 HANDOFF 只记 trace＋链 ID；状态：reviewer/qa/supervisor/调研A/B/补测/终验各派已收（见执行链行与修订节）
- 执行链/Session（可选）：普通subagent链各派已收（链 ID `ses_***` 母版实录已脱敏，拷包清空；真 resume 通道填实链；TM只记录不手造）
- 未闭环评审意见（code-reviewer/qa 留的还没改的）：
  - P1-1 builder备注A/B混写（L11 Runtime bridge vs备注pi）：待Q1定B后按reviewer改法修备注
  - P1-2 TM备跨池护栏（L9+第22条）：待Q1定后补护栏措辞二选一
  - P1 QA-04 codex路由ID剥前缀：下一步在override或本HANDOFF补一句，不阻塞本轮
  - P1 QA-05 B通道未测：待Q1给B探针语句后补测
- docs 落盘清单（本轮新增/改了哪几个 docs 文件）：
  - 改：根 USER_MODEL_OVERRIDE.md（到期列→主用/备用+自动切+双通道A已测B待测+派工显式+FREE耗尽整批升GO，共29行）
  - 新：docs/review/CODE_REVIEW-2026-09-11-override主备.md（过 P0=0）
  - 新：docs/qa/BUGS-2026-09-11-override主备.md（挂 P0×3转Q1-3）
  - 新：本HANDOFF；账本追加一行（首个真实任务，已删_example行）
- 下一步（Next Single Action）：用户答Q1-3 → TM落盘改表去待确认 → 补P1护栏+剥前缀一句 → 重跑qa补测后清P0
- 人要拍什么板（列出来问，不问不许开工）：Q1 TM备Runtime+ B探针语句；Q2 GO mimo精确ID；Q3 FREE Spark认领
- 收尾记一笔：跳planner/product原因单文件小修29行+测试系qa本职；账本FAIL诚实（qa挂证据）；经验/neat-freak收尾按需另派，本轮未派
- 修订（ID核准轮）：调研A/B查实→Q1 B=`deepseek-v4.1-flash` via codebuddy（只读rc=0，真测待批）TM备/builder主切B+A保留、Q2 GO mimo base确认、Q3 FREE真前缀`opencode/`（5行全改）+codex剥前缀一句；qa补测过P0=0；supervisor终检过打回0/2；账本补第二行PASS；L29 FREE触发器为常设条件保留。
- 修订（全表真测轮）：B单发rc0 pong PASS；codex sol/luna各rc0 pong PASS（1.2万tokens级）；GO三ID 3/3 PASS；FREE两ID 2/2 PASS无429不触发升GO；20ID全落已测，仅A沿用已测结论；supervisor终验过打回0/2；账本补第三行PASS；剩P0=0收工。
- 修订（P1P2轮）：P1-1禁令加作用域/P1-2触发前缀现表化/P1-3账本冻回_example+3行存档/P1-4更新说明补增量/P1-5监督独立行（模型表为准）/P1-6清待真测/P1-7B指回业务仓Contract路径；P2十项文本全修（sop文件未移出留待明令）；reviewer过+qa三组过+supervisor终检过打回0/2；待二次push明令。
- 修订（P1-7改A轮，用户定）：Contract拷入包根（diff仅多分发注记，已修正一处转录差），L26改随包分发；待复检后连P1P2轮改动一次push。
- 修订（B源修轮，用户定B）：业务仓源§0①②改已落地＋4处改新正典（该仓其余未提交改动非本轮所动，不代提交），重拷进包；P2-A~J全修（QA-04关环）；reviewer过+qa过+supervisor终检过打回0/2；本轮不落账本行（P1-3原则）；待push明令。
- 修订（排布搬家轮，用户定B）：三提示词→docs/prompts/、两说明→docs/history/、归位表→docs/templates/（git mv），6报告git rm（用户令），README新建，两包ignore不入库；引用同步＋HANDOFF报告指回改现行；reviewer打回1处（外部:16）TM已改、qa历史三行冻结加注记；supervisor终检过打回0/2；初级builder=DeepSeek与表一致；待push明令。
- 修订（-y卡点轮，别项目结论已复现）：codebuddy非交互无-y时Bash审批被拒（rc仍0，看正文判）、加-y常规放行HIGH/CRITICAL仍问（--help原文）；B派工默认带-y，规则进override:27，证据BUGS -y卡点验证节。
- 修订（-y备注轮）：builder卡:8＋override:28显式-y标注补齐（漏标打回），reviewer过+qa过+supervisor过打回0/2；待push批次并入。
- 修订（y轮P2P3+逐派轮）：P2域限定×2+标题+判据放宽+勿删通道、P3残留三句全修；逐派账四规则+DISPATCH两行（used主×2，切备空过）+经验一句+schema exit0；reviewer过+qa两派过+supervisor过打回0/2；history两报告属另任务不并入；待push明令。
- 修订（builder槽强制轮，用户P0令）：派工基础设施后端≠表定B通道，builder槽被muse-spark顶（偏离）；自本轮起只走表定主用，禁令进override builder行＋两包同步；在飞派收尾；换通道开新链；B不通贴原文停派不自回切。本次偏离记HANDOFF（分发账本P1-3冻结，代账本备注）。S1/E1补齐；A1维持缺席正确（死指引不进包，听reviewer）。
- 修订（槽轮终检）：reviewer过+qa挂被裁不成立（E1包内无报告）+supervisor过打回0/2；待push明令。

## 母版实绩存档（分发冻结前移出账本，P1-3）
- `{"task":"TASK-override主备-2026-09-11","result":"FAIL","rework":0,"role":"task-manager","model":"opencode-go/muse-spark-1.3-contributor"}`
- `{"task":"TASK-override-ID核准-2026-09-11","result":"PASS","rework":0,"role":"task-manager","model":"opencode-go/muse-spark-1.3-contributor"}`
- `{"task":"TASK-全表真测-2026-09-11","result":"PASS","rework":0,"role":"qa","model":"opencode/mimo-v2.5-free"}`
- 全行含 date/project/escalated/tokens/cost_cny 键（略写），账本已恢复 `_example` 示例行供新项目首任务前删除。
- 逐派实测存档（P1-1冻回，TASK-dispatchlog-test-2026-09-11）：experience-recorder主`opencode/mimo-v2.5-free` PASS＋qa主同模型PASS（used主×2，切备零行）。

## 跳步记一句
单文件小修（仅override表29行）跳planner/product，不跳code-reviewer+qa+supervisor，合规。
- 收尾记一笔（neat-freak）：对齐PASS——表10行×5列（L9-L18，表头L7+分隔L8，共29行实测，任务口径30行以实测29为准）；FREE前缀5处均为`opencode/`（L10/L11/L14/L16/L17）零`opencode-free/`入ID列（仅L29触发史述1次非ID）；Model列`deepseek-v4.1-flash`仅L9备/L11主两处且Runtime均为codebuddy，合法有据（QA B真测rc0 pong+只读rc0）；review/qa/HANDOFF引用行号均对上（review P1/P3系修前快照、QA补测L49-L54系修后现状，行号无错故不改原文）；清`/tmp/one.jsonl`（1行，系账本第3行暂存副本，已落盘无损删）；未决无（P0=0；cosmetic备注：L9/L11/L25/L27“待真测”字样去留待用户下一轮一句话，不阻塞；冻结实例HANDOFF.md/业务文件/secrets均未动）。
