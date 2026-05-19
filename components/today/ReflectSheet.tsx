"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { useEffect, useState } from "react";

import { createObservation, createSession } from "@/lib/db";
import { today as todayIso } from "@/lib/utils/dates";
import type { Activity, SessionResponse } from "@/types";

interface MoodOption {
  emoji: string;
  label: string;
  response: SessionResponse;
  bg: string;
}

const MOODS: MoodOption[] = [
  { emoji: "❤️", label: "Loved it!", response: "loved", bg: "var(--accent-bg)" },
  { emoji: "😊", label: "It was okay", response: "engaged", bg: "var(--amber-bg)" },
  { emoji: "😔", label: "Not today", response: "struggled", bg: "var(--coral-bg)" },
];

/**
 * Round-4 reflect overlay. Slides up from the bottom of /today when the
 * parent taps an activity card; replaces the prior /log/[activityId]
 * route. Captures mood, optional observation, and a set of focus-area
 * tags, then writes a Session (+ Observation if the textarea is filled).
 */
export interface ReflectSheetProps {
  open: boolean;
  activity: Activity | null;
  childId: string;
  childName: string;
  onClose: () => void;
  onLogged: () => void;
}

export default function ReflectSheet({
  open,
  activity,
  childId,
  childName,
  onClose,
  onLogged,
}: ReflectSheetProps) {
  const [moodIdx, setMoodIdx] = useState<number | null>(null);
  const [observation, setObservation] = useState("");
  const [focusAreas, setFocusAreas] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  // Reset state when the sheet opens with a different activity.
  useEffect(() => {
    if (open && activity) {
      setMoodIdx(null);
      setObservation("");
      setFocusAreas([]);
    }
  }, [activity, open]);

  const submit = async () => {
    if (busy || !activity || moodIdx === null) return;
    setBusy(true);
    try {
      const mood = MOODS[moodIdx]!;
      const date = todayIso();
      await createSession({
        childId,
        activityId: activity.id,
        date,
        response: mood.response,
        note: observation.trim() || undefined,
        context: { timeAvailable: "medium", childMood: "normal" },
      });
      if (observation.trim()) {
        await createObservation({
          childId,
          date,
          text: observation.trim(),
          tags: focusAreas,
        });
      }
      onLogged();
    } catch (err) {
      console.error("[ReflectSheet] submit:", err);
      setBusy(false);
    }
  };

  return (
    <AnimatePresence>
      {open && activity ? (
        <motion.div
          key={activity.id}
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ duration: 0.42, ease: [0.34, 1.06, 0.64, 1] }}
          className="fixed inset-0 z-50 flex flex-col bg-bg"
          role="dialog"
          aria-label="Reflect on this moment"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-[calc(env(safe-area-inset-top)+12px)] pb-2.5">
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-bg-alt text-ink"
            >
              <ChevronLeft size={18} strokeWidth={2.25} aria-hidden />
            </button>
            <span
              className="text-[17px] font-extrabold text-ink"
              style={{ letterSpacing: "-0.02em" }}
            >
              Fokus
            </span>
            <span className="h-9 w-9 rounded-full bg-bg-alt" aria-hidden />
          </div>

          <div className="flex-1 overflow-y-auto px-6 pb-[calc(env(safe-area-inset-bottom)+24px)]">
            <div className="mb-6">
              <span
                className="inline-flex items-center rounded-[12px] bg-accent-bg px-3 py-1 text-[12px] font-bold"
                style={{ color: "var(--accent-deep)" }}
              >
                {activity.title}
              </span>
              <h1
                className="mt-3 text-[34px] font-extrabold text-ink"
                style={{ letterSpacing: "-0.03em", lineHeight: 1.1 }}
              >
                Reflection
                <br />
                Time
              </h1>
              <p
                className="mt-2.5 text-[14px] text-ink-secondary"
                style={{ lineHeight: 1.6 }}
              >
                How did today&apos;s activity go with {childName}?
              </p>
            </div>

            <div
              className="rounded-[22px] border-[1.5px] bg-white p-5"
              style={{ borderColor: "var(--line)", marginBottom: 16 }}
            >
              <p
                className="mb-4 text-center text-[15px] font-bold text-ink"
              >
                The child&apos;s response
              </p>
              <div className="flex justify-around">
                {MOODS.map((m, i) => {
                  const on = moodIdx === i;
                  return (
                    <button
                      key={m.label}
                      type="button"
                      onClick={() => setMoodIdx(i)}
                      className="flex flex-col items-center gap-2"
                    >
                      <span
                        className="flex h-[68px] w-[68px] items-center justify-center rounded-full text-[30px] transition-all"
                        style={{
                          background: on ? m.bg : "var(--bg-alt)",
                          boxShadow: on
                            ? "0 4px 18px rgba(0,0,0,0.14)"
                            : "none",
                        }}
                      >
                        {m.emoji}
                      </span>
                      <span
                        className="text-[13px]"
                        style={{
                          color: on ? "var(--ink)" : "var(--ink-secondary)",
                          fontWeight: on ? 700 : 500,
                        }}
                      >
                        {m.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              <hr className="my-4.5 border-t" style={{ borderColor: "var(--line)" }} />

              <p className="mb-2.5 text-[15px] font-bold text-ink">
                Your observations
              </p>
              <textarea
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
                rows={3}
                placeholder={`What did you notice? Any new\ninterests or challenges today…`}
                className="w-full rounded-[14px] bg-bg-input p-4 text-[14px] text-ink"
                style={{ minHeight: 90, lineHeight: 1.65 }}
              />

              <hr className="my-4.5 border-t" style={{ borderColor: "var(--line)" }} />

              <p className="mb-3 text-[15px] font-bold text-ink">
                Key focus areas
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  "Curiosity",
                  "Language confidence",
                  "Emotional awareness",
                  "Thinking clarity",
                  "Resilience",
                  "Creativity",
                  "Observation",
                  "Decisiveness",
                ].map((tag) => {
                  const on = focusAreas.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() =>
                        setFocusAreas((prev) =>
                          prev.includes(tag)
                            ? prev.filter((t) => t !== tag)
                            : [...prev, tag],
                        )
                      }
                      className="rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors"
                      style={{
                        background: on ? "var(--ink)" : "var(--bg-alt)",
                        color: on ? "#fff" : "var(--ink)",
                      }}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              disabled={busy || moodIdx === null}
              onClick={() => void submit()}
              className="h-[54px] w-full rounded-full bg-ink text-[16px] font-bold text-white transition-opacity disabled:opacity-50"
            >
              {busy ? "Logging…" : "Log progress"}
            </button>
            <p className="mt-3 text-center text-[12px] text-ink-quaternary" style={{ lineHeight: 1.5 }}>
              Your entries are kept private in your family journal.
            </p>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
