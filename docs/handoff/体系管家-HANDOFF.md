# 体系管家 HANDOFF｜体系治理专线

> 只记**体系治理这一条线**（迭代、审计、待办）；项目交接看同目录 `HANDOFF.md`。
> 用户说「你是体系管家」⇒ 由你接管整个 ORCA 治理体系的内容管理与修改，含本文件的更新。
> 上限 ≤100 行 / ≤8,192 字节。事实／风险／踩坑一律外置，本文件只留指针与现势。

## §0 常驻指针

| 要什么 | 去哪 |
|---|---|
| 开工路由、红线、索引 | `AGENTS.md` |
| 项目现势交接 | `docs/handoff/HANDOFF.md` |
| 体系治理事实与审计附录 | `docs/history/体系自查-2026-10-27-六维度审计.md` |
| 变更正典（改了什么/为什么/怎么验） | `CHANGELOG.md` |
| 架构事实 / 风险 / 踩坑 | `docs/architecture-facts.md` / `docs/risks.md` / `agent.md` |
| 历史交接全文 | `docs/handoff/HANDOFF-归档-2026-10-27.md` |

## §1 当前进展

- 2026-10-27 planner 换模型：`codex/gpt-6.1-sol` → `codex/gpt-6.1-terra`（用户令）。表、双审组织者行、SOP／角色卡／编排者提示词／概览／`KNOWN_MODELS` 与两包已同步；`codex debug models` 有该 slug，真调回 `pong`，`CHANNEL-OK`，`GATES-OK（14 项）`。
- 2026-10-27 口令改名：**「治理管家」→「体系管家」**。触发词与职责已写入 `AGENTS.md` 入口路由第 4 条；本文件改名、全部指针（主 HANDOFF／`check-sync.sh`／审计附录）同步；概览补段并加新鲜度关键词。`GATES-OK（14 项）`，未 commit／未 push。
- 批次：2026-10-27 体系自查整改，第一批已落地并 `GATES-OK（14 项）`；未 commit／未 push。
- 已堵四个绕门点（计划改名／缺 `docs/pm/`／`--allow-example`／状态写 TBD）与证据死码。
- 已补包缺件：`agent.md`、HANDOFF §0–§6、`check-sync.sh` 清单；铺包与恢复自动实例化并装 pre-commit 钩子。
- 已加一键体检 `scripts/run-gates.sh`；账本增采集条款（`MODEL-PERF-INCOMPLETE` 只报不拦）。
- 已修：`AGENTS.md` 跳步条自撞、产品审查串行/并发、概览四处旧指向、README 四处旧表述。
- 验证口径与数据见 §0 审计附录。

## §2 下一步

1. 取 §3 第 1 项（铺包零丢失目录盲区）开工，改完跑 `bash scripts/run-gates.sh`，回执写 §5。
2. 逐批推进 §3，每批结束更新 `CHANGELOG.md` 与审计附录。
3. 全部收敛后请用户决定 commit／push。

## §3 未完成

| # | 项 | 优先级 |
|---|---|---|
| 1 | `new-project-setup.sh` 零丢失检查的目录盲区（整目录被排除，删光不报） | P1 |
| 2 | 两阶段 Gate／复核粒度／四类不得延后无机器状态 | P1 |
| 3 | 测试多为文本断言（`continuous-push`／`delivery-unit` 主体／`solo-agent` 部分） | P1 |
| 4 | `README.en.md` 与中文版 2 处不同步（主开发者节、同步步数） | P2 |
| 5 | 存量项目 HANDOFF／经验超限（巡检 41 处，各项目自己的活） | P2 |
| 6 | 账本重复样本（028≡039，048/049、011/master-2 的 DISPATCH 相同） | P2 |
| 7 | `--allow-example` 仅应限母版（现按路径子串判） | P2 |
| 8 | 简化门槛 Gate A/B/D 未实战验证 | P2 |

## §4 红线

- 不 commit／不 push（须用户明确指令含分支名）。
- 不改老项目、不跑批量铺包；`000-alw-*` 不许碰。
- 不删历史（只迁移/归档）；不替用户判定文件无用。
- 不改质量门判定、角色职责、账本 schema；不新增 Gate／角色／账本字段（检查只进既有脚本）。
- 门禁未过不得报完工；测试夹具禁清场。

## §5 三日流水

- 2026-10-27：planner → `codex/gpt-6.1-terra`；真调回 `pong`，`CHANNEL-OK`，`GATES-OK（14 项）`；两包同步。
- 2026-10-27：口令「治理管家」→「体系管家」；`AGENTS.md` 入口路由补第 4 条；文件改名与全部指针、概览同步；`GATES-OK（14 项）`。
- 2026-10-27：六维度自查（三路并行）＋第一批整改（绕门／缺件／采集／一键体检／矛盾修正）；`run-gates` → `GATES-OK（14 项）`；`codebuddy` CLI 按同版本重装恢复 `CHANNEL-OK`。
- 更早条目见 `CHANGELOG.md` 与 `docs/handoff/HANDOFF-归档-2026-10-27.md`。

## §6 接续提示词

先读本文件 §0–§3，按 §2 从 §3 第 1 项继续。改完跑 `bash scripts/run-gates.sh`，回执写 §5。
