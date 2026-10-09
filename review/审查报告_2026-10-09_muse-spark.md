# ORCA 治理体系审查报告

- 日期：2026-10-09
- 审查模型：muse-spark（opencode / Muse Spark）
- 范围：母版全仓（AGENTS.md、ORCA治理体系说明.md、CHANGELOG.md、USER_MODEL_OVERRIDE.md、README.md、docs/、scripts/、新项目模板包/、老项目迁移模板包/）
- 门禁实测：`check-sync.sh` = SYNC-OK；`prototype-gate.test.mjs` = 6/6 PASS；`tm-qualification.test.mjs` = 17/17 PASS（以上为子智能体实跑值，本轮审查者未重跑，仅采信）；`review/` 目录本轮新建。

## 一、矛盾冲突与不一致（12项，按严重度排序）

| 编号 | 问题 | 位置 | 影响 |
|---|---|---|---|
| C-07 | TM Qualification 采样门槛（<30 Episode 或 <3 项目保持 CANDIDATE）只在概览与经验中，AGENTS Gate 节缺失 | AGENTS L92 vs 概览 L95 | 按 AGENTS 执行会凭小样本判 QUALIFIED |
| C-02 | `-s danger-full-access` 已放宽到 QA＋planner＋senior-expert，但分工表 qa 行标题仍写"QA 专用/仅限QA"，概览检查点仍写"是否仅限QA" | AGENTS L51 vs OVERRIDE L10 vs 概览 L80/L130 | 执行者按行标题会拒给 planner/senior 带标志 |
| C-04 | Phase2 完工口径三处不一：Web QA 通道是否为必要条件仅概览有，AGENTS 无 | AGENTS L51 vs 概览 L30-34 vs README L111 | 完工判定标准漂移 |
| C-01 | "三件套"标题 vs "四件套"正文 vs 概览"三件套" | AGENTS L81-83 vs 概览 L104 vs README L124 | 引用口径漂移 |
| C-10 | 汇报≤10行 vs 体系改动"跑完先详细报告" | AGENTS L113 vs L82 | 大改必违其一 |
| C-03 | Phase1"禁业务代码" vs 允许 HTML/JS 原型，边界未定义；冒烟测试由谁跑未定义 | AGENTS L15-18 | 业务实现可藏进 prototype/ 提前开发 |
| C-12 | 公开仓自动摘除（`--untrack`）不提交不生效，但提交即触发红线需授权，流程断裂 | AGENTS L110 | 自动动作无法闭环 |
| C-05 | 分工表软链制（禁拷实文件）vs README 落地指南（包里是实文件） | AGENTS L63 vs README L73 | 新项目落地瞬间即违规 |
| C-08 | "不新增角色" vs Governance Steward 有实权无角色卡 | AGENTS L90 | 权责无账本、无打回条款 |
| C-06 | builder 别名 `deepseek-flash` 与精确 ID 混用；`gpt-6.1-sol` 占两行易误读 | 概览 L18 vs OVERRIDE L7 | 派工抄错 ID |
| C-11 | 概览检查点编号重复（两个 11.） | 概览 L139-140 | 打回引用指代不明 |
| C-09 | `agent.md` 要求审查者一次交付完整结论 vs 本轮用户要求只做证据级分析（备注：`agent.md` L10 有"除非明确要求只做分析"豁免，本轮适用豁免，不构成实质冲突） | agent.md L3-10 | 已豁免，备案即可 |

## 二、预期能否落地（8项机制评估）

| 编号 | 机制 | 结论 |
|---|---|---|
| E-01 | Readiness ≥90＋P0/P1 门槛 | 卡不住：无机器校验，靠 planner 自评。P046（96 分零原型）会重演于其他维度 |
| E-05 | 原型五项中的③冒烟测试④用户可打开 | 卡不住一半：`check-ledger` 只查证据段落存在，查不了真跑过。贴段文字即放行 |
| E-04 | 首次发布用户签收 | 卡不住：无格式/超时/拒签路径，TM 凭一句话可记 ACCEPTED |
| B2/B3（产品验收/签收） | `check-sync.sh` 明确"只报不阻塞"，实测缺 32 项仍 SYNC-OK | 设计如此，但与 AGENTS 红线"未落盘不得报完工"不匹配，靠人工 |
| B4（APP 导航） | `app-navigation.md`（三方向差异、NavigationBar、底栏固定）无任何 check-ledger 码 | 机器门缺失，只靠 QA 卡文字 |
| E-02 | CHANNEL-STALE 禁派＋禁自动更新 | 死锁风险：CLI 一升级模型目录漂移即全线禁派，无自动恢复 |
| E-03 | Episode 自记账（TM 既是运动员又是记分员） | 漏记发现依赖同一 TM 派出的 supervisor 对账，无独立数据源；错行更正语义未定义 |
| E-06/E-07/E-08 | APP 六类关键词误伤漏网并存；公开仓可见性误判；升级即开新链丢上下文 | 均为已知代价，现状可接受但须备案 |

真正能卡住的：原型门（文件存在＋运行证据分开判，6/6 用例含 PDF 冒充拦截）、APP 主题/i18n/品牌四码（FAIL 真拦）、通道预检、两包同步。见子报告 B1/B4、C。

## 三、派工账本覆盖情况（用户第三问的直接答案）

**结论：8 个重要角色全部在账本白名单内，有日志可查，可做后续模型评估。**

- `check-ledger.mjs L58-60` ROLES = task-manager、supervisor、planner、builder、code-reviewer、qa、product-reviewer、senior-expert（＋db-admin、experience-recorder、neat-freak）。用户点名的 8 角色全覆盖。
- TASK-MODEL-LOG（11 必需键）＋DISPATCH-LOG（7 必需键＋note 可选）逐派记录：`role/model/used/runtime/result` 可机验实派与分工表三处一致；`tokens/cost_cny` 无则填 null 不许编；`executed_by` 标记 TM 兜底代做；`chain_status` 三态互斥。
- 缺口（非缺失、是设计边界）：① TM 专项事件文件只记 TM 本人，不记其余 7 角色（设计如此）；② 母版 `docs/model/*.jsonl` 永远只留 `_example` 空壳，真实行记各项目账本；③ supervisor 卡注释"8键"实为 7 键（note 已改可选），文字债；④ `check-ledger` 证据质量只做启发式 WARN（备注含"待用户验收"但非 OPEN 才提醒），签收缺失无 FAIL。

## 四、其他漏洞（7项）

- O-01：`GOVERNANCE_VERSION` 只有一句话回指 Git 历史；分发版拷出不带 `.git` 即无版本可查，无 fallback。
- O-02：分工表版本注释 T25（2026-10-07）之后 10-08/10-09 改动未升号。
- O-03：README 教 `sed -i ''` 删 `_example` 行，Linux/Windows 失败；删除时机两处不一。
- O-04：README 非空目录覆盖清单漏 10-08/10-09 新增文件；`check-sync` 不管母版↔老项目。
- O-05：`temp/` 同时是"待清理交付区"和"持久回归资产区"，清理与保留纪律互斥。
- O-06：Jev/Steward/总监督三个"非角色"都有实权但无角色卡、无账本、无打回条款。
- O-07：`README.en.md` 未纳入同步门禁，中英漂移无卡点。

## 五、ORCA 治理体系说明更新情况

**结论：已同步，无实质滞后。** 与两包 diff 仅路径归一化 2 行；`_sync-packages.py` PAIRS 已含 CHANGELOG、EXTRA 已含品牌＋导航、TREE_DIRS 已含 fixtures；CHANGELOG 顶部 2026-10-09（待提交）三笔格式合规。但有三处文字债需随下次改动顺手修：① L104"三件套"改"四件套"；② L80/L130"仅限QA"旧表述；③ L139-140 重复编号。与两包同步状态 SYNC-OK，工作区待一次 commit＋push（按红线，未提交前不得报收工；commit/push 需用户明确指令，本报告不执行）。

## 六、修复建议（按优先级）

1. P0：AGENTS Gate 节补采样门槛；分工表 qa 行标题去"仅限QA"；概览同步四件套＋编号＋解禁口径。
2. P1：签收落盘格式＋超时＋拒签路径；导航补 check-ledger 码或明确接受"只报不拦"；C-03 原型边界（JS 算不算业务代码、冒烟测试由谁跑）。
3. P2：O-01 版本 fallback；O-02 升 T 号；supervisor 卡"8键"注释；README.en 纳入 `check-sync` 关键词清单。

---
*子智能体证据清单已并入上表；C-09 按 agent.md L10 豁免处理。未验证项：门禁实测值采信子智能体，审查者未独立重跑。*
