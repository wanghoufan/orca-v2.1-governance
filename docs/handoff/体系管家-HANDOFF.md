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

- 2026-10-31 母版整体迁入治理仓 `体系管家/`（旧 `4.Templates（PC）` 已清空）；同批收敕 `SYNC-FAIL`：`AGENTS.md` 13,091→11,901 字（6 处重复表述下沉）、`docs/sop/android.md` 28 行同步两包、母版豁免判定改按母版目录名（保留 `git rev-parse` 形态，`gates.test` 21/21）。`SYNC-OK`；`run-gates` 13/14，唯一失败为既有 `CHANNEL-FAIL`。
- 2026-10-27 及更早（换模型、口令改名、自查第一批整改、补包缺件、`run-gates` 与账本采集）已入 `CHANGELOG.md`，本文件不再重复。

## §2 下一步

1. 待用户拍板 `CHANNEL-FAIL`：角色表 6 个模型 ID 不在通道目录，换模型或升级客户端后再跑 `bash scripts/check-channel-preflight.sh`。
2. 取 §3 第 1 项（铺包零丢失目录盲区）开工，改完跑 `bash scripts/run-gates.sh`，回执写 §5。
3. 逐批推进 §3，每批结束更新 `CHANGELOG.md` 与审计附录。

## §3 未完成

| # | 项 | 优先级 |
|---|---|---|
| 1 | `new-project-setup.sh` 零丢失检查的目录盲区（整目录被排除，删光不报） | P1 |
| 2 | `CHANNEL-FAIL`：角色表 6 个模型 ID 不在通道目录（换模型／升级客户端，用户决策） | P1 |
| 3 | 两阶段 Gate／复核粒度／四类不得延后无机器状态 | P1 |
| 4 | 测试多为文本断言（`continuous-push`／`delivery-unit` 主体／`solo-agent` 部分） | P1 |
| 5 | `README.en.md` 与中文版 2 处不同步（主开发者节、同步步数） | P2 |
| 6 | 存量项目 HANDOFF／经验超限（各项目自己的活） | P2 |
| 7 | 账本重复样本（028≡039，048/049、011/master-2 的 DISPATCH 相同） | P2 |
| 8 | 简化门槛 Gate A/B/D 未实战验证 | P2 |

## §4 红线

- 不 commit／不 push（须用户明确指令含分支名）。
- 不改老项目、不跑批量铺包；`000-alw-*` 不许碰。
- 不删历史（只迁移/归档）；不替用户判定文件无用。
- 不改质量门判定、角色职责、账本 schema；不新增 Gate／角色／账本字段（检查只进既有脚本）。
- 门禁未过不得报完工；测试夹具禁清场。

## §5 三日流水

- 2026-10-31：母版迁入 `体系管家/`；收敕 `SYNC-FAIL`（AGENTS 11,901 字／android.md 同步两包／豁免改按母版目录名）。`SYNC-OK`、`gates.test 21/21`、`run-gates 13/14`（仅既有 `CHANNEL-FAIL`）；按用户指令 commit＋push（main）。
- 更早条目见 `CHANGELOG.md` 与 `docs/handoff/HANDOFF-归档-2026-10-27.md`。

## §6 接续提示词

先读本文件 §0–§3，按 §2 继续：`CHANNEL-FAIL` 待用户拍板，随后取 §3 第 1 项（铺包零丢失目录盲区）。改完跑 `bash scripts/check-sync.sh` 与 `bash scripts/run-gates.sh`，回执写 §5。
