# ORCA V2.1 增量审查报告（2026-09-11 第四轮：-y 卡点轮，未提交差分）

- 审查对象：HEAD（`ba9d6c8`）之后的未提交差分 5 文件（override:27、builder 卡、HANDOFF 修订行、BUGS -y 节、CODE_REVIEW -y 节，共 +30/-1）
- 基线：`docs/history/ORCA-V2.1-治理审查报告-2026-09-11-现势.md`（上一轮结论）＋ 现行包内文件
- 本轮策略：优先找变化——只深审 -y 差分；其余做 carry 复核（现势 P1/P2 是否仍 open）
- 结论先行：**P0=0，本轮新 P1=0，新 P2=3，新 P3=2，carry P1=1（子包 README，仍 open）、carry 2（sop、经验）**。-y 轮证据扎实（A 拒/B 过 verbatim＋rc 记录＋CODE_REVIEW 三点对表＋不冲突论证），判定：不拦分发，3 个 P2 与下次改动同批修。HANDOFF 修订行与两处落盘互相指回一致，无悬空。

严重度：P1=照做即缺件/必错；P2=域冲突/缺 scope；P3=cosmetic/残留风险。

---

## 1. -y 轮验收（证据 PASS，规则侧 3 P2＋2 P3）

| 检查 | 结果 |
|---|---|
| QA 证据（BUGS -y 节） | ✅ A 无-y：rc0＋拒绝正文＋无实跑输出；B 有-y：rc0＋`probe-ok`；`--help` 原文转录准确；判定句写明 rc 是进程码 |
| CODE_REVIEW 三点对表 | ✅ -y 名／安全语义（未夸大，全放行→常规放行）／rc 判读逐字对上，无反转 |
| 不冲突论证（额度域 vs 工具审批域） | ✅ 成立：不静默扣费管模型额度，-y 管单次 Bash 审批；HIGH/CRITICAL 仍问保留；作用域锁死 B 非交互；头标用户定授权 |
| HANDOFF 修订行 | ✅ “规则进 override:27，证据 BUGS 节”双向可查；“别项目结论已复现”有 verbatim 支撑 |

### P2-1 builder 卡“permission 只走 TM 单点”被 -y 掏空一半（域冲突）

- 位置：`docs/roles/builder.md:7`（通道无关行尾“permission 只走 TM 审批单点”） vs `:8` 新增（B 默认带-y，常规 Bash 免批）
- 矛盾：:7 无限定，走 B 通道时常规权限实际走 CLI -y 自动放行，不走 TM。CODE_REVIEW 的正交论证只管了额度/fail-closed，不管这句 blanket 表述。按字面，B 通道每次常规放行都算违规。
- 修复（1 行）：:7 改“permission_request 事件只走 TM 审批单点（Bridge/机器事件域；B 通道 CLI 常规放行见 :27 -y 规则，不属此列）”。

### P2-2 “验成功只看正文不看 rc”与 exit 码铁律缺域隔离（相邻域反规则）

- 位置：override:27 尾＋builder:8（B 自测看正文不看 rc） vs `经验一句话.md` 09-10 复验行（坏例校验必须看 exit 码）vs supervisor 账本断言（exit 1 打回）
- 矛盾：两条都对、各管一域（codebuddy 进程码无意义 vs 账本断言靠 exit 码），但无一句互斥声明。后人可引新规则为旧账本开脱（“验成功不看 rc”），也可引旧铁律打回 B 自测（“必须看 exit 码”）。
- 修复（两处各半句）：新规则补“（仅 codebuddy `-p` 自测域）”；经验复验行或 supervisor 卡补“（账本/脚本断言域；codebuddy 自测看正文，见 override:27）”。

### P2-3 builder 卡“执行通道无关”节内出现通道专条（自斥）

- 位置：builder:7 节标题“执行通道无关” vs :8“B通道自测”（codebuddy 专属 flag）
- 矛盾：同卡先立无关、后写专条。:8 有 scope（B 通道＋指回 :27），功能无损，但节标题失真，下次加 C 通道时无处安放。
- 修复（可选 1 行）：:7 标题改“执行通道无关（通用职责；各通道专则见下＋override:27）”，或 :8 移备注化。Cosmetic 偏上，列 P2 末。

### P3

- P3-a：B 有-y 判据“回 `probe-ok`”实为代码块含该行，非逐字精确一致（判据“精确输出”宜放宽为“正文含预期回显”，半句）。
- P3-b：HIGH/CRITICAL 仍问仅引 `--help` 原文，未 live 负测（可以不测： destructive 探针风险＞收益；记为已知残留即可）。
- P3-c：override:27 头“勿混勿删”与本轮 append 并存——append 合规（未删通道），但 header 易让后人不敢碰；改“勿混（A/B 不混写）、勿删通道（增补例外）”半句。

确认非问题：-y 与 Contract §10 无交集（§10 是 Bridge/A 通道 permission 事件面，-y 是 codebuddy/B CLI 面）；“档位 high 写口头”与 -y 并存不冲突；本轮不落账本行符合冻结账本原则；实例文件继续长修订节符合既有过程存档模式。

---

## 2. Carry 复核（现势结论 gear-check）

- **Carry P1（仍 open）**：两子包 README 拷贝映射仍缺 5 项去向（新包 grep Contract/GOVERNANCE/提示词零命中；老包列表未动）。子包被 gitignore，`git status` 不可见，属本地副本债。
- Carry sop（第 5 轮待定）：仍在 `docs/sop/`，红线围栏在位。建议：与 P1 同批定去留，勿再 carry。
- Carry 经验：仍 8 条，无 -y/排布轮追加。P3 流程债。
- 现势 P2×4、P3：抽查在位（L22/模板 :14/外部 :16/AGENTS :39/实例首行均未回退），不复列。

---

## 3. 修复清单（约 8 行）

- [ ] P2-1：builder:7 permission 句加域限定（1 行）
- [ ] P2-2：新旧两规则互加域括号（各半句）
- [ ] P2-3：builder:7 标题或 :8 归位（1 行，可选）
- [ ] P3：判据放宽半句／HIGH 未测记残留一句／“勿混勿删”改“勿混＋勿删通道”（各半句）
- [ ] Carry P1：子包 README 映射（现势 §5 主力，未动）；sop 定去留
- [ ] 提交前：重跑账本断言 exit 0＋`git diff --stat` 核对 5 文件＋本报告入 `docs/history/` 后 `status` 只有预期项

---

## 4. 附：实测证据

```
# ① 差分面（HEAD..worktree）
git diff HEAD --stat → 5 files, +30/-1：override:27（-y半句append）／builder卡（:8自测行）／HANDOFF修订（-y卡点轮1行）／BUGS＋15（-y验证节）／CODE_REVIEW＋12（-y复核节）

# ② P2-1 实锤（同卡两行）
sed -n '7,8p' docs/roles/builder.md → :7“…permission只走TM审批单点…” vs :8“…默认带-y…”（常规免批不走TM）

# ③ P2-2 实锤（反规则相邻）
rg "只看正文|不看rc" USER_MODEL_OVERRIDE.md docs/roles/builder.md → -y域；rg "必须看.*exit" 经验一句话.md → 断言域；互无scope

# ④ carry
grep Contract/GOVERNANCE/提示词 新项目模板包/README.md → 零命中（P1仍open）；ls docs/sop/ → 杂项仍在；grep -c 经验 → 8
```

## 5. 附：核验矩阵

| 断言 | 结果 | 结论 |
|---|---|---|
| -y 证据＋复核＋HANDOFF 指回 | verbatim 对上，双向可查 | §1 PASS |
| permission/rc/通道无关 scope | 三处域冲突 | P2-1/2/3 |
| 现势 P1/P2 回退 | 零回退，P1 仍 open（本地副本） | §2 carry |
| 未提交面完整性 | 差分仅 -y 5 文件，无夹带 | 通过 |

*目标/剩 P0/下一步：目标=-y 轮增量审查落盘；剩 P0=0，新 P1=0，carry P1=1（子包 README）；下一步=修 §1 三个 P2（各 1 行）＋现势 P1，其中 P2-1 与 carry P1 可同批（都是“ blanket 表述缺 scope”一类毛病）。*
