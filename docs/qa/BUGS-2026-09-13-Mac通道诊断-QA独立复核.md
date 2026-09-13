# BUGS｜Mac 通道诊断（`BUGS-2026-09-13-Mac真机QA通道诊断.md` v2）QA 独立复核

> 复核对象：`docs/qa/BUGS-2026-09-13-Mac真机QA通道诊断.md`（v2，2026-09-13）
> 复核性质：**独立 QA 会话重新实测**，非复述；本报告全部数字均由本 session 亲跑命令或由被检报告自带证据图重算得到。
> 范围：只复核 Mac 端真机 QA 通道诊断报告本身。Android/iPhone 未测、未派工、未改规则。
> 像素差口径（全篇唯一）：`任一通道 |Δ| > 3 的像素数 / 该裁剪区总像素数`；坐标＝物理像素、左上为原点；本 session 用自写脚本 `/tmp/qa-indep-2026-09-13/pixdiff-qa.py` 独立实现（**不调用**被检方的 `/tmp/qa-cua-2026-09-13/pixdiff.py`）。
> 复核会话信息：2026-09-13｜模型 `deepseek-v4.1-flash` via `codebuddy`｜Runtime `codebuddy`｜链内无原生 CUA（工具面仅 `Bash→orca computer` CLI）。

| Bug ID | Priority | Stage P0 Blocking? | Repro | Status | Current Task | 备注（截图/日志一句） |
|---|---|---|---|---|---|---|
| QA-MAC-4 | P2 | NO | `orca computer scroll --app com.stablyai.orca --window-id <id> --element-index <右面板文件容器+index> --direction down` 返回 `fallbackReason=actionUnsupported` | OPEN | 复核-报告口径 | 报告「三目标 × 两路径全败」对 Orca 目标不成立：右面板无独立 AX 滚动路径（回落 synthetic） |
| QA-MAC-5 | P3 | NO | TextEdit 溢出文档首次 AX 滚动读数 `1169/1181788`，像素全落在标题栏 | OPEN | 复核-判据 | 窗口级像素差会被窗口装饰（`已编辑` 标记）污染；判滚动位移须叠加滚动条 value/元素 bbox |
| QA-MAC-6 | P3 | NO | 预检由 TM 会话内执行，非独立 qa 会话 | OPEN | 复核-门禁 | 该预检不得作为正式 QA 会话门禁复用；DISPATCH 未落行（报告已自述） |
| QA-MAC-7 | P3 | NO | 报告「Orca 右面板 33 行溢出」前置条件本次不可复现 | OPEN | 复核-前置条件 | 本 session 该窗口为另一工作区，文件树 18 行且无 `滚动区` 元素；Orca 面单独 0 位移不可判 |

> 被检报告 **CUA-MAC-1 / CUA-MAC-2 / CUA-MAC-3 三项结论本次全部独立复现成立**，无 P0/P1 级缺陷；上表 4 行均为复核中新发现的表述/方法学/前置条件类问题（P2/P3），不推翻被检报告结论。

## 真机QA会话能力预检结果（本复核 session，正式用例前）

> 判据：`ok=true/exit 0/工具调用成功`但无状态或像素变化一律记 `FAIL_UNVERIFIED_ACTION`；禁跨模型/跨Runtime/跨session拼PASS。

- 日期/任务名：2026-09-13｜Mac 通道诊断报告（v2）QA 独立复核
- session ID：本项目 **独立 qa 会话**（codebuddy 非交互链，向 TM 派工口单开；非复用被检报告的 TM 会话，未与其拼接任何 PASS）
- 模型精确ID：`deepseek-v4.1-flash`（与 `USER_MODEL_OVERRIDE.md` qa 行一致）
- Runtime：`codebuddy`
- 原生CUA是否实际注入（codebuddy无结果如实记“未注入”，禁伪称已存在）：**本链未注入**——本链工具面只有 `Bash→orca computer` CLI，未见 `mcp__cua_repl.js` 或任何 native CUA 工具，**不伪称存在**
- 可用工具精确名称（本链实测可用）：`orca status --json`／`orca computer capabilities|permissions|list-windows|get-app-state|scroll|set-value|perform-secondary-action --json`
- CLI备用入口是否存在（Bash→orca computer CLI）：**存在且可用**，`which orca` → `/opt/homebrew/bin/orca`；`ORCA_CLI_COMMAND` 与 `ORCA_DEV_REPO_ROOT` 均未设置（空）
- Orca Runtime（`orca status --json` 实时结果，禁沿用旧报告）：`state=ready`／`reachable=true`／`connectionState=connected`／runtimeId `c768e29e-0d67-42e9-b7e4-13dc5f930e60`／appVersion `1.4.198`／app.running `true`（pid 92395）／desktopWindowStatus `available`
- 能力（`orca computer capabilities --json` 实时结果）：provider `orca-computer-use-macos`，providerVersion `1.0.0`，protocolVersion `1`，platform `darwin`；`observation.screenshot=true`／`ocr=false`／`elementFrames=true`／`annotatedScreenshot=false`；`windows.list/targetById/targetByIndex=true`、**`focus=false`**、`moveResize=false`；`actions.performAction/scroll/hotkey/typeText/drag/pasteText/setValue/click/pressKey` 全 `true`
- 权限（`orca computer permissions --json` 实时结果）：Accessibility **granted**／Screenshots **granted**；`nextStep=null`；`openedSettings=false`／`launchedHelper=false`；helperAppPath `/Applications/Orca.app/Contents/Resources/Orca Computer Use.app`。Orca应用访问批准：orca CLI 通道**无** per-app 门（对 `com.stablyai.orca`、`com.apple.TextEdit` 直接可读可操作，本 session 实测）
- 读屏结果（事先指定可见文字，禁拿date/静态文件/命令输出冒充）：**PASS**。事前声明标靶＝Orca 窗口内固定控件名；AX 树实测命中 `Workspaces`／`搜索工作树和浏览器选项卡`／`切换侧边栏`／`Terminal input`／`查找文件`，与真实像素目检一致
- 截图结果（真实截图核对目标窗口＋像素尺寸）：**PASS**。`screenCaptureKit` 实拍，Orca 窗口 `1984×1610`（scale 2，对应窗口 992×805 pt）；TextEdit 窗口 `1346×878`（scale 2，对应 673×439 pt）；非空非占位
- 点击并恢复结果（只点无副作用控件如切换侧边栏，读动作后状态确认变化，刷新元素索引后恢复，窗口变化后重取状态禁复用旧索引）：**本 session 未执行**（本轮复核面为滚动，不重复被检方点击用例；禁未测先记 PASS）。状态：`NOT_VERIFIED`（沿用被检报告 PASS 不计入本 session）
- 输入并清除结果（专用测试框写 `QA-CUA-CANARY`，AX值＋像素/真实UI双验，清除残留禁按Enter）：**本 session 未执行输入用例**（仅用 `set-value` 造溢出前置条件，见下）；`NOT_VERIFIED`（沿用被检报告 PASS 不计入本 session）
- 滚动及可见位移结果（明确可滚动区域，必须观察到内容或像素位移，像素差为零记 `FAIL_UNVERIFIED_ACTION`）：**FAIL_UNVERIFIED_ACTION**。见下「B 零噪声面独立复测」
- 界面恢复确认（无残留）：**PASS**。Orca `Terminal input` 无值、`查找文件` 无值、侧边栏可见（`Workspaces` 在树中）、`elementCount` 105；TextEdit 已关窗退出（进程无）、一次性 txt 已删
- 最终结论（枚举只许 `PASS / BLOCKED_TOOL_NOT_INJECTED / BLOCKED_ORCA_APPROVAL / BLOCKED_RUNTIME / BLOCKED_OS_PERMISSION / FAIL_UNVERIFIED_ACTION / NOT_VERIFIED`，禁 `FAIL_MODEL_ACTION`）：**FAIL_UNVERIFIED_ACTION**（滚动项不达标；与被检报告一致）
- 原始返回体摘要：`scroll` 坐标路径 `{"action":{"path":"synthetic","verification":{"state":"unverified","reason":"synthetic_input"}}}`；`scroll` 元素路径（TextEdit）`{"action":{"path":"accessibility","actionName":"AXScrollDownByPage","verification":{"state":"unverified","reason":"accessibility_action_unasserted"}}}`；`scroll` 元素路径（Orca 右面板）`{"action":{"path":"synthetic","fallbackReason":"actionUnsupported",...}}`；`perform-secondary-action "scroll down"` → `ok=false`、`error.code=accessibility_error`
- 是否允许进入正式QA（全PASS才YES，否则NO即停）：**NO**（预检未全过 → 停）。正式 QA 未启用；`deepseek-v4.1-flash` 真机 QA 维持“待验证”

### 预检三命令原始回显（节选，本 session 实跑）

```text
$ orca status --json          # rc=0
"app":{"running":true,"pid":92395,"desktopWindowStatus":"available"}
"runtime":{"state":"ready","reachable":true,"connectionState":"connected",
           "runtimeId":"c768e29e-0d67-42e9-b7e4-13dc5f930e60","appVersion":"1.4.198"}
"graph":{"state":"ready"}

$ orca computer capabilities --json    # rc=0
"providerVersion":"1.0.0","provider":"orca-computer-use-macos","protocolVersion":1,"platform":"darwin"
"observation":{"screenshot":true,"ocr":false,"annotatedScreenshot":false,"elementFrames":true}
"windows":{"list":true,"targetById":true,"targetByIndex":true,"focus":false,"moveResize":false}
"actions":{"performAction":true,"scroll":true,"hotkey":true,"typeText":true,"drag":true,
           "pasteText":true,"setValue":true,"click":true,"pressKey":true}

$ orca computer permissions --json     # rc=0
"openedSettings":false,"launchedHelper":false
"helperAppPath":"/Applications/Orca.app/Contents/Resources/Orca Computer Use.app"
"permissions":[{"id":"accessibility","status":"granted"},{"id":"screenshots","status":"granted"}]
"nextStep":null
```

## 独立复测记录

### B. 零噪声面滚动独立复测（P0 判定核心）

目标窗口：`orca computer list-windows --app com.stablyai.orca --json` → `windows[0].id = 7518`，title `Orca`，`992×805` pt（=1984×1610 物理 px），`screenIndex 0`。

#### B-1 Orca 右侧文件管理器面板（裁剪矩形 `(1518-1984,0-1610)`，零噪声面）

```text
$ # 控制组两帧（无任何动作）
$ orca computer get-app-state --app com.stablyai.orca --window-id 7518 --json  → orc-b0.png / orc-b1.png
   （两帧均 1984×1610 scale 2，elementCount 105）
控制组噪声：  0/750260  (1518-1984,0-1610)  maxd=0     ← 零噪声面成立（与被检报告一致）

$ orca computer scroll --app com.stablyai.orca --window-id 7518 --x 880 --y 700 --direction down --json
{"ok":true,
 "result":{"action":{"path":"synthetic","targetWindowId":7518,"actionName":null,
                     "fallbackReason":null,
                     "verification":{"state":"unverified","reason":"synthetic_input"}},
           "snapshot":{"elementCount":105,...}}}
动作后帧：orc-a1.png
右面板像素差：0/750260  (1518-1984,0-1610)  maxd=0     ← ok=true 但零位移
同一对全窗差：480/3194240 (0-1984,0-1610)  maxd=245   ← 全窗非零来自 Orca 自渲染面，非右面板

$ # AX 元素路径交叉（右面板文件容器）
$ orca computer scroll --app com.stablyai.orca --window-id 7518 --element-index 75 --direction down --json
{"ok":true,"result":{"action":{"path":"synthetic","fallbackReason":"actionUnsupported",...}}}
右面板像素差（orc-b0 ↔ orc-e1）：0/750260   elementCount 105→105
```

**结论（B-1）**：Orca 目标上 `scroll` 返回 `ok=true`、`elementCount` 不变、零噪声面像素差为 **0**，控制组亦为 **0** → 按判据 **`FAIL_UNVERIFIED_ACTION` 成立**。
**复核新发现（QA-MAC-4 / QA-MAC-7）**：① 报告「三目标 × 两路径（合成坐标／AX 元素）」对 Orca 目标**不成立**——`--element-index` 在右面板文件容器上 `fallbackReason=actionUnsupported`，即右面板**不存在**独立 AX 滚动路径，该次调用回落合成路径（证据：上条回显）；② 本次窗口内文件树仅 **18 行**（`008林粒粒AI编程/app/docs M/src/tests/...`，索引 76-93），且 AX 树中**无 `滚动区` 元素**，报告「33 行、面板可视高度不足以全显」的可滚动性前置条件**本次不可复现**（被检时该窗口为模板包工作区）。故 Orca 面单独 0 位移**不可判**，本复核的 P0 判据主要由下述 TextEdit 面支撑。

#### B-2 TextEdit（macOS 原生，溢出文档，零噪声面 `(0-1346,0-878)`）—— 具备可滚动性前置条件

```text
$ open -a TextEdit /tmp/qa-indep-2026-09-13/QA-CUA-CANARY-独立复测.txt   （一次性空 txt）
$ orca computer list-windows --app com.apple.TextEdit --json
  → window id 16217, title QA-CUA-CANARY-独立复测.txt, 673×439 pt (=1346×878 px)

$ # 造溢出：写入 60 行（LINE 001…060）
$ orca computer set-value --app com.apple.TextEdit --window-id 16217 --element-index 2 \
    --value-stdin < te-content.txt --json
{"ok":true,"result":{"action":{"path":"accessibility","actionName":"AXSetValue",
   "verification":{"state":"verified","property":"value",
                   "actualPreview":"LINE 001 QA independent recheck\n…LINE 060 …",
                   "expected":"（与 actual 逐字相同）"}},"snapshot":{"elementCount":16}}}

$ # 前置条件求证：AX 树（te-b0 帧）
  1 滚动区, Secondary Actions: scroll up, scroll down        ← 可滚动容器
  4 滚动条, Value: 0                                          ← 垂直滚动条 **已启用**
      5 值指示器, Value: 0                                    ← 溢出确认

控制组噪声（te-b0 ↔ te-b1）：0/1181788 (0-1346,0-878)  maxd=0

$ # 路径①：AX 元素
$ orca computer scroll --app com.apple.TextEdit --window-id 16217 --element-index 1 --direction down --json
{"ok":true,"result":{"action":{"path":"accessibility","actionName":"AXScrollDownByPage",
   "targetWindowId":16217,"verification":{"state":"unverified","reason":"accessibility_action_unasserted"}}}}
第 1 次后帧 te-a1 像素差：1169/1181788 (0-1346,0-878)  maxd=77
   像素定位：x 600-714 / y 21-44（窗口标题栏区）
   两帧裁剪比对目检终判：标题栏由 "…txt ⌄" 变为 "…txt — 已编辑"
   → 非内容位移；滚动条 value 仍为 0
$ # 再滚一次
$ orca computer scroll … --element-index 1 --direction down --json   （同回显）
第 2 次后帧 te-a2 像素差（te-a1 ↔ te-a2）：0/1181788  滚动条 value 仍为 0

$ # 路径②：合成坐标（无 restore / 带 restore 各一次）
$ orca computer scroll --app com.apple.TextEdit --window-id 16217 --x 300 --y 200 --direction down --json
{"ok":true,"result":{"action":{"path":"synthetic","targetWindowId":16217,
   "verification":{"state":"unverified","reason":"synthetic_input"}}}}
te-a2 ↔ te-c1：0/1181788    滚动条 value 仍为 0
$ orca computer scroll … --x 300 --y 200 --direction down --restore-window --json
{"ok":true,"result":{"action":{"path":"synthetic",…,"reason":"synthetic_input"}}}
te-c1 ↔ te-c2：0/1181788    滚动条 value 仍为 0

$ # 第三路径：AX 二次动作（正面守卫）
$ orca computer perform-secondary-action --app com.apple.TextEdit --window-id 16217 \
    --element-index 1 --action "scroll down" --json
{"ok":false,"error":{"code":"accessibility_error",
   "message":"AXUIElementPerformAction(AXScrollDownByPage) failed"}}
```

**结论（B-2）**：在**已证明可滚动**（`滚动区` + 已启用滚动条 + 60 行溢出）、**控制组噪声为 0** 的零噪声面上，三条路径（AX 元素 / 合成坐标 / 合成坐标+restore）全部 `ok=true` 而**像素零位移、滚动条 value 恒为 0**，二次动作直接 `accessibility_error` → 被检报告 **CUA-MAC-1（滚动 P0）结论独立复现成立**。
**复核新发现（QA-MAC-5）**：窗口级像素差口径会被**窗口装饰的非滚动变化**污染——本 session 首次 AX 滚动读数 `1169/1181788` 全部落在标题栏 `已编辑` 标记（`x 600-714, y 21-44`），并非内容位移；第二次即 `0/1181788`。→ 判「滚动有无位移」不能只看窗口级像素差，须叠加**滚动条 value / 元素 bbox / 内容文本节点**证据。（被检报告对该处的 `0/1181788` 数字本身经重算无误，见 C 节第 10 行。）

### C. 报告数字抽验（由被检报告自带证据图重算，18 处）

脚本：本 session 自写口径实现；证据目录：`/tmp/qa-cua-2026-09-13/evidence/`（被检报告留存，本 session **只读**）。

| # | 用例（证据对） | 报告 v2 数字 | 本 session 重算 | 判定 | 裁剪矩形 / 图尺寸 |
|---|---|---|---|---|---|
| 1 | 点击 shot-01b↔shot-02b | 1043662/3194240 | 1043662/3194240 | **MATCH** | (0-1984,0-1610) / 1984×1610 |
| 2 | 点击恢复残留 shot-01b↔shot-03b | 234691/3194240 | 234691/3194240 | **MATCH** | (0-1984,0-1610) |
| 3 | 3a Orca 滚动 orc-0↔orc-1 | 0/750260 | **0/750260**（0 值） | **MATCH** | (1518-1984,0-1610) |
| 4 | 3a Orca 控制组 sc-t0↔sc-t1 | 0/750260 | **0/750260**（0 值） | **MATCH** | (1518-1984,0-1610) |
| 5 | 3a 输入全窗 input-0↔input-1 | 243829/3194240 | 243829/3194240 | **MATCH** | (0-1984,0-1610) |
| 6 | 3a 输入裁剪 input-0↔input-1 | 2198/54696 | 2198/54696 | **MATCH** | (1540-1964,144-273) |
| 7 | 3b 终端 composer term-0↔term-1 | 0/166600 | **0/166600**（0 值） | **MATCH** | (480-1460,1250-1420) |
| 8 | TextEdit 输入 te-1↔te-2 | 153025/1181788 | 153025/1181788 | **MATCH** | (0-1346,0-878) |
| 9 | TextEdit 控制组 tc-2a↔tc-2b | 0/1181788 | **0/1181788**（0 值） | **MATCH** | (0-1346,0-878) |
| 10 | TextEdit 元素滚动 tc-2b↔tc-3-eidx | 0/1181788 | **0/1181788**（0 值） | **MATCH** | (0-1346,0-878) |
| 11 | Chrome 输入全窗 chi-0↔chi-1 | 3860/3700800 | 3860/3700800 | **MATCH** | (0-2400,0-1542) |
| 12 | Chrome 输入裁剪 chi-0↔chi-1 | 3845/7980 | 3845/7980 | **MATCH** | (686-952,216-246) |
| 13 | Chrome 清除 chi-0↔chi-2 | 0/3700800 | **0/3700800**（0 值） | **MATCH** | (0-2400,0-1542) |
| 14 | Chrome 滚动 pc-before↔pc-after1 | 0/3700800 | **0/3700800**（0 值） | **MATCH** | (0-2400,0-1542) |
| 15 | Chrome 控制组 ch-ctl-1↔ch-ctl-2 | 0/3700800 | **0/3700800**（0 值） | **MATCH** | (0-2400,0-1542) |
| 16 | 端到端 e2e-0↔e2e-1 | 248705/3194240 | 248705/3194240 | **MATCH** | (0-1984,0-1610) |
| 17 | 噪声-中央终端 ctl-a1↔ctl-a2 | 217750/1052800 | 217750/1052800 | **MATCH** | (560-1500,60-1180) |
| 18 | 噪声-左侧工作树 ctl-a1↔ctl-a2 | 4122/666400 | 4122/666400 | **MATCH** | (0-560,140-1330) |

补充核验：
- 裁剪区面积自洽：`466×1610=750260`；`1346×878=1181788`；`2400×1542=3700800`；`1984×1610=3194240`；`980×170=166600`；`424×129=54696`——全部与报告分母一致。
- 「三个矩形互不重叠」成立：`0-560`／`560-1500`／`1518-1984`（含 1500-1518 空档），合计 `666400+1052800+750260=2469460 < 3194240`——与报告一致。
- 抽验比例：**18/18 MATCH**（其中应非 0 的 8 处、应为 0 的 10 处），超过任务要求的「至少 6 处（≥2 处 0、≥2 处非 0）」。
- **本次 live 实测的噪声分布与被检报告不一致（不构成报告错误，仅记边界）**：本 session 两帧控制组在中央终端区 `(560-1500,60-1180)` 得 **0/1052800**、左侧工作树区得 **289/666400**；即自渲染噪声的位置随当次终端输出/光标活动变化，报告的 `217750` 与 `4122` 只在其当次证据帧内成立（重算其证据图仍是这两个数，MATCH）。→ 结论：**噪声面判据必须每 session 重测，禁沿用**（与被检报告方法一致）。

### D. 口径与边界检查

| 检查项 | 结果 | 证据 |
|---|---|---|
| ① 结论枚举只用 7 态、无 `FAIL_MODEL_ACTION` | **PASS** | 全文 `FAIL_MODEL_ACTION` 仅出现 1 次，且位于**禁用声明句**内（`:35` 枚举列表后的“禁 `FAIL_MODEL_ACTION`”）；实际结论为 `FAIL_UNVERIFIED_ACTION`；文中使用枚举 `FAIL_UNVERIFIED_ACTION`×12、`BLOCKED_ORCA_APPROVAL`×2（含枚举定义句）、`PASS`×23，无越界枚举 |
| ② 预检记录「本链未注入原生 CUA」 | **PASS** | `:23` 明写“**本链未注入**——本链工具面为 `Bash→orca computer` CLI；`mcp__cua_repl.js` 仅存在于 codex 会话”，无伪称 |
| ③ 无跨模型／跨Runtime／跨session拼 PASS | **PASS**（附 1 条观察） | `:233` 声明未拼；`:189` 明写“同一模型＋同一 Runtime＋同一执行链下不得写已启用”；A 节 Sol/Luna 两链明确标注“**当前未执行**”，未把他链证据并入本轮结论。**观察（QA-MAC-6）**：`:20` 自述本预检“**由 TM 会话内执行，非独立 qa 会话**”——单 session 内自洽、未拼接，但该预检**不得**被后续正式 QA 会话当作门禁复用（本复核即在独立 qa 会话重跑，见上节） |
| ④ 无「只凭 `ok=true`／exit 0 判 PASS」 | **PASS** | 逐项复核 6 处 PASS 均带状态或像素证据：读屏（AX token＋像素目检）／截图（尺寸＋目检）／点击（`elementCount 125→95`＋像素 `1043662`）／输入 TextEdit-Chrome（provider `state=verified,property=value`＋AX Value＋像素）／判断UI状态（elementCount＋树 token＋像素三重）／端到端（18→3 项过滤＋像素）。反向亦成立：`scroll` 全部 `ok=true` 却因像素零位移被判 `FAIL_UNVERIFIED_ACTION`，未见以返回体判过 |

其他边界核验：
- 被检报告 B 节 `reason=synthetic_input` 的解读（`:37`，P1-2 修订）与本 session 实测一致：本 session 三条 `path=synthetic` 动作（Orca 坐标滚动、TextEdit 坐标滚动×2）**均**带 `unverified/synthetic_input`，而其中确有生效者（如 `set-value` 为 accessibility 路径另一码），证明该标记不区分是否送达——报告已不再用它作故障证据，修订正确。
- `windows.focus=false` 与 `click` 报 `window_not_focused` 的未排除项（`:169`）本 session 无法证伪（未重跑 Chrome 正向对照，`NOT_VERIFIED`），报告已如实标为「未排除项」，表述与证据相称。
- 被检报告「上轮数字未定义口径、本版全部重算」的声明可复核：其证据图 18 处数字在统一口径下全部自洽（见 C 节）。

## Fix Attempt Fingerprint

- Task ID: Mac 通道诊断报告（v2）QA 独立复核（`BUGS-2026-09-13-Mac通道诊断-QA独立复核`）
- Root Cause Hypothesis: 被检报告结论层无缺陷；复核中发现的问题集中在**证据范围表述**（Orca「两路径」实为一条＋一次回落）、**判据口径的已知污染源**（窗口装饰/标题栏）、**预检会话归属**（TM 会话内执行）与**前置条件可复现性**（Orca 右面板不溢出）四处
- Approach: 三命令预检实跑 → 零噪声面滚动独立复测（Orca 右面板 + TextEdit 溢出文档 × 三路径）→ 由被检方证据图重算 18 处像素差 → 枚举/口径/边界逐条核对 → 全量清理
- Files Changed: **仅新建本报告** `docs/qa/BUGS-2026-09-13-Mac通道诊断-QA独立复核.md`；仓库内治理文件、模型表、业务文件、被检报告**一字未改**（`git status` 与本轮进入前一致，HEAD `c319b6d`）
- Verification: 见「真机QA会话能力预检结果」「独立复测记录 B/C/D」；本 session 证据仅存 `/tmp/qa-indep-2026-09-13/`（已按清理要求删除，原始回显全部内嵌本报告）
- Failure Reason: 滚动通道仍未闭环（`CUA-MAC-1` 复核后维持 OPEN）；本复核未产生新的 P0/P1
- Difference From Previous Attempt: 上轮（被检报告）为**诊断**且滚动判据以 Orca 右面板为主；本轮为**独立复核**，改用**具备可滚动性前置条件**的 TextEdit 溢出文档作主判面，并把「窗口级像素差会被标题栏装饰污染」这一新污染源实测定位到像素级（`x 600-714, y 21-44`）

> Attempt ID / Dispatch ID / Model-Backend 系字段 2.0 已废弃，不填（模型轨迹记账本）。

## 结论

**PASS**（被检报告 `BUGS-2026-09-13-Mac真机QA通道诊断.md` v2 的核心结论独立复现成立；无 P0/P1 缺陷；4 项 P2/P3 修订建议见下表，不阻塞）。

复核判定依据：

| 复核项 | 判定 | 一句话 |
|---|---|---|
| A 预检三命令 | **复现一致** | state/reachable/connectionState/runtimeId/appVersion、provider/version/supports（含 `windows.focus=false`）、accessibility/screenshots 全部与被检报告逐字一致 |
| B 零噪声面滚动 | **P0 结论成立** | Orca 右面板 `0/750260`＋控制组 0；TextEdit 溢出文档三路径全 `ok=true` 且零位移、滚动条 value 恒 0、二次动作 `accessibility_error` |
| C 数字抽验 | **18/18 MATCH** | 含应为 0 的 10 处、应非 0 的 8 处；面积分母与矩形不重叠声明全部自洽 |
| D 口径边界 | **4/4 PASS** | 7 态枚举无越界、未伪称原生 CUA、未拼 PASS、无以返回体判 PASS |
| E 清理 | **PASS** | Orca 无输入残留、侧边栏可见；TextEdit 关窗退出＋临时文件已删 |

P2/P3 修订建议（下次修订报告时同批处理，**不影响本轮 PASS**）：

1. **（P2，QA-MAC-4）** 将 `CUA-MAC-1 备注` 与「判定规则命中」中「三目标 × **两路径**（合成坐标／AX 元素）」改为按目标分别表述：Orca 目标实为「坐标路径 1 条＋元素路径回落」；最小复现命令：
   `orca computer scroll --app com.stablyai.orca --window-id <id> --element-index 75 --direction down --json` → 观察 `fallbackReason=actionUnsupported`。
2. **（P3，QA-MAC-5）** 在「像素差口径」节补一句：窗口级矩形含标题栏/装饰，判滚动位移须叠加滚动条 `value`／元素 bbox；最小复现：TextEdit 溢出文档首次 AX 滚动得 `1169/1181788`，像素全落 `x 600-714, y 21-44`（`已编辑` 标记）。
3. **（P3，QA-MAC-6）** 预检节标注「本预检不得作为正式 QA 会话门禁复用」；正式 QA 前须在独立 qa 会话重跑三命令。
4. **（P3，QA-MAC-7）** 「可滚动性前置条件」表 Orca 行补注：该面是否溢出随当前工作区变化，本次复测为 18 行、无 `滚动区` 元素 → 该面 0 位移不可单独判定；结论应以 TextEdit 面为准。

**进入正式 QA：否。** 正式 QA 未启用；`deepseek-v4.1-flash` 真机 QA 维持“待验证”。`CUA-MAC-1` 复核后维持 **OPEN**（P0 未闭环）。

## 清理结果

- 已删：本 session 临时工作目录 `/tmp/qa-indep-2026-09-13/`（含自写脚本、对照帧、裁剪图），一次性测试文件 `QA-CUA-CANARY-独立复测.txt` 已删（`ls` 确认 No such file）
- 已退出：TextEdit（`close every window saving no` + `quit`，rc=0；关前仅 1 个窗口＝本 session 所开；关后 `pgrep` 无进程，窗口数 0）——**未保存任何内容**
- 输入残留：Orca `Terminal input` 无值、`查找文件` 无值、`Workspaces` 在 AX 树中（侧边栏可见）、`elementCount` 105；**全程未按 Enter、未输入任何文本**（仅对 TextEdit 使用 `set-value`）
- 未触碰：`/tmp/qa-cua-2026-09-13/`（被检报告证据，只读未删）、Orca 批准设置、macOS 权限、系统设置、secrets、真实数据、发送动作、破坏性确认
- 未开始 Android/iPhone 真机测试；未改任何手机相关规则

## git status

```
 M AGENTS.md
 M docs/handoff/HANDOFF.md
 M docs/prompts/编排者提示词.md
 M docs/qa/BUGS.template.md
 M docs/roles/qa.md
 M 新项目模板包.zip / 新项目模板包/{AGENTS.md,docs/qa/BUGS.template.md,docs/roles/qa.md,编排者提示词.md}
 M 老项目迁移模板包.zip / 老项目迁移模板包/{AGENTS.md,docs/qa/BUGS.template.md,docs/roles/qa.md,编排者提示词.md}
?? docs/qa/BUGS-2026-09-13-预检门禁.md
?? docs/review/CODE_REVIEW-2026-09-13-预检门禁.md
?? docs/review/GOVERNANCE_REVIEW-2026-09-13-现行.md
?? docs/qa/BUGS-2026-09-13-Mac真机QA通道诊断.md
?? docs/review/CODE_REVIEW-2026-09-13-Mac通道诊断.md
?? docs/qa/BUGS-2026-09-13-Mac通道诊断-QA独立复核.md   ← 本报告（本 session 唯一新增）
HEAD = c319b6d
```

以上 M 与既有 `??` 均为**本 session 进入前既有**的 §12/§13 未提交改动，非本 session 产生；本 session 除新建本报告外仓库零改动。

## 声明

- **未 commit、未 push**。
- `USER_MODEL_OVERRIDE.md` **一字未动**；正式 QA 路由仍为 `deepseek-v4.1-flash` via `codebuddy`，未换模型、未用 GO。
- 未把不同模型／Runtime／session 的 PASS 拼成整体 PASS；本 session 未执行点击/输入用例者一律标 `NOT_VERIFIED`，**不沿用**被检报告的 PASS。
- 未修改 Orca 批准、macOS 权限或系统设置；未按 Enter；未开始 Android/iPhone 真机测试。
