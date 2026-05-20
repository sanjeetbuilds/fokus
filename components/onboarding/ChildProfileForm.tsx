"use client";

import { useEffect, useState } from "react";

import { useToast } from "@/components/ui/Toast";
import {
  FLEES_FROM_OPTIONS,
  GOES_DEEP_ON_OPTIONS,
  INTEREST_OPTIONS,
  STRUGGLE_OPTIONS,
} from "@/lib/content/onboarding";
import { updateChild } from "@/lib/db";
import type { Child } from "@/types";

/**
 * "Tell us a little more about [Child]" — the form the post-setup nudge
 * on /today links to. Captures the engine inputs the short onboarding
 * omits: interests, struggles, goesDeepOn, fleesFrom. Each toggle saves
 * immediately so the engine starts respecting the answer right away.
 */
export default function ChildProfileForm({ child }: { child: Child }) {
  const { toast } = useToast();
  const [goesDeepOn, setGoesDeepOn] = useState<string[]>(
    child.engagement.goesDeepOn,
  );
  const [fleesFrom, setFleesFrom] = useState<string[]>(
    child.engagement.fleesFrom,
  );
  const [interests, setInterests] = useState<string[]>(child.interests);
  const [struggles, setStruggles] = useState<string[]>(child.struggles);

  useEffect(() => {
    const t = window.setTimeout(() => {
      void (async () => {
        try {
          await updateChild(child.id, {
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
    fleesFrom,
    goesDeepOn,
    interests,
    struggles,
    toast,
  ]);

  return (
    <div className="flex flex-col gap-6">
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
        className="mb-2.5 text-[11px] font-extrabold uppercase"
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
              className="rounded-full px-3 py-1.5 text-[12px] font-extrabold transition-colors"
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
