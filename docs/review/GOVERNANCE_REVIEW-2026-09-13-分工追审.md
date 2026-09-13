# ORCA 治理体系审查报告（2026-09-13 分工改版追审）

- 审查对象：母版根（`AGENTS.md`、`USER_MODEL_OVERRIDE.md`、`BRIDGE_INTEGRATION_CONTRACT.md`、`README.md`、`docs/roles/` 10卡、`docs/prompts/编排者提示词.md`、`docs/pm/`双模板、`docs/qa/BUGS.template.md`、`docs/review/`双模板、`docs/handoff/HANDOFF.template.md`、`docs/model/`双账本）＋两包抽查（10张角色卡、AGENTS、override）
- 方法：全量通读＋`rg`交叉核验＋`diff`/`md5`抽查。协议正文（1293行）只读收编说明＋grep关键引用，未逐行审；ZIP包内未拆验（以HANDOFF重建记录为准）。
- 结论先行：**P0=0，P1=3，P2=9，P3=4**。前轮（`GOVERNANCE_REVIEW-2026-09-13-现行`）的P1-1（升级口径）、P1-2（runtime补codex）、P2-1（REOPEN枚举）、P2-2（短名统一）、P2-3（Readiness指回正典）、P2-4（派工口通道分离）经本轮复验**均已落实，无回退**。
- 本轮问题根因单一：**09-13两次分工改版（HANDOFF §15改主用＋§17纯表化）只改了override表＋AGENTS模型节，6张角色卡＋TM卡＋编排者提示词＋README模型节＋账本示例行＋Contract激活指令未同步**，形成以override表为正典、多处旧口径并存的漂移层。

严重度：P0=照做必错且破坏交付；P1=口径冲突、照做会派错模型/通道或找不到引用；P2=规则缺/悬空引用/标签过时；P3=卫生/措辞。

---

## 1. P1：口径冲突（3项）

### P1-1 六张角色卡模型行＋三处主链陈述与override纯表不一致

- 位置：`docs/roles/builder.md:4`、`:11`、`code-reviewer.md:5`、`qa.md:6`、`experience-recorder.md:4`、`neat-freak.md:4`、`product-reviewer.md:5`、`task-manager.md:12`、`docs/prompts/编排者提示词.md:15`、`README.md:10/:16` vs `USER_MODEL_OVERRIDE.md:5-14`
- 事实（表为正典，`supervisor=V4.1/codebuddy`、`builder/qa/product-reviewer=Luna/codex`、`reviewer/recorder/neat=FREE/本窗口`、`planner/senior=Sol/codex`）：
  - builder/qa/reviewer/recorder/neat五卡默认文本仍写 `deepseek-v4.1-flash` via `codebuddy`，与表（Luna/codex 或 FREE/本窗口）直接打架，卡内虽有“冲突以模型表为准”一句兜底，但默认行即错；
  - product-reviewer卡反向漂移：卡写FREE本窗口，表写Luna/codex；
  - TM卡`:12`“默认V4.1 Builder→V4.1 Reviewer→V4.1 QA”、编排者`:15`“默认V4.1主链”、README`:10`“V4.1主链开发”`:16`“V4.1开发阶段主力（supervisor/builder/reviewer/qa/recorder/neat）”三处**无兜底句**，照字面会把builder/qa派去V4.1/codebuddy（错通道，烧错额度，且与AGENTS禁套娃红线相冲）。
- 修复：① 六卡模型行改为“见override表，不复述”（只留“冲突以表为准”，删硬编码ID，永绝此类漂移）；② TM卡`:12`、编排者`:15`、README`:10/:16`的“V4.1主链/主力”改为“默认主链（模型以override表为准）”，与AGENTS`:8/:36`已修口径对齐。

### P1-2 `override:25` 三处悬空引用（纯表化后文件仅14行）

- 位置：`docs/roles/builder.md:7`（“各通道专则见下＋override:25”）、`:8`（“见USER_MODEL_OVERRIDE.md:25”）、`docs/roles/supervisor.md:24`（“见override:25”） vs `USER_MODEL_OVERRIDE.md`（全文件14行，无25行；`-y`规则已散入各行“调用方式”列）
- 影响：照做找不到引用；`-y`铁律（codebuddy非交互必带）的出处断裂，新人可能漏`-y`导致派单被拒且rc仍0（经验已记此坑）。
- 修复：三处改为“见override表supervisor行调用方式（非交互必带`-y`）”或等效命名锚点，不再用行号。

### P1-3 AGENTS主备/GO语言 vs 纯表“无备用列”

- 位置：`AGENTS.md:43`（“`OPENCODE_GO = MANUAL_ONLY`（禁一切自动切备进GO，主备均不可用停派找人）…主动路由以override主用列为准…现达额度限额暂由Luna/FREE顶替”） vs `USER_MODEL_OVERRIDE.md:5-14`（§17纯表化后仅4列：角色/模型/执行通道/调用方式；HANDOFF §17确认额度/备用/主备/GO/MANUAL_ONLY全表零命中）
- 矛盾：① “主用列”在表中已不存在（无主/备列）；② “切备/主备均不可用”无表列承载——当前Luna/FREE顶替到底算“主”还是“备”，`DISPATCH-LOG`的`used主或备`枚举（AGENTS`:58`）无法填写，supervisor抽查“三处对得上”失去基准。
- 修复（二选一，需用户拍板）：A. 恢复备用列（回退§17部分结论）；B. AGENTS`:43`改纯表语（“换人用户直接改表；used枚举重定义，如 实派模型==表即主”），并同步DISPATCH schema说明。**在拍板前，任何“切备/转备”判定均无依据，supervisor遇到used争议只能打回问TM。**

---

## 2. P2：规则缺与标签过时（9项）

- P2-1 **Bridge激活指令不可执行**：Contract §0/`§18.1`称“override表builder行A通道写法（模型列`deepseek-flash`＋Runtime列`deepseek-bridge`）即启用”，但纯表无A通道列、无`deepseek-flash`、无`deepseek-bridge`行；AGENTS`:43`“只许Bridge历史/standby语境”＋DISPATCH枚举保留`deepseek-bridge`＋编排者`:10`保留Bridge句。Bridge处于“名义保留、无法启用”状态。修复：留则在Contract补“纯表下启用法”（哪行改哪两格），退则删DISPATCH枚举与AGENTS`:43`后半句。
- P2-2 **PRODUCT_PLAN.template缺REOPEN值**：`HANDOFF.template:6`枚举4值（含`PLAN_REOPEN_REQUIRED`），`PRODUCT_PLAN.template:4`枚举仅3值。Change C期间Plan自身填不了REOPEN。修复：PRODUCT_PLAN`:4`同步加第4值。
- P2-3 **qa卡Canary标签过时**：`qa.md:4`“七项全过才写‘V4.1真机QA已启用’”，现QA主用Luna，且跨模型复测已证CUA-MAC-1与模型无关。修复：改为模型中立“真机QA已启用（附模型精确ID＋Runtime）”。
- P2-4 **builder卡“停V4.1链”过时**：`builder.md:11`“即停V4.1链升senior”，现builder走Luna/codex链。修复：改为“停原链”。
- P2-5 **senior卡缺停线句**（历史P3-5未闭环）：`senior-expert.md`无“接手后被supervisor打回2次即停线找人”（AGENTS升级节有）。修复：补一句。
- P2-6 **TM行非ID与“精确ID禁别名”字面冲突**：override TM格为“开窗口时定”，AGENTS`:43`“精确ID，禁别名”无例外说明。修复：AGENTS`:43`补“（TM行例外：开窗口时定）”。
- P2-7 **账本示例行教错首单**：`TASK-MODEL-LOG.jsonl`示例`role=builder`配`model=deepseek-v4.1-flash`（现应Luna）；`DISPATCH-LOG.jsonl`示例`role=experience-recorder`配`runtime=codebuddy`（现应本窗口）。修复：示例行换为当前主用（builder/Luna/codex；recorder/FREE/本窗口）。
- P2-8 **协议脚本名悬空**（历史P2-5未闭环）：协议`:1145/:1149`引用`coordinator-watchdog.sh`/`coordinator-supervision-loop.sh`，实盘仅`coordinator-watchdog-standalone.sh`；`:1150/:1171`的`coordination/STATE.md`无模板下发；收编说明未覆盖。修复：收编说明补“脚本名以现行standalone为准；STATE.md外部编排时自建（或补模板）”。
- P2-9 **包README双表＋措辞**（历史P2-6未闭环）：`新项目模板包/README.md`主表9项＋同步补记8项分两处，照主表拷漏件；“确认…链接目标”实为拷贝；归位表去向“项目根或docs/templates”未写死。修复：合并一表，改“文件位置”，写死去向。

## 3. P3：卫生项（4项）

- P3-1 行号引用脆弱：P1-2即现实例证；建议全体系改命名锚点（表角色行/节标题），不再用`:行号`。
- P3-2 Contract标题残留版本名：`# V2.1_BRIDGE_INTEGRATION_CONTRACT`（文件名已去版本，正文取证史冻结可不动，仅标题行可同步）。
- P3-3 AGENTS`:43`“主动表10行以新表为准”中“新表”指代不明（有何旧表？）。建议删半句，径写“以override表为准”。
- P3-4 参考快照形状过期：`docs/model/模型分工工作量排名-2026-09-13-参考.md` §六快照含“备用”列，与纯表方向相反；虽声明不随日常更新，仍建议加脚注“形状为改版前快照，现行以override表为准”。

---

## 4. 优化建议（5条）

1. **卡内模型零复述**：角色卡模型行一律只写“见override表×行”，正文禁出现任何模型ID/通道名；README模型节改为“快照＋日期＋以表为准”。
2. **主备语二值化**（待用户拍板P1-3后）：工作仓/分发物、主/备定义各一句话写进AGENTS账本节，DISPATCH `used` 枚举同步。
3. **一致性自检脚本**：校验“卡内模型ID零命中（除supervisor/planner/senior三行待改）”“override Runtime ⊆ DISPATCH枚举”“无`:数字`悬空引用”，纳入回归。
4. **Bridge去留一次拍板**：留则补启用法，退则删枚举＋Contract包内拷贝（原件回业务仓）。
5. **母版↔两包diff脚本化**：现抽查10卡ZERO、override同md5（`27969fa4`）、AGENTS仅1行预期裸名差，仍靠手工；一条命令＋白名单替代HANDOFF手记。

## 5. 修复清单

- [ ] P1-1：六卡模型行去硬编码；TM卡`:12`、编排者`:15`、README`:10/:16`改“默认主链（以表为准）”
- [ ] P1-2：builder`:7/:8`、supervisor`:24`改命名锚点
- [ ] P1-3：用户拍板A/B后改AGENTS`:43`＋DISPATCH `used` 定义（二选一）
- [ ] P2-1：Bridge留/退拍板并同步Contract或删引用
- [ ] P2-2：PRODUCT_PLAN`:4`加REOPEN值
- [ ] P2-3：qa`:4`改中立标签；P2-4：builder`:11`改“停原链”；P2-5：senior卡补停线句
- [ ] P2-6：AGENTS`:43`补TM例外；P2-7：双账本示例行换现行主用
- [ ] P2-8：协议收编说明补脚本名句；P2-9：包README合表＋改措辞＋写死去向
- [ ] P3：锚点/标题/“新表”半句/排名脚注
- [ ] 改完同步两包＋重建ZIP＋跑账本断言（exit 0）

## 6. 实测证据

```sh
# P1-1 卡表对照（表：builder/qa/product=Luna, reviewer/recorder/neat=FREE；卡：六处旧口径）
rg -n "^- 模型" docs/roles/*.md
# builder/qa/reviewer/recorder/neat → deepseek-v4.1-flash via codebuddy（错）
# product-reviewer → muse-spark-free（错，反向）；supervisor/planner/senior → 对上
rg -n "默认.*V4\.1.*主链|V4\.1.*主力" docs/roles/task-manager.md docs/prompts/编排者提示词.md README.md
# TM:12 / 编排者:15 / README:10,16 命中（均无"以表为准"兜底）

# P1-2 悬空引用（文件仅14行）
wc -l USER_MODEL_OVERRIDE.md  # 14
rg -n "override:25" docs/roles/builder.md docs/roles/supervisor.md  # :7/:8/:24 命中

# P1-3 纯表无备用列，但AGENTS谈主备
rg -n "备用|主备|MANUAL_ONLY|主用列" USER_MODEL_OVERRIDE.md  # 零命中（§17已确认）
sed -n '43p' AGENTS.md  # GO/MANUAL_ONLY/主备/主用列/顶替 全在

# P2-2/P2-7/P2-8 取证
sed -n '4p' docs/pm/PRODUCT_PLAN.template.md  # 3值，无REOPEN
cat docs/model/TASK-MODEL-LOG.jsonl docs/model/DISPATCH-LOG.jsonl  # builder/V4.1, recorder/codebuddy
ls scripts/orchestration/  # 仅 coordinator-watchdog-standalone.sh + README.md

# 已落实复验（无回退）
sed -n '11p' docs/roles/builder.md  # 只算supervisor打回 ✓
sed -n '58p' AGENTS.md  # runtime含codex ✓
sed -n '6p' docs/handoff/HANDOFF.template.md  # 含REOPEN ✓
diff AGENTS.md 新项目模板包/AGENTS.md  # 仅1行预期裸名差
md5 USER_MODEL_OVERRIDE.md 新项目模板包/USER_MODEL_OVERRIDE.md  # 三方同 27969fa4（两包已验其一，另一同包）
```

*目标/剩P0/下一步：目标=分工改版后治理追审并落盘`docs/review/`；剩P0=0，剩P1=3（§1，需用户拍板P1-3 A/B与P2-1留/退）；下一步=先修P1-1/P1-2（纯文本同步，无分歧），再按拍板修P1-3/P2-1，P2/P3与下次常规改动同批。*
