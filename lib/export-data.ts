"use client";

import {
  getCurrentChild,
  getCurrentProfile,
  listActivityLog,
} from "@/lib/supabase/queries";

/**
 * Shape of the JSON payload the user downloads from Profile → "Export
 * my data". Kept narrow: only the fields the parent explicitly owns
 * (their email, their child's identifying details, every activity
 * they've logged). Supabase-internal columns like the auth user id
 * or row created_at timestamps are excluded; the file is "what we
 * have about you" in plain reading order, not a database dump.
 */
export interface FokusExport {
  exported_at: string;
  account: { email: string };
  child: { name: string; dob: string; pronouns: "he" | "she" | "they" } | null;
  activity_log: Array<{
    activity_id: string;
    completed_at: string;
    parent_note: string | null;
  }>;
}

/**
 * Build the export JSON from Supabase. Reads profile + child +
 * activity_log in parallel (RLS scopes every query to the signed-in
 * parent automatically).
 */
export async function buildExport(): Promise<FokusExport> {
  const [profile, child, log] = await Promise.all([
    getCurrentProfile(),
    getCurrentChild(),
    listActivityLog(),
  ]);

  return {
    exported_at: new Date().toISOString(),
    account: { email: profile?.email ?? "" },
    child: child
      ? { name: child.name, dob: child.dob, pronouns: child.pronouns }
      : null,
    activity_log: log.map((row) => ({
      activity_id: row.activity_id,
      completed_at: row.completed_at,
      parent_note: row.parent_note,
    })),
  };
}

/**
 * Build the export and trigger a browser download as
 * `fokus-export-{YYYY-MM-DD}.json`. No server round trip; the Blob is
 * constructed in memory and released after the download is initiated.
 */
export async function downloadExport(): Promise<void> {
  const payload = await buildExport();
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const date = payload.exported_at.slice(0, 10);
  const url = URL.createObjectURL(blob);
  try {
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `fokus-export-${date}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  } finally {
    // Defer the revoke so Safari has time to start the download.
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
