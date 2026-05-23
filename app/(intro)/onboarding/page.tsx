"use client";

import { useRouter } from "next/navigation";
import {
  type ReactNode,
  useCallback,
  useMemo,
  useState,
} from "react";

import Wordmark from "@/components/shared/Wordmark";
import { useToast } from "@/components/ui/Toast";
import { insertChild } from "@/lib/supabase/queries";
import { primeChildCache } from "@/lib/use-child";
import { ageFromDob } from "@/lib/utils/dates";

/**
 * Onboarding; three steps with their own progress dots.
 *
 *   1. name       just the child's name. A "Signed in" badge sits next
 *                 to the wordmark so the user knows they're past the
 *                 email gate.
 *   2. dob        date picker with the age helper.
 *   3. pronouns   she / he / they radio.
 *
 * Submission still happens once on the pronouns step, dropping a row
 * into public.child for the signed-in parent.
 */
const MIN_AGE = 4;
const MAX_AGE = 12;
const INK = "#252630";
const ACCENT = "#9CA5FF";
const MUTED = "#8E8D9B";
const HAIR = "#E5E3DA";
const TINT_FILL = "#F7F7F5";

const PRONOUNS_OPTIONS: { value: Pronouns; label: string; helper: string }[] = [
  { value: "she", label: "She / her", helper: "Refer to your child with she/her." },
  { value: "he", label: "He / him", helper: "Refer to your child with he/him." },
  { value: "they", label: "They / them", helper: "Refer to your child with they/them." },
];

type Step = "name" | "dob" | "pronouns";
type Pronouns = "she" | "he" | "they";

export default function OnboardingPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [step, setStep] = useState<Step>("name");
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [pronouns, setPronouns] = useState<Pronouns>("they");
  const [busy, setBusy] = useState(false);

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const minDob = useMemo(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 20);
    return d.toISOString().slice(0, 10);
  }, []);

  const ageInfo = useMemo(() => ageFromDob(dob), [dob]);
  const ageError = useMemo(() => {
    if (!dob) return null;
    if (!ageInfo) return "Pick a date in the past.";
    if (ageInfo.years < MIN_AGE || ageInfo.years > MAX_AGE) {
      return "Fokus works best for kids 5 to 10.";
    }
    return null;
  }, [ageInfo, dob]);

  const trimmed = name.trim();
  const nameValid = trimmed.length > 0;
  const dobValid =
    dob.length > 0 && ageInfo !== null && ageError === null;

  const helperText = useMemo(() => {
    if (!dob) return "Used to pick age-appropriate activities.";
    if (!ageInfo) return "Pick a date in the past.";
    return formatAgeHelper(ageInfo);
  }, [ageInfo, dob]);

  const stepIndex: number =
    step === "name" ? 0 : step === "dob" ? 1 : 2;

  const onSubmit = useCallback(async () => {
    if (busy || !nameValid || !dobValid) return;
    setBusy(true);
    try {
      const row = await insertChild({ name: trimmed, dob, pronouns });
      primeChildCache(row);
      try {
        window.sessionStorage.setItem("show_welcome_modal", "true");
      } catch {
        /* private browsing; modal just won't show */
      }
      router.replace("/today");
    } catch (err) {
      console.error("[/onboarding] insertChild:", err);
      toast("Couldn't save. Try again.", { tone: "danger" });
      setBusy(false);
    }
  }, [busy, dob, dobValid, nameValid, pronouns, router, toast, trimmed]);

  return (
    <main
      style={{
        position: "relative",
        minHeight: "100dvh",
        background: "#FFFFFF",
        color: INK,
        fontFamily: "var(--font-jakarta), 'Plus Jakarta Sans', sans-serif",
        overflow: "hidden",
      }}
    >
      <div
        style={{
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
        <Header showSignedIn={step === "name"} />

        {step === "name" ? (
          <NameStep
            name={name}
            setName={setName}
            valid={nameValid}
            onContinue={() => setStep("dob")}
            stepIndex={stepIndex}
          />
        ) : step === "dob" ? (
          <DobStep
            dob={dob}
            setDob={setDob}
            minDob={minDob}
            today={today}
            ageError={ageError}
            helperText={helperText}
            valid={dobValid}
            onBack={() => setStep("name")}
            onContinue={() => setStep("pronouns")}
            stepIndex={stepIndex}
          />
        ) : (
          <PronounsStep
            name={trimmed}
            value={pronouns}
            onChange={setPronouns}
            busy={busy}
            onBack={() => setStep("dob")}
            onSubmit={onSubmit}
            stepIndex={stepIndex}
          />
        )}
      </div>
    </main>
  );
}

// ============================================================
// Header (wordmark + optional "Signed in" badge)
// ============================================================

function Header({ showSignedIn }: { showSignedIn: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 24,
      }}
    >
      <Wordmark size="sm" />
      {showSignedIn ? (
        <span
          style={{
            background: "#E8F9EE",
            color: "#5DC87A",
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            padding: "3px 8px",
            borderRadius: 999,
          }}
        >
          Signed in
        </span>
      ) : null}
    </div>
  );
}

// ============================================================
// Step 1; Name
// ============================================================

function NameStep({
  name,
  setName,
  valid,
  onContinue,
  stepIndex,
}: {
  name: string;
  setName: (v: string) => void;
  valid: boolean;
  onContinue: () => void;
  stepIndex: number;
}) {
  return (
    <>
      <h1
        style={{
          marginTop: 48,
          fontSize: 24,
          fontWeight: 800,
          color: INK,
          letterSpacing: "-0.025em",
          lineHeight: 1.15,
        }}
      >
        You&apos;re in. Let&apos;s set up{" "}
        <span style={{ color: ACCENT }}>your child.</span>
      </h1>
      <p
        style={{
          marginTop: 10,
          fontSize: 11,
          fontWeight: 400,
          color: MUTED,
          lineHeight: 1.55,
        }}
      >
        First, what&apos;s their name? You can change this later.
      </p>

      <div style={{ marginTop: 18 }}>
        <Eyebrow>Child&apos;s name</Eyebrow>
        <WarmInput
          value={name}
          onChange={setName}
          placeholder="e.g. Honey"
          autoFocus
        />
        <p
          style={{
            marginTop: 6,
            fontSize: 10,
            fontWeight: 400,
            color: MUTED,
            lineHeight: 1.4,
          }}
        >
          Your child&apos;s info stays private. Only you can see it.
        </p>
      </div>

      <span aria-hidden style={{ flex: 1, minHeight: 24 }} />

      <Dots active={stepIndex} />
      <div style={{ marginTop: 12 }}>
        <PrimaryButton onClick={onContinue} disabled={!valid}>
          Continue
        </PrimaryButton>
      </div>
    </>
  );
}

// ============================================================
// Step 2; DOB
// ============================================================

function DobStep({
  dob,
  setDob,
  minDob,
  today,
  ageError,
  helperText,
  valid,
  onBack,
  onContinue,
  stepIndex,
}: {
  dob: string;
  setDob: (v: string) => void;
  minDob: string;
  today: string;
  ageError: string | null;
  helperText: string;
  valid: boolean;
  onBack: () => void;
  onContinue: () => void;
  stepIndex: number;
}) {
  return (
    <>
      <h1
        style={{
          marginTop: 48,
          fontSize: 24,
          fontWeight: 800,
          color: INK,
          letterSpacing: "-0.025em",
          lineHeight: 1.15,
        }}
      >
        When were{" "}
        <span style={{ color: ACCENT }}>they born?</span>
      </h1>
      <p
        style={{
          marginTop: 10,
          fontSize: 11,
          fontWeight: 400,
          color: MUTED,
          lineHeight: 1.55,
        }}
      >
        We use this to pick age-appropriate activities. Rough is fine.
      </p>

      <div style={{ marginTop: 18 }}>
        <Eyebrow>Date of birth</Eyebrow>
        <input
          type="date"
          value={dob}
          min={minDob}
          max={today}
          onChange={(e) => setDob(e.target.value)}
          style={WARM_INPUT_STYLE}
        />
        <p
          style={{
            marginTop: 6,
            fontSize: 10,
            fontWeight: 400,
            color: ageError ? "#B85738" : MUTED,
            lineHeight: 1.4,
          }}
        >
          {ageError ?? helperText}
        </p>
      </div>

      <span aria-hidden style={{ flex: 1, minHeight: 24 }} />

      <Dots active={stepIndex} />
      <div
        style={{
          marginTop: 12,
          display: "flex",
          gap: 8,
        }}
      >
        <SecondaryButton onClick={onBack}>Back</SecondaryButton>
        <PrimaryButton onClick={onContinue} disabled={!valid}>
          Continue
        </PrimaryButton>
      </div>
    </>
  );
}

// ============================================================
// Step 3; Pronouns
// ============================================================

function PronounsStep({
  name,
  value,
  onChange,
  busy,
  onBack,
  onSubmit,
  stepIndex,
}: {
  name: string;
  value: Pronouns;
  onChange: (v: Pronouns) => void;
  busy: boolean;
  onBack: () => void;
  onSubmit: () => void;
  stepIndex: number;
}) {
  return (
    <>
      <h1
        style={{
          marginTop: 48,
          fontSize: 24,
          fontWeight: 800,
          color: INK,
          letterSpacing: "-0.025em",
          lineHeight: 1.15,
        }}
      >
        How should we refer to{" "}
        <span style={{ color: ACCENT }}>{name || "your child"}?</span>
      </h1>
      <p
        style={{
          marginTop: 10,
          fontSize: 11,
          fontWeight: 400,
          color: MUTED,
          lineHeight: 1.55,
        }}
      >
        Pick the pronouns we&apos;ll use throughout the app.
      </p>

      <div
        style={{
          marginTop: 48,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {PRONOUNS_OPTIONS.map((opt) => {
          const on = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              style={{
                textAlign: "left",
                background: on ? "#FFFFFF" : TINT_FILL,
                border: `1.5px solid ${on ? INK : "transparent"}`,
                borderRadius: 14,
                padding: "14px 16px",
                cursor: "pointer",
                transition: "border-color 150ms ease-out",
              }}
            >
              <p
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: INK,
                  letterSpacing: "-0.005em",
                }}
              >
                {opt.label}
              </p>
              <p
                style={{
                  marginTop: 2,
                  fontSize: 12,
                  fontWeight: 400,
                  color: MUTED,
                  lineHeight: 1.4,
                }}
              >
                {opt.helper}
              </p>
            </button>
          );
        })}
      </div>

      <span aria-hidden style={{ flex: 1, minHeight: 24 }} />

      <Dots active={stepIndex} />
      <div
        style={{
          marginTop: 12,
          display: "flex",
          gap: 8,
        }}
      >
        <SecondaryButton onClick={onBack}>Back</SecondaryButton>
        <PrimaryButton onClick={onSubmit} disabled={busy}>
          {busy ? "Setting up…" : "Done"}
        </PrimaryButton>
      </div>
    </>
  );
}

// ============================================================
// Shared chrome
// ============================================================

const WARM_INPUT_STYLE: React.CSSProperties = {
  width: "100%",
  background: TINT_FILL,
  border: "1.5px solid transparent",
  borderRadius: 16,
  padding: "18px 16px",
  // 16px minimum prevents iOS auto-zoom on focus.
  fontSize: 16,
  fontWeight: 500,
  color: INK,
  outline: "none",
  fontFamily: "var(--font-jakarta), 'Plus Jakarta Sans', sans-serif",
};

function WarmInput({
  value,
  onChange,
  placeholder,
  autoFocus,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      placeholder={placeholder}
      autoFocus={autoFocus}
      style={{
        ...WARM_INPUT_STYLE,
        background: focused ? "#FFFFFF" : TINT_FILL,
        borderColor: focused ? ACCENT : "transparent",
        transition: "background 150ms ease-out, border-color 150ms ease-out",
      }}
    />
  );
}

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p
      style={{
        marginBottom: 6,
        fontSize: 9,
        fontWeight: 700,
        color: MUTED,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
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
        justifyContent: "center",
        gap: 4,
        listStyle: "none",
        padding: 0,
        margin: 0,
      }}
    >
      {Array.from({ length: 3 }).map((_, i) => (
        <li
          key={i}
          style={{
            width: i === active ? 14 : 5,
            height: 5,
            borderRadius: 3,
            background: i === active ? INK : HAIR,
            transition: "width 250ms ease-out, background 250ms ease-out",
          }}
        />
      ))}
    </ol>
  );
}

function PrimaryButton({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        flex: 1,
        background: INK,
        color: "#FFFFFF",
        borderRadius: 999,
        padding: 10,
        fontSize: 11,
        fontWeight: 700,
        textAlign: "center",
        border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.3 : 1,
        transition: "opacity 150ms ease",
        fontFamily:
          "var(--font-jakarta), 'Plus Jakarta Sans', sans-serif",
      }}
      className="active:opacity-90"
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
        background: "transparent",
        color: INK,
        borderRadius: 999,
        padding: "10px 16px",
        fontSize: 11,
        fontWeight: 700,
        border: `1.5px solid ${HAIR}`,
        cursor: "pointer",
        fontFamily:
          "var(--font-jakarta), 'Plus Jakarta Sans', sans-serif",
      }}
      className="transition-opacity active:opacity-80"
    >
      {children}
    </button>
  );
}

// ============================================================
// Helpers
// ============================================================

function formatAgeHelper({
  years,
  months,
}: {
  years: number;
  months: number;
}): string {
  if (years === 0) {
    return `That makes them ${months} ${plural(months, "month")} old.`;
  }
  if (months === 0) {
    return `That makes them ${years} ${plural(years, "year")} old.`;
  }
  return `That makes them ${years} ${plural(years, "year")} and ${months} ${plural(months, "month")}.`;
}

function plural(n: number, word: string): string {
  return n === 1 ? word : `${word}s`;
}
