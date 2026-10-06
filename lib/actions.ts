"use server";

import { revalidatePath } from "next/cache";
import {
  createClient,
  createDeliverable,
  createProject,
  deleteClient,
  deleteDeliverable,
  deleteProject,
  getClientByToken,
  setDeliverableNote,
  setDeliverableStatus,
  setProjectStatus,
} from "./db";

function num(value: FormDataEntryValue | null): number {
  return Number(value);
}

function str(value: FormDataEntryValue | null): string {
  return String(value ?? "").trim();
}

/* ------------------------------ dashboard ------------------------------ */

export async function createClientAction(formData: FormData) {
  const name = str(formData.get("name"));
  if (!name) return;
  createClient(name, str(formData.get("company")) || null);
  revalidatePath("/");
}

export async function createProjectAction(formData: FormData) {
  const name = str(formData.get("name"));
  const clientId = num(formData.get("clientId"));
  if (!name || !clientId) return;
  createProject(clientId, name);
  revalidatePath("/");
}

export async function setProjectStatusAction(formData: FormData) {
  const id = num(formData.get("id"));
  const status = str(formData.get("status")) as "draft" | "active" | "done";
  if (!id) return;
  setProjectStatus(id, status);
  revalidatePath("/");
}

export async function deleteProjectAction(formData: FormData) {
  const id = num(formData.get("id"));
  if (!id) return;
  deleteProject(id);
  revalidatePath("/");
}

export async function deleteClientAction(formData: FormData) {
  const id = num(formData.get("id"));
  if (!id) return;
  deleteClient(id);
  revalidatePath("/");
}

export async function createDeliverableAction(formData: FormData) {
  const name = str(formData.get("name"));
  const projectId = num(formData.get("projectId"));
  if (!name || !projectId) return;
  const rawAmount = str(formData.get("amount"));
  const parsed = rawAmount ? Number.parseFloat(rawAmount) : null;
  const amount = parsed !== null && Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
  createDeliverable(projectId, name, amount);
  revalidatePath("/");
}

export async function deleteDeliverableAction(formData: FormData) {
  const id = num(formData.get("id"));
  if (!id) return;
  deleteDeliverable(id);
  revalidatePath("/");
}

/* -------------------------------- portal -------------------------------- */

export async function approveDeliverableAction(formData: FormData) {
  const id = num(formData.get("id"));
  const token = str(formData.get("token"));
  if (!id || !token || !getClientByToken(token)) return;
  setDeliverableStatus(id, "approved");
  revalidatePath(`/portal/${token}`);
}

export async function requestChangesAction(formData: FormData) {
  const id = num(formData.get("id"));
  const token = str(formData.get("token"));
  const note = str(formData.get("note"));
  if (!id || !token || !getClientByToken(token)) return;
  if (note) setDeliverableNote(id, note);
  setDeliverableStatus(id, "changes");
  revalidatePath(`/portal/${token}`);
}

/* ------------------------------- first run ------------------------------ */
