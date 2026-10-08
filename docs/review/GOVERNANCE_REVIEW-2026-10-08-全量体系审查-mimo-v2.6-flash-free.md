# GOVERNANCE_REVIEW｜2026-10-08 全量体系审查（修复后复审）

- **审查模型**：`opencode/mimo-v2.6-flash-free`（opencode 通道）
- **审查日期**：2026-10-08
- **审查对象**：ORCA V2.1 治理模板（分发版）母版仓现势，含两包与 34 个老项目旁证
- **基线**：`docs/review/GOVERNANCE_REVIEW-2026-10-08-全量体系审查-ark-code-latest.md`（`FAIL_WITH_FIXES`，3×P0 / 7×P1 / 10×P2）；修复提交 `337ab8b`（2026-10-08 19:35）
- **审查口径**：按根 `agent.md`「项目审查工作约定」一次性交付完整结论

---

## 一、审查结论

**结论：FAIL（不建议通过）**

前一轮 3×P0 全部修复且**实跑验证通过**；7×P1 中 P1-2／P1-4(概览)／P1-6 已修并验证，P1-5／P1-7 未修。但 **P1-3 的修复本身引入了一个新的 P0 结构矛盾**，且 2026-10-08 新增的唯一机器校验点（`APP-BASELINE-MISSING`）经负例实测**近乎空转**。两者都属于「体系写了、门槛卡不住」的典型。

| 维度 | 本轮判定 |
|---|---|
| 前后矛盾 / 不一致 | **FAIL**：2×P0（矩阵 schema vs 角色卡门禁；APP 基线硬要求 vs WARN 软门）＋ 7×P1 |
| 预期能否落实（卡不卡得住门槛） | **FAIL**：APP 基线六类硬要求负例全绿；Readiness Gate／关键 AC 集合非空**无任何机器校验点** |
| 派工账本 / 编排者账本复盘 | **PASS with issues**：账本 schema、白名单、tm-qualification 17/17 正常；但 README 铺包后第一步校验必失败、母版收工门禁恒不通过 |
| 其他漏洞 | 8×P2 沿用未修 ＋ 4×P2 新增 |
| `ORCA治理体系说明.md` 更新情况 | **PARTIAL**：10-08 已改 K1/K2/HANDOFF 节号，但 sop 表、check-ledger 描述、标题日期三处漏更新，且新鲜度关键词清单盖不住漏项 |

**门禁实跑（全部在母版根执行）**

```
bash scripts/check-sync.sh            → SYNC-OK (exit 0)   AC-MATRIX: 2/33 落盘，缺失 31
bash scripts/check-channel-preflight.sh → CHANNEL-OK (exit 0)  7/7 模型在目录
node scripts/model/tm-qualification.test.mjs → ALL PASS pass=17 fail=0
node scripts/model/check-ledger.mjs docs/model → exit 1（_example 行未删）
bash scripts/detect-client.sh          → client=Orca subagent=yes mode=window_subagent
```

---

## 二、按优先级排序的问题

### 前轮修复验证（先说做对的）

| 项 | 验证结果 |
|---|---|
| P0-1 planner 沙箱口径互斥 | ✅ `AGENTS.md:45` 已统一为「已加 `-s danger-full-access`，解禁失效才退回 stdout」；`USER_MODEL_OVERRIDE.md:8,26,33` 同步；全仓无「禁给 planner 加」残留 |
| P0-2 supervisor DISPATCH 校验块死代码 | ✅ 两内嵌 Python 块实跑 exit 0 |
| P0-3 product-reviewer 卡写「并行」 | ✅ `docs/roles/product-reviewer.md:5` 已改「A、B 必须串行，禁并发」并带实测教训 |
| P1-3 两套验收矩阵并存 | ✅ `docs/qa/BUGS.template.md:10-11` 旧 11 列与 `人工判定/未测/DEGRADED` 明确废止；`docs/roles/qa.md:19` 指向新落盘位。**但引出新 P0-A** |
| P1-4(概览侧) / P1-2 | ✅ `ORCA治理体系说明.md:115` 改「现至 §71」；`docs/roles/planner.md`／`senior-expert.md` 去掉硬编码 `gpt-5.6-sol` |
| P1-6 两包 README.en.md 死链 | ✅ `check-sync.sh:61-72` 已纳入比对（`README.en.md: 0`）；两包根均有该文件 |
| P2-3 override 表 planner 命令缺标志 | ✅ 已补 |

---

### P0｜阻断（必须本轮解决）

#### P0-A｜7 列 AC 矩阵**承载不了** qa/supervisor 门禁要求的「控件三件」，Phase2 放行规则与唯一落盘位 schema 结构性冲突

**证据**

- 唯一落盘位模板 `docs/qa/产品验收追踪矩阵.template.md:10` 列头 =
  `| AC | 用户故事 | 可测行为 | 优先级 | 验证方式 | 证据（路径/命令/截图） | 状态 |`（7 列，**无控件/预期变化/实际操作列**）
- `docs/roles/qa.md:18`：「（矩阵里须**逐个列出**控件名称、预期变化、实际操作与结果，只写"点了主要按钮"不算）」
- `docs/roles/supervisor.md:52`：「矩阵是否**逐个列出**了关键任务的可见操作控件名称、预期变化、实际操作与结果并有对应界面证据（**有控件漏列即打回**）；矩阵缺失、关键 AC 标**"未测"**、或核心按钮失效未修 → 打回」
  - 同句仍引用**已废止**的 `未测` 状态（`BUGS.template.md:11` 已废止，新枚举为 `OPEN/PASS/FAIL/BLOCKED`）
- 三套 schema 并存（无任何脚本校验列头）：

| 文件 | 列数 | 列头 |
|---|---|---|
| `docs/qa/产品验收追踪矩阵.template.md` | 7 | AC／用户故事／可测行为／优先级／验证方式／证据／状态 |
| `041-ing-nightrec/docs/qa/产品验收追踪矩阵.md`（44 条 AC，P1-3 理由里引为「唯一真实实例」） | 4 | AC／用户故事／行为／状态（**无证据列**） |
| `045-ing-凯格尔训练/docs/qa/产品验收追踪矩阵.md`（34 条 AC） | 6 | AC／关键／可测行为／验证方式／证据／状态（**无优先级列**） |

**影响**

1. supervisor 抽查第 7 条对**任何**现有矩阵都满足「有控件漏列即打回」→ Phase2 主链无法放行；
2. 或监督者只能自废该条规则，门禁形同虚设；
3. 前轮把旧 11 列废止时，**没有把「控件三件」的落点迁到新 schema**，qa.md/supervisor.md 两条要求悬空。

**修订建议**：见「待拍板 A」（三选一，A1 建议）。

---

#### P0-B｜APP 基础能力「六类必须进关键 AC 集合」的机器门**实测近乎空转**

**证据**

- `AGENTS.md:6`④：「主题三态／中英可用／回退／SYSTEM 跟随／持久化／切换不丢状态**六类必须进关键 AC 集合**，缺任一类**不得进 Human Review**」
- `docs/pm/PRODUCT_PLAN.template.md:22`「缺任一条不得进 Human Review」；`:68` 同款硬约束
- `scripts/model/check-ledger.mjs:144-151` 实现：

```js
if (!hasDecl) { if (c.isSrc) fails.push(...APP-BASELINE-MISSING...); else warns.push(...); continue; }
const missing = need.filter(([, re]) => !re.test(text)).map(([n]) => n);
if (missing.length) warns.push(`${c.label}: WARN APP 基线声明已填，但未检出：${missing.join("、")}（关键 AC 无法覆盖）`);
```

- **负例实测**（母版脚本、临时项目）：

| 用例 | 内容 | 结果 |
|---|---|---|
| A | `PRODUCT_PLAN.template.md` 原样改名入库＋HANDOFF 指为真源：**声明字段全空、关键 AC 集合空** | `LEDGER-OK` **exit 0** |
| B | 声明节在，但六类关键字全部替换掉 | `LEDGER-OK (含 WARN)` **exit 0** |
| C | 连「APP 基础能力声明」字符串都没有 | `APP-BASELINE-MISSING` exit 1 ✅ |
| 真实项目 `037` | 真源缺声明 | exit 1 ✅ |
| 真实项目 `041`／`040` | — | `LEDGER-OK (含 WARN)` exit 0 |

**三重失效**

1. **模板天然通过**：`PRODUCT_PLAN.template.md` 原文自带 `LIGHT`／`SYSTEM`／`zh-CN`／`回退`／`持久`／`不丢` 六个关键字，从模板改写的计划无论填没填都命中 `need` 全匹配；
2. **只 WARN 不 FAIL**：六类缺失仅 `warns`，而 `docs/prompts/迁移整理提示词.md:23` 明写「WARN…**视为通过**」；
3. **根本不查「关键 AC 集合」**：`grep -rn "关键 AC\|PLAN_READINESS\|视觉与交互验收" scripts/` 对 `.mjs` 仅命中本函数的注释性文案——检查只 grep 声明段，**从不校验这六类是否真的标了 `关键：是` 进了集合**。

**影响**：2026-10-08 新增的唯一机器校验点拦不住任一真实漏项；`经验一句话.md` 当天那条「写进模板不等于会执行，得有机器校验点」的教训，在它自己写出的新机制上复现。Readiness Gate（≥90＋关键 AC 集合非空＋视觉交互标准非空可测）**目前零机器校验**，全靠 Planner/Reviewer 自觉。

**修订建议**：见「待拍板 B」（三选一，B1 建议）。

---

### P1｜重要

#### P1-1｜产品审查链未进「主开工提示词」，且 QA 落盘表仍只指向已废止的 BUGS 矩阵（前轮 P1-5 残留＋新发现）

- `docs/prompts/编排者提示词.md:14`：「三口令（用户入口，字面匹配）：`第一阶段，计划`／`第二阶段，开发`／`变更请求：……`」——**无 `第三阶段产品审查`**
- 同文件 `:15`：Phase1 链 `Planner→Research Reviewer→Planner→…` —— **无产品审查链**
- 同文件 `:23`：「QA→`docs/qa/`（照 `BUGS.template.md`）」 —— **无产品验收追踪矩阵落点**（前轮 P1-3 修了 qa/supervisor/AGENTS，唯独漏了这份主提示词）

**影响**：按 AGENTS 的缓存顺序，这是编排者真正读到的开工文本；第四口令靠它触发不到，AC 矩阵靠它建不出来（会直接触发 `AC-MATRIX-MISSING`）。**P1-5 的「编排者提示词补产品审查链」整条未修**（`grep -c "产品审查\|第三阶段" docs/prompts/编排者提示词.md` → `0`）。

#### P1-2｜README 铺包后**第一步校验必失败**，且「三本账本」描述与脚本实际不符

- `README.md:62`：`node <项目目录>/scripts/model/check-ledger.mjs   # 期望 LEDGER-OK`
  - 实测 `node scripts/model/check-ledger.mjs 新项目模板包/docs/model` → **exit 1**（`_example 行未删`）；母版 `docs/model` 同 exit 1
- `README.md:98`：「`model/check-ledger.mjs`：**三本账本**校验（`TASK-MODEL-LOG`／`DISPATCH-LOG`／`TASK-MANAGER-QUALIFICATION-EVENTS`）」
  - 脚本 `:2`「账本合法性校验（TASK-MODEL-LOG / DISPATCH-LOG）」、`:94/:97` 只查两本；`TASK-MANAGER-QUALIFICATION-EVENTS` 由 `tm-qualification.mjs` 校验
- `README.md:112`：「TASK 首个真实任务前、DISPATCH 首个真实派工前删示例行」——**与 `:62` 同文件自相矛盾**
- `docs/roles/task-manager.md:6`：「收工前必跑 `check-ledger`，**不过不许说完事**」→ 在母版与一切刚铺包的新项目上**恒不通过**

**影响**：新项目铺包第一步就吃假红；母版 TM 收工门禁自相打架。

#### P1-3｜老项目铺开链缺 AC 矩阵模板与 TM 资格校验脚本（前轮 P1-7 残留）

- `scripts/sync-old-projects.sh` 的 `FILES` 清单**无** `docs/qa/产品验收追踪矩阵.template.md`、**无** `scripts/model/tm-qualification.mjs`／`.test.mjs`（`grep -c tm-qualification` → **0**）
- 实测 `1.Active/` 下 34 个带 `AGENTS.md` 的项目：

| 文件 | 具备数 |
|---|---|
| `docs/qa/产品验收追踪矩阵.template.md` | **0 / 34** |
| `docs/qa/产品验收追踪矩阵.md`（实例） | 2 / 34 |
| `scripts/model/tm-qualification.mjs` | **7 / 34** |
| `docs/sop/app-theme-i18n.md` | 1 / 34 |

- `docs/prompts/迁移整理提示词.md:13` 的 sop 清单＝`docker、supabase、sqlite、android、webqa、decision-router`——**缺 `app-theme-i18n.md`／`background-services.md`／`android-machine-profile.md`**（前轮 P1-7 未修）

**影响**：AGENTS「Episode 记账…写后跑 `node scripts/model/tm-qualification.mjs` 校验，枚举非法即当场修」在 **27/34 项目无脚本可跑**；`check-sync` 的 `AC-MATRIX-MISSING` 巡检 31/33 缺失，而**唯一负责批量铺规则的脚本本身不补模板**——巡检会永远红。

#### P1-4｜HANDOFF 顶部现势与 §1 停在 10-03，重复节号未解（前轮 P1-4 残留）

- 顶部「更新」行最新＝`2026-10-03`；**无 2026-10-07／10-08 两轮的更新行**（§71／§72 已写进正文却没在顶部挂行）
- `## 1. 当前工作进展（**2026-10-03 小交接现势**…）`，其 §1-① 仍写「`BUGS.template` 增 **11 列产品验收追踪矩阵**」——该 11 列**已于 10-08 废止**，状态源自己陈述了被废止的现行事实
- `grep '^## '`：章节号 `2 / 34 / 35 / 36 / 37 / 38 / 49` **各出现两次**（前轮 P2-4 未修）

**影响**：HANDOFF 是读盘顺序第 4 位、全体系状态真源；现势失真会直接误导接续者与 supervisor。

#### P1-5｜`check-sync.sh` 未把 7 列矩阵模板与通道预检脚本纳入逐字节比对

- `scripts/check-sync.sh:31-41` 的 `docs/qa` 白名单只有 `docs/qa/BUGS.template.md`，**无 `产品验收追踪矩阵.template.md`**（该文件确实在两包里、当前 `cmp` 一致，纯属未纳管）
- 同样未纳管的还有 `scripts/check-channel-preflight.sh`（两包均存在，`cmp` 当前一致）

**影响**：前轮刚定为「AC 结论唯一落盘位」的模板，**不受「体系更新三件套」的同步门禁保护**——母版改了两包不跟不会报 `SYNC-FAIL`。

#### P1-6｜`ORCA治理体系说明.md` 三处漏更新，且新鲜度关键词清单盖不住（重点 5）

- `:110` 资料表「基础设施规范」行＝`docker/supabase/sqlite/android（＋android-machine-profile）/webqa/decision-router` —— **缺 `app-theme-i18n.md`、`background-services.md`**（`README.md:113` 亦缺 `background-services.md`）
- `:36`／`:112` 对 `check-ledger.mjs` 的描述＝「结构错=FAIL、写法不规范=WARN」——**未提 10-08 新增的 `APP-BASELINE-MISSING`**
- `:1` 标题日期仍 `2026-09-28`
- `scripts/check-sync.sh:77` 关键词清单＝`产品验收 关键 AC 首次发布 签收 不问不报 detect-client window_subagent channel_cli 半套最差 四类红线 ≤10 行 Task Manager Qualification 何时起 CHANNEL-OK 产品验收追踪矩阵 产品审查 APP 基础能力 app-theme-i18n` —— **无 `APP-BASELINE`、无 `background-services`**

**影响**：违反自设红线「漏更新概览＝体系更新未完成」——而**兜底的 `OVERVIEW-STALE` 检查本身检不出这三处漏项**，属于门禁盲区。

#### P1-7｜迁移登记检查对 `AC-MATRIX-MISSING` 的因果表述错误

- `docs/prompts/迁移整理提示词.md:13`：「**qa/ 下 产品验收追踪矩阵.template.md 必须取**，缺了…后续 `check-sync.sh` 会报 `AC-MATRIX-MISSING`」
- `scripts/check-sync.sh:91` 实际查的是**实例** `docs/qa/产品验收追踪矩阵.md`（＋ `:95` 查有没有 `AC-` 条目）——**取了模板并不会免除该报错**

**影响**：一条硬门禁步骤（5.7 前的取包判据）判据不准确，整理工可能据此误判已达标。

---

### P2｜其他漏洞

| ID | 问题 | 证据 | 状态 |
|---|---|---|---|
| P2-1 | `app-theme-i18n.md` §4 依赖未随包分发的 Design Pipeline 七颗 Skill／Human 2／Design Freeze | `docs/sop/app-theme-i18n.md:90-96,125`；`check-ledger.mjs:144` 文案「不进 Design Pipeline」 | 前轮未修 |
| P2-2 | supervisor 把 `note` 当必填，check-ledger 视可选 | `docs/roles/supervisor.md:30` `req={…,'note'}`（8 键） vs `check-ledger.mjs:98` 必需 7 键 | 前轮未修 |
| P2-5 | DISPATCH `runtime` 枚举含 `本窗口`，与表内「当前客户端窗口（自动探测）」不一致；示例行即用 `本窗口` | `AGENTS.md:75`；`docs/model/DISPATCH-LOG.jsonl` 示例行 | 前轮未修 |
| P2-6 | `check-sync.sh:65` 死引用 `AGENTS.md.tmpnorm`；`:56` 文件清单大量重复条目 | 行内可见 | 前轮未修 |
| P2-7 | 外部开发者提示词多余围栏，`:31` 起落入未闭合代码块 | `docs/prompts/外部开发者提示词.md:28-29`（两个连续 ` ``` `） | 前轮未修 |
| P2-8 | 归位表模板过薄（2 行表＋2 条） | `docs/templates/归位表.template.md` | 前轮未修 |
| P2-9 | `android-machine-profile.md`（多处「待复测」）随包分发，自称「只记录当前机器」却是分发件 | `docs/sop/android-machine-profile.md:1-10` | 前轮未修 |
| P2-10 | 根 `agent.md` 未跟踪；`README.md:92` 称其为「接续开工提示词快照」，实际内容是「项目审查工作约定」；`temp/agent.md` 才是真快照 | `git status`：`?? agent.md`；`head agent.md` | 前轮未修 |
| **P2-11** | `acceptance.json` 悬空引用 | `产品验收追踪矩阵.template.md:5`、`041-nightrec:3`；全仓无定义、无脚本生成（045 实例已自行改写为「本矩阵为唯一落盘位」） | **新增** |
| **P2-12** | 三套矩阵 schema（7/6/4 列）并存，无脚本校验列头 | 见 P0-A 表 | **新增** |
| **P2-13** | `README.en.md` 结构明显落后中文版：缺「怎么用：你的操作只有两件事」、根目录条目不全、docs map 无检查脚本一节、sop 行缺 `background-services.md` | `README.en.md:29-47` vs `README.md:57-120` | **新增** |
| **P2-14** | AC 巡检 31/33 缺失仅「只报不阻塞」，与红线「产品验收未落盘…不得报完工」之间无强制点 | `check-sync.sh:80-100` 注释自陈「只报不阻塞」 | **新增** |

---

## 三、待拍板事项（倾向·理由·风险）

> 回复方式：请回复 `A1、B1、C1、D1、E1、F1、G1`；如同意全部按建议项，可回复「**全1**」。每组第 1 项均为可选项。

### A｜P0-A：矩阵 schema 与角色卡门禁怎么对齐

1. **【建议】扩到 9 列**：在 7 列基础上加 `控件（逐个）`／`预期变化`／`实际操作与结果`（或合并为一列「控件与操作记录」）；同时把 `supervisor.md:52` 的「未测」改为 `OPEN`；对 `041`／`045` 两实例做一次机械列迁移。
   - 影响：Phase2 放行规则立刻可执行；两实例需一次机械迁移；qa 卡不用改。
2. 保留 7 列，把「控件三件」下移到 `BUGS` 过程证据表，supervisor 改为「凭 BUGS 控件记录＋矩阵状态联合判」。
   - 影响：矩阵保持轻；但「AC 结论唯一落盘位」变成两处联动，须同时改 qa/supervisor/BUGS 三处措辞，与 10-08 定的唯一性有张力。
3. 削弱 `qa.md:18`／`supervisor.md:52` 的控件要求。
   - 影响：**与 2026-10-07 实测教训（只验 `href` 存在不算验过）直接冲突，不建议。**

**风险（1）**：列变多后 QA 填表成本上升，可能诱发「只填状态不填控件」的应付写法——需要 supervisor 抽查第 7 条继续硬卡。

### B｜P0-B：APP 基线机器门要不要升 FAIL

1. **【建议】升 FAIL**：声明节缺失 ⇒ FAIL（现状保持）；六类任一未出现在**标 `关键：是` 的 AC 集合**内 ⇒ FAIL；关键字匹配范围限定到关键 AC 条目（不再 grep 整篇 Plan）。
   - 影响：真正卡住 Readiness；Planner 要么补满要么显式写覆盖；现有项目可能出现新增 FAIL 需补计划。
2. 保持 WARN，但把 `AGENTS.md:6`④ 与模板 `:22/:68` 的「不得进 Human Review」改成「以人工 Readiness 复核为准」。
   - 影响：口径一致，但把用户 2026-10-08 定位为**硬性 AC** 的要求降为软要求，**不建议**。
3. 折中：声明节缺失 FAIL（保持），六类缺失 FAIL 但允许在计划里写「本项目不适用＋理由」走豁免，豁免理由在 Readiness 时人工核。
   - 影响：给不适用场景留口，代价是多一个人工判定点。

**风险（1）**：`强特征/否定表述` 的判定启发式（`check-ledger.mjs:140-142`）在别的项目可能误判，升 FAIL 会把误判变成硬阻塞——建议升 FAIL 时同步补一组正/负例进 `tm-qualification` 式的自测。

### C｜P1-1：编排者提示词补第四口令与矩阵落盘

1. **【建议】补**：`三口令`→`四口令`（加 `第三阶段产品审查`，注明「口令字面不代表新增 Phase」）；Phase1 链补一句产品审查链（串行、互不可见、维度白名单）；落盘表 QA 行改为「过程证据→`BUGS.template.md`；AC 结论→`docs/qa/产品验收追踪矩阵.md`」。
   - 影响：主入口与 AGENTS 对齐；`check-sync` 概览关键词无需变动（已含「产品审查」「产品验收追踪矩阵」）。
2. 不改提示词，只在 AGENTS 加「主提示词须随 AGENTS 同步更新」的检查项。
   - 影响：本轮不补，第四口令与 AC 落盘的触发缺口仍在。

**风险（1）**：提示词正文变长会略微增加每轮 prefix 成本——属可接受。

### D｜P1-2：README 校验步骤与 check-ledger 覆盖范围

1. **【建议】** `README.md:62` 改为「先删 `docs/model/*` 的 `_example` 行，再跑校验，期望 `LEDGER-OK`」；`:98` 改为「两本账（TASK/DISPATCH）；`EVENTS` 由 `tm-qualification.mjs` 校验」；母版/分发源自检提供 `--allow-example` 开关（或识别 `_example` 而非 FAIL）。
   - 影响：新项目第一步不再假红；母版 TM 收工门禁可通过。
2. 只改 README 文案，不给脚本加开关。
   - 影响：`task-manager.md:6` 的收工门禁在母版与新项目上**仍恒不通过**。

**风险（1）**：加 `--allow-example` 会削弱「示例行未删」的强制力——需在输出里保留显著提示，且真实项目路径**不得**使用该开关。

### E｜P1-3：老项目铺开链（跨 34 仓，需你单独授权）

1. **【建议】** 只改脚本与提示词：把 `docs/qa/产品验收追踪矩阵.template.md`、`scripts/model/tm-qualification.mjs`、`scripts/model/tm-qualification.test.mjs` 补进 `sync-old-projects.sh` 的 `FILES`；`迁移整理提示词.md:13` sop 清单补 `app-theme-i18n.md`／`background-services.md`／`android-machine-profile.md` 并改正 AC-MATRIX 因果表述；跑 `--dry-run` 演练后**停下等授权**再实跑。
   - 影响：本轮**零跨仓写入**；授权后一次补齐 34 仓。
2. 不动脚本，交各项目按需手动补。
   - 影响：`AC-MATRIX-MISSING` 将长期停在 31/33，`tm-qualification` 缺脚本的 27 仓无法执行 Episode 校验。

**风险（1）**：实跑会触碰 31+ 个仓的文件与 AGENTS 区块注入（虽有备份铁律）——因此本轮**只改母版脚本、不执行实跑**。

### F｜P1-4／P1-6：HANDOFF 与概览收口

1. **【建议】一次做完**：HANDOFF 顶部补 2026-10-07／10-08 两行更新、§1 顶部「11 列」改为历史注记并刷新 §1 标题日期、重复节号用 `§X(2)` 标注（**不重排**，维持「旧号冻结」）；概览补 sop 表两文件、`check-ledger` 描述补 `APP-BASELINE-MISSING`、标题日期更新到 2026-10-08；`check-sync.sh:77` 关键词加 `APP-BASELINE`、`background-services`。
   - 影响：三件套口径一致，`OVERVIEW-STALE` 能兜住下一次漏更新。
2. 只改概览，HANDOFF 留给 neat-freak 收尾派时一并处理。
   - 影响：HANDOFF 作为状态真源的失真会多留一段时间。

**风险（1）**：无跨仓影响；纯文本改动，`SYNC-OK` 可即刻复验。

### G｜P2 是否本轮一起清

1. **【建议】** 本轮清 **P2-1／2／5／6／7／10／11／12**（纯文本与脚本，低风险），P2-8／9／13／14 另议。
   - 影响：P2-7 的未闭合代码围栏、P2-6 的死引用、P2-11 的悬空引用、P2-12 的三套 schema 都是「看得见的脏」，留着会持续误导后续审查。
2. 全部留到下一轮。
   - 影响：本轮结论更干净，但遗留项数量不降。

**说明（各组共有）**：本轮**不执行任何 `git commit`／`git push`**（红线：无明确指令一律不做）；A、B 两项若不拍板，P0 未清则整轮不能收工；E 组第 1 项的「改脚本」与「实跑跨仓」是两件事，即使选 1 也只做前者。

---

## 四、执行提示词（可直接转送开发者／负责智能体）

```text
【ORCA 治理模板｜2026-10-08 全量体系审查整改】

你是本仓库的整改执行者。先读根 `agent.md`（项目审查工作约定）、`AGENTS.md`、
`docs/review/GOVERNANCE_REVIEW-2026-10-08-全量体系审查-mimo-v2.6-flash-free.md`
（本任务的唯一问题清单与拍板依据），再按下面顺序改。禁止顺手重构、禁止改业务无关文件、
禁止 `git commit`/`git push`（无明确指令一律不做）。

一、必做（P0，无争议项）
1. P0-A 矩阵 schema：
   - `docs/qa/产品验收追踪矩阵.template.md` 表头从 7 列扩为 9 列，
     新增 `控件（逐个可见操作控件）`、`预期变化`、`实际操作与结果` 三列（放在「证据」列之前），
     并在模板「规则」节补一条：「关键任务涉及的每个可见操作控件必须逐行落进前三列，
     只写『点了主要按钮』不算」。
   - `docs/roles/supervisor.md:52` 把「关键 AC 标"未测"」改为「关键 AC 标 `OPEN` 以外的
     无效状态（如已废止的 `未测`／`人工判定`／`DEGRADED`）」，其余控件要求与新 schema 对齐。
   - `docs/roles/qa.md:18` 与 `:22` 引用「矩阵须逐个列出控件名称、预期变化、实际操作与结果」
     的措辞保持不变（新 schema 已能承载），仅在 `:19` 的「7 列」字样改为「9 列」。
   - 不改两个真实项目实例（041/045）的文件——它们不在本仓，本轮只改模板与角色卡；
     在报告的「待执行」里列明「两实例需列迁移」交用户决定。
2. P0-B APP 基线机器门（按拍板 B 的结果执行，若未拍板则先按 B1 实现并标注「待确认」）：
   - `scripts/model/check-ledger.mjs` 的 `checkAppBaseline()`：
     a) `hasDecl` 为 false ⇒ 维持 FAIL；
     b) 六类（主题三态/SYSTEM 默认/中英双语/回退 zh-CN/设置持久化/切换不丢状态）
        改为**在「关键 AC 集合」内匹配**——解析 Plan 中标 `关键：是` 的 AC 条目文本，
        逐类匹配；任一缺失 ⇒ `fails.push(...)`（exit 1），不再 `warns`；
     c) 关键字匹配前先剔除模板教学文案（形如 `<...>` 占位、`（默认...）`说明括号），
        避免「从模板改写就天然通过」；
     d) 同时补：`关键 AC 集合` 清单为空 ⇒ FAIL（对应 AGENTS「清单为空即计划缺项」）。
   - 在 `scripts/model/` 下新增最小自测（可并入 `tm-qualification.test.mjs` 风格的独立 test）：
     正例（六类全在关键 AC）exit 0；负例 A（模板原样）exit 1；负例 B（声明在、六类缺）exit 1。
     跑通后把用例写进 `经验一句话.md` 一行。

二、必做（P1）
3. P1-1 `docs/prompts/编排者提示词.md`：
   - `:14` 「三口令」→「四口令」，补 `第三阶段产品审查`，并注明
     「『第三阶段』仅为口令字面，不代表新增 Phase」；
   - `:15` Phase1 链末尾补一句：「Phase1 末尾、Develop Gate 前按 AGENTS『产品审查链』执行
     （planner 组织、A/B 串行、互不可见、维度白名单＝体验/交互流程/功能，产出 PRODUCT_REVIEW）」；
   - `:23` QA 行改为「过程证据→ docs/qa/（照 BUGS.template.md）；
     **AC 结论→ docs/qa/产品验收追踪矩阵.md（照同名 .template.md）**」。
4. P1-2 `README.md`：`:62` 改为「先删 docs/model/* 的 `_example` 行，再跑校验，期望 LEDGER-OK」；
   `:98` 改为「两本账（TASK-MODEL-LOG／DISPATCH-LOG）；TASK-MANAGER-QUALIFICATION-EVENTS
   由 tm-qualification.mjs 校验」。`scripts/model/check-ledger.mjs` 增加 `--allow-example`
   开关：带此开关时示例行降级为提示、不 FAIL，输出 `LEDGER-OK (含示例行)`；
   默认（不带开关）行为不变。`docs/roles/task-manager.md:6` 补注「分发源自检用 --allow-example」。
5. P1-3 `scripts/sync-old-projects.sh` 的 `FILES` 补三行：
   `docs/qa/产品验收追踪矩阵.template.md`、`scripts/model/tm-qualification.mjs`、
   `scripts/model/tm-qualification.test.mjs`；`docs/prompts/迁移整理提示词.md:13` 的 sop 清单补
   `app-theme-i18n.md`、`background-services.md`、`android-machine-profile.md`，并把
   「取了模板就不会报 AC-MATRIX-MISSING」的表述改为
   「check-sync 查的是**实例** `产品验收追踪矩阵.md` 是否有 AC 条目，模板在位不免除该报错」。
   **改完只跑 `bash scripts/sync-old-projects.sh --dry-run` 汇报数字，禁止实跑跨仓落盘。**
6. P1-5 `scripts/check-sync.sh`：在 `:31-41` 的比对清单里补
   `docs/qa/产品验收追踪矩阵.template.md` 与 `scripts/check-channel-preflight.sh`。
7. P1-6 `ORCA治理体系说明.md`：`:110` sop 行补 `app-theme-i18n.md`、`background-services.md`；
   `:36` 与 `:112` 的 check-ledger 描述补「＋APP-BASELINE-MISSING（声明/关键 AC 缺项＝FAIL）」；
   `:1` 标题日期改 2026-10-08。`README.md:113` sop 清单补 `background-services.md`。
   `scripts/check-sync.sh:77` 关键词清单补 `APP-BASELINE`、`background-services`。
8. P1-4 `docs/handoff/HANDOFF.md`：顶部「更新」行补两条（2026-10-07 体系更新、
   2026-10-08 全量审查整改两轮）；`## 1.` 标题日期刷新，其 §1-① 的
   「BUGS.template 增 11 列产品验收追踪矩阵」改为历史注记
   （「当时增 11 列；2026-10-08 已废止，现为 docs/qa/产品验收追踪矩阵.md 9 列」）；
   重复章节号 2/34/35/36/37/38/49 各第二处追加 `(2)` 标注，**不重排不改号**。

三、选做（P2，按拍板 G）
9. P2-6 清 `check-sync.sh:65` 的 `AGENTS.md.tmpnorm` 死引用与 `:56` 重复文件清单；
   P2-7 删 `docs/prompts/外部开发者提示词.md:29` 多余的 ```；
   P2-2 `docs/roles/supervisor.md:30` 的 `req` 去掉 `note`（改可选，与 check-ledger 一致）；
   P2-5 `AGENTS.md:75` runtime 枚举统一为表内取值「当前客户端窗口（自动探测）」，
   并同步 `docs/model/DISPATCH-LOG.jsonl` 示例行；
   P2-11 删 `docs/qa/产品验收追踪矩阵.template.md:5` 的 `acceptance.json` 悬空引用
   （改为「本矩阵即唯一落盘位」，与 045 实例口径一致）；
   P2-1 `docs/sop/app-theme-i18n.md` 的 Design Pipeline 依赖处加注
   「以下阶段 Skill 属外部可选依赖，不随本模板包分发；随包可用口径＝PRODUCT_PLAN 声明＋关键 AC」；
   P2-10 把根 `agent.md` 重命名为能表达其真实内容的名字（如 `审查工作约定.md`），
   或把 `README.md:92` 的描述改为实际内容，二者取其一，`temp/agent.md` 保持不动。

四、验收标准（缺一条不算完成）
- `bash scripts/check-sync.sh` → `SYNC-OK`（exit 0），且新增的 `产品验收追踪矩阵.template.md`
  比对行生效（人为改一处应能复现 `DIFF`，验完还原）。
- `bash scripts/check-channel-preflight.sh` → `CHANNEL-OK`（exit 0）。
- `node scripts/model/tm-qualification.test.mjs` → 全 PASS。
- `node scripts/model/check-ledger.mjs docs/model --allow-example` → exit 0；
  不带开关 → exit 1（行为未被削弱）。
- P0-B 三用例（正例/模板原样/声明在但六类缺）全部符合预期 exit code。
- `grep -n "第三阶段产品审查" docs/prompts/编排者提示词.md` 有命中；
  `grep -n "产品验收追踪矩阵" docs/prompts/编排者提示词.md` 有命中。
- `grep -n "app-theme-i18n\|background-services" ORCA治理体系说明.md` 命中两处以上。
- `grep -n "APP-BASELINE" scripts/check-sync.sh` 有命中（关键词清单内）。
- `bash scripts/sync-old-projects.sh --dry-run` 输出的 FILES 计数比改前多 3。
- 不产生任何跨仓写入、不产生 `git commit`/`git push`、不动 `1.Active/` 下任何项目。

五、交工格式
1. 一句话结论（PASS / FAIL＋原因）；
2. 逐条改动清单（文件:行 → 改了什么）；
3. 上述每条验收命令的真实输出；
4. 遗留项只列「卡住本次目标」的，其余写进 `docs/handoff/HANDOFF.md` 一行。
```
