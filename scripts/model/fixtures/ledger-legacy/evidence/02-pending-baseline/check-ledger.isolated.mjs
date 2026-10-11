#!/usr/bin/env node
// check-ledger.mjs — 账本合法性校验（TASK-MODEL-LOG / DISPATCH-LOG）。
// Usage: node check-ledger.mjs [dir] -> exit 0 合法 / exit 1 列出问题
// 分级：结构/枚举错误 = FAIL（exit 1）；写法不规范 = WARN（不影响 exit，供 supervisor 抽查）。
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, basename, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// 参数解析（2026-10-09 修 P1-1）：旧写法取 argv[2]，导致只传开关
// （`node check-ledger.mjs --allow-example`）把 "--allow-example" 当成目录 → 报
// 一堆 MISSING，误导排查。现改为：取第一个不以 - 开头的参数作 dir，其余作开关。
const argv = process.argv.slice(2);
const dir = argv.find((a) => !a.startsWith("-")) || "docs/model";
// --allow-example（2026-10-08）：仅供**母版/分发包自检**——模板包带 `_example` 空壳，
// 直接跑必然 exit 1。真实项目禁用此开关，否则「示例行未删」失去强制力。
const ALLOW_EXAMPLE = process.argv.includes("--allow-example");
const fails = [];
const warns = [];

// model 精确写法白名单
const MODEL_PROVIDERS = [
  "codebuddy/", "codex/", "opencode/", "opencode-go/", "opencode-free/",
  "volcengine-plan/", "radeon-mimo/",
];
// 已知合法模型全串（来自 USER_MODEL_OVERRIDE；不在表内但前缀合法的记 WARN，提醒更新）
const KNOWN_MODELS = [
  "codebuddy/deepseek-v4.1-flash", "codebuddy/glm-5.3-flash",
  "codebuddy/deepseek-v4-pro", // 2026-10-07 产品审查双审链审查 B（约定节，非主表行）
  "codex/gpt-6-sol", "codex/gpt-6.1-sol", "codex/gpt-6-luna", "codex/gpt-5.6-luna",
  "codex/gpt-5.6-terra", "codex/gpt-5.6-sol",
  "opencode/muse-spark-1.3-contributor-free", "opencode/muse-spark-1.3-contributor",
  "opencode/mimo-v2.5-free",
  "opencode-go/muse-spark-1.3-contributor", "opencode-go/deepseek-v4.1-flash",
  "opencode-go/glm-5.3-flash", "opencode-go/space-bunny-free",
  "opencode-free/mimo-v2.5-free", "opencode-free/muse-spark-1.3-contributor-free",
  "volcengine-plan/ark-code-latest",
  "radeon-mimo/MiMo-V2.6-Flash",
];
// 特殊合法写法（非 provider/model，但属规范内的“非模型”记录）
const MODEL_SPECIAL = ["本窗口", "本窗口直驱", "本窗口Agent子代理", "—"];
const MODEL_UNRECORDED = /未派|未记录|未报|unknown/i;

function checkModel(file, ln, d) {
  const m = d.model;
  if (m === null || m === "" || m === undefined) {
    warns.push(`${file}#${ln}: WARN model 为空（须 provider/model 精确写法）`);
    return;
  }
  if (typeof m !== "string") { fails.push(`${file}#${ln}: model 非字符串`); return; }
  if (MODEL_SPECIAL.includes(m)) return;
  if (MODEL_UNRECORDED.test(m)) { warns.push(`${file}#${ln}: WARN unrecorded model="${m}"`); return; }
  if (!MODEL_PROVIDERS.some((p) => m.startsWith(p))) {
    warns.push(`${file}#${ln}: WARN bad model="${m}" (须 provider/model 精确写法，见白名单)`);
    return;
  }
  // 前缀合法：再核是否在已知模型全串内
  if (!KNOWN_MODELS.includes(m)) {
    warns.push(`${file}#${ln}: WARN unknown model="${m}" (前缀合法但不在已知表，请核 USER_MODEL_OVERRIDE)`);
  }
}

const CHAIN_STATUS = ["DELIVERED", "ACCEPTED", "OPEN"];
const ROLES = ["task-manager", "supervisor", "planner", "builder", "code-reviewer", "qa",
  "product-reviewer", "experience-recorder", "neat-freak", "senior-expert", "db-admin",
  "迁移整理工", "orchestrator"];
// 执行通道枚举（2026-10-11 补齐）：来源＝AGENTS.md「逐派记录」条列出的取值。
// 与 docs/roles/supervisor.md 的内联校验块同源，本处为唯一校验实现，supervisor 应复用本脚本。
const RUNTIMES = ["本窗口", "当前客户端窗口（自动探测）", "codebuddy", "codex",
  "opencode", "Claude Code", "—"];

// 2026-10-11 补齐的类型/可空性校验。
// 背景（复评 + 审查双轮实测）：此前仅校验必需键存在与少数枚举，且枚举检查 `d[k] !== null`
// 会让 null 整体绕过；date/role/used/runtime/数值类型零校验。构造反例
// date="乱写"/role="不存在角色"/used="备用"/runtime="不存在的通道"/result=null/
// used=null/used=""/rework=-1/rework=null/rework="两次" 全部 exit 0 通过。
// 本节按字段分别定义「必需键 / 类型 / 可空性 / 合法取值」，覆盖缺键、null、空串、错误类型。
const fieldRules = {
  date: {
    kind: "string",
    nullable: false,
    validate(v) {
      const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v);
      if (!m) return "bad date(须 YYYY-MM-DD)";
      const y = Number(m[1]), mo = Number(m[2]), d = Number(m[3]);
      const dt = new Date(Date.UTC(y, mo - 1, d));
      // 真实日历校验：拒绝 2026-02-30 这类正则能过但日历不存在的日期（不自动归一化）
      if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== mo - 1 || dt.getUTCDate() !== d)
        return "bad date(非真实日历日期)";
      return null;
    },
  },
  role: { kind: "string", nullable: false, enum: ROLES, enumLabel: "role" },
  result: { kind: "string", nullable: false, enum: ["PASS", "FAIL"], enumLabel: "result" },
  // used：维持现行「恒填主」语义（切备用仍填主，原因记 note）。语义一字不改。
  used: { kind: "string", nullable: false, enum: ["主"], enumLabel: "used" },
  runtime: { kind: "string", nullable: false, enum: RUNTIMES, enumLabel: "runtime" },
  // rework：返工**计数**，不允许 null/负数/非整数（审查 2026-10-11 指出不得照 tokens/cost 一并放 null）
  rework: { kind: "int", nullable: false, min: 0 },
  // tokens/cost：允许 null（拿不到填 null），有值时校验类型与范围
  tokens: { kind: "int", nullable: true, min: 0 },
  cost_cny: { kind: "number", nullable: true, min: 0 },
  escalated: { kind: "string", nullable: false, enum: ["YES", "NO"], enumLabel: "escalated" },
};

// ── 历史兼容：逐行白名单（2026-10-11 二轮返工，替换整文件指纹）──────
//
// 三轮（2026-10-11 审查二轮）修三处阻断：
//   ③ **PENDING 未生效**：原实现不检查审批状态，未批准清单照样授权且显示「已审批」。
//      → 顶层与条目**都要**通过审批状态校验，否则整份清单/单条条目不授权。
//   ④ **任意清单路径可自签发**：LEDGER_BASELINE 能指向任何 JSON。
//      → **生产校验只读受治理的固定基线路径**，不接受环境变量提供新授权清单；
//        codex 审查 2026-10-11 实测「环境变量双开关」仍可自签发，故**彻底移除该能力**：
//        codex 第二轮复审：换成 CLI 参数**仍是**普通调用方可用的能力，不构成隔离。
//        **最终处置**：正式 CLI 完全无注入通道；注入改由测试驱动复制隔离副本完成。
//   ⑥ **条目缺审批人继承顶层**：`e.approved_by ?? j.approved_by` 让「仅删条目审批人」仍授权，已禁止继承。
//   ⑦ **来源只绑 basename**：另一来源的同名目录可继承 → 改为 source_id 身份文件匹配。
//   ⑧ **同行多字段被整行键去重吞掉** → 授权键改为 (来源, 文件, 物理行号, **字段**)。
//   ⑤ **行内容哈希可无限复用**：把已获批错误行原样复制到第二行，两行都获豁免。
//      → 授权键加入**物理行号**，且同键只允许**首次出现**生效一次（occurrence=1）。
//
// 授权粒度（四要素 + 一次性）：(项目目录名, 账本文件, 物理行号, 该行完整 sha256, 字段)
//   · 追加新记录不影响旧行（授权按行号定位，不按文件哈希）；
//   · **逐字节相同的新增行不会继承豁免**（行号不符 → 不授权）；
//   · 仅对 used/runtime/rework 生效；result/结构类永不可豁免；
//   · 清单未经审批 → 零授权。
//
// 关于行号：**物理行号**＝原文件按 \n 切分后的 1-based 下标（空行也占位），
// 不做空行过滤，避免「过滤后下标 ≠ 原文件行号」。行号与 sha256 **双重校验**：
// 行号对但内容被改 → sha 不符 → 失效；内容相同但位置不同 → 行号不符 → 失效。
const GRACEABLE_FIELDS = new Set(["used", "runtime", "rework"]);  // 唯一可豁免集合
const APPROVED_OK = (s) => typeof s === "string" && s.trim() !== "" && !/^PENDING$/i.test(s.trim());
let baselineEntries = new Map();   // key: project\0file\0lineNo -> { sha, fields:Set, reason }
let baselineState = { loaded: false, path: null, approved: false, rejected: [], entries: 0 };

// ── 来源身份（codex 审查 2026-10-11 指出 basename 不足）───────────────
// 另一来源的同名目录（内容、位置完全相同）曾能继承授权。现改为：
// 清单必须写 source_id（受治理来源标识），运行时由项目内的身份文件
// `docs/model/GOVERNANCE-SOURCE.json` 提供 source_id 供匹配；
// 无身份文件 → 只能用清单里显式登记的 source_id，且**目录名不同一律不匹配**。
// 目标：阻止「同名即继承」，不要求庞大身份系统。
const SOURCE_ID_FILE = "docs/model/GOVERNANCE-SOURCE.json";
function currentSourceId(projectRoot, projectName) {
  try {
    const j = JSON.parse(readFileSync(join(projectRoot, SOURCE_ID_FILE), "utf8"));
    return typeof j.source_id === "string" && j.source_id.trim() ? j.source_id.trim() : null;
  } catch { return null; }
}
// 匹配键：优先用清单条目的 source_id；清单未写则回退到登记的目录名。
// 若项目自带身份文件，则**必须**与条目 source_id 完全一致才算同一来源。
function sourceIdentity(entrySourceId, entryProject) {
  return `${entrySourceId || "name:" + entryProject}`;
}
function sameSource(entrySourceId, entryProject, projectRoot, projectName) {
  const actual = currentSourceId(projectRoot, projectName);
  if (actual) return !!entrySourceId && actual === entrySourceId;   // 有身份文件 → 必须显式匹配
  // 无身份文件：仅按清单登记的目录名匹配（不同名不继承）
  return entryProject === projectName;
}

// 正式入口：**只**读受治理的固定基线路径，无任何注入开关。
// 演进：① 环境变量 LEDGER_BASELINE ② 环境变量双开关 ③ CLI --baseline-test-inject
//      —— 三种都被 codex 审查实测可自签发，因为它们都是「普通调用方可设置的能力」。
// 现正式 CLI 已移除全部三种；测试通过**复制隔离副本并改写副本内的 BASELINE_PATH**
// 来注入（见 ledger-legacy.test.mjs 的 makeIsolatedLedger），正式文件不被触碰。
// 正式入口：**唯一**基线路径，不可由调用参数改变。
// codex 审查两轮均指出「环境变量双开关」与「--baseline-test-inject 参数」都是普通调用方可用的
// 能力，不构成隔离。注入改由**测试驱动**完成：测试把本脚本复制到隔离副本，
// 在副本里改写基线路径常量后运行（见 ledger-legacy.test.mjs 的 makeIsolatedLedger）。
const BASELINE_PATH = "/Users/zzymima0000/Developer/coding/4.Templates（PC）/2026-09-09 丨 MAC 丨 ORCA V2.1 治理模板 丨 分发版-2026-09-11/scripts/model/fixtures/ledger-legacy/baseline.pending.test.json";

function loadBaseline() {
  const p = BASELINE_PATH;
  baselineState = { loaded: false, path: p, approved: false, rejected: [], entries: 0 };
  if (!existsSync(p)) return p;                       // 无清单 → 严格模式，零豁免
  let j;
  try { j = JSON.parse(readFileSync(p, "utf8")); }
  catch { baselineState.rejected.push("清单不是合法 JSON"); return p; }
  baselineState.loaded = true;
  // 顶层审批：approved_by 与 approved_at 必须都存在且非 PENDING，否则整份清单不授权
  if (!APPROVED_OK(j.approved_by)) baselineState.rejected.push(`顶层 approved_by 未获批：${j.approved_by ?? "(缺)"}`);
  if (!APPROVED_OK(j.approved_at)) baselineState.rejected.push(`顶层 approved_at 未获批：${j.approved_at ?? "(缺)"}`);
  if (baselineState.rejected.length) return p;        // 顶层未批 → 一条都不授权
  baselineState.approved = true;
  for (const e of (j.entries || [])) {
    // 条目审批：与顶层同规则，缺一不授权该条
    // 两级各自审批：**条目缺 approved_by 不再继承顶层**（codex 审查 2026-10-11 指出
    // `e.approved_by ?? j.approved_by` 让「仅删条目审批人」仍 exit0）。契约：顶层与条目
    // 各自必须显式非 PENDING，缺失即该条目不授权。
    if (!APPROVED_OK(e.approved_by)) { baselineState.rejected.push(`${e.file}#${e.line_no} approved_by 未获批`); continue; }
    if (!APPROVED_OK(e.approved_at)) { baselineState.rejected.push(`${e.file}#${e.line_no} approved_at 未获批`); continue; }
    if (!GRACEABLE_FIELDS.has(e.field)) { baselineState.rejected.push(`${e.file}#${e.line_no} 字段 ${e.field} 不可豁免`); continue; }
    // 来源格式：必须形如 orca-src-<16 位十六进制>。缺失／空串／非法一律**在加载期拒绝**，
    // 不进授权表——避免「格式非法但恰好等于项目身份」这类边角命中。
    if (typeof e.source_id !== "string" || !/^orca-src-[0-9a-f]{16}$/.test(e.source_id)) {
      baselineState.rejected.push(`${e.file}#${e.line_no} source_id 缺失或格式非法（须 orca-src-＋16位十六进制）`);
      continue;
    }
    if (!/^[0-9a-f]{64}$/.test(e.line_sha256 || "")) { baselineState.rejected.push(`${e.file}#${e.line_no} sha256 非法`); continue; }
    if (!Number.isInteger(e.line_no) || e.line_no < 1) { baselineState.rejected.push(`${e.file}#${e.line_no} line_no 非法`); continue; }
    // 授权键含**来源指纹 + 字段**（codex 审查指出：只取项目 basename 时，
    // 另一来源的同名目录会继承授权；且同行多字段被整行去重吞掉）。
    // · source_id：受治理的项目身份（见 sourceIdentity），不只是 basename；
    // · key 含 field：同一物理行可分别批准 used 与 runtime，互不影响。
    const key = `${sourceIdentity(e.source_id, e.project)}\u0000${e.file}\u0000${e.line_no}\u0000${e.field}`;
    if (baselineEntries.has(key)) { baselineState.rejected.push(`${e.file}#${e.line_no}/${e.field} 重复条目，后者忽略`); continue; }
    baselineEntries.set(key, { sha: e.line_sha256, field: e.field,
      expected: e.expected_value, reason: e.reason || "",
      sourceId: e.source_id || null, project: e.project, file: e.file });
    baselineState.entries++;
  }
  return p;
}

// 授权匹配：来源 → (文件, 物理行号, 字段) → 行内容 sha256 → expected_value。
// 来源判定（codex 审查 2026-10-11：只绑 basename 不足，同名目录会继承）：
//   · 项目内存在 docs/model/GOVERNANCE-SOURCE.json → 该文件的 source_id 必须与
//     清单条目 source_id **完全一致**才可能命中；
//   · 项目无身份文件 → 只按清单条目登记的 project 目录名匹配，不同名不继承。
function graceFor(ctx, file, physicalLineNo, rawLine, field, value) {
  const sha = createHash("sha256").update(rawLine).digest("hex");
  const identity = currentSourceId(ctx.projectRoot, ctx.projectName);   // null | source_id
  const SEP = "\u0000";
  for (const [key, e] of baselineEntries) {
    const parts = key.split(SEP);
    if (parts.length !== 4) continue;
    const [eIdent, eFile, eLine, eField] = parts;
    if (eFile !== file || eLine !== String(physicalLineNo) || eField !== field) continue;
    // 来源判定（codex 第三轮 2026-10-11 裁决：正式兼容方案放行前必须堵死「无来源回退」）：
    //   条目**必须**声明 source_id，且项目必须提供完全一致的 GOVERNANCE-SOURCE.json。
    //   无 / 空 / 无效 source_id 一律不授权——**不再回退到项目目录名**。
    //   理由：目录名可被随意复制，回退等于「复制文件即可继承他人授权」。
    // 纵深防御：加载期已校验 source_id 格式，此处再挡一次（若加载期被绕过仍不放行）。
    // 说明：该道**当前无独立测试覆盖**——去掉它，39 条仍全绿，因为加载期格式校验
    // 已拦下全部无/非法 source_id 的条目。属有意保留的冗余，非失效代码。
    if (!e.sourceId) continue;
    if (!identity || e.sourceId !== identity) continue; // 项目无身份文件或不匹配 → 不授权
    if (sha !== e.sha) continue;                       // 行号对但内容被改 → 失效
    if (e.expected !== undefined && JSON.stringify(e.expected) !== JSON.stringify(value)) continue;
    return { reason: e.reason };
  }
  return null;
}

// 2026-10-11 二轮：豁免粒度收到「行 × 字段」，且只对 GRACEABLE_FIELDS 开放。
// 审查要求：获批历史的 used 错误可兼容，但同文件的 result 错误、结构错误、
// 以及任何新增非法行仍必须 FAIL。
function checkFields(file, physicalLineNo, d, ctx, rawLine) {
  // push 时先问：该 (项目,文件,行,字段) 是否在**审批清单**内。仅此一种情况降 WARN。
  const push = (field, value, msg) => {
    const g = GRACEABLE_FIELDS.has(field) ? graceFor(ctx, file, physicalLineNo, rawLine, field, value) : null;
    if (g) warns.push(`${file}#${physicalLineNo}: WARN(历史豁免·已审批清单) ${msg}｜依据：${g.reason || "清单条目"}`);
    else fails.push(`${file}#${physicalLineNo}: ${msg}`);
  };
  for (const [key, r] of Object.entries(fieldRules)) {
    if (!(key in d)) continue;                      // 缺键由必需键检查负责
    const v = d[key];
    if (v === null || v === undefined) {
      if (r.nullable) continue;                     // 允许 null（如 tokens/cost 拿不到）
      push(key, v, `bad ${key}=null（必填，不可为 null）`);
      continue;
    }
    if (r.kind === "string" && typeof v !== "string") {
      push(key, v, `bad ${key}=${JSON.stringify(v)}（须字符串）`); continue;
    }
    if (r.kind === "string" && v === "") { push(key, v, `bad ${key}=（空串）`); continue; }
    // 布尔不是合法数值（typeof true === "boolean"，此处显式排除）
    if ((r.kind === "int" || r.kind === "number") && typeof v === "boolean") {
      push(key, v, `bad ${key}=${JSON.stringify(v)}（布尔非合法数值）`); continue;
    }
    if (r.kind === "int") {
      // 整数：须有限 + 整数 + 安全整数（防 1e309→Infinity 与超 2^53 精度丢失）
      if (typeof v !== "number" || !Number.isFinite(v)) {
        const shown = (typeof v === "number" && !Number.isFinite(v)) ? String(v) : JSON.stringify(v);
        push(key, v, `bad ${key}=${shown}（须有限整数${r.nullable ? "或 null" : ""}）`); continue;
      }
      if (!Number.isInteger(v)) {
        push(key, v, `bad ${key}=${JSON.stringify(v)}（须整数${r.nullable ? "或 null" : ""}）`); continue;
      }
      if (!Number.isSafeInteger(v)) {
        push(key, v, `bad ${key}=${v}（超出安全整数范围）`); continue;
      }
    }
    if (r.kind === "number") {
      // 金额等一般数值：须有限 + 非负（1e309 会被 JSON 解析成 Infinity，必须显式拒）
      if (typeof v !== "number" || !Number.isFinite(v)) {
        // Infinity/NaN 经 JSON.stringify 会显示为 null，直接打印易误判，此处显式还原
        const shown = (typeof v === "number" && !Number.isFinite(v)) ? String(v) : JSON.stringify(v);
        push(key, v, `bad ${key}=${shown}（须有限数值${r.nullable ? "或 null" : ""}）`); continue;
      }
    }
    if (r.kind === "int" || r.kind === "number") {
      if (typeof v === "number" && r.min !== undefined && v < r.min) {
        push(key, v, `bad ${key}=${v}（须 ≥ ${r.min}）`); continue;
      }
    }
    if (r.enum && !r.enum.includes(v)) {
      push(key, v, `bad ${r.enumLabel}=${JSON.stringify(v)}（合法取值：${r.enum.join(" / ")}）`);
      continue;
    }
    if (r.validate) {                                // 自定义校验（如真实日历日期）
      const msg = r.validate(v);
      if (msg) push(key, v, msg);
    }
  }
}

// 基线须在任何 check() 之前载入（否则首轮豁免查不到条目）
loadBaseline();

function check(file, need, enums, evidence) {
  const p = join(dir, file);
  if (!existsSync(p)) { fails.push(`${file}: MISSING`); return; }
  const raw = readFileSync(p, "utf8");
  const projectRoot = dirname(dirname(dir));              // <proj>
  const projectName = basename(projectRoot);              // 项目目录名
  // 来源判定上下文：清单条目若写了 source_id，则项目必须提供匹配的 GOVERNANCE-SOURCE.json
  const ctx = {
    projectName, projectRoot,
    entrySourceOf: (file) => {
      for (const e of baselineEntries.values()) if (e.file === file) return e.sourceId || null;
      return null;
    },
    sourceOk(file) {
      const actual = currentSourceId(projectRoot, projectName);
      // 有身份文件：必须与条目 source_id 匹配；无身份文件：条目必须登记同名 project
      if (actual) {
        for (const [k, e] of baselineEntries) {
          if (!k.includes(`\u0000${file}\u0000`)) continue;
          if (e.sourceId && e.sourceId === actual) return true;
        }
        return false;
      }
      for (const [k, e] of baselineEntries) {
        if (!k.includes(`\u0000${file}\u0000`)) continue;
        if (e.project === projectName) return true;
      }
      return false;
    },
  };
  // **物理行号**（审查要求）：按 \n 切分后不过滤空行，下标即原文件行号。
  // 空行占位不跳号 —— 否则「过滤后下标」会与清单里的 line_no 错位。
  const physical = raw.split("\n");
  let n = 0;
  for (let i = 0; i < physical.length; i++) {
    const l = physical[i];
    if (!l.trim()) continue;                        // 空行不校验，但**占位**（i 不推进）
    const ln = i + 1;                               // 物理行号（1-based）
    let d;
    try { d = JSON.parse(l); } catch { fails.push(`${file}#${ln}: BAD_JSON`); continue; }
    if (d === null || typeof d !== "object" || Array.isArray(d)) { fails.push(`${file}#${ln}: NOT_OBJECT`); continue; }
    if (d._example === true) continue;
    n++;
    for (const k of need) if (!(k in d)) fails.push(`${file}#${ln}: missing ${k}`);
    // 结构/结果类硬错误：既有枚举检查，**永不可历史豁免**
    for (const [k, vs] of Object.entries(enums)) {
      if (k in d && d[k] !== null && !vs.includes(d[k])) fails.push(`${file}#${ln}: bad ${k}=${d[k]}`);
    }
    checkFields(file, ln, d, ctx, l);   // ln 即物理行号
    checkModel(file, ln, d);
    if ("executed_by" in d && d.executed_by !== null && !ROLES.includes(d.executed_by)) {
      fails.push(`${file}#${ln}: bad executed_by=${d.executed_by}`);
    }
    if ("chain_status" in d && d.chain_status !== null && !CHAIN_STATUS.includes(d.chain_status)) {
      fails.push(`${file}#${ln}: bad chain_status=${d.chain_status}`);
    }
    // 证据质量（仅 TASK 账；启发式、advisory）：result=PASS 但备注含未闭环字样且未标 OPEN → WARN
    if (evidence && d.result === "PASS" && typeof d.note === "string"
        && /待评审|待复验|待验证|未验证|产品阻塞|待用户验收|未闭环|未完成/.test(d.note)
        && d.chain_status !== "OPEN") {
      warns.push(`${file}#${ln}: WARN result=PASS 但备注含未闭环字样，建议 chain_status=OPEN`);
    }
  }
  const nex = physical.filter((l) => { if (!l.trim()) return false; try { return JSON.parse(l)._example === true; } catch { return false; } }).length;
  if (n === 0 && nex > 0) {
    const m = `${file}: _example 行未删（首个真实任务前删除示例行）`;
    if (ALLOW_EXAMPLE) warns.push(`[--allow-example] ${m}`); else fails.push(m);
  } else if (n === 0) warns.push(`${file}: 空账本（首个真实任务/派工前正常）`);
  if (n > 0 && nex > 0) {
    const m = `${file}: ${nex} _example rows mixed with ${n} real rows (示例行必须在首个真实任务前删除)`;
    if (ALLOW_EXAMPLE) warns.push(`[--allow-example] ${m}`); else fails.push(m);
  }
}
check("TASK-MODEL-LOG.jsonl",
  ["task", "project", "date", "role", "model", "result", "rework", "escalated", "escalation_reason", "tokens", "cost_cny"],
  { result: ["PASS", "FAIL"], escalated: ["YES", "NO"] }, true);
check("DISPATCH-LOG.jsonl",
  ["date", "task", "role", "model", "used", "runtime", "result"],
  { result: ["PASS", "FAIL"] });

// ── APP 基础能力声明检查（2026-10-08）──────────────────────────────
// 背景：APP 主题/多语言默认要求只写在 PRODUCT_PLAN 模板里，Phase1 收工时无人拦，
// 要到 Design Pipeline 才 BLOCKED（拦得住但白干一轮文档）。这里把校验前移到收工检查。
// 只报 FAIL/WARN，不新增流程与 Gate。规则见 docs/sop/app-theme-i18n.md。
// 路径归一：去前导 ./ 与重复斜杠，便于精确比对
function normalizePath(p) {
  return String(p).replace(/\/\.\//g, "").replace(/\/\/\//g, "/").replace(/^\.\//, "");
}

function readIfExists(p) { try { return existsSync(p) ? readFileSync(p, "utf8") : ""; } catch { return ""; } }

// HANDOFF 指名的需求真源（PLAN_VERSION 行里指向的 Plan 文件路径）
function trueSource(root) {
  const h = readIfExists(join(root, "docs/handoff/HANDOFF.md"));
  if (!h) return { src: null, err: "docs/handoff/HANDOFF.md 不存在，无法判定需求真源" };
  const line = h.split("\n").find((l) => /PLAN_VERSION/.test(l));
  if (!line) return { src: null, err: "HANDOFF 无 PLAN_VERSION 行，需求真源不可判定" };
  const m = line.match(/`([^`]+\.md)`/);
  if (!m) return { src: null, err: "HANDOFF 的 PLAN_VERSION 未用反引号标出 Plan 文件路径，真源不可判定" };
  const p = m[1];
  if (!existsSync(join(root, p))) return { src: null, err: `HANDOFF 的 PLAN_VERSION 指向的文件不存在：${p}` };
  return { src: p, err: null };
}

// APP 基础能力硬门（2026-10-08 B1 升级：从 WARN 升 FAIL）
// 前一版三处空转：①模板自带六关键字→原样也命中；②只 WARN 而迁移提示词写「WARN 视为通过」；
// ③只 grep 声明段、从不校验这六类是否真进了「关键 AC 集合」。现改为：
//   · 六类必须出现在**标了 关键：是 的 AC 条目**里（匹配范围限定到关键 AC 行，不再 grep 整篇）；
//   · 命中不到 ⇒ FAIL（真拦，不是提醒）；非 APP 项目与历史版本不受影响。
// APP 品牌资产（2026-10-08）：与主题/多语言同属 APP 前置，单一真源 docs/sop/app-brand-assets.md
const BRAND_DECL = /(APP\s*品牌资产方向|品牌资产方向)/;
const BRAND_AC = [
  ["三方向附命名候选", /中文名|中文名称|命名候选|名称建议|命名/],
  ["三方向附图标方向", /图标|icon/i],
  ["三方向附启动画面方向", /启动画面|启动页|Splash|Launch|闪屏/i],
  ["Freeze 锁定最终四项", /最终拍板|最终定稿|Freeze.*锁定|锁定.*最终|冻结.*最终/],
];

// APP 导航与视觉方向（2026-10-09 审查 B4 决议：加机器码）。单一真源 docs/sop/app-navigation.md
// 注意：模板自带的小节标题「**APP 导航与视觉方向声明（…）**」会让宽松正则恒真，
// 导致"空声明也算已填"。故 NAV_DECL 只认**实际填写的标记行**（行首无 ** 包裹）。
const NAV_DECL = /^\s*-\s*APP\s*导航与视觉方向声明[：:]\s*\S/m;
const NAV_AC = [
  ["三方向同一核心页面对比", /同一核心页面|同页对比|同页并置|核心页面/],
  ["非只改配色", /只改配色|换配色|配色变化|非只换色/],
  ["底部导航决策已写明", /是否采用底部导航|底部导航.*(采用|不采用)|需不需要底部|是否需要底部/],
  ["底栏滚动固定不遮挡", /底栏.*(固定|位置固定)|滚动.*独立|不被遮挡|内容不被遮挡/],
  ["Android 真机证据", /真机|实机|运行截图|录屏|设备运行/],
];

// 关键词门只验字面，故必须同时接受中文等价说法——否则「主题三态：浅色/深色/跟随系统」
// 这类完全合规的写法会被误判 FAIL（2026-10-08 实测正例暴露）。
const APP_AC = [
  ["主题三态", /LIGHT|浅色|深色|三态/],
  ["SYSTEM 默认", /SYSTEM|跟随系统|系统主题|系统外观/],
  ["中英可用", /zh-CN|中文|英语|english|\ben\b/i],
  ["不支持语言回退 zh-CN", /回退|fallback|兜底/],
  ["设置持久化", /持久|persist|重启保留|重启保持/i],
  ["切换不丢状态", /不丢|不丢业务|保持|preserv|状态保持/i],
];

// 抽出「关键：是」的 AC 条目行（关键 AC 集合），匹配只在这里面做
function criticalAcLines(text) {
  const out = [];
  for (const ln of text.split("\n")) {
    if (!/AC-\d+/.test(ln)) continue;
    if (/关键\s*[:：]\s*是|\*\*关键：是\*\*/.test(ln)) out.push(ln);
  }
  return out;
}

function checkAppBaseline(root) {
  const pmDir = join(root, "docs/pm");
  // 本项目根本没有 Product Plan（纯后端仓/未立项仓）⇒ 本检查不适用，直接跳过
  if (!existsSync(pmDir)) return;
  const ts = trueSource(root);
  const src = ts.src;
  const cands = [];
  if (existsSync(pmDir)) {
    let files = [];
    try { files = readdirSync(pmDir).filter((f) => f.endsWith(".md") && !f.includes("template")); } catch { files = []; }
    for (const f of files) {
      if (!/^PRODUCT[_-]?PLAN/i.test(f) && !/Product\s*Plan/i.test(f)) continue;
      // 精确匹配真源路径；不再用 basename 包含判断（改名即可绕过＝漏洞）
      const label = `docs/pm/${f}`;
      const same = (p) => p === label || p === f || normalizePath(p) === normalizePath(label);
      cands.push({ label, isSrc: same(src) });
    }
  }
  // HANDOFF 指名但在 docs/pm/ 之外的真源（如项目根的用户草稿）也要查
  if (src && !cands.some((c) => c.isSrc)) {
    const direct = readIfExists(join(root, src));
    // 只认**产品计划类**文档：技术规格（specs/…spec.md 等）不是 Product Plan，不得当计划判
    if (direct && /product[\s_-]?plan|产品\s*plan|需求/i.test(src)) {
      cands.push({ label: src, isSrc: true });
    }
  }
  // 需求真源不可判定或与候选都不匹配 ⇒ FAIL（2026-10-08）。
  // 修掉一个旁路：此前用 basename 包含判断，改个文件名即可让强门静默降级成 WARN。
  if (!src) {
    fails.push(`APP-TRUEOUT-SOURCE-UNRESOLVED — ${ts.err}。docs/pm 下有 Product Plan 但无法确认哪份是真源时，`
      + `不得默认放行：补齐 HANDOFF 的 PLAN_VERSION（格式：- PLAN_VERSION：以 \`路径.md\` 为需求真源）后重跑。`);
    return;
  }
  if (cands.length && !cands.some((c) => c.isSrc)) {
    fails.push(`APP-TRUEOUT-SOURCE-MISMATCH — HANDOFF 的 PLAN_VERSION 指向 \`${src}\`，`
      + `但 docs/pm 下没有同名 Plan（现有：${cands.map((c) => c.label).join("、")}）。`
      + `真源被改名或移走时不得默认放行：把 PLAN_VERSION 改成实际路径后重跑。`);
    return;
  }
  for (const c of cands) {
    const text = readIfExists(join(root, c.label));
    if (!text) continue;
    const probe = text.replace(/(无|不含|不做|不涉及|非|不适用)[^\n]{0,12}?(Android|iOS|Flutter|小程序|移动端|APP|客户端)/gi, "");
    const strong = /(Android|iOS|Flutter|React\s*Native|小程序|移动端|APP\s*(项目|应用|端)|面向用户交付|客户端\s*App|APK|IPA)/i.test(probe);
    const basis = /(LIGHT|DARK|SYSTEM|深色|浅色|主题切换|zh-CN|多语言|国际化|本地化)/.test(probe);
    if (!strong && !basis) continue;
    if (!/(APP\s*基础能力声明|app[-_ ]baseline)/.test(text)) {
      const msg = `缺「APP 基础能力声明」（主题三态/语言集/系统跟随/回退/持久化；见 docs/sop/app-theme-i18n.md）`;
      if (c.isSrc) fails.push(`${c.label}: APP-BASELINE-MISSING — ${msg}。不进 Design Pipeline，补齐后再收工。`);
      else warns.push(`${c.label}: WARN 非当前真源的 APP Product Plan ${msg}（历史版本可不补；若将启用则须先补）`);
      continue;
    }
    // 关键 AC 集合必须非空且覆盖六类
    const crit = criticalAcLines(text);
    if (!crit.length) {
      if (c.isSrc) fails.push(`${c.label}: APP-CRITICAL-AC-EMPTY — 已声明 APP 基线，但关键 AC 集合为空或无一条标「关键：是」；`
        + `六类（主题三态／SYSTEM 默认／中英可用／回退 zh-CN／持久化／切换不丢状态）必须进关键 AC 集合，不得进 Human Review。`);
      continue;
    }
    const pool = crit.join("\n");
    const missing = APP_AC.filter(([, re]) => !re.test(pool)).map(([n]) => n);
    if (missing.length) {
      if (c.isSrc) fails.push(`${c.label}: APP-CRITICAL-AC-INCOMPLETE — 关键 AC 集合未覆盖：${missing.join("、")}。`
        + `这六类必须各自有一条标「关键：是」的 AC；补不齐不得进 Human Review。`);
      else warns.push(`${c.label}: WARN 非当前真源的 APP Plan 关键 AC 未覆盖：${missing.join("、")}`);
    }
    // 品牌资产：声明缺失 FAIL；关键 AC 未覆盖 FAIL
    if (!BRAND_DECL.test(text)) {
      const m = `缺「APP 品牌资产方向」（中文名/英文名/安卓图标/启动画面方向；见 docs/sop/app-brand-assets.md）。`
        + `P045 教训：品牌资产未前置，开发阶段由执行者自行决定命名与图标，结果不可控。`;
      if (c.isSrc) fails.push(`${c.label}: APP-BRAND-ASSETS-MISSING — ${m} 未补齐不得进 Design Pipeline。`);
      else warns.push(`${c.label}: WARN 非当前真源的 APP Plan ${m}`);
    } else {
      const missB = BRAND_AC.filter(([, re]) => !re.test(pool)).map(([n]) => n);
      if (missB.length) {
        if (c.isSrc) fails.push(`${c.label}: APP-BRAND-AC-INCOMPLETE — 品牌资产关键 AC 未覆盖：${missB.join("、")}。`
          + `三方向附候选与 Freeze 锁定最终四项必须各有标「关键：是」的 AC；缺任一类不得进 Human Review。`);
        else warns.push(`${c.label}: WARN 非当前真源的 APP Plan 品牌资产关键 AC 未覆盖：${missB.join("、")}`);
      }
    }
    // 导航与视觉方向：声明缺失 FAIL；关键 AC 未覆盖 FAIL（同构于品牌/主题）
    // 兼容口径（同原型门）：只对**新规 Plan**判 FAIL——判据＝Plan 里带模板新增的
    // 「APP 导航与视觉方向声明」小节。早于本规则的历史 Plan（含在开发的 P045/P046）
    // 只报 WARN，不打断其开发链（用户令：不打断 P045；P046 先补 HTML 不被导航门卡住）。
    const navNewRegime = /APP\s*导航与视觉方向声明/.test(text);
    if (!NAV_DECL.test(text) && navNewRegime) {
      const m = `缺「APP 导航与视觉方向声明」（底部导航是否采用及理由、三方向差异化轴、导航入口/图标/四态/排版/显隐/适配；`
        + `见 docs/sop/app-navigation.md）。导航是产品决策，不是 Builder 临场发挥；未定清楚会导致底栏随意设计或跟随内容滚动。`;
      if (c.isSrc) fails.push(`${c.label}: APP-NAV-DECL-MISSING — ${m} 未补齐不得进 Design Pipeline。`);
      else warns.push(`${c.label}: WARN 非当前真源的 APP Plan ${m}`);
    } else {
      const missN = NAV_AC.filter(([, re]) => !re.test(pool)).map(([n]) => n);
      if (missN.length) {
        if (c.isSrc) fails.push(`${c.label}: APP-NAV-AC-INCOMPLETE — 导航关键 AC 未覆盖：${missN.join("、")}。`
          + `这五类必须各自有一条标「关键：是」的 AC；缺任一类不得进 Human Review。`);
        else warns.push(`${c.label}: WARN 非当前真源的 APP Plan 导航关键 AC 未覆盖：${missN.join("、")}`);
      }
    }
    // Phase1 原型交付完整性（2026-10-09 用户定，P046 教训）
    // Readiness Gate 的附加条件，不新增 Gate：APP 进 WAITING_HUMAN_APPROVAL 前必须有
    // 可运行的交互原型，且「文件存在」与「真实运行」分开判定。
    //   · PDF／截图／纯文档／在线概念图／单张示例预览 HTML 不算原型。
    checkPrototypeDelivery(root, c.label, text);
  }
}

// Phase1 原型交付完整性检查（Readiness Gate 附加条件）
// 失败码：PROTO-MISSING / PROTO-NOT-RUNNABLE / PROTO-NO-RUNTIME-EVIDENCE
const PROTO_DIR = "docs/design/prototype";
// 计数用：真实运行证据（浏览器自动化冒烟测试记录）
function protoHasRuntimeEvidence(root) {
  const dirs = [join(root, PROTO_DIR), join(root, "docs/design")];
  const hits = [];
  for (const d of dirs) {
    if (!existsSync(d)) continue;
    let files = [];
    try { files = readdirSync(d).filter((f) => /\.(md|json|log)$/i.test(f)); } catch { files = []; }
    for (const f of files) {
      const t = readIfExists(join(d, f));
      // 浏览器自动化/真实运行证据的关键词：Playwright/Cypress/browser executed/console 等
      if (/(playwright|cypress|puppeteer|browser[_ ]?executed|浏览器自动化|冒烟测试|smoke)/i.test(t)) hits.push(`${PROTO_DIR}/${f}`);
    }
  }
  return hits;
}

function checkPrototypeDelivery(root, planLabel, planText) {
  const ts = trueSource(root);
  const isSrc = !!ts.src && normalizePath(planLabel) === normalizePath(ts.src);
  // 兼容口径：本规则只对**新规下写的** Product Plan 判 FAIL。
  // 判据＝Plan 里带模板新增的「原型交付完整性检查条件」小节；早于本规则的历史 Plan
  // （如正在开发的 P045）没有该小节，只报 WARN，不打断其开发链（用户令：P045 不打断）。
  const underNewRegime = /原型交付完整性检查条件/.test(planText);
  const hard = isSrc && underNewRegime;

  const protoDir = join(root, PROTO_DIR);
  const htmls = [];
  if (existsSync(protoDir)) {
    try {
      for (const f of readdirSync(protoDir)) {
        if (/\.html$/i.test(f) && !/example|sample|demo-preview/i.test(f)) htmls.push(f);
      }
    } catch { /* ignore */ }
  }

  if (!htmls.length) {
    const msg = `Phase1 未交付可运行交互原型（${PROTO_DIR}/ 下无可运行 HTML）。`
      + `面向用户的 APP 在 Phase1 必须交付本地完整可运行的原型（核心页面完整、关键交互可操作、`
      + `已确定名称/图标/品牌/真实图片落实、浅深色与语言及异常状态可演示、给出路径与打开命令）；`
      + `PDF／截图／纯文档／在线概念图／单张示例预览 HTML 不算。见 AGENTS.md「Phase1 必须交付可运行交互原型」。`;
    if (hard) fails.push(`${planLabel}: PROTO-MISSING — ${msg}`);
    else warns.push(`${planLabel}: WARN 未交付可运行交互原型${underNewRegime ? "（非真源 Plan）" : "（本 Plan 早于原型规则，仅提醒）"}：${msg}`);
    return;
  }

  // 文件存在 ≠ 真实运行：分开判定，不能拿「HTML 存在」代替交互冒烟测试
  const evidence = protoHasRuntimeEvidence(root);
  if (!evidence.length) {
    const msg = `有原型文件但缺**真实运行验证证据**（浏览器自动化冒烟测试记录：路径、运行方式、`
      + `跑了哪些交互、结果、已知限制）。文件存在检查与真实运行检查必须分开——不能拿「检查 HTML 存在」`
      + `代替交互测试。`;
    if (hard) fails.push(`${planLabel}: PROTO-NO-RUNTIME-EVIDENCE — ${msg}`);
    else warns.push(`${planLabel}: WARN ${msg}`);
  }
}

const projectRoot = basename(dir) === "model" ? join(dir, "..", "..") : dir;
// 母版/分发包自检（--allow-example）跳过 APP 门（2026-10-09 修 P1-5）：
// 母版是**分发源**、不是受治理的真实项目——没有产品计划真源、没有 Phase2 APP 项目，
// 跑 APP 门必然报 TRUEUT-UNRESOLVED 等，属噪声。真项目的 APP 门照常生效。
if (existsSync(dir) && !ALLOW_EXAMPLE) checkAppBaseline(projectRoot);

// 基线加载诊断：把被拒条目显式打印出来（只提示，不影响 exit）。
// 审查要求「拒绝授权应有可核对的原因」——否则清单里写错 source_id 会静默失效。
if (baselineState.loaded && baselineState.rejected.length) {
  for (const r of baselineState.rejected) warns.push(`[基线] 未授权条目：${r}`);
}
if (baselineState.loaded && baselineState.entries === 0 && !baselineState.rejected.length) {
  warns.push("[基线] 清单已加载但无任何条目生效");
}
for (const w of warns) console.log(w);
if (fails.length) { console.log(fails.join("\n")); process.exit(1); }
console.log(warns.length ? "LEDGER-OK (含 WARN)" : "LEDGER-OK");
