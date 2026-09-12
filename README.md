# ORCA V2.1 治理模板分发版｜导航（先读我）

> 模板名V2.1冻结，治理版本以 `GOVERNANCE_VERSION=2.2` 为准。

开工读盘顺序（全体系唯一）：`AGENTS.md` → `docs/roles/`（本次角色卡）→ 根 `USER_MODEL_OVERRIDE.md`（模型表，有就用它）→ `docs/handoff/`（交接现状）→ 根 `经验一句话.md` → 任务目标放最后。

## 用户只需记住三个口令

- `第一阶段，计划`：进 Phase1（PLAN），Planner＋Research Reviewer 出 PRODUCT_PLAN，≥90 才找你。
- `第二阶段，开发`：Human Gate 批准后进 Phase2（DEVELOP，锁定 DEV_BASELINE），V4.1 主链开发。
- `变更请求：……`：开发中反馈统一入口，TM 按 A（小改留 DEVELOP）/ B（局部功能改留 DEVELOP 不召 Sol）/ C（产品架构变 Controlled Reopen）分类。

## 模型口径（一句话）

- FREE（`opencode/muse-spark-1.3-contributor-free`）：TM 常驻编排＋Phase1 按需 Research Reviewer。
- V4.1（`deepseek-v4.1-flash` via codebuddy）：开发阶段主力（supervisor/builder/reviewer/qa/recorder/neat）。
- Sol（`codex/gpt-5.6-sol`）：Phase1 产品 Planner＋Phase2 高难升级（senior-expert）。
- GO：`OPENCODE_GO = MANUAL_ONLY`，禁自动切备进 GO，主备均不可用停派找人。

## 根目录（现行7）

- `AGENTS.md`：全员规则（一页）
- `USER_MODEL_OVERRIDE.md`：模型表（主用/备用/RUNTIME，改表即生效，精确ID禁别名）
- `V2.1_BRIDGE_INTEGRATION_CONTRACT.md`：Bridge通道技术合同（包内拷贝，原件在业务仓，更新回仓重拷）
- `GOVERNANCE_VERSION`：版本（2.2）
- `经验一句话.md`：收工一句经验
- `scripts/orchestration/`：L3 watchdog 脚本＋部署说明（防停摆，配套 docs/prompts/ 持续推进协议；仅 Orca 终端/外部通道编排时部署）
- 本 `README.md`：导航；`USER_MODEL_OVERRIDE.md` 规则即模型切换口径

## docs/ 地图

- `roles/`：10张角色卡（只看本次派的角色）
- `prompts/`：编排者/外部开发者/迁移整理三份提示词＋《2026-09-02 丨 Orca 通用编排者持续推进协议 丨 V1.1》（防停摆三层监督收编版；其动态角色论与十卡制冲突，不采用）
- `history/`：2.0重塑说明、2.1更新说明（历史，看现行先看根）＋审查报告3份（-y轮/现势/逐派，未提交，结论已落实部分见现行文件）
- `templates/`：归位表模板
- `pm/` `qa/` `review/`：计划/测试/评审落盘（各照 template）
- `handoff/`：交接（含模板）；`model/`：模型账本（首任务前删示例行）
- `sop/`：仅模板示例，新项目自建

## 已删除（用户令，结论均已落实）

- 历史治理审查报告6份（09-09→09-11）：P1/P2结论已全部修完验过，删前状态见 git 历史；现行结论以包内文件为准
- 根散文件已归位：三提示词→`prompts/`、两说明→`history/`、归位表→`templates/`

## 可直接使用的模板包

- `新项目模板包/`：新项目初始化所需的完整文件包。
- `老项目迁移模板包/`：老项目迁移所需的完整文件包，包含 `【迁移整理｜2.1】` 提示词。
- `新项目模板包.zip`、`老项目迁移模板包.zip`：对应的可复制压缩包。
