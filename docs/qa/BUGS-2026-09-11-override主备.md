# BUGS｜override主备冒烟测试（2026-09-11，只测不改）

| Bug ID | Priority | Stage P0 Blocking? | Repro | Status | Current Task | 备注（截图/日志一句） |
|---|---|---:|---|---|---|---|
| OVERRIDE-QA-01 TM备通道歧义 | P0 | YES | 读 `USER_MODEL_OVERRIDE.md` 第9行：备用列裸ID `deepseek-flash`＋Runtime列`—`，但备注写“备用=pi默认/codebuddy（显示deepseek-v4.1-flash），备用Runtime是否走pi待确认”；按P0“双通道不混＋切换语义无歧义”判挂：切备时不知走A（bridge）还是B（pi），且裸ID缺池前缀 | PASS（补测已闭环） | TM定切换语义＋补TM备Runtime（`pi/codebuddy`或确认留空） | 静态必现，不依赖探针 |
| OVERRIDE-QA-02 GO mimo备后缀待确认 | P0 | YES | 读表qa行备 `opencode-go/mimo-v2.5`、experience行备同；备注自标“精确后缀待确认”；且主 `opencode-free/mimo-v2.5-free` 有`-free`后缀、备无后缀，前后不一致不可直调 | PASS（补测已闭环） | 用户确认GO mimo精确后缀并改表 | 静态必现；影响qa＋experience两行备 |
| OVERRIDE-QA-03 FREE Spark映射待确认 | P0 | YES | 读表supervisor主 `opencode-free/muse-spark-1.3-contributor-free` 备注自标“主用待确认即FREE Spark”；builder备同ID备注自标“备用=FREE Spark待确认”；neat主同ID无标注但同ID联动待确认；主用含待确认即P0“精确ID可识别”不满足 | PASS（补测已闭环） | 用户确认FREE Spark正式精确ID（或书面认领表内即正式）后去待确认标注 | 静态必现；涉supervisor主/builder备/neat主 |
| OVERRIDE-QA-04 codex路由ID≠CLI直传参 | P1 | NO | 探针：`codex exec -m "gpt-5.6-terra" … "reply with exactly: pong"`→EXIT 0 pong（PASS）；`codex exec -m "codex/gpt-5.6-terra" …`→EXIT 1，400 `The 'codex/gpt-5.6-terra' model is not supported when using Codex with a ChatGPT account`；证明Model列是ORCA路由ID（池/模型），非codex `-m`直传参，需剥 `codex/` 前缀 | PASS（已落地见 override:21；失败原因保留作trace） | 在override规则或HANDOFF补一句“codex CLI实调用剥前缀短名” | 短名PASS见Verification；全ID必现400 |
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

## P1修复验收

- 时间：2026-09-11；范围：报告§6三组＋账本抽查，只测不改（未动业务/`USER_MODEL_OVERRIDE.md`/账本；坏例仅落`/tmp/qa-bad.jsonl`，不污染包内）。
- ① supervisor卡断言块跑现账本（`docs/roles/supervisor.md:6-20`原块照粘，路径换现账本）：
  - `python3 -c "<断言块>" docs/model/TASK-MODEL-LOG.jsonl` → EXIT:0，无输出（PASS，静默）。
  - 坏例打回验证：`printf '{"task":"BAD","project":"x"}\n' > /tmp/qa-bad.jsonl` 后同断言块跑`/tmp/qa-bad.jsonl` → EXIT:1，命中行：`L1: 缺键 ['cost_cny', 'date', 'escalated', 'escalation_reason', 'model', 'result', 'rework', 'role', 'tokens']`＋`L1: result枚举错: None`＋`L1: escalated枚举错: None`＋`L1: rework非int: None`（打回行为PASS；`/tmp/qa-bad.jsonl` 29字节留`/tmp`，包内零新增）。
- ② `rg -n "opencode-free" USER_MODEL_OVERRIDE.md` → EXIT:0，命中仅2行：
  - `25:…池映射：FREE=opencode/（Zen，live核无\`opencode-free\` provider）…`（映射说明）
  - `29:…（旧 \`opencode-free/\` 一律视为 \`opencode/\`，触发器按现表前缀执行）…`（迁移句）
  - 数据行（:9-:18）零命中（PASS，符合“仅:25与:29，数据行零命中”）。
- ③ `rg -n "待真测|待测后定|待用户另批" USER_MODEL_OVERRIDE.md` → EXIT:1，零命中（PASS）。
  - 同式跑本BUGS：`rg -n "待真测|待测后定|待用户另批" docs/qa/BUGS-2026-09-11-override主备.md` → EXIT:0，命中`:9`（QA-05首轮原文“待测后定/待真测”）＋`:49`（补测引用“待真测”护栏）＋`:58`（“待真测/待用户另批”转述），属历史节证据留痕，单列不判挂。
- 抽查账本：`cat docs/model/TASK-MODEL-LOG.jsonl` 仅1行`{"_example":true,…"task":"TASK-000-example"…}`；`rg -n "_example" docs/model/TASK-MODEL-LOG.jsonl` → EXIT:0命中`1:{"_example":true,…}`；`wc -l` → `1 docs/model/TASK-MODEL-LOG.jsonl`＋`29 USER_MODEL_OVERRIDE.md`（账本仅`_example`单行PASS；`rg -n "opencode-free" docs/model/TASK-MODEL-LOG.jsonl` → EXIT:1零命中）。
- 结论：过（①EXIT 0/坏例EXIT 1打回＋②EXIT 0仅:25/:29＋③EXIT 1零命中，账本单行`_example`）。

## P1-7改A验收

- 时间：2026-09-11；范围：①拷贝diff ②B措辞清零 ③包根行数+§1三元组；只测不改（未动业务/包根/override；无包内新增，证据为命令EXIT+行号原文）。
- ① `diff -u Infrastructure/orca-deepseek-bridge/docs/V2.1_BRIDGE_INTEGRATION_CONTRACT.md V2.1_BRIDGE_INTEGRATION_CONTRACT.md` → 仅 `7a8,9` 两行新增（`> 分发注记…`＋`> 空行`），与包根L8-L9一致；`wc -l` 业务147／包根149（149=147+2）；结论 PASS（“仅差分发注记2行”成立）。
- ② `rg -n "Contract存业务仓|分发包仅记" USER_MODEL_OVERRIDE.md` → EXIT:1 零命中 PASS；现L26为“依据：Contract随包分发（包根 `V2.1_BRIDGE_INTEGRATION_CONTRACT.md`，§1三元组…）”旧B措辞已清。
- ③ `wc -l V2.1_BRIDGE_INTEGRATION_CONTRACT.md` → 149（任务目标写147，实测149=业务147+注记2，不一致）；§1 L24三元组齐：model `deepseek-flash`＋runtime `deepseek-bridge`＋route `deepseek-bridge/deepseek-flash` PASS。
- 结论：挂（①PASS＋②PASS＋③行数149≠147字面挂、三元组齐；149与①自洽，疑期望147为加注前旧数，待确认改为149后可转过）。

## B源修+P2验收

- 时间：2026-09-11；范围：四组（①拷贝diff ②旧route分类 ③待真测清零 ④账本单行+断言）；只测不改（未动业务/包根/override/账本；本节为QA输出追加）。
- ① `diff -u 业务仓源 包根拷贝`（源 `/Users/zzymima0000/Developer/coding/Infrastructure/orca-deepseek-bridge/docs/V2.1_BRIDGE_INTEGRATION_CONTRACT.md` vs 包根 `V2.1_BRIDGE_INTEGRATION_CONTRACT.md`）→ 仅 `7a8,9` 两行新增（`> 分发注记…`＋`> 空行`），与包根L8-L9一致；`wc -l` 业务147／包根149（149=147+2）；结论 PASS（“仅差注记块”成立）。
- ② `rg -n "deepseek-bridge/deepseek-v4-flash"` 两文件：
  - 业务仓源 → EXIT:0，命中4行：L14/L20/L132/L142（行号以业务仓147行版为准），原文均含“旧 `deepseek-bridge/deepseek-v4-flash` 为兼容 alias”＋“禁作新默认/不得再作新默认/不写虚构别名”——全部分类：兼容声明。
  - 包根拷贝 → EXIT:0，命中4行：L16/L22/L134/L144（=业务仓行号+2，与注记块插入自洽），原文同上——全部分类：兼容声明。
  - 实操（作新默认/canonical/模型列/route主用）计数：0；结论 PASS（实操应零成立）。
- ③ `rg -n "待真测|B真测前" USER_MODEL_OVERRIDE.md` → EXIT:1，零命中 PASS。
- ④ 账本：`cat docs/model/TASK-MODEL-LOG.jsonl` 仅1行 `{"_example":true,…"task":"TASK-000-example"…}`；`wc -l` → `1 docs/model/TASK-MODEL-LOG.jsonl`；`rg -n "_example" docs/model/TASK-MODEL-LOG.jsonl` → EXIT:0命中`1:{"_example":true,…}`；supervisor断言块（`docs/roles/supervisor.md:6-20`照粘，路径换现账本）→ EXIT:0静默 PASS。
- 结论：过（①PASS＋②兼容8/实操0＋③EXIT1＋④单行_example＋断言EXIT0）。

## 搬家基线重测

- 时间：2026-09-11；路径：分发版包根；两包（`新项目模板包/`、`老项目迁移模板包/`）冻结不测；只测不改（未动业务/包根/override/账本；本节为QA输出追加）。
- ①读盘冒烟（PASS 6/6可读）：`AGENTS.md`、`docs/roles/task-manager.md`、`USER_MODEL_OVERRIDE.md`、`docs/handoff/HANDOFF.md`、`经验一句话.md`、`README.md` 全存在可读。
- ②`rg -n "编排者提示词\.md|外部开发者提示词\.md|迁移整理提示词\.md|归位表\.template\.md|2\.0-重塑说明\.md|2\.1-更新说明\.md" --glob '!新项目模板包/**' --glob '!老项目迁移模板包/**' .` → EXIT:0，命中7行：
  - PASS 4行：`docs/history/2.0-重塑说明.md:10`（`docs/prompts/迁移整理提示词.md`）、`:15`（`docs/prompts/编排者提示词.md`）、`V2.1_BRIDGE_INTEGRATION_CONTRACT.md:17`（`docs/prompts/编排者提示词.md`）、`:18`（`docs/prompts/外部开发者提示词.md`）。
  - FAIL 3行（5 token缺`docs/`前缀）：`docs/review/CODE_REVIEW-2026-09-11-override主备.md:30`（`` `2.1-更新说明.md:6` ``、`` `2.0-重塑说明.md:7` ``）、`:40`（`` `编排者提示词.md:10` ``）、`:48`（`` `外部开发者提示词.md:16` ``、`` `2.1-更新说明.md:1` ``）。结论 FAIL。
- ③账本断言（PASS）：`docs/model/TASK-MODEL-LOG.jsonl` 仅1行`{"_example":true,…"task":"TASK-000-example"…}`；`wc -l`→1；python json断言→EXIT:0（`_example is True`单行成立）。
- ④`git status --short`（两包应ignore不可见：PASS）：`git check-ignore -v` 确认两包命中`.gitignore:4/5`，`status`中零出现；其余可见项如实列出：` M .gitignore`、` M AGENTS.md`、` M V2.1_BRIDGE_INTEGRATION_CONTRACT.md`、` M docs/handoff/HANDOFF.md`、R/RM搬家6项（3提示词→`docs/prompts/`、2说明→`docs/history/`、归位表→`docs/templates/`）、D治理审查报告6份、`?? README.md`。
- 结论：挂（①PASS＋②FAIL×3行号＋③EXIT0＋④两包不可见PASS/其余搬家项列出）。

## -y卡点验证

- 时间：2026-09-11；路径：分发版包根；只测不改（未动业务/包根/override/账本；本节为QA输出追加；各单发不重试，timeout 180s，均未超时）。
- ① `codebuddy --help`（免费，只读）→ rc=0；`-y` 原文：`-y, --dangerously-skip-permissions               Bypass permission prompts (HIGH/CRITICAL still ask). Isolated-sandbox full pass: CODEBUDDY_IS_SANDBOX=1 (process env only; high-risk). (default: false)`。
- ② A无-y：`codebuddy --model deepseek-v4.1-flash --effort high -p "Run this shell command and reply with its exact output: echo probe-ok"`
  - rc：0（codebuddy进程正常退出，未抛错）
  - stdout原文：`无法执行：Bash 工具权限被拒绝（非交互模式下无审批弹窗）。`
  - stderr原文（同输出合并返回，续行）：`命令本身无风险，预期输出为 \`probe-ok\`，但这只是推断，不是实际运行结果。若需真跑，可：- 用 \`codebuddy -p -y "<prompt>"\` 或 \`--permission-mode bypassPermissions\` 重跑- 或在 settings 的 \`permissions.allow\` 中加入 \`Bash\``
  - 含probe-ok实跑输出？否（仅“预期输出”推断字样，无实际shell回显）。
- ③ B有-y：`codebuddy --model deepseek-v4.1-flash --effort high -y -p "Run this shell command and reply with its exact output: echo probe-ok"`
  - rc：0
  - stdout原文：`probe-ok`（合并输出为三引号代码块内 `probe-ok` 一行）
  - stderr摘要：无（合并输出中无error/拒绝字样）
- 判定：成立（A拒绝/无实跑输出而B回probe-ok，别项目结论在我方复现成立；注意A的rc=0是进程码，拒绝体现在正文而非非零退出码）。
- 残留：HIGH/CRITICAL仍问未live负测（destructive探针风险＞收益，记残留不补测）。

## -y备注验收

- 时间：2026-09-11；路径：分发版包根；只测不改（未动业务/包根/override/账本；本节为QA输出追加）。
- ① `rg -c "\-y" USER_MODEL_OVERRIDE.md docs/roles/builder.md` → `USER_MODEL_OVERRIDE.md:2`、`docs/roles/builder.md:1`，均≥1 PASS。
- ② `rg -n "漏标按缺派工要素打回" USER_MODEL_OVERRIDE.md` → 命中 `28:` 单行 PASS。
- ③ `rg -n "只看正文" docs/roles/builder.md` → 命中 `:8`（B行“自测验成功只看正文回显不看rc”）PASS。
- 结论：过（①2/1＋②:28＋③:8）。

## 同步验收

- 时间：2026-09-11；路径：分发版包根；只测不改（未动业务/包根/override/账本；本节为QA输出追加）。
- ①双断言（supervisor.md:6-20 TASK块＋:26-42 DISPATCH块照粘，路径按需换，均静默PASS）：
  - 母版TASK `docs/model/TASK-MODEL-LOG.jsonl` → EXIT:0；母版DISPATCH `docs/model/DISPATCH-LOG.jsonl` → EXIT:0。
  - 新包TASK `新项目模板包/docs/model/TASK-MODEL-LOG.jsonl` → EXIT:0；新包DISPATCH → EXIT:0。
  - 老包TASK `老项目迁移模板包/docs/model/TASK-MODEL-LOG.jsonl` → EXIT:0；老包DISPATCH → EXIT:0。
  - 结论：① PASS（6/6 EXIT 0；_example单行自动跳过）。
- ②母版vs两包 `diff -rq --exclude=.git --exclude=.DS_Store` 原文（节选，EXIT均为0）：
  - vs新包：`Only in .: .gitignore`／`AGENTS.md differ`／`README.md differ`／`V2.1_BRIDGE… differ`／`Only docs/handoff: HANDOFF.md,HANDOFF-2026-09-11-override主备.md`／`Only docs: history,prompts,sop,templates`／`Only docs/qa: BUGS-2026-09-11-override主备.md`／`Only docs/review: CODE_REVIEW-2026-09-11-override主备.md`／`supervisor.md differ`／`Only 新项目模板包: 编排者提示词.md,外部开发者提示词.md,归位表.template.md`。
  - vs老包：同上结构，仅包侧为 `编排者/外部/迁移整理/归位表` 四个原位文件。
  - 映射后内容比对（排除三类：.gitignore／README补记／已知路径前缀）：
    - SAME（18处）：USER_MODEL_OVERRIDE／GOVERNANCE_VERSION／经验一句话／roles×9（除supervisor）／TASK／DISPATCH／PLAN／BUGS.template／CODE_REVIEW.template／PRODUCT_BACKLOG／HANDOFF.template／EXT-WORKLOG／编排者提示词(map SAME)／归位表(map SAME)。
    - 路径前缀类（预期内，剔除）：V2.1 contract 2行 `docs/prompts/xxx`→`xxx`（新老包同）；老包迁移整理1行同类；新包缺迁移整理系设计省略（新包README放入列表无此项）。
    - 非预期差×3（零容忍挂）：
      - A1 AGENTS.md缺行（两包同）：母版有`两包同步：母版治理改动提交后同步两本地包…diff非预期差零容忍`，两包均无（diff hunk `-两包同步`）。
      - S1 supervisor.md缺块（两包同）：母版:26-42 DISPATCH校验块（8键＋used/result枚举）两包均缺17行。
      - E1 外部开发者提示词.md stale（两包同）：母版`历史审查报告已删见README` vs 两包`（含治理审查报告）一律不动`旧措辞。
  - 结论：② FAIL（A1＋S1＋E1三类实质差；历史/HANDOFF实例/BUGS实例/sop/history省略系包设计排除，不计入本次三类非预期差）。
- ③两包DISPATCH各为_example单行：`wc -l` 新包1／老包1／母版1；内容均为`{"_example":true,…"task":"TASK-000-example"…}`单行；`rg -n _example` 各命中1:1。结论 PASS。
- ④两包README补记节存在：`grep -n 同步补记` → 新包`README.md:23:## 同步补记（母版常驻同步，新增文件去向）`、老包`README.md:24`同节。结论 PASS。
- 总结论：挂（①PASS＋②FAIL×3＋③PASS＋④PASS；待A1/S1/E1三处同步后可转过）。

## 槽禁令验收

- 时间：2026-09-11；路径：分发版包根；只测不改（未动业务/包根/override/两包；本节为QA输出追加）。
- ① `rg -c "禁顶builder槽" USER_MODEL_OVERRIDE.md 新项目模板包/USER_MODEL_OVERRIDE.md 老项目迁移模板包/USER_MODEL_OVERRIDE.md` → 母版`1`／新包`1`／老包`1`，三处均≥1 PASS。
- ② supervisor断言块 diff（整文件diff，TASK块:6-20＋DISPATCH块:26-42含其中）：
  - `diff docs/roles/supervisor.md 新项目模板包/docs/roles/supervisor.md` → 零输出 PASS。
  - `diff docs/roles/supervisor.md 老项目迁移模板包/docs/roles/supervisor.md` → 零输出 PASS（三文件均为45行逐行一致）。
- ③ 上轮A1/S1/E1重跑：
  - A1：`diff AGENTS.md` vs两包各2 hunk：`:26` 路径前缀类（母版`docs/prompts/编排者提示词 :10` vs 包内`编排者提示词 :10`；`git diff`证该前缀随搬家提交已入HEAD，包内裸名与其版式相符，沿既有“路径前缀类预期内剔除”口径）＋`:49` A1原hunk（母版未提交新增`两包同步…`行，两包均无，母版独有）。实质差仍唯一=A1，预期内 PASS。
  - S1：见②，零差 PASS（上轮缺17行已补齐）。
  - E1：`diff docs/prompts/外部开发者提示词.md 新包/外部开发者提示词.md` → 仅`16c16` 1 hunk，老包同。母版`（历史审查报告已删见 README；EXT-WORKLOG 例外，见 §一.2）` vs 两包`（EXT-WORKLOG 例外，见 §一.2）`：旧stale `（含治理审查报告）一律不动`已清，但母版parenthetical未同步，diff非零 FAIL。
- 结论：挂（①PASS＋②PASS＋③A1预期/S1零差/E1残留1行非零；补齐该parenthetical或书面确认为母版独有后可转过）。

## 对调重验

- 时间：2026-09-12；路径：分发版包根；只读未调模型（FREE主/B备此前均已真测PASS，本轮不跑模型；TM已改三表＋HANDOFF，本轮只做文字重验；本节为QA输出追加）。
- 读盘顺序：AGENTS→roles/qa→USER_MODEL_OVERRIDE→HANDOFF→经验一句话→任务目标最后（包根＋两包）。
- ① 旧禁令退役：`rg -n "当前主用B|主用为B|主用B走|禁顶builder槽" USER_MODEL_OVERRIDE.md 新项目模板包/USER_MODEL_OVERRIDE.md 老项目迁移模板包/USER_MODEL_OVERRIDE.md` → EXIT:1 零命中 PASS（历史 `禁顶builder槽` 仅剩本文件:199旧节留痕，三表零命中）。
- ② builder行逐字同：三表 `| builder |` 整行 SAME PASS；主 `opencode/muse-spark-1.3-contributor-free`／备 `deepseek-v4.1-flash`／Runtime `—（默认本窗口 subagent；切备B走codebuddy）` 三列一致（备注含 2026-09-12主备对调＋FREE耗尽按:29）。
- ③ 双断言EXIT 0（supervisor.md:6-20 TASK块＋:26-42 DISPATCH块照粘）：母版TASK→EXIT:0、母版DISPATCH→EXIT:0；新包TASK→EXIT:0、新包DISPATCH→EXIT:0；老包TASK→EXIT:0、老包DISPATCH→EXIT:0（6/6 EXIT 0，_example行自动跳过）；`wc -l` 母版TASK 1／DISPATCH 1、新包各1、老包各1，均为 `{"_example":true,…"task":"TASK-000-example"…}` 单行 PASS。
- 结论：过（①EXIT1＋②SAME＋③6/6 EXIT0）。

## luna重验

- 时间：2026-09-12；路径：分发版包根；禁模型调用只读（未跑任何模型探针；仅grep/rg/diff/python断言只读；本节为QA输出追加）。
- 读盘顺序：AGENTS→roles/qa→USER_MODEL_OVERRIDE→HANDOFF→经验一句话→任务目标最后（包根＋两包）。
- ① 三表product行diff零差且含luna：`grep -n "product-reviewer"` 三表均命中`:15:| product-reviewer | codex/gpt-5.6-luna | opencode-go/muse-spark-1.3-contributor | —（默认本窗口 subagent） | 备用=GO Spark |`；`diff` 母版vs新包零输出SAME、母版vs老包零输出SAME；含`codex/gpt-5.6-luna`成立 PASS。
- ② rg"整批升GO"三表＋HANDOFF各1行且同为停用声明：`rg -c` 母版1／新包1／老包1／`docs/handoff/HANDOFF.md`1（`rg -n` 均为单行：三表`:29`、HANDOFF`:35`）；原文三表`:29"…替代09-11整批升GO…；整批升GO停用（GO无额度）…"`、HANDOFF`:35"…FREE整批升GO已停用（GO无额度，2026-09-12用户定）…"`，均含停用声明 PASS（备注：按`rg -o`出现次数三表各2次／HANDOFF1次，因三表同行含"替代09-11整批升GO"前缀＋"整批升GO停用"正文，行级各1处成立，字级差如实记）。
- ③ rg"codex/gpt-5.6-terra"product行零命中：`grep "product-reviewer" 三表 | grep -c "codex/gpt-5.6-terra"` → 0命中EXIT:1 PASS（对照：全表terra仅`code-reviewer:13`／`senior-expert:18`／规则`:21`，product行无）。
- ④ 双断言exit 0（supervisor.md:6-20 TASK块＋:26-42 DISPATCH块照粘）：母版TASK→exit0、母版DISPATCH→exit0；新包TASK→exit0、新包DISPATCH→exit0；老包TASK→exit0、老包DISPATCH→exit0（6/6 exit 0，_example行自动跳过）；`wc -l` 六账本各1行且均为`{"_example":true,…}`单行 PASS。
- 结论：过（①SAME＋含luna＋②各1行停用＋③零命中＋④6/6 exit0）。
