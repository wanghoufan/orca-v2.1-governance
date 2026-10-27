# HANDOFF｜ORCA 治理母版（分发版）

> 恢复入口，不是档案馆：**≤100 行 / ≤8,192 字节**。事实进 `docs/architecture-facts.md`，风险进 `docs/risks.md`，踩坑进 `agent.md`。
> 全文历史见 `docs/handoff/HANDOFF-归档-2026-10-27.md`（1,496 行，只读不改）。

## §0 常驻指针

| 要什么 | 去哪 |
|---|---|
| 开工路由、红线、索引 | `AGENTS.md`（唯一真源） |
| 架构与构建事实 | `docs/architecture-facts.md` |
| 未决风险与待验证项 | `docs/risks.md` |
| 踩坑与审查交付约定 | `agent.md` |
| 经验条目 | `经验一句话.md`（超量归档 `docs/history/经验-归档-2026-10-27.md`） |
| 治理细则 | `docs/sop/governance-{scope,execution-modes,dispatch,ledger}.md` |
| 角色卡（11 张） | `docs/roles/` |
| 历史交接全文 | `docs/handoff/HANDOFF-归档-2026-10-27.md` |
| 体系治理专线（迭代/审计/待办） | `docs/handoff/体系管家-HANDOFF.md` |

## §1 当前进展

- **2026-10-27 可读性整改（本轮，未 commit）**：把「所有角色开工全量读规则」改为「入口路由 + 按需指针」。
- 已落地：`AGENTS.md` 顶部改为唯一「入口路由（全体系唯一）」（6,103 → 6,652 字，仍 ≪ 12,000 上限）；`README.md`、`README.en.md`、`docs/prompts/编排者提示词.md`、`docs/handoff/HANDOFF.template.md` 四处旧顺序改为指针。
- 已落地：`HANDOFF.md` 由 1,496 行 / 242,820 字节精简为本文件；原文整份留在同目录归档，未删任何内容。
- 已落地：新建 `docs/architecture-facts.md`（架构事实）、`docs/risks.md`（风险 R1–R11）；`agent.md` 追加本项目踩坑表。
- 已恢复：`docs/sop/background-services.md`（工作区误删，`git checkout --` 还原，哈希与两包一致）。
- 基线保全：`temp/2026-10-27 丨 整改前基线/`（980 文件 tar + 逐文件 sha256 + 3 项删除镜像 + `created.txt`），`rollback.sh --dry-run` 已验。
- 已落地：`check-sync.sh` 加体积闸（HANDOFF／经验／事实／风险／踩坑）与入口闸（标记唯一＋旧表述归零＋缺失负例），项目侧只报 WARN；新增 `scripts/model/governance-size.test.mjs` 8 用例。
- 已落地：`_sync-packages.py`（`TEMPLATE_DIRS` 加 `docs`、`EXTRA` 加经验归档）、`new-project-setup.sh`／`restore-framework.sh` 实例化常驻位且逐文件补缺、`orca-public-ignore.txt` 更新。
- 门禁实测：`SYNC-OK`｜11 项回归全绿（ledger-fields 53/53、governance-size 8/8）｜7-Skill `VALID`；隔离铺包与 `--source` 恢复均实跑通过。`CHANNEL-FAIL` 属环境故障（codebuddy CLI 模块丢失），非本轮改动。
- **自查整改第一批（用户 A1／B1／C1）**：堵 `check-ledger` 四个绕门点＋证据死码；补 `agent.md`／HANDOFF §0–§6／`check-sync.sh` 清单缺件；新增 `run-gates.sh` 一键体检并在铺包时装 pre-commit 钩子；账本增采集要求（`MODEL-PERF-INCOMPLETE` 不拦截）。真实 24 项目复跑无新增误伤。

## §2 下一步

1. **交用户拍板**：本轮改动未 commit／未 push，等用户决定是否入库。
2. **待用户决策三项**：B 两包是否合并、C `temp/` 6 套证据是否清理、E `~/.agents/rules` 悬空软链是否代修。
3. **下一轮可选**：把 `HANDOFF-SIZE-WARN` 点名的存量项目逐个迁移（41 处，属各项目自己的活）。

## §3 未完成

| # | 项 | 状态 |
|---|---|---|
| 1 | 未 commit／未 push（等用户明确指令） | 待授权 |
| 2 | README.en 与中文版仍有 2 处不同步（主开发者节、同步步数） | 未做 |
| 3 | 存量项目 HANDOFF／经验超限（巡检 41 处） | 各项目自己的活 |

## §4 红线（本轮同样适用）

- 不 commit / 不 push（未获明确指令）。
- 不改老项目、不跑批量铺包；`000-alw-*` 不许碰。
- 不删除历史：旧交接整份归档、旧经验全量归档，只迁移不改写。
- 不改质量门判定、角色职责、账本 schema；不新增 Gate／角色／账本字段。
- 测试先于报告：门禁未跑通不得报完工。
- 铺包铁律：不得删除/覆盖项目已有文件；脚本里出现指向项目路径的 `rm -rf` 立即停止。

## §5 三日流水

- **2026-10-27**：`codebuddy` CLI 程序本体缺失致 `CHANNEL-FAIL`，已按同版本 2.175.0 从国内镜像重装并复跑 `CHANNEL-OK`；`run-gates` 恢复 `GATES-OK（14 项）`。
- **2026-10-27**：可读性整改完成并全绿：入口路由唯一化、HANDOFF 1,496 行→66 行（原文归档）、事实/风险/踩坑分居、经验留 10 条并全量归档、体积闸与入口闸进 `check-sync`、两包同步 `SYNC-OK`、11 项回归全绿。未 commit。
- **2026-10-22**：`AGENTS.md` 从 32,990 字瘦身到 6,103 字，细则下沉 `docs/sop/governance-*.md`，新增 `AGENTS-SIZE` 体积闸；【大交接 3】成为恢复入口（已在归档文件内）。
- **2026-10-08**：APP 主题三态与中英双语纳入默认继承；产品验收矩阵改独立落盘。详见归档。
- 更早条目：见 `docs/handoff/HANDOFF-归档-2026-10-27.md`。

## §6 接续提示词

先读 `docs/handoff/HANDOFF.md` §0–§3，按 §2 等用户对 commit／B／C／E 拍板后再动。事实查 `docs/architecture-facts.md`，风险查 `docs/risks.md`，踩坑查 `agent.md`。
