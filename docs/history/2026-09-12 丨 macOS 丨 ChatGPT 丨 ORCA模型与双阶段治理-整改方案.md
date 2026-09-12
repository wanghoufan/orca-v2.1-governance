# ORCA V2.1 模型与双阶段治理整改方案

> 方案性质：整改计划，不直接修改当前模板。  
> 执行顺序：**先整改模型并单独验收 → 再整改双阶段治理并单独验收 → 最后做整体验收与模板包同步。**  
> 基础材料：用户上传的 `2026-09-09 丨 MAC 丨 ORCA V2.1 治理模板 丨 分发版-2026-09-11(1).zip` 及当前已确认的模型/治理方案。

---

# 0. 整改目标

本轮整改只解决两件事，不扩范围：

1. **模型分工整改**
   - OpenCode FREE Muse Spark 1.3 主要用于 Task Manager，以及第一阶段按需 Research Reviewer。
   - `deepseek-v4.1-flash` via CodeBuddy 成为主要高频执行模型。
   - GPT-5.6 Sol 只用于第一阶段 Planner 和第二阶段高级开发升级。
   - OpenCode Go 当前冻结，不得作为自动 fallback。
   - 不做自动 GPT / GO 额度读取。
   - 所有当前主动使用的 DeepSeek V4.1 CodeBuddy 路由统一使用精确 ID：`deepseek-v4.1-flash`。

2. **双阶段治理整改**
   - 第一阶段：产品立项、方案讨论、Research Review、Plan Readiness、Human Gate。
   - 第二阶段：正式开发、Code Review、QA、Supervisor 防停摆、必要时升级 Sol。
   - 两阶段之间必须有 Human Gate，AI 不得自动进入开发。
   - 开发中所有用户新反馈统一走 Change Request A/B/C 分类。
   - Task Manager 与 Supervisor 保持独立，不合并。

---

# 1. 当前模板审查结论

当前 ORCA V2.1 已有一套稳定的“角色卡 + override + HANDOFF + 账本 + Supervisor + Watchdog”框架，**不建议推倒重做**。

应保留：

- `AGENTS.md` 的固定角色卡治理思想。
- `USER_MODEL_OVERRIDE.md` 作为模型切换唯一入口。
- Task Manager 与 Supervisor 独立。
- `docs/model/TASK-MODEL-LOG.jsonl` 与 `DISPATCH-LOG.jsonl`。
- HANDOFF 机制。
- Builder / Reviewer / QA 分工。
- “同一 Task 被 supervisor 打回 2 次 / P0-hard 才升级”的现有升级思想。
- `scripts/orchestration/coordinator-watchdog-standalone.sh` 防停摆机制。
- “用户不当 watchdog / router / stage manager”的持续推进原则。
- 两个模板包：`新项目模板包/`、`老项目迁移模板包/` 及对应 ZIP 同步机制。

当前主要冲突如下：

## 1.1 模型分工与新资源策略冲突

当前 `USER_MODEL_OVERRIDE.md` 仍存在：

- Task Manager 主用 OpenCode Go Muse。
- Supervisor 主用 FREE Muse、备用 GO。
- Builder 主用 FREE Muse。
- Code Reviewer 主用 GPT Terra。
- QA 主用 MiMo FREE。
- Product Reviewer 主用 GPT Luna。
- Experience Recorder / Neat Freak 使用 FREE / GO。
- Senior Expert 仍以 Terra 为主。
- 多个角色还存在自动 fallback 到 GO。
- DeepSeek 仍保留 Bridge A / CodeBuddy B 双通道的主动路由说明。

这些与当前新策略冲突。

## 1.2 当前流程仍是单阶段开发流水线

`AGENTS.md` 和 `docs/prompts/编排者提示词.md` 当前核心顺序仍是：

```text
planner
→ builder
→ code-reviewer
→ qa
→ product-reviewer
→ supervisor
→ Task Manager 找用户
```

缺少：

- `PHASE_1_PLAN`
- `WAITING_HUMAN_APPROVAL`
- `PHASE_2_DEVELOP`
- Plan Readiness Score
- Human Gate
- DEV_BASELINE
- Change Request A/B/C
- Controlled Reopen

## 1.3 Planner 角色定义过窄

当前 `docs/roles/planner.md` 只有：

> 把目标拆成可派 Task。

这不符合第一阶段 Planner 的新定位：

> 用户与 Sol 长对话 → 产品立项 → 功能/流程/技术方案 → 根据 Research Reviewer 反馈持续修订。

## 1.4 Product Reviewer 与新 Research Reviewer 不匹配

当前 `product-reviewer` 只负责：

> 从用户视角验“像不像、顺不顺、差哪”。

新方案需要它在第一阶段承担：

- 外部资料搜集
- 竞品研究
- 官方事实核验
- 用户反馈研究
- 反证搜索
- 关键假设挑战
- Plan Readiness 评分

为了降低迁移风险，本轮**不新增第 11 个角色，也不强制改内部 role ID**。

建议：

> 保留内部 ID `product-reviewer`，但把它重新定义为  
> **Research Reviewer / 研究审查者**。

这样仍保持现有 “9 常驻 + 1 升级专用” 的结构，不需要大规模迁移历史日志和脚本。

## 1.5 PLAN 模板目前偏开发 Stage

当前 `PLAN.template.md` 主要是：

- Current Stage
- Stage P0
- Task Breakdown

缺少真正产品计划需要的：

- 用户与产品目标
- 核心方案
- User Flow
- 功能范围
- 技术路线
- 关键假设
- 外部验证
- Research Review
- Readiness Score
- Human Gate

## 1.6 HANDOFF 缺少两阶段关键状态

当前 HANDOFF 没有：

- PROJECT_PHASE
- PLAN_VERSION
- PLAN_READINESS_SCORE
- PLAN_GATE
- DEV_BASELINE
- CHANGE_REQUEST

因此无法可靠判断：

> 当前究竟是在“计划”还是“开发”。

---

# 2. 整改原则

## 2.1 严格分两批执行

必须遵守：

```text
第一批：模型整改
↓
模型 Gate 全部通过
↓
第二批：双阶段治理整改
↓
治理 Gate 全部通过
↓
整体验收
↓
同步新项目/老项目模板包
↓
重新打 ZIP
```

禁止模型和治理同时大改后再一起排错。

---

## 2.2 不增加不必要复杂度

本轮明确不做：

- GPT 额度自动读取。
- GO 额度自动读取。
- GREEN / YELLOW / RED 配额状态机。
- 新 Registry。
- 第 11 个角色。
- 新的自动额度服务。
- 重要代码额外增加 Spark Gate Review。
- Task Manager 与 Supervisor 合并。
- 推翻现有 L3 watchdog。

---

# 3. 第一批整改：模型分工

# 3.1 目标模型表

建议把 `USER_MODEL_OVERRIDE.md` 的主动模型表调整为：

| 角色 | 主用模型 | Runtime | 自动备用 | 用途 |
|---|---|---|---|---|
| task-manager | `opencode/muse-spark-1.3-contributor-free` | 本窗口 subagent | `deepseek-v4.1-flash` / codebuddy，可选 | 每项目一个常驻编排者 |
| supervisor | `deepseek-v4.1-flash` | `codebuddy` | 无自动 GO fallback | 监督 TM、防停摆、复检 |
| builder | `deepseek-v4.1-flash` | `codebuddy` | 无自动 GO fallback | 普通开发主力 |
| planner | `codex/gpt-5.6-sol` | codex / 当前已验证 Sol 通道 | 无自动降级 | 第一阶段产品 Planner |
| code-reviewer | `deepseek-v4.1-flash` | `codebuddy` | 无自动 GO fallback | 独立 Reviewer Session |
| qa | `deepseek-v4.1-flash` | `codebuddy` | 无自动 GO fallback | 测试 / 回归 / DoD |
| product-reviewer | `opencode/muse-spark-1.3-contributor-free` | 本窗口 subagent | 无自动 GO fallback | 内部 ID 保留；职责改为 Research Reviewer |
| experience-recorder | `deepseek-v4.1-flash` | `codebuddy` | 无自动 GO fallback | Stage / 项目收尾低频调用 |
| neat-freak | `deepseek-v4.1-flash` | `codebuddy` | 无自动 GO fallback | Stage / Release 收尾低频调用 |
| senior-expert | `codex/gpt-5.6-sol` | codex | 无自动备用 | 第二阶段高级开发升级 |

说明：

1. **Planner 与 Senior Expert 都使用 Sol，但职责完全不同：**
   - Phase 1：Planner
   - Phase 2：Advanced Developer / Senior Expert

2. FREE Muse 不再铺满多个常驻角色。
   - 每项目常驻主要只保留 Task Manager。
   - Research Reviewer 在 Phase 1 每一版正式 Plan 后按需启动，不常驻。

3. V4.1 成为主要执行工作池：
   - Supervisor
   - Builder
   - Code Reviewer
   - QA
   - Recorder
   - Neat Freak

4. 所有这些 CodeBuddy 路由统一：

```text
model = deepseek-v4.1-flash
runtime = codebuddy
effort = high
```

---

# 3.2 OpenCode Go 冻结

`USER_MODEL_OVERRIDE.md` 必须明确新增当前规则：

> `OPENCODE_GO = MANUAL_ONLY`

含义：

- GO 不得作为任何角色自动备用。
- FREE / CodeBuddy 失败后不得静默切 GO。
- 只有用户明确说“这次可以使用 GO”时才允许。
- 无可用通道时停派并找用户。

必须删除或改写所有类似：

```text
FREE → GO
```

的当前自动 fallback 规则。

---

# 3.3 DeepSeek 路由统一

当前主动路由只保留：

```text
deepseek-v4.1-flash
Runtime: codebuddy
```

当前 `V2.1_BRIDGE_INTEGRATION_CONTRACT.md` 是已经验证过的历史/备用基础设施合同。

本轮建议：

- **不要篡改该合同里的已验证历史 ID / 证据。**
- 不删除 Contract。
- 不把 Bridge 当作当前自动路由。
- 在 `USER_MODEL_OVERRIDE.md` 中把 Bridge 从“主动 A/B 双通道”降为：
  > Standby / Historical verified route，仅用户以后明确切回时再启用。

原因：

> 把历史 Contract 内已验证的 `deepseek-flash` 强改成 CodeBuddy ID，会破坏历史证据真实性。

因此“统一 `deepseek-v4.1-flash`”的范围是：

> **当前活跃 CodeBuddy 模型路由与用户口径统一**，不是伪造历史 Bridge 证据。

---

# 3.4 模型整改涉及文件

第一批至少修改：

1. `USER_MODEL_OVERRIDE.md`
2. `docs/roles/supervisor.md`
3. `docs/roles/builder.md`
4. `docs/roles/code-reviewer.md`
5. `docs/roles/qa.md`
6. `docs/roles/experience-recorder.md`
7. `docs/roles/neat-freak.md`
8. `docs/roles/senior-expert.md`
9. `docs/roles/planner.md` 中模型职责说明可暂只更新模型定位，详细 Phase 规则留第二批
10. `docs/roles/product-reviewer.md` 的模型可先切 FREE Muse，详细 Research Review 职责留第二批
11. `AGENTS.md` 中与旧模型 / GO fallback 直接冲突的模型说明
12. `docs/model/TASK-MODEL-LOG.jsonl` 示例行
13. `docs/model/DISPATCH-LOG.jsonl` 示例行
14. 新项目模板包对应文件
15. 老项目迁移模板包对应文件

暂不改：

- watchdog shell 判定逻辑。
- 历史审查报告。
- 历史 BUG / HANDOFF。
- Bridge Contract 的历史取证内容。

---

# 4. 第一批验收：Model Gate

模型整改完成后，**先停在这里验证，不进入双阶段治理修改。**

## 4.1 静态检查

必须确认：

### 检查 1：主动表没有 GO 自动 fallback

```bash
rg -n "opencode-go/" USER_MODEL_OVERRIDE.md
```

预期：

- 主动角色表中不应存在自动 GO 主用/备用。
- 如果保留文字说明，只能是 MANUAL_ONLY / 历史说明。

### 检查 2：Builder 不再使用 FREE Muse

```bash
rg -n "builder.*muse-spark.*free" USER_MODEL_OVERRIDE.md
```

预期：

> 无匹配。

### 检查 3：当前 CodeBuddy DeepSeek 统一为 V4.1

```bash
rg -n "deepseek-v4|deepseek-flash" USER_MODEL_OVERRIDE.md docs/roles AGENTS.md
```

预期：

- 当前 CodeBuddy 主动路线只出现 `deepseek-v4.1-flash`。
- `deepseek-flash` 只允许出现在明确标注为 Bridge 历史 / standby 的语境中。

### 检查 4：Terra / Luna / MiMo 不再占当前高频角色

检查主动 override 表：

- code-reviewer 不再 Terra。
- qa 不再 MiMo。
- product-reviewer 不再 Luna。
- senior-expert 不再 Terra 主用。

---

## 4.2 通道 Smoke Test

### FREE Muse

验证：

- Task Manager 可调用。
- `product-reviewer` / Research Reviewer 可调用。

只需最小只读测试，不做大任务。

### CodeBuddy V4.1

已知当前通道应使用：

```bash
codebuddy --model deepseek-v4.1-flash --effort high --help
```

再做最小单发测试。

非交互派工按现有治理规则验证 `-y`。

至少分别做一次：

- supervisor 只读检查
- builder 小型安全修改或测试仓 dry-run
- code-reviewer 只读 diff review
- qa 测试命令

### Sol

如果近期通道已有可信 PASS 证据：

> 不需要为了本轮测试重复烧大量 GPT 额度。

只做：

- 路由静态确认
- 或一次最小连接测试

禁止跑完整 Benchmark。

---

## 4.3 GO Freeze Negative Test

模拟：

> FREE Muse 不可用。

验证 Task Manager：

- 可以按表切 V4.1（如果保留该备用）。
- 或停止并找用户。
- **不得自动进入 OpenCode Go。**

---

# 4.4 Model Gate 通过标准

只有全部满足才进入第二批：

- [ ] Task Manager = FREE Muse
- [ ] Supervisor = V4.1
- [ ] Builder = V4.1
- [ ] Code Reviewer = V4.1
- [ ] QA = V4.1
- [ ] Experience Recorder = V4.1
- [ ] Neat Freak = V4.1
- [ ] Planner = Sol
- [ ] Research Reviewer 技术槽位 = FREE Muse
- [ ] Senior Expert = Sol
- [ ] GO 自动 fallback = 0
- [ ] V4.1 CodeBuddy smoke PASS
- [ ] FREE Muse smoke PASS
- [ ] 无静默付费路径
- [ ] 当前模型表语义不存在 A/B 双路线歧义

---

# 5. 第二批整改：双阶段治理

模型 Gate PASS 后才能开始。

---

# 5.1 两阶段状态

正式增加：

```text
PHASE_1_PLAN
WAITING_HUMAN_APPROVAL
PHASE_2_DEVELOP
```

用户控制口令：

```text
第一阶段，计划
第二阶段，开发
变更请求：……
```

AI 不得自己跨 Human Gate。

---

# 5.2 第一阶段：PLAN

用户说：

> `第一阶段，计划`

进入：

```text
PROJECT_PHASE = PLAN
```

允许：

- Task Manager
- Supervisor
- Planner
- Research Reviewer

禁止：

- Builder
- Code Reviewer
- QA
- 业务代码修改
- Release 工作

---

# 5.3 Phase 1 标准流程

```text
Human
  ↓ 长对话
Sol Planner
  ↓
PRODUCT PLAN V0.x
  ↓
Task Manager
  ↓
Research Reviewer（FREE Muse）
  ↓
外部研究 / 竞品 / 事实核验 / 反证
  ↓
Task Manager
  ↓
Sol Planner 修订
  ↓
循环
```

用户不负责 Planner / Reviewer 之间搬运内容。

Task Manager 必须自动：

- 收 Planner。
- 派 Reviewer。
- 收 Reviewer。
- 打回 Planner。
- 继续下一轮。

---

# 5.4 Research Reviewer 定义

保留内部 role ID：

```text
product-reviewer
```

但角色显示和职责改成：

> **Research Reviewer / 研究审查者**

职责必须包括：

- Researcher
- Reviewer
- Fact Checker
- Devil's Advocate
- Product Challenger

凡是可外部验证的信息，不允许只靠模型记忆：

- 竞品现状
- API
- 官方规则
- 技术能力
- 市场数据
- 用户反馈
- 产品定价

必须优先使用可用：

- Web Search
- Web Fetch
- 官方文档
- 官方 GitHub
- 高质量第三方资料
- 社区/用户反馈

并强制输出：

- 支持证据
- 反对证据
- 成功的相反做法
- 未验证项

---

# 5.5 Plan Readiness Score

禁止使用：

> “模型自报信心 93%”

改为：

> **Plan Readiness Score / 计划成熟度**

满分 100：

| 维度 | 分值 |
|---|---:|
| 产品目标与用户需求 | 20 |
| 核心方案完整性 | 20 |
| 外部事实与竞品验证 | 20 |
| 技术可行性 | 15 |
| 风险与异常场景 | 10 |
| 开发范围与 DoD | 10 |
| 未决问题 | 5 |

进入 Human Review 的最低条件：

```text
Plan Readiness >= 90
AND
P0 = 0
AND
blocking P1 = 0
AND
关键事实已验证
AND
核心假设已合理验证
```

---

# 5.6 Human Gate

达到 Gate 后：

```text
PROJECT_PHASE = WAITING_HUMAN_APPROVAL
PLAN_GATE = READY_FOR_HUMAN_REVIEW
```

Task Manager 必须停止 Planner ↔ Reviewer 循环。

然后只找用户一次：

- 最终 Plan 版本。
- Readiness Score。
- P0 / P1。
- 剩余只需人类拍板的问题。

AI 禁止自行启动 Builder。

只有用户明确说：

> `第二阶段，开发`

才能继续。

---

# 5.7 第二阶段：DEVELOP

用户明确批准后：

```text
PROJECT_PHASE = DEVELOP
DEV_BASELINE = PRODUCT_PLAN_Vx.x
```

进入正式开发。

默认流程：

```text
Task Manager
     ↓
V4.1 Builder
     ↓
V4.1 Code Reviewer（独立 Session）
     ↓
V4.1 QA
     ↓
V4.1 Supervisor 复检 / TM 推进
     ↓
PASS → 下一 Task / Stage
```

说明：

- 不再每个 Stage 调 Research Reviewer。
- 不再增加 Spark Gate Review。
- Product / Research Reviewer 默认退出开发主循环。
- Experience Recorder / Neat Freak 只在 Stage / Release 收尾时调用。

---

# 5.8 V4.1 Reviewer 独立 Session

Builder 与 Code Reviewer 虽然同为 V4.1，但不得让 Builder 在原 Session 中“自我审查”代替独立 Review。

Reviewer 应新开独立 Review Session，只获得：

- Requirement
- DEV_BASELINE
- DoD
- Diff
- 测试结果
- 必要代码上下文

Reviewer 目标：

> 找错、找回归、找越界，不维护 Builder 原方案。

---

# 5.9 高级开发升级

保持简单：

```text
V4.1 第一次实现
↓
Review / QA FAIL
↓
V4.1 整改一次
↓
仍 FAIL
↓
升级 Sol senior-expert
```

同时保留：

> P0-hard 可直接升级 Sol。

不增加更多高级模型层。

---

# 5.10 开发过程 Change Request

用户开发中所有反馈统一：

> `变更请求：……`

Task Manager 分类。

## A｜开发内修改

例如：

- UI 颜色
- 间距
- 按钮
- 文案
- 小 Bug

继续 Phase 2。

## B｜局部功能变化

例如：

- 新字段
- 已有 i18n 架构增加俄语 / 泰语
- 不改变核心架构的小功能

更新局部 Requirement / DoD，继续 Phase 2。

## C｜产品 / 架构变更

例如：

- 改核心用户流程
- 改数据结构
- 改权限模型
- 当前没有标准 i18n，却突然扩展多语言架构
- 改关键技术路线
- 产品范围明显扩大

状态：

```text
PLAN_REOPEN_REQUIRED
```

只暂停受影响范围。

针对这个变更进行：

```text
Sol Planner
↕
Research Reviewer
↓
Human Approval
↓
更新 Product Plan
↓
更新 DEV_BASELINE
↓
回 DEVELOP
```

不得把整个项目无条件从头重跑。

---

# 6. 双阶段整改涉及文件

## 6.1 `AGENTS.md`

必须改：

1. 在顶部增加两阶段治理。
2. 现有固定单线“planner→builder→review→qa→product…”改为 Phase-aware。
3. 明确：
   - Phase 1 禁 Builder。
   - Human Gate 不能自动跨越。
   - Phase 2 禁随意改 Plan。
4. `product-reviewer` 显示名改为 Research Reviewer。
5. 明确 Task Manager 与 Supervisor 独立。
6. 保留 9+1 数量，不新增角色。
7. 增加 Change Request A/B/C。
8. 保留 2 次打回 / P0-hard 升 Sol。

---

## 6.2 `docs/prompts/编排者提示词.md`

这是本轮治理整改的核心文件之一。

必须新增三个用户入口：

```text
第一阶段，计划
第二阶段，开发
变更请求：……
```

并把当前固定阶段顺序改成：

### PLAN

```text
Planner
→ Research Reviewer
→ Planner
→ ...
→ Readiness Gate
→ Human Gate
```

### DEVELOP

```text
Builder
→ Code Reviewer
→ QA
→ Supervisor
→ TM
```

必须明确：

- 用户不搬运反馈。
- 达 90 分后自动停止继续磨。
- 未经用户明确批准不得开发。
- Change Request C 触发 Controlled Reopen。

---

## 6.3 `docs/roles/task-manager.md`

新增：

- Project Phase owner。
- PLAN / DEVELOP 两套派工规则。
- Human Gate。
- Change Request 分类。
- `DEV_BASELINE` 锁定。
- Readiness ≥90 后停止循环。
- Planner / Reviewer 自动回传，不找用户搬运。

---

## 6.4 `docs/roles/supervisor.md`

保留现有账本与复检职责。

新增最小 Phase Integrity 检查：

- PLAN 阶段不得出现 Builder / QA 业务派工。
- WAITING_HUMAN_APPROVAL 不得自动进入开发。
- DEVELOP 必须存在 DEV_BASELINE。
- C 类变更不得绕过 Controlled Reopen。
- Task Manager 停摆继续执行现有 watchdog / 恢复职责。

不把 Supervisor 改成 Planner 或 Reviewer。

---

## 6.5 `docs/roles/planner.md`

从当前“拆活”升级为：

### Phase 1 主职责

- 与 Human 深入讨论产品。
- 建立产品目标。
- 梳理用户。
- 功能与 User Flow。
- 技术可行性初稿。
- 风险。
- DoD。
- 关键假设。
- 根据 Research Review 多轮修订。

### Phase 2

默认停用。

只有：

- Controlled Reopen
- 用户明确要求重新规划

才再次进入。

---

## 6.6 `docs/roles/product-reviewer.md`

内部 ID 保持。

标题建议：

```text
# product-reviewer（Research Reviewer / 研究审查者）
```

职责改为 Phase 1 Research Reviewer。

Phase 2 日常开发默认不派。

---

## 6.7 `docs/roles/builder.md`

新增：

- 仅 Phase 2 可执行。
- 必须读取 DEV_BASELINE。
- 不得自行扩大产品范围。
- 遇到疑似 C 类需求立即返回 TM，不自行“顺手改”。
- 主要模型 V4.1。
- 两轮失败升级。

---

## 6.8 `docs/roles/code-reviewer.md`

新增：

- Phase 2 only。
- V4.1 独立 Session。
- 检查：
  - DEV_BASELINE
  - Requirement
  - DoD
  - Diff
  - 回归
  - Scope creep
- 不增加 Spark Gate Review。

---

## 6.9 `docs/roles/qa.md`

新增：

- Phase 2 only。
- V4.1。
- 普通 QA：
  - unit
  - build
  - lint
  - API
  - logs
  - regression
  - DoD

### 真机 QA

本地执行者需要做一次 Canary。

只有实际验证以下动作连续可用，才允许写“V4.1 真机 QA 已启用”：

- 读屏
- 截图
- 点击
- 输入
- 滚动
- 判断 UI 状态
- 完成至少一条真实端到端流程

Canary 未过：

> 标记 `PENDING / NOT VERIFIED`，不要编造已支持。

---

# 6.10 Product Plan 模板

不建议把现有 `PLAN.template.md` 硬塞成一个巨型双用途文件。

建议新增：

```text
docs/pm/PRODUCT_PLAN.template.md
```

Phase 1 专用。

至少包含：

- Plan Version
- PROJECT_PHASE
- Product Goal
- Target Users
- Problem
- Core Value
- User Flow
- Functional Scope
- Out of Scope
- Technical Approach
- Data / API
- Key Assumptions
- Competitor / Research Summary
- Risks
- DoD
- P0 / P1 / P2
- Human Decisions Needed
- Readiness Score
- Research Review Round
- PLAN_GATE

保留当前：

```text
docs/pm/PLAN.template.md
```

作为 Phase 2 的 Stage / Task Plan。

但要新增：

```text
DEV_BASELINE:
CHANGE_REQUEST:
```

这样两个阶段不会混文档。

---

# 6.11 新增 Research Review 模板

建议新增：

```text
docs/review/RESEARCH_REVIEW.template.md
```

至少包含：

- Plan Version
- Review Round
- Result
- P0 / P1 / P2
- Key Assumptions
- Verified Facts
- External Sources
- Competitor Findings
- Counter-evidence
- Unverified Items
- Required Fixes
- Plan Readiness Score
- Human-only Decisions
- Next Action

原 `PRODUCT_BACKLOG.template.md` 可保留兼容，但不再作为 Phase 1 的主要审查模板。

---

# 6.12 `HANDOFF.template.md`

新增固定字段：

```text
PROJECT_PHASE:
PLAN_VERSION:
PLAN_READINESS_SCORE:
PLAN_GATE:
DEV_BASELINE:
CHANGE_REQUEST:
```

建议枚举：

```text
PROJECT_PHASE:
- PLAN
- WAITING_HUMAN_APPROVAL
- DEVELOP

PLAN_GATE:
- IN_PROGRESS
- READY_FOR_HUMAN_REVIEW
- APPROVED

CHANGE_REQUEST:
- NONE
- A
- B
- C
```

不要创建复杂额度状态字段。

---

# 6.13 `README.md`

新增“用户只需记住三个口令”：

```text
第一阶段，计划
第二阶段，开发
变更请求：……
```

并说明：

- FREE Muse 主要用于 TM / Research Reviewer。
- V4.1 是开发阶段主力。
- Sol 是 Plan + 高难升级。
- GO 当前 manual-only。

---

# 6.14 长版持续推进协议

文件：

```text
docs/prompts/2026-09-02 丨 Orca 通用编排者持续推进协议 丨 V1.1.md
```

不要重写 1292 行正文。

只修改最顶部的 V2.1/V2.2 收编说明，增加一条：

> 两阶段治理、Human Gate、Change Request 与固定 9+1 角色定义优先于正文中的通用动态流程描述。

继续保留其价值：

- L1 / L2 / L3
- rolling wait
- 防停摆
- STATE / handoff 思想
- watchdog
- 验证后再声称

---

# 6.15 Watchdog

文件：

```text
scripts/orchestration/coordinator-watchdog-standalone.sh
```

本轮原则：

> **默认不改。**

原因：

- 它目前独立于 Registry / Model / Phase。
- 它只负责检测漂移并唤醒协调者。
- 这正是需要保留的防 Task Manager 停摆机制。

除非双阶段测试证明出现具体缺陷，否则禁止顺手重写 watchdog。

---

# 7. 双阶段治理测试

# 7.1 Phase 1 正向测试

输入：

```text
第一阶段，计划
```

验证：

- PROJECT_PHASE = PLAN。
- Planner = Sol。
- Builder / QA 不启动。
- Planner 输出 PRODUCT PLAN。
- TM 自动派 Research Reviewer。
- Research Reviewer 反馈自动回 Planner。
- 用户不搬运。

---

# 7.2 Readiness 低于 90

模拟：

```text
Readiness = 84
P0 = 0
P1 = 2
```

预期：

- 继续 PLAN。
- 不找用户宣布开发。
- TM 自动打回 Planner。

---

# 7.3 Readiness Gate

模拟：

```text
Readiness = 92
P0 = 0
blocking P1 = 0
```

预期：

```text
PROJECT_PHASE = WAITING_HUMAN_APPROVAL
PLAN_GATE = READY_FOR_HUMAN_REVIEW
```

并：

- 停止 Planner / Reviewer 自动循环。
- 找 Human。
- Builder 仍不能启动。

---

# 7.4 Human Gate Negative Test

在 Human 未说：

```text
第二阶段，开发
```

前，尝试派 Builder。

预期：

> 拒绝派工。

这是 P0 测试。

---

# 7.5 Phase 2 正向测试

Human 输入：

```text
第二阶段，开发
```

预期：

- PROJECT_PHASE = DEVELOP。
- PLAN_GATE = APPROVED。
- DEV_BASELINE = 最终 Product Plan 版本。
- TM 可派 Builder。
- 默认主链：
  V4.1 Builder → V4.1 Reviewer → V4.1 QA → Supervisor。

---

# 7.6 独立 Reviewer 测试

验证：

- Builder Session 与 Reviewer Session 不是同一审查上下文。
- Reviewer 只拿 Requirement / baseline / diff / tests。
- Reviewer 能输出 PASS / FAIL。
- FAIL 能回原 Builder 链整改。

---

# 7.7 两轮升级测试

模拟：

```text
Attempt 1 FAIL
Attempt 2 FAIL
```

预期：

- 停 V4.1 普通链。
- 路由到 senior-expert = Sol。
- 不继续第三轮 V4.1 无限磨。

测试可以使用 mock / dry-run 路由证明。

> 不要求为了测试真的大量消耗 Sol。

---

# 7.8 Change Request A

输入：

```text
变更请求：按钮间距改大一点
```

预期：

- A。
- 留在 DEVELOP。
- V4.1 Builder → Review → QA。
- 不召回 Planner。

---

# 7.9 Change Request B

输入：

```text
变更请求：在已有 i18n 架构中增加俄语、泰语
```

预期：

- B。
- 更新局部 Requirement / DoD。
- 留在 DEVELOP。
- 不召回 Sol Planner。

---

# 7.10 Change Request C

输入：

```text
变更请求：当前没有 i18n 架构，现在需要重新设计完整多语言体系
```

预期：

```text
PLAN_REOPEN_REQUIRED
```

然后：

- 只暂停受影响范围。
- Sol Planner + Research Reviewer。
- Human Approval。
- 新 Plan Version。
- 更新 DEV_BASELINE。
- 回到 DEVELOP。

---

# 7.11 Supervisor / 防停摆测试

保留当前实际问题：

> Task Manager 会宕住。

测试至少验证：

1. TM 有 worker_done 但未继续推进。
2. Supervisor 能发现。
3. 已部署 L3 watchdog 时能唤醒 coordinator。
4. 不由用户充当 watchdog。
5. watchdog 只唤醒，不代做 Gate。

如当前 watchdog 已有可靠最近 PASS 证据，可做回归而不是重构。

---

# 7.12 真机 QA Canary

仅当本地 CodeBuddy / V4.1 实际提供可用桌面控制能力时执行。

通过标准：

- [ ] 读屏
- [ ] 截图
- [ ] 点击
- [ ] 输入
- [ ] 滚动
- [ ] UI 状态判断
- [ ] 一条端到端用户流程完成
- [ ] QA 结果能落 `docs/qa/`

未全部通过：

> 真机 QA 保持“待验证”，不得写正式支持。

---

# 8. 回归测试

双阶段整改不能破坏已有 V2.1 能力。

必须回归：

## 8.1 JSONL Schema

继续执行现有：

- TASK-MODEL-LOG validator
- DISPATCH-LOG validator

Good case：

> exit 0

Bad case：

> exit 1

---

## 8.2 Watchdog

```bash
bash -n scripts/orchestration/coordinator-watchdog-standalone.sh
```

若已部署：

```bash
launchctl list | grep coordinator-watchdog
launchctl kickstart -k gui/$(id -u)/com.orca.coordinator-watchdog
tail -5 /tmp/coordinator-watchdog.log
```

---

## 8.3 精确模型路由

确认：

- `deepseek-v4.1-flash` → codebuddy
- `codex/gpt-5.6-sol` → Sol
- `opencode/muse-spark-1.3-contributor-free` → FREE Muse

不得存在未经验证的新别名。

---

## 8.4 禁止 GO 自动调用

全仓静态查：

```bash
rg -n "opencode-go/" .
```

允许：

- 历史文件
- 明确的 MANUAL_ONLY 说明

不允许：

- 当前主动自动 fallback。

---

# 9. 模板同步

母版验收通过后，必须同步：

```text
新项目模板包/
老项目迁移模板包/
```

对应主动文件必须保持一致。

老项目包只允许保留：

- 迁移专属提示词
- 迁移专属 README 差异

其他治理核心文件不应漂移。

必须重新生成：

```text
新项目模板包.zip
老项目迁移模板包.zip
```

并校验 ZIP 内文件确实是新版本，不是旧缓存。

---

# 10. 建议版本治理

本轮不是小修。

它改变：

- 模型主路由。
- Planner 定义。
- Product Reviewer 定义。
- 整个生命周期状态机。
- Human Gate。
- Change Request。
- 开发基线。

因此建议整改完成并全部 PASS 后：

```text
GOVERNANCE_VERSION
2.1 → 2.2
```

如果执行者暂时不想升版本：

> 至少必须在变更说明中明确标记为“V2.1 Two-Phase Amendment”。

但更推荐正式升级到 V2.2。

注意：

> `V2.1_BRIDGE_INTEGRATION_CONTRACT.md` 是独立历史合同版本，不应因为治理版本升 2.2 就擅自改写其中已经验证的历史事实。

---

# 11. 执行顺序清单

## Batch A｜模型整改

- [ ] 修改 USER_MODEL_OVERRIDE
- [ ] FREE Muse → TM
- [ ] V4.1 → Supervisor
- [ ] V4.1 → Builder
- [ ] V4.1 → Code Reviewer
- [ ] V4.1 → QA
- [ ] V4.1 → Recorder
- [ ] V4.1 → Neat Freak
- [ ] Sol → Planner
- [ ] FREE Muse → product-reviewer / Research Reviewer
- [ ] Sol → senior-expert
- [ ] GO → MANUAL_ONLY
- [ ] Bridge → standby，不进自动路由
- [ ] 模型静态检查 PASS
- [ ] V4.1 smoke PASS
- [ ] FREE Muse smoke PASS
- [ ] GO negative test PASS

### Batch A Gate

> 未 PASS 不得进入 Batch B。

---

## Batch B｜双阶段治理

- [ ] AGENTS 加两阶段
- [ ] 编排者提示词加三口令
- [ ] Task Manager 加 Phase owner
- [ ] Supervisor 加 phase integrity
- [ ] Planner 改产品 Planner
- [ ] product-reviewer 改 Research Reviewer
- [ ] Builder 限 Phase 2
- [ ] Reviewer 独立 V4.1 Session
- [ ] QA 改 V4.1
- [ ] 新增 PRODUCT_PLAN.template
- [ ] 新增 RESEARCH_REVIEW.template
- [ ] HANDOFF 加 phase / gate / baseline / change
- [ ] Phase 1 正向 PASS
- [ ] Human Gate negative PASS
- [ ] Phase 2 正向 PASS
- [ ] Change A/B/C PASS
- [ ] 两轮升级 PASS
- [ ] Supervisor/watchdog 回归 PASS

---

## Batch C｜整体验收与同步

- [ ] JSONL validators PASS
- [ ] watchdog 回归 PASS
- [ ] root 主动文件无旧模型冲突
- [ ] GO 无自动 fallback
- [ ] 用户三个口令都可工作
- [ ] 新项目模板包同步
- [ ] 老项目迁移模板包同步
- [ ] 两 ZIP 重建
- [ ] diff 无非预期差异
- [ ] 版本号更新
- [ ] HANDOFF 记录本轮整改

---

# 12. Definition of Done

本轮整改只有同时满足以下条件才算完成：

1. 模型整改先独立 PASS。
2. 双阶段治理后独立 PASS。
3. 当前所有高频开发/审查/QA 主路由使用 `deepseek-v4.1-flash`。
4. Task Manager 使用 FREE Muse。
5. Research Reviewer 使用 FREE Muse，但只在 Phase 1 / Controlled Reopen。
6. Planner 使用 Sol。
7. Senior Expert 使用 Sol。
8. GO 不存在任何自动 fallback。
9. Phase 1 无法启动 Builder。
10. Readiness ≥90 只能进入 Human Gate，不能自动开发。
11. 只有用户明确说“第二阶段，开发”才能进入 DEVELOP。
12. DEVELOP 必须有 DEV_BASELINE。
13. Change A/B 不重开完整计划。
14. Change C 能受控重开计划并重新 Human Approval。
15. Task Manager 与 Supervisor 仍独立。
16. V4.1 Reviewer 使用独立审查 Session。
17. 两轮普通开发失败能升级 Sol。
18. 真机 QA 未经 Canary 不得宣称正式支持。
19. watchdog / 账本 / HANDOFF 原有关键能力未被破坏。
20. 母版、新项目包、老项目包、ZIP 已同步并验证。

---

# 13. 本轮明确禁止执行者顺手做的事

为了避免整改失控，执行者不得：

- 顺手重构整个 watchdog。
- 新增第 11 个角色。
- 新建复杂额度监控服务。
- 自动读取 GPT / GO quota。
- 把 GO 恢复成默认备用。
- 把 Spark 加回每轮开发 Gate。
- 合并 Task Manager 与 Supervisor。
- 删除 Bridge 历史合同或篡改已验证证据。
- 顺手重写 1292 行持续推进协议正文。
- 以“更先进”为由扩大当前整改范围。
- 未完成 Batch A 验收就开始 Batch B。
- 未跑测试就宣布完成。

最终交付时必须提供：

1. 修改文件清单。
2. 每个文件改了什么。
3. Batch A 测试结果。
4. Batch B 测试结果。
5. 回归测试结果。
6. 未验证项。
7. 新旧模板包同步结果。
8. 最终 PASS / FAIL 结论。
