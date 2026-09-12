# ORCA V2.1 增量审查报告（2026-09-11 第五轮：逐派账＋子包同步）

- 审查对象：HEAD `2efeeff`（y 轮 P2P3＋逐派账，已提交；审查中途落盘，基线以 HEAD 为准）＋ 两本地子包（gitignored，不入库）
- 基线：`docs/history/ORCA-V2.1-治理审查报告-2026-09-11-y轮.md`（上一轮）＋ 包内现行文件 ＋ 子包实测 diff
- 结论先行：**P0=0，新 P1=2（DISPATCH-LOG 分发污染；子包落后母版两轮且无同步机制），新 P2=1（DISPATCH 无机器校验），P3=3，carry 若干**。y 轮 3 P2＋3 P3 ✅ 在 HEAD 全部闭环（builder 域限定、域隔离行、勿删通道、判据放宽、经验 ＋1，逐项见 §1）；逐派五处互锁（AGENTS/TM 卡/监督卡/模板/显式）同义。但新机制带进两个 P1：其一是 P1-3 模式第三次出现（账本→DISPATCH）；其二是分发副本静默过期两轮。

严重度：P1=分发污染/新项目照做即缺件；P2=校验缺；P3=文本/轮转。

---

## 1. 验收：y 轮 P2P3＋逐派机制（闭环，证据）

| 项 | 验收动作 | 结果 |
|---|---|---|
| y 轮 P2-1/2/3 | 读 builder:7/:8、supervisor 域隔离行、override:27 | ✅ permission 域限定／两域互不引用／标题分层全在位 |
| y 轮 P3 | override:27 | ✅ “勿删通道〈增补例外〉”＋“含预期回显（不必逐字精确）” |
| 逐派五处 | AGENTS 逐派行／TM 逐派记账／supervisor 抽查／template 主备句／override :28 -y 标注 | ✅ 同义互锁；“漏标打回”被动语义，打回权未扩散（CODE_REVIEW 已判） |
| 经验 | 末行 | ✅ -y 轮一句已追加（carry 关闭） |
| DISPATCH 两行 8 键 | 对 AGENTS schema | ✅ date/task/role/model/used/runtime/result/note 齐，used=主，result=PASS，无 tokens/cost 符合定义 |

---

## 2. P1×2（必修）

### P1-1 DISPATCH-LOG 带着 2 行母版实测分发，且无 _example 行（P1-3 模式三现）

- 位置：`docs/model/DISPATCH-LOG.jsonl`（已入库跟踪） vs AGENTS 逐派行（“示例行不参与统计”）
- 矛盾：AGENTS 预设示例行存在，文件实为 2 行真实冒烟行（`TASK-dispatchlog-test-2026-09-11`，qa＋experience-recorder，真实模型 ID＋日期），零 `_example` 行。新项目拷包即继承 чужой 派记录；且两行无父任务行（TASK-MODEL-LOG 仍纯示例，“本轮不落账本行”）——孤儿派行。
- 修复（照 P1-3 菜谱，3 行动作）：文件冻回单 `_example` 示例行（8 键全，`_example:true`）；2 行实测摘要移入 HANDOFF-override 存档节；AGENTS 补半句“首个真实派前删除示例行”（与任务账本同口径）。

### P1-2 子包落后母版两轮：缺 -y 规则、逐派机制、DISPATCH 文件本身（新项目照旧包开工即旧治理）

- 位置：两子包（冻结于排布 B） vs HEAD（-y 卡点＋y 轮 P2P3＋逐派）
- 实测差分（除已知路径前缀外，逐项非装饰）：AGENTS 缺逐派行；override 缺 :27 -y 半句/勿删通道/:28 -y 标注；builder 缺 :7 域限定＋:8 自测行；supervisor 缺域隔离＋抽查；TM 缺逐派记账；template 缺主备句；经验缺 -y 句；**`docs/model/DISPATCH-LOG.jsonl` 文件级缺失**（AGENTS 逐派行指向不存在的文件＊，若只同步 AGENTS 不补文件即 P0 级悬空——本次是整包 stale 故记 P1-2 内）。
- 更深一层：包内**无子包同步规则**（谁、何时、以何验收同步两包）。排布 B→-y→逐派三次母版改动，无一次带子包；stale 靠审查偶然发现。＊注：当前子包 AGENTS 亦旧（无逐派行），故尚未悬空；一旦半同步即爆。
- 修复（两步）：① 本轮全量重同步（母版→两包，路径适配重放，`diff` 零非预期差）；② 立规则一句（入根 README 或 AGENTS 缓存节）：“母版治理改动提交后同步两包并在 HANDOFF 记一行；`diff` 非预期差零容忍”——或废常驻副本改用时生成（二选一，需用户拍）。
- 现势 P1（README 映射缺项）并入本轮一并修（重同步时顺手补映射，否则新包仍缺件）。

---

## 3. P2×1＋P3×3

- **P2 DISPATCH 无机器校验**：supervisor 卡只有 TASK-MODEL-LOG 断言；“两行 8 键齐”靠肉眼（CODE_REVIEW）。09-10 教训重演（只计算不 exit(1)＝没验）。修：supervisor 卡追加 DISPATCH 断言一行（8 键＋used∈{主,备}＋result∈{PASS,FAIL}，坏行 `L行号` exit 1，`_example` 跳过），与现断言同风格。
- P3-a runtime 自由文本：两行填“本窗口”，无枚举（本窗口/codebuddy/deepseek-bridge/—）。修：AGENTS schema 补枚举例。
- P3-b DISPATCH 轮转未定义：长了就压只管 HANDOFF。修：补半句（随任务归档或与账本同寿命）。
- P3-c 审查基线漂移：本轮审查中途落盘 `2efeeff`（审查 Header 写 ba9d6c8 时已有未提交差分）。本次已按 HEAD 重验，无误判；建议惯例：大轮审查先 `git status` 定基线并写进报告头（本报告已示范）。

Carry：sop（第 6 轮待定，红线围栏在位）；现势 P3（5+2 计数／docs 地图存档／Contract 死链注记，未动）；现势 P2-3（QA 排布 FAIL 指针，未动， backlog）；确认非问题：子包外部前瞻 clause、实例修订节生长模式。

---

## 4. 修复清单（约 12 行＋1 次重同步＋1 个待拍板）

- [ ] P1-1：DISPATCH 冻回 `_example`＋存档＋AGENTS 半句（分发动作，随改随提）
- [ ] P1-2：两包全量重同步（机械，`diff` 验收）＋README 映射补齐（现势 P1 并入）＋同步规则一句（常驻同步 vs 用时生成，用户拍一个）
- [ ] P2：supervisor 卡 DISPATCH 断言一行；P3：枚举例／轮转半句／基线惯例（本报告已示范，不另修）
- [ ] 提交前：账本双断言 exit 0＋子包 `diff` 零非预期差＋`status` 只有预期项

---

## 5. 附：实测证据

```
# ① y轮闭环（HEAD）
rg "只走TM审批单点（Bridge" docs/roles/builder.md｜rg "两域互不引用" docs/roles/supervisor.md｜rg "勿删通道" USER_MODEL_OVERRIDE.md｜tail -1 经验一句话.md（-y句）→ 全命中

# ② P1-1（分发污染三现）
cat docs/model/DISPATCH-LOG.jsonl → 2行真实冒烟（TASK-dispatchlog-test…，used主×2），零_example；AGENTS逐派行却写“示例行不参与统计”
rg TASK-dispatchlog-test docs/model/TASK-MODEL-LOG.jsonl → 零命中（孤儿派行，无父任务行）

# ③ P1-2（子包两轮 stale，要点）
diff AGENTS/override/builder/supervisor/tm/template/经验（HEAD vs两包）→ 缺：逐派行/-y半句+标注/域限定+自测/域隔离+抽查/逐派记账/主备句/-y经验句；ls 子包docs/model/ → 无DISPATCH-LOG.jsonl
git check-ignore 两包 → 命中（stale不可见于status，靠人工diff发现——同步机制缺失实锤）

# ④ P2（校验缺）
rg -n "DISPATCH" docs/roles/supervisor.md → 仅抽查行（文字要求），零断言命令；TASK-MODEL-LOG有exit(1)断言，DISPATCH无
```

## 6. 附：核验矩阵

| 断言 | 结果 | 结论 |
|---|---|---|
| y 轮 P2P3＋逐派五处 | HEAD 全在位同义 | §1 闭环 |
| DISPATCH 分发态 | 2 真实行＋零 example＋孤儿 | §2 P1-1 |
| 子包同步 | 落后两轮＋缺文件＋无规则 | §2 P1-2 |
| DISPATCH 机器校验 | 零断言 | §3 P2 |
| sop/旧 P3 | 未动 | carry |

*目标/剩 P0/下一步：目标=逐派轮增量审查落盘；剩 P0=0，剩 P1=2（§2，需用户拍同步机制选项），剩 P2=1；下一步=按 §4 修 P1-1（随改随提）＋重同步两包，其中 P1-2 的机制选项（常驻同步 vs 用时生成）是本轮唯一要拍的板。*
