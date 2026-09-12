# HANDOFF｜ORCA V2.1 治理重塑（分发版，已冻结）

> 本文件为实例，拷进新项目时清空第 1-2 节照模板重写。

- 更新：2026-09-12，V2.1 Two-Phase Amendment（BatchA模型＋BatchB双阶段）C2两包同步＋zip重建（§9），GOVERNANCE_VERSION升2.2（用户定，Amendment转正）。未 commit（等用户指令）。
- 更新：2026-09-12，收编持续推进协议（§7）＋L3 watchdog 脚本进 `scripts/orchestration/`（§8），两包同步、zip 重建。未 commit（等用户指令）。
- 更新：2026-09-11，开发暂停收尾（已推 `b84e61d`）。历史旧报告6份已删；`docs/history/` 新增审查报告3份（-y轮/现势/逐派，未提交，待定去留）。现行结论以包内文件＋本 HANDOFF §1-§3 为准。

## 1. 当前工作进展（2026-09-11 开发暂停，已推 b84e61d）

- 模型表：10角色主备全定（`USER_MODEL_OVERRIDE.md`），全表20个ID真测PASS（codex短名sol/terra/luna、GO三ID、FREE两ID、B通道codebuddy单发pong）；FREE真前缀`opencode/`已全改，GO-mimo用base非Pro。
- B通道：`deepseek-v4.1-flash` via codebuddy（`--model … --effort high`，high写口头），2026-09-12起转备用（GO额度不够，主备对调）；`-y`规则/正文判据/显式标注照旧，切备B时用。A通道Bridge已测保留可切回，Contract随包（包根，业务仓源4处已改新正典）。
- builder槽：主用=FREE Spark（本窗口，2026-09-12用户定）；备用=B；超限按override:27主→备，备亦超限停派找人；槽位不经改表不得擅自顶替，换通道开新链记账。
- 逐派账：`docs/model/DISPATCH-LOG.jsonl` 新机制＋supervisor双断言（TASK＋DISPATCH），实测两派（经验/qa）exit 0；现冻回`_example`单行，实测摘要存HANDOFF-override存档节。
- 审查：P1-1→P1-7、B源修、y轮P2P3、逐派P1全闭环（qa挂1次被裁不成立，累计supervisor打回0/2）；P2尾巴（域隔离/判据/标题/QA-04关环）全修。
- 排布：三提示词→`docs/prompts/`、两说明→`docs/history/`、归位表→`docs/templates/`（git mv留历史）；README导航新建；两包常驻同步、本地已同步、不入库（ignored）。
- 账本：TASK＋DISPATCH均只留`_example`示例行（分发冻结）；母版实绩存 `HANDOFF-2026-09-11-override主备.md` 存档节。
- 未提交：`docs/history/` 审查报告3份（-y轮/现势/逐派）；两包本地改动（ignored，不进库）。线上最新 `b84e61d`。
- BatchA/B执行链（四要素＋链ID，supervisor打回补记）：planner(Sol/主/codex/PASS/ses_f6b95056)→builder(V4.1/主/codebuddy/PASS/ses_f6b922b8)→qa A4(V4.1/主/codebuddy/15-15/ses_f6b8fbb4)→reviewer(V4.1/主/codebuddy/过/ses_f6b8dcea)→supervisor(V4.1/主/codebuddy/0-2放B/ses_f6b8cddd)→builder B1-B6(V4.1/主/codebuddy/15文件/ses_f6b8ab97)→qa B7(V4.1/主/codebuddy/条件过/ses_f6b88af1)；明细见DISPATCH-LOG实录行。

## 2. 下一步任务（恢复开发按序做）

1. 定history 3份报告去留（提交入库 / 删除 / 留本地）：需用户一句话，定后push一轮。
2. 开新业务任务：planner拆→builder（B通道`-y`）→reviewer→qa→product→supervisor；每派贴显式两行（正在调用/回来了＋主备），收工记DISPATCH一行＋HANDOFF主备句，三处互验。
3. 母版每次改完同步两包并在HANDOFF记一行（常驻同步，`diff`非预期差零容忍；包内旧路径裸名系布局正确不改）。
4. 待验证（需另批额度才做）：B批量压测；HIGH/CRITICAL负测记残留不补测。
5. sop杂项去留（第6轮待定）：用户一句话即移出，之前勿动。

## 3. 注意事项及规矩（违反即打回）

- **模型表为准**：一切与 `USER_MODEL_OVERRIDE.md` 冲突以表为准（用户定）；精确ID禁别名（禁裸`gpt-5.6`、禁`deepseek-v4.1-flash`入Bridge列）；codex实调用剥`codex/`前缀用短名；codebuddy用原生ID见override:21。
- **builder主用FREE**：`opencode/muse-spark-1.3-contributor-free`（本窗口，2026-09-12用户定）；备用=B（`-y`＋显式标注照旧）；FREE耗尽按override:27，GO亦缺停派；换通道/换模型/换Runtime开新链记HANDOFF＋账本；槽位不经改表不得擅自顶替。
- **两域判据**：codebuddy自测看正文（含预期回显即可）；账本/脚本断言看exit码；互不引用。
- **逐派三处互验**：显式两行＋DISPATCH一行＋HANDOFF主备句；切备行HANDOFF/TASK/DISPATCH对上，supervisor抽查；`runtime`枚举（本窗口/codebuddy/deepseek-bridge/—）。
- **账本冻结**：分发包TASK/DISPATCH只留`_example`行，首任务/首派前删除；实绩记HANDOFF存档，不落分发账本。
- **两包常驻同步**：母版改完同步两包＋HANDOFF记一行，`diff`零容忍；两包不入库（ignored）；包内提示词原位裸名系布局正确。
- **切换口径**：换模型/换Runtime用户定；升级=主→备按表切，备亦超限停派找用户；FREE整批升GO已停用（GO无额度，2026-09-12用户定）。
- **绝不提“等免费模型恢复”**：换模型纯用户决策。模板里相关字眼已清完（用户显式说一句触发式不算恢复类条件，见 override:22），不准再写、再说、再设到期条件。
- **不动旧版**：一切只改 2.1 包（V1.10/V2.0 封存）。
- **副本不提交**：实验品，不 commit、不 push，用完扔。
- **单点对接**：只有编排者找用户，监督者平时静默。
- **computer-use**：先 `get-app-state --restore-window` 再按键盘；进详情页点站内链接，别跟地址栏较劲；看截图用 Read 读 path。
- **开工前读**：`经验一句话.md`（10 条）+ 本 HANDOFF。

## 4. 2026-09-09 两轮审查修复记录

- 修复状态见现行文件与 README（历史审查报告已按用户令删除，结论均已落实），本节只记本包变更（§5）。详见 §5 清单，本 § 只记状态，不复述结论。

## 5. 2.1 分支记录（2026-09-09）

- 本份从 2.0 正式版整拷，加缓存五条（AGENTS）+ 续 session（派工顺序/docs/prompts/编排者提示词）+ `GOVERNANCE_VERSION=2.1`，其余不变。2.0 正式版封存不动。

## 6. 分发冻结记一笔（2026-09-11）

- 含Runtime插座（override执行通道列+HANDOFF执行链行）；账本已恢复_example行（3行母版实绩移入 HANDOFF-2026-09-11-override主备.md 存档节）；§1已清空不继承历史；执行实录已删只留模板；历史审查报告已删，结论以现行包内文件为准。
- 收尾记一笔（neat-freak 2026-09-11）：对齐3处（经验9条计数、README根6件＋history报告注记、/tmp三文件已清）；未决：history 3报告去留、sop去留、B批量压测，以上均列§2，P0=0。

## 7. 持续推进协议收编记一笔（2026-09-12）

- 收编《2026-09-02 丨 Orca 通用编排者持续推进协议 丨 V1.1》进 docs/prompts/（原件在用户 Downloads，正文未改动，顶部加"收编说明"：只取防停摆三层监督/STATE.md/回合检查单/后台进程纪律/验证后再声称/R1-R5，§一动态角色论与十卡制冲突不采用；读取时机=外部通道长任务前或停摆恢复时；L3 launchd watchdog 仅外部编排部署）。
- 编排者提示词加一行"防停摆"指针（docs/prompts 与两包同步更新）；README docs/ 地图同步记一笔；两本地包已同步并重建 zip。未 commit（等用户指令）。
- 背景 prompted by 用户：怕编排者中途停摆无人推；现存体系无机械 watchdog，supervisor“失联替喊”在 subagent 模式下不成立——本收编补此缺口。

## 8. L3 watchdog 脚本收编记一笔（2026-09-12）

- 收编 `coordinator-watchdog-standalone.sh`（零配置版，原件 Downloads/大模型 HANDOFF）→ 根 `scripts/orchestration/`，配部署 README（一条命令装 launchd、验证三件事、env 覆盖表、部署边界）。功能：自动发现 Run→查四类漂移（worker 失联/dispatched 悬空/worker_done 未消费/传输丢失）→带 15 分钟冷却戳醒协调者；只唤醒不代做。
- 分发版 README 根目录地图 6→7 记 scripts/orchestration/ 一行；两包均加 `scripts/orchestration/`（脚本+README），包 README「同步补记」各加去向一行；两 zip 重建并验证包内含 watchdog 文件。未 commit（等用户指令）。
- 现存参考：用户机已有项目级 watchdog 部署一例（0907懒得打字 plist，launchctl 状态码 2 待下次编排时验证）；通用部署（本包方案）尚未在任何项目安装。
- 部署测试已交接：任务书在 `docs/handoff/HANDOFF-2026-09-12-watchdog部署测试.md`，由用户交 Orca 编排者执行；验收后回写本节一行。

## 9. 升2.2记一笔（Two-Phase Amendment转正，2026-09-12）

- V2.2（BatchA＋BatchB，Amendment转正，GOVERNANCE_VERSION已升2.2，用户定）：母版主动文件已同步两包（override新表＋10卡＋AGENTS两阶段＋编排者三口令＋PRODUCT_PLAN/RESEARCH_REVIEW双新模板＋PLAN两行＋HANDOFF六字段＋协议两阶段优先一行＋双账本示例行＋双包README去向行；AGENTS裸名1行保留；supervisor断言块两包与母版字节同），预期差仅扁平包裸名4行（AGENTS×1/Contract×2/迁移整理×1，布局正确）＋外部提示词history半句（包无history/省略合理），两ZIP重建并校验非旧缓存，未 commit（等用户指令）。
- 收尾记一笔（neat-freak 2026-09-12）：对齐6处（README版本2.1→2.2、HANDOFF经验9→10条、§3行号:29→override:27×2＋:27→override:21＋override:29→:22；经验14行/10条×3处一致、GOV三处2.2一致、ZIP为本轮新建无需重建）；清/tmp：one*.jsonl与qa-bad均无残留（/tmp仅存09-10/09-11旧combined/fbcap/sup_test三文件非本轮产物不动，包内无临时文件）；未决：builder/supervisor卡override:27三处（实指-y规则现为:25）母版与两包字节同故未动，待TM定是否另开变更同步三处＋重建ZIP。
