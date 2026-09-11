# ORCA V2.1 治理体系全面审查报告（2026-09-11 分发版现势）

- 审查对象：`2026-09-09 丨 MAC 丨 ORCA V2.1 治理模板 丨 分发版-2026-09-11`（`GOVERNANCE_VERSION=2.1`）
- 基线对照：包内全部根文件（AGENTS/编排者/外部/迁移/override/经验/重塑说明/更新说明/归位表）＋ `docs/` 全量（roles×10、pm/review/qa/handoff 模板、HANDOFF 实例×2、账本 3 行、sop×1）＋ `治理审查报告/` 历史 4 份（09-09、09-10 主、09-10 复验、09-11 RUNTIME 送审）
- 审查日期：2026-09-11｜方式：全量重读＋逐项交叉核对＋关键命令实测（见 §6）
- 结论先行：**P0=0（无照做必错），P1=7（特定条件下必错/死锁/触发器恒假/分发污染，需修后再冻结分发），P2=10（口径差/stale/可优化，不拦分发，建议与 P1 同批修）**。09-10 复验遗留的 P1（schema 断言）已确认修好（supervisor 卡现为断言版，好文件 exit 0，见 §6①）；09-10 主报告 P1-1→P1-6 闭环仍然有效。但 09-11 的 override 主备＋双通道＋Runtime 插座增量（约 1 句 AGENTS＋表头 1 列＋规则 5 段＋编排者 2 段＋builder/template/task-manager/supervisor 各 1 处）**引入了 7 个新 P1**，问题集中在**同一文件内自斥（禁令杀死自家主用、前缀新旧两套、已填 vs 待定）＋分发态污染＋更新说明失实**，而非方向错误。

严重度：P0=照做必错；P1=特定条件必错/死锁/触发器恒假/分发污染；P2=脏数据/stale/效率优化。

---

## 1. 上轮报告核验（09-10 复验 §2–§3 → 本次实测）

| 上轮项 | 本次结论 | 证据 |
|---|---|---|
| P1 schema 无断言 | ✅ 已修 | `docs/roles/supervisor.md:4-22` 现为断言版（缺键/错枚举/rework 非 int 打印 `L行号` 且 exit 1，`_example` 跳过）；本机重跑好账本 exit 0（§6①） |
| P2-A HANDOFF verdict 复发 | ⚠️ 半修 | `docs/handoff/HANDOFF.md §4/§6` 已改为指回审查报告，但 `HANDOFF-2026-09-11-override主备.md:9` 仍有“reviewer过/qa挂/supervisor有条件放行” verdict 句（见本报告 P2-9） |
| P2-B 账本 чужой 行 | ❌ **复发且加重** | 账本现为 3 行真实行、无 `_example` 行（见 P1-3）；`HANDOFF.md:36` 却写“账本已恢复_example行”，陈述失实 |
| P2-C 累计数落盘位 | ✅ 已修 | `HANDOFF.template.md:8` 已有“（累计打回 n/2…）” |
| P1-1→P1-6（09-10 主） | ✅ 维持闭环 | scripts、升级口径、封顶停线、三类例外、缓存三处、跳步＋P0 真空均在位 |
| 2.1-更新说明“只加缓存五条” | ❌ **现已失实** | 见 P1-4：09-11 增量远超缓存五条，更新说明未同步 |
| QA-04 剥前缀一句 | ✅ 已修 | `USER_MODEL_OVERRIDE.md:21` 已有“codex CLI 实调用剥 `codex/` 前缀用短名” |
| QA-05 B 通道待测 | ⚠️ 半修变 stale | BUGS 已真测 PASS，但 override 表内“待真测”未清（见 P1-6） |

---

## 2. P1：冲突/矛盾/卡点（7 项，按修的顺序排）

### P1-1 L26 禁令把自家主用/备用一起禁了（同文件自杀，必修）

- 位置：`USER_MODEL_OVERRIDE.md:26`（禁令） vs `:9`（TM 备用） vs `:11`（builder 主用）
- 矛盾：`:26` 写“禁编造 `deepseek-official/xxx`、`deepseek-v4.1-flash`、测试期 `…-expires-on-0910` 或任何未经验证的模型 ID”。但 `:9` TM 备用模型列正是 `deepseek-v4.1-flash`，`:11` builder 主用模型列正是 `deepseek-v4.1-flash`。按字面，两处主备全属“禁编造”之列，supervisor 可直接打回整表；若按意图（禁的是 Bridge 通道精确 ID 冒用显示名），禁令缺了作用域限定。
- 实测：`rg "deepseek-v4.1-flash" USER_MODEL_OVERRIDE.md` 命中 `:9/:11/:25/:26/:27` —— 同一 ID 在同一文件里既是“主用/备用”又是“禁编造”，无裁决规则可解（`:27` 的“混写以本条为准”只管 A/B 拆分，不管禁令）。
- 修复（二选一，推荐 A）：A）`:26` 禁令加作用域：“禁把 `deepseek-v4.1-flash`（PI 显示名）填入 Bridge 通道模型列；Bridge 模型列只许 `deepseek-flash`”＋“PI 通道模型列允许 `deepseek-v4.1-flash`（见 :27 B 通道）”。B）若 PI 精确 ID 另有其值，把 `:9/:11` 改为该精确 ID，显示名只留备注。无论选哪个，`:25`“显示名称按用户口径”须同步指回。

### P1-2 FREE 耗尽触发器已死：条件写旧前缀，全表已无命中行（恒假，必修）

- 位置：`USER_MODEL_OVERRIDE.md:29` vs `:25` vs `:10/:11/:14/:16/:17` 表行
- 矛盾：`:29` 触发条件写“所有主用含 `opencode-free/` 的行”。但 `:25` 已自证“FREE=`opencode/`（Zen，live 核无 `opencode-free` provider）”，表内 5 处 FREE 行（supervisor 主/builder 备/neat 主/qa 主/experience 主）已全迁至 `opencode/…-free`，`rg "opencode-free" USER_MODEL_OVERRIDE.md` 仅命中 `:25`（映射说明）与 `:29`（触发器自身），**数据行零命中**。用户说“FREE 用完了”时，触发器圈定 0 行，主备均超限停派找人等后续全悬空。
- 另：`:29` 括号举例“Spark FREE→`opencode-go/…`，mimo FREE→GO mimo…”仍按旧前缀描述，与现表 `opencode/` 对不上；“FREE 恢复是否切回”与 `HANDOFF.md:18`“相关字眼已清完”字面相碰（见 P2-1）。
- 修复（2 行）：`:29` 改为“所有主用含 `opencode/` 且以 `-free` 结尾的行”＋举例同步为现表 ID；或加迁移句“旧 `opencode-free/` 一律视为 `opencode/`，触发器按现表前缀执行”。改完重跑 `rg "opencode-free/"` 确认仅剩历史引用。

### P1-3 分发态污染＋伪陈述：HANDOFF 写“已恢复_example行”，账本实为 3 行 чужой 真实行（必修，分发冻结动作）

- 位置：`docs/handoff/HANDOFF.md:36` vs `docs/model/TASK-MODEL-LOG.jsonl`（3 行） vs `AGENTS.md:44`
- 矛盾：`HANDOFF.md:36` 写“账本已恢复_example行”。实测账本为 3 行真实行（`TASK-override主备` FAIL、`TASK-override-ID核准` PASS、`TASK-全表真测` PASS，均 `project`=分发版长目录名），**无 `_example` 行**。`AGENTS.md:44` 要求“模板自带的 `{"_example":true}` 行不参与统计，首个真实任务前删除”——现状是“删了示例、留了母版实绩”，新项目拷包即继承 чужой 统计，跨项目拼接污染重演（09-10 复验 P2-B 换了主人回来，且本次附带虚假陈述）。
- 修复（分发冻结动作，非代码）：二选一——A）账本恢复 `_example` 示例行＋删 3 行真实行（推荐，规则链完整）；B）清空为 0 行＋AGENTS 补“空账本首行须含全部 11 键”。同步改 `HANDOFF.md:36` 为实话（“账本已恢复_example行，3 行实绩已移入治理审查报告存档”或对应选项）。禁止以“含 3 行母版实绩”状态分发。

### P1-4 `2.1-更新说明.md`失实：声称“只加缓存五条、其余相同”，09-11 增量只字未提（必修）

- 位置：`2.1-更新说明.md:3-5` vs 现实 diff（`AGENTS.md:29` Runtime 插座、`USER_MODEL_OVERRIDE.md:6` 表头 Runtime 列＋`:21/:22/:25/:26/:27/:28/:29` 七段规则、`编排者提示词.md:10-11` 两段、`docs/roles/builder.md:7`、`docs/handoff/HANDOFF.template.md:9`、`docs/roles/task-manager.md:7`、`docs/roles/supervisor.md:26`、`外部开发者提示词.md:3`）
- 矛盾：更新说明仍是 09-09 版（“相对 2.0 只加缓存五条…其余文件与 2.0 相同”）。新人按此理解体系，Runtime 通道、双通道 A/B、派工显式心跳、FREE 整批升 GO 等关键机制全部漏读；按“其余相同”去 2.0 找依据必错。
- 修复（3 行）：更新说明追加“2026-09-11 增量（Runtime 插座＋override 执行通道列＋DeepSeek A/B 双通道＋派工显式＋FREE 触发器），详见 AGENTS:29 与 override:21-29；09-09 版描述仅覆盖首次 2.1”。或改标题为“2.1（09-09 基线）＋09-11 增量补记”。

### P1-5 supervisor 模型行悬空：“同 task-manager 行”vs 独立 supervisor 行（裁决基准分裂，必修）

- 位置：`docs/roles/supervisor.md:23`（“模型：同 task-manager 行”） vs `USER_MODEL_OVERRIDE.md:9`（TM：主 GO Spark／备 DeepSeek＋Runtime codebuddy） vs `:10`（supervisor：主 FREE Spark／备 GO Spark／Runtime 空）
- 矛盾：两行完全不同。若按 supervisor 卡字面，监督者应跟 TM 走（主 GO Spark、备 DeepSeek via codebuddy）；若按 override 表，监督者走 FREE→GO 独立行。TM 派 supervisor 时无所适从；且“监督者与被监督的 TM 同模型同通道”削弱独立性（TM 主备全超限时监督者同步失能，无人复检停派）。
- 修复（二选一，需用户拍）：A）supervisor 卡改为“读 override 的 supervisor 行”（推荐，独立性＋与表一致）；B）若确要同 TM 行，删 override supervisor 独立行＋注明“监督者与 TM 同行”。另建议：监督者备用避免与 TM 主备同陷一池（现 A 选项天然满足：supervisor 备 GO vs TM 备 PI，保留此错开）。

### P1-6 B 通道“待真测” stale：BUGS 已三轮 PASS，表内仍写待命（同文件“已填 vs 是否填待定”自斥，必修）

- 位置：`USER_MODEL_OVERRIDE.md:9`（TM Runtime codebuddy“待真测”）、`:11`（builder Runtime codebuddy“待真测”）、`:25`（B“待真测”）、`:27`（“Runtime 是否填 `pi/codebuddy` 待测后定…真可达待用户另批后再测”） vs `docs/qa/BUGS-2026-09-11-override主备.md §补测/§B真测/§全表真测`（B 只读 `rc=0`＋`-p pong` 单发 `rc=0 pong` PASS＋GO 3/3＋FREE 2/2）
- 矛盾：表内 Runtime 已填 `codebuddy` 并实际跑通，但同文件三处仍标“待真测/待定/待批”。TM 读表无法判断 B 是“可用主用”还是“待命占位”；`HANDOFF-2026-09-11-override主备.md:25` 已记“剩 P0=0 收工”，规则侧仍写待命，前后脱节。`编排者提示词.md:10`“无 Contract 一律按待接入处理”亦被架空（B 既无 Contract 又标主用又标待测）。
- 修复（3 行）：`:9/:11` 删“待真测”改“已测（BUGS 09-11 B 只读＋单发 pong PASS，真机心跳见 :28）”；`:25` 同步；`:27` 尾部改“测试已补（只读 rc0＋单发 pong PASS），后续切 A/B 由用户定”＋删“Runtime 是否填待定”（已填）。若真可达仍需额度审批，改写为“批量压测待批，单发可用”而非“待真测”。

### P1-7 Contract 缺失却称“已验证正式通道”：可验证性断裂（必修）

- 位置：`USER_MODEL_OVERRIDE.md:26`（“依据：`V2.1_BRIDGE_INTEGRATION_CONTRACT.md` §1 三元组＋官方发布＋真链 Probe”） vs `编排者提示词.md:10`（“无 Contract 一律按待接入处理，不编造”） vs 包内现实（`BUGS-2026-09-11-override主备.md:32` 亲证“分发包内无 bridge 可执行探针，引用的 Contract 不在包内”；本轮 `rg Contract` 仅命中规则自述与 sop 杂项，无 Contract 本体）
- 矛盾：按编排者自定规则，无 Contract 本体即应标“待接入”；但 `:26` 标“A 已验证正式通道”＋`:25` 标“A 已测”。分发出去的新项目无法复核三元组、route/envelope、permission 格式，A 通道可信度只剩一句话。
- 修复（三选一）：A）Contract 随包分发（推荐，若可公开）＋ `:26` 补路径；B）Contract 留业务仓但 `:26` 改为“Contract 存业务仓（路径/版本），分发包仅记结论，激活前回仓重放 probe”；C）A 通道暂标“待接入（结论待 Contract 到位后启用）”。无论选哪个，`编排者提示词.md:10` 的“按待接入处理”须与最终标注一致。

---

## 3. P2：口径差与优化（10 项，不拦分发，建议与 P1 同批修，每项 ≤3 行）

1. **HANDOFF §3“相关字眼已清完”失实**：`docs/handoff/HANDOFF.md:18` 写“模板里相关字眼已清完，不准再写”，但 `USER_MODEL_OVERRIDE.md:29` 含“FREE 恢复是否切回”。语义上触发式不算恢复类条件（CODE_REVIEW 结论②成立），但字面相碰 supervisor 可挑字眼打回。修：HANDOFF §3 补括号“（用户显式说一句触发式不算恢复类条件，见 override:29）”。
2. **`2.0-重塑说明.md:7` builder 主力 stale**：仍写“builder 当前主力 `codex/gpt-5.6-terra / medium`”，现实 builder 主用为 `deepseek-v4.1-flash` via codebuddy（用户定，A 保留）。修：改“历史主力（2.0）…现主力见 override builder 行”＋ medium 档指回 override:21（档位写口头）。
3. **`docs/sop/` 混入无关交接**：`2026-08-25 丨 Windows 丨 GPT 网页端 丨 Clash Verge … V1.0.md`（业务交接，700＋行，内含 Runtime Contract 章节）随模板分发，易与 Bridge Contract 混淆，且不在“谁写哪”表内。修：移出分发包或归档＋AGENTS 红线补“sop 仅模板示例，新项目自建”。
4. **账本 role 分布 vs 分工＋FAIL 语义**：3 行 role=`task-manager,task-manager,qa`，无 builder/senior 初版行（AGENTS 分工 builder/senior 初版→supervisor 校验→TM 落盘）；首行 `result=FAIL,rework=0`（FAIL 却 0 返工，FAIL 指任务挂还是模型挂未定义）。修：AGENTS 账本节补“`result`=任务级 PASS/FAIL（模型超限切备成功仍可 PASS，FAIL 须配 escalation_reason/备注）”＋分发时问题随 P1-3 一并清。
5. **permission 机器格式缺**：`AGENTS.md:29`＋`编排者提示词.md:11` 只给流向“机器可读→TM 审批单点→用户定→回 runtime”，无字段/示例/落盘位（HANDOFF/TASK-MODEL-LOG 均无 permission 字段）。修：HANDOFF.template 或 EXT-WORKLOG 补可选行“permission_request（原文/决策/回执一句）”，或明示“首版先记自然语言一句，格式待 Contract”。
6. **HANDOFF 日期指回漂移**：`HANDOFF.md:5`“结论以最新一份为准” vs `:28`“以 2026-09-10 为准” vs `:36` 同上——09-11 RUNTIME 送审已存在，09-10 不再是最新。修：三处统一为“以 `治理审查报告/` 目录日期最新一份为准”，删具体日期。
7. **`2/2` 写法歧义**：`docs/roles/task-manager.md:7`“累计打回 2/2”易误读为分数；AGENTS 用“累计 2 次”，HANDOFF.template 用“累计打回 n/2”。修：统一为“累计 2 次（计数 n/2，supervisor 每次打回 TM 同步更新 HANDOFF）”。
8. **缓存适用范围未覆盖 Runtime**：`AGENTS.md` 缓存节括号“本窗口 subagent 链适用；外部施工见外部提示词”未提 External Runtime。Runtime 走 builder 通道（非外部 fallback 人工），换 Runtime 即开新链（编排者 :11）与缓存“换基础设施即开新链”交叉，新人易把 Runtime 当外部人工走。修：括号补“External Runtime 走 builder 通道，换 Runtime/换模型/升级即开新链（见编排者 :10-11）”。
9. **HANDOFF verdict 残留（P2-A 换马甲）**：`HANDOFF-2026-09-11-override主备.md:9`“reviewer过P0=0；qa挂P0×3…；supervisor有条件放行不打回”＋`:25`“supervisor终验过”——结论落在 HANDOFF，违反 `经验一句话.md:12`“结论只许落在 review/qa/审查报告，HANDOFF 只记状态”。修：该实例归档时 verdict 句改为指回（“结论见 CODE_REVIEW/BUGS 对应行，本 HANDOFF 只记 trace＋链 ID”）；QA 侧结论归属检查固定为语义规则，不只 rg 旧措辞。
10. **分发包残留真实 Session IDs**：`HANDOFF-2026-09-11-override主备.md:10` 含 `ses_f719…`×3 真实链 ID。按“TM 只记录不手造”这些是运行痕迹，随模板分发即 чужой 链＋隐私面。修：分发冻结时脱敏（`ses_***（母版实录，拷包清空）`）或移入审查报告存档，模板只留“普通 subagent 可空，真 resume 通道填”。

另两处**已确认非问题**（免得白改）：supervisor 断言命令本身正确（§6① 好文件 exit 0；坏例行为沿用 09-10 复验 §5 实测结论，不重测）；`product-reviewer` Luna 行与 `code-reviewer` Terra 行分工明确（override 备注＋池映射一致），不算“谁更强未说明”——升级方向由 supervisor 打回计数驱动，与模型强弱无关。

---

## 4. 卡点与优化建议（给开发者的非缺陷项，4 条）

1. **override 表已成第二 AGENTS**：29 行规则＋10 行表，正文比 AGENTS 还长，派工每派全读 token 浪费。建议拆“表（每次读）＋规则（版本冻，HANDOFF 指回版本号）”，或读盘顺序限定“override 只读本角色行＋变更行号”。
2. **派工显式心跳无落盘位**：override:28 要求每派贴“正在调用…/回来了…”两行，但 HANDOFF.template 无对应字段，靠 TM 口头。建议 HANDOFF.template“执行链”行尾补“（本派走主/备一句）”，与账本 model 列互验。
3. **主备自动切审计缺**：CODE_REVIEW P2-1 条件“每次切换必须兑现记 HANDOFF＋账本，由 supervisor 抽查”无抽查位。建议 supervisor 卡加半句“抽查最近一切备行 HANDOFF＋账本备注对得上”。
4. **FREE 触发器幂等缺**：:29 未写重复说“FREE 用完了”怎么办、切回是否重写历史行。建议补“触发器幂等：已升 GO 后重复触发只记账本备注，不重写历史 model 列”。

---

## 5. 修复清单（开发者按序执行，约 25 行改动＋1 个分发动作）

- [ ] P1-1：override `:26` 禁令加作用域（PI 显示名允许位），与 `:9/:11/:27` 对齐（2 行，需用户确认 PI 精确 ID 口径）
- [ ] P1-2：override `:29` 触发前缀改 `opencode/`＋举例同步（2 行），重跑 `rg opencode-free` 验收
- [ ] P1-3：分发冻结动作：账本恢复 `_example`（或清空）＋改 `HANDOFF.md:36` 为实话（分发动作，不占改动行；禁止含 3 行母版实绩分发）
- [ ] P1-4：`2.1-更新说明.md` 补 09-11 增量 3 行
- [ ] P1-5：supervisor 卡 `:23` 改“读 override supervisor 行”（1 行，需用户拍 A/B；推荐 A）
- [ ] P1-6：override `:9/:11/:25/:27` 清“待真测/待定”，改已测表述＋指回 BUGS（3–4 行）
- [ ] P1-7：Contract 三选一（随包／指回路径／暂标待接入，1–2 行）＋与编排者 `:10` 对齐
- [ ] P2-1～P2-10：批处理（每项 ≤3 行；P2-3/P2-10 为分发 hygiene 动作）
- [ ] 分发前：重跑 §6 三组命令（账本断言 exit 码＋`rg opencode-free`＋`rg 待真测` 归零确认）＋确认本目录以日期最新报告为准

---

## 6. 附：实测证据（2026-09-11 本机复现）

```
# ① supervisor 断言命令：现账本（11 键全对×3 行）exit 0 静默 —— P1 修好确认
python3 -c "<supervisor.md:6-20 断言块>" docs/model/TASK-MODEL-LOG.jsonl
→ exit 0，无输出（PASS；坏例行为沿用 09-10 复验 §5：缺键/错枚举/rework 非 int 均 L行号＋exit 1）

# ② P1-1 实锤：同一 ID 既主用又禁令
rg -n "deepseek-v4.1-flash" USER_MODEL_OVERRIDE.md
→ :9（TM 备模型列）｜:11（builder 主模型列）｜:25（分工 B 通道）｜:26（禁编造 deepseek-v4.1-flash）｜:27（B 显示名）

# ③ P1-2 实锤：触发器前缀恒假
rg -n "opencode-free" USER_MODEL_OVERRIDE.md
→ 仅 :25（映射说明：无 opencode-free provider）与 :29（触发器自身）；数据行（:9-:18）零命中
rg -n "FREE=" USER_MODEL_OVERRIDE.md → :25 FREE=opencode/（与 :29 的 opencode-free/ 对不上）

# ④ P1-3 实锤：HANDOFF 声称 vs 账本现实
rg -n "_example" docs/model/TASK-MODEL-LOG.jsonl → 零命中（3 行全真实行）
cat docs/model/TASK-MODEL-LOG.jsonl → TASK-override主备 FAIL / TASK-override-ID核准 PASS / TASK-全表真测 PASS，project 均为分发版长目录名
rg -n "_example|恢复_example" docs/handoff/HANDOFF.md → :36“账本已恢复_example行”（失实）

# ⑤ P1-4 实锤：更新说明 vs 现实增量
cat 2.1-更新说明.md → “相对 2.0 只加缓存五条…其余文件与 2.0 相同”
rg -l "Runtime|执行通道" AGENTS.md USER_MODEL_OVERRIDE.md 编排者提示词.md docs/roles/builder.md docs/handoff/HANDOFF.template.md → 5 文件命中（均为 09-11 新增，更新说明只字未提）

# ⑥ P1-5 实锤：supervisor 模型行两套口径
sed -n '23p' docs/roles/supervisor.md → “模型：同 task-manager 行”
sed -n '9,10p' USER_MODEL_OVERRIDE.md → TM（主 GO／备 DeepSeek＋codebuddy）vs supervisor（主 FREE／备 GO／Runtime 空）——完全不同

# ⑦ P1-6 实锤：已测 vs 待测同文件并存
rg -n "待真测|待测后定|待用户另批" USER_MODEL_OVERRIDE.md → :9/:11/:25/:27（4 处）
rg -n "rc.?0 pong|3/3 PASS|2/2 PASS" docs/qa/BUGS-2026-09-11-override主备.md → 补测 6 项＋B 单发 pong＋GO 3/3＋FREE 2/2（已测证据）

# ⑧ P1-7 实锤：Contract 本体缺失
rg --files | rg -i "BRIDGE.*CONTRACT|CONTRACT.*BRIDGE" → 无文件
rg -n "V2.1_BRIDGE_INTEGRATION_CONTRACT" -g '!治理审查报告/*' . → 仅 USER_MODEL_OVERRIDE.md:26（自述依据）与 BUGS:32（亲证不在包内）
```

## 7. 附：核验矩阵（抽查 12 项）

| 断言 | 现状 | 结论 |
|---|---|---|
| supervisor 断言 exit 码 | 好文件 exit 0 | 通过 |
| 升级口径唯一＋封顶停线 | 累计打回 2 次＋senior 停线找人 | 通过 |
| 三类例外＋跳步＋P0 真空 | AGENTS＋编排者对齐 | 通过 |
| L26 禁令 vs L9/L11 | 同一 ID 又主用又禁造 | P1-1 |
| FREE 触发器前缀 | `opencode-free/` 零命中 | P1-2 |
| 账本分发态 | 3 行 чужой 实绩＋伪陈述 | P1-3 |
| 更新说明准确性 | “只加缓存五条”失实 | P1-4 |
| supervisor 模型行 | 跟 TM 行 vs 独立行 | P1-5 |
| B 通道待测标注 | 已测 PASS 但表内待命 | P1-6 |
| Bridge Contract 可验证 | 本体不在包内 | P1-7 |
| HANDOFF 字眼清完 | FREE 恢复字样仍在 override | P2-1 |
| sop hygiene | Clash 交接随包 | P2-3 |

*目标/剩 P0/下一步：目标=2.1 分发版现势全面审查落盘；剩 P0=0，剩 P1=7（§2），剩 P2=10（§3）；下一步=开发者按 §5 修 P1-1→P1-7，其中 P1-1（禁令作用域）、P1-5（supervisor 跟谁）、P1-7（Contract 去留）需用户各拍一个选项，P1-3 在冻结分发时执行。*
