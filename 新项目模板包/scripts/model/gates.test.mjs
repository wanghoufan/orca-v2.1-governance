// gates.test.mjs | regression for the two 2026-10-17 self-audit additions:
//   1) scripts/check-product-review.sh  (product-review zero-output gate)
//   2) scripts/pre-commit-guard.sh     (ledger check wired into commit path)
// Both were previously "rules in prose only". A rule with no test drifts back to being
// a rule nobody runs -- that is the exact failure this suite exists to prevent.
// NOTE: work dirs are created under scripts/model/fixtures/gates/ (versioned, never /tmp,
// never cleaned up) so a reviewer can re-run and compare.
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const FIX = join(ROOT, "scripts", "model", "fixtures", "gates");
let pass = 0, fail = 0;
const check = (name, cond) => {
  if (cond) { pass++; console.log(`PASS  ${name}`); }
  else { fail++; console.log(`FAIL  ${name}`); }
};
const run = (sh, args, cwd) => {
  try { return { code: 0, out: execFileSync("bash", [sh, ...args], { encoding: "utf8", cwd, stdio: ["ignore","pipe","pipe"] }) }; }
  catch (e) { return { code: e.status ?? 1, out: `${e.stdout || ""}${e.stderr || ""}` }; }
};
const write = (p, body) => { mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, body); };

rmSync(FIX, { recursive: true, force: true });

// ── check-product-review.sh ─────────────────────────────────────────────
const PR = join(FIX, "product-review");
const good = ["PRODUCT_REVIEW_CONSENSUS:x", "PRODUCT_REVIEW_DIVERGENCE:y", "PRODUCT_REVIEW_ONLY_A:",
  "PRODUCT_REVIEW_ONLY_B:", "PRODUCT_REVIEW_REJECTED:zzzzzzzzzzzz"].join("\n");
write(join(PR, "PRODUCT_REVIEW_V1.0_good.md"), good);
write(join(PR, "PRODUCT_REVIEW_V1.0_empty.md"), "ok\n");            // the codebuddy silent-exit-0 symptom
// >80 bytes on purpose: it must reach the section check, not the size check
write(join(PR, "PRODUCT_REVIEW_V1.0_partial.md"),
  "PRODUCT_REVIEW_CONSENSUS:x\n" + "只有一致项，分歧/仅A/仅B/不采纳各段全部缺失".repeat(6) + "\n");

const script = join(ROOT, "scripts", "check-product-review.sh");
let r = run(script, [join(PR, "PRODUCT_REVIEW_V1.0_good.md")]);
check("product-review: complete report passes", r.code === 0 && r.out.includes("PRODUCT-REVIEW-OK"));
r = run(script, [join(PR, "PRODUCT_REVIEW_V1.0_empty.md")]);
check("product-review: near-empty report blocked (zero output)", r.code === 1 && r.out.includes("PRODUCT-REVIEW-EMPTY"));
r = run(script, [join(PR, "PRODUCT_REVIEW_V1.0_partial.md")]);
check("product-review: missing summary sections blocked", r.code === 1 && r.out.includes("PRODUCT-REVIEW-INCOMPLETE"));
r = run(script, [join(PR, "does-not-exist.md")]);
check("product-review: missing file blocked", r.code === 1 && r.out.includes("PRODUCT-REVIEW-EMPTY"));
r = run(script, ["--scan", join(PR, "empty-dir")]);
check("product-review: scan with no report at all is blocked", r.code === 1);
r = run(script, [join(PR, "PRODUCT_REVIEW_V1.0_good.md")]);
check("product-review: good report stays passable twice (no false positive)", r.code === 0);

// G4: missing only-A / only-B must block (three anchors were not enough)
const noOnly = ["PRODUCT_REVIEW_CONSENSUS:x", "PRODUCT_REVIEW_DIVERGENCE:y",
  "PRODUCT_REVIEW_REJECTED:zzzzzzzzzzzzzzzz"].join("\n");
write(join(PR, "PRODUCT_REVIEW_V1.0_noonly.md"), noOnly);
r = run(script, [join(PR, "PRODUCT_REVIEW_V1.0_noonly.md")]);
check("product-review: missing only-A/only-B sections blocked",
  r.code === 1 && r.out.includes("PRODUCT-REVIEW-INCOMPLETE") && r.out.includes("only_a"));

// ── pre-commit-guard.sh: ledger check must be wired in ──────────────────
// Negative test: if the hook does NOT run check-ledger, this fails.
// It runs in a throwaway git repo with a broken ledger staged.
// Throwaway git sandbox: it is scaffolding, not a fixture. Keeping it OUT of
// scripts/model/fixtures matters -- a real .git inside a fixture tree gets swept
// into both packages by _sync-packages.py and breaks the sync with binary objects.
const REPO = join(tmpdir(), "orca-gates-sandbox-" + process.pid);
mkdirSync(join(REPO, "docs", "model"), { recursive: true });
mkdirSync(join(REPO, "scripts", "model"), { recursive: true });
const g = (args) => execFileSync("git", args, { cwd: REPO, encoding: "utf8", stdio: ["ignore","pipe","pipe"] });
g(["init", "-q"]);
g(["config", "user.email", "t@t"]); g(["config", "user.name", "t"]);
// copy the real guard + a stub ledger checker that always fails
const { readFileSync } = await import("node:fs");
write(join(REPO, "scripts", "pre-commit-guard.sh"), readFileSync(join(ROOT, "scripts", "pre-commit-guard.sh"), "utf8"));
write(join(REPO, "scripts", "model", "check-ledger.mjs"), 'process.exit(1);\n');
// _example shell only: so the evidence-copy rule (ii) does NOT fire and the
// only thing that can change the exit code is the check-ledger wiring (iii).
write(join(REPO, "docs", "model", "TASK-MODEL-LOG.jsonl"), '{"_example":true}\n');
g(["add", "-A"]);
r = run(join(REPO, "scripts", "pre-commit-guard.sh"), [], REPO);
check("pre-commit: staged ledger change runs check-ledger and blocks on failure", r.code === 1);
write(join(REPO, "scripts", "model", "check-ledger.mjs"), 'process.exit(0);\n');
r = run(join(REPO, "scripts", "pre-commit-guard.sh"), [], REPO);
check("pre-commit: passes when check-ledger is clean", r.code === 0);
// G3: --allow-example must NOT be hardcoded (it would let example rows through in project repos)
const guardSrc = readFileSync(join(ROOT, "scripts", "pre-commit-guard.sh"), "utf8");
check("pre-commit: --allow-example is conditional, not hardcoded",
  /case "\$\(git rev-parse --show-toplevel/.test(guardSrc)
  && !/check-ledger\.mjs docs\/model --allow-example; then/.test(guardSrc));

// ledger not staged => checker not invoked at all
write(join(REPO, "scripts", "model", "check-ledger.mjs"), 'process.exit(1);\n');
write(join(REPO, "docs", "README-x.md"), "x\n");
g(["add", "-A"]);
g(["reset", "-q"]);
g(["add", "docs/README-x.md"]);
r = run(join(REPO, "scripts", "pre-commit-guard.sh"), [], REPO);
check("pre-commit: unrelated commit does not run the ledger check", r.code === 0);

rmSync(REPO, { recursive: true, force: true });
console.log(`\nALL ${fail === 0 ? "PASS" : "FAIL"}  pass=${pass} fail=${fail}`);
process.exit(fail === 0 ? 0 : 1);
