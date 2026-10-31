# 架构与构建事实｜ORCA 治理母版

> 常驻事实位：只放「改代码前必须知道」的稳定事实。踩坑见根 `agent.md`，风险见 `docs/risks.md`，现势见 `docs/handoff/HANDOFF.md`。
> 上限 150 行 / 10,240 字节，超了先删过时事实再保留新的。

## 1. 仓库是什么

- 本仓是 **ORCA 治理母版（分发源）**，不是业务项目：`AGENTS.md`、规则、角色卡、脚本、模板在这里维护，再分发到各项目。
- 三个出口：`新项目模板包/`（空项目铺设）、`老项目迁移模板包/`（存量项目迁移）、`scripts/_sync-packages.py`（把母版正文同步进两个包）。
- 母版路径含空格与中文，**所有脚本必须加引号**。
- 2026-10-31 起母版位于治理仓 `1.Active/000-alw-个人偏好-电脑治理仓库-skill管理/体系管家/`；`~/.agents/rules/{android,android-machine-profile,docker,sqlite,supabase,webqa}.md` 与各项目根 `USER_MODEL_OVERRIDE.md` 均为指向本仓的**绝对软链**，母版再搬家必须同批重建，否则规则静默失效。

## 2. 目录职责

| 路径 | 职责 |
|---|---|
| `AGENTS.md` | 唯一入口：红线 + 索引，上限 12,000 字（`check-sync.sh` 体积闸） |
| `docs/sop/governance-*.md` | 治理细则（scope／execution-modes／dispatch／ledger），按需读 |
| `docs/sop/app-*.md` | APP 默认继承细则（主题、品牌、导航、分层、简化），按需读 |
| `docs/sop/{android,docker,supabase,sqlite,webqa,background-services}.md` | 基础设施规范位 |
| `docs/roles/` | 11 张角色卡；`experience-recorder`、`neat-freak` 由编排者自做，不派工 |
| `docs/handoff/HANDOFF.md` | 交接入口：≤100 行 / ≤8,192 字节 |
| `docs/architecture-facts.md` | 本文件：架构与构建事实 |
| `docs/risks.md` | 未决风险与待验证项 |
| `agent.md` | 踩坑与审查交付约定 |
| `经验一句话.md` | 经验条目：≤8,192 字节，超限先迁归档再精简 |
| `docs/history/` | 归档（历史交接、经验全量），只增不改 |
| `scripts/` | 同步、铺包、校验脚本 |
| `docs/model/` | 两本账（`TASK-MODEL-LOG.jsonl`、`DISPATCH-LOG.jsonl`），母版只留示例行 |

## 3. 分发链（改完必须走完）

1. 改母版正文（`AGENTS.md`、`README*.md`、`ORCA治理体系说明.md`、`docs/sop/`、`docs/roles/`、`docs/*.template.md`、`docs/history/` 归档、`scripts/model/`）。
2. `python3 scripts/_sync-packages.py` 同步两包。**禁止手写 `sed`/`cp` 直接改包内文件。**
3. `bash scripts/check-sync.sh` 必须 `SYNC-OK`。
4. 动过模型表或通道：`bash scripts/check-channel-preflight.sh` 必须 `CHANNEL-OK`。

同步器事实：
- `TEMPLATE_DIRS` 只按 `os.listdir` 收集各目录**根级** `*.template.md`；新增根级模板需把 `docs` 加入 `TEMPLATE_DIRS`。
- `EXTRA` 允许单文件分发，目标父目录由 `main()` 的 `os.makedirs` 自动创建。
- `docs/sop/*.md` 归一化后比对（包内 `docs/prompts/` 写裸名），`docs/assets` 逐字节比对。

## 4. 铺包与恢复

- 新项目：`bash scripts/new-project-setup.sh <项目根> [--dry-run]`。整包 `cp -R` 后实例化模板；只允许在**空的新项目**上跑。
- 已铺项目补缺：`bash scripts/restore-framework.sh <project-root> [--source <母版根>]`。脚本被拷进项目后默认 `SRC` 是项目自身，跨仓补缺**必须显式 `--source`**。
- 铺包铁律：任何铺包/同步/整理动作不得删除、清空、覆盖项目已有文件；脚本里出现指向项目路径的 `rm -rf` 立即停止改写。
- `000-alw-*` 是常驻工作区，**任何自动批量动作都不许碰**。

## 5. 校验与回归

- 治理门：`check-sync.sh`（`SYNC-OK`）＋ `check-channel-preflight.sh`（`CHANNEL-OK`）。
- 账本：`node scripts/model/check-ledger.mjs docs/model`；母版只有示例行，须加 `--allow-example`。
- 回归 10 项：`tm-qualification`、`prototype-gate`、`ui-leak`、`ledger-fields`、`solo-agent`、`gates`、`delivery-unit`、`continuous-push`、`codebuddy-rotate`、7-Skill `validate_skillset.py --master`。
- 测试夹具持久保留在版本库固定路径，**严禁清场**；pass 数以脚本实际输出为准，**文档里不写死**。

## 6. 修改治理文本的既有约束（事实）

- 不新增角色／独立 Gate／Phase／账本字段／状态枚举／自动检查器；新规则挂到既有 Gate 或既有检查脚本内。
- 两阶段治理：`PLAN` → Human Gate → `DEVELOP`；复核粒度＝交付单元；四类改动不得延后复核。
- 质量门一道没减；`P0` 未完成且用户未喊停不得收工。
