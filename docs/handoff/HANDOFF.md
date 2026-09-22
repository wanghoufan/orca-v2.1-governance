# HANDOFF｜ORCA 治理重塑（分发版）

> 本文件为实例，拷进新项目时清空第 1-2 节照模板重写。

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

## 1. 当前工作进展（2026-09-16，现势；今日 session 未 commit）

- 分工表（`USER_MODEL_OVERRIDE.md`，11 行 4 列＋文末 T3 回退注释）：TM＝开窗口时定｜supervisor＝`opencode-go/muse-spark-1.3-contributor`/opencode｜builder＝`codebuddy/deepseek-v4.1-flash`/codebuddy（限额切 codebuddy/glm-5.3-flash，再限额停派喊人）｜qa＝`codex/gpt-5.6-luna`/codex（普通QA；真机 adb/Expo 走本窗口直驱，不记偏离）｜product-reviewer＝`codex/gpt-5.6-terra`/codex｜code-reviewer/recorder/neat＝`opencode/muse-spark-1.3-contributor-free`/本窗口｜planner/senior＝`codex/gpt-5.6-sol`/codex｜db-admin＝`opencode-go/deepseek-v4.1-flash`/opencode（专项，TM 直派直收）。表内无备用列；软链制（各项目根表软链指母版，改母版即同步）；改表必真调（AGENTS 模型节铁律）。
- 本轮大项（均已落地未提交）：sop 三规范短名入位（docker/supabase/sqlite＋中央软链）／Contract×3 彻底删／复审 P0/P1/P2 全对齐＋check-sync.sh（exit 0）／product 换 Terra／builder 切 codebuddy 主备链／qa 切本窗口直驱。详见 §26–§32。
- Luna 真机验证通过（2026-09-16，IN9LZTAYV4UGU4JF）：codex 沙箱 adb BLOCKED（前提证实）→无沙箱直驱 `adb devices` 通→`dumpsys`/截屏通（206KB 真图）→tap/swipe/HOME 全 exit 0（前后图不同，已复位）→`input text` 命令通（落字待目标框）→landedazi v1.0.4 安装 Success（包名 com.landedazi.app，versionName 却为 1.0.0，名实不符已 flag）→MainActivity 直起，PHOTO SPOT 首屏 TM 目检通过。输入落字＋Expo 全链路待续。
- commit/push：`0ac6895`、`381a66f` 已推 origin/main；今日 §30–§33 及真调证据未提交，工作区非空。最新提交以 Git 历史为准。
- 账本：TASK/DISPATCH 均仅 `_example` 行（现行主用示例）；经验 11 条。

## 2. 下一步任务（按序）

1. 输入落字验证：给 Luna 一个目标输入框（Expo 页指定），点框＋落字＋截屏比对。
2. 装包收尾：versionName(1.0.0)与文件名(v1.0.4)不符，问 0907 项目方要说法；后续 Expo 出包按“装→验 version→直起→截屏”走。
3. commit＋push 今日工作区（用户一句话即办）。
4. Expo 安卓常态 QA：A 口径已生效（Luna 本窗口直驱＋note），后续真机单照此派，不记偏离。
5. CUA-MAC-1：等 Orca 侧修 scroll，另开单；第一单业务仍等`第一阶段，计划`口令。

## 3. 注意事项及规矩（违反即打回）

- **表为准＋改表必真调**：冲突以 `USER_MODEL_OVERRIDE.md` 为准；改表后必须真调验证（只读验名免费先行，烧额度先批，不通即停表不动）；codex 剥前缀用短名，codebuddy 非交互必带 `-y`（看正文不看 rc）。
- **派工纪律归AGENTS**：同链续 session、静态打头动态押后（含 sop 分支）、换模型/换通道/升级即开新链；DISPATCH 的 used 恒填主，supervisor 抽查实派==表。
- **真机口径**：qa＝Luna＋本窗口直驱（adb/Expo），note 记原因不记偏离；builder 不动（codebuddy 主备链）；主备皆限额→停派喊人。
- **总监督wake-only**：平时只喊编排者，两次叫不醒才找用户一次；质量走 supervisor 链。
- **不动旧版＋不擅自提交**：无明确指令（含分支名，默认 main）不 commit 不 push；不碰 secrets。
- **单点对接**：只有编排者找用户，总监督平时静默。
- **开工前读**：`AGENTS.md`→角色卡→`USER_MODEL_OVERRIDE.md`→本 HANDOFF→`经验一句话.md`（11 条）→任务目标放最后。

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
