# ORCA 治理体系全量审查报告

- **审查日期**：2026-10-17
- **审查模型**：`volcengine-plan/ark-code-latest`（显示名 ark-code-latest）
- **审查对象**：本项目（ORCA 多智能体编排治理体系：母版 + `新项目模板包/` + `老项目迁移模板包/`），工作区含 2026-10-17 未提交改动
- **审查方式**：全量只读通读（AGENTS / README / 概览 / USER_MODEL_OVERRIDE / CHANGELOG / docs/roles / docs/sop / docs/model / docs/prompts / scripts / 两包）＋ **实跑门禁与回归套件** ＋ 对真实老项目目录现场核对 ＋ 对新项目脚手架现场复现

---

## 一、总体结论

**建议：有条件通过（PASS_WITH_FIXES）。**

体系**账本侧与门禁侧**已从「纸面规则」实质推进到「机器卡点」——`check-ledger.mjs`、`check-sync.sh`、`check-channel-preflight.sh`、`check-product-review.sh`、`pre-commit-guard` 与 8 套回归（含保留夹具）均真实存在，**本次全部复跑通过**（见 §四.1）。这直接回应你「不要停留在口头报告」的要求。

但仍发现 **4 项 P1 ＋ 8 项 P2** 的可落实性缺口与前后矛盾：

1. **新规则铺不下去**：`sync-old-projects.sh` 铺开清单未含本轮新增的 4 份 APP SOP 与 8 个治理脚本，**18 个已铺老项目实测拿不到新规则与新卡点**（028/040 现场核对为证）。
2. **新项目第一道门恒红**：按 README 步骤新建项目后 `check-ledger.mjs` **必然 FAIL**（`APP-TRUEOUT-SOURCE-UNRESOLVED`），与 README「期望 LEDGER-OK」直接矛盾，且报错信息与事实不符。
3. **部署细节自相矛盾/未同步**：`pre-commit-guard` 在项目仓也用 `--allow-example`；`check-product-review.sh` 只校验 3 段锚点却要求 5 段；概览仍写「HANDOFF 现至 §71」（实为 §89）；README 规则层清单、HANDOFF 模板、AGENTS 红线枚举各有陈旧表述。

**放行条件**：修完 §二 的 P1（G1–G4）后建议通过；P2 可合并下一轮，其中 G5、G7 属对外/对模板的错话，建议本轮顺手修。

---

## 二、问题清单（按优先级）

### P1｜必须修，否则规则落不了地或恒红

#### G1｜老项目同步清单漏铺新 SOP 与新治理脚本 → 已铺老项目拿不到新规则

- **证据**
  - `scripts/sync-old-projects.sh:33-82` 的 `FILES` 手写枚举里，`docs/sop/` 只列了 `android-machine-profile / android / app-theme-i18n / decision-router / docker / sqlite / supabase / webqa / background-services`，**缺 `app-brand-assets.md`、`app-navigation.md`、`app-ui-layers.md`、`app-simplicity.md`**；脚本 143-153 行的「自动枚举」只补 `scripts/model` 与 `docs/model`，**不覆盖 `docs/sop`**。
  - `FILES` 也**没有** `scripts/pre-commit-guard.sh`、`scripts/check-product-review.sh`、`scripts/check-sync.sh`、`scripts/migration-status.sh`、`scripts/orca-*.sh`、`scripts/restore-framework.sh`（这些已由 `_sync-packages.py` 收进两包，但老项目走的是 `sync-old-projects.sh`，不是两包）。
  - **现场核对**：`1.Active/028-…/docs/sop/` 无 `app-brand-assets / app-navigation / app-ui-layers / app-simplicity`；`1.Active/028-…/scripts/` 与 `1.Active/040-…/scripts/` 均**无** `check-product-review.sh`、`pre-commit-guard.sh`、`restore-framework.sh`、`check-sync.sh`。
- **影响**：AGENTS/概览明文「老项目不重铺，规则变更由母版 `sync-old-projects.sh` 铺开」。清单漏项 ⇒ 旧项目照 AGENTS 执行时会 `no such file`，或根本没有 APP 品牌/导航/信息分层/简化这四道 SOP；新增的三道账本真门在老项目无脚本可用。这是「有体系、铺不下去」的典型。
- **建议**：至少把这 4 份 SOP 与上述脚本补进 `FILES`；更稳的做法是像 `scripts/model` 一样**从老包自动枚举 `docs/sop/*.md` 与治理 `scripts/*.sh`**，杜绝下轮再漏。

#### G2｜新项目首次 `check-ledger` 必 FAIL，与 README 承诺矛盾

- **证据**：按 `README.md:49-66` 步骤新建空项目（整包拷 `新项目模板包/` ＋ 删 `_example` 行）后跑 `node scripts/model/check-ledger.mjs docs/model`，**实测 EXIT=1**：

  ```text
  TASK-MODEL-LOG.jsonl: 空账本（首个真实任务/派工前正常）
  DISPATCH-LOG.jsonl: 空账本（首个真实任务/派工前正常）
  APP-TRUEOUT-SOURCE-UNRESOLVED — docs/handoff/HANDOFF.md 不存在，无法判定需求真源。
  docs/pm 下有 Product Plan 但无法确认哪份是真源…
  ```

  而 `README.md:66` 明写该命令「期望 `LEDGER-OK`」。
- **根因**：`scripts/model/check-ledger.mjs` 在 `!src` 时**无条件** `fails.push(...)` 并 `return`，未先判断 `cands.length`。新项目 `docs/pm/` 只有 `*.template.md`（被过滤），**实际并无 Product Plan**；报错里「docs/pm 下有 Product Plan」与事实不符。
- **影响**：每个新项目的**第一道**机器门就恒红 ⇒ 编排者要么误判体系坏了，要么按错误提示去乱补 `HANDOFF.PLAN_VERSION`；`check-ledger` 的权威性被削弱。
- **建议**：改为 `if (!src && cands.length) { … }`（无候选计划即跳过本检查），并把报错文案与判定条件对齐；同步更正 README 与 `docs/model/NEXT-TASKS.md` §C 的「既有遗留」表述。

#### G3｜`pre-commit-guard.sh` 在项目仓也用 `--allow-example`，削弱项目侧强制力

- **证据**：`scripts/pre-commit-guard.sh:45-57` 硬编码 `node scripts/model/check-ledger.mjs docs/model --allow-example`。脚本注释自承「本仓是母版…若你在项目仓，请改用对应项目路径」，但脚本会被分发进新项目（`_sync-packages.py` EXTRA 已收）——项目提交时同样带 `--allow-example`，于是**「示例行未删」在项目侧 commit 时不再拦**。
- **影响**：AGENTS/README 明写「真实项目禁用 `--allow-example`，否则等于放过『示例行未删』」，而唯一自动化入口恰好违反该禁令 ⇒ 母版与项目行为分叉，强制力被自伤。
- **建议**：按环境判定（母版才加 `--allow-example`，项目仓不加），或改为「仅当账本**只含 `_example` 行**时降级」；用 `gates.test.mjs` 已有沙箱补一条回归。

#### G4｜`check-product-review.sh` 只校验 3 段锚点，却要求 5 段

- **证据**：`scripts/check-product-review.sh:29-31` 只 `grep` `PRODUCT_REVIEW_CONSENSUS / _DIVERGENCE / _REJECTED`；但同脚本 34 行提示、`AGENTS.md:69` 与概览检查点 20 均要求 **5 段** `…_CONSENSUS / _DIVERGENCE / _ONLY_A / _ONLY_B / _REJECTED`。
- **影响**：汇总缺「仅 A / 仅 B」两段仍可 exit 0 放行 ⇒ 「汇总不得抄边」没有机器约束，与 2026-10-07 事故教训初衷不符。
- **建议**：补 `_ONLY_A`、`_ONLY_B` 两个锚点（`gates.test.mjs` 的 `PRODUCT_REVIEW_V1.0_good.md` 已含全部 5 段，补校验不误伤）。

### P2｜应修，属前后矛盾 / 陈旧 / 可绕过

#### G5｜概览与 CHANGELOG 关于 HANDOFF 章节号的说法过期且与事实不符

- **证据**：`ORCA治理体系说明.md:168` 仍写「状态源（新节顺延，**现至 §71**；…新节自 §72 起顺延）」，而 `docs/handoff/HANDOFF.md` 实际已到 **`## 89.`**（中段还有 §85/§84 逆序、§83.5 等）。本轮 `CHANGELOG.md` 顶部却自称「修…HANDOFF 章节号过期」——**本轮 diff 并未改动该行**，属「报告声称已修、实际未修」。
- **影响**：概览是对外/对审查者的一页纸，章节号错误让人找不到最新节。
- **建议**：改为不写死数字（「编号见文件，旧号冻结不重排」）或改为实际 §89；同步 CHANGELOG 措辞。

#### G6｜README「非空目录规则层清单」未含新增硬引用脚本

- **证据**：`README.md:69-71` 规则层仅 8 份，缺 `scripts/pre-commit-guard.sh`、`scripts/check-product-review.sh`、`scripts/codebuddy-auto.sh`（+`_cb-*.py`）、`scripts/model/model-perf.mjs`；而 AGENTS 已硬引用 `check-product-review.sh`、override 已硬引用 `codebuddy-auto.sh`。
- **影响**：人工给「非空目录」铺包会漏，导致后续「照 AGENTS 执行」时 `no such file`。
- **建议**：与 `_sync-packages.py` EXTRA 治理脚本对齐，或改为「整包覆盖规则层」并指定权威清单单一真源。

#### G7｜HANDOFF 模板仍写「neat 派完后 TM 补记」，与 neat-freak 不派工矛盾

- **证据**：`docs/handoff/HANDOFF.template.md:23`：「收尾记一笔（neat-freak：…；**neat 派完后** TM 补记…）」。该模板随两包分发，而 neat-freak 已于 2026-10-16 改为编排者自做不派工（`AGENTS.md:61`、概览「两个收尾角色已改为编排者自做」）。
- **建议**：改为「收尾记一笔（编排者自做 neat-freak 口径：…）」。

#### G8｜AGENTS 红线里的 `docs/sop/` 枚举陈旧

- **证据**：`AGENTS.md:145` 写「`docs/sop/` 为基础设施规范位（docker.md/supabase.md/sqlite.md/android.md/webqa.md/decision-router.md…）」，缺 `app-theme-i18n / app-brand-assets / app-navigation / app-ui-layers / app-simplicity / background-services / android-machine-profile`。
- **影响**：与 README/概览 sop 清单不一致，且位于「红线」节易被当权威全集。
- **建议**：改为指向目录并注明「清单以目录实际内容为准」，或补全。

#### G9｜概览 §八 表格渲染异常（表头前多出一行）

- **证据**：`ORCA治理体系说明.md:153-156` 的「变更说明｜`CHANGELOG.md`｜…」一行**在表头之上、被空行隔开**，游离于表格外。
- **建议**：并入表体（去掉其后的空行）。

#### G10｜「首次发布签收」可被 `OPEN` 收尾绕过

- **证据**：`scripts/model/check-ledger.mjs` 的 `ACCEPTED-MISSING` 只在「有 qa/senior 交付行 **且无任何** `ACCEPTED`/`OPEN` 收尾行」时 FAIL；夹具 `case23-ac-untested-open` 明确期望 **exit 0**；`SIGNOFF-MISSING` 只在**已有 `ACCEPTED`** 时才查签收。
- **影响**：一个「首次发布」项目只要以 `OPEN`（而非 `ACCEPTED`）收尾并报完工，**机器全过**，签收红线仅剩文字约束（`OPEN` 语义即「未完」，非设计错误，但「报完工」这一步没有机器承接）。
- **建议**：补一条 WARN/说明，或在概览写明「以 `OPEN` 收尾不得报完工，报完工必须 `ACCEPTED` 且有签收」并纳入 supervisor 抽查；至少显式记入已知边界。

#### G11｜角色账本覆盖无门：db-admin 零记录，多数角色无对照数据

- **证据**：`docs/model/NEXT-TASKS.md` §四 D7「`db-admin` 全体系零派工记录」；D8「028 与 039 账本逐字相同（223/280 行）」；同节结论「supervisor（54 样本仅 1 种模型）与 product-reviewer（86% 单一模型）**无对照组**」。
- **现状**：`check-ledger.mjs` 只做结构/枚举/跨账本升级计数校验，**无「每个在用角色须在某任务出现」的交叉检查**；覆盖靠人工纪律。
- **影响**（直接回答第三问）：`TASK-MODEL-LOG` 与 `DISPATCH-LOG` 在 schema 上对 11 个角色都开放、且以 `role` 记录，**但没有任何门保证都真被记**；db-admin 至今零记录，supervisor/qa/product-reviewer 的可比数据不足以支撑「按能力换模型」，目前唯 planner 有 A/B 可比。
- **建议**：加一条**只报 WARN** 的角色覆盖巡检（如「任务链有 qa 行却无 code-reviewer 行」提示），或在 `NEXT-TASKS` 明确列为待办；不新增 Gate。

#### G12｜通道预检不覆盖「产品审查双审表」的 A/B 模型

- **证据**：`scripts/check-channel-preflight.sh:46-49` 只从**角色表行**与**编号档案表行**取模型；双审表（`USER_MODEL_OVERRIDE.md:26-28`）用「组织者 / 汇总」「独立审查 A / B」行，**不被两处正则命中**；`codebuddy/deepseek-v4-pro`（审查 B）仅作 archive 条目被信息级列出。
- **影响**：若双审 B 模型在某次客户端升级后从目录消失，预检**不拦**，双审会在运行时静默失败（正是该链历史事故模式）。
- **建议**：把双审表 A/B 两模型纳入 `role_models`（或单列一节硬校验）。

### P3｜可选优化

- **G13｜`ROLES` 枚举与 override 表仍保留 `experience-recorder`/`neat-freak`**：二者已「不派工」。保留作旧账兼容与口径说明无碍，但 `check-ledger.mjs` 仍视其为合法角色值，易让人误以为可派。建议注释「仅历史兼容，不再派工」。
- **G14｜概览 §七之二「所有字段错误一律 FAIL」措辞过强**：`model` 字段的非白名单写法按设计是 **WARN**（`check-ledger.mjs` 的 `checkModel`），与 AGENTS「结构错=FAIL、写法不规范=WARN」一致。建议概览改为「结构/枚举/日期等字段错误一律 FAIL；写法不规范为 WARN」。
- **G15｜`temp/` 残留 58 项转交材料**（Oct 7–11）：按全局规则「任务完成后统一清理 temp」，建议收尾时清理或归档，避免与「证据留存」混淆。
- **G16｜本轮 2026-10-17 改动仍未提交**（`CHANGELOG.md` 顶部标 `(PENDING)`，工作区 43 改 + 24 未跟踪）：属流程状态而非缺陷，但提交前须先跑 §四.1 全套并确认 §五 的临时工作区 `orca-fresh-check` 已删。

---

## 三、逐项回答你的六个问题

### 1）文件前后有没有矛盾冲突、不一致或需优化

**有，且多为「陈旧未同步」而非硬冲突。** 硬冲突（会让执行者做错事）在本轮 2026-10-17 改动里已基本清掉（Human Gate × 连续推进、experience-recorder 派工状态、opencode `--auto` 漏写等），验证见 `scripts/model/continuous-push.test.mjs`（9/9）与 `solo-agent.test.mjs`（15/15）。**残留**为 G5–G9（概览章节号、README 规则层清单、HANDOFF 模板 neat 措辞、AGENTS 红线 sop 枚举、概览表格错行）与 G14（概览措辞过强）——均为「一处改了、另一处忘改」的一类。

### 2）体系能否达到预期？有没有「有体系但没法落实」

**部分能，部分仍偏「自评自写」。** 分层看：

- **能落实（有机器门）**：账本结构/枚举/日期、升级触发、派工漏记、验收红线（ACCEPTED-BLOCK / ACCEPTED-MISSING / SIGNOFF-MISSING）、APP 基线/品牌/导航关键 AC、Phase1 原型交付、通道预检、母版↔两包同步、概览新鲜度、产品审查产出、提交前证据副本与账本校验。**这些是真门，且本次全绿。**
- **落不了地（只有文字）**：Phase 阶段限制（Phase1 禁业务代码、WAITING 禁开发）、Human Gate 不得跨越、评审意见闭环、真机 QA 与「核心路径控件真点」、超范围变更走 Change C——**均无机器卡点**，只靠 supervisor 抽查与人品。体系自己也在概览 §七之二 与 CHANGELOG 顶部承认「账本侧已机器化，流程侧几乎全是自评自写」。
- **结构性依赖**：APP 设计阶段的 A/B/C、UX、Freeze 等 `BLOCKED` 门**依赖七颗 Design Pipeline Skill**（不随模板包分发）。**未装 Skill 时，这些阶段无机器门**，只剩 `PRODUCT_PLAN` 声明字段与 `check-ledger` 关键词门——而关键词门可被「把词写对」满足。概览已诚实标注，但**这意味着「安卓通用要求/多方审查」的很多环节，强制力依赖 Skill 是否安装**。
- **本次新增的两处「门本身有洞」**：G3（项目侧 `--allow-example`）、G10（`OPEN` 绕过签收）——**门在，但可从设计缝隙绕过**。
- **本次新增的「门恒红」**：G2（新项目首跑必 FAIL）——**门在，但正常路径过不去**，反向伤害可信度。

一句话：**账本/同步类能做到预期；设计/流程类主要靠人，且新增的门有一处恒红、两处可绕。**

### 3）派工账本、编排者账本：重要角色是否都有派工日志

- **机制上：都有。** `DISPATCH-LOG.jsonl` 带 `role` 字段，`TASK-MODEL-LOG.jsonl` 带 `role`/`model`；`check-ledger.mjs` 的角色枚举含 task-manager / supervisor / planner / builder / code-reviewer / qa / product-reviewer / senior-expert / db-admin（另有 experience-recorder / neat-freak 兼容值）。产品审查双审也以 `role=product-reviewer`＋分别填 `model` 记录。
- **实绩上：不齐，且无门。** 见 `docs/model/NEXT-TASKS.md` §四：**db-admin 全体系零派工记录**；028 与 039 账本逐字相同（疑克隆）；supervisor/qa/product-reviewer 单一模型、**无对照**；`model` 字段非法写法约 136 行、`used` 违规 12 行等。**没有任何机器检查要求某角色必须出现**（G11）。
- **结论**：**账本「有位置」但「没保证填」**；按能力换模型所需的数据，目前只有 planner 够用。建议补只报 WARN 的角色覆盖巡检，并把 db-admin 零记录作为已知项显式跟踪。

### 4）其他需要优化的问题、漏洞

见 §二 G1–G16，重点补充：
- **可用性**：新项目第一道门恒红（G2）、概览章节号错（G5）都会让接手者「以为体系坏了」。
- **强制力自伤**：G3（`--allow-example`）、G4（3/5 锚点）、G12（双审模型不受预检保护）。
- **数据完整性**：G11 角色覆盖、028/039 疑似克隆（`NEXT-TASKS` D8 已记）。
- **整洁度**：G15 `temp/` 残留、G16 本轮改动未提交。

### 5）ORCA 治理体系说明更新情况

- **已更新且门已过**：`ORCA治理体系说明.md` 头部日期改 2026-10-17，新增「七之三 新增机制」「两个收尾角色已改为编排者自做」等；`scripts/check-sync.sh` 的「对外必现机制」关键词清单新增 13 个词并**通过**——收官时 `check-sync.sh` 返回 `SYNC-OK`。这是四件套第 2 步的正确落地。
- **仍有陈旧处**：§八 HANDOFF 行「现至 §71」（实际 §89，G5）、§八 表格错行（G9）、§七之二「所有字段错误一律 FAIL」措辞过强（G14）。
- **结论**：**概览更新动作到位、关键词门有效，但至少 3 处细节未与事实同步。**

### 6）每次迭代升级是否真做了测试、是否保留测试项目（对照检查）

- **是，真做了，且可复跑。** 执行者收尾已把测试与夹具落在**版本库内固定路径** `scripts/model/fixtures/`（**159 个文件 / 183 个目录**，不用 `/tmp`、不清场），并新增 3 套回归（`gates.test.mjs` 9 例、`codebuddy-rotate.test.mjs` 12 例、`continuous-push.test.mjs` 9 例），含**反向验证**（把 `check-ledger` 调用短路后有用例 FAIL）。
- **本次对照复核结果（我全部亲自复跑）**见 §四.1，**8 套全绿**；`新项目模板包/` 内单独跑 `continuous-push` 与 `gates` 也全绿（包内测试独立可用，未因分发失效）。
- **两点如实说明**：① 此前「真实项目副本实跑（028 的 224/281 行）」的原始副本**按规不入仓**（含业务内容，`.gitignore` 命中 `docs/model/.evidence/`），仓内 `docs/model/.evidence/` 当前为空——即**「证据卡＋哈希」该留，但本轮未见留档文件**，建议下次 `--evidence` 跑一次把归一化证据卡提交；② 7 颗 Design Pipeline Skill 的 `validate_skillset.py` 校验依赖**本机外部 Skill 仓库路径**（不在本仓），属外部依赖，本次未跑。
- **结论**：**不属「口头报告」——测试真实存在、夹具留存、可复跑且全绿**；唯缺「真实项目副本的证据卡入仓」。

---

## 四、实测记录（命令与结果，非口头）

### 4.1 本次复跑（母版根目录）

| 命令 | 结果 |
|---|---|
| `bash scripts/check-sync.sh` | **SYNC-OK**（exit 0；AGENTS/README.en/编排 README 归一后差 0；AC-MATRIX 巡检 4/17） |
| `bash scripts/check-channel-preflight.sh` | **CHANNEL-OK**（6 个在用角色模型全 OK；codex 0.159.2 达标） |
| `node scripts/model/check-ledger.mjs docs/model --allow-example` | **LEDGER-OK (含 WARN)**（母版仅 _example 空壳，预期） |
| `node scripts/model/tm-qualification.test.mjs` | **ALL PASS pass=44 fail=0** |
| `node scripts/model/ledger-fields.test.mjs` | **ALL PASS pass=45 fail=0** |
| `node scripts/model/prototype-gate.test.mjs` | **ALL PASS pass=9 fail=0** |
| `node scripts/model/solo-agent.test.mjs` | **ALL PASS pass=15 fail=0** |
| `node scripts/model/gates.test.mjs` | **ALL PASS pass=9 fail=0** |
| `node scripts/model/codebuddy-rotate.test.mjs` | **ALL PASS pass=12 fail=0** |
| `node scripts/model/continuous-push.test.mjs` | **ALL PASS pass=9 fail=0** |
| `node scripts/model/ui-leak.test.mjs` | **ALL PASS pass=2 fail=0** |
| 包内独立跑 `新项目模板包/scripts/model/{gates,continuous-push}.test.mjs` | **各 ALL PASS fail=0** |
| `.git/hooks/pre-commit` 存在且为 `pre-commit-guard.sh` 内容 | 是（与 CHANGELOG「母版 hook 已重装」一致） |

### 4.2 现场复现（证明问题真实，非纸面推论）

- **G1**：`ls 1.Active/028…/docs/sop` 与 `1.Active/040…/scripts` —— 确认缺 `app-brand-assets/app-navigation/app-ui-layers/app-simplicity` 及 `check-product-review.sh / pre-commit-guard.sh / restore-framework.sh / check-sync.sh`。
- **G2**：在 `/var/folders/.../opencode/orca-fresh-check` 整包拷 `新项目模板包/` → 删 `_example` → 跑 `check-ledger`，**EXIT=1**，报 `APP-TRUEOUT-SOURCE-UNRESOLVED`。（该临时目录为本次一次性复现，已属临时工作区，收尾应删。）

---

## 五、需要你拍板的事项

```text
【请你拍板｜回复 A1、B2、C1；如适用可回复“全1”】

A｜老项目新规则的铺开范围（G1）
1. 【建议】把 4 份 APP SOP + 8 个治理脚本补进 sync-old-projects.sh，并改为从老包自动枚举 docs/sop 与治理脚本；只改脚本，不动任何老项目业务代码。
2. 仅补手写清单，不改自动枚举（改动更小，但下一轮仍可能再漏）。
3. 暂不铺：老项目是否接新 SOP 由各自项目决定（保持现状，接受“照 AGENTS 执行会 no such file”）。

B｜新项目首跑 check-ledger 恒红（G2）
1. 【建议】修 `check-ledger.mjs`：无实际 Product Plan 候选时跳过真源检查（`!src && cands.length`），并更正报错文案与 README/NEXT-TASKS 表述。
2. 不修逻辑，只把 README 的“期望 LEDGER-OK”改为“首个真实计划前报 APP-TRUEOUT 属正常”。
3. 暂不处理（保持现状）。

C｜本轮 2026-10-17 改动与我新增的审查报告是否提交
1. 【建议】先修完 P1（G1–G4），跑全套门禁，再打包提交（含本审查报告）。
2. 只提交现状与本审查报告，G1–G4 留到下一轮。
3. 暂不提交，等你看过后再说。

【说明】
- 以上均为可逆、仅动本治理仓的操作；A2/A3 与 C2/C3 都不会碰老项目业务代码。
- 提交（C）属四类红线之一，须你明确指令后我才会做；另 G2 的临时复现目录会由我清理。
```

---

## 六、可直接转送给「编排者」的执行提示词（这是转交的提示词）

```text
【编排者｜执行】修复 ORCA 治理体系 2026-10-17 审查报告的 P1 项并完成体系更新四件套

背景：审查报告见 review/审查报告_2026-10-17_ark-code-latest.md（先整份读完）。结论 PASS_WITH_FIXES。
本单只修 P1（G1–G4），并顺手修 G5、G7 两处“对外/对模板错话”。不要扩大范围。

硬约束：
- 这是治理体系自身（母版）的活，不是业务开发；不新增角色/Gate/Phase/账本字段/评分指标。
- 只改母版；两包用 `python3 scripts/_sync-packages.py` 同步，禁手写 sed 复制、禁拷实文件。
- 动账本校验/原型门/资格逻辑后，必须跑对应回归；夹具一律落 scripts/model/fixtures/ 固定路径，禁 /tmp、禁清场。
- 不 commit/push（等用户指令）。

要做的（逐条）：
1) G1 老项目铺开：改 scripts/sync-old-projects.sh，把 docs/sop/{app-brand-assets,app-navigation,app-ui-layers,app-simplicity}.md
   与 scripts/{pre-commit-guard.sh,check-product-review.sh,check-sync.sh,migration-status.sh,orca-gitignore.sh,
   orca-public-guard.sh,orca-public-ignore.txt,restore-framework.sh} 纳入；并把 docs/sop 与治理脚本改为
   像 scripts/model 一样从老包自动枚举。先 `--dry-run` 预演，确认不触碰任何业务文件。
2) G2 恒红：改 scripts/model/check-ledger.mjs —— `!src` 分支仅在 `cands.length>0` 时报 APP-TRUEOUT-SOURCE-UNRESOLVED；
   无候选计划时跳过。同步改 README.md:66 与 docs/model/NEXT-TASKS.md §C 的表述。补/改一条回归夹具。
3) G3 pre-commit-guard：改为环境判定——母版（含两包）才加 `--allow-example`，项目仓不加；
   或“仅当账本只含 _example 行时降级”。用 scripts/model/gates.test.mjs 的沙箱补负例。
4) G4 check-product-review.sh：补 PRODUCT_REVIEW_ONLY_A 与 PRODUCT_REVIEW_ONLY_B 两个锚点校验，
   与 AGENTS.md:69、概览检查点 20 的“五段”口径对齐。确认 gates.test.mjs 仍全绿。
5) G5 概览：ORCA治理体系说明.md §八 HANDOFF 行的“现至 §71 / 自 §72 起顺延”改为不写死数字（或改 §89）；
   修 §八 表格表头前的游离行（G9）；顺带修 CHANGELOG 顶部“已修 HANDOFF 章节号”的不实表述。
6) G7 HANDOFF 模板：docs/handoff/HANDOFF.template.md 第 23 行“neat 派完后 TM 补记”改为“编排者自做后补记”。

验收标准（全绿才收工，全部实跑）：
- bash scripts/check-sync.sh            → SYNC-OK
- bash scripts/check-channel-preflight.sh → CHANNEL-OK
- node scripts/model/check-ledger.mjs docs/model --allow-example → LEDGER-OK
- node scripts/model/ledger-fields.test.mjs / prototype-gate.test.mjs / gates.test.mjs /
  codebuddy-rotate.test.mjs / continuous-push.test.mjs / solo-agent.test.mjs /
  tm-qualification.test.mjs / ui-leak.test.mjs → 均 ALL PASS fail=0
- 复现验证 G2：新建空项目走 README 步骤后，check-ledger 不再因 APP-TRUEOUT 报错。
- CHANGELOG.md 顶部追加一条（日期/commit/why/what/影响谁/怎么验）；概览同步；两包同步。

交付：在 review/ 追加一份「整改闭环报告」（逐条列 G1–G7 的改动文件、证据命令与结果），
并把本报告 §四 的实测表更新为整改后实测。跑完先向用户报告，再等是否提交的指令。
```


