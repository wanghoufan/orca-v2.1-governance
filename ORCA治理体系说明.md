# ORCA V2.1 治理体系说明（对外版，2026-09-23）

> 一页纸讲清：这套体系是什么、怎么运转、模型怎么分工、规范都在哪。
> 本文件是概览，不能替代真相源做合规审计（完整 Gate、精确派工、验证证据以 AGENTS.md、分工表、HANDOFF 为准）。版本真相以 Git 历史为准。

## 一、体系是什么

ORCA V2.1 是一套多智能体编程治理体系：固定 **9 常驻＋1 升级＋1 专项（9+1+1）**，不新增角色。
核心规矩：task-manager 是唯一对人说话的编排者；supervisor 只对编排者说话、独立复检
（编排者失联时替喊人一次）；
Human Gate 必须用户亲口放行；模型怎么切，用户说了算，任何智能体不得自作主张。

## 二、运转流程

```text
用户说「第一阶段，计划」
  → Phase1（PLAN）：planner（Sol）↔ product-reviewer 多轮打磨计划
  → Readiness ≥90 且 P0=0 且 blocking P1=0 且关键事实已验证且核心假设已合理验证 → WAITING_HUMAN_APPROVAL（停下找人一次）
用户说「第二阶段，开发」
  → Phase2（DEVELOP，锁定计划基线）
  → Builder 写 → Code-Reviewer 复核 → QA 测 → Supervisor 复检 → 编排者收齐找人
  → 修/回归循环 → 完工
用户说「变更请求：……」
  → A小改留开发 / B局部改留开发 / C产品架构改走受控重开＋Human Approval
```

升级规则：同一 Task 被 supervisor 打回 2 次，当次升 senior-expert；senior 再被打回 2 次停线找人。

## 三、Jev 决策侧车怎么接入

Jev 不是第 12 个角色，不进主链，是编排者旁边的机器判定器：

```text
用户 ──→ Task Manager / 编排者 ──→ Builder → Reviewer → QA → Supervisor → TM
                    │
                    │ 仅规则无唯一答案的分叉点
                    ↓
              orca-decide（scripts/decision/）
                    ↓
              Jev（TypeSafe直调，4类有限判断）
```

- 只判七类：CHANGE_CLASS（A/B/C）、ISSUE_OWNER（6角色）、USER_REQUIRED（5枚举）、P0_HARD（bool＋风险）
  ＋ Shadow 三类（TASK_PROFILE／BUILDER_CLASS／SKILL_ROUTE，阈值 null，只记录不派工）。
- 只做建议（advisory），规则冲突听规则，失败回原逻辑；Human Gate/删除/不可逆/付费/换模型永不自动批。
- 现态（2026-09-23）：TypeSafe 直调（jev-1.13.0），旧四 Contract 回归 10/10，新 Shadow 6/6，
  注入/故障矩阵全过；运行模式 ADVISORY（自动路由禁，Sol 终审通过）。
- 确定性短路：supervisor 打回≥2 次、Human Gate 明确、不可逆删除，一律不问 Jev 直接走规则。
- 发送前门禁：可信 data_class 由调用方给（任务 JSON 自带忽略），SECRET/未知等级拒发；密钥正则 16 类。
- 不每个 Task 都调；supervisor 打回计数、watchdog 等确定性逻辑不经 Jev。

## 四、Web QA 通道怎么运转

```text
QA Agent ──调用──→ MCP ──驱动──→ BrowserOS neo（独立后台浏览器）──→ Web/localhost
（调用方向；数据回流反向。桥接：Orca → OpenCode CLI → BrowserOS MCP，Orca 无原生 MCP 面）
Android真机：规范口径为本窗口 bash 直驱（adb/Expo），每 session 先过能力预检 PASS 才进正式；
Maestro＋ADB 于 2026-09-21 做过一次真机 Flow 实测通过（6 步全绿，未入规范，仅备用）；
本体系仅将 scrcpy 用于看屏，不作为自动化通道。
```

铁律：后台静默，不弹前台抢焦点；不用系统鼠标键盘；不碰用户主 Chrome；
Google 登录等 Agent 不碰密码/MFA，登录异常交人工处理（认证可能失效，需复登不算异常）；MCP 端口重启会变，每次重读配置。

## 五、模型与分工（T4 现势，11 行；下表用精确 ID，task-manager 行开窗口时定除外）

| 角色 | 模型（精确ID） | 通道 |
|---|---|---|
| task-manager | 开窗口时定 | 本窗口直派 |
| supervisor | opencode-go/muse-spark-1.3-contributor | opencode 直调 |
| builder | 峰谷分流：空闲 codebuddy/deepseek-v4.1-flash；高峰 volcengine-plan/glm-5.3-flash（北京时间工作日 9-12/14-18 高峰，双路互备） | codebuddy/opencode |
| planner | codex/gpt-5.6-sol | codex |
| code-reviewer | opencode/muse-spark-1.3-contributor-free | 本窗口 |
| qa | codex/gpt-5.6-luna（普通走 codex；真机走本窗口直驱） | codex 双态 |
| product-reviewer | codex/gpt-5.6-terra | codex |
| experience-recorder | opencode/muse-spark-1.3-contributor-free | 本窗口 |
| neat-freak | opencode/muse-spark-1.3-contributor-free | 本窗口 |
| senior-expert | codex/gpt-5.6-sol（只接升级） | codex |
| db-admin | opencode-go/deepseek-v4.1-flash | opencode 直调 |

另：火山方舟 Coding Plan（`volcengine-plan/glm-5.3-flash` 精确 ID 已真调，`ark-code-latest` 为控制台别名），
私有代码已由用户批准走该通道；MiMo 2.6 已移出 Builder 候选。

## 六、规范在哪

| 规范 | 位置 | 说明 |
|---|---|---|
| 总纲 | `AGENTS.md` | 两阶段、派工顺序、升级、账本、红线（全员遵守一页） |
| 模型分工真相源 | `USER_MODEL_OVERRIDE.md` | 11 行精确ID；改表必真调；T4 现势（T1/T2/T3 快照在 `temp/`，回退由用户口头指定编号、按改表规则执行） |
| 角色卡×11 | `docs/roles/` | 每角色职责＋写入位置；适用角色附输出模板 |
| 开工提示词 | `docs/prompts/编排者提示词.md` | 一句话开工全文 |
| 基础设施规范 | `docs/sop/` | docker/supabase/sqlite/android（＋android-machine-profile）/webqa/decision-router（去版本号引用） |
| 中央规则（散兵读） | `~/.agents/rules/`＋`~/.agents/AGENTS.md` | docker 等为软链指本仓库 sop；散兵按任务按需读 |
| 账本 | `docs/model/TASK-MODEL-LOG.jsonl` | 换模型决策的重要依据（先读账本，最终用户定） |
| 交接 | `docs/handoff/HANDOFF.md` | 状态源（新节自 §39 起，旧号冻结不排） |
| 新项目脚手架 | `新项目模板包/`（按包内 README 铺入项目根，提示词/模板按清单落位，`USER_MODEL_OVERRIDE.md` 建软链指母版） | 老项目用 `老项目迁移模板包/`＋迁移提示词 |

## 七、给审查者的检查点

1. 进 WAITING 条件全满足：Readiness≥90、P0=0、blocking P1=0、关键事实已验证、核心假设已合理验证；Human Gate 是否被绕过。
2. 派工实绩是否与分工表一致（supervisor 抽查三处对账）。
3. Jev 是否只出现在模糊分叉、有无越权自动批。
4. QA 是否后台静默、有无碰主 Chrome。
5. Secret（API Key、Cookie、Token）有无入仓。
