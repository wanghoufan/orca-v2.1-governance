# ORCA 治理体系审查报告丨2026-09-15

审查范围：`AGENTS.md`、`USER_MODEL_OVERRIDE.md`、`README.md`、`BRIDGE_INTEGRATION_CONTRACT.md`、`GOVERNANCE_VERSION`、`经验一句话.md`、`docs/roles/`（10卡）、`docs/prompts/`、`docs/pm|qa|review|handoff|model|sop|templates|history`、`新项目模板包/`、`老项目迁移模板包/`、`scripts/orchestration/`。
判定基准：`USER_MODEL_OVERRIDE.md` 为模型真相源；`AGENTS.md` 为规则真相源；两者冲突时按 AGENTS“以表为准”应听表的，但下文 P0 显示此规则本身已被违反。

## P0（派工无法确定，必须先修）

### P0-1 Contract 与模型表直接冲突，且 Contract 虚假标注“已落地”
- `BRIDGE_INTEGRATION_CONTRACT.md:16,134,144`：builder A通道写法 = 模型列 `deepseek-flash` ＋ Runtime 列 `deepseek-bridge`，`§0` 标注“①②已落地，模板侧 Runtime 列＋编排者派发口在位，2026-09-11 复核”。
- 实际 `USER_MODEL_OVERRIDE.md:7`：`builder | opencode-go/deepseek-v4.1-flash | opencode`。模型列、Runtime 列无一对应。`README.md:15` 站在 override 一边，Contract 被孤立。
- 连带：Contract `§16` 要求账本 `model` 写 `deepseek-flash`，与 AGENTS“supervisor 抽查实派==表三处对得上”冲突，按哪边写都会被另一边打回。
- 建议：二选一。(a) Bridge 仍为 standby 则 Contract `§0` 去掉“已落地”改为“待接入”，`§16/§18` 的 `deepseek-flash` 改为“示例/待启用，当前以 override 表为准”；(b) Bridge 已启用则把 override builder 行改回 Contract 写法并同步 README。并给 Contract vs 模型表的裁决定优先级（建议：以 override 表为准，Contract 仅为技术输入）。

### P0-2 Phase1 product-reviewer 究竟 FREE 本窗口还是 codex 付费通道
- `AGENTS.md:6`：`product-reviewer（显示名 Research Reviewer，ID 不变，FREE）`；`docs/roles/task-manager.md:10` 同写 FREE。
- 实际 `USER_MODEL_OVERRIDE.md:11`：`product-reviewer | codex/gpt-5.6-luna | codex | 禁本窗口代做`；`README.md:15` 同表。
- “冲突以模型表为准”与“FREE 硬编码”无法同时成立，Phase1 主链费用/通道归属分歧。
- 建议：AGENTS 与 TM 卡删除 FREE 字样，改为“模型/通道以 override 表为准（当前 codex/gpt-5.6-luna via codex）”；或表改回 FREE 本窗口。全文检索 FREE 硬编码并统一。

### P0-3 Readiness Gate 条件被 AGENTS 简化丢条件
- `docs/pm/PRODUCT_PLAN.template.md:32` 正典：`Readiness>=90 AND P0=0 AND blocking P1=0 AND 关键事实已验证 AND 核心假设已合理验证`。
- `AGENTS.md:6` 只写 `PLAN_READINESS_SCORE>=90 才进 WAITING`，按字面 90 分可放行，与模板、TM 卡 `:10` 不一致。
- 建议：AGENTS 该句补全为“≥90 且模板 §Gate 全条件满足（P0/blocking P1/事实验证），定义以 PRODUCT_PLAN.template 为准”。

## P1（校验/状态机/文档导航会误判）

### P1-1 `PROJECT_PHASE` 枚举 TM 卡漏 `PLAN_REOPEN_REQUIRED`
- `AGENTS.md:5`：四态 `PLAN / WAITING_HUMAN_APPROVAL / DEVELOP / PLAN_REOPEN_REQUIRED`。
- `docs/roles/task-manager.md:9` 只列三态，漏 `PLAN_REOPEN_REQUIRED`，但同文件 `:13` 又要求 Change C 进该态，自相矛盾。
- 建议：TM 卡补第四态，并注明“仅 Change C 受控重开期间”。

### P1-2 DISPATCH `used` “恒填主” vs “记实际主/备”
- `AGENTS.md:43,58`＋`supervisor.md:38`：`used 恒填主`，非“主”即打回。
- `docs/roles/task-manager.md:7`：记“实际走主/备”。
- 有备用通道事实（Bridge）时无法合规记录。
- 建议：二选一并同步校验脚本：(a) 维持无备用制，TM 卡删“主/备”字样；(b) 承认备用，`used` 枚举改为 `主/备`，supervisor 改抽查“used 与 runtime 一致”。

### P1-3 模型冲突裁决三方口径无优先级
- `AGENTS.md:43`＋各角色卡：听 override 表；`docs/prompts/编排者提示词.md:10`：听 Contract/真实运行。
- P0-1 分歧出现时无裁决。
- 建议：编排者提示词加一句“Contract 与 override 表冲突时以 override 表为准，Contract 仅为技术输入；偏差记 HANDOFF”。

### P1-4 账本 schema“枚举锁死” vs 实物多 `note` 键
- `AGENTS.md:55` schema 11 键并称“枚举锁死”；`docs/model/TASK-MODEL-LOG.jsonl:1` 示例行 12 键（含 `note`）。
- `supervisor.md:8` 用 `req<=set(o)` 容忍多键，与“锁死”文字矛盾。
- 建议：AGENTS 改为“至少含 11 键，`note` 为可选扩展键”；或 schema 补 `note` 为可选键。并修正示例 `project:example` 与“project=仓库根目录名”定义的冲突（示例加豁免注）。

### P1-5 runtime 枚举 stale（`codebuddy/—` 幽灵值，缺 `deepseek-bridge` 口径）
- `supervisor.md:40`、AGENTS 多处保留 `codebuddy`；现表只用 `本窗口/opencode/codex`。
- 建议：枚举改为与现表一致；若 `codebuddy`/Bridge 为历史/备用，标注“历史保留，当前无实例”而非可放行值；supervisor 放行逻辑同步。

### P1-6 README docs 地图与实物对不上
- `README.md:30-31`：`history/` 只写两份，遗漏第三份 `2026-09-12 丨 macOS 丨 ChatGPT 丨 ORCA模型与双阶段治理-整改方案.md`；`model/` 只写账本，未提 `模型分工工作量排名-2026-09-13-参考.md` 去留。
- `README.md:43-54` 改名对照：`docs/sop/*交接上下文` 去向不明（现 sop 仅三件）；审查报告改名对照已空悬（实物已删）。
- 建议：补齐第三份历史文件说明＋排名文件去留；空悬对照加“（已删，见 git 历史）”。

### P1-7 去版本号残留
- `GOVERNANCE_VERSION:1`＋`README.md:3`：以 Git 为准不设数字版本；但 `docs/history/更新说明.md:5-8` 仍写 `GOVERNANCE_VERSION=2.1/升2.2`，HANDOFF 多节仍记 `V2.1/V2.2`；三 sop 头部仍保留 `版本 V1.x＋日期`。
- 建议：历史文件加“数字版本已废弃，现行以 Git 为准”注；sop 头部版本改为“历史版本注”或删除，正文互引维持去版本（HANDOFF §26 已有解释，把该解释搬进 sop 头注释）。

## P2（可执行性/责任/计数）

- P2-1 真机 QA 预检主体：`docs/prompts/编排者提示词.md:19` 称“预检可由 TM 会话内执行”，`qa.md` 无此句且称不得复用。建议：qa 卡补该边界，或删除提示词该句。
- P2-2 示例行删除 owner：AGENTS 只明确 TASK 示例行由“迁移整理工/首个 TM”删，DISPATCH 示例行未明确。建议：TM 卡加“首个真实派前删两表示例行”。
- P2-3 账本分工丢 senior 分支：`AGENTS.md:56` 有 `builder/senior 写初版`，编排者提示词只写 builder。建议补 senior。
- P2-4 缓存“换模型即开新链”执行者不明：改母版表后旧链 HANDOFF 快照谁写未指定。建议：模型节加“改表后当前链由 TM 写 HANDOFF 快照后开新链”。
- P2-5 母版↔两包裸名差计数与 HANDOFF 旧记录对不上（AGENTS＋Contract＋scripts README 共 4 处，HANDOFF §9 称 4 行、§23 称 3 处）。包布局差本身是预期的（包根平铺→用户搬到 `docs/prompts/`），但若用户未搬则 `docs/prompts/` 引用悬空。建议：两包 README 加粗“必须搬运清单”，HANDOFF 差计数更新为实测值。
- P2-6 更新说明缓存五条描述（`不换prompt·工具·skill`）与现 AGENTS 五条对不上。建议：历史文件加“以现行 AGENTS 为准”注。

## 优化建议（非矛盾）
1. 给 `docs/roles/supervisor.md` 五查加状态机校验口径（四态合法性＋Change C 必经态）。
2. `README.md:18-26` 根目录清单补 `docs/` 下层结构一句话，避免新人误以为根只有 7 件。
3. 两包同步校验脚本化：HANDOFF 手记 `diff 零容忍` 改为 `scripts/` 一键 diff 命令，降低人工计数误差（本次 P2-5 即人工计数误差）。
4. 总监督与 supervisor 职责在 AGENTS 红线已区分，建议在两份提示词头各加互斥声明引用，避免新人混淆质量判定 vs 推进判定。

## 验证说明
- 未改业务代码；本报告仅文档审查。
- P0-1/P0-2/P1-2 已与表实物逐行核对；其余以 subagent 双路交叉核对＋抽查关键行，未全量逐字 diff。
- 假设：override 表为模型真相源；AGENTS 为规则真相源。若此假设不成立，P0-1/P1-3 裁决建议需重定。
