import type { Child } from "@/types";
import { now } from "@/lib/utils/dates";
import { newId } from "@/lib/utils/ids";
import { db } from "./client";

export type NewChildInput = Omit<
  Child,
  "id" | "createdAt" | "updatedAt" | "_syncStatus"
>;

export async function createChild(input: NewChildInput): Promise<Child> {
  const stamp = now();
  const child: Child = {
    ...input,
    id: newId(),
    createdAt: stamp,
    updatedAt: stamp,
    _syncStatus: "local",
  };
  await db.children.add(child);
  return child;
}

/** All children for a parent, ordered by createdAt asc (so first child stays first). */
export async function listChildren(parentId: string): Promise<Child[]> {
  return db.children.where("parentId").equals(parentId).sortBy("createdAt");
}

export async function getChild(id: string): Promise<Child | undefined> {
  return db.children.get(id);
}

export async function updateChild(
  id: string,
  patch: Partial<Child>,
): Promise<void> {
  await db.children.update(id, {
    ...patch,
    updatedAt: now(),
    _syncStatus: "local",
  });
}

/**
 * Delete a child and cascade to its sessions + observations.
 * Wrapped in a Dexie 'rw' transaction so the three deletes are atomic —
 * either the child and all of its data go, or nothing changes.
 */
export async function deleteChild(id: string): Promise<void> {
  await db.transaction(
    "rw",
    db.children,
    db.sessions,
    db.observations,
    async () => {
      await db.sessions.where("childId").equals(id).delete();
      await db.observations.where("childId").equals(id).delete();
      await db.children.delete(id);
    },
  );
}
