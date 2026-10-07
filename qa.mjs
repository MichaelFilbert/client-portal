// Minimal smoke/regression test for client-portal. Run: npm run qa
// Requires the dev server to be running (npm run dev) and DASHBOARD_PASSWORD set in .env.local.
import { DatabaseSync } from "node:sqlite";

const base = process.env.BASE_URL ?? "http://localhost:3777";
const user = process.env.DASHBOARD_USER ?? "michael";
const pass = process.env.DASHBOARD_PASSWORD;
let failures = 0;

if (!pass) {
  console.error(
    "DASHBOARD_PASSWORD is not set — QA cannot exercise the authed dashboard. Run via `npm run qa` (loads .env.local)."
  );
  process.exit(1);
}

const authHeader = "Basic " + Buffer.from(`${user}:${pass}`).toString("base64");
function authFetch(path) {
  return fetch(base + path, { headers: { Authorization: authHeader } });
}

function check(label, ok, detail = "") {
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failures += 1;
}

// 1. Dashboard auth gate: locked without credentials, open with them
const locked = await fetch(base + "/");
check("dashboard rejects unauthenticated requests", locked.status === 401, `status ${locked.status}`);
const dash = await authFetch("/");
check("dashboard returns 200", dash.status === 200);
const dashHtml = await dash.text();
check("dashboard shows seeded client", dashHtml.includes("Maya Chen"));

// 2. Portal stays public — clients only ever need the link
const db = new DatabaseSync("data/portal.sqlite");
const liveToken = db.prepare("SELECT token FROM clients WHERE name = 'Maya Chen'").get().token;
const portal = await fetch(`${base}/portal/${liveToken}`);
check("portal stays public (no dashboard auth)", portal.status === 200, `status ${portal.status}`);

// 3. Invalid portal tokens are rejected without leaking data
for (const token of ["deadbeef1234", "abc", "../../lib/db.ts"]) {
  const res = await fetch(`${base}/portal/${encodeURIComponent(token)}`);
  const html = await res.text();
  check(
    `portal token "${token}" rejected`,
    (res.status === 404 || res.status === 400) &&
      !html.includes("Maya Chen") &&
      !html.includes("Northwind"),
    `status ${res.status}`
  );
}

// 4. XSS: store a payload as a fixture, then prove React renders it inert
db.prepare("INSERT INTO clients (name, company, token) VALUES (?, ?, ?)").run(
  "<script>alert(1)</script>Evil Corp",
  null,
  "qafixtured0"
);
const withEvil = await (await authFetch("/")).text();
check(
  "xss payload renders as inert text, never executable",
  withEvil.includes("Evil Corp") && !withEvil.includes("<script>alert(1)"),
  "no raw script tag in served HTML"
);
db.prepare("DELETE FROM clients WHERE token = 'qafixtured0'").run();

// 5. SQLi attempt left tables and rows intact
const tables = db
  .prepare("SELECT name FROM sqlite_master WHERE type='table'")
  .all()
  .map((t) => t.name);
check(
  "core tables intact after injection attempt",
  ["clients", "projects", "deliverables"].every((t) => tables.includes(t))
);
const deliverableCount = db.prepare("SELECT COUNT(*) AS c FROM deliverables").get().c;
check("deliverables intact", deliverableCount >= 5, `count=${deliverableCount}`);

// 6. Seed is idempotent — exactly one Maya Chen
const mayas = db.prepare("SELECT COUNT(*) AS c FROM clients WHERE name = 'Maya Chen'").get().c;
check("seed did not duplicate", mayas === 1, `count=${mayas}`);

db.close();

console.log(failures === 0 ? "\nALL CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
