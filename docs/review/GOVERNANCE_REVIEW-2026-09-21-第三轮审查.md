# ORCA 治理体系审查报告丨2026-09-21（第三轮）

审查范围：`AGENTS.md`、`USER_MODEL_OVERRIDE.md`（母版＋两包）、`README.md`、`GOVERNANCE_VERSION`、`经验一句话.md`、`docs/roles/`、`docs/prompts/`、`docs/sop/`（含新增 decision-router.md）、`scripts/decision/`（新增）、`scripts/check-sync.sh`、`docs/handoff|model|pm|qa|review|templates`、两模板包。
与上轮关系：第二轮 P0-1/P0-2（母版表倒置：丢 db-admin 行、丢 qa 双态备注）已由 T3 提交（`9d1079c`＋`c31a8e6`）关闭——母版表现 11 行双态＋db-admin，与两包表、AGENTS（workdir）、README（workdir）、角色卡一致。本轮 P0=0；下文为复验仍成立项＋新增项。

## 一、执行权总览（“以表为准”恢复可执行，新增建议权需立规）

TM 唯一对人、supervisor 只对 TM、builder 不直聊用户、permission 单点、换模型用户定、不 push 无指令、db-admin 直派直收、总监督 wake-only——框架无变化。模型真相源三方（母版表＝包表＝文档口径）已收敛，supervisor“实派==表”抽查恢复基准。
新增 Decision Sidecar（`scripts/decision/orca-decide.mjs`＋`docs/sop/decision-router.md`＋TM 卡“模糊分叉”句）引入体系外建议权：自声明“Jev=建议、规则=权限、advisory_only、不进主链、不改表”（`scripts/decision/README.md:4,12`），方向正确，但授权链不完整（见 P1-1）。在其解锁（现 BLOCKED，`JEV_NEEDS_CARD`）之前，主链执行不受影响。

## 二、P1（影响派工正确性或门禁公信力）

- P1-1 Decision Sidecar 授权链缺三环。① AGENTS 无字：TM 卡（workdir）授权 TM 在“规则无唯一答案”时调外部 CLI，AGENTS 全文无 decision 字样——角色卡授权了全员规则未授权的外部调用权；② 无 HANDOFF 记录：`grep decision HANDOFF.md` 零命中，新增外部依赖＋付费 API（Vercel 403 需绑卡，`scripts/decision/README.md:3`）＋第三方外发（state.json 出境）无用户批准记录，与“烧额度先批”“换模型用户定”同源铁律悬空；③ 无 supervisor 审计位：advisory 采纳与否谁复核未定（“调用方 TM 负责”一句不足以替代复检）。另文档口径小裂：`decision-router.md:5` 称直调 `api.typesafe.ai`，README 称 Vercel 403/Gateway——二者关系未交代一句。建议：HANDOFF 补立项节（含付费/绑卡用户批准）；AGENTS 或 TM 卡补“supervisor 抽查 advisory 采纳记录”；二选一统一 endpoint 表述。解锁前不派真实调用（README 已自限 BLOCKED，维持即可）。
- P1-2 check-sync 白名单过期＋覆盖盲区。① 白名单（`:4` 注释称仅 `:36` 一处、markers 应为 2）已过期：实测 `AGENTS 非预期差 (4 行）`，`diff` 显示为 `:37` 路径前缀差＋`:76` sop-android 内容差两处——行号漂移＋第二处合法裸名差，门禁现对合法布局差误报 SYNC-FAIL；② 覆盖盲区：`docs/prompts/`、README、`scripts/decision/` 不在校验范围——本轮已实证漂移：母版协议收编说明仍“十卡”（`:4`），两包协议已改“十一卡”（包 diff 已验）。建议：白名单更新为 :37＋:76（或 diff 前归一化包根前缀）；校验范围加 prompts（至少收编说明三行）＋decision sidecar 三件；README 差异若属有意（包 README 为搬运清单体裁，见 P1-4），在脚本注释写明豁免。
- P1-3 母版协议 vs 包协议角色数分叉（P1-2 的实例，单列因直接决定“以 roles/×卡为准”）：母版“十卡”、包“十一卡”。建议跟随 AGENTS（workdir 已 9+1＋1）：母版改十一卡，或明确包多一卡的原因并记 HANDOFF。
- P1-4 新构件未进迁移／搬运清单（F-01 复发）。`db-admin.md`、`decision-router.md`、`scripts/decision/` 三者在母版＋两包均已就位，但：老包 README 搬运清单 sop 行仅三件（`grep` 实测 `:18`），两包 README 无 db-admin/decision 字样；迁移提示词 `:13` 清单 sop 仅三件、无 decision-router 去向、无 `scripts/decision/` 去向（只写了含糊的“scripts/”）。按清单搬运必丢新构件。建议：三处清单（两包 README＋迁移 `:13`）补“文件＋落位路径”成对条目（沿用 F-01 教训格式）。
- P1-5 角色计数仍三处不一：AGENTS 标题“9+1＋1”（workdir 已改）vs `:13`“9 常驻 + 1 升级”vs `:78` 总监督“不占9+1”（两处未动，diff 已验）。建议统一“9＋1＋1”，红线同步；协议收编说明见 P1-3。
- P1-6 HANDOFF 编号 34–38 重复已提交固化（`grep ^##` 实测 14 命中；HEAD 止 §33 时工作区 10 节一次落盘）。 `git` 可改但历史已脏，建议：冻结声明（此 10 节编号保留，以标题区分）＋新节从 §39 起，不再重排旧号。
- P1-7 sop 接线仍残缺：AGENTS（workdir `:76`）列 4 件（缺 webqa、decision-router）；`android.md`、`webqa.md` 母版未跟踪、包内缺失（`git ls-files`＋包 `ls` 已验）。（中央 `~/.agents/rules` 为软链指回母版，非第二真源，不并列。）建议：`git add` 落盘三件（或移出并删引用）＋AGENTS 红线补全。
- P1-8 used 恒填主 vs builder 主备链（两轮延续）：切备后无合规记法（AGENTS `:45,:60`、supervisor `:38` 非主即打回）。建议 used 加 `备` 枚举或“切备记 note＋HANDOFF”二选一。
- P1-9 T3 注释（母版表 `:17`）：【已关闭】用户定保留作回退用（措辞已改过），不再跟。

## 三、P2 与优化

1. 经验包落后 3 条：母版 14 条（`grep -c`），包 11 条（diff 已验 `16,18d15`）。母版改即同步，要求同步。
2. TASK 示例仍过期：`role=builder/model=opencode-go/deepseek-v4.1-flash`，现 builder 为 codebuddy 主备链（三轮延续）。
3. 迁移提示词 `:11-12` 写死本机绝对路径（三轮延续）。
4. 外部提示词 `:18`“根全部 *.md＋docs/ 一律不动”仍过宽（三轮延续，加豁免主语）。
5. `scripts/decision/node_modules/` 已在 disk、`.gitignore` 忽略规则未提交（workdir M）；lock 文件去留随 ignore 落盘即可，node_modules 禁入仓（已满足，只差提交）。
6. 报告五代并存：09-13×2、09-15×2、09-21 第一轮／第二轮／本轮。建议本轮声明现势正典地位（本报告），旧四份转历史。
7. HANDOFF §1 标题日期仍 “2026-09-16，现势”（`:17`），T3（09-21）后未更新现势行；“纯表零文字”在 T3 注释下仍不成立（沿用第二轮口径）。

## 四、验证说明

- 未改业务代码；新增文件仅本报告；有一处存量笔误修正需求：无（本轮未改包内文件）。
- 已实测：`git status`（M 13 件：AGENTS/README/编排者/TM＋包镜像＋协议包侧＋.gitignore；?? 12 件：两轮旧报告、db-admin×3、decision-router×3、scripts/decision×3、skills-lock、.agents）；`git show HEAD:AGENTS`（“10行”）vs HEAD 表 12 个 `^| `行（含表头，即 11 数据行）——HEAD 已存 10/11 矛盾，workdir 改“11行”方向正确；`sh scripts/check-sync.sh`（SYNC-FAIL，override 项已消，余 AGENTS 4 行＋android/webqa＋经验）；`diff` 母版↔包 AGENTS（仅 :37 路径＋:76 android 两处）；包协议 diff（十→十一卡）；`diff -q` sidecar mjs＋sop 三处一致；`grep`（HANDOFF decision 零命中、重号 14、经验 14、包 README 无 db-admin/decision、迁移清单无 decision、supervisor used/runtime 未变、协议母版十卡）。
- 基准：T3（11 行双态＋db-admin）为用户批准的现势（合并提交 `c31a8e6`）。
