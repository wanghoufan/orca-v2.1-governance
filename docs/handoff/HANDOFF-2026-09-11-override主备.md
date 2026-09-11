# HANDOFF｜override主备+双通道+显式+FREE规则（2026-09-11）

- Captured at（YYYY-MM-DD HH:MM）：2026-09-11
- Stage ID（本阶段叫什么）：override主备表结构+冒烟（分发版内治理改）
- 剩 P0（没完的才列，多一条都不行）：
  - Q1：TM备Runtime填pi/codebuddy还是留空+护栏（L9+L27），附B只读探针语句
  - Q2：GO mimo精确ID（L14/L16 `opencode-go/mimo-v2.5`是否即正式）
  - Q3：FREE Spark精确ID书面认领（L10/L11/L17 `opencode-free/muse-spark-1.3-contributor-free`是否即正式）
- 当前 Task（正干到哪）（累计打回 n/2，supervisor每次打回时TM同步更新）：本Task累计supervisor打回 0/2；reviewer过P0=0；qa挂P0×3均为已知待确认已转Q1-3；supervisor有条件放行不打回
- 执行链/Session（可选）：普通subagent链，code-reviewer ses_f719fbc7effeNTiHzuhfPyNqV2、qa ses_f719fbc6affewEF1GQNmYA4pT6、supervisor ses_f719e1b0fffeR12EVgrFOrLkXy；TM只记录不手造
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

## 跳步记一句
单文件小修（仅override表29行）跳planner/product，不跳code-reviewer+qa+supervisor，合规。
- 收尾记一笔（neat-freak）：对齐PASS——表10行×5列（L9-L18，表头L7+分隔L8，共29行实测，任务口径30行以实测29为准）；FREE前缀5处均为`opencode/`（L10/L11/L14/L16/L17）零`opencode-free/`入ID列（仅L29触发史述1次非ID）；Model列`deepseek-v4.1-flash`仅L9备/L11主两处且Runtime均为codebuddy，合法有据（QA B真测rc0 pong+只读rc0）；review/qa/HANDOFF引用行号均对上（review P1/P3系修前快照、QA补测L49-L54系修后现状，行号无错故不改原文）；清`/tmp/one.jsonl`（1行，系账本第3行暂存副本，已落盘无损删）；未决无（P0=0；cosmetic备注：L9/L11/L25/L27“待真测”字样去留待用户下一轮一句话，不阻塞；冻结实例HANDOFF.md/业务文件/secrets均未动）。
