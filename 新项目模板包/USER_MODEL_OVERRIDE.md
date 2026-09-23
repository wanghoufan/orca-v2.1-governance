# USER_MODEL_OVERRIDE｜一句话切模型

| 角色 | 模型（精确ID，照抄执行） | 执行通道 | 调用方式 |
|---|---|---|---|
| task-manager | 开窗口时定 | 本窗口 | 本窗口subagent直派，按开窗口时模型执行 |
| supervisor | opencode-go/muse-spark-1.3-contributor | opencode | 派工基础设施走opencode直调：`opencode run -m opencode-go/muse-spark-1.3-contributor "任务"`；表内记全ID，禁本窗口代做 |
| builder | 峰谷分流（见调用方式） | codebuddy/opencode | 空闲时段走 `codebuddy --model deepseek-v4.1-flash --effort high -y -p "任务"`（非交互必带`-y`，验成功只看正文）；高峰时段走 `opencode run -m volcengine-plan/glm-5.3-flash "任务"`。峰谷以北京时间为准：工作日 9:00-12:00、14:00-18:00 为高峰（法定节假日除外），其余为空闲。表内记双ID，禁本窗口代做。任一限额停工→切另一路（同形）；双路皆限→停派喊人。 |
| planner | codex/gpt-5.6-sol | codex | 派工基础设施走codex直调；CLI用短名`gpt-5.6-sol`：`codex exec -m "gpt-5.6-sol" --skip-git-repo-check "任务" </dev/null`；表内记全ID，禁本窗口代做 |
| code-reviewer | opencode/muse-spark-1.3-contributor-free | 本窗口 | 本窗口subagent直派 |
| qa | codex/gpt-5.6-luna | codex | 派工基础设施走codex直调；CLI用短名`gpt-5.6-luna`：`codex exec -m "gpt-5.6-luna" --skip-git-repo-check "任务" </dev/null`；表内记全ID，禁本窗口代做。普通QA（回归/校验/DoD）走 codex Luna；真机QA（adb/Expo）走本窗口 bash 直驱（开窗口模型，codex 沙箱必 BLOCKED 不硬闯），note 记分支，supervisor 不记偏离。 |
| product-reviewer | codex/gpt-5.6-terra | codex | 派工基础设施走codex直调；CLI用短名`gpt-5.6-terra`：`codex exec -m "gpt-5.6-terra" --skip-git-repo-check "任务" </dev/null`；表内记全ID，禁本窗口代做 |
| experience-recorder | opencode/muse-spark-1.3-contributor-free | 本窗口 | 本窗口subagent直派 |
| neat-freak | opencode/muse-spark-1.3-contributor-free | 本窗口 | 本窗口subagent直派 |
| senior-expert | codex/gpt-5.6-sol | codex | 派工基础设施走codex直调；CLI用短名`gpt-5.6-sol`：`codex exec -m "gpt-5.6-sol" --skip-git-repo-check "任务" </dev/null`；表内记全ID，只接升级任务，禁本窗口代做 |
| db-admin | opencode-go/deepseek-v4.1-flash | opencode | 派工基础设施走opencode直调：`opencode run -m opencode-go/deepseek-v4.1-flash "任务"`；表内记全ID；工作区固定本机 000-alw-数据库管理专家仓，禁本窗口代做 |

<!-- 分工表版本：T4（2026-09-22，builder 峰谷分流：空闲 codebuddy-deepseek／高峰 volc-glm；用户回退存档，模型忽略此行） -->
