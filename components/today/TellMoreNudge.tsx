"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const DISMISS_KEY = "fokus_tell_more_dismissed";

/**
 * Post-setup nudge for children created via the round-4 short onboarding.
 * Setup only captures name + age band; the engine actually needs
 * englishConfidence + interests + struggles + goesDeepOn + fleesFrom to
 * score properly. This card lives at the top of /today until the parent
 * either fills those in (via /profile/settings) or dismisses it.
 *
 * Dismissal is per-device (sessionStorage), not per-child — the same
 * parent on the same device only needs to be nudged once. If they ignore
 * it, the engine keeps picking from the unfiltered pool, which is a
 * graceful fallback rather than a failure.
 */
export default function TellMoreNudge({ childName }: { childName: string }) {
  const [dismissed, setDismissed] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      setDismissed(false);
      return;
    }
    let v = false;
    try {
      v = window.localStorage.getItem(DISMISS_KEY) === "1";
    } catch {
      /* ignore */
    }
    setDismissed(v);
  }, []);

  if (dismissed !== false) return null;

  const onDismiss = () => {
    try {
      window.localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
    setDismissed(true);
  };

  return (
    <div
      className="relative rounded-[20px] border-[1.5px] border-dashed p-4 pr-10"
      style={{
        borderColor: "var(--accent)",
        background: "var(--accent-bg)",
        marginBottom: 18,
      }}
    >
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        className="absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-full"
        style={{ color: "var(--accent-deep)" }}
      >
        <X size={14} strokeWidth={2.25} aria-hidden />
      </button>
      <p
        className="text-[11px] font-bold uppercase"
        style={{ color: "var(--accent-deep)", letterSpacing: "0.05em" }}
      >
        Help Fokus learn
      </p>
      <p
        className="mt-1.5 text-[15px] font-bold text-ink"
        style={{ lineHeight: 1.3 }}
      >
        Tell us a little more about {childName}.
      </p>
      <p
        className="mt-1 text-[13px] text-ink-secondary"
        style={{ lineHeight: 1.5 }}
      >
        Three minutes of detail — what they love, where they get stuck — and
        the moments we suggest start to fit.
      </p>
      <Link
        href="/profile/settings"
        className="mt-2.5 inline-flex items-center gap-1 text-[13px] font-semibold"
        style={{ color: "var(--accent-deep)" }}
      >
        Fill in their profile →
      </Link>
    </div>
  );
}
