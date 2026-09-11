# USER_MODEL_OVERRIDE｜2.1 一句话切模型（优先于 registry 兜底）

> 你改这张表就生效，不用走 promotion/sync/run-all。编排者每次派工前读一次。
> 窗口说一句也一样：“Builder主用XX，备用YY”，编排者按同格式记一行。
> 主备规则（2026-09-11用户定）：主用额度受限/流量用完时，编排者在同一角色内自行切备用（用户已授权名单内切换，不算自作主张）；切换记HANDOFF+账本备注，主备均超限则停派找人，不静默扣费。

| 角色 | 主用模型（精确ID，禁别名/前缀） | 备用模型（精确ID，同角色） | 执行通道/Runtime（可选，空=本窗口 subagent 原行为；有值由派工基础设施自动调用，TM 不手动开终端） | 备注 |
|---|---|---|---|---|
| task-manager | opencode-go/muse-spark-1.3-contributor | deepseek-v4.1-flash | codebuddy（PI智能体B通道，待真测，启用前主备均超限按停派找人） | 备用=B通道codebuddy显式传参（`--model deepseek-v4.1-flash --effort high`），档位high写口头；磁盘现状pi默认glm/codebuddy默认hy3，B非默认必须显式调 |
| supervisor | opencode/muse-spark-1.3-contributor-free | opencode-go/muse-spark-1.3-contributor | —（默认本窗口 subagent） | 主用live已核（provider `opencode`）；备用=GO Spark |
| builder | deepseek-v4.1-flash | opencode/muse-spark-1.3-contributor-free | codebuddy（PI智能体B通道，待真测；A=Bridge已测保留可切回见规则） | 主用=B通道（用户定，A已测保留）；备用=FREE Spark live已核 |
| planner | codex/gpt-5.6-sol | opencode-go/muse-spark-1.3-contributor | —（默认本窗口 subagent） | 拆活；备用=GO Spark |
| code-reviewer | codex/gpt-5.6-terra | opencode-go/glm-5.3-flash | —（默认本窗口 subagent） | 复核；备用=原主用 |
| qa | opencode/mimo-v2.5-free | opencode-go/mimo-v2.5 | —（默认本窗口 subagent） | 测试；主live已核（provider `opencode`）；备=GO base（非Pro，live已核，另有`mimo-v2.5-pro`独立勿混） |
| product-reviewer | codex/gpt-5.6-luna | opencode-go/muse-spark-1.3-contributor | —（默认本窗口 subagent） | 备用=GO Spark |
| experience-recorder | opencode/mimo-v2.5-free | opencode-go/mimo-v2.5 | —（默认本窗口 subagent） | 记一句；主live已核；备=GO base（非Pro） |
| neat-freak | opencode/muse-spark-1.3-contributor-free | opencode-go/muse-spark-1.3-contributor | —（默认本窗口 subagent） | 备用=升GO同样模型；主live已核 |
| senior-expert | codex/gpt-5.6-terra | codex/gpt-5.6-sol | —（默认本窗口 subagent） | 只接升级任务，平时不派；备用=原主用 |

规则（2.1仅保留）：
- 精确ID：`gpt-5.6`别名指Sol，禁用；必须写全 `codex/gpt-5.6-terra`。codex CLI实调用剥 `codex/` 前缀用短名（如 `-m gpt-5.6-terra`，已真测PASS），表内全ID为ORCA路由ID（短名直调全ID必400，非模型故障）。
- 池子：各行按表走，不串池（builder主用B走codebuddy，A=Bridge保留可切回；TM主用只走 OPENCODE_GO，备用B按用户定名单例外、B真测前不静默切）；换池须改表。
- 档位（如 medium）写在派工口头指令里，模型列只写精确 ID。
- 备用你定；不静默扣费（主备均超限则停派找人）。
- 分工：sol 偏拆活/兜底升级，builder 通道双轨：A=Bridge（`deepseek-flash` via `deepseek-bridge`，已测）/B=codebuddy（`deepseek-v4.1-flash --effort high`，待真测），当前主用B（用户定），A保留可切回（显示名称按用户口径；机器配置以已验证精确 ID 为准，不编 rank 分数）；池映射：FREE=opencode/（Zen，live核无`opencode-free` provider），GPT_PRO=codex/，GO=opencode-go/，BRIDGE=deepseek-bridge/，PI=codebuddy/；超限切备用=编排者在同角色备用内自动切并记账，主备均超限停派找人。
- DeepSeek Bridge 通道（2026-09-11 已验证正式通道，非占位；A通道已测保留，当前主用为B见下条）：A通道下模型列填精确 ID `deepseek-flash`（DeepSeek V4.1 Flash 正式调用名，provider=deepseek-official）、「执行通道/Runtime」列填 `deepseek-bridge`；route=`deepseek-bridge/deepseek-flash` 只记备注禁入 Model 列。旧 `deepseek-bridge/deepseek-v4-flash` 为兼容 alias 不得再作新默认；禁编造 `deepseek-official/xxx`、`deepseek-v4.1-flash`、测试期 `deepseek-v4.1-flash-expires-on-0910` 或任何未经验证的模型 ID；用户改表或口头仍可临时覆盖单任务主用/备用（换模型/换Runtime开新链），编排者仅在用户已授权备用名单内自行切换、不新建 Registry。依据：`V2.1_BRIDGE_INTEGRATION_CONTRACT.md` §1 三元组＋官方 2026-09-10 发布＋真链 Probe。
- DeepSeek V4.1 Flash 双通道备注（2026-09-11用户定，勿混勿删，留测待切）：A=DeepSeek Bridge通道（上条，精确ID `deepseek-flash`，Runtime `deepseek-bridge`，已测过）；B=PI智能体通道（pi默认/codebuddy，显示名 `deepseek-v4.1-flash`，精确ID暂按 `deepseek-flash` 记、档位如high写口头不进模型列，Runtime是否填 `pi/codebuddy` 待测后定）。A/B同模型不同通道，表内混写一律以本条为准拆分；两者都保留，后续可切换；测试只测B（A已测过），B只读探针 `codebuddy --model deepseek-v4.1-flash --effort high --help` 已rc=0，真可达（`-p ping`）耗额度待用户另批后再测；主备归属已定（当前主用B，A保留可切回）。
- 派工显式（2026-09-11用户定）：编排者每派必先贴一行“正在调用 XX｜主用精确ID（池）／备用精确ID＋Runtime”，收工必贴“XX回来了 PASS/FAIL＋实际走主还是备”，HANDOFF执行链＋账本记同一行；真机实时徽章做不到，用文字心跳代替。
- FREE耗尽整批升GO（2026-09-11用户定，触发式）：当用户说“FREE用完了”，所有主用含 `opencode-free/` 的行，主用整批升GO同样模型（Spark FREE→`opencode-go/muse-spark-1.3-contributor`，mimo FREE→GO mimo精确ID按表内备用行），备用列不动；触发后编排者按新主用派工并记HANDOFF+账本，不静默扣费；FREE恢复是否切回由用户再说一句定。
