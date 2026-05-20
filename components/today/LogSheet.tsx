"use client";

import { Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import Sheet from "@/components/ui/Sheet";
import Textarea from "@/components/ui/Textarea";
import { useToast } from "@/components/ui/Toast";
import { createSession } from "@/lib/db";
import { today as todayIso } from "@/lib/utils/dates";
import type {
  Activity,
  ChildMood,
  SessionResponse,
  TimeAvailable,
} from "@/types";

const RESPONSE_CHIPS: Array<{ value: SessionResponse; label: string }> = [
  { value: "loved", label: "Loved" },
  { value: "engaged", label: "Engaged" },
  { value: "neutral", label: "Neutral" },
  { value: "struggled", label: "Struggled" },
  { value: "frustrated", label: "Frustrated" },
  { value: "skipped", label: "Skipped" },
];

export interface LogSheetProps {
  open: boolean;
  onClose: () => void;
  onLogged: () => void;
  activity: Activity | null;
  childId: string | null;
  time: TimeAvailable;
  mood: ChildMood;
}

export default function LogSheet({
  open,
  onClose,
  onLogged,
  activity,
  childId,
  time,
  mood,
}: LogSheetProps) {
  const { toast } = useToast();
  const [picked, setPicked] = useState<SessionResponse | null>(null);
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  // Reset internal state every time the sheet opens.
  useEffect(() => {
    if (open) {
      setPicked(null);
      setNoteOpen(false);
      setNote("");
      setBusy(false);
    }
  }, [open]);

  const onPick = useCallback(
    async (response: SessionResponse) => {
      if (busy || !activity || !childId) return;
      setPicked(response);
      setBusy(true);
      try {
        await createSession({
          childId,
          activityId: activity.id,
          date: todayIso(),
          response,
          ...(note.trim() ? { note: note.trim() } : {}),
          context: { timeAvailable: time, childMood: mood },
        });
        onLogged();
      } catch (err) {
        console.error("[LogSheet] createSession:", err);
        toast("Couldn't save. Try again.", { tone: "danger" });
        setBusy(false);
        setPicked(null);
      }
    },
    [activity, busy, childId, mood, note, onLogged, time, toast],
  );

  return (
    <Sheet open={open} onClose={onClose}>
      <div className="pb-2">
        <h2 className="text-[22px] font-extrabold tracking-[-0.01em] text-ink">
          How was it?
        </h2>
        {activity ? (
          <p className="mt-1 text-footnote text-ink-tertiary">
            {activity.title}
          </p>
        ) : null}

        <div className="mt-6 grid grid-cols-3 gap-2">
          {RESPONSE_CHIPS.map((opt) => {
            const isPicked = picked === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => void onPick(opt.value)}
                disabled={busy}
                className={`flex h-12 items-center justify-center rounded-md text-[14px] font-extrabold transition-colors duration-fast ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed ${
                  isPicked
                    ? "bg-accent text-white"
                    : "border border-line bg-bg-elevated text-ink hover:border-accent"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {noteOpen ? (
          <div className="mt-5">
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="A surprising thing, an idea for next time…"
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setNoteOpen(true)}
            className="mt-5 inline-flex items-center gap-1 text-callout text-accent transition-colors duration-fast ease-out hover:text-accent-pressed"
          >
            <Plus size={14} strokeWidth={1.75} aria-hidden />
            Add note
          </button>
        )}
      </div>
    </Sheet>
  );
}
