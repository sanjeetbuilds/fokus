"use client";

import { ChevronLeft, Plus } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

import Button from "@/components/ui/Button";
import Chip from "@/components/ui/Chip";
import Input from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import {
  ENGLISH_CONFIDENCE_OPTIONS,
  FLEES_FROM_OPTIONS,
  GOES_DEEP_ON_OPTIONS,
  GRADE_OPTIONS,
  INTEREST_OPTIONS,
  ONBOARDING_RECOMMENDED,
  PRIMARY_LANGUAGE_OPTIONS,
  STRENGTH_OPTIONS,
  STRUGGLE_OPTIONS,
  SUPPORTED_AGE_RANGE,
} from "@/lib/content/onboarding";
import { createChild, getCurrentParent } from "@/lib/db";
import { useAppStore } from "@/lib/store/useAppStore";
import { ageFromDob } from "@/lib/utils/dates";
import type { EnglishConfidence } from "@/types";

const TOTAL_STEPS = 8;

interface Draft {
  name: string;
  dateOfBirth: string; // YYYY-MM-DD
  grade: string | null;
  goesDeepOn: string[];
  fleesFrom: string[];
  englishConfidence: EnglishConfidence | null;
  primaryLanguage: string | null;
  interests: string[];
  strengths: string[];
  struggles: string[];
}

const EMPTY_DRAFT: Draft = {
  name: "",
  dateOfBirth: "",
  grade: null,
  goesDeepOn: [],
  fleesFrom: [],
  englishConfidence: null,
  primaryLanguage: null,
  interests: [],
  strengths: [],
  struggles: [],
};

export default function ChildOnboardingPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-[100svh] items-center justify-center">
          <p className="text-footnote text-ink-tertiary">Loading…</p>
        </main>
      }
    >
      <ChildOnboardingBody />
    </Suspense>
  );
}

function ChildOnboardingBody() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const setActiveChild = useAppStore((s) => s.setActiveChild);
  const parentIdFromStore = useAppStore((s) => s.parentId);

  // When invoked from /profile via "Add another child", we want to return
  // to /profile after the new child is created (and active). Otherwise (first
  // run) we send them to /today so they can immediately try a moment.
  const returnTo =
    searchParams?.get("return") === "profile" ? "/profile" : "/today";

  const [step, setStep] = useState<number>(1);
  const [data, setData] = useState<Draft>(EMPTY_DRAFT);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    }
  }, [step]);

  const set = useCallback(
    <K extends keyof Draft>(key: K, value: Draft[K]) =>
      setData((d) => ({ ...d, [key]: value })),
    [],
  );

  const toggleArray = useCallback(
    (
      key: "goesDeepOn" | "fleesFrom" | "interests" | "strengths" | "struggles",
      value: string,
    ) =>
      setData((d) => {
        const cur = d[key];
        if (cur.includes(value)) {
          return { ...d, [key]: cur.filter((v) => v !== value) };
        }
        return { ...d, [key]: [...cur, value] };
      }),
    [],
  );

  const valid = useMemo(() => stepValid(step, data), [step, data]);

  const onBack = useCallback(() => {
    if (step === 1) {
      router.replace("/onboarding/parent");
      return;
    }
    setStep((s) => s - 1);
  }, [router, step]);

  const onContinue = useCallback(async () => {
    if (!valid || busy) return;

    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1);
      return;
    }

    setBusy(true);
    try {
      let parentId = parentIdFromStore;
      if (!parentId) {
        const parent = await getCurrentParent();
        if (!parent) {
          toast("No parent profile. Restart onboarding.", { tone: "danger" });
          router.replace("/intro");
          return;
        }
        parentId = parent.id;
      }

      const ageInfo = ageFromDob(data.dateOfBirth);
      const ageYears = ageInfo?.years ?? 0;

      const child = await createChild({
        parentId,
        name: data.name.trim(),
        age: ageYears,
        dateOfBirth: data.dateOfBirth,
        grade: data.grade!,
        engagement: {
          goesDeepOn: data.goesDeepOn,
          fleesFrom: data.fleesFrom,
          inBetween: [],
        },
        englishConfidence: data.englishConfidence ?? "developing",
        primaryLanguage: data.primaryLanguage ?? "Other",
        interests: data.interests,
        strengths: data.strengths,
        struggles: data.struggles,
      });
      setActiveChild(child.id);
      router.replace(returnTo);
    } catch (err) {
      console.error("[/onboarding/child] createChild:", err);
      toast("Couldn't save. Try again.", { tone: "danger" });
      setBusy(false);
    }
  }, [
    busy,
    data,
    parentIdFromStore,
    returnTo,
    router,
    setActiveChild,
    step,
    toast,
    valid,
  ]);

  const continueLabel =
    step === TOTAL_STEPS && data.name.trim()
      ? `Start with ${data.name.trim()} →`
      : "Continue";

  return (
    <main className="relative flex min-h-[100svh] flex-col bg-bg">
      <div className="px-5 pt-[calc(env(safe-area-inset-top)+12px)]">
        <div className="-mx-2 flex h-9 items-center">
          <button
            type="button"
            onClick={onBack}
            disabled={busy}
            aria-label="Back"
            className="inline-flex h-9 items-center gap-1 rounded-md px-2 text-callout text-accent transition-colors duration-fast ease-out hover:text-accent-pressed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50"
          >
            <ChevronLeft size={20} strokeWidth={1.75} aria-hidden />
            <span>Back</span>
          </button>
        </div>
        {step < TOTAL_STEPS ? (
          <ProgressBar current={step} total={TOTAL_STEPS} />
        ) : null}
      </div>

      <section className="flex-1 px-5 pb-32 pt-6">
        <StepBody
          step={step}
          data={data}
          set={set}
          toggleArray={toggleArray}
        />
      </section>

      <div className="sticky bottom-0 left-0 right-0 border-t border-line-subtle bg-bg px-5 pb-[calc(env(safe-area-inset-bottom)+16px)] pt-4">
        <Button
          onClick={onContinue}
          fullWidth
          size="lg"
          disabled={!valid || busy}
        >
          {continueLabel}
        </Button>
      </div>
    </main>
  );
}

// ---------- progress ----------

function ProgressBar({ current, total }: { current: number; total: number }) {
  return (
    <ol
      aria-label={`Step ${current} of ${total}`}
      className="mt-2 flex gap-1.5"
    >
      {Array.from({ length: total }, (_, i) => (
        <li
          key={i}
          aria-current={i + 1 === current ? "step" : undefined}
          className={`h-1.5 flex-1 rounded-full transition-colors duration-200 ease-out ${
            i + 1 <= current ? "bg-accent" : "bg-line"
          }`}
        />
      ))}
    </ol>
  );
}

// ---------- step bodies ----------

interface StepBodyProps {
  step: number;
  data: Draft;
  set: <K extends keyof Draft>(key: K, value: Draft[K]) => void;
  toggleArray: (
    key: "goesDeepOn" | "fleesFrom" | "interests" | "strengths" | "struggles",
    value: string,
  ) => void;
}

function StepBody({ step, data, set, toggleArray }: StepBodyProps) {
  switch (step) {
    case 1:
      return <Step1 data={data} set={set} />;
    case 2:
      return (
        <ChipStep
          header="What do they love doing?"
          subtext="Activities they happily spend long stretches on."
          options={GOES_DEEP_ON_OPTIONS}
          selected={data.goesDeepOn}
          onToggle={(v) => toggleArray("goesDeepOn", v)}
          hint={recommendedHint(ONBOARDING_RECOMMENDED.goesDeepOn)}
        />
      );
    case 3:
      return (
        <ChipStep
          header="What do they avoid?"
          subtext="Honest answer. This is where we'll be gentle."
          options={FLEES_FROM_OPTIONS}
          selected={data.fleesFrom}
          onToggle={(v) => toggleArray("fleesFrom", v)}
          hint="Select all that apply, or skip if none fit."
        />
      );
    case 4:
      return <Step4 data={data} set={set} />;
    case 5:
      return (
        <Step5
          data={data}
          set={set}
          toggleArray={toggleArray}
        />
      );
    case 6:
      return (
        <ChipStep
          header="What are they good at?"
          subtext="Honest, not aspirational. What do you SEE?"
          options={STRENGTH_OPTIONS}
          selected={data.strengths}
          onToggle={(v) => toggleArray("strengths", v)}
          hint={recommendedHint(ONBOARDING_RECOMMENDED.strengths)}
        />
      );
    case 7:
      return (
        <ChipStep
          header="Where do they get stuck?"
          subtext="Real challenges right now. We'll work on these gradually."
          options={STRUGGLE_OPTIONS}
          selected={data.struggles}
          onToggle={(v) => toggleArray("struggles", v)}
          hint="Select all that apply, or skip if none fit."
        />
      );
    case 8:
      return <Step8 data={data} />;
    default:
      return null;
  }
}

// ---------- step 1: name + DOB + grade ----------

function Step1({
  data,
  set,
}: {
  data: Draft;
  set: <K extends keyof Draft>(key: K, value: Draft[K]) => void;
}) {
  const today = useMemo(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  }, []);
  // Sensible max bound on the DOB input so the native picker doesn't let
  // the user pick "tomorrow." Min bound is generous (20 years ago) so it
  // doesn't fight legitimate input; we error post-hoc if age is out of range.
  const minDob = useMemo(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 20);
    return d.toISOString().slice(0, 10);
  }, []);

  const ageInfo = ageFromDob(data.dateOfBirth);
  const ageError = (() => {
    if (!data.dateOfBirth) return null;
    if (!ageInfo) return "Pick a date in the past.";
    if (ageInfo.years < SUPPORTED_AGE_RANGE.min) {
      return `Fokus is built for ages ${SUPPORTED_AGE_RANGE.min}-${SUPPORTED_AGE_RANGE.max}. Come back when they're a little older.`;
    }
    if (ageInfo.years > SUPPORTED_AGE_RANGE.max) {
      return `Fokus is built for ages ${SUPPORTED_AGE_RANGE.min}-${SUPPORTED_AGE_RANGE.max}. We don't yet cover older kids.`;
    }
    return null;
  })();

  const ageHint =
    ageInfo && !ageError
      ? `That makes them ${formatAge(ageInfo)}.`
      : undefined;

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="font-display text-title-1 leading-[1.15] text-ink">About your child</h1>
      </header>

      <Input
        label="Their name"
        value={data.name}
        onChange={(e) => set("name", e.target.value)}
        autoFocus
        autoComplete="off"
        spellCheck={false}
        placeholder="e.g. Aarav"
      />

      <Input
        label="Date of birth"
        type="date"
        value={data.dateOfBirth}
        onChange={(e) => set("dateOfBirth", e.target.value)}
        min={minDob}
        max={today}
        hint={ageHint}
        error={ageError ?? undefined}
      />

      <FieldGroup label="Class">
        <div className="flex flex-wrap gap-2">
          {GRADE_OPTIONS.map((g) => (
            <Chip
              key={g}
              selected={data.grade === g}
              onClick={() => set("grade", g)}
            >
              {g}
            </Chip>
          ))}
        </div>
      </FieldGroup>
    </div>
  );
}

function formatAge({ years, months }: { years: number; months: number }): string {
  const y = `${years} year${years === 1 ? "" : "s"}`;
  if (months === 0) return y;
  const m = `${months} month${months === 1 ? "" : "s"}`;
  return `${y} and ${m}`;
}

// ---------- step 4: language ----------

function Step4({
  data,
  set,
}: {
  data: Draft;
  set: <K extends keyof Draft>(key: K, value: Draft[K]) => void;
}) {
  const primaryForCopy = data.primaryLanguage ?? "";

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="font-display text-title-1 leading-[1.15] text-ink">
          How comfortable is your child with English?
        </h1>
      </header>

      <div
        role="radiogroup"
        aria-label="English confidence"
        className="flex flex-col gap-3"
      >
        {ENGLISH_CONFIDENCE_OPTIONS.map((opt) => {
          const selected = data.englishConfidence === opt.value;
          return (
            <button
              type="button"
              key={opt.value}
              role="radio"
              aria-checked={selected}
              onClick={() => set("englishConfidence", opt.value)}
              className={`text-left rounded-lg border p-4 transition-colors duration-fast ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                selected
                  ? "border-accent bg-accent-bg"
                  : "border-line bg-bg-elevated hover:border-line"
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  aria-hidden
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                    selected ? "border-accent" : "border-line"
                  }`}
                >
                  {selected ? (
                    <span className="h-2.5 w-2.5 rounded-full bg-accent" />
                  ) : null}
                </span>
                <span className="text-headline text-ink">{opt.label}</span>
              </div>
              <p className="mt-2 pl-8 text-footnote text-ink-secondary">
                {opt.description(primaryForCopy)}
              </p>
            </button>
          );
        })}
      </div>

      <FieldGroup label="Primary language at home">
        <div className="flex flex-wrap gap-2">
          {PRIMARY_LANGUAGE_OPTIONS.map((lang) => (
            <Chip
              key={lang}
              selected={data.primaryLanguage === lang}
              onClick={() => set("primaryLanguage", lang)}
            >
              {lang}
            </Chip>
          ))}
        </div>
      </FieldGroup>
    </div>
  );
}

// ---------- step 5: interests with custom entries ----------

function Step5({
  data,
  set,
  toggleArray,
}: {
  data: Draft;
  set: <K extends keyof Draft>(key: K, value: Draft[K]) => void;
  toggleArray: (
    key: "goesDeepOn" | "fleesFrom" | "interests" | "strengths" | "struggles",
    value: string,
  ) => void;
}) {
  const [draft, setDraft] = useState("");
  const presets = INTEREST_OPTIONS as readonly string[];
  // Anything in data.interests that isn't a preset is a custom entry;
  // render those as additional chips so the user sees what they typed.
  const customInterests = useMemo(
    () => data.interests.filter((i) => !presets.includes(i)),
    [data.interests, presets],
  );

  const addCustom = (event?: FormEvent) => {
    event?.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed) return;
    if (!data.interests.includes(trimmed)) {
      set("interests", [...data.interests, trimmed]);
    }
    setDraft("");
  };

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-title-1 leading-[1.15] text-ink">What lights them up?</h1>
        <p className="mt-2 text-body text-ink-secondary">
          The stuff they genuinely love. We use these to make activities feel
          like THEIR thing.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {presets.map((opt) => (
          <Chip
            key={opt}
            selected={data.interests.includes(opt)}
            onClick={() => toggleArray("interests", opt)}
          >
            {opt}
          </Chip>
        ))}
        {customInterests.map((opt) => (
          <Chip
            key={opt}
            selected
            onClick={() => toggleArray("interests", opt)}
          >
            {opt}
          </Chip>
        ))}
      </div>

      <p className="text-footnote text-ink-tertiary">
        {recommendedHint(ONBOARDING_RECOMMENDED.interests)}
      </p>

      <form onSubmit={addCustom} className="flex items-end gap-2">
        <div className="flex-1">
          <Input
            label="+ Add your own"
            placeholder="e.g. Pokémon, F1 cars"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            autoComplete="off"
            spellCheck={false}
          />
        </div>
        <Button
          type="submit"
          variant="secondary"
          size="md"
          disabled={!draft.trim()}
          leftIcon={<Plus size={16} strokeWidth={1.75} aria-hidden />}
        >
          Add
        </Button>
      </form>
    </div>
  );
}

// ---------- step 8: closing ----------

function Step8({ data }: { data: Draft }) {
  const name = data.name.trim() || "your child";
  return (
    <div className="flex flex-col gap-6 pt-8">
      <h1 className="font-display text-title-1 leading-[1.15] text-ink">
        You&apos;re ready.
      </h1>

      <p className="text-body-large text-ink-secondary">
        Each day, Fokus gives you one moment to share with{" "}
        <span className="text-ink">{name}</span>. Five to twenty-five minutes.
        Whatever you have.
      </p>

      <p className="text-body-large text-ink-secondary">
        After, log how it went. The app learns and adjusts.
      </p>

      <p className="text-body-large text-ink-secondary">
        This is for you, not for {name}. They&apos;ll never see this app.
        They&apos;ll just feel a parent who&apos;s quietly paying attention to
        the right things.
      </p>
    </div>
  );
}

// ---------- shared step pieces ----------

function ChipStep({
  header,
  subtext,
  options,
  selected,
  onToggle,
  hint,
}: {
  header: string;
  subtext: string;
  options: readonly string[];
  selected: string[];
  onToggle: (value: string) => void;
  hint: string;
}) {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-title-1 leading-[1.15] text-ink">{header}</h1>
        <p className="mt-2 text-body text-ink-secondary">{subtext}</p>
      </header>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <Chip
            key={opt}
            selected={selected.includes(opt)}
            onClick={() => onToggle(opt)}
          >
            {opt}
          </Chip>
        ))}
      </div>
      <p className="text-footnote text-ink-tertiary">{hint}</p>
    </div>
  );
}

function FieldGroup({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-footnote font-medium text-ink-secondary">{label}</p>
      {children}
      {hint ? (
        <p className="text-footnote text-ink-tertiary">{hint}</p>
      ) : null}
    </div>
  );
}

function recommendedHint(range: { min: number; max: number }): string {
  return `Pick your top ${range.min} to ${range.max}. No need to be exhaustive.`;
}

// ---------- validation ----------

function stepValid(step: number, d: Draft): boolean {
  switch (step) {
    case 1: {
      if (d.name.trim().length === 0) return false;
      if (d.grade == null) return false;
      const age = ageFromDob(d.dateOfBirth);
      if (!age) return false;
      if (
        age.years < SUPPORTED_AGE_RANGE.min ||
        age.years > SUPPORTED_AGE_RANGE.max
      ) {
        return false;
      }
      return true;
    }
    case 4:
      // Keep Step 4 hard-required: the engine genuinely needs englishConfidence
      // to score correctly (Rule 3). Defaulting it would silently mis-score
      // every new child. primaryLanguage is also referenced in copy.
      return d.englishConfidence != null && d.primaryLanguage != null;
    case 2:
    case 3:
    case 5:
    case 6:
    case 7:
      // Soft steps, always advanceable.
      return true;
    case 8: {
      // Final commit re-checks the truly required fields.
      if (d.name.trim().length === 0) return false;
      if (d.grade == null) return false;
      const age = ageFromDob(d.dateOfBirth);
      if (!age) return false;
      return d.englishConfidence != null && d.primaryLanguage != null;
    }
    default:
      return false;
  }
}
