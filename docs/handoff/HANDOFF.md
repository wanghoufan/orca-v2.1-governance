# HANDOFF｜ORCA 治理重塑（分发版）

> 本文件为实例，拷进新项目时清空第 1-2 节照模板重写。

- 更新：2026-09-13，开发暂停收尾（neat-freak 对齐＋CUA-MAC-1 收口＋§§1-3 现势重写；已 push `acc8456`）。
- 更新：2026-09-13，模型分工表改版＋Mac通道诊断任务TM收口（§15）；已 push `00845ad`。
- 更新：2026-09-13，开发暂停收尾（neat-freak对齐＋§§1-3现势重写＋§14记一笔；未commit，等用户指令）。
- 更新：2026-09-13，本项目编排者（TM）由 GO（`opencode-go/muse-spark-1.3-contributor`）**切回免费**（`opencode/muse-spark-1.3-contributor-free`，即表内 TM 主用）；切换过程中报 provider 错 `reasoning encrypted_content was not issued to this caller`（会话内模型 caller 变更后旧加密 reasoning 块被重放，续旧会话必复现）。处置：**未改表**（FREE 本就是表内主用），旧会话不 resume，开新会话继续。
- 更新：2026-09-12，模型与双阶段整改＋C2两包同步＋zip重建（§9），版本标记文件改指针语（版本真相以Git历史为准）。
- 更新：2026-09-12，收编持续推进协议（§7）＋L3 watchdog 脚本进 `scripts/orchestration/`（§8），两包同步、zip 重建。
- 更新：2026-09-11，开发暂停收尾（已推 `b84e61d`）。历史旧报告6份已删；`docs/history/` 新增审查报告3份（-y轮/现势/逐派，未提交，待定去留）。现行结论以包内文件＋本 HANDOFF §1-§3 为准。

## 1. 当前工作进展（2026-09-13，现势；开发暂停收尾完成）

- 模型表（`USER_MODEL_OVERRIDE.md` 最终版，md5 三方一致 `3a661a71`）：TM＝用户临时指派/开窗口时定（不定模型，备用 V4.1）｜supervisor＝`deepseek-v4.1-flash` via codebuddy（额度受限停工找用户、切账号继续、不自动转备份）｜builder/qa/product-reviewer＝`codex/gpt-5.6-luna` via codex｜code-reviewer/experience-recorder/neat-freak＝`opencode/muse-spark-1.3-contributor-free`（本窗口）｜planner/senior-expert＝`codex/gpt-5.6-sol` via codex（不变）。V4.1/codebuddy 通道保留非删。
- Mac 真机 QA 通道诊断：完成。七项 6/7 PASS，滚动缺位。跨模型复测（codex/Luna vs deepseek/V4.1）滚动 FAIL 稳定复现 → 证实与模型/通道无关。
- CUA-MAC-1 收口：正向对照阳性（系统级 PageDown 滚动条 value `0→0.66`）＋ orca 两路径 no-op（AX 元素路径 `AXScrollDownByPage` 与合成坐标路径均 `ok=true` 但滚动条 value 仍 0）→ **根因判定 = Orca provider scroll false-positive / no-op**。最小复现包 `docs/qa/CUA-MAC-1-最小复现包-2026-09-13.md`。
- CUA-MAC-2（Orca 终端 composer 输入 P1）：未进正式复测，待另开单。CUA-MAC-3（批准 P2）：已批准（持久档加 `com.stablyai.orca`，验证生效）。
- backlog 文档修订 8 项：诊断报告 §9 已落（R1/QA-MAC-4 覆盖面、R2-R5、QA-MAC-5/6/7）。
- 正式真机 QA：维持**未启用**。Android/iPhone：继续暂缓。
- 参考文档：`docs/model/模型分工工作量排名-2026-09-13-参考.md`（母版独有，仅供用户看，不随日常更新，等通知再更）。
- commit/push：`00845ad`（分工表改版＋Mac收口＋跨模型复测＋排名）、`acc8456`（CUA-MAC-1 收口），均已 push origin/main。
- 账本：分发口径冻结，TASK/DISPATCH 均仅 `_example` 行。

## 2. 下一步任务（恢复开发按序做）

1. 开第一单业务（`第一阶段，计划`）：Sol Planner 长对话→PRODUCT PLAN→Research Reviewer→Readiness≥90→用户拍板→`第二阶段，开发`。
2. CUA-MAC-1 滚动缺陷：等 Orca 侧修复 scroll 实现（修复方向见 `CUA-MAC-1-最小复现包-2026-09-13.md` §七）；修复后另开单复测，先立正向对照＋零噪声面。
3. CUA-MAC-2（Orca 终端 composer 输入）：另开单复测（尚未进正式）。
4. 观察 supervisor V4.1 额度消耗：额度受限停工找用户，用户切账号后通知继续，不自动转备份。
5. Android/iPhone 真机 QA：继续暂缓，未派工未测。
6. 母版每次改完同步两包＋HANDOFF 记一行（常驻同步，diff 零容忍）；ZIP 重建验无 `.DS_Store`。
7. sop 杂项＋history 3 报告去留：用户一句话即移出（`docs/sop/` 仅模板示例）。
8. GOVERNANCE_REVIEW 现行 P2/P3＋优化 5 条纳入 backlog，下次常规改动同批。

## 3. 注意事项及规矩（违反即打回）

- **模型表为准**：一切与 `USER_MODEL_OVERRIDE.md` 冲突以表为准（最终版：TM 不定／supervisor=V4.1／builder·qa·product=Luna／reviewer·recorder·neat=FREE／planner·senior=Sol）；精确 ID 禁别名；codex 实调用剥 `codex/` 前缀用短名。
- **supervisor 用 V4.1**：额度受限停工找用户、切账号后继续，不自动转备份；不得擅自切 Luna/FREE 顶替。
- **真机 QA 硬门禁**：每 session 先派预检收 PASS 回执才派正式，非 PASS 停派找人；`ok=true` 无状态/像素变化记 `FAIL_UNVERIFIED_ACTION`；禁拼 PASS；Mac 预检不代 Android/iPhone 验收。
- **两域判据**：codebuddy 自测看正文（含预期回显即可）；账本/脚本断言看 exit 码；互不引用。
- **账本冻结**：分发包 TASK/DISPATCH 只留 `_example` 行，首个真实任务前删除；实绩记 HANDOFF 存档。
- **两包常驻同步**：母版改完同步两包＋HANDOFF 记一行，`diff` 零容忍；ZIP 重建验非旧缓存、无 `.DS_Store`。
- **切换口径**：换模型/换 Runtime 用户定；升级只算 supervisor 累计打回 2 次（QA 挂不计数），senior 再被打回 2 次即停线找人；不写"等免费模型恢复"类条件。
- **不动旧版＋不擅自提交**：无明确指令不 commit 不 push；不碰 secrets；不覆盖未跟踪文件。
- **单点对接**：只有编排者找用户，监督者静默。
- **开工前读**：`AGENTS.md`→角色卡→`USER_MODEL_OVERRIDE.md`→本 HANDOFF→`经验一句话.md`（10 条）→任务目标放最后。

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
