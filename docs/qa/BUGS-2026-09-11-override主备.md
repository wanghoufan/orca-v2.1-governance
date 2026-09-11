# BUGS｜override主备冒烟测试（2026-09-11，只测不改）

| Bug ID | Priority | Stage P0 Blocking? | Repro | Status | Current Task | 备注（截图/日志一句） |
|---|---|---:|---|---|---|---|
| OVERRIDE-QA-01 TM备通道歧义 | P0 | YES | 读 `USER_MODEL_OVERRIDE.md` 第9行：备用列裸ID `deepseek-flash`＋Runtime列`—`，但备注写“备用=pi默认/codebuddy（显示deepseek-v4.1-flash），备用Runtime是否走pi待确认”；按P0“双通道不混＋切换语义无歧义”判挂：切备时不知走A（bridge）还是B（pi），且裸ID缺池前缀 | PASS（补测已闭环） | TM定切换语义＋补TM备Runtime（`pi/codebuddy`或确认留空） | 静态必现，不依赖探针 |
| OVERRIDE-QA-02 GO mimo备后缀待确认 | P0 | YES | 读表qa行备 `opencode-go/mimo-v2.5`、experience行备同；备注自标“精确后缀待确认”；且主 `opencode-free/mimo-v2.5-free` 有`-free`后缀、备无后缀，前后不一致不可直调 | PASS（补测已闭环） | 用户确认GO mimo精确后缀并改表 | 静态必现；影响qa＋experience两行备 |
| OVERRIDE-QA-03 FREE Spark映射待确认 | P0 | YES | 读表supervisor主 `opencode-free/muse-spark-1.3-contributor-free` 备注自标“主用待确认即FREE Spark”；builder备同ID备注自标“备用=FREE Spark待确认”；neat主同ID无标注但同ID联动待确认；主用含待确认即P0“精确ID可识别”不满足 | PASS（补测已闭环） | 用户确认FREE Spark正式精确ID（或书面认领表内即正式）后去待确认标注 | 静态必现；涉supervisor主/builder备/neat主 |
| OVERRIDE-QA-04 codex路由ID≠CLI直传参 | P1 | NO | 探针：`codex exec -m "gpt-5.6-terra" … "reply with exactly: pong"`→EXIT 0 pong（PASS）；`codex exec -m "codex/gpt-5.6-terra" …`→EXIT 1，400 `The 'codex/gpt-5.6-terra' model is not supported when using Codex with a ChatGPT account`；证明Model列是ORCA路由ID（池/模型），非codex `-m`直传参，需剥 `codex/` 前缀 | FAIL（文档歧义，非模型故障） | 在override规则或HANDOFF补一句“codex CLI实调用剥前缀短名” | 短名PASS见Verification；全ID必现400 |
| OVERRIDE-QA-05 B通道无可执行探针 | P1 | NO | pi `0.84.2`、codebuddy `2.148.0` 二进制存在，但表内B通道“精确ID暂按`deepseek-flash`记、档位high写口头、Runtime是否填`pi/codebuddy`待测后定”，无已确认只读探针语句，本轮未编命令未真调 | 已给探针待真测（B只读PASS，真可达待批） | 用户定B探针语句后再测（见Verification建议） | 只测B（A已测过不重测），本次没验如实记 |

## 静态校验（PASS项如实记）

- 行列齐：表共10行（TM/supervisor/builder/planner/reviewer/qa/product/experience/neat/senior）×5列（角色/主用/备用/Runtime/备注），列齐PASS。
- 每行主备精确ID清单：
  - TM：主 `opencode-go/muse-spark-1.3-contributor` 已知；备 `deepseek-flash` 待确认（见QA-01）。
  - supervisor：主 `opencode-free/muse-spark-1.3-contributor-free` 待确认（见QA-03）；备 `opencode-go/muse-spark-1.3-contributor` 已知。
  - builder：主 `deepseek-flash`＋Runtime `deepseek-bridge` 已知（A通道已验证正式默认，按规则不重测）；备 `opencode-free/muse-spark-1.3-contributor-free` 待确认（见QA-03）；B切pi待定见QA-01/05。
  - planner：主 `codex/gpt-5.6-sol` 已知（格式同terra，短名未逐一真调）；备 GO Spark 已知。
  - reviewer：主 `codex/gpt-5.6-terra` 已知（短名本轮PASS）；备 `opencode-go/glm-5.3-flash` 已知。
  - qa：主 `opencode-free/mimo-v2.5-free` 已知；备 `opencode-go/mimo-v2.5` 待确认（见QA-02）。
  - product：主 `codex/gpt-5.6-luna` 已知（短名未逐一真调）；备 GO Spark 已知。
  - experience：主 `opencode-free/mimo-v2.5-free` 已知；备 `opencode-go/mimo-v2.5` 待确认（见QA-02）。
  - neat：主 `opencode-free/muse-spark-1.3-contributor-free` 待确认（联动QA-03）；备 GO Spark 已知。
  - senior：主 `codex/gpt-5.6-terra` 已知；备 `codex/gpt-5.6-sol` 已知。
- sol/luna短名未逐一真调：同池同格式类推已知，为省额度如实记未测，不编PASS。

## 连通探针（只读、超时即停、不碰secrets、不push）

- codex短名 `gpt-5.6-terra`：`codex exec -m "gpt-5.6-terra" -s read-only --skip-git-repo-check "reply with exactly: pong" </dev/null` → pong，EXIT 0，PASS（tokens used 13,206，ping开销大系hooks/上下文所致，如实记）。
- codex全路由ID `codex/gpt-5.6-terra`：同上仅换`-m` → EXIT 1，400 not supported（见QA-04）。非模型故障，是ID语义问题。
- opencode-go/free（Spark/mimo/glm）：没验。原因：无本地可执行只读探针且避免消耗GO/FREE额度（不静默扣费红线）。下一步：用户授权额度后用 `opencode run -m <精确ID> "ping"` 或本窗口subagent派工实测，超时即停，记HANDOFF＋账本。
- deepseek-bridge（builder主）：没验。原因：分发包内无bridge可执行探针（glob `*BRIDGE*` 无文件，引用的 `V2.1_BRIDGE_INTEGRATION_CONTRACT.md` 不在包内）；且规则写明A已测过、只测B。下一步：回业务仓按contract §1三元组重放probe。
- pi/codebuddy（B通道）：没验。原因：二进制在（pi/codebuddy版本号见上）但无已确认只读探针语句（ID暂记＋档位写口头＋Runtime待定），不编命令。下一步：用户定B探针语句后再测。

## Fix Attempt Fingerprint

- Task ID: qa-override-smoke-2026-09-11
- Root Cause Hypothesis: 表内3处自标待确认（TM备Runtime/pi、GO mimo后缀、FREE Spark映射）＋路由ID与CLI参数语义差一句没写透，导致P0“可识别＋无歧义＋不混”不满足。
- Approach: 只测不改（QA不改代码）：静态全表核对＋codex最小双探针（短名/全ID）＋其余通道如实记没验＋原因＋下一步。
- Files Changed: 无（QA不顺手改代码）。
- Verification: 双探针命令＋EXIT码见上；静态复现路径为读表行号＋备注原文；opencode/bridge/pi三通道本轮没验，已给下一步探针建议。
- Failure Reason: P0三项待确认未清（QA-01/02/03），且QA-04证明直接复制全路由ID调codex必400。
- Difference From Previous Attempt: 首轮冒烟，无上一轮。

## 补测（2026-09-11第二轮，只测不改，续qa-override-smoke-2026-09-11）

- 结论：过，剩余P0数 0。
- 6项逐行复核（读 `USER_MODEL_OVERRIDE.md` 当前29行）：
  - ①TM备：L9备用 `deepseek-v4.1-flash`＋Runtime `codebuddy`＋“待真测，启用前主备均超限按停派找人”护栏——落实PASS（QA-01可闭环）。
  - ②builder主：L11主用 `deepseek-v4.1-flash`＋Runtime `codebuddy`＋备注“A=Bridge已测保留可切回见规则”——落实PASS。
  - ③FREE前缀：supervisor主/builder备/neat主均为 `opencode/muse-spark-1.3-contributor-free`、qa主/experience主均为 `opencode/mimo-v2.5-free`，备注均有live已核——5处全改落实PASS（QA-03可闭环）。
  - ④GO mimo备：qa备/experience备均为 `opencode-go/mimo-v2.5`，备注“备=GO base（非Pro，live已核，另有`mimo-v2.5-pro`独立勿混）”无待确字样——落实PASS（QA-02可闭环）。
  - ⑤池映射：L25“FREE=`opencode/`（Zen，live核无`opencode-free` provider）”——落实PASS。
  - ⑥B只读探针：L27已写“`codebuddy --model deepseek-v4.1-flash --effort high --help` 已rc=0”——落实PASS。
- B只读探针重跑（超时20s即停，未跑`-p`推理）：`codebuddy --model deepseek-v4.1-flash --effort high --help`→EXIT 0 PASS；`--model`支持列表含 `deepseek-v4.1-flash`（如实见输出 `--model <model> … Currently supported: (…, deepseek-v4.1-flash, …)`）。
- QA-01/02/03：本轮三P0状态格已改FAIL→PASS，可闭环。
- QA-04：仍缺P1不阻塞——grep全仓“剥前缀”仅命中本BUGS L8＋HANDOFF下一步，override表规则区无“codex CLI实调用剥前缀短名”一句，未补。
- QA-05：转“已给探针待真测”——规则已给语句＋本轮只读PASS，真可达（`-p ping`耗额度）待用户另批后再测，不在本轮跑。

## B真测（单发）

- 时间：2026-09-11；命令（单发一次，timeout 180000，超时即停记TIMEOUT-STOP）：`codebuddy --model deepseek-v4.1-flash --effort high -p "reply with exactly: pong"`
- rc：0（bash工具成功返回，未抛错；未超时，无TIMEOUT-STOP）
- stdout原文：`pong`
- stderr摘要：无（本通道工具未返回stderr内容）
- tokens/费用回显：无（输出中无tokens/cost行）
- 实际模型身份证据：本单发输出无输出头/版本行；`codebuddy --version`未另跑（本任务“只跑一条命令”约束）；历史版本号见本文件QA-05行（`codebuddy 2.148.0`，分发版内此前记录，非本单发输出）。
- 结论：PASS（rc=0且stdout含pong）

## 全表真测-codex

- 时间：2026-09-11；各单发一次、不重试、超时180s即停（均未超时，无TIMEOUT-STOP）；成功=rc0且含pong。
- 1）sol：`codex exec -m "gpt-5.6-sol" -s read-only --skip-git-repo-check "reply with exactly: pong" </dev/null`
  - rc：0
  - stdout原文：`pong`（codex回 `pong`；终端尾行同显 `pong`）
  - stderr摘要：仅 `Reading additional input from stdin...`＋hooks SessionStart/UserPromptSubmit/Stop Completed，无报错
  - tokens回显：`tokens used 12,310`
  - 结论：PASS
- 2）luna：`codex exec -m "gpt-5.6-luna" -s read-only --skip-git-repo-check "reply with exactly: pong" </dev/null`
  - rc：0
  - stdout原文：`pong`（codex回 `pong`；终端尾行同显 `pong`）
  - stderr摘要：仅 `Reading additional input from stdin...`＋hooks SessionStart/UserPromptSubmit/Stop Completed，无报错
  - tokens回显：`tokens used 12,665`
  - 结论：PASS
- 全表闭环：terra（前轮PASS）＋sol＋luna短名三连PASS；全路由ID必400仍以QA-04为准，不重测。

## 全表真测-GO

- 时间：2026-09-11；语法确认（只读）：`opencode run --help`→rc=0，最小单发语法 `opencode run -m <provider/model> "message"`（含 `-m, --model  model to use in the format of provider/model`）。
- prompt统一：`reply with exactly: pong`；各单发一次、不重试、超时180s即停；成功=rc0且含pong；429/配额错如实记FAIL（本轮无）。
- ① `opencode-go/mimo-v2.5`（GO base，非Pro）：命令 `opencode run -m opencode-go/mimo-v2.5 "reply with exactly: pong"`→rc：0；stdout原文：`> build · mimo-v2.5`＋`pong`；stderr摘要：无（合并输出中无error/429）；费用/tokens回显：无；结论：PASS。
- ② `opencode-go/muse-spark-1.3-contributor`：命令 `opencode run -m opencode-go/muse-spark-1.3-contributor "reply with exactly: pong"`→rc：0；stdout原文：`> build · muse-spark-1.3-contributor`＋`pong`；stderr摘要：无；费用/tokens回显：无；结论：PASS。
- ③ `opencode-go/glm-5.3-flash`（reviewer行备）：命令 `opencode run -m opencode-go/glm-5.3-flash "reply with exactly: pong"`→rc：0；stdout原文：`> build · glm-5.3-flash`＋`pong`；stderr摘要：无；费用/tokens回显：无；结论：PASS。
- 总结论：3/3 PASS，无429/配额耗尽证据，不升GO（用户未说）。

## 全表真测-FREE

- 时间：2026-09-11；语法沿qa-go确认最小单发 `opencode run -m <精确ID> "reply with exactly: pong"`；各单发一次、不重试、超时180s即停；prompt统一 `reply with exactly: pong`；成功=rc0且含pong；429/免费额度尽记FAIL+原文（不自行升GO，等用户说“FREE用完了”才触发规则）。
- ① `opencode/muse-spark-1.3-contributor-free`：命令 `opencode run -m opencode/muse-spark-1.3-contributor-free "reply with exactly: pong"` → rc=0；stdout原文 `pong`；stderr摘要 `> build · muse-spark-1.3-contributor-free`（无报错/无429）；结论 PASS。
- ② `opencode/mimo-v2.5-free`：命令 `opencode run -m opencode/mimo-v2.5-free "reply with exactly: pong"` → rc=0；stdout原文 `pong`；stderr摘要 `> build · mimo-v2.5-free`（无报错/无429）；结论 PASS。
- 合计：2/2 PASS，无429/额度尽证据，本轮不触发FREE耗尽规则。
