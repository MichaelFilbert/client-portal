# Portal — client approvals for freelancers

Share a link with your client. They approve work, request changes with notes, and see what's next — no login required for them.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3777 — demo data (Maya Chen @ Northwind Coffee Co.) is seeded on first load.

- **Dashboard (`/`)** — add clients, projects, and deliverables; open each client's portal link.
- **Client portal (`/portal/[token]`)** — what your client sees: approve deliverables or request changes with a note.

## Stack

- Next.js 16 (App Router, server actions) + React 19
- SQLite via Node's built-in `node:sqlite` — no native deps, DB lives in `data/portal.sqlite`
- Zero external services; works offline

## Roadmap ideas

- Email the portal link automatically (Resend/Postmark)
- File attachments per deliverable (S3/Vercel Blob)
- Stripe deposits on approved work
- Activity notifications ("Client approved X")
- Multi-freelancer accounts with auth
