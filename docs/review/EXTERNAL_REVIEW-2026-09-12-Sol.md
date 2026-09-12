# ORCA Governance Review（Sol外部审查，2026-09-12）

> 来源：senior-expert（Sol）按《ORCA外部审查者接手提示词 V1.0》独立审查，TM原样落盘未改一字。对象：HEAD=908e3cf（BatchA/B/C＋升2.2）。

## 1. 审查结论

**PASS**（BatchA / BatchB / BatchC 全部通过；P0=0，P1=0，P2×8 非阻塞；Canary 按方案允许标 PENDING）

一句话：908e3cf 相对整改方案 V1.0 的必须项全部落实——模型表 10 行、GO 冻结、V4.1 统一、两阶段＋Human Gate＋Change A/B/C＋双新模板＋HANDOFF 六字段、Bridge/Watchdog 零改、两包＋ZIP 同步、GOVERNANCE_VERSION 三处＋ZIP 内全 2.2；独立重跑的静态命令与回归命令全部符合预期，测试证据在额度最小化约束下可采信。

## 2. 本轮审查范围

- 基线（只读）：外部审查者接手提示词 V1.0、整改方案 V1.0、SOP V1.0（找到并通读，1244 行）。
- 对象：包根分发版，HEAD=908e3cf，工作区干净。
- 方法：§9 命令独立重跑、§4.1/§8 回归命令独立重跑、10 张角色卡＋双新模板＋HANDOFF/PLAN 模板＋编排者提示词＋README 全文通读、母版↔两包↔ZIP 三方 diff、Bridge/Watchdog diff；smoke/Sol 活链不重放（额度最小化）。

## 3. 已确认完成

BatchA 15/15：TM=FREE、Supervisor=V4.1、Builder=V4.1、Reviewer=V4.1、QA=V4.1、Recorder=V4.1、Neat=V4.1、Planner=Sol、Research槽位=FREE、Senior=Sol、GO自动fallback=0、V4.1/FREE smoke采信、無静默付费、无A/B双路线歧义。

BatchB全PASS（dry-run/mock）：三口令齐、Phase1禁Builder、TM自动回传、Readiness正典唯一、Human Gate P0四重拒派、Phase2基线锁定、Reviewer独立Session、两轮升级、Change A/B/C、9+1无新增、Supervisor五查、Canary如实PENDING。

BatchC全PASS：Bridge diff空149行、watchdog bash -n EXIT:0、双validator好例独立重跑EXIT:0、精确三元组对上、同步md5/SAME矩阵、两ZIP非旧缓存且内GOV全2.2、版本三处2.2。

## 4. P0

**P0 = 0。**

## 5. P1

**P1 = 0。**

## 6. P2

- **P2-1（标题版本名滞后，非阻塞）：** GOV=2.2已转正，但 `USER_MODEL_OVERRIDE.md:1`、`HANDOFF.template.md:1`、`编排者提示词.md:1`、`经验一句话.md:1`、`AGENTS.md:1`、`README.md:1` 标题仍2.1/V2.1。改法：neat二选一——①标题升2.2，或②README声明"模板名冻结＋治理版本2.2为准"。
- **P2-2（AGENTS"谁写哪"planner行缺PRODUCT_PLAN）：** `AGENTS.md:21` planner格只写 `PLAN.template.md`。改法：补"Phase1照PRODUCT_PLAN.template.md；Phase2照PLAN.template.md"。
- **P2-3（HANDOFF.md历史快照易误读）：** `HANDOFF.md §1` 仍含BatchA前旧口径行，与首行V2.2并存。改法：superseded行加注或归档。
- **P2-4（DISPATCH-LOG根模板纯度）：** 根现为_example＋9实录行，下次分发前须冻回仅_example。改法：HANDOFF记一句待办。
- **P2-5（冻结报告时效句）：** ModelGate:49与CODE_REVIEW:13称"两包旧表"已superseded，无需改文件。
- **P2-6（Watchdog来源交叉核对缺口）：** 包脚本相对包外源拷贝md5未核对。改法：双向md5记HANDOFF一行。
- **P2-7（两处采信项补一行命令）：** 协议顶注收编句、"真机QA已启用"断言采信B7＋C2未独立重跑。改法：收尾跑两行rg记HANDOFF。
- **P2-8（README已自愈确认）：** Regression曾记README:23滞后，本轮实测已修，无需再改。

## 7. 测试复核

§4.1静态四项PASS（独立重跑）；FREE/B smoke采信PASS；四角色只读采信PASS；Sol静态确认PASS；GO negative PASS（dry-run）；双账本好例独立重跑PASS、坏例采信；PhaseGate 11/11门禁四项全过；Canary PENDING诚实合规；watchdog bash -n独立重跑PASS；三元组＋GO分类独立重跑PASS；两包＋ZIP PASS。

## 8. 回归结果

总体回归 **PASS**（TASK/DISPATCH validator、watchdog、HANDOFF/模板/ZIP、Bridge合同历史）。

## 9. 未验证项（未测 ≠ 失败）

Sol最小新连接、FREE真故障注入、Canary七项、watchdog launchd活验、0907 job exit 2、协议顶注/"已启用"扫描采信项、Benchmark/批量压测——均已声明原因，见Sol原文§9。

## 10. 给执行者的整改清单

P2-1、P2-2、P2-3、P2-4、P2-6、P2-7（均为只读/文字级），见§6。

## 11. 下一步

**FREEZE_VERIFICATION_PASS方向：修完P2-1–P2-4、P2-6–P2-7后，由TM记HANDOFF一行并直接宣布 `PROMOTION_READY`（V2.2），无需第二轮外部审查；Canary保持PENDING。**
