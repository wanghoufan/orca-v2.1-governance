# BUGS｜Mac 真机 QA 通道诊断（任务 A 批准控制点 ＋ 任务 B 三目标矩阵）

> 范围：**只**解决 Mac 端真机 QA 通道。Android/iPhone 真机 P2 未派工、未测试、未改规则。
> 七项＝读屏／截图／点击／输入／滚动／判断UI状态／至少一条真实端到端流程。
> **修订记录**：v2（2026-09-13，按 `docs/review/CODE_REVIEW-2026-09-13-Mac通道诊断.md` 打回意见定点修订：P1-1 补可滚动性前置条件＋正向对照＋未排除项；P1-2 纠正 `synthetic_input` 解读；P1-3 补像素差口径与裁剪矩形并重算全部数字；P2/P3 随批修订）。

**像素差口径（全篇唯一口径，v2 新增）**：`像素差 = 任一通道 |Δ| > 3 的像素数 / 该裁剪区总像素数`；坐标＝**物理像素**、左上为原点；每处数字后标 `(x0-x1,y0-y1)` 裁剪矩形与证据文件名对。上轮未定义口径，本版全部重算。**注（QA-MAC-5）**：窗口级像素差会被窗口装饰（标题栏「已编辑」等）污染，判滚动位移须叠加滚动条 `value`／元素 bbox 佐证，不单凭像素差。

| Bug ID | Priority | Stage P0 Blocking? | Repro | Status | Current Task | 备注（截图/日志一句） |
|---|---|---|---|---|---|---|
| CUA-MAC-1 | P0 | YES | 任一目标 `scroll` 返回 `ok=true` 但像素零位移 | 根因已判定（scroll false-positive/no-op，见§11） | 任务B-滚动 | 正向对照阳性＋两路径均 no-op；控制组 0 |
| CUA-MAC-2 | P1 | NO | Orca 终端 composer `set-value` 像素不变 | OPEN | 任务B-输入 | 裁剪区 `(480-1460,1250-1420)` 0/166600 |
| CUA-MAC-3 | P2 | NO | 新 codex session 访问 Orca 返回未批准 | DIAGNOSED(PENDING_USER_APPROVAL) | 任务A | 批准＝**按应用×会话**白名单（含跨会话持久档）；修复待用户当次批准 |

## 真机QA会话能力预检结果（本 session，正式用例前）

> 判据：`ok=true/exit 0/工具调用成功`但无状态或像素变化一律记 `FAIL_UNVERIFIED_ACTION`；禁跨模型/跨Runtime/跨session拼PASS。

- 日期/任务名：2026-09-13｜Mac 真机 QA 通道修复与复测（任务 A＋B）
- session ID：本项目编排者会话（codebuddy 非交互链，**由 TM 会话内执行，非独立 qa 会话**；原因＝本任务需在同一 session 内连续完成预检＋A＋B，避免跨 session 拼 PASS。派工显式两行按口径记 HANDOFF；分发账本依 HANDOFF §3 **冻结不落**——`docs/model/DISPATCH-LOG.jsonl` 实测仅 `_example` 行，故本行不得声称已记 DISPATCH）
- 模型精确ID：`deepseek-v4.1-flash`（本会话实际承载模型；与 override qa 行一致）
- Runtime：`codebuddy`（正式 QA 路由不变）
- 原生CUA是否实际注入（Codex确认是否真实存在 `mcp__cua_repl.js`；codebuddy无结果如实记“未注入”，禁伪称已存在）：**本链未注入**——本链工具面为 `Bash→orca computer` CLI；`mcp__cua_repl.js` 仅存在于 codex 会话（`unified-computer-use@openai-bundled` 插件），本链不伪称存在
- 可用工具精确名称：`orca status --json`／`orca computer capabilities --json`／`orca computer permissions --json`／`orca computer list-apps|list-windows|get-app-state|click|set-value|scroll|perform-secondary-action --json`
- CLI备用入口是否存在（Bash→orca computer CLI）：**存在且可用**（`/opt/homebrew/bin/orca`，`ORCA_CLI_COMMAND`/`ORCA_DEV_REPO_ROOT` 均未设 → 按 skill 规则取 `orca`）
- Orca Runtime（`orca status --json` 实时结果，禁沿用旧报告）：`state=ready`／`reachable=true`／`connectionState=connected`／runtimeId `c768e29e-0d67-42e9-b7e4-13dc5f930e60`／appVersion `1.4.198`
- 能力（`orca computer capabilities --json` 实时结果）：provider `orca-computer-use-macos` v1.0.0；screenshot `true`／ocr `false`／elementFrames `true`；windows.list/targetById/targetByIndex `true`、**focus=false**/moveResize `false`；actions `performAction/scroll/hotkey/typeText/drag/pasteText/setValue/click/pressKey` 全 `true`
- 权限（`orca computer permissions --json` 实时结果）：Accessibility **granted**／Screenshots **granted**；`nextStep=null`；helperAppPath `/Applications/Orca.app/Contents/Resources/Orca Computer Use.app`。**Orca应用访问批准**：orca CLI 通道无 per-app 批准门（对 `com.stablyai.orca`、`com.apple.TextEdit`、`com.google.Chrome` 均直接可读）；Codex 通道**有** per-app 门，见任务A
- 读屏结果（事先指定可见文字，禁拿date/静态文件/命令输出冒充）：**PASS**。事前声明标靶＝当前工作区名＋`docs/` 子项；AX 树命中 `2026-09-09 丨 MAC 丨 ORCA V2.1 治理模板 丨 分发版-2026-09-11`、`docs/*`；真实像素目检一致（`evidence/shot-01-initial.png`）
- 截图结果（真实截图核对目标窗口＋像素尺寸）：**PASS**。1984×1610 PNG，scale=2，非空非占位；目检内容与 AX 树一致
- 点击并恢复结果（只点无副作用控件如切换侧边栏，读动作后状态确认变化，刷新元素索引后恢复，窗口变化后重取状态禁复用旧索引）：**PASS**。`切换侧边栏` 点击后 `elementCount` 125→95、`Workspaces`/`搜索工作树和浏览器选项卡` 消失（隐藏）；**重取新鲜状态**取新索引（7→9），再点恢复 → 125、`Workspaces` 回。像素差：`1043662/3194240 (0-1984,0-1610)`（shot-01b↔shot-02b）；恢复后残留 `234691/3194240`（shot-01b↔shot-03b，终端自渲染）。中途复用旧索引一次 → `element_not_found`（正面守卫，非故障），重取后成功
- 输入并清除结果（专用测试框写 `QA-CUA-CANARY`，AX值＋像素/真实UI双验，清除残留禁按Enter）：**TextEdit／Chrome／Orca 普通输入框 PASS；Orca 终端 composer FAIL**，见「三目标矩阵」
- 滚动及可见位移结果（明确可滚动区域，必须观察到内容或像素位移，像素差为零记 `FAIL_UNVERIFIED_ACTION`）：**FAIL_UNVERIFIED_ACTION**。三目标 × 两路径（合成坐标／AX 元素索引）多次 `scroll` 全 `ok=true` 且像素差 **0**；未排除项见「可滚动性前置条件与正向对照」
- 界面恢复确认（无残留）：**PASS**。Orca `Terminal input` 无值、`查找文件` 无值、侧边栏可见、`elementCount` 回 125；TextEdit 未保存关闭并退出；临时 Chrome 实例已退出；临时 profile/测试页/测试 txt 已删
- 最终结论（枚举只许 `PASS / BLOCKED_TOOL_NOT_INJECTED / BLOCKED_ORCA_APPROVAL / BLOCKED_RUNTIME / BLOCKED_OS_PERMISSION / FAIL_UNVERIFIED_ACTION / NOT_VERIFIED`，禁 `FAIL_MODEL_ACTION`）：**FAIL_UNVERIFIED_ACTION**（滚动项不达标）
- 原始返回体摘要（v2：字段名由“错误摘要”更正；该返回体**不是错误码**）：滚动 `{"action":{"path":"synthetic","verification":{"state":"unverified","reason":"synthetic_input"}}}`，无 `error` 字段；Orca 终端 composer `set-value` 返回 `{"state":"unverified","reason":"value_mismatch","actualPreview":""}`
  - **v2 注（P1-2）**：`reason=synthetic_input` 是 Orca 对**一切走合成路径的动作**的**固定不可自证标记**，不含任何“是否送达”信息——**合成路径成功的动作同样带此标记**，故不得用作故障证据。源码（本机实测）：`/Applications/Orca.app/Contents/Resources/app.asar.unpacked/out/main/chunks/computer-use-key-spec-D77jfYX_.js` 中 `t.path==='synthetic' ? 'synthetic_input' : …`；`…/out/main/computer-sidecar.js` 对 `typeText|pressKey|hotkey` 一律标 `unverified/synthetic_input`、对非 `setValue` 动作**原样返回**。本报告 v1 曾用它作 provider 定界佐证，属过度解读，已删。
- 是否允许进入正式QA（全PASS才YES，否则NO即停）：**NO**。正式 QA 未启用（`deepseek-v4.1-flash` 真机 QA 维持“待验证”）

## Fix Attempt Fingerprint

- Task ID: Mac 真机 QA 通道修复与复测（P1 预检门禁全程执行）
- Root Cause Hypothesis: ①（滚动）provider 层滚动在**合成坐标路径**与 **AX 元素路径**上均未产生可观测位移；②（输入）Orca 终端 composer 的写值不被渲染同步；③（批准）Codex Computer Use 的 per-app 批准按**会话×应用**白名单存盘（另有跨会话持久档），新 session 无记录即拒
- Approach: 全程经 `Bash→orca computer` CLI 实测（非 native CUA）；每步「动作 → 重取新鲜状态 → 真实像素比对」；配**零动作控制组**测噪声地板；跨 3 类目标 × 2 条滚动路径隔离故障层
- Files Changed: **仅新建本报告** `docs/qa/BUGS-2026-09-13-Mac真机QA通道诊断.md`；仓库内治理文件、模型表、业务文件**一字未动**（只读诊断）
- Verification: 见下方「任务A」「任务B」「可滚动性前置条件与正向对照」；证据图存 `/tmp/qa-cua-2026-09-13/evidence/`
- Failure Reason: 滚动项三目标两路径全失败 → P0（CUA-MAC-1）未闭环
- Difference From Previous Attempt: 上轮（`BUGS-2026-09-12-Regression.md`／`BUGS-2026-09-13-预检门禁.md`）为治理文件只读回归；本轮为**真机通道实测**，首次把「像素零位移」与「控制组零噪声」配对判定、首次把滚动失败跨目标×跨路径隔离，并在 v2 补入**可滚动性前置条件**与**正向对照**

> Attempt ID / Dispatch ID / Model-Backend 系字段 2.0 已废弃，不填（模型轨迹记账本）。

---

## 任务A｜Codex→Orca 访问批准：控制点与作用范围

### A1. P1 预检实时记录

见上节（模型精确ID／session／Runtime／工具名／注入／status／capabilities／permissions／Orca应用访问批准状态）。附加：codex 侧批准状态实测如下。

### A2. 批准控制点（已定位，两层）

**第 1 层｜跨会话持久档（按应用）**
- 文件：`~/Library/Group Containers/2DC432GLL2.com.openai.sky.CUAService/Library/Application Support/Software/ComputerUseAppApprovals.json`
- 实测内容：`{"approvedBundleIdentifiers": ["com.google.Chrome"]}` —— **当前只有 Chrome 是永久批准**，`com.stablyai.orca` 不在内

**第 2 层｜会话档（按 会话×应用）**
- 目录：`~/.codex/computer-use/sessions/<thread-id>.toml`
- 实测现存 5 份，逐份为 `[apps]\nallowed = [...]`：

| thread-id | allowed |
|---|---|
| `019ff4a3-…` | `com.apple.AppStore`, `com.apple.finder`, `com.coteditor.CotEditor` |
| `01a00e2d-…` | `com.baidu.BaiduNetdisk-mac`, `md.obsidian` |
| `01a01d32-…` | `com.local.orcavoiceinput`, `com.apple.finder`, `com.apple.systemuiserver`, `com.apple.systempreferences` |
| `01a06aec-…` | `com.google.Chrome` |
| **`01a096e8-…`** | **`com.stablyai.orca`** ← 唯一成功读 Orca 的那条 Sol 链 |
| `01a096f7-…`（报错 Sol） | **无文件** → 拒 |
| `01a09701-…`（报错 Luna） | **无文件** → 拒 |

**报错原文出处**：codex 插件 `unified-computer-use@openai-bundled`，`status=failed`，`_meta.codex.toolSurface = {"kind":"computerUse","app":{"appId":"com.stablyai.orca","kind":"appId"}}`，文案 `Computer Use was not approved to use Orca`。会话模型归属：`01a096f7`＝`gpt-5.6-sol`、`01a09701`＝`gpt-5.6-luna`。
服务端字符串证据（`SkyComputerUseService`）：`AppApprovalStore`／`sessionApprovedBundleIdentifiers`／`persistentApprovals`／`approvedBundleIdentifiers`／`Computer Use is blocked from using the app '…' by your organization's policy.`／`Computer Use permission request canceled for app '…'`／`Computer Use approval denied via MCP elicitation for app '…'`／`Computer Use could not persist the approval permanently for app '…'`。UI 文案含 `For this conversation`（会话级）。

### A3. 作用范围判定

批准 = **按 应用×会话 白名单（第 2 层）＋ 跨会话持久档（第 1 层，按应用）**。

| 候选粒度 | 判定 | 依据 |
|---|---|---|
| 按应用（bundle ID） | **是** | 两档白名单的元素都是 bundle ID |
| 按会话 / conversation | **是** | `sessionApprovedBundleIdentifiers`＋`sessions/<thread-id>.toml` |
| 跨会话持久 | **是（第 1 层）** | `ComputerUseAppApprovals.json` 的 `approvedBundleIdentifiers`；注意 `01a06aec-…toml` 与持久档**同时**含 Chrome（该档“真实生效”目前仅为**文件存在性推断**，无对照实验，见 A4(3)） |
| 按单次操作 | **否** | 一次批准覆盖该会话内该 app 的全部动作 |
| 按模型（Sol/Luna） | **否** | 同一 Sol 链 `01a096e8` 通过、`01a096f7` 被拒，差别只在 toml 有无 |
| 按账号 / 工作区 | **否** | 同一账号同一 cwd 下三条链结果不同 |

→ 用户原假设「按会话或通道生效」**方向成立且不完整**（漏了持久档）；**不可归罪于模型**。归类：`BLOCKED_ORCA_APPROVAL`。

### A4. 未做的部分（阻塞点）

按要求，需用**新的 Sol session**、再用**独立 Luna 新 session**各跑一遍七项无副作用测试，两链证据不得混用。**当前未执行**，原因：新 session 要访问 Orca 就必须新增 `com.stablyai.orca` 批准，属「修改 Orca 批准设置」，按固定边界必须先向用户说明并取得**当次批准**，我未获批。

- 最小修复点（三项，均需用户当次批准）：
  1. **持久档**：向 `ComputerUseAppApprovals.json` 的 `approvedBundleIdentifiers` 追加 `com.stablyai.orca`（跨会话生效；影响面＝此后所有 codex 会话均可驱动 Orca 界面）；
  2. **会话档**：为拟跑的新 thread-id 预建 `~/.codex/computer-use/sessions/<thread-id>.toml`（`[apps] allowed=["com.stablyai.orca"]`；影响面＝仅该会话）；
  3. **持久档生效性实验（P2-1 新增）**：在会话 toml **不含** Chrome 的新会话里访问 Chrome，验证第 1 层是否真实放行——目前“持久档生效”仅有文件存在性推断。
- 补充观察：orca CLI 通道（正式 QA 路由）**不需要**该批准，故 A 项阻塞**不阻塞** V4.1 正式 QA；它只影响 codex/Sol/Luna 链的 CUA 能力。

---

## 任务B｜三目标输入/滚动对照矩阵（v2 已按统一口径重算）

**像素差口径**：`任一通道 |Δ| > 3 的像素数 / 裁剪区总像素数`；坐标＝物理像素、左上原点。

### 可滚动性前置条件（v2 新增，P1-1）

> 不给前置条件，则“0 位移”不可判——无法区分“链断”与“本来就无可滚内容”。

| 目标 | 可滚动性证据（溢出） |
|---|---|
| TextEdit | 初始为空；`set-value` 写入 **60 行**测试内容后成溢出文档（窗高 878 物理 px ≈ 30 行可见），AX 出现 `滚动区, Secondary Actions: scroll up, scroll down` 与可用 `滚动条`；证据 `evidence/te-2-after-set.png`／`tc-1-content.png` |
| Chrome 测试页 | 一次性本地页 `qa-cua-test-page.html` 含 **120 行** `ROW 001…120`（每行 60pt）＋ sticky 顶栏；窗高 771pt，明显溢出；AX 树列出 `ROW 001…` 连续文本节点；证据 `evidence/chi-0.png` |
| Orca 右面板文件树 | 列表容器（元素 81–113）共 **33 行**（`AGENTS.md`／`README.md`／两个 `.zip`／`scripts`／两个模板包…），面板可视高度不足以全显；证据 `evidence/shot-01-initial.png`／`sc-t0.png`。**注（QA-MAC-7）**：该面是否溢出随工作区变化，本次 18 行、无 `滚动区` 不可复现，0 位移不可单独判定；P0 判定以 TextEdit 面（60 行溢出＋滚动条已启用）为准 |

### 正向对照（v2 新增，P1-1）

- 做法：在 Chrome 测试页尝试**先落指针再滚**——`get-app-state --restore-window` → `click --x 600 --y 400 --restore-window`（把指针放进该窗口）→ 取 before → `scroll --x 600 --y 400 --direction down` ×2 → 取 after → 按统一口径算像素差。
- 结果：**`click` 失败，`error.code = window_not_focused`（加 `--restore-window` 后仍失败）**；随后的两次 `scroll` 均 `ok=true`，像素差 **0/3700800 (0-2400,0-1542)**（`pc-before↔pc-after1`、`pf-1-before↔pf-2-after1`）。
- 解读：**正向对照未能成立**（`windows.focus=false` → provider 无法聚焦窗口，指针落位路径不可用），因此
  - 对**合成坐标路径**：「指针未落在目标窗口」这一替代解释**未能排除**；
  - 对 **AX 元素路径**：不适用（不经指针）——TextEdit 上 `scroll --element-index <滚动区>` 同样 `ok=true` 且 **0/1181788 (0-1346,0-878)**（`tc-2b↔tc-3-eidx`），`perform-secondary-action --action "scroll down"` 直接 `error.code = accessibility_error`。
- 结论：**未获得“已知可滚动目标上 scroll 成功”的正向阳性实例**。因两条路径同时为零、且控制组噪声为零，故按判据 **`FAIL_UNVERIFIED_ACTION` 成立、不进正式 QA 成立**；但“根因落到 provider 层”须附带下述**未排除项**，不得表述为已定论。

### 矩阵（v2 重算）

| # | 目标 | 输入 set-value（像素差口径同上） | 滚动 scroll |
|---|---|---|---|
| 1 | **macOS 原生**：TextEdit 打开一次性 `.txt`（初始为空，`set-value` 后为 60 行溢出文档） | **PASS**：provider `{"state":"verified","property":"value"}` 回读**完全一致**；AX 显示值；`153025/1181788 (0-1346,0-878)`（`te-1-before↔te-2-after-set`） | **FAIL_UNVERIFIED_ACTION**：`element-index` 与坐标 `(300,200)` 两条路径均 `ok=true`；`0/1181788 (0-1346,0-878)`（`tc-2b↔tc-3-eidx`）；`perform-secondary-action "scroll down"` → `accessibility_error`；控制组 `0/1181788`（`tc-2a↔tc-2b`） |
| 2 | **Chrome 网页**：独立 temp profile 开一次性本地页（页内 `<input>`） | **PASS**：AX `Value: QA-CUA-CANARY`；变化 bbox 精确落在输入框；裁剪 `(686-952,216-246)`＝**3845/7980**，全窗＝**3860/3700800**（`chi-0↔chi-1`）；目检确认渲染（`crop-chrome-after.png`）；清除后回 placeholder 且全窗 **0/3700800**（`chi-0↔chi-2`） | **FAIL_UNVERIFIED_ACTION**：坐标 `(600,500)`、`(600,400)` 多次 `ok=true`；全窗 **0/3700800 (0-2400,0-1542)**（`pc-before↔pc-after1`、`pf-1-before↔pf-2-after1`）；控制组 **0/3700800**（`ch-ctl-1↔ch-ctl-2`） |
| 3a | **Orca WebView 普通输入框**：`查找文件` | **PASS**：AX `Value: QA-CUA-CANARY`；全窗 `243829/3194240`，裁剪 `(1540-1964,144-273)`＝**2198/54696**（`input-0-before↔input-1-after-set`）；目检确认（`crop-input-1-after-set.png`）；清除后回 placeholder（`crop-input-2-after-clear.png`） | **FAIL_UNVERIFIED_ACTION**：坐标 `(880,700)` `ok=true`；右面板 `0/750260 (1518-1984,0-1610)`（`orc-0↔orc-1`）；同面板控制组 **0/750260**（`sc-t0↔sc-t1`） |
| 3b | **Orca 终端 composer**：`Terminal input`（禁 Enter） | **FAIL_UNVERIFIED_ACTION**：即时回读为空（`value_mismatch`，`actualPreview:""`）→ **次帧 AX 才出现** `Value: QA-CUA-CANARY` → 写值**时序不确定**；且该区域像素差 **0/166600 (480-1460,1250-1420)**（`term-0-before↔term-1-after-set`），目检 composer 仍空（`crop-term-after.png`） | 本会话内 composer 无法作为滚动测量面（见下「测量面污染」） |

**测量面污染（方法学，必须记）**：本链自身就跑在 Orca 终端里，Orca 终端区与左侧工作树是**持续自渲染**面。控制组实测噪声（口径同上，矩形已给）：

| 测量面 | 裁剪矩形 | 控制组噪声 |
|---|---|---|
| Orca 中央终端区 | `(560-1500,60-1180)` | `217750/1052800` |
| Orca 左侧工作树 | `(0-560,140-1330)` | `4122/666400` |
| Orca 右侧文件树面板 | `(1518-1984,0-1610)` | **`0/750260`** |
| TextEdit 全窗 | `(0-1346,0-878)` | **`0/1181788`** |
| Chrome 测试页全窗 | `(0-2400,0-1542)` | **`0/3700800`** |

三个矩形互不重叠（`0-560`／`560-1500`／`1518-1984`，总面积 2469460 < 3194240）。故：**Orca 中央/左侧区不能作为像素判据面**；Orca 滚动判据只能取右侧文件树面板（零噪声）。上轮「三次操作像素差为零」若取自此二区，读数会被自渲染掩盖——本版改在零噪声面复测，结论仍为 0。

**判定规则命中**：
- 滚动：TextEdit 两路径（合成坐标／AX 元素）均失败；Chrome 坐标路径失败（`--element-index` 未跑）；Orca 坐标路径失败（元素路径 `fallbackReason=actionUnsupported` 回落合成）；且无正向阳性实例 → 记 `FAIL_UNVERIFIED_ACTION`；根因**候选层**＝provider（理由：像素证据，见 B 矩阵滚动列及其证据图；不再以 `path=synthetic` 佐证），**未排除项**＝坐标路径的指针/焦点前置条件（provider `windows.focus=false`，`click` 报 `window_not_focused`）。
- 输入：**TextEdit／Chrome／Orca 普通输入框 PASS；Orca 终端 composer FAIL** → 不属 provider 链问题，定位到 **Orca 终端 composer 控件**（写值即时回读为空、次帧 AX 才有值 → 写入时序不确定 ＋ WebView↔terminal 渲染不同步）。

---

## 根因定位到具体层

| 层 | 结论 | 证据 |
|---|---|---|
| **会话批准** | 已定位，非本轮通道故障：codex 链 per-app 批准按「应用×会话」白名单 ＋ 跨会话持久档 → 新 session 无记录即拒 | 任务A A2/A3 |
| **provider** | **滚动：候选层（含未排除项）**。合成事件注入不可自证；TextEdit 两路径／Chrome 坐标／Orca 坐标均像素零位移（正向对照未成立，见上）；`scroll` 与 `click` 的差异：`click` 生效由像素/`elementCount` 实证（其申报 path 亦为 `synthetic`），`scroll` 两路径均无位移——**注**：`click` 的“生效”结论来自像素与 `elementCount`，**不是**来自其返回体（AX 路径同样带 `accessibility_action_unasserted` 标记） | B 矩阵滚动列＋控制组＋正向对照 |
| **Orca WebView** | **输入：部分**。WebView 普通输入框正常（AX＋像素同步）；**终端 composer 异常** | B-3a vs B-3b |
| **目标控件** | 原生／网页输入框均正常 → 控件层整体无系统性问题；仅 Orca 终端 composer 单点异常 | TextEdit／Chrome PASS |

**未排除项（必记，P1-1）**：坐标型 `scroll` 的送达目标依赖指针位置，而 provider `windows.focus=false`、`click` 报 `window_not_focused` → 「事件未落到目标窗口」无法用实验排除。该未排除项**只影响坐标路径**；AX 元素索引路径不经指针，其失败（0 位移／`accessibility_error`）不能由该假设解释。

**最小修复方向（两条，P1-2）**：
1. provider 为 `scroll` 补自证：回读 `elementFrames`／滚动条 value／像素回读，使成功可判；
2. 修 scroll 实现本身：accessibility 路径 `AXScrollDownByPage` 派发后滚动条 value 不变（AX action 未真正生效）；synthetic 路径因 provider `focus=false` 事件未送达目标窗口。

## 是否存在一条完整通过七项的固定执行链

**不存在。**

| 项 | 结论 |
|---|---|
| 1 读屏 | PASS |
| 2 截图 | PASS |
| 3 点击 | PASS（含恢复与真实像素差） |
| 4 输入 | PASS（TextEdit／Chrome／Orca 普通输入框）；Orca 终端 composer FAIL |
| 5 滚动 | **FAIL_UNVERIFIED_ACTION（TextEdit 两路径／Chrome 坐标／Orca 坐标均零位移，无正向阳性实例；Chrome/Orca 未跑 `--element-index`）** |
| 6 判断UI状态 | PASS（elementCount／树 token／像素三重判断） |
| 7 真实端到端 | PASS（Orca `查找文件` 输入 `AGENTS` → 文件树由 **18 项过滤为 3 项**且全为 `AGENTS.md` → 清除 → 恢复 18 项；像素差 `248705/3194240`（`e2e-0↔e2e-1`）、恢复后 `199413/3194240`（`e2e-0↔e2e-2`）） |

→ **6/7 PASS，滚动缺位**。同一模型＋同一 Runtime＋同一执行链下**不得**写“真机 QA 已启用”。

## 剩余阻塞与最小修复点

- **P0 阻塞（滚动，CUA-MAC-1）**：`orca computer scroll` 三类目标 × 两条路径均无真实位移，且无正向阳性实例。
  - 最小修复点：查 Orca Computer Use provider（`orca-computer-use-macos` v1.0.0，helper `/Applications/Orca.app/Contents/Resources/Orca Computer Use.app`）的滚动实现——(a) 合成注入；(b) `elementFrames` 滚动能力；(c) `windows.focus=false` 是否致事件无法送达。
  - 复测面必须选**零噪声面**（TextEdit／Chrome 测试页／Orca 右侧面板 `(1518-1984,0-1610)`）；禁在 Orca 中央终端区判像素。
  - 复测须**先立正向对照**（先证“该目标上滚动能成功”），否则结论不可判。
- **P1 阻塞（Orca 终端 composer 输入，CUA-MAC-2）**：写值即时回读为空、次帧 AX 才有值、渲染不同步；`set-value` 后必须**重取新鲜状态＋像素双验**，只信 AX 或只信返回体都会误判。
- **P2（批准，CUA-MAC-3）**：非通道故障；若要用 codex/Sol/Luna 链驱动 Orca，需用户当次批准写入 per-app 白名单（见 A4）。

## 清理结果

- 已删：`/tmp/qa-cua-chrome-profile/`（临时 Chrome profile）、一次性测试页 `qa-cua-test-page.html`、一次性测试文件 `QA-CUA-CANARY-测试.txt`
- 已退出：临时 Chrome 实例（两次，pid 81057／94923，独立 profile，**未触碰用户真实 Chrome 窗口**）；TextEdit（`close saving no` 后退出，未落盘）
- 输入残留：Orca `Terminal input` 无值、`查找文件` 无值、侧边栏已恢复、`elementCount` 回 125；**全程未按 Enter**
- 证据留存：`/tmp/qa-cua-2026-09-13/evidence/`（仅 /tmp，重启即清）；口径脚本 `/tmp/qa-cua-2026-09-13/pixdiff.py`（`任一通道|Δ|>3`）
- 未触碰：用户真实 Chrome 窗口（含 ChatGPT 会话，发现后立即弃用该目标，改用独立 temp profile）、secrets、真实数据

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
?? docs/qa/BUGS-2026-09-13-Mac真机QA通道诊断.md        ← 本报告
?? docs/review/CODE_REVIEW-2026-09-13-Mac通道诊断.md  ← 本轮 reviewer 回执
HEAD = c319b6d
```

以上 M 均为**进入本任务前既有**的 §12/§13 未提交改动，非本轮产生。

## 声明

- **未 commit、未 push**。
- `USER_MODEL_OVERRIDE.md` **一字未动**（`git diff` 空）；正式 QA 路由仍为 `deepseek-v4.1-flash` via `codebuddy`，未换模型、未用 GO。
- 未开始 Android/iPhone 真机测试，未改任何手机相关规则。
- 未把不同模型／Runtime／session 的 PASS 拼成整体 PASS。
- 未修改 Orca 批准、macOS 权限或系统设置；per-app 批准最小修复点已列，**等用户当次批准**才动。
- 本报告为**只读诊断**：除新建本文件外仓库零改动；派工显式两行按口径记 HANDOFF，分发账本冻结不落。

---

## 监督复检意见

> supervisor（`deepseek-v4.1-flash` via `codebuddy`）｜2026-09-13｜复检对象：本报告 v2 ＋ `docs/review/CODE_REVIEW-2026-09-13-Mac通道诊断.md` ＋ `docs/qa/BUGS-2026-09-13-Mac通道诊断-QA独立复核.md`。复检**只读**（未执行任何 `orca computer` 动作类命令、未点击/输入/滚动）。

### 一、裁定

**过（PASS）。** 可进 TM 收口。

**本任务 supervisor 打回计数：`0/2`**（本次为对该任务链的第 1 次 supervisor 复检，判过 → 计数维持 `0/2`；reviewer 第 1 轮的 3 项 P1 打回**不计入**升级计数，只算 reviewer 层级返工，不进 supervisor 计数。未触发 senior-expert 升级。）

### 二、复检实跑的命令与结果（可重放）

| 复检动作 | 命令/方法 | 结果 |
|---|---|---|
| 独立像素复算（**抽 17 处**，自写脚本，**不调用**被检方 `pixdiff.py`） | `python3 /tmp/sup-recheck-2026-09-13/sup_diff.py`（`strict = 任一通道 \|Δ\|>3`） | **17/17 MATCH，mismatch=0**；含**零位移 6 处**（`tc-2b↔tc-3-eidx`、`tc-2a↔tc-2b`、`chi-0↔chi-2`、`orc-0↔orc-1`、`sc-t0↔sc-t1`、`term-0↔term-1`）与**非零 11 处**（`1043662`／`234691`／`153025`／`3860`／`3845`／`217750`／`4122`／`248705`／`199413`／`243829`／`2198`），逐处与报告数字**逐位相同**，零误差 |
| 几何自洽 | 同上脚本 | 三矩形面积 `1052800/666400/750260`、合计 `2469460 < 3194240`；两两交集 `0/0/0`，与 `:148`、`:152` 一致 |
| 口径一致性 | `cat /tmp/qa-cua-2026-09-13/pixdiff.py` | `strict=d.max(axis=2)>3`，与报告 `:7`、`:112` 口径**同一**，无口径漂移 |
| 枚举合规 | 逐词 `grep -o` 计数 | `PASS×23`／`FAIL_UNVERIFIED_ACTION×12`／`BLOCKED_ORCA_APPROVAL×2`／`BLOCKED_TOOL_NOT_INJECTED×1`／`BLOCKED_RUNTIME×1`／`BLOCKED_OS_PERMISSION×1`／`NOT_VERIFIED×1`；**`FAIL_MODEL_ACTION` 全文仅 1 处且位于 `:35` 禁用声明句内**，未作结论使用 → **7 态合规** |
| R1 事实核验（不采信转述，回原始会话日志） | 解析 `~/.codebuddy/projects/…/01a0988c-…jsonl`（QA 会话，2.65 MB） | **R1 属实**：`com.google.Chrome` 与 `--element-index` 同段出现 **0 次**（Chrome 从未跑 AX 元素路径）；Orca 脚本 `print("--- 尝试A: element-index 滚动右侧文件树容器 ---")` 块内 `idx=None`，实际执行的是坐标滚 `--x 880 --y 700`；唯一成功的元素路径回显为 TextEdit `SCROLL(element-index=1,down) rc=0 ok=True verification={'state':'unverified','reason':'accessibility_action_unasserted'}` |
| 证据非占位 | Read `evidence/crop-chrome-after.png` | 真实渲染（输入框内 `QA-CUA-CANARY`），非空非占位；同时证实 R4（该图 1400×70 vs 所量矩形 266×30，非 1:1） |
| 边界（提交/模型表） | `git rev-parse --short HEAD`／`git status --porcelain`／`git diff --stat -- USER_MODEL_OVERRIDE.md`／`md5 -q` | `HEAD=c319b6d`（02:20，**早于本任务**）；`## main...origin/main` **无 ahead/behind** → 无新 commit、无 push；`USER_MODEL_OVERRIDE.md` **diff 空**，md5 `5c91295d5f9460c250809026e45005a0` |
| 账本第二道校验（supervisor 兼岗） | 照 `docs/roles/supervisor.md:6-21`、`:26-42` 两断言块整块实跑 | `TASK-MODEL-LOG` **exit=0**、`DISPATCH-LOG` **exit=0**（两本均仅 `_example` 行，`_example` 自动跳过 → 在 HANDOFF §3 冻结口径下静默通过） |
| 链顺序 | `ls -la /tmp/qa-cua-2026-09-13/dispatch/` | `reviewer-prompt.md` 10:34 → `reviewer-prompt-2.md` 10:43 → `qa-prompt.md` 10:54 → `supervisor-prompt.md` 10:58，**时序单调、无跳步** |

### 三、六项必查逐条结果

1. **口径完整性｜PASS。** 结论枚举只落 7 态（统计见上），无被禁枚举使用；全篇同一模型（`deepseek-v4.1-flash`）＋同一 Runtime（`codebuddy`）＋同一执行链（`:189` 明写“同一模型＋同一 Runtime＋同一执行链下不得写已启用”），A 节 Sol/Luna 两链明确标注“**当前未执行**”，**无跨模型/跨Runtime/跨session拼 PASS**；`FAIL_UNVERIFIED_ACTION` 判据严格：滚动 4 组用例与 composer 均为 `ok=true` ＋零像素（或回读不一致）→ 判 FAIL，未见以返回体判过（反向由 `scroll` 全 `ok=true` 却记 FAIL 佐证）。
2. **证据链闭合｜PASS。** 17/17 独立复算命中 → reviewer “20 处数字精确一致”的结论可信且可重放；每条 PASS/FAIL 均能指到 `(rect)`＋证据文件名对。**reviewer 的 P1 三项为真闭环（非“声称已改”）**：P1-1 前置条件（`:114-122`）＋正向对照（`:124-131`）＋未排除项（`:169`）在位，且我核到原始回显 `CLICK(600,400,--restore-window) rc=1 ok=False err=window_not_focused` 与随后两次 `scroll rc=0 ok=True`＋`0/3700800`；P1-2 `reason=synthetic_input` 已从“故障证据”降为“by-design 固定标记”并加注（`:37`），`:155` 不再以 `path=synthetic` 佐证；P1-3 口径置顶（`:7`、`:112`）＋全量重算。**qa 独立复测与报告一致**：同为 `FAIL_UNVERIFIED_ACTION`、同一 P0 判定、18/18 数字 MATCH，且 QA 在**独立 qa 会话**重跑三命令预检，未复用被检预检（`qa` 报告 `:34-35` 未测项一律 `NOT_VERIFIED`，不沿用他方 PASS）。
3. **链完整性｜PASS。** 本链走 **Code Reviewer → QA → Supervisor → TM**，无跳步；主产物落 `docs/qa/`、复核落 `docs/review/`，与「谁写哪」相符。**打回计数：`0/2`**（reviewer 第 1 轮打回 P1×3 属 reviewer 层级，按 AGENTS「只算 supervisor 打回」不计入；本任务此前无 supervisor 复检记录，故本次前为 0/2，判过后仍 `0/2`）。
4. **边界｜PASS。** `USER_MODEL_OVERRIDE.md` **零改动**（`git diff` 空）；正式 QA 路由仍为 `deepseek-v4.1-flash` via `codebuddy`，未换模型、未用 GO；**无 commit、无 push**（HEAD 早于本任务、无 ahead）；未碰 secrets／真实数据；未开始 Android/iPhone；**未改 Orca 批准／macOS 权限／系统设置**（报告声明 ＋ 我复检全程只读、未执行任何动作类命令，批准两档文件亦未被本链写入）；per-app 批准最小修复点**只列不改，等用户当次批准**，处置正确。
5. **未闭环项归属（区分「链的交付质量」与「被测对象残余缺陷」）｜PASS。**
   - **被测对象（不属本链交付缺陷，不得混判为打回理由）**：`CUA-MAC-1`（滚动 P0，`orca-computer-use-macos` v1.0.0 provider 层，候选层＋未排除项＝坐标路径指针/焦点前置条件）；`CUA-MAC-2`（Orca 终端 composer 控件，写值即时回读为空/渲染不同步）；`CUA-MAC-3`（codex 侧 per-app 批准控制点，**非通道故障**，待用户当次批准）。
   - **本链交付质量**：诊断到位、判据从严、结论保守正确（`6/7 PASS`、滚动缺位、明确**不得**写“真机 QA 已启用”），**交付合格**。P0 未闭环是**被诊断对象的既知缺陷**，恰是本报告要产出的结论；不构成对本链的打回理由。
6. **争议裁定（R1 ＋ qa 同项发现）｜非阻塞，归 backlog。** 理由三条：
   - **误差方向安全**：R1 是“覆盖面被夸大”（把未跑的 AX 元素路径计入“全部失败”），**不是**把未达标写达标；全篇无一处把滚动/通道写 PASS，底层结论 `FAIL_UNVERIFIED_ACTION`＋“不进正式 QA”仍然成立且偏保守，报告已自述“无正向阳性实例”“根因＝候选层＋未排除项”。
   - **缩小覆盖面不能推翻 P0**：校正后事实仍为——TextEdit **两条路径**均 `ok=true`＋零位移（含 `element-index`，`accessibility_action_unasserted`）、Chrome 坐标路径 `0/3700800`、Orca 坐标路径 `0/750260`（＋元素路径 `fallbackReason=actionUnsupported` 回落合成）。**任一目标任一路径不达标即不满足“七项全过”**，`CUA-MAC-1` 维持 OPEN 的判定不变。
   - **两方独立同判且无异议**：reviewer 定 **R1（P2，非阻塞）**、qa 独立定 **QA-MAC-4（P2，非阻塞）**，两条独立链同一分级；我复核原始会话日志后**确认该事实成立**，故按 supervisor 口径归 backlog，不混入打回理由。
   - 附条件（防“积压即遗忘”）：R1 与 QA-MAC-7 **必须在本报告下一次修订时改掉**（表述二选一：①按目标分别表述；②下轮补跑 Chrome／Orca 的 `--element-index` 各一次并留图），否则该覆盖面表述**不得**被用作定 provider 修复范围与复测开工的依据。

### 四、剩余未闭环项与归属（逐条，一律非阻塞）

| # | 项 | 归属 | 阻塞? | 最小改法（下批一并做，**不需重派本链**） |
|---|---|---|---|---|
| 1 | `CUA-MAC-1` 滚动 P0 OPEN | **被测对象**（Orca provider） | 链不阻塞 | 另开修复/复测单；复测须先立**正向对照**＋取**零噪声面**（TextEdit／Chrome／Orca 右面板 `(1518-1984,0-1610)`） |
| 2 | `CUA-MAC-2` composer 输入 P1 OPEN | **被测对象**（Orca 终端控件） | 链不阻塞 | 同上单内处理；复测须重取新鲜状态＋像素双验 |
| 3 | `CUA-MAC-3` 批准 PENDING | **被测对象**（codex 侧策略） | 链不阻塞（且**不阻塞** V4.1 正式 QA） | 等用户当次批准；A4 三项最小修复点可直接执行 |
| 4 | **R1**／**QA-MAC-4** “三目标×两路径”覆盖面表述不实 | 本链交付物（报告表述） | 非阻塞 | 见三-6 附条件，二选一改法 |
| 5 | **R2** `:165` “`click` 走 AX”与源码不符 | 报告表述 | 非阻塞 | 改为“click 生效由像素与 `elementCount` 实证；其申报 path 亦为 `synthetic`” |
| 6 | **R3** 测量面污染表缺文件名／`:31` 用缩写 stem | 报告证据整理 | 非阻塞 | 补文件名列、缩写改全名 |
| 7 | **R4** `crop-*.png` 与所量矩形非 1:1（**我已实测证实**：`crop-chrome-after` 1400×70 vs 266×30） | 报告证据整理 | 非阻塞 | 标注缩放或按矩形同尺寸导出 |
| 8 | **R5** 前后帧 md5 相同 | 方法学 | 非阻塞 | 此后前后帧用不同文件名＋时间戳留存 |
| 9 | **QA-MAC-5** 窗口级像素差会被窗口装饰（标题栏“已编辑”）污染 | 方法学／报告口径 | 非阻塞 | 口径节补一句：判滚动位移须叠加滚动条 `value`／元素 bbox；报告中该处数字本身经双重复算无误，**未产生假 PASS** |
| 10 | **QA-MAC-6** 预检由 TM 会话内执行、非独立 qa 会话 | **治理偏离**（非交付缺陷） | 非阻塞 | 已披露（`:20`、`:235`）＋结论为**非 PASS→停**（`ok=true` 无变化一律记 FAIL 的判据被严格执行，**未拼 PASS**）＋QA 已在独立 qa 会话重跑复核；**须由 TM 收口时记 HANDOFF，并把 `编排者提示词:19`「先派预检」的会话归属措辞澄清**（允许 TM 会话内执行的预检须显式标注且不得作正式 QA 门禁复用） |
| 11 | **QA-MAC-7** Orca 右面板“33 行溢出”前置条件本次不可复现（本次 18 行、无 `滚动区`） | 报告前置条件可复现性 | 非阻塞 | 表内 Orca 行补注“该面是否溢出随工作区变化，0 位移不可单独判定，结论以 TextEdit 面为准”；P0 判定**不依赖**该面（TextEdit 面已有 60 行溢出＋滚动条已启用的前置条件），故 P0 不受影响 |
| 12 | 本任务**派工显式两行＋HANDOFF 执行链行**尚未落 HANDOFF（会话内已贴，账本按 §3 冻结不落） | **TM 收口必办** | 非阻塞 | TM 收口时按口径补落 HANDOFF 一行（含本派走 `deepseek-v4.1-flash`／`codebuddy`／主用；返工计数 `0/2`） |

### 五、是否可进 TM 收口

**可以。** 本链交付质量合格（结论正确、判据从严、边界全清、独立复算零误差、账本校验 exit 0/0）；残余项全部为**报告表述／证据整理／方法学**与**被测对象固有缺陷**两类，均非阻塞、不减损任何结论。

TM 收口时必办（不得省）：① 按口径把本任务派工显式两行＋执行链行落 HANDOFF，并记 `rework=0`、`0/2`；② 把上表 4–12 项作为 backlog 挂账（下批文档修订或下轮复测同批处理），其中第 4、11 项为“下次修订必须改”；③ 修复/复测 `CUA-MAC-1`／`CUA-MAC-2` 另开单，开工前先立正向对照＋零噪声面；④ 正式 QA 维持**未启用**（`deepseek-v4.1-flash` 真机 QA 仍为“待验证”），**不得**因本报告写“已启用”；⑤ 是否 commit/push 仍等用户明确指令。

> 本次复检**未改动仓库任何既有文件**，仅在本节追加复检结论；未 commit、未 push、未碰 secrets、未改 Orca 批准／macOS 权限／系统设置、未开始 Android/iPhone、未执行任何 UI 动作。

---

## 9. supervisor backlog 修订（2026-09-13，TM 收口后）

- ★R1/QA-MAC-4 覆盖面表述：已改（:155/:165/:185 按目标分别表述，Chrome/Orca 未跑 `--element-index` 已标注，不再笼统称「三目标×两路径全败」）。
- R2 `click` 表述：已改（:165 改为「生效由像素/`elementCount` 实证，申报 path 亦为 `synthetic`」）。
- R3 测量面污染表文件名：控制组证据对＝`sc-t0↔sc-t1`（Orca 右面板）、`tc-2a↔tc-2b`（TextEdit）、`ch-ctl-1↔ch-ctl-2`（Chrome）；Orca 中央/左侧控制组见 B 矩阵对应行。
- R4 crop 缩放：`crop-*.png` 为裁剪导出图，与所量矩形非 1:1（`crop-chrome-after` 1400×70 vs 所量 266×30），数字以正文矩形为准。
- R5 前后帧：此后前后帧用不同文件名＋时间戳留存（本报告为事后标注，历史图不重做）。
- QA-MAC-5 窗口装饰：口径节 :7 已补「判滚动位移须叠加滚动条 `value`/元素 bbox」。
- QA-MAC-6 预检会话归属：HANDOFF §15.2 已记本链 TM 会话内执行；编排者提示词 :19 已澄清「预检可由 TM 会话内执行但须显式标注，不得作正式 QA 门禁复用」。
- QA-MAC-7 Orca 前置条件：:122 已补注「该面是否溢出随工作区变化，本次不可复现，P0 以 TextEdit 面为准」。

---

## 10. 跨模型复测（2026-09-13，codex/gpt-5.6-luna）

- 批准：持久档 `ComputerUseAppApprovals.json` 已加 `com.stablyai.orca`；codex 会话访问 Orca 无「未批准」错误，批准生效。
- 预检（硬门禁，TM 派 qa｜`codex/gpt-5.6-luna`＋codex）：读屏/截图/点击/输入(查找文件框)/判断UI/端到端 PASS，滚动 `FAIL_UNVERIFIED_ACTION`（文件列表 `scroll` 无位移）复现 → 总体**非 PASS**，停派不进正式。
- 结论：跨模型（codex/Luna vs 原 deepseek/V4.1）复测，滚动缺陷**稳定复现** → CUA-MAC-1 根因在 Orca provider 层，与模型/通道无关。正式 QA 维持**未启用**。CUA-MAC-2（Orca 终端 composer）本次未进正式，未复测。

---

## 11. 滚动正向对照与最终根因判定（2026-09-13）

- **正向对照（系统级，阳性）**：TextEdit 60 行溢出文档，系统级 PageDown 使滚动条 value `0 → 0.6619`，Home 恢复 `0`（可逆）→ 证明同一区域确实可滚、有滚动余量。
- **orca provider scroll 两条路径（均 no-op）**：
  - AX 元素路径（`--element-index 1`，滚动区）：`ok=true`、`actionName=AXScrollDownByPage`、`path=accessibility` → 滚动条 value 仍 `0`。
  - 合成坐标路径（`--x 336 --y 219`）：`ok=true`、`path=synthetic` → 滚动条 value 仍 `0`。
- **排除清单五项已逐一确认**：页面未到底（从顶部起、60 行溢出）、有滚动余量、以滚动条 value 硬值判位移不依赖像素噪声、scale=2 无坐标换算、系统级可达（排除焦点为唯一解释，AX 路径本不经焦点）。
- **最终根因判定：CUA-MAC-1 = Orca provider scroll false-positive / no-op**（返回 ok=true 但滚动条 value／可见文字／像素均无变化）。
- 最小复现包：`docs/qa/CUA-MAC-1-最小复现包-2026-09-13.md`。
