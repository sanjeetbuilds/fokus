"use client";

import { getSupabaseBrowser } from "@/lib/supabase/client";

/**
 * Row shape for public.child. Pronouns + photo_url match the schema in
 * supabase/migrations/20260521090000_child.sql.
 */
export interface ChildRow {
  id: string;
  parent_id: string;
  name: string;
  dob: string; // YYYY-MM-DD
  pronouns: "he" | "she" | "they";
  photo_url: string | null;
  created_at: string;
}

/**
 * The signed-in parent's child row, or null if onboarding hasn't run
 * yet. Returns null (not throws) for unauthenticated callers so it can
 * be called from gates that race with the auth-state boot.
 */
export async function getCurrentChild(): Promise<ChildRow | null> {
  const supabase = getSupabaseBrowser();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("child")
    .select("*")
    .eq("parent_id", user.id)
    .maybeSingle();

  if (error) throw error;
  return data as ChildRow | null;
}

export interface ChildInsertInput {
  name: string;
  dob: string; // YYYY-MM-DD
  pronouns: "he" | "she" | "they";
}

/**
 * Insert the parent's first child row. Throws if not signed in. The
 * UNIQUE constraint on parent_id means a second call from the same
 * account is a 409; callers should check getCurrentChild first.
 */
export async function insertChild(input: ChildInsertInput): Promise<ChildRow> {
  const supabase = getSupabaseBrowser();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const { data, error } = await supabase
    .from("child")
    .insert({
      parent_id: user.id,
      name: input.name,
      dob: input.dob,
      pronouns: input.pronouns,
    })
    .select()
    .single();

  if (error) throw error;
  return data as ChildRow;
}

export interface ChildUpdateInput {
  name?: string;
  dob?: string;
  pronouns?: "he" | "she" | "they";
  photo_url?: string | null;
}

/**
 * Update fields on the signed-in parent's child row. RLS gates the
 * write to auth.uid() = parent_id; passing a child_id from a different
 * parent is a no-op (and an error from PostgREST).
 */
export async function updateChild(input: ChildUpdateInput): Promise<ChildRow> {
  const supabase = getSupabaseBrowser();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const { data, error } = await supabase
    .from("child")
    .update(input)
    .eq("parent_id", user.id)
    .select()
    .single();

  if (error) throw error;
  return data as ChildRow;
}

/* ===========================================================
 *  activity_log
 *  =========================================================== */

export interface ActivityLogRow {
  id: string;
  parent_id: string;
  activity_id: string;
  completed_at: string;
  parent_note: string | null;
}

/**
 * Record a completed activity for the signed-in parent. completed_at
 * defaults to now() server-side; we don't pass it explicitly so the
 * timestamp is authoritative.
 */
export async function insertActivityLog(
  activityId: string,
): Promise<ActivityLogRow> {
  const supabase = getSupabaseBrowser();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const { data, error } = await supabase
    .from("activity_log")
    .insert({ parent_id: user.id, activity_id: activityId })
    .select()
    .single();

  if (error) throw error;
  return data as ActivityLogRow;
}

/**
 * Get a single activity_log row by id. RLS scopes it to the signed-in
 * parent's rows automatically; passing someone else's id returns null.
 */
export async function getActivityLog(
  id: string,
): Promise<ActivityLogRow | null> {
  const supabase = getSupabaseBrowser();
  const { data, error } = await supabase
    .from("activity_log")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data as ActivityLogRow | null;
}

/**
 * Attach (or replace) the reflection note on an existing activity_log
 * row. Returns the updated row.
 */
export async function updateActivityLogNote(
  id: string,
  parentNote: string | null,
): Promise<ActivityLogRow> {
  const supabase = getSupabaseBrowser();
  const { data, error } = await supabase
    .from("activity_log")
    .update({ parent_note: parentNote })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as ActivityLogRow;
}

/**
 * All activity_log rows for the signed-in parent, most recent first.
 * Used by Track (T2.6) and the export-data feature (T2.9).
 */
export async function listActivityLog(): Promise<ActivityLogRow[]> {
  const supabase = getSupabaseBrowser();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("activity_log")
    .select("*")
    .eq("parent_id", user.id)
    .order("completed_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as ActivityLogRow[];
}
