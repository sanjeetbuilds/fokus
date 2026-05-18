"use client";

import { useEffect, useState, type ReactNode } from "react";

const SESSION_KEY = "fokus_splash_shown";
const HOLD_MS = 2500;
const FADE_MS = 250;

/**
 * Cold-open splash. On first render in this browser-session, takes over
 * the screen for HOLD_MS (2.5s) then fades out over FADE_MS (250ms).
 * The flag is set in sessionStorage so warm reloads skip the splash.
 *
 * Routing is left to OnboardingGate which is mounted underneath: by the
 * time the splash fades away, the user is already where they should be.
 */
export default function SplashGate({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<"checking" | "showing" | "fading" | "gone">(
    "checking",
  );

  useEffect(() => {
    // SSR-safe access — only run in the browser.
    if (typeof window === "undefined") {
      setPhase("gone");
      return;
    }
    let alreadyShown = false;
    try {
      alreadyShown = window.sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {
      // sessionStorage can throw in private mode; fall through to show.
    }
    if (alreadyShown) {
      setPhase("gone");
      return;
    }
    try {
      window.sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      // ignore
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

  return (
    <>
      {children}
      {phase === "showing" || phase === "fading" ? (
        <div
          aria-hidden={phase === "fading"}
          role="status"
          aria-label="Loading Fokus"
          className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-bg"
          style={{
            opacity: phase === "fading" ? 0 : 1,
            transition: `opacity ${FADE_MS}ms ease-out`,
            pointerEvents: phase === "fading" ? "none" : "auto",
          }}
        >
          <span
            aria-hidden
            className="h-3 w-3 rounded-full bg-accent"
            style={{ animation: "fokusPulse 2s ease-in-out infinite" }}
          />
          <p
            className="mt-6 font-display text-[36px] font-medium text-ink"
            style={{ letterSpacing: "-0.01em", lineHeight: 1 }}
          >
            fokus.
          </p>
          <p
            className="mt-4 text-center text-[17px] italic text-ink-secondary"
            style={{ lineHeight: 1.5 }}
          >
            ten minutes a day,
            <br />
            with your child.
          </p>
          <style jsx global>{`
            @keyframes fokusPulse {
              0%,
              100% {
                transform: scale(1);
              }
              50% {
                transform: scale(0.85);
              }
            }
          `}</style>
        </div>
      ) : null}
    </>
  );
}
