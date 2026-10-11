# 候选基线模拟结果（**尚未获批**）

> 审查第七点：此结果是**候选豁免方案的模拟**，不是已批准兼容，也不能作为正式落实的证明。
> 本次使用的是：**已审批对照版**（BASELINE_APPROVED=1）
> 候选基线顶层与条目的审批状态须均非 PENDING 才会生效；否则自动退化为严格模式。

命令：`LEDGER_ALLOW_TEST_BASELINE=1 LEDGER_BASELINE_TESTONLY=<candidate> node scripts/model/check-ledger.mjs <项目>/docs/model`

扫描项目：35
- exit 0：1
- 本轮字段校验导致 FAIL 的项目：5（共 48 行）

## 逐项目

| 项目 | exit | 本轮字段FAIL行 | 其它 | 样例 |
|---|---|---|---|---|
| 000-alw-个人偏好-电脑治理仓库-skill管理 | 1 | 0 | 1 |  |
| 000-alw-数据库管理专家 | 1 | 0 | 1 |  |
| 001-ing-家庭保单数据看板 | 1 | 0 | 1 |  |
| 002-ing-第三周作业-24-生活物种测试 | 1 | 0 | 1 |  |
| 003-ing-个人网站项目-site | 1 | 0 | 1 |  |
| 005-ing-家族图谱管理器 | 1 | 0 | 1 |  |
| 006-ing-提示词管理器 | 1 | 6 | 1 | DISPATCH-LOG.jsonl#1: bad runtime="本窗口subagent"（合法取值：本窗口 / 当前客户端窗口（自动探测） / codeb |
| 008-ing-语音输入法 | 1 | 0 | 1 |  |
| 010-ing-DS-GPT桌面额度显示工具 | 1 | 0 | 1 |  |
| 011-ing-个人打卡小工具 | 1 | 2 | 1 | TASK-MODEL-LOG.jsonl#1: bad rework="1(记录铅笔图标换成 Lucide pencil 后重出包)"（须有限整数） |
| 014-ing-山寨滚仓网站 | 1 | 0 | 1 |  |
| 015-ing-photo-library | 1 | 0 | 1 |  |
| 016-ing-懒得打字-安卓版本 | 1 | 0 | 1 |  |
| 017-ing-RSS聚合-个人信息雷达 | 1 | 0 | 1 |  |
| 018-ing-本地视频转文字工具 | 1 | 0 | 1 |  |
| 019-ing-摄影图库app | 1 | 0 | 1 |  |
| 020-ing-拉伸换边app | 1 | 0 | 1 |  |
| 021-ing-workbuddy-switch | 1 | 0 | 1 |  |
| 022-ing-葫芦军师红利指数看板 | 1 | 0 | 1 |  |
| 025-ing-拉伸语音播报 app | 1 | 0 | 1 |  |
| 026-ing-夜间补光灯 | 1 | 0 | 1 |  |
| 027-ing-蛋白质计算器 | 1 | 0 | 1 |  |
| 028-ing-酒吧聚会社交导演 | 1 | 6 | 1 | DISPATCH-LOG.jsonl#237: bad used="备用"（合法取值：主） |
| 030-ing-skill 日报体系 | 1 | 0 | 1 |  |
| 036-ing-中美汇率看板 | 1 | 0 | 1 |  |
| 037-ing-AI 编程训练营网站 | 0 | 0 | 1 |  |
| 038-ing-keep 运动健身仓库 | 1 | 0 | 1 |  |
| 039-ing-酒吧游戏 | 1 | 6 | 1 | DISPATCH-LOG.jsonl#237: bad used="备用"（合法取值：主） |
| 040-ing-才艺展示厅 | 1 | 0 | 1 |  |
| 041-ing-nightrec | 1 | 0 | 1 |  |
| 042-ing-AIHOT 热点日报站 | 1 | 0 | 1 |  |
| 044-ing-AI 图文短剧分镜生成器 | 1 | 0 | 1 |  |
| 045-ing-凯格尔训练 | 1 | 0 | 8 |  |
| 046-ing-麻将小白助手 | 1 | 28 | 4 | DISPATCH-LOG.jsonl#1: bad used="codebuddy/glm-5.3-flash"（合法取值：主） |
| main-2 | 1 | 0 | 1 |  |
