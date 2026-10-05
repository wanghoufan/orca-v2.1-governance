# RESEARCH_REVIEW｜ORCA 体系跨文件一致性审查（2026-10-05）

- Plan Version：不适用（非 Phase1 计划审查，属只读一致性审查）
- Review Round：第 1 轮
- 审查角色：product-reviewer（显示名 Research Reviewer；本次由用户直接指派，只读、不改任何治理文件）
- 审查对象：治理母版全部现行文件（AGENTS.md / README.md / ORCA治理体系说明.md / USER_MODEL_OVERRIDE.md / GOVERNANCE_VERSION / 经验一句话.md / docs/{roles,prompts,sop,pm,qa,review,handoff,model,templates} / scripts/**）、两个分发包同名文件、33 个老项目 `ORCA-RULES-BLOCK` 注入区块（`scripts/_inject-agents-block.py` BLOCK 模板 vs 母版现行规则），以及本轮未提交改动涉及的 12 处文件。
- 审查方法：全部实读文件 + 实跑脚本（`check-sync.sh`、`check-ledger.mjs`、`tm-qualification.test.mjs`）+ `diff` 逐文件比对 + 老项目实盘抽验（3 个项目全字段 + 31 个项目批量扫描）。
- **Result：FAIL_WITH_FIXES**。母版内部一致性较好，但存在 **2 个 P0**（同步门禁可被绕过且人工复核指引指错行；老项目被要求执行一个不存在的脚本）、**14 个 P1**（区块字段名与脚本不符、老项目开工入口停在旧版、Gate 条件在 5 处漂移、runtime 枚举不含新通道值等）。两包镜像除已知两处布局裸名差外，另有 1 处**未被 check-sync 捕获的真实内容差异**。
- P0：2；P1：14；P2：11。

---

## 一、12 类一致性逐类判定总表

| # | 类别 | 判定 | 关键证据（文件:行号） |
|---|---|---|---|
| 1 | 角色集合 | **一致**（1 处 P2 措辞） | `AGENTS.md:20-22`（9+1＋1，11 个名字）＝ `docs/roles/` 11 张卡 ＝ `USER_MODEL_OVERRIDE.md:5-15` 11 行 ＝ `README.md:51`「11 张角色卡」＝ `ORCA治理体系说明.md:8,84`。无幽灵角色、无漏角色。显示名 Research Reviewer 在 `AGENTS.md:13,22,32`、`docs/roles/product-reviewer.md:1`、`RESEARCH_REVIEW.template.md:1`、`概览:18` 全部统一，内部 ID `product-reviewer` 不变且 `check-ledger.mjs:54-55` 的 ROLES 枚举与之相符。残留别名「研究审查者」见 P2-3。 |
| 2 | 状态机与阶段 | **一致**（1 处 P1 口径漂移，见第 7 类） | `PROJECT_PHASE` 四态在 `AGENTS.md:12`、`HANDOFF.template.md:6`、`PRODUCT_PLAN.template.md:4`、`task-manager.md:9`、`supervisor.md:50`、`编排者提示词.md:15` 全部一致（含「仅 Change C 受控重开期间」限定语）。`PLAN_GATE` 三值（`IN_PROGRESS/READY_FOR_HUMAN_REVIEW/APPROVED`）在 `PRODUCT_PLAN.template.md:43`、`HANDOFF.template.md:9`、`task-manager.md:10-11`、`AGENTS.md:14` 一致。`DEV_BASELINE=PRODUCT_PLAN_Vx.x` 在 5 处一致。`CHANGE_REQUEST: NONE/A/B/C` 在 `AGENTS.md:16`、`PLAN.template.md:5`、`HANDOFF.template.md:11`、`task-manager.md:13`、`编排者提示词.md:16` 一致。 |
| 3 | 三个口令 | **一致** | 字面 `第一阶段，计划`／`第二阶段，开发`／`变更请求：……` 在 `AGENTS.md:13,14,16`、`README.md:17,32,33,34`、`docs/prompts/编排者提示词.md:14`、`docs/roles/task-manager.md:9`、`ORCA治理体系说明.md:17,20,24` 完全一致（全角逗号＋全角冒号，无第二写法）。 |
| 4 | 派工链 | **一致** | Phase1 链 `Planner→Research Reviewer→Planner→…→Readiness Gate→Human Gate`：`AGENTS.md:13,44`、`编排者提示词.md:15`、`task-manager.md:10`、`概览:18-19` 一致。Phase2 主链 `Builder→Reviewer→QA→Supervisor→TM`：`AGENTS.md:15,44`、`task-manager.md:12`、`编排者提示词.md:15`、`概览:22` 一致。product-reviewer「Phase1 才派／Phase2 默认不派」在 `AGENTS.md:15,44`、`task-manager.md:12`、`编排者提示词.md:15`、`product-reviewer.md:4` 一致。 |
| 5 | 升级规则 | **一致**（老项目侧有 P1） | 母版口径全一致：`AGENTS.md:18,60-63`、`概览:28`、`task-manager.md:8`、`builder.md:11`、`senior-expert.md:3,6`、`db-admin.md:8`、`编排者提示词.md:11,26`。无旧口径残留。**老项目 015/017 正文有旧口径**（P1-12）。 |
| 6 | 账本与字段 | **基本一致**（2 处 P1/P2） | `AGENTS.md:69` 声明 11 必需键＝`check-ledger.mjs:93-94` 的 need 数组＝`supervisor.md:8` 校验块 req 集合，三者完全对齐；枚举 `result:PASS/FAIL`、`escalated:YES/NO` 一致；`check-ledger.mjs:78` chain_status 三值＝`AGENTS.md:69-70`；`executed_by` 枚举 `check-ledger.mjs:54-56` 与角色集合一致（多出「迁移整理工/orchestrator」两个非角色值，见 P2-8）。DISPATCH 8 键在 `AGENTS.md:73`、`supervisor.md:30`、`check-ledger.mjs:97` 基本对齐（`check-ledger` 未把 `note` 列为必需，见 P2-9）。示例行口径一致（`AGENTS.md:68`、`README.md:56`、`check-ledger.mjs:89-91`）。问题：`check-ledger.mjs:18-29` KNOWN_MODELS 缺现役 `codex/gpt-6.1-sol`（P1-13）。 |
| 7 | AC 与产品验收 | **矛盾**（P1-8） | `PRODUCT_PLAN.template.md:37` 的 Gate 是 **6 项**（含 `视觉与交互验收标准非空且逐条可测`），`概览:19` 也是 6 项；但 `AGENTS.md:13`、`task-manager.md:10`、`编排者提示词.md:16`、`README.md:32` 只列 **4 项**（P0=0／blocking P1=0／关键事实已验证／核心假设已合理验证），漏了 AC 非空条件。字段侧对齐良好：PRODUCT_PLAN 的「视觉与交互验收标准」（`:17-21`）／「关键 AC 集合」（`:38`）／「发布类型」（`:39-41`）三字段齐全；BUGS 矩阵 11 列（`BUGS.template.md:11-13`）＝`qa.md:19-22`＋`supervisor.md:51` 所述；qa 八查 `qa.md:3`（unit/build/lint/API/logs/regression/DoD/产品验收）＝`概览:101`「第八查」；不可放行三情形 `qa.md:18`＝`概览:33`＝注入区块 `:21`；发布类型签收口径 `PRODUCT_PLAN:40`、`HANDOFF.template.md:17-18`、`qa.md:19`、`AGENTS.md:44,70,108`、`概览:34`、区块 `:23` 全一致。 |
| 8 | 汇报纪律 | **一致**（2 处 P2 措辞不齐） | 三类必报／自决清单／四类红线／≤10 行／三行心跳／禁全量倾倒，在 `AGENTS.md:98-102`、`task-manager.md:17`、`编排者提示词.md:30`、`supervisor.md:53`、`概览:40`、区块 `:26-30` 六处口径一致。抽查条（`supervisor.md:53`）与 AGENTS 同口径。差异仅：自决清单细项在下游文件有删减（P2-6）。 |
| 9 | 派工口与客户端无关 | **一致**（2 处 P2 清单漂移） | 六处均写「每轮开工跑 `bash scripts/detect-client.sh`、按 `mode` 派工、不找用户填、window_subagent/channel_cli、不套娃、禁自动更新」：`AGENTS.md:44`、`编排者提示词.md:10`、`USER_MODEL_OVERRIDE.md:5,11,45`、`task-manager.md:16`、区块 `:31`、`概览:38`、`README.md:11,18`。无「必须本窗口 subagent」的旧硬约束与新规则并存（`AGENTS.md:51` 的 Runtime 插座、`builder.md:7` 的「本窗口 subagent / codex / opencode / External Runtime」均为通道无关表述）。清单漂移见 P2-3。 |
| 10 | 路径与布局引用 | **一致**（1 处 P1） | 母版内 `docs/prompts/编排者提示词.md`（`AGENTS.md:44` 引用）、`docs/prompts/Orca 编排治理监督者提示词.md`（`AGENTS.md:115`）、`docs/prompts/迁移整理提示词.md`（`概览:111`）、`docs/sop/*` 全部实存。两包根平铺文件（`编排者提示词.md`／`外部开发者提示词.md`／`归位表.template.md`／`迁移整理提示词.md`）实存，且两处裸名差（`AGENTS.md:44`、`scripts/orchestration/README.md:3`）是**已知布局差，不计问题**。老项目抽验：`017/037/040` 的 `docs/roles/`（11 张）、`docs/qa/BUGS.template.md`、`docs/pm/PRODUCT_PLAN.template.md`、`docs/review/RESEARCH_REVIEW.template.md`、`docs/handoff/HANDOFF.template.md`、`scripts/model/check-ledger.mjs`、`scripts/detect-client.sh` 均实存且与母版字节一致。**但 3 个项目缺 `docs/prompts/`（P1-4）。** |
| 11 | check-sync 覆盖盲点 | **矛盾**（P0-1、P1-10、P1-14） | 详见第三节。已实证 1 处真实差异未被捕获（`docs/prompts/Orca 通用编排者持续推进协议.md:7`）。 |
| 12 | 脚本自身一致性 | **部分一致**（2 处 P1、3 处 P2） | `sync-old-projects.sh:16-17` 的 `STAMP=2026-10-03`／`RULES_VERSION=2026-10-03-客户端无关` 与 `migration-status.sh:7` 的 `RULES_VERSION` **一致**；两者都用 `PROJECTS_ROOT` 默认同一路径、同一跳过规则（`:63`／`:17`）、同一 `[ -f "$d/AGENTS.md" ]` 准入条件（`:64`／`:18`）。`check-sync.sh` 白名单与实际预期差**匹配**（实测 `SYNC-OK`，两处差各 2 marker）。不一致见 P1-2、P1-7、P0-1、P2-5、P2-7。 |

---

## 二、发现清单

### P0

#### P0-1｜check-sync 的 AGENTS 白名单可被绕过，且所有人工复核指引都指错了行号

- **定位**：`scripts/check-sync.sh:4,11-13,34-37`；`经验一句话.md:26`；`agent.md:18`
- **原文对照**：
  - `check-sync.sh:4` 注释：「预期差白名单（仅布局裸名）：**AGENTS.md:37**、scripts/orchestration/README.md:3」
  - `check-sync.sh:11` 注释：「AGENTS 白名单：仅允许 **:37** 裸名差 1 行（diff 输出恰 2 行 markers）」
  - `check-sync.sh:12-13`：`n=$(diff AGENTS.md "$pkg/AGENTS.md" \| grep -c "^[<>]")`；`[ "$n" = "2" ] || fail`
  - `经验一句话.md:26`：「两包同步后必须显式 diff **第 37 行**、确认差异仅是 docs/prompts/ 裸名那一处」
  - `agent.md:18`：「两包同步后必须显式 diff **第 37 行**确认仅裸名差」
  - 实测：裸名差实际在 **`AGENTS.md:44`**（`见 docs/prompts/编排者提示词 :10` ↔ `见 编排者提示词 :10`），因为本轮在 AGENTS.md 顶部新增了「何时起这套体系」（第 3-8 行）与「汇报与自决」（第 96-102 行）等节，行号已从 37 漂到 44。
- **实证绕过**（已实跑复现）：
  1. 把 `新项目模板包/AGENTS.md` 第 44 行的裸名改成 `见 完全不存在的文件.md :10`（其余全同）→ `diff | grep -c "^[<>]"` = **2** → `check-sync.sh` 判为「符合白名单」，`SYNC-OK`。**即：裸名那一行内容本身可以任意错，门禁查不出来。**
  2. 删掉/改写第 44 行以外任意一行 → marker 数变 3 或 4 → 被拦下。即白名单只对「恰好一行替换且该行是 44 行」完全放行。
- **矛盾点**：①「非白名单零容忍」的执行方式是数行数而非比对内容，语义强度远低于声明；②唯一的兜底是人工 diff 指定行号，而**三处指引（脚本注释 ×2、经验句、agent.md）全部指向已失效的第 37 行**——人工复核会去看一个早已不是裸名差的行，兜底同时失效。
- **风险面**：`AGENTS.md` 是两包唯一靠 marker 白名单放行的文件，也是 33 个老项目 `sync-old-projects.sh` 的规则来源（`sync-old-projects.sh:80-93` 从老包取 `AGENTS.md`）。一处单行错字／错引会静默扩散到全部分发包与老项目基线，且没有任何脚本会拦。
- **建议改法（只写建议，不动手）**：
  1. 把白名单从「数 marker」改成「**规范化后逐字节比对**」：先 `sed 's#docs/prompts/编排者提示词#编排者提示词#'` 归一母版再与包比，或反向做一次归一后 `cmp`。这样任何内容差（哪怕同一行）都会被抓。
  2. 若坚持保留行数白名单作快速通道，则必须把注释与 `经验一句话.md:26`、`agent.md:18` 的「第 37 行」全部更正为**当前实际行号**，并加一条自检：`n=$(diff AGENTS.md 新项目模板包/AGENTS.md | grep -c "^< ")` 且 `diff` 输出的两行必须命中预期正则 `见 .*编排者提示词.* :10`，否则 fail。
  3. 更稳的做法：把这处布局差从 AGENTS.md 正文里消掉——把「见 docs/prompts/编排者提示词 :10」改成不带路径的「见编排者提示词 :10」，则两包 AGENTS.md 可做到**零差异**，白名单整个不需要。

#### P0-2｜老项目被规则要求执行一个它们没有的脚本（31/31 全缺）

- **定位**：`scripts/sync-old-projects.sh:23-54`（FILES 清单）；老项目正文（如 `/Users/zzymima0000/Developer/coding/1.Active/040-ing-才艺展示厅/AGENTS.md:69,95`、`041-ing-nightrec/AGENTS.md`）
- **原文对照**：
  - 老项目正文（母版 2026-09-29 快照）载明：「**派工前通道预检（2026-09-29 定）**：派任何角色前跑 `bash scripts/check-channel-preflight.sh`……报 `CHANNEL-STALE`＝该角色**禁派**」。
  - `sync-old-projects.sh:23-54` 的 FILES 清单里**没有** `scripts/check-channel-preflight.sh`（只有 `scripts/model/check-ledger.mjs:52` 与 `scripts/detect-client.sh:53`）。
  - 实测：31 个已注入区块的老项目中，**有 `scripts/check-channel-preflight.sh` 的数量 = 0**。
- **矛盾点**：规则是硬门禁（`AGENTS.md:48`「报 CHANNEL-STALE＝**该角色禁派**」），但规则指向的脚本在老项目不存在。照规则执行的编排者会得到「command not found」，按 `AGENTS.md:48` 的字面意思无法判断该不该派工 → 要么违规放行（该禁派没禁），要么卡死（无法执行门禁）。同一问题反向也存在：`AGENTS.md:48` 提到的「换客户端后必须重跑预检」在老项目无脚本可跑。
- **建议改法**：二选一，建议前者。
  1. 把 `scripts/check-channel-preflight.sh`（及其依赖 `scripts/weekly-channel-check.sh` 可选）加入 `sync-old-projects.sh` 的 FILES 清单，跑一次 `sync-old-projects.sh` 铺到 31 个老项目。
  2. 若不打算铺脚本，则把该条从**会被同步到老项目的文本**里去掉或降级为「仅母版/新项目适用」，并在区块里显式写明老项目不适用该门禁及其替代做法（例如改用 `docs/roles/qa.md:7` 的双态分派口径）。

---

### P1

#### P1-1｜注入区块与母版规则的覆盖缺口：区块不含状态机／口令／派工链／角色集合／账本字段

- **定位**：`scripts/_inject-agents-block.py:18-35`（BLOCK 全文）vs `AGENTS.md:12-22,42-51,58-73`
- **原文对照**：区块 `:16` 自称「本区块只写**对外通用**的机制增量；派工细节见 `docs/roles/`」。但母版 `AGENTS.md` 的 11 个顶层机制节里，区块只覆盖了 4 类（产品验收、三件套、跨目录禁令、汇报与自决、客户端探测、何时起体系、红线）；**完全没有**：`PROJECT_PHASE` 四态与 `PLAN_GATE`／`DEV_BASELINE`／`CHANGE_REQUEST`（`AGENTS.md:12,14,16`）、三口令（`:13,14,16`）、Phase1/Phase2 派工链（`:13,15,44`）、9+1＋1 角色集合（`:20-22`）、升级计数口径（`:60-63`）、账本 schema 与 `chain_status` 三态口径（`:69-70`）。
- **实证**：31 个老项目中，**16 个的 `AGENTS.md` 里既无「第一阶段，计划」也无「## 派工顺序」节**（如 `001-ing-家庭保单数据看板`、`021-ing-workbuddy-switch`、`030-ing-skill 日报体系`、`036`、`038`、`042` 等）——它们的顶层规则只有区块＋项目自有内容。
- **矛盾点**：这些项目的 `docs/roles/task-manager.md` 确实含三口令与四态（`task-manager.md:9-13`，实测 3 个抽验项目均为母版字节一致），所以不是完全无源；但顶层规则与卡内规则**分处两地且无「以 AGENTS.md 为准」的仲裁句**。同时 `AGENTS.md:8` 明确写「**半套是最差状态**：套了体系却不落 AC/账本，按红线打回」——按现状这 16 个项目处于「顶层无状态机定义、只有卡里有」的状态，仲裁归属不清。
- **建议改法**：区块补一条**最小顶层骨架**（不复制母版全文，只写不可从卡推导的跨角色契约）：四态＋三口令＋`PLAN_GATE`/`DEV_BASELINE`/`CHANGE_REQUEST` 枚举＋Phase1/Phase2 主链＋「顶层与卡冲突以本区块为准，卡与卡冲突以 AGENTS 母版为准」。或反过来：在区块里加一句「本项目 `docs/roles/*.md` 为派工细节唯一来源，四态与口令以 `docs/roles/task-manager.md:9-13` 为准」，把仲裁写死。

#### P1-2｜注入区块声明的 `GOVERNANCE-STATE.json` 字段名与脚本实际写入的不一致

- **定位**：`scripts/_inject-agents-block.py:34` vs `scripts/sync-old-projects.sh:118-127`
- **原文对照**：
  - 区块 `:34`：「`docs/model/GOVERNANCE-STATE.json`（`rules_version`／`synced_at`／`project_phase_field`／`task_ledger_rows`／**`agents_needs_manual_merge`**／`product_acceptance_ac_added`）」
  - `sync-old-projects.sh:118-127` 实际写入：`rules_version`／`synced_at`／`project_phase_field`／`task_ledger_rows`／**`agents_block_injected`**／`product_acceptance_ac_added`
- **实证**：31 个老项目的 `GOVERNANCE-STATE.json` 全部含 `agents_block_injected`，**无一个**含 `agents_needs_manual_merge`。
- **矛盾点**：区块是写进老项目 AGENTS.md 的规则文本，告诉项目 TM 去读一个**根本不存在的字段**；`sync-old-projects.sh:92` 里的 `needmerge` 计数变量也没有任何落盘出口。
- **建议改法**：统一为一个字段名（建议 `agents_block_injected`，语义也更准——注入区块是既定事实，不是「待人工合并」）；改 `_inject-agents-block.py:34`，并同步 `migration-status.sh` 若有引用（当前 `migration-status.sh:22-25` 只读 `rules_version` 与 `product_acceptance_ac_added`，不涉及该字段，故只需改文案）。

#### P1-3｜`043-ing-成片集-app` 的治理根在 `software/` 子目录，被 sync 与 status 双双漏掉

- **定位**：`scripts/sync-old-projects.sh:64`、`scripts/migration-status.sh:18`；`/Users/zzymima0000/Developer/coding/1.Active/043-ing-成片集-app/`
- **原文对照**：两个脚本都用 `[ -f "$d/AGENTS.md" ] || continue` 作准入；`043-ing-成片集-app/AGENTS.md` **不存在**（其治理根在 `software/AGENTS.md`）。
- **实证**：`043-ing-成片集-app/software/AGENTS.md:6` 的区块标题为「ORCA 规则增量（母版 **2026-09-29-产品验收**）」——落后当前 `RULES_VERSION=2026-10-03-客户端无关`（`sync-old-projects.sh:17`）；其 `docs/model/GOVERNANCE-STATE.json` 的 `rules_version` 同为 `2026-09-29-产品验收`。
- **矛盾点**：这个项目**事实上是一个已完成迁移的老项目**（有全套 docs/roles、账本、区块、提示词），但因为治理文件放在 `software/` 下，被两个脚本同时判为「不在本轮范围」→ 永不升级规则、也永不出现在 `migration-status.sh` 的状态表里。状态表因此**系统性漏计**（表里 31 行，实际至少 32 个老项目）。
- **建议改法**：①给两个脚本加一层「根 `AGENTS.md` 不存在时，向下一层找唯一含 `ORCA-RULES-BLOCK` 的子目录并以其为治理根」的探测（限深度 2 层、命中唯一才用，多个命中则跳过并打印告警）；②或人工把 `043-ing-成片集-app/software/` 的治理文件上提一层、把业务留在 `software/`，之后按标准流程走。在 ①落地前，至少在 `agent.md:12` 的「老项目 32 个全量迁移」口径上标注此项目未同步。

#### P1-4｜3 个老项目的 AGENTS.md 引用 `docs/prompts/` 但该目录不存在

- **定位**：`037-ing-AI 编程训练营网站/AGENTS.md:152`、`040-ing-才艺展示厅/AGENTS.md`、`041-ing-nightrec/AGENTS.md`（均含「总监督……只读 AGENTS＋`docs/prompts/Orca 编排治理监督者提示词.md`」）
- **原文对照**：`AGENTS.md:115`（母版）要求总监督提示词在 `docs/prompts/`；老项目正文引用同一路径，但实测 `037/040/041` 的 `docs/prompts/` **均不存在**（`017` 有，其余无）。
- **矛盾点**：总监督机制（母版 `AGENTS.md:115` 明确定义为体系外独立角色）在这些项目里指向一个空路径 → 该机制在这 3 个项目事实上失效，且规则文本本身看不出失效（路径写在括号里，不报错）。
- **建议改法**：把这 2 份总监督提示词（＋《Orca 通用编排者持续推进协议》）加入 `sync-old-projects.sh` 的 FILES 清单并落到 `docs/prompts/`；或在区块里改为「本项目无 `docs/prompts/` 时，总监督提示词从治理母版仓 `docs/prompts/` 读」。

#### P1-5｜老项目的开工入口（`编排者提示词.md`）未纳入同步清单，已停在 9 月旧版

- **定位**：`scripts/sync-old-projects.sh:23-54`（无 `编排者提示词.md`）；`/Users/zzymima0000/Developer/coding/1.Active/017-ing-RSS聚合-个人信息雷达/编排者提示词.md`
- **原文对照**：
  - 母版 `docs/prompts/编排者提示词.md:10` 已是新版派发口（`mode=window_subagent`／`channel_cli`、跑 `detect-client.sh`、不问我填），并在 `:30` 有完整的「汇报纪律」段。
  - `017/.../编排者提示词.md:10` 仍是旧版：「派发口：**本窗口内派subagent**，全自动……」，`:30` **没有汇报纪律段**；与母版 `diff` 实测 6 行差；`040`／`037` 各 4 行差（mtime 停在 2026-09-15／09-22）。
  - 18 个老项目根目录有 `编排者提示词.md`，全部早于本轮改动。
- **矛盾点**：老项目 TM 的**唯一开工入口**是 `编排者提示词.md`（README.md:26 明说「每一单你只说业务目标＋口令，铺包/派工/落账/验收全由编排者自己走完」），而它承载的是 9 月的派工口与汇报口径，与同项目 AGENTS.md 区块（2026-10-03 版）**直接矛盾**：区块要求「跑 detect-client.sh 按 mode 派工、汇报只报三类」，提示词却写「本窗口内派 subagent」且无汇报纪律段。同一项目内两份开工指令打架。
- **建议改法**：把 `编排者提示词.md`、`外部开发者提示词.md`、`迁移整理提示词.md`、`归位表.template.md`（→`docs/templates/`）、`GOVERNANCE_VERSION` 一并加入 `sync-old-projects.sh` 的 FILES 清单（注意三个提示词在包内是**根平铺**、在老项目也应落**根**，与迁移提示词 `:13` 的约定一致），跑一次铺开。

#### P1-6｜同批漏同步：`background-services.md`（本轮新增）、`detect-client.sh` 的依赖脚本、归位表、GOVERNANCE_VERSION

- **定位**：`scripts/sync-old-projects.sh:23-54`；`迁移整理提示词.md:13`
- **原文对照**：`sync-old-projects.sh` FILES 含 `docs/sop/{android-machine-profile,android,decision-router,docker,sqlite,supabase,webqa}.md`（`:37-43`），**不含** `docs/sop/background-services.md`；`迁移整理提示词.md:13` 的铺包清单同样只列「docker.md、supabase.md、sqlite.md、android.md、webqa.md、decision-router.md」，两处都漏了本轮新增的 `background-services.md`（母版 `:1`、两包均已含，且 `check-sync.sh:15` 的 `docs/sop/*.md` 通配已把它纳入同步校验）。
- **实证**：抽验 3 个老项目 `docs/sop/background-services.md` 全部不存在。
- **矛盾点**：三份「铺哪些文件」的清单（`sync-old-projects.sh`、迁移提示词 `:13`、`README.md:57` 的 docs 地图）**互不一致且都落后于母版实际文件集**。按迁移提示词 `:13` 铺出来的新项目会缺 `background-services.md`。
- **建议改法**：三处清单改为**由脚本生成**而非手写——加一个 `scripts/list-governance-files.sh`（或直接复用 `sync-old-projects.sh` 的 FILES）作为唯一真源，`迁移整理提示词.md:13` 与 `README.md:57` 只写「sop 全目录」不枚举文件名，从根上消除三处漂移。

#### P1-7｜DISPATCH 账本 `runtime` 枚举不含 override 表新增的两个通道值

- **定位**：`AGENTS.md:73`；`docs/roles/supervisor.md:40`；`USER_MODEL_OVERRIDE.md:5,11,13,15`
- **原文对照**：
  - `AGENTS.md:73`：`runtime（本窗口/codebuddy/codex/opencode/—）`
  - `supervisor.md:40`：`if o.get('runtime') not in ('本窗口','codebuddy','codex','opencode','—')`
  - `USER_MODEL_OVERRIDE.md` 实际通道取值：`task-manager`＝**当前客户端窗口（自动探测）**、**`product-reviewer`＝当前客户端窗口（自动探测）**、**`neat-freak` 备用＝Claude Code**、**`db-admin` 备用＝Claude Code**
- **矛盾点**：本轮把「派工口＝自动探测、客户端无关」写进规则后，通道取值集合已变（多出「当前客户端窗口（自动探测）」与「Claude Code」），但两处枚举**没跟着改**。按 override 表如实记账的编排者，写 `runtime="当前客户端窗口（自动探测）"` 会被 `supervisor.md` 的校验块判「runtime 枚举错」并打回；切到 Claude Code 备用通道同理。这是本轮改动直接引入的新矛盾。
- **建议改法**：把 runtime 枚举改为**从 override 表派生**而非在两处各写一份常量——`supervisor.md:40` 改成「`runtime` 必须是 override 表『执行通道/备用执行通道』列出现过的取值 ∪ {`本窗口`,`—`}」，校验时用 `grep` 取列值集合；`AGENTS.md:73` 同步改为「runtime＝override 表该列取值之一（本窗口/codebuddy/codex/opencode/Claude Code/当前客户端窗口（自动探测）/—）」。

#### P1-8｜Phase1 Readiness Gate 条件在 5 处漂移：模板/概览 6 项，AGENTS/卡/提示词/README 只列 4 项

- **定位**：`docs/pm/PRODUCT_PLAN.template.md:37`（正典）vs `AGENTS.md:13`、`docs/roles/task-manager.md:10`、`docs/prompts/编排者提示词.md:16`、`README.md:32`
- **原文对照**：
  - 正典 `PRODUCT_PLAN.template.md:37`：`Gate（进 Human Review 条件）：Readiness >= 90 AND P0 = 0 AND blocking P1 = 0 AND 关键事实已验证 AND 核心假设已合理验证 **AND 视觉与交互验收标准非空且逐条可测**`
  - `概览:19` 与正典**一致**（6 项都在）。
  - `AGENTS.md:13`：`PLAN_READINESS_SCORE>=90` 且模板 Gate 全条件满足（**P0=0＋blocking P1=0＋关键事实已验证＋核心假设已合理验证**）← 括号内枚举缺第 5 项
  - `task-manager.md:10`／`编排者提示词.md:16`／`README.md:32`：同一处省略
- **矛盾点**：四处都声明「定义以 `docs/pm/PRODUCT_PLAN.template.md` 为准」，但紧跟其后的括号枚举是**不完整复述**。实际后果是可判定的：`AGENTS.md:13` 与 `task-manager.md:10` 是编排者判「能否进 WAITING_HUMAN_APPROVAL」的直接依据（`task-manager.md:10` 更是明写「才停循环进 WAITING_HUMAN_APPROVAL」），按这份枚举执行，**一个没有「视觉与交互验收标准」的 PRODUCT_PLAN 会被判为达标并停下找人**——正好命中 `PRODUCT_PLAN:38`「关键 AC 集合为空即计划缺项，不得进 Human Review」与 `PRODUCT_PLAN:19` ③要防的情况。这是 2026-09-28 产品验收整改的封口条件在下游 4 处被削掉。
- **建议改法**：四处枚举补齐为 6 项（与 `PRODUCT_PLAN.template.md:37`、`概览:19` 逐字一致）；更稳的做法是把这四处改成**只引用不枚举**——「Gate 全条件以 `docs/pm/PRODUCT_PLAN.template.md` 的 Gate 行为准（不另写一套）」，与 `AGENTS.md:13` 已有的一句「定义以…为准，卡内不另写」同一风格，从根上消灭复述漂移。

#### P1-9｜两包 README.md 与母版字节一致，但包内缺 README.md 自己引用的 5 类目标

- **定位**：`scripts/check-sync.sh:28`（强制 `README.md` 两包一致）；`README.md:3,52-54,82`
- **原文对照**：`check-sync.sh:28` `check "README.md" "$pkg/README.md"` → 实测两包 README 与母版**字节完全一致**（母版是「根目录导航」，包内是「模板包」）。而 README 里：
  - `:3` `[English](./README.en.md)` → 两包内**无 README.en.md**（英文链接在包内断链）
  - `:52-54` 描述 `docs/prompts/`（编排者/外部开发者/迁移整理＋2 份 Orca 协议）、`docs/history/`、`docs/templates/` → 两包内**这三个目录都不存在**（提示词被平铺到包根、`归位表.template.md` 在包根、无 history）
  - `:82` 「`新项目模板包.zip`、`老项目迁移模板包.zip`：对应的可复制压缩包」→ 两包内及仓库根**均无 .zip 文件**（已实测）
  - `:40` 「根目录（现行11）」→ 包根实际只有 11 项（数目巧合对得上，但清单描述的是母版根，包根没有 `docs/`、`scripts/orchestration/` 之外的 `README.en.md`/`agent.md`/`ORCA治理体系说明.md` 等）
- **矛盾点**：README 是「先读我」的入口文档，却被 check-sync 强制成同一份，导致它在包内描述了一个不存在的目录结构与不存在的文件。用户拿到包后按 README 找 `docs/prompts/编排者提示词.md` 会找不到（实际在包根 `编排者提示词.md`）。
- **建议改法**：把 README 拆成两份——母版 `README.md`（母版导航）与各包 `README.md`（包内导航：包根平铺布局 + 铺包步骤），`check-sync.sh:28` 改为「两包 README 之间互校字节一致」而非「与母版一致」；`.zip` 若不再产出则删 `:82`，若仍产出则纳入 check-sync 的存在性校验。

#### P1-10｜check-sync 覆盖盲点清单（含 1 处已存在的真实差异）

**未被逐字节校验的母版文件**（实测确认 `check-sync.sh` 中无对应项）：

| 未覆盖文件 | 实证影响 |
|---|---|
| `docs/prompts/编排者提示词.md` ↔ 两包根 `编排者提示词.md` | 当前一致，但无门禁；本轮该文件已改（新增 `:10` 派发口、`:30` 汇报纪律段），靠人工同步 |
| `docs/prompts/外部开发者提示词.md` ↔ 两包根同名 | 当前一致，无门禁 |
| `docs/prompts/Orca 编排治理监督者提示词.md` ↔ 两包根同名 | 当前一致，无门禁 |
| **`docs/prompts/Orca 通用编排者持续推进协议.md` ↔ 两包根同名** | **已存在真实差异**：母版 `:7` 写「固定 **9+1** 角色定义」，两包均写「固定 **9+1＋1** 角色定义」。`diff` 实测母版 vs 两包各 1 行差，而 `check-sync.sh` 报 `SYNC-OK`。**即：两包已修（9+1＋1，与 `AGENTS.md:10,20` 一致），母版反而是落后的一方，而没有任何门禁发现** |
| `scripts/orchestration/README.md` | 只在 `:37` `echo` marker 计数，**不置 fail** → 差 3 行也照样 `SYNC-OK` |
| `README.en.md` | 未校验；且两包内不存在（P1-9） |
| `agent.md` | 未校验；未列入 `README.md` 根目录清单 |
| `GOVERNANCE_VERSION` | 未校验（实测两包当前一致） |
| `skills-lock.json`、`.agents/skills/agent-browser/SKILL.md`、`.gitignore` | 未校验 |
| `scripts/check-channel-preflight.sh`、`weekly-channel-check.sh`、`sync-old-projects.sh`、`migration-status.sh`、`_inject-agents-block.py`、`scripts/model/check-ledger.mjs`（后者 `:31` 已含） | 前五个未校验（均为母版工具，不入包，属合理） |
| `scripts/model/fixtures/**`（11 个 tm-qual fixture） | 未校验（实测当前两包一致） |
| `docs/history/**`、`docs/pm/PLAN-2026-09-12-整改.md`、`docs/decision*`、历史 review/qa/handoff 文档 | 未校验（按设计不进包，属合理） |

- **额外盲点**：`:4` 与 `:34` 的注释声称「白名单外零容忍」，但 `:32` 的 `diff -rq scripts/decision` 之后，`:35-37` 的「预期差确认」段只 `echo` 不 `fail`；即 `scripts/orchestration/README.md` 与 AGENTS.md 走的是两套不同强度的机制。
- **建议改法**：①把两包根平铺的 4 份提示词按 `docs/prompts/迁移整理提示词.md:30` 的现成写法（`if [ "$pkg" = "老项目迁移模板包" ]; then check ...`）补进两包各自的 `check` 调用（编排者/外部开发者/Orca×2 四份都要，按包平铺路径）；②`scripts/orchestration/README.md` 从 `:37` 的 echo 改为与 AGENTS 同级的 `[ "$n" = "2" ] || fail`；③`README.en.md`／`GOVERNANCE_VERSION`／`agent.md` 补进 `check`（或明确列入注释说明「母版独有、不入包」）；④修 P1-10 首行那个已存在的真实差异（母版 `Orca 通用编排者持续推进协议.md:7` 的 9+1 → 9+1＋1）。

#### P1-11｜`check-sync.sh` 概览新鲜度关键词表过窄（6 个），漏掉本轮全部新机制

- **定位**：`scripts/check-sync.sh:38-44`
- **原文对照**：`:42` `for kw in "产品验收" "关键 AC" "首次发布" "签收" "不问不报" "detect-client"; do`；`:39-40` 的维护约定要求「新增/改动影响体系对外表述的机制时，必须把该机制的对外必现关键词补进下方清单」。
- **矛盾点**：本轮新增/改动的机制里，**只有 `detect-client` 一个进了清单**。「何时起这套体系（大项目 vs 小活）」、「汇报与自决（三类/四类红线/≤10 行）」、「Task Manager Qualification」这三个对外必现机制**都没有对应关键词**——把 `概览:38`（何时起体系整段）或 `概览:86-94`（TM 资格整节）整段删掉，`check-sync.sh` 仍会报 `SYNC-OK`。这与 `AGENTS.md:74`「漏更新概览＝体系更新未完成」的红线不匹配。
- **建议改法**：关键词表补 `半套最差`、`四类红线`、`≤10 行`、`Task Manager Qualification`、`window_subagent`、`channel_cli`；并把清单从 `for kw` 手工枚举改为**按机制分组**（如 `Gate 条件组`／`汇报纪律组`／`客户端无关组`／`TM 资格组`），每组至少一个词，减少后续新增机制漏补的概率。

#### P1-12｜老项目 015／017 正文残留已废止的旧升级口径，与新区块并存

- **定位**：`/Users/zzymima0000/Developer/coding/1.Active/015-ing-photo-library/AGENTS.md:68`、`017-ing-RSS聚合-个人信息雷达/AGENTS.md:148`
- **原文对照**（旧节）：「触发：① **builder 同一任务连续失败 2 次**自动升 ② 编排者判定 P0-hard 手动升」
- **原文对照**（同文件新区块／新节）：
  - `017:75-77`（新节）：「触发：① 同一 Task 累计被 **supervisor 打回 2 次**自动升（**QA 挂不算**，只算 supervisor 打回）」
  - 区块 `:13`：「本项目 AGENTS.md 的其余内容（项目专属规矩）保持原样，**冲突时以本区块为准**」
- **矛盾点**：`017` 的 AGENTS.md 有**两个 `## 升级` 节**（`:75` 新口径、`:146` 旧口径），`:148` 明确写「builder 连续失败 2 次」——与新口径「supervisor 打回 2 次」是**两个不同的计数对象**（builder 自身失败 vs supervisor 打回），按哪份执行会得出不同的升级时机。而**区块里没有升级条目**（见 P1-1），所以「冲突时以本区块为准」这句仲裁**对升级口径不生效**，两份矛盾文本同时留在同一文件里。`018/019/020/025` 同样有两个 `## 升级` 节（但无旧措辞残留）。
- **建议改法**：在区块补一条升级口径（计数单元＝同一 task id、只数 supervisor 判 FAIL／打回、QA 自身 FAIL 不计、senior 接手后 2 次停线找人），让仲裁句真正覆盖到升级；并给 `sync-old-projects.sh` 加一步「区块更新后扫描项目 AGENTS.md 是否仍存在与区块冲突的旧口径关键词（如 `builder 同一任务连续失败`），命中则打印告警列表」，把这 2 个项目列进待清理。

#### P1-13｜`check-ledger.mjs` 的 KNOWN_MODELS 白名单缺现役 `codex/gpt-6.1-sol`

- **定位**：`scripts/model/check-ledger.mjs:18-29`；`USER_MODEL_OVERRIDE.md:14,42`
- **原文对照**：`check-ledger.mjs:18-21` 列出 `"codex/gpt-6-sol", "codex/gpt-6-luna", "codex/gpt-5.6-luna", "codex/gpt-5.6-terra", "codex/gpt-5.6-sol"`——**无 `codex/gpt-6.1-sol`**。而 `USER_MODEL_OVERRIDE.md:14` 的 senior-expert 行正是 `codex/gpt-6.1-sol`（`:42` 调用档案标 ✅ 真调已过）。
- **实证**（已实跑）：构造一行 senior 记账 `{... "role":"senior-expert","model":"codex/gpt-6.1-sol" ...}` 跑 `node scripts/model/check-ledger.mjs` → 输出两条 `WARN unknown model="codex/gpt-6.1-sol" (前缀合法但不在已知表，请核 USER_MODEL_OVERRIDE)`，两账各一条。
- **矛盾点**：`AGENTS.md:69` 声明「合法写法白名单见 `scripts/model/check-ledger.mjs`」，把该脚本当作模型写法的正典；而现役 senior 模型恰好不在白名单里 → 每次派 senior 都产 2 条 WARN 噪音，久了会让 supervisor 忽略全部 WARN（脚本 `:4` 定义 WARN 是「供 supervisor 抽查」，噪音会摧毁抽查价值）。WARN 不影响 exit 0，故不会阻断，但也说明白名单与表已脱节。
- **建议改法**：把 KNOWN_MODELS 改为**从 `USER_MODEL_OVERRIDE.md` 表 + 调用档案段自动抽取**（同 P1-7 的思路：单一真源在表，脚本只做格式校验与「不在表内」的 WARN），避免每次换模型都要手改两处。若暂不改抽取，至少补 `"codex/gpt-6.1-sol"` 并把该白名单加进 `check-sync.sh` 的校验链（当前 `scripts/model/check-ledger.mjs` 已在 `:31` 列表内，会随包同步，但白名单内容仍靠人工维护）。

#### P1-14｜`supervisor.md` 的 Phase Integrity 六查未覆盖 Product-reviewer Phase2 不派 / 新派工口 / 通道预检三项本轮机制

- **定位**：`docs/roles/supervisor.md:44-51`；`AGENTS.md:44,48`
- **原文对照**：六查为 ①PLAN 禁 Builder/QA ②WAITING 禁自动开发 ③DEVELOP 必有 DEV_BASELINE ④C 类禁绕 Controlled Reopen ⑤TM 停摆沿用 watchdog ⑥状态机四态合法。第 7 条（`:51`）只抽查产品验收矩阵。
- **缺口**：
  1. 六查 ①只写「禁 Builder/QA 业务派工」，**没写禁 code-reviewer**，也**没写 Phase2 默认不派 product-reviewer**（`AGENTS.md:15,44` 明文规定）。抽查第 1 条的判据比规则原文窄。
  2. 六查里**没有「派工口是否由 `detect-client.sh` 探测决定、而非人工填表」**这一条——`概览:125`（审查者检查点 10）要求审「派工口是否由探测决定」，但执行层的 `supervisor.md` 无对应抽查位 → 该机制无人监督。
  3. 六查里**没有「派工前是否跑过 `check-channel-preflight.sh` 且非 CHANNEL-STALE」**这一条——`AGENTS.md:48` 把它定成硬门禁（`CHANNEL-STALE`＝该角色禁派），但 `supervisor.md:44-51` 的 Phase Integrity 与 `:25` 的抽查清单都不含它。
- **矛盾点**：本轮新增的两项硬机制（自动探测派工口、通道预检禁派）在监督层没有抽查位 → 规则写了但没人验，实质是「声明式治理」。叠加 P0-2（老项目连脚本都没有），这一项在老项目侧完全落空。
- **建议改法**：六查各条**只加编号不删**（保持与 `AGENTS.md:44` 既有编号稳定），新增第 8 条「派工口合规」、第 9 条「通道预检合规（CHANNEL-STALE 时是否禁派；脚本缺失时按 P0-2 的处置口径）」；并把六查 ①补全为「禁 builder／code-reviewer／qa／业务改动／Release，Phase2 默认不派 product-reviewer」。

---

### P2

| # | 定位 | 问题与建议 |
|---|---|---|
| **P2-1** | `README.md:40` | 标题写「根目录（现行11）」，其下只列 6 项；根目录实际有 17 项（含 `agent.md`、`README.en.md`、`ORCA治理体系说明.md`、`.agents/`、`skills-lock.json`）。标题数字与清单不符，且**概览文件 `ORCA治理体系说明.md` 未进根目录清单**——而它是三件套第 2 步的强制产物（`AGENTS.md:74`），入口文档漏列它会影响「同步概览」这步的执行。建议：清单补齐并去掉硬编码的「现行11」（改为「根目录」）。 |
| **P2-2** | `README.md:52` | 「其动态角色论与**十卡制**冲突，不采用」——但同句所指的文件 `docs/prompts/Orca 通用编排者持续推进协议.md:4` 自己在 2026-09-21 后已改为「固定**十一卡制**（9+1＋1）」。README 保留了旧数字。建议：改为「十一卡制（9+1＋1）」。 |
| **P2-3** | `docs/roles/product-reviewer.md:1`、`scripts/detect-client.sh:13`、`AGENTS.md:44`、`USER_MODEL_OVERRIDE.md:45`、区块 `:31` | 三处别名/清单漂移：①`product-reviewer.md:1` 标题写「product-reviewer（Research Reviewer / **研究审查者**）」，第三个别名只此一处，其余 8 处统一用「Research Reviewer」；②`detect-client.sh:13` 的已校准清单是 **7 个**（含 `CodeArtsAgent`），`AGENTS.md:44` 与 `USER_MODEL_OVERRIDE.md:45` 与区块 `:31` 都只列 **6 个**（无 CodeArts Agent），而 `README.md:11` 列 **7 个**（含 CodeArts Agent）；③「研究审查者」这个中文别名无处交叉引用。建议：删掉第三个别名（或在 `AGENTS.md:13` 正式承认）；已校准客户端清单统一为 7 个并抽成一处常量/一处文本，`AGENTS`／`override`／区块／README 四处同源。 |
| **P2-4** | `scripts/check-channel-preflight.sh:83` | 「§5 最低客户端版本」用 `minreq=$(grep -oE '0\.[0-9]{2,}\.[0-9]+' "$TBL" \| head -1)` 从表里取**第一个**版本号。当前 `USER_MODEL_OVERRIDE.md:14` 中 `0.159.2` 恰在 `0.155.1` 之前所以取对，但这是**顺序依赖**：任何人调整表内行序或先提到 `0.155.1`，预检就会拿旧版本当门槛、给出错误的 OK/WARN。建议：改为锚定 senior-expert 行（`grep -oE` 限定在该行内取），或改为解析 `TASK-MODEL` 行后取 max。 |
| **P2-5** | `scripts/check-sync.sh:37` | `scripts/orchestration/README.md` 的差只 `echo` 计数、不置 `fail`（`:34` 注释却写「白名单外零容忍」）。实测当前差 2 marker 通过；若差 3 marker 仍 `SYNC-OK`。建议：与 AGENTS 同机制处理（`[ "$n" = "2" ] \|\| fail=1`），否则删掉该行以免误导。 |
| **P2-6** | `docs/roles/task-manager.md:17`、`docs/prompts/编排者提示词.md:30`、`ORCA治理体系说明.md:40` | 自决清单细项在下游三处被删减：`AGENTS.md:99` 的自决清单有 **5 类**（已合并本地分支删除／未跟踪残留／临时文件与日志／已 gitignore 的工具目录；文档·账本格式小错与状态表落后；调试密钥文件；既有 warning；备份与旧文件单列于 `:100`），而 `task-manager.md:17` 保留了「已 gitignore 工具目录」但**删了「文档/账本格式小错与状态表落后」**；`编排者提示词.md:30` 与 `概览:40` **两类都删了**。这类删减方向是「更容易拿去问用户」，与 `AGENTS.md:99` 的意图相反。建议：三处补齐，或统一改为「自决清单以 `AGENTS.md:99-100` 为准，本处不复述」。 |
| **P2-7** | `scripts/check-sync.sh`（整体） | 只比内容不比**权限位**。`scripts/detect-client.sh` 在母版与两包均为 `-rwxr-xr-x`（已实测），靠人工保持；若某次同步丢了可执行位，`bash scripts/detect-client.sh` 仍能跑（`AGENTS.md:44` 用的就是 `bash` 前缀）故不致命，但 `check-sync.sh`／`weekly-channel-check.sh` 的 shebang 直跑会失败。建议：加一条 `[ -x "$f" ]` 断言（仅对 `*.sh`）。 |
| **P2-8** | `scripts/model/check-ledger.mjs:56` | `ROLES` 枚举含 `"迁移整理工"` 与 `"orchestrator"` 两个**不在 9+1＋1 角色集合内**的值（`AGENTS.md:20-22`）。它们只用于校验 `executed_by` 字段，作为「执行者可以是编排流程里的非角色身份」是合理的，但会让 `executed_by` 的合法取值集合（13 个）大于角色集合（11 个），且 `orchestrator` 是 `task-manager` 的英文别名（两个值指同一人）→ 统计时会分裂成两类。建议：保留 `迁移整理工`，把 `orchestrator` 改为 `task-manager` 的别名并在脚本注释说明二者等价。 |
| **P2-9** | `scripts/model/check-ledger.mjs:97` vs `AGENTS.md:73`、`docs/roles/supervisor.md:30` | DISPATCH 的必需键集合三处不一致：`AGENTS.md:73` 的 schema 含 `note`（写明「note（切备时…）」）、`supervisor.md:30` 的 `req` 含 `'note'`、`check-ledger.mjs:97` 的 need **不含 `note`**（只有 date/task/role/model/used/runtime/result 7 项）。即 `check-ledger.mjs` 允许无 `note` 的行通过，而 supervisor 的第二道校验会判它缺键 → 两道门禁强度不一致。建议：以 `AGENTS.md:73` 为准把 `note` 补进 `check-ledger.mjs:97`（`note` 是切备记账的载体，缺了无法回溯为什么没用主模型）。 |
| **P2-10** | `scripts/_inject-agents-block.py:32` vs `AGENTS.md:7` | 区块「何时起本体系」对**老项目**说「命中任一才算大项目，按包内 README＋归位表**铺包**进项目根再开工（禁"复制一份规则再改"）」，但 `AGENTS.md:7` 明确「**老项目不重铺**：已注入 `ORCA-RULES-BLOCK` 区块的老项目直接开工，规则变更由母版 `sync-old-projects.sh` 铺开」。老项目的 TM 读自己 AGENTS.md 顶部的区块，会得到「要铺包」的错误指令。建议：区块该条改为按项目类型分支——「**已注入本区块的老项目直接开工，不重铺包**；仅全新空项目才按包内 README＋归位表铺包」。 |
| **P2-11** | `docs/review/RESEARCH_REVIEW.template.md:1-19` vs `docs/pm/PRODUCT_PLAN.template.md:17-19,38,39` | Phase1 唯一的评审落盘模板里**没有**「视觉与交互验收标准逐条核对」「关键 AC 集合是否非空」「发布类型是否已定」这三个评审项——而 `PRODUCT_PLAN:19` ③要求「进 Human Review 前必核」①②③④、`PRODUCT_PLAN:38` 要求关键 AC 集合非空、`PRODUCT_PLAN:39` 要求发布类型 Phase1 定死。结果：Research Reviewer 的输出（`RESEARCH_REVIEW.template.md`）里**没有位置**记录这三项的核对结论，Phase1 链上最该抓「计划缺项」的角色反而无字段可填，缺项只能靠 `task-manager.md:10` 自查发现（而该处枚举正好缺 AC 条件，见 P1-8）。建议：`RESEARCH_REVIEW.template.md` 增三行——「AC 覆盖核对（非空／每条用户可见要求已关联／关键标定合规）」「关键 AC 集合（N 条，非空）」「发布类型（首次发布／迭代更新／局部修复）」，并列入 `AGENTS.md:32` 的「谁写哪」模板说明。 |

---

## 三、已核对一致项清单（无需改动）

1. **角色集合**：`AGENTS.md:20-22` 的 9+1＋1 11 个角色名 ＝ `docs/roles/` 实存 11 张卡 ＝ `USER_MODEL_OVERRIDE.md:5-15` 实存 11 行 ＝ `README.md:51` ＝ `概览:8,84`。无幽灵角色、无遗漏、无旧 ID 残留。
2. **显示名映射**：`product-reviewer`（内部 ID）↔ `Research Reviewer`（显示名）在 8 处一致（`AGENTS.md:13,22,32`、`product-reviewer.md:1`、`RESEARCH_REVIEW.template.md:1`、`task-manager.md:10,12`、`编排者提示词.md:15`、`概览:18`）；`check-ledger.mjs:54-55` 的 ROLES 用内部 ID，正确。
3. **状态机四态**：`PROJECT_PHASE: PLAN / WAITING_HUMAN_APPROVAL / DEVELOP / PLAN_REOPEN_REQUIRED` + 「仅 Change C 受控重开期间」限定语，在 6 处逐字一致。
4. **`PLAN_GATE` 三值**、`**`DEV_BASELINE` 格式**、**`CHANGE_REQUEST: NONE/A/B/C`**：在模板／HANDOFF／角色卡／提示词／AGENTS 间一致。
5. **三个口令字面**：`第一阶段，计划`／`第二阶段、开发`／`变更请求：……` 在 5 个文件 12 处完全一致。
6. **Phase1 派工链**（Planner→Research Reviewer→Planner→…→Readiness→Human Gate）与 **Phase2 主链**（Builder→Reviewer→QA→Supervisor→TM）在 4 处一致；product-reviewer 的「Phase1 才派／Phase2 默认不派」在 4 处一致。
7. **升级口径（母版）**：计数单元＝同一 Task、只数 supervisor 打回、QA 自身 FAIL 不计、senior 接手后 2 次停线找人、升 senior 换新链——在 `AGENTS.md:18,60-63`、`概览:28`、`task-manager.md:8`、`builder.md:11`、`senior-expert.md:3,6`、`db-admin.md:8`、`编排者提示词.md:11,26` 共 12 处一致，无旧口径残留。
8. **TASK 账本 11 必需键** ＝ `check-ledger.mjs:93-94` ＝ `supervisor.md:8`；`result`/`escalated` 枚举、`rework` 必须 int 非 bool 三处一致。
9. **`chain_status` 三态口径**（`DELIVERED`/`ACCEPTED`/`OPEN` + 判不准取 OPEN + 不得因 PASS 就记 ACCEPTED + 首次发布待签收记 OPEN）：`AGENTS.md:69-70` ＝ `check-ledger.mjs:53,78`。
10. **示例行口径**：「首个真实任务/派工前删除、不参与统计」在 `AGENTS.md:68`、`README.md:56`、`check-ledger.mjs:88-91`、`迁移整理提示词.md:22` 一致；实跑 `check-ledger.mjs` 对「只有示例行」判 FAIL，与规则一致（母版自身两账均只有示例行，故母版跑该脚本 exit 1 —— 这是**预期行为**，非缺陷，但需注意 `task-manager.md:6`「收工前必跑 check-ledger.mjs，不过不许说完事」在母版场景下永远无法通过，见「无法判定项」U-3）。
11. **产品验收字段三件套**：PRODUCT_PLAN 的「视觉与交互验收标准」/「关键 AC 集合」/「发布类型」三字段与其判定后果，在模板、`HANDOFF.template.md:17-18`、`qa.md:19`、`AGENTS.md:44,70,108`、`概览:34`、区块 `:23` 全一致（含「签收属 Human Gate 范畴、不新增 QA Gate」这句定位，7 处措辞一致）。
12. **BUGS 追踪矩阵 11 列** ＝ `qa.md:19-22` 所述 ＝ `supervisor.md:51` 抽查口径；状态枚举 `PASS/FAIL/DEGRADED/未测/人工判定` 与「`人工判定` 是中间态、终态必须落 PASS 或 FAIL、未判记 `未测`」在 `BUGS.template.md:9,15` ＝ `qa.md:19`。
13. **qa 八查**（`qa.md:3`：unit/build/lint/API/logs/regression/DoD/产品验收）＝ `概览:101` 所称「第八查」；**不可放行三情形**（`qa.md:18`）＝ `概览:33` ＝ 区块 `:21`。
14. **汇报纪律六处口径**：三类必报、自决清单、四类红线、≤10 行＝三行心跳＋≤3 要点、禁全量倾倒、啰嗦按违规打回——`AGENTS.md:98-102` ＝ `task-manager.md:17` ＝ `编排者提示词.md:30` ＝ `supervisor.md:53` ＝ `概览:40` ＝ 区块 `:26-30`。四类红线边界（secrets／删用户数据与不可逆删除／生产·数据库·他项目／commit·push 与远端写入，且「不做也不上报」）在 6 处一致，无「必须问」与「不问」的边界冲突。
15. **派工口自动探测六处一致**：跑 `detect-client.sh`／不找用户填／`window_subagent` vs `channel_cli`（保守默认）／只带一句汇报／不套娃／禁自动更新——`AGENTS.md:44`、`编排者提示词.md:10`、`USER_MODEL_OVERRIDE.md:5,11,45`、`task-manager.md:16`、区块 `:31`、`概览:38`、`README.md:11,18` 全部一致；**无「必须本窗口 subagent」的旧硬约束与新规则并存**（`AGENTS.md:51` 的 Runtime 插座、`builder.md:7` 均为通道无关表述）。
16. **`README.md:7` 开工读盘顺序**（AGENTS→角色卡→override→HANDOFF→经验一句话→任务目标最后）与 `HANDOFF.template.md:25-27` 恢复读盘顺序、`编排者提示词.md:12`、`AGENTS.md:90` 缓存五条静态打头，四处一致。
17. **两包镜像**：除已知两处布局裸名差（`AGENTS.md:44`、`scripts/orchestration/README.md:3`）与 P1-10 首行那处**未被捕获的真实差异**（`Orca 通用编排者持续推进协议.md:7`）外，`diff -rq` 全量比对：`docs/roles/*.md`、`docs/sop/*.md`（含本轮新增 `background-services.md`）、7 份 template、4 份 model 文件、`tm-qualification.mjs`/`.test.mjs`、`scripts/model/check-ledger.mjs`、`scripts/decision/**`、`scripts/detect-client.sh`、`USER_MODEL_OVERRIDE.md`、`README.md`、`经验一句话.md`、`ORCA治理体系说明.md`、`归位表.template.md`、`GOVERNANCE_VERSION`、`scripts/orchestration/coordinator-watchdog-standalone.sh`、`scripts/model/fixtures/**` 全部一致。`check-sync.sh` 实跑 `SYNC-OK`（exit 0）。
18. **`sync-old-projects.sh` ↔ `migration-status.sh` 脚本间一致**：`RULES_VERSION` 同为 `2026-10-03-客户端无关`（前者 `:17`、后者 `:7`）；`PROJECTS_ROOT` 默认同路径；跳过规则同（`:63`／`:17`）；准入条件同（`:64`／`:18`）；`STAMP=2026-10-03`（`:16`）与区块头注入的 `stamp` 一致。
19. **`detect-client.sh` 与包内副本字节一致**（三处 `diff` 无输出），且均 `-rwxr-xr-x`；脚本为纯 ASCII（符合 `agent.md:19` 的「治理脚本一律纯 ASCII」自定约束）。
20. **`tm-qualification.test.mjs` 实跑 17/17 全绿**（含 ledger 好/坏例、采样门槛、Stall、Human Gate 硬失败、错误路由、切换区分、infra 分离、评分确定性），`REQUIRED` 字段与 `TASK-MANAGER-QUALIFICATION.md:28` 的事件字段一致；`ANOMALIES`/`SWITCH_REASONS`（`tm-qualification.mjs:17-19`）＝ `AGENTS.md:85` ＝ 规范 `:33-34`；五维权重 30/25/20/15/10 在 3 处一致；响应阈值 300/900s 锚定 watchdog 常量一致。
21. **注入区块与母版的重合条目逐条一致**：产品验收三情形＋视觉最小覆盖＋首次发布签收（区块 `:18-23` ＝ `qa.md:18,22` ＝ `概览:33,34,78`）、跨目录禁令（区块 `:25` ＝ `AGENTS.md:49`）、汇报与自决四类红线（区块 `:29` ＝ `AGENTS.md:101`）、三件套（区块 `:24` ＝ `AGENTS.md:74`，且正确标注「老项目无两包概念，母版的同步两包＋更新对外概览不适用」）、红线三条（区块 `:33` ＝ `AGENTS.md:107-108,110`）。**区块本身与母版无矛盾表述**——问题在覆盖面（P1-1）与字段名（P1-2），不在内容冲突。
22. **老项目抽验（3 个：017 / 037 / 040）**：`docs/roles/task-manager.md`、`supervisor.md`、`qa.md`、`docs/qa/BUGS.template.md`、`docs/pm/PRODUCT_PLAN.template.md`、`docs/review/RESEARCH_REVIEW.template.md`、`docs/handoff/HANDOFF.template.md`、`scripts/model/check-ledger.mjs`、`scripts/detect-client.sh` 全部**与母版字节一致**；区块内容与 `_inject-agents-block.py` 的 BLOCK 模板逐行一致（`{stamp}`/`{version}` 渲染后比对，33 个项目仅 BEGIN/END 两个占位符差异，属脚本渲染方式，非内容差）。

---

## 四、无法判定项与原因

| # | 事项 | 为什么无法判定 |
|---|---|---|
| **U-1** | 老项目各自「实绩 Plan 是否已补『视觉与交互验收标准＋关键 AC 集合＋发布类型』」 | 需要逐项目读其 `docs/pm/` 实绩 Plan 才能判定，属项目 TM 自查范围（区块 `:35` 已明确列为「存量项目待办，不自动做」）。本次为只读治理审查，未读 32 个项目的实绩 Plan；`migration-status.sh:24-25` 的 `AC已补` 列显示 32 个项目全为 `否`，可作为「尚未补」的间接证据，但该字段是脚本硬写的 `product_acceptance_ac_added: false`（`sync-old-projects.sh:125`），非真实读 Plan 得出，故不足以判定实际状态。 |
| **U-2** | 老项目正文里「本窗口内派 subagent，全自动（默认派工口…）」这类 2026-09-29 快照文字，是否构成对区块 `:31`（自动探测）的**实质冲突** | 区块 `:13` 声明「冲突时以本区块为准」，从仲裁规则看区块胜出，故不构成 P0。但这些项目正文里的 `scripts/check-channel-preflight.sh` 引用（P0-2）与「不重铺包」冲突（P2-10）**没有仲裁句覆盖**，属可判定问题；而「本窗口内派 subagent」一句在 `mode=window_subagent` 下恰好结果相同、在 `channel_cli` 下会误导。因需逐项目判断其正文快照的具体版本与生效范围，未穷举 32 个项目全文，故整体判为「无法逐条判定」，只对 017/040/041 抽验后确认。 |
| **U-3** | 母版自身跑 `check-ledger.mjs` 恒 `exit 1`（两账仅示例行）是否算缺陷 | 规则上「示例行首个真实任务前删除」是**项目**义务，母版按 `agent.md:13` 的设计「母版两账保持仅示例行（母版不记实绩）」，因此母版永远过不了自己的校验。这与 `README.md:56`、`迁移整理提示词.md:23` 的「迁移后须得 LEDGER-OK」不冲突（那是针对**被迁移的项目**）。但 `docs/roles/task-manager.md:6` 写「收工前必跑 `node scripts/model/check-ledger.mjs`，**不过不许说完事**（测试/真实项目一律记账，无例外）」——在母版场景下这条永远无法满足。**需用户裁定**：母版是否应被豁免。建议：脚本对「两账均只有示例行且项目名＝本仓根名」判 `LEDGER-OK (母版)` 放行，或在 `task-manager.md:6` 补一句母版豁免。因涉及口径决策，列为无法判定。 |
| **U-4** | `scripts/check-sync.sh:31` 里 `scripts/decision/*` 的长列表存在重复项（`partition-validate.mjs`、`test-slow.mjs`、`test-partition.mjs`、`partition-validate.mjs`、`test-secrets.mjs`、`build-index.mjs` 各出现 2-3 次） | 重复项**不产生功能影响**（`diff -q` 幂等），且 `:32` 的 `diff -rq scripts/decision` 已覆盖整个目录。是否属有意冗余（防止漏列）还是手误累积，需看提交意图；本次不判为问题，仅记录。 |
| **U-5** | 两包内 `docs/plan/` 空目录（新项目模板包有、老项目包无）是否应清理 | 与本次一致性主题（规则矛盾）不同，且 `.gitignore`／`temp` 处置属 neat-freak 范围。仅记录，不判级。 |
| **U-6** | `agent.md`（未跟踪新文件）的定位 | 该文件是给「接续开工」的编排者提示，内容为现状快照（老项目 32 个、commit 号、HANDOFF §67 等），带大量会过期的实况。它既不在 `README.md` 根目录清单（P2-1），也不在两包内，`check-sync.sh` 也不校验。是否应长期存在于治理母版根（或应移入 `temp/`），需用户裁定，列为无法判定。 |

---

## 五、给编排者的下一步（按优先级）

1. **先修 P0-2**（把 `check-channel-preflight.sh` 铺到 31 个老项目，或把该门禁在老项目侧显式豁免）——这是唯一会让老项目编排者**无法执行硬规则**的问题。
2. **再修 P0-1**（check-sync 白名单改为归一后逐字节比对，或至少把 3 处「第 37 行」更正为第 44 行）——同步门禁现在可被单行绕过，且人工兜底也指错行。
3. **修 P1-10 首行的已存在差异**：母版 `docs/prompts/Orca 通用编排者持续推进协议.md:7` 的「9+1」应为「9+1＋1」（两包已对，母版落后）。
4. **修 P1-8**（Gate 6 项补齐到 4 处下游文件）——这是产品验收整改的封口条件在下游被削掉的最后一处，且直接影响「能否进 Human Gate」的判据。
5. **修 P1-5／P1-6**（把 4 份提示词＋`GOVERNANCE_VERSION`＋`background-services.md` 加入同步清单，并把三份「铺哪些文件」的清单改为脚本单一真源）。
6. **修 P1-7／P1-13**（runtime 枚举与 KNOWN_MODELS 改为从 override 表派生）——本轮改动引入的新矛盾，且都是「照表填就被自己的校验打回」的类型。
7. 其余 P1 按 `sync-old-projects.sh` → 两包同步 → `check-sync.sh` → `check-channel-preflight.sh` 的顺序处理；P2 可与 neat-freak 收尾合并一轮。
8. 本报告本身**未改动任何治理文件**（唯一写入为本文件 `docs/review/RESEARCH_REVIEW-2026-10-05-体系一致性审查.md`），全部脚本只跑不改（`check-sync.sh`、`check-ledger.mjs`、`tm-qualification.test.mjs` 为只读校验；`sync-old-projects.sh` 未执行）。