import type { Parent } from "@/types";
import { now } from "@/lib/utils/dates";
import { newId } from "@/lib/utils/ids";
import { db } from "./client";

export async function createParent(name: string): Promise<Parent> {
  const stamp = now();
  const parent: Parent = {
    id: newId(),
    name,
    createdAt: stamp,
    updatedAt: stamp,
    preferences: { onboarded: false },
    _syncStatus: "local",
  };
  await db.parents.add(parent);
  return parent;
}

export async function getParent(id: string): Promise<Parent | undefined> {
  return db.parents.get(id);
}

/** Returns the first parent in the DB. Fokus only supports one parent per device today. */
export async function getCurrentParent(): Promise<Parent | undefined> {
  return db.parents.toCollection().first();
}

export async function updateParent(
  id: string,
  patch: Partial<Parent>,
): Promise<void> {
  await db.parents.update(id, {
    ...patch,
    updatedAt: now(),
    _syncStatus: "local",
  });
}
