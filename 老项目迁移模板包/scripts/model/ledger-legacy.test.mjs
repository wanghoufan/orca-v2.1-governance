#!/usr/bin/env node
// ledger-legacy.test.mjs｜历史兼容（三轮方案）回归｜2026-10-11
//
// 背景：三版演进，每版都因审查实测出漏洞而返工——
//   一版「整文件指纹」：追加合法新记录即失效；且环境变量可自签发资格。
//   二版「逐行 sha256（无行号）」：任意清单路径可自签发；且把已批错误行原样复制到
//       第二行即可**复用同一份授权**（哈希相同 → 两行都获豁免）；PENDING 清单照样生效。
//   三版（现行）：① 顶层与条目都校验审批状态，PENDING/缺失 → 零授权；
//       ② 生产只读受治理的固定基线路径，环境变量通道需显式测试开关；
//       ③ 授权键含**物理行号**，且每条授权**只消费一次**，杜绝哈希复用。
//
// 审查点名的 6 条必测（A–F）全部在下方，每条同时断言**退出码**与**目标错误原因**，
// 避免 APP 门禁等无关错误造成假通过。
//
// 跑法：node scripts/model/ledger-legacy.test.mjs
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { cpSync, rmSync, writeFileSync, readFileSync, existsSync, mkdtempSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { createHash } from "node:crypto";

const HERE = dirname(fileURLToPath(import.meta.url));
const LEDGER = join(HERE, "check-ledger.mjs");
const FIX = join(HERE, "fixtures", "ledger-legacy");
const BASELINE = join(FIX, "baseline.test.json");          // 已审批的测试基线
const BASELINE_PENDING = join(FIX, "baseline.pending.test.json"); // 未审批基线

// 入口必须清除继承的两个变量，防外部污染（审查第五点要求）
const CLEAN_ENV = { ...process.env };
delete CLEAN_ENV.LEDGER_BASELINE;              // 一版遗留变量，应完全无效
delete CLEAN_ENV.LEDGER_BASELINE_TESTONLY;     // 二版遗留变量，应完全无效
delete CLEAN_ENV.LEDGER_ALLOW_TEST_BASELINE;   // 二版遗留变量，应完全无效
delete CLEAN_ENV.LEDGER_LEGACY_GRACE;

// 测试注入方式：**复制正式脚本到隔离副本，改写副本里的 BASELINE_PATH 常量**。
// codex 两轮审查均确认「环境变量」与「CLI 参数」都是普通调用方可用的能力，
// 不构成正式/测试隔离；只有「不动正式文件、改副本」才是真隔离。
function makeIsolatedLedger(baselinePath) {
  const dir = mkdtempSync(join(tmpdir(), "orca-ledger-copy-"));
  const src = readFileSync(LEDGER, "utf8");
  if (!/const BASELINE_PATH = /.test(src))
    throw new Error("隔离副本改写失败：正式脚本未找到 BASELINE_PATH 常量");
  const dst = join(dir, "check-ledger.mjs");
  writeFileSync(dst, src.replace(/const BASELINE_PATH = .*/, `const BASELINE_PATH = ${JSON.stringify(baselinePath)};`));
  return dst;
}
function runLedger(projectDir, baselinePath, extraEnv) {
  const script = baselinePath ? makeIsolatedLedger(baselinePath) : LEDGER;
  const r = spawnSync("node", [script, join(projectDir, "docs", "model")],
    { encoding: "utf8", cwd: HERE, env: { ...CLEAN_ENV, ...(extraEnv || {}) } });
  return { code: r.status ?? 1, out: `${r.stdout ?? ""}${r.stderr ?? ""}` };
}
// 供「旧变量应完全失效」用例使用：直接跑**正式**脚本，只加环境变量
function runLedgerEnvOnly(projectDir, envPatch) {
  const r = spawnSync("node", [LEDGER, join(projectDir, "docs", "model")],
    { encoding: "utf8", cwd: HERE, env: { ...CLEAN_ENV, ...envPatch } });
  return { code: r.status ?? 1, out: `${r.stdout ?? ""}${r.stderr ?? ""}` };
}

// 隔离副本：保留项目目录名（豁免按项目名绑定）。仅用于不污染库内原件。
// 真正「同 basename、不同来源」：在隔离根下建第二来源目录，其内项目目录名相同。
// withProject 会把夹具复制到 tmp/<name>，故这里用 alt-source 夹具再改名。
// 目录名必须与清单登记的 project 相同，才构成「同 basename、不同来源」的真实场景：
// 隔离根 tmp/另一来源/proj-approved/
function withSameBasename(mutate, fn) {
  const tmp = mkdtempSync(join(tmpdir(), "orca-samebase-"));
  const origin = join(tmp, "另一来源");
  mkdirSync(origin, { recursive: true });
  const src = join(origin, "proj-approved");
  try {
    cpSync(join(FIX, "proj-approved"), src, { recursive: true });
    if (mutate) mutate(src);
    return fn(src);
  } finally { rmSync(tmp, { recursive: true, force: true }); }
}
function withProject(name, mutate, fn) {
  const src = join(FIX, name);
  if (!existsSync(src)) throw new Error(`缺夹具：${src}`);
  const tmp = mkdtempSync(join(tmpdir(), "orca-legacy-"));
  const dst = join(tmp, name);
  try { cpSync(src, dst, { recursive: true }); if (mutate) mutate(dst); return fn(dst); }
  finally { rmSync(tmp, { recursive: true, force: true }); }
}
const sha = (s) => createHash("sha256").update(s).digest("hex");
const readD = (d) => readFileSync(join(d, "docs/model/DISPATCH-LOG.jsonl"), "utf8");
const appendD = (d, obj) =>
  writeFileSync(join(d, "docs/model/DISPATCH-LOG.jsonl"), readD(d).replace(/\n?$/, "\n") + JSON.stringify(obj) + "\n");
const OK_LINE = { date: "2026-10-11", task: "T2", role: "builder",
  model: "codebuddy/glm-5.3-flash", used: "主", runtime: "codex", result: "PASS" };

const results = [];
const check = (n, ok, detail = "") => {
  results.push({ n, ok });
  console.log(`${ok ? "PASS " : "FAIL "} ${n}${detail ? ` — ${detail}` : ""}`);
};
// 断言：退出码 + 目标原因（两者都要，避免无关错误假通过）
// mustNot 指「不得作为 FAIL 出现」：WARN 行文案里也可能含同样的字段名，
// 故按行首判定——`file#line: WARN` 视为允许，`file#line: bad ...` 视为不允许。
// 拒绝授权的断言必须扫**完整输出**（codex 第三轮：只扫非 WARN 的 FAIL 行，
// 检测不到 WARN 里的「历史豁免」，会被其它错误贡献的 exit1 掩盖）。
// allowWarnFields 用于正向用例：允许指定字段出现在 WARN 里。
const expect = (name, r, { code, must, mustNot, allowWarnFields, allowWarn }) => {
  const lines = r.out.split("\n").map(s => s.trim()).filter(Boolean);
  const failLines = lines.filter(l => /#\d+:/.test(l) && !/:\s*WARN/.test(l));
  const why = must ? `缺原因「${must}」` : "";
  // mustNot 语义：**该内容不得作为 FAIL 出现**。
  // WARN 行里出现是正常的（正向豁免时错误信息会以 WARN 形式带出字段名）。
  // 拒绝授权用例另有「目标行必须保持 FAIL」+ 全文无「历史豁免」的独立断言。
  let bad = "";
  if (mustNot && failLines.some(l => l.includes(mustNot))) bad = `FAIL 行含「${mustNot}」`;
  // 拒绝授权的强断言：全文不得出现授权标记（无论 WARN/FAIL）
  const rejectCase = code === 1 && mustNot;
  if (rejectCase && /历史豁免/.test(r.out) && !allowWarn) bad += `｜输出出现授权标记`;
  // 拒绝授权用例：目标行必须真的是 FAIL（防止目标错误被降级成 WARN 却仍 exit1）
  // 正向用例（code 0 或 mustNot 未设）不做此项——它们的 FAIL 行本就应为空
  const isRejectCase = code === 1 && !!mustNot;
  if (isRejectCase && must && !failLines.some(l => l.includes(must.split("（")[0].trim())))
    bad += `｜目标行未保持 FAIL`;
  const ok = r.code === code && (!must || r.out.includes(must)) && !bad;
  check(name, ok, ok ? `exit=${r.code}` : `exit=${r.code}（期望 ${code}）${why}${bad}`);
};

// ── A｜PENDING 清单不生效（阻断①）──────────────────────────────────
expect("A1 PENDING 清单不产生任何豁免",
  withProject("proj-approved", null, (d) => runLedger(d, BASELINE_PENDING)),
  { code: 1, must: "bad used", mustNot: "历史豁免" });

expect("A2 缺 approved_by 不生效",
  withProject("proj-approved", null, (d) => runLedger(d, join(FIX, "baseline.no-source.test.json"))),
  { code: 1, must: "bad used", mustNot: "历史豁免" });

expect("A3 缺 approved_at 不生效",
  withProject("proj-approved", null, (d) => runLedger(d, join(FIX, "baseline.no-time.test.json"))),
  { code: 1, must: "bad used", mustNot: "历史豁免" });

expect("A4 顶层已批但条目 PENDING → 该条目不生效",
  withProject("proj-approved", null,
    (d) => runLedger(d, join(FIX, "baseline.entry-pending.test.json"))),
  { code: 1, must: "bad used", mustNot: "历史豁免" });

// 顶层**单个字段**专测（codex 第五轮：合并删除顶层两个审批检查仍全绿）
expect("A9 顶层缺 approved_by、条目全部已批 → 仍不生效",
  withProject("proj-approved", null,
    (d) => runLedger(d, join(FIX, "baseline.top-no-source.test.json"))),
  { code: 1, must: "DISPATCH-LOG.jsonl#1: bad used", mustNot: "历史豁免" });

expect("A8 顶层缺 approved_at、条目全部已批 → 仍不生效",
  withProject("proj-approved", null,
    (d) => runLedger(d, join(FIX, "baseline.top-no-time.test.json"))),
  { code: 1, must: "DISPATCH-LOG.jsonl#1: bad used", mustNot: "历史豁免" });

// 顶层门专测：条目全部已批，只有顶层状态能挡住（防止"条目门误打误撞顶替顶层门"）
expect("A5 顶层 PENDING、条目全已批 → 仍不生效",
  withProject("proj-approved", null,
    (d) => runLedger(d, join(FIX, "baseline.top-pending.test.json"))),
  { code: 1, must: "bad used", mustNot: "历史豁免" });

expect("A6 顶层审批字段缺失、条目全已批 → 仍不生效",
  withProject("proj-approved", null,
    (d) => runLedger(d, join(FIX, "baseline.top-missing.test.json"))),
  { code: 1, must: "bad used", mustNot: "历史豁免" });

// ── B｜自造清单不能授权（阻断②）────────────────────────────────────
// codex 审查 2026-01-11 指出：原 B1/B2 的 withProject 返回后 finally 已删除自造清单，
// 校验时文件并不存在 → 实际测的是「缺文件严格模式」，不是「拒绝真实自造清单」。
// 此处改为：清单**写入固定夹具目录**（不在 finally 清理范围内），确保校验时真实存在。
const SELF_MADE_NAME = "self-made-baseline.json";       // 未审批版（B1/B2：应被审批门拒）
const SELF_MADE_APPROVED = "self-made-approved.json";   // 已审批版（B4a/B4b：应只在隔离副本生效）

const sidOf = (p) => "orca-src-" + sha(p).slice(0, 16);
// 生成器**必须**写合法 source_id：否则每次运行都把 ID 覆写掉，条目被来源门在加载期拒绝，
// B1/B2 测到的就变成「来源门拦下」而不是「入口拒绝自造清单」（codex 第五轮指出）。
function writeSelfMadeBaseline(dir, projectName, approved) {
  const line = readFileSync(join(FIX, "proj-approved/docs/model/DISPATCH-LOG.jsonl"), "utf8").split("\n")[0];
  const who = approved ? "我自己填写的审批人" : "PENDING";
  // 落**具名文件**，不用同一路径反复覆写——避免执行顺序决定测试含义
  const p = join(dir, approved ? SELF_MADE_APPROVED : SELF_MADE_NAME);
  writeFileSync(p, JSON.stringify({
    schema: 1, approved_by: who, approved_at: approved ? "2026-10-11" : "PENDING",
    entries: [{ project: projectName, source_id: sidOf(projectName),
      file: "DISPATCH-LOG.jsonl", line_no: 1,
      line_sha256: sha(line), field: "used",
      approved_by: who, approved_at: approved ? "2026-10-11" : "PENDING", reason: "自造清单" }],
  }, null, 2));
  return p;
}
{
  const SELF_MADE = join(FIX, "self-made-baseline.json");   // 持久存在，不随用例删除
  // 同一份生成文件、同一项目身份、同一目标账本，只切换「审批是否已填」这一个变量。
  // 生成两份**内容相同、仅审批状态不同**的自造清单（codex 第四轮要求同一输入对照）：
  //   已审批版 → B4a/B4b（若 CLI 注入被恢复，它确实能授权，因此 B4b 的拒绝才有意义）
  //   未审批版 → B1/B2（拒绝应来自审批门）
  writeSelfMadeBaseline(FIX, "proj-unapproved", /*approved*/ true);
  writeSelfMadeBaseline(FIX, "proj-unapproved", /*approved*/ false);
  // 自检：断言文件真实存在且内容可解析——防止再次出现「写 A 引用 B」
  if (!existsSync(SELF_MADE)) throw new Error(`自造清单未生成：${SELF_MADE}`);
  JSON.parse(readFileSync(SELF_MADE, "utf8"));
  console.log(`     （自造清单已落固定夹具并校验存在：${SELF_MADE.replace(HERE, ".")}）`);

  // ② 旧环境变量 LEDGER_BASELINE 指向真实存在的自造清单 → 必须无效（用未审批版）
  // 用**已审批**版：若旧变量注入被恢复，它确实能授权 → 拒绝才证明是「入口」而非「审批门」
  expect("B1 旧变量 LEDGER_BASELINE 指向已审批自造清单 → 无效",
    withProject("proj-unapproved", null, (d) => runLedgerEnvOnly(d, { LEDGER_BASELINE: join(FIX, SELF_MADE_APPROVED) })),
    { code: 1, must: "bad used", mustNot: "历史豁免" });

  // ② 旧环境变量 LEDGER_BASELINE_TESTONLY + ALLOW（须两者同设）→ 仍须无效
  expect("B2 旧双开关环境变量指向已审批自造清单 → 无效",
    withProject("proj-unapproved", null, (d) => runLedgerEnvOnly(d,
      { LEDGER_BASELINE_TESTONLY: join(FIX, SELF_MADE_APPROVED), LEDGER_ALLOW_TEST_BASELINE: "1" })),
    { code: 1, must: "bad used", mustNot: "历史豁免" });

  // ③ 正式 CLI 参数注入在**正常调用**中不出现 → 默认路径不受影响
  expect("B3 不传注入参数时只读固定基线（PENDING 正式基线 → 零授权）",
    withProject("proj-unapproved", null, (d) => runLedger(d, null)),
    { code: 1, must: "bad used", mustNot: "历史豁免" });

  // ④ 正向对照（codex 第四轮要求）：同一份自造清单，在**允许改写基线常量的隔离副本**中
  //    必须**真的可以授权**——证明 B1/B2 拒绝的确实是「入口」而不是「清单无效」。
  {
    // 正向对照：把刚生成的**同一份** SELF_MADE 注入隔离副本 → 必须真的能授权
    const r = withProject("proj-unapproved", null, (d) => runLedger(d, join(FIX, SELF_MADE_APPROVED)));
    check("B4a 正向对照：同一份自造清单在隔离副本中确实授权（exit 0 且有豁免）",
      r.code === 0 && /历史豁免/.test(r.out),
      `exit=${r.code}｜${r.out.trim().split("\n")[0] || "(空)"}`);
  }

  // ⑤ 退役 CLI 参数**确实传进去**也不能签发（codex 第三轮指出恢复注入变异时 33/33 无捕获）。
  //    参数必须放在**脚本路径之后**（codex 第四轮：原写法把参数传给了 node，校验脚本根本没启动）。
  for (const [tag, build] of [
    ["参数在前", (script, target) => [script, "--baseline-test-inject", join(FIX, SELF_MADE_APPROVED), target]],
    ["参数在后", (script, target) => [script, target, "--baseline-test-inject", join(FIX, SELF_MADE_APPROVED)]],
  ]) {
    const r = withProject("proj-unapproved", null, (d) => {
      const args = build(LEDGER, join(d, "docs/model"));
      const x = spawnSync("node", args, { encoding: "utf8", cwd: HERE, env: { ...CLEAN_ENV } });
      return { code: x.status ?? 1, out: x.stdout || "", err: x.stderr || "" };
    });
    // 必须确认「校验脚本确实启动了」——否则只是 node 参数报错造成非零退出（codex 第四轮指出的假 PASS）
    const started = /DISPATCH-LOG|TASK-MODEL-LOG|bad used|历史豁免/.test(r.out);
    check(`B4b 退役 CLI 参数（${tag}）指向真实自造清单 → 不签发且脚本已启动`,
      r.code !== 0 && !r.out.includes("历史豁免") && started,
      `exit=${r.code}｜脚本${started ? "已启动" : "未启动(疑似假通过)"}｜${(r.out || r.err).trim().split("\n")[0] || "(空)"}`);
  }
}

// 条目缺审批人**不得继承顶层**（codex 审查：原 `e.approved_by ?? j.approved_by` 让其 exit0）
expect("A7 顶层已批、仅条目缺 approved_by → 不生效",
  withProject("proj-approved", null,
    (d) => runLedger(d, join(FIX, "baseline.entry-no-source.test.json"))),
  { code: 1, must: "bad used", mustNot: "历史豁免" });

// 同行多字段分别授权（codex 审查：原「行」级键把第二条字段当重复条目忽略）
expect("I1 同一行 used+runtime 分别获批 → 两者都豁免",
  withProject("proj-two-fields", null,
    (d) => runLedger(d, join(FIX, "baseline.two-fields-bad-runtime.test.json"))),
  { code: 0, must: "历史豁免", mustNot: "bad runtime" });

expect("I2 同行只批 used → runtime 仍 FAIL（字段粒度未被整行放行）",
  withProject("proj-two-fields", null, (d) => runLedger(d, join(FIX, "baseline.two-fields-used-only.test.json"))),
  { code: 1, must: "bad runtime" });

// 来源绑定：条目带 source_id，但项目无 GOVERNANCE-SOURCE.json → 不匹配
// codex 第三轮指出：原 I3 用的 proj-approved 夹具**本来就有**身份文件（值还不同），
// 实际测的是「错误身份」而非「缺文件」→ 与 I4 覆盖重复。此处用真·无身份文件的夹具。
expect("I3 条目带 source_id、项目**确实没有**身份文件 → 不生效",
  withProject("proj-no-source-file", null,
    (d) => runLedger(d, join(FIX, "baseline.sourceid.test.json"))),
  { code: 1, must: "DISPATCH-LOG.jsonl#1: bad used", mustNot: "历史豁免" });

// 同 basename、不同来源：清单授权 proj-approved，同名副本 proj-same-name-copy 不继承
expect("I4 清单声明 source_id、项目身份文件为其它来源 → 不继承授权",
  withSameBasename((d) => writeFileSync(join(d, "docs/model/GOVERNANCE-SOURCE.json"),
    JSON.stringify({ source_id: "a-different-source-9999" })),
    (d) => runLedger(d, join(FIX, "baseline.sourceid.test.json"))),
  { code: 1, must: "bad used", mustNot: "历史豁免" });

// 已知限制（不隐藏）：条目**未声明** source_id 时，同名目录仍会命中。
// 这不是"已修复"，而是当前契约的边界；正式清单一旦启用 source_id 即自动收紧。
// 已知限制（如实记录，不隐藏）：条目未声明 source_id 且项目无身份文件时，
// 同 basename 的另一来源仍会命中。正式清单启用 source_id 后此路径自动收紧。
// 「无来源回退 basename」漏洞（codex 第三轮裁决：正式放行前必须堵死）：
//   清单条目去掉 source_id ＋ 目标项目无身份文件 ＋ 同 basename 的另一来源。
//   修复前：回退目录名 → 仍命中（可被「复制文件即继承授权」利用）。
//   修复后：条目无 source_id → 零授权。
// 关键：目标项目必须**既同名又无身份文件**，否则「按目录名回退」根本不会触发，
// 用例就测不到它要防的东西（codex 前两轮各抓到一个这种假盲点）。
expect("I6 条目无 source_id ＋ 同 basename 另一来源且无身份文件 → 零授权（回退已堵死）",
  withSameBasename((d) => rmSync(join(d, "docs/model/GOVERNANCE-SOURCE.json"), { force: true }),
    (d) => runLedger(d, join(FIX, "baseline.no-sourceid.test.json"))),
  { code: 1, must: "DISPATCH-LOG.jsonl#1: bad used", mustNot: "历史豁免" });

expect("I7 条目 source_id 为空字符串 → 零授权",
  withProject("proj-no-source-file", null, (d) =>
    runLedger(d, join(FIX, "baseline.empty-sourceid.test.json"))),
  { code: 1, must: "bad used", mustNot: "历史豁免" });

expect("I8 条目 source_id 格式非法（非 orca-src- 前缀）→ 零授权",
  withProject("proj-approved", null, (d) =>
    runLedger(d, join(FIX, "baseline.bad-sourceid.test.json"))),
  { code: 1, must: "bad used", mustNot: "历史豁免" });

// 单独针对 graceFor 第一道防线「条目无 sourceId → 跳过」：
// 该清单**通过了加载期格式校验**（source_id 合法但与项目身份不匹配），
// 项目也**没有**身份文件 → 只有第一道防线会因 e.sourceId 为真而放行到第二道；
// 本例把 source_id 置为 undefined 只能被加载期拒绝，故改为验证：
// 「格式合法但项目无身份文件」时 I3 已覆盖；此处验证「格式合法 + 项目有**异源**身份」时
// 两道防线都不放行（I4 已覆盖）。本条专门确认两道防线**叠加**而非二选一。
// I11：合法 source_id 且与项目身份一致 → 必须授权。
// codex 第六轮指出：I8 只证明「非法被拒」，不能证明格式门在**授权路径**上不误拒合法条目。
expect("I11 source_id 合法且与项目身份一致 → 授权生效（格式门不误拒）",
  withProject("proj-approved", null, (d) => runLedger(d, join(FIX, "baseline.valid-sourceid.test.json"))),
  { code: 0, must: "历史豁免", mustNot: "bad used" });

// 加载期诊断：格式非法的条目必须**显式报出拒绝原因**（否则写错 source_id 会静默失效）
{
  const r = withProject("proj-approved", null, (d) =>
    runLedger(d, join(FIX, "baseline.bad-sourceid.test.json")));
  check("I10 source_id 格式非法的条目被显式拒绝并报出原因",
    r.out.includes("source_id 缺失或格式非法") && /bad used/.test(r.out),
    r.out.includes("source_id 缺失或格式非法") ? "" : `未报拒绝原因｜${r.out.trim().split("\n")[0]}`);
}

expect("I9 条目 source_id 合法但项目身份文件为异源 → 零授权（两道防线叠加）",
  withProject("proj-approved", (d) => writeFileSync(join(d, "docs/model/GOVERNANCE-SOURCE.json"),
    JSON.stringify({ source_id: "orca-src-0000000000000000" })),
    (d) => runLedger(d, join(FIX, "baseline.sourceid.test.json"))),
  { code: 1, must: "DISPATCH-LOG.jsonl#1: bad used", mustNot: "历史豁免" });

// 字段匹配单独覆盖（codex 第五轮：单独删 eField 判断仍全绿——被 expected 值比对遮盖）
expect("J1 只批准 runtime、实际 used 错 → used 仍 FAIL（字段匹配有效）",
  withProject("proj-approved", null, (d) => runLedger(d, join(FIX, "baseline.runtime-only.test.json"))),
  { code: 1, must: "DISPATCH-LOG.jsonl#1: bad used", mustNot: "历史豁免" });

// J3：同行 used 与 runtime **都错**，只批 used → runtime 必须 FAIL。
//     删掉 eField 判断后，runtime 条目若被误匹配就会一起豁免 → 本例锁住它。
expect("J3 同行 used/runtime 都错、只批 used → runtime 仍 FAIL（字段匹配锁住）",
  withProject("proj-two-fields", null, (d) => runLedger(d, join(FIX, "baseline.j3-used-only.test.json"))),
  { code: 1, must: "bad runtime", mustNot: "历史豁免", allowWarn: true });

// J4：**只批 runtime**（不批 used）→ used 必须 FAIL。
//     这是唯一能锁住 eField 判定的形态：删掉字段匹配后，runtime 条目会被拿去匹配 used，
//     使 used 被误豁免。J1/J3 都做不到（它们的清单里 used 条目仍在，used 必然 FAIL）。
expect("J4 只批 runtime、used 未批 → used 仍 FAIL（唯一能锁住字段匹配的形态）",
  withProject("proj-two-fields", null, (d) => runLedger(d, join(FIX, "baseline.j4-runtime-only.test.json"))),
  { code: 1, must: "bad used", mustNot: "#1: bad used 已豁免", allowWarn: true });

// J5：runtime 条目**不写 expected_value** → 删掉 eField 判定后它会被拿去匹配 used，
//     且无 expected 阻挡，used 将被误豁免。这是唯一能在 expected 比对之外单独锁住字段匹配的形态。
expect("J5 runtime 条目无 expected、used 未批 → used 仍 FAIL（字段匹配最后防线）",
  withProject("proj-two-fields", null, (d) => runLedger(d, join(FIX, "baseline.j5-no-expected.test.json"))),
  { code: 1, must: "bad used", mustNot: "历史豁免", allowWarn: true });

expect("J2 只批准 used → used 豁免且 exit 0（字段匹配非一刀切拒绝）",
  withProject("proj-approved", null, (d) => runLedger(d, join(FIX, "baseline.used-only.test.json"))),
  { code: 0, must: "历史豁免", mustNot: "bad used" });

// 身份文件匹配时正常授权（正向：证明来源机制不是一刀切拒绝）
// proj-approved 夹具自带身份文件，其 source_id 与 baseline.sourceid.test.json 一致 → 正向授权
expect("I5 身份文件 source_id 匹配 → 授权生效",
  withProject("proj-approved", null, (d) => runLedger(d, join(FIX, "baseline.sourceid.test.json"))),
  { code: 0, must: "历史豁免", mustNot: "bad used" });

// ── C｜已批错误行被原样追加后，新行失败（阻断③）──────────────────────
expect("C1 已批行原样复制到第 2 行 → 第 2 行 FAIL（第1行仍豁免，属预期）",
  withProject("proj-approved", (d) => {
    const orig = readD(d);
    writeFileSync(join(d, "docs/model/DISPATCH-LOG.jsonl"), orig + orig);  // 两行逐字节相同
  }, (d) => runLedger(d, BASELINE)),
  { code: 1, must: "DISPATCH-LOG.jsonl#2: bad used", mustNot: "#2: WARN", allowWarn: true });

// ── D｜不同来源的同名项目不能自动继承 ──────────────────────────────
{
  // proj-unapproved 目录里放与 proj-approved 逐字节相同的行；清单只授权 proj-approved
  expect("D1 同名目录（同内容）不继承他人授权",
    withProject("proj-unapproved", (d) => {
      writeFileSync(join(d, "docs/model/DISPATCH-LOG.jsonl"),
        readFileSync(join(FIX, "proj-approved/docs/model/DISPATCH-LOG.jsonl"), "utf8"));
    }, (d) => runLedger(d, BASELINE)),
    { code: 1, must: "bad used", mustNot: "历史豁免" });
}

// ── E｜正常合法追加与原历史豁免同时有效 ────────────────────────────
expect("E1 已批历史豁免 ＋ 合法追加 → 通过",
  withProject("proj-approved", (d) => appendD(d, OK_LINE), (d) => runLedger(d, BASELINE)),
  { code: 0, must: "历史豁免", mustNot: "bad used" });

// ── F｜既有硬错误永不可豁免 ─────────────────────────────────────────
expect("F1 豁免不放宽 result=null",
  withProject("proj-approved", (d) => appendD(d, { ...OK_LINE, result: null }),
    (d) => runLedger(d, BASELINE)),
  { code: 1, must: "bad result=null" });

expect("F2 豁免不放宽 BAD_JSON",
  withProject("proj-approved", (d) =>
    writeFileSync(join(d, "docs/model/DISPATCH-LOG.jsonl"), readD(d) + "{不是合法JSON\n"),
    (d) => runLedger(d, BASELINE)),
  { code: 1, must: "BAD_JSON" });

expect("F5 清单 sha 与实际行内容不符 → 不授权",
  withProject("proj-approved", null, (d) => runLedger(d, join(FIX, "baseline.sha-mismatch.test.json"))),
  { code: 1, must: "bad used", mustNot: "历史豁免" });

expect("F6 行号与 sha 都对，但 expected_value 与实际不符 → 不授权",
  withProject("proj-approved", null, (d) => runLedger(d, join(FIX, "baseline.expected-mismatch.test.json"))),
  { code: 1, must: "bad used", mustNot: "历史豁免" });

expect("F3 改已批行内容 → 授权失效（行号对但 sha 不符）",
  withProject("proj-approved", (d) =>
    writeFileSync(join(d, "docs/model/DISPATCH-LOG.jsonl"), readD(d).replace('"used":"备用"', '"used":"备用 "')),
    (d) => runLedger(d, BASELINE)),
  { code: 1, must: "bad used", mustNot: "历史豁免" });

expect("F4 改动已批行位置 → 授权不跟随",
  withProject("proj-approved", (d) => {           // 前面插一条合法行，历史行被挤到第 2 行
    const orig = readD(d);
    writeFileSync(join(d, "docs/model/DISPATCH-LOG.jsonl"), JSON.stringify(OK_LINE) + "\n" + orig);
  }, (d) => runLedger(d, BASELINE)),
  { code: 1, must: "#2: bad used", mustNot: "#2: WARN" });

// ── G｜数值与单智能体 ─────────────────────────────────────────────
{
  const RAW = (over) => `{"task":"T","project":"p","date":"2026-10-11","role":"builder",` +
    `"model":"codebuddy/glm-5.3-flash","result":"PASS","escalated":"NO",` +
    `"escalation_reason":null,${over}}\n`;
  const mkT = (over) => withProject("proj-approved", (d) =>
    writeFileSync(join(d, "docs/model/TASK-MODEL-LOG.jsonl"), RAW(over)),
    (d) => runLedger(d, BASELINE));
  expect("G1 cost_cny=1e309(Infinity) 被拦", mkT(`"rework":0,"tokens":null,"cost_cny":1e309`),
    { code: 1, must: "bad cost_cny=Infinity" });
  expect("G2 cost_cny=-5 被拦", mkT(`"rework":0,"tokens":null,"cost_cny":-5`),
    { code: 1, must: "bad cost_cny=-5" });
  expect("G3 cost_cny=\"abc\" 被拦", mkT(`"rework":0,"tokens":null,"cost_cny":"abc"`),
    { code: 1, must: "须有限数值" });
  expect("G4 tokens=true(布尔) 被拦", mkT(`"rework":0,"tokens":true,"cost_cny":null`),
    { code: 1, must: "布尔非合法数值" });
  expect("G5 rework=null 被拦（不照 cost 放行）", mkT(`"rework":null,"tokens":null,"cost_cny":null`),
    { code: 1, must: "bad rework=null" });
  expect("G6 正常小数允许", mkT(`"rework":2,"tokens":null,"cost_cny":12.34`), { code: 0 });
}
expect("G7 单智能体空派工账 exit 0（不判漏记）",
  withProject("proj-approved", (d) => writeFileSync(join(d, "docs/model/DISPATCH-LOG.jsonl"), ""),
    (d) => runLedger(d, BASELINE)),
  { code: 0 });

// ── H｜物理行号语义：空行占位 ──────────────────────────────────────
expect("H1 空行占位后历史行号仍正确命中",
  withProject("proj-approved", (d) =>
    writeFileSync(join(d, "docs/model/DISPATCH-LOG.jsonl"), "\n\n" + readD(d)),
    (d) => runLedger(d, BASELINE)),
  { code: 1, must: "#3: bad used", mustNot: "#3: WARN" });

const pass = results.filter((r) => r.ok).length;
const fail = results.length - pass;
console.log(`\nALL ${fail ? "FAIL" : "PASS"}  pass=${pass} fail=${fail}`);
process.exit(fail ? 1 : 0);