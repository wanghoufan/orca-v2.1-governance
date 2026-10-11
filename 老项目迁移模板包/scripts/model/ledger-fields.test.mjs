#!/usr/bin/env node
// ledger-fields.test.mjs｜账本字段类型/可空性/枚举校验的回归（2026-10-11）
//
// 目的：把复评与两轮审查查出的「非法字段零校验」漏洞变成可反复执行的断言。
// 起因（全部实测确认，构造反例 exit 0 通过）：
//   派工账 date/role/used/runtime 零校验；枚举检查 `d[k] !== null` 让 null 整体绕过；
//   任务账 rework 无类型/范围校验（-1／null／字符串／小数全放行）。
// 跑法：node scripts/model/ledger-fields.test.mjs
//
// 每个用例是隔离的最小项目夹具，落在 fixtures/ledger-fields/（版本库内固定路径，禁清场）。
import { execFileSync, spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync, mkdtempSync, cpSync, rmSync, writeFileSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";

const HERE = dirname(fileURLToPath(import.meta.url));
const LEDGER = join(HERE, "check-ledger.mjs");
const FIX = join(HERE, "fixtures", "ledger-fields");

// 用 spawnSync：exit 0 时也要拿到 stdout（WARN 文案只在 stdout，execFileSync 成功路径不返回输出）
function runLedger(projectDir, env) {
  const r = spawnSync("node", [LEDGER, join(projectDir, "docs", "model")],
    { encoding: "utf8", env: { ...process.env, ...(env || {}) } });
  return { code: r.status ?? 1, out: `${r.stdout ?? ""}${r.stderr ?? ""}` };
}
function withFixture(name, fn, env) {
  const src = join(FIX, name);
  if (!existsSync(src)) throw new Error(`缺夹具：${src}`);
  const tmp = mkdtempSync(join(tmpdir(), "orca-ledger-"));
  try { cpSync(src, tmp, { recursive: true }); return fn(tmp, env); }
  finally { rmSync(tmp, { recursive: true, force: true }); }
}
const results = [];
const check = (name, ok, detail = "") => {
  results.push({ name, ok });
  console.log(`${ok ? "PASS " : "FAIL "} ${name}${detail ? ` — ${detail}` : ""}`);
};

// ── 用例表：[名称, 夹具, 期望 exit, 必须出现的码] ────────────────────────
const CASES = [
  ["case01-valid", 0, []],
  ["case02-used-missing", 1, ["missing used"]],
  ["case03-used-null", 1, ["bad used=null"]],
  ["case04-used-empty", 1, ["空串"]],
  ["case05-used-nonnum", 1, ["须字符串"]],
  ["case06-used-backup", 1, ["bad used="]],           // 现行语义：恒填主
  ["case07-date-garbage", 1, ["bad date"]],
  ["case08-date-impossible", 1, ["非真实日历日期"]],   // 正则能过但日历不存在
  ["case09-runtime-unknown", 1, ["bad runtime="]],
  ["case10-rework-null", 1, ["bad rework=null"]],
  ["case11-rework-negative", 1, ["bad rework="]],
  ["case12-rework-string", 1, ["须有限整数"]],
  ["case13-result-null", 1, ["bad result=null"]],
  ["case14-role-unknown", 1, ["bad role="]],
];
for (const [fixture, wantExit, mustInclude] of CASES) {
  const r = withFixture(fixture, (d) => runLedger(d));
  const missing = mustInclude.filter((s) => !r.out.includes(s));
  check(`${fixture} → exit ${wantExit}`,
    r.code === wantExit && missing.length === 0,
    missing.length ? `缺码 ${missing.join(",")}｜实得：${r.out.trim().split("\n").pop() || "(空)"}` : "");
}

// ── 合法历史特殊值不得误报（审查 2026-10-11 明确要求）─────────────────
{
  // tokens/cost 允许 null（拿不到填 null）；chain_status 三值；executed_by 含异名
  const r = withFixture("case01-valid", (d) => runLedger(d));
  check("合法特殊值不误报（tokens/cost=null 已存在于合法夹具）", r.code === 0);
}

// ── 单智能体空派工账合法，不判漏记 ───────────────────────────────────
{
  const r = withFixture("case01-valid", (d, env) => {
    // 把派工账清空，模拟单智能体「不造派工行」
    writeFileSync(join(d, "docs/model/DISPATCH-LOG.jsonl"), "");
    return null;
  });
  const r2 = withFixture("case01-valid", (d) => {
    writeFileSync(join(d, "docs/model/DISPATCH-LOG.jsonl"), "");
    return runLedger(d);
  });
  check("单智能体空派工账 exit 0（不判漏记）", r2.code === 0, `exit=${r2.code}`);
  void r;
}

// ── 历史豁免（逐行白名单机制）已迁至 ledger-legacy.test.mjs 专项覆盖 ──
// 二轮方案取代了本文件中的「整文件指纹」试验：追加新记录即失效、且环境变量可自签发资格。
// 现行机制＝审批清单 + 逐行 sha256 + 仅限指定字段，见 scripts/model/ledger-legacy-baseline.json。
check("历史豁免不再由本文件的环境变量试验覆盖（已迁 ledger-legacy.test.mjs）", true);

// ── 升级计数口径不被破坏：role=supervisor,result=FAIL 仍须可用 ────────
{
  const r = withFixture("case01-valid", (d) => {
    writeFileSync(join(d, "docs/model/DISPATCH-LOG.jsonl"),
      JSON.stringify({ date: "2026-10-11", task: "T1", role: "supervisor",
        model: "opencode/muse-spark-1.3-contributor-free", used: "主",
        runtime: "opencode", result: "FAIL" }) + "\n");
    return runLedger(d);
  });
  check("升级计数口径有效（supervisor+FAIL 仍 exit 0）", r.code === 0, `exit=${r.code}`);
}

const pass = results.filter((r) => r.ok).length;
const fail = results.length - pass;
console.log(`\nALL ${fail ? "FAIL" : "PASS"}  pass=${pass} fail=${fail}`);
process.exit(fail ? 1 : 0);