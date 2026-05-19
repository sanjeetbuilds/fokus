"use client";

import { useEffect, useState, type ReactNode } from "react";

const SESSION_KEY = "fokus_splash_shown";
const MIN_HOLD_MS = 1600; // before tap-to-dismiss is allowed
const AUTO_DISMISS_MS = 5000; // hard cutoff
const EXIT_MS = 700;

/**
 * Cold-open splash, round-4 design. Dark background with three blurred
 * color blobs and a glass overlay, parent+child SVG illustration, eyebrow,
 * big "Fokus" wordmark, tagline, status pill, "tap anywhere" hint. The
 * splash exits with a slide-up animation that lasts EXIT_MS.
 *
 * Flag is sessionStorage so warm reloads skip the splash.
 */
export default function SplashGate({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<
    "checking" | "showing" | "exiting" | "gone"
  >("checking");
  const [canDismiss, setCanDismiss] = useState(false);

  useEffect(() => {
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
    const dismissTimer = window.setTimeout(
      () => setCanDismiss(true),
      MIN_HOLD_MS,
    );
    const autoTimer = window.setTimeout(
      () => setPhase("exiting"),
      AUTO_DISMISS_MS,
    );
    return () => {
      window.clearTimeout(dismissTimer);
      window.clearTimeout(autoTimer);
    };
  }, []);

  useEffect(() => {
    if (phase !== "exiting") return;
    const t = window.setTimeout(() => setPhase("gone"), EXIT_MS);
    return () => window.clearTimeout(t);
  }, [phase]);

  const dismiss = () => {
    if (!canDismiss || phase !== "showing") return;
    setPhase("exiting");
  };

  if (phase === "gone" || phase === "checking") {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      <div
        role="dialog"
        aria-label="Welcome to Fokus"
        onClick={dismiss}
        className="fixed inset-0 z-[60] flex items-center justify-center overflow-hidden bg-ink"
        style={{
          cursor: canDismiss ? "pointer" : "default",
          animation:
            phase === "exiting"
              ? `fokusSplashExit ${EXIT_MS}ms cubic-bezier(.76,0,.24,1) forwards`
              : undefined,
        }}
      >
        {/* Three blurred color blobs */}
        <span
          aria-hidden
          className="absolute rounded-full"
          style={{
            width: 300,
            height: 300,
            top: -90,
            left: -90,
            background: "rgba(156,165,255,0.78)",
            filter: "blur(55px)",
            animation: "fokusSplashBlob1 7s ease-in-out infinite",
          }}
        />
        <span
          aria-hidden
          className="absolute rounded-full"
          style={{
            width: 280,
            height: 280,
            top: -50,
            right: -80,
            background: "rgba(244,200,74,0.65)",
            filter: "blur(55px)",
            animation: "fokusSplashBlob2 8.5s ease-in-out infinite",
          }}
        />
        <span
          aria-hidden
          className="absolute rounded-full"
          style={{
            width: 320,
            height: 320,
            bottom: -110,
            left: 10,
            background: "rgba(232,131,106,0.62)",
            filter: "blur(55px)",
            animation: "fokusSplashBlob3 6s ease-in-out infinite",
          }}
        />
        {/* Glass overlay */}
        <span
          aria-hidden
          className="absolute inset-0"
          style={{
            background: "rgba(37,38,48,0.32)",
            backdropFilter: "blur(22px)",
            WebkitBackdropFilter: "blur(22px)",
          }}
        />

        <div className="relative z-10 flex flex-col items-center px-8 text-center">
          {/* Parent + child SVG */}
          <div
            className="mb-5"
            style={{ animation: "fokusSplashIllo 4.5s ease-in-out infinite" }}
          >
            <svg
              width="220"
              height="144"
              viewBox="0 0 220 144"
              fill="none"
              aria-hidden
            >
              <ellipse cx="110" cy="140" rx="88" ry="8" fill="rgba(255,255,255,0.06)" />
              <rect x="34" y="58" width="64" height="80" rx="32" fill="rgba(244,200,74,0.82)" />
              <circle cx="66" cy="34" r="28" fill="rgba(244,200,74,0.90)" />
              <defs>
                <clipPath id="splash-hc1">
                  <circle cx="66" cy="34" r="28" />
                </clipPath>
                <clipPath id="splash-hc2">
                  <circle cx="159" cy="50" r="21" />
                </clipPath>
              </defs>
              <path
                d="M40 26 Q66 6 92 26"
                fill="rgba(190,148,20,0.28)"
                clipPath="url(#splash-hc1)"
              />
              <path
                d="M96 86 Q114 80 124 94"
                stroke="rgba(244,200,74,0.72)"
                strokeWidth="19"
                strokeLinecap="round"
              />
              <circle cx="126" cy="94" r="26" fill="rgba(255,255,255,0.05)" />
              <circle cx="126" cy="94" r="16" fill="rgba(255,255,255,0.10)" />
              <circle cx="126" cy="94" r="9" fill="rgba(255,255,255,0.22)" />
              <circle cx="126" cy="94" r="4.5" fill="rgba(255,255,255,0.72)">
                <animate
                  attributeName="r"
                  values="4.5;7;4.5"
                  dur="2.8s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0.72;1;0.72"
                  dur="2.8s"
                  repeatCount="indefinite"
                />
              </circle>
              <line x1="126" y1="82" x2="126" y2="78" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="137" y1="85" x2="140" y2="82" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="115" y1="85" x2="112" y2="82" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" />
              <path
                d="M148 100 Q138 92 130 94"
                stroke="rgba(197,191,239,0.68)"
                strokeWidth="15"
                strokeLinecap="round"
              />
              <rect x="132" y="70" width="54" height="68" rx="27" fill="rgba(197,191,239,0.84)" />
              <circle cx="159" cy="50" r="21" fill="rgba(197,191,239,0.92)" />
              <path
                d="M139 42 Q159 26 179 42"
                fill="rgba(148,142,200,0.3)"
                clipPath="url(#splash-hc2)"
              />
            </svg>
          </div>

          <p
            className="mb-3 text-[11px] font-bold uppercase"
            style={{
              color: "rgba(255,255,255,0.35)",
              letterSpacing: "0.12em",
              animation: "fokusSplashFade 0.5s 0.5s ease both",
            }}
          >
            Parenting, reimagined
          </p>

          <p
            className="text-[64px] font-extrabold text-white"
            style={{
              letterSpacing: "-0.05em",
              lineHeight: 1,
              animation:
                "fokusSplashLogo 1s 0.7s cubic-bezier(.22,1,.36,1) both",
            }}
          >
            Fokus
          </p>

          <p
            className="mt-3 text-[16px] font-normal"
            style={{
              color: "rgba(255,255,255,0.45)",
              lineHeight: 1.55,
              animation: "fokusSplashFade 0.6s 1.1s ease both",
            }}
          >
            A calm companion for
            <br />
            the invisible moments that matter
          </p>

          <div
            className="mt-6 inline-flex items-center gap-1.5 rounded-full px-4 py-1.5"
            style={{
              background: "rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.6)",
              fontSize: 13,
              fontWeight: 600,
              animation: "fokusSplashFade 0.5s 1.4s ease both",
            }}
          >
            <span
              aria-hidden
              className="block h-[7px] w-[7px] rounded-full"
              style={{
                background: "var(--green)",
                animation: "fokusSplashPulse 1.5s ease-in-out infinite",
              }}
            />
            Zero pressure. All presence.
          </div>

          {canDismiss ? (
            <p
              className="mt-16 text-[12px] font-semibold uppercase"
              style={{
                color: "rgba(255,255,255,0.22)",
                letterSpacing: "0.06em",
                animation: "fokusSplashTap 2.8s ease-in-out infinite",
              }}
            >
              Tap anywhere to begin
            </p>
          ) : (
            <span aria-hidden className="mt-16 block h-[16px]" />
          )}
        </div>

        <style jsx global>{`
          @keyframes fokusSplashBlob1 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            50% { transform: translate(22px, 28px) scale(1.12); }
          }
          @keyframes fokusSplashBlob2 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            50% { transform: translate(-18px, 20px) scale(0.91); }
          }
          @keyframes fokusSplashBlob3 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            50% { transform: translate(25px, -22px) scale(1.08); }
          }
          @keyframes fokusSplashIllo {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-7px); }
          }
          @keyframes fokusSplashLogo {
            from { opacity: 0; filter: blur(18px); transform: translateY(22px); }
            to { opacity: 1; filter: blur(0); transform: translateY(0); }
          }
          @keyframes fokusSplashFade {
            from { opacity: 0; transform: translateY(12px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes fokusSplashTap {
            0%, 100% { opacity: 0.2; }
            50% { opacity: 0.6; }
          }
          @keyframes fokusSplashPulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.4); }
          }
          @keyframes fokusSplashExit {
            0% { transform: translateY(0); opacity: 1; }
            100% { transform: translateY(-100%); opacity: 0; }
          }
        `}</style>
      </div>
    </>
  );
}
