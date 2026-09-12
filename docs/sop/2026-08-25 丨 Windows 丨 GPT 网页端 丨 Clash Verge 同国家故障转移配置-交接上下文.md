# ORCA V2.1｜默认 Builder 模型切换 SOP

> 版本：V1.0  
> 日期：2026-09-11  
> 适用对象：ORCA V2.1 治理管理员  
> 适用范围：普通 `builder` 默认模型及其执行通道的切换  
> 核心原则：**用户决定换谁，治理管理员负责查清真实机器配置并安全落盘。**

---

## 一、SOP 目标

当用户提出类似以下要求时：

- “默认 Builder 换成 DeepSeek V5”
- “Builder 改成 GLM 5.3”
- “以后普通开发默认用 XXX”
- “把 Builder 换到另一个 Runtime”
- “这个新模型以后作为默认施工模型”

治理管理员不得直接根据展示名称修改配置。

必须先完成：

**目标确认 → 官方核验 → Runtime 判断 → 最小 Probe → Telemetry 验证 → 配置修改 → 静态验收 → 提交结果**

只有整个链路通过后，才允许把新模型设为默认 Builder。

---

# 二、必须区分的五个概念

任何模型切换都必须分别确认：

### 1. `display_name`

用户看到和使用的名称。

例如：

`DeepSeek V4.1 Flash`

它是人类可读名称，不一定能直接用于 API。

---

### 2. `model_id`

Provider / API / Harness 实际接受的精确机器 ID。

例如当前已经验证过的：

`deepseek-flash`

禁止根据展示名称自行猜测机器 ID。

---

### 3. `provider`

真正提供模型服务的供应商。

例如：

`deepseek-official`

---

### 4. `runtime_channel_id`

ORCA 使用哪个执行通道运行 Builder。

例如：

`deepseek-bridge`

Runtime 是执行通道，不是模型。

---

### 5. `route_id`

如果系统存在 Runtime + Model 的组合路由，则单独记录。

例如：

`deepseek-bridge/deepseek-flash`

Route 不得写进 Model 字段。

---

## 三、基本公式

始终保持：

```text
Display Name ≠ Model ID ≠ Runtime ≠ Route
```

标准记录形式：

```text
display_name       = <人类显示名称>
model_id           = <真实精确机器 ID>
provider           = <真实 Provider>
runtime_channel_id = <真实 Runtime ID>
route_id           = <如存在则记录>
```

---

# 四、触发条件

以下任务必须执行本 SOP：

1. 修改默认 Builder 模型；
2. 修改默认 Builder Runtime；
3. Provider 发生变化；
4. 用户指定一个此前未验证的新 Builder；
5. 模型升级，例如 V4.1 → V5；
6. 同一个模型改走另一条执行通道；
7. 当前 Model ID 已退役，需要切换 canonical ID。

以下情况不需要执行完整 SOP：

- 单个 Task 临时切模型；
- 已验证模型的普通日常调用；
- Reviewer / QA / Planner 等其他角色的单独调整；
- 单纯修改显示名称而机器配置完全不变。

---

# 五、第一步：确认用户目标

先明确用户真正想改变什么。

至少确认：

```text
目标角色 = builder

目标展示名称 =
<用户指定模型>

是否改为长期默认 =
YES / NO

是否仅临时覆盖 =
YES / NO
```

如果用户明确要求“以后默认使用”，则属于本 SOP。

治理管理员不得自行决定：

- 哪个模型更好；
- 是否应该换；
- 是否顺带修改其他角色；
- 是否升级治理版本。

用户决定目标，管理员负责执行。

---

# 六、第二步：核验真实 Model ID

禁止直接把用户说的模型名称写进配置。

真实 Model ID 的核验优先级：

1. Provider 官方 `/models` 或等价实时模型枚举；
2. 官方 API 文档；
3. 官方 Harness / SDK；
4. 官方 changelog / release note；
5. 当前真实运行 telemetry；
6. 已批准的 Integration Contract。

第三方：

- 新闻
- 榜单
- 博客
- X
- Reddit
- OpenRouter 模型页

只能用于发现候选信息。

不能单独作为生产机器 ID 的最终依据。

---

## 禁止行为

例如用户说：

`GLM 5.3`

不得自行写：

```text
glm-5.3
glm5.3
zhipu/glm-5.3
```

除非官方接口或实际运行证据证明这就是精确值。

如果真实 ID 尚无法确认：

```text
DEFAULT BUILDER MODEL SWITCH = BLOCKED
```

停止修改。

---

# 七、第三步：判断 Runtime 是否需要变化

确认新模型能通过哪条执行通道运行。

## 情况 A：只换 Model

例如：

```text
旧：
model   = deepseek-flash
runtime = deepseek-bridge

新：
model   = <DeepSeek 新模型 ID>
runtime = deepseek-bridge
```

如果现有 Runtime 已正式支持新模型：

只需要改变 Model。

不得重新设计 Bridge。

---

## 情况 B：Model + Runtime 一起换

例如：

```text
旧：
model   = deepseek-flash
runtime = deepseek-bridge

新：
model   = <GLM真实ID>
runtime = <GLM实际可用Runtime>
```

此时必须分别核验：

```text
model_id
runtime_channel_id
provider
```

不得出现：

```text
GLM model
+
deepseek-bridge runtime
```

这种错误组合。

---

## 情况 C：目标 Runtime 尚未接入

如果模型存在，但 ORCA V2.1 尚没有经过验证的执行通道：

停止默认切换。

输出：

```text
RUNTIME NOT READY
```

先完成 Runtime 接入，不得偷偷建立临时绕路。

---

# 八、第四步：最小真实 Probe

找到真实 Model + Runtime 后，必须先做一次最小 Probe。

这不是 Production Canary。

Probe 只验证：

1. 模型参数被接受；
2. Provider 正确；
3. Runtime 正确；
4. Session 正常建立；
5. 请求正常完成；
6. Telemetry 实际模型正确；
7. 不存在未知 fallback；
8. 不修改真实业务代码。

建议 Probe 内容：

```text
仅返回：
MODEL-PROBE-OK
```

---

## Probe 必须记录

```text
requested_model =
provider =
runtime =
route =
session_id =
resumed =
stop_reason =
telemetry_model =
result =
```

如果：

```text
requested_model
```

和：

```text
telemetry_model
```

不一致，

必须解释：

- alias；
- canonicalization；
- provider redirect；
- fallback；

不能直接 PASS。

---

# 九、第五步：决定是否允许切换

只有同时满足以下条件才允许修改：

```text
官方 Model ID 已确认
+
Runtime 已确认
+
Provider 已确认
+
Probe PASS
+
Telemetry 与预期一致
```

否则：

```text
DEFAULT BUILDER MODEL SWITCH = BLOCKED
```

不修改当前默认 Builder。

---

# 十、第六步：修改 USER_MODEL_OVERRIDE

默认只修改：

`builder`

这一行及与它直接相关的当前生效说明。

配置必须保持：

```text
模型列：
<精确 model_id>

Runtime列：
<精确 runtime_channel_id>

备注：
display_name / provider / route
```

Route 不得写进 Model。

---

## 示例结构

```text
角色：
builder

模型：
<model_id>

Runtime：
<runtime_channel_id>

备注：
默认 <display_name>，
provider=<provider>，
route=<route_id>
```

---

# 十一、其他角色默认不动

修改 Builder 时禁止顺带修改：

- task-manager
- planner
- code-reviewer
- qa
- product-reviewer
- supervisor
- experience-recorder
- neat-freak
- senior-expert

除非用户明确要求。

特别是：

**Builder 切换不等于 Senior Expert 切换。**

原 senior-expert 升级机制继续生效。

---

# 十二、第七步：检查相关说明

修改后检查当前生效文档中是否仍存在：

- 旧默认 Builder；
- “待接入”；
- “仅临时使用”；
- 已退役 Model ID；
- 旧 canonical route；
- 错误 Provider；
- 错误 Runtime。

分类处理：

### A. 当前生效配置

更新为新事实。

### B. 历史 Canary / Receipt / Evidence

保留原样。

### C. Compatibility Alias

可以保留，但必须明确：

```text
历史 / 兼容值
≠
当前 canonical 配置
```

禁止为了“全文零命中”改写历史事实。

---

# 十三、第八步：静态验收

至少验证以下场景。

## A. 默认任务

用户只说：

> 继续开发。

应自动解析为：

```text
Builder Model = 新默认 model_id
Runtime       = 新默认 runtime
```

---

## B. 用户临时覆盖

用户说：

> 这个 Task 临时用 Terra。

必须允许临时覆盖。

不得删除一句话切模型能力。

---

## C. 未指定模型

必须回到新的默认 Builder。

---

## D. Reviewer / QA 返工

反馈仍然回到当前 Builder 执行通道。

如果 Runtime 支持真 Resume：

由执行基础设施维护 Session。

---

## E. Senior 升级

继续遵守 V2.1 原有升级规则。

不能为了保留当前 Builder Session 阻止 senior 升级。

---

## F. 其他角色

必须确认没有发生非用户授权的模型变化。

---

# 十四、何时需要修改 Runtime Contract

只有以下情况才允许修改对应 Runtime Contract：

1. Runtime ID 改变；
2. Provider 改变；
3. Route schema 改变；
4. Session / Resume 协议改变；
5. Permission 协议改变；
6. Runtime 本身出现兼容性变化。

如果只是：

```text
DeepSeek V4.1
→ DeepSeek V5
```

而：

```text
runtime = deepseek-bridge
```

仍然兼容，

原则上只修改：

```text
model_id
route_id
必要的版本说明
```

不得借模型升级重构整个 Bridge。

---

# 十五、禁止重新引入重治理

模型切换不得成为重新引入以下机制的理由：

- Registry
- Promotion
- Sync
- Run-all
- 新角色
- 新模型治理 Plane
- 新晋级体系
- 新 Task Manager
- 新 Supervisor
- 新大型状态机

ORCA V2.1 继续保持轻治理。

---

# 十六、Commit / Push 原则

默认模型切换完成后：

先：

```text
diff
→ 静态验收
→ 用户 / Gate Review
```

未经用户明确授权：

```text
不得 push
```

如果需要 commit：

只能包含本次明确批准的配置 / Contract 修改。

不得混入他人工作区变化。

---

# 十七、异常处理原则

## Model ID 不明确

停止。

```text
BLOCKED: MODEL_ID_UNRESOLVED
```

---

## Runtime 未准备好

停止。

```text
BLOCKED: RUNTIME_NOT_READY
```

---

## Probe 失败

停止。

```text
BLOCKED: MODEL_PROBE_FAILED
```

---

## Provider 自动 fallback

停止。

```text
BLOCKED: UNEXPECTED_PROVIDER_FALLBACK
```

---

## Telemetry 模型与请求不一致

先调查 alias / redirect。

不得直接修改配置。

---

# 十八、最终回执

每次执行本 SOP 后必须输出：

```text
1. 用户目标模型：
2. display_name：
3. model_id：
4. provider：
5. runtime_channel_id：
6. route_id：
7. Model ID 官方证据：
8. Runtime 证据：
9. Probe：
10. telemetry_model：
11. 是否发生 fallback：
12. 修改前 Builder：
13. 修改后 Builder：
14. 修改了哪些文件：
15. 是否修改其他角色：
16. 是否修改 Runtime Contract：
17. 用户临时覆盖是否保留：
18. senior 升级规则是否保持：
19. 是否新增 Registry / Promotion：
20. git diff 摘要：
21. commit：
22. push：
```

最终 Gate：

```text
DEFAULT BUILDER MODEL SWITCH
= PASS / BLOCKED
```

---

# 十九、PASS 后停止

PASS 后：

- 不继续换其他角色；
- 不自行升级 ORCA；
- 不自行优化 Runtime；
- 不重新跑 Production Canary；
- 不自行 push；
- 不扩大任务范围。

等待下一项用户指令。

---

# 二十、SOP 一句话原则

> **用户决定用哪个 Builder；治理管理员负责把“人类模型名称”转换成经过官方与真实运行验证的 Model + Runtime + Provider 配置，并以最小改动安全落盘。**