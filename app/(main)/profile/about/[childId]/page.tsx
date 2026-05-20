"use client";

import { ChevronLeft, Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";

import ChildPhotoInput from "@/components/onboarding/ChildPhotoInput";
import { useToast } from "@/components/ui/Toast";
import {
  FLEES_FROM_OPTIONS,
  GOES_DEEP_ON_OPTIONS,
  GRADE_OPTIONS,
  INTEREST_OPTIONS,
  STRUGGLE_OPTIONS,
} from "@/lib/content/onboarding";
import { getChild, updateChild } from "@/lib/db";
import type { Child } from "@/types";

/**
 * "Tell us more" profile completion. Six optional steps, each skippable.
 * Saved fields immediately feed the engine on the next pickActivity call.
 *
 * Reached from /today via "+ Tell us more about [name] →" and from
 * /profile via the same link. Returns to /profile on finish or back-out.
 */

type Step = "basics" | "gender" | "photo" | "engagement" | "interests" | "struggles";
const STEPS: Step[] = [
  "basics",
  "gender",
  "photo",
  "engagement",
  "interests",
  "struggles",
];

export default function TellUsMorePage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-[100svh] items-center justify-center px-5">
          <p className="text-footnote text-ink-tertiary">Loading…</p>
        </main>
      }
    >
      <TellUsMoreBody />
    </Suspense>
  );
}

function TellUsMoreBody() {
  const router = useRouter();
  const params = useParams<{ childId: string }>();
  const { toast } = useToast();
  const childId = params?.childId;

  const [child, setChild] = useState<Child | null>(null);
  const [stepIdx, setStepIdx] = useState(0);
  const [busy, setBusy] = useState(false);

  // Draft state mirrors the child fields under edit; we save on
  // "Save and continue" rather than per-keystroke.
  const [dob, setDob] = useState("");
  const [grade, setGrade] = useState<string | null>(null);
  const [gender, setGender] = useState<Child["gender"] | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [goesDeepOn, setGoesDeepOn] = useState<string[]>([]);
  const [fleesFrom, setFleesFrom] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [struggles, setStruggles] = useState<string[]>([]);
  const [interestDraft, setInterestDraft] = useState("");

  useEffect(() => {
    if (!childId) return;
    let cancelled = false;
    void (async () => {
      try {
        const c = await getChild(childId);
        if (cancelled) return;
        if (!c) {
          router.replace("/profile");
          return;
        }
        setChild(c);
        setDob(c.dateOfBirth ?? "");
        setGrade(c.grade?.trim() || null);
        setGender(c.gender ?? null);
        setPhotoUrl(c.photoUrl ?? null);
        setGoesDeepOn(c.engagement.goesDeepOn);
        setFleesFrom(c.engagement.fleesFrom);
        setInterests(c.interests);
        setStruggles(c.struggles);
      } catch (err) {
        console.error("[/profile/about] load:", err);
        router.replace("/profile");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [childId, router]);

  const step = STEPS[stepIdx]!;

  const next = useCallback(() => {
    if (stepIdx >= STEPS.length - 1) {
      router.replace("/profile");
      return;
    }
    setStepIdx(stepIdx + 1);
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  }, [router, stepIdx]);

  const skip = useCallback(() => {
    next();
  }, [next]);

  const save = useCallback(async () => {
    if (!child || busy) return;
    setBusy(true);
    try {
      const patch: Partial<Child> = {};
      if (step === "basics") {
        if (dob) patch.dateOfBirth = dob;
        if (grade) patch.grade = grade;
      } else if (step === "gender") {
        patch.gender = gender ?? "unspecified";
      } else if (step === "photo") {
        patch.photoUrl = photoUrl;
      } else if (step === "engagement") {
        patch.engagement = { goesDeepOn, fleesFrom, inBetween: [] };
      } else if (step === "interests") {
        patch.interests = interests;
      } else if (step === "struggles") {
        patch.struggles = struggles;
      }
      await updateChild(child.id, patch);
      next();
    } catch (err) {
      console.error("[/profile/about] save:", err);
      toast("Couldn't save. Try again.", { tone: "danger" });
    } finally {
      setBusy(false);
    }
  }, [
    busy,
    child,
    dob,
    fleesFrom,
    gender,
    goesDeepOn,
    grade,
    interests,
    next,
    photoUrl,
    step,
    struggles,
    toast,
  ]);

  if (!child) {
    return (
      <main className="flex min-h-[100svh] items-center justify-center px-5">
        <p className="text-footnote text-ink-tertiary">Loading…</p>
      </main>
    );
  }

  const isLast = stepIdx === STEPS.length - 1;
  const childName = child.name;

  return (
    <main className="mx-auto flex min-h-[100svh] max-w-[640px] flex-col bg-bg pt-[calc(env(safe-area-inset-top)+12px)]">
      <div className="flex items-center justify-between px-6">
        <button
          type="button"
          onClick={() => router.replace("/profile")}
          aria-label="Back"
          className="-ml-2 inline-flex h-9 items-center gap-1 rounded-md px-2 text-[15px] font-extrabold text-accent-deep transition-colors hover:text-accent-pressed"
        >
          <ChevronLeft size={20} strokeWidth={1.75} aria-hidden />
          Back
        </button>
        <button
          type="button"
          onClick={skip}
          className="rounded-md px-2 py-1.5 text-[13px] font-extrabold text-ink-tertiary hover:text-ink"
        >
          Skip for now
        </button>
      </div>

      <p
        className="mt-1 text-center text-[12px] text-ink-tertiary"
        style={{ letterSpacing: "0.04em" }}
      >
        Step {stepIdx + 1} of {STEPS.length}
      </p>

      <div className="flex flex-1 flex-col px-6 pt-6 pb-[calc(env(safe-area-inset-bottom)+24px)]">
        <h1
          className="text-ink"
          style={{
            fontSize: 30,
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: "-0.01em",
            marginBottom: 6,
          }}
        >
          {stepTitle(step, childName)}
        </h1>
        <p
          className="text-ink-secondary"
          style={{ fontSize: 15, lineHeight: 1.5, marginBottom: 24 }}
        >
          {stepHelp(step, childName)}
        </p>

        <div className="flex-1">
          {step === "basics" ? (
            <BasicsStep
              dob={dob}
              setDob={setDob}
              grade={grade}
              setGrade={setGrade}
            />
          ) : null}
          {step === "gender" ? (
            <GenderStep gender={gender} setGender={setGender} />
          ) : null}
          {step === "photo" ? (
            <ChildPhotoInput value={photoUrl} onChange={setPhotoUrl} />
          ) : null}
          {step === "engagement" ? (
            <EngagementStep
              goesDeepOn={goesDeepOn}
              setGoesDeepOn={setGoesDeepOn}
              fleesFrom={fleesFrom}
              setFleesFrom={setFleesFrom}
            />
          ) : null}
          {step === "interests" ? (
            <InterestsStep
              interests={interests}
              setInterests={setInterests}
              draft={interestDraft}
              setDraft={setInterestDraft}
            />
          ) : null}
          {step === "struggles" ? (
            <ChipGroup
              options={STRUGGLE_OPTIONS as readonly string[]}
              selected={struggles}
              onToggle={(v) =>
                setStruggles((prev) =>
                  prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v],
                )
              }
              hint="Select all that apply, or skip if none fit."
            />
          ) : null}
        </div>

        <div className="pt-6">
          <button
            type="button"
            onClick={() => void save()}
            disabled={busy}
            className="h-[54px] w-full rounded-full bg-ink text-[16px] font-extrabold text-white transition-opacity disabled:opacity-60"
          >
            {busy ? "Saving…" : isLast ? "Save and finish" : "Save and continue"}
          </button>
        </div>
      </div>
    </main>
  );
}

// ---------- copy ----------

function stepTitle(step: Step, name: string): string {
  switch (step) {
    case "basics":
      return `When was ${name} born?`;
    case "gender":
      return `How does ${name} go?`;
    case "photo":
      return `A photo of ${name}.`;
    case "engagement":
      return "What pulls them in. What pushes them out.";
    case "interests":
      return "What lights them up?";
    case "struggles":
      return "Where do they get stuck?";
  }
}

function stepHelp(step: Step, name: string): string {
  switch (step) {
    case "basics":
      return "Optional. Helps Fokus track age over time.";
    case "gender":
      return "Optional. Helps with pronouns in some activity examples.";
    case "photo":
      return "Stays on your device. We never upload.";
    case "engagement":
      return `Two short lists. Things ${name} loses time in, and things they try to escape.`;
    case "interests":
      return "Themes they're drawn to. Used to make activities feel like theirs.";
    case "struggles":
      return "Real challenges right now. We'll work on these gradually.";
  }
}

// ---------- step bodies ----------

function BasicsStep({
  dob,
  setDob,
  grade,
  setGrade,
}: {
  dob: string;
  setDob: (v: string) => void;
  grade: string | null;
  setGrade: (v: string | null) => void;
}) {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const minDob = useMemo(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 20);
    return d.toISOString().slice(0, 10);
  }, []);
  return (
    <div className="flex flex-col gap-5">
      <div>
        <p
          className="mb-2 text-ink-tertiary"
          style={{
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          Date of birth
        </p>
        <input
          type="date"
          value={dob}
          min={minDob}
          max={today}
          onChange={(e) => setDob(e.target.value)}
          className="h-[50px] w-full rounded-[6px] border bg-bg-elevated px-4 text-[16px] text-ink"
          style={{ borderColor: "var(--line)", borderWidth: 1 }}
        />
      </div>
      <div>
        <p
          className="mb-2 text-ink-tertiary"
          style={{
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          Grade
        </p>
        <div className="flex flex-wrap gap-2">
          {GRADE_OPTIONS.map((g) => {
            const on = grade === g;
            return (
              <button
                key={g}
                type="button"
                onClick={() => setGrade(on ? null : g)}
                className="rounded-full px-3 py-1.5 text-[13px] font-extrabold"
                style={{
                  background: on ? "var(--ink)" : "var(--bg-elevated)",
                  color: on ? "#fff" : "var(--ink)",
                  border: `1px solid ${on ? "var(--ink)" : "var(--line)"}`,
                }}
              >
                {g}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function GenderStep({
  gender,
  setGender,
}: {
  gender: Child["gender"];
  setGender: (v: Child["gender"]) => void;
}) {
  const options: { value: NonNullable<Child["gender"]>; label: string }[] = [
    { value: "boy", label: "Boy" },
    { value: "girl", label: "Girl" },
    { value: "unspecified", label: "Prefer not to say" },
  ];
  return (
    <div className="flex flex-col gap-2">
      {options.map((opt) => {
        const on = gender === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => setGender(opt.value)}
            className="rounded-md border-[1.5px] bg-bg-elevated p-4 text-left"
            style={{
              borderColor: on ? "var(--accent)" : "var(--line)",
              background: on ? "var(--accent-bg)" : "var(--bg-elevated)",
            }}
          >
            <p className="text-[15px] font-extrabold text-ink">{opt.label}</p>
          </button>
        );
      })}
    </div>
  );
}

function EngagementStep({
  goesDeepOn,
  setGoesDeepOn,
  fleesFrom,
  setFleesFrom,
}: {
  goesDeepOn: string[];
  setGoesDeepOn: (v: string[]) => void;
  fleesFrom: string[];
  setFleesFrom: (v: string[]) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <ChipGroupLabelled
        eyebrow="Goes deep on"
        options={GOES_DEEP_ON_OPTIONS as readonly string[]}
        selected={goesDeepOn}
        onToggle={(v) =>
          setGoesDeepOn(
            goesDeepOn.includes(v)
              ? goesDeepOn.filter((x) => x !== v)
              : [...goesDeepOn, v],
          )
        }
        hint="Pick a few they happily lose time in."
      />
      <ChipGroupLabelled
        eyebrow="Tries to get away from"
        options={FLEES_FROM_OPTIONS as readonly string[]}
        selected={fleesFrom}
        onToggle={(v) =>
          setFleesFrom(
            fleesFrom.includes(v)
              ? fleesFrom.filter((x) => x !== v)
              : [...fleesFrom, v],
          )
        }
        hint="Select all that apply, or skip."
      />
    </div>
  );
}

function InterestsStep({
  interests,
  setInterests,
  draft,
  setDraft,
}: {
  interests: string[];
  setInterests: (v: string[]) => void;
  draft: string;
  setDraft: (v: string) => void;
}) {
  const presets = INTEREST_OPTIONS as readonly string[];
  const customInterests = useMemo(
    () => interests.filter((i) => !presets.includes(i)),
    [interests, presets],
  );
  const add = (event?: FormEvent) => {
    event?.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed) return;
    if (!interests.includes(trimmed)) {
      setInterests([...interests, trimmed]);
    }
    setDraft("");
  };
  const toggle = (v: string) => {
    setInterests(
      interests.includes(v)
        ? interests.filter((x) => x !== v)
        : [...interests, v],
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {presets.map((p) => {
          const on = interests.includes(p);
          return (
            <button
              key={p}
              type="button"
              onClick={() => toggle(p)}
              className="rounded-full px-3 py-1.5 text-[13px] font-extrabold"
              style={{
                background: on ? "var(--ink)" : "var(--bg-elevated)",
                color: on ? "#fff" : "var(--ink)",
                border: `1px solid ${on ? "var(--ink)" : "var(--line)"}`,
              }}
            >
              {p}
            </button>
          );
        })}
        {customInterests.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => toggle(p)}
            className="rounded-full px-3 py-1.5 text-[13px] font-extrabold"
            style={{
              background: "var(--ink)",
              color: "#fff",
              border: "1px solid var(--ink)",
            }}
          >
            {p}
          </button>
        ))}
      </div>

      <form onSubmit={add} className="flex items-end gap-2">
        <div className="flex-1">
          <p
            className="mb-2 text-ink-tertiary"
            style={{
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Add your own
          </p>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="h-[44px] w-full rounded-[6px] border bg-bg-elevated px-3 text-[15px] text-ink"
            style={{ borderColor: "var(--line)", borderWidth: 1 }}
            placeholder="e.g. Pokémon, F1 cars"
            autoComplete="off"
            spellCheck={false}
          />
        </div>
        <button
          type="submit"
          disabled={!draft.trim()}
          className="inline-flex h-[44px] items-center gap-1 rounded-full px-3.5 text-[13px] font-extrabold text-ink disabled:opacity-40"
          style={{ background: "var(--bg-alt)" }}
        >
          <Plus size={14} strokeWidth={2} aria-hidden />
          Add
        </button>
      </form>
    </div>
  );
}

function ChipGroupLabelled({
  eyebrow,
  options,
  selected,
  onToggle,
  hint,
}: {
  eyebrow: string;
  options: readonly string[];
  selected: string[];
  onToggle: (v: string) => void;
  hint: string;
}) {
  return (
    <div>
      <p
        className="mb-2 text-ink-tertiary"
        style={{
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
        }}
      >
        {eyebrow}
      </p>
      <ChipGroup options={options} selected={selected} onToggle={onToggle} hint={hint} />
    </div>
  );
}

function ChipGroup({
  options,
  selected,
  onToggle,
  hint,
}: {
  options: readonly string[];
  selected: string[];
  onToggle: (v: string) => void;
  hint?: string;
}) {
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const on = selected.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onToggle(opt)}
              className="rounded-full px-3 py-1.5 text-[13px] font-extrabold"
              style={{
                background: on ? "var(--ink)" : "var(--bg-elevated)",
                color: on ? "#fff" : "var(--ink)",
                border: `1px solid ${on ? "var(--ink)" : "var(--line)"}`,
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>
      {hint ? (
        <p className="mt-2 text-[12px] text-ink-tertiary">{hint}</p>
      ) : null}
    </div>
  );
}
