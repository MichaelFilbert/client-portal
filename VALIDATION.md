# Portal — 3-Freelancer Validation Plan

Goal: before writing feature #2, find out whether 3 real freelancers would send this link to a real client. Their *behavior* decides, not their compliments.

## The demo you send them

One link, zero setup on their side:

1. Dashboard: `http://localhost:3777/` (or the deployed URL once live)
2. Client portal (read this token from the dashboard, it changes on re-seed): `/portal/<token>`

The seeded demo (Maya Chen / Northwind Coffee Co.) already shows the whole loop: two active projects, five deliverables with amounts, approve + request-changes-with-note.

## Who to ask (in order of signal)

1. **A freelancer with at least one active client right now** — best signal; they can actually use it this week.
2. **A designer/dev who has been burned by "endless revisions"** — feels the pain you solve.
3. **Anyone who has emailed a ZIP + "please confirm you're happy"** — the exact workflow you replace.

Avoid: friends who will be nice, and people without clients (they'll speculate about hypothetical users).

## The 15-minute demo script

1. (1 min) "I built this for freelancers to get sign-off without email ping-pong. You are the freelancer; here's your dashboard."
2. (3 min) Let *them* create a fake client and a deliverable. Say nothing while they hunt for buttons — the hesitation is the data.
3. (2 min) Send them the portal link like they'd send it to a client. Watch: do they instantly understand whose view this is?
4. (3 min) Ask them to approve one deliverable and request changes on another. The note flow is the core interaction — does it feel like work or relief?
5. (6 min) Questions, verbatim answers below.

## The only 4 questions

1. "What would you have used before this?" — proves/disproves the pain.
2. "Would you send this to a real client today? What would stop you?" — surfaces trust blockers (branding? link looks sketchy? no login?).
3. "What's the first thing you'd change?" — their priority, not yours.
4. "If this cost $9/month, in or out?" — money answers beat polite ones. Push a number, not a maybe.

## Decisions this feeds

| Signal | Action |
|---|---|
| All 3 would send it to a client today | Build the paid version scope next (free tier vs paid gate) |
| 2 of 3 hesitate on trust | Add freelancer branding + custom message on the portal before anything else |
| They ask for client login/email notifications | That's the roadmap — note it, don't build it yet |
| Nobody would pay anything | Stop building; the demo proved the wrong thing. Cheapest possible failure. |

## Verbatim log (fill in as you go)

- Freelancer 1: date, answers, did they create the client unprompted?
- Freelancer 2:
- Freelancer 3:
