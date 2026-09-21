#!/usr/bin/env node
// orca-decide — ORCA Decision Sidecar CLI (advisory only).
// Transport: direct POST https://api.typesafe.ai/v1/systemone (model jev-latest).
// Usage: orca-decide <change|route|user|p0> <state.json>
// Secret: ~/.config/orca/decision.env (TYPESAFE_API_KEY). Never printed.
import { readFileSync, existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const ENDPOINT = "https://api.typesafe.ai/v1/systemone";
const MODEL = "jev-latest";
const SCHEMA = "1.0";

function fail(code, fallback = "ORCA_V2_1_EXISTING_LOGIC") {
  console.log(JSON.stringify({ ok: false, error: code, fallback }));
  process.exit(1);
}

function loadKey() {
  const p = join(homedir(), ".config", "orca", "decision.env");
  if (!existsSync(p)) fail("KEY_MISSING");
  const txt = readFileSync(p, "utf8");
  const m = txt.match(/^TYPESAFE_API_KEY=(.+)$/m) || txt.match(/^AI_GATEWAY_API_KEY=(.+)$/m);
  if (!m || m[1].trim().length < 10) fail("KEY_MISSING");
  return m[1].trim();
}

const MODES = {
  change: {
    q: {
      change_class: {
        type: "choice",
        instructions: "Classify the change request. Reply with exactly one key.",
        criteria: { A: "dev-internal small tweak", B: "local feature change", C: "product/architecture change needing Controlled Reopen" },
      },
    },
    pick: (a) => a.change_class?.choice ?? null,
    prob: (a) => a.change_class?.probabilities?.[a.change_class?.choice] ?? a.change_class?.confidence ?? null,
  },
  route: {
    q: {
      issue_owner: {
        type: "choice",
        instructions: "Decide which role owns this issue. Reply with exactly one key.",
        criteria: { PLANNER: "requirement undefined", BUILDER: "implementation bug", CODE_REVIEWER: "review finding", QA: "test/stale-case issue", DB_ADMIN: "RLS/schema/migration issue", TASK_MANAGER: "uncertain, needs orchestrator ruling" },
      },
    },
    pick: (a) => a.issue_owner?.choice ?? null,
    prob: (a) => a.issue_owner?.probabilities?.[a.issue_owner?.choice] ?? a.issue_owner?.confidence ?? null,
  },
  user: {
    q: {
      user_required: {
        type: "choice",
        instructions: "Decide whether the user must be consulted. Reply with exactly one key.",
        criteria: { NO: "decidable by rules", YES_PRODUCT_DIRECTION: "product direction", YES_PERMISSION: "needs permission", YES_IRREVERSIBLE: "irreversible", YES_HUMAN_GATE: "human gate" },
      },
    },
    pick: (a) => a.user_required?.choice ?? null,
    prob: (a) => a.user_required?.probabilities?.[a.user_required?.choice] ?? a.user_required?.confidence ?? null,
  },
  p0: {
    q: {
      p0_hard: { type: "noul", instructions: "Is this a P0-hard blocking issue?" },
      risk: { type: "score", instructions: "Risk from harmless to critical.", criteria: ["harmless", "low", "medium", "high", "critical"] },
    },
    pick: (a) => ((a.p0_hard?.noul ?? 0) >= 0.5 ? true : false),
    prob: (a) => a.p0_hard?.noul ?? null,
    extra: (a, levels) => ({ risk: scaleScore(a.risk, levels) }),
  },
};

function scaleScore(ans, levels) {
  if (!ans || typeof ans.score !== "number" || levels < 2) return null;
  return Math.max(0, Math.min(1, ans.score / (levels - 1)));
}

function stateText(mode, s) {
  if (mode === "p0" && typeof s.rework_count === "number" && s.rework_count >= 2) {
    return { deterministic: { decision: true, reason: "supervisor rework>=2 -> senior (rule)" } };
  }
  const parts = [];
  for (const [k, v] of Object.entries(s)) {
    if (k === "expected") continue;
    parts.push(`${k}: ${typeof v === "object" ? JSON.stringify(v) : v}`);
  }
  return { text: parts.join("\n") };
}

async function callApi(key, state, questions, attempt = 1) {
  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), 60000);
  let res;
  try {
    res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ state, model: MODEL, questions }),
      signal: ctrl.signal,
    });
  } catch {
    clearTimeout(to);
    fail("JEV_NETWORK");
  }
  clearTimeout(to);
  if (res.status === 401) fail("JEV_AUTH");
  if (res.status === 402) fail("JEV_QUOTA_OUT");
  if (res.status === 422) fail("JEV_BAD_REQUEST");
  if (res.status === 429 || res.status === 529) {
    if (attempt < 3) {
      await new Promise((r) => setTimeout(r, attempt * 3000));
      return callApi(key, state, questions, attempt + 1);
    }
    fail(res.status === 429 ? "JEV_RATE_LIMITED" : "JEV_OVERLOADED");
  }
  if (res.status >= 500) fail("JEV_SERVER_ERROR");
  if (!res.ok) fail("JEV_UNAVAILABLE");
  let body;
  try {
    body = await res.json();
  } catch {
    fail("JEV_SCHEMA_CHANGED");
  }
  if (!body || typeof body !== "object" || !body.answers) fail("JEV_SCHEMA_CHANGED");
  return body;
}

async function main() {
  const [mode, file] = process.argv.slice(2);
  if (!mode || !file) fail("BAD_ARGS");
  if (!MODES[mode]) fail("BAD_MODE");
  if (!existsSync(file)) fail("STATE_FILE_MISSING");
  let state;
  try {
    state = JSON.parse(readFileSync(file, "utf8"));
  } catch {
    fail("BAD_JSON");
  }
  const st = stateText(mode, state);
  if (st.deterministic) {
    console.log(JSON.stringify({
      schema_version: SCHEMA, mode, ok: true,
      decision: st.deterministic.decision, probability: 1,
      advisory_only: true, model: "deterministic-rule",
      note: st.deterministic.reason,
    }));
    return;
  }
  const key = loadKey();
  const body = await callApi(key, st.text, MODES[mode].q);
  const a = body.answers;
  const decision = MODES[mode].pick(a);
  const enums = { change: ["A", "B", "C"], route: ["PLANNER", "BUILDER", "CODE_REVIEWER", "QA", "DB_ADMIN", "TASK_MANAGER"], user: ["NO", "YES_PRODUCT_DIRECTION", "YES_PERMISSION", "YES_IRREVERSIBLE", "YES_HUMAN_GATE"] };
  if (mode !== "p0") {
    if (typeof decision !== "string" || !enums[mode].includes(decision)) fail("JEV_UNKNOWN_ENUM");
  }
  const out = {
    schema_version: SCHEMA, mode, ok: true,
    decision, probability: MODES[mode].prob(a), advisory_only: true, model: body.model || MODEL,
    usage: body.usage ?? null,
  };
  if (MODES[mode].extra) Object.assign(out, MODES[mode].extra(a, MODES[mode].q.risk?.criteria?.length ?? 0));
  console.log(JSON.stringify(out));
}

main();
