import { notFound } from "next/navigation";
import { approveDeliverableAction, requestChangesAction } from "@/lib/actions";
import { getClientByToken, getProjectsForClient, getDeliverablesForProject } from "@/lib/db";

export const dynamic = "force-dynamic";

const statusStyle: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  changes: "bg-red-100 text-red-700",
  approved: "bg-emerald-100 text-emerald-700",
};

function StatusBadge({ status }: { status: string }) {
  return <span className={`badge ${statusStyle[status] ?? ""}`}>{status}</span>;
}

function money(n: number | null) {
  if (n == null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export default async function PortalPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const client = getClientByToken(token);
  if (!client) notFound();

  const projects = getProjectsForClient(client.id);

  return (
    <main className="container">
      <header style={{ marginBottom: 24 }}>
        <div className="muted">Shared with you by your freelancer</div>
        <h1 style={{ margin: "4px 0 0" }}>{client.company ?? client.name}</h1>
      </header>

      {projects.length === 0 && <p className="muted">Nothing shared yet — check back soon.</p>}

      {projects.map((project) => {
        const deliverables = getDeliverablesForProject(project.id);
        return (
          <section key={project.id} className="card" style={{ marginBottom: 16 }}>
            <div className="row" style={{ justifyContent: "space-between" }}>
              <h2 style={{ margin: 0 }}>{project.name}</h2>
              <StatusBadge status={project.status} />
            </div>

            {deliverables.length === 0 && <p className="muted">No deliverables in this project yet.</p>}

            {deliverables.map((d) => (
              <div key={d.id} className="deliverable">
                <div className="row" style={{ justifyContent: "space-between" }}>
                  <div>
                    <strong>{d.name}</strong>
                    <div className="muted">{money(d.amount)}</div>
                  </div>
                  <StatusBadge status={d.status} />
                </div>

                {d.note ? <p className="note">Client note: “{d.note}”</p> : null}

                {d.status !== "approved" && (
                  <div className="row" style={{ gap: 8, marginTop: 8 }}>
                    <form action={approveDeliverableAction}>
                      <input type="hidden" name="id" value={d.id} />
                      <input type="hidden" name="token" value={token} />
                      <button type="submit">✓ Approve</button>
                    </form>
                    <form action={requestChangesAction} className="row" style={{ gap: 8, flex: 1 }}>
                      <input type="hidden" name="id" value={d.id} />
                      <input type="hidden" name="token" value={token} />
                      <input name="note" placeholder="What needs to change?" style={{ flex: 1 }} />
                      <button className="secondary" type="submit">
                        Request changes
                      </button>
                    </form>
                  </div>
                )}
              </div>
            ))}
          </section>
        );
      })}

      <footer className="muted" style={{ textAlign: "center", padding: "24px 0" }}>
        Powered by Portal — the client approval tool for freelancers
      </footer>
    </main>
  );
}
