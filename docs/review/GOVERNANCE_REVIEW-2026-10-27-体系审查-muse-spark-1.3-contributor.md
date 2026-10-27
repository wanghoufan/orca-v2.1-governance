# ORCA 治理体系审查报告｜2026-10-27（现势正典候选）

> 审查者：muse-spark-1.3-contributor（只读审查，未改任何治理文件；验证性测试只跑只读校验与单测，未写盘）。
> 范围：母版全量现行文件——`AGENTS.md`、`USER_MODEL_OVERRIDE.md`、`README.md`、`README.en.md`、`ORCA治理体系说明.md`、`GOVERNANCE_VERSION`、`CHANGELOG.md`、`经验一句话.md`、`agent.md`、`docs/architecture-facts.md`、`docs/risks.md`、`docs/roles/`×11、`docs/sop/`×17、`docs/prompts/`、`docs/pm/`、`docs/plan/`、`docs/qa/`、`docs/review/`（历史报告只读最新两轮作对照）、`docs/handoff/HANDOFF.md`＋归档、`docs/model/`（两本账＋TM资格＋NEXT-TASKS）、`docs/history/`（归档确认）、`scripts/`（同步/铺包/恢复/校验/回归全链）、两模板包（目录级＋抽查）。
> 验证方式：全文实读＋`grep/diff` 实测＋`check-sync.sh` 全量实跑＋`check-ledger.mjs` 实跑＋回归抽跑（governance-size 8/8、ledger-fields 49/49）。
> 与上轮关系：上一份体系级报告为 2026-10-05 跨文件一致性审查（FAIL_WITH_FIXES，P0×2＋P1×14）；2026-10-08 全量审查三份（mimo／ark／muse-spark）为模型口径专项；2026-10-27 可读性整改（未 commit）为本次审查的直接前序。本报告结论以本次实测为准。
> **结论：CONDITIONAL PASS（带条件通过）——P0×1 必须先修；P1×6 限期修；其余为已知边界（R1–R11 内已有处置的不重复判错）。**

---

## 一、执行摘要（给用户的一页）

1. **10-22 瘦身与 10-27 可读性整改均已落地且机器可验**：`AGENTS.md` 94 行（红线＋索引）、`HANDOFF.md` 64 行／4.5KB（原文整份归档未删）、经验留近期条目并归档、`check-sync.sh` 新增体积闸＋入口闸，本次实跑 `SYNC-OK`。用户此前担心的“AGENTS 上下文过长、无分流、无指针”在本轮已解决。
2. **发现 1 个现行 P0**：`docs/roles/product-reviewer.md` 仍写“双审 A、B **必须串行，禁并发**”，与 10-17 起的现役口径（`governance-dispatch.md`＋`USER_MODEL_OVERRIDE.md`＋概览：“**可并发＋产出非空校验兜底**”）直接冲突。执行者按卡会拒绝合法的并发派工，按表会被 supervisor 打回——派工口径分叉，必须把角色卡同步到现役口径。
3. **“有体系、没落实”的三处实锤（均有巡检数字，非主观判断）**：产品验收矩阵覆盖率约 3%（红线要求 vs 36 项目仅 3 个有矩阵）；多项目缺 `code-reviewer`／`qa`／`supervisor` 账本行（ROLE-COVERAGE 点名 10 个项目）；简化门槛 Gate A/B/D 至今无真实 APP Phase1 实战（risks R5 自认）。规则写了，机器门只报不拦，等于没卡住。
4. **换模型决策缺数据**：supervisor 实绩基本单一模型、product-reviewer 86% 单一模型（NEXT-TASKS D9 自认），无对照组；`elapsed_sec` 全库长期为空（D6），“换模型快多少”答不出。账本记得全，但比较做不出。
5. **测试保留达标**：7 套 fixtures 在版本库固定路径（非 temp），本次抽跑两套全绿；CHANGELOG 宣称 11 项回归全绿，本次未全量重跑，只抽验 2 套（见 §七）。母版两本账按设计只留 `_example` 空壳，真实记各自项目——母版零实绩是设计不是缺失。
6. **概览同步达标**：`ORCA治理体系说明.md` 已含 10-27 入口路由与体积闸口径，与 AGENTS／HANDOFF／facts／risks 一致，本次 `check-sync` 未报 `OVERVIEW-STALE`。

---

## 二、P0（阻塞执行，必须先修再派产品审查双审链）

### P0-1 双审并发口径分叉：角色卡 vs 现役三处

- 现役口径（三处一致）：
  - `docs/sop/governance-dispatch.md` 产品审查链段：“**2026-10-17 用户令改为『可并发，但必须跑产出非空校验兜底』**……禁并发降为兜底手段”。
  - `USER_MODEL_OVERRIDE.md:16` product-reviewer 行：“与审查 B……**默认可并发、零产出则退回串行**”；`:35`“可并发，但必须校验产出”。
  - `ORCA治理体系说明.md:120`：“**可并发**派两份……零产出则该通道退回串行”。
- 对立面（一处）：
  - `docs/roles/product-reviewer.md:5`：“（**A、B 必须串行，禁并发**——2026-10-07 实测……）”。
- 后果：10-17 改的是派工策略，角色卡停在 10-07。TM 按现役口径派并发，product-reviewer 按卡自判 `WRONG_ROUTE` 拒单；TM 按卡派串行，浪费等待且与 planner 组织口径（dispatch 要求并发＋校验）不一致。supervisor 无论按哪边抽查都有依据判对方违规。
- 建议（只写建议，不动手）：把该卡该句改为与 dispatch 逐字一致的现役口径（可并发＋`check-product-review.sh` 必跑＋零产出退回串行），保留 10-07 事故句作背景，不删除历史原因。改后跑一次 `check-product-review.sh` 负例（零产出即 exit 1）作验证。

---

## 三、P1（会误判／派错／架空门禁，限期修）

### P1-1 产品验收矩阵覆盖率与红线脱节（“没法落实”的主项）

- 红线（`AGENTS.md`）：“产品验收未落盘或关键 AC 未测 ⇒ 不得报完工”。
- 现状：`docs/model/NEXT-TASKS.md §C` 自认“36 项目仅 3 个有矩阵（约 3%）”；本次 `check-sync` ROLE-COVERAGE 仍点名多项目缺 qa 行。
- 机器门现状：`AC-MATRIX-MISSING` 只报不阻塞（设计如此，避免存量项目全红）。结果是红线文字上“不得报完工”，机器上“报了也不拦”。
- 建议：二选一由用户拍板——(a) 存量项目逐个补矩阵或明确豁免口径并落盘（不是口头豁免）；(b) 红线加注“存量项目过渡期口径”，写清谁可暂缓、暂缓到何时。现状“文字硬、机器软”是最差组合。

### P1-2 复核链账本缺口：多项目缺 code-reviewer／qa／supervisor 行

- 本次实测 `ROLE-COVERAGE`（`check-sync.sh` 输出，只报不阻塞）：010／011／021／051／054／057／main-3／master-2 等缺 reviewer 或 qa 或 supervisor 行；055／056 缺 supervisor 行。
- 两种可能：真没走复核（质量门被跳），或走了没记账（证据链断）。无论哪种，事后都无法证明“多方审查发生过”。
- 建议：治理侧不代改他人账本（铁律），由各项目自查补记；下次审计把“缺行项目清单”作为必查项，不默认“没行＝没活”（主开发者模式 solo 项目除外，需 `GOVERNANCE-STATE.json` 显式 `solo`）。

### P1-3 换模型无对照组：supervisor／product-reviewer 做不出 A/B 结论

- `NEXT-TASKS.md §D9` 自认：planner 有 A/B 对照（gpt-6-sol vs gpt-6.1-sol，37 样本 7 项目）；supervisor 54 样本仅 1 种模型；product-reviewer 86% 单一模型。`elapsed_sec` 全库 0 条非 null（D6）。
- 后果：这两个角色“换谁更快／更准”目前没有数据支撑，TM 资格测试也只覆盖 TM 本人。账本记得全，但换模型决策做不出。
- 建议：新派工起强制记 `elapsed_sec`（已立规，看执行）；supervisor／product-reviewer 的对照组纳入下一轮 A/B 计划，不作本次阻塞项。

### P1-4 简化门槛三道 Gate 无实战（Gate A／B／D）

- `docs/risks.md R5` 自认：Gate A 六项、Gate B《可删减项清单》、Gate D 证据分级“只在纸面通过，未在真实 APP Phase1 走通”。
- product-reviewer 卡要求审查位“必须含《可删减项清单》”，qa 卡要求 Gate D 真机取证——都没有首个 APP 实战样本。
- 建议：不新增 Gate（已有约束），但下一个 APP Phase1 必须把三道 Gate 的通过／“无须删减”依据作为必查证据，回写 risks R5。未实战前，对外不得宣称“简化门槛已验证”。

### P1-5 `db-admin` 全体系零派工记录

- NEXT-TASKS D7 自认＋本次 ROLE-COVERAGE 无 db-admin 行（用到才记，无实绩不构成缺口）。
- 本身不判错（专项角色），但两点需明确：(a) 若之后要换 db-admin 模型，当前零样本，需先定“首个真实审查即留证据”的起点；(b) `supabase.md` 541 行＋`sqlite.md` 463 行是全体系最重的两份 SOP，只在 DB 任务触发时读——现状正确（按需读），不得为“减负”而提前拆，保持原样。

### P1-6 母版两本账零实绩的说明位不足（易被误判为“没记账”）

- 母版 `TASK-MODEL-LOG.jsonl`／`DISPATCH-LOG.jsonl` 各只有 `_example` 行，本次 `check-ledger`（不带 flag）报示例行未删、带 `--allow-example` 报 `LEDGER-OK (含 WARN)`——均符合“母版是分发源”的设计（R2）。
- 但母版内无一句话向新读者解释“为什么母版是空的、真实账在哪”。10-27 已建 `architecture-facts.md`，建议在事实页补一行“母版账本恒空，真实 Episode／派工在各项目账本；换模型依据看各项目账本＋TM 资格事件”，避免下轮审查重复提。

---

## 四、P2 与优化（不阻塞，可排期）

1. **9+1+1 口径已收敛**：本次 grep 未发现“9+1”残留（09-23 第四轮 P1-2 已闭环）。维持。
2. **状态机／口令／派工链／升级规则跨文件一致**：四态、PLAN_GATE、DEV_BASELINE、CHANGE_REQUEST A/B/C、三口令字面、Phase1 拟稿链（builder 拟稿→product-reviewer→planner 把关）、Phase2 主链、升级“打回 2 次自动升”在 AGENTS／dispatch／task-manager／builder／supervisor／概览六处一致。10-05 审查的 P0-1（marker 数白名单）已改为归一化逐字节比对，P0-2（老项目缺预检脚本）已补 FILES 清单——本次 `SYNC-OK` 即证据。维持，不重复开项。
3. **`used` 恒填主 vs 峰谷语义**：09-23 P1-1 争的是已废止的 volc 峰谷双路（T4），现役表已无峰谷（builder 主备为 codebuddy↔opencode 同模型双通道）。该 P1 已因模型表改版而自然消解，不重开。
4. **prompts 双巨文件仍在**：`Orca 编排治理监督者提示词.md`（26KB）与`通用编排者持续推进协议.md`（28KB）未拆分。但 10-27 已把开工路由收敛到 AGENTS 唯一入口，这两份不进入开工必读（按触发才读），上下文风险已受控。建议排期拆“速查＋章节指针”，本次不阻塞。
5. **双模板包重复**：`新项目模板包` vs `老项目迁移模板包` 仅差 1 文件（`迁移整理提示词.md`）。同步器已统一走 `_sync-packages.py`，`SYNC-OK` 证明未分叉。合包是降维护成本项，不是正确性项，排期即可。
6. **`temp/` 体积**：本轮未复测（10-27 基线快照在 `temp/2026-10-27 丨 整改前基线/`，属有意保留）。提醒：基线验证完即按全局 temp 纪律清理，避免 261M 重演。
7. **sqlite／supabase 体积**：两份最重 SOP 但均为按需读，且中央软链（`~/.agents/rules/`）与本仓一致口径未发现漂移。不动。
8. **HANDOFF 模板与 §0 指针表**：`HANDOFF.template.md` 已改为指针表，与 `HANDOFF.md §0` 一致。本次 entry gate 未报 `ENTRY-LEGACY`。维持。

---

## 五、预期达成度判定（第二问：能不能卡住）

| 预期 | 判定 | 证据 |
|---|---|---|
| 多阶段开发（PLAN→Gate→DEVELOP，Change C 受控重开） | ✅ 可卡住 | 四态＋三口令＋DEV_BASELINE＋升级计数六处一致；`gates` fixtures＋回归在库 |
| 多方审查（builder→reviewer→qa→supervisor，product-reviewer 双审） | ⚠️ 半卡住 | 链条完整、产出校验脚本齐（`check-product-review.sh`／`check-dispatch-output.sh`）；但 P0-1 并发口径分叉＋ P1-2 多项目缺复核行，事后无法证明发生过 |
| 产品验收（AC 矩阵＋控件三件＋首次发布签收） | ❌ 文字硬、机器软 | 模板＋qa 八查＋supervisor 第 7 条＋SIGNOFF-MISSING／ACCEPTED-MISSING 四门齐全；但覆盖率 ~3% 且只报不拦，存量项目实际放行过 |
| 安卓通用要求（构建／签名／真机／M3 底栏／主题语言） | ✅ 规则齐，待首个 APP 实战检验 | `android.md`＋`app-*.md` 五份＋qa 真机预检＋原型完整性门齐全；原型门有 fixtures（proto-gate 9 用例）；但简化三 Gate 无实战（P1-4） |
| 账本复盘（两本账＋Episode＋TM 资格） | ✅ 记得全、比不出 | schema＋交叉对账＋防重复计分＋违规分级＋证据归一全套在库；但对照组缺失（P1-3） |
| 迭代有实测（非口头报告） | ✅ 本轮达标 | fixtures 7 套在版本库固定路径；CHANGELOG 记 pass 数；本次抽跑 2 套全绿（§七）；基线 tar＋sha256＋rollback 干跑已做 |

---

## 六、账本覆盖判定（第四问：8 角色）

母版是分发源，真实派工记各项目账本。母版本次状态：两本账各 1 行 `_example`，`--allow-example` 下 `LEDGER-OK (含 WARN)`——符合 R2 设计，不判缺失。

| 角色 | 母版模型行 | 实绩可查性 | 判定 |
|---|---|---|---|
| task-manager | 开窗口时定 | Episode 事件＋HANDOFF＋DISPATCH 三方互验；TM 资格框架完整 | ✅ 有 log 位，采样门槛（≥30 Episode＋≥3 项目）未达即 CANDIDATE 正确 |
| supervisor | opencode-go/deepseek-v4.1-flash | 有校验入口（中央 `check-ledger`），54 样本但单模型 | ⚠️ 记得全、无对照（P1-3） |
| planner | codex/gpt-6.1-sol | 37 样本 7 项目双模型对照 | ✅ 唯一可做 A/B 的角色 |
| builder | codebuddy 主／opencode 备 | codebuddy-rotate 心跳＋切号日志 | ✅ 通道级证据齐 |
| code-reviewer | opencode-go/deepseek-v4.1-flash | 多项目缺行（P1-2） | ⚠️ 规则有、部分项目无行 |
| qa | codex/gpt-6-luna | 同上＋覆盖率 3%（P1-1） | ⚠️ 同上 |
| product-reviewer | codebuddy/glm-5.3-flash（A）／deepseek-v4-pro（B） | 86% 单一模型＋ P0-1 口径分叉 | ⚠️ 无对照＋口径待修 |
| senior-expert | codex/gpt-6.1-sol | 只接升级，样本天然少 | ✅ 按设计（有升级才有行） |
| db-admin | volcengine-plan/ark-code-latest（备 radeon-mimo） | 全体系零行 | ✅ 按设计（用到才记，P1-5 明确起点即可） |
| experience-recorder／neat-freak | 编排者自做，不派工 | 不占行（10-16／10-17 定） | ✅ 口径一致，无需补行 |

---

## 七、迭代实测核查（第六问：有没有真测）

1. **本轮（10-27）**：CHANGELOG 列 11 项回归全绿＋隔离铺包＋restore 干跑。本次抽验：`governance-size.test.mjs` 8/8、`ledger-fields.test.mjs` 49/49（含 `elapsed_sec`、`used`、升级计数、`--evidence` 归一），均为实跑非转述。`check-sync.sh` 与 `check-ledger.mjs --allow-example` 本次实跑：`SYNC-OK`、`LEDGER-OK (含 WARN)`。结论：本轮“先测后报”达标；全量 11 项本次未重跑，建议收工前补跑一次（一条命令）。
2. **测试资产保留达标**：`scripts/model/fixtures/` 下 gates／ledger-fields（25 case）／proto-gate／ui-leak／solo-agent／tm-qual／nav-gate 七套在版本库固定路径，非 temp，符合“编排者保留测试项目”要求。
3. **历史教训已沉淀为机器门**：10-07 双审零产出→`check-product-review.sh`＋通用 `check-dispatch-output.sh`；10-07 exit 0 不可信→产出非空校验；10-22 `rm -rf` 事故→铺包三道闸＋反向测试；10-22 体积→本次体积闸。属于“测过、拦过、留过”的完整闭环。
4. **缺口**：P1-1／P1-4 的“真实项目实测”仍是空白——机器门齐了，第一个吃螃蟹的 APP 还没来。这是下一轮必须补的实证，不是文档。

---

## 八、概览更新核查（第五问）

`ORCA治理体系说明.md`（对外版，头标 2026-10-17）本次逐节核对：§一已含 10-27 入口路由与体积闸数字；§二主开发者口径与 execution-modes 一致；§三流程与 dispatch 一致（含交付单元＋连续推进）；§五 Web QA 与 webqa.md 一致（后台静默、不碰主 Chrome、动态端口）；§六“以表为准不复述 ID”与模型表一致；§七／七之二／七之三的机制清单与 TM 资格规范、NEXT-TASKS 已完成项一致；§八规范表含 facts／risks／CHANGELOG 新位；§九审查检查点 20 项与现役门禁对应。`check-sync` 本次未报 `OVERVIEW-STALE`。结论：概览与现役规则同步，达标。提醒：P0-1 修角色卡时若改动派工语义，概览 §七产品审查链段需同批跟进（校验器只查关键词覆盖，不查语义）。

---

## 九、修订清单（转交编排者，一次性交付）

> 按项目审查约定：结论＋排序＋证据＋可转送的执行提示词，同一轮给全。

- **审查结论**：CONDITIONAL PASS。P0-1 修完即转 PASS；P1-1／P1-2／P1-3／P1-4 进下一轮排期；P1-5／P1-6 为说明位补强。
- **倾向**：先修 P0-1（改 1 个文件 1 句话＋ 1 个负例验证），再 commit 本轮（含 10-27 整改＋本报告）。P1 不 blocking commit，但必须进 NEXT-TASKS 或 risks 回写，避免“报完就忘”。

```text
【请你转发】给编排者的执行提示词（可直接用）

目标：落 2026-10-27 体系审查（GOVERNANCE_REVIEW-2026-10-27-体系审查-muse-spark-1.3-contributor.md）P0-1，并把 P1 进账。
约束：只改母版正文 1 处＋验证；不碰业务；不 push；改完走三件套（同步两包＋概览跟进＋check-sync）＋记账＋HANDOFF 记一笔。

1. 改 docs/roles/product-reviewer.md 第 5 条双审位句：把“（A、B 必须串行，禁并发——2026-10-07 实测……）”
   改为与 docs/sop/governance-dispatch.md 现役口径逐字一致：
   “（A、B 可并发派发，但每份必须跑产出非空校验；2026-10-07 实测双实例并发曾互相干扰致零产出，
   2026-10-17 起并发须带 check-product-review.sh 兜底，零产出则该通道退回串行）”。
   背景事故句保留，不删历史。
2. 验证：跑 bash scripts/check-product-review.sh 对一个故意留空的 PRODUCT_REVIEW 样例，
   确认 exit 1（零产出即拦）；再跑 node scripts/model/governance-size.test.mjs 确认 8/8。
3. 三件套：python3 scripts/_sync-packages.py 同步两包；确认 ORCA治理体系说明.md §七产品审查链段
   与新口径一致（不一致则同批改）；bash scripts/check-sync.sh 得 SYNC-OK。
4. P1 进账：P1-1（矩阵补或豁免口径二选一）／P1-2（缺行项目清单）／P1-3（elapsed_sec＋对照组计划）／
   P1-4（首个 APP 实战回写 R5）写入 docs/model/NEXT-TASKS.md 或 docs/risks.md（二选一，不两处重复记）；
   P1-6 在 docs/architecture-facts.md 补“母版账本恒空”一行。
5. 交付：HANDOFF §2 记一笔；本报告编号入档；等用户明确指令再 commit／push。
验收：check-sync SYNC-OK｜产出校验负例 exit 1｜回归抽跑全绿｜HANDOFF 一行。
```

---

## 十、证据索引（抽查可复现）

- 并发口径四处原文：见 §二（文件:行号均已列）。
- `check-sync.sh` 本次尾部：`SYNC-OK`（附 `HANDOFF-SIZE-WARN` 41 处存量项目巡检、`ROLE-COVERAGE` 10 项目缺行，均为只报不阻塞）。
- `check-ledger.mjs docs/model`：不带 flag 报示例行未删；`--allow-example` 报 `LEDGER-OK (含 WARN)`。
- 抽跑：`governance-size 8/8`、`ledger-fields 49/49`（本窗口实跑输出见审查过程记录）。
- 归档完整性：`docs/handoff/HANDOFF-归档-2026-10-27.md` 1,496 行在位；`docs/history/经验-归档-2026-10-27.md` 在位（以 `ls` 为准）。

*报告落盘：`docs/review/GOVERNANCE_REVIEW-2026-10-27-体系审查-muse-spark-1.3-contributor.md`（本文件）。*
