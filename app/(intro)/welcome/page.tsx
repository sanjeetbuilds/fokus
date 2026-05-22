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

const TEAL_BG = "#1E4D5C";
const TEAL_ACCENT = "#7FE5D4";
const STORAGE_KEY = "fokus_welcome_screen";
const SCREEN_COUNT = 4;

/**
 * Unauthenticated entry point. Splash + two intro pages + final CTA on
 * a shared teal canvas with blob compositions. Internal state holds
 * which of the four screens is visible; the URL stays /welcome
 * throughout so the back gesture cycles through screens without leaving
 * the app.
 *
 * Routes out:
 *   "Get started" / "Create account"  →  /sign-in?new=true
 *   "I have an account"                →  /sign-in?return=true
 *   Skip                               →  jump to screen 4
 */
export default function WelcomePage() {
  const router = useRouter();
  const [currentScreen, setCurrentScreen] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const [direction, setDirection] = useState<1 | -1>(1);
  const guardedRef = useRef(false);

  // Restore on mount + seed history state for the back gesture.
  useEffect(() => {
    let restored = 0;
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw !== null) {
        const n = parseInt(raw, 10);
        if (Number.isInteger(n) && n >= 0 && n < SCREEN_COUNT) {
          restored = n;
        }
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
      const screen = (e.state as { welcomeScreen?: number } | null)?.welcomeScreen;
      if (typeof screen === "number" && screen >= 0 && screen < SCREEN_COUNT) {
        setDirection(-1);
        setCurrentScreen(screen);
      }
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  // Persist the screen index on each change so a refresh lands here.
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
      // Guard so a stray double-tap during the transition doesn't
      // fire twice and stack two history entries.
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
      // Threshold ~ 60px of horizontal travel or velocity > 400 in either
      // direction. Sufficient to feel intentional, low enough that small
      // swipes aren't ignored.
      const dx = info.offset.x;
      const vx = info.velocity.x;
      if (dx < -60 || vx < -400) {
        next();
      } else if (dx > 60 || vx > 400) {
        // Equivalent to browser back; pop a history entry so the popstate
        // listener restores the previous screen.
        if (currentScreen > 0 && typeof window !== "undefined") {
          window.history.back();
        }
      }
    },
    [currentScreen, next],
  );

  if (!hydrated) {
    // Render the teal background only on the server / first paint, so the
    // page never flashes white before sessionStorage is read.
    return (
      <main
        style={{
          minHeight: "100svh",
          background: TEAL_BG,
        }}
      />
    );
  }

  return (
    <main
      style={{
        position: "relative",
        minHeight: "100svh",
        overflow: "hidden",
        background: TEAL_BG,
        color: "#FFFFFF",
        fontFamily: "var(--font-jakarta), 'Plus Jakarta Sans', sans-serif",
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
        <AnimatePresence
          mode="wait"
          custom={direction}
          initial={false}
        >
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
            })}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </main>
  );
}

// ============================================================
// Per-screen rendering
// ============================================================

interface ScreenHandlers {
  onGetStarted: () => void;
  onIHaveAccount: () => void;
  onNext: () => void;
  onSkip: () => void;
}

function renderScreen(index: number, h: ScreenHandlers) {
  switch (index) {
    case 0:
      return <SplashScreen handlers={h} />;
    case 1:
      return <IntroScreen1 handlers={h} />;
    case 2:
      return <IntroScreen2 handlers={h} />;
    default:
      return <FinalScreen handlers={h} />;
  }
}

// ----- Shared chrome ------------------------------------------------

function Wordmark() {
  return (
    <p
      style={{
        fontSize: 14,
        fontWeight: 800,
        color: "rgba(255,255,255,0.75)",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
      }}
    >
      Fokus
    </p>
  );
}

function Headline({
  before,
  accent,
  after,
}: {
  before: string;
  accent: string;
  after?: string;
}) {
  return (
    <h1
      style={{
        fontSize: 40,
        fontWeight: 800,
        color: "#FFFFFF",
        lineHeight: 1.05,
        letterSpacing: "-0.025em",
      }}
    >
      {before}
      <br />
      <span style={{ color: TEAL_ACCENT }}>{accent}</span>
      {after ? (
        <>
          <br />
          {after}
        </>
      ) : null}
    </h1>
  );
}

function Subtitle({ children }: { children: ReactNode }) {
  return (
    <p
      style={{
        marginTop: 16,
        fontSize: 14,
        fontWeight: 400,
        color: "rgba(255,255,255,0.78)",
        lineHeight: 1.55,
        maxWidth: 280,
      }}
    >
      {children}
    </p>
  );
}

function Dots({ active }: { active: number }) {
  return (
    <ol
      aria-hidden
      style={{
        display: "flex",
        gap: 6,
        justifyContent: "center",
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
            background:
              i === active ? "#FFFFFF" : "rgba(255,255,255,0.3)",
            transition: "width 250ms ease-out, background 250ms ease-out",
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
        background: "#FFFFFF",
        color: TEAL_BG,
        borderRadius: 999,
        padding: "15px 16px",
        fontSize: 13,
        fontWeight: 700,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
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
        color: "#FFFFFF",
        borderRadius: 999,
        padding: "15px 16px",
        fontSize: 13,
        fontWeight: 700,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        border: "1.5px solid rgba(255,255,255,0.35)",
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
        background: "rgba(255,255,255,0.12)",
        color: "#FFFFFF",
        borderRadius: 999,
        padding: "11px 18px",
        fontSize: 13,
        fontWeight: 600,
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
        position: "absolute",
        top: "calc(env(safe-area-inset-top, 0px) + 32px)",
        right: 12,
        background: "transparent",
        border: "none",
        color: "rgba(255,255,255,0.6)",
        fontSize: 13,
        fontWeight: 500,
        padding: "8px 12px",
        cursor: "pointer",
      }}
      className="transition-opacity active:opacity-80"
    >
      Skip
    </button>
  );
}

function FooterPrivacy() {
  return (
    <p
      style={{
        marginTop: 14,
        textAlign: "center",
        fontSize: 11,
        fontWeight: 400,
        color: "rgba(255,255,255,0.5)",
        lineHeight: 1.5,
      }}
    >
      Your child&apos;s data stays private. Only you can see it.
    </p>
  );
}

const PAGE: CSSProperties = {
  position: "relative",
  zIndex: 1,
  display: "flex",
  flexDirection: "column",
  flex: 1,
  paddingTop: "calc(env(safe-area-inset-top, 0px) + 90px)",
  paddingLeft: 28,
  paddingRight: 28,
  paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 32px)",
  minHeight: "100svh",
};

// ----- Blobs --------------------------------------------------------

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
    <div
      aria-hidden
      style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }}
    >
      {items.map((b, i) => (
        <span
          key={i}
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
            filter: "blur(0px)",
          }}
        />
      ))}
    </div>
  );
}

const BLOBS_SPLASH: BlobConfig[] = [
  { w: 280, top: -60, right: -50, color: "rgba(95,184,176,0.32)" },
  { w: 210, top: -40, left: -60, color: "rgba(255,255,255,0.06)" },
  { w: 150, top: "38%", right: -40, color: "rgba(255,255,255,0.08)" },
  { w: 340, bottom: -100, left: -80, color: "rgba(93,200,122,0.16)" },
  { w: 100, bottom: 80, left: "40%", color: "rgba(255,255,255,0.07)" },
  { w: 70, top: "52%", left: -10, color: "rgba(127,229,212,0.25)" },
];

const BLOBS_INTRO1: BlobConfig[] = [
  { w: 260, bottom: -80, right: -60, color: "rgba(95,184,176,0.30)" },
  { w: 180, top: -40, right: -40, color: "rgba(255,255,255,0.08)" },
  { w: 300, top: -90, left: -90, color: "rgba(93,200,122,0.18)" },
  { w: 90, bottom: 100, left: -20, color: "rgba(127,229,212,0.28)" },
  { w: 110, top: "45%", left: "55%", color: "rgba(255,255,255,0.06)" },
];

const BLOBS_INTRO2: BlobConfig[] = [
  { w: 200, top: -50, right: -60, color: "rgba(127,229,212,0.30)" },
  { w: 160, top: "40%", left: -50, color: "rgba(255,255,255,0.08)" },
  { w: 320, bottom: -120, right: -80, color: "rgba(95,184,176,0.30)" },
  { w: 80, bottom: 120, left: 40, color: "rgba(93,200,122,0.20)" },
  { w: 100, top: 120, left: "55%", color: "rgba(255,255,255,0.06)" },
];

const BLOBS_FINAL: BlobConfig[] = [
  { w: 320, bottom: -100, left: -80, color: "rgba(93,200,122,0.20)" },
  { w: 220, top: -60, left: -40, color: "rgba(127,229,212,0.28)" },
  { w: 80, top: "44%", right: 12, color: "rgba(95,184,176,0.35)" },
  { w: 160, top: "60%", right: -50, color: "rgba(255,255,255,0.07)" },
  { w: 90, bottom: 60, left: "55%", color: "rgba(255,255,255,0.06)" },
];

// ----- Screen 0 (Splash) --------------------------------------------

function SplashScreen({ handlers }: { handlers: ScreenHandlers }) {
  return (
    <>
      <Blobs items={BLOBS_SPLASH} />
      <div style={PAGE}>
        <Wordmark />
        <div style={{ marginTop: 30 }}>
          <Headline
            before="Ten minutes a day,"
            accent="with your child."
          />
        </div>
        <Subtitle>The skills school doesn&apos;t teach.</Subtitle>
        <span aria-hidden style={{ flex: 1, minHeight: 16 }} />
        <Dots active={0} />
        <div
          style={{
            marginTop: 16,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <PrimaryButton onClick={handlers.onGetStarted}>
            Get started
          </PrimaryButton>
          <SecondaryButton onClick={handlers.onIHaveAccount}>
            I have an account
          </SecondaryButton>
        </div>
        <FooterPrivacy />
      </div>
    </>
  );
}

// ----- Screen 1 (Intro 1) -------------------------------------------

function IntroScreen1({ handlers }: { handlers: ScreenHandlers }) {
  return (
    <>
      <Blobs items={BLOBS_INTRO1} />
      <SkipLink onClick={handlers.onSkip} />
      <div style={PAGE}>
        <Wordmark />
        <div style={{ marginTop: 30 }}>
          <Headline
            before="Schools measure what's"
            accent="easy to measure."
          />
        </div>
        <Subtitle>
          Marks. Behaviour. Speed. None of which build the things that
          actually matter for your child&apos;s future.
        </Subtitle>
        <span aria-hidden style={{ flex: 1, minHeight: 16 }} />
        <Dots active={1} />
        <div
          style={{
            marginTop: 16,
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <InlineNextButton onClick={handlers.onNext} />
        </div>
      </div>
    </>
  );
}

// ----- Screen 2 (Intro 2) -------------------------------------------

function IntroScreen2({ handlers }: { handlers: ScreenHandlers }) {
  return (
    <>
      <Blobs items={BLOBS_INTRO2} />
      <SkipLink onClick={handlers.onSkip} />
      <div style={PAGE}>
        <Wordmark />
        <div style={{ marginTop: 30 }}>
          <Headline before="Built between" accent="ages 5 and 15." />
        </div>
        <Subtitle>
          Critical thinking, resilience, curiosity, the ability to lose
          without breaking. These aren&apos;t taught anywhere. They&apos;re
          built at home, in small moments.
        </Subtitle>
        <span aria-hidden style={{ flex: 1, minHeight: 16 }} />
        <Dots active={2} />
        <div
          style={{
            marginTop: 16,
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <InlineNextButton onClick={handlers.onNext} />
        </div>
      </div>
    </>
  );
}

// ----- Screen 3 (Final CTA) -----------------------------------------

function FinalScreen({ handlers }: { handlers: ScreenHandlers }) {
  return (
    <>
      <Blobs items={BLOBS_FINAL} />
      <div style={PAGE}>
        <Wordmark />
        <div style={{ marginTop: 30 }}>
          <Headline before="One small thing." accent="Every day." />
        </div>
        <Subtitle>
          No screens for your child. No scores. Just you and them, ten
          minutes, the right small thing.
        </Subtitle>
        <span aria-hidden style={{ flex: 1, minHeight: 16 }} />
        <Dots active={3} />
        <div
          style={{
            marginTop: 16,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <PrimaryButton onClick={handlers.onGetStarted}>
            Create account
          </PrimaryButton>
          <SecondaryButton onClick={handlers.onIHaveAccount}>
            I have an account
          </SecondaryButton>
        </div>
        <FooterPrivacy />
      </div>
    </>
  );
}
