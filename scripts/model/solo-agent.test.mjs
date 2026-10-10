#!/usr/bin/env node
// solo-agent.test.mjs｜单智能体执行方式的回归测试（2026-10-10 用户定「两种执行方式」）
//
// 目的：让「单智能体不被强制走整套多角色派工与账本」与「质量门禁一条不减」两条
//       口径**可被反复执行**，而不是一次性人工核对。
// 跑法：node scripts/model/solo-agent.test.mjs
//
// 用例分两组：
//   A 组｜单智能体免管理负担——DISPATCH-LOG 可留空、check-ledger 不因此 FAIL
//   B 组｜质量门禁不因单智能体而失效——APP 基线硬门对单智能体项目照常 FAIL
// 每个用例是隔离的最小项目夹具，落在 fixtures/solo-agent/（版本库内固定路径，禁清场）。
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync, mkdtempSync, cpSync, rmSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";

const HERE = dirname(fileURLToPath(import.meta.url));
const LEDGER = join(HERE, "check-ledger.mjs");
const FIX = join(HERE, "fixtures", "solo-agent");

function runLedger(projectDir, { allowExample = false } = {}) {
  // check-ledger.mjs 吃的是账本所在目录（docs/model/）；项目根由它自己往回推两级
  const dir = join(projectDir, "docs", "model");
  const args = allowExample ? [dir, "--allow-example"] : [dir];
  try {
    const out = execFileSync("node", [LEDGER, ...args], { encoding: "utf8" });
    return { code: 0, out };
  } catch (e) {
    return { code: e.status ?? 1, out: `${e.stdout ?? ""}${e.stderr ?? ""}` };
  }
}

// 把夹具拷进临时目录再跑：check-ledger 会按项目根读 docs/ 与 docs/model/，
// 直接在夹具上跑会把结果写进夹具，破坏夹具的原始状态。
function withFixture(name, fn) {
  const src = join(FIX, name);
  if (!existsSync(src)) throw new Error(`缺夹具：${src}`);
  const tmp = mkdtempSync(join(tmpdir(), "orca-solo-"));
  try {
    cpSync(src, tmp, { recursive: true });
    return fn(tmp);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

const results = [];
function check(name, ok, detail = "") {
  results.push({ name, ok, detail });
  console.log(`${ok ? "PASS " : "FAIL "} ${name}${detail ? ` — ${detail}` : ""}`);
}

// ── A 组｜管理负担可省，账本校验不因此 FAIL ──────────────────────────
{
  const r = withFixture("case1-no-dispatch", (d) => runLedger(d));
  check("A1 单智能体无派工：DISPATCH-LOG 留空不 FAIL",
    r.code === 0 && /LEDGER-OK/.test(r.out), `exit=${r.code}`);
  check("A2 空派工账本只报 WARN（不造行即可）",
    /DISPATCH-LOG\.jsonl: 空账本/.test(r.out));
}
{
  const r = withFixture("case2-self-reviewed", (d) => runLedger(d));
  check("A3 自审任务行合法（role=builder/chain_status 可用）",
    r.code === 0 && /LEDGER-OK/.test(r.out), `exit=${r.code}`);
}

// ── A' 组｜「留空即可」≠「删文件」：账本文件缺失仍须 FAIL ─────────────
{
  // 单智能体免的是「造行」，不是「免登记」。删掉账本文件等于绕过登记口径，必须拦住。
  const r = withFixture("case5-ledger-file-removed", (d) => runLedger(d));
  check("A4 账本文件缺失仍 FAIL（可留空、不可删文件绕过登记）",
    r.code === 1 && /MISSING/.test(r.out), `exit=${r.code}`);
}

// ── B 组｜质量门禁不减：APP 基线硬门对单智能体照常生效 ───────────────
{
  const r = withFixture("case3-app-baseline-missing", (d) => runLedger(d));
  check("B1 单智能体项目需求真源不可判定仍 FAIL（不得因单智能体放行）",
    r.code === 1 && /APP-TRUEOUT-SOURCE-UNRESOLVED/.test(r.out), `exit=${r.code}`);
}
{
  const r = withFixture("case4-keyword-in-plan-only", (d) => runLedger(d));
  check("B2 关键 AC 集合为空仍 FAIL（不得因单智能体跳过）",
    r.code === 1 && /APP-CRITICAL-AC-EMPTY|APP-CRITICAL-AC-INCOMPLETE|APP-BASELINE/.test(r.out),
    `exit=${r.code}`);
}

function grepHit(file, pattern) {
  try { execFileSync("grep", ["-q", pattern, file]); return true; } catch { return false; }
}

// ── C 组｜规则文本到位（单智能体口径写进了母版与两包）────────────────
{
  const ROOT = join(HERE, "..", "..");
  const targets = [
    ["AGENTS.md", "AGENTS.md"],
    ["README.md", "README.md"],
    ["ORCA治理体系说明.md", "ORCA治理体系说明.md"],
    [join("docs", "roles", "builder.md"), join("docs", "roles", "builder.md")],
    [join("docs", "roles", "code-reviewer.md"), join("docs", "roles", "code-reviewer.md")],
    [join("docs", "roles", "qa.md"), join("docs", "roles", "qa.md")],
    [join("新项目模板包", "AGENTS.md"), join("新项目模板包", "AGENTS.md")],
    [join("新项目模板包", "README.md"), join("新项目模板包", "README.md")],
    [join("老项目迁移模板包", "AGENTS.md"), join("老项目迁移模板包", "AGENTS.md")],
    [join("老项目迁移模板包", "README.md"), join("老项目迁移模板包", "README.md")],
  ];
  const absent = targets
    .filter(([f]) => !existsSync(join(ROOT, f)) || !grepHit(join(ROOT, f), "单智能体"))
    .map(([f]) => f);
  check("C1 单智能体口径已写入母版与两包关键文件", absent.length === 0, absent.join(", "));
}
{
  const ROOT = join(HERE, "..", "..");
  // 不得把「独立审查」当默认口径：多智能体角色卡的独立性要求必须仍然在文
  const multiOk = ["builder.md", "code-reviewer.md", "qa.md"].every((f) =>
    grepHit(join(ROOT, "docs", "roles", f), "只约束多智能体"));
  check("C2 多智能体独立性要求仍保留在角色卡内（未被单智能体口径覆盖）", multiOk);
}

// ── C' 组｜触发口令「你是唯一开发者」到位 ───────────────────────────
{
  const ROOT = join(HERE, "..", "..");
  // 用户只发这一句就够：口令必须写在规则里，且写明「不再询问／不自动派工／自行找规范」
  const ag = join(ROOT, "AGENTS.md");
  const phrase = "你是唯一开发者";
  const parts = [
    [phrase, "触发口令原文"],
    ["不得再次询问", "不再询问是否启用"],
    ["不得自动派遣其他智能体", "不自动派遣其他智能体"],
    ["按需查找、读取并执行现有规范", "自行读取现有规范"],
    ["用户不负责逐项指定规范", "用户不指定规范"],
    ["不代表跳过产品方案确认", "不跳过 Human Gate 与授权"],
  ];
  const miss = parts.filter(([kw]) => !grepHit(ag, kw)).map(([, label]) => label);
  check("C3 触发口令与四项配套条款在 AGENTS.md 齐备", miss.length === 0, miss.join(", "));

  const rd = join(ROOT, "README.md");
  const rdOk = grepHit(rd, phrase) && grepHit(rd, "自行读取") && grepHit(rd, "只决定执行模式");
  check("C4 README 说明「只需说这一句」且注明不跳过 Gate", rdOk);

  // 两包同步后口令必须同样可用（复制模板即可生效）
  const pkgs = ["新项目模板包", "老项目迁移模板包"]
    .filter((p) => grepHit(join(ROOT, p, "AGENTS.md"), phrase)).length;
  check("C5 触发口令随两包分发（复制模板即可生效）", pkgs === 2, `命中 ${pkgs}/2`);
}

// ── C''' 组｜触发口令必须出现在**每个对外必现位** ────────────────────
// 回归：首轮实现只写了 AGENTS.md/README，漏了对外概览与三张角色卡，
// 靠人工发现。口令是用户唯一入口，漏一处＝该处读者不知道有这回事。
{
  const ROOT = join(HERE, "..", "..");
  const phrase = "你是唯一开发者";
  const spots = [
    ["AGENTS.md", "触发口令"],
    ["README.md", "用户导航"],
    ["ORCA治理体系说明.md", "对外概览（四件套第 2 步）"],
    [join("docs", "roles", "builder.md"), "角色卡 builder"],
    [join("docs", "roles", "code-reviewer.md"), "角色卡 code-reviewer"],
    [join("docs", "roles", "qa.md"), "角色卡 qa"],
  ];
  const absent = spots
    .filter(([f]) => !existsSync(join(ROOT, f)) || !grepHit(join(ROOT, f), phrase))
    .map(([, label]) => label);
  check("C7 触发口令在概览与三张角色卡齐备（不只在 AGENTS/README）",
    absent.length === 0, absent.join(", "));

  // check-sync 必须能抓到这类漏同步
  const cs = join(ROOT, "scripts", "check-sync.sh");
  check("C8 check-sync 关键词清单含口令（漏同步会自动 OVERVIEW-STALE）",
    grepHit(cs, `"${phrase}"`));
}

// ── C'' 组｜不得擅自切换模式 ────────────────────────────────────────
{
  const ROOT = join(HERE, "..", "..");
  const ok = grepHit(join(ROOT, "AGENTS.md"), "不得擅自改变既定执行方式")
    && grepHit(join(ROOT, "AGENTS.md"), "多智能体（默认）");
  check("C6 多智能体仍为默认，且无要求时不得擅自改模式", ok);
}

// ── D 组｜不得出现第二套体系（无单智能体专属文件/目录）───────────────
{
  const ROOT = join(HERE, "..", "..");
  const suspects = [];
  for (const d of ["docs/roles", "docs/sop", "docs/pm", "docs/qa", "docs/review",
    "docs/templates", "docs/prompts"]) {
    const base = join(ROOT, d);
    let items = [];
    try { items = readdirSync(base, { withFileTypes: true }); } catch { continue; }
    for (const it of items) {
      if (/solo|单智能体|single-agent/i.test(it.name)) suspects.push(`${d}/${it.name}`);
    }
  }
  check("D1 无单智能体专属角色卡/SOP/模板包（未产生第二套体系）",
    suspects.length === 0, suspects.join(", "));
}

const pass = results.filter((r) => r.ok).length;
const fail = results.length - pass;
console.log(`\nALL ${fail ? "FAIL" : "PASS"}  pass=${pass} fail=${fail}`);
process.exit(fail ? 1 : 0);