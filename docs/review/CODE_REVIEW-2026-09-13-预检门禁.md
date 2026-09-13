# CODE REVIEW

- Task: P1预检门禁复核（真机QA会话能力预检判据＋Canary口径，只读不改被检输出）
- Commit:
- Reviewer: code-reviewer
- Model: deepseek-v4.1-flash（via codebuddy）
- Result: 过（PASS；P0=0；P1=0；P2×5，均不拦门）

> Dispatch / Evidence ID 系字段 2.0 已废弃，不填。

## P0 / P1 Findings

- P0=0；P1=0。结论：预检门禁为硬门禁、Canary 判据不可编造，两项治理语义自洽可执行，无阻塞项。
- 预检结论枚举与 `docs/roles/qa.md:5` 一致（`PASS / BLOCKED_TOOL_NOT_INJECTED / BLOCKED_ORCA_APPROVAL / BLOCKED_RUNTIME / BLOCKED_OS_PERMISSION / FAIL_UNVERIFIED_ACTION / NOT_VERIFIED`），禁 `FAIL_MODEL_ACTION` 在位；`ok=true/exit 0/工具调用成功`但无状态或像素变化记 `FAIL_UNVERIFIED_ACTION` 已落判据。
- Canary 七项（读屏／截图／点击／输入／滚动／判断UI状态／真实端到端）保持"七项全过才写已启用"；未过标 `PENDING / NOT_VERIFIED`，全仓无"已启用"虚假断言，语义守恒（`docs/roles/qa.md:4`、`docs/qa/BUGS.template.md:9,25,27`）。
- 预检落盘节（`docs/qa/BUGS.template.md:7-29`）字段齐、可逐项取证，与 `docs/qa/` 预检节要求一致；本轮无业务代码改动、无越界。

## 旁证（只读核对）

- `USER_MODEL_OVERRIDE.md` 未动：本轮修订不涉及模型表，10 行主备与执行通道列保持原状。
- 两包镜像非预期差 ZERO：母版↔`新项目模板包/`↔`老项目迁移模板包/` 核对，差异仅 AGENTS 与 编排者提示词 的扁平包裸名布局差（预期，布局正确），无漏网非预期差。
- ZIP 已重建：两分发 ZIP 按本轮内容重建，非旧缓存。

## P2 / P3 Backlog Findings

- P2-1（不拦门）：Canary 状态存在 `PENDING` 与预检 `NOT_VERIFIED` 双写法并用，建议统一为单一枚举或就地加注二者分属"Canary 七项未测"与"预检能力缺席"两种语境，避免复核时误读。改法：`docs/roles/qa.md` 或 `docs/qa/BUGS.template.md` 加半句口径注，由收尾 neat 顺手记一笔。
- P2-2（不拦门）：预检 UI 子项（无副作用控件点击／测试框输入／滚动位移）与正式 Canary 判据（同七项）字面高度重合，建议在预检节加半句区分——预检为"能力自证、进正式 QA 的门票"，正式 Canary 为"验收结论、决定是否写已启用"，防止误把预检 PASS 当 Canary PASS。改法同上，半句注即可。
- P2-3（不拦门，TM 已修）：尾部分隔符笔误，已由 TM 修正，本轮复验无残留。
- P2-4（不拦门，TM 已修）：像素差曾记 `FAIL`，应为 `FAIL_UNVERIFIED_ACTION`，已由 TM 修正；现行 `docs/qa/BUGS.template.md:25` 判据正确（像素差为零记 `FAIL_UNVERIFIED_ACTION`）。
- P2-5（不拦门，TM 随后补）：HANDOFF 待补 §13（本轮修订落档节），由 TM 随后补齐。
