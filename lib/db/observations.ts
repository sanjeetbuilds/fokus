import type { Observation } from "@/types";
import { now } from "@/lib/utils/dates";
import { newId } from "@/lib/utils/ids";
import { db } from "./client";

export type NewObservationInput = Omit<
  Observation,
  "id" | "createdAt" | "_syncStatus"
>;

export async function createObservation(
  input: NewObservationInput,
): Promise<Observation> {
  const obs: Observation = {
    ...input,
    id: newId(),
    createdAt: now(),
    _syncStatus: "local",
  };
  await db.observations.add(obs);
  return obs;
}

/** All observations for a child, newest first by `date`. */
export async function listObservationsForChild(
  childId: string,
): Promise<Observation[]> {
  const rows = await db.observations
    .where("childId")
    .equals(childId)
    .toArray();
  return rows.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}
