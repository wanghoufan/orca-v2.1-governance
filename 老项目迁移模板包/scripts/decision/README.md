# orca-decide｜ORCA Decision Sidecar CLI（V1 Pilot，未接线）

> 状态：BLOCKED（JEV_NEEDS_CARD）——CLI 与 Fail-Closed 已验证，真实 Jev 调用被 Vercel 403 拦截，需用户绑卡解锁免费额度后重跑 Smoke/Fixtures。
> Jev = 建议，ORCA 规则 = 权限。不新增角色，不进主链，不改 USER_MODEL_OVERRIDE。

## 用法

```bash
./orca-decide.mjs <change|route|user|p0> <state.json>
```

输出稳定 JSON：`{schema_version, mode, ok, decision[, risk], probability, advisory_only:true, model}`。
失败：`{ok:false, error, fallback:"ORCA_V2_1_EXISTING_LOGIC"}` + exit 非 0，绝不伪造成功。

错误码：`BAD_ARGS/BAD_MODE/STATE_FILE_MISSING/BAD_JSON/KEY_MISSING/JEV_AUTH/JEV_NEEDS_CARD/JEV_RATE_LIMITED/JEV_SERVER_ERROR/JEV_NETWORK/JEV_UNAVAILABLE/JEV_SCHEMA_CHANGED/JEV_UNKNOWN_ENUM`。

## 确定性优先

- `p0` 且 `rework_count>=2`：不调 API，直接返回 decision=true（规则直断）。
- Human Gate/删除/不可逆/付费/模型切换：永不由本 CLI 自动批准（调用方 TM 负责）。

## Fixtures

`fixtures/T01-T10.json`：change×3、route×3、user×2、p0×2，各含 `expected`。Jev 解锁后跑：

```bash
for f in fixtures/T*.json; do ./orca-decide.mjs change "$f"; done
```

（按文件名分 mode 跑；mode 映射见本文件顶部注释或接线文档。）

## Secret

仅 `~/.config/orca/decision.env`（600）。禁入仓库/日志/Prompt/HANDOFF。

## 依赖

`ai@7` + `@ai-sdk/gateway@4`，Node≥22，ESM。注意 SDK 实际口径：choice 用 `criteria` 对象表（非 `choices` 数组），score 的 `criteria` 为有序数组；evaluation 须经 `gateway.evaluationModel()` 构造（`gateway()` 普通模型无 `supportedQuestionTypes`）。
