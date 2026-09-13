# ORCA 治理模板分发版｜导航（先读我）

> 模板名冻结，版本真相以本仓库 Git 提交历史为准（版本标记文件仅为指针）。

开工读盘顺序（全体系唯一）：`AGENTS.md` → `docs/roles/`（本次角色卡）→ 根 `USER_MODEL_OVERRIDE.md`（模型表，有就用它）→ `docs/handoff/`（交接现状）→ 根 `经验一句话.md` → 任务目标放最后。

## 用户只需记住三个口令

- `第一阶段，计划`：进 Phase1（PLAN），Planner＋Research Reviewer 出 PRODUCT_PLAN，≥90 才找你。
- `第二阶段，开发`：Human Gate 批准后进 Phase2（DEVELOP，锁定 DEV_BASELINE），默认主链开发（模型以override表为准）。
- `变更请求：……`：开发中反馈统一入口，TM 按 A（小改留 DEVELOP）/ B（局部功能改留 DEVELOP 不召 Sol）/ C（产品架构变 Controlled Reopen）分类。

## 模型口径（一句话，以根 `USER_MODEL_OVERRIDE.md` 表为准）

- supervisor 走 `deepseek-v4.1-flash` via codebuddy；builder/qa/product-reviewer 走 `codex/gpt-5.6-luna` via codex；code-reviewer/经验/neat 走 FREE 本窗口；planner/senior 走 `codex/gpt-5.6-sol` via codex；TM 开窗口时定。
- 换人用户直接改表；表内无备用列。

## 根目录（现行7）

- `AGENTS.md`：全员规则（一页）
- `USER_MODEL_OVERRIDE.md`：模型表（角色/模型/执行通道/调用方式，改表即生效，精确ID照抄执行）
- `BRIDGE_INTEGRATION_CONTRACT.md`：Bridge通道技术合同（包内拷贝，原件在业务仓，更新回仓重拷）
- `GOVERNANCE_VERSION`：版本指针文件（内容：以Git历史为准）
- `经验一句话.md`：收工一句经验
- `scripts/orchestration/`：L3 watchdog 脚本＋部署说明（防停摆，配套 docs/prompts/ 持续推进协议；仅 Orca 终端/外部通道编排时部署）
- 本 `README.md`：导航；`USER_MODEL_OVERRIDE.md` 该表即模型切换口径（表外无规则）

## docs/ 地图

- `roles/`：10张角色卡（只看本次派的角色）
- `prompts/`：编排者/外部开发者/迁移整理三份提示词（迁移整理含自举取包＋冲突处理，可当老项目唯一入口）＋《Orca 通用编排者持续推进协议》（防停摆三层监督收编版；其动态角色论与十卡制冲突，不采用）＋《Orca 编排治理监督者提示词》（总监督wake-only收编版，平时只喊编排者）
- `history/`：重塑说明、更新说明（历史，看现行先看根）
- `templates/`：归位表模板
- `pm/` `qa/` `review/`：计划/测试/评审落盘（各照 template）
- `handoff/`：交接（含模板）；`model/`：模型账本（首任务前删示例行）
- `sop/`：仅模板示例，新项目自建

## 已删除（用户令，结论均已落实）

- 历史治理审查报告6份（09-09→09-11）：P1/P2结论已全部修完验过，删前状态见 git 历史；现行结论以包内文件为准
- 根散文件已归位：三提示词→`prompts/`、两说明→`history/`、归位表→`templates/`

## 改名对照（去版本号一次改名，老链接按此找新位置）

- `V2.1_BRIDGE_INTEGRATION_CONTRACT.md` → `BRIDGE_INTEGRATION_CONTRACT.md`
- `docs/history/2.0-重塑说明.md` → `docs/history/重塑说明.md`
- `docs/history/2.1-更新说明.md` → `docs/history/更新说明.md`
- `docs/history/ORCA-V2.1-治理审查报告-*` → `docs/history/ORCA-治理审查报告-*`
- `docs/history/*ORCA V2.1模型与双阶段治理-整改方案 丨 V1.0.md` → `docs/history/*ORCA模型与双阶段治理-整改方案.md`
- `docs/prompts/*持续推进协议 丨 V1.1.md` → `docs/prompts/Orca 通用编排者持续推进协议.md`
- `docs/sop/*交接上下文 丨 V1.0.md` → 去掉末尾 ` 丨 V1.0`
- 口令 `【迁移整理｜2.1】` → `【迁移整理】`
- 口令 `【编排者｜2.1开工】` → `【编排者｜开工】`
- 口令 `【外部施工｜2.1】` → `【外部施工】`

## 可直接使用的模板包

- `新项目模板包/`：新项目初始化所需的完整文件包。
- `老项目迁移模板包/`：老项目迁移所需的完整文件包；入口是 `【迁移整理】` 提示词（含自举取包：包还没到位时它会自己回本机治理仓库取，无需你手动拷贝）。
- `新项目模板包.zip`、`老项目迁移模板包.zip`：对应的可复制压缩包。
