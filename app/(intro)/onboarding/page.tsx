"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

import Wordmark from "@/components/shared/Wordmark";
import { useToast } from "@/components/ui/Toast";
import { insertChild } from "@/lib/supabase/queries";
import { ageFromDob } from "@/lib/utils/dates";

/**
 * Onboarding — two steps.
 *
 *   1. details   name + DOB + privacy line under the name input
 *   2. pronouns  she/he/they radio cards, default "they"
 *
 * On step 2 submit, insert into public.child with the signed-in
 * parent's auth.uid() and route to /today (with the welcome modal
 * flag set so /today fires the modal once).
 */

const MIN_AGE = 4;
const MAX_AGE = 12;

type Step = "details" | "pronouns";
type Pronouns = "she" | "he" | "they";

const PRONOUNS_OPTIONS: { value: Pronouns; label: string; helper: string }[] = [
  { value: "she", label: "She / her", helper: "Refer to your child with she/her." },
  { value: "he", label: "He / him", helper: "Refer to your child with he/him." },
  { value: "they", label: "They / them", helper: "Refer to your child with they/them." },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [step, setStep] = useState<Step>("details");
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
  const detailsValid =
    trimmed.length > 0 &&
    dob.length > 0 &&
    ageInfo !== null &&
    ageError === null;

  const helperText = useMemo(() => {
    if (!dob) return "Used to pick age-appropriate activities.";
    if (!ageInfo) return "Pick a date in the past.";
    return formatAgeHelper(ageInfo);
  }, [ageInfo, dob]);

  const onContinueDetails = useCallback(() => {
    if (!detailsValid) return;
    setStep("pronouns");
  }, [detailsValid]);

  const onSubmit = useCallback(async () => {
    if (busy || !detailsValid) return;
    setBusy(true);
    try {
      await insertChild({ name: trimmed, dob, pronouns });
      try {
        window.sessionStorage.setItem("show_welcome_modal", "true");
      } catch {
        /* private browsing — modal just won't show */
      }
      router.replace("/today");
    } catch (err) {
      console.error("[/onboarding] insertChild:", err);
      toast("Couldn't save. Try again.", { tone: "danger" });
      setBusy(false);
    }
  }, [busy, detailsValid, dob, pronouns, router, toast, trimmed]);

  return (
    <main className="relative flex min-h-[100svh] flex-col bg-bg">
      <header className="flex items-center justify-between px-6 pt-[calc(env(safe-area-inset-top)+16px)]">
        <Wordmark size="sm" />
        <span aria-hidden className="h-9 w-9" />
      </header>

      <div className="flex flex-1 flex-col px-6 pt-[60px]">
        {step === "details" ? (
          <DetailsStep
            name={name}
            setName={setName}
            dob={dob}
            setDob={setDob}
            minDob={minDob}
            today={today}
            ageError={ageError}
            helperText={helperText}
            valid={detailsValid}
            onContinue={onContinueDetails}
          />
        ) : (
          <PronounsStep
            name={trimmed}
            value={pronouns}
            onChange={setPronouns}
            busy={busy}
            onBack={() => setStep("details")}
            onSubmit={onSubmit}
          />
        )}
      </div>
    </main>
  );
}

// ---------- Step 1 ----------

function DetailsStep({
  name,
  setName,
  dob,
  setDob,
  minDob,
  today,
  ageError,
  helperText,
  valid,
  onContinue,
}: {
  name: string;
  setName: (v: string) => void;
  dob: string;
  setDob: (v: string) => void;
  minDob: string;
  today: string;
  ageError: string | null;
  helperText: string;
  valid: boolean;
  onContinue: () => void;
}) {
  return (
    <>
      <h1
        className="text-ink"
        style={{
          fontSize: 36,
          fontWeight: 800,
          lineHeight: 1.1,
          letterSpacing: "-0.02em",
        }}
      >
        Let&apos;s begin.
      </h1>
      <p
        className="mt-2 text-ink-secondary"
        style={{ fontSize: 16, lineHeight: 1.5 }}
      >
        We need just a few things to start.
      </p>

      <div className="mt-10 flex flex-col gap-6">
        <Field label="Their name">
          <input
            className="h-[50px] w-full rounded-[6px] border bg-bg-elevated px-4 text-[18px] text-ink"
            style={{ borderColor: "var(--line)", borderWidth: 1 }}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="What do you call them?"
            autoFocus
            autoComplete="off"
            spellCheck={false}
          />
          <p
            className="mt-2"
            style={{
              fontSize: 12,
              color: "#8A8A8A",
              lineHeight: 1.45,
            }}
          >
            Your child&apos;s info stays private, only you can see it.
          </p>
        </Field>

        <Field label="Their birthday">
          <input
            type="date"
            value={dob}
            min={minDob}
            max={today}
            onChange={(e) => setDob(e.target.value)}
            className="h-[50px] w-full rounded-[6px] border bg-bg-elevated px-4 text-[18px] text-ink"
            style={{ borderColor: "var(--line)", borderWidth: 1 }}
          />
          <p
            className="mt-2 text-[13px]"
            style={{
              color: ageError ? "var(--warning)" : "var(--ink-tertiary)",
              lineHeight: 1.45,
            }}
          >
            {ageError ?? helperText}
          </p>
        </Field>
      </div>

      <span aria-hidden className="flex-1" />

      <div className="pb-[calc(env(safe-area-inset-bottom)+20px)] pt-6">
        <button
          type="button"
          onClick={onContinue}
          disabled={!valid}
          className="h-[56px] w-full rounded-[6px] text-[16px] font-extrabold text-white transition-opacity disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
          style={{ background: "#1A1A1A" }}
        >
          Continue
        </button>
        <p
          className="mt-3 text-center text-ink-tertiary"
          style={{ fontSize: 13, lineHeight: 1.45 }}
        >
          More details later. We&apos;ll guide you when you&apos;re curious.
        </p>
      </div>
    </>
  );
}

// ---------- Step 2 ----------

function PronounsStep({
  name,
  value,
  onChange,
  busy,
  onBack,
  onSubmit,
}: {
  name: string;
  value: Pronouns;
  onChange: (v: Pronouns) => void;
  busy: boolean;
  onBack: () => void;
  onSubmit: () => void;
}) {
  return (
    <>
      <h1
        className="text-ink"
        style={{
          fontSize: 32,
          fontWeight: 800,
          lineHeight: 1.15,
          letterSpacing: "-0.02em",
        }}
      >
        How does {name} like to be referred to?
      </h1>

      <div className="mt-10 flex flex-col gap-3">
        {PRONOUNS_OPTIONS.map((opt) => {
          const on = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => onChange(opt.value)}
              className="rounded-[12px] p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              style={{
                background: on ? "#1A1A1A" : "#FFFFFF",
                border: `1px solid ${on ? "#1A1A1A" : "#EEEEEE"}`,
                color: on ? "#FFFFFF" : "#1A1A1A",
              }}
            >
              <p style={{ fontSize: 18, fontWeight: 800 }}>{opt.label}</p>
              <p
                className="mt-1"
                style={{
                  fontSize: 13,
                  color: on ? "rgba(255,255,255,0.78)" : "#6B6B6B",
                  lineHeight: 1.45,
                }}
              >
                {opt.helper}
              </p>
            </button>
          );
        })}
      </div>

      <p
        className="mt-3"
        style={{ fontSize: 13, color: "#8A8A8A", lineHeight: 1.45 }}
      >
        You can change this in Profile anytime.
      </p>

      <span aria-hidden className="flex-1" />

      <div className="pb-[calc(env(safe-area-inset-bottom)+20px)] pt-6">
        <button
          type="button"
          onClick={onSubmit}
          disabled={busy}
          className="h-[56px] w-full rounded-[6px] text-[16px] font-extrabold text-white transition-opacity disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          style={{ background: "#1A1A1A" }}
        >
          {busy ? "Saving…" : "Continue"}
        </button>
        <button
          type="button"
          onClick={onBack}
          disabled={busy}
          className="mt-3 w-full text-center text-[14px] text-ink-tertiary disabled:opacity-50"
        >
          Back
        </button>
      </div>
    </>
  );
}

// ---------- helpers ----------

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

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p
        className="mb-2 text-ink-tertiary"
        style={{
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </p>
      {children}
    </div>
  );
}
