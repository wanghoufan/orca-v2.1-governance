# USER_MODEL_OVERRIDE｜2.1 一句话切模型（优先于 registry 兜底）

> 你改这张表就生效，不用走 promotion/sync/run-all。编排者每次派工前读一次。
> 窗口说一句也一样：“Builder主用XX，备用YY”，编排者按同格式记一行。
> 主备规则（2026-09-12整改版，替代09-11主备对调口径）：主用受限时按表切同角色备用并记HANDOFF+账本；主备均不可用则停派找人，不静默扣费，不自动进GO。

| 角色 | 主用模型（精确ID，禁别名） | 备用模型（精确ID，同角色；无=停派找人） | 执行通道/Runtime | 备注 |
|---|---|---|---|---|
| task-manager | opencode/muse-spark-1.3-contributor-free | deepseek-v4.1-flash | 本窗口 subagent（备切codebuddy） | 每项目常驻编排者；备用为同表可选切备，切备记账；无可用通道停派找人 |
| supervisor | deepseek-v4.1-flash | 无（无自动备用） | codebuddy | 监督复检；档位high写口头；超限停派找人 |
| builder | deepseek-v4.1-flash | 无（无自动备用） | codebuddy | 普通开发主力；档位high写口头；超限停派找人 |
| planner | codex/gpt-5.6-sol | 无（无自动降级） | codex | 第一阶段产品Planner；超限停派找人 |
| code-reviewer | deepseek-v4.1-flash | 无（无自动备用） | codebuddy | 独立Review Session；档位high写口头；超限停派找人 |
| qa | deepseek-v4.1-flash | 无（无自动备用） | codebuddy | 测试/回归/DoD；档位high写口头；超限停派找人 |
| product-reviewer | opencode/muse-spark-1.3-contributor-free | 无（无自动备用） | 本窗口 subagent | Phase1按需Research Review，不常驻；超限停派找人 |
| experience-recorder | deepseek-v4.1-flash | 无（无自动备用） | codebuddy | 收尾低频；档位high写口头；超限停派找人 |
| neat-freak | deepseek-v4.1-flash | 无（无自动备用） | codebuddy | 收尾低频；档位high写口头；超限停派找人 |
| senior-expert | codex/gpt-5.6-sol | 无（无自动备用） | codex | 只接升级任务，平时不派；超限停派找人 |

规则（2026-09-12整改版）：
- 精确ID：Sol必须写全 `codex/gpt-5.6-sol`，禁裸别名；V4.1必须写全 `deepseek-v4.1-flash`；FREE必须写全 `opencode/muse-spark-1.3-contributor-free`；codex实调用剥 `codex/` 前缀用短名，表内仍记全ID为ORCA路由ID；不编rank分数。
- OPENCODE_GO = MANUAL_ONLY：GO不得作为任何角色主用/备用；一切受限只按表切同角色备用或停派找人，禁自动进GO；只有用户明确说“这次可用GO”才允许单次启用，不写表、不留自动条件。
- V4.1统一：主动CodeBuddy路由只许 `deepseek-v4.1-flash`；档位high只写派工口头，不进模型列。
- Bridge standby：历史Contract（包根 `V2.1_BRIDGE_INTEGRATION_CONTRACT.md`，只读核对，不改）内已验证 `deepseek-flash` 降为standby历史路由，仅用户明确切回时启用，不进主动表、不作新默认。
- B通道-y：codebuddy非交互派单默认带`-y`；无-y时Bash审批被拒且rc仍为0，自测验成功只看正文回显不看rc；派工显式必须标注`-y`已带，漏标打回。
- 派工显式：编排者每派必先贴一行“正在调用 XX｜主用精确ID＋Runtime／备用精确ID＋Runtime”，收工必贴“XX回来了 PASS/FAIL＋实际走主还是备”，HANDOFF执行链＋账本记同一行。
- 超限口径：主备均不可用即停派找用户，不静默扣费；换模型/换Runtime用户定，换通道开新链记HANDOFF＋账本；槽位不经改表不得擅自顶替。
