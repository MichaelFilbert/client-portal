# AGENTS.md — client-portal

Context for any AI session working in this folder.

## What this is

**Portal** — a client-approval tool for freelancers. Freelancer shares a secret link; client approves deliverables or requests changes with notes. MVP built and verified (typecheck, production build, browser-tested approve/request-changes flows).

## QA requirement

Before calling any change "done", run the **qa-customer-journey** skill (`~/.agents/skills/qa-customer-journey/SKILL.md`): full happy path through the real UI, empty/malformed inputs on every form, invalid-token and XSS/SQLi spot checks, server-restart persistence check, and an honest test report.

## Run

```bash
npm install
npm run dev        # port 3777 (pinned; check lsof before changing)
```

## Architecture (deliberately minimal)

- `app/page.tsx` — freelancer dashboard: clients → projects → deliverables, live stats
- `app/portal/[token]/page.tsx` — public client portal, access = random 12-char token in URL, no auth
- `lib/db.ts` — SQLite via Node built-in `node:sqlite` (DatabaseSync), file at `data/portal.sqlite`; schema + typed queries + `seedDemoData()` (idempotent, called by dashboard on first render)
- `lib/actions.ts` — server actions for all mutations; portal actions re-verify the token; no API routes
- `proxy.ts` — HTTP Basic auth gate on everything except `/portal/*` (credentials in gitignored `.env.local`: `DASHBOARD_USER`/`DASHBOARD_PASSWORD`); fails closed when the password env is unset
- No CSS framework — hand-rolled `globals.css` tokens

## Conventions

- TypeScript strict; keep it that way.
- Server actions validate inputs server-side and `revalidatePath` after writes.
- Client tokens: 6 random bytes hex; check uniqueness on generation.
- Port 3777 is this project's default; avoid collisions with other workspace projects.

## Known gaps (the roadmap to "sellable")

1. Dashboard auth is HTTP Basic (stopgap, added 2026-10-06) — fine for solo use; real freelancer accounts come at the multi-user milestone.
2. Not deployed. Deploy target TBD (Vercel works as-is for app code; SQLite needs a persistent-volume host or swap to Postgres/Turso).
3. No notifications when a client responds; no file attachments; no payments.
4. Automated tests: `npm run qa` ([qa.mjs](qa.mjs)) covers 11 checks across HTTP + DB layers (dashboard auth gate, portal-stays-public, auth tokens, XSS inertness, injection integrity, seed idempotency) — requires the dev server running. Not yet covered: full browser-click flows (Playwright), concurrent edits, rate limiting on portal tokens and on auth attempts.

## Repo

GitHub: https://github.com/MichaelFilbert/client-portal (public, branch `main`, `origin` over HTTPS via gh CLI). `data/` and build caches are gitignored; never commit runtime state.

## Data

Demo client "Maya Chen / Northwind Coffee Co." is seeded automatically. Portal tokens are random per seed (`crypto.randomBytes(6).toString("hex")`) — never hardcode one in docs or tests; read the live token from the dashboard or `SELECT token FROM clients`. `data/` is runtime state, not code — exclude it from git.
