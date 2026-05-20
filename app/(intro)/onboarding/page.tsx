"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

import Wordmark from "@/components/shared/Wordmark";
import { useToast } from "@/components/ui/Toast";
import { createChild, createParent, getCurrentParent } from "@/lib/db";
import { useAppStore } from "@/lib/store/useAppStore";
import type { EnglishConfidence } from "@/types";

/**
 * Round-6 onboarding — a single screen that captures the minimum we need
 * to render the first /today: name, age, English level. Everything else
 * is filled in later via the "+ Tell us more about [name]" flow at
 * /profile/about/[childId].
 *
 * On submit:
 *   - create the Parent record (empty name; settings can edit it later)
 *   - create the Child record with all engagement / interests / struggles
 *     arrays empty, englishConfidence mapped from the chip choice
 *   - set sessionStorage flag `show_welcome_modal=true` so /today fires
 *     the WelcomeModal once
 *   - replace to /today
 *
 * SPEC §2 keeps this calm: no goal counters, no "rate your child"
 * questions, no judgment language.
 */

const AGES = [5, 6, 7, 8, 9, 10] as const;

interface EnglishOption {
  label: string;
  value: EnglishConfidence;
}

const ENGLISH: EnglishOption[] = [
  { label: "Just starting", value: "hesitant" },
  { label: "In progress", value: "developing" },
  { label: "Comfortable", value: "comfortable" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const setParent = useAppStore((s) => s.setParent);
  const setActiveChild = useAppStore((s) => s.setActiveChild);

  const [name, setName] = useState("");
  const [age, setAge] = useState<number | null>(null);
  const [english, setEnglish] = useState<EnglishConfidence | null>(null);
  const [busy, setBusy] = useState(false);

  const trimmed = name.trim();
  const valid = trimmed.length > 0 && age !== null && english !== null;

  const buttonLabel = useMemo(() => {
    if (trimmed.length === 0) return "Start →";
    return `Start with ${trimmed} →`;
  }, [trimmed]);

  const submit = useCallback(async () => {
    if (!valid || busy) return;
    setBusy(true);
    try {
      let parent = await getCurrentParent();
      if (!parent) {
        // The form intentionally doesn't ask for the parent's name in this
        // round. createParent requires a string, so we pass an empty value
        // and let the settings page surface a "your name" field later.
        parent = await createParent("");
      }
      setParent(parent.id);

      const child = await createChild({
        parentId: parent.id,
        name: trimmed,
        age: age!,
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
  }, [age, busy, english, router, setActiveChild, setParent, toast, trimmed, valid]);

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

          <Field label="Their age">
            <div className="flex flex-wrap gap-2">
              {AGES.map((a) => {
                const on = age === a;
                return (
                  <button
                    type="button"
                    key={a}
                    onClick={() => setAge(a)}
                    className="rounded-full text-[15px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    style={{
                      width: 56,
                      height: 44,
                      background: on ? "var(--accent)" : "var(--bg-elevated)",
                      color: on ? "#fff" : "var(--ink)",
                      border: `1px solid ${on ? "var(--accent)" : "var(--line)"}`,
                    }}
                  >
                    {a}
                  </button>
                );
              })}
            </div>
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
