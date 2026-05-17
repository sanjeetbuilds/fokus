import { db } from "./client";

export { db, FokusDB, withDbErrorContext } from "./client";
export * from "./parents";
export * from "./children";
export * from "./sessions";
export * from "./observations";
export {
  exportAllData,
  exportFilename,
  type FokusExport,
} from "./export";

/**
 * Wipe every record from every Fokus table. Atomic via a single rw transaction.
 * Reserved for the dev page and the "Delete all data" Settings action.
 */
export async function wipeAllData(): Promise<void> {
  await db.transaction(
    "rw",
    db.parents,
    db.children,
    db.sessions,
    db.observations,
    async () => {
      await Promise.all([
        db.parents.clear(),
        db.children.clear(),
        db.sessions.clear(),
        db.observations.clear(),
      ]);
    },
  );
}
