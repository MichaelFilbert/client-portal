import { DatabaseSync } from "node:sqlite";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "portal.sqlite");

fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new DatabaseSync(DB_PATH);
db.exec("PRAGMA journal_mode = WAL;");
db.exec("PRAGMA foreign_keys = ON;");

db.exec(`
CREATE TABLE IF NOT EXISTS clients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  company TEXT,
  token TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft','active','done')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS deliverables (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount REAL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','changes','approved')),
  note TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`);

export type Client = {
  id: number;
  name: string;
  company: string | null;
  token: string;
  created_at: string;
};

export type Project = {
  id: number;
  client_id: number;
  name: string;
  status: "draft" | "active" | "done";
};

export type Deliverable = {
  id: number;
  project_id: number;
  name: string;
  amount: number | null;
  status: "pending" | "changes" | "approved";
  note: string | null;
};

export function getClients(): Client[] {
  return db.prepare("SELECT * FROM clients ORDER BY id DESC").all() as unknown as Client[];
}

export function getClientByToken(token: string): Client | undefined {
  return db.prepare("SELECT * FROM clients WHERE token = ?").get(token) as
    | Client
    | undefined;
}

export function createClient(name: string, company: string | null): Client {
  let token = crypto.randomBytes(6).toString("hex");
  while (getClientByToken(token)) {
    token = crypto.randomBytes(6).toString("hex");
  }
  const result = db
    .prepare("INSERT INTO clients (name, company, token) VALUES (?, ?, ?)")
    .run(name, company, token);
  return { id: Number(result.lastInsertRowid), name, company, token, created_at: "" };
}

export function deleteClient(id: number) {
  db.prepare("DELETE FROM clients WHERE id = ?").run(id);
}

export function getProjectsForClient(clientId: number): Project[] {
  return db
    .prepare("SELECT * FROM projects WHERE client_id = ? ORDER BY id ASC")
    .all(clientId) as unknown as Project[];
}

export function createProject(clientId: number, name: string) {
  db.prepare("INSERT INTO projects (client_id, name) VALUES (?, ?)").run(clientId, name);
}

export function setProjectStatus(id: number, status: Project["status"]) {
  db.prepare("UPDATE projects SET status = ? WHERE id = ?").run(status, id);
}

export function deleteProject(id: number) {
  db.prepare("DELETE FROM projects WHERE id = ?").run(id);
}

export function getDeliverablesForProject(projectId: number): Deliverable[] {
  return db
    .prepare("SELECT * FROM deliverables WHERE project_id = ? ORDER BY id ASC")
    .all(projectId) as unknown as Deliverable[];
}

export function createDeliverable(projectId: number, name: string, amount: number | null) {
  db.prepare("INSERT INTO deliverables (project_id, name, amount) VALUES (?, ?, ?)").run(
    projectId,
    name,
    amount
  );
}

export function setDeliverableStatus(id: number, status: Deliverable["status"]) {
  db.prepare("UPDATE deliverables SET status = ? WHERE id = ?").run(status, id);
}

export function setDeliverableNote(id: number, note: string) {
  db.prepare("UPDATE deliverables SET note = ? WHERE id = ?").run(note, id);
}

export function deleteDeliverable(id: number) {
  db.prepare("DELETE FROM deliverables WHERE id = ?").run(id);
}

export function seedDemoData() {
  const row = db.prepare("SELECT COUNT(*) AS c FROM clients").get() as { c: number };
  if (row.c > 0) return;

  const client = createClient("Maya Chen", "Northwind Coffee Co.");
  createProject(client.id, "Brand refresh");
  const projects = getProjectsForClient(client.id);
  createDeliverable(projects[0].id, "Logo concepts (3 directions)", 800);
  createDeliverable(projects[0].id, "Color & type system", 450);
  createDeliverable(projects[0].id, "Packaging mockups", null);
  setDeliverableStatus(2, "approved");

  createProject(client.id, "Website redesign");
  const projects2 = getProjectsForClient(client.id);
  createDeliverable(projects2[1].id, "Homepage wireframes", 600);
  createDeliverable(projects2[1].id, "Product page design", 900);
}
