"use client";

import { useEffect, useState, type ReactNode } from "react";

import Wordmark from "@/components/shared/Wordmark";

const SESSION_KEY = "fokus_splash_shown";
const HOLD_MS = 2500;
const FADE_MS = 250;

/**
 * Cold-open splash. White background, brand mark sitting slightly
 * above the vertical centre (35vh top padding so it falls at roughly
 * 40% of the viewport), with the tagline in a calm regular-weight
 * gray below it. Holds HOLD_MS, fades for FADE_MS, then unmounts.
 * Per-session via sessionStorage so warm reloads skip it.
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
        className="fixed inset-0 z-[60] flex flex-col items-center bg-bg"
        style={{
          opacity: phase === "fading" ? 0 : 1,
          transition: `opacity ${FADE_MS}ms ease-out`,
          pointerEvents: phase === "fading" ? "none" : "auto",
          paddingTop: "35vh",
        }}
      >
        <Wordmark size="xl" />
        <p
          style={{
            marginTop: 16,
            fontSize: 16,
            fontWeight: 400,
            fontStyle: "normal",
            color: "#8E8D9B",
            lineHeight: 1.5,
            letterSpacing: 0,
            textAlign: "center",
          }}
        >
          ten minutes a day,
          <br />
          with your child.
        </p>
      </div>
    </>
  );
}
