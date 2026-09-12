# CODE REVIEW

- Task: BatchA复核（A1新表＋A2 9卡＋A3 AGENTS模型节＋A4双账本＋ModelGate，只读不改被检输出）
- Commit: 工作区diff基线（Contract未改；AGENTS仅模型句1行；详见机检）
- Reviewer: code-reviewer
- Result: 过（P0=0；P1=0；P2×1顺手修，不拦门，不进BatchB门禁）

> Dispatch / Evidence ID 系字段 2.0 已废弃，不填。

## P0 / P1 Findings

- P0（①新表10行 vs 方案§3.1）：PASS。`USER_MODEL_OVERRIDE.md:9-18`逐项对上：TM=FREE（本窗口，备V4.1可选）／supervisor=V4.1+codebuddy／builder=V4.1+codebuddy／planner=`codex/gpt-5.6-sol`+codex／reviewer=V4.1／qa=V4.1／product-reviewer=FREE（本窗口）／recorder=V4.1／neat=V4.1／senior=`codex/gpt-5.6-sol`+codex；备用列零GO（`rg -n "opencode-go/" USER_MODEL_OVERRIDE.md`无匹配EXIT:1，本轮实跑复验）。
- P0（②GO残留）：PASS。GO字样母版仅两处规则文字：override:5（不自动进GO）＋:22（`OPENCODE_GO = MANUAL_ONLY`）；`AGENTS.md:33`复述一致。主/备列无GO。全仓`rg opencode-go/`命中仅两旧包（C2同步范围，PLAN明确BatchA不碰）＋历史review/qa/handoff/PLAN引用（§8.4允许的历史证据），母版主动域零自动fallback。
- P0（③Bridge standby vs 合同历史）：PASS。合同零改（`git diff`无`V2.1_BRIDGE_INTEGRATION_CONTRACT.md`，`wc -l`=149行与分发基线一致）。`deepseek-flash`裸串母版仅override:24＋AGENTS:33 standby/历史语境（用户明确切回才启用，不进主动表）；主动CodeBuddy路由全为`deepseek-v4.1-flash`（override 7处＋5卡各1＋AGENTS:33）。A2 9卡、A3 1行diff均未碰合同§0/§16/§18.1历史取证。合同内部旧route启用句残留属业务仓原件stale，回仓修，分发侧不动（方案§3.3禁改）。
- P0（A2/A3/A4回归）：PASS。9卡模型行与新表一致（6×V4.1＋planner/senior=Sol＋product=FREE，`rg docs/roles/`实跑复验；TM卡“读表”句式按A2口径不动，允许）；AGENTS diff仅模型句1行，升级（2次打回/P0-hard）/账本/缓存/红线原文不动；双账本schema键不动（TASK 12键／DISPATCH 9键，实跑解析），示例行仅换ID（TASK builder terra→V4.1；DISPATCH recorder mimo/本窗口→V4.1/codebuddy，note保留首任务前删除），supervisor双validator块原文不动。
- P0（⑤A4 smoke额度）：PASS（采信＋静态复验）。新烧仅FREE×1＋B×1（B只读`--help` rc0＋单发`-y -p`正文pong；四角色只读`rg`复用B链不重复烧；`-y`显式标注在位），Sol零新烧（引用09-11三连PASS＋override:21剥前缀语义在位，符合§4.2禁Benchmark）；GO negative为静态＋dry-run（FREE不可用→TM切表内V4.1备／双超限停派找人，禁GO），未真注故障（需用户另批，已在BUGS§6声明）。§4.4十五项15/15 PASS结论可采信；复核者未独立重放smoke（避重复烧额度），静态四项已独立重跑全PASS。

## P2 / P3 Backlog Findings

- P2-1（④builder已知残留：旧:27引用行号漂移，顺手修，不拦门）：`docs/roles/builder.md:7`（`override:27`）／`:8`（`USER_MODEL_OVERRIDE.md:27`，-y规则）／`docs/roles/supervisor.md:24`（`override:27`，-p看正文）三处仍指旧29行表的-y行号；新表-y规则已前移至`:25`（:26派工显式／:27超限口径），偏差+2。改法：三处`:27`→`:25`（supervisor:24的判据引用同步改），由BatchB/C顺手修。定级理由：功能零损（派工按模型表Runtime列，-y正文判据文字本身正确，validator块未动），且任务目标已预定P2不拦门。
- 备注（非问题）：两包仍为旧模型表＋GO备用，属C2同步范围，本门禁不计FAIL（BUGS§6已声明）；HANDOFF母版§1/§3旧主备口径（FREE主/B备对调语境）为BatchA前历史快照，BatchC/HANDOFF记一行时统一，不在本轮被检输出内打回。

## C2复核

- Task: C2同步（母版→两包Ops＋2 ZIP重建＋HANDOFF一行＋变更说明Amendment段＋GOVERNANCE_VERSION未动，只读不改被检输出，本节为唯一追加）
- 对照：拆活单C2节（`docs/pm/PLAN-2026-09-12-整改.md:159-165`）＋方案§9–§10（`docs/history/2026-09-12 丨 macOS 丨 ChatGPT 丨 ORCA V2.1模型与双阶段治理-整改方案 丨 V1.0.md:1511-1569`）
- Reviewer: code-reviewer
- Result: 过（P0=0；P2×1清单行级补记，不拦门，不进回归门禁）

### ① 关键文件母版vs两包一致（PASS）

- override表10行：`rg -n "^\| " USER_MODEL_OVERRIDE.md` 10数据行（L9-L18：TM=FREE本窗口／supervisor=V4.1／builder=V4.1／planner=Sol／reviewer=V4.1／qa=V4.1／product=FREE本窗口／recorder=V4.1／neat=V4.1／senior=Sol）；`diff -q`母版↔新包／老包均EXIT:0，md5三处同`a18d05ba0646144915f08046c2c74fdc`。
- supervisor断言块字节同：三处`docs/roles/supervisor.md`均为51行，`diff`新／老均EXIT:0，md5同`0c21847900b17426511a78901d4dd55b`；10卡全量`diff -q docs/roles/*.md`新／老均为SAME（10/10）。
- HANDOFF.template六字段：母版L6-L11（PROJECT_PHASE／PLAN_VERSION／PLAN_READINESS_SCORE／PLAN_GATE／DEV_BASELINE／CHANGE_REQUEST，全角括号枚举齐），`diff`新／老均EXIT:0。
- 双新模板存在且字节同：`docs/pm/PRODUCT_PLAN.template.md`（1160B）＋`docs/review/RESEARCH_REVIEW.template.md`（956B），母版↔新／老`diff`均EXIT:0；在盘六文件`ls -l`均在位。
- 编排者三口令同步：`diff docs/prompts/编排者提示词.md 新包/编排者提示词.md`EXIT:0（Phase-aware＋三口令＋90停磨＋Change C Reopen均在位）；`PLAN.template.md`、`TASK-MODEL-LOG.jsonl`（_example单行）母版↔两包均SAME。

### ② 预期差清单闭合（PASS，P2×1见下）

- 全量映射`diff -q`（母版→新包33对）：SAME 28对；DIFF仅5类——AGENTS 1行／Contract 2行／迁移整理1行／README整块／DISPATCH 7行／外部1行，均无漏网非预期差（10卡／双新模板／HANDOFF.template／PLAN／TASK／编排者／协议1293行／watchdog 2文件／归位表／经验均SAME）。
- 旧路径裸名（布局正确）：AGENTS:36 `docs/prompts/编排者提示词`→`编排者提示词`（HANDOFF§9明确保留1行）；Contract:17-18同类2行＋迁移整理:13同类1行（扁平包根布局必然，内容零改，行数149行不变）。
- README补记：母版导航 vs 两包用途＋放入根目录＋同步补记（含`PRODUCT_PLAN／RESEARCH_REVIEW …V2.1 Two-Phase Amendment新增`去向行）＋新包初始化后／老包迁移命令＋迁移铁律；新老包间`diff -rq`仅README＋老包独有`迁移整理提示词.md`＋.DS_Store，迁移专属闭合。
- DISPATCH 7行：母版_example＋7行09-12真实派工 vs 两包仅_example单行，系账本冻结设计（分发包只留_example，实绩记HANDOFF存档；C1 REG-01已载明好例EXIT:0连带验过新增行），不计漂移。
- P2-1（清单行级补记，不拦门）：HANDOFF§9预期差仅写“AGENTS裸名1行保留”，未逐条列Contract 2行／迁移整理1行／外部1行（`docs/prompts/外部开发者提示词.md:16`母版多`（历史审查报告已删见 README；…）`半句，两包无history/故省略，功能零损）。改法：HANDOFF§9或C2落盘清单补一行“扁平包裸名共4行（AGENTS 1＋Contract 2＋迁移整理1）＋外部history半句包侧省略系布局正确”，由收尾neat顺手记一笔。

### ③ ZIP非旧缓存（PASS）

- `unzip -l`两ZIP均为42 files；含`docs/pm/PRODUCT_PLAN.template.md`（1160B 09-12）＋`docs/review/RESEARCH_REVIEW.template.md`（956B 09-12）＋`docs/handoff/HANDOFF.template.md`（1820B 09-12）＋`USER_MODEL_OVERRIDE.md`（3634B 09-12）＋`scripts/orchestration/` 2文件（09-12）；`unzip -p 新包.zip 新包/USER_MODEL_OVERRIDE.md | md5`=`a18d05ba…`与母版同；时间戳09-12非09-11旧缓存。

### ④ 版本号确未动（PASS）

- `cat GOVERNANCE_VERSION／新包／老包`三处均为`2.1`；`unzip -p`两ZIP内`od -c`均为`2.1\n`；无2.2（Amendment口径“保持2.1，2.2留用户拍板”遵守；变更说明`docs/history/2.1-更新说明.md:7`Amendment段＋HANDOFF§9一行均含该句）。

### ⑤ Bridge合同／watchdog／协议正文零改（PASS）

- Bridge：母版149行，`git diff -- V2.1_BRIDGE_INTEGRATION_CONTRACT.md`空＋`md5`母版==HEAD（`f3d5ef97eb6794d441e16f2a5f26f2fa`）；两包149行同数，仅上述裸名2行布局差，历史取证零改（方案§3.3／§13禁改遵守）。
- watchdog：`bash -n scripts/orchestration/coordinator-watchdog-standalone.sh` EXIT:0；母版↔两包脚本＋README `diff`均EXIT:0，逻辑零改。
- 协议：三处1293行`diff`均EXIT:0；顶注含“两阶段优先”一行（B6要求），正文1292行未动（`git diff --stat`母版协议无M，文件为§7收编untracked，包侧同文）。
- HANDOFF一行：`docs/handoff/HANDOFF.md:5`更新行＋`:71-73` §9含Amendment标记＋文件清单＋裸名保留＋supervisor字节同＋ZIP校验，齐。

## 升2.2复核
- 范围：GOV三处2.2＋AGENTS:3/TM:9 V2.2＋HANDOFF:5/§9＋更新说明:8＋PLAN标记:4＋经验:14＋两ZIP（只读，git diff+rg+unzip -p+diff -q实跑）。
- 结论：打回转PASS。初检P0=1（母版经验14行未同步两包+ZIP）TM已修（三处14行逐字同＋ZIP重建＋ZERO验）；其余全PASS，语义零改；README provenance等残留保留合理。
