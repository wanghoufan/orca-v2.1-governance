# webqa（Web QA 标准通道 V1，散兵＋Orca 通用）

> 2026-09-21 本机实测冻结：BROWSEROS_WEB_QA=READY／ORCA_INTEGRATION=READY。
> 适用：散兵单干、Orca 编排链（两边同一套，不另起 Browser Use/Steel/VM）。

- 标准链：Web/PWA/localhost → BrowserOS neo → MCP → QA Agent。Orca 下实际桥接 Orca→OpenCode CLI→BrowserOS MCP（Orca 无原生 MCP 配置面，禁写成“原生已验证”）。
- 后台静默：默认后台跑；禁无提示 `open -a` 弹前台、禁系统鼠标键盘做常规 Web QA、禁碰用户主 Chrome、禁无故抢焦点；需用户看窗口先通知。
- 动态端口：禁硬编码；每会话/连失败重读 `~/Library/Application Support/BrowserClaw/.browseros/config.json` 取 ports.server（MCP）/ports.cdp（CDP）。
- 操作口径：initialize→notifications/initialized→tools/list→tabs new 取 session+page，后续必带；run 报 -32600 转细粒度工具；React 受控输入优先 type，fill 不稳不硬试，press Enter 提交。
- 认证安全：不输密码/不动 MFA/不绕风控/不导密码/不导入主 Chrome Profile，登录异常人工做；Profile/Cookie/Token 禁入 Git。
- 输出：QA_RESULT=PASS/DEGRADED/FAIL＋对象/步骤/实际结果/失败步骤/截图日志/可复现性/是否需修复；PASS 放行，FAIL 回修回归；DEGRADED=核心可用＋非阻塞异常。
- 故障分层：业务页面→Tool→MCP→Bridge→编排链；禁单点故障自动装其他体系，结构性阻塞才升级备用方案。
- 不新增 Gate；BrowserOS 只是执行工具。
