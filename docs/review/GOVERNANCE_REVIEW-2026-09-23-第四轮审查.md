# ORCA 治理体系审查报告丨2026-09-23（第四轮，现势正典）

> 审查者：本窗口审查角色（code-reviewer 口径，只读审查，不改业务）。
> 范围：`AGENTS.md`、`USER_MODEL_OVERRIDE.md`（母版 T4）、`README.md`、`ORCA治理体系说明.md`、`GOVERNANCE_VERSION`、`经验一句话.md`、`docs/roles/`×11、`docs/prompts/`（编排者＋总监督收编说明）、`docs/sop/`×7、`docs/pm|qa|review|handoff|model|templates`、`scripts/check-sync.sh`、`scripts/decision/`（orca-decide＋policy＋README）、`docs/handoff/HANDOFF.md`（§1–§47）、两模板包（仅目录级比对＋第三轮 diff 结论继承）。
> 与上轮关系：第三轮（2026-09-21）P0=0；T4（2026-09-22，builder 峰谷分流）为新增变量，本轮所有 P0/P1 均由 T4 未同步引发。之前五代报告（09-13×2、09-15×2、09-21×3）转历史，结论以本报告为准。
> 验证方式：全文阅读＋`grep/diff/ls` 实测（见 §五）。未改任何业务文件；新增文件仅本报告。

## 一、执行权总览（框架完整，T4 峰谷分流未同步导致派工口径分叉）

TM 唯一对人、supervisor 只对 TM、builder 不直聊用户、permission 单点、换模型用户定、不 push 无指令、db-admin 直派直收、总监督 wake-only——分权框架无变化。
但“冲突以表为准”再次不可执行：母版表已 T4（峰谷双路），README、`ORCA治理体系说明.md`、HANDOFF §1 仍停留在 T3（codebuddy 主备链）口径；DISPATCH runtime 枚举、AGENTS 禁套娃句均无 volc 通道字样。按母版表派高峰 builder，supervisor 按旧枚举/旧文校验必打回；按旧文派则违反“以表为准”。先收敛下文 P0 再派高峰单。

## 二、P0（阻塞执行，必须先修）

### P0-1 模型口径三处未跟 T4（README＋对外说明＋HANDOFF §1）
- 真源（母版表 `:7`）：builder＝峰谷分流，空闲 `codebuddy/deepseek-v4.1-flash`，高峰 `volcengine-plan/glm-5.3-flash`（北京时间工作日 9–12/14–18）。
- 对立面：
  ① `README.md:15` 仍写“builder 走 `codebuddy/deepseek-v4.1-flash` via codebuddy（限额停工切 codebuddy/glm-5.3-flash）”——旧 A 方案主备链，无峰谷、无 volc 通道；
  ② `ORCA治理体系说明.md:71` 同上旧口径（且 `:67-79` 表头自称 T4 现势，内容实为 T3）；
  ③ `HANDOFF.md:19` §1 分工表段仍为 T3 口径（codebuddy 主备链），日期仍 2026-09-16。
- 后果：对外说明自称“概览”但给出可执行 ID，TM/新人阅读到旧 ID 即派错；“T4 现势”标签名实不符，门禁公信力受损。
- 建议：三处同步改为峰谷双路表述（空闲/高峰＋时段＋双路互备＋双限停派喊人），或改写为“以表为准，此处不复述 ID”。对外说明建议后者（概览不抄 ID）。

### P0-2 DISPATCH runtime 枚举无 volc 位，高峰单无合规记法
- `AGENTS.md:61`、supervisor 卡 `:40` runtime 枚举：`本窗口/codebuddy/codex/opencode/—`，无 `volcengine-plan`。
- T4 高峰 builder 通道为 `codebuddy/opencode`（表 `:7` 通道列）但实际执行为 `opencode run -m volcengine-plan/glm-5.3-flash`——runtime 填 `opencode` 还是 `volcengine-plan`？无字。填前者则与 model 列 `volcengine-plan/glm-5.3-flash` 对不上，supervisor“实派==表”抽查无依据；填后者则被校验脚本打回。
- 建议：二选一并同步 AGENTS＋supervisor 卡＋check-ledger（如有）：(a) runtime 加 `volcengine-plan` 枚举；(b) 明确“runtime 填执行通道列（codebuddy/opencode），精确模型填 model 列”。推荐 (a)，审计可区分峰谷。

### P0-3 AGENTS 禁套娃句漏 volc 通道
- `AGENTS.md:41`：“表定 codebuddy/codex/opencode 的角色必须走通道直调”。
- T4 builder 高峰为 volc 通道，不在列举内。字面理解 volc 可被包进本窗口套娃，与 §31/§37 立规本意相悖。
- 建议：改为“表定外部通道（codebuddy/codex/opencode/volcengine-plan 及后续新增）一律走通道直调，禁本窗口代做”，或收窄为“表内执行通道列非‘本窗口’者一律禁代做”。

## 三、P1（会误判／派错，尽快修）

- P1-1 `used 恒填主` vs 峰谷双路（第三轮 P1-8 延续＋加重）。AGENTS `:46,:61`、supervisor `:38` 仍断言 `used != '主'` 即打回。T4 双路哪路是“主”？空闲/高峰按时段切换，无主备之分，切路轨迹只靠 note 无枚举可查。建议：used 语义改为“是否按表派”（恒填主保留作合规位），另加字段或 note 规范记录 `idle/peak`＋时段＋切路原因；或 used 加 `峰谷` 枚举。改 AGENTS＋supervisor 校验块＋DISPATCH 模板注释三处。
- P1-2 角色计数残留。AGENTS 标题已 `9+1+1`（`:3`），但红线总监督句仍“不占 9+1”（`:79`）。建议统一“不占 9+1+1”。（第三轮 P1-5 未闭环。）
- P1-3 HANDOFF §1 现势过期＋条数手数。§1 日期 2026-09-16，经验“11 条”实测母版 14 条（`grep -c '^- '` ＝14，不计头尾）；分工表段 T3 口径（见 P0-1）；§22–§33 commit 状态描述与今日 git 状态无关。建议：§1 改为“分工表以母版表为准，此处不复述 ID；经验条数见文件不手数”；日期改为“现势以 Git 历史为准”。
- P1-4 重号 §34–§38 仍在文件内。§39 虽声明冻结，但同一文件内 §34–§38 出现两次（治理 5 节＋PC 本地 5 节），新读者仍会误引。建议：PC 本地 5 节移出主 HANDOFF（另立 `HANDOFF-PC-LOCAL.md`），或重号为 §34a–§38a 并在 §39 重申。零成本方案：文件头加一行“§34–§38 有两组，以标题区分，引用时带标题”。
- P1-5 check-sync 白名单与列表腐烂。① 注释称 AGENTS 预期差 `:37`，实测 Sidecar（`:39`）＋插座（`:41`）新增后行号已漂，`:37` 断言脆弱；② `check` 长列表内 `partition-validate.mjs/test-slow.mjs/test-partition.mjs/test-secrets.mjs/build-index.mjs` 重复 3–4 次，无害但审计噪音；③ `scripts/decision/node_modules` 靠 `--exclude` 豁免但 `.gitignore` 是否落盘未在本轮验证，需补。建议：白名单改为“diff 恰 2 行 markers”语义化断言（已是 `n=2`，删行号注释即可）；长列表去重；README 或脚本头补 node_modules 豁免说明。
- P1-6 decision endpoint 表述三分叉。`decision-router.md:5` 称直调 `api.typesafe.ai`；`HANDOFF §41` 称“由 Vercel 网关改 TypeSafe 直调”；`ORCA治理体系说明.md:46` 称“TypeSafe 直调，旧四 Contract 回归 10/10”＋`:3` 脚注“Vercel 403 需绑卡”。三者关系（网关已废还是备用？403 仍可能吗？）未交代一句。建议：sop 加一句“现直调 TypeSafe，Vercel 网关已废（历史见 HANDOFF §41），绑卡事项已关闭/仍有效（二选一）”。
- P1-7 sidecar 采纳落盘位缺失。TM 卡 `:14`、supervisor 卡 `:25` 均有“advisory＋抽查调用点合规”，但 HANDOFF template 无 decision 字段，采纳与否只散在执行链自然语言中，抽查无固定锚点。建议：HANDOFF template 加可选行 `decision（orca-decide 输入 hash/结论/采纳与否一句）`，或明确“记执行链尾一句，supervisor 按关键词抽查”。
- P1-8 TASK 示例单 ID 表达不了峰谷。`TASK-MODEL-LOG.jsonl` 示例 `model=codebuddy/deepseek-v4.1-flash/role=builder`——T4 下 builder 有双 ID，示例未示范高峰行与 note 写法。建议：示例加 `note` 示范峰谷（如 `idle 09:00前按表空闲路`），或换成非 builder 角色示例＋注释指峰谷见表。
- P1-9 第二套版本号残留（P1-1 变体）。`GOVERNANCE_VERSION` 称“不设数字版本号”，母版表 `:17` 注释仍 `分工表版本：T4`。T1 时已争议过，T4 沿用同一机制。建议：二选一：(a) 承认 T 系列为分工表内部修订号，在 GOVERNANCE_VERSION 加一句豁免；(b) 删注释改走 HANDOFF 记一笔。不允许“指针说无版本、表内有版本”中间态长期存在。

## 四、P2 与优化

1. 监督者提示词正文 1879 行大权限残留。顶部收编说明（wake-only）与正文 V1.1（规范维护＋编排审计＋持续推进＋完成对账＋故障恢复，`:13-16`）权限差两个量级，靠“说明高于正文”覆盖。审计需读 8 行而非 1879 行，方向对，但正文内“位于主编排者之上”（`:28`）、CONVERGED 才结束（`:54-59`）等表述与 wake-only 实质冲突，新总监督易误读正文。建议：正文冻结不动的前提下，收编说明加一句“正文 §一/§二/§X 权限描述已作废清单”，或给正文打只读水印注释。
2. 双喊冲突：supervisor“编排者失联才替喊一声”（卡 `:52`）vs 总监督“同一停摆喊编排者两次叫不醒才找用户”（收编说明）。编排者失联时谁先喊、喊谁（用户还是编排者）？建议 AGENTS 红线加半句优先级：“失联先 supervisor 替喊，停摆（未失联但不推进）走总监督”。
3. qa 真机直驱与“开窗口时定”耦合无下限。qa 卡 `:7` 真机走本窗口 bash 直驱（即开窗口模型），若开窗口模型为弱模型，真机操作质量无保障。建议：真机直驱注明“开窗口模型须为可执行 shell 的强模型，否则另开窗口”，或真机单固定走 codex Luna 危险模式（已验证过 `-s danger-full-access` 可行，见 HANDOFF §32）。
4. ORCA 说明 §三“七类”与 sop“七类＋Shadow 四 Contract”口径差。说明称“只判七类（4 主＋3 Shadow）”，sop §“并行四 Contract（Shadow）”另有 pmmode/fanout/partchoice/mergerisk 四窄 Contract。7 vs 11，读者对不上。建议：说明加一句“另有并行四窄 Contract（Shadow only，见 sop 末节），不计入七类”。
5. 两包同步状态本轮未全量重验（只验目录＋继承第三轮 diff）。T4 改表后两包表是否同步、经验 3 条是否同步（HANDOFF §39 称已同步），建议下次派工前跑 `bash scripts/check-sync.sh` 取 exit 码当门禁证据，落 HANDOFF 一行。
6. 报告五代→六代并存。本报告为现势正典；之前 `GOVERNANCE_REVIEW-2026-09-13-*`×2、`*-2026-09-15-*`×2、`*-2026-09-21-*`×3 共 7 份转历史（结论以本报告 §二/§三为准）。建议 README“已删除”节加一行正典声明，免新人误引旧报告。
7. `scripts/decision/README.md` 与 sop 的 endpoint/付费描述需对齐（见 P1-6），且 node_modules＋lock 去留、`.gitignore` 落盘状态需在 README 一句话交代。

## 五、验证说明

- 未改业务代码；新增文件仅本报告。
- 已实测：`ls docs/roles`（11 卡在位）／`ls docs/sop`（7 件在位：docker/supabase/sqlite/android/android-machine-profile/webqa/decision-router）／`ls scripts/decision`（orca-decide＋policy＋fixtures＋node_modules 在 disk）；`grep 9+1 AGENTS`（`:3` 9+1+1 vs `:79` 不占 9+1）；`cat scripts/check-sync.sh`（白名单 `:37`＋长列表重复）；`read USER_MODEL_OVERRIDE`（T4 峰谷 `:7`＋T4 注释 `:17`）；`read README:15`＋`ORCA说明:71`＋`HANDOFF:19`（三处旧口径）；`read TASK/DISPATCH jsonl`（示例单 ID）；`read 监督者提示词 :1-60`（收编说明＋V1.1 正文冲突）；`read HANDOFF §39-47`（T4＋Jev＋并行 Shadow 新节）。
- 未实测（留待下轮）：两包全量 `check-sync.sh` exit 码；外部/迁移提示词旧通道残留 grep；`.gitignore` 落盘状态；`policy.json` hardfilter 与 supabase secret 规范衔接。
- 风险声明：若用户本意是“峰谷分流仅试运行、T3 仍为正典”，则 P0-1 修复方向反转（改母版表回 T3），但“四处必须一致”结论不变。
