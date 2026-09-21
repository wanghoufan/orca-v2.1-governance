# 转发给下游智能体（可一键复制，约2600字）

你是接手的 QA/浏览器智能体。上一轮已在 macOS 本机完成 BrowserOS neo Web QA 端到端闭环，结论双 READY。请基于以下事实继续工作，不要重做已验证项，不要另起 Browser Use/Steel/VM。

【硬事实】
- BrowserOS neo 0.50.5.0（Chromium 151），独立 App，后台运行中（已隐藏，不在前台）。
- MCP 走 Streamable HTTP，URL 参考 http://127.0.0.1:9211/mcp ——注意端口每次重启可能变，实测为准：读 ~/Library/Application Support/BrowserClaw/.browseros/config.json 的 ports.server，或看新 Tab 侧栏 MCP 页显示的 endpoint。CDP 在 ports.cdp（曾是 9110）。
- MCP 流程：initialize → notifications/initialized → tools/list → tabs action=new 取 page/session → 后续调用必带 {session, page}。19 个工具；细粒度工具可用，run 有 -32600 类旧坑，能不用就不用。
- act 参数口径：click 用 {kind:click,ref}；输入用 {kind:type,ref,text}（React 站 fill 不稳定）+ {kind:press,key:Enter}；滚动 {kind:scroll}。
- 已登录 Google（wanghoufan13@gmail.com，人工在窗口里登的，重启后仍在）。绝不用自动化脚本碰密码/MFA，不绕风控。
- localhost 验证用的是个人网站 Next.js（npm run dev，:3000），当时 PASS；dev server 已关，需要重测自己起。
- agent-browser / Maestro / ADB 原环境都在，别删别改。主 Chrome Default 未动过。

【铁律】
1. QA 全程后台静默：只调 MCP，禁用 open -a 把 BrowserOS 弹前台；必须让用户看窗口时先说一声。之前有人（我）弹过两次前台，用户已明确不许。
2. 不导入用户主 Chrome 数据，不读密码，不提交任何 profile/auth 进 Git。
3. Orca 链路 = Orca 终端内调已配 MCP 的 agent CLI（opencode 验证过：browseros-neo connected，模型走便宜的 deepseek 系，只跑最小任务）。

【当前状态】
- 测试 Tab 已清空（剩 dashboard），个人站 dev server 已停，BrowserOS 后台挂着保持登录。
- 下一步建议：直接用 MCP 做业务站回归；遇到端口连不上先重读 config，不要重装。

# 用户偏好（已记入本项目 经验一句话.md，中央规则走正式提案流程）
1. BrowserOS/AI 浏览器 QA 必须后台静默操作，禁止无提示弹前台抢焦点；必须用户看窗口时先告知。
2. macOS 剪贴板用 pbcopy 通道：写入后立即 pbpaste 回读，按字节数+开头文本双校验，失败重试，不报“已复制”。
