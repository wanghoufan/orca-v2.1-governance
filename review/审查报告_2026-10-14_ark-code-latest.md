# ORCA 治理体系审查报告｜2026-10-14｜volcengine-plan/ark-code-latest

- 审查对象：母版仓（分发版，同时是公开云仓 `wanghoufan/orca-v2.1-governance`）
- 审查模型：`volcengine-plan/ark-code-latest`（Runtime=opencode，实际模型由火山控制台管理）
- 审查时 HEAD：`6b72bfc`（工作树非干净，见 §一 P0-3）
- 结论：**CONDITIONAL PASS（有条件通过）**。体系骨架完整、角色/阶段/Gate 结构自洽，回归夹具齐全且本轮**亲跑全部通过**；但存在 **3 项 P0**（门禁脚本自身崩溃、唯一口径表自相矛盾、真实业务账本行已入库）**＋ 一批 P1 文档漂移**。**P0 未清零前不得 commit／push、不得报体系更新完成、不得收工。**

> 本报告所有结论均附可复跑命令，均为**本轮亲跑**（2026-10-14），非引用旧值。**本次审查为只读，未改动任何文件。**

---

## 零、结论速览

| 需求项 | 判定 |
|---|---|
| ① 前后矛盾/不一致 | ⚠️ 有：1 项 P0 自相矛盾 ＋ 6 项 P1 漂移 |
| ② 预期能否落实（门槛卡得住吗） | ⚠️ **部分可落实**：机器门真实有效，但**中央门禁当前自崩**；约 30% 质量点仍是人工裁量（设计如此，须正视） |
| ③ 8 角色派工账本 | ✅ 机制完备，8 角色在真实项目中均有记录；⚠️ 母版无法直接回答能力评估（须跨项目聚合） |
| ④ 其他漏洞 | ⚠️ 有：公开仓隐私、脚本覆盖缺口、门恒红等 5 项 |
| ⑤ 概览更新情况 | ⚠️ 主干同步；标题日期滞后、§8 编号乱序、1 处口径残留 |
| ⑥ 迭代升级是否真测＋测试项目保留 | ✅ 回归夹具真留（版本库内固定路径）；⚠️ 真实执行验证的**隔离副本未保留**，仅剩夹具＋CHANGELOG 文字＋temp 证据 |

---

## 一、前后矛盾 / 不一致 / 需优化

### P0-1｜`check-sync.sh` 自身崩溃：门禁当前**无法给出结论**（exit 1，不打印 SYNC-OK）

现象（亲跑）：

```bash
bash scripts/check-sync.sh
# … AC-MATRIX-MISSING 列表 …
# scripts/check-sync.sh: line 108: m�: unbound variable      ← 崩溃点
# EXIT=1
```

根因 `scripts/check-sync.sh:108`：

```bash
echo "AC-MATRIX-EMPTY: $m（文件在但无 AC 条目）"
```

`$m` 后紧跟**全角左括号 `（`**，在 `set -u` 下被 bash 并入变量名 → `unbound variable`，脚本在到达第 113 行 `echo SYNC-OK / SYNC-FAIL` **之前就退出**。

触发条件：仅当**某项目矩阵文件存在但无 `| AC-` 行**。本机命中 `040-ing-才艺展示厅`（`docs/qa/产品验收追踪矩阵.md` 在但为空）。

反证（证明同步本身没问题，坏的只是这段）：

```bash
mkdir -p /tmp/emptyac
AC_SCAN_ROOT=/tmp/emptyac bash scripts/check-sync.sh   # → SYNC-OK，EXIT=0
```

影响：`AGENTS.md` 红线「体系更新未同步两包与概览，或概览检查未过，不得收工」所依赖的**四件套第 3 步门禁当前恒为 exit 1**；且该段本被设计为「**只报不阻塞**」，实际却把整脚本拖崩，与设计意图相反。这正是「有体系，但门禁自己是坏的」——最危险的一类。

修法：`$m（` → `${m}（`；建议全脚本扫一遍「`$var` 紧跟中文标点」的写法。约 1 行。

### P0-2｜唯一口径表 `USER_MODEL_OVERRIDE.md` builder 行**自相矛盾**（新旧跨目录口径同处并存）

同一行内两条互斥指令（亲跑核实均命中）：

```bash
grep -c "跨目录活先取得用户授权或改派 codebuddy" USER_MODEL_OVERRIDE.md   # → 1
grep -c "不必\*\*先取授权" USER_MODEL_OVERRIDE.md                        # → 1
```

- 前段（10-14 新结论）：「带 `--auto` 后不拒 ⇒ **跨项目活不必先取授权或切备用通道**」；
- 后段（10-12 旧口径，**未删**）：「opencode 通道跨目录限制（背景）…**故派 builder 时任务描述里的路径须落在当前工作区内；跨目录活先取得用户授权或改派 codebuddy 通道。**」

同类问题在 `CHANGELOG.md` 顶条（`93f9a6b`）：`怎么验` 表已按 `--auto` 结论写，末尾却又留「**⚠️ 已在表内标注的风险**：…①任务路径须落在当前工作区内；②跨目录活先取用户授权，或切 codebuddy 备用通道」——**同一条目内自相矛盾**。

影响：builder 是执行主干，读到相反指令会按「先取授权/切通道」多做一步（正是 10-14 要推翻的行为），并会反复打扰用户。这正是 2026-10-08 已写进 `经验一句话.md` 的教训（「改一条规则若涉及多处表述，必须同一批次搜全部落点一起改，改完逐处 grep 确认没有残留互斥句」）——**规则本身又被违反了**。

### P0-3｜真实项目业务账本行已进入母版仓（公开云仓）

母版**根目录**两个被 git 跟踪的文件（亲跑）：

```bash
git ls-files | grep '^input-'
# input-2026-10-12T08-31-10-644Z-DISPATCH-LOG.jsonl   （280 行）
# input-2026-10-12T08-31-10-644Z-TASK-MODEL-LOG.jsonl （223 行）
```

内容为真实项目 `028-ing-酒吧聚会社交导演` 的逐行派工/任务账（含任务名、模型、返工数）。

影响：`README.md:109` 明写「本机母版本身就是云端**公开仓**」。`AGENTS.md`／`NEXT-TASKS.md` 恰为防此类泄漏设了两条纪律（母版 `docs/model/*.jsonl` 只留 `_example`；原始副本禁入仓、`docs/model/.evidence/` 已 gitignore），但**根目录这两个副本恰好绕过了这两条**：既不在 `docs/model/`、又不在 `.evidence/`、又未 gitignore，直接提交进公开仓。

判定：不是 API Key，但属**业务内部信息上公开仓**（红线族「隐私/数据」），且违反母版自定的「只留空壳」精神。

修法：`git rm --cached input-*.jsonl` 并从工作区清理（或移入已 gitignore 的 `temp/`），`.gitignore` 补 `input-*.jsonl`；**历史上已 push，是否重写历史属不可逆操作，须用户拍板**。

### P1-4｜`AGENTS.md` 内嵌测试期望数已失效（`17/17` vs 实际 `44/44`）

- `AGENTS.md:100`：「本轮若动了 TM 资格相关逻辑，另跑 `node scripts/model/tm-qualification.test.mjs`（**须 17/17**）」。
- 亲跑：`tm-qualification.test.mjs` → **`ALL PASS pass=44 fail=0`**。
- 同类：`docs/model/NEXT-TASKS.md` 写 `ledger-fields 25/25`，实际 `35/35`。
- 影响：执行者跑出 44/44 会误判「与规则不符=失败」，或反过来不再信规则里的数字。
- 建议：规则里**不复述用例数**，只写「须 `ALL PASS fail=0`」（与「列数以模板为准、不复述数字」同一防漂移原则）。

### P1-5｜角色卡硬编码已过期的模型 ID

- `docs/roles/task-manager.md:10`：`builder(codebuddy/deepseek-v4.1-flash) 拟稿` —— 但 2026-10-14 起 builder **主用**已改为 `opencode-go/deepseek-v4.1-flash`（`codebuddy/...` 降为**备用**）。
- 与其他角色卡明写的「**卡内不复述模型 ID**，避免 ID 更新后卡里留旧值致派工 `not supported`」自相矛盾。
- 建议：改为「builder（模型见 override 表）」。

### P1-6｜`TASK-MANAGER-QUALIFICATION.md` 规范正文与其评分器漂移

- §4 事件字段清单仍为 `… infra_error(bool), decision_latency_ms(number|null), resource_waste(bool), switch_reason …`；
- 但评分器 `tm-qualification.mjs` 实际已引入并强制：`started_at`／`ended_at`（响应速度只认二者机械相减）、`supersedes`（防重复计分）、`effective_interception`、`gate_violation`（布尔强校验）。
- §6「响应速度」仍按 `decision_latency_ms` 描述，而 2026-10-12 增补节已改口径——**正文 ↔ 增补节 ↔ 代码 三处不同步**。
- 影响：下游按 §4 字段表记 Episode、缺 `started_at/ended_at` → 该维度恒计「未测」→ 永远拿不到 QUALIFIED，而读者不知原因。

### P1-7｜`check-sync.sh` 覆盖缺口：两测试脚本与 `NEXT-TASKS.md` 未纳管

- 未被逐字节比对（亲跑 grep 确认）：`scripts/model/solo-agent.test.mjs`、`scripts/model/ledger-fields.test.mjs`、`docs/model/NEXT-TASKS.md`（后者在 `_sync-packages.py` EXTRA 里会同步，但 check-sync 不校验它）。
- 影响：这几个文件若母版改了而两包未同步，**漂移无声通过**（与 2026-10-09「夹具被改=测试失去意义，按整树卡」同理的漏网）。

### P1-8｜`ORCA治理体系说明.md` 若干滞后

- 标题仍写「（对外版，**2026-10-08**）」，内容却已到 10-10/10-14。
- §八 检查点编号乱序：`… 12 13 15 16 14`（15/16 插在 14 前）——前一轮审查已报，**本轮仍在**。
- §七 表中 `docs/sop/` 枚举遗漏 `app-navigation.md`／`app-ui-layers.md`／`app-simplicity.md`／`android-machine-profile.md` 等。

### P1-9｜迁移提示词第 0 步 SOP 清单过期

- `docs/prompts/迁移整理提示词.md` 第 0 步：「sop 含 docker.md、supabase.md、sqlite.md、android.md、webqa.md、decision-router.md」——**未列** `app-theme-i18n.md`／`app-brand-assets.md`／`app-navigation.md`／`app-ui-layers.md`／`app-simplicity.md`／`background-services.md`／`android-machine-profile.md`。
- 与「新项目整包拷不会漏、人工逐文件会漏」的已知教训同理：照字面执行的老项目迁移者会漏新 SOP。

### 附：低优先一致性问题

- `check-ledger.mjs` 的 `ROLES` 白名单（`line 73-75`）含 `迁移整理工`、`orchestrator`，而 `AGENTS.md` 的角色集是固定 9+1+1（编排者即 `task-manager`）——**校验器白名单 ⊃ 权威角色集**，导致 `role=orchestrator`（项目 006 实出现 2 行）不报错。
- `KNOWN_MODELS` 未含 `opencode-go/mimo-v2.6-flash`，但它是 `USER_MODEL_OVERRIDE.md` 注释里的正式 TM 资格候选 → 项目 046 记该模型被报 `WARN unknown model`。
- `AGENTS.md:74-75` 新旧跨目录规则并存（一条写新口径、一条标「已由上条取代」）；可读但易误读，建议合并。

---

## 二、体系预期能否落实（「有体系但卡不住」体检）

| 预期 | 判定 | 依据（本轮亲跑/读证） |
|---|---|---|
| 多方审查：Builder→Reviewer→QA→Supervisor ＋ 产品双审 A/B | **可落实** | 角色卡＋派工链＋「串行禁并发／校验产出非空」约定完整；但「独立性」靠「互不可见＋planner 裁决」，**无机器强制**，靠编排者自觉 |
| 多阶段规范：PLAN→Human Gate→DEVELOP；Change A/B/C | **可落实** | 状态机 4 态、Human Gate 不可自动跨越明确；Change C 受控重开链完整；`supervisor.md` Phase Integrity 六查可复检 |
| 安卓通用要求（主题三态／中英双语／品牌资产／导航／信息分层／简化） | **部分可落实** | 六份 SOP＋`check-ledger` APP 硬门（`APP-BASELINE-MISSING`／`APP-CRITICAL-AC-*`／`APP-BRAND-ASSETS-MISSING`／`APP-NAV-*`／`PROTO-*` 均实为 FAIL）真实存在、真能拦；但 `ui-leak.mjs` 只提示不判 FAIL、简化门「允许判定无须删减」——两个口子都靠人工裁量，机器卡不住 |
| Phase1 可运行原型门 | **可落实** | `prototype-gate.test.mjs` 本轮亲跑 `ALL PASS pass=9 fail=0`；文件存在与真实运行分开判定已实现 |
| 产品验收（关键 AC 全有证据＋真机/浏览器证据＋首次发布签收） | **可落实但有摩擦** | 矩阵唯一落盘位＋`check-sync` 的 `AC-MATRIX-MISSING` 巡检在位；但见 §四-1：**绝大多数真实项目糊在 `check-ledger` 上过不去** |

结论：**机器门（原型、APP 基线、账本字段、通道预检、同步）是真的、能拦人，不是纸面**——本轮亲跑逐条验证有效。但有两处必须正视：
1. **中央门禁自身故障**（P0-1），会让人误以为「体系没过」而反复返工；
2. **约 30% 关键质量点（审查独立性、ui-leak、产品简化「无须删减」）是 advisory／人工裁量**，属设计选择，不是缺陷，但报告与验收里写「卡住了」时**必须区分机器门 vs 人工门**，否则会高估体系强度。

### 安卓要求的落实现状抽查（机器门是否真拦）

亲跑 `check-ledger.mjs` 报出的 APP 类门（`APP-TRUEOUT-SOURCE-UNRESOLVED`／`APP-BASELINE-MISSING`／`PROTO-MISSING` 等）在真实项目上**确实会 FAIL**，说明这些门不是文档摆设。但一个副作用见 §四-1。

---

## 三、8 角色派工账本覆盖（换模型的依据）

### 机制层

- 两本账 schema 覆盖 8 角色无缺：`TASK-MODEL-LOG`（11 必需键＋`note`/`executed_by`/`chain_status`）与 `DISPATCH-LOG`（7 必需键＋`note`）；`role` 为枚举；`model` 精确写法白名单；`chain_status` 三态。
- 母版/两包 `docs/model/*.jsonl` **只留 `_example` 空壳**（亲跑确认，符合规定，正确）。
- 校验：`node scripts/model/check-ledger.mjs docs/model`。

### 实绩层（跨 22 个项目聚合，亲跑）

8 个重点角色**全部出现**，计数如下（只统计已跟踪的真实行）：

| 角色 | 行数 | 角色 | 行数 |
|---|---:|---|---:|
| builder | 982 | code-reviewer | 321 |
| qa | 345 | supervisor | 174 |
| product-reviewer | 123 | planner | 119 |
| task-manager | 75 | **senior-expert** | 26 |
| neat-freak | 31 | experience-recorder | 5 |

⇒ **结论：这 8 个角色（含升级专用的 senior-expert）都有派工/任务账本日志**，「换谁、用到几时」有据可查。

### 但有两个缺口（直接影响「按能力换模型」）

1. **母版本身回答不了能力评估**：母版只有空壳（正确），账本分散在 22 个项目；要回答「planner 是否总返工／senior 是否常被升级」，**必须跨项目聚合**——本轮未见任何聚合脚本或定期报告（`NEXT-TASKS.md` 也只到「跨项目真实 Episode 聚合…本次未收」）。**TM Qualification 的 ≥30 Episode/≥3 项目采样门槛，目前没有任何项目达到**（母版账本 §10 仍记 `Episodes 0`）。
2. **非规范 role 值混入**：项目 006 出现 `role=orchestrator`（2 行）、018 出现 `role=迁移整理工`（1 行）。二者被 `check-ledger` 白名单放行，但与「9+1+1、编排者即 task-manager」的定义不一致，聚合统计时会让 `task-manager` 计数偏低、且存在两个名字指同一角色。

### 附带发现：门禁在真实项目上大面积红

亲跑对 22 个有账本项目跑 `check-ledger.mjs`：**除 037、047 外全部 exit 1**。主因不是历史写法，而是 **`APP-TRUEOUT-SOURCE-UNRESOLVED`**（HANDOFF 的 `PLAN_VERSION` 未用反引号标出真源路径）与旧的 `runtime="本窗口subagent"／"本窗口直驱"`、`used="备用"` 等。

- 示例：`028` 报 6 处 `bad used="备用"`（`NEXT-TASKS.md` 一节自己也承认 028 存量 14 错行，且「修正时机由各项目决定、治理侧不代改他人账本」）；
- 示例：`040` 空账本也报 `APP-TRUEOUT-SOURCE-UNRESOLVED`。

**这是一个真实的「制度打架」**：`AGENTS.md` 要求「收工前必跑 check-ledger，不过不许说完事」，但项目又规定「治理侧不代改他人账本」，而这些门在许多存量项目上**开局即红**。结果是要么有人偷偷整改别人的账本（越界），要么这道门在这些项目里长期名存实亡。建议：给存量项目一个**明确的「门在红→项目暂停新开发、先修账本」流程**，或把 `APP-TRUEOUT-SOURCE-UNRESOLVED` 这类「格式未填」与「内容不合规」分级，避免把格式债和治理违规一锅端成 exit 1。

---

## 四、其他漏洞 / 需优化项

1. **见 §三 附带发现**：门在存量项目大面积红 vs「不代改他人账本」的制度冲突（最高优先级的流程漏洞）。
2. **`_sync-packages.py` 的 prune 修复尚未提交，且需显式 `--prune` 才跑**：本次工作树里有未提交改动（`_sync-packages.py` 修改 ＋ 两包各删 `ledger-evidence.mjs`／`ledger-stock-scan.mjs`，共 5 项 `git status`），修的是「同步只增不减 ⇒ 母版删除的退役脚本被铺进 36 个项目（72 个）」的根因。问题：
   - 修复未提交，CHANGELOG 也**无对应条目**（母版仍是中间态）；
   - `prune()` 只在命令行显式带 `--prune` 时执行，`check-sync`／常规同步不会触发 ⇒ 幽灵文件仍会长期滞留在两包直到有人记得手跑。
3. **`solo-agent.test.mjs` 在包内为 `pass=10`、在母版为 `pass=15`**（母版有 5 条母版专属断言，包内 SKIP）。逻辑正确，但 CHANGELOG 一直写「solo-agent 15/15」，读者在包里跑只会看到 10/15，易生疑——建议 CHANGELOG 注明「母版专属断言在包内 SKIP」。
4. **`temp/simplicity-probe-v2.mjs`（产品简化扫描 PoC）未入版本库固定路径**：`交付物4_回归验证报告.md` 说明其「仅临时目录、不入母版」。而 `AGENTS.md` 明令「回归夹具与长期证据一律落版本库内固定路径、禁放 temp」。该 PoC 是简化门的重要工具，却放在会被清理的 `temp/`，**下次清理即失**。
5. **GOVERNANCE_VERSION 无 commit 指针**（内容仅「以 Git 历史为准」）：跨机器断链或拷实文件时无法对账，前一轮审查已建议记 hash，本轮仍未做。
6. **`git status` 非干净**：母版当前有 5 项未提交改动，处于「已改完、等授权提交」的中间态；此时任何 check-sync 比对都可能因时序/中间态失真（前一轮 P0-5 已踩过同类坑）。

---

## 五、ORCA 治理体系说明（概览）更新情况

- 内容主干与 `AGENTS.md` 一致：单智能体、产品审查链、APP 四类前置（主题/品牌/导航/分层）、简化门、采样门槛 30/3 均已同步；`check-sync` 的「对外必现机制」关键词清单（含 `"单智能体"`、`"你是唯一开发者"`）实测可拦（`OVERVIEW-STALE`）。
- 但发现三处滞后（已在 §一 P1-8 列明）：① 标题日期仍定格 `2026-10-08`；② §八 检查点编号乱序 `…15 16 14`；③ §七 与迁移入口行的 `docs/sop/` 枚举不全。
- 另：概览 §三 仍写 Jev「只判七类：… ＋ Shadow 三类」——与 `decision-router.md` 一致，未见漂移，保留。
- **注意**：本轮 `check-sync.sh` 因 P0-1 崩溃，**概览新鲜度检查虽跑过（在崩溃点之前）但最终 `SYNC-OK` 结论未产出**；须先修 P0-1 才能正式宣称「概览检查已过」。

---

## 六、每次迭代是否真测 ＋「保留测试项目」对照

### 6.1 回归夹具（真保留，符合要求）✅

亲跑确认在**版本库内固定路径**且**未被清场**：

```
scripts/model/fixtures/{ledger-fields(18例), nav-gate(3例), proto-gate(6例), solo-agent, tm-qual, ui-leak}
```

本轮亲跑全部通过：

| 套件 | 结果 |
|---|---|
| `tm-qualification.test.mjs` | `ALL PASS pass=44 fail=0` |
| `prototype-gate.test.mjs` | `ALL PASS pass=9 fail=0` |
| `solo-agent.test.mjs`（母版） | `ALL PASS pass=15 fail=0` |
| `ledger-fields.test.mjs` | `ALL PASS pass=35 fail=0` |
| `ui-leak.test.mjs` | `ALL PASS pass=2 fail=0` |

⇒ 「保留测试项目（夹具）」这条：**达成**。

### 6.2 真实执行验证的「隔离测试项目」⚠️（部分未保留）

`CHANGELOG.md` 多处声称做过**真实执行验证**，例如：

- 10-10 单智能体：「隔离副本 `solo-demo`…复验 5/5 PASS」；
- 10-12：「028 真实副本实跑」「040 实跑」「隔离副本走完整收工流程实测」。

对照检查（亲跑搜索）：

- `solo-demo` 隔离副本：**全机未找到**（`find … -iname '*solo*'` 无结果）；
- 028/040 的「轻量副本」：**未保留**（`TASK-MANAGER-QUALIFICATION.md` 自述「全程在 028 的轻量副本上操作」，副本未见留存）；
- 040 实跑证据：仅存于**母版 `temp/`**（`codex审查证据-第四轮 丨 2026-10-11` 等）。

⇒ 「保留测试项目（真实执行验证）」这条：**部分未达成**。风险：`temp/` 按规则是「待清理交付区、完成后可清」，一旦清理，**这些『体系升级确实生效』的原始证据就没了**，只剩 CHANGELOG 的文字自述——正是用户担心的「停留在口头报告」。建议把 040/028 的实跑证据（证据卡＋路径清单）固化到版本库内固定路径（如 `docs/model/.evidence/` 的证据卡部分，或 `scripts/model/fixtures/_evidence/`）。

### 6.3 反向验证（「非空跑」）抽查

- `prototype-gate.test.mjs`、`ledger-fields.test.mjs` 的用例设计确实反打（含「短路即 FAIL」的断言），非空跑；`solo-agent` C1/C5/C7/C8 母版专属断言在包内 SKIP 而非伪装 PASS（亲跑日志可见）。
- 但**未发现**本轮记录中「临时改坏→看用例 FAIL→还原」的反向验证留痕（母版 `scripts/model/fixtures/` 下无 `_evidence/`）。若本轮确实做过，建议留存快照。

---

## 七、整改清单（按优先级）

**P0（未清零不得 commit／push／收工）**

1. **修 `check-sync.sh:108`**：`$m（` → `${m}（`；修后 `bash scripts/check-sync.sh` 须稳定输出 `SYNC-OK`。同时全脚本排查同类「`$var` 紧跟中文标点」。
2. **消歧 `USER_MODEL_OVERRIDE.md` builder 行**：删掉与 10-14 结论互斥的旧句（「跨目录活先取得用户授权或改派 codebuddy」），统一为「带 `--auto` 即可，跨目录不必先取授权」；同步修 `CHANGELOG.md` 顶条内互斥段。**按 10-08 教训逐处 grep 确认无残留互斥句**。
3. **处理根目录 `input-*.jsonl`**：`git rm --cached` ＋ `.gitignore` 补 `input-*.jsonl`；**是否重写远端历史须用户拍板**（不可逆）。

**P1**

4. 规则内**不复述用例数**：`AGENTS.md:100` 的 `17/17`、`NEXT-TASKS.md` 的 `25/25` 改为「`ALL PASS fail=0`」。
5. `docs/roles/task-manager.md` 去掉硬编码 `codebuddy/deepseek-v4.1-flash`，改「见 override 表」。
6. `TASK-MANAGER-QUALIFICATION.md` §4 字段表与 §6 口径补齐到与 `tm-qualification.mjs` 一致（加入 `started_at/ended_at/supersedes/effective_interception/gate_violation`）。
7. `check-sync.sh` 补纳管 `solo-agent.test.mjs`、`ledger-fields.test.mjs`、`docs/model/NEXT-TASKS.md`。
8. `ORCA治理体系说明.md`：标题日期更新、§八 编号重排、§七 SOP 枚举补全。
9. `docs/prompts/迁移整理提示词.md` 第 0 步 SOP 清单补全。
10. 明确定存量的「门红→暂停新开发先修账本」流程，或对 `APP-TRUEOUT-SOURCE-UNRESOLVED` 类格式债与治理违规分级。
11. 提交 `_sync-packages.py` 的 prune 修复并写 CHANGELOG；考虑把 prune 并入常规同步（不依赖手跑 `--prune`）。
12. `temp/simplicity-probe-v2.mjs` 移入版本库固定路径；`GOVERNANCE_VERSION` 加 commit 指针。

---

## 八、待用户拍板事项

```text
【请你拍板｜回复 A1、B1；如适用可回复“全1”】

A｜P0-3 根目录真实账本副本怎么处置
1. 【建议】git rm --cached + .gitignore 补 input-*.jsonl，不改写远端历史（本地文件保留在 temp/）
2. 同时按需重写远端历史（不可逆，会影响克隆者与你本地各 clone）

B｜是否本轮就修 P0/P1（需 commit＋push 授权）
1. 【建议】先修 P0-1/P0-2 两个纯文字/脚本改动（低风险、可当场验证），再修 P1
2. 只修 P0，其余另案

【说明】
- 本报告为只读审查，未改动任何文件。
- P0-1 是 1 行脚本改动、可当场复跑验证；P0-2 是删掉表内互斥旧句；两件都不碰业务、可逆。
- commit／push 无你的明确指令一律不做。
```

---

## 附：本轮亲跑证据（可原样复跑）

| 命令 | 结果 |
|---|---|
| `bash scripts/check-sync.sh`（默认扫 1.Active） | ❌ exit 1，崩于 `line 108: m�: unbound variable`，无 `SYNC-OK` |
| `AC_SCAN_ROOT=/tmp/emptyac bash scripts/check-sync.sh` | ✅ `SYNC-OK`，EXIT=0（证明同步本身 OK） |
| `bash scripts/check-channel-preflight.sh` | ✅ `CHANNEL-OK`（codex 0.159.2 满足 ≥0.159.2） |
| `node scripts/model/check-ledger.mjs --allow-example` | ✅ `LEDGER-OK (含 WARN)` |
| `node scripts/model/tm-qualification.test.mjs` | ✅ `ALL PASS pass=44 fail=0` |
| `node scripts/model/prototype-gate.test.mjs` | ✅ `ALL PASS pass=9 fail=0` |
| `node scripts/model/solo-agent.test.mjs`（母版） | ✅ `ALL PASS pass=15 fail=0` |
| `node scripts/model/ledger-fields.test.mjs` | ✅ `ALL PASS pass=35 fail=0` |
| `node scripts/model/ui-leak.test.mjs` | ✅ `ALL PASS pass=2 fail=0` |
| 22 个真实项目跑 `check-ledger.mjs` | ⚠️ 仅 037、047 exit 0，其余 exit 1（主因 `APP-TRUEOUT-SOURCE-UNRESOLVED`／旧 `runtime`／`used=备用`） |
| `git ls-files \| grep '^input-'` | ⚠️ 2 个真实业务账本副本已入库 |
| `git status --short` | ⚠️ 5 项未提交（`_sync-packages.py` ＋ 两包各 2 个退役脚本删除） |
| `grep -c "6b72bfc" CHANGELOG.md` | ⚠️ `0`（HEAD 提交无 CHANGELOG 条目） |

---

## 附二、可直接转送的整改提示词（这是转交的提示词）

```text
【ORCA 体系整改｜2026-10-14 审查整改】

你是本治理仓的编排者。按下面清单整改，全程只读业务项目、不碰他人账本；改完按四件套跑门禁并报告。

必做（P0）：
1. 修 scripts/check-sync.sh 第 108 行：把 "AC-MATRIX-EMPTY: $m（文件在但无 AC 条目）" 里的
   $m（ 改成 ${m}（，消除 set -u 下的 unbound variable。修后在仓库根跑
   `bash scripts/check-sync.sh` 必须稳定输出 SYNC-OK；再用
   `AC_SCAN_ROOT=/tmp/emptyac bash scripts/check-sync.sh` 交叉确认。
   顺手全脚本排查其它「$var 紧跟中文标点」写法。
2. 消歧 USER_MODEL_OVERRIDE.md builder 行：删掉与 2026-10-14 结论互斥的旧句
   「跨目录活先取得用户授权或改派 codebuddy 通道」，保留唯一口径「带 --auto 即可、跨目录不必先取授权」；
   同步删除 CHANGELOG.md 顶条 93f9a6b 内那段「⚠️ 已在表内标注的风险」中的互斥结论。
   改完逐处 grep 确认全仓无残留互斥句（按 2026-10-08 教训）。
3. 根目录 input-2026-10-12T08-31-10-644Z-*.jsonl 两个真实账本副本：
   `git rm --cached` 摘下（本地文件保留或移入 temp/），.gitignore 补 input-*.jsonl。
   远端是否重写历史先停下问用户。

必做（P1，按序）：
4. AGENTS.md 与 docs/model/NEXT-TASKS.md 里的测试用例数（17/17、25/25）改为「ALL PASS fail=0」，不复述数字。
5. docs/roles/task-manager.md 删除硬编码模型 ID，改「builder（模型见 override 表）」。
6. docs/model/TASK-MANAGER-QUALIFICATION.md §4/§6 补齐 started_at/ended_at/supersedes/effective_interception/gate_violation 口径，与 tm-qualification.mjs 对齐。
7. check-sync.sh 补纳管 solo-agent.test.mjs、ledger-fields.test.mjs、docs/model/NEXT-TASKS.md。
8. ORCA治理体系说明.md：标题日期更新；§八 检查点编号重排为 1..16 连续；§七 与迁移入口行的 docs/sop 枚举补全。
9. docs/prompts/迁移整理提示词.md 第 0 步 SOP 清单补全（app-theme-i18n/app-brand-assets/app-navigation/app-ui-layers/app-simplicity/background-services/android-machine-profile）。
10. 提交 scripts/_sync-packages.py 的 prune 修复并补 CHANGELOG；评估是否把 prune 并入常规同步。
11. 把 temp/simplicity-probe-v2.mjs 移入版本库固定路径；GOVERNANCE_VERSION 补 commit 指针。

约束：不碰 secrets；不代改他人账本；不重写远端历史除非用户拍板；commit/push 需用户明确指令。
验收：SYNC-OK ｜ CHANNEL-OK ｜ tm 44/44 ｜ proto 9/9 ｜ solo（母版 15/15）｜ ledger-fields 35/35 ｜ ui-leak 2/2 ｜ check-ledger --allow-example = LEDGER-OK。
交付：一次性给出「跑了什么／结果／改了什么」三段报告，附复核命令。
```

---

> 报告路径：`review/审查报告_2026-10-14_ark-code-latest.md`
> 说明：本文件为只读审查产出，未修改任何治理文件或业务项目。
