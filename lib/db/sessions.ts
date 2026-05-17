import type { Session } from "@/types";
import { now } from "@/lib/utils/dates";
import { newId } from "@/lib/utils/ids";
import { db } from "./client";

export type NewSessionInput = Omit<Session, "id" | "createdAt" | "_syncStatus">;

export async function createSession(
  input: NewSessionInput,
): Promise<Session> {
  const session: Session = {
    ...input,
    id: newId(),
    createdAt: now(),
    _syncStatus: "local",
  };
  await db.sessions.add(session);
  return session;
}

/** All sessions for one child, ordered by `date` desc (newest first). */
export async function listSessionsForChild(
  childId: string,
): Promise<Session[]> {
  const rows = await db.sessions.where("childId").equals(childId).toArray();
  return rows.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

/** Sessions on a specific YYYY-MM-DD for a given child. Uses the [childId+date] compound index. */
export async function getSessionsByDate(
  childId: string,
  date: string,
): Promise<Session[]> {
  return db.sessions
    .where("[childId+date]")
    .equals([childId, date])
    .toArray();
}

export async function deleteSession(id: string): Promise<void> {
  await db.sessions.delete(id);
}
