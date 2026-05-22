"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { getSupabaseBrowser } from "@/lib/supabase/client";
import {
  listActivityLog,
  type ActivityLogRow,
} from "@/lib/supabase/queries";

/**
 * useActivityLog; the canonical way to read the signed-in parent's
 * activity_log anywhere in the app. Backed by a module-level cache so
 * Track, Library "Try again", and any other consumer share a single
 * Supabase round trip per session.
 *
 *   const { rows, loading, error, refetch, triedActivityIds } = useActivityLog();
 *
 * - `rows` is sorted most-recent first (the same order the Supabase
 *   query returns).
 * - `triedActivityIds` is a memoised Set of distinct activity_ids the
 *   parent has at least one log entry for; handy for the Library
 *   "tried vs untried" decision.
 * - `refetch()` busts the cache and re-queries. Call after a write
 *   (e.g. insertActivityLog) so Track shows the new row right away.
 */

type Listener = () => void;

interface CacheState {
  rows: ActivityLogRow[];
  initialized: boolean;
}

let cache: CacheState = { rows: [], initialized: false };
const listeners = new Set<Listener>();
let inflight: Promise<void> | null = null;

function notify() {
  for (const l of listeners) l();
}

function setCachedRows(rows: ActivityLogRow[]) {
  cache = { rows, initialized: true };
  notify();
}

function clearCache() {
  cache = { rows: [], initialized: false };
  notify();
}

async function fetchOnce() {
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      const rows = await listActivityLog();
      setCachedRows(rows);
    } finally {
      inflight = null;
    }
  })();
  return inflight;
}

let authSubscribed = false;
function ensureAuthSubscription() {
  if (authSubscribed || typeof window === "undefined") return;
  authSubscribed = true;
  const supabase = getSupabaseBrowser();
  supabase.auth.onAuthStateChange((event) => {
    if (event === "SIGNED_OUT") {
      clearCache();
    } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
      clearCache();
      void fetchOnce();
    }
  });
}

export interface UseActivityLogResult {
  rows: ActivityLogRow[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  triedActivityIds: Set<string>;
}

export function useActivityLog(): UseActivityLogResult {
  const [, force] = useState(0);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    ensureAuthSubscription();
    const listener = () => force((n) => n + 1);
    listeners.add(listener);

    if (!cache.initialized && !inflight) {
      fetchOnce().catch((err) =>
        setError(err instanceof Error ? err : new Error(String(err))),
      );
    }

    return () => {
      listeners.delete(listener);
    };
  }, []);

  const refetch = useCallback(async () => {
    setError(null);
    clearCache();
    try {
      await fetchOnce();
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  }, []);

  const triedActivityIds = useMemo(
    () => new Set(cache.rows.map((r) => r.activity_id)),
    // re-derive whenever the cache identity changes; consumers force-
    // rerender via the listener above when that happens
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cache],
  );

  return {
    rows: cache.rows,
    loading: !cache.initialized && inflight !== null,
    error,
    refetch,
    triedActivityIds,
  };
}

/**
 * Imperative cache helpers used by writers so Track / Library reflect
 * a new or updated row immediately without a follow-up round trip.
 */

export function prependActivityLogToCache(row: ActivityLogRow): void {
  setCachedRows([row, ...cache.rows]);
}

export function replaceActivityLogInCache(row: ActivityLogRow): void {
  setCachedRows(cache.rows.map((r) => (r.id === row.id ? row : r)));
}
