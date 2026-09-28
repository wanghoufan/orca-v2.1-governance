# CODE REVIEW

- Task: 治理整改——「产品验收」接入既有 QA Gate（不新增角色/派工链/Gate）
- Commit: 未 commit（工作区 diff，8 文件；其中 HANDOFF.md 不在本轮复核范围）
- Reviewer: code-reviewer（codebuddy/glm-5.3-flash，独立 Session）
- Result: 过（P1×2 须修，均为单行措辞级修复，随两包同步前一并处理）

**总判定：`PASS`**（P0=0；P1×2 修完才算真正闭环，见 Findings）

> Dispatch / Evidence ID 系字段 2.0 已废弃，不填。

## 逐条清单结论（复核清单 7 条）

1. **改动范围：PASS。** 全部为定点增补，无整段重写、无顺手润色、无重排既有条目。逐处核对：AGENTS.md:37 为原句内插入「完成判断＝…」分句、AGENTS.md:90 红线新增 1 行；ORCA治理体系说明.md:29 整段新增一段（插在升级规则与全程账本之间，位置合理）；HANDOFF.template.md:17 新增 1 字段行；PRODUCT_PLAN.template.md:9/:17-20/:21/:36 为原行追加＋新字段＋Gate 追加；BUGS.template.md:7-16 新增一节；qa.md:3 七查→八查为原句尾追加、:15 原行内收紧 DEGRADED、:18-22 新增 5 行；supervisor.md:51 新增 1 行。无越界改动。
2. **红线合规：PASS。** 逐句核 AGENTS.md:37/:90、qa.md:15/:18-22：无新增 Gate（qa.md:17 既有「不新增 QA Gate」未被推翻，:20 明写「不新增 Gate」；ORCA说明:29 明写「不改主链、不新增 Gate」）、无新增角色、无新增派工链、无必须额外审批。supervisor.md:51 是复检凭据补充，不是新关卡；BUGS.template.md:16 明确不替代既有预检节。
3. **口径冲突：**
   - DEGRADED：**问题，P1-1**。qa.md:15 已收紧为「仅在核心用户路径可用、且非阻塞异常已明确记录时才可」，但真源 docs/sop/webqa.md:38 仍是旧句「DEGRADED＝核心可用＋非阻塞异常」。同一枚举两处表述不一致成立。**唯一推荐改法：改 webqa.md 这一边**（§六是 QA_RESULT 定义真源，qa.md 是复述方；按 2026-09-09 经验「模板与卡禁止各写一套字段」，定义只留一处）——webqa.md:38 改为「PASS 放行，FAIL 回修回归；DEGRADED＝仅在核心用户路径可用、且非阻塞异常已明确记录时才可。」，qa.md:15 字面不动，两处一字不差。注：本轮 builder/reviewer 均禁改 docs/sop/ 属流程约束，需用户/TM 解冻这一句，不改变「应改真源」的结论。
   - 枚举三层并存：**不构成枚举冲突**。QA_RESULT=PASS/DEGRADED/FAIL（qa.md:15、webqa.md §六）是任务级整体结论；BUGS.template.md:9 矩阵状态列是单条 AC 的证据状态，「未测/人工判定」与 QA_RESULT 不是同一层概念。但 BUGS.template.md:9 未声明分层，存在被误读为同一枚举的空间→P2-3 补一句澄清。
   - supervisor.md:51「抽查第 7 条」：**自洽，PASS**。六查标题与编号 1-6 未动，第 7 条以独立 bullet 挂出且括号显式声明「独立于上方六查，不改六查标题与编号」，与卡内既有「抽查」条（实派==表）内容不重叠，无编号/标题打架。措辞张力（既叫「第 7 条」又称独立）属可接受，列 P2 观察项。
4. **规则可执行性：**
   - PRODUCT_PLAN.template.md：新字段 ：17-20 置于 ：21 DoD 之前，两者是平级 bullet、新字段有自己的标签与子项，不会被当成 DoD 的一部分，位置合理（AC 是 DoD 的上游输入，先 AC 后 DoD 顺序顺）。Gate 行 ：36 追加条件可判定：「非空」＝该字段下有 ≥1 条 AC；「逐条可测」的判据由 ：18 自带（每条须写「可观察的判定口径＋证据形式」），判定人＝Readiness Gate 阶段的 planner/Research Reviewer，之后 Human Gate 兜底。PASS。
   - BUGS.template.md 矩阵：10 列无冗余（AC 编号/用户任务/前置/视口/步骤/预期/实际/状态/证据/关联缺陷各司其职）。「未测」在模板层确实不拦（全填未测也能交表），但封堵在角色层已闭合：qa.md:19「矩阵关键 AC 无未测项才放行」＋supervisor.md:51「关键 AC 标未测→打回」＋矩阵节注记 ：9 三重拦。符合「不新增 Gate」（不加脚本校验），可接受。PASS。
   - qa.md:18「不可 PASS 的情形」：①③可判定；②「核心用户路径」全体系无定义（qa.md:15/:18、supervisor.md:51 都用这个词，PRODUCT_PLAN.template.md:9 只说「关键用户任务」未挂钩）→**问题，P1-2**。边界项目（单页工具等）按推荐改法落「计划未标注时以 User Flow 全量视为核心」即有唯一答案。
   - AGENTS.md:37 完成口径 vs :90 红线条：重复表述成立但不算问题——一处是定义（派工顺序，给编排者判完成），一处是禁令（红线，给全员收工纪律），且字面口径一致（「关键 AC 全有证据」↔「关键 AC 未测」不得报完工）。列 P2 观察项。
5. **引用与死链：PASS（一处版本号尾巴→P2-1）。** 新增文字引用的 `docs/qa/`（目录在，含 BUGS.template.md）、`docs/sop/webqa.md`（在）、`BUGS.template.md`（在，qa.md:19 用短名与既有 ：5 同风格）、`ORCA治理体系说明.md`（根目录在）全部真实存在，无失效引用。qa.md:20「`docs/sop/webqa.md` V1」带版本号，与 AGENTS.md:91「docs/sop/ …去版本号引用」有张力（qa.md:10 有「Web QA 标准通道 V1」通道名先例，故不算 P1）。
6. **风格一致性：基本 PASS，一处标点不一致→P2-4。** 全角标点／＋／——与既有文件一致；「完成/完工」（AGENTS 完成口径）与「放行」（QA 判定放行）两词各有所指未混用。例外：本轮新增文字 3 处用半角直引号 " "，而全仓行文用全角弯引号 “ ”（qa.md:4、BUGS.template.md:26、AGENTS.md 红线「先到这里」均为全角）。
7. **遗漏：**
   - docs/roles/product-reviewer.md（Research Reviewer 与产品验收的边界）：现状**不够**。qa.md:21 已从 QA 侧澄清「Research Reviewer≠产品验收」，但 Research Reviewer 卡自身无对应提示，而该卡正是可能被拿来做「替代证据」的一方。需一句显式澄清→P2-5。
   - 其余本轮范围内无遗漏：追踪矩阵、Gate 条件、HANDOFF 交接字段、完工口径、复检凭据、QA 卡可执行规则六件齐；两包未同步属已知预期（check-sync SYNC-FAIL），不在本轮 builder 范围。

## P0 / P1 Findings

- **P1-1｜DEGRADED 口径两处不一致，真源仍是宽松旧句**
  - 定位：docs/sop/webqa.md:38（旧句）↔ docs/roles/qa.md:15（新收紧口径）
  - 危害：webqa.md §六是 QA_RESULT 定义真源；QA 只读 webqa 不读卡时，会按「核心可用＋非阻塞异常」的宽松口径出 DEGRADED，掏空本轮收紧目标。
  - 唯一推荐改法：webqa.md:38 整句改为「PASS 放行，FAIL 回修回归；DEGRADED＝仅在核心用户路径可用、且非阻塞异常已明确记录时才可。」qa.md:15 不动，两处字面一致、定义唯一在真源。（需用户/TM 批准解冻 docs/sop/ 这一句。）
- **P1-2｜「核心用户路径」无定义，qa.md:18② 与 supervisor.md:51 不可机械判定**
  - 定位：docs/roles/qa.md:18（②句）、qa.md:15、docs/roles/supervisor.md:51（「核心路径」）；定义锚点缺位于 PRODUCT_PLAN.template.md:9
  - 危害：QA 拿到文档后「哪些路径算核心」靠自由裁量，边界项目（单页工具、后台系统）无唯一答案，打回/放行会扯皮。
  - 唯一推荐改法：qa.md:18 ②句「核心用户路径」后就地加括号定义，改为「②核心用户路径（＝计划 `User Flow` 的关键用户任务；计划未标注时以 `User Flow` 全量视为核心）上的主要按钮/链接未实际点击并观察到页面、锚点或状态变化（…后文不动）」。qa.md:15 与 supervisor.md:51 沿用同词即自动可判，不必另改。

## P2 / P3 Backlog Findings

- **P2-1｜qa.md:20 引用带版本号尾巴「V1」**：与 AGENTS.md:91「docs/sop/ 去版本号引用」张力（qa.md:10 有通道名先例，故 P2）。唯一推荐：删「 V1」→「（BrowserOS，`docs/sop/webqa.md`）」。若定性为复述 ：10 通道名可保留，二选一，推荐删。
- **P2-2｜qa.md:19 行内重复放行规则**：「`PASS` 才放行，`FAIL` 回 builder 修后回归」与同卡 ：15 QA 输出行逐字重复，将来漂移风险。唯一推荐：qa.md:19 删「；`PASS` 才放行，`FAIL` 回 builder 修后回归」，保留「矩阵关键 AC 无未测项才放行」。
- **P2-3｜矩阵状态枚举与 QA_RESULT 未声明分层**：BUGS.template.md:9。不构成枚举冲突（AC 级证据状态 vs 任务级结论），但防混用值得一句。唯一推荐：BUGS.template.md:9 句末补「状态列为单条 AC 的证据状态；整体结论 QA_RESULT=PASS/DEGRADED/FAIL 仍按 `docs/sop/webqa.md` §六 出。」
- **P2-4｜3 处半角直引号**：qa.md:22「"符合 WCAG"」、supervisor.md:51「标"未测"」、PRODUCT_PLAN.template.md:21「"功能正常"」。唯一推荐：三处统一改全角弯引号 “ ”。
- **P2-5｜product-reviewer.md 缺边界句**：唯一推荐：docs/roles/product-reviewer.md:3 职责行末追加一句「研究评审结论≠产品验收证据（产品验收由 Phase2 QA 按追踪矩阵落 `docs/qa/`）。」
- **P2 观察项（不改也不会出事）**：
  - supervisor.md:51「第 7 条」与「独立于上方六查」有轻微措辞张力，括号已显式声明，自洽可接受。
  - PRODUCT_PLAN.template.md:36 Gate「非空且逐条可测」存在写一条凑数 AC 过 Gate 的理论空间，Human Gate 兜底，可接受。
  - BUGS.template.md 模板层对「未测」无机械校验，封堵靠 qa.md:19＋supervisor.md:51，符合不新增 Gate。
  - AGENTS.md:37 与 :90 完成口径重复表述：定义与禁令各司其职、字面一致，不算问题。

## 自检（真实输出，2026-09-28）

`bash scripts/check-sync.sh`：**SYNC-FAIL（exit 1，预期）**。两包各报 DIFF 6 项（qa.md／supervisor.md／PRODUCT_PLAN.template.md／BUGS.template.md／HANDOFF.template.md／ORCA治理体系说明.md）＋「AGENTS 非预期差 3 行」，尾部「预期差确认（应仅 2 处）3／2」。判定：差异**恰好只来自本轮未同步的 7 个文件＋AGENTS 历史裸名差**，无别的意外差异。AGENTS 的 3 行＝:37 一处裸名差（diff 输出 2 行 `^[<>]`，即脚本注释的历史基线 2）＋本轮 ：90 新增红线 1 行（实为 ：37 行内含本轮「完成判断」插入，同步时随裸名适配一并处理）；**两包同步后该数回落到历史基线 2**（脚本 scripts/check-sync.sh:11-13 以 `grep -c "^[<>]"`=2 为过）。

`node scripts/model/check-ledger.mjs docs/model`：exit 1，输出仅两行「TASK-MODEL-LOG.jsonl: _example 行未删（首个真实任务前删除示例行）」「DISPATCH-LOG.jsonl: _example 行未删（…）」＝母版预期状态（HANDOFF §1「母版 TASK/DISPATCH 仅 _example 行」），无结构错、无裸名 WARN。判定：预期，非本轮问题。

## 结论

机制正确、范围干净、无红线违规；PASS。收口路径：修 P1-1（需解冻 webqa.md:38 一句）＋P1-2（qa.md:18 加括号定义）→P2×5 随手带→两包同步（check-sync 回落 AGENTS 差 2 行、7 文件 DIFF 清零）→HANDOFF 记一笔。
