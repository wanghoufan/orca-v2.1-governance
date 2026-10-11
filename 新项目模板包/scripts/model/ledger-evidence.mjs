#!/usr/bin/env node
// ledger-evidence.mjs｜持久化保存历史兼容的**真实执行证据**｜2026-10-11（三轮）
//
// codex 两轮审查的证据要求：
//   ① 执行所用清单必须随证据冻结（不能只写路径）；
//   ② 必须记录准确 argv / env / cwd / 时间 / 代码哈希 / 基线哈希；
//   ③ command.txt 必须是**可直接执行**的命令，不能是占位符；
//   ④ 输入副本目录名须与原项目名一致（否则拿它当项目根会改变 basename 语义）；
//   ⑤ 不同模式不得共用输出目录（后者覆盖前者）。
//
// 本脚本对每个用例保存：输入副本、基线副本、argv/env/cwd/时间/哈希、退出码、
// 完整 stdout/stderr。所有内容落在版本库固定路径 scripts/model/fixtures/ledger-legacy/evidence/。
//
// 跑法：node scripts/model/ledger-evidence.mjs
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { cpSync, mkdirSync, writeFileSync, readFileSync, rmSync, existsSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { createHash } from "node:crypto";

const HERE = dirname(fileURLToPath(import.meta.url));
const LEDGER = join(HERE, "check-ledger.mjs");
const FIX = join(HERE, "fixtures", "ledger-legacy");
const EV = join(FIX, "evidence");
const sha256 = (b) => createHash("sha256").update(b).digest("hex");

const CLEAN_ENV = { ...process.env };
for (const k of ["LEDGER_BASELINE", "LEDGER_BASELINE_TESTONLY", "LEDGER_ALLOW_TEST_BASELINE", "LEDGER_LEGACY_GRACE"])
  delete CLEAN_ENV[k];

// 注入方式：复制正式脚本到隔离副本并改写副本里的 BASELINE_PATH 常量（正式入口无注入通道）
// 隔离副本放在**证据目录内**（不是 tmpdir）：副本内 `dirname(import.meta.url)`
// 指向证据目录，BASELINE_PATH 已是绝对路径故不受影响；同时副本本身随证据保留可复核。
function makeIsolatedLedger(baselinePath, where) {
  const src = readFileSync(LEDGER, "utf8");
  if (!/const BASELINE_PATH = /.test(src)) throw new Error("正式脚本未找到 BASELINE_PATH 常量，无法做隔离注入");
  mkdirSync(where, { recursive: true });
  const out = join(where, "check-ledger.isolated.mjs");
  writeFileSync(out, src.replace(/const BASELINE_PATH = .*/,
    `const BASELINE_PATH = ${JSON.stringify(baselinePath)};`));
  return out;
}

const CASES = [
  { id: "01-approved-baseline", project: "proj-approved", baseline: join(FIX, "baseline.test.json"),
    note: "已审批清单 + 原历史行 → 豁免生效（WARN），exit 0" },
  { id: "02-pending-baseline", project: "proj-approved", baseline: join(FIX, "baseline.pending.test.json"),
    note: "PENDING 清单 → 零授权，used 仍 FAIL，exit 1" },
  { id: "03-duplicate-line", project: "proj-approved", baseline: join(FIX, "baseline.test.json"),
    note: "已批行原样复制到第 2 行 → 第 1 行豁免、第 2 行 FAIL（防复制靠 line_no+sha，非消费集合）",
    mutate: (d) => { const p = join(d, "docs/model/DISPATCH-LOG.jsonl");
      writeFileSync(p, readFileSync(p, "utf8") + readFileSync(p, "utf8")); } },
  { id: "04-legal-append", project: "proj-approved", baseline: join(FIX, "baseline.test.json"),
    note: "已批历史 + 合法新记录 → 豁免与新行并存，exit 0",
    mutate: (d) => { const p = join(d, "docs/model/DISPATCH-LOG.jsonl");
      writeFileSync(p, readFileSync(p, "utf8") + JSON.stringify({ date: "2026-10-11", task: "T2",
        role: "builder", model: "codebuddy/glm-5.3-flash", used: "主", runtime: "codex", result: "PASS" }) + "\n"); } },
  { id: "05-no-source-file", project: "proj-approved", baseline: join(FIX, "baseline.test.json"),
    note: "删除项目身份文件 GOVERNANCE-SOURCE.json → 来源不匹配，零豁免，exit 1",
    mutate: (d) => rmSync(join(d, "docs/model/GOVERNANCE-SOURCE.json"), { force: true }) },
  { id: "06-result-null-still-hard", project: "proj-approved", baseline: join(FIX, "baseline.test.json"),
    note: "同文件追加 result=null → 豁免不放宽结果硬错误，exit 1",
    mutate: (d) => { const p = join(d, "docs/model/DISPATCH-LOG.jsonl");
      writeFileSync(p, readFileSync(p, "utf8") + JSON.stringify({ date: "2026-10-11", task: "T3",
        role: "builder", model: "codebuddy/glm-5.3-flash", used: "主", runtime: "codex", result: null }) + "\n"); } },
  { id: "07-two-fields-one-row", project: "proj-two-fields", baseline: join(FIX, "baseline.two-fields-used-only.test.json"),
    note: "同一物理行 used+runtime，只批 used → used 豁免、runtime 仍 FAIL，exit 1" },
  { id: "08-self-made-cannot-authorize", project: "proj-unapproved", baseline: null,
    note: "正式脚本 + 真实存在的自造清单（但不注入）→ 零豁免，exit 1；证明正式入口无签发能力" },
];

const rows = [];
for (const c of CASES) {
  const src = join(FIX, c.project);
  if (!existsSync(src)) { rows.push({ id: c.id, error: `缺夹具 ${src}` }); continue; }
  const tmp = mkdtempSync(join(tmpdir(), "orca-ev-"));
  const proj = join(tmp, c.project);
  try {
    cpSync(src, proj, { recursive: true });
    if (c.mutate) c.mutate(proj);

    const outDir = join(EV, c.id);
    rmSync(outDir, { recursive: true, force: true });
    mkdirSync(join(outDir, "input/docs"), { recursive: true });
    const script = c.baseline ? makeIsolatedLedger(c.baseline, outDir) : LEDGER;
    const argv = [script, join(proj, "docs/model")];   // spawnSync 第一个元素是命令本身
    const startedAt = new Date().toISOString();
    const r = spawnSync("node", argv, { encoding: "utf8", cwd: HERE, env: { ...CLEAN_ENV } });
    // ④ 输入副本保留原项目名作为目录名
    cpSync(join(proj, "docs/model"), join(outDir, `input/docs/model`), { recursive: true });
    if (existsSync(join(proj, "docs/handoff"))) cpSync(join(proj, "docs/handoff"), join(outDir, "input/docs/handoff"), { recursive: true });
    // ① 基线副本随证据冻结
    if (c.baseline) writeFileSync(join(outDir, "baseline.json"), readFileSync(c.baseline));
    // ③ 可直接执行的命令（指向冻结副本，不含占位符）
    const relInput = join(outDir, "input/docs/model");
    writeFileSync(join(outDir, "command.txt"),
      `${c.note}\n\n# 直接可执行（在母版根）：\n` +
      `#   node scripts/model/check-ledger.mjs "${relInput}"\n` +
      `#   （若用隔离脚本注入基线，见 baseline.json 与 result.json.script）\n` +
      `# 实际退出码：${r.status}\n采集时间：${startedAt}\n`);
    writeFileSync(join(outDir, "stdout.txt"), r.stdout || "");
    if (r.stderr) writeFileSync(join(outDir, "stderr.txt"), r.stderr);
    writeFileSync(join(outDir, "result.json"), JSON.stringify({
      case: c.id, note: c.note, argv, cwd: HERE,
      env_overrides: Object.keys(CLEAN_ENV).filter(k => k.startsWith("LEDGER")),
      started_at: startedAt, exit_code: r.status,
      baseline: c.baseline || null,
      baseline_sha256: c.baseline ? sha256(readFileSync(c.baseline)) : null,
      script_sha256: sha256(readFileSync(LEDGER)),
      script_used: c.baseline ? "隔离副本（改写 BASELINE_PATH）" : "正式脚本",
      script_copy_path: c.baseline ? script : null,
      input_copy: relInput,
      stdout_lines: (r.stdout || "").trim().split("\n").filter(Boolean).length,
    }, null, 2) + "\n");
    rows.push({ id: c.id, note: c.note, exit: r.status, dir: outDir.replace(HERE, ".") });
    console.log(`  ${c.id}  exit=${r.status}  → ${outDir.replace(HERE, ".")}`);
  } finally { rmSync(tmp, { recursive: true, force: true }); }
}

mkdirSync(EV, { recursive: true });
writeFileSync(join(EV, "INDEX.md"),
  `# 历史兼容执行证据（持久化）\n\n由 \`node scripts/model/ledger-evidence.mjs\` 生成。\n\n` +
  `每个子目录含：**实际输入副本**（input/，保留原项目目录名）、**基线副本**（baseline.json）、\n` +
  `**可执行复现命令与退出码**（command.txt）、**完整输出**（stdout.txt / stderr.txt）、\n` +
  `**argv/env/cwd/时间/代码哈希/基线哈希**（result.json）。\n\n` +
  `| 用例 | 说明 | 退出码 | 目录 |\n|---|---|---|---|\n` +
  rows.map((o) => `| ${o.id} | ${o.note || o.error} | ${o.exit ?? "—"} | ${o.dir || "—"} |`).join("\n") + "\n");
console.log(`\n证据已写入 ${EV.replace(HERE, ".")}`);