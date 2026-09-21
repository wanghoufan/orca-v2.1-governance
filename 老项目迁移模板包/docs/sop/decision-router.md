# decision-router｜Decision Sidecar 调用面（基础设施规范位）

> Jev = 建议，ORCA 规则 = 权限。只在规则无唯一答案的分叉点由 TM 调用。

- 工具：`scripts/decision/orca-decide.mjs <change|route|user|p0> <state.json>`（直调 https://api.typesafe.ai/v1/systemone，jev-latest）。
- 输出稳定 JSON（decision＋probability＋advisory_only＋usage）；失败 exit 非 0＋fallback 回 V2.1 逻辑，绝不默认成功。
- 四类：CHANGE_CLASS(A/B/C)、ISSUE_OWNER(6 枚举)、USER_REQUIRED(5 枚举)、P0_HARD(bool＋risk 0..1)。
- 不调用：规则有唯一答案、rework 计数、Human Gate 已触发、watchdog、exit code、权限明文规定。
- 置信：≥0.85 可采用（先查规则冲突）；0.65–0.85 仅提示；<0.65 回退。Human Gate/删除/不可逆/付费/换模型永不自动批。
- Secret：`~/.config/orca/decision.env`（TYPESAFE_API_KEY，600），禁入仓。
- 用量：每次 usage.input_tokens 自行累计；402 即额度用尽，停用并找用户。
