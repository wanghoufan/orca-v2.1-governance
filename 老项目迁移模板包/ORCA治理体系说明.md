# ORCA V2.1 治理体系说明（对外版，2026-09-26）

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

全程账本：每次派工记 `docs/model/DISPATCH-LOG.jsonl`、每任务记 `TASK-MODEL-LOG.jsonl`（`model` 用 `provider/model` 精确写法；含可选 `executed_by`=实际执行者、`chain_status`=角色交付/已验收/未完）；校验 `scripts/model/check-ledger.mjs`（结构错=FAIL、写法不规范=WARN）。老项目迁移后须过**登记检查**（该脚本得 `LEDGER-OK`）才算迁移完成——迁移即登记。

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
Android真机：规范已入（每 session 先过能力预检 PASS 才进正式，本窗口 bash 直驱 adb/Expo，Maestro 备用、scrcpy 只看屏）；
2026-09-21/23 双在线实测通。
```

铁律：后台静默，不弹前台抢焦点；不用系统鼠标键盘；不碰用户主 Chrome；
Google 登录等 Agent 不碰密码/MFA，登录异常交人工处理（认证可能失效，需复登不算异常）；MCP 端口重启会变，每次重读配置。

普通 QA（codex）：派工带 `-s danger-full-access` 关闭沙箱，解端口绑定/网络限制（历史“沙箱禁端口/EPERM”经查为假失败）；**仅限 QA 场景、须在账本 note 记账**，其他角色禁带。

## 五、模型与分工（11 行，以根 `USER_MODEL_OVERRIDE.md` 表为准）

模型／通道／调用方式**一律以根 `USER_MODEL_OVERRIDE.md` 表为准**（该表即唯一口径，改表必真调）；本说明**不复述模型 ID**，避免与表漂移。角色清单见 `docs/roles/` 11 张卡；task-manager 行模型开窗口时定。

## 六、规范在哪

| 规范 | 位置 | 说明 |
|---|---|---|
| 总纲 | `AGENTS.md` | 两阶段、派工顺序、升级、账本、红线（全员遵守一页） |
| 模型分工真相源 | `USER_MODEL_OVERRIDE.md` | 11 行精确ID；改表必真调；现势以本表内容为准（历史快照在 `temp/`，回退由用户口头指定编号、按改表规则执行） |
| 角色卡×11 | `docs/roles/` | 每角色职责＋写入位置；适用角色附输出模板 |
| 开工提示词 | `docs/prompts/编排者提示词.md` | 一句话开工全文 |
| 基础设施规范 | `docs/sop/` | docker/supabase/sqlite/android（＋android-machine-profile）/webqa/decision-router（去版本号引用） |
| 中央规则（散兵读） | `~/.agents/rules/`＋`~/.agents/AGENTS.md` | docker 等为软链指本仓库 sop；散兵按任务按需读 |
| 账本 | `docs/model/TASK-MODEL-LOG.jsonl`、`DISPATCH-LOG.jsonl` | 换模型决策的重要依据（先读账本，最终用户定）；`model` 精确写法，含可选 `executed_by`/`chain_status`；校验 `scripts/model/check-ledger.mjs`（FAIL 拦、WARN 供抽查） |
| 交接 | `docs/handoff/HANDOFF.md` | 状态源（新节顺延，现至 §50；旧号冻结不重排） |
| 迁移入口 | `docs/prompts/迁移整理提示词.md`（老包根同名） | 自举取包＋冲突处理＋5.7 登记检查（迁移即登记，`LEDGER-OK` 才算完成） |
| 新项目脚手架 | `新项目模板包/`（按包内 README 铺入项目根，提示词/模板按清单落位，`USER_MODEL_OVERRIDE.md` 建软链指母版） | 老项目用 `老项目迁移模板包/`＋迁移提示词 |

## 七、给审查者的检查点

1. 进 WAITING 条件全满足：Readiness≥90、P0=0、blocking P1=0、关键事实已验证、核心假设已合理验证；Human Gate 是否被绕过。
2. 派工实绩是否与分工表一致（supervisor 抽查三处对账）。
3. Jev 是否只出现在模糊分叉、有无越权自动批。
4. QA 是否后台静默、有无碰主 Chrome；普通 QA 沙箱解禁是否仅限 QA 且记账。
5. Secret（API Key、Cookie、Token）有无入仓。
6. 账本是否记全（`model` 精确写法、新字段；无账本项目是否按要求记账）。
7. 老项目迁移是否过登记检查（`check-ledger.mjs` 得 `LEDGER-OK`）。
