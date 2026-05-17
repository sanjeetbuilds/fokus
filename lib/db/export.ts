import { db } from "./client";
import { today } from "@/lib/utils/dates";
import type { Child, Observation, Parent, Session } from "@/types";

/**
 * Versioned shape of a Fokus export. Bumping `schemaVersion` is a heads-up
 * to future importers that the layout has changed. The four record arrays
 * are the entire IndexedDB state; there is no derived data we need to
 * include, since everything else can be recomputed from these.
 */
export interface FokusExport {
  schemaVersion: 1;
  exportedAt: string; // ISO timestamp
  parents: Parent[];
  children: Child[];
  sessions: Session[];
  observations: Observation[];
}

/**
 * Pull every record from every table and serialize to a pretty-printed
 * JSON Blob. Returns the Blob so the caller can wire it to a download
 * anchor or upload to a remote endpoint.
 */
export async function exportAllData(): Promise<Blob> {
  const [parents, children, sessions, observations] = await Promise.all([
    db.parents.toArray(),
    db.children.toArray(),
    db.sessions.toArray(),
    db.observations.toArray(),
  ]);

  const payload: FokusExport = {
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    parents,
    children,
    sessions,
    observations,
  };

  return new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
}

/** "fokus-export-2026-05-17.json": today's calendar date in the filename. */
export function exportFilename(date: string = today()): string {
  return `fokus-export-${date}.json`;
}
