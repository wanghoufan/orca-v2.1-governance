# CODE REVIEW

- Task: override主备复核（USER_MODEL_OVERRIDE.md 本轮 diff，只读不改）
- Commit: 无（非 git 仓库分发冻结实例；HANDOFF §6 分发冻结；被检文件根 `USER_MODEL_OVERRIDE.md` 共 29 行，表头+分隔行+10 数据行）
- Reviewer: code-reviewer
- Result: 过（P0=0；下述 P1×2+P2×3+P3×1 由 builder/TM 后续顺手修，不阻塞本轮；复核只给改法，不直接改代码）

> Dispatch / Evidence ID 系字段 2.0 已废弃，不填。

## P0 / P1 Findings

- P1-1（builder 行备注 A/B 混写，改法一句）：第 11 行 builder 备注写“主用=pi默认/codebuddy……Runtime是否切pi待确认”，但同行 Runtime 列已填 `deepseek-bridge`（=规则第 27 条之 A 通道，已测正式默认）。备注把 A 通道主用描述成 B 通道（pi默认待测），与 Runtime 列矛盾。改法：备注改为“主用模型同 pi 默认同款（显示 `deepseek-v4.1-flash` 仅显示名），通道走 `deepseek-bridge`（A 已测）；是否切 pi（B）待 B 测完由用户定”。不升 P0 的理由：派工按 Runtime 列自动调用（备注不驱动派工），且第 27 条已有兜底“表内混写一律以本条为准拆分”，功能无损。
- P1-2（task-manager 备用跨池字面冲突，补 guardrail 措辞）：第 9 行 TM 主用 `opencode-go/muse-spark-1.3-contributor`（GO 池），备用 `deepseek-flash`（pi 默认/B 通道待测），与第 22 条“TM 只走 OPENCODE_GO”字面冲突；且备用 Runtime 为空（=本窗口 subagent 原行为），B 未测前切备通道未定。改法（二选一，不推翻用户已定备用归属）：① TM 行备注追加“ B 未测完前 TM 主用超限不得静默走未验证 Runtime，主备均超限按停派找人”；② 或第 22 条括号补“TM 主用只走 OPENCODE_GO，备用按用户定名单例外（见 TM 行备注）”。用户备用决策本身不动，只补执行护栏。

## P2 / P3 Backlog Findings

- P2-1（规则冲突结论①：主备自动切不算自作主张）：第 5/24/25 条“主用额度受限时编排者在同角色备用名单内自行切备+记 HANDOFF+账本、双超限停派找人”不违反 AGENTS 红线。理由：文件头三处标“2026-09-11用户定”，本轮用户逐条口述、TM 记录（口述记录核验属 TM 职责，不在本次被检文件内，复核采信文件内用户定标注）；授权范围锁死“同角色已授权名单内”，属执行非决策；“双超限停派、不静默扣费”护栏完整。条件：每次切换必须兑现“记 HANDOFF+账本”，由 supervisor 抽查。
- P2-2（规则冲突结论②：FREE 耗尽整批升 GO 触发式不算恢复类条件违规）：第 29 条触发器是用户显式说一句“FREE用完了”（非到期时间、非自动探测），且“FREE恢复是否切回由用户再说一句定”（无自动恢复）。与 HANDOFF §3 禁的“等免费模型恢复/到期条件”语义不同，合规。字眼风险：该条含“FREE恢复”字样，与 HANDOFF §3“相关字眼已清完”字面相碰；改法：HANDOFF §3 口径澄清（“用户显式触发式不算恢复类条件”）由 TM/supervisor 定，reviewer 不扩权改 HANDOFF，本条仅提示。
- P2-3（mimo GO 后缀与 FREE Spark 映射结论：成立，不打回，留 QA 真机验证）：`opencode-go/mimo-v2.5`（qa/experience-recorder 备用）去 `-free` 后缀与 Spark GO 行（`opencode-go/muse-spark-1.3-contributor` 同去 `-free`）模式一致，非缺失；两行备注均已诚实标注“精确后缀待确认”。`opencode-free/muse-spark-1.3-contributor-free` 在 supervisor 主/builder 备/neat-freak 主三行一致成对（FREE=`opencode-free/`前缀+`-free`后缀，GO 对应行去后缀），格式成立。改法：均不改表，由 qa 按第 28 条派工显式心跳真机验证，首派即见分晓。
- P3-1（显示名口径抛光）：`deepseek-v4.1-flash` 机检确认零进入 Model 列（两模型列别名/旧 alias 扫描干净：无裸 `gpt-5.6`、无 `deepseek-v4.1-flash`、无旧 `deepseek-bridge/deepseek-v4-flash`）；仅在 TM/builder 备注作“显示……”与第 26/27 条规则正文出现，允许。改法（可选）：两处备注统一为“显示 `deepseek-v4.1-flash`（仅显示名，禁入 Model 列）”，与第 26 条禁令措辞对齐。
- 结论③（双通道 A/B 不混不删表述清楚）：第 27 条“A=Bridge（`deepseek-flash`+`deepseek-bridge`，已测）/B=PI（显示名，精确 ID 暂按 `deepseek-flash`，Runtime 待测后定）+勿混勿删+测试只测 B+测后用户定归属”+第 26 条“route 只记备注禁入 Model 列”+第 22 条换池须改表，三层互锁，表述清楚；唯一混写即 P1-1，已给改法。

## 机检证据（本轮实跑）

- 表结构：管道行 12（含表头+分隔行），数据行 10，每行精确 5 列（role/主用/备用/Runtime/备注），角色 10 个无缺无重：task-manager、supervisor、builder、planner、code-reviewer、qa、product-reviewer、experience-recorder、neat-freak、senior-expert。
- Model 列扫描：零裸 `gpt-5.6` 别名（三处 codex 行均为 `codex/gpt-5.6-sol|terra|luna` 全 ID）；零 `deepseek-v4.1-flash` 入列；零旧兼容 alias 入列。
