# ORCA 治理体系复审报告丨2026-09-15（第二次）

基线：`main` ＋ 工作区未提交变更（`git diff HEAD --stat 39 files +95/-589`：删 Contract×3、改 AGENTS/README/override/builder/supervisor/编排者/外部/迁移整理/BUGS.template/HANDOFF.template、两包同步、两 zip 重建）。本次为增量复审：只判“上轮是否修好＋有无新增”，结论以双路交叉核查为准。

## 已修复（验过，可闭环）
1. Contract 删除：母版＋两包共 3 份 `BRIDGE_INTEGRATION_CONTRACT.md` 已删；活跃模板 `Contract/BRIDGE/deepseek-bridge` 零命中（历史冻结件除外）。
2. `codebuddy` 残留清零：AGENTS/builder/supervisor/编排者/BUGS.template/HANDOFF.template 均已去；DISPATCH runtime 枚举现为 `本窗口/codex/opencode/—`，与现表对齐。
3. 模型口径切换：override supervisor→`opencode-go/muse-spark-1.3-contributor/opencode`、builder→`opencode-go/deepseek-v4.1-flash/opencode`；README/编排者/HANDOFF 已同步；编排者裁决改为“以 USER_MODEL_OVERRIDE 为准”（上轮 P1-3 主项已修）。
4. sop 入位：`docs/sop/docker/supabase/sqlite.md` 母版＝两包内容一致；AGENTS/编排者/README 接线已落。
5. 排名参考文件已删；`HANDOFF.template:20`、`BUGS.template:15` 去 Contract/通道特例，母版↔两包零差。
6. 母版↔两包核心零差：roles×10/override/jsonl/pm 双模板/review 双模板/HANDOFF.template/BUGS/sop 内容一致；仅剩预期裸名差（见 P2-5）。

## 剩余 P0（1 项，未修）
- P0-1 product-reviewer FREE 硬编码：`AGENTS.md:6`＋`docs/roles/task-manager.md:10` 仍写 `product-reviewer（Research Reviewer，FREE）`，与 `USER_MODEL_OVERRIDE.md:11 product-reviewer=codex/gpt-5.6-luna/codex`＋`README.md:15` 冲突。按字面 Phase1 会派往 FREE 本窗口，与禁套娃冲突。修复：两处删 FREE，改为“模型/通道以 override 表为准”。

## 剩余 P1（6 项）
- P1-1 PROJECT_PHASE 三态：`docs/roles/task-manager.md:9` 仍三态（缺 `PLAN_REOPEN_REQUIRED`），与 `AGENTS.md:5`＋`HANDOFF.template.md:6` 四态冲突。修复：TM 卡补第四态。
- P1-2 used 主/备打架：`task-manager.md:7（含实际走主/备）`＋`HANDOFF.template.md:15（本派走主/备一句）` vs `AGENTS.md:43,58（used恒填主）`＋`supervisor.md:38（!=主即打回）`。修复：二选一并同步校验脚本。
- P1-3 缓存静态打头漏 sop：`AGENTS.md:64` 仍 `AGENTS→角色卡→override→HANDOFF→经验→任务目标`，编排者 `:12` 已加“涉基础设施加 docs/sop/”。按缓存节字面会漏带 sop。修复：AGENTS 该行同步加 sop 条件分支。（新增）
- P1-4 Gate 简写：`AGENTS.md:6`＋`README.md:9`＋编排者 `:16` 只写 `≥90`，模板 `:32` 为全量 AND（≥90＋P0=0＋blocking P1=0＋事实/假设验证）。定义权已指回模板，属简写风险。修复：AGENTS/编排者铁律行补“且模板全条件满足”半句。（上轮 P0-3 降级为 P1）
- P1-5 账本 TASK 侧：schema 11 键无 `note`但实物多 `note`（supervisor 用 `req<=` 容忍，文字 vs 实物不一致）；示例 `role=builder/model=codex/gpt-5.6-luna` 与现 builder 行脱节；删除责任分散（AGENTS 称迁移整理工/首个 TM 删，但迁移整理提示词无此步骤；TASK“首个真实任务前”vs DISPATCH“首个真实派工前”vs README“首任务前”）。修复：TASK schema 补 `note` 可选键＋更新示例模型＋迁移整理补删示例步骤＋统一措辞。
- P1-6 HANDOFF 预期差计数过期＋未落盘：`HANDOFF.md:76称4行/178称3处` 已过期（现仅 AGENTS:36＋scripts README:3 共 2 处裸名差，Contract 行已失效）；`docs/sop×3`＋两包 `sop×6` 内容一致但 `??` 未跟踪，两 zip 已重建待验解压。修复：更新 HANDOFF 计数＋落盘＋验 zip。

## 剩余 P2（6 项）
- P2-1 TM Gate 速记漏两项：`task-manager.md:10` 只有 `≥90＋P0＋blocking P1`，缺模板后两项。定义权已指回模板，仅速记补齐。
- P2-2 续 session 口径：`AGENTS.md:38` 只写 `codex用resume`，现表 supervisor/builder 为 opencode；编排者 `:10` 真 resume 仅 `codex/外部通道`，opencode 是否算外部通道未明。修复：明确 opencode resume 语义。
- P2-3 builder 禁新建举例仍带 `deepseek-builder/official-builder` 前缀，易误判残留。建议换通道无关举例。
- P2-4 README 地图：`:18现行7` vs 实 11、`:31 history` 漏第三份整改方案、`:39` 未提本次删排名文件、`:46` 审查报告改名对照空悬。
- P2-5 两包裸名差为预期布局差（包根平铺），但用户未搬前包内 `docs/prompts/` 引用悬空；两包 README 搬运清单已有，HANDOFF 计数需同步 P1-6。
- P2-6 版本号：sop 头部 V1.x＋`supabase §14/19/21` 自身版本史 vs AGENTS 去版本号；历史文件数字版本残留。建议加“此为 sop/历史自身版本，非 GOVERNANCE_VERSION”一句；冻结件加“冻结豁免不改”声明，否则 `rg` 持续误报（含 HANDOFF 历史节 93 处）。

## 优化建议
1. supervisor 五查加状态机四态合法性校验。
2. `diff 零容忍`脚本化，避免 HANDOFF 人工计数误差（本次 P1-6 即实例）。

## 验证说明
- 未改业务代码；本报告仅文档复审。
- 严格口径 `BRIDGE|Contract|deepseek-bridge|codebuddy|deepseek-flash` 活跃模板零命中已验；历史冻结命中按 HANDOFF §28 豁免。
- 假设：override 表为模型真相源、AGENTS 为规则真相源。若不成立，P0-1 裁决需重定。
