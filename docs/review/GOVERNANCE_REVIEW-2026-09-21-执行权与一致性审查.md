# ORCA 治理体系审查报告丨2026-09-21（执行权与前后一致性）

审查范围：`AGENTS.md`、`USER_MODEL_OVERRIDE.md`、`README.md`、`GOVERNANCE_VERSION`、`经验一句话.md`、`docs/roles/`（11卡）、`docs/prompts/`、`docs/pm|qa|review|handoff|model|sop|templates`、`新项目模板包/`、`老项目迁移模板包/`、`scripts/`、`skills-lock.json`、`.agents/skills/`。
判定基准：`USER_MODEL_OVERRIDE.md` 为模型真相源；`AGENTS.md` 为规则真相源；两者冲突听表（AGENTS 模型节）。本次为工作区现状审查（含未提交变更，`git status` 非空，见 §验证说明）。

## 一、执行权总览（能执行，但最高裁决规则当前自我失效）

| 权力项 | 归属 | 依据 |
|---|---|---|
| 唯一对人说话 | task-manager | `AGENTS.md:15`、TM 卡 `:3` |
| 只对编排者说话（编排者失联时除外） | supervisor | `AGENTS.md:15` |
| Phase 状态唯一源 / 三口令字面匹配 | TM 持有，HANDOFF 落盘 | TM 卡 `:9`、HANDOFF.template `:6-11` |
| 默认主链派工 | Builder→Reviewer→QA→Supervisor→TM | `AGENTS.md:8,37` |
| 不经 Human Gate 的专项直派直收 | db-admin（TM 直派直收，用户不中转） | `AGENTS.md:30,44`、TM 卡 `:12` |
| 禁止 builder 直聊用户；permission_request 单点 | builder→TM→用户→runtime | `AGENTS.md:40` |
| 换模型决策权 | 用户；表内无备用列；改表必真调 | `AGENTS.md:45` |
| commit/push | 需编排者明确指令（含分支名）；`ext/` 前缀给外部者 | `AGENTS.md:76` |
| 质量判定 vs 推进判定 | supervisor 链 vs 总监督（体系外、wake-only、不占位、无派工权） | `AGENTS.md:78` |
| 技术 vs 范围分歧终裁 | 技术听 code-reviewer，范围听 TM | `AGENTS.md:38` |

评价：分权设计完整，TM—supervisor 独立性有明确重申。但 P0-1 使“冲突以表为准”失去唯一基准（表在 HEAD 与工作区有两个版本），supervisor“实派==表”抽查（supervisor 卡 `:25`）当前无可依的单一真相源，执行权链条在派工源头即分叉。

## 二、P0（阻塞执行，必须先修）

### P0-1 工作区改表无记录，造成模型真相源分裂
- 工作区 `USER_MODEL_OVERRIDE.md:7,10,11`：planner=`opencode-go/muse-spark-1.3-contributor`/opencode；qa=`codebuddy/deepseek-v4.1-flash`/codebuddy；product-reviewer=`opencode-go/muse-spark-1.3-contributor`/opencode。
- HEAD 已提交决策（`HANDOFF.md:§30-§38`）：product-reviewer=Terra（§30）、builder=codebuddy 主备链（§31/§37）、qa 双态=Luna+本窗口直驱（§32/§38）、planner/senior=Sol。工作区改动回滚了 §30/§38 且无新 HANDOFF 节、无真调证据，违反“改表必真调”“换谁用到几时用户定”（`AGENTS.md:45`）。
- 连带冲突：`README.md:15`（qa=Luna via codex、product=Terra、planner/senior=Sol）站在 HEAD 一边，被工作区表孤立；`docs/roles/qa.md:7`“普通QA走 codex Luna”与工作区 qa 行 codebuddy 直接打架；`docs/roles/planner.md:6` 硬编码 `codex/gpt-5.6-sol` 与工作区 planner 行 muse-spark 打架。按字面派工必错一路。
- 建议：二选一并留痕。(a) 维持 HEAD（Terra/Luna/Sol），工作区表回退；(b) 真要换 muse-spark/deepseek，补用户指令＋真调 pong 证据＋HANDOFF 新节＋同步 README/qa 卡/planner 卡。未定前任何派工都应停（supervisor 抽查无基准）。

### P0-2 母版↔两包同步破裂（check-sync SYNC-FAIL）
- 实测 `sh scripts/check-sync.sh`：`AGENTS 非预期差: 新/老包各 4 行`，`DIFF: USER_MODEL_OVERRIDE.md`、`docs/sop/android*.md`、`webqa.md`、`经验一句话.md`，尾部 `SYNC-FAIL`。`AGENTS.md:61`“非预期差零容忍”被违反。
- 两 `*.zip` 已删（`git status` 显示 D），但 `README.md:59` 仍广告“可复制压缩包”，用户按导航找不到文件。
- `新项目模板包/docs/plan/` 为空目录残留（母版无此目录，系历史残留）。
- 建议：定一条——删 zip 就同步改 README（含改名对照加“已删，见 git 历史”）；要保留分发物就重建 zip 并验解压。sop/android/webqa 要么进包（补包内文件＋README＋迁移清单），要么明确“母版独有、包外提供”。空 `plan/` 删掉。

### P0-3 角色计数名实不符
- `AGENTS.md:3` 标题“固定 9+1＋1 专项”；`:13` 正文“9 常驻 + 1 升级专用”；`:15` 实际列出 11 个 ID（9 常驻＋senior＋db-admin）；`:78` 总监督“不占9+1”未同步＋1。
- 建议：全文件统一为“9＋1＋1（9 常驻＋senior 升级专用＋db-admin 专项）”，红线改为“不占 9＋1＋1”。角色卡 `roles/` 实 11 张，`README.md:30` 已写 11 张，一并核对。

## 三、P1（会误判/派错，修 P0 时顺手修）

- P1-1 qa 卡具名与“见表为准”并存：`qa.md:6` 见表、`qa.md:7` 具名 Luna。表一切换即炸（本次 P0-1 现场）。建议具名句改为“当前普通 QA 走 Luna（以表为准，表改即跟）”或删具名。
- P1-2 planner/senior 硬编码 Sol（`planner.md:6`、`senior-expert.md:4`）与工作区表分裂（见 P0-1）。建议两卡删硬编码 ID，只留“读表，冲突以表为准”（如 supervisor/builder 卡体例）。
- P1-3 db-admin 工作区名差一字：表 `000-alw-数据库管理专家仓`（override `:15`）vs 卡 `000-alw-数据库管理专家`＋“仓”在句外（`db-admin.md:4`，三包一致）。另 `HANDOFF.md:§35` 称工作区＋Luna/codex，与现表 opencode GO 不一致（§36 称免检但无证据行）。建议统一全称为“仓”，HANDOFF 补一行现势口径。
- P1-4 HANDOFF 编号重复＋§1 过期：`§34/35/36/37/38` 各出现两次（治理序号与 PC 环境笔记重号，`HANDOFF.md:249-309`）；`§1` 分工表段仍写旧口径（builder=deepseek/opencode 单通道、qa=Luna/本窗口），与 §37/§38 及工作区表三方对不上。建议重号 PC 笔记为 §39 起（或归档移出主 HANDOFF），§1 重写为现势或标“以表为准，此处不复述”。
- P1-5 sop 接线缺 android/webqa：`AGENTS.md:76` 红线列 4 件（缺 webqa）；`README.md:35` sop 行只列三件；迁移提示词 `:13` sop 清单只列三件。`docs/sop/android.md`、`webqa.md`、`android-machine-profile.md` 处于“有文件、无接线、无包”状态，且三文件未跟踪（`git status ??`）。建议：AGENTS/编排者 `:19`/README/迁移清单统一为 5 件（或明确 android/webqa 为母版独有），落盘后两包同步。
- P1-6 主备链记账口径空洞：builder 主→备（`override:7`）切换后，`DISPATCH.used` 仍“恒填主”（`AGENTS.md:45,60`、supervisor `:38` 非主即打回），切备的真实轨迹无法合规记录。建议二选一：(a) 维持 used 恒主，切备记 `note`＋HANDOFF，不改校验；(b) used 枚举加 `备` 并同步 supervisor 断言。当前 builder 切备与 used 恒主并存即 P1。
- P1-7 外部提示词边界过宽：`外部开发者提示词.md:16`“根全部 *.md＋GOVERNANCE_VERSION＋docs/ 一律不动”，按字面连 TM/迁移工的合法根变更也被禁。建议加豁免主语：“外部者不动；TM/迁移整理按各自提示词动”。
- P1-8 账本示例过期：`TASK-MODEL-LOG.jsonl` 示例 `model=opencode-go/deepseek-v4.1-flash/role=builder` 与现 builder 行（codebuddy 主备）脱节；DISPATCH 示例仅 experience-recorder，无 db-admin/双态 qa 示例。建议示例换现行主用并加豁免注（呼应复审 P1-5）。

## 四、P2 与优化（不阻塞，建议攒单）

1. 迁移提示词第 0 步写死本机绝对路径（`:11-12`，自声明“本机专用”）却随包分发；他机必改。建议改为占位符 `<治理仓库根>/老项目迁移模板包`＋填表示例，母版保留本机路径仅作示例。
2. 总监督提示词 1879 行正文（规范版本 V1.1，`:15`）与顶部收编说明并存；去版本号政策下“V1.1”易被 `rg` 误报。建议冻结件加标准豁免注（sop 三件已有类似注，可复用句式）。
3. 旧审查三报告（09-13 现行/分工追审/09-15 复审）与本报告并存，`README.md:38` 称旧报告“已删”已过期。建议 README“已删除”节补本轮之前三报告的去留，本报告明确优先级（本报告为现势，旧报告为历史）。
4. `scripts/check-sync.sh` 用法未文档化（`python3` 直接跑报 SyntaxError，须 `sh` 跑；本轮已验证）。建议 README 或脚本头加一行“`sh scripts/check-sync.sh`，SYNC_OK 才算过”。
5. `temp/`、`skills-lock.json`、`.agents/skills/agent-browser` 未跟踪且无去留说明；qa 卡 BrowserOS 链路依赖 `~/Library/...BrowserClaw` 本机路径，与“禁硬编码 endpoint”（`qa.md:12`）的配套说明建议落 `webqa.md` 一处，qa 卡只引不复述。
6. sop 三件头部版本注已按复审建议加注（docker/supabase/sqlite 头部在位，已验）；android/webqa 头部无此注，建议补齐同一句式，终结 `rg` 版本误报。

## 五、验证说明

- 未改业务代码；本报告仅文档审查，新增文件仅本报告。
- 已实测：`sh scripts/check-sync.sh`（SYNC-FAIL 原文见 P0-2）；`git status --short`（工作区 M 12 件、D 2 zip、?? 8 件：db-admin×3、android/webqa×3、skills-lock、temp 等）；`git diff HEAD`（override/planner/qa/product-reviewer 四行级回滚，README 站 HEAD 边）；`grep` 核对 runtime 枚举、Sol 硬编码、000-alw 差一字、HANDOFF 重号。
- 假设：override 表应为单一真相源、HEAD 决策（§30-§38）有效。若用户实际意图是以工作区表为准，则 P0-1 裁决反转，但仍须补 HANDOFF＋真调＋README/卡同步，工作量不变。
- 与旧报告关系：09-15 治理审查与复审的 P0-1（Contract）、P0-2（FREE）等已闭环，不再重列；本轮 P0 均为新tta（工作区改表分裂、同步破裂、计数不符）。
