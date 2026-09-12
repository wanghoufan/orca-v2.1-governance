# ORCA V2.1 现势审查报告（2026-09-11 第三轮：排布 B＋B 源修＋子包）

- 审查对象：重排后的母版（根现行 5＋2＋`docs/` 十目录，git 已 init）＋ `新项目模板包/`＋`老项目迁移模板包/`（gitignored 本地副本）
- 基线对照：`docs/history/` 两份说明＋包内现行文件＋CODE_REVIEW/BUGS 内过程复核节（P1P2/B 源修/排布三轮自验）＋ git 历史（`1b7de05→96df829→6d77d4d→ba9d6c8`）
- 落盘位置注记：`治理审查报告/` 已按用户令删除（见根 README），本报告落 `docs/history/`（历史记录之家；根保持现行干净，不重建已删文件夹）
- 结论先行：**P0=0，P1=1（子包 README 拷贝映射缺项，照做即漏版本文件与 runbook），P2=4，P3=3，carry=1**。复验（09-11-复验）的 P1（Contract 正典分叉）✅ 已在业务仓源头修完（B 源修，源 147 行→包 149 行＝源＋2 行分发注记，旧 alias 四处全部退役为兼容声明）；复验 10 个 P2 ✅ 全部闭环（逐项见 §1）。排布 B 本体干净：子包路径适配精确（仅改路径前缀，内容零漂移，roles/templates/账本全同步），`.gitignore` 双包命中、`git status` 干净。问题集中在**子包 README 的拷贝映射写少了**＋三处尾巴。

严重度：P0=照做必错；P1=照做即缺件/特定条件必错；P2=口径差/规则缺；P3=cosmetic/流程。

---

## 1. 验收：复验 P1＋P2 尾巴（全部闭环，证据）

| 项 | 验收动作 | 结果 |
|---|---|---|
| 复验 P1 正典分叉 | `rg deepseek-bridge/deepseek-v4-flash` Contract | ✅ 4 处（:16/§0.1、:22/§1-route、:134/§16、:144/§18.1）逐处为“兼容 alias＋禁作新默认”，正典三元组（`deepseek-flash`＋`deepseek-bridge`）在 §1＋override:26 对齐；源包 diff 仅＋2 注记行 |
| P2-A L22 残留 | `sed -n 22p` override | ✅ “B真测前”半句已删 |
| P2-B permission 指回 | HANDOFF.template:14 | ✅ “格式见包根 Contract §10 decisionFile＋approval” |
| P2-C 悬空引用 | Contract 分发注记 | ✅ L8“原件在业务仓…更新回仓重拷”在位（ARCHITECTURE/tools 悬空转为已知实现指回，见 P3） |
| P2-D 外部例外 | 外部:16 | ✅ “（EXT-WORKLOG 例外，见 §一.2）”在位（母版另有已删注记） |
| P2-E/F/G | AGENTS:39／override:21／:9/:11 | ✅ “换模型/换 Runtime”／原生 ID 半句／Runtime 格瘦身为精确 `codebuddy` |
| P2-H/I/J | 实例首行／QA-04／更新说明标题 | ✅ 存档注记／PASS 指回 :21／标题 scope 在位 |
| 账本断言 | supervisor 命令重跑 | ✅ exit 0（仅 `_example` 行，空过符合设计） |

---

## 2. P1：子包 README 拷贝映射缺项（1 项，必修）

- 位置：`新项目模板包/README.md`“放入项目根目录”映射表＋“初始化后”步骤；`老项目迁移模板包/README.md`“放入项目根目录”列表
- 矛盾：新包映射表只列 9 项（AGENTS/override/roles/pm/handoff/model/qa/review/经验），包内实际 12 项——**`V2.1_BRIDGE_INTEGRATION_CONTRACT.md`、`GOVERNANCE_VERSION`、编排者/外部两份提示词、`归位表.template.md` 共 5 项无去向**。照表拷贝的新项目缺版本文件（初始化步骤亦未提建 `GOVERNANCE_VERSION`）＋缺 TM 开工 runbook（AGENTS:26 指编排者提示词）＋缺 Bridge 合同。老包列表同样漏 5 项（编排者/外部/经验/Contract/GOVERNANCE_VERSION 明明在包内）。附带措辞：新包步骤 1“确认…链接目标”——实为拷贝非链接，用词误导。
- 修复（两 README 各补 5 行内）：新包映射表补 Contract→根、GOVERNANCE_VERSION→根、两提示词→根（或声明不拷）、归位表→不拷（新项目无迁移）二选一并写死；初始化步骤加“确认 `GOVERNANCE_VERSION`=2.1 在位”；“链接目标”改“文件位置”。老包列表补齐 5 项去向。验收：按 README 逐项 `ls` 新项目，零缺件。

---

## 3. P2：规则缺与声明打架（4 项）

- **P2-1 新包独立性声明越界**：新包 README“拷贝到新项目后不依赖源仓库路径” vs 包内 Contract“更新以业务仓为准重拷”（L8＋L26）。运行不依赖、更新依赖，两句都对但同读即斥。修：README 补半句“（运行独立；Contract 更新需回源仓重拷，有仓权限时）”。
- **P2-2 经验子包分发无规则**：母版 8 条 war stories（雷达/Terra 实战）原样进子包（两包各 8 条已核），账本有 `_example` 首删机制，经验无保留/清空口径——чужой 上下文或前车之鉴，两种读法。修：AGENTS 或子包 README 加一句（“经验随包作前车之鉴保留”或“首任务前清空”，二选一）。
- **P2-3 QA 排布 ②FAIL 裁决**：BUGS 排布节自报 ②FAIL（CODE_REVIEW :30/:40/:48 裸旧路径）vs 同文件排布节“打回转 PASS”。实测三处均为搬家前评审快照，文件级冻结声明＋文末解码表（:63-65）在位——QA 检查误伤冻结历史。但历史节内无指向解码表的指针（读者到 :30 需自行翻到文末）。裁决：reviewer PASS governing（技术分歧听 code-reviewer，AGENTS:27），QA 挂转 backlog；修：三节头各加半句“（搬家前快照，路径按文末迁移注记解码）”或 QA 检查 scope 限定现行文件。
- **P2-4 新包归位表去留未定**：`归位表.template.md` 在新包根但 README 只字未提（它是迁移整理输出模板，新项目用不上）。修：README 写死去留（删或注“迁移用，新项目忽略”）。

---

## 4. P3＋carry（不拦分发）

- P3-a：根 README“现行 5＋2”数不清（条目 6：5 文件＋本 README，“＋2”无对应）。修：改“现行 5＋1”或补齐所指。
- P3-b：根 README `docs/` 地图未提三处过程存档实例（handoff/qa/review 各一件 override 实例，均有存档头）。修：地图补半句“（各含一件 09-11 override 过程存档）”。
- P3-c：Contract `[ARCHITECTURE.md]` 死链＋tools/runtime 悬空（CODE_REVIEW 已判实现指回非泄密）。修：分发注记补半句“ARCHITECTURE/tools/runtime 只存业务仓”。
- Carry（sop，第 4 轮待定）：`docs/sop/` 杂项仍在，AGENTS:62 红线已围栏。建议本轮定去留（移出或正式立项），勿再 carry。
- 确认非问题：子包外部“（含治理审查报告）”为前瞻保护（新项目未来报告同样受保），与母版已删注记不冲突；新老包 AGENTS 除 :26 路径前缀外逐字一致；编排者提示词三处零漂移（无自路径引用）；两包账本均为纯 `_example`；经验两包一致。

---

## 5. 修复清单（约 12 行）

- [ ] P1（§2）：两子包 README 补拷贝映射（各 ≤5 行）＋新包初始化步骤补版本确认＋“链接目标”改词
- [ ] P2-1：新包 README 独立性补半句；P2-2：经验去留定一句；P2-3：三节头加解码指针（或 QA scope 规则一句）；P2-4：归位表去留写死
- [ ] P3：5+2 计数／docs 地图存档半句／Contract 注记半句；carry：sop 定去留
- [ ] 分发前：按新包 README 映射表逐项 `ls` 验收零缺件＋重跑账本断言（exit 0）

---

## 6. 附：实测证据（本机复现）

```
# ① 复验P1闭环（B源修）
rg -n "deepseek-bridge/deepseek-v4-flash" V2.1_BRIDGE_INTEGRATION_CONTRACT.md
→ :16/:22/:134/:144，逐处“兼容alias＋禁作新默认”，零实操默认；正典见:22三元组＋override:26
git log --oneline → 1b7de05→96df829→6d77d4d→ba9d6c8（链完整；6d77d4d源147→包149=＋2注记）

# ② 排布B干净
diff roles/templates/ledger（根vs两包）→ 全静默同步；仅AGENTS:26/Contract:17-18/外部:16/迁移:13系路径适配差分
git status --short → 空；check-ignore两包命中（BUGS排布节④自验一致）

# ③ 本轮P1实锤（映射缺项）
ls 新项目模板包/ → 12项；README映射表列 9项；差集=Contract/GOVERNANCE_VERSION/编排者/外部/归位表（5项无去向）
ls 老项目迁移模板包/ → 同理漏5项（编排者/外部/经验/Contract/GOVERNANCE_VERSION）
grep -c "^- 202" 经验一句话.md 新项目模板包/经验一句话.md → 8/8（P2-2：母版经验原子包，无去留规则）
```

## 7. 附：核验矩阵

| 断言 | 结果 | 结论 |
|---|---|---|
| 复验 P1＋10 P2 | 源修正典＋尾巴全在位 | §1 全闭环，09-11-复验 supersede |
| 排布 B 路径适配 | 仅前缀差分，内容零漂移 | 通过 |
| 子包 README 可执行性 | 5 项无去向，照做缺件 | §2 P1 |
| 独立性/经验/FAIL 裁决/归位表 | 各 1 条规则缺 | §3 P2×4 |
| sop | 第 4 轮 carry | 本轮定去留 |

*目标/剩 P0/下一步：目标=现势体系审查落盘 `docs/history/`；剩 P0=0，剩 P1=1（§2 子包 README，需用户拍去向口径），剩 P2=4；下一步=按 §5 补 README 映射（主力）＋P2 规则句，其中 P2-3 按分歧规则 reviewer PASS 已 governing，QA 挂转 backlog 不同时修。*
