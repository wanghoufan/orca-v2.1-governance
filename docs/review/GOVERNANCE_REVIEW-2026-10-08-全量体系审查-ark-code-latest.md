# 治理体系审查报告｜ORCA V2.1 治理模板（分发版）

- 审查日期：2026-10-08
- 审查模型：`volcengine-plan/ark-code-latest`（opencode 通道）
- 审查对象：本仓库治理真源全量（AGENTS、USER_MODEL_OVERRIDE、ORCA治理体系说明、README 中英、docs/roles、docs/prompts、docs/pm|qa|review|handoff|model 模板、docs/sop、scripts/、两分发模板包）
- 审查方式：全文通读 ＋ 实跑机械门禁（check-sync / check-channel-preflight / check-ledger / detect-client / tm-qualification 测试 / supervisor 内嵌 Python 块）＋ 构造负例验证
- 结论：**FAIL_WITH_FIXES**。骨架（两阶段治理、账本、AC 制度、客户端无关派工口）总体可用，门禁脚本多数实跑通过；但存在 **3 项 P0（自相矛盾 / 机器门禁失效）**、**7 项 P1（口径冲突与落实缺口）**、**10 项 P2（优化/卫生）**，其中多项恰好落在最近两次体系变更（2026-10-07 产品审查链、2026-10-08 APP 基础能力）的收口处。

---

## 零、本次实跑证据（可复现）

| 命令 | 结果 |
|---|---|
| `bash scripts/check-sync.sh` | `SYNC-OK` exit 0（归一化后零差异；另报 31 个项目 `AC-MATRIX-MISSING`，属只报不阻塞） |
| `bash scripts/check-channel-preflight.sh` | `CHANNEL-OK` exit 0（7 个在用模型全 OK；codex 0.159.2 满足要求） |
| `node scripts/model/check-ledger.mjs docs/model` | exit 1，仅报两本账 `_example` 未删（母版设计如此） |
| `bash scripts/detect-client.sh` | `client=Orca subagent=yes mode=window_subagent` exit 0 |
| `node scripts/model/tm-qualification.test.mjs` | `ALL PASS pass=17 fail=0` |
| **`docs/roles/supervisor.md` 内嵌 DISPATCH 校验块（Python）** | **SyntaxError，整块无法运行**（见 P0-2） |
| 构造负例验证 check-ledger 新增 APP 基线检查 | 正例触发 `APP-BASELINE-MISSING`；后端项目「应用」误报已被防住（判定逻辑有效） |

---

## 一、P0｜阻断级（自相矛盾 / 机器门禁失效，必须改）

### P0-1｜planner 沙箱口径自相矛盾，同一文件内打架

- 证据：
  - `AGENTS.md:45`（Phase1 产品审查链）写「planner(codex) 默认沙箱**写不了文件**，汇总须让 codex 输出到 stdout 再落盘，**禁给 planner 加 `-s danger-full-access`——该解禁仅限 QA**」。
  - `AGENTS.md:46`（Phase2）写「codex 派工带 `-s danger-full-access`（**2026-10-07 用户令由『仅限 QA』放宽到 QA＋planner＋senior-expert**）」。
  - `USER_MODEL_OVERRIDE.md:8` planner 行已带该标志；`:33` 明写「planner 已按用户令加 `-s danger-full-access`，**可直接写盘，不再需要 stdout 绕行**」。
  - 但 `USER_MODEL_OVERRIDE.md:26`（双审派工表）planner 命令**又没有** `-s danger-full-access`；`ORCA治理体系说明.md:95` 仍写「planner 汇总走 stdout 落盘」；`经验一句话.md:31` 也写「汇总走 stdout 落盘」。
- 影响：同一条规则在 3 个文件、5 处给出互斥指令。TM 照 AGENTS Phase1 会把 planner 当只读（错误回退到 stdout），照 Phase2/override 才正确。属于把刚实测出的结论反向写回旧口径的典型「前后矛盾」。
- 建议：统一为「planner 带 `-s danger-full-access`，可直接写盘；stdout 仅作解禁失效时的兜底」。修订 `AGENTS.md:45`、`ORCA治理体系说明.md:95`、`USER_MODEL_OVERRIDE.md:26`（补标志）；`经验一句话.md:31` 属只追加历史，另加一条更正行而非改旧行。

### P0-2｜supervisor 的 DISPATCH 第二道校验块是死代码（Python SyntaxError）

- 证据：`docs/roles/supervisor.md:40`

  ```python
  if o.get('runtime') not in (...'—')  # 2026-10-05 补：...新增两值）: print(f'L{n}: runtime枚举错:',...); bad+=1
  ```

  行内 `#` 注释把 `: print(...)` 整段吃掉，`if` 语句既无冒号也无语句体。实跑 `python3` → `SyntaxError: invalid syntax`。
- 影响：supervisor「兼 DISPATCH 校验」这道机器门禁**根本无法执行**（每次都应报错退出）。与「体系要有可执行的第二道校验」的预期直接冲突。该缺陷其实已在草案自检中被识别（见 `temp/本轮完成情况转审查说明.md` §三「修复 supervisor.md:40 既有语法缺陷」），但**正式真源至今未修**——草案识别了、真源没落地。
- 建议：改为

  ```python
  RT = ('本窗口','当前客户端窗口（自动探测）','codebuddy','codex','opencode','Claude Code','—')
  if o.get('runtime') not in RT: print(f'L{n}: runtime枚举错:',o.get('runtime')); bad+=1
  ```

  修完用 `python3` 实跑一遍再入库；母版修后同步两包。

### P0-3｜product-reviewer 角色卡写「并行」，与硬规则「串行禁并发」冲突

- 证据：`docs/roles/product-reviewer.md:5` 写「用户口令『第三阶段产品审查』时，**与另一模型并行**承担独立审查 A 或 B」；而 `USER_MODEL_OVERRIDE.md:31`、`AGENTS.md:45` 均写「**串行禁并发（2026-10-07 实测，必守）**……并发会互相干扰，被抢的那个静默失败且 exit 0、零产出」。
- 影响：角色卡是执行者实际读的那一份；照卡执行会复现 2026-10-07 实测出的静默失败。属于刚踩过的坑又被写回矛盾口径。
- 建议：`product-reviewer.md:5` 改为「**串行**承担独立审查 A 或 B（A、B 必须串行，禁并发；由 planner 组织，任一审查位不得自行发起另一半）」。

---

## 二、P1｜高优先（口径冲突 / 落实缺口）

### P1-1｜「表内无备用列」与实际表结构矛盾

- 证据：`USER_MODEL_OVERRIDE.md:3` 表头为 6 列（角色｜模型｜执行通道｜**备用模型**｜**备用执行通道**｜调用方式）；而 `AGENTS.md:58`、`README.md:81`、`README.en.md:27` 均写「**表内无备用列**」。
- 影响：换模型/切备用时两套口径打架。历史沿革：曾按 T23「增加备用列」落地（HANDOFF §59），后来又在 AGENTS/README 写了「无备用列」，未回头改。
- 建议：二选一后全量对齐——要么删表内备用两列，要么把「表内无备用列」改为「备用列以本表为准」。

### P1-2｜角色卡硬编码过时模型 ID（且自称不复述 ID）

- 证据：`docs/roles/planner.md:6`、`docs/roles/senior-expert.md:4` 均写 `codex/gpt-5.6-sol`；而 `USER_MODEL_OVERRIDE.md`（T25）planner/senior-expert 已是 `codex/gpt-6.1-sol`，`gpt-5.6-sol` 已不在通道目录。其余卡（builder/qa/code-reviewer/…）都写「卡内不复述 ID」。
- 影响：照卡派工会拿到不存在的旧 ID → 直接 `not supported`。虽有「冲突以模型表为准」的免责句，仍属误导。
- 建议：两卡模型行改为「见 `USER_MODEL_OVERRIDE.md` 对应行，卡内不复述 ID」（去掉硬编码）。

### P1-3｜两套「产品验收追踪矩阵」并存、schema 与状态枚举冲突

- 证据：
  - `docs/qa/BUGS.template.md:13` 内嵌 **11 列**矩阵，状态枚举 `PASS/FAIL/DEGRADED/未测/人工判定`，并声明「本矩阵**独立成文件** `docs/qa/产品验收追踪矩阵.md`……本节只保留操作级记录」。
  - `docs/qa/产品验收追踪矩阵.template.md:10` 是**另一套 7 列**矩阵（AC/用户故事/可测行为/优先级/验证方式/证据/状态），状态枚举 `OPEN/PASS/FAIL/BLOCKED`，自称「**唯一落盘位**」。
- 影响：AGENTS/README/overview 只笼统说「产品验收追踪矩阵」，未指定唯一落盘位；`check-sync.sh` 只检 `docs/qa/产品验收追踪矩阵.md` 是否存在且有 `AC-` 行，不校列结构。落盘位、列、状态枚举三处二义 → QA / supervisor / 机器检查可能按不同 schema 判放行。
- 建议：明确「AC 级结论只落 `产品验收追踪矩阵.md`（沿用其中一套列与状态），BUGS 只放操作级记录」；两处状态枚举统一。或把独立矩阵设为唯一真源、BUGS 内改为指针。

### P1-4｜HANDOFF 未记 2026-10-07 / 10-08 两次体系变更，状态源失真

- 证据：HANDOFF 最后一节是 `## 70.`（2026-10-05）；`git log` 之后的 `67722f4`（2026-10-07 Episode 记账＋产品审查链）与 `d31aacb`（2026-10-08 APP 基础能力）**均无 HANDOFF 记录**；HANDOFF 顶部更新行停在 2026-10-03，§1 仍写「2026-10-03 小交接现势」。这违反自订「体系更新三件套……HANDOFF 记一行」。
- 另：`ORCA治理体系说明.md:115` 写 HANDOFF「现至 §60」，实际已到 §70。
- 建议：补 §71/§72 两节并刷新 §1-3；同时修正 overview 的节号。

### P1-5｜产品审查链未进「编排者开工提示词」，且口令命名自相矛盾

- 证据：`docs/prompts/编排者提示词.md` 全文只有「三口令」，无「第三阶段产品审查」、无产品审查链；只有 `AGENTS.md`、`ORCA治理体系说明.md`、`USER_MODEL_OVERRIDE.md`、迁移提示词 5.8 提到。而该提示词是「一句话开工」的主入口。
- 另：口令字面叫**「第三阶段**产品审查」，但 AGENTS/overview 反复声明「**两阶段**治理、固定 9+1+1、**不新增 Phase**」——「第三阶段」字面与「只有两阶段」冲突。
- 影响：新人照主提示词开工不知道有这条链；口令命名会让执行者误以为存在第三阶段。
- 建议：①在编排者提示词补一行产品审查链（位置、口令、串行、产出物）；②口令建议改为「产品审查」，或明确标注「名字里的『第三阶段』仅为口令字面，不代表新增 Phase」。

### P1-6｜分发包 README 英文链接是死链，且 README.en.md 无门禁、长期漂移

- 证据：`新项目模板包/README.md:3` 与 `老项目迁移模板包/README.md:3` 均链接 `[English](./README.en.md)`，但两包根目录**都没有 `README.en.md`**（`ls` 证实）；`README.md:87` 也把 `README.en.md` 列为本导航一部分。
- README.en.md 内容已落后：`:29` 仍写「Root directory (11 current items)」（中文版已删硬编码）；`:71` 仍列 `新项目模板包.zip／老项目迁移模板包.zip`（中文版已删「早已不产出的 .zip」句）；`:27` 仍写「the table has no backup column」；`:46` sop 清单缺 `app-theme-i18n.md`／`background-services.md`。
- 影响：分发件里有 404 链接；`check-sync.sh:43` 只比对 `README.md`，**不覆盖 `README.en.md`**，故英文导航无限漂移、无人拦。
- 建议：①两包补 `README.en.md`（或删掉英文链接）；②check-sync 增加 README.en.md 一致性检查；③同步 README.en.md 至中文版现势。

### P1-7｜老项目规则未随 10-07 / 10-08 更新（铺开链缺口）

- 证据：
  - `scripts/sync-old-projects.sh:16-17` `STAMP=2026-10-03`、`RULES_VERSION=2026-10-03-客户端无关`；FILES（`:23-62`）**不含** `docs/sop/app-theme-i18n.md`。
  - `docs/prompts/迁移整理提示词.md:24`（5.8）只核对「**2026-10-07** 新增机制」，不含 10-08 APP 基础能力；`:13` 第 0 步 sop 清单只列 docker/supabase/sqlite/android/webqa/decision-router，漏 `app-theme-i18n.md`、`background-services.md`、`android-machine-profile.md`。
- 影响：系统声称「老项目规则由母版 `sync-old-projects.sh` 铺开」，但 10-07 之后的两批变更（产品审查链、APP 基础能力）不会到达老项目 AGENTS 区块与新 sop 文件。老项目仍停在 10-03 规则。
- 建议：更新 STAMP/RULES_VERSION 与 FILES（加 app-theme-i18n.md）；迁移提示词 5.8 扩到 10-08 机制、第 0 步 sop 清单补三份；重跑 sync-old-projects（属跨仓动作，需用户授权）。

---

## 三、P2｜优化 / 卫生（建议但不阻断）

| # | 问题 | 证据 | 建议 |
|---|---|---|---|
| P2-1 | APP 强制点依赖未随包分发的「Design Pipeline 七颗 Skill / Human 2 / Design Freeze」 | `docs/sop/app-theme-i18n.md:90-96,125`；`scripts/model/check-ledger.mjs` 报错文案「不进 Design Pipeline」 | 本模板体系内并无该管线。建议在 app-theme-i18n.md 注明这些阶段 Skill 属外部可选依赖，或把随包可用口径收窄为「PRODUCT_PLAN 声明 + 关键 AC」 |
| P2-2 | supervisor DISPATCH 校验块把 `note` 当必填 | `docs/roles/supervisor.md:38` req 含 `note`（8 键）；`scripts/model/check-ledger.mjs` 视 `note`/`executed_by` 为可选 | 两处宽严统一（建议 note 可选） |
| P2-3 | override 双审派工表与同节说明不一致 | `USER_MODEL_OVERRIDE.md:26` planner 命令缺 `-s danger-full-access`；同节 `:33` 又写 planner 已带 | 表内命令补齐标志（同 P0-1） |
| P2-4 | HANDOFF 段号冲突 | `grep '^## '`：§34/35/36/37/38 各出现两次（`:258-276` 与 `:282-318`），§2 两次（`:31` 与 `:375`），§49 两次（`:366` 与 `:387`） | overview 称「旧号冻结不重排」，但这里已非「顺延」而是重号；建议后续新节顺延到 §71 起，勿再撞号 |
| P2-5 | DISPATCH runtime 枚举含 `本窗口`，但表内 Runtime 列已无此值 | `AGENTS.md:75` 列出「本窗口」；`USER_MODEL_OVERRIDE.md` 通道列已改为「当前客户端窗口（自动探测）」；DISPATCH 示例行仍用「本窗口」 | 枚举与表对齐（保留兼容或改示例） |
| P2-6 | check-sync.sh 残留死引用与重复清单 | `scripts/check-sync.sh:63` 引用不存在的 `AGENTS.md.tmpnorm`；`:56` 文件清单大量重复条目 | 清理 |
| P2-7 | 外部开发者提示词代码围栏重复 | `docs/prompts/外部开发者提示词.md:29` 多出一个 ```（第 28 行已闭合，29 行重新开且未闭），第 31 行起落入未闭合代码块 | 删除第 29 行多余围栏 |
| P2-8 | 归位表模板过薄 | `docs/templates/归位表.template.md` 仅 2 行表格 + 2 条 | 视需要补齐 |
| P2-9 | 本机档案随跨机分发包分发 | `docs/sop/android-machine-profile.md`（含本机 JDK 17.0.20.1+1 / android-36 / NDK 27.1.12297006 / `$HOME/android-toolchain`，多处「待复测」），存在于两包 | 定位含糊：它自称「只记录当前机器」却是分发件。建议在包内标注「台机档案，新机须重测重写」 |
| P2-10 | 根 `agent.md` 与 README/§70 描述不符，且根与 temp 各存一份 | `git status` 显示根 `agent.md` 未跟踪；`README.md:92` 称其为「接续开工提示词快照」；实际根 `agent.md` 内容是「项目审查工作约定」；HANDOFF §70 又说「`agent.md` 移入 `temp/`」 | 明确归属（接续快照→`temp/`；审查约定另行命名），README 描述同步 |

---

## 四、体系预期能否达到（逐项判定）

| 预期 | 能否达到 | 依据 / 卡点 |
|---|---|---|
| **产品功能多方审查**（Research Reviewer + 2026-10-07 双审链） | **机制在，落点缺** | 双审链的硬规则（串行、校验产出非空、互不可见、汇总结构、白名单维度）写得细，且有 2026-10-07 实测教训。但：①角色卡写「并行」与「串行」冲突（P0-3）；②主开工提示词没有这条链（P1-5），新人不会触发；③无 `PRODUCT_REVIEW` 专用模板，汇总结构靠临时照抄；④双审用的 `codebuddy/deepseek-v4-pro` 只在 check-channel-preflight 的 archive 段（不阻断），模型失配时不会拦。 |
| **多阶段开发规范**（PLAN→Human Gate→DEVELOP） | **能达到**（依赖人/监督者而非脚本） | 状态机、口令、Gate 条件、Change A/B/C 在 AGENTS、task-manager 卡、HANDOFF 模板、supervisor Phase Integrity 六查中一致。**但无脚本强制**——Phase 合法性、Human Gate 不可跨越、DEV_BASELINE 存在，全由 supervisor 人工抽查；`check-ledger`/`check-sync` 不校验 Phase。属设计选择（人参与），但「落实」完全押在 supervisor 身上。 |
| **安卓开发通用要求** | **基本能达到** | `docs/sop/android.md` 覆盖工具链共享、prebuild 风险、签名四类、真机预检、报告必须含产物路径/大小/签名类型，且 AGENTS/qa 卡把它接入派工链与抽查。风险：机器档案随包分发且多处「待复测」（P2-9）；真机 QA 最终依赖本窗口 bash 直驱，跨客户端环境未验。 |
| **APP 基础能力（主题三态＋中英）** | **部分能达到** | 模板字段、FR/AC、关键 AC 硬约束、sop 单一真源、以及新增的 `check-ledger` `APP-BASELINE-MISSING` 机械检查（本次负例实测有效）使其「有机器拦截」。但强制点文档引用的是未随包分发的「Design Pipeline 七颗 Skill / Human 2 / Design Freeze」（P2-1），随本模板单独使用时只有「声明字段」这一层机械检查；老项目还收不到该 sop（P1-7）。 |
| **客户端无关 / 自动探测派工口** | **能达到** | `detect-client.sh` 实跑正常；override Runtime 列、AGENTS、task-manager 卡口径一致；补充说明「认不出走 CLI 之保守默认」。 |

---

## 五、派工账本 / 编排者账本复盘

- **母版账本按设计为空壳**：`docs/model/TASK-MODEL-LOG.jsonl`、`DISPATCH-LOG.jsonl`、`TASK-MANAGER-QUALIFICATION-EVENTS.jsonl`、`JEV-DECISION-LOG.jsonl` 均只含单行 `_example`。`check-ledger.mjs` 在母版 exit 1（仅报示例行未删），符合「母版是分发源、不记实绩」的设计。**结论：母版本身不承载可复盘的派工实绩**，复盘只能看 HANDOFF §60/§61/§63/§65 等处的逐派记录表（结构完整、含 model/通道/result/备注）。
- **schema 与校验器基本自洽**：`tm-qualification.test.mjs` 17 项全过；`check-ledger.mjs` 对 TASK/DISPATCH/QUALIFICATION 三本账的必需键、枚举、model 白名单、`chain_status`、APP 基线均有规则。
- **发现的不一致**：
  1. supervisor 的 DISPATCH 第二道校验块语法错误，**这道账本门禁实际不生效**（P0-2）。
  2. supervisor 的 DISPATCH req 含 `note`（必填）与 check-ledger 把 `note` 列为可选，宽严不一（P2-2）。
  3. AGENTS 列出的 runtime 枚举含 `本窗口`，但分工表 Runtime 列已无该取值（P2-5）。
- **记账制度层面**：Episode 每轮自记、写后必验、不改历史行、母版/两包只留空壳等约束清晰；本次未发现真实行误写入母版或两包（check-sync SYNC-OK 佐证）。
- **结论**：账本「制度」完整，账本「机器门禁」存在一处硬失效（P0-2），且母版无实绩可供体系级复盘——如需审计体系落实度，必须回到下游项目的账本或 HANDOFF 逐派表。

---

## 六、ORCA 治理体系说明更新情况

- **已做**：`ORCA治理体系说明.md` 已写入 2026-10-07 产品审查链、2026-10-08 APP 基础能力（§六），`check-sync.sh:75` 的「对外必现机制」关键词已扩到含 `产品审查`／`APP 基础能力`／`app-theme-i18n` 等 18 个，实跑无 `OVERVIEW-STALE`。三件套的「同步概览」这一步**形式上过关**。
- **未做 / 落后**（说明「更新了，但语义没同步」）：
  1. 标题仍为「（对外版，2026-09-28）」，未随内容更新日期；`check-sync` 只查关键词、不查日期，故漏检。
  2. `:95` 仍写「planner 汇总走 stdout 落盘」，与 override 的「可直接写盘」矛盾（P0-1）。
  3. `:115` 写 HANDOFF「现至 §60」，实际 §70（P1-4）。
  4. README.en.md 不在概览/三件套门禁范围，另行漂移（P1-6）。
- **结论**：概览**已更新机制、但未清理与机制冲突的旧句，且日期/节号滞后**；建议概览更新时同时做一次「与 override/AGENTS 的冲突句自查」。

---

## 七、建议修复顺序

**P0（先修，同一批入库）**
1. 统一 planner 沙箱口径：`AGENTS.md:45`、`ORCA治理体系说明.md:95`、`USER_MODEL_OVERRIDE.md:26`；`经验一句话.md` 追加更正行。
2. 修 `docs/roles/supervisor.md:38-40` DISPATCH 校验块语法，`python3` 实跑通过后再入库。
3. `docs/roles/product-reviewer.md:5`「并行」→「串行（禁并发）」。

**P1（随后）**
4. 备用列口径二选一对齐（AGENTS/README/README.en）。
5. planner.md / senior-expert.md 去硬编码模型 ID。
6. 收敛「产品验收追踪矩阵」为唯一落盘位 + 统一状态枚举。
7. 补 HANDOFF §71/§72 并刷新 §1-3；修 overview 节号。
8. 编排者提示词补产品审查链；澄清「第三阶段」口令命名。
9. 两包补 `README.en.md`（或删英文链接）＋ check-sync 增 README.en.md 检查。
10. 老项目铺开链补齐（sync-old-projects FILES/STAMP + 迁移提示词 5.8/第0步）。

**P2**：按第三节表逐条。

**收尾（按 AGENTS「体系更新三件套」）**：①`python3 scripts/_sync-packages.py` 同步两包 → ②同步概览 → ③`bash scripts/check-sync.sh` 得 `SYNC-OK`；④动过分工表/通道则跑 `check-channel-preflight.sh` 得 `CHANNEL-OK`；⑤HANDOFF 记一行（本次变更正缺此步）。

---

## 八、审查边界（未覆盖）

- 未联网核对模型/客户端真实可用性之外的第三方事实；未调用 codex/codebuddy 真实派工（仅列目录与预检）。
- 未逐个进入下游 31 个老项目仓核对其实绩账本与 AC 落盘（跨仓、且用户划界老项目不归本模板仓管）；仅由 `check-sync.sh` 巡检得知「AC 矩阵 2/33 有落盘」。
- `docs/sop/supabase.md`、`sqlite.md`、`docker.md`、`decision-router.md` 仅粗读，未逐条对照上游平台文档。
- `scripts/decision/` 决策侧车仅确认脚本与既有测试在位，未重跑全量回归（Node 侧 tm-qualification 已重跑）。

---

> 审查者：`volcengine-plan/ark-code-latest`｜日期：2026-10-08
