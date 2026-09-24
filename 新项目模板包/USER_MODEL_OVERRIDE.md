# USER_MODEL_OVERRIDE｜一句话切模型

| 角色 | 模型（精确ID，照抄执行） | 执行通道 | 调用方式 |
|---|---|---|---|
| task-manager | 开窗口时定 | 本窗口 | 本窗口subagent直派，按开窗口时模型执行 |
| supervisor | opencode-go/muse-spark-1.3-contributor | opencode | 派工基础设施走opencode直调：`opencode run -m opencode-go/muse-spark-1.3-contributor "任务"`；表内记全ID，禁本窗口代做 |
| builder | volcengine-plan/ark-code-latest | opencode | `opencode run -m volcengine-plan/ark-code-latest "任务"`（控制台 deepseek-flash，`--data-class` 由 harness 供给）；表内记全ID，禁本窗口代做。限额停工→切 radeon-mimo/MiMo-V2.6-Flash `opencode run -m radeon-mimo/MiMo-V2.6-Flash "任务"`；再限额→停派喊人。 |
| planner | codex/gpt-6-sol | codex | 派工基础设施走codex直调；CLI用短名`gpt-6-sol`：`codex exec -m "gpt-6-sol" --skip-git-repo-check "任务" </dev/null`；表内记全ID，禁本窗口代做 |
| code-reviewer | codebuddy/glm-5.3-flash | codebuddy | `codebuddy --model glm-5.3-flash --effort high -y -p "任务"`（非交互必带`-y`，验成功只看正文）；表内记全ID，禁本窗口代做 |
| qa | radeon-mimo/MiMo-V2.6-Flash | opencode | 派工基础设施走opencode直调：`opencode run -m radeon-mimo/MiMo-V2.6-Flash "任务"`；表内记全ID，禁本窗口代做。普通QA（回归/校验/DoD）走 AMD mimo；真机QA（adb/Expo）走本窗口 bash 直驱（开窗口模型，codex 沙箱必 BLOCKED 不硬闯），note 记分支，supervisor 不记偏离。 |
| product-reviewer | radeon-mimo/MiMo-V2.6-Flash | claude | 派工基础设施走claude直调（Claude Code，经本机 127.0.0.1:15722 代理 → AMD）：`ANTHROPIC_BASE_URL=http://127.0.0.1:15722 claude -p --model claude-sonnet-4-5 "任务"`（实际跑 MiMo-V2.6-Flash）；表内记全ID，禁本窗口代做 |
| experience-recorder | opencode/muse-spark-1.3-contributor-free | 本窗口 | 本窗口subagent直派 |
| neat-freak | opencode/muse-spark-1.3-contributor-free | 本窗口 | 本窗口subagent直派 |
| senior-expert | codex/gpt-6-sol | codex | 派工基础设施走codex直调；CLI用短名`gpt-6-sol`：`codex exec -m "gpt-6-sol" --skip-git-repo-check "任务" </dev/null`；表内记全ID，只接升级任务，禁本窗口代做 |
| db-admin | codebuddy/glm-5.3-flash | codebuddy | `codebuddy --model glm-5.3-flash --effort high -y -p "任务"`（非交互必带`-y`，验成功只看正文）；表内记全ID，禁本窗口代做。工作区固定本机 000-alw-数据库管理专家仓。 |

<!-- 分工表版本：T8（2026-09-23，product-reviewer→mimo；用户回退存档，模型忽略此行） -->
