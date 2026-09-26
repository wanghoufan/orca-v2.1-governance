# USER_MODEL_OVERRIDE｜一句话切模型

| 角色 | 模型（精确ID，照抄执行） | 执行通道 | 调用方式 |
|---|---|---|---|
| task-manager | 开窗口时定 | 本窗口 | 本窗口subagent直派，按开窗口时模型执行 |
| supervisor | opencode-go/muse-spark-1.3-contributor | opencode | 派工基础设施走opencode直调：`opencode run -m opencode-go/muse-spark-1.3-contributor "任务"`；表内记全ID，禁本窗口代做 |
| builder | codebuddy/deepseek-v4.1-flash | codebuddy | `codebuddy --model deepseek-v4.1-flash --effort high -y -p "任务"`（`deepseek-flash` 别名，实为 `deepseek-v4.1-flash`，非交互必带`-y`，验成功只看正文）；表内记全ID，禁本窗口代做。**超时策略**：codebuddy 常 10 分钟超时，超时先查工作区落盘——已落盘直接验（不重派），未落盘续派或转备通道。限额停工→切 codebuddy/glm-5.3-flash `codebuddy --model glm-5.3-flash --effort high -y -p "任务"`（同形）；再限额→停派喊人。 |
| planner | codex/gpt-6-sol | codex | 派工基础设施走codex直调；CLI用短名`gpt-6-sol`：`codex exec -m "gpt-6-sol" --skip-git-repo-check "任务" </dev/null`；表内记全ID，禁本窗口代做 |
| code-reviewer | codebuddy/glm-5.3-flash | codebuddy | `codebuddy --model glm-5.3-flash --effort high -y -p "任务"`（非交互必带`-y`，验成功只看正文）；表内记全ID，禁本窗口代做 |
| qa | codex/gpt-6-luna | codex | 派工基础设施走codex直调；CLI用短名`gpt-6-luna`，**QA 专用解禁沙箱**：`codex exec -m "gpt-6-luna" -s danger-full-access --skip-git-repo-check "任务" </dev/null`（`-s danger-full-access`＝关闭沙箱、给完整访问权，用于解端口绑定/网络限制，实测可绑 127.0.0.1 端口；仅限 QA 场景，其他角色禁带；表内记全ID，禁本窗口代做）。普通QA（回归/校验/DoD）走 codex Luna；真机QA（adb/Expo）走本窗口 bash 直驱（开窗口模型），note 记分支，supervisor 不记偏离。 |
| product-reviewer | opencode/muse-spark-1.3-contributor-free | 本窗口 | 本窗口subagent直派 |
| experience-recorder | opencode-go/space-bunny-free | opencode | 派工基础设施走opencode直调：`opencode run -m opencode-go/space-bunny-free "任务"`（限时免费模型，真调已过）；表内记全ID，禁本窗口代做 |
| neat-freak | opencode-go/space-bunny-free | opencode | 派工基础设施走opencode直调：`opencode run -m opencode-go/space-bunny-free "任务"`（限时免费模型，真调已过）；表内记全ID，禁本窗口代做 |
| senior-expert | codex/gpt-6-sol | codex | 派工基础设施走codex直调；CLI用短名`gpt-6-sol`：`codex exec -m "gpt-6-sol" --skip-git-repo-check "任务" </dev/null`；表内记全ID，只接升级任务，禁本窗口代做 |
| db-admin | opencode-go/space-bunny-free | opencode | 派工基础设施走opencode直调：`opencode run -m opencode-go/space-bunny-free "任务"`（限时免费模型，真调已过）；表内记全ID；工作区固定本机 000-alw-数据库管理专家仓，禁本窗口代做 |

<!-- 分工表版本：T20（2026-09-26，experience-recorder 切 opencode-go/space-bunny-free（限时免费，真调已过）；其余不变；用户回退存档，模型忽略此行） -->
<!-- TM 资格测试候选（A/B，2026-09-26；真调已过）：opencode-go/deepseek-v4.1-flash 与 opencode-go/mimo-v2.6-flash，Runtime=opencode；TM 行仍"开窗口时定"，主备由用户批准后按"改表→真调→记账"处理（见 docs/model/TASK-MANAGER-QUALIFICATION.md）。 -->
