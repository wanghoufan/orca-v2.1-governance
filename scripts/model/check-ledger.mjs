#!/usr/bin/env node
// check-ledger.mjs — 账本合法性校验（TASK-MODEL-LOG / DISPATCH-LOG）。
// Usage: node check-ledger.mjs [dir] -> exit 0 合法 / exit 1 列出问题
// 分级：结构/枚举错误 = FAIL（exit 1）；写法不规范 = WARN（不影响 exit，供 supervisor 抽查）。
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, basename } from "node:path";

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

function check(file, need, enums, evidence) {
  const p = join(dir, file);
  if (!existsSync(p)) { fails.push(`${file}: MISSING`); return; }
  const lines = readFileSync(p, "utf8").split("\n").filter((l) => l.trim());
  let n = 0;
  for (const [i, l] of lines.entries()) {
    let d;
    try { d = JSON.parse(l); } catch { fails.push(`${file}#${i + 1}: BAD_JSON`); continue; }
    if (d === null || typeof d !== "object" || Array.isArray(d)) { fails.push(`${file}#${i + 1}: NOT_OBJECT`); continue; }
    if (d._example === true) continue;
    n++;
    const ln = i + 1;
    for (const k of need) if (!(k in d)) fails.push(`${file}#${ln}: missing ${k}`);
    for (const [k, vs] of Object.entries(enums)) {
      if (k in d && d[k] !== null && !vs.includes(d[k])) fails.push(`${file}#${ln}: bad ${k}=${d[k]}`);
    }
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
  const nex = lines.filter((l) => { try { return JSON.parse(l)._example === true; } catch { return false; } }).length;
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

for (const w of warns) console.log(w);
if (fails.length) { console.log(fails.join("\n")); process.exit(1); }
console.log(warns.length ? "LEDGER-OK (含 WARN)" : "LEDGER-OK");
