import Dexie, { type Table } from "dexie";
import type { Child, Observation, Parent, Session } from "@/types";

/**
 * Fokus IndexedDB schema.
 *
 * Indexes match SPEC §5 exactly:
 *   parents:      'id, updatedAt'
 *   children:     'id, parentId, updatedAt'
 *   sessions:     'id, childId, date, activityId, [childId+date]'
 *   observations: 'id, childId, date'
 *
 * Bumping the version (this.version(N)) requires writing a migration.
 * see https://dexie.org/docs/Tutorial/Design#database-versioning.
 */
export class FokusDB extends Dexie {
  parents!: Table<Parent, string>;
  children!: Table<Child, string>;
  sessions!: Table<Session, string>;
  observations!: Table<Observation, string>;

  constructor() {
    super("fokus_db");
    this.version(1).stores({
      parents: "id, updatedAt",
      children: "id, parentId, updatedAt",
      sessions: "id, childId, date, activityId, [childId+date]",
      observations: "id, childId, date",
    });
  }
}

/**
 * Dexie's constructor doesn't actually touch IndexedDB; that happens lazily
 * on first query. The try/catch here is defensive: it surfaces a clear log if
 * Dexie itself fails to construct (corrupt bundle, etc.). Real "no IDB
 * available" / "storage full" errors only fire when a table operation runs;
 * see `withDbErrorContext` below for a helpful wrapper if callers want it.
 */
function createDb(): FokusDB {
  try {
    return new FokusDB();
  } catch (err) {
    if (typeof console !== "undefined") {
      console.error(
        "[fokus_db] Failed to construct Dexie database. IndexedDB may be unavailable (private browsing, no storage, or Dexie bundle problem).",
        err,
      );
    }
    throw err;
  }
}

export const db: FokusDB = createDb();

/**
 * Run a Dexie operation and rewrite open/storage failures into a single,
 * unambiguous error message. Optional; callers may also let raw Dexie
 * errors propagate.
 */
export async function withDbErrorContext<T>(
  fn: () => Promise<T>,
  context: string,
): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    const name = (err as { name?: string })?.name ?? "Error";
    if (name === "OpenFailedError" || name === "QuotaExceededError") {
      console.error(`[fokus_db] ${context}: storage unavailable`, err);
      throw new Error(
        "Fokus can't save right now. Your device may be in private browsing or out of storage.",
      );
    }
    throw err;
  }
}
