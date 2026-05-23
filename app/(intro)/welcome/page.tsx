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

const STORAGE_KEY = "fokus_intro_step";
const SCREEN_COUNT = 4;
const INK = "#252630";
const ACCENT = "#9CA5FF";
const MUTED = "#8E8D9B";
const TERTIARY = "#C2C0CB";
const DOT_INACTIVE = "#E0DED8";

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
      /* private browsing */
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
      /* private browsing */
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
            {step === 0 ? (
              <SplashScreen onContinue={next} />
            ) : (
              <IntroScreen
                step={step}
                config={INTROS[step - 1]!}
                onContinue={step === SCREEN_COUNT - 1 ? goSignIn : next}
                onSkip={() => advanceTo(SCREEN_COUNT - 1, 1)}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </main>
  );
}

const SHELL_STYLE: CSSProperties = {
  position: "relative",
  minHeight: "100dvh",
  background: "#FFFFFF",
  color: INK,
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  overflow: "hidden",
};

const CONTAINER_STYLE: CSSProperties = {
  minHeight: "100dvh",
  display: "flex",
  flexDirection: "column",
  paddingLeft: 24,
  paddingRight: 24,
  paddingTop: "max(48px, env(safe-area-inset-top))",
  paddingBottom: "max(24px, env(safe-area-inset-bottom))",
  background: "#FFFFFF",
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  overflow: "hidden",
};

function Wordmark() {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "baseline",
        fontSize: 15,
        fontWeight: 800,
        color: INK,
        letterSpacing: "-0.035em",
        lineHeight: 1,
        flexShrink: 0,
      }}
    >
      fokus
      <span
        aria-hidden
        style={{
          width: 4,
          height: 4,
          borderRadius: "50%",
          background: ACCENT,
          marginLeft: 1.5,
          transform: "translateY(-1px)",
          display: "inline-block",
        }}
      />
    </div>
  );
}

function Dots({
  total,
  active,
}: {
  total: number;
  active: number;
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: 5,
        justifyContent: "center",
        marginBottom: 14,
        flexShrink: 0,
      }}
    >
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          style={{
            width: i === active ? 18 : 6,
            height: 6,
            borderRadius: i === active ? 3 : "50%",
            background: i === active ? INK : DOT_INACTIVE,
            flexShrink: 0,
            transition: "all 200ms ease",
          }}
        />
      ))}
    </div>
  );
}

function PrimaryButton({
  onClick,
  label,
  disabled,
}: {
  onClick: () => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        background: INK,
        opacity: disabled ? 0.35 : 1,
        borderRadius: 999,
        padding: 15,
        textAlign: "center",
        fontSize: 14,
        fontWeight: 700,
        color: "#FFFFFF",
        flexShrink: 0,
        letterSpacing: "-0.01em",
        border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        width: "100%",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
      className="transition-opacity active:opacity-90"
    >
      {label}
    </button>
  );
}

function SplashScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <div style={CONTAINER_STYLE}>
      <Wordmark />
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          paddingBottom: 32,
        }}
      >
        <div
          style={{
            fontSize: 52,
            fontWeight: 800,
            color: INK,
            letterSpacing: "-0.04em",
            lineHeight: 1,
            textAlign: "center",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          fokus<span style={{ color: ACCENT }}>.</span>
        </div>
        <div
          style={{
            fontSize: 15,
            color: MUTED,
            marginTop: 12,
            textAlign: "center",
            lineHeight: 1.5,
          }}
        >
          ten minutes a day,
          <br />
          with your child.
        </div>
      </div>
      <Dots total={SCREEN_COUNT} active={0} />
      <PrimaryButton onClick={onContinue} label="Continue" />
    </div>
  );
}

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
    iconColor: "#4040B8",
    circleBg: "#EEEDFE",
    blob: "rgba(156,165,255,0.12)",
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
    circleBg: "#FFF6DC",
    blob: "rgba(244,200,74,0.12)",
    headline: (
      <>
        Ten minutes. <span style={{ color: ACCENT }}>One activity.</span>{" "}
        Every day.
      </>
    ),
    subhead:
      "No screens for your child. No scores. Just you and them, ten minutes, the right small thing.",
  },
  {
    icon: IconSparkles,
    iconColor: "#943200",
    circleBg: "#FCEEE8",
    blob: "rgba(232,128,107,0.12)",
    headline: (
      <>
        Nine skills.{" "}
        <span style={{ color: ACCENT }}>72 activities</span> to do together.
      </>
    ),
    subhead:
      "Curiosity, resilience, perspective, emotional awareness, and more. Built between ages 5 and 10.",
  },
];

function IntroScreen({
  step,
  config,
  onContinue,
  onSkip,
}: {
  step: number;
  config: IntroConfig;
  onContinue: () => void;
  onSkip: () => void;
}) {
  const Icon = config.icon;
  const isLast = step === SCREEN_COUNT - 1;
  return (
    <div style={CONTAINER_STYLE}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        <Wordmark />
        {!isLast ? (
          <button
            type="button"
            onClick={onSkip}
            style={{
              fontSize: 13,
              color: TERTIARY,
              fontWeight: 500,
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px 0",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            Skip
          </button>
        ) : null}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "32px 0 24px",
          position: "relative",
          height: 80,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: config.blob,
          }}
        />
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            zIndex: 2,
            background: config.circleBg,
            flexShrink: 0,
            color: config.iconColor,
          }}
        >
          <Icon size={26} stroke={2} aria-hidden />
        </div>
      </div>

      <div
        style={{
          fontSize: 26,
          fontWeight: 800,
          color: INK,
          lineHeight: 1.12,
          letterSpacing: "-0.028em",
          textAlign: "center",
        }}
      >
        {config.headline}
      </div>
      <div
        style={{
          fontSize: 14,
          color: MUTED,
          lineHeight: 1.55,
          textAlign: "center",
          marginTop: 10,
        }}
      >
        {config.subhead}
      </div>

      <div style={{ flex: 1 }} />
      <Dots total={SCREEN_COUNT} active={step} />
      <PrimaryButton
        onClick={onContinue}
        label={isLast ? "Get started" : "Continue"}
      />
    </div>
  );
}
