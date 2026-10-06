import Link from "next/link";
import { createClientAction,
  createDeliverableAction,
  createProjectAction,
  deleteClientAction,
  deleteDeliverableAction,
  deleteProjectAction,
  setProjectStatusAction,
} from "@/lib/actions";
import { getClients, getDeliverablesForProject, getProjectsForClient, seedDemoData } from "@/lib/db";

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

export default function Dashboard() {
  seedDemoData();
  const clients = getClients();

  let totalApproved = 0;
  let awaiting = 0;
  for (const c of clients) {
    for (const p of getProjectsForClient(c.id)) {
      for (const d of getDeliverablesForProject(p.id)) {
        if (d.status === "approved") totalApproved += d.amount ?? 0;
        if (d.status === "changes") awaiting += 1;
      }
    }
  }

  return (
    <main className="container">
      <header className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ margin: 0 }}>Client Portal</h1>
        <div className="row" style={{ gap: 12 }}>
          <div className="card stat">
            <div className="stat-label">Approved value</div>
            <div className="stat-value">{money(totalApproved)}</div>
          </div>
          <div className="card stat">
            <div className="stat-label">Needs your attention</div>
            <div className="stat-value">{awaiting}</div>
          </div>
        </div>
      </header>

      <form action={createClientAction} className="card row" style={{ gap: 8 }}>
        <input name="name" placeholder="Client name" required style={{ flex: 1 }} />
        <input name="company" placeholder="Company (optional)" style={{ flex: 1 }} />
        <button type="submit">Add client</button>
      </form>

      {clients.length === 0 && <p className="muted">No clients yet — add your first one above.</p>}

      {clients.map((client) => {
        const projects = getProjectsForClient(client.id);
        return (
          <section key={client.id} className="card" style={{ marginTop: 16 }}>
            <div className="row" style={{ justifyContent: "space-between" }}>
              <div>
                <h2 style={{ margin: 0 }}>
                  {client.name} {client.company ? <span className="muted">· {client.company}</span> : null}
                </h2>
              </div>
              <div className="row" style={{ gap: 8 }}>
                <Link className="button secondary" href={`/portal/${client.token}`}>
                  Open portal ↗
                </Link>
                <form action={deleteClientAction}>
                  <input type="hidden" name="id" value={client.id} />
                  <button className="danger" type="submit">
                    Delete
                  </button>
                </form>
              </div>
            </div>

            <form action={createProjectAction} className="row" style={{ gap: 8, marginTop: 12 }}>
              <input type="hidden" name="clientId" value={client.id} />
              <input name="name" placeholder="New project name" required style={{ flex: 1 }} />
              <button type="submit">Add project</button>
            </form>

            {projects.length === 0 && <p className="muted">No projects yet.</p>}

            {projects.map((project) => {
              const deliverables = getDeliverablesForProject(project.id);
              return (
                <div key={project.id} className="project-box">
                  <div className="row" style={{ justifyContent: "space-between" }}>
                    <strong>{project.name}</strong>
                    <div className="row" style={{ gap: 6 }}>
                      <form action={setProjectStatusAction} className="row" style={{ gap: 6 }}>
                        <input type="hidden" name="id" value={project.id} />
                        <select name="status" defaultValue={project.status}>
                          <option value="draft">draft</option>
                          <option value="active">active</option>
                          <option value="done">done</option>
                        </select>
                        <button className="secondary" type="submit">
                          Save
                        </button>
                      </form>
                      <form action={deleteProjectAction}>
                        <input type="hidden" name="id" value={project.id} />
                        <button className="danger" type="submit">
                          ✕
                        </button>
                      </form>
                    </div>
                  </div>

                  <form action={createDeliverableAction} className="row" style={{ gap: 8, margin: "8px 0" }}>
                    <input type="hidden" name="projectId" value={project.id} />
                    <input name="name" placeholder="Deliverable" required style={{ flex: 2 }} />
                    <input name="amount" type="number" min="0" step="1" placeholder="$ amount" style={{ flex: 1 }} />
                    <button type="submit">Add</button>
                  </form>

                  <div className="table-scroll">
                  <table className="table">
                    <tbody>
                      {deliverables.map((d) => (
                        <tr key={d.id}>
                          <td>{d.name}</td>
                          <td style={{ width: 90 }}>{money(d.amount)}</td>
                          <td style={{ width: 110 }}>
                            <StatusBadge status={d.status} />
                          </td>
                          {d.note ? <td className="muted">“{d.note}”</td> : <td />}
                          <td style={{ width: 40, textAlign: "right" }}>
                            <form action={deleteDeliverableAction}>
                              <input type="hidden" name="id" value={d.id} />
                              <button className="danger" type="submit">
                                ✕
                              </button>
                            </form>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div>
                </div>
              );
            })}
          </section>
        );
      })}
    </main>
  );
}
