"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useState } from "react";

import { useToast } from "@/components/ui/Toast";
import { createChild, getCurrentParent } from "@/lib/db";
import { useAppStore } from "@/lib/store/useAppStore";

interface AgeBand {
  label: string;
  age: number;
}
const AGE_BANDS: AgeBand[] = [
  { label: "0–1 yr", age: 5 },
  { label: "2–4 yrs", age: 5 },
  { label: "4–6 yrs", age: 6 },
  { label: "6–9 yrs", age: 9 },
];

/**
 * Compact "add another child" form — same shape as the setup slide at the
 * end of /intro but standalone, with a Back button. Reached from
 * /profile via "Add another child". Engine fields fill in later via the
 * post-setup nudge on /today.
 */
export default function AddChildPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-[100svh] items-center justify-center">
          <p className="text-footnote text-ink-tertiary">Loading…</p>
        </main>
      }
    >
      <AddChildBody />
    </Suspense>
  );
}

function AddChildBody() {
  const router = useRouter();
  const search = useSearchParams();
  const { toast } = useToast();
  const setActiveChild = useAppStore((s) => s.setActiveChild);
  const parentIdFromStore = useAppStore((s) => s.parentId);

  const returnTo = search?.get("return") === "profile" ? "/profile" : "/today";

  const [name, setName] = useState("");
  const [bandIdx, setBandIdx] = useState(2);
  const [busy, setBusy] = useState(false);

  const submit = useCallback(async () => {
    if (busy) return;
    const trimmed = name.trim();
    if (!trimmed) {
      toast("Add a name to continue.", { tone: "danger" });
      return;
    }
    setBusy(true);
    try {
      let parentId = parentIdFromStore;
      if (!parentId) {
        const p = await getCurrentParent();
        if (!p) {
          toast("No parent profile. Restart onboarding.", { tone: "danger" });
          router.replace("/intro");
          return;
        }
        parentId = p.id;
      }
      const band = AGE_BANDS[bandIdx]!;
      const child = await createChild({
        parentId,
        name: trimmed,
        age: band.age,
        ageBand: band.label,
        grade: "",
        engagement: { goesDeepOn: [], fleesFrom: [], inBetween: [] },
        primaryLanguage: "Other",
        interests: [],
        strengths: [],
        struggles: [],
      });
      setActiveChild(child.id);
      router.replace(returnTo);
    } catch (err) {
      console.error("[/onboarding/child] createChild:", err);
      toast("Couldn't save. Try again.", { tone: "danger" });
      setBusy(false);
    }
  }, [
    bandIdx,
    busy,
    name,
    parentIdFromStore,
    returnTo,
    router,
    setActiveChild,
    toast,
  ]);

  return (
    <main className="flex min-h-[100svh] flex-col bg-bg">
      <div className="px-8 pt-[calc(env(safe-area-inset-top)+24px)]">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Back"
          className="-ml-2 inline-flex h-9 items-center gap-1 rounded-md px-2 text-[15px] font-extrabold text-accent transition-colors duration-fast hover:text-accent-pressed"
        >
          <ChevronLeft size={20} strokeWidth={1.75} aria-hidden />
          Back
        </button>
      </div>

      <div className="flex flex-1 flex-col px-8 pt-4">
        <p
          className="text-[11px] font-extrabold uppercase"
          style={{ color: "var(--accent)", letterSpacing: "0.08em" }}
        >
          Add another child
        </p>
        <h1
          className="mt-3 text-[38px] font-extrabold text-ink"
          style={{ lineHeight: 1.1, letterSpacing: "-0.03em" }}
        >
          Their name first.
        </h1>

        <div className="mt-8 flex flex-col gap-3.5">
          <div>
            <label
              className="mb-1.5 block text-[11px] font-extrabold uppercase"
              style={{ color: "var(--ink-secondary)", letterSpacing: "0.05em" }}
            >
              Child&apos;s name
            </label>
            <input
              className="h-[52px] w-full rounded-md border-[1.5px] bg-white px-4 text-[16px] text-ink"
              style={{ borderColor: "var(--line)" }}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sara"
              autoFocus
              autoComplete="off"
              spellCheck={false}
            />
          </div>
          <div>
            <label
              className="mb-1.5 block text-[11px] font-extrabold uppercase"
              style={{ color: "var(--ink-secondary)", letterSpacing: "0.05em" }}
            >
              Their age
            </label>
            <div className="flex flex-wrap gap-2">
              {AGE_BANDS.map((band, i) => {
                const on = bandIdx === i;
                return (
                  <button
                    type="button"
                    key={band.label}
                    onClick={() => setBandIdx(i)}
                    className="rounded-full px-3 py-1.5 text-[12px] font-extrabold transition-colors"
                    style={{
                      background: on ? "var(--ink)" : "var(--bg-alt)",
                      color: on ? "#fff" : "var(--ink)",
                    }}
                  >
                    {band.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 pb-[calc(env(safe-area-inset-bottom)+24px)] pt-4">
        <button
          type="button"
          onClick={submit}
          disabled={busy || name.trim().length === 0}
          className="h-[54px] w-full rounded-full bg-ink text-[16px] font-extrabold text-white transition-opacity disabled:opacity-50"
        >
          {busy ? "Adding…" : "Add child →"}
        </button>
      </div>
    </main>
  );
}
