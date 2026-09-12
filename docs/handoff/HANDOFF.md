# HANDOFF｜ORCA V2.1 治理重塑（分发版，已冻结）

> 本文件为实例，拷进新项目时清空第 1-2 节照模板重写。

- 更新：2026-09-11，开发暂停收尾（已推 `b84e61d`）。历史旧报告6份已删；`docs/history/` 新增审查报告3份（-y轮/现势/逐派，未提交，待定去留）。现行结论以包内文件＋本 HANDOFF §1-§3 为准。

## 1. 当前工作进展（2026-09-11 开发暂停，已推 b84e61d）

- 模型表：10角色主备全定（`USER_MODEL_OVERRIDE.md`），全表20个ID真测PASS（codex短名sol/terra/luna、GO三ID、FREE两ID、B通道codebuddy单发pong）；FREE真前缀`opencode/`已全改，GO-mimo用base非Pro。
- B通道：主用 `deepseek-v4.1-flash` via codebuddy（`--model … --effort high`，high写口头），非交互默认带`-y`（常规放行、HIGH/CRITICAL仍问）；无-y被拒时rc仍0，验成功看正文不看rc（仅codebuddy域）；派单须显式标`-y`已带，漏标打回。A通道Bridge已测保留可切回，Contract随包（包根，业务仓源4处已改新正典）。
- builder槽：只走表定B主用，muse-spark禁顶槽；在飞派收尾；换通道开新链记HANDOFF＋账本；B不通贴原文停派找人，不自回切（本次偏离已记存档）。
- 逐派账：`docs/model/DISPATCH-LOG.jsonl` 新机制＋supervisor双断言（TASK＋DISPATCH），实测两派（经验/qa）exit 0；现冻回`_example`单行，实测摘要存HANDOFF-override存档节。
- 审查：P1-1→P1-7、B源修、y轮P2P3、逐派P1全闭环（qa挂1次被裁不成立，累计supervisor打回0/2）；P2尾巴（域隔离/判据/标题/QA-04关环）全修。
- 排布：三提示词→`docs/prompts/`、两说明→`docs/history/`、归位表→`docs/templates/`（git mv留历史）；README导航新建；两包常驻同步、本地已同步、不入库（ignored）。
- 账本：TASK＋DISPATCH均只留`_example`示例行（分发冻结）；母版实绩存 `HANDOFF-2026-09-11-override主备.md` 存档节。
- 未提交：`docs/history/` 审查报告3份（-y轮/现势/逐派）；两包本地改动（ignored，不进库）。线上最新 `b84e61d`。

## 2. 下一步任务（恢复开发按序做）

1. 定history 3份报告去留（提交入库 / 删除 / 留本地）：需用户一句话，定后push一轮。
2. 开新业务任务：planner拆→builder（B通道`-y`）→reviewer→qa→product→supervisor；每派贴显式两行（正在调用/回来了＋主备），收工记DISPATCH一行＋HANDOFF主备句，三处互验。
3. 母版每次改完同步两包并在HANDOFF记一行（常驻同步，`diff`非预期差零容忍；包内旧路径裸名系布局正确不改）。
4. 待验证（需另批额度才做）：B批量压测；HIGH/CRITICAL负测记残留不补测。
5. sop杂项去留（第6轮待定）：用户一句话即移出，之前勿动。

## 3. 注意事项及规矩（违反即打回）

- **模型表为准**：一切与 `USER_MODEL_OVERRIDE.md` 冲突以表为准（用户定）；精确ID禁别名（禁裸`gpt-5.6`、禁`deepseek-v4.1-flash`入Bridge列）；codex实调用剥`codex/`前缀用短名；codebuddy用原生ID见:27。
- **builder只走B**：`deepseek-v4.1-flash` via codebuddy＋`-y`＋显式标注；muse-spark禁顶槽；在飞收尾；换通道/换模型/换Runtime开新链记HANDOFF＋账本；B不通贴原文停派找人，不自回切。
- **两域判据**：codebuddy自测看正文（含预期回显即可）；账本/脚本断言看exit码；互不引用。
- **逐派三处互验**：显式两行＋DISPATCH一行＋HANDOFF主备句；切备行HANDOFF/TASK/DISPATCH对上，supervisor抽查；`runtime`枚举（本窗口/codebuddy/deepseek-bridge/—）。
- **账本冻结**：分发包TASK/DISPATCH只留`_example`行，首任务/首派前删除；实绩记HANDOFF存档，不落分发账本。
- **两包常驻同步**：母版改完同步两包＋HANDOFF记一行，`diff`零容忍；两包不入库（ignored）；包内提示词原位裸名系布局正确。
- **切换口径**：换模型/换Runtime用户定；授权名单内同角色自切＋记账，双超限停派；FREE耗尽用户说一句整批升GO（`opencode/`＋`-free`结尾），切回再说一句。
- **绝不提“等免费模型恢复”**：换模型纯用户决策。模板里相关字眼已清完（用户显式说一句触发式不算恢复类条件，见 override:29），不准再写、再说、再设到期条件。
- **不动旧版**：一切只改 2.1 包（V1.10/V2.0 封存）。
- **副本不提交**：实验品，不 commit、不 push，用完扔。
- **单点对接**：只有编排者找用户，监督者平时静默。
- **computer-use**：先 `get-app-state --restore-window` 再按键盘；进详情页点站内链接，别跟地址栏较劲；看截图用 Read 读 path。
- **开工前读**：`经验一句话.md`（9 条）+ 本 HANDOFF。

## 4. 2026-09-09 两轮审查修复记录

- 修复状态见现行文件与 README（历史审查报告已按用户令删除，结论均已落实），本节只记本包变更（§5）。详见 §5 清单，本 § 只记状态，不复述结论。

## 5. 2.1 分支记录（2026-09-09）

- 本份从 2.0 正式版整拷，加缓存五条（AGENTS）+ 续 session（派工顺序/docs/prompts/编排者提示词）+ `GOVERNANCE_VERSION=2.1`，其余不变。2.0 正式版封存不动。

## 6. 分发冻结记一笔（2026-09-11）

- 含Runtime插座（override执行通道列+HANDOFF执行链行）；账本已恢复_example行（3行母版实绩移入 HANDOFF-2026-09-11-override主备.md 存档节）；§1已清空不继承历史；执行实录已删只留模板；历史审查报告已删，结论以现行包内文件为准。
- 收尾记一笔（neat-freak 2026-09-11）：对齐3处（经验9条计数、README根6件＋history报告注记、/tmp三文件已清）；未决：history 3报告去留、sop去留、B批量压测，以上均列§2，P0=0。
