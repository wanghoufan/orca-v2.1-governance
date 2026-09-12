# ORCA V2.1 老项目迁移模板包

## 用途

用于已有项目接入 ORCA V2.1。迁移整理工只整理治理文件，不改业务逻辑。

## 放入项目根目录

```text
AGENTS.md
USER_MODEL_OVERRIDE.md
docs/roles/
docs/pm/
docs/handoff/
docs/model/
docs/qa/
docs/review/
迁移整理提示词.md
归位表.template.md
```

其中 `AGENTS.md`、`USER_MODEL_OVERRIDE.md` 和 `docs/roles/` 已包含 ORCA 分发版原文；项目已有的运行记录保留在原处。

## 同步补记（母版常驻同步，新增文件去向）

```text
V2.1_BRIDGE_INTEGRATION_CONTRACT.md → 项目根（包内已含原文）
GOVERNANCE_VERSION                   → 项目根（包内已含原文）
外部开发者提示词.md / 编排者提示词.md / 迁移整理提示词.md → 项目根（包内原位）
归位表.template.md                   → 项目根或 docs/templates/（包内原位）
docs/model/DISPATCH-LOG.jsonl        → 项目 docs/model/（包内已含示例行，首派前删除）
```

## 迁移命令

现有 V2.1 迁移入口是：

```text
【迁移整理｜2.1】
```

完整指令见同目录 `迁移整理提示词.md`。将本模板包放入项目后，把该提示词发送给负责迁移的智能体。

## 迁移铁律

- 不改业务逻辑。
- 搬了会 broken 的文件留在原处，并登记映射。
- 不覆盖项目原有规则，先备份、比对、再决定冲突处理。
- 迁移完成后输出《项目文件归位表》并记录验证结果。
