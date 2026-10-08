# HANDOFF｜ORCA 治理重塑（分发版）

> 本文件为实例，拷进新项目时清空第 1-2 节照模板重写。

- 更新：2026-10-03 **小交接（用户令开发暂时结束）**：产品验收治理整改＋体系更新三件套＋通道预检制度＋每周自动检查＋老项目 32 个全量迁移全部落地并入库（`e73e4af`/`227636d`）；§§1-3 重写为 10-03 现势；§67。
- 更新：2026-09-28 产品验收治理整改落地：builder×4→reviewer→返工→qa 规则核验(DEGRADED)→返工→neat 同步×3→supervisor(PASS 0/2)→GPT-6 Sol 外部审查(PASS_WITH_FIXES)→返工 P1-1/2/3→neat 同步→experience-recorder(+2)→neat 同步；**实测 FAIL**（自建样例抓到 037 同类两类缺陷）；母版＋两包 **SYNC-OK**；P1-4 用户签收**挂起待用户拍板**；**未 commit**；§60。
- 更新：2026-09-26 小交接（用户令开发暂时结束）：§§1-3 刷新为小交接现势（治理迭代五批全部落地＋分工表 T23 已 push `c5408ba`；**老项目不归本窗口管**、**真实项目 A/B 用户自己跑**；§59）。
- 更新：2026-09-26，派工审计驱动治理迭代第一批（QA沙箱解禁＋账本新字段＋模型ID规范＋迁移即登记）；README/ORCA说明模型口径改“以表为准不复述ID”；§50。
- 更新：2026-09-13，修第0步无效判据（不再靠"项目已有治理文件"跳过取包，改无条件取包），老包zip重建（§25）。
- 更新：2026-09-13，迁移入口自举化（并入《迁移整理提示词》，不新增文件）＋两包 README 路径对齐＋F-01 闭环（§23）。
- 更新：2026-09-13，开发暂停封口（追审修复＋总监督wake-only收编＋neat-freak对齐＋§§1-3现势重写；已 push `de20e13`；即日起模板冻结，只收问题不改文件，攒单见§22）。

- 更新：2026-09-13，开发暂停收尾（neat-freak 对齐＋CUA-MAC-1 收口＋§§1-3 现势重写；已 push `acc8456`）。
- 更新：2026-09-13，模型分工表改版＋Mac通道诊断任务TM收口（§15）；已 push `00845ad`。
- 更新：2026-09-13，开发暂停收尾（neat-freak对齐＋§§1-3现势重写＋§14记一笔；未commit，等用户指令）。
- 更新：2026-09-13，本项目编排者（TM）由 GO（`opencode-go/muse-spark-1.3-contributor`）**切回免费**（`opencode/muse-spark-1.3-contributor-free`，即表内 TM 主用）；切换过程中报 provider 错 `reasoning encrypted_content was not issued to this caller`（会话内模型 caller 变更后旧加密 reasoning 块被重放，续旧会话必复现）。处置：**未改表**（FREE 本就是表内主用），旧会话不 resume，开新会话继续。
- 更新：2026-09-12，模型与双阶段整改＋C2两包同步＋zip重建（§9），版本标记文件改指针语（版本真相以Git历史为准）。
- 更新：2026-09-12，收编持续推进协议（§7）＋L3 watchdog 脚本进 `scripts/orchestration/`（§8），两包同步、zip 重建。
- 更新：2026-09-11，开发暂停收尾（已推 `b84e61d`）。历史旧报告6份已删；`docs/history/` 新增审查报告3份（-y轮/现势/逐派，未提交，待定去留）。现行结论以包内文件＋本 HANDOFF §1-§3 为准。

## 1. 当前工作进展（2026-10-03 小交接现势；用户令开发暂时结束）

- **主线：本轮四件事全部落地、已 commit＋push（最新 `227636d`，另 `e73e4af`）**，母版工作区干净。
- **① 产品验收治理整改（`36e94ae`）**：把"产品验收"接入**既有 QA Gate**（未新增角色/派工链/Gate）。`PRODUCT_PLAN.template` 增「视觉与交互验收标准（AC 编号）」「关键 AC 集合」（关键不得为空）＋「发布类型」；`BUGS.template` 增 **11 列产品验收追踪矩阵**；`qa.md` 七查→八查＋**不可放行三情形**＋逐个可见操作控件＋落盘要求＋视觉验收最小覆盖；`supervisor.md` 增抽查第 7 条（凭同一矩阵判放行）；`AGENTS.md` 完成口径＋红线；`webqa.md` DEGRADED 口径对齐（唯一解冻项）；`product-reviewer.md` 边界句。**用户签收范围已定（用户 2026-09-28「类别 1」）：仅「首次发布」必须用户点头，按发布类型自动判定，迭代更新/局部修复不强制。**
- **② 体系更新三件套（`d19a6c2`）**：概览 `ORCA治理体系说明.md` 纳入常驻一环（①同步两包 ②同步概览 ③`check-sync` 必须过，"漏更新概览＝未完成"）；`check-sync.sh` 增**概览新鲜度**检查（缺对外必现机制关键词报 `OVERVIEW-STALE`，负例实测 4 项全拦下）；`neat-freak` 卡增对齐清单项；`AGENTS.md` 红线增一条。
- **③ 通道失配制度（`e73e4af`）**：**senior-expert 换 `codex/gpt-6.1-sol`（T24，真调 exit 0）**——首真调失败根因＝**Codex CLI 0.155.1 模型目录无该模型**，已升 0.159.2（用户 `~/.codex/config.toml` 默认模型随之恢复可用）。新增 `scripts/check-channel-preflight.sh`（表内**在用**模型 ↔ 三通道真实目录对账，缺失报 `CHANNEL-STALE` ＋ exit 1 禁派；假表负例实测 exit=1）+ `scripts/weekly-channel-check.sh` 与 `~/Library/LaunchAgents/com.orca.channel-check.plist`（每周一 09:00，只检查+提醒，**绝不自动升级客户端**；脚本内安全闸自扫 update/install/upgrade 命中即拒运行，**opencode 零更新**）。`AGENTS.md` 派工顺序节增「派工前通道预检」，三件套第 3 步补"动过分工表/通道模型须预检过"。
- **④ 老项目全量迁移（`e73e4af`，用户令"全部统一改、不许逐个来"）**：**32 个项目**（含新项目 039/040/041）全部同步 2026-09-29 规则；`AGENTS.md` **顶部注入** `ORCA-RULES-BLOCK` 增量区块（只增不删、项目专属规矩原样保留、幂等）；账本**内容零改动**（实绩历史禁重写）；32 个账本**模板示例行已删**，现全部 `LEDGER-OK`（实测 0 FAIL）；259 份 `.旧版-2026-09-29` 备份**保留但加 `.gitignore` 隔离**；**28 个有 git 的项目已提交**（精确 add 治理文件，未碰其业务改动），3 个无 git 只能留文件（`000-alw-个人偏好`／`014-山寨滚仓网站`／`027-蛋白质计算器`）。
- **实测证据（`docs/qa/BUGS-2026-09-28-产品验收实测-最小回归.md`，判 `FAIL`）**：自建样例抓到 037 同类两类缺陷——编号/标题错位 **27–33px 且拆行**（07-12 为 0px）；12 个「查看具体」`href` 全存在但真实点击后 `#detail`/URL/hash **全零变化**。**证实"只验 href 存在不算已验""逐个列出每个可见操作控件"两条新条款必要有效。**
- **三份角色报告**：code-reviewer `PASS`（P1×2＋P2×5 已修）／qa 规则核验 `DEGRADED`（P1「关键 AC 无标记」＋P2「兜底歧义」已修）／GPT-6 Sol 外部审查 `PASS_WITH_FIXES`（P1×4，P1-1/2/3 已修，P1-4 由用户拍板后落地）。supervisor 两次复检 **PASS（打回 0/2，升级 0）**。逐派记录见 §60（17 派）、§61-§66。

## 2. 下一步任务（按序）

1. **【唯一由本窗口承接】等用户口令 `第一阶段，计划`** 开第一单业务（Phase1 PLAN 链：planner(Sol) ↔ product-reviewer，多轮至 Readiness≥90 再 Human Gate）。
2. **各老项目自己的活（编排者不代做，用户已划界）**：给实绩 Plan 补「视觉与交互验收标准 ＋ 关键 AC 集合 ＋ 发布类型」，完成后把 `docs/model/GOVERNANCE-STATE.json` 的 `product_acceptance_ac_added` 置 `true`（状态表 `AC` 列跟踪，现 0/32）。**不补则这些项目在新规则下收尾会被判"计划缺项"、卡在门口。**
3. **治理尾巴**：`038-ing-keep 运动健身仓库` 账本现为空（未开工，属正常态）；`019` 迁移时无改动待提交（其 AGENTS 已是新版）；21→ 现 24 个项目缺 `PROJECT_PHASE` 字段（值只有各自 TM 知道，编排者不瞎填）。
4. **3 个无 git 项目**的治理改动仅存于工作区与 `.旧版-2026-09-29` 备份，若要入库需用户决定是否 `git init`。
5. **真实项目 A/B（TM 资格）**：用户自跑，治理仓只提供框架与评分器（采样门槛：≥30 Episode 且 ≥3 项目，否则保持 CANDIDATE）。
6. **任务书遗留**：原《ORCA 产品验收治理整改任务单》§六 交付物第 3 项"完整整合草案全文"未出（走直接实施路线，用户授权升级），已在 §60/§64 如实标注。

## 3. 注意事项及规矩（违反即打回）

- **开工读盘顺序（全体系唯一）**：`AGENTS.md` → 本次角色卡 → 根 `USER_MODEL_OVERRIDE.md` → 本 HANDOFF（§1-§3 ＋ 最近一节）→ `经验一句话.md` → 任务目标放最后。
- **派工前必跑预检**：`bash scripts/check-channel-preflight.sh` 须 `CHANNEL-OK`；报 `CHANNEL-STALE` 即该角色**禁派**（先人工 `codex update` 再重跑，或改用该角色备用模型）。**禁自动装更新**——升级连带改目录/认证/沙箱默认，会打翻整表。**opencode 永不更新**（用户 2026-09-30 明确）。
- **体系更新三件套**：改治理文件后 ①同步两包 ②同步 `ORCA治理体系说明.md` ③`check-sync` 得 `SYNC-OK`；动过分工表/通道模型再跑预检须 `CHANNEL-OK`；HANDOFF 记一行。**`check-sync` 对 `AGENTS.md` 只按 marker 行数白名单放行 → 两包同步后必须显式 diff 第 37 行确认仅 `docs/prompts/` 裸名差**；概览正文只能写结论与入口，不许复述字段/列名/模型 ID。
- **派工纪律**：每次优先主用；主用限额/失败→**当次**切备用（下次仍优先主用，不记忆上次切备）；`DISPATCH used` 恒填主；同链续 session；静态打头动态押后；opencode 通道角色**派单里禁止让它写 `/tmp`**（会被 `external_directory` 自动拒、静默失败、易盲试烧额度）——临时文件改 `temp/`。
- **账本**：母版两账**保持仅示例行口径不记实绩**（母版逐派记录落 HANDOFF）；老项目实绩账本**禁重写**；`model` 用 `provider/model` 精确写法；角色交付 `PASS` ≠ 整链验收（未闭环记 `OPEN`）；校验 `node scripts/model/check-ledger.mjs docs/model`（0 行空账本＝`LEDGER-OK 含 WARN`，属"未开工"正常态）。
- **老项目迁移边界**：备份不覆盖（铁律）；账本内容零改动；`AGENTS.md` 只注入区块不整份替换（项目专属规矩可能很长）；跨仓动作（提交/改他项目文件）只在用户明确授权时做。
- **我的三个已知教训（写脚本时反复踩）**：①判"项目在不在跑"必须用「任意位置 `PROJECT_PHASE` ＋ git 最近提交 ＋ 账本行数」三重交叉，grep 锚定行首会漏判（曾漏掉最活跃的 028）；②`grep -v` 在"全部行都匹配"时退出码 1，`&&` 短路会导致文件没被替换（曾致删账本示例行失效）；③**用 Write 工具写含中文的 bash 脚本会随机损坏字节**（`Illegal byte sequence`、变量名被吞）→ 治理脚本一律用**纯 ASCII** 注释与输出。
- **红线（本体系）**：P0 没完+用户没喊停不准收工；产品验收未落盘或关键 AC 未测不准报完工；首次发布未取得用户签收不准报完工；体系更新未同步两包与概览（或概览检查未过）不准收工；不 push（commit 需用户明确指令含分支名，默认 `main`）；不碰 secrets；换模型的事用户决策。
- **用户划界（不变）**：老项目不归本窗口管（除用户点名）；真实项目 A/B 用户自跑。

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

- 转正记一笔（BatchA＋BatchB，版本标记改指针语，用户定）：母版主动文件已同步两包（override新表＋10卡＋AGENTS两阶段＋编排者三口令＋PRODUCT_PLAN/RESEARCH_REVIEW双新模板＋PLAN两行＋HANDOFF六字段＋协议两阶段优先一行＋双账本示例行＋双包README去向行；AGENTS裸名1行保留；supervisor断言块两包与母版字节同），预期差仅扁平包裸名2处（AGENTS:36×1/scripts README:3×1，布局正确）＋外部提示词history半句（包无history/省略合理），两ZIP重建并校验非旧缓存，未 commit（等用户指令）。
- 收尾记一笔（neat-freak 2026-09-12）：对齐6处（README版本2.1→2.2、HANDOFF经验9→10条、§3行号:29→override:27×2＋:27→override:21＋override:29→:22；经验14行/10条×3处一致、GOV三处2.2一致、ZIP为本轮新建无需重建）；清/tmp：one*.jsonl与qa-bad均无残留（/tmp仅存09-10/09-11旧combined/fbcap/sup_test三文件非本轮产物不动，包内无临时文件）；未决：builder/supervisor卡override:27三处（实指-y规则现为:25）母版与两包字节同故未动，待TM定是否另开变更同步三处＋重建ZIP。
- Sol外审P2整改（2026-09-12，TM执行）：P2-1/README版本声明已加；P2-2/AGENTS planner格补PRODUCT_PLAN入口；P2-3/§1标superseded；P2-4/待办：下次分发前冻回DISPATCH-LOG仅_example；P2-6/watchdog md5四方同`4464dfb3`（包根/两包/Downloads源）已闭环；P2-7/协议顶注行在位、"真机QA已启用"零虚假断言（仅qa.md门禁条件句）。P2-5/P2-8无需改。

## 10. 去版本号记一笔（2026-09-12，用户定：版本真相只认Git历史）

- 改名13处（git mv留历史）：根合同、history两说明＋3审查报告＋整改方案、prompts协议、sop交接上下文、两包合同＋协议；目录名与仓库名冻结当编号不动。
- 内容去版本：现行标题/规则/口令/映射中数字版本号清零（版本标记文件改指针语"以Git历史为准"）；冻结类内容（审查报告/BUG单/合同正文/执行记录）只改名不动正文；README加改名对照节过渡老链接。
- 返工记一笔：reviewer打回P0=3（口令×6/老包README/脚本死链×3）＋supervisor打回（两包模板标题）均已修，终检过，累计打回1/2；ZIP重建ZERO验。
- 收尾记一笔（neat-freak 2026-09-12）：对齐抽查全过（主动文件零死链零治理版本残留，旧名仅README对照节＋冻结正文按§10保留；两ZIP解压与磁盘仅差.DS_Store）；/tmp无本轮残留（已清zipcheck，bridge旧物＋watchdog日志不动），包内无临时文件；未决：无新增。

## 11. 禁套娃记一笔（2026-09-12，用户定）

- AGENTS插座行追加"禁把codebuddy包进本窗口subagent套娃调用（表定codebuddy的角色必须走通道直调），违者打回"（母版＋两包＋ZIP重建）；起因：业务项目编排者用本窗口子代理顶替codebuddy通道，supervisor记偏离。

## 12. P1P2修复同步记一笔（2026-09-13，用户定修P1×3＋P2-1~4）

- 母版8处：builder升级口径（只算supervisor打回）／AGENTS状态短名＋REOPEN枚举／派工口通道分离／runtime补codex／supervisor断言加runtime行／HANDOFF删副本不提交条／HANDOFF.template加REOPEN枚举／编排者Readiness改指正典；DISPATCH冻回示例＋HANDOFF-override存档9行摘要。
- 两包镜像同步（裸名路径适配，supervisor断言块字节同），ZIP重建ZERO验；reviewer过＋qa过＋supervisor过（打回0/2）；未commit，等用户指令。

## 13. 真机QA会话能力预检门禁记一笔（2026-09-13，用户定P1）

- 母版4处：`docs/roles/qa.md`加每session硬门禁＋7态枚举＋ok=true判据、`docs/qa/BUGS.template.md`加预检结果节（含判据行/QA-CUA-CANARY/三命令实时结果）、`docs/prompts/编排者提示词.md`加先派预检收PASS回执、`AGENTS.md`派工顺序加一句总门禁；正式QA路由不变，`USER_MODEL_OVERRIDE.md`字节不变（md5三处同）。
- 两包镜像同步（qa/BUGS ZERO；AGENTS/提示词仅预期裸名路径差），ZIP重建解压ZERO验；reviewer过（P0=0/P2×5，P2-3/4笔误已修）＋qa过（P0=0/P2×4）＋supervisor复检打回1/2后补落盘（reviewer/qa各落一节）＋HANDOFF本§即补记；未commit，等用户指令；未验证边界：Android/iPhone真机未测，Mac预检不代真机验收。

## 14. 开发暂停收尾记一笔（2026-09-13，用户令暂停，neat-freak）

- 对齐：§§1-3已重写为09-13现势（§1补§12/§13/TM切回FREE/15改＋3新文件状态，§2收口P2-4冻账待办并列7项恢复任务，§3补预检门禁＋runtime含codex＋升级只算supervisor打回＋TM切回口径）；经验10条／README根7件／GOV指针语／账本仅_example三处一致；母版↔两包仅预期裸名差，ZIP无`.DS_Store`无旧缓存。
- 清理：本轮只改`docs/handoff/HANDOFF.md`（§§1-3＋§14），未动模型表与业务；未删未跟踪3件（§13证据保留）；包内无临时文件，`/tmp`残留不动；未commit未push（等用户明确指令）。
- 未决：是否commit/push本轮15改＋3新文件；sop＋history 3报告去留；GOVERNANCE现行P2/P3 backlog下批；Mac通道A/B恢复时从预检起。

## 15. 模型分工表改版＋Mac通道诊断收口（2026-09-13，TM）

### 15.1 模型分工表改版（用户逐角色定，只换主用＋连带通道）

- 主用（备用列不变）：TM＝用户临时指派/开窗口时定（不定模型）｜supervisor＝`deepseek-v4.1-flash`（codebuddy，额度受限停工找用户、切账号后继续，不自动转备份）｜code-reviewer/experience-recorder/neat-freak＝`opencode/muse-spark-1.3-contributor-free`（本窗口 subagent）｜builder/qa/product-reviewer＝`codex/gpt-5.6-luna`（codex）｜planner/senior-expert＝`codex/gpt-5.6-sol`（不变）。
- 连带：supervisor 主用 `deepseek-v4.1-flash` via `codebuddy`（额度受限停工找用户、切账号后继续，不自动转备份）；code-reviewer/experience-recorder/neat-freak 暂用 FREE（本窗口）、builder/qa/product-reviewer 暂用 Luna（codex）顶替；V4.1/codebuddy 通道保留非删；AGENTS 模型节「主动路由只许 V4.1 via codebuddy」→「以 override 主用列为准＋V4.1 通道保留」；AGENTS 两处「默认 V4.1 主链」→「默认主链（模型以 override 表为准）」；override 精确ID条补 Luna＋TM 不定。
- 母版＋两包 override md5 三方一致 `3a661a71`；母版↔两包 AGENTS 仅预期裸名路径差1行；硬编码残留 grep 零命中。两 ZIP 已重建并验 override/AGENTS md5 一致、无 `.DS_Store`。
- 未 commit、未 push。全局 `~/.agents/rules/orca.md` 的「默认主链 V4.1」「主动路由只许 V4.1 via codebuddy」仍为旧口径，属中央规则待用户单独改（本项目内文件已改）。

### 15.2 Mac 真机 QA 通道诊断任务 TM 收口

- 任务：Mac 真机 QA 通道修复与复测（任务A批准控制点＋任务B三目标矩阵）。
- 执行链：Code Reviewer→QA→Supervisor→TM（均 `deepseek-v4.1-flash` via `codebuddy`，当时口径；本链 TM 会话内执行，非独立 qa 会话，见诊断报告:20）。
- 结论：6/7 PASS，滚动项 `FAIL_UNVERIFIED_ACTION`（三目标×两路径像素零位移＋无正向阳性实例）→ 正式 QA 维持**未启用**（`deepseek-v4.1-flash` 真机 QA 仍「待验证」）。
- supervisor 复检 **PASS，打回 0/2**；rework=0；未触发 senior 升级。派工显式两行：本派 `deepseek-v4.1-flash`／`codebuddy`／主用，回来 PASS 走主用；分发账本依 §3 冻结不落，本行即执行链记录。
- backlog 挂账（下批文档修订/下轮复测同批；★＝下次修订必须改）：①CUA-MAC-1 滚动 P0 OPEN（Orca provider 候选层＋未排除项）另开单，先立正向对照＋零噪声面；②CUA-MAC-2 composer 输入 P1 OPEN 同单；③CUA-MAC-3 批准 PENDING 等用户当次批准（A4 三项）；④★R1/QA-MAC-4 覆盖面表述；⑤R2/R3/R4/R5/QA-MAC-5/QA-MAC-6 报告表述与证据整理；⑥★QA-MAC-7 前置条件可复现性。
- 证据 `/tmp/qa-cua-2026-09-13/evidence/`（重启即清）；仓库仅新建诊断报告3件（未跟踪）。
- 文档修订（④⑤⑥ 项）已落地：诊断报告 §9 集中记录 R1/R2/R3/R4/R5/QA-MAC-5/6/7 八项处置，编排者提示词 :19 澄清预检会话归属（母版＋两包同步）；余 ①②③＝真机复测另开单（CUA-MAC-1/2）＋批准（CUA-MAC-3），仍需真机/当次批准，未动。
- 复测（2026-09-13，TM 派 qa｜`codex/gpt-5.6-luna`＋codex，主用，批准已生效＝持久档加 `com.stablyai.orca`）：预检 6/7 PASS，滚动项 `FAIL_UNVERIFIED_ACTION` 复现（文件列表 `scroll` 无位移）→ 硬门禁非 PASS 停派，不进正式复测。**跨模型复测证实 CUA-MAC-1 滚动缺陷在 Orca provider 层，与模型/通道无关**；CUA-MAC-2（终端 composer）本次未进正式未复测。正式 QA 维持**未启用**。

## 16. 开发暂停收尾记一笔（2026-09-13，neat-freak）

- 对齐检查全过：经验一句话 10 条、账本 TASK/DISPATCH 均仅 `_example`、override 三方 md5 一致 `3a661a71`、两包 AGENTS 仅预期裸名路径差 1 处、`/tmp/scroll-test.txt` 已清、git 干净。
- §§1-3 现势重写：§1 记最终模型表＋Mac 诊断收口＋CUA-MAC-1 根因判定＋commit 状态；§2 列 8 项恢复任务；§3 更新 supervisor V4.1 口径＋真机 QA 硬门禁＋账本冻结。
- 清理：TextEdit 测试文档已关闭不保存、`/tmp/scroll-test.txt` 已删；`/tmp/qa-cua-2026-09-13/evidence/` 为诊断证据留存（重启即清，非本轮残留，不动）。
- 未 commit（§§1-3 重写＋§16 待用户指令 commit/push）。

## 17. 分工表纯表化记一笔（2026-09-13，用户定）

- 母版＋两包 `USER_MODEL_OVERRIDE.md` 重写为标题＋单表4列（角色/模型精确ID/执行通道/调用方式），表下规则与表上引言清零；删备用列，换人用户直接改表；调用方式每行写全（codex剥`codex/`前缀短名＋`--skip-git-repo-check`＋stdin重定向、codebuddy必带`-y`、本窗口直派、codex禁本窗口代做）。
- 额度词全表零命中（额度/受限/超限/限额/顶替/恢复/切备/主备/备用/主用/停派/找人/免费/MANUAL_ONLY/standby）；10行4列解析过；三方md5一致 `27969fa4a3d1b9312e4e8fd4fca98e0e`。
- 未动 AGENTS 模型节与角色卡硬编码（残留旧口径，老项目如仍读到以本表为准）；未 commit，等用户指令。
- 清理（2026-09-13，用户令A删）：`docs/sop/`杂项1件＋`docs/history/`审查报告3件（-y轮/现势/逐派）`git rm`，两包无此二目录不动；两zip重建。

## 18. 分工追审修复记一笔（2026-09-13，用户拍板P1-3选B、P2-1退轻量）

- P1-1：六卡模型行去硬编码（见表不复述）；TM卡:12/编排者:15/README模型节改“默认主链（以表为准）”。
- P1-2：三处`:25`改命名锚点（见表supervisor行调用方式）；P1-3B：AGENTS:43改纯表语（无备用列/used恒填主/实派==表），删GO/主备/顶替句；P2-1退轻量：DISPATCH枚举删`deepseek-bridge`（AGENTS:58＋supervisor校验块同步），AGENTS:43后半句Bridge句删，Contract文件保留。
- P2同批：PRODUCT_PLAN加REOPEN值、qa标签中立、builder改停原链、senior补停线句、AGENTS补TM例外、双账本示例行换现行主用（builder/Luna、recorder/FREE本窗口）、协议收编说明补脚本名句、两包README合一表＋去向写死；P3同批（Contract去标题版本名、排名快照脚注、“新表”半句删）。
- 验：双账本断言exit 0、卡内ID仅supervisor/planner/senior三行、override行号引用零悬空、母版↔两包rolesZERO＋AGENTS仅:36裸名差＋Contract仅§0裸名差、两zip重建；未commit，等用户指令。

## 19. 总监督收编记一笔（2026-09-13，用户定名“总监督”）

- 来源：用户 Downloads/大模型 HANDOFF 原件冻存 `docs/prompts/Orca 编排治理监督者提示词.md`（1879行，md5三方一致，正文未改动）；两包放包根。
- AGENTS红线加一条：总监督体系外独立（不占9+1，编排者无权派工/解雇），只读三件按监督者提示词执行，发现停摆直接找用户；与supervisor无关不合并；质量走supervisor链，推进/停摆听总监督。
- 其余文档未动；用户自建总监督角色，读AGENTS＋监督者提示词干活；未commit，等用户指令。

## 20. 总监督收敛记一笔（2026-09-13，用户令wake-only）

- 起因：0907项目总监督按1879行全文最大权限干活，改机制＋连问用户5件事（截图：退役watchdog/补standalone/清145条误报/升协议/跨项目清理）。
- 收敛：监督者提示词顶部加收编说明（正文冻结不动，现行以说明为准；只做唤醒三件事：心跳断/transport丢/停摆，只喊编排者；禁主动问用户、禁动机制；两次叫不醒才找用户一次）；AGENTS红线总监督句同步改wake-only（先读顶部收编说明，平时只喊编排者）。
- 三方md5一致 `7f97535e`；两包放包根；未commit，等用户指令。

## 21. 收尾记一笔（2026-09-13，neat-freak＋commit封口）

- 对齐全过：经验10条／双账本示例行现行主用且断言exit 0／卡内模型ID仅supervisor/planner/senior三行／override行号引用零悬空／旧口径（V4.1主链/顶替/GO/主备/bridge运行时）零残留／fence配对／母版↔两包roles ZERO＋AGENTS仅:36裸名差＋Contract仅§0裸名差；README prompts行补监督者提示词；监督者提示词三方md5 `7f97535e`、override三方md5 `27969fa4`；两zip重建含新文件、无`.DS_Store`。
- 本轮含追审报告新文件1件（`docs/review/GOVERNANCE_REVIEW-2026-09-13-分工追审.md`，P0=0/P1=3/P2=9/P3=4，P1已闭环）。
- 即日起模板冻结：只收问题不改文件，见§22。

## 22. 后续整改清单（冻结期攒单，用户发一条记一条）

> 规则：编号F-序号；只记日期＋来源项目＋现象＋影响面；不分析不修；P0才单独问是否插队。

- F-01｜2026-09-13｜**已闭环（§23）**｜来源：编排者核对（老项目迁移模板包自查）｜现象：迁移包 README「放入项目根目录」清单漏列 `Orca 通用编排者持续推进协议.md` 与 `Orca 编排治理监督者提示词.md`（两文件实际在包根，包内无 `docs/prompts/` 目录），而 `编排者提示词.md` 第 13 行引用 `docs/prompts/Orca 通用编排者持续推进协议.md`｜影响面：老项目迁移包＋新项目模板包（两包 README 均未提此二文件、docs/ 下均无 prompts/ 目录，已核实同缺）→ 照 README 搬运后该引用指不到文件、防停摆指引断链。｜处置：两包 README 已补列并指定落 `docs/prompts/`，2026-09-13 文档对齐时一并修复（§23）。

## 23. 迁移入口自举化＋文档对齐记一笔（2026-09-13，用户定）

- 起因：原有《迁移整理提示词》首句假设"模板文件夹已拷进本项目"，无法自举；用户要的是：把一份提示词交给老项目智能体，它自己回治理仓库取包→拷进本项目→整理→测试，全程不打扰用户。
- 处置：把「自举取包＋冲突处理」并入《迁移整理提示词》当第 0 步（**一份入口，不新增文件**）。先试写的《自举迁移提示词》与《迁移整理提示词》内容重复（用户发现），两份已删。
- 《迁移整理提示词》新内容：第 0 步（按本机写死源路径取包→按清单铺开，协议/监督者入 `docs/prompts/`、归位表入 `docs/templates/`→冲突铁律：不删不覆盖、撞了改名 `<原名>.旧版-2026-09-13` 留同级、AGENTS.md 备份＋合并、全程不问人）＋原 1-6 步（"模板无 scripts，不新建"按包实际改为"业务原地不动"）＋末尾一次性汇报。母版与包内字节同（md5 `deed589a`），顶部加"本机专用"小字。
- 文档对齐（**F-01 闭环**）：两包 README 拷贝清单补列《Orca 通用编排者持续推进协议》《Orca 编排治理监督者提示词》并指定落 `项目 docs/prompts/`（此前既漏列、又令 `AGENTS.md` 与《编排者提示词》里的 `docs/prompts/` 引用在包内悬空）；母版 README prompts 行、老项目包描述同步更新。
- 两包同步：老项目包（README＋迁移整理提示词＋zip）＋新项目包（README＋zip；新项目包不加迁移提示词）。两 zip 已重建，解压与磁盘仅差 `.DS_Store`、zip 内无 `.DS_Store`、无自举残留文件，验过。母版↔两包预期差 2 处（AGENTS:36＋scripts README:3，均裸名路径适配，Contract 已删）；《迁移整理提示词》原有 1 处裸名差已消（第 6 条改书名号，母版与包内字节同 `deed589a`）。
- 经验一句话加一条（共 11 条，三处 md5 `891c84fe`），HANDOFF §3 开工前读的条数同步改 11。
- 已 commit＋push origin/main（含本笔收尾回填），工作区干净。

## 24. 迁移补丁记一笔（2026-09-13，用户定，冻结期单条解冻）

- 补丁（《迁移整理提示词》母版＋老包，字节同）：第5步加归位表落盘路径（`docs/templates/归位表.md`，覆盖旧版）；新增5.5（建`docs/handoff/HANDOFF.md`首版：现状/映射记执行链、基线记剩P0/下一步、CHANGE_REQUEST=NONE；有旧版按第0步铁律先备份）。不断会话走第6步直切编排者不断档；断会话靠首版接续。
- 老包zip重建（清单与旧包一致、无`.DS_Store`、包内含补丁已验）；新项目包无此文件不动。母版↔老包迁移提示词diff ZERO。
- 已 commit＋push origin/main，用户明确指令（含分支main）。

## 25. 第0步判据修正记一笔（2026-09-13，用户指出）

- 问题：§23 写入的第 0 步判据"若本项目根已有 AGENTS.md 和 docs/roles/，说明包已到位，跳过本步"——老项目本来就有自己的 AGENTS.md 与 docs/roles，判据永远成立 → 永远跳过取包 → 新版模板包永远用不上（自举功能等于写废）。
- 修正：第 0 步改为**无条件取包**，删掉"是否已到位"判断；安全性由既有冲突铁律兜底（没有的→放；一样的→跳；不一样的→改名备份后放），重复执行幂等。母版＋老包字节同。
- 连带：母版 README 老项目包描述去掉同一判据表述；§23 第 0 步描述同步修正。
- 老包 zip 重建（解压与磁盘仅差 `.DS_Store`、zip 内无 `.DS_Store`，验过）；新项目包无此文件不动。
- 已 commit＋push origin/main。

## 26. 基础设施规范入母版记一笔（2026-09-15，用户定短名＋四处落位）

- 文件（短名，去版本号，引用不朽）：母版 `docs/sop/docker.md`（源2026-09-02 V1.1）、`docs/sop/supabase.md`（源2026-09-03 V1.4）、`docs/sop/sqlite.md`（源2026-09-15 V1.0）。头部版本行与末尾版本记录保留为历史；正文现行互引6处去版本（docker配套文件改直链`./supabase.md`，其余书名号去"Vx.x"），`规范 V1`/`%20`零残留已验。
- 四处：母版真源＋新项目模板包＋老项目迁移模板包（sop三份md5三方一致）＋中央 `~/.agents/rules/docker.md|supabase.md|sqlite.md` 软链指回母版（散兵智能体不走ORCA也能读到；`orca.md→AGENTS.md`同理）。
- 接线：README docs地图sop行补三文件名；《迁移整理提示词》第0步docs清单加sop（含三文件名），两包README归位清单成对补 `docs/sop/→项目 docs/sop/`；老包迁移提示词与母版字节同已验。
- 两zip重建并验（python zipfile：sop三份在位且与磁盘md5一致、无`.DS_Store`；`unzip -l|grep`在本机对中文包名显示异常，不可作验收依据）。
- 派工：DB任务必带supabase/sqlite，部署任务必带docker，进静态prefix（任务目标仍最后），supervisor抽查没带打回。
- 未commit，等用户指令（含分支名才动）。

## 27. 检查整改＋分工表软链制记一笔（2026-09-15，用户定全修）

- P0：DISPATCH runtime 枚举加 `opencode`（AGENTS:58 三处＋supervisor 卡断言块三处），与现表 supervisor/builder=opencode 对齐；此后按现表派工不再被自家断言打回。
- P1：README 模型口径节、HANDOFF §1 分工表段改现表口径（supervisor＝muse-spark/opencode、builder＝deepseek-v4.1-flash/opencode）；supervisor 卡去硬编码（见表不复述）、builder/supervisor 两卡 `-y` 引用改通道无关（按表对应行调用方式，codebuddy `-y` 留作示例）。
- P2：派工必带 sop 进链（AGENTS 派工顺序＋编排者提示词读盘 :12/干活 1，supervisor 抽查）；AGENTS:74 改"基础设施规范位"；sop 两处实例注记（docker §2.1 本机示例/§8 实例、supabase §12 实例/§18 示例路径各项目替换）；经验＋1（共 12 条，三处一致）。
- 分工表软链制：真源只在母版；各项目根表均为软链指母版，改母版即全项目同步（禁拷实文件；跨机器断链时拷实文件并记 HANDOFF）。接线：AGENTS 模型节＋母版 README＋两包 README＋《迁移整理提示词》第 0 步（表不拷贝，备份后建链，目标＝源路径去尾段包名＋/USER_MODEL_OVERRIDE.md）。
- 两包同步＋两 zip 重建并验；母版↔两包 roles ZERO、AGENTS 仅 :36 裸名差。
- 未 commit，等用户指令（含分支名才动）。

## 28. Bridge/codebuddy 通道彻底删除记一笔（2026-09-15，用户定）

- 删文件：`BRIDGE_INTEGRATION_CONTRACT.md` 母版＋两包共 3 份彻底删除，不存档（Git 历史可回溯）。
- 清引用（母版＋两包同步）：AGENTS（:36 表定通道、:39 禁套娃句、:58 runtime 枚举删 codebuddy，现为本窗口/codex/opencode/—）／supervisor 卡断言 tuple／builder 卡（:7 删 Bridge 前缀与 bridge-builder 例、:8 删 codebuddy 例）／编排者 :10（删 Bridge/Contract，通道以分工表为准）／外部 :3（删 Bridge 句）／BUGS.template :15（删 codebuddy 例）／HANDOFF.template :20（删 Contract 格式句）／母版 README（删 Contract 行与改名对照行）／两包 README（删 Contract 去向行）／迁移整理 :13（删 Contract 清单项）／经验删 -y 轮一条（11 条）／`docs/model/模型分工工作量排名-2026-09-13-参考.md` 整份删除（含 codebuddy 快照行）。
- 保留：builder 行 `opencode-go/deepseek-v4.1-flash via opencode` 不动（禁的只是 codebuddy 路）；日期冻结的历史报告/交接旧节内旧提法不动（证据原文）。
- 两 zip 重建并验；未 commit，等用户指令（含分支名才动）。

## 29. 复审剩余项对齐记一笔（2026-09-15，用户定）

- P0-1：AGENTS:6＋TM:10 删 FREE，product-reviewer 模型/通道以表为准（现 codex/Luna）。
- P1：TM:9 补第四态／TM:7＋HANDOFF.template:15 used 口径改恒填主／AGENTS:64 缓存静态打头加 sop 分支／AGENTS:6＋README:9＋编排者:16 Gate 补全模板全条件／TASK schema 补 note 可选键＋示例换 builder 现行＋迁移整理 5.6 删示例步骤＋README 措辞统一／HANDOFF :76/:178 计数改 2 处裸名差。
- P2：TM:10 速记补后两项／AGENTS:38＋编排者:10 resume 明确含 opencode／builder 禁新建举例改通道无关／README（根 11 件、history 第三份、已删除补排名、对照空悬注记、账本措辞）／sop 三头部加自身版本注（冻结件旧提法豁免不改）／supervisor 五查改六查（加状态机合法性）。
- 工具：`scripts/check-sync.sh` 一键核母版↔两包（预期差仅 AGENTS:36＋scripts README:3，其余零容忍），替代 HANDOFF 人工计数。
- 两包同步＋两 zip 重建并验；sop/复审报告 git add 落盘；未 commit，等用户指令（含分支名才动）。

## 30. product-reviewer 换 Terra 记一笔（2026-09-15，用户定）

- 表 `:11`：product-reviewer＝`codex/gpt-5.6-terra`/codex（短名 `gpt-5.6-terra`，禁本窗口代做）；qa 留 Luna 不动。
- 同步：母版 README:15＋HANDOFF §1 拆分；角色卡/AGENTS/TM 卡零改动（均以表为准）；两包同步；两 zip 重建并验。

## 31. builder 切 codebuddy 主备链记一笔（2026-09-16，用户定，A 方案）

- 真调：主 `codebuddy --model deepseek-v4.1-flash` 名存在但 429 频率限制（2026-09-16 17:10 UTC+8 重置）；备 `codebuddy --model glm-5.3-flash` pong 通过。链：主→备→再限额停派喊人。
- 表 builder 行改 codebuddy 主备备注式；codebuddy 重进 AGENTS/断言/builder 自测（仅 builder 相关）；README§1/HANDOFF§1 同步；两包同步；未 commit，等用户指令。

## 32. qa 真机走本窗口直驱记一笔（2026-09-16，用户定，builder 不动）

- 表 qa 行：模型保持 `codex/gpt-5.6-luna`，通道 codex→本窗口；真机QA（adb/Expo）走本窗口 bash 直驱，note 记原因，supervisor 不记偏离。builder 维持 codebuddy 主备链不动。
- qa 卡补真机直驱句；README/HANDOFF §1 同步；两包同步；未 commit，等用户指令。
- 真调闭环（2026-09-16）：codex 沙箱（read-only）下 Luna 跑 `adb devices` BLOCKED（daemon 起不来，前提证实）；`-s danger-full-access`（等价本窗口无沙箱）下 Luna 回显设备 `IN9LZTAYV4UGU4JF device`，直驱可行，A 闭环。
- 输入冒烟半过（2026-09-16）：HOME＋`input text ORCA-smoke-TEST123`＋截屏全 exit 0（824352 字节真图），未开应用；命令通路OK，文字落点未验（HOME 下无聚焦框，需目标输入框）。装包见 §33（已装上，落字待目标框）。

## 33. 收工记一笔（2026-09-16，开发暂停，neat 已过）
- 装包验证：用户手机点允许后重装，landedazi v1.0.4 `Success`（com.landedazi.app，versionName 却为 1.0.0，名实不符待问项目方）；monkey 误进系统设置页一次，改直起 MainActivity 成功，PHOTO SPOT 首屏 TM 目检通过；找参考页误触回桌面一次（搜索栏输入单被 abort，未完成）。
- neat：同步脚本 exit 0、工作区仅今日变更、经验 11 条、/tmp 证据（luna-*.png＋ui*.xml，重启即清）留存未删。
- §§1–3 已重写为 09-16 现势；今日工作区未 commit，等用户指令。

## 34. builder 回 opencode GO 记一笔（2026-09-16，用户定）
- 真调：`opencode run -m opencode-go/deepseek-v4.1-flash "pong"` 回 pong，通过。
- 表 builder 行回退 opencode GO 单通道，主备备注链删除；codebuddy 表述清零（AGENTS/断言/builder 自测）；README/HANDOFF §1 同步；两包同步；未 commit，等用户指令。

## 35. 新增 db-admin 专项角色记一笔（2026-09-18，用户定增，Change C）

- 需求：Supabase 入库审核免人工转送，TM 直派数据库管理员（Luna/codex，工作区固定本机 000-alw-数据库管理专家仓），收审查材料→回三态结论（§16/§16.2/§17），用户不中转。
- 落位：新卡 `docs/roles/db-admin.md`＋表增 1 行（11 行）＋AGENTS（9+1＋1、角色行、谁写哪、审核 bullet、11 行）＋TM 卡直派句＋README（11 卡＋模型节）；Luna/codex 通道已验，免重复烧额度；两包同步；未 commit，等用户指令。

## 36. db-admin 换 opencode GO 记一笔（2026-09-18，用户定，免检）

- 表 db-admin 行：`codex/gpt-5.6-luna`/codex → `opencode-go/deepseek-v4.1-flash`/opencode（工作区句保留）；同 ID 当日 builder 已验 pong，用户定免检，不重复烧额度。
- README 模型节、HANDOFF §1 同步；两包同步；未 commit，等用户指令。

## 37. builder 重回 codebuddy 主备链记一笔（2026-09-18，用户定）
- 真调：主 deepseek-v4.1-flash 429 已恢复 pong 通、备 glm-5.3-flash pong 通（两单）。
- 表 builder 行恢复 §31 主备备注式；codebuddy 重进 AGENTS/断言/builder 自测（仅 builder 相关）；README/HANDOFF §1 同步；两包同步；未 commit，等用户指令。

## 38. qa 双态分派记一笔（2026-09-18，用户定 B）

- 根因：qa＝Luna＋本窗口互斥，本窗口只能跑开窗口模型，Luna 永不登场。
- 真调：Luna codex 只读跑 check-sync＋DISPATCH 断言，双 exit 0 PASS，未改文件。
- 表 qa 行回 codex＋双态备注（普通走 Luna，真机走本窗口直驱）；qa 卡/README/HANDOFF §1 同步；两包同步；未 commit，等用户指令。

## 34. PC 本地 rules 软链落地记一笔（2026-09-16，本机环境）

- 现状：本机（ZhuanZ/Windows）`C:\Users\ZhuanZ\.agents\rules` 原为空目录（AGENTS.md 第 5 节引用其下 docker/supabase/sqlite.md 实为悬空）；今按 §26 设计替换为 **Junction 目录软链**，指回坚果云从 Mac 同步来的母版副本：`E:\000coding\4.Templates（PC）\2026-09-09 丨 MAC 丨 ORCA V2.1 治理模板 丨 分发版-2026-09-11\docs\sop`。验证：rules 内现可见 docker.md/supabase.md/sqlite.md 三规范，大小与真身一致。
- 约定（用户确认）：规范只在 Mac 端改，坚果云同步到 PC；本机 rules 软链自动跟随，PC 端当只读入口。
- 注意：软链位于 `~/.agents`（不在坚果云同步目录内），不会被同步/分发；换机须重建（符合 §27 软链制「跨机器断链时拷实文件并记 HANDOFF」）。向 `~/.agents/rules/` 写/改＝直接改母版真源（路径穿透），PC 端只读。
- 方法：`Remove-Item` 删空目录 → `New-Item -ItemType Junction`（免管理员）；本环境 PowerShell stdout 回显为空（host 怪癖），用 Git Bash `ls` 验链接与内容。

## 35. 华为 CodeArts Doer 软链落地记一笔（2026-09-16，本机环境）

- 背景：华为桌面编程工具（CodeArts Doer）自有一套管理目录 `~/.codeartsdoer`，默认读不到中央 `.agents/AGENTS.md` 与中央技能仓库；本机（ZhuanZ/Windows）按用户要求以软链接入中央，统一「单一真源」。
- rule（路径无效，已纠偏）：原 `~/.codeartsdoer/rule` 为空目录；曾误建 **Junction 目录软链** → `C:\Users\ZhuanZ\.agents`，文件系统可见中央 `AGENTS.md`+`rules/`，但**工具（opencode 内核）实际不读此目录**（日志坐实其只注入 `~/.claude\CLAUDE.md` 兜底，不取 `rule/`），故该链对"读规则"无效，留作备用/无害，勿误以为生效。
- instructions（正确落地，2026-09-16 纠偏后）：在 `~/.config\opencode\opencode.jsonc` 加 `"instructions": ["C:\Users\ZhuanZ\.agents\AGENTS.md","C:\Users\ZhuanZ\.agents\rules\*.md"]`，opencode 启动即**叠加**加载中央全局准则 + docker/supabase/sqlite 三规范。**不顶替** `~/.claude\CLAUDE.md`（保留原有"不寒暄/编码前思考"等准则）。注：文件软链（方案 B 原意：建 `~/.config/opencode/AGENTS.md` 软链顶替 .claude）在本机普通用户下被拒（`mklink` 需管理员/开发者模式，目录 Junction 才免权限），故改走 config instructions。改 Mac 中央 → 坚果云同步 PC 真身 → 工具读最新，仍是单一真源。
- skills：保留华为自带 3 个技能（codebase-crossrepo-pipeline / repo-simple-wiki / repo-simple-wiki-update）及 `UserSkillStatus.txt`/`.cb-skill-gen` 元数据不动；为中央 `~/.skills-manager/skills` 的 **34 个**技能逐个建 **Junction**（非整目录链，避免盖掉自带技能、避免工具装技能污染中央 git 仓库）。验证：华为侧 `skills/` 现共 38 条目（34 链 + 3 自带真目录 + 2 元数据），34 链全部穿透读中央真身成功。
- 约定（用户确认）：规范/SKILL 只在 Mac 端改、坚果云同步到 PC 副本；本机软链自动跟随，PC 端当只读入口。
- 注意：两条链均在 `~/.codeartsdoer`（不在坚果云同步目录内），换机/重装须重建。补链脚本：`relink-codeartsdoer-skills.ps1`（WorkBuddy 工作区 `2026-09-16-13-34-53\` 下；中央新增技能后跑一次即补齐）。向 `~/.codeartsdoer/rule` 或 `~/.codeartsdoer/skills/*` 写/改＝穿透改中央真源，PC 端只读。
- 方法：`Remove-Item` 删空目录 → `New-Item -ItemType Junction`（免管理员）；本环境 PowerShell stdout 回显为空，用 Git Bash `ls` 验。

## 36. `~/.claude/CLAUDE.md` 软链入中央（Claude Code 读中央，2026-09-16，本机环境）

- 背景：`~/.claude/CLAUDE.md` 原是独立手写文件（1777 B，2026-08-03，内容为「全局工作准则」：不寒暄＋编码前思考／简洁优先／精准修改／目标驱动执行四节）。用户要求让真正的 Claude Code 也**读中央**，消除第二份真源。
- 落地（已完成并验证）：`C:\Users\ZhuanZ\.claude\CLAUDE.md` 已替换为**符号链接** → `C:\Users\ZhuanZ\.agents\AGENTS.md`。验证：`readlink` 指向中央；`cmp` 与中央逐字节一致（2742 B）；`ls -la` 显示 `CLAUDE.md -> .agents/AGENTS.md`。
- ⚠️ 内容缺口（待用户决策）：原 CLAUDE.md 那四节编码准则（编码前思考／简洁优先／精准修改／目标驱动执行）**不在中央 `AGENTS.md` 内**（逐词检索 0 处命中）。软链生效后，Claude Code 加载的是中央五节（回复与沟通／开发与交付／文件与敏感信息／Skill 创建与迁移／中央入口），**不再含那四节**。若要保留，须按中央治理流程（一线提案→中央审核→用户确认）并入 `AGENTS.md`。
- 原文备份（未丢）：同源完整副本在 `C:\Users\ZhuanZ\.codex\AGENTS.md`（1776 B，2026-08-03 12:45）；另拷一份到 WorkBuddy 工作区 `2026-09-16-13-34-53\CLAUDE.md.原文备份-2026-09-16.md`。
- 方法／坑（Windows 文件链接）：文件级**硬链/符号链一律需管理员或开发者模式**（目录 Junction 才免权限，见 §34/§35）。**仅开启开发者模式不够**——该权限要**注销重登／重启**取得新登录会话后才进令牌，否则仍报 `UnauthorizedAccessException`；本机两次探测均因此失败（探测即止，未动真文件）。最终以**管理员终端**执行 `cmd /c "del … && mklink C:\Users\ZhuanZ\.claude\CLAUDE.md C:\Users\ZhuanZ\.agents\AGENTS.md"` 一次建成。换机须重建（符合 §27 软链制）。

## 37. TRAE（Trae CN）软链落地记一笔（2026-09-16，本机环境）

- 背景：字节 Trae CN（VS Code 系 AI IDE，v3.3.100，build 2.3.83560）自带 `~/.trae-cn` 目录，默认读不到中央 `.agents/AGENTS.md` 与中央技能仓库；本机按用户「TRAE 帮我接入中央仓库和SKILL」要求以软链接入，统一「单一真源」。
- 路径纠偏（关键）：用户截图误以为 TRAE 读 `~/.trae-cn/rule`；**逆向其打包 JS 证实实际读 `~/.trae-cn/user_rules/`（目录）＋ 旧式单文件 `~/.trae-cn/user_rules.md`**。`~/.trae-cn/rule` 目录根本不存在，链到那里无效，勿误以为生效。
- 证据来源：`D:\000DevTools\Trae CN\resources\app\out\vs\workbench\workbench.desktop.main.js`（`userRulesDirPath="user_rules"`、`scanMdFiles` 递归扫 `*.md`、嵌套深度 ≤ 3、`legacyUserRuleFilePath="user_rules.md"`、`projectRulesDirPath="rules"`、`singleRuleProjectFileName="project_rules.md"`）＋ `AppData\Roaming\Trae CN\logs\20260916T125132\windowN\renderer.log`（`[RulesModeService] Initialized with mode: multi`、`[MultiRuleService] get all rules for scope: user` 反复出现，无 opencode 式 `Instructions from:` 注入——TRAE 无 `instructions` 配置键，仅靠目录扫描）。多规则模式（`multi`）默认开；项目级另读 `.trae/rules/*.md`、`project_rules.md`、`AGENTS.md`（默认开 `AI.rules.importAgentsMd`）、`CLAUDE.md`（默认关 `AI.rules.importClaudeMd`）。
- rules 落地（已建＋验证）：`~/.trae-cn/user_rules/` 下建 4 个**文件符号链接**（本机开发者模式已生效，`mklink` 免管理员、exit 0）：`AGENTS.md`→`C:\Users\ZhuanZ\.agents\AGENTS.md`、`docker.md`/`supabase.md`/`sqlite.md`→`C:\Users\ZhuanZ\.agents\rules/*.md`。`cmp` 逐字节与真身一致。**刻意不建**旧式 `user_rules.md`（否则 AGENTS.md 会被加载两次）。
- skills 落地（已建＋验证）：`~/.trae-cn/skills/` 由 3 条目扩至 **36 条目**，全部为 **Junction**（免管理员）。中央 36 个技能逐个建链；原先已有的同名 find-skills/grill-me/leader 本就是指向中央的 Junction，备份脚本识别 `LinkType=Junction` 后**跳过**、未删未覆盖（空备份目录已清，零数据丢失）。验证：36 链零缺失、全部穿透读中央真身成功。
- 约定（用户确认）：规范/SKILL 只在 Mac 端改、坚果云同步到 PC 副本；本机软链自动跟随，PC 端当只读入口。向 `~/.trae-cn/user_rules/*` 或 `~/.trae-cn/skills/*` 写/改＝穿透改中央真源，PC 端只读。
- ⚠️ 待最终确认（可见≠加载）：软链仅文件系统级生效，须**重启 TRAE** 后问它「你的用户级规则来自哪 / 你加载了哪些全局规则」做运行时确认。TRAE 无 opencode 式 `instructions` 配置键，确认只能来自工具自身回答或日志。
- 注意：两条链均在 `~/.trae-cn`（不在坚果云同步目录内），换机/重装须重建（符合 §27 软链制）。本笔同步写进 `agent-central-mapping` 技能 `references/tool-matrix.md`（新增 TRAE 段），技能 zip 待 Mac 端重打包。

## 38. agent-central-mapping 技能改造为可迁移/跨平台（2026-09-16，本机环境）

- 起因：用户要求该技能不仅本机用，还要在 Mac / Windows 11 等多设备、以及交给别的智能体使用；须做到**路径不写死**、**资料打包即拷即用**、**按 skill-creator 规范**。
- 改造（均已落盘，技能位于 `~/.workbuddy/skills/agent-central-mapping/`）：
  - `scripts/map_central.sh` 改为**跨平台**：自动探测 OS；macOS/Linux 用 `ln -s`，Windows 11 用 `mklink /J`（目录 Junction 免管理员）＋ `mklink`（文件符号链接，需管理员/开发者模式），路径经 `cygpath -w` 转换；中央路径一律由 `--agents/--skills` 运行时传入，**零写死本机绝对路径**。新增 `trae` 工具分支（规则入 `~/.trae-cn/user_rules/`、技能入 `~/.trae-cn/skills/`）。
  - `SKILL.md` 收斂：description 标明跨平台（macOS/Linux/Windows 11）；新增「Portable by design — no hardcoded paths」原则（原则 0）；指向新 `README.md`。
  - 新增根目录 `README.md`：安装步骤（解压到 `~/.workbuddy/skills/`，Mac/Win/Linux 通用）＋**可直接复制的提示词模板**＋跨 OS 说明＋工作流＋铁律。这是"加提示词就能跑"的资料。
  - `references/tool-matrix.md` 顶部加**可迁移声明**：✅ 里的 `C:\Users\ZhuanZ\...` 属本机验证示例，切勿照抄到别的机器；路径运行时询问取得。
- 打包（按 skill-creator 规范）：官方 `package_skill.py` 校验 **✅ valid** 并产出 `agent-central-mapping.zip`（12404 B，含 README/SKILL/tool-matrix/map_central.sh 4 件），位于本次 WorkBuddy 工作区根。解压即装、按 README 提示词模板给路径即可跑。
- 注意：HANDOFF 是坚果云从 Mac 同步来的 PC 副本；此笔写在 PC 副本，若 Mac 中央模板未含同样内容，下次以 Mac 端为准补 §38（或依赖双向同步）。换机部署只需拷 zip ＋ 按 README 给本机路径，无需同步链接本身。
- 2026-09-21（Web QA 标准通道冻结）：BrowserOS neo 本机实测双 READY，冻结为 Web QA V1 标准链 Orca→OpenCode CLI→BrowserOS MCP；规则写入 docs/roles/qa.md（Web QA 标准通道 V1 九条：路由/静默/动态端口/操作口径/认证安全/输出标准/故障分层/Gate不变），同步两本地包qa.md一致（SYNC_OK，zip包未重打）；未新增 Gate，未动 MVP/V1 结构。
## 39. 第三轮审查修复＋Decision Sidecar 接线记一笔（2026-09-22，用户定修对的项）
- AGENTS 补 Decision Sidecar 授权句＋sop 清单加 webqa/decision-router＋角色标题 9+1+1＋used 切备记法（三处同步两包）；supervisor 卡加 sidecar 抽查位；母版协议十卡改十一卡；check-sync 白名单行号 :36 改 :37；scripts/decision 清掉未用 SDK 依赖。
- sop 四件（android/webqa/decision-router）git 落盘＋进两包；经验 3 条同步两包；TASK 示例模型换现行主用；两包 README＋迁移清单补新构件去向。
- 34–38 重号冻结不再重排，新节自 §39 起。T3 注释保留（用户回退口令用）。HANDOFF §1 日期与五代报告正典化以后单独立项。
## 40. QA/模型实测证据补记（2026-09-21/22，用户定留档）
- Maestro＋ADB 真机 Flow 实测通过（2026-09-21，设置应用 6 步全绿 exit 0；未入规范，备用）。
- 火山方舟 Coding Plan 接入 opencode 实测通过（2026-09-22，`volcengine-plan/ark-code-latest` 回包正常，reasoningEffort high；个人实验通道，未进分工表）。
- `ORCA治理体系说明.md` 对外概览经 Sol 三轮审查（Gate/口径/证据逐条收敛）。
## 41. Jev 直调 10/10 证据记一笔（2026-09-22）
- 传输由 Vercel 网关改 TypeSafe 直调（POST /v1/systemone，jev-latest，实测 jev-1.13.0）。
- Smoke＋T01-T10 全对（A/B/C/QA/PLANNER/DB_ADMIN/NO/YES_IRREVERSIBLE/false/true；概率以 Shadow 日志现势为准，P0-false 记 1-noul），累计输入约 8.5k tokens。
- Sol 顾问复审通过（多轮收敛，唯剩说明文档入仓即闭环）。
## 42. GLM 精确模型证据记一笔（2026-09-22）
- 命令：`opencode run -m volcengine-plan/glm-5.3-flash "只回复：glm exact ok"`，exit 0，回包 `build · glm-5.3-flash`＋`glm exact ok`。
- 此前 `ark-code-latest` 回包不记作 glm 证据；alias 切换 3~5 分钟内结果不采信。
## 43. 并行施工Shadow轮记一笔（2026-09-22，分支 feat/parallel-builder-shadow）
- 双 Builder 真调用通（codebuddy deepseek-v4.1-flash／火山 glm-5.3-flash 精确 ID）；worktree 双建隔离验证后删除。
- 4 窄 Contract（pmmode/fanout/partchoice/mergerisk）＋静态 Partition 校验器（GOOD过/BAD拦/坏文件错码）；Jev pmmode 两轮不收敛（2/5），结论：单选天然弱，正式方案走 deterministic 预滤＋候选三选一，不开投票。
- 注入 PX1 未越界；Discovery 双路只读通；AGENTS/分工表零改动；SYNC-OK；Sol 审：BLOCKER 无，有条件通过 Shadow。
- 日志：temp/PARALLEL-SHADOW-LOG.jsonl。
## 44. 并行首个真实Parent闭环记一笔（2026-09-22，分支 feat/parallel-builder-shadow）
- Parent：partition-validate 补边界测试；Discovery 双路只读并行（A边界7类/B覆盖缺口），挖出重复push＋单child自检缺失两真bug。
- 实施串行单人完成：修两bug＋test-partition.mjs 12项全绿；反事实：串行22分钟，预估并行约18分钟（含双路Discovery并行省4分钟），gain有限因实施主体只有一人。
- Jev pmmode仍弱（2/5），验证结论不变：deterministic预滤＋三选一，不开投票。日志：temp/PARALLEL-SHADOW-LOG.jsonl。
## 45. 真双施工首跑记一笔（2026-09-22，分支 feat/parallel-builder-shadow）
- Parent TASK-PAR-002：双 worktree 双 Runner 并行施工（A测试用例/B文档节），B 事实错误打回返工 1 次改对。
- Integration 无冲突合入（异文件），test-partition 14/14，SYNC-OK，worktree/分支已清理。
## 46. Advisory 升级＋网络抖动记一笔（2026-09-22）
- Sol 终审：BLOCKER 无，可进 ADVISORY（运行模式正式切到 ADVISORY；自动路由仍禁）。
- runner 加 JEV_NETWORK 重试＋retried_network 落账；TypeSafe 批量限流抖动 средой单发通，离线档＋间隔＋重试扛过去。
- SYNC-OK。
## 47. builder 峰谷分流记一笔（2026-09-22，用户定）
- builder 改峰谷双路：空闲走 codebuddy/deepseek-v4.1-flash，高峰走 volcengine-plan/glm-5.3-flash；峰谷经 DeepSeek 官方＋Go 文档交叉验证（工作日 9-12/14-18 高峰）。
- 分工表 T3→T4，两包同步。
## 48. Android真机预检补记（2026-09-23，分支 feat/parallel-builder-shadow）
- 规范补一节：每 session 预检→直驱，Maestro备用、scrcpy只看屏。
- 现机预检：adb IN9LZTAYV4UGU4JF/无线双在线，get-state device，uiautomator dump通；断USB/授权失效分支未演练，暂为手工回退。
## 49. 收工小交接（2026-09-23，开发暂停，用户令先到这里）
### 1. 当前工作进展（2026-09-26，现势）

- 阶段/状态：模板冻结期继续；本日完成"派工审计 → 治理迭代"多批（用户拍板）：第一批 QA 沙箱解禁/账本字段/模型 ID 规范/迁移即登记（§50）、第二批 升级口径＋TM 代做边界＋builder 超时（§51）、第三批 证据质量规则＋校验（§52）、T19 分工（§53 前后）、TM 资格测试（§53）、Jev 决策流水（§54）。
- 模型分工：以根 `USER_MODEL_OVERRIDE.md`（现 **T19**）为准，**本 HANDOFF 不复述 ID**；本日：qa 行加 QA 专用沙箱解禁 `-s danger-full-access`（仅限 QA、须记账）；neat-freak/db-admin 切 `opencode-go/space-bunny-free`；override 加 TM 资格候选注释（TM 行仍"开窗口时定"）。
- 落地：AGENTS/override/qa卡/HANDOFF；账本加 `executed_by`/`chain_status`＋model 精确写法，`check-ledger` 收紧（结构错=FAIL/写法不规范=WARN）＋证据质量 WARN；`scripts/model/tm-qualification.mjs`＋事件日志（TM 资格）；`orca-decide.mjs` 落 `JEV-DECISION-LOG.jsonl`；`check-sync` 扩覆盖。母版＋两包常驻 SYNC-OK。
- 派工审计（1.Active）：报告与整改任务书经 Sol 多轮审；结论"历史不追溯"，路线＝治理迭代→老项目迁移→迁移即登记。逐项目待办清单存 `1.Active/ORCA派工账本-逐项目待办清单.md`（4 项目 HANDOFF 已挂待办，未提交，留各自 TM）。
- 上一真实业务链为 028 等（详见 §33–§49 历史节）；最新提交以 Git 历史为准。
- 账本：母版 TASK/DISPATCH 均仅 `_example` 行；经验 18 条。
## 2. 下一步任务（按序，恢复时逐条做）
1. 跑`bash scripts/check-sync.sh`取exit码，落本HANDOFF一行（验证T4两包同步）。
2. 修P0-1：README:15、ORCA说明§五、HANDOFF§1同步峰谷双路口径（或改“以表为准不复述ID”）。
3. 修P0-2：DISPATCH runtime枚举加`volcengine-plan`（AGENTS＋supervisor卡＋校验脚本同步）。
4. 修P0-3：AGENTS禁套娃句补volc通道（“非本窗口一律走通道直调”）。
5. P1逐条修（used恒填主vs峰谷记法、总监督“不占9+1+1”、§1去手数、§34–38本地节移出、check-sync白名单去行号、decision endpoint统一、sidecar落盘位、TASK示例峰谷示范、T4版本号豁免）。
6. 全修完重跑check-sync＋账本断言，SYNC-OK才报完工。
### 3. 注意事项及规矩
- 模板冻结期：只收问题不改文件，P0才问是否插队；无用户明确指令（含分支名）不commit不push。
- 派工以母版`USER_MODEL_OVERRIDE.md`（T4）为准，README/说明/HANDOFF§1旧口径不得作为派工依据；高峰builder按表走volc，runtime暂填`opencode`＋note记`peak/volc`，等P0-2修完再按新枚举填。
- 冲突听表；换模型用户定；supervisor抽查实派==表三处对账；总监督wake-only（只喊编排者，两次叫不醒才找用户一次）。
- 恢复读盘顺序：AGENTS→角色卡→override表→本HANDOFF→经验一句话→任务目标放最后。
## 49. 并行 W2 真 Implementation 演示记一笔（2026-09-24，分支 demo/par-w2）
- Parent TASK-DEMO-PAR-003：两独立 docs（feature-a/b.md）分派 volc deepseek / radeon mimo 双 worktree 同写，allowed_paths 无重叠，Integration 两次无冲突合流（先 A 后 B）。
- 验证：PV_GOOD 校验通，SYNC-OK，分支 demo/par-w2 保留，worktree 未删（演示用）。

## 50. 派工审计驱动的治理迭代第一批记一笔（2026-09-26，用户拍板 A+B）
- 起因：1.Active 全项目派工日志审计（报告+整改任务书经 Sol 多轮审查可用）暴露：QA 反复"环境失败"、模型 ID 写法混乱、TM 代做不可审计、迁移不登记。
- 本批改动（母版＋两包同步，check-sync SYNC-OK）：①QA 沙箱解禁：override qa 行命令加 `-s danger-full-access`（仅限 QA、须记账；实测可绑端口）/qa 卡双态分派补口径/AGENTS 派工顺序补一句；②模型 ID 规范化＋账本新字段：AGENTS 账本 schema 加可选 `executed_by`/`chain_status`＋model 精确写法规范，DISPATCH schema 加 `executed_by`，两本账示例行更新，`scripts/model/check-ledger.mjs` 加 model 白名单与字段枚举（结构错=FAIL、写法不规范=WARN）；③迁移即登记：迁移提示词新增 5.7 登记检查（跑 check-ledger 得 LEDGER-OK 才算迁移完成）。
- 用户决策：QA 解禁限 QA；新字段设可选（兼容旧账本）；chain_status 用英文三态 DELIVERED/ACCEPTED/OPEN；model 白名单特殊值分两类（本窗口类合法、"未派/未记录"类 WARN）。
- 明确定向（用户 2026-09-26）：历史账本不追溯补录；改为"治理迭代→老项目迁移→迁移即登记"往前做。
- Sol 落地复审后修（2026-09-26）：①老包迁移提示词误删恢复——以老包版为真源（含 android/webqa/decision-router 与 scripts 子目录清单），母版同步；②`check-ledger.mjs` 收紧（空 model/未知模型/非法 JSON 行判定）；③`check-sync.sh` 补"迁移提示词母版↔老包"检查；④QA 解禁措辞校正为"关闭沙箱＝完整访问权"。
- 状态：工作区已改未 commit（母版 8 件含本 HANDOFF＋新包 6 件＋老包 7 件＋母版 `scripts/check-sync.sh`），SYNC-OK；等用户明确指令（含分支名）再 commit/push。

## 51. 治理迭代第二批记一笔（2026-09-26，用户定：升级自动不打扰）
- 起因：下一批核实（P0-1 028 ChangeB 打回链／P1-5 逐项核验／P1-2 codebuddy 超时）。
- P0-1 结论：028「ChangeB」supervisor 自记 2 次打回、`rework=2`、未升；但账本 `rework` 未标"谁打回/打回谁"、"同一 Task"未定义粒度 → **无法坐实**；暴露规则缺陷（非个人过失）。
- P1-5：022 TM 代执行为 **3 次事件**（D8 有 HANDOFF 旁证"用户明确要求"、D9"拍板近似"、**D10 无注明待补**）；028「RC清障三件」`PASS` 但注"待评审初版/产品阻塞"→ 应 `chain_status=OPEN`；028 QA 虚报已入账原始佐证待核；TM 接管 29 条多为通道兜底非越权。
- 本批改动（母版＋两包 SYNC-OK）：①升级口径明确——计数单元＝同一 task id（不按角色拆）、只数 supervisor FAIL 且 DISPATCH 记账可数、QA 自身 FAIL 不计但致返工则计；②**升与打扰（用户定）：达 2 次即自动升 senior、不打断用户，不得以"原因消除"免升或询问用户**；③TM 代做边界成文（真机直驱合规／通道兜底须记 `executed_by`＋原因＋≥2 次上报／越权代做违规）；④override builder 行加超时策略（超时先查工作区落盘）。
- 028 既往：账本无法坐实，**不追既往**，从新口径起算。

## 52. 治理迭代第三批记一笔（2026-09-26，证据质量规则＋校验）
- 主题：把审计发现的"角色交付 PASS ≠ 整链验收"落成规则与机器校验。
- 改动（母版＋两包 SYNC-OK）：①`AGENTS.md` 账本节新增 `chain_status` 使用口径——按"当前交付"三取一、互斥、判不准取 `OPEN`：①整链通过=`ACCEPTED` ②本条当前交付有待办/阻塞=`OPEN`（待办须属本条，正常下游流转不计）③角色已交付、本条无待办、链正常推进=`DELIVERED`；不得因角色 PASS 记 `ACCEPTED`。②`check-ledger.mjs` 加证据质量 WARN（**仅 TASK 账**）：`result=PASS` 但备注含未闭环字样且未标 `OPEN` → WARN。
- 复核：Sol 两轮审（口径重叠/validator 误扫 DISPATCH/关键词不一致/待办归属）逐条修复；实跑 028 精确命中 TASK#60、022 DISPATCH 不误报、模板示例行仍 FAIL。

## 53. Task Manager Qualification 增量治理记一笔（2026-09-26，提示词 V1.2）
- 目标：把 TM 纳入模型资格测试，不新增第 12 角色、不重做两阶段治理。
- 落位（母版＋两包 SYNC-OK）：①`docs/model/TASK-MANAGER-QUALIFICATION.md`（Episode 定义/监督/五维评分/Gate/A-B/报告）；②事件证据 `docs/model/TASK-MANAGER-QUALIFICATION-EVENTS.jsonl`（Qualification evidence only，不改现有账本 schema）；③评分器 `scripts/model/tm-qualification.mjs`（只读派生）；④测试 `scripts/model/tm-qualification.test.mjs`＋fixtures（12 断言全绿：Ledger 回归/正常 Episode/Stall/Human Gate/错误路由/切换区分/基础设施分离/确定性）；⑤`AGENTS.md` 加"Task Manager Qualification"节；⑥`supervisor.md` 加 Task Manager Observer（职责扩展非新角色）；⑦`task-manager.md` 加 Episode 记账；⑧override 加 A/B 候选注释（TM 行仍"开窗口时定"）。
- 候选（真调已过）：`opencode-go/deepseek-v4.1-flash`、`opencode-go/mimo-v2.6-flash`（Runtime=opencode）。
- 不破坏：现有账本/validator 未改语义；Human Gate/Phase/升级规则不动；Web/Android QA、Jev 边界未动。
- 端到端验证（2026-09-26，测试目录已清理）：开 2 个小测试项目 proj-a(TM=`opencode-go/deepseek-v4.1-flash`)/proj-b(TM=`opencode-go/mimo-v2.6-flash`)，各跑 3 Episode（TM 真调决策＋worker `opencode-go/space-bunny-free` 真干活）；TASK/DISPATCH 两本账＋资格事件均落盘，`check-ledger` LEDGER-OK，`tm-qualification` Score=90/CANDIDATE（采样不足自动保持）。真实项目 A/B 待用户在真实项目内跑。

## 54. Jev 决策流水记一笔（2026-09-26，用户定）
- 缺口：Jev（decision sidecar）此前只在 stdout 输出、不落盘；生产里每次裁判无档案。
- 落位（母版＋两包 SYNC-OK）：①`orca-decide.mjs` 每次调用 best-effort 追加一行到项目内 `docs/model/JEV-DECISION-LOG.jsonl`（env `JEV_DECISION_LOG` 覆盖；目录不存在静默跳过；`fail()` 与确定性短路也留痕；`input_digest` 哈希实际输入）；②新日志文件 `docs/model/JEV-DECISION-LOG.jsonl`（含 `_example`）；③回归 `scripts/decision/test-decision-log.mjs`（5 断言：落盘/不泄密/无目录不建文件/fail 留痕/选项在前的 mode 识别）；④`decision-router.md`/`AGENTS`/decision `README` 补说明。
- 边界：**只记非敏感元数据**（mode/decision/confidence/model/requested+resolved/policy_version/input_digest/latency/fallback/deterministic_shortcut/ok），**不记 state 原文、不记 Key**；**不改 Jev 权限与 Contract**；advisory-only 不变。
- 复核：Sol 两轮审（fail 缺 mode／确定性 digest 不追踪实际输入／argv 选项在前）逐条修复，终审 **PASS**。

## 55. 收工交接记一笔（2026-09-26，用户令开发暂时结束）
- 本轮动作：仅重写 §§1-3（现势／下一步／规矩）＋顶部更新行；另派 neat-freak 尝试治理同步被权限拦、用户中止，**四老项目零改动**。
- 开工自检结果：`bash scripts/check-sync.sh` → **SYNC-OK**；`node scripts/model/check-ledger.mjs docs/model` → 仅两本 `_example` 未删（母版预期，母版不记实绩）；`git status` 收工前干净，最新 commit `2a763f1` 已 push。
- 未 commit：本 HANDOFF 三处改动在工作区，等用户指令（含分支名，默认 main）再 commit/push。
- 未派/未做清单：§2-1 老项目同步登记（用户划出界外）、§2-2 真实 A/B（用户自跑）、§2-3 治理尾巴（挂各项目）。
- 已知坑留档：`opencode run` 跨目录读 `1.Active` 会被 `external_directory` 自动拒；改到共同父目录派工的方案未验证完（被中止），下次要恢复先解决权限。

## 56. db-admin 切火山方舟（ark-code-latest 模式）记一笔（2026-09-26，用户指令）
- 用户指令：db-admin 换成火山方舟的 deepseek-v4.1-flash；用户已在控制台切换模型，要求"以我的为准"。
- 调研：火山方舟 Coding Plan 支持两种配置方式——①配置文件指定 Model Name（如 `deepseek-v4-flash`／`glm-5.3-flash`）②配置 `ark-code-latest`（控制台管理，实际模型由控制台切换，3-5 分钟生效）。用户明确"不用写模型 id"＝选 ②。
- 真调：`volcengine-plan/ark-code-latest` exit 0（pong 通）。对比：`deepseek-v4.1-flash` 不存在、`deepseek-flash` 不支持 coding plan 功能、`glm-5.3-flash` 可用但用户指定用 deepseek 系。
- 落地：三份 override（母版＋两包）db-admin 行改为 `volcengine-plan/ark-code-latest`，版本注释 T20→T21；check-sync override 部分 md5 三方一致。
- 未 commit：等用户明确指令（含分支名，默认 main）。

## 57. neat-freak 切火山方舟（ark-code-latest 模式）记一笔（2026-09-26，用户指令）
- 用户指令：neat-freak 切火山方舟。
- 沿用 §56 结论：ark-code-latest 模式（不写具体模型 ID，实际模型由控制台管理）；`volcengine-plan/ark-code-latest` 已在 db-admin 真调通过，复用证据不重复真调。
- 落地：三份 override neat-freak 行改为 `volcengine-plan/ark-code-latest`，版本注释 T21→T22；check-sync override 部分 md5 三方一致。
- 未 commit：等用户明确指令（含分支名，默认 main）。

## 58. neat-freak＋db-admin 增加备用 AMD MiMo 记一笔（2026-09-26，用户指令）
- 用户指令：neat-freak 和 db-admin 增加备用 AMD 的 mimo-v2.6-flash。
- 调研：从 `scripts/decision/policy.json` 找到配置——provider `radeon-mimo`，模型 ID `radeon-mimo/MiMo-V2.6-Flash`，通过 Claude Code 调用（`runner_bin: "claude"`）；decision-router.md 记载"radeon-mimo 直连已验 mimo ok"；check-ledger.mjs 白名单已含 `radeon-mimo/MiMo-V2.6-Flash`。
- 真调：`opencode run -m radeon-mimo/MiMo-V2.6-Flash "pong"` exit 0（pong 通）。
- 落地：三份 override neat-freak＋db-admin 行增加备用 `radeon-mimo/MiMo-V2.6-Flash`（via Claude Code，真调已过），版本注释 T22→T23；check-sync override 部分 md5 三方一致。
- 未 commit：等用户明确指令（含分支名，默认 main）。

## 59. 小交接记一笔（2026-09-26，用户令开发暂时结束）
- 本轮动作：重写 §§1-3 为小交接现势；追加本节。
- 本日变更：db-admin/neat-freak 切火山方舟（ark-code-latest 模式，§56）；neat-freak/db-admin 增加备用 AMD MiMo（§58）；override 表增加备用模型/备用执行通道两列（T23）；模型调用档案（17 个历史模型）落 override 表末尾；经验一句话同步两包（24 条）；/tmp 残留清理；check-sync SYNC-OK；commit + push（`c5408ba`）。
- 派工逻辑（用户定）：每次优先主用，限额切备用，下轮仍优先主用。
- 未竟：§2-1 老项目同步登记（用户划出界外）、§2-2 真实 A/B（用户自跑）、§2-3 治理尾巴（挂各项目）。
- 复检（2026-09-28，supervisor）：GOV-产品验收整改-2026-09-28 复检 PASS（打回0/2；P0=0/P1=0/P2×2见复检正文），链闭环可收口。

## 60. 产品验收治理整改记一笔（2026-09-28，用户令整改＋GPT-6 Sol 审查＋实际测试＋清理报告）

- 起因：用户报告「产品 QA 一直没做，只有自动化测试；网页效果的产品验收一直没落实」。我先自查证据，确认是**三层都漏**（非能力缺失）：①通道能力**有**（`docs/sop/webqa.md` BrowserOS V1 于 2026-09-21 冻结 READY，母版＋两包 `qa.md` 均已含九条）；②**落盘位无**（`BUGS.template.md` 原本只有真机CUA预检＋Fingerprint 两节，无产品验收节；`docs/qa/` 9 份历史实例全是真机 CUA，零份 Web 视觉验收）；③**验收标准无**（`PRODUCT_PLAN.template.md` 全文零处视觉/原型/截图/UI 措辞）；④**派工口径无**（`qa.md` 七查全自动化口径，无产品验收这一格）。
- 用户提供整改任务单（`/Users/zzymima0000/Downloads/大模型 HANDOFF/60 Skill 仓库/temp/ORCA 产品验收治理整改任务单.md`，边界＝"本轮只出草案不写正式源"），随后用户升级授权为「整改 → GPT-6 Sol 审查 → 按反馈继续整改 → 跑实际最小测试 → 清理报告，完成全流程」。**按升级后的授权执行。**
- 逐派记录（母版账本不记实绩，故记本节；used 恒为主用）：
  | # | 角色 | 模型（精确 ID） | 通道 | result | 备注 |
  |---|---|---|---|---|---|
  | 1 | builder | `codebuddy/deepseek-v4.1-flash` | codebuddy | PASS | 母版 7 文件定点增补 |
  | 2 | code-reviewer | `codebuddy/glm-5.3-flash` | codebuddy | PASS | 报 P1×2＋P2×5 |
  | 3 | builder | `codebuddy/deepseek-v4.1-flash` | codebuddy | PASS | 修 P1×2＋P2×5（编排者解冻 `webqa.md` §六一句） |
  | 4 | neat-freak | `volcengine-plan/ark-code-latest` | opencode | PASS | 两包同步 9 文件 → SYNC-OK |
  | 5 | qa | `codex/gpt-6-luna` | codex（`-s danger-full-access`，**仅限 QA，已记账**） | DEGRADED | 规则核验；报 P1「关键 AC 无标记」＋P2「User Flow 兜底歧义」 |
  | 6 | builder | `codebuddy/deepseek-v4.1-flash` | codebuddy | PASS | 修「关键 AC 集合」＋兜底三分支 |
  | 7 | neat-freak | `volcengine-plan/ark-code-latest` | opencode | PASS | 两包同步 4 文件 |
  | 8 | supervisor | `opencode-go/muse-spark-1.3-contributor` | opencode | PASS | 复检打回 0/2；P0=0/P1=0/P2×2；已在 §59 后追加一行复检记一笔 |
  | 9 | planner（Sol，外部审查） | `codex/gpt-6-sol` | codex | PASS_WITH_FIXES | 报 P1×4；P1-4 涉用户决策已挂起 |
  | 10 | builder | `codebuddy/deepseek-v4.1-flash` | codebuddy | PASS | 修 P1-1/2/3；P1-4 未动 |
  | 11 | neat-freak | `volcengine-plan/ark-code-latest` | opencode | PASS | 两包同步 5 文件＋显式 diff AGENTS 第 37 行 |
  | 12 | experience-recorder | `opencode-go/space-bunny-free` | opencode | PASS | 经验＋2 |
  | 13 | neat-freak | `volcengine-plan/ark-code-latest` | opencode | PASS | 经验一句话同步两包 → SYNC-OK |
  | 14 | 真机/浏览器 QA（编排者直驱） | `opencode-go/space-bunny-free` | 本窗口 BrowserOS | **FAIL** | 合规直驱（qa 卡允许）；实测报告落 `docs/qa/` |
| 15 | builder | `codebuddy/deepseek-v4.1-flash` | codebuddy | PASS | 修 P1-4：落地用户签收（用户 2026-09-28 定「类别 1」＝只有首次发布必须签收；发布类型自动判定，局部修复不被拖） |
| 16 | neat-freak | `volcengine-plan/ark-code-latest` | opencode | PASS | 两包同步 4 文件＋显式 diff AGENTS 第 37/61/91 行 → SYNC-OK |
| 17 | supervisor | `opencode-go/muse-spark-1.3-contributor` | opencode | PASS | 收口复检：P0=0/P1=0/P2×1（§60 逐派表回填，即本节）；建议 chain_status=`OPEN`（待 commit），可收口 |
- 实测（关键结论）：自建样例实测**判 FAIL**，且两类 037 同类缺陷都被抓到并有量化证据 —— 编号/标题错位 **27–33px 且拆行**（07-12 为 0px）；12 个「查看具体」`href` 全存在，真实点击 3 个后 `#detail`/URL/hash **全零变化**。**实测证实「只验 `href` 存在不算已验」与「逐个列出每个可见操作控件」两条新增条款必要且有效。** 测试残留已清：样例目录 `temp/qa-test-产品验收/`、8891 服务、`/tmp/orca-qa-test-server.log` 全清；BrowserOS 页签保留供审计。
- 未覆盖（已写进实测报告，不冒充已验）：真实移动视口 375px 未测（BrowserOS 本次无 resize 能力，用窄列容器 300px 等价覆盖 037 形态）；**`037-ing-AI 编程训练营网站` 未访问未复现**（用户划界＋跨仓授权外），其「查看具体」故障**仍是用户报告状态**；P1-4 签收未落地故链不可记 `ACCEPTED`；未覆盖 SPA 路由/异步/登录态/接口失败。
- 治理红线遵守：未新增角色/派工链/独立 Gate；未改分工表与 `scripts/decision/`；未建 Skill；未改 P037 代码；未 commit/push；`temp/` 不入仓。
- 挂起待用户拍板：**P1-4 用户签收**（Sol 推荐默认强制范围＝首次面向用户发布／重要用户流程或视觉基线变更，普通局部修复默认由 QA＋Supervisor 证据收口）。
- 口径更正一条：HANDOFF 旧文写「经验 24 条」，实为**文件总行数 24**；`- ` 开头的经验条目原为 **20 条**，本轮 +2 后为 **22 条**（experience-recorder 已如实指出，未改旧行）。
- 未 commit：上述全部改动在工作区，等用户指令（含分支名，默认 main）。
- **任务单逐条对账（2026-09-28，提交前复核，任务单＝`/Users/zzymima0000/Downloads/大模型 HANDOFF/60 Skill 仓库/temp/ORCA 产品验收治理整改任务单.md`）**：
  - §二 点名的 8 个真源**全部落地**：`ORCA治理体系说明.md`(+2/-0)、`AGENTS.md`(+4/-2)、`docs/roles/qa.md`(+7/-2)、`docs/qa/BUGS.template.md`(+11/-0)、`docs/pm/PRODUCT_PLAN.template.md`(+12/-3)、`docs/handoff/HANDOFF.template.md`(+2/-0)、`docs/sop/webqa.md`(+1/-1)、`docs/roles/product-reviewer.md`(+1/-1)。
  - **扩展范围（任务单未点名，本轮实改 1 个）**：`docs/roles/supervisor.md`(+1/-0) —— 理由：任务单第四节「必须达成」第 4 条明写"让 **QA 和 Supervisor** 都能凭同一份可追踪证据判断是否放行"，而 supervisor 卡内原有抽查项无产品验收凭据，属为达成必须项所必需的最小扩展（仅新增"抽查第 7 条"一条，两段 Python 校验块逐字未动）。任务单第六节要求的"解释每个文件为什么要改"以本段＋§60 与三份角色报告为准。
  - §七「不得执行的动作」七条**全部未踩**：未新增角色（`docs/roles/` 仍 11 张卡）、未新增独立产品 Reviewer、未新增第二条 QA 派工链、未新增 QA Gate（措辞明写"既有 QA Gate 的证据放行条件"）、未创建/安装/部署任何 Skill、未改 P037 业务代码、未改分工表与 `scripts/`（`git status --short -- USER_MODEL_OVERRIDE.md scripts/` 空）。
  - §五 边界遵守：Web QA 通道**仍为 BrowserOS**（`docs/sop/webqa.md` BrowserOS 命中 4 处，未因参考 Playwright 文档而更换）；`qa.md` 视觉验收最小覆盖含"符合 WCAG ≠ 整体体验通过""禁把视觉偏好伪装成 WCAG 条款"两条边界。
  - §六 交付物 5 项：①差异判断＝`docs/review/CODE_REVIEW-2026-09-28`＋`docs/qa/BUGS-2026-09-28-产品验收治理规则核验`＋`docs/review/RESEARCH_REVIEW-2026-09-28-外部审查`（Sol 逐条对账）②最小变更清单＝本节与 §60 ③完整草案＝**未出**（用户后续把任务单升级为"直接整改并跑完全流程"，按升级授权直接实施，实施差异以三份报告＋本节为准）④验证计划＝`docs/qa/BUGS-2026-09-28-产品验收实测-最小回归.md`（真实浏览器实测，判 `FAIL`，含未覆盖项）⑤开放决策＝**已决**：用户 2026-09-28 定签收仅限「类别 1 首次发布」，其余不强制（已落 P1-4）。
  - 仍未覆盖（不冒充已做）：真机 375px 窄屏实测；`037-ing-AI 编程训练营网站` 未访问未复现（用户划界老项目不归本窗口管），其「查看具体」故障**仍是用户报告状态**；SPA 路由/异步/登录态/接口失败形态。

## 61. 体系更新三件套（概览纳入常驻一环）记一笔（2026-09-29，用户指令）

- 用户指令（大白话）：**每次体系更新，`ORCA治理体系说明.md` 必须跟着更新，和同步两包一样是固定一环，不能漏**；并问"写在规则里还是沉淀成 skill"。
- **编排者裁决：写进规则 ＋ 加脚本可判定检查，不建 skill。** 理由：①强制要靠规则——skill 只在被触发时才跑，无法保证"每次都做"；②skill 本身要母版＋两包＋中央库三处同步，反而多一份会漂移的资产；③机械性检查能靠脚本兜住就该靠脚本，不靠自觉。用户未另指定，采纳此方案。
- 落地三处（builder，母版）：
  1. `AGENTS.md`「两包同步」扩写为「**体系更新三件套**」（2026-09-29 定）：①同步两包 ②**同步对外概览**（影响对外表述的机制变更——Gate／完成口径／派工链职责／账本字段／通道／验收制度等——概览必须更新；漏更新概览＝体系更新未完成）③跑 `check-sync.sh` 须 `SYNC-OK`；保留原 `diff` 非预期差零容忍与 HANDOFF 记一行。**红线节新增一条**「体系更新未同步两包与概览，或概览检查未过，不得收工。」
  2. `docs/roles/neat-freak.md` 收尾清单加：体系更新场景对齐清单必须含「两包已同步 ＋ 概览已同步」，缺项只报告不擅自改概览内容。
  3. `scripts/check-sync.sh` 新增「**概览新鲜度**」检查（母版跑一次，不在 pkg 循环内）：对 `ORCA治理体系说明.md` 逐个 grep「对外必现机制」关键词 `产品验收`／`关键 AC`／`首次发布`／`签收`，缺项报 `OVERVIEW-STALE: 概览缺 X` 并 `fail=1`。**脚本内注释写明维护约定**：将来新增影响对外表述的机制时须把关键词补进该清单，否则漏检。既有输出行与 `exit "$fail"` 语义原样保留。
- **本轮概览补更新**（neat-freak，早于规则落地即按用户指令先做）：`ORCA治理体系说明.md` 更新日期 2026-09-26→2026-09-29；§一核心规矩加"完成来自用户可见要求被逐条验过"；§二 Readiness Gate 条件追加"视觉与交互验收标准非空且逐条可测"；§二完工口径扩为小段（计划里写 AC ＋ 关键 AC 集合非空／证据落 `docs/qa/` 追踪矩阵／三种不许放行的情形／首次发布需用户签收且属 Human Gate 非新关卡）；§四补产品验收走已冻结 Web QA 通道与视觉验收覆盖要点（不写列名/像素值）；§七规范表新增「产品验收」一行并**修正过时数字**（HANDOFF "现至 §54"→"现至 §60"）；§八新增第 9 条审查检查点。概览保持一页纸性质：未复述矩阵列名、模型 ID、像素值。
- **机械闸真实验证（编排者亲自跑）**：正常态 `bash scripts/check-sync.sh` → `SYNC-OK` EXIT=0；负例（临时把概览 4 个关键词全部替换掉）→ 输出 4 行 `OVERVIEW-STALE: 概览缺 产品验收／关键 AC／首次发布／签收` 且 `SYNC-FAIL` EXIT=1；恢复后回到 `SYNC-OK`、概览 `git diff --numstat` 仍 12/3 未被污染。
- 逐派记录（本节，用例）：#18 builder `codebuddy/deepseek-v4.1-flash`(codebuddy) **主用撞 429 限额（20:31 重置）→ 当次切备用 `codebuddy/glm-5.3-flash`(codebuddy) PASS**（used 仍填主、note 记切备原因；下次仍优先主用）；#19 neat-freak `volcengine-plan/ark-code-latest`(opencode) PASS（两包同步 2 文件；其第 4 步负例验证因 `opencode run` 写 `/tmp` 被 `external_directory` 权限自动拒，**编排者另行亲跑补上**，已知坑复现一次）。
- 未 commit（本轮 6 个文件在工作区，等用户指令含分支名默认 main）。

## 62. 洁癖收尾记一笔（2026-09-29，用户令「洁癖一下」）

- 清理（真跑，逐个 `rm` 具体路径，未用通配符、未用 `git clean`）：删 8 个 `.DS_Store` —— `./.DS_Store`、`./.git/.DS_Store`（仅删该文件，`.git/` 内其余未动）、`./docs/.DS_Store`、`./scripts/.DS_Store`、`./temp/.DS_Store`、`新项目模板包/.DS_Store`、`新项目模板包/docs/.DS_Store`、`老项目迁移模板包/.DS_Store`。理由：全部未跟踪本地垃圾；其中 3 个落在两包内会被打进分发包，历史交付要求「ZIP 内无 `.DS_Store`」。复查 `find . -name ".DS_Store"` 已零命中（grep 后无输出、exit 1）。
- 保留并说明理由（逐一未动）：`scripts/decision/evals/glm-exact-smoke.log`／`slow-test.log`／`skill-manifest.json` 三件是 `check-sync.sh` 白名单内跟踪文件、属决策评估证据；`temp/` 历史留存（已 gitignore、不入仓）；`docs/qa/`／`docs/review/` 四份 09-28 报告属入仓交付物。
- `/tmp` 本仓相关残留为 0：编排者盘点结论，本轮未触碰（读/写均被 `external_directory` 拒），仅核对不改动。
- 机械复查（真实输出）：`bash scripts/check-sync.sh` → `SYNC-OK` EXIT=0；`git status --short` 仅 11 个 `M`（无删除/新增，`.DS_Store` 删的是未跟踪件故不体现）；`node scripts/model/check-ledger.mjs docs/model` → LEDGER_EXIT=1，仅报两本账 `_example` 行未删（母版不记实绩、示例行按设计保留，非本轮引入）。
- 本轮工作区 11 个文件性质一句话：**体系更新三件套**规则（`AGENTS.md`＋`docs/roles/neat-freak.md`＋`scripts/check-sync.sh`）＋概览补更新（`ORCA治理体系说明.md`）＋两包同步（`新项目模板包/`、`老项目迁移模板包/` 各 3 文件），等编排者 commit。
- 未决：无新增。

## 63. 派单跨目录坑写进规则记一笔（2026-09-29，用户令「别为这种事问，直接写规则」）

- 用户指令：这类执行细节**不必再问是否要写、写到哪个文件**，直接按建议写进规则。
- 落地：`AGENTS.md`「派工顺序」节新增一条 **`opencode 通道跨目录禁令`（2026-09-29 定）**——派 opencode 通道角色（supervisor／neat-freak／experience-recorder）时，任务里读写本仓以外目录（如 `/tmp`、`1.Active/` 等）会被 `external_directory` 权限自动拒、步骤静默失败，可能让角色误报已做也易反复盲试烧额度（禁盲试）；派单前处置二选一——①临时文件改到仓内已 gitignore 的 `temp/`，②先取得用户授权；codebuddy／codex 通道无此限制（照旧用 `/tmp` 无妨）。
- 为何进 `AGENTS.md`（决策记录）：这是**派工执行纪律**，不是"影响体系对外表述的机制变更"，故按 §61 三件套第 2 步的判定**不进对外概览**（概览只写结论与入口，不写派工细节）——三件套不适用第 2 步，不等于漏做。
- 依据：两次实证（2026-09-26 派 neat-freak 读仓外 `1.Active`；2026-09-29 派 neat-freak 写 `/tmp` 做负例验证）均被自动拒；本轮起 neat-freak 派单已直接写"不许碰 `/tmp`"，第 3 单（同步 AGENTS）实测未再触发。
- 两包同步完成：`check-sync` → **SYNC-OK EXIT=0**；`opencode 通道跨目录禁令` 母版／新包／老包各命中 1；两包第 37 行 diff 仍**仅** `docs/prompts/` 裸名一处（marker 2）。
- 逐派记录：#20 builder `codebuddy/deepseek-v4.1-flash`(codebuddy) PASS（仅 `AGENTS.md` +1 行）；#21 neat-freak `volcengine-plan/ark-code-latest`(opencode) PASS（同步 `AGENTS.md` 两包）。
- 未 commit（3 个文件在工作区，等用户指令含分支名默认 main）。

## 64. 老项目批量迁移执行记一笔（2026-09-29，用户令「全部统一改，不许逐个来」）

- 用户指令（大白话）：不要一个一个项目去改，**要把所有项目的账本/治理统一改掉**，否则"下次打开不知道哪些改过、哪些没改过"。**本窗口不跨仓派工的前提下**，改为：一次全量同步 ＋ 落可机读状态标记 ＋ 提供一条命令看全表。
- **纠正一个概念（避免误伤实绩）**：账本**内容不重写**。各项目账本是实绩历史（AGENTS 写死"换模型决策先读账本"），抹掉等于失忆。统一的是**规则文件 ＋ AGENTS 规则增量区块 ＋ `docs/model/GOVERNANCE-STATE.json` 状态标记**。
- 新增三件工具（母版专有 `scripts/`，不进包）：
  1. `scripts/sync-old-projects.sh`｜批量铺规则（**备份不覆盖铁律**：撞了存 `原名.旧版-2026-09-29`；账本只确保存在、内容零改动；支持 `--dry-run`；幂等）
  2. `scripts/_inject-agents-block.py`｜在每个项目 `AGENTS.md` **顶部注入**带 `ORCA-RULES-BLOCK:BEGIN/END` 标记的规则增量区块（**只增不删**，项目专属规矩原样保留；已注入则原地更新，重复跑不产生第二个区块——已用副本自测 INSERTED/UNCHANGED/UPDATED 三态）
  3. `scripts/migration-status.sh`｜**状态总表**：项目｜规则版本｜AGENTS区块｜TASK账本行数｜LEDGER｜PROJECT_PHASE｜AC已补｜最后提交，一条命令看全 29 个。
- 执行结果（`--dry-run` 后实跑）：`29 个项目 ｜ 新铺 612+29 ｜ 备份留档 230+29 ｜ AGENTS区块注入 29/29`。
- **两个我自己的脚本缺陷（已修，如实记）**：①改脚本时误把 `AGENTS.md` 从文件清单删除 → 注入分支永不执行，**首跑 29 个项目区块全为 0**；②删除变量定义后 `set -u` 撞 unbound → `GOVERNANCE-STATE.json` 写出**非法 JSON**（`"agents_needs_manual_merge": ,`）。修复后重跑（脚本幂等，只补 AGENTS 注入与状态重写），复验：区块 29/29 唯一无重复、JSON 0 非法、**账本零改动**（028 仍 203/260）、3 个无 git 项目（`000-alw-个人偏好`／`014-山寨滚仓网站`／`027-蛋白质计算器`）**备份齐全**。
- 迁移后状态（`migration-status.sh` 实测）：
  - 规则版本已同步 **29/29**，AGENTS 区块 **29/29**。
  - **LEDGER OK 且有实绩 12 个**（006/016/017/018/019/020/022/025/026/027/028/037）。
  - **16 个仅示例行/无账本**（0 行实绩）→ `LEDGER FAIL` 属**既有状态、非本次迁移造成**；按规矩「示例行由首个真实任务前删除」，属各项目 TM 动作，编排者不代删。
  - **015 单独记账**：`TASK-MODEL-LOG` 有 9 行实绩但 `DISPATCH-LOG` 仍只有 `_example` → FAIL（与 §2-3 遗留项一致），需其 TM 补建或确认不需要。
  - **PHASE 缺失 21/29**（治理状态不可机读，正是 2026-09-29 判"在不在跑"时踩坑的根因）；已在区块里写明本项目迁移状态字段位置，供其 TM 补。
  - **AC 全部未补（0/29）** —— 存量 Plan 尚无「视觉与交互验收标准／关键 AC 集合／发布类型」，**这会导致它们在新规则下收尾被判"计划缺项"**。此项需各项目 TM 做业务判断，编排者不代做，已在区块「存量项目待办」写明并用状态表 `AC` 列跟踪。
- 未 commit：母版新增 3 个 `scripts/`＋`HANDOFF §64` 在工作区，等用户指令（含分支名默认 main）。**29 个老项目各自的改动亦未提交**（26 个有 git，3 个无 git 仅存备份）。

## 65. senior-expert 换 codex/gpt-6.1-sol ＋ 通道预检制度记一笔（2026-09-29）

- 用户令：高级 builder（senior-expert）换模型 `codex/gpt-6.1-sol`。
- **首真调失败**：codex 报 `The 'gpt-6.1-sol' model is not supported when using Codex with a ChatGPT account` ＋ `Model metadata not found → fallback metadata`。**未改表**（改表必真调，通不过不写）。
- **根因（非模型不存在）**：本机 **Codex CLI 0.155.1 的模型目录里没有 6.1**。执行 `codex update` → 升到 **0.159.2**，目录出现 `gpt-6.1-sol`（共 10 个模型），**真调回 `pong` exit 0**。顺带修复了用户 `~/.codex/config.toml` 里默认模型 `gpt-6.1-sol` 之前不可用的问题。
- 改表（母版＋两包三份，md5 一致 `060b69e7`，`check-sync` SYNC-OK）：`senior-expert` → `codex/gpt-6.1-sol`；调用方式 `codex exec -m "gpt-6.1-sol" --skip-git-repo-check "任务" </dev/null`；**行内写死最低版本 `需 Codex CLI ≥0.159.2`** 并附旧版报错原文；版本注释 T23→**T24**；模型调用档案新增 **#18**（真调 exit 0 回 pong）。**`planner` 未动**，仍 `codex/gpt-6-sol`（用户只指高级 builder，不擅自扩大）。
- **通道预检制度（用户问「能不能有制度确保定期更新」→ 结论：不定期更新，改治失配）**：
  - 新增 `scripts/check-channel-preflight.sh`（纯 ASCII，因中文写入反复损坏，见下）：拿分工表**在用**模型与三条通道真实目录对账（codex `codex debug models`／codebuddy `--help` 列表／opencode `opencode models`，实测 10／16／41 个）；角色表模型缺失 → `CHANNEL-STALE` ＋ exit 1（**禁派该角色**）；档案历史模型缺失只出 note（不阻断）；同时报客户端版本与表内最低版本要求。
  - **不做自动更新**（明确写进脚本头注释）：升级连带改目录/认证/沙箱默认，可能把整表打翻，属人工决定；升级后**必须重跑预检**。
  - 写进 `AGENTS.md`「派工顺序」节新增一条「**派工前通道预检（2026-09-29 定）**」；「体系更新三件套」第 3 步补：**本轮动过分工表/通道模型时另跑预检须 `CHANNEL-OK`**。三份 AGENTS 母版＋两包均已含（各命中 2 处）。
  - **负例验证（真跑）**：造假表把 senior-expert 换成不存在的 `gpt-99-fake` → 输出 `STALE codex/gpt-99-fake … dispatch would FAIL` ＋ `CHANNEL-FAIL`，**真实 exit=1**；真表 `CHANNEL-OK`（9 个角色模型全通、18 个档案模型 2 个 note＝历史退役，正确）。
- **本轮我自己犯的三个错（如实记）**：①首次判"028 在跑"因 grep 锚定行首而漏判（028 阶段写在第 26 行反引号内）→ 结论：判"在不在跑"必须用「任意位置 PHASE ＋ git 最近提交 ＋ 账本行数」三重交叉；②批量迁移脚本首版误删 `AGENTS.md` 清单项 → 29 个项目注入全为 0，且 `set -u` 撞 unbound 写出非法 JSON，已修并复验；③**写 bash 脚本时中文字节反复被损坏**（`Illegal byte sequence`、变量名被乱码吞掉导致 `unbound variable`）→ 预检脚本改为**纯 ASCII 注释与输出**。
- 未 commit：母版改动（AGENTS×3 份、override×3 份、HANDOFF、5 个 scripts、新脚本）在工作区，等用户指令（含分支名默认 main）。

## 66. 每周通道检查（launchd）＋洁癖收尾记一笔（2026-09-30）

- 用户指令：①「加一个每周检查」②「**opencode 不要更新**」（ emphatic）。
- **定位**：不采用"定期自动更新"（升级连带改目录/认证/沙箱默认，可能打翻整表——2026-09-29 实测旧版 codex 目录无 `gpt-6.1-sol` 即此类），改治**失配本身**：每周跑通道预检，对不上或客户端版本变了就提醒人，**升级永远是人的决定**。
- 交付（母版 `scripts/`，随仓入库）：
  - `scripts/weekly-channel-check.sh`｜每周一 09:00 由 `~/Library/LaunchAgents/com.orca.channel-check.plist` 触发：跑 `check-channel-preflight.sh`、写 `~/Library/Logs/orca-channel-check.log`（自动截断 400 行）、记录 codex 版本到 `~/.orca-channel-check.state`、异常弹系统通知（`osascript`）。
  - **opencode 零更新（三层保障）**：①脚本外部命令仅 `codex --version`（读版本）与 `osascript`（通知）；opencode 只被 `opencode models` **只读列目录**；②**脚本内安全闸**：自扫是否出现 `codex|opencode|codebuddy + update|install|upgrade`，命中即**拒绝运行**（注入假 `opencode update` 实测被拦）；③规则写入脚本头注释与本节。
  - `scripts/check-channel-preflight.sh`｜**派工前通道预检**（治失配）：表内**在用**模型 ↔ 三条通道真实目录对账（codex `codex debug models` 10 个／codebuddy `--help` 16 个／opencode `opencode models` 41 个）；角色表模型缺失 → `CHANNEL-STALE` ＋ exit 1（**禁派该角色**）；档案历史模型缺失只出 note 不阻断；同时校验表内声明的客户端最低版本。**纯 ASCII 脚本**（中文写入反复损坏，见 §65 教训）。
  - 规则落地：`AGENTS.md`「派工顺序」节新增「**派工前通道预检（2026-09-29 定）**」；「体系更新三件套」第 3 步补「本轮动过分工表/通道模型时另跑预检须 `CHANNEL-OK`」；母版＋两包三份 AGENTS 均已含（各命中 2 处）。
- **两轮真实验证**（不只信"装了"）：①**负例**：造假表把 senior-expert 换成不存在的 `gpt-99-fake` → 抓出 `STALE … dispatch would FAIL` ＋ `CHANNEL-FAIL`，**真实 exit=1**；真表 `CHANNEL-OK`（9 角色模型全通、18 档案模型 2 个 note＝历史退役）。②**launchd 实触发两轮**：首轮 `kickstart` 暴露 **launchd 极简 PATH 找不到三个客户端**（`codex CLI: unknown`、全 MISS、`CHANNEL-FAIL`）→ 脚本内显式构造 PATH（含 nvm 的 opencode 目录）→ 以 `env -i` 模拟极简环境复跑通过 ＋ `launchctl kickstart -k gui/$(id -u)/…` 再触发，日志 `codex CLI: 0.159.2`、`CHANNEL-OK`。（macOS 新版 `launchctl kickstart` 需 `gui/<uid>/` 前缀，**不带前缀会报 Unrecognized target specifier**。）
- 洁癖收尾（2026-09-30，用户令「洁癖一下」）：
  - 删：母版根 `.DS_Store`（1 个，未跟踪本地垃圾）。
  - **保留并说明**：`temp/` 13 个历史留存（提示词／分工表快照／中央补丁，有意留存且 gitignore 不入仓）；`~/Library/Logs/orca-channel-check.log` 与 `~/.orca-channel-check.state`（每周检查运行态，自动滚动）；`/tmp` 本仓相关残留 0。
  - **259 份 `.旧版-2026-09-29` 备份：不删，但加防污染**——在 29 个项目 `.gitignore` 追加 `*.旧版-2026-09-29`（幂等；本次新增 29 份规则）。理由：备份是回滚保障，删了不可逆；留着又会被 `git add .` 卷进提交，故只隔离不入库。已验 038：`git status` 中备份文件计数 0（已被忽略）。
- 母版终检：`bash scripts/check-sync.sh` → `SYNC-OK`；`LC_ALL=C bash scripts/check-channel-preflight.sh` → `CHANNEL-OK`。
- 本轮提交：母版 4 份治理文件 ＋ `HANDOFF` ＋ 5 个新脚本（`sync-old-projects.sh`／`_inject-agents-block.py`／`migration-status.sh`／`check-channel-preflight.sh`／`weekly-channel-check.sh`）＋两包对应副本。

## 67. 「全部处理」收口 ＋ 小交接记一笔（2026-10-03，用户令「全部处理」后开发暂时结束）

- 用户令「全部处理」，逐项做完：
  1. **32 个老项目删模板示例行** → 账本全部 `LEDGER-OK`（实测 **0 FAIL**）。**踩坑一次并修**：首轮用 `grep -v … > tmp && mv` 时，`grep -v` 在"全部行都匹配"时退出码 1、`&&` 短路导致文件未替换（表头显示"1 → 1"）；改 `;` 后重做成功。
  2. **补同步漏掉的新项目**：`039-ing-酒吧游戏`、`040-ing-才艺展示厅`、`041-ing-nightrec` 三项目在 09-29 首轮同步之后才出现/才建 `AGENTS.md`，本轮补注入（`AGENTS区块注入: 3`）。项目总数 29 → **32**。
  3. **28 个有 git 的项目逐项目提交**：统一信息 `chore(governance): 同步 ORCA 治理规则 2026-09-29…`；**精确 `git add` 治理文件白名单，全程不用 `git add -A`**，确保不卷入各项目自己的开发改动（如 028 的内容包开发仍留在工作区未被提交）。**3 个无 git 只能留文件**（`000-alw-个人偏好`／`014-山寨滚仓网站`／`027-蛋白质计算器`）；`019` 迁移时无改动待提交（其 AGENTS 已是新版）。
  4. **复核虚假状态**：先前 006/037 的 `GOVERNANCE-STATE.json` 曾被外部改写为 `product_acceptance_ac_added: true`（实为虚假，实绩 Plan 查无 AC）→ 重跑同步已重置为 `false`；本轮复核**无任何项目声称已补 AC（0/32）**，与实情一致。
  5. **修 `migration-status.sh` 显示 bug**：账本 0 行时算出 `rows=-1` → 改为不递减、负值归零。
- 状态表终态（`bash scripts/migration-status.sh`）：**32 个项目规则版本全部 `2026-09-29-产品验收`、AGENTS 区块全有、`LEDGER-OK` 全绿、已补 AC 0/32**；`039`/`028`/`037` 账本行数持续增长（223/222/72），说明这些项目正活跃开发——**治理同步未干扰其业务**。
- 母版终检：`check-sync` SYNC-OK；`check-channel-preflight` CHANNEL-OK；工作区干净（`227636d` 已 push）。
- 仍未做（都不是本窗口的活，已写进 §2）：各项目补 AC 与 `PROJECT_PHASE`（业务判断）；3 个无 git 项目的入库决定；真实项目 A/B（用户自跑）。

## 68. 「汇报与自决」节新增＋33 个老项目铺开记一笔（2026-10-03，用户令"编排者太啰嗦，只关心目标完成/工作完成/大影响"）

- **新增 `AGENTS.md`「汇报与自决」节**（落位：缓存节之后、红线节之前），并在红线节加一条对应红线。核心口径：**TM 只报三类**（① 目标完成没 ② 用户安排的工作完成没 ③ 大影响＝上线/回滚、线上故障、数据或备份丢失、生产或他项目改动、要用户本人操作的授权/解密、不可逆删除）；**其余自决自做、不问不报**（已合并本地分支、未跟踪残留、临时日志、已 gitignore 工具目录、文档/账本格式小错、`app/debug.keystore` 一律不入库自动 gitignore、既有 lint/无测试用例 warning 默认不修不报除非阻塞本次目标）；**备份与旧文件**＝不影响后续继续开发就直接删不问，影响的留到大阶段开发完再删且不算待办不上报不催；**必须问的只有四类红线且一次问全**（secrets、删用户数据/不可逆删除、生产·数据库·他项目改动、commit/push 与远端写入——无明确指令一律不做，不做也不上报）；**形态硬约束**＝单次汇报 ≤10 行（三行心跳＋≤3 条要点），禁 pending/遗留/out-of-scope/未清除 warning 全量倾倒，遗留只列卡住本次目标的、其余进 HANDOFF 一行，**啰嗦按违规打回**。
- 连带改动：`docs/prompts/编排者提示词.md`（第 28/30 行间补汇报纪律整段）、`docs/roles/task-manager.md`（新增同口径一条）、`docs/roles/supervisor.md`（新增**汇报噪音抽查**：只看给用户那次汇报，超口径/拿残留反复问用户即打回，同类第二次出现视同违规）、`ORCA治理体系说明.md`（第二节加一段结论＋第八节审查点加第 10 条）、`scripts/check-sync.sh` 概览新鲜度关键词补 `不问不报`。
- **老项目铺开**：`scripts/_inject-agents-block.py` 区块新增「汇报与自决（2026-10-03 定）」五条；`sync-old-projects.sh` / `migration-status.sh` 的 `STAMP`/`RULES_VERSION` 改 `2026-10-03-汇报与自决`；实跑结果 **33 个项目全同步（0 未同步）**、区块全有、账本全 `LEDGER-OK`；备份留档 66 份 `.旧版-2026-10-03`（同步脚本铁律，不覆盖原文件）。
- 顺手处理（属默认自决、不上报的两类）：`042-ing-AIHOT 热点日报站` 新项目账本模板示例行已删 → 转 `LEDGER-OK (含 WARN)`；`037` 缺 `*.旧版-*` 忽略规则导致 2 份新备份在其 git 里可见 → 补规则（其余 26 个项目实测可见数 0，未动）。
- 校验：母版↔两包 `check-sync` **SYNC-OK**；`check-channel-preflight` **CHANNEL-OK**（本轮未动分工表/通道模型）；两包 `AGENTS.md` 显式 diff 第 37 行确认**仅 `docs/prompts/` 裸名差一处**（经验教训 2026-09-28 的白名单坑）。**未 commit**（用户未给 commit 指令，分支 `main`）；**老项目未 commit/push**（跨仓提交只在用户明确授权时做）。

## 69. 客户端无关＋派工口自动探测＋「何时起体系」判据记一笔（2026-10-03，用户令 commit+push 后开工）

- **背景**：用户核查"这套体系能不能在 Codex/Trae/Qoder 等客户端用"。核查结论＝治理语义层（两阶段 Gate、两本账本、AC 矩阵、升级计数、Human Gate、落盘规范）全为文件/脚本级，与客户端无关；11 角色里 9 个本就是「通道 CLI 直调」（`opencode run` / `codebuddy … -y -p` / `codex exec -m`）；真硬耦合只 4 处（编排者提示词:10 派工口、override 表 TM/product-reviewer 的「本窗口」、QA 真机「本窗口 bash 直驱」、`supervisor.md:40` runtime 枚举）。Orca 专属仅两份**可选**增强文档（总监督提示词、持续推进协议）。
- **新增 `scripts/detect-client.sh`（纯 ASCII，可执行，exit 0）**：自动认当前客户端并选派工口。认客户端顺序＝bundle id → TERM_PROGRAM → 环境变量前缀 → 父进程链（最多 8 级）→ 仓库痕迹目录 `.claude/.codex/.trae/.qoder/.orca`（**仅作提示不作准**）。输出 `client=… subagent=… mode=window_subagent|channel_cli source=…`，另支持 `--json`。已校准＝Orca／Trae／Qoder／Codex／Claude Code／opencode；**认不出 → 保守 `channel_cli` ＋ note，不找用户填**。自测：5 个 bundle id 分支全部正确（修了一处 `*code*` 抢在 `*claude*` 前的误判、norm 未去空格、`$1` 未绑定报错、末尾退出码非 0）。
- **规则改动**：override 表 Runtime 列「本窗口」→「当前客户端窗口（自动探测）」＋调用通道说明改写（表定通道角色照旧走 CLI 直调，**禁把通道角色包进客户端 subagent 套娃**）；编排者提示词:10 派工口改写为「按探测结果派工，不问用户填」，并保留"CLI 模式不豁免不起终端人工禁令"；AGENTS.md 派工顺序节写入派工口规则 ＋ **新增「何时起这套体系」节**（命中任一＝大项目按包 README 铺包开工；都不命中＝小活直接干不铺包不起 Gate；**半套最差按红线打回**）；task-manager 卡加"开工第一步＝探测客户端＋判是否大项目"；老项目注入区块加同两条；对外概览加一段结论 ＋ 第八节审查点改 10=客户端无关、11=汇报纪律。
- **`check-sync` 新增**：两包 `scripts/detect-client.sh` 字节一致检查 ＋ 概览新鲜度关键词加 `detect-client`。
- **老项目铺开**：`STAMP=2026-10-03`／`RULES_VERSION=2026-10-03-客户端无关`，实跑**全部已同步、未同步 0**；备份留档 33 份 `.旧版-2026-10-03`。
- **实测**：`check-sync` **SYNC-OK**（AGENTS:37 仅裸名差已显式 diff）；`check-channel-preflight` **CHANNEL-OK**；**Codex 端到端通过**——`codex exec -m gpt-6-sol` 在仓内跑 `detect-client.sh`、读 AGENTS/角色卡全部正常（因其从 Orca 窗口起，探测报 Orca 属正确行为）；Trae／Qoder 需各在客户端内跑一次 `bash scripts/detect-client.sh` 做校准。
- **项目数口径变化（重要）**：老项目状态表由 33 → **31**，因 `043-ing-成片集-app` 现存 `docs/model/GOVERNANCE-STATE.json` 但已无 `AGENTS.md`（同步脚本要求 AGENTS.md 存在才处理，故不再计入）＋另一个目录已不在 `1.Active`。**账本未动、未查原因**（属其他项目事务，不归本窗口）。
- **补铺**：`detect-client.sh` 一开始只进了母版与两包、**漏进老项目**（注入区块引用了不存在的脚本＝悬空引用），已把该脚本加进 `sync-old-projects.sh` 的 FILES 并重跑，31 个项目均已落地、可执行、实跑通过。
- **三客户端验证全部通过（2026-10-03）**：**Codex**（`codex exec -m gpt-6-sol` 仓内实跑探测＋读规则）、**Trae**（TraeCode CN 打开 038 项目，`client=Trae subagent=yes mode=window_subagent source=bundleid`）、**Qoder**（Qoder CN 同样，`client=Qoder subagent=yes mode=window_subagent source=bundleid`）——**零手填即生效**。后续新客户端只需跑一次 `bash scripts/detect-client.sh` 校准。
- **CodeArts Agent 校准（2026-10-03）**：本机 `/Applications/CodeArts Agent.app`，bundle id `com.huawei.codearts.agent`，**Electron 应用、主进程 comm 只是 `Electron`** → 父进程链认不出，只能靠 bundle id／TERM_PROGRAM／环境变量（已在脚本补 `*codearts*` 三处分支）。**实测在 CodeArts Agent 内跑脚本报 `client=Codex subagent=yes`**——因为它的 agent 后端就是 Codex，能力一致（都能 spawn 子代理），属期望行为、不改判定顺序。另：Electron 主进程同名坑对所有 Electron 系客户端通用（如未来再遇 Electron 客户端，ppid 分支不可依赖）。
- 至此已校准客户端＝Orca／Trae／Qoder／Codex／Claude Code／opencode／CodeArts Agent，均 `subagent=yes mode=window_subagent`；老项目与两包已铺新版脚本（`SYNC-OK`）。
- **README 加「怎么用：两件事」节（2026-10-03）**：一张表把四种场景（老项目／新项目大项目／新项目小项目／单客户端环境）写清"你做什么＋说哪一句"，含可复制的【新项目大项目·一句话】启动语（带母版包绝对路径，避免只说"你是编排者"它不知道去哪拿包）；明确三条别做（不整包丢根／不拷母版 Git 历史与别项目 HANDOFF／老项目不重铺）。同时把 `README.md` 纳入 `check-sync` 两包一致性清单。
- **外部文件并入规范位**：`docs/sop/background-services.md`（2026-10-05 15:42 由外部同步进母版的**未跟踪**文件，中央规则引用它，故属体系正式规范位）两包原先没有，致 `check-sync` 报 `DIFF` → 已同步进两包，现 `SYNC-OK`。
- 未 commit（本轮用户只授权了开工前那一次 commit+push：`4793184`）。

## 70. 全量一致性审查与 P0/P1 修复记一笔（2026-10-05，用户令"全面检查一遍前后一致/矛盾"）

- **审查方式**：派 Research Reviewer（product-reviewer，本窗口 subagent 直派）做 12 类跨文件交叉核对（角色集合／状态机与阶段／三口令／派工链／升级规则／账本字段／AC 与产品验收／汇报纪律／派工口与客户端无关／路径与布局／check-sync 覆盖／脚本自身），产出 `docs/review/RESEARCH_REVIEW-2026-10-05-体系一致性审查.md`。**结论 `FAIL_WITH_FIXES`：P0=2、P1=14、P2=11**。母版内部的口径类条目（角色/状态机/口令/派工链/升级/汇报纪律/派工口）**基本一致**，问题集中在**同步门禁、老项目规则落地、Gate 条件复述**三处。
- **P0-1 已修｜check-sync 的 AGENTS 白名单可被绕过**：旧逻辑只数 `diff | grep -c "^[<>]"` 是否等于 2 → 把裸名那行改成任何错字都照样 `SYNC-OK`（已实证）；且脚本注释、`经验一句话.md:26`、`agent.md:18` 三处人工兜底都写"第 37 行"，行号早已漂到 44，**兜底同时失效**。改法：**取消 marker 白名单**，改为 `norm_md()` 归一化（`docs/prompts/xxx` → 裸名）后**逐字节比对**（`cmp`），任何内容差都 DIFF 并 fail；`check_norm` 用于概览/README/四份平铺提示词；"预期差确认"段由 `echo` 升级为**断言**（应为 0）。
- **P0-2 已修｜老项目被要求跑不存在的脚本**：31 个老项目正文强制"派工前跑 `check-channel-preflight.sh`"，而该脚本 0/31 存在（不在 sync FILES）→ 已加入 FILES 并铺开；抽验 038 项目实跑得 `CHANNEL-OK`。
- **P1 已修**：①Gate 6 项补齐（`AGENTS.md`/task-manager/编排者提示词，原 4 处漏「视觉与交互验收标准非空」）；②DISPATCH runtime 枚举补「当前客户端窗口（自动探测）」「Claude Code」（`AGENTS.md` + `supervisor.md` 校验块，否则照表记账会被打回）；③`check-ledger.mjs` KNOWN_MODELS 补现役 `codex/gpt-6.1-sol`（此前每派 senior 必产 2 条 WARN，实测已消）；④注入区块字段名 `agents_needs_manual_merge` → `agents_block_injected`（脚本实际写的就是后者）；⑤`043-ing-成片集-app` 治理根在 `software/`，被两个脚本双双漏计 → `sync-old-projects.sh` 与 `migration-status.sh` 加**治理根向下探测**（根无 AGENTS.md 时找唯一含 `ORCA-RULES-BLOCK` 的子目录，多候选跳过告警），**项目数 31 → 32，043 已纳入并升级到本轮规则版本**；⑥老项目缺 7 类文件已补铺（`check-channel-preflight.sh`、`docs/sop/background-services.md`、`GOVERNANCE_VERSION`、两份 Orca 协议提示词落 `docs/prompts/`、归位表落 `docs/templates/`、`编排者提示词.md`/`外部开发者提示词.md` 落根）——**顺带修了一个真 bug：FILES 里含空格的条目被 `for f in $FILES` 词分割拆坏（"Orca 编排治理监督者提示词.md" 被切成 3 段），已改 `while IFS= read -r` + 落位映射**；⑦check-sync 覆盖补齐（四份平铺提示词、`GOVERNANCE_VERSION`、`scripts/orchestration/README.md` 由 echo 升为断言）——**新门禁当场抓到一处真实漂移：母版《持续推进协议》写 9+1、两包已是 9+1＋1（母版落后），已改母版**；⑧概览新鲜度关键词由 6 个扩到 15 个（`window_subagent`／`channel_cli`／`半套最差`／`四类红线`／`≤10 行`／`Task Manager Qualification`／`何时起`／`CHANNEL-OK` 等）；⑨supervisor Phase Integrity 抽查第 6 条①补全（禁 code-reviewer 派工、DEVELOP 禁派 product-reviewer），**新增第 8 条派工口合规、第 9 条通道预检合规**；⑩注入区块补**升级口径**与第 8/9 条抽查摘要（让"冲突以区块为准"真正覆盖项目正文旧口径）。
- **新增 `scripts/_sync-packages.py`**：母版→两包同步的唯一入口，内含布局裸名映射（`docs/prompts/xxx`／`docs/templates/归位表.template` → 包根裸名）。**以前每次同步靠手写 sed，漏一处就静默分叉**——本轮 P1-10 那处 9+1 漂移就是这么来的。
- **终检**：`check-sync` **SYNC-OK**（归一化后零差异，断言通过）；`check-channel-preflight` **CHANNEL-OK**；`migration-status` **32 个项目全部已同步、未同步 0**；`check-ledger` 现役模型无 WARN。
- **留待用户决定（未修，报告内有完整建议）**：P1-1 注入区块不含状态机/口令/派工链/角色集合顶层骨架（16 个老项目顶层只有区块+自有内容，仲裁归属不清）；P1-9 母版 README 与包内 README 被强制成同一份（包内按 README 找不到 `docs/prompts/`，`.zip` 早不产出）；P1-12 中 015/017 正文仍有两个 `## 升级` 节并存；其余 P2 11 条（根目录清单数字、executed_by 多两个非角色值等）。
- **洁癖收尾（用户令「洁癖一下＋残留自己定＋commit+push」）**：
  - **模板包残留清理（60 份）**：两包内混进了母版自己的**实例记录**（`HANDOFF.md` 实例、`HANDOFF-2026-*.md` 2 份/包、`PLAN-2026-09-12-整改.md`、`BUGS-*.md` ~11 份/包、`CODE_REVIEW/EXTERNAL_REVIEW/GOVERNANCE_REVIEW/RESEARCH_REVIEW` 历史报告 ~14 份/包）——违反「模板包只含模板、不含其他项目运行记录」。根因＝`_sync-packages.py` 按目录整体复制（`docs/pm|qa|review|handoff` 混着实例记录）→ 已改为**这四个目录只同步 `*.template.md`**，并加 `--prune` 一次性清掉包内散落实例记录。
  - 另清：两包内 `scripts/weekly-channel-check.sh`（母版 launchd 专用，不该随包分发，已从 EXTRA 移除）、空目录 `新项目模板包/docs/plan`。
  - `agent.md`（未跟踪接续提示词快照）**移入 `temp/`**，不入库；README 已把它登记为「临时材料、不受 check-sync 门禁」。
  - **README 对齐**：根目录清单重写为实际内容（入口与规则／脚本／包 三组，含 `ORCA治理体系说明.md`、`detect-client.sh`、`check-channel-preflight.sh`、`_sync-packages.py`、`migration-status.sh` 等），删掉「现行11」硬编码与**早已不产出的 `.zip` 那句**。
  - **AGENTS.md 三件套第 1 步**改为「用 `python3 scripts/_sync-packages.py` 同步两包（布局裸名由脚本统一处理，**禁手写 sed 复制**）」；`check-sync.sh` 顶部注释里过时的「预期差白名单 AGENTS.md:37」已随之改掉。
  - **经验追加一条**（按只追加规矩保留旧那条失效经验，另加新条说明已改归一化逐字节比对）。
  - 终检：`check-sync` **SYNC-OK**；`check-channel-preflight` **CHANNEL-OK**；`sync-old-projects` 32/32 已同步、未同步 0。
- 未 commit（用户本轮只要求检查，未授权 commit）。

## 71. 全量体系审查整改（2026-10-08，审查者 `volcengine-plan/ark-code-latest`）

审查报告：`docs/review/GOVERNANCE_REVIEW-2026-10-08-全量体系审查-ark-code-latest.md`（结论 `FAIL_WITH_FIXES`，3×P0 / 7×P1 / 10×P2）。本节记本轮处置。

**已修（3×P0 + 1×P1，本轮范围）**
- **P0-1 planner 沙箱口径自相矛盾**：10-07 加解禁时只改了 `AGENTS.md` Phase2 行，**漏改同一文件产品审查链里「禁给 planner 加 `-s danger-full-access`」那句**，两行互斥。已统一为「planner 已带该标志可直接写盘；解禁失效时才退回 stdout」，同步 `AGENTS.md`／`ORCA治理体系说明.md:95`／`USER_MODEL_OVERRIDE.md` 双审派工表，并在 `经验一句话.md` 追加更正行（历史行不改写）。
- **P0-2 supervisor DISPATCH 校验块是死代码**：行内 `#` 注释把 `: print(...); bad+=1` 整段吃掉，`if` 无语句体，`python3` 实跑 `SyntaxError: invalid syntax`。已改为独立 `RT` 元组行。**修后实跑**：治理仓真实账本 exit 0；构造负例（runtime 枚举错／used 非主／result 枚举错／缺键）4 类全抓、exit 1。此前该门禁从未真正执行过。
- **P0-3 product-reviewer 角色卡写「并行」**：与 10-07 实测的「串行禁并发」硬规则冲突。已改为「必须串行，禁并发」，并写明 codebuddy 双实例并发的静默失败教训。
- **P1-3 两套验收矩阵并存**（用户 2026-10-08 定）：定 `docs/qa/产品验收追踪矩阵.md`（7 列／`OPEN·PASS·FAIL·BLOCKED`）为 **AC 结论唯一落盘位**；`BUGS.template.md` 内旧 11 列矩阵与 `人工判定／未测／DEGRADED` 枚举**废止**，BUGS 只记操作过程证据。同步订正 `docs/roles/qa.md`（原指向旧节名）。理由：唯一真实实例（nightrec 44 条 AC）用的就是新套；状态词与账本 `chain_status` 语义一致；取消 `人工判定` 以堵「无证据改状态」的口子。

**未修（另轮，需用户先定方向）**
- P1-1 备用列口径二选一、P1-2 角色卡硬编码过时模型 ID、P1-4 HANDOFF 段号与 overview 节号、P1-5 编排者提示词补产品审查链＋「第三阶段」口令命名澄清、P1-6 两包 README.en.md 死链、P1-7 老项目铺开链（跨 31 仓，需授权）
- P2-1～P2-10 按审查报告第三节表逐条

**验证**：`SYNC-OK` / `CHANNEL-OK` / `tm-qualification 17/17`；supervisor 两个校验块语法 OK 且正反例实跑通过；6 项残留一致性总检全过。

## 72. 审查整改第二轮：P1 剩余项（2026-10-08，用户拍板 K1/K2/K3）

**K1 备用列口径（用户定：留列）**：`AGENTS.md:58` 与 `README.md:81` 原写「表内无备用列」，与表头实有的「备用模型／备用执行通道」两列矛盾。已统一为「**表内备用两列以本表为准**；主通道超时/限额才切备，切备时 DISPATCH `used` 仍填主＋note 记原因」；`README.en.md` 同步（en 版原写 `the table has no backup column`）。
**K2 口令命名（用户定：不改名）**：口令仍是「第三阶段产品审查」，在 `AGENTS.md`／`ORCA治理体系说明.md`／`docs/prompts/迁移整理提示词.md` 三处补「**『第三阶段』仅为口令字面，不代表新增 Phase**」，避免与「两阶段治理」表述冲突。

**自修项（用户授权 K3）**
- **P1-2 角色卡硬编码过时模型 ID**：`docs/roles/planner.md`／`senior-expert.md` 原写 `codex/gpt-5.6-sol`（已不在通道目录，照卡派工必 `not supported`）。改为「见 `USER_MODEL_OVERRIDE.md` 对应行，卡内不复述模型 ID」，与其余角色卡一致。
- **P1-4 HANDOFF 节号漂移**：`ORCA治理体系说明.md` 写「现至 §60」，实际已到 §71。已订正并注明「新节自 §72 起顺延，勿撞旧号」。
- **P1-6 两包 README.en.md 死链**：两包 `README.md` 均链向 `./README.en.md`，但两包根目录**没有该文件**（`_sync-packages.py` 的 `PAIRS` 漏了它）。①补进同步清单并同步两包（53/54 文件）；②`check-sync.sh` 比对清单加 `README.en.md` 并补布局裸名归一化，防其再次无限漂移；③英文版对齐中文现势：删 `no backup column`、`(11 current items)` 硬编码、`.zip` 条目，`sop/` 补 `app-theme-i18n.md` 与 `background-services.md`。
- **P1-7 老项目铺开链缺口**（**只改脚本，未跨仓落盘**）：`scripts/sync-old-projects.sh` 的 `FILES` 补 `docs/sop/app-theme-i18n.md`；`STAMP`/`RULES_VERSION` 由 `2026-10-03-客户端无关` 推到 `2026-10-08-APP基础能力`。`--dry-run` 实跑：35 项目／新铺 384／备份留档 314／已是新版 981／AGENTS 区块注入 3，**未落盘**。真正重跑属跨 31+ 仓动作，**须用户单独授权**。

**验证**：`SYNC-OK`（含新增 `README.en.md: 0`）／`CHANNEL-OK`／`tm-qualification 17/17`。

**仍未处置**：P2-1～P2-10（按审查报告第三节表）；P1-7 的实际跨仓重跑（待授权）。
