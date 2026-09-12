# HANDOFF｜ORCA 治理重塑（分发版）

> 本文件为实例，拷进新项目时清空第 1-2 节照模板重写。

- 更新：2026-09-12，模型与双阶段整改＋C2两包同步＋zip重建（§9），版本标记文件改指针语（版本真相以Git历史为准）。
- 更新：2026-09-12，收编持续推进协议（§7）＋L3 watchdog 脚本进 `scripts/orchestration/`（§8），两包同步、zip 重建。
- 更新：2026-09-11，开发暂停收尾（已推 `b84e61d`）。历史旧报告6份已删；`docs/history/` 新增审查报告3份（-y轮/现势/逐派，未提交，待定去留）。现行结论以包内文件＋本 HANDOFF §1-§3 为准。

## 1. 当前工作进展（2026-09-12，现势）

- 模型表（`USER_MODEL_OVERRIDE.md`现行）：TM=FREE／supervisor=V4.1+codebuddy／builder=V4.1+codebuddy（-y默认带）／planner=Sol／reviewer=V4.1（独立Session）／qa=V4.1／product=FREE（Research Reviewer，Phase1按需）／recorder/neat=V4.1／senior=Sol；`OPENCODE_GO=MANUAL_ONLY`，Bridge standby。
- 治理：PHASE_1_PLAN→WAITING_HUMAN_APPROVAL→PHASE_2_DEVELOP＋Human Gate＋Change A/B/C＋DEV_BASELINE＋双新模板＋HANDOFF六字段；9+1不新增，TM/supervisor独立。
- 验证：Model Gate 15/15、PhaseGate门禁四项全过、C1回归全过、Sol外审PASS（P0=0/P1=0/P2清完）→PROMOTION_READY。
- watchdog：本机已部署运行（2分钟一轮，三件事全过），旧0907任务共存。
- Canary：截图/读屏/判断PASS，点击/输入未过、滚动/端到端未测→V4.1真机QA保持"待验证"。
- 版本：版本标记文件（三处＋ZIP内，指针语）；两包＋ZIP已同步；账本冻_example（9实录行在DISPATCH，存档在HANDOFF-override）。

## 2. 下一步任务（恢复开发按序做）

1. 开第一单业务（`第一阶段，计划`）：Sol Planner长对话→PRODUCT PLAN→Research Reviewer→Readiness≥90→你拍板→`第二阶段，开发`。
2. Canary重测（有桌面通道/新模型时）：点击/输入/滚动/端到端四项，按qa门禁"七项全过才写已启用"。
3. 母版每次改完同步两包＋HANDOFF记一行（常驻同步，`diff`零容忍；包内旧路径裸名系布局正确不改）。
4. 下次分发前冻回DISPATCH-LOG仅_example（P2-4待办）。
5. sop杂项去留：用户一句话即移出，之前勿动。

## 3. 注意事项及规矩（违反即打回）

- **模型表为准**：一切与 `USER_MODEL_OVERRIDE.md` 冲突以表为准（用户定）；精确ID禁别名（禁裸`gpt-5.6`、禁`deepseek-v4.1-flash`入Bridge列）；codex实调用剥`codex/`前缀用短名；codebuddy用原生ID见override:21。
- **builder主用V4.1**：`deepseek-v4.1-flash` via codebuddy＋`-y`＋显式标注；FREE不得顶Builder槽；换通道/换模型/换Runtime开新链记HANDOFF＋账本；B不通贴原文停派找人，不自回切。
- **两域判据**：codebuddy自测看正文（含预期回显即可）；账本/脚本断言看exit码；互不引用。
- **逐派三处互验**：显式两行＋DISPATCH一行＋HANDOFF主备句；切备行HANDOFF/TASK/DISPATCH对上，supervisor抽查；`runtime`枚举（本窗口/codebuddy/deepseek-bridge/—）。
- **账本冻结**：分发包TASK/DISPATCH只留`_example`行，首任务/首派前删除；实绩记HANDOFF存档，不落分发账本。
- **两包常驻同步**：母版改完同步两包＋HANDOFF记一行，`diff`零容忍；两包已入库跟踪；包内提示词原位裸名系布局正确。
- **切换口径**：换模型/换Runtime用户定；升级=主→备按表切，备亦超限停派找用户；FREE整批升GO已停用（GO无额度，2026-09-12用户定）。
- **绝不提“等免费模型恢复”**：换模型纯用户决策。模板里相关字眼已清完（用户显式说一句触发式不算恢复类条件，见 override:22），不准再写、再说、再设到期条件。
- **不动旧版**：一切只改当前治理包（旧版封存）。
- **副本不提交**：实验品，不 commit、不 push，用完扔。
- **单点对接**：只有编排者找用户，监督者平时静默。
- **computer-use**：先 `get-app-state --restore-window` 再按键盘；进详情页点站内链接，别跟地址栏较劲；看截图用 Read 读 path。
- **开工前读**：`经验一句话.md`（10 条）+ 本 HANDOFF。

## 4. 2026-09-09 两轮审查修复记录

- 修复状态见现行文件与 README（历史审查报告已按用户令删除，结论均已落实），本节只记本包变更（§5）。详见 §5 清单，本 § 只记状态，不复述结论。

## 5. 分支记录（2026-09-09）

- 本份从旧版正式版整拷，加缓存五条（AGENTS）+ 续 session（派工顺序/docs/prompts/编排者提示词）+ 版本标记文件，其余不变。旧版封存不动。

## 6. 分发冻结记一笔（2026-09-11）

- 含Runtime插座（override执行通道列+HANDOFF执行链行）；账本已恢复_example行（3行母版实绩移入 HANDOFF-2026-09-11-override主备.md 存档节）；§1已清空不继承历史；执行实录已删只留模板；历史审查报告已删，结论以现行包内文件为准。
- 收尾记一笔（neat-freak 2026-09-11）：对齐3处（经验9条计数、README根6件＋history报告注记、/tmp三文件已清）；未决：history 3报告去留、sop去留、B批量压测，以上均列§2，P0=0。

## 7. 持续推进协议收编记一笔（2026-09-12）

- 收编《Orca 通用编排者持续推进协议》进 docs/prompts/（原件在用户 Downloads，正文未改动，顶部加"收编说明"：只取防停摆三层监督/STATE.md/回合检查单/后台进程纪律/验证后再声称/R1-R5，§一动态角色论与十卡制冲突不采用；读取时机=外部通道长任务前或停摆恢复时；L3 launchd watchdog 仅外部编排部署）。
- 编排者提示词加一行"防停摆"指针（docs/prompts 与两包同步更新）；README docs/ 地图同步记一笔；两本地包已同步并重建 zip。未 commit（等用户指令）。
- 背景 prompted by 用户：怕编排者中途停摆无人推；现存体系无机械 watchdog，supervisor“失联替喊”在 subagent 模式下不成立——本收编补此缺口。

## 8. L3 watchdog 脚本收编记一笔（2026-09-12）

- 收编 `coordinator-watchdog-standalone.sh`（零配置版，原件 Downloads/大模型 HANDOFF）→ 根 `scripts/orchestration/`，配部署 README（一条命令装 launchd、验证三件事、env 覆盖表、部署边界）。功能：自动发现 Run→查四类漂移（worker 失联/dispatched 悬空/worker_done 未消费/传输丢失）→带 15 分钟冷却戳醒协调者；只唤醒不代做。
- 分发版 README 根目录地图 6→7 记 scripts/orchestration/ 一行；两包均加 `scripts/orchestration/`（脚本+README），包 README「同步补记」各加去向一行；两 zip 重建并验证包内含 watchdog 文件。未 commit（等用户指令）。
- 现存参考：用户机已有项目级 watchdog 部署一例（0907懒得打字 plist，launchctl 状态码 2 待下次编排时验证）；通用部署（本包方案）尚未在任何项目安装。
- 部署测试已交接：任务书在 `docs/handoff/HANDOFF-2026-09-12-watchdog部署测试.md`，由用户交 Orca 编排者执行；验收后回写本节一行。
- 本机部署验收（2026-09-12，TM直装，用户令"装"）：`~/bin/`脚本已拷＋`~/Library/LaunchAgents/com.orca.coordinator-watchdog.plist`已写（plutil OK）＋`launchctl load`成功，三件事全过（①list可见 ②kickstart exit 0 ③`/tmp/coordinator-watchdog.log` 16:04:09评估记录ok）；旧部署`com.orca.watchdog.ing丨0907懒得打字安卓版本`（last exit 1）Label不同共存，不卸载；未commit（任务书红线）。
- Canary结论（2026-09-12，V4.1 codebuddy实测，用户令"开始测"，共4单发）：截图PASS（3200×1800真像素已验）／读屏PASS（16:01/搜索/2026年9月12日14:35三项全对）／判断PASS；点击未过（AppleScript能点但目标未命中，前台被切Avalonia一次，无视觉闭环）／输入未过（两次keystroke均未落盘）／滚动未测／端到端未完成→四项PENDING；结论：V4.1真机QA保持"待验证"，不得写已启用；scratch图已清，前台App需用户自行点回。
- 收尾记一笔（neat-freak 2026-09-12）：对齐4处全过（§8三件事↔任务书§3四项已实验真、Canary 3PASS+4PENDING与qa门禁"七项全过才写已启用"一致、§1 superseded注不误导、版本标记V2.1名冻结/GOV2.2一致＋md5四方4464dfb3验过）；补清/tmp Canary裁剪3件（c_left/menu/right，bridge旧物4件不动，包内仅.DS_Store不动，watchdog日志保留）；未决：无新增，旧pending（builder/supervisor卡:27实指:25）本轮查已为:25即闭环，前台App点回仍需用户自理。

## 9. 转正记一笔（2026-09-12）

- 转正记一笔（BatchA＋BatchB，版本标记改指针语，用户定）：母版主动文件已同步两包（override新表＋10卡＋AGENTS两阶段＋编排者三口令＋PRODUCT_PLAN/RESEARCH_REVIEW双新模板＋PLAN两行＋HANDOFF六字段＋协议两阶段优先一行＋双账本示例行＋双包README去向行；AGENTS裸名1行保留；supervisor断言块两包与母版字节同），预期差仅扁平包裸名4行（AGENTS×1/Contract×2/迁移整理×1，布局正确）＋外部提示词history半句（包无history/省略合理），两ZIP重建并校验非旧缓存，未 commit（等用户指令）。
- 收尾记一笔（neat-freak 2026-09-12）：对齐6处（README版本2.1→2.2、HANDOFF经验9→10条、§3行号:29→override:27×2＋:27→override:21＋override:29→:22；经验14行/10条×3处一致、GOV三处2.2一致、ZIP为本轮新建无需重建）；清/tmp：one*.jsonl与qa-bad均无残留（/tmp仅存09-10/09-11旧combined/fbcap/sup_test三文件非本轮产物不动，包内无临时文件）；未决：builder/supervisor卡override:27三处（实指-y规则现为:25）母版与两包字节同故未动，待TM定是否另开变更同步三处＋重建ZIP。
- Sol外审P2整改（2026-09-12，TM执行）：P2-1/README版本声明已加；P2-2/AGENTS planner格补PRODUCT_PLAN入口；P2-3/§1标superseded；P2-4/待办：下次分发前冻回DISPATCH-LOG仅_example；P2-6/watchdog md5四方同`4464dfb3`（包根/两包/Downloads源）已闭环；P2-7/协议顶注行在位、"真机QA已启用"零虚假断言（仅qa.md门禁条件句）。P2-5/P2-8无需改。

## 10. 去版本号记一笔（2026-09-12，用户定：版本真相只认Git历史）

- 改名13处（git mv留历史）：根合同、history两说明＋3审查报告＋整改方案、prompts协议、sop交接上下文、两包合同＋协议；目录名与仓库名冻结当编号不动。
- 内容去版本：现行标题/规则/口令/映射中数字版本号清零（版本标记文件改指针语"以Git历史为准"）；冻结类内容（审查报告/BUG单/合同正文/执行记录）只改名不动正文；README加改名对照节过渡老链接。
- 返工记一笔：reviewer打回P0=3（口令×6/老包README/脚本死链×3）＋supervisor打回（两包模板标题）均已修，终检过，累计打回1/2；ZIP重建ZERO验。
