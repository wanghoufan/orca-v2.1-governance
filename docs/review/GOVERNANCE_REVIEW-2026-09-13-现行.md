# ORCA 治理体系审查报告（2026-09-13 现行）

- 审查对象：ORCA V2.1 治理模板分发版母版（根）＋ `新项目模板包/` ＋ `老项目迁移模板包/` ＋ 两 ZIP
- 审查范围：`AGENTS.md`、`USER_MODEL_OVERRIDE.md`、`BRIDGE_INTEGRATION_CONTRACT.md`、`README.md`、`docs/roles/`（10 卡）、`docs/prompts/`（4 份）、`docs/pm/`＋`docs/qa/`＋`docs/review/` 模板、`docs/handoff/HANDOFF.md`＋模板、`docs/model/` 双账本、`scripts/orchestration/`、两包 README 与包内同步状态
- 基线：当前工作区（`git status` 含未提交项：AGENTS.md、HANDOFF.md、CODE_REVIEW-2026-09-12-ModelGate.md、两包 AGENTS.md、两 ZIP）；历史结论见 `docs/history/ORCA-治理审查报告-2026-09-11-*`（结论大多已落实，本报告只列现行）
- 方法：全量通读＋三方 diff（母版↔两包↔ZIP）＋枚举/字段/行号交叉核验＋实测命令取证
- 结论先行：**P0=0，P1=3（口径冲突/照做即错），P2=7（规则缺/口径漂移），P3=6（残留/卫生），优化建议 5 条**。体系整体自洽度高，前几轮修复未见回退；本轮问题集中在「口径双轨」与「枚举/字段未随整改同步」两类。

严重度：P0=照做必错且破坏交付；P1=口径冲突、同一事实两套说法、照做会误判；P2=规则缺/口径漂移/悬空引用；P3=cosmetic/卫生/待办。

---

## 1. P1：口径冲突（3 项）

### P1-1 升级计数口径两套：builder 卡把 Review/QA FAIL 计入，AGENTS/Contract 只算 supervisor 打回

- 位置：`docs/roles/builder.md:11` vs `AGENTS.md:47-48` vs `BRIDGE_INTEGRATION_CONTRACT.md:134`
- 矛盾：
  - builder 卡写「V4.1 两轮失败升级——第一次实现→**Review/QA FAIL**→整改一次→仍 FAIL 即停 V4.1 链升 senior-expert」。
  - AGENTS 升级节写「① 同一 Task 累计被 **supervisor 打回** 2 次自动升（**QA 挂不算，只算 supervisor 打回**）」＋「计数口径：rework=被 supervisor 打回次数；**QA 挂/自修好不计数**」。
  - Contract §16 同口径：「`rework` 按 V2.1 定义 = supervisor 打回次数，**QA round 数不计入**」。
- 影响：照 builder 卡执行，Reviewer/QA 一次 FAIL 就会被计入返工，可能提前触发 senior 升级（烧 Sol 额度）；账本 `rework` 与实际打回次数对不上，supervisor 校验会误打回。
- 修复（1 行）：builder 卡改为「同一 Task 累计被 **supervisor 打回** 2 次（QA 挂不计数，见 AGENTS 升级节/override）即停 V4.1 链升 senior-expert」。

### P1-2 DISPATCH-LOG 的 runtime 枚举缺 `codex`，与 override 表、真实账本三方不一致

- 位置：`AGENTS.md:58`（枚举「本窗口/codebuddy/deepseek-bridge/—」） vs `USER_MODEL_OVERRIDE.md:12/:18`（planner、senior-expert 执行通道＝`codex`） vs `docs/model/DISPATCH-LOG.jsonl:2`（实录 `"runtime":"codex"`）
- 矛盾：两阶段整改把 planner/senior 的 Runtime 定为 `codex`，但 AGENTS 的 DISPATCH schema 枚举未同步加 `codex`；实际记账已在用 `codex`。supervisor 的 DISPATCH 断言块只校验 `used`/`result` 枚举、**不校验 `runtime`**，坏值不会被机器拦下。
- 影响：按 AGENTS 字面枚举，合法 `codex` 行属「枚举外」；枚举、override、实录三方打架，跨项目拼接统计时口径不一。
- 修复（2 处）：AGENTS:58 枚举补 `codex`（建议直接对齐 override：`本窗口/codebuddy/codex/deepseek-bridge/—`）；supervisor 的 DISPATCH 断言块加一行 `runtime` 枚举校验（与 `used` 同风格）。

### P1-3 HANDOFF.md §3 自相矛盾：「两包已入库跟踪」 vs 「副本不提交（不 commit、不 push、用完扔）」

- 位置：`docs/handoff/HANDOFF.md:33` vs `:37`
- 矛盾：同节先写「两包常驻同步…**两包已入库跟踪**」，又写「**副本不提交**：实验品，不 commit、不 push，用完扔」。实测 `git ls-files` 确认两包共 32 个文件**已被跟踪**，`git status` 亦将两包文件列为已跟踪修改——即「不提交」一条与事实和常驻同步规则直接冲突。
- 影响：新人照 §3 执行会误以为两包不应提交，或误删/忽略本应常驻同步的副本，破坏分发一致性。
- 修复（1 行）：删除 `HANDOFF.md:37`「副本不提交」整条（已被 `:33` 常驻同步口径取代）；若确有「实验品不入库」所指对象，改写为具体对象。

---

## 2. P2：规则缺与口径漂移（7 项）

### P2-1 `PLAN_REOPEN_REQUIRED` 状态无字段承载

- 位置：`AGENTS.md:9`、`docs/roles/task-manager.md:13`、`docs/roles/supervisor.md:47`（均要求 Change C 进 `PLAN_REOPEN_REQUIRED`） vs `docs/handoff/HANDOFF.template.md:6-11`（`PROJECT_PHASE` 枚举＝PLAN/WAITING_HUMAN_APPROVAL/DEVELOP；`PLAN_GATE` 枚举＝IN_PROGRESS/READY_FOR_HUMAN_REVIEW/APPROVED；`CHANGE_REQUEST` 枚举＝NONE/A/B/C——**均无 PLAN_REOPEN_REQUIRED**）
- 矛盾：Change C 触发一个被反复引用的状态名，但没有任何字段/枚举能落盘它；「局部暂停」期间 `PROJECT_PHASE` 该填什么未定义。
- 修复（二选一）：① 在 HANDOFF.template 给 `PROJECT_PHASE` 加 `PLAN_REOPEN_REQUIRED` 枚举值（并在 AGENTS 状态行同步）；② 明确改用 `CHANGE_REQUEST=C`＋`PLAN_GATE=IN_PROGRESS` 表达，删除裸状态名 `PLAN_REOPEN_REQUIRED` 的字段化用法。

### P2-2 Phase 命名双轨：`PHASE_1_PLAN/PHASE_2_DEVELOP` vs `PLAN/DEVELOP`

- 位置：`AGENTS.md:5`（治理枚举 `PHASE_1_PLAN / WAITING_HUMAN_APPROVAL / PHASE_2_DEVELOP`） vs HANDOFF.template、TM 卡、supervisor 五查统一用 `PLAN / WAITING_HUMAN_APPROVAL / DEVELOP`
- 矛盾：AGENTS 加了「HANDOFF 记短名」的映射说明，但同一体系两套字面值，supervisor Phase Integrity 与机器校验只能认一套，易错配。
- 修复：统一为一套（建议全用 HANDOFF 短名 `PLAN / WAITING_HUMAN_APPROVAL / DEVELOP`），AGENTS:5 不再另造长名。

### P2-3 Readiness Gate 条件漂移：编排者提示词漏「核心假设已合理验证」

- 位置：`docs/pm/PRODUCT_PLAN.template.md:32`（正典：`Readiness>=90 AND P0=0 AND blocking P1=0 AND 关键事实已验证 AND 核心假设已合理验证`） vs `docs/prompts/编排者提示词.md:15`（只写「≥90＋P0=0＋blocking P1=0＋关键事实已验证」，**漏核心假设项**）
- 矛盾：AGENTS:6 明令「Readiness 定义以 PRODUCT_PLAN.template.md 为准，卡内不另写」，编排者提示词仍内联复述并漏项，属典型漂移。
- 修复：编排者提示词只保留「定义以 PRODUCT_PLAN.template.md 为准」，删去内联条件；或在两处补齐「核心假设已合理验证」。

### P2-4 派工口「本窗口 subagent」与 per-role Runtime 表述张力

- 位置：`AGENTS.md:36`（「本窗口内派 subagent，全自动」） vs `USER_MODEL_OVERRIDE.md:10-18`（supervisor/builder/reviewer/qa/recorder/neat 通道＝`codebuddy`，planner/senior＝`codex`）＋ `AGENTS.md:39`（表定 codebuddy 的角色必须走通道直调，禁套娃）
- 矛盾：默认派工口与按表通道并存，AGENTS:36 一句未点明「派工口≠执行通道」，易被读成「builder 也走本窗口 subagent」，与禁套娃红线相冲。
- 修复：AGENTS:36 补半句「（执行通道按 override『执行通道/Runtime』列；本窗口 subagent 仅为默认派工口）」。

### P2-5 持续推进协议引用不存在的脚本名，且 STATE.md 无模板

- 位置：`docs/prompts/Orca 通用编排者持续推进协议.md:1145`（`scripts/orchestration/coordinator-watchdog.sh`）、`:1149`（`coordinator-supervision-loop.sh`）、`:1150`（`coordination/STATE.md`）
- 矛盾：实际收编脚本为 `scripts/orchestration/coordinator-watchdog-standalone.sh`；`coordinator-supervision-loop.sh` 包内不存在；`coordination/STATE.md` 无模板下发。协议顶注声明「正文未改动」，但引用已与收编实现脱节。
- 修复：协议顶注「收编说明」补一句「§二十八/§三十 的脚本名以 `scripts/orchestration/` 现行 `coordinator-watchdog-standalone.sh` 为准；STATE.md 无随包模板，外部编排时自建」，或直接给 STATE.md 加一份模板。

### P2-6 包 README 映射「主表＋补记」双表，措辞与去向未写死

- 位置：`新项目模板包/README.md:9-19`（主表 9 项）＋`:23-34`（同步补记 8 项）；`老项目迁移模板包/README.md:9-20`（主表 10 项）＋`:24-35`
- 矛盾：① 同一份「放入项目根目录」信息拆两张表，照主表拷贝仍会漏件（Contract/GOVERNANCE_VERSION/提示词/归位表/新模板），须读到 §同步补记才全；② 新包 `:44`「确认 AGENTS.md 和 USER_MODEL_OVERRIDE.md 的**链接目标**」——实为拷贝非链接，用词误导（历史报告已指出，仍未改）；③ `:29` 归位表去向写「项目根**或** docs/templates/」，未写死。
- 修复：合并为一张表并把去向写死（新项目不拷归位表）；「链接目标」改「文件位置」。

### P2-7 母版账本含实绩 vs 分发冻结口径，且 P2-4 待办未闭环

- 位置：`docs/model/DISPATCH-LOG.jsonl`（1 示例＋**9 条实绩**，含 `runtime:codex`） vs `AGENTS.md:58`＋`HANDOFF.md:32`（「分发包 TASK/DISPATCH 只留 `_example` 行」） vs `HANDOFF.md:23`（§2 第 4 条「下次分发前冻回 DISPATCH-LOG 仅 `_example`（P2-4 待办）」）
- 现状：两包与两 ZIP 内 DISPATCH 均已是纯 `_example`（合规），但**母版根**仍留 9 条实绩，且该待办长期挂账未收口。
- 修复：明确「母版根＝工作仓可留实绩／两包＋ZIP＝分发物必须纯示例」二选一并写进口径；若按现口径，删除 HANDOFF §2 第 4 条待办（已由包内实现满足），避免长期 carry。

---

## 3. P3：小问题与卫生项（6 项）

- P3-1 **行号引用脆弱**：`AGENTS.md:36/:62` 引 `编排者提示词 :10/:10-11`，`builder.md:8`、`supervisor.md:24` 引 `override:25`。当前均指向正确，但任何插行即失效，历史已发生 `:27→:25` 漂移。建议改命名锚点（如「override『B通道-y』条」）或引用小节标题。
- P3-2 **Contract 去版本号不彻底**：文件名已改 `BRIDGE_INTEGRATION_CONTRACT.md`，但文件内标题 `# V2.1_BRIDGE_INTEGRATION_CONTRACT` 及正文多处 `V2.1` 仍在（历史取证正文本轮不宜改，但标题行可考虑同步为无版本名）。
- P3-3 **scripts README 依赖描述不全**：`scripts/orchestration/README.md:8` 称「只依赖 `orca` CLI + /tmp 日志」，脚本实际还依赖 `python3` 与 macOS `stat -f`。建议补一句运行前置。
- P3-4 **`docs/sop/` 杂项仍在**：仅存一份无关的 Clash 迁移交接；README 声明「仅模板示例」，AGENTS 红线围栏在先，但历史多轮 carry 未定去留。建议一句话拍板移出或正式立项。
- P3-5 **senior-expert 卡信息缺**：`docs/roles/senior-expert.md` 未写「接手后被打回 2 次即停线找人」与「升级/换链开新链」两条（AGENTS 有，卡内无），与其余卡「卡内自足」风格不一致。
- P3-6 **`.DS_Store` 卫生**：母版根与两包目录存在 `.DS_Store`（`.gitignore` 已覆盖、ZIP 已排除，不影响分发），仍属可清理项。

---

## 4. 优化建议（结构性，5 条）

1. **枚举单一正典**：把 Phase／Gate／Change／Runtime／result 等枚举集中到一处（建议 AGENTS 或 HANDOFF.template 附「枚举表」），其余文件只引用不复制；本轮 P1-2、P2-1、P2-2、P2-3 本质都是「枚举/字段多份复制后漂移」。
2. **跨文件一致性自检脚本**：仿 supervisor 账本断言，加一个轻量脚本校验「override Runtime 值 ⊆ AGENTS DISPATCH 枚举」「PRODUCT_PLAN Gate 关键词 ⊆ 编排者/TM 卡」等，纳入 C 类回归。
3. **行号引用改命名锚点**：全体系把 `文件:行号` 改为「文件＋小节标题/条名」，消除插行漂移。
4. **母版↔两包自动 diff 校验**：把「常驻同步＋diff 零容忍」脚本化（一条命令跑三方 diff＋预期差白名单），替代 HANDOFF 手工记一笔。
5. **分发口径二值化**：明确「工作仓（可留实绩）／分发物（纯示例）」两类产物的冻结标准，并让 README 与 HANDOFF 使用同一措辞。

---

## 5. 修复清单

- [ ] P1-1：`docs/roles/builder.md:11` 升级口径改为「只算 supervisor 打回 2 次」
- [ ] P1-2：`AGENTS.md:58` runtime 枚举补 `codex`；`docs/roles/supervisor.md` DISPATCH 断言加 runtime 枚举校验
- [ ] P1-3：删 `docs/handoff/HANDOFF.md:37`「副本不提交」条
- [ ] P2-1：`PLAN_REOPEN_REQUIRED` 定字段承载（加枚举或改指 `CHANGE_REQUEST=C`）
- [ ] P2-2：Phase 命名统一为一套（AGENTS:5 对齐 HANDOFF 短名）
- [ ] P2-3：编排者提示词:15 删内联 Gate 条件或补齐「核心假设已合理验证」
- [ ] P2-4：AGENTS:36 补「派工口≠执行通道」半句
- [ ] P2-5：协议顶注补「脚本名以现行 `coordinator-watchdog-standalone.sh` 为准」
- [ ] P2-6：两包 README 合并映射表、写死归位表去向、「链接目标」改「文件位置」
- [ ] P2-7：定母版/分发账本冻结口径，收口 HANDOFF §2 第 4 条待办
- [ ] P3：行号改锚点／Contract 标题／scripts README 前置／sop 去留／senior 卡补齐／清 `.DS_Store`
- [ ] 改完同步两包＋重建 ZIP，按 C 类回归跑账本断言（exit 0）

---

## 6. 实测证据

```sh
# P1-1 升级口径两套
sed -n '11p' docs/roles/builder.md      → "…第一次实现→Review/QA FAIL→整改一次→仍 FAIL 即停 V4.1 链升 senior-expert…"
sed -n '47,48p' AGENTS.md               → "…只算 supervisor 打回""QA 挂/自修好不计数"
rg -n "rework.*supervisor 打回" BRIDGE_INTEGRATION_CONTRACT.md → :134

# P1-2 runtime 枚举缺失
sed -n '58p' AGENTS.md                  → runtime（本窗口/codebuddy/deepseek-bridge/—）
grep -o '"runtime":"[^"]*"' docs/model/DISPATCH-LOG.jsonl | sort | uniq -c → codebuddy×9, codex×1
USER_MODEL_OVERRIDE.md planner/senior 行 → 执行通道 codex（共 7 处 codex）

# P1-3 HANDOFF 自斥
sed -n '33p;37p' docs/handoff/HANDOFF.md → "两包已入库跟踪" vs "副本不提交…不 commit、不 push"
git ls-files | grep -c "新项目模板包/"  → 32（已跟踪，实证「不提交」为伪）

# P2-1 PLAN_REOPEN_REQUIRED 无字段
grep -n "PLAN_REOPEN_REQUIRED" AGENTS.md docs/handoff/HANDOFF.template.md → 仅 AGENTS，模板零命中
docs/handoff/HANDOFF.template.md:6-11 枚举 → 无该值

# P2-3 Gate 漂移
sed -n '32p' docs/pm/PRODUCT_PLAN.template.md → "…AND 关键事实已验证 AND 核心假设已合理验证"
sed -n '15p' docs/prompts/编排者提示词.md      → "…＋关键事实已验证"（无核心假设项）

# P2-5 协议悬空脚本名
rg -n "coordinator-watchdog.sh|coordinator-supervision-loop.sh" docs/prompts/Orca\ 通用编排者持续推进协议.md → :1145/:1149
ls scripts/orchestration/ → 仅 coordinator-watchdog-standalone.sh + README.md

# 包/ZIP 现状（合规侧）
unzip -l 新项目模板包.zip → 32 files, 0 .DS_Store；包内 DISPATCH 1 行（_example）
```

---

## 7. 核验矩阵

| 断言 | 结果 | 结论 |
|---|---|---|
| 升级计数口径 | builder 卡与 AGENTS/Contract 不一致 | P1-1 |
| DISPATCH runtime 枚举 | 缺 codex，与 override/实录三方不一致 | P1-2 |
| HANDOFF §3 两包提交口径 | 自相矛盾且「不提交」与事实冲突 | P1-3 |
| PLAN_REOPEN_REQUIRED 字段 | 无枚举承载 | P2-1 |
| Phase 命名 | 长/短名双轨 | P2-2 |
| Readiness Gate | 正典含「核心假设」，编排者提示词漏 | P2-3 |
| 派工口 vs 执行通道 | 表述未分离 | P2-4 |
| 协议脚本/STATE 引用 | 悬空/无模板 | P2-5 |
| 包 README 映射 | 双表＋措辞＋去向未写死 | P2-6 |
| 母版账本冻结 | 9 条实绩＋待办未闭环 | P2-7 |
| 两包/ZIP 同步 | 内容一致、账本纯示例、无 .DS_Store | 通过 |
| 角色卡/模板字段 | Readiness 单一正典未被卡内重写（除编排者提示词） | 基本通过 |

*目标/剩 P0/下一步：目标=现行治理体系矛盾与优化审查并落盘 `docs/review/`；剩 P0=0，剩 P1=3（§1）、P2=7（§2）；下一步=按 §5 先修 P1 三项（各 1-2 行）并同步两包重建 ZIP，P2 与下次常规改动同批。*
