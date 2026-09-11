# ORCA V2.1 治理复验报告（2026-09-10 复验，验收 P1FIX 落地）

- 审查对象：同包（`GOVERNANCE_VERSION=2.1`）＋ 本日 P1FIX 新增执行文件（`docs/pm/PLAN-2.1-P1FIX-2026-09-10.md`、`docs/review/CODE_REVIEW-2.1-P1FIX-2026-09-10.md`、`docs/qa/BUGS-2.1-P1FIX-2026-09-10.md`、`docs/review/PRODUCT_BACKLOG-2.1-P1FIX-2026-09-10.md`、`docs/handoff/HANDOFF.md §6–§7`、账本首真实行）
- 基线：本目录同日主报告 `ORCA-V2.1-治理审查报告-2026-09-10.md §5`（修复清单）＋ 用户决策（P1-2=A、P1-3=A）
- 定位：本复验**不重复**主报告已闭环项，只回答三问——① P1-1→P1-7 真修好了吗 ② P2 批处理落地了吗 ③ 修的过程中引入新问题了吗。与主报告同日并存时：①② 以 CODE_REVIEW/BUGS 落盘为准，③ 以本复验为准。
- 结论先行：**P1-1→P1-6 ✅ 全部闭环（逐项实测通过），P2-2→P2-9 ✅ 落盘，P2-1/P2-10 ⏳ 对方已自记 TODO（属实，未偷工）。但 P1-7 只修了一半：supervisor 第二道 schema 命令计算完布尔元组即丢弃，exit 码恒 0，坏账本照样落盘——QA-08/CODE_REVIEW 写"可打回"靠的是人眼读元组，不是机器强制。另带出 3 个新 P2（结论归属复发、分发 hygiene 倒退、累计数无落盘位）。判定：不拦分发，修完 §2 的 1 个 P1 再冻结；§3 的 P2 可与 hygiene 轮合并。**

严重度口径沿用主报告：P1=特定条件必错/打回循环；P2=脏数据/口径差/可优化。

---

## 1. 验收：P1-1→P1-6 闭环（全部 PASS，证据）

| 项 | 验收动作 | 结果 |
|---|---|---|
| P1-1 scripts | 读 `迁移整理提示词.md:8` | ✅ 已为"2.x 无 scripts，不新建" |
| P1-2 口径 | `rg "连续失败\|连挂" AGENTS/编排者/迁移/override/roles/HANDOFF`＋读三处新文案 | ✅ 治理文件零命中（仅 PLAN/REVIEW 历史描述引用旧文案，属 dated trace，可接受）；三处统一"累计被 supervisor 打回 2 次"，QA 挂排除项明确 |
| P1-3 封顶 | 读 `AGENTS.md:38`＋`rg "再升级\|二轮重拆"` | ✅ "senior 接手后不再计数…打回 2 次即停线找人"；未掺 B/C；"不再新增"保留 |
| P1-4 例外 | 读 `AGENTS.md:26` | ✅ 三类例外指回已补，裁决基准合页 |
| P1-5 缓存 | 读 `AGENTS.md:48,52,53`＋编排者 `:10` | ✅ 适用范围注、基础设施限定、真 resume/贴摘要区分、100k 阈值全有 |
| P1-6 跳步 | 读编排者 `:12` | ✅ 跳步指回＋P0 真空规则（TM 口头定一句＋写 HANDOFF）在位 |
| P2-2→P2-9 | 抽查：HANDOFF §4 指回、编排者 `:6` 全枚举、builder/senior"转监督者校验"、红线 V1.10/V2.0、builder secrets 半句、PRODUCT_BACKLOG Task 列、recorder 幽灵引用已删、HANDOFF.template neat 时序注、override（到期"无"/Luna 注/池映射/超限停/sol-terra 分工） | ✅ 全在位 |

附加肯定：P1FIX cov 本身按治理跑全（PLAN→CODE_REVIEW→BUGS→PRODUCT_BACKLOG→HANDOFF→账本落盘），code-reviewer＋qa 不可跳得到遵守，BUGS 按模板含 Fingerprint，属治理自举成功的证据。

---

## 2. P1：P1-7 只修一半——schema 命令无断言，坏账本 exit 0 放行（1 项，必修）

- 位置：`docs/roles/supervisor.md:4` 第二道命令（`[ (lambda o: (...))(json.loads(l)) for l in ...]`）
- 实测（本机复现，好文件＋三类坏例）：
  - 当前账本（11 键全对）：exit 0 —— 通过 ✅
  - `{"task":"X"}`（缺 10 键）：**exit 0 —— 放行 ❌**
  - `result=MAYBE`（枚举错）：**exit 0 —— 放行 ❌**
  - `rework="0"`（字符串）：**exit 0 —— 放行 ❌**
- 根因：该推导式只**计算** `(缺键?,result对?,escalated对?,rework是int?)` 元组并丢弃，从不 `assert`/`sys.exit(1)`。QA-08 记录的"`(False, False, False, False)` 可打回"是**人眼判读**，卡上"坏了打回重写"没写**以什么为准**（exit 码？肉眼读元组？）。subagent 按 exit 码执行即全部放行；且该命令无行号、无多余键检查、`rework=true`（bool 是 int 子类）照过。
- 自我归因：此无断言写法源自我方主报告 §5 给的示例命令，开发者逐字照抄、PLAN 甚至写明"返回元组供人眼判"——**上一份报告的错，本复验收回并给出已实测的替换命令**（§5）。
- 修复：替换 supervisor 卡第二道命令为 §5 的断言版（好文件 exit 0 静默；坏行打印 `L行号: 原因` 且 exit 1）；单行粘贴命令改为"先落临时文件再跑整文件第二道"，删掉纯语法旁路。

---

## 3. P2：新发现 3 项（不拦分发，建议与 hygiene 轮合并修）

### P2-A HANDOFF §7 自证复检——P2-2 模式换措辞复发

- 位置：`docs/handoff/HANDOFF.md §7`（"supervisor同步播报：…P1-1→P1-7全闭环…复检通过"）
- 问题：主报告 P2-2 修的是 §4"均已修"，QA-03 用 `rg "均已修"` 验收——§7 用"全闭环"绕过了字面检查，语义（HANDOFF 替审查下结论）原样回来。结论的唯一归属应是 review/qa/审查报告三处，HANDOFF 只记 trace。
- 修复：§7 保留派工口令/账本行号等 trace，删"全闭环/复检通过" verdict 两句，改为"结论见 CODE_REVIEW-2.1-P1FIX/BUGS-2.1-P1FIX/复验报告"。QA 侧建议：结论归属检查固定为语义规则（"HANDOFF/经验只记状态不下 verdict"），不只 rg 旧措辞。

### P2-B 分发 hygiene 倒退：账本 чужой 行以新形式回来

- 位置：`docs/model/TASK-MODEL-LOG.jsonl`（现为模板自身的 `2.1-P1FIX-2026-09-10` 真实行，`project`=模板目录名全称）
- 问题：旧 P2-10（雷达 чужой 行）当初用 `_example` 行＋"首个真实任务前删除"修好；本次 P1FIX 落了真实行、删了 example——**分发出去的新项目拷包即继承 чужой 统计**，跨项目拼接污染重演，只是换了主人。另 `project` 取根目录名原样（含空格/全角丨），聚合 key 脆弱但有效，不强制改。
- 修复（分发冻结动作，非代码）：冻结分发时二选一——A）账本恢复 `_example` 示例行（现状规则链完整，推荐）；B）清空为 0 行＋AGENTS 补"空账本首行须含全部 11 键"。禁止以"含 2.1-P1FIX 真实行"状态分发。

### P2-C 累计打回数无落盘位（"不断链也累计"悬空）

- 位置：`AGENTS.md:37`（"不断链也累计"）＋`:38`（"换模型即开新链，缓存不跨链"）
- 问题：累计 2 次即升，升级即开新链——跨链的累计数记在哪？HANDOFF.template（当前 Task/未闭环意见）无"累计打回 n/2"字段，靠 TM 数评论区别无依据，打回第 2 次的临界点易漏数。
- 修复：HANDOFF.template"当前 Task"行尾补"（累计打回 n/2）"，supervisor 每次打回时 TM 同步更新该计数。

确认非问题（对方已自记，不复查）：P2-1 试点细节、P2-10 改名（CODE_REVIEW backlog 属实）；2.1-更新说明旧缓存句（对方记 P3、范围外未动正确）。

---

## 4. 给开发者的修复清单（共 5 处，约 10 行）

- [ ] P1（§2）：supervisor 卡第二道命令换 §5 断言版；单行粘贴命令改"落临时文件＋跑第二道"（2 处）
- [ ] P2-A：HANDOFF §7 删 verdict 留 trace＋指回三份结论文件（1 处）
- [ ] P2-B：冻结分发时账本恢复 `_example` 行（分发动作，不占改动行）
- [ ] P2-C：HANDOFF.template 当前 Task 行补累计打回计数（1 处）
- [ ] 经验追加一句（建议文案）："2026-09-10（复验）：坏例校验必须看 exit 码，不看打印——只计算不 exit(1) 的校验等于没验；结论只许落在 review/qa/审查报告，HANDOFF 只记状态。"

---

## 5. 附：替换命令（已实测，好文件 exit 0；缺键/错枚举/rework 非 int·含布尔 exit 1 并指明行号）

> 粘贴说明：整块照粘（含换行，bash/zsh 双引号内合法）；`docs/model/TASK-MODEL-LOG.jsonl` 路径按需换；`_example` 行自动跳过。

```text
python3 -c "
import json,sys
req={'task','project','date','role','model','result','rework','escalated','escalation_reason','tokens','cost_cny'}
bad=0
for n,l in enumerate(open(sys.argv[1]),1):
 s=l.strip()
 if not s or '\"_example\"' in s: continue
 try: o=json.loads(s)
 except Exception as e: print(f'L{n}: JSON坏:',e); bad+=1; continue
 if not req<=set(o): print(f'L{n}: 缺键',sorted(req-set(o))); bad+=1
 if o.get('result') not in ('PASS','FAIL'): print(f'L{n}: result枚举错:',o.get('result')); bad+=1
 if o.get('escalated') not in ('YES','NO'): print(f'L{n}: escalated枚举错:',o.get('escalated')); bad+=1
 if not isinstance(o.get('rework'),int) or isinstance(o.get('rework'),bool): print(f'L{n}: rework非int:',o.get('rework')); bad+=1
sys.exit(1 if bad else 0)
" docs/model/TASK-MODEL-LOG.jsonl
```

实测记录：好账本 exit 0 无输出；`{"task":"X"}` → `L1: 缺键 [...]`＋枚举/rework 连带告警 exit 1；`result=MAYBE` → `L1: result枚举错` exit 1；`rework="0"`/`rework=true` → `L1: rework非int` exit 1。

---

## 6. 附：核验矩阵（复验抽查）

| 断言 | 结果 | 结论 |
|---|---|---|
| P1-1→P1-6 落盘 | 治理文件/override/迁移/编排者逐项在位 | §1 全 PASS |
| P2-2→P2-9 落盘 | 抽查 10 项在位 | PASS |
| P2-1/P2-10 未做 | 对方自记 TODO，与现状一致 | 属实，不拦 |
| 第二道 schema 命令强制力 | 好 0／坏 0（恒过） | §2 P1 |
| HANDOFF 结论归属 | §7 verdict 复发 | P2-A |
| 账本分发态 | 真实行＋无 example | P2-B |
| 累计数落盘位 | 无字段 | P2-C |

*目标/剩 P0/下一步：目标=P1FIX 落地复验；剩 P0=0，剩 P1=1（§2 schema 断言），剩 P2=3（§3）；下一步=开发者按 §4 修 5 处，其中 P1 修完重跑 §5 四类坏例（看 exit 码），P2-B 在冻结分发时执行。*
