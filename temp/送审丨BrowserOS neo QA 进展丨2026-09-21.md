# 送审：BrowserOS neo Web QA 本轮进展（供审查者审查）

【任务来源】《2026-09-21 丨 macOS 丨 Orca 丨 BrowserOS neo Web QA-交接上下文 丨 V1.0.md》，要求只验 BrowserOS neo，不碰 Browser Use/Steel/VM。

【做了什么】
1. Phase A 环境检查：macOS 26.6 arm64，主 Chrome 153（仅 Default，未动），无旧 BrowserOS；agent-browser/Maestro/ADB 原环境保留；Orca 本体无 MCP 配置面，链路走终端内 opencode CLI。
2. Phase B 安装：brew tap + cask 装 BrowserOS neo 0.50.5.0（Chromium 151），独立 App，与主 Chrome 共存。brew trust tap 为可逆操作。
3. Phase C 登录：未做全量导入；用户在 BrowserOS 窗口内手工登录 Google（wanghoufan13@gmail.com），未碰密码/MFA 自动化。
4. Phase D 单体验 Harmonic：example.com 导航/快照/读取/点击跳转 iana.org/截图/关 Tab 全通。
5. Phase E localhost：个人网站 next dev :3000，导航/点击到 #contact/滚动/截图通；站内无输入框，输入改在 todomvc 用 type+Enter 建 todo 验证通过（fill 对 React 受控输入不稳定，改 type）。
6. Phase F 不干扰：全程 MCP HTTP，无系统鼠标/键盘调用，主 Chrome 未动。焦点 DEGRADED：我两次 open -a 弹前台，已藏回后台。
7. Phase G 集成：opencode 经临时配置连 MCP（connected），用户批准烧额度跑最小控制任务：tabs new+navigate+读出 Example Domain，PASS。
8. 重启验证：完全退出清进程后重启，MCP 端口 9210→9211（验证了文档"不硬编码端口"），登录态仍在。
9. 收尾：测试 Tab 全关、dev server 已停、BrowserOS 后台保持登录。

【结论】BROWSEROS_WEB_QA=READY，ORCA_INTEGRATION=READY（经 opencode 链路）。阻塞点无。

【请审查者重点看】
- 两次弹前台是否接受（已立规：以后静默+先告知，记入经验一句话.md）。
- 输入验证不在 localhost 而在外部站，是否认可（本模板站无输入框）。
- 焦点判 DEGRADED 而总体 READY 是否恰当。
- 分支 feat/qa-dual-channel-web-android 仅提交 .gitignore（517faa3），其余工作区预存改动未动。
