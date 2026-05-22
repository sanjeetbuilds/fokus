"use client";

import { useCallback, useEffect, useState } from "react";

import { getSupabaseBrowser } from "@/lib/supabase/client";
import { getCurrentChild, type ChildRow } from "@/lib/supabase/queries";

/**
 * useChild; the canonical way to read the signed-in parent's child
 * row anywhere in the app. Backed by a tiny module-level cache so
 * mounting useChild() in three places doesn't fan out into three
 * round trips to Supabase.
 *
 *   const { child, loading, error, refetch } = useChild();
 *
 * - `loading` is true on the first fetch only; subsequent renders
 *   from cache resolve synchronously.
 * - `refetch()` busts the cache and re-queries. Call it after a
 *   mutation (insertChild, updateChild) if the writer doesn't
 *   already prime the cache via setCachedChild.
 * - `error` carries the last fetch error if any. Mutation errors
 *   are surfaced by the caller (insertChild / updateChild), not
 *   through this hook.
 *
 * The auth subscription wires the hook to SIGNED_IN / SIGNED_OUT
 * events so a sign-out from any tab clears the cache and triggers a
 * fresh fetch in every mounted consumer.
 */

type Listener = () => void;

interface CacheState {
  child: ChildRow | null;
  initialized: boolean;
}

let cache: CacheState = { child: null, initialized: false };
const listeners = new Set<Listener>();
let inflight: Promise<void> | null = null;

function notify() {
  for (const l of listeners) l();
}

function setCachedChild(child: ChildRow | null) {
  cache = { child, initialized: true };
  notify();
}

function clearCache() {
  cache = { child: null, initialized: false };
  notify();
}

async function fetchOnce() {
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      const child = await getCurrentChild();
      setCachedChild(child);
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
      // Cache is per-account; bust it on sign-in so a new account
      // doesn't see the previous account's child row.
      clearCache();
      void fetchOnce();
    }
  });
}

export interface UseChildResult {
  child: ChildRow | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useChild(): UseChildResult {
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

  return {
    child: cache.child,
    loading: !cache.initialized && inflight !== null,
    error,
    refetch,
  };
}

/**
 * Imperative cache prime used by writers (onboarding insert, profile
 * edit, photo upload) so the next useChild read returns the updated
 * row immediately without a round trip.
 */
export function primeChildCache(child: ChildRow | null) {
  setCachedChild(child);
}
