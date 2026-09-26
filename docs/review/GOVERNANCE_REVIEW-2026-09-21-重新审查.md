# ORCA 治理体系重新审查报告丨2026-09-21（第二轮）

审查范围：`AGENTS.md`、`USER_MODEL_OVERRIDE.md`（母版＋两包）、`README.md`、`GOVERNANCE_VERSION`、`经验一句话.md`、`docs/roles/`（11卡）、`docs/prompts/`、`docs/pm|qa|review|handoff|model|sop|templates`、`新项目模板包/`、`老项目迁移模板包/`、`scripts/check-sync.sh`。
判定基准不变：母版 `USER_MODEL_OVERRIDE.md` 为模型真相源；`AGENTS.md` 为规则真相源；冲突听表。与上一轮关系：上一轮（同目录 `GOVERNANCE_REVIEW-2026-09-21-执行权与一致性审查.md`）的 P0-1（muse-spark 分裂）已消失关闭，其余项转入本轮复验；本轮新增 N1–N6。

## 一、执行权总览（框架完整，裁决基准三方分叉）

TM 唯一对人、supervisor 只对 TM、builder 不直聊用户、permission_request 走 TM 单点、换模型用户定、不 push 无明确指令、db-admin 直派直收不经 Human Gate、总监督体系外 wake-only——分权框架仍完整（依据同上一轮，不复述行号）。
但“冲突以表为准”当下不可执行：母版表、两包表、AGENTS/README/HANDOFF 文字口径是三个版本（见 P0-1/P0-2）。TM 派 db-admin 或真机 QA 时，走母版表则违反角色卡/包表，走卡/包表则违反“母版真源＋实派==表”。执行在派工源头分叉，先收敛三方再派工。

## 二、P0（阻塞执行，必须先修）

### P0-1 母版表丢 db-admin 行（10 行 vs 声称 11 行）
- 母版 `USER_MODEL_OVERRIDE.md:5-14`：10 个数据行，无 db-admin；`AGENTS.md:45` 仍写“11行以表为准”；`AGENTS.md:15,30,44`、TM 卡 `:12`、`README.md:15`、`docs/roles/db-admin.md:5`、`HANDOFF.md:§1/§35/§36` 全部假定表内有 db-admin 行。
- 反而两包表（`新项目模板包/USER_MODEL_OVERRIDE.md:15`，老包同）保留 db-admin 行。真源比副本少一行，同步方向倒置。
- 后果：db-admin 当前无法合规派工——派了，supervisor 按“实派==表”必打回；不派，§35 立项的 Supabase 审核链断。
- 建议：二选一并留痕。(a) db-admin 有效：母版表补回 `:15` 行（与包表一致）＋删 T1 注释；(b) db-admin 作废：走正式手续删 AGENTS 三处＋TM 卡＋README＋db-admin 卡＋包表＋HANDOFF 记一笔。不允许“文档有、表无”中间态。

### P0-2 母版 qa 行“禁本窗口代做”与真机直驱体系冲突
- 母版表 qa 行（`:10`）：`codex 直调，禁本窗口代做`，无双态备注（相对 HEAD 把“本窗口直派＋真机直驱 note”整行换掉，`git diff HEAD` 已验）。
- 对立面：`qa.md:7` 双态分派（普通走 Luna，真机走本窗口 bash 直驱）、`README.md:15` 真机直驱、`HANDOFF.md:§32/§38`（A 闭环真调结论）、两包表 qa 行双态备注（新包 `:10` 实测在位）。
- 后果：codex 沙箱跑 adb BLOCKED 是已实证前提（§32）；按母版表走，真机 QA 无路可走；按卡走，违反“以表为准＋禁本窗口代做”。普通 QA 与真机 QA 共用一行但通道互斥，§38 写明的“B 方案”在母版表内无字。
- 建议：母版 qa 行补回双态备注（与包表 `:10` 一致），或把“禁本窗口代做”收窄为“普通 QA 禁本窗口代做，真机直驱例外，note 记分支”。改完跑一条真机预检当真调证据。

### P0-3 母版↔两包同步仍破裂（SYNC-FAIL 未修复）
- 实测 `sh scripts/check-sync.sh`：母版↔新/老包各 `AGENTS 非预期差 4 行`，DIFF 项：`USER_MODEL_OVERRIDE.md`、`docs/sop/android.md`、`android-machine-profile.md`、`webqa.md`、`经验一句话.md`；尾部 `SYNC-FAIL`。与上一轮同项，未收敛，且本轮母版表回退使 override 差扩大为“母版落后于包”。
- 两 `*.zip` 仍为已删状态（`git status D`），`README.md:59` 仍广告可复制压缩包。
- 建议：先定 P0-1/P0-2 的目标版本，再一次同步两包＋重建或删 zip 叙述（见上一轮 P0-2，不重复）。

## 三、P1（会误判／派错）

- P1-1 T1 HTML 注释（母版表 `:16`）：`<!-- 分工表版本：T1（…仅用户回退口令用，模型忽略此行） -->`。三宗罪：① 第二套版本号，违反 `GOVERNANCE_VERSION`“不设数字版本号”；② “回退口令”未定义（三口令外的新口令无手续、无 HANDOFF 记录）；③ 用自然语言命令模型“忽略此行”——真相源文件内藏“忽略部分真相源”指令，审计 `grep` 易漏，注释会先于表格腐烂。建议整行删除；回退手续走 HANDOFF 记一笔，不走注释。
- P1-2 HANDOFF 未提交堆积＋重号：HEAD 止于 §33，工作区新增 10 节（治理 §34–§38：builder 回 GO／db-admin 增／db-admin 换 GO／builder 重回 codebuddy／qa 双态；PC 本地 §34–§38：rules 软链／CodeArts／CLAUDE 软链／TRAE／技能改造），编号 34–38 重复两次（`grep ^## 3` 实测 14 命中）。另 §1 自称“纯表 10 行 4 列表外零文字”——T1 注释已使“零文字”不成立；§1 经验“11 条”实测 `经验一句话.md` 14 条（`grep -c`）；§1 qa 双态描述与母版表不符。建议：PC 本地 5 节移出主 HANDOFF（或重号 §39 起，PC 环境笔记不占治理序号）；§1 改为“以表为准，此处不复述”或重写现势；经验条数以后只写“见文件”，不再手数。
- P1-3 角色计数仍未统一：`AGENTS.md:3`“9+1＋1” vs `:13`“9 常驻 + 1 升级” vs 实际 11 卡 vs `:78` 总监督“不占9+1”。建议全文件统一“9＋1＋1”，红线同步。
- P1-4 sop 三件套外文件仍悬空：`android.md`、`android-machine-profile.md`、`webqa.md` 在母版未跟踪（`git ls-files docs/sop` 仅三件）、包内缺失；`AGENTS.md:76` 红线列 4 件（含 android 缺 webqa）、`README.md:35` 只列 3 件、迁移提示词 `:13` sop 清单 3 件。且 `webqa.md` 自称“真源”、`qa.md:10-17` 的 BrowserOS 九条无包内去向。建议：要么 `git add` 落盘＋接线＋进包，要么移出 `docs/sop/` 并删引用；webqa 真源位置二选一（`docs/sop/webqa.md` 或中央 rules），不允许双真源。
- P1-5 used 恒填主 vs 主备链（延续上一轮，未修）：builder 主→备切换后 `DISPATCH.used` 仍只能填主（AGENTS `:45,:60`、supervisor 断言），切备轨迹无合规记法。建议 used 加 `备` 枚举或明确“切备记 note＋HANDOFF”。
- P1-6 编排者提示词无 db-admin 接线：TM 卡 `:12` 有直派句，`docs/prompts/编排者提示词.md` 全文无 db-admin（`grep` 零命中）。新专项角色在派工入口缺席，TM 按提示词开工会漏派。建议提示词 DEVELOP 派工句补半句 db-admin。
- P1-7 版本指针与残留：`GOVERNANCE_VERSION` 单行指针与 T1 注释并存（见 P1-1）；`docs/plan/`（新包空目录）残留仍在；`skills-lock.json`／`.agents/skills/agent-browser`／`temp/` 去留仍无说法（延续上一轮）。

## 四、P2 与优化

1. TASK 示例行仍过期：`TASK-MODEL-LOG.jsonl` 示例 `model=opencode-go/deepseek-v4.1-flash/role=builder`，现 builder 为 codebuddy 主备链；且示例无 db-admin 版。建议换现行主用＋豁免注。
2. 迁移提示词 `:11-12` 写死本机绝对路径（自声明“本机专用”却随包分发）。建议占位符化。
3. 外部提示词 `:16`“根全部 *.md＋docs/ 一律不动”仍过宽（TM/迁移工的合法根变更被字面禁止）。建议加豁免主语。
4. `check-sync.sh` 须 `sh` 运行（`python3` 跑报 SyntaxError），用法未文档化。建议 README 或脚本头加一行。
5. 旧报告三代并存（09-13×2、09-15×2、09-21 第一轮＋本轮）：`README.md:38`“旧报告已删”已过期。建议本轮明确：本报告为现势正典，之前四份为历史（结论以本报告 §二/§三为准）。

## 五、验证说明

- 未改业务代码；本报告仅文档审查，新增文件仅本报告。
- 已实测：`git status --short`（M 12 件含母版＋两包 AGENTS/override/qa/TM/协议＋HANDOFF/经验，D 2 zip，?? 8 件）；`git diff HEAD -- USER_MODEL_OVERRIDE.md`（仅 qa 行＋T1 注释两处）；`git diff HEAD -- docs/handoff/HANDOFF.md`（§1 双态＋db-admin 改写，新增 10 节）；`sh scripts/check-sync.sh`（SYNC-FAIL 原文见 P0-3）；`grep ^## 3`（14 命中，重号实锤）；`grep -c` 经验 14 条；`git ls-files docs/sop`（仅三件）；包表 qa `:10` 双态备注与 db-admin `:15` 在位（母版缺失的正是包内有的）。
- 与上一轮差异声明：上一轮 P0-1 已关闭；上一轮 P0-2/P0-3、P1-1–P1-8、P2 大部仍有效，本轮仅收录仍成立项并重新取证，不重复贴旧行号；新增 N1（P0-1/P0-2 表倒置）、N3（P1-1 T1 注释）、N4（P1-2 HANDOFF 堆积）。
- 风险：若“回退 T1”是用户本意，则正确收敛方向是把 AGENTS/README/角色卡/包表/HANDOFF-§1 全改回 T1（10 行、qa 纯 codex、删 db-admin），工作量更大；本报告按“§35–§38 治理决策有效”假设写 opponents 方案（补母版表），若假设不成立，P0-1/P0-2 修复方向需反转，但“必须三方一致”结论不变。
