# ORCA V2.1 治理复验报告（2026-09-11 复验，验收 P1P2 轮落地）

- 审查对象：同包（`GOVERNANCE_VERSION=2.1`）＋ P1P2 轮新增改动（override L9/L11/L22/L25-L29、supervisor:23、task-manager:7、HANDOFF:18/:28/:36、HANDOFF.template:14、AGENTS:47/:50/:62、2.1-更新说明补记、2.0-重塑说明:7、包根 `V2.1_BRIDGE_INTEGRATION_CONTRACT.md`、HANDOFF-override 修订/P1P2轮/存档/neat 节）
- 基线：本目录 `ORCA-V2.1-治理审查报告-2026-09-11.md §5`（修复清单）＋ 用户决策（P1-1=A 作用域、P1-2 现表化、P1-3=A 冻回_example、P1-5=A 监督独立、P1-7=A Contract 随包）
- 定位：本复验**不重复**主报告已闭环项，只回答三问——① P1-1→P1-7 真修好了吗 ② P2 批处理落地了吗 ③ 修的过程中引入新问题了吗。与主报告同日并存时：①② 以本复验为准，③ 以本复验 §2–§3 为准；主报告 §2（P1-1→P1-7 未修断言）自本文件落盘起被 supersede，读结论只看本复验 §1＋§5。
- 结论先行：**P1-1→P1-5、P1-7 ✅ 闭环（逐项实测通过），P1-6 ⚠️ 基本闭环剩 1 处 L22 残留（P2-A），P2 十项 8 落地＋sop 1 项用户明令 deferred＋permission 1 项半修（P2-B）。但 P1-7 的修法（Contract 随包）带进 1 个新 P1：Contract §0.1/§1-route/§16/§18.1 四处仍写旧 alias `deepseek-bridge/deepseek-v4-flash` 作 builder 槽位 ID 与账本 model 值，与 override L26 正典（`deepseek-flash`＋route 禁入 Model 列）分叉——Bridge 激活时按哪份填表两种答案。另带 9 个新 P2（多为“修好了 A、指回/标题/实例没跟上”的尾巴）。判定：不拦分发，修完 §2 的 1 个 P1 再冻结；§3 的 P2 可与 hygiene 轮合并。**

严重度口径沿用主报告：P1=特定条件必错/执行分叉；P2=口径差/stale/可优化。

---

## 1. 验收：P1P2 轮落地（6 闭环＋1 半修，证据）

| 项 | 验收动作 | 结果 |
|---|---|---|
| P1-1 禁令作用域 | 读 override:26 | ✅ 已为“禁把 `deepseek-v4.1-flash`（PI 显示名）填入 Bridge 模型列…PI 通道允许（见下条）”；`rg deepseek-v4.1-flash` 命中 :9/:11/:25/:27 均为 PI 位，无 Bridge 位 |
| P1-2 触发前缀 | 读 override:29＋`rg opencode-free` | ✅ 已为“含 `opencode/` 且以 `-free` 结尾（旧视为 `opencode/`）”＋两对现表举例；数据行零 `opencode-free/`，映射 :25 一致 |
| P1-3 账本分发态 | 读账本＋HANDOFF:36＋HANDOFF-override:29-33 | ✅ 账本仅 `_example` 示例行（含 note，自述首任务前删除）；3 行母版实绩摘要入实例存档节；HANDOFF:36 陈述改实话 |
| P1-4 更新说明 | 读 2.1-更新说明.md | ✅ 补 09-11 增量段（Runtime 插座＋A/B＋显式＋FREE，指回 override:21-29）；标题残留见 P2-J |
| P1-5 监督独立行 | 读 supervisor:23 | ✅ 已为“读 supervisor 行（独立行…冲突以模型表为准）”；TM:4 对读 TM 行，无悬空 |
| P1-6 清待真测 | `rg 待真测\|B真测前` | ⚠️ :9/:11/:25/:27 已改已测（BUGS 指回）；**仅剩 :22“B真测前不静默切”**，条件恒假无害，见 P2-A |
| P1-7 Contract 随包 | `ls` 包根＋读 L26 依据 | ✅ Contract 在包根，L26 指回具体（包根路径＋§1＋Gate＋session `0018f7b3`＋业务仓原件路径）；但 Contract 内部旧 alias 四处未跟，见 §2 P1 |
| P2-1 字眼澄清 | 读 HANDOFF:18 | ✅ 已补“（用户显式说一句触发式不算恢复类条件，见 override:29）” |
| P2-4 result 语义 | 读 AGENTS:47 | ✅ 已补“超限切备成功仍可 PASS；FAIL 须配 escalation_reason/备注” |
| P2-6 日期指回 | 读 HANDOFF:5/:28/:36 | ✅ 三处统一“目录日期最新一份为准”，无具体日期 |
| P2-8 缓存范围 | 读 AGENTS:50 | ✅ 括号已含“External Runtime 走 builder 通道，换 Runtime/换模型/升级即开新链” |
| sop 红线 | 读 AGENTS:62 | ✅ 已有“`docs/sop/` 仅模板示例，新项目自建”；文件本身未移出系用户留待明令（carry，非偷工） |
| 重塑主力 | 读 2.0-重塑说明:7 | ✅ 已改“历史主力（2.0）…现主力见 override builder 行，档位写口头” |
| TM 2/2 | 读 task-manager:7 | ✅ 已为“累计被 supervisor 打回 2 次（计数 n/2…）” |
| HANDOFF verdict/脱敏 | 读 HANDOFF-override:9/:10 | ✅ :9 改结论指回＋只记 trace，:10 链 ID 脱敏 `ses_***` |
| permission 行 | 读 HANDOFF.template:14 | ⚠️ 行已加，但“格式待 Contract”过时（Contract §10 已有格式），见 P2-B |

附加肯定：supervisor 断言命令在零真实行账本上 exit 0（example 跳过，空过符合设计，首真实任务落盘后才真验）；读盘顺序三处（AGENTS:52／编排者:12／HANDOFF.template:19）逐字一致；Contract §15–16（telemetry＋cost_cny null 不估算）与 AGENTS:45 对齐；Contract §18.4 升级三触发经编排者 :11（换模型/换 Runtime/升级开新链）可互锁，见 P2-E 尾巴。

---

## 2. P1：Contract–override 正典 ID 分叉（1 项，必修）

- 位置：包根 `V2.1_BRIDGE_INTEGRATION_CONTRACT.md:16`（§0.1）、`:22`（§1 route 行）、`:134`（§16）、`:144`（§18.1） vs `USER_MODEL_OVERRIDE.md:26`（正典＋旧 alias 退役声明）
- 矛盾：Contract 四处写 builder 槽位填 `deepseek-bridge/deepseek-v4-flash`、账本 model 写同值；override :26 写 A 通道模型列只许 `deepseek-flash`、旧 `deepseek-bridge/deepseek-v4-flash` 为兼容 alias 不得再作新默认、route 禁入 Model 列。Bridge 激活当天两种填法：按 Contract 填旧 alias 即违反 :26（supervisor 按表打回）；按 :26 填即违反 Contract §18 字面。且 Contract §0 自述“此前写入的①②已被模板侧改动还原”——文件自认 §0 stale 仍随包作“依据”，读者无法判断整份 Contract 哪些节有效（L26 只征引 §1，但 §16/§18 同属实操节）。
- 根因：Contract 是业务仓原件直拷（含面向旧模板的 §0 待落地接口），P1-7 修法（随包）只改了 L26 指回，未给 Contract 包内有效性围栏。
- 修复（二选一，推荐 A，需用户拍）：A）Contract 包内围栏（不动业务仓原件）：包根 Contract 首部加 3 行“分发围栏：§0.1/§1-route/§16/§18.1 中旧 route `deepseek-bridge/deepseek-v4-flash` 一律读作兼容 alias，正典以 §1 三元组（`deepseek-flash`＋`deepseek-bridge`）＋ override:26 为准；§0 待落地 ①② 在本包已落地（Runtime 列＋编排者 :10），读作历史”；B）业务仓修 Contract 源后重拷（§0.1/§16/§18.1 改正典，§0 待落地改已落地），包内 L26 指回新版号。无论选哪个，`rg "deepseek-bridge/deepseek-v4-flash"` 在包内的合法命中应只剩“兼容 alias 声明”两处（:26＋围栏），实操节零命中。

---

## 3. P2：新尾巴 10 项（不拦分发，建议与 hygiene 轮合并修，每项 ≤2 行）

- **P2-A L22“B真测前”残留**（P1-6 尾巴）：override:22“备用B按用户定名单例外、B真测前不静默切”——B 已测（:25/:27＋BUGS 单发 pong），条件恒假。修：删后半句或改“（B 已测见 :27，超限切备记账）”。
- **P2-B permission 指回过时**：HANDOFF.template:14“格式待 Contract”——Contract §10 已有 permission 事件 schema＋decisionFile＋300s fail-closed。修：改“格式见包根 Contract §10（decisionFile＋approval_routed/decided），首版可先记自然语言一句”。
- **P2-C Contract 悬空引用**：Contract 引 `ARCHITECTURE.md`（§6）、`tools/orca/{supervisor,dispatch}.mjs`、telemetry、`runtime/evidence/*`——包内均无（`ls` 实测无 ARCHITECTURE.md、无 tools/）。修：分发注记补一句“ARCHITECTURE/tools/runtime 系业务仓路径，模板包仅含接入面，激活前回仓核对”，或删包内不可验的证据文件名。
- **P2-D 外部者 docs 例外未声明**：外部提示词 :16“docs/一律不动” vs :12“只追加 docs/handoff/EXT-WORKLOG.md”（docs 内）。修：:16 补括号“（EXT-WORKLOG 例外，见 §一.2）”。
- **P2-E AGENTS:39 缺换 Runtime**：升级节只写“换模型即开新链”，缓存括号 :50 与编排者 :11 均为“换模型/换 Runtime”。修：:39 补“/换 Runtime”（与 Contract §18.4 用户切通道停链互锁）。
- **P2-F L21 全称断言过宽**：:21“表内全ID为ORCA路由ID” vs :9 备/:11 主裸 `deepseek-v4.1-flash`（codebuddy 原生 ID，无 provider 前缀，池映射 :25 无裸形；B 探针恰用裸形调 codebuddy）。修：:21 补半句“（codex/opencode 系为路由 ID；codebuddy 通道用其原生 ID 见 :27，调用形见备注 `--model`）”。
- **P2-G Runtime 列类型污染**：:9/:11 Runtime 格为 `codebuddy（…已测…）` 长串（ID＋状态＋出处）。修：Runtime 格只留 `codebuddy`，状态后移到备注（cosmetic，可选）。
- **P2-H override 实例未闭环节 stale**：HANDOFF-override:11-15（Q1–Q3 待定＋P1-1/P1-2 待修＋QA-04/QA-05 待测）与 :24-26（全闭环 P0=0）矛盾；:20“已删_example行”过时。修：实例首行加“（过程存档，现状以 P1P2 轮修订节＋复验报告为准）”或小修两节为过去时。实例冻结存档，不重写历史。
- **P2-I BUGS QA-04 未闭**：QA-04 状态格仍 FAIL（open），其要求的一句 L21 已落地（剥前缀＋400 非故障），:57 补测注记亦承认。修：状态格改 PASS＋备注“已落地见 override:21”（1 行），失败原因保留作 dated trace。
- **P2-J 更新说明标题残留**：标题仍“相对 2.0 只加缓存五条”，正文已 scope 到 09-09 基线。修：标题补“（09-09 基线；09-11 增量见末节）”。

Carry（非新、不计数）：sop 杂项仍在包内——HANDOFF-override:26 明记“留待明令”，AGENTS:62 红线已围栏，待用户一句话即移出。另 P3 备注两则：① 经验未追加 P1P2 轮一句（收尾流程小缺，下轮顺手补）；② 存档 3 行系摘要非全行（:33 自述略写，分发视角正确，全量不可恢复属设计内）；③ 断言零真实行时空过（设计内，首真实任务后真验）。

确认非问题（免白改）：L9/L11 备注“显示名称按用户口径”与 :25 一致，非 P1-1 复发；L29 触发器现表化后与 :25 映射一致；neat :37“29 行实测 vs 任务口径 30”已自洽（以实测为准）；:27 B“批量压测待批”与“单发可用”并存不矛盾（两级测试口径）。

---

## 4. 修复清单（共约 15 行＋1 个待拍板）

- [ ] P1（§2）：Contract 围栏 A 或源修重拷 B（用户拍一个；推荐 A，3 行）＋重跑 `rg "deepseek-bridge/deepseek-v4-flash"` 验收（合法命中只剩兼容声明）
- [ ] P2-A：:22 删“B真测前”半句（1 行）
- [ ] P2-B：HANDOFF.template:14 改指回 Contract §10（1 行）
- [ ] P2-C：Contract 分发注记补业务仓路径句（1 行）
- [ ] P2-D：外部 :16 补 EXT-WORKLOG 例外括号（半行）
- [ ] P2-E：AGENTS:39 补“/换 Runtime”（半行）
- [ ] P2-F：override:21 补 codebuddy 原生 ID 半句（1 行）
- [ ] P2-G：:9/:11 Runtime 格瘦身（可选，cosmetic）
- [ ] P2-H：HANDOFF-override 首行加存档注记（1 行）
- [ ] P2-I：BUGS QA-04 状态格改 PASS＋指回（1 行）
- [ ] P2-J：更新说明标题补 scope（半行）
- [ ] 分发前：重跑 §5 三组命令（断言 exit 码＋旧 alias 合法命中数＋`rg 待真测` 归零确认，L22 修后）＋确认本目录以本复验为最新结论

---

## 5. 附：实测证据（2026-09-11 本机复现）

```
# ① P1P2 轮验收（节选）
sed -n '26p' USER_MODEL_OVERRIDE.md → 禁令含作用域（Bridge列只许deepseek-flash，PI列允许，见下条）——P1-1闭环
sed -n '29p' USER_MODEL_OVERRIDE.md → “含 opencode/ 且以 -free 结尾（旧视为opencode/）”＋两对现表举例——P1-2闭环
cat docs/model/TASK-MODEL-LOG.jsonl → 仅_TASK-000-example_1行（note自述首任务前删除）——P1-3闭环
sed -n '23p' docs/roles/supervisor.md → “读supervisor行（独立行…冲突以模型表为准）”——P1-5闭环
ls V2.1_BRIDGE_INTEGRATION_CONTRACT.md → 在包根——P1-7随包闭环
rg -n "待真测" USER_MODEL_OVERRIDE.md → 零命中；rg -n "B真测前" → 仅:22——P1-6剩尾巴P2-A

# ② 本轮P1实锤：旧alias四处（Contract）vs正典（override:26）
rg -n "deepseek-bridge/deepseek-v4-flash" V2.1_BRIDGE_INTEGRATION_CONTRACT.md
→ :16（§0.1 builder槽位ID）｜:22（§1 route行）｜:134（§16账本model值）｜:144（§18.1 builder行写法）
sed -n '26p' USER_MODEL_OVERRIDE.md → 旧alias“不得再作新默认”，正典deepseek-flash＋route禁入Model列
→ 按Contract填旧alias即违:26；按:26填即违Contract§18字面。执行分叉实锤。

# ③ P2抽查
ls ARCHITECTURE.md / tools → 均No such file（P2-C）｜ HANDOFF.template:14“格式待Contract”vs Contract:88-100 §10已有schema（P2-B）
外部:16“docs/一律不动”vs :12 EXT-WORKLOG在docs/内（P2-D）｜ AGENTS:39“换模型即开新链”vs :50括号“换模型/换Runtime”（P2-E）
BUGS:8 QA-04状态FAIL vs override:21剥前缀已落地（P2-I）｜ 账本断言exit 0（example跳过，零真实行空过，符合设计）
```

## 6. 附：核验矩阵（复验抽查）

| 断言 | 结果 | 结论 |
|---|---|---|
| P1-1→P1-5、P1-7 落盘 | 条文/账本/注记/独立行/随包在位 | §1 六闭环 |
| P1-6 落盘 | 待真测清零，剩 :22 半句 | P2-A |
| Contract 正典一致 | 旧 alias 实操节四处 vs :26 正典 | §2 P1 |
| P2 十项 | 8 落地＋sop deferred＋permission 半修 | P2-B…J |
| 读盘顺序/遥测/升级口径 | 三处一致／对齐／互锁 | 通过 |
| 旧报告时效 | 09-11 主报告 §2 已被本复验 supersede | 本节声明 |

*目标/剩 P0/下一步：目标=P1P2 轮落地复验；剩 P0=0，剩 P1=1（§2 Contract 正典分叉，需用户拍 A/B），剩 P2=10（§3，含 1 carry）；下一步=按 §4 修 P1 围栏（3 行）＋P2 尾巴，其中 P2-I（QA-04 关环）与 P1 同批修以清“FAIL 开着但已修完”的悬空态。*
