# ORCA V2.1 治理体系全面审查报告（冲突/矛盾/卡点/优化）

- 审查对象：`2026-09-09 丨 MAC 丨 ORCA V2.1 治理模板 丨 正式版`（`GOVERNANCE_VERSION=2.1`）
- 基线对照：本包内全部根文件（AGENTS/编排者/外部/迁移/override/经验/重塑说明/更新说明/归位表）＋ `docs/` 全量（roles×10、pm/review/qa/handoff 模板、HANDOFF 实例、账本示例行）＋ `治理审查报告/ORCA-V2.1-治理审查报告-2026-09-09.md`（上轮）
- 审查日期：2026-09-10｜方式：全量重读＋逐项交叉核对＋关键命令实测（见 §6）
- 结论先行：**本轮 P0=0（无照做必错），P1=7（特定条件下必错或执行分支死锁，需修后再冻结分发），P2=10（脏数据/口径差/可优化，不拦分发）**。上轮报告 §5 声称的修复基本属实（12 项中 11 项确认已修，见 §1），但有 **1 项 P1 漏网（迁移 scripts）＋本次新挖 6 项 P1**。好消息：2.1 相对 2.0 的增量（缓存五条＋续 session＋VERSION bump）方向正确，问题集中在**新机制的可执行性**（谁执行、用什么命令、裁决基准是哪份文件）而非方向。

严重度：P0=照做必错；P1=特定条件必错/死锁/打回循环；P2=脏数据/stale/效率优化。

---

## 1. 上轮报告核验（2026-09-09 报告 §5 声称 → 本次实测）

| 上轮修复项 | 本次结论 | 证据 |
|---|---|---|
| supervisor 逐行校验 | ✅ 已修 | `docs/roles/supervisor.md:4` 已是逐行命令，单行/示例行实测通过（§6） |
| 迁移 GOVERNANCE=2.1 | ✅ 已修 | `迁移整理提示词.md:13` 已是 2.1 |
| 续 session 升级例外＋resume 主体 | ✅ 已修 | `AGENTS.md:28` 已加"基础设施保持＋升级开新链" |
| HANDOFF §4 去"全修完" | ⚠️ 半修 | `docs/handoff/HANDOFF.md:38` 仍写"均已修"，见本报告 P2-2 |
| 重塑说明/外部/HANDOFF stale | ✅ 已修 | 外部标题 2.1、通配保护、HANDOFF roles 注解均已改 |
| BUGS Evidence 列 | ✅ 已修 | `docs/qa/BUGS.template.md:3` 已是"备注（截图/日志一句）" |
| builder commit 半句 | ✅ 已修 | `docs/roles/builder.md:7` 已补 |
| medium 档执行位 | ✅ 已修 | `USER_MODEL_OVERRIDE.md:22` 明确"档位写派工口头指令" |
| 读盘顺序 | ✅ 已修 | AGENTS 6 步与编排者一致 |
| 账本 чужой 行 | ✅ 已修 | 示例行 `_example+note`＋AGENTS 注明删除 |
| 迁移 scripts | ❌ **漏网未修** | `迁移整理提示词.md:8` 仍有"该进 scripts 的进 scripts"，见 P1-1 |
| 缓存术语（99%/compaction/关 session 贵） | ⚠️ 半修 | `compaction` 无操作定义仍在，见 P1-5；"不追 99%"仍在经验行 |

---

## 2. P1：冲突/矛盾/卡点（7 项，按修的顺序排）

### P1-1 迁移整理仍指令整理工"该进 scripts 的进 scripts"（上轮漏网，实锤）

- 位置：`迁移整理提示词.md:8`
- 矛盾：2.x 已删 scripts（HANDOFF 实例 `:11` 亲证"scripts/tests/registries…全删"），模板包内无此目录。整理工照做即新建体系外目录，后续归位表、治理引用全部对不上。
- 修复（1 行）：改为"该进 docs 的进 docs；**2.x 无 scripts，不新建**，业务原地不动"。

### P1-2 升级触发三处措辞互斥：连续 vs 累计 vs 连挂，失败 vs 打回

- 位置：`AGENTS.md:36`（"同一任务**连续失败** 2 次"）vs `:37`（"同一 Task **累计**被打回 2 次"）vs `编排者提示词.md:22`＋`docs/roles/senior-expert.md:3`（"**连挂** 2 次"）
- 矛盾：中间 pass 一次算不算中断？"失败"（谁判：QA 挂算吗）vs"打回"（仅 supervisor 复检算吗）？三种场景三种答案：builder→QA 挂→修好→又挂，按"连续"不升、按"累计"升、按"连挂"看不懂。升级是最贵的决策，口径必须唯一。
- 修复（三选一，推荐 A）：A）全体系统一为"**同一 Task 累计被 supervisor 打回 2 次即升**（连续/连挂/失败字样全删，QA 挂不算，只算 supervisor 打回）"，rework=打回次数；B）若 QA 挂也算，改计数口径为"supervisor 打回＋QA 挂合计 2 次"，并写明谁计数。另 `senior-expert.md:3` 与编排者 `:22` 的"连挂"同步改。

### P1-3 升级封顶缺失：senior 再被打回 2 次怎么办（死路）

- 位置：`AGENTS.md:38`（"只升当次…升级后延续计数不归零"）＋全包无更高角色（AGENTS 明确"不再新增"）
- 矛盾：计数不归零意味着 senior 也会被数到 2，按字面应"再升级"，但无处可升。实践中=无限打回循环烧额度，或编排者被迫"收工"违反红线。P0-hard 手动升同理： senior 搞不定 P0-hard，下一步没有定义。
- 修复（加 1–2 行，三选一需用户拍）：A）"senior 接手后不再计数升级，连续打回 2 次即停线找人（列阻塞＋要拍的板）"；B）"senior 打回 2 次转外部施工通道"；C）"允许二轮 planner 重拆"。推荐 A（停线找人符合单点对接）。

### P1-4 "不起终端"例外只在编排者提示词有，AGENTS 无 → 裁决基准分裂

- 位置：`编排者提示词.md:10`（"不含人肉调试/外部施工/迁移基线三类例外"）vs `AGENTS.md`（全文无此三类例外，"本窗口内派 subagent，全自动"）
- 矛盾：supervisor 按 AGENTS 复检（职责卡只认 AGENTS＋账本），编排者按提示词执行。编排者一开终端（迁移基线/人肉调试），supervisor 按字面即可打回 → 打回→重派→再开终端的死循环。治理基准与执行口径必须同页。
- 修复（二选一）：A）AGENTS 派工节补一句"三类例外（人肉调试/外部施工/迁移基线）可起终端，见编排者提示词"；B）删提示词例外，三类也走 subagent。推荐 A（迁移基线装依赖跑测试不开终端不现实）。

### P1-5 缓存"三不换＋贴结果即续"不可执行，compaction 无操作定义

- 位置：`AGENTS.md:52`（"一链之内不换 prompt/工具/skill"）、`编排者提示词.md:10`（"把上轮结果贴进下一派"即算"续上一个 session"）、`AGENTS.md:53`（"编排者做一次 compaction"）
- 矛盾 A：同链多角色（builder 写码→qa 跑测→neat 改 docs）天然需不同工具/skill，字面"不换"等于禁派多角色。B："贴结果重派"就是新派，不是续 session，两者写成一句话等于"新派即续"，session 身份无法追踪（HANDOFF 无 session 字段）。C：compaction 无命令、无触发阈值（多少 token 算"太长"）、opencode 侧能力未确认 —— 上轮 P2-8 原样残留。
- 修复（3 行）：①"不换"限定为"**不换派工基础设施与会话链**（角色/工具按任务换，prompt 模板不变）"；② 返工= "同链重派并附上轮结果摘要（HANDOFF 记上链 ID），真 resume 仅 codex/外部通道用"；③ compaction 改为可执行句："超约 100k token（编排者估）即写 HANDOFF 快照后开新链，旧链结论进 HANDOFF，阈值用户可改"。

### P1-6 跳步规则只在 AGENTS，编排者提示词缺失；跳 planner 后 P0 定义权真空

- 位置：`AGENTS.md:27` 有跳步，`编排者提示词.md:12` 阶段顺序无跳步；`docs/pm/PLAN.template.md:7`（"P0 由 planner 初定、TM 拍板"）
- 矛盾：编排者只读提示词即"每次全链派"（小修也派 planner＋product，白烧两派）；若它记得 AGENTS 而跳步，则 P0 无 planner 初定 —— TM 直接拍板全凭口头，无落盘，qa/product 的"P0 Blocking?"列（BUGS/PRODUCT_BACKLOG 模板）失去参照，打回无依据。
- 修复（2 行）：① 编排者 `:12` 补"单文件小修可跳 planner/product（AGENTS 跳步），跳了在 HANDOFF 记一句原因"；② 补"P0 真空规则：跳 planner 时 P0 由 TM 在派工口头里定一句并写进 HANDOFF 剩 P0"。

### P1-7 账本校验只验 JSON 语法，不验 schema；example 行删除无 owner；project 无定义

- 位置：`docs/roles/supervisor.md:4`（只跑 `json.loads` 逐行）、`AGENTS.md:43-45`、`docs/model/TASK-MODEL-LOG.jsonl:1`
- 实测（§6）：supervisor 命令对**缺键/错枚举/多余键**全部放行（只保证是 JSON）。即 builder 交 `{"task":"X"}` 也能过，落盘即脏账本，后续"拼起来统计"全污染。另：example 行"首个真实任务前删除"无责任人（builder? TM? 整理工?），`project` 取"当前项目名"无定义（目录名？HANDOFF Stage？），跨项目拼接 key 不稳定。
- 修复（3 行＋1 命令）：① supervisor 卡追加 schema 校验命令（实测可用，见 §6）：
  `python3 -c "import json,sys;req={'task','project','date','role','model','result','rework','escalated','escalation_reason','tokens','cost_cny'};[ (lambda o: (req<=set(o), o.get('result') in ('PASS','FAIL'), o.get('escalated') in ('YES','NO'), isinstance(o.get('rework'),int)))(json.loads(l)) for l in open(sys.argv[1]) if l.strip() and '\"_example\"' not in l]"`
  ② AGENTS 补"example 行由**迁移整理工/首个 TM**删除"＋"project=仓库根目录名（HANDOFF Stage ID 括号备注）"。

---

## 3. P2：口径差与优化（10 项，不拦分发，建议与 P1 同批修，每项 ≤2 行）

1. **HANDOFF 实例残留本机绝对路径＋历史项目指令**：`docs/handoff/HANDOFF.md:6`（`/Users/.../Developer/coding/...` 与现包路径 `Nutstore Files/...` 对不上，隐私＋stale）＋ `:24`（保单副本"开跑前必须先问"是对特定历史项目的指令，不应进模板）。修：路径改为"见分发包位置"或删；历史项目 §2.1–2.3 移入治理审查报告存档，实例只留结构。
2. **HANDOFF §4 自证"均已修"职责越界**：`:38` 替审查报告下结论。修：改为"修复状态见治理审查报告最新一份，本节只记本包变更（§5）"，删"均已修"。
3. **编排者临时角色枚举不全**：`编排者提示词.md:6` 只列"监督/开发/产品/QA/经验"，漏 planner/code-reviewer/neat-freak/senior。修：补全或改"等"字（"监督者、planner、开发…等都是你派的"）。
4. **账本初版交接表述不一**：builder 卡"贴给编排者" vs AGENTS"builder/senior 初版→supervisor 校验→TM 落盘"（senior 卡没写给谁）。修：两卡统一为"初版贴给**编排者转监督者校验**"。
5. **封存口径差**：AGENTS 红线"不改 V1.10" vs HANDOFF"V1.10/V2.0 封存"。修：AGENTS 改"不改 V1.10/V2.0 封存"。
6. **secrets 条款覆盖缺**：仅 AGENTS＋外部者有，builder/qa/senior（最可能碰 .env 的人）无。修：builder 卡补"key 写占位＋记 log，不贴真值"半句。
7. **PRODUCT_BACKLOG 无任务关联**：`docs/review/PRODUCT_BACKLOG.template.md` 仅 Item/Priority，无 Task/Stage 列，无法回链 P0。修：加 `Task` 列（CODE_REVIEW/BUGS 均有任务字段，独缺此表）。
8. **幽灵引用＋时序缺**：`experience-recorder.md:5` 的 `DEV_EXPERIENCE.template` 包内不存在；neat-freak"改 docs＋交接记一笔"与 TM 落盘 HANDOFF 的先后未定义（先派 neat 则 HANDOFF 收尾字段空，后派则需重写 HANDOFF）。修：删幽灵引用；HANDOFF.template"收尾记一笔"注明"neat 派完后 TM 补记，若已落盘则追加修订行"。
9. **override 表四处小债**：builder 到期列填"你定"（应填"无"或日期）；`product-reviewer` 备注"Luna转正后换"（Luna 全包仅此一处，无定义）；`codex/gpt-5.6-terra` vs `sol` 谁更强未说明（升级意义不可判断）；"池子（FREE/GPT_PRO/GO）"与模型前缀（codex//opencode-go//opencode-free/）映射未定义；"超限停"无执行机制。修：到期列规范＋Luna 加注或删＋补"terra/sol 强弱与升级方向"一句＋池名↔前缀映射表＋"超限停=编排者停派找人"。
10. **分发 hygiene**：`治理审查报告/` 新旧报告并存易混（本报告已用新日期文件名区分）；HANDOFF 实例"拷进新项目时清空 §1–2"靠人工记。修：分发前 HANDOFF.md 改名 `HANDOFF.example.md` 或清空 §1–2 只留结构；审查报告目录首行加"以日期最新为准"。

另两处**已确认非问题**（免得开发者白改）：外部者"读盘最小化"与缓存"统一顺序"作用域不同（前者=外部单 builder，后者=本窗口 subagent 链），不算冲突，但建议 AGENTS 缓存节加"（本窗口 subagent 链适用；外部施工见外部提示词）"半句；"computer-use 必（经验）vs 能用就用（迁移）"为强制程度差，统一为"有 UI 必目检，无 computer-use 条件时 curl＋截图替代并记账"即可。

---

## 4. 卡点与优化建议（给开发者的非缺陷项，4 条）

1. **HANDOFF 全读 token 浪费**：缓存要求每派读整个 HANDOFF 实例（含试点细节）。建议读盘顺序的 HANDOFF 限定"§剩 P0＋当前 Task＋未闭环＋下一步"四段，实例细节只在恢复时读。
2. **账本初版流程冗余**：builder 交初版时 result/rework/escalated 全未知，实际 TM 重写。建议初版只填 task/project/date/role/model＋files-changed，校验与判定后移。
3. **"轮"与"收尾"未定义**：心跳"每轮末"（每派？每阶段？）、"收尾派一次"（每 Stage？整项目？）多 Stage 项目会丢经验或重复派。建议定义"轮=每派次，阶段末=Stage 收尾派经验/neat"。
4. **外部 commit 二选一死锁**：外部者"分支或未提交按任务要求二选一"，任务没写即卡（且不许问用户之外的人）。建议默认"保持未提交＋log 贴 diff"，分支需任务明示。

---

## 5. 修复清单（开发者按序执行，约 20 行改动）

- [ ] P1-1：迁移 `:8` 删 scripts（1 行）
- [ ] P1-2：升级口径统一（AGENTS 36–37、编排者 22、senior 卡 3，共 3–4 行，需用户拍 A/B）
- [ ] P1-3：升级封顶停线规则（AGENTS 补 1–2 行，需用户拍 A/B/C）
- [ ] P1-4：AGENTS 补三类例外指回（1 行）
- [ ] P1-5：缓存三处改写（AGENTS 52–53、编排者 10，共 3 行）
- [ ] P1-6：编排者补跳步＋P0 真空规则（2 行）
- [ ] P1-7：supervisor 加 schema 命令＋AGENTS 补删除 owner 与 project 定义（3 行）
- [ ] P2-1～P2-10：批处理（每项 ≤2 行，HANDOFF 实例清理最大）
- [ ] 分发前：HANDOFF 实例改名/清空、确认本目录以最新日期报告为准

---

## 6. 附：实测证据（2026-09-10 本机复现）

```
# ① supervisor 逐行命令：示例行能过（语法层 OK）
python3 -c "import json,sys;[json.loads(l) for l in open(sys.argv[1]) if l.strip()]" docs/model/TASK-MODEL-LOG.jsonl
→ PER_LINE_SYNTAX_OK（但只证明是 JSON，见②）

# ② 同命令对坏 schema 全部放行（P1-7 实锤）
echo '{"task":"X"}' | python3 -c "import json,sys;[json.loads(l) for l in sys.stdin if l.strip()]"
→ 通过（缺 10 个键仍过）| echo '{"task":"X","result":"MAYBE"}' 同理通过（枚举错仍过）

# ③ 示例行 schema 比对（AGENTS 11 键基准）
keys= agnets基准11键全有 ＋ extra=['_example','note'] → 语法过、统计污染（首任务前未删即并入跨项目统计）

# ④ 文本实锤（rg 全包，治理审查报告目录除外）
"该进scripts的进scripts" → 迁移整理提示词.md:8 唯一命中 ｜ "连续失败"→AGENTS:36，"累计被打回"→AGENTS:37，"连挂"→编排者:22＋senior-expert.md:3 ｜ 三类例外仅编排者:10，AGENTS 零命中 ｜ DEV_EXPERIENCE 仅 experience-recorder.md:5（文件不存在） ｜ /Users/ 仅 HANDOFF.md:6 ｜ Luna 仅 override:14
```

## 7. 附：核验矩阵（抽查 10 项）

| 断言 | 2.1 现状 | 结论 |
|---|---|---|
| supervisor 双行账本 | 逐行过 | 通过 |
| 迁移 GOVERNANCE=2.1 | 是 2.1 | 通过 |
| 迁移 scripts | 仍指令进 scripts | P1-1 |
| 升级口径唯一 | 连续/累计/连挂三词 | P1-2 |
| 升级有封顶 | 无，计数不归零死路 | P1-3 |
| 不起终端基准一致 | 提示词有、AGENTS 无 | P1-4 |
| 缓存可执行 | 不换过宽/贴=续/compaction 无定义 | P1-5 |
| 跳步＋P0 真空 | 编排者缺跳步，真空无规则 | P1-6 |
| 账本 schema 校验 | 只验语法 | P1-7 |
| stale 大头已清 | 基本清完，剩 HANDOFF 实例路径 | P2-1 |

*目标/剩 P0/下一步：目标=2.1 全面审查落盘；剩 P0=0（本轮被审体系无 P0，剩 7 个 P1 待修）；下一步=开发者按 §5 修 P1-1→P1-7，其中 P1-2/P1-3 需用户各拍一个选项。*
