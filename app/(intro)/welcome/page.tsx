"use client";

import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  type CSSProperties,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import Wordmark from "@/components/shared/Wordmark";

const STORAGE_KEY = "fokus_welcome_screen";
const SCREEN_COUNT = 4;
const INK = "#252630";
const ACCENT = "#9CA5FF";
const MUTED = "#8E8D9B";
const HAIR = "#E5E3DA";
const TERTIARY = "#C2C0CB";

/**
 * Unauthenticated entry point. Four screens on a shared white canvas:
 *
 *   0  Splash: blob-canopied hero with the xl wordmark + Get started
 *   1  Intro 1: "Schools measure what's easy to measure."
 *   2  Intro 2: "Built between ages 5 and 15."
 *   3  Final CTA: Create account / I have an account
 *
 * URL stays /welcome through all four. Back gesture + history.pushState
 * cycles backwards through screens without leaving the route.
 */
export default function WelcomePage() {
  const router = useRouter();
  const [currentScreen, setCurrentScreen] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const [direction, setDirection] = useState<1 | -1>(1);
  const guardedRef = useRef(false);

  useEffect(() => {
    let restored = 0;
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw !== null) {
        const n = parseInt(raw, 10);
        if (Number.isInteger(n) && n >= 0 && n < SCREEN_COUNT) restored = n;
      }
    } catch {
      /* private browsing; harmless */
    }
    setCurrentScreen(restored);
    setHydrated(true);

    if (typeof window !== "undefined") {
      window.history.replaceState({ welcomeScreen: restored }, "");
    }

    const onPopState = (e: PopStateEvent) => {
      const screen = (e.state as { welcomeScreen?: number } | null)
        ?.welcomeScreen;
      if (typeof screen === "number" && screen >= 0 && screen < SCREEN_COUNT) {
        setDirection(-1);
        setCurrentScreen(screen);
      }
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      sessionStorage.setItem(STORAGE_KEY, String(currentScreen));
    } catch {
      /* private browsing; harmless */
    }
  }, [currentScreen, hydrated]);

  const advanceTo = useCallback(
    (next: number, dir: 1 | -1) => {
      if (next === currentScreen) return;
      if (next < 0 || next >= SCREEN_COUNT) return;
      setDirection(dir);
      setCurrentScreen(next);
      if (typeof window !== "undefined") {
        window.history.pushState({ welcomeScreen: next }, "");
      }
    },
    [currentScreen],
  );

  const next = useCallback(() => {
    advanceTo(Math.min(currentScreen + 1, SCREEN_COUNT - 1), 1);
  }, [advanceTo, currentScreen]);

  const skip = useCallback(() => {
    advanceTo(SCREEN_COUNT - 1, 1);
  }, [advanceTo]);

  const goSignIn = useCallback(
    (variant: "return" | "new") => {
      if (guardedRef.current) return;
      guardedRef.current = true;
      router.push(
        variant === "return" ? "/sign-in?return=true" : "/sign-in?new=true",
      );
    },
    [router],
  );

  const onDragEnd = useCallback(
    (_e: unknown, info: PanInfo) => {
      const dx = info.offset.x;
      const vx = info.velocity.x;
      if (dx < -50 || vx < -400) {
        next();
      } else if ((dx > 50 || vx > 400) && currentScreen > 0) {
        if (typeof window !== "undefined") window.history.back();
      }
    },
    [currentScreen, next],
  );

  if (!hydrated) {
    return (
      <main
        style={{ minHeight: "100svh", background: "#FFFFFF" }}
      />
    );
  }

  return (
    <main
      style={{
        position: "relative",
        minHeight: "100svh",
        background: "#FFFFFF",
        color: INK,
        fontFamily: "var(--font-jakarta), 'Plus Jakarta Sans', sans-serif",
        overflow: "hidden",
      }}
    >
      <motion.div
        drag="x"
        dragDirectionLock
        dragElastic={0.18}
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={onDragEnd}
        style={{
          position: "relative",
          minHeight: "100svh",
          touchAction: "pan-y",
        }}
      >
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div
            key={currentScreen}
            custom={direction}
            initial={{ x: direction * 32, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -direction * 32, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: "relative",
              minHeight: "100svh",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {renderScreen(currentScreen, {
              onGetStarted: () => goSignIn("new"),
              onIHaveAccount: () => goSignIn("return"),
              onNext: next,
              onSkip: skip,
              onAdvance: next,
            })}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </main>
  );
}

// ============================================================
// Screen plumbing
// ============================================================

interface ScreenHandlers {
  onGetStarted: () => void;
  onIHaveAccount: () => void;
  onNext: () => void;
  onSkip: () => void;
  onAdvance: () => void;
}

function renderScreen(index: number, h: ScreenHandlers) {
  switch (index) {
    case 0:
      return <SplashScreen handlers={h} />;
    case 1:
      return <Intro1Screen handlers={h} />;
    case 2:
      return <Intro2Screen handlers={h} />;
    default:
      return <FinalScreen handlers={h} />;
  }
}

// ============================================================
// Blob layer
// ============================================================

interface BlobConfig {
  w: number;
  h?: number;
  top?: number | string;
  right?: number | string;
  bottom?: number | string;
  left?: number | string;
  color: string;
}

function Blobs({ items }: { items: BlobConfig[] }) {
  return (
    <>
      {items.map((b, i) => (
        <span
          key={i}
          aria-hidden
          style={{
            position: "absolute",
            width: b.w,
            height: b.h ?? b.w,
            borderRadius: "50%",
            background: b.color,
            top: b.top,
            right: b.right,
            bottom: b.bottom,
            left: b.left,
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
      ))}
    </>
  );
}

// ============================================================
// Shared chrome
// ============================================================

const PAGE_FRAME: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  flex: 1,
  minHeight: "100svh",
  paddingLeft: 24,
  paddingRight: 24,
  paddingTop: "calc(env(safe-area-inset-top, 0px) + 0px)",
  paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 32px)",
};

function Dots({ active }: { active: number }) {
  return (
    <ol
      aria-hidden
      style={{
        display: "flex",
        justifyContent: "center",
        gap: 8,
        listStyle: "none",
        padding: 0,
        margin: 0,
      }}
    >
      {Array.from({ length: SCREEN_COUNT }).map((_, i) => (
        <li
          key={i}
          style={{
            width: i === active ? 20 : 7,
            height: 7,
            borderRadius: 999,
            background: i === active ? INK : TERTIARY,
            transition:
              "width 250ms ease-out, background 250ms ease-out",
          }}
        />
      ))}
    </ol>
  );
}

function PrimaryButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: "100%",
        background: INK,
        color: "#FFFFFF",
        borderRadius: 999,
        padding: "14px 20px",
        fontSize: 14,
        fontWeight: 700,
        letterSpacing: "0.04em",
        border: "none",
        cursor: "pointer",
      }}
      className="transition-opacity active:opacity-90"
    >
      {children}
    </button>
  );
}

function SecondaryButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: "100%",
        background: "transparent",
        color: INK,
        borderRadius: 999,
        padding: "14px 20px",
        fontSize: 14,
        fontWeight: 700,
        letterSpacing: "0.04em",
        border: `1.5px solid ${HAIR}`,
        cursor: "pointer",
      }}
      className="transition-opacity active:opacity-80"
    >
      {children}
    </button>
  );
}

function InlineNextButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        background: INK,
        color: "#FFFFFF",
        borderRadius: 999,
        padding: "11px 18px",
        fontSize: 14,
        fontWeight: 700,
        border: "none",
        cursor: "pointer",
      }}
      className="transition-opacity active:opacity-80"
    >
      Next
      <ArrowRight size={14} strokeWidth={2.25} aria-hidden />
    </button>
  );
}

function SkipLink({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: "transparent",
        border: "none",
        color: MUTED,
        fontSize: 13,
        fontWeight: 500,
        padding: "8px 0",
        cursor: "pointer",
      }}
      className="transition-opacity active:opacity-70"
    >
      Skip
    </button>
  );
}

function PrivacyFooter() {
  return (
    <p
      style={{
        marginTop: 12,
        textAlign: "center",
        fontSize: 11,
        fontWeight: 400,
        color: TERTIARY,
        lineHeight: 1.5,
      }}
    >
      Your child&apos;s data stays private. Only you can see it.
    </p>
  );
}

// ============================================================
// Blob compositions
// ============================================================

const BLOBS_SPLASH_HERO: BlobConfig[] = [
  { w: 200, top: 30, right: -50, color: "rgba(244,200,74,0.30)" },
  { w: 140, top: 80, left: -30, color: "rgba(232,164,184,0.30)" },
  { w: 110, bottom: 30, right: 40, color: "rgba(127,229,212,0.40)" },
  { w: 90, top: 160, left: 60, color: "rgba(156,165,255,0.35)" },
  { w: 70, bottom: 80, left: 30, color: "rgba(93,200,122,0.35)" },
];

const BLOBS_INTRO1_VISUAL: BlobConfig[] = [
  { w: 120, top: 0, right: -10, color: "rgba(244,200,74,0.18)" },
  { w: 90, top: 60, left: 20, color: "rgba(232,164,184,0.18)" },
  { w: 60, bottom: 10, right: 50, color: "rgba(127,229,212,0.25)" },
];

const BLOBS_INTRO2_VISUAL: BlobConfig[] = [
  { w: 140, top: 0, left: -10, color: "rgba(93,200,122,0.18)" },
  { w: 100, top: 50, right: 20, color: "rgba(156,165,255,0.22)" },
  { w: 70, bottom: 0, left: 40, color: "rgba(232,128,107,0.20)" },
];

const BLOBS_FINAL_HERO: BlobConfig[] = [
  { w: 130, top: 0, right: -10, color: "rgba(244,200,74,0.25)" },
  { w: 100, bottom: 0, left: -10, color: "rgba(127,229,212,0.30)" },
  { w: 80, top: 10, left: 30, color: "rgba(156,165,255,0.30)" },
  { w: 60, bottom: 20, right: 40, color: "rgba(93,200,122,0.30)" },
];

// ============================================================
// Screen 0 Splash
// ============================================================

function SplashScreen({ handlers }: { handlers: ScreenHandlers }) {
  return (
    <div style={PAGE_FRAME}>
      <span aria-hidden style={{ height: 60, flexShrink: 0 }} />

      {/* Wordmark hero zone */}
      <div
        style={{
          position: "relative",
          height: 280,
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        <Blobs items={BLOBS_SPLASH_HERO} />
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 5,
          }}
        >
          <Wordmark size="xl" />
        </div>
      </div>

      <h1
        style={{
          marginTop: 24,
          fontSize: 24,
          fontWeight: 800,
          color: INK,
          letterSpacing: "-0.025em",
          lineHeight: 1.15,
          textAlign: "center",
        }}
      >
        Ten minutes a day, with your child.
      </h1>
      <p
        style={{
          marginTop: 8,
          fontSize: 13,
          fontWeight: 400,
          color: MUTED,
          lineHeight: 1.5,
          textAlign: "center",
          maxWidth: 280,
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        The skills school doesn&apos;t teach. Built for parents of 5 to 10
        year olds.
      </p>

      <span aria-hidden style={{ flex: 1, minHeight: 24 }} />

      <Dots active={0} />
      <div style={{ marginTop: 20 }}>
        <PrimaryButton onClick={handlers.onAdvance}>
          Get started
        </PrimaryButton>
      </div>
    </div>
  );
}

// ============================================================
// Screen 1 Intro 1
// ============================================================

function Intro1Screen({ handlers }: { handlers: ScreenHandlers }) {
  return (
    <div style={PAGE_FRAME}>
      {/* Top zone: wordmark + skip */}
      <div
        style={{
          marginTop: "calc(env(safe-area-inset-top, 0px) + 40px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Wordmark size="md" />
        <SkipLink onClick={handlers.onSkip} />
      </div>

      <h1
        style={{
          marginTop: 60,
          fontSize: 30,
          fontWeight: 800,
          color: INK,
          letterSpacing: "-0.025em",
          lineHeight: 1.1,
        }}
      >
        Schools measure what&apos;s{" "}
        <span style={{ color: ACCENT }}>easy to measure.</span>
      </h1>
      <p
        style={{
          marginTop: 14,
          fontSize: 14,
          fontWeight: 400,
          color: MUTED,
          lineHeight: 1.55,
          maxWidth: 320,
        }}
      >
        Marks. Behaviour. Speed. None of which build the things that actually
        matter for your child&apos;s future.
      </p>

      {/* Visual zone */}
      <div
        style={{
          marginTop: 40,
          position: "relative",
          height: 200,
          overflow: "hidden",
        }}
      >
        <Blobs items={BLOBS_INTRO1_VISUAL} />
      </div>

      <span aria-hidden style={{ flex: 1, minHeight: 16 }} />

      <Dots active={1} />
      <div
        style={{
          marginTop: 20,
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <InlineNextButton onClick={handlers.onNext} />
      </div>
    </div>
  );
}

// ============================================================
// Screen 2 Intro 2
// ============================================================

function Intro2Screen({ handlers }: { handlers: ScreenHandlers }) {
  return (
    <div style={PAGE_FRAME}>
      <div
        style={{
          marginTop: "calc(env(safe-area-inset-top, 0px) + 40px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Wordmark size="md" />
        <SkipLink onClick={handlers.onSkip} />
      </div>

      <h1
        style={{
          marginTop: 60,
          fontSize: 30,
          fontWeight: 800,
          color: INK,
          letterSpacing: "-0.025em",
          lineHeight: 1.1,
        }}
      >
        Built between{" "}
        <span style={{ color: ACCENT }}>ages 5 and 15.</span>
      </h1>
      <p
        style={{
          marginTop: 14,
          fontSize: 14,
          fontWeight: 400,
          color: MUTED,
          lineHeight: 1.55,
          maxWidth: 320,
        }}
      >
        Critical thinking, resilience, curiosity, the ability to lose without
        breaking. These aren&apos;t taught anywhere. They&apos;re built at
        home, in small moments.
      </p>

      <div
        style={{
          marginTop: 40,
          position: "relative",
          height: 200,
          overflow: "hidden",
        }}
      >
        <Blobs items={BLOBS_INTRO2_VISUAL} />
      </div>

      <span aria-hidden style={{ flex: 1, minHeight: 16 }} />

      <Dots active={2} />
      <div
        style={{
          marginTop: 20,
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <InlineNextButton onClick={handlers.onNext} />
      </div>
    </div>
  );
}

// ============================================================
// Screen 3 Final CTA
// ============================================================

function FinalScreen({ handlers }: { handlers: ScreenHandlers }) {
  return (
    <div style={PAGE_FRAME}>
      {/* Top: wordmark centered, no skip */}
      <div
        style={{
          marginTop: "calc(env(safe-area-inset-top, 0px) + 40px)",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Wordmark size="md" />
      </div>

      {/* Visual hero zone with lg wordmark */}
      <div
        style={{
          marginTop: 50,
          position: "relative",
          height: 180,
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        <Blobs items={BLOBS_FINAL_HERO} />
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 5,
          }}
        >
          <Wordmark size="lg" />
        </div>
      </div>

      <h1
        style={{
          marginTop: 24,
          fontSize: 28,
          fontWeight: 800,
          color: INK,
          letterSpacing: "-0.025em",
          lineHeight: 1.15,
          textAlign: "center",
        }}
      >
        One small thing. <span style={{ color: ACCENT }}>Every day.</span>
      </h1>
      <p
        style={{
          marginTop: 12,
          fontSize: 13,
          fontWeight: 400,
          color: MUTED,
          lineHeight: 1.5,
          textAlign: "center",
          maxWidth: 280,
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        No screens for your child. No scores. Just you and them, ten minutes,
        the right small thing.
      </p>

      <span aria-hidden style={{ flex: 1, minHeight: 16 }} />

      <Dots active={3} />
      <div style={{ marginTop: 20 }}>
        <PrimaryButton onClick={handlers.onGetStarted}>
          Create account
        </PrimaryButton>
        <div style={{ marginTop: 10 }}>
          <SecondaryButton onClick={handlers.onIHaveAccount}>
            I have an account
          </SecondaryButton>
        </div>
      </div>
      <PrivacyFooter />
    </div>
  );
}
