# 严格模式结果（无任何历史豁免）

命令：`node scripts/model/check-ledger.mjs <项目>/docs/model`（不带 LEDGER_* 环境变量）

扫描项目：35
- exit 0：1
- 本轮字段校验导致 FAIL 的项目：5（共 48 行）

## 逐项目

| 项目 | exit | 本轮字段FAIL行 | 其它(既有APP门等) | 样例 |
|---|---|---|---|---|
| 000-alw-个人偏好-电脑治理仓库-skill管理 | 1 | 0 | 1 | APP-TRUEOUT-SOURCE-UNRESOLVED — docs/handoff/HANDOFF.md 不存在，无法判定需求真源。docs/pm 下有  |
| 000-alw-数据库管理专家 | 1 | 0 | 1 | APP-TRUEOUT-SOURCE-UNRESOLVED — HANDOFF 无 PLAN_VERSION 行，需求真源不可判定。docs/pm 下有 Pro |
| 001-ing-家庭保单数据看板 | 1 | 0 | 1 | APP-TRUEOUT-SOURCE-UNRESOLVED — HANDOFF 无 PLAN_VERSION 行，需求真源不可判定。docs/pm 下有 Pro |
| 002-ing-第三周作业-24-生活物种测试 | 1 | 0 | 1 | APP-TRUEOUT-SOURCE-UNRESOLVED — HANDOFF 无 PLAN_VERSION 行，需求真源不可判定。docs/pm 下有 Pro |
| 003-ing-个人网站项目-site | 1 | 0 | 1 | APP-TRUEOUT-SOURCE-UNRESOLVED — HANDOFF 无 PLAN_VERSION 行，需求真源不可判定。docs/pm 下有 Pro |
| 005-ing-家族图谱管理器 | 1 | 0 | 1 | APP-TRUEOUT-SOURCE-UNRESOLVED — HANDOFF 无 PLAN_VERSION 行，需求真源不可判定。docs/pm 下有 Pro |
| 006-ing-提示词管理器 | 1 | 6 | 1 | DISPATCH-LOG.jsonl#1: bad runtime="本窗口subagent"（合法取值：本窗口 / 当前客户端窗口（自动探测） / codeb |
| 008-ing-语音输入法 | 1 | 0 | 1 | APP-TRUEOUT-SOURCE-UNRESOLVED — HANDOFF 无 PLAN_VERSION 行，需求真源不可判定。docs/pm 下有 Pro |
| 010-ing-DS-GPT桌面额度显示工具 | 1 | 0 | 1 | APP-TRUEOUT-SOURCE-UNRESOLVED — HANDOFF 的 PLAN_VERSION 未用反引号标出 Plan 文件路径，真源不可判定。 |
| 011-ing-个人打卡小工具 | 1 | 2 | 1 | TASK-MODEL-LOG.jsonl#1: bad rework="1(记录铅笔图标换成 Lucide pencil 后重出包)"（须有限整数） |
| 014-ing-山寨滚仓网站 | 1 | 0 | 1 | APP-TRUEOUT-SOURCE-UNRESOLVED — HANDOFF 无 PLAN_VERSION 行，需求真源不可判定。docs/pm 下有 Pro |
| 015-ing-photo-library | 1 | 0 | 1 | APP-TRUEOUT-SOURCE-UNRESOLVED — HANDOFF 的 PLAN_VERSION 未用反引号标出 Plan 文件路径，真源不可判定。 |
| 016-ing-懒得打字-安卓版本 | 1 | 0 | 1 | APP-TRUEOUT-SOURCE-UNRESOLVED — HANDOFF 无 PLAN_VERSION 行，需求真源不可判定。docs/pm 下有 Pro |
| 017-ing-RSS聚合-个人信息雷达 | 1 | 0 | 1 | APP-TRUEOUT-SOURCE-UNRESOLVED — HANDOFF 的 PLAN_VERSION 未用反引号标出 Plan 文件路径，真源不可判定。 |
| 018-ing-本地视频转文字工具 | 1 | 0 | 1 | docs/pm/PRODUCT_PLAN.md: APP-BASELINE-MISSING — 缺「APP 基础能力声明」（主题三态/语言集/系统跟随/回退/持 |
| 019-ing-摄影图库app | 1 | 0 | 1 | APP-TRUEOUT-SOURCE-UNRESOLVED — HANDOFF 的 PLAN_VERSION 未用反引号标出 Plan 文件路径，真源不可判定。 |
| 020-ing-拉伸换边app | 1 | 0 | 1 | APP-TRUEOUT-SOURCE-UNRESOLVED — HANDOFF 无 PLAN_VERSION 行，需求真源不可判定。docs/pm 下有 Pro |
| 021-ing-workbuddy-switch | 1 | 0 | 1 | APP-TRUEOUT-SOURCE-UNRESOLVED — docs/handoff/HANDOFF.md 不存在，无法判定需求真源。docs/pm 下有  |
| 022-ing-葫芦军师红利指数看板 | 1 | 0 | 1 | APP-TRUEOUT-SOURCE-UNRESOLVED — HANDOFF 的 PLAN_VERSION 未用反引号标出 Plan 文件路径，真源不可判定。 |
| 025-ing-拉伸语音播报 app | 1 | 0 | 1 | APP-TRUEOUT-SOURCE-UNRESOLVED — HANDOFF 的 PLAN_VERSION 未用反引号标出 Plan 文件路径，真源不可判定。 |
| 026-ing-夜间补光灯 | 1 | 0 | 1 | APP-TRUEOUT-SOURCE-UNRESOLVED — HANDOFF 的 PLAN_VERSION 未用反引号标出 Plan 文件路径，真源不可判定。 |
| 027-ing-蛋白质计算器 | 1 | 0 | 1 | APP-TRUEOUT-SOURCE-UNRESOLVED — HANDOFF 的 PLAN_VERSION 未用反引号标出 Plan 文件路径，真源不可判定。 |
| 028-ing-酒吧聚会社交导演 | 1 | 6 | 1 | DISPATCH-LOG.jsonl#237: bad used="备用"（合法取值：主） |
| 030-ing-skill 日报体系 | 1 | 0 | 1 | APP-TRUEOUT-SOURCE-UNRESOLVED — HANDOFF 无 PLAN_VERSION 行，需求真源不可判定。docs/pm 下有 Pro |
| 036-ing-中美汇率看板 | 1 | 0 | 1 | APP-TRUEOUT-SOURCE-UNRESOLVED — HANDOFF 无 PLAN_VERSION 行，需求真源不可判定。docs/pm 下有 Pro |
| 037-ing-AI 编程训练营网站 | 0 | 0 | 1 | LEDGER-OK |
| 038-ing-keep 运动健身仓库 | 1 | 0 | 1 | APP-TRUEOUT-SOURCE-UNRESOLVED — HANDOFF 无 PLAN_VERSION 行，需求真源不可判定。docs/pm 下有 Pro |
| 039-ing-酒吧游戏 | 1 | 6 | 1 | DISPATCH-LOG.jsonl#237: bad used="备用"（合法取值：主） |
| 040-ing-才艺展示厅 | 1 | 0 | 1 | APP-TRUEOUT-SOURCE-UNRESOLVED — HANDOFF 的 PLAN_VERSION 未用反引号标出 Plan 文件路径，真源不可判定。 |
| 041-ing-nightrec | 1 | 0 | 1 | APP-TRUEOUT-SOURCE-UNRESOLVED — HANDOFF 的 PLAN_VERSION 未用反引号标出 Plan 文件路径，真源不可判定。 |
| 042-ing-AIHOT 热点日报站 | 1 | 0 | 1 | APP-TRUEOUT-SOURCE-UNRESOLVED — docs/handoff/HANDOFF.md 不存在，无法判定需求真源。docs/pm 下有  |
| 044-ing-AI 图文短剧分镜生成器 | 1 | 0 | 1 | APP-TRUEOUT-SOURCE-UNRESOLVED — HANDOFF 无 PLAN_VERSION 行，需求真源不可判定。docs/pm 下有 Pro |
| 045-ing-凯格尔训练 | 1 | 0 | 8 | docs/pm/PRODUCT_PLAN_V1.0.md: WARN 非当前真源的 APP Product Plan 缺「APP 基础能力声明」（主题三态/语言 |
| 046-ing-麻将小白助手 | 1 | 28 | 4 | DISPATCH-LOG.jsonl#1: bad used="codebuddy/glm-5.3-flash"（合法取值：主） |
| main-2 | 1 | 0 | 1 | APP-TRUEOUT-SOURCE-UNRESOLVED — HANDOFF 的 PLAN_VERSION 指向的文件不存在：temp/用户草稿-Produc |
