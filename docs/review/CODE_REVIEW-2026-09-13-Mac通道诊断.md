# CODE REVIEW

- Task: 复核 `docs/qa/BUGS-2026-09-13-Mac真机QA通道诊断.md`（**v2 第二轮收口复核**，任务A 批准控制点 ＋ 任务B 三目标矩阵）
- Commit: `c319b6d`（HEAD，实测一致；工作区 15 项 `M`＋5 项 `??` 与报告 `:210-224` 逐条对上）
- Reviewer: code-reviewer（`deepseek-v4.1-flash` via `codebuddy`，独立 Review Session）
- Result: **过（收口）**｜P0=0／P1=0（阻塞项 0）／残余非阻塞 4 项转 backlog

> Dispatch / Evidence ID 系字段 2.0 已废弃，不填。

**总评**：v2 已按第一轮打回意见定点修订到位。我独立复算了 v2 全篇 **20 处像素差数字、20 处裁剪矩形与面积、三矩形互不重叠性**，**全部与证据图精确一致（无一例外）**；并按报告新口径重放了**三目标可滚动性前置条件**（TextEdit 60 行／Chrome 120 行／Orca 面板 33 行），从原始会话日志与像素几何两侧交叉验证成立。**P1-1／P1-2／P1-3 三项闭环，P2-1~P2-5、P3-1~P3-4 九项闭环**，四条必答结论与 `FAIL_UNVERIFIED_ACTION`＋"不进正式QA"的判定均无需推翻。**可以收口为过**；本轮另发现 4 项不阻塞收口的新残余（描述覆盖面、引文措辞、证据文件名、目检裁剪缩放），已按规则归入 backlog，不作为打回理由。

**本次复核实际执行的只读命令与复算**（可重放；全只读，未执行任何 `orca computer` 动作类命令）：
- `git rev-parse --short HEAD` / `git status --porcelain` / `git diff --stat -- USER_MODEL_OVERRIDE.md`
- `cat docs/model/{DISPATCH-LOG,TASK-MODEL-LOG}.jsonl`
- PIL/numpy 逐对复算 `evidence/*.png` 全部 20 处数字＋矩形＋面积＋交集（`strict = 任一通道|Δ|>3`；并同时算 `legacy = 通道和>10` 双口径）
- `md5 -q evidence/*.png`（同帧判定）
- 滚动条几何扫描（TextEdit `te-2-after-set.png`、Chrome `chi-0.png`）与面板溢出扫描（`sc-t0.png`）
- 解析**本任务 QA 会话原始记录** `~/.codebuddy/projects/…/01a0988c-…jsonl`（2.7 MB，末次写入 10:43）与 `01a0989d-…jsonl`：提取真实 CLI 参数、回显、`pixdiff.py` 重算 stdout；`01a098a5-…jsonl` 为本评审会话自身，已排除
- `cat ~/.codex/computer-use/sessions/*.toml`、`cat …/ComputerUseAppApprovals.json`、`grep` codex `rollout-*{01a096e8,01a096f7,01a09701}*.jsonl`
- `grep` Orca 源码 `app.asar.unpacked/out/main/computer-sidecar.js`＋`chunks/computer-use-key-spec-D77jfYX_.js`
- `grep -n` 报告枚举与 `FAIL_MODEL_ACTION` 出现位置

---

## 第二轮（收口复核）

### ① P1-1／P1-2／P1-3 是否闭环

**P1-1｜滚动根因定界缺正向对照＋可滚动性前置条件未记录 → 闭环。**
- 前置条件已补（`:114-122`）且**我独立验证为真**：TextEdit 60 行（原始脚本 `BODY="…for i in range(1,61)"`＝60 行；图像 `te-2-after-set.png` 可见 `line 01…30`，第 30 行被窗底截断；滚动条 thumb 实测 `y=71-449`＝379 px、轨道≈785 px＝**48.3%**，与 30/60＝50% 吻合）；Chrome 120 行（测试页源码 `for(let i=1;i<=120;i++)`＋`#tall div{height:60px}`；`chi-0.png` 可见 `ROW 001…010`，滚动条 thumb 实测 `y=182-292`＝111 px、视口≈1350 px＝**8.2%**，与 10/120＝8.3% 吻合）；Orca 右面板 33 行（原始 stdout `容器内行数(元素81-113) = 33`，末行 `113 按钮 经验一句话.md`；`sc-t0.png` 面板末行被窗口底边 `y=1610` 截断）。
- 正向对照已做并留图（`:124-131`），**原始回显我已核到**：`CLICK(600,400) rc=1 ok=False err=window_not_focused`；`CLICK(600,400,--restore-window) rc=1 ok=False err=window_not_focused`；`SCROLL#1 rc=0 ok=True err=None`／`SCROLL#2 rc=0 ok=True err=None`，两帧 `strict=0/3700800 maxΔ=0`。
- 未排除项已记（`:169`），且 P0 定界已从 v1 的"根因＝provider"**降级为"候选层＋未排除项"**（`:155`、`:165`）——比我第一轮建议的处置更保守、更诚实，符合"缺正向对照时不可区分"的原判。闭环。

**P1-2｜`reason=synthetic_input` 被当故障证据 → 闭环。**
- 字段名已改"原始**返回体**摘要"并加注固定标记语义（`:36`、`:37`）；`:155` 已删去以 `path=synthetic` 佐证的括号，改指像素证据；根因表 provider 行改"合成事件注入不可自证"并给出两条修复方向（`:165`、`:171-173`）。
- **引文逐字核到**：`computer-use-key-spec-D77jfYX_.js` 实为 ``t.path===`synthetic`?`synthetic_input`:t.path===`clipboard`?`clipboard_paste`:t.path===`accessibility`?`accessibility_action_unasserted`:null``，且仅当无 `verification` 时补 `unverified`；`computer-sidecar.js` 的 `Ne()` 实为 `if(r?.verification)return e; if(t==='typeText'||t==='pressKey'||t==='hotkey')→unverified/synthetic_input; if(t==='pasteText')→clipboard_paste; if(t!=='setValue')…原样返回`。（首轮我用直引号 grep 落空，本轮用反引号复核为真，报告引用无误。）闭环。

**P1-3｜像素差口径缺失、8 处数字不可复算 → 闭环。**
- 口径行已置顶（`:7`、`:112`）；`pixdiff.py` 与口径一致（`strict=d.max(axis=2)>3`）。
- **20 处数字全部精确命中**（明细见下表），`550560→750260 (1518-1984,0-1610)`、`1052800 (560-1500,60-1180)`、`666400 (0-560,140-1330)` 三个面积＝矩形乘积且可由证据复算；三矩形**两两交集为 0**、合计 2469460 < 3194240＝全窗。闭环。

### ② P2／P3 九项是否闭环

| 项 | 结论 | 复核依据 |
|---|---|---|
| P2-1 顶层口径漏持久档 | **闭环** | `:13`／`:85` 已改"按 应用×会话 白名单（含跨会话持久档）"；`:91` 标注持久档"生效性仅文件存在性推断"；`:105` 已把它列成 A4 第 3 项最小实验。实测 `ComputerUseAppApprovals.json`＝`{"approvedBundleIdentifiers":["com.google.Chrome"]}`，`01a06aec-…toml` 同时含 Chrome（推断无实验的口径与实测一致） |
| P2-2 记账不实 | **闭环** | `:20`／`:235` 改为"派工显式两行按口径记 HANDOFF；分发账本依 HANDOFF §3 冻结不落"。实测 `docs/model/DISPATCH-LOG.jsonl` 与 `TASK-MODEL-LOG.jsonl` **均仅 `_example` 行**，`USER_MODEL_OVERRIDE.md` `git diff` 为空 |
| P2-3 自证/独立性未写明 | **闭环** | `:20` 明写"由 TM 会话内执行，**非独立 qa 会话**；原因＝同一 session 内连续完成预检＋A＋B，避免跨 session 拼 PASS" |
| P2-4 证据与结论非一一对应 | **闭环（残余见 backlog R3）** | 矩阵各格已带 `(rect)`＋文件名对；我据文件名对全部复算命中。残余：`:142-150` 测量面污染表 5 行未标文件名（中央/左树可由 `ctl-a1↔ctl-a2` 复算命中），`:31` 用缩写 stem |
| P2-5 composer 描述与返回体矛盾 | **闭环** | `:140`／`:156` 改为"即时回读为空（`value_mismatch`，`actualPreview:""`）→ 次帧 AX 才出现 → 写入时序不确定＋渲染不同步"；`crop-term-after.png` 目检 composer 为空（`>`＋光标） |
| P3-1 口径不实（输入汇总） | **闭环** | `:32`／`:184` 已改"TextEdit／Chrome／Orca 普通输入框 PASS；Orca 终端 composer FAIL"，与矩阵一致 |
| P3-2 状态超前 | **闭环** | `:13` CUA-MAC-3 已改 `DIAGNOSED(PENDING_USER_APPROVAL)` |
| P3-3 描述与证据不符 | **闭环** | `:137` 已改"初始为空，`set-value` 后为 60 行溢出文档"，与 `te-2-after-set.png`／`tc-1-content.png` 一致 |
| P3-4 命名（"原始错误摘要"） | **闭环** | `:36` 已改"原始返回体摘要" |

### ③ 能否收口为"过"

**能。** 判定口径三项未放松：结论枚举仍只用 7 态（全文仅 `PASS`×23／`FAIL_UNVERIFIED_ACTION`×12／`BLOCKED_ORCA_APPROVAL`×2／`BLOCKED_TOOL_NOT_INJECTED`×1／`BLOCKED_RUNTIME`×1／`BLOCKED_OS_PERMISSION`×1／`NOT_VERIFIED`×1）；`FAIL_MODEL_ACTION` 全文仅 1 次且位于 `:35` 的**禁止性语境**，未作结论使用；`ok=true`＋零像素变化仍记 `FAIL_UNVERIFIED_ACTION`（滚动 4 组用例＋composer 均按此判）。核心结论（滚动 `FAIL_UNVERIFIED_ACTION` → 不进正式 QA；composer 单点异常；批准＝应用×会话白名单＋跨会话持久档；只读无越界）经独立复算**全部成立**，无需重跑全部用例。残余 4 项均为表述/证据整理层面，**不改变任何判定**，按规则归 backlog，不混入打回理由。

---

## 独立复算明细（v2 全篇 20 处像素差；`strict = 任一通道|Δ|>3 的像素数`）

| # | 报告处（证据对） | 报告数字 | 我实测 | 矩形/面积 | 判定 |
|---|---|---|---|---|---|
| A1 | `:31` shot-01b↔shot-02b | 1043662/3194240 | **1043662** | (0-1984,0-1610) 3194240 | 精确一致 |
| A2 | `:31` shot-01b↔shot-03b | 234691/3194240 | **234691** | (0-1984,0-1610) | 精确一致 |
| B1 | `:137` te-1-before↔te-2-after-set | 153025/1181788 | **153025** | (0-1346,0-878) 1181788 | 精确一致 |
| B1b | `:137` tc-2b↔tc-3-eidx（element-index 滚后） | 0/1181788 | **0**（maxΔ=0） | (0-1346,0-878) | 精确一致 |
| B2 | `:137` tc-2a↔tc-2b（控制组） | 0/1181788 | **0** | (0-1346,0-878) | 精确一致 |
| B3 | `:138` chi-0↔chi-1 全窗 | 3860/3700800 | **3860** | (0-2400,0-1542) 3700800 | 精确一致 |
| C1 | `:138` chi-0↔chi-1 裁剪 | 3845/7980 | **3845** | (686-952,216-246) 7980 | 精确一致；变化 bbox＝(686,216,953,247) 半开→该 266×30 矩形，与"精确落在输入框"一致 |
| C2 | `:138` chi-0↔chi-2（清除后） | 0/3700800 | **0** | (0-2400,0-1542) | 精确一致（`chi-2` 与 `chi-0` md5 同） |
| C3 | `:127` pc-before↔pc-after1（正向对照） | 0/3700800 | **0** | (0-2400,0-1542) | 精确一致 |
| D1 | `:127` pf-1-before↔pf-2-after1 | 0/3700800 | **0** | (0-2400,0-1542) | 精确一致 |
| D2 | `:138` ch-ctl-1↔ch-ctl-2（控制组） | 0/3700800 | **0** | (0-2400,0-1542) | 精确一致 |
| D3 | `:139` input-0-before↔input-1-after-set 全窗 | 243829/3194240 | **243829** | (0-1984,0-1610) | 精确一致 |
| D4 | `:139` 同对 裁剪 | 2198/54696 | **2198** | (1540-1964,144-273) 54696 | 精确一致 |
| D5 | `:139` orc-0↔orc-1（右面板坐标滚） | 0/750260 | **0** | (1518-1984,0-1610) 750260 | 精确一致（原始回显 `SCROLL#1 rc=0 ok=True`） |
| E1 | `:139` sc-t0↔sc-t1（同面板控制组） | 0/750260 | **0** | (1518-1984,0-1610) | 精确一致 |
| E2 | `:140` term-0-before↔term-1-after-set | 0/166600 | **0** | (480-1460,1250-1420) 166600 | 精确一致（该区内 0；同窗其余区 222784 为终端自渲染） |
| E3 | `:146` 中央终端区控制组 | 217750/1052800 | **217750** | (560-1500,60-1180) 1052800 | 精确一致（源文件 `ctl-a1↔ctl-a2`，报告未标名→R3） |
| E4 | `:147` 左侧工作树控制组 | 4122/666400 | **4122** | (0-560,140-1330) 666400 | 精确一致（同上） |
| F1 | `:187` e2e-0↔e2e-1 | 248705/3194240 | **248705** | (0-1984,0-1610) | 精确一致（原始 stdout `STEP2 过滤后 文件按钮数= 3`） |
| F2 | `:187` e2e-0↔e2e-2（恢复后） | 199413/3194240 | **199413** | (0-1984,0-1610) | 精确一致 |

**几何核对**：三矩形两两交集面积＝0、0、0（互不重叠）；合计 666400＋1052800＋750260＝**2469460**，与 `:152` 一致且 < 3194240。
**双口径核验**：9 组零位移对（TextEdit element-index／TextEdit 控制组／TextEdit 坐标滚／Chrome 正向对照×2／Chrome 控制组／Orca 右面板滚／Orca 右面板控制组／Orca composer）在 `strict(>3)` 与 `legacy(和>10)` 下**均为 0 且 maxΔ=0**，故零位移非口径产物。
**任务A 外部证据**：`sessions/` 实存 **5 份** toml，内容与 `:72-76` 逐字一致（`01a096e8`＝`["com.stablyai.orca"]`）；`01a096f7`／`01a09701` 无文件且日志命中 `not approved to use Orca`，模型归属分别 `gpt-5.6-sol`／`gpt-5.6-luna`（＝`:73-74`、`:80`）；持久档仅 `com.google.Chrome`（＝`:64`）。
**预检节数据**：`elementCount` 125→95→125 与 `:31`、`:34` 一致；侧边栏恢复回 125 已有原始回显。

---

## 七查逐条结论（本任务适配版）

| # | 检查项 | 结论 | 依据 |
|---|---|---|---|
| 1 | 结论与证据一致 | **通过** | 20 处数字与矩形逐条复算命中；每条 PASS/FAIL 均带动作后状态或像素证据；残余 R1（覆盖面对表述）不改变任何 PASS/FAIL |
| 2 | 判据一致（零变化记 `FAIL_UNVERIFIED_ACTION`） | **通过** | 滚动 4 组用例 `ok=true`＋`strict=0` 全记 `FAIL_UNVERIFIED_ACTION`；composer 同判；`:32` 最终结论同 |
| 3 | 枚举合规（7 态，禁 `FAIL_MODEL_ACTION`） | **通过** | 见上统计；`FAIL_MODEL_ACTION` 仅 `:35` 禁止性语境 |
| 4 | 无跨模型/Runtime/session 拼 PASS | **通过** | 全表同一模型＋同一 Runtime＋同一执行链；`:20` 显式声明由 TM 会话内执行、非独立 qa；`:189` 判"不得写已启用" |
| 5 | 定界准确 | **通过** | 未甩锅模型；Orca 单点未扩大为全局；滚动定界已降级为"候选层＋未排除项"（`:155`、`:165`、`:169`）；`click` 生效结论已改指像素/`elementCount`（措辞残余见 R2） |
| 6 | 越界检查 | **通过** | 实测 15 `M`＋5 `??` 与 `:210-224` 一致；`USER_MODEL_OVERRIDE.md` `git diff` 空；批准两档文件未改（持久档仍仅 Chrome、5 份 toml 原样）；无 Android/iPhone 改动 |
| 7 | 可复现性与回滚 | **通过** | 本轮零业务改动，无需回滚；`:114-152` 前置条件＋口径＋矩形＋文件名对使第三方可复算（残余命名缺口见 R3）；最小修复点 `:194-198` 可执行 |

---

## P0 / P1 Findings

- **P0：无。** 未见结论错误、越界改动或拼 PASS；四条必答结论与滚动 FAIL 判定经独立复算成立。
- **P1：无（全部清零）。** 第一轮 P1-1／P1-2／P1-3 已闭环（逐条见"第二轮"①）。

## 残余 Backlog（**非阻塞**，不影响收口，下批修订或下轮实测时一并处理）

- **R1（P2｜覆盖面表述不实）**：`:11`／`:155`／`:185`／`:193` 称"三目标 × 两路径（合成坐标／AX 元素）全部失败"，但原始会话记录显示：Chrome 仅坐标路径（`--x 600 --y 500`×2，`ch-1..ch-4`），Orca 右面板仅坐标路径（`--x 880 --y 700`）；标注为"尝试A: element-index 滚动右侧文件树容器"的脚本因 bug 实际执行的是坐标滚并抛 `FileNotFoundError`，**AX 元素路径只对 TextEdit 实测过**（`SCROLL(element-index=1,down) rc=0 ok=True verification={'state':'unverified','reason':'accessibility_action_unasserted'}`）。改法二选一：①改表述为"TextEdit 两路径全败；Chrome／Orca 合成坐标路径全败（AX 元素路径仅 TextEdit 实测）"；②下轮补跑 Chrome／Orca 的 `--element-index` 滚动各一次并留图。
- **R2（P3｜引文措辞）**：`:165`"`click` 走 AX"与源码不符——`computer-sidecar.js` `Ae()` 的 path 映射为 `pasteText→clipboard`／`setValue`、`performSecondaryAction→accessibility`／**其余（含 click、scroll）→synthetic**，故 click 的申报 path 是 `synthetic`、带的是 `synthetic_input` 而非 `accessibility_action_unasserted`。改法：改为"click 生效由像素与 `elementCount` 实证；其申报 path 亦是 `synthetic`（同样带 by-design 标记，正是该标记不含送达信息的反例）"。effect 部分无需改。
- **R3（P3｜证据文件名）**：`:142-150` 测量面污染表 5 行未标证据文件名（中央终端区／左侧工作树实由 `ctl-a1↔ctl-a2` 复算命中；右面板／TextEdit／Chrome 的证据对在矩阵内已给）；`:31` 用缩写 stem（`shot-01b↔shot-02b` 实为 `shot-01b-before-toggle.png`↔`shot-02b-hidden.png`）。改法：表格补文件名列、缩写改全名。
- **R4（P3｜目检裁剪缩放）**：`crop-*.png` 尺寸与所量矩形非 1:1（`crop-input-1-after-set` 914×258 vs 424×129；`crop-term-after` 1904×516 vs 980×170；`crop-chrome-after` 1400×70 vs 266×30）。仅作目检辅助、不影响数字（数字取自整帧复算）；建议标注缩放或按矩形同尺寸导出。
- **R5（P3｜方法学，供下轮）**：Chrome 正向对照 7 张图（`ch-ctl-1/2`、`pc-before`、`pc-after1`、`pf-1-before`、`pf-2-after1/2`）md5 全同（`caea85b4…`），`tc-1-content/tc-2a/tc-2b/tc-3-eidx` 与 `scr-a/scr-b` 亦各为同帧。这与"零位移（maxΔ=0）"自洽，且采集链在内容真变时会产出不同帧（`chi-0↔chi-1`＝3860、`tc-0-empty` vs `tc-1-content`＝153025），故 0 的读法成立；但建议此后"动作前/后"两帧用不同文件名＋时间戳留存，避免同帧被误读为复制件。

## 终裁

- **Result：过（收口）。** 第一轮必改三项（P1-1／P1-2／P1-3）与 P2-1~P2-5、P3-1~P3-4 全部改到位并经独立复算验证；滚动 `FAIL_UNVERIFIED_ACTION` → 不进正式 QA 的判定成立；`CUA-MAC-1` 保持 `OPEN`（候选层＝provider＋未排除项＝坐标路径指针/焦点前置条件），`CUA-MAC-2`、`CUA-MAC-3` 状态与描述正确。
- 残余 R1~R5 为**非阻塞**项，已列 backlog，不计入打回理由；建议随下批文档修订或下轮复测一并处理。
- 边界声明：本轮评审**只读**；除覆盖本文件外未改仓库任何文件，未 commit／未 push，未碰 secrets，未改模型表与治理文件，未执行任何 `orca computer` 动作类命令（未滚动/点击/输入），未涉及 Android/iPhone。
