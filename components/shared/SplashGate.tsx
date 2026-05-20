"use client";

import { useEffect, useState, type ReactNode } from "react";

const SESSION_KEY = "fokus_splash_shown";
const HOLD_MS = 2500;
const FADE_MS = 250;

/**
 * Round-6 cold-open splash. White background, centered: a pulsing accent
 * dot, the Fraunces "fokus." wordmark, and an italic two-line tagline.
 * Holds HOLD_MS, fades for FADE_MS, then unmounts. Per-session via
 * sessionStorage so warm reloads skip it.
 *
 * Routing happens in OnboardingGate; we don't navigate here. The gate's
 * decision (no parent → /intro / parent without child → /onboarding / else
 * → /today) plays out behind the splash so the user lands in the right
 * place when this gate fades.
 */
export default function SplashGate({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<
    "checking" | "showing" | "fading" | "gone"
  >("checking");

  useEffect(() => {
    if (typeof window === "undefined") {
      setPhase("gone");
      return;
    }
    let alreadyShown = false;
    try {
      alreadyShown = window.sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {
      /* sessionStorage can throw in private mode; fall through to show. */
    }
    if (alreadyShown) {
      setPhase("gone");
      return;
    }
    try {
      window.sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      /* ignore */
    }
    setPhase("showing");
    const fadeTimer = window.setTimeout(() => setPhase("fading"), HOLD_MS);
    const goneTimer = window.setTimeout(
      () => setPhase("gone"),
      HOLD_MS + FADE_MS,
    );
    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(goneTimer);
    };
  }, []);

  if (phase === "gone" || phase === "checking") {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      <div
        role="status"
        aria-label="Loading Fokus"
        aria-hidden={phase === "fading"}
        className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-bg"
        style={{
          opacity: phase === "fading" ? 0 : 1,
          transition: `opacity ${FADE_MS}ms ease-out`,
          pointerEvents: phase === "fading" ? "none" : "auto",
        }}
      >
        <span
          aria-hidden
          className="block rounded-full"
          style={{
            width: 12,
            height: 12,
            background: "var(--accent)",
            animation: "fokusSplashPulse 2s ease-in-out infinite",
          }}
        />
        <p
          className="font-display text-ink"
          style={{
            marginTop: 24,
            fontSize: 36,
            fontWeight: 500,
            letterSpacing: "-0.01em",
            lineHeight: 1,
          }}
        >
          fokus.
        </p>
        <p
          className="text-center italic text-ink-secondary"
          style={{
            marginTop: 16,
            fontSize: 17,
            fontWeight: 400,
            lineHeight: 1.5,
          }}
        >
          ten minutes a day,
          <br />
          with your child.
        </p>
        <style jsx global>{`
          @keyframes fokusSplashPulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(0.85); }
          }
        `}</style>
      </div>
    </>
  );
}
