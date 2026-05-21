"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useToast } from "@/components/ui/Toast";
import { getActivityById } from "@/lib/content/activities";
import {
  getActivityLog,
  updateActivityLogNote,
  type ActivityLogRow,
} from "@/lib/supabase/queries";
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
 *   [textarea — optional reflection]
 *   [Save note button]                               (only when content)
 *
 *                                                    (above tab bar)
 *   Do another with {name}?  →
 *
 * No streaks. No celebration. No next-up recommendation.
 *
 * Note: T2.5 spec listed the "What did you notice?" prompt at Inter
 * weight 500. The Phase-1 global constraint locks the app to
 * 400 / 800 only, so it renders at 800 here to stay within the
 * established type ramp.
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
          className="mt-6 rounded-full px-5 py-3 text-[14px] font-extrabold text-white"
          style={{ background: "#1A1A1A" }}
        >
          Back to Today
        </button>
      </main>
    );
  }

  const childName = child?.name ?? "your child";
  const activityTitle = activity?.title ?? "That activity";

  return (
    <main className="relative mx-auto flex min-h-[100svh] max-w-[680px] flex-col px-5 pt-[calc(env(safe-area-inset-top)+12px)] pb-[calc(env(safe-area-inset-bottom)+96px)]">
      <div className="-mx-2 flex h-9 items-center">
        <button
          type="button"
          onClick={() => router.replace("/today")}
          aria-label="Back to Today"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md text-ink-tertiary transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <ArrowLeft size={20} strokeWidth={1.75} aria-hidden />
        </button>
      </div>

      <section
        className="flex flex-col items-center"
        style={{ marginTop: 64 }}
      >
        <h1
          style={{
            fontSize: 48,
            fontWeight: 800,
            color: "#1A1A1A",
            letterSpacing: "-0.03em",
            lineHeight: 1,
          }}
        >
          Done.
        </h1>
        <p
          className="mt-4 text-center"
          style={{
            fontSize: 16,
            fontWeight: 400,
            color: "#6B6B6B",
            lineHeight: 1.5,
            maxWidth: 380,
          }}
        >
          {activityTitle}, with {childName}.
        </p>
      </section>

      <section style={{ marginTop: 56 }}>
        <p
          style={{
            fontSize: 16,
            fontWeight: 800,
            color: "#1A1A1A",
            letterSpacing: "-0.005em",
          }}
        >
          What did you notice?
        </p>
        <textarea
          value={noteDraft}
          onChange={(e) => setNoteDraft(e.target.value)}
          placeholder="Anything that stood out, big or small. (Optional)"
          className="mt-3 w-full resize-y rounded-[12px] px-4 py-3 text-[14px] text-ink"
          style={{
            minHeight: 100,
            background: "#FFFFFF",
            border: "1px solid #EEEEEE",
            lineHeight: 1.6,
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
                background: "#1A1A1A",
                color: "#FFFFFF",
                padding: "10px 18px",
                fontSize: 14,
                fontWeight: 800,
              }}
            >
              {saving ? "Saving…" : "Save note"}
            </button>
            {savedToast ? (
              <span
                aria-live="polite"
                style={{ fontSize: 13, color: "#6B6B6B" }}
              >
                Saved.
              </span>
            ) : null}
          </div>
        ) : null}
      </section>

      <span aria-hidden className="flex-1" />

      <div className="flex flex-col items-center pt-10">
        <button
          type="button"
          onClick={() => router.push("/library?from=completion")}
          className="inline-flex items-center gap-1.5 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-md"
          style={{
            background: "transparent",
            color: "#1A1A1A",
            fontSize: 14,
            fontWeight: 800,
          }}
        >
          Do another with {childName}?
          <ArrowRight
            size={16}
            strokeWidth={2}
            aria-hidden
            style={{ color: "#8A8A8A" }}
          />
        </button>
      </div>
    </main>
  );
}
