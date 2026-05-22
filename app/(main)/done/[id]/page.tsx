"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import ActivityIcon from "@/components/activity/ActivityIcon";
import { useToast } from "@/components/ui/Toast";
import { getActivityById } from "@/lib/content/activities";
import { SKILLS } from "@/lib/content/skills";
import {
  getActivityLog,
  updateActivityLogNote,
  type ActivityLogRow,
} from "@/lib/supabase/queries";
import { replaceActivityLogInCache } from "@/lib/use-activity-log";
import { useChild } from "@/lib/use-child";

/**
 * Completion screen for an activity_log row.
 *
 *   ← Back                                           (top-left)
 *
 *              Done.                                 (48 / 800)
 *           {title}, with {name}.                    (16 / 400 muted)
 *
 *   What did you notice?                             (16 / 800 ink)
 *   [textarea; optional reflection]
 *   [Save note button]                               (only when content)
 *
 *                                                    (above tab bar)
 *   Do another with {name}?  →
 *
 * No streaks. No celebration. No next-up recommendation.
 *
 */
export default function CompletionPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { toast } = useToast();
  const { child } = useChild();

  const id = params?.id;
  const [row, setRow] = useState<ActivityLogRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [noteDraft, setNoteDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedToast, setSavedToast] = useState(false);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const r = await getActivityLog(id);
        if (cancelled) return;
        setRow(r);
        setNoteDraft(r?.parent_note ?? "");
      } catch (err) {
        console.error("[/done] load row:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const activity = useMemo(
    () => (row ? getActivityById(row.activity_id) : null),
    [row],
  );

  const trimmedDraft = noteDraft.trim();
  const noteDirty = trimmedDraft !== (row?.parent_note ?? "").trim();
  const canSave = trimmedDraft.length > 0 && noteDirty && !saving;

  const onSaveNote = useCallback(async () => {
    if (!row || !canSave) return;
    setSaving(true);
    try {
      const updated = await updateActivityLogNote(
        row.id,
        trimmedDraft.length === 0 ? null : trimmedDraft,
      );
      setRow(updated);
      replaceActivityLogInCache(updated);
      setSavedToast(true);
      window.setTimeout(() => setSavedToast(false), 2000);
    } catch (err) {
      console.error("[/done] saveNote:", err);
      toast("Couldn't save the note. Try again.", { tone: "danger" });
    } finally {
      setSaving(false);
    }
  }, [canSave, row, toast, trimmedDraft]);

  if (loading) {
    return (
      <main className="flex min-h-[100svh] items-center justify-center px-5">
        <p className="text-footnote text-ink-tertiary">Loading…</p>
      </main>
    );
  }

  if (!row) {
    return (
      <main className="mx-auto flex min-h-[100svh] max-w-[640px] flex-col items-center justify-center px-6 text-center">
        <p className="text-headline text-ink">Couldn&apos;t find that entry.</p>
        <button
          type="button"
          onClick={() => router.replace("/today")}
          className="mt-6 rounded-full px-5 py-3 text-[14px] font-bold text-white"
          style={{ background: "#252630" }}
        >
          Back to Today
        </button>
      </main>
    );
  }

  const childName = child?.name ?? "your child";
  const activityTitle = activity?.title ?? "That activity";

  return (
    <main className="relative mx-auto flex min-h-[100svh] max-w-[680px] flex-col pt-[calc(env(safe-area-inset-top)+12px)] pb-[calc(env(safe-area-inset-bottom)+32px)]">
      <div className="-mx-2 flex h-9 items-center px-5">
        <button
          type="button"
          onClick={() => router.replace("/today")}
          aria-label="Back to Today"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md text-ink-tertiary transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <ArrowLeft size={20} strokeWidth={1.75} aria-hidden />
        </button>
      </div>

      {/* Top section; grouped icon + Done + subtitle, centred in the
          upper ~45% of the screen. */}
      <section
        className="flex flex-col items-center px-6"
        style={{ marginTop: 40 }}
      >
        {activity ? (
          <span
            aria-hidden
            style={{
              width: 80,
              height: 80,
              borderRadius: 14,
              background: SKILLS[activity.skill].blob,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: SKILLS[activity.skill].iconColor,
            }}
          >
            <ActivityIcon
              iconName={activity.iconName}
              skill={activity.skill}
              size={40}
              strokeWidth={2.25}
              style={{ color: SKILLS[activity.skill].iconColor }}
            />
          </span>
        ) : null}
        <h1
          style={{
            marginTop: 12,
            fontSize: 52,
            fontWeight: 800,
            color: "#252630",
            letterSpacing: "-0.03em",
            lineHeight: 1,
          }}
        >
          Done.
        </h1>
        <p
          className="text-center"
          style={{
            marginTop: 8,
            fontSize: 15,
            fontWeight: 400,
            color: "#8E8D9B",
            lineHeight: 1.5,
            maxWidth: 380,
          }}
        >
          {activityTitle}, with {childName}.
        </p>
      </section>

      {/* Reflection card; distinct middle block. */}
      <section
        style={{
          marginTop: 40,
          marginLeft: 24,
          marginRight: 24,
          background: "#F7F7F5",
          borderRadius: 20,
          padding: 20,
        }}
      >
        <p
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "#252630",
            letterSpacing: "-0.005em",
          }}
        >
          What did you notice?
        </p>
        <textarea
          value={noteDraft}
          onChange={(e) => setNoteDraft(e.target.value)}
          placeholder="Anything that stood out, big or small. (Optional)"
          className="mt-[10px] w-full resize-y text-[16px] text-ink placeholder:text-[#C2C0CB] focus:outline-none"
          style={{
            minHeight: 80,
            background: "transparent",
            border: "none",
            padding: 0,
            lineHeight: 1.55,
          }}
        />
        {trimmedDraft.length > 0 ? (
          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              onClick={() => void onSaveNote()}
              disabled={!canSave}
              className="inline-flex items-center gap-1.5 rounded-full transition-opacity disabled:opacity-50"
              style={{
                background: "#252630",
                color: "#FFFFFF",
                padding: "8px 14px",
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              {saving ? "Saving…" : "Save note"}
            </button>
            {savedToast ? (
              <span
                aria-live="polite"
                style={{ fontSize: 13, color: "#8E8D9B" }}
              >
                Saved.
              </span>
            ) : null}
          </div>
        ) : null}
      </section>

      <span aria-hidden className="flex-1" />

      {/* Bottom action; quiet text + arrow, tappable but no button chrome. */}
      <div className="flex flex-col items-center px-6 pt-10">
        <button
          type="button"
          onClick={() => router.push("/library?from=completion")}
          className="inline-flex flex-col items-center gap-1 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-md"
          style={{
            background: "transparent",
            color: "#252630",
            fontSize: 15,
            fontWeight: 600,
          }}
        >
          <span>Do another with {childName}?</span>
          <ArrowRight
            size={16}
            strokeWidth={2}
            aria-hidden
            style={{ color: "#8E8D9B" }}
          />
        </button>
      </div>
    </main>
  );
}
