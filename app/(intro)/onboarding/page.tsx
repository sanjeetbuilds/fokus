"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

import Wordmark from "@/components/shared/Wordmark";
import { useToast } from "@/components/ui/Toast";
import { createChild, createParent, getCurrentParent } from "@/lib/db";
import { useAppStore } from "@/lib/store/useAppStore";
import { ageFromDob } from "@/lib/utils/dates";
import type { EnglishConfidence } from "@/types";

/**
 * Round-6 onboarding — single screen that captures the minimum we need to
 * render the first /today: name, date of birth, English level. Everything
 * else (interests, struggles, engagement, photo) is filled in later via
 * /profile/about/[childId].
 *
 * DOB replaces the round-5 age chips so the engine can track age with
 * month-level resolution and "year + remainder months" can be shown back
 * to the parent. The integer `age` field is still persisted for engine
 * compatibility (it's derived from DOB at save time).
 */

interface EnglishOption {
  label: string;
  value: EnglishConfidence;
}

const ENGLISH: EnglishOption[] = [
  { label: "Just starting", value: "hesitant" },
  { label: "In progress", value: "developing" },
  { label: "Comfortable", value: "comfortable" },
];

const MIN_AGE = 4;
const MAX_AGE = 12;

export default function OnboardingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const setParent = useAppStore((s) => s.setParent);
  const setActiveChild = useAppStore((s) => s.setActiveChild);

  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [english, setEnglish] = useState<EnglishConfidence | null>(null);
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
  const valid =
    trimmed.length > 0 &&
    dob.length > 0 &&
    ageInfo !== null &&
    ageError === null &&
    english !== null;

  const buttonLabel = useMemo(() => {
    if (trimmed.length === 0) return "Start →";
    return `Start with ${trimmed} →`;
  }, [trimmed]);

  const helperText = useMemo(() => {
    if (!dob) return "Used to pick age-appropriate activities.";
    if (!ageInfo) return "Pick a date in the past.";
    return formatAgeHelper(ageInfo);
  }, [ageInfo, dob]);

  const submit = useCallback(async () => {
    if (!valid || busy) return;
    setBusy(true);
    try {
      let parent = await getCurrentParent();
      if (!parent) {
        // We don't ask for the parent's name in this flow.
        parent = await createParent("");
      }
      setParent(parent.id);

      const child = await createChild({
        parentId: parent.id,
        name: trimmed,
        age: ageInfo!.years,
        dateOfBirth: dob,
        grade: "",
        engagement: { goesDeepOn: [], fleesFrom: [], inBetween: [] },
        englishConfidence: english!,
        primaryLanguage: "",
        interests: [],
        strengths: [],
        struggles: [],
        photoUrl: null,
        gender: "unspecified",
      });
      setActiveChild(child.id);

      try {
        window.sessionStorage.setItem("show_welcome_modal", "true");
      } catch {
        /* private browsing — modal just won't show */
      }

      router.replace("/today");
    } catch (err) {
      console.error("[/onboarding] submit:", err);
      toast("Couldn't save. Try again.", { tone: "danger" });
      setBusy(false);
    }
  }, [
    ageInfo,
    busy,
    dob,
    english,
    router,
    setActiveChild,
    setParent,
    toast,
    trimmed,
    valid,
  ]);

  return (
    <main className="relative flex min-h-[100svh] flex-col bg-bg">
      <header className="flex items-center justify-between px-6 pt-[calc(env(safe-area-inset-top)+16px)]">
        <Wordmark size="sm" />
        <span aria-hidden className="h-9 w-9" />
      </header>

      <div className="flex flex-1 flex-col px-6 pt-[60px]">
        <h1
          className="font-display text-ink"
          style={{
            fontSize: 36,
            fontWeight: 500,
            lineHeight: 1.1,
            letterSpacing: "-0.01em",
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

          <Field label="Their English">
            <div className="flex gap-2">
              {ENGLISH.map((opt) => {
                const on = english === opt.value;
                return (
                  <button
                    type="button"
                    key={opt.value}
                    onClick={() => setEnglish(opt.value)}
                    className="flex-1 rounded-full text-[14px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    style={{
                      height: 50,
                      background: on ? "var(--accent)" : "var(--bg-elevated)",
                      color: on ? "#fff" : "var(--ink)",
                      border: `1px solid ${on ? "var(--accent)" : "var(--line)"}`,
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </Field>
        </div>

        <span aria-hidden className="flex-1" />

        <div className="pb-[calc(env(safe-area-inset-bottom)+20px)] pt-6">
          <button
            type="button"
            onClick={() => void submit()}
            disabled={!valid || busy}
            className="h-[56px] w-full rounded-[6px] text-[16px] font-semibold text-white transition-opacity disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
            style={{
              background: "var(--accent)",
              boxShadow: "0 4px 14px -4px rgba(156,165,255,0.4)",
            }}
          >
            {busy ? "Saving…" : buttonLabel}
          </button>
          <p
            className="mt-3 text-center text-ink-tertiary"
            style={{ fontSize: 13, lineHeight: 1.45 }}
          >
            More details later — we&apos;ll guide you when you&apos;re curious.
          </p>
        </div>
      </div>
    </main>
  );
}

function formatAgeHelper({ years, months }: { years: number; months: number }): string {
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
          fontWeight: 600,
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
