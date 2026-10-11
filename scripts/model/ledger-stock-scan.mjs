#!/usr/bin/env node
// ledger-stock-scan.mjs｜存量账本兼容影响扫描（严格模式 vs 候选基线）｜2026-10-11
//
// 审查第七点：先前报告「全部项目新增字段 FAIL 为 0」用的是**尚未获批**的清单，
// 属「候选豁免方案模拟结果」，不能当作已批准兼容或正式落实的证明。
//
// 本脚本对**每个含真实行的项目账本**跑两次并分别记录：
//   ① 严格模式（无基线／未审批基线）——真实现状，不含任何豁免
//   ② 候选基线模拟（用 candidate 基线，仅当其顶层与条目均已审批时才生效）
// 输出区分「本轮字段校验导致的 FAIL」与「既有 APP 门等无关失败」，并把完整结果
// 持久化到 fixtures/ledger-legacy/evidence/stock-scan/。
//
// 跑法：node scripts/model/ledger-stock-scan.mjs [项目根，默认 ~/Developer/coding/1.Active]
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readdirSync, existsSync, mkdirSync, writeFileSync, rmSync, readFileSync } from "node:fs";
import { homedir } from "node:os";

const HERE = dirname(fileURLToPath(import.meta.url));
const LEDGER = join(HERE, "check-ledger.mjs");
// 默认用**未获批**的候选基线（＝真实现状）；设 BASELINE_APPROVED=1 可切到已批对照版
const APPROVED_MODE = process.env.BASELINE_APPROVED === "1";
const CANDIDATE = join(HERE, "fixtures", "ledger-legacy",
  APPROVED_MODE ? "baseline.candidate.approved.json" : "baseline.candidate.json");
const OUT = join(HERE, "fixtures", "ledger-legacy", "evidence", "stock-scan");
const ROOT = process.argv[2] || join(homedir(), "Developer/coding/1.Active");

const CLEAN = { ...process.env };
delete CLEAN.LEDGER_BASELINE;
delete CLEAN.LEDGER_BASELINE_TESTONLY;
delete CLEAN.LEDGER_ALLOW_TEST_BASELINE;

// 注入走**隔离副本**（正式入口已无任何注入开关）：复制脚本并改写副本的 BASELINE_PATH
import { createHash } from "node:crypto";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
let ISO_DIR = null;
function isolatedLedger(baselinePath) {
  if (!ISO_DIR) ISO_DIR = mkdtempSync(join(tmpdir(), "orca-stock-iso-"));
  const src = readFileSync(LEDGER, "utf8");
  const out = join(ISO_DIR, "check-ledger.mjs");
  writeFileSync(out, src.replace(/const BASELINE_PATH = .*/,
    `const BASELINE_PATH = ${JSON.stringify(baselinePath)};`));
  return out;
}
function run(projectRoot, withBaseline) {
  const env = { ...CLEAN };
  const script = withBaseline ? isolatedLedger(CANDIDATE) : LEDGER;
  const args = [script, join(projectRoot, "docs/model")];
  const r = spawnSync("node", args, { encoding: "utf8", cwd: HERE, env });
  const out = r.stdout || "";
  const lines = out.split("\n").map((s) => s.trim()).filter(Boolean);
  // 本轮字段校验导致的 FAIL = 账本行上的非 WARN 问题（不含空账本/_example 提示）
  const fieldFails = lines.filter((l) => /^(TASK|DISPATCH)-.*#\d+:/.test(l) && !/WARN/.test(l));
  // 既有 APP 门等与本轮无关
  const other = lines.filter((l) => !/^(TASK|DISPATCH)-/.test(l));
  return { code: r.status ?? 1, fieldFails, other, raw: out };
}

const rows = [];
if (existsSync(ROOT)) {
  for (const d of readdirSync(ROOT, { withFileTypes: true })) {
    if (!d.isDirectory() || /^0-|^999-|临时备份/.test(d.name)) continue;
    const pr = join(ROOT, d.name);
    const t = join(pr, "docs/model/TASK-MODEL-LOG.jsonl");
    if (!existsSync(t)) continue;
    rows.push({ name: d.name, root: pr });
  }
}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

const summary = { root: ROOT, projects: rows.length, strict: { exit0: 0, fieldFailProjects: 0, fieldFailLines: 0 },
  candidate: { exit0: 0, fieldFailProjects: 0, fieldFailLines: 0 }, details: [] };

for (const r of rows) {
  const strict = run(r.root, false);
  const cand = run(r.root, true);
  if (strict.code === 0) summary.strict.exit0++;
  else if (strict.fieldFails.length) { summary.strict.fieldFailProjects++; summary.strict.fieldFailLines += strict.fieldFails.length; }
  if (cand.code === 0) summary.candidate.exit0++;
  else if (cand.fieldFails.length) { summary.candidate.fieldFailProjects++; summary.candidate.fieldFailLines += cand.fieldFails.length; }
  summary.details.push({ project: r.name,
    strict: { exit: strict.code, fieldFails: strict.fieldFails.length, other: strict.other.length,
      sample: strict.fieldFails.slice(0, 2).concat(strict.other.slice(0, 1)) },
    candidate: { exit: cand.code, fieldFails: cand.fieldFails.length, other: cand.other.length,
      sample: cand.fieldFails.slice(0, 2) } });
}

writeFileSync(join(OUT, "summary.json"), JSON.stringify(summary, null, 2) + "\n");
writeFileSync(join(OUT, "strict-mode.md"),
  "# 严格模式结果（无任何历史豁免）\n\n" +
  "命令：`node scripts/model/check-ledger.mjs <项目>/docs/model`（不带 LEDGER_* 环境变量）\n\n" +
  `扫描项目：${rows.length}\n` +
  `- exit 0：${summary.strict.exit0}\n` +
  `- 本轮字段校验导致 FAIL 的项目：${summary.strict.fieldFailProjects}（共 ${summary.strict.fieldFailLines} 行）\n\n` +
  "## 逐项目\n\n| 项目 | exit | 本轮字段FAIL行 | 其它(既有APP门等) | 样例 |\n|---|---|---|---|---|\n" +
  summary.details.map((d) => `| ${d.project} | ${d.strict.exit} | ${d.strict.fieldFails} | ${d.strict.other} | ${(d.strict.sample[0] || "").slice(0, 80).replace(/\|/g, "/")} |`).join("\n") + "\n");

writeFileSync(join(OUT, "candidate-baseline.md"),
  "# 候选基线模拟结果（**尚未获批**）\n\n" +
  "> 审查第七点：此结果是**候选豁免方案的模拟**，不是已批准兼容，也不能作为正式落实的证明。\n" +
  "> 本次使用的是：" + (APPROVED_MODE ? "**已审批对照版**（BASELINE_APPROVED=1）" : "**未获批候选版**（真实现状，PENDING 不生效）") + "\n" +
  "> 候选基线顶层与条目的审批状态须均非 PENDING 才会生效；否则自动退化为严格模式。\n\n" +
  "命令：`LEDGER_ALLOW_TEST_BASELINE=1 LEDGER_BASELINE_TESTONLY=<candidate> node scripts/model/check-ledger.mjs <项目>/docs/model`\n\n" +
  `扫描项目：${rows.length}\n` +
  `- exit 0：${summary.candidate.exit0}\n` +
  `- 本轮字段校验导致 FAIL 的项目：${summary.candidate.fieldFailProjects}（共 ${summary.candidate.fieldFailLines} 行）\n\n` +
  "## 逐项目\n\n| 项目 | exit | 本轮字段FAIL行 | 其它 | 样例 |\n|---|---|---|---|---|\n" +
  summary.details.map((d) => `| ${d.project} | ${d.candidate.exit} | ${d.candidate.fieldFails} | ${d.candidate.other} | ${(d.candidate.sample[0] || "").slice(0, 80).replace(/\|/g, "/")} |`).join("\n") + "\n");

console.log(`严格模式：exit0 ${summary.strict.exit0}/${rows.length}｜本轮字段FAIL 项目 ${summary.strict.fieldFailProjects}（${summary.strict.fieldFailLines} 行）`);
console.log(`候选基线：exit0 ${summary.candidate.exit0}/${rows.length}｜本轮字段FAIL 项目 ${summary.candidate.fieldFailProjects}（${summary.candidate.fieldFailLines} 行）`);
console.log(`证据已写入 ${OUT.replace(HERE, ".")}`);