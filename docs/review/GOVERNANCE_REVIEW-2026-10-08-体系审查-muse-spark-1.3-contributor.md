# ORCA 治理体系审查报告

- 日期：2026-10-08
- 审查模型：muse-spark-1.3-contributor（opencode 通道）
- 范围：母版根全部治理文件（AGENTS.md、USER_MODEL_OVERRIDE.md、ORCA治理体系说明.md、README、docs/roles、docs/pm、docs/sop、scripts 三门禁脚本、docs/model 三账本）。逐文件通读 + 交叉比对 + 脚本逻辑核验。
- 母版账本现状：`docs/model/TASK-MODEL-LOG.jsonl`、`DISPATCH-LOG.jsonl` 均仅含 `_example` 示例行，无真实任务行（符合“母版只留空壳”规范，非缺陷）。

## 一、矛盾冲突与不一致（按严重度排序）

1. **P0｜Phase1 谁拟稿：task-manager 角色卡与 AGENTS 互斥**
   - `docs/roles/task-manager.md` 写 PLAN 期“只派 planner↔product-reviewer 多轮，禁派 builder”是 10-08 前旧链；AGENTS（Phase1 节＋派工顺序节）＋builder 卡 Phase1 例外＋planner 卡均已改为“builder(deepseek-flash)拟稿→reviewer→planner(Sol)打分打回 builder 改稿，planner 不执笔”。执行者按旧卡会把 builder 派工当违规打回。修法：TM 卡同步 10-08 链，删旧禁令句。
2. **P0｜builder 卡内自矛盾**：同卡既有“Phase1 限写 docs/pm/ 正文”，又有“输出只写业务仓库（计划是 planner 地盘，仅指派才代写）”旧地盘句。后句删除。
3. **P0｜override qa 行 `-s` 禁令残留**：qa 行“`-s` 仅限 QA，其他角色禁带”与 AGENTS＋概览“2026-10-07 已放宽到 QA＋planner＋senior-expert”打架，且同表 planner/senior 行已带 `-s`。修法：qa 行改“其他角色按 AGENTS 解禁口径（planner/senior-expert 可带，须账本 note 记账），禁超范围”。
4. **P1｜概览 Phase1 链滞后**：`ORCA治理体系说明.md §二` 仍写“planner↔reviewer 多轮打磨”，漏 builder 拟稿/改稿环。`check-sync.sh` 的 22 关键词查不到此类语义漂移。修法：概览补 builder 拟稿环一句。
5. **P1｜override product-reviewer 行首语病**：“走 codex 直调口径改为 codebuddy 通道”主谓残留，易误派 codex。改“走 codebuddy 通道直调”。
6. **P1｜品牌门 vs 主题 §6 免责声明打架**：`app-brand-assets.md §3–§4` 把强制点挂七颗 Design Skill Gate（design-freeze 拦等），无“未装 Skill 无机器门”说明；`app-theme-i18n.md §6` 明确未装时只有模板字段＋check-ledger 两层机器门。只装模板包的项目会高估品牌门强制力。修法：brand-assets 补与 theme-i18n §6 对等的依赖边界段。
7. **P1｜经验条过期**：`经验一句话.md` 2026-10-07 条“汇总走 stdout 落盘”是旧绕行结论，现行已是“planner 带 `-s` 直接写盘，失效才退 stdout”。照旧条执行多一跳。修订该条。
8. **P2｜PLAN.template 无 APP/品牌承接字段**：PRODUCT_PLAN 有 APP 声明＋品牌方向节（FR/AC），Phase2 的 PLAN.template 只有基线/Change/Stage 表，Traceability 在 Phase2 断链。补 APP/品牌承接栏或映射说明。
9. **P2｜override 档案行旧 ID**：行3 `codex/gpt-6-sol` 与行 18/19 `gpt-6.1-sol` 并存；注释称历史行不改写可解释，但易被误当可用。建议档案行加“（历史，不可用）”后缀。
10. **P2｜三处口径松紧不一**：qa 卡“真机走本窗口 bash 直驱” vs override qa 行“supervisor 不记偏离” vs AGENTS“TM 兜底记 executed_by＋note”。统一为 AGENTS 口径（直驱/兜底一律记 executed_by＋note）。
11. **P2｜check-sync.sh 尾段破损**：`README.en/AGENTS/orchestration` 确认段 `case` 行出现 `...协议#g' sed 's#...` 杂糅、双 sed 无管道，`$n` 计数不可信。修脚本或删该段（核心比对不受影响）。
12. **P2｜supervisor 卡 DISPATCH 二道注与 AGENTS 未同步**：“2026-10-08 note 可选”只在卡注里，AGENTS 未明确可选/必填边界。AGENTS 补一句。

## 二、预期可达性：“有体系但落不了地”的缺口

1. **小活豁免是最大旁路**：“都不命中＝小活，不铺包不起 Gate”＋“判不准先按小活干”。拆成单日单任务可全程绕过 AC/账本/Gate，事后补铺靠自觉。建议：补铺触发条件加机器提示（如 check-sync AC 巡检发现矩阵缺失即告警），或要求连续小活合并建账。
2. **APP 判定门可主动规避**：check-ledger 先否定剔除＋需强特征/基线词任一才判 APP；Plan 写“不适用/后端服务”或避开关键词即跳过全部 APP/品牌 FAIL；非 docs/pm/ 的计划文件仅 HANDOFF PLAN_VERSION 指向且含特定字样才纳入。建议：APP 适用性改由 Human 1 显式勾选而非关键词推断，关键词仅作提醒。
3. **历史版本只 WARN 可降级**：非真源 Plan 缺失一律 WARN；HANDOFF PLAN_VERSION 指错文件即把真源 FAIL 降 WARN（isSrc 按 basename 包含判定，改名即换真源）。建议：isSrc 改精确匹配＋PLAN_VERSION 缺失/指空记 FAIL。
4. **关键词正则只验字面**：六类（LIGHT/SYSTEM/zh-CN/回退/持久/不丢）＋品牌四类（中文名/图标/启动画面/最终拍板）堆词即过，不验语义。短期可接受（模板自带词已限定关键 AC 行），长期需人工抽查；建议文档明示“文本门＋人工语义复核”。
5. **AC 巡检只报不阻塞**：`AC-MATRIX-MISSING/EMPTY` 不影响 SYNC-OK；“验收未落盘不得收工”无 exit1。红线靠自觉。建议：发布前新增硬门（矩阵缺失即 BLOCKED），日常 SYNC 保持只报。
6. **升级计数可绕**：只数 supervisor FAIL；QA/reviewer 反复打回不经 supervisor 即永不升级；supervisor 记行 role/result 写错也漏数。建议：check-ledger 加“同一 task QA FAIL≥N 次未升级”WARN。
7. **Human Gate 口头放行**：“第二阶段，开发”字面即放行，无身份/版本校验；WAITING“只找人一次”靠自觉。建议：放行时校验 PLAN_GATE=READY＋Plan 版本号一致并落 HANDOFF。
8. **双审不重跑**：同一版本已出报告不重跑；小改版本号或不升版本直接开发可绕重审。建议：明确“影响体验/流程的改动必须升版本重审”，版本号规则进模板。
9. **分工表断链漂移**：跨机器断链允许拷实文件＋记 HANDOFF，之后母版改表不再同步，项目永久漂移。建议：断链项目记入 HANDOFF 待办，重连后强制恢复软链。
10. 安卓通用要求方面：brand-assets 四项必选＋theme-i18n 六类关键 AC＋check-ledger 三码（APP-BASELINE/CRITICAL-AC-EMPTY/INCOMPLETE）＋品牌缺项码，**文本门已闭环**；缺的是语义复核与 Skill 未装时的阶段门（见一.6），属 P1 非缺失。

## 三、账本与复盘体系

- 双账本 schema 完备：TASK（11 必需＋note/executed_by/chain_status，model 白名单，PASS≠ACCEPTED，待签收记 OPEN）＋DISPATCH（used 恒填主，切备 note 留痕）＋supervisor 二道校验＋TM Episode 自记＋tm-qualification.mjs 校验，设计可闭环。
- 落实风险三处：① `--allow-example` 若带到真实项目，空账本从 FAIL 降 WARN——建议文档加粗“真实项目禁用”；② Episode 是否构成由编排者自判，漏记靠 supervisor 抽查非强校验——建议 DISPATCH 与 Episode 对账脚本化；③ `GOVERNANCE_VERSION` 仅“以 Git 历史为准”，无号可核，回滚无法从文件察觉——建议至少记提交 hash 快照。
- 本次母版账本仅示例行，无真实任务可复盘，无法验证“返工多换强模型”决策是否执行。属分发源正常态。

## 四、其他漏洞

- `agent.md` 不受 check-sync 门禁，可单方漂移；且 `temp/agent.md` 快照与根 `agent.md` 非同一份，易拿错。建议 temp 快照注明日期或删。
- opencode 跨目录授权（“先取得用户授权”）无粒度/有效期定义，一次授权可复用；且换 codebuddy/codex 通道即绕过。建议授权按任务单次有效。
- TM 兜底同一任务 ≥2 次才上报，2 次内可静默代做全链。建议收紧为累计 ≥2 次（含跨任务同因）即上报。
- 根 AGENTS vs 包 AGENTS 两处 `docs/prompts/` 前缀差＋README 归位表 `docs/templates/` 前缀差，属布局裸名预期差，check-sync 归一化后应零差异，本次确认无实质漂移。

## 五、概览更新情况

- 22 个 `OVERVIEW-STALE` 关键词在概览中全部命中，跑 `check-sync.sh` 不应报 OVERVIEW-STALE。结论：**关键词层面已同步**。
- 语义层面四处滞后：① Phase1 缺 builder 环（§二）；② `-s` 解禁已同步但与 override qa 旧禁令打架，概览未注明以 AGENTS 为准；③ Episode“非 Episode 不记/禁硬凑/母版只留空壳”三条未进概览；④ 未收录 brand/theme“未装 Skill 无机器门”差异声明。另 §六出现双审具体模型 ID 一次，与“不复述模型 ID”承诺轻微违背，改表时易漏。

## 六、整改建议（按优先级）

1. 修 P0 三处（TM 卡链、builder 卡旧句、qa 行禁令）＋概览 Phase1 一句＋brand 边界段＋经验 stdout 旧条——小批量文本改，改后跑 `check-sync.sh`（须 SYNC-OK）＋`check-channel-preflight.sh`（须 CHANNEL-OK）＋`_sync-packages.py` 同步两包＋概览同步。
2. 补 Phase2 PLAN.template APP/品牌承接栏；修 check-sync 尾段 case 破损；AGENTS 明确 DISPATCH note 可选边界；档案旧 ID 标历史。
3. 中期：将 APP 适用性改 Human 显式勾选、isSrc 精确匹配、发布前矩阵硬门、QA 多次 FAIL 未升级 WARN、对账脚本化。
