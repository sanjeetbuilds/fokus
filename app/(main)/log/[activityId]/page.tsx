"use client";

import { ChevronLeft } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import Button from "@/components/ui/Button";
import RadioCard from "@/components/ui/RadioCard";
import Textarea from "@/components/ui/Textarea";
import { useToast } from "@/components/ui/Toast";
import { getActivityById } from "@/lib/content/activities";
import { createSession, getChild } from "@/lib/db";
import { useAppStore } from "@/lib/store/useAppStore";
import { today as todayIso } from "@/lib/utils/dates";
import type { ChildMood, SessionResponse, TimeAvailable } from "@/types";

interface ResponseChoice {
  value: SessionResponse;
  label: string;
  description: string;
}

const RESPONSE_OPTIONS: ResponseChoice[] = [
  { value: "loved", label: "Loved it", description: "Really engaged, wanted more." },
  { value: "engaged", label: "Engaged", description: "Stayed focused, enjoyed it." },
  { value: "neutral", label: "Neutral", description: "Did it, no strong feelings." },
  { value: "struggled", label: "Struggled", description: "Found it hard but kept trying." },
  { value: "frustrated", label: "Frustrated", description: "Got upset, wanted to stop." },
  { value: "skipped", label: "Skipped", description: "Didn't happen today." },
];

export default function LogSessionPage() {
  return (
    <Suspense fallback={<LoadingShell />}>
      <LogSessionBody />
    </Suspense>
  );
}

function LoadingShell() {
  return (
    <main className="flex min-h-[100svh] items-center justify-center px-5">
      <p className="text-footnote text-ink-tertiary">Loading…</p>
    </main>
  );
}

function LogSessionBody() {
  const router = useRouter();
  const params = useParams<{ activityId: string }>();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const activeChildId = useAppStore((s) => s.activeChildId);
  const lastPickContext = useAppStore((s) => s.lastPickContext);
  const clearLastPickContext = useAppStore((s) => s.clearLastPickContext);

  const activityId = params?.activityId;
  const activity = useMemo(
    () => (activityId ? getActivityById(activityId) : undefined),
    [activityId],
  );

  const time = (searchParams?.get("time") as TimeAvailable | null) ??
    (lastPickContext?.activityId === activityId ? lastPickContext.time : null) ??
    "medium";
  const mood = (searchParams?.get("mood") as ChildMood | null) ??
    (lastPickContext?.activityId === activityId ? lastPickContext.mood : null) ??
    "normal";

  const [response, setResponse] = useState<SessionResponse | null>(null);
  const [note, setNote] = useState("");
  const [childName, setChildName] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!activeChildId) return;
    void (async () => {
      try {
        const c = await getChild(activeChildId);
        if (!cancelled) setChildName(c?.name ?? null);
      } catch (err) {
        console.error("[/log] getChild:", err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeChildId]);

  const onBack = useCallback(() => {
    router.back();
  }, [router]);

  const onSave = useCallback(async () => {
    if (!response || !activity || !activeChildId || busy) return;
    setBusy(true);
    try {
      await createSession({
        childId: activeChildId,
        activityId: activity.id,
        date: todayIso(),
        response,
        ...(note.trim() ? { note: note.trim() } : {}),
        context: { timeAvailable: time, childMood: mood },
      });
      clearLastPickContext();
      toast("Logged.");
      router.push("/today");
    } catch (err) {
      console.error("[/log] createSession:", err);
      toast("Couldn't save. Try again.", { tone: "danger" });
      setBusy(false);
    }
  }, [
    activeChildId,
    activity,
    busy,
    clearLastPickContext,
    mood,
    note,
    response,
    router,
    time,
    toast,
  ]);

  if (!activity) {
    return (
      <main className="mx-auto flex min-h-[100svh] max-w-[640px] flex-col items-center justify-center px-6 text-center">
        <p className="text-headline text-ink">Activity not found.</p>
        <Button
          variant="secondary"
          className="mt-6"
          onClick={() => router.replace("/today")}
        >
          Back to Today
        </Button>
      </main>
    );
  }

  const noteLabel =
    response === "skipped" ? "Why skipped?" : "Anything to remember?";
  const notePlaceholder =
    response === "skipped"
      ? "A few words on why today didn't happen, for your own records."
      : "A surprising thing, a moment you want to remember, an idea for next time…";

  return (
    <main className="mx-auto flex min-h-[100svh] max-w-[640px] flex-col px-5 pt-[calc(env(safe-area-inset-top)+12px)] pb-[calc(env(safe-area-inset-bottom)+120px)]">
      <div className="-mx-2 mb-4 flex h-9 items-center">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          className="inline-flex h-9 items-center gap-1 rounded-md px-2 text-callout text-accent transition-colors duration-fast ease-out hover:text-accent-pressed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <ChevronLeft size={20} strokeWidth={1.75} aria-hidden />
          <span>Back</span>
        </button>
      </div>

      <header>
        <h1
          className="font-display text-[40px] font-semibold tracking-[-0.02em] text-ink"
          style={{ lineHeight: 1.05 }}
        >
          How did it go?
        </h1>
        <p className="mt-2 text-[17px] text-ink-secondary">{activity.title}</p>
      </header>

      <section className="mt-8">
        <p className="text-caption uppercase tracking-[0.12em] font-medium text-ink-tertiary">
          How did {childName ?? "they"} respond?
        </p>
        <div
          role="radiogroup"
          aria-label="Response"
          className="mt-3 flex flex-col gap-2"
        >
          {RESPONSE_OPTIONS.map((opt) => (
            <RadioCard
              key={opt.value}
              selected={response === opt.value}
              onSelect={() => setResponse(opt.value)}
              label={opt.label}
              description={opt.description}
            />
          ))}
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-2 flex items-baseline gap-2">
          <p className="text-caption uppercase tracking-[0.12em] font-medium text-ink-tertiary">
            {noteLabel}
          </p>
          {response !== "skipped" ? (
            <span className="text-caption text-ink-quaternary">(optional)</span>
          ) : null}
        </div>
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={notePlaceholder}
        />
      </section>

      {/* Sticky bottom save */}
      <div className="fixed bottom-0 left-0 right-0 z-10 border-t border-line-subtle bg-bg px-5 pb-[calc(env(safe-area-inset-bottom)+16px)] pt-4">
        <div className="mx-auto max-w-[640px]">
          <Button
            onClick={onSave}
            fullWidth
            size="lg"
            disabled={!response || busy}
          >
            {busy ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>
    </main>
  );
}
