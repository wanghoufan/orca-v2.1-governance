// delivery-unit.test.mjs | locks the 2026-10-17 "review granularity" rule.
// Why a test: this rule exists precisely because a reasonable-looking default
// ("every task goes through reviewer -> qa -> supervisor") kept happening and the user had to
// correct it repeatedly. A text rule that can silently drift back is the same failure it fixes.
// It must be DEFAULT policy -- not something the user has to switch on with a magic phrase.
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
let pass = 0, fail = 0;
const check = (n, c) => { if (c) { pass++; console.log(`PASS  ${n}`); } else { fail++; console.log(`FAIL  ${n}`); } };
const read = (p) => readFileSync(join(ROOT, p), "utf8");
const readPrompt = () => {
  const bare = ["编排者提示词.md"];
  const nested = ["docs", "prompts", ...bare];
  for (const p of [nested.join("/"), bare[0]]) {
    try { return readFileSync(join(ROOT, p), "utf8"); } catch {}
  }
  throw new Error("orchestrator prompt not found");
};
const agents = read("AGENTS.md");
const prompt = readPrompt();

check("AGENTS: delivery-unit rule exists", agents.includes("交付单元"));
check("AGENTS: rule is explicitly DEFAULT policy (no magic phrase needed)",
  /复核粒度＝交付单元[\s\S]{0,200}不需任何额外口令/.test(agents));
check("AGENTS: single task = self-review only, no reviewer/qa/supervisor dispatch",
  /单个 task 完成时[\s\S]{0,200}不派 code-reviewer/.test(agents));
check("AGENTS: full chain runs once at the delivery-unit boundary",
  agents.includes("交付单元边界") && agents.includes("一次走完"));
check("AGENTS: ledger recording is kept even when review is deferred",
  /账本照记一行/.test(agents));
check("AGENTS: the four non-deferrable classes are listed",
  /不能延后的四类/.test(agents)
  && /公共契约[\s\S]{0,80}schema[\s\S]{0,80}鉴权/.test(agents)
  && /真机[\s\S]{0,40}线上数据/.test(agents)
  && /secrets 或不可逆删除/.test(agents));
check("AGENTS: quality gates are not weakened by this rule",
  /质量门一道没减/.test(agents));

check("prompt: delivery-unit rule propagated", prompt.includes("交付单元"));
check("prompt: states it needs no command", /默认制度、不需口令/.test(prompt));
check("prompt: four non-deferrable classes propagated", prompt.includes("不得延后的四类"));

for (const f of ["docs/roles/qa.md", "docs/roles/code-reviewer.md", "docs/roles/supervisor.md"]) {
  check(`${f}: states the granularity`, read(f).includes("交付单元"));
}

// 2026-10-17 second pass: the slow part was not only WHO reviews, but HOW MUCH evidence each
// small task had to produce. Heavy QA evidence and formal review/QA reports now happen once per
// delivery unit, not per task; manual md5 ledger diffing is banned outright.
const qa = read("docs/roles/qa.md");
check("qa card: heavy evidence is scoped to the delivery-unit boundary",
  /重证据手段[\s\S]{0,200}只在交付单元边界要求一次/.test(qa));
check("qa card: single-task QA has a stated action ceiling",
  /单 task 阶段[\s\S]{0,160}不得因「证据不齐」判 FAIL/.test(qa));
check("AGENTS: formal review/QA reports are produced once per delivery unit",
  /留痕粒度＝交付单元/.test(agents));
check("AGENTS: manual md5 ledger diffing is banned (machine check replaced it)",
  /禁止再手工 md5 比对/.test(agents));
check("prompt: single-task action ceiling propagated",
  /单 task 阶段的动作上限/.test(prompt));

// must NOT have regressed into "every task gets the full chain"
check("no per-task full-chain wording remains in the prompt",
  !/每个[ t]*task[\s\S]{0,40}Builder→Code Reviewer→QA→Supervisor/.test(prompt));

console.log(`\nALL ${fail === 0 ? "PASS" : "FAIL"}  pass=${pass} fail=${fail}`);
process.exit(fail === 0 ? 0 : 1);
