"use client";

import { useEffect, useState } from "react";

import { useToast } from "@/components/ui/Toast";
import {
  ENGLISH_CONFIDENCE_OPTIONS,
  FLEES_FROM_OPTIONS,
  GOES_DEEP_ON_OPTIONS,
  INTEREST_OPTIONS,
  STRUGGLE_OPTIONS,
} from "@/lib/content/onboarding";
import { updateChild } from "@/lib/db";
import type { Child, EnglishConfidence } from "@/types";

/**
 * "Tell us a little more about [Child]" — the form the post-setup nudge
 * on /today links to. Captures the engine inputs the round-4 short
 * onboarding omits: englishConfidence, interests, struggles, goesDeepOn,
 * fleesFrom. Each toggle saves immediately (no submit button) so the
 * engine starts respecting the answer the moment it lands.
 */
export default function ChildProfileForm({ child }: { child: Child }) {
  const { toast } = useToast();
  const [englishConfidence, setEnglishConfidence] = useState<EnglishConfidence>(
    child.englishConfidence,
  );
  const [goesDeepOn, setGoesDeepOn] = useState<string[]>(
    child.engagement.goesDeepOn,
  );
  const [fleesFrom, setFleesFrom] = useState<string[]>(
    child.engagement.fleesFrom,
  );
  const [interests, setInterests] = useState<string[]>(child.interests);
  const [struggles, setStruggles] = useState<string[]>(child.struggles);

  // Debounced save so chip-spam doesn't flood Dexie.
  useEffect(() => {
    const t = window.setTimeout(() => {
      void (async () => {
        try {
          await updateChild(child.id, {
            englishConfidence,
            engagement: { goesDeepOn, fleesFrom, inBetween: [] },
            interests,
            struggles,
          });
        } catch (err) {
          console.error("[ChildProfileForm] save:", err);
          toast("Couldn't save. Try again.", { tone: "danger" });
        }
      })();
    }, 400);
    return () => window.clearTimeout(t);
  }, [
    child.id,
    englishConfidence,
    fleesFrom,
    goesDeepOn,
    interests,
    struggles,
    toast,
  ]);

  return (
    <div className="flex flex-col gap-6">
      <section>
        <p
          className="mb-2.5 text-[11px] font-bold uppercase"
          style={{ color: "var(--ink-secondary)", letterSpacing: "0.06em" }}
        >
          English confidence
        </p>
        <div className="flex flex-col gap-2">
          {ENGLISH_CONFIDENCE_OPTIONS.map((opt) => {
            const on = englishConfidence === opt.value;
            return (
              <button
                type="button"
                key={opt.value}
                onClick={() => setEnglishConfidence(opt.value)}
                className="rounded-md border-[1.5px] bg-white p-3.5 text-left transition-colors"
                style={{
                  borderColor: on ? "var(--accent)" : "var(--line)",
                  background: on ? "var(--accent-bg)" : "var(--bg-elevated)",
                }}
              >
                <p className="text-[14px] font-bold text-ink">{opt.label}</p>
                <p
                  className="mt-1 text-[12px] text-ink-secondary"
                  style={{ lineHeight: 1.5 }}
                >
                  {opt.description(child.primaryLanguage || "")}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      <ChipGroup
        label="Goes deep on"
        options={GOES_DEEP_ON_OPTIONS as readonly string[]}
        selected={goesDeepOn}
        onToggle={(v) =>
          setGoesDeepOn((prev) =>
            prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v],
          )
        }
      />

      <ChipGroup
        label="Tries to get away from"
        options={FLEES_FROM_OPTIONS as readonly string[]}
        selected={fleesFrom}
        onToggle={(v) =>
          setFleesFrom((prev) =>
            prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v],
          )
        }
      />

      <ChipGroup
        label="What lights them up"
        options={INTEREST_OPTIONS as readonly string[]}
        selected={interests}
        onToggle={(v) =>
          setInterests((prev) =>
            prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v],
          )
        }
      />

      <ChipGroup
        label="Where they get stuck"
        options={STRUGGLE_OPTIONS as readonly string[]}
        selected={struggles}
        onToggle={(v) =>
          setStruggles((prev) =>
            prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v],
          )
        }
      />
    </div>
  );
}

function ChipGroup({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: readonly string[];
  selected: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <section>
      <p
        className="mb-2.5 text-[11px] font-bold uppercase"
        style={{ color: "var(--ink-secondary)", letterSpacing: "0.06em" }}
      >
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const on = selected.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onToggle(opt)}
              className="rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors"
              style={{
                background: on ? "var(--ink)" : "var(--bg-alt)",
                color: on ? "#fff" : "var(--ink)",
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </section>
  );
}
