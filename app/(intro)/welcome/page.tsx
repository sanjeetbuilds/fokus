"use client";

import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import {
  IconClock,
  IconSchool,
  IconSparkles,
  type IconProps,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import {
  type ComponentType,
  type CSSProperties,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import Wordmark from "@/components/shared/Wordmark";

const STORAGE_KEY = "fokus_intro_step";
const SCREEN_COUNT = 4;
const INK = "#252630";
const ACCENT = "#9CA5FF";
const MUTED = "#8E8D9B";

/**
 * Unauthenticated entry point. Four screens on a shared white canvas:
 *
 *   0  Splash      wordmark hero + "Continue"
 *   1  Intro 1     school icon, "easy to measure"
 *   2  Intro 2     clock icon, "One activity. Every day."
 *   3  Intro 3     sparkles icon, "72 small things"
 *
 * URL stays /welcome through all four; back gesture cycles via
 * history.pushState. Get Started on intro 3 routes to /sign-in.
 *
 * Layout shape (every screen):
 *   Section 1   header (wordmark)
 *   Section 2   content block (margin-top 48; flex 0)
 *   Section 3   flex:1 spacer
 *   Section 4   bottom actions (dots + button; flex 0)
 *
 * Container uses min-height 100dvh so the bottom actions track the
 * keyboard on the email screen (this page never opens the keyboard,
 * but keeps the same Frame so the layout reads consistently).
 */
export default function WelcomePage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
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
    setStep(restored);
    setHydrated(true);
    if (typeof window !== "undefined") {
      window.history.replaceState({ introStep: restored }, "");
    }
    const onPopState = (e: PopStateEvent) => {
      const next = (e.state as { introStep?: number } | null)?.introStep;
      if (typeof next === "number" && next >= 0 && next < SCREEN_COUNT) {
        setDirection(-1);
        setStep(next);
      }
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      sessionStorage.setItem(STORAGE_KEY, String(step));
    } catch {
      /* private browsing; harmless */
    }
  }, [step, hydrated]);

  const advanceTo = useCallback(
    (next: number, dir: 1 | -1) => {
      if (next === step) return;
      if (next < 0 || next >= SCREEN_COUNT) return;
      setDirection(dir);
      setStep(next);
      if (typeof window !== "undefined") {
        window.history.pushState({ introStep: next }, "");
      }
    },
    [step],
  );

  const next = useCallback(() => {
    advanceTo(Math.min(step + 1, SCREEN_COUNT - 1), 1);
  }, [advanceTo, step]);

  const goSignIn = useCallback(() => {
    if (guardedRef.current) return;
    guardedRef.current = true;
    router.push("/sign-in");
  }, [router]);

  const onDragEnd = useCallback(
    (_e: unknown, info: PanInfo) => {
      const dx = info.offset.x;
      const vx = info.velocity.x;
      if (dx < -50 || vx < -400) {
        if (step < SCREEN_COUNT - 1) next();
        else goSignIn();
      } else if ((dx > 50 || vx > 400) && step > 0) {
        if (typeof window !== "undefined") window.history.back();
      }
    },
    [goSignIn, next, step],
  );

  if (!hydrated) {
    return <main style={SHELL_STYLE} />;
  }

  return (
    <main style={SHELL_STYLE}>
      <motion.div
        drag="x"
        dragDirectionLock
        dragElastic={0.18}
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={onDragEnd}
        style={{ touchAction: "pan-y", minHeight: "100dvh" }}
      >
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div
            key={step}
            custom={direction}
            initial={{ x: direction * 32, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -direction * 32, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <Frame>
              <Header />
              {step === 0 ? (
                <SplashBody />
              ) : (
                <IntroBody config={INTROS[step - 1]!} />
              )}
              <Spacer />
              <BottomActions
                step={step}
                onPrimary={step === SCREEN_COUNT - 1 ? goSignIn : next}
                primaryLabel={
                  step === 0
                    ? "Continue"
                    : step === SCREEN_COUNT - 1
                      ? "Get started"
                      : "Continue"
                }
              />
            </Frame>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </main>
  );
}

// ============================================================
// Shared layout
// ============================================================

const SHELL_STYLE: CSSProperties = {
  position: "relative",
  minHeight: "100dvh",
  background: "#FFFFFF",
  color: INK,
  fontFamily: "var(--font-jakarta), 'Plus Jakarta Sans', sans-serif",
  overflow: "hidden",
};

function Frame({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        minHeight: "100dvh",
        paddingLeft: 24,
        paddingRight: 24,
        paddingTop:
          "max(48px, calc(env(safe-area-inset-top, 0px) + 24px))",
        paddingBottom:
          "max(32px, calc(env(safe-area-inset-bottom, 0px) + 16px))",
      }}
    >
      {children}
    </div>
  );
}

function Header() {
  return <Wordmark size="sm" />;
}

function Spacer() {
  return <div style={{ flex: 1, minHeight: 24 }} />;
}

function BottomActions({
  step,
  onPrimary,
  primaryLabel,
}: {
  step: number;
  onPrimary: () => void;
  primaryLabel: string;
}) {
  return (
    <div style={{ flex: 0 }}>
      <Dots active={step} />
      <div style={{ marginTop: 16 }}>
        <PrimaryButton onClick={onPrimary}>{primaryLabel}</PrimaryButton>
      </div>
    </div>
  );
}

function Dots({ active }: { active: number }) {
  return (
    <ol
      aria-hidden
      style={{
        display: "flex",
        justifyContent: "center",
        gap: 6,
        listStyle: "none",
        padding: 0,
        margin: 0,
      }}
    >
      {Array.from({ length: SCREEN_COUNT }).map((_, i) => (
        <li
          key={i}
          style={{
            width: i === active ? 14 : 5,
            height: 5,
            borderRadius: 3,
            background: i === active ? INK : "#E5E3DA",
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
        padding: 16,
        fontSize: 15,
        fontWeight: 700,
        textAlign: "center",
        border: "none",
        cursor: "pointer",
        fontFamily:
          "var(--font-jakarta), 'Plus Jakarta Sans', sans-serif",
      }}
      className="transition-opacity active:opacity-90"
    >
      {children}
    </button>
  );
}

// ============================================================
// Screen 0 Splash body (content only; Header + BottomActions live
// in the parent Frame so the layout shape is identical to intros)
// ============================================================

function SplashBody() {
  return (
    <div style={{ marginTop: 48, flex: 0, textAlign: "center" }}>
      <div style={{ display: "inline-flex" }}>
        <Wordmark size="xl" />
      </div>
      <p
        style={{
          marginTop: 16,
          fontSize: 16,
          fontWeight: 400,
          color: MUTED,
          lineHeight: 1.5,
        }}
      >
        ten minutes a day,
        <br />
        with your child.
      </p>
    </div>
  );
}

// ============================================================
// Intro screens (1, 2, 3)
// ============================================================

interface IntroConfig {
  icon: ComponentType<IconProps>;
  iconColor: string;
  circleBg: string;
  blob: string;
  headline: ReactNode;
  subhead: string;
}

const INTROS: IntroConfig[] = [
  {
    icon: IconSchool,
    iconColor: "#4B5EA6",
    circleBg: "#EEF0FF",
    blob: "rgba(156,165,255,0.15)",
    headline: (
      <>
        Schools measure what&apos;s{" "}
        <span style={{ color: ACCENT }}>easy to measure.</span>
      </>
    ),
    subhead:
      "Marks. Behaviour. Speed. None of which build the things that actually matter for your child's future.",
  },
  {
    icon: IconClock,
    iconColor: "#8A6200",
    circleBg: "#FFF8E7",
    blob: "rgba(244,200,74,0.15)",
    headline: (
      <>
        Ten minutes.{" "}
        <span style={{ color: ACCENT }}>One activity.</span>{" "}
        Every day.
      </>
    ),
    subhead:
      "No screens for your child. No scores. Just you and them, ten minutes, the right small thing.",
  },
  {
    icon: IconSparkles,
    iconColor: "#943200",
    circleBg: "#FFF0EB",
    blob: "rgba(232,128,107,0.15)",
    headline: (
      <>
        Nine skills.{" "}
        <span style={{ color: ACCENT }}>72 small things</span>{" "}
        to do together.
      </>
    ),
    subhead:
      "Curiosity, resilience, perspective, emotional awareness, and more. Built between ages 5 and 10.",
  },
];

function IntroBody({ config }: { config: IntroConfig }) {
  const Icon = config.icon;
  return (
    <div
      style={{
        marginTop: 48,
        flex: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      {/* Icon zone: 80x80 wrapper, blob same size sitting behind a
          56 solid circle. Clean edge guaranteed by the inner solid
          background. */}
      <div
        style={{
          position: "relative",
          width: 80,
          height: 80,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 24,
        }}
      >
        <span
          aria-hidden
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: config.blob,
            zIndex: 0,
          }}
        />
        <span
          aria-hidden
          style={{
            position: "relative",
            zIndex: 1,
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: config.circleBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: config.iconColor,
          }}
        >
          <Icon size={24} stroke={2} aria-hidden />
        </span>
      </div>

      <h1
        style={{
          fontSize: 26,
          fontWeight: 800,
          color: INK,
          letterSpacing: "-0.025em",
          lineHeight: 1.15,
          maxWidth: 280,
        }}
      >
        {config.headline}
      </h1>
      <p
        style={{
          marginTop: 12,
          fontSize: 14,
          fontWeight: 400,
          color: MUTED,
          lineHeight: 1.55,
          maxWidth: 260,
        }}
      >
        {config.subhead}
      </p>
    </div>
  );
}
