"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { useToast } from "@/components/ui/Toast";
import { createChild, createParent, getCurrentParent } from "@/lib/db";
import { useAppStore } from "@/lib/store/useAppStore";

/**
 * Round-4 onboarding flow: four dark narrative slides (the "why" of Fokus)
 * followed by a single light setup form. The form captures only:
 *
 *   - parent name
 *   - child name
 *   - child age band ("0-1" / "2-4" / "4-6" / "6-9")
 *
 * The engine's deeper fields (englishConfidence, interests, struggles,
 * goesDeepOn / fleesFrom, photo) are filled in later via the post-setup
 * nudge surfaced on /today. Until then, scoring uses safe defaults and
 * the engine picks from the unfiltered library.
 */

interface AgeBand {
  label: string;
  /** Derived numeric age, clamped to the activity library's 5-10 window. */
  age: number;
}

const AGE_BANDS: AgeBand[] = [
  { label: "0–1 yr", age: 5 },   // clamped — engine cap
  { label: "2–4 yrs", age: 5 },  // clamped — engine cap
  { label: "4–6 yrs", age: 6 },
  { label: "6–9 yrs", age: 9 },
];

export default function IntroPage() {
  const router = useRouter();
  const { toast } = useToast();
  const setParent = useAppStore((s) => s.setParent);
  const setActiveChild = useAppStore((s) => s.setActiveChild);

  const [step, setStep] = useState(0); // 0..4 (slides) → 4 is setup
  const [childName, setChildName] = useState("");
  const [parentName, setParentName] = useState("");
  const [bandIdx, setBandIdx] = useState(1);
  const [busy, setBusy] = useState(false);

  const next = useCallback(() => setStep((s) => Math.min(4, s + 1)), []);

  const begin = useCallback(async () => {
    if (busy) return;
    const c = childName.trim();
    const p = parentName.trim();
    if (!c || !p) {
      toast("Both names are needed.", { tone: "danger" });
      return;
    }
    setBusy(true);
    try {
      let parent = await getCurrentParent();
      if (!parent) {
        parent = await createParent(p);
      }
      setParent(parent.id);

      const band = AGE_BANDS[bandIdx]!;
      const child = await createChild({
        parentId: parent.id,
        name: c,
        age: band.age,
        ageBand: band.label,
        grade: "",
        engagement: { goesDeepOn: [], fleesFrom: [], inBetween: [] },
        englishConfidence: "developing",
        primaryLanguage: "Other",
        interests: [],
        strengths: [],
        struggles: [],
      });
      setActiveChild(child.id);
      router.replace("/today");
    } catch (err) {
      console.error("[/intro] begin:", err);
      toast("Couldn't save. Try again.", { tone: "danger" });
      setBusy(false);
    }
  }, [
    bandIdx,
    busy,
    childName,
    parentName,
    router,
    setActiveChild,
    setParent,
    toast,
  ]);

  return (
    <main
      className="relative flex min-h-[100svh] flex-col"
      style={{ background: step < 4 ? "var(--ink)" : "var(--bg)" }}
    >
      <StatusBar dark={step < 4} />

      <div className="relative flex-1 overflow-hidden">
        {step === 0 ? <Slide0 /> : null}
        {step === 1 ? <Slide1 /> : null}
        {step === 2 ? <Slide2 /> : null}
        {step === 3 ? <Slide3 /> : null}
        {step === 4 ? (
          <SetupSlide
            childName={childName}
            setChildName={setChildName}
            parentName={parentName}
            setParentName={setParentName}
            bandIdx={bandIdx}
            setBandIdx={setBandIdx}
            onBegin={begin}
            busy={busy}
          />
        ) : null}
      </div>

      {step < 4 ? (
        <div className="px-8 pb-[calc(env(safe-area-inset-bottom)+24px)]">
          <Dots active={step} total={5} dark />
          <button
            type="button"
            onClick={next}
            className="mt-4 h-[54px] w-full rounded-full border-[1.5px] text-[16px] font-semibold transition-colors"
            style={{
              borderColor: "rgba(255,255,255,0.22)",
              color: "rgba(255,255,255,0.82)",
              letterSpacing: "-0.01em",
            }}
          >
            Continue
          </button>
        </div>
      ) : null}
    </main>
  );
}

function StatusBar({ dark }: { dark: boolean }) {
  // Faux iPhone status bar baseline, matched to the design HTML's spacing.
  // Doesn't render time — it's invisible furniture so the layout above
  // the dynamic island is consistent.
  return (
    <div
      aria-hidden
      style={{
        height: 54,
        flexShrink: 0,
        color: dark ? "rgba(255,255,255,0.55)" : "var(--ink-secondary)",
      }}
    />
  );
}

function Dots({
  active,
  total,
  dark,
}: {
  active: number;
  total: number;
  dark?: boolean;
}) {
  return (
    <ol
      aria-label={`Step ${active + 1} of ${total}`}
      className="flex justify-center gap-1.5"
    >
      {Array.from({ length: total }, (_, i) => (
        <li
          key={i}
          aria-current={i === active ? "step" : undefined}
          className="h-1.5 rounded-full transition-all duration-300"
          style={{
            width: i === active ? 20 : 6,
            backgroundColor:
              i === active
                ? dark
                  ? "rgba(255,255,255,0.82)"
                  : "var(--ink)"
                : dark
                  ? "rgba(255,255,255,0.18)"
                  : "rgba(37,38,48,0.14)",
          }}
        />
      ))}
    </ol>
  );
}

// ---------- Slide 0: Schools measure ----------

function Slide0() {
  return (
    <SlideShell illustration={<MeasureIllo />}>
      <h1
        className="text-[38px] font-extrabold text-white"
        style={{ lineHeight: 1.1, letterSpacing: "-0.03em" }}
      >
        Schools measure
        <br />
        visible things.
      </h1>
      <p
        className="mt-3 text-[18px] font-light"
        style={{
          color: "rgba(255,255,255,0.38)",
          lineHeight: 1.6,
        }}
      >
        But invisible traits
        <br />
        shape lives.
      </p>
    </SlideShell>
  );
}

// ---------- Slide 1: Four traits ----------

function Slide1() {
  return (
    <SlideShell illustration={<TraitsIllo />}>
      <h1
        className="text-[30px] font-extrabold text-white"
        style={{ lineHeight: 1.15, letterSpacing: "-0.03em" }}
      >
        Confidence.
        <br />
        Curiosity.
        <br />
        Resilience.
        <br />
        Empathy.
      </h1>
      <p
        className="mt-3 text-[18px] font-light"
        style={{ color: "rgba(255,255,255,0.38)", lineHeight: 1.6 }}
      >
        Built quietly
        <br />
        in daily moments.
      </p>
    </SlideShell>
  );
}

// ---------- Slide 2: Parents don't need pressure ----------

function Slide2() {
  return (
    <SlideShell illustration={<ParentChildIllo />}>
      <h1
        className="text-[38px] font-extrabold text-white"
        style={{ lineHeight: 1.1, letterSpacing: "-0.03em" }}
      >
        Parents don&apos;t need
        <br />
        more pressure.
      </h1>
      <p
        className="mt-3 text-[18px] font-light"
        style={{ color: "rgba(255,255,255,0.38)", lineHeight: 1.6 }}
      >
        They need
        <br />
        clearer attention.
      </p>
    </SlideShell>
  );
}

// ---------- Slide 3: One interaction ----------

function Slide3() {
  return (
    <SlideShell illustration={<RingsIllo />}>
      <h1
        className="text-[38px] font-extrabold text-white"
        style={{ lineHeight: 1.1, letterSpacing: "-0.03em" }}
      >
        One meaningful
        <br />
        interaction a day
        <br />
        is enough.
      </h1>
    </SlideShell>
  );
}

function SlideShell({
  illustration,
  children,
}: {
  illustration: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section
      className="flex h-full flex-col"
      style={{ animation: "fokusObFade 0.5s cubic-bezier(.22,1,.36,1)" }}
    >
      <div className="relative h-[256px] flex-shrink-0 overflow-hidden">
        {illustration}
      </div>
      <div className="flex flex-1 flex-col justify-center px-8 pt-6 pb-4">
        {children}
      </div>
      <style jsx global>{`
        @keyframes fokusObFade {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fokusBlob1 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(10px, 14px); }
        }
        @keyframes fokusBlob2 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-12px, 10px); }
        }
        @keyframes fokusBlob3 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(14px, -10px); }
        }
        @keyframes fokusBlob4 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-10px, -14px); }
        }
        @keyframes fokusTraitPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.04); }
        }
        @keyframes fokusRingOut {
          0% { transform: translate(-50%, -50%) scale(0.7); opacity: 0.45; }
          100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
        }
        @keyframes fokusBreathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.055); }
        }
        @keyframes fokusCenterGlow {
          0%, 100% {
            box-shadow:
              0 0 28px rgba(156,165,255,0.55),
              0 0 56px rgba(156,165,255,0.2);
          }
          50% {
            box-shadow:
              0 0 50px rgba(156,165,255,0.85),
              0 0 100px rgba(156,165,255,0.4);
          }
        }
      `}</style>
    </section>
  );
}

// ---------- Illustrations ----------

function Blob({
  width,
  height,
  top,
  left,
  right,
  bottom,
  color,
  blur,
  opacity,
  animation,
}: {
  width: number;
  height: number;
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
  color: string;
  blur: number;
  opacity: number;
  animation: string;
}) {
  return (
    <span
      aria-hidden
      className="absolute rounded-full"
      style={{
        width,
        height,
        top,
        left,
        right,
        bottom,
        background: color,
        filter: `blur(${blur}px)`,
        opacity,
        animation,
      }}
    />
  );
}

function MeasureIllo() {
  return (
    <>
      <Blob width={170} height={155} top={-35} left={-35} color="var(--accent)" blur={38} opacity={0.65} animation="fokusBlob1 6s ease-in-out infinite" />
      <Blob width={150} height={140} top={-20} right={-25} color="var(--amber)" blur={34} opacity={0.6} animation="fokusBlob2 5s ease-in-out infinite" />
      <Blob width={145} height={130} bottom={-25} right={10} color="var(--coral)" blur={32} opacity={0.55} animation="fokusBlob3 7s ease-in-out infinite" />
      <Blob width={130} height={120} bottom={-15} left={15} color="var(--lav)" blur={30} opacity={0.6} animation="fokusBlob4 5.5s ease-in-out infinite" />
      <svg
        aria-hidden
        className="absolute left-1/2 top-1/2"
        style={{ transform: "translate(-50%, -52%)" }}
        width="158"
        height="158"
        viewBox="0 0 158 158"
        fill="none"
      >
        <rect x="14" y="14" width="130" height="130" rx="8" stroke="rgba(255,255,255,0.28)" strokeWidth="1.5" strokeDasharray="7 5" fill="rgba(0,0,0,0.22)" />
        <line x1="14" y1="5" x2="14" y2="14" stroke="rgba(255,255,255,0.45)" strokeWidth="1.2" />
        <line x1="53" y1="8" x2="53" y2="14" stroke="rgba(255,255,255,0.28)" strokeWidth="1" />
        <line x1="92" y1="8" x2="92" y2="14" stroke="rgba(255,255,255,0.28)" strokeWidth="1" />
        <line x1="144" y1="5" x2="144" y2="14" stroke="rgba(255,255,255,0.45)" strokeWidth="1.2" />
        <line x1="14" y1="9" x2="144" y2="9" stroke="rgba(255,255,255,0.18)" strokeWidth="0.8" />
        <text x="19" y="8" fill="rgba(255,255,255,0.3)" fontSize="7" fontFamily="monospace">0</text>
        <text x="86" y="8" fill="rgba(255,255,255,0.3)" fontSize="7" fontFamily="monospace">50</text>
        <text x="136" y="8" fill="rgba(255,255,255,0.3)" fontSize="7" fontFamily="monospace">cm</text>
        <circle cx="63" cy="79" r="22" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.32)" strokeWidth="1.5" />
        <polygon points="105,58 128,98 82,98" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.28)" strokeWidth="1.5" />
        <line x1="14" y1="79" x2="40" y2="79" stroke="rgba(255,255,255,0.18)" strokeWidth="0.8" strokeDasharray="3 2" />
        <text x="16" y="76" fill="rgba(255,255,255,0.32)" fontSize="7" fontFamily="monospace">3.2</text>
      </svg>
      <div
        aria-hidden
        className="absolute bottom-3.5 left-0 right-0 text-center text-[10px] font-semibold uppercase"
        style={{ color: "rgba(255,255,255,0.28)", letterSpacing: "0.09em" }}
      >
        what gets measured
      </div>
      <div
        aria-hidden
        className="absolute left-4 top-[18px] text-[10px] font-semibold uppercase"
        style={{ color: "rgba(255,255,255,0.32)", letterSpacing: "0.07em" }}
      >
        invisible
      </div>
    </>
  );
}

function TraitsIllo() {
  const traits = [
    { emoji: "💪", label: "Confidence", delay: "0s", dur: "3s" },
    { emoji: "🔍", label: "Curiosity", delay: "0.4s", dur: "3.4s" },
    { emoji: "🧠", label: "Resilience", delay: "0.8s", dur: "3.2s" },
    { emoji: "💚", label: "Empathy", delay: "1.2s", dur: "2.8s" },
  ];
  return (
    <>
      <Blob width={168} height={160} top={-30} left={-30} color="var(--accent)" blur={32} opacity={0.7} animation="fokusBlob1 5.5s ease-in-out infinite" />
      <Blob width={162} height={155} top={-30} right={-30} color="var(--amber)" blur={32} opacity={0.65} animation="fokusBlob2 6.5s ease-in-out infinite" />
      <Blob width={155} height={148} bottom={-30} left={-30} color="var(--lav)" blur={32} opacity={0.65} animation="fokusBlob3 5s ease-in-out infinite" />
      <Blob width={160} height={152} bottom={-30} right={-30} color="var(--coral)" blur={32} opacity={0.62} animation="fokusBlob4 7s ease-in-out infinite" />
      <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
        {traits.map((t) => (
          <div key={t.label} className="flex flex-col items-center justify-center gap-1.5 p-2.5">
            <span
              aria-hidden
              className="flex h-[42px] w-[42px] items-center justify-center rounded-full border-[1.5px] text-[20px]"
              style={{
                borderColor: "rgba(255,255,255,0.35)",
                animation: `fokusTraitPulse ${t.dur} ${t.delay} ease-in-out infinite`,
              }}
            >
              {t.emoji}
            </span>
            <span
              className="text-[12px] font-bold"
              style={{ color: "rgba(255,255,255,0.8)", letterSpacing: "0.01em" }}
            >
              {t.label}
            </span>
          </div>
        ))}
      </div>
      <span
        aria-hidden
        className="absolute left-1/2 top-1/2"
        style={{
          transform: "translate(-50%, -50%)",
          width: 1,
          height: 60,
          background: "rgba(255,255,255,0.12)",
        }}
      />
      <span
        aria-hidden
        className="absolute left-1/2 top-1/2"
        style={{
          transform: "translate(-50%, -50%)",
          height: 1,
          width: 60,
          background: "rgba(255,255,255,0.12)",
        }}
      />
    </>
  );
}

function ParentChildIllo() {
  return (
    <div className="flex h-full items-center justify-center">
      <Blob width={220} height={180} top={40} left={undefined} color="var(--amber)" blur={50} opacity={0.5} animation="fokusBlob1 6s ease-in-out infinite" />
      {/* Parent figure */}
      <div
        aria-hidden
        className="absolute"
        style={{
          left: "50%",
          top: "50%",
          transform: "translate(-90px, -52%)",
          width: 100,
          height: 120,
          background: "rgba(244,200,74,0.82)",
          borderRadius: "50% 50% 44% 44%",
          animation: "fokusBreathe 4s ease-in-out infinite",
          boxShadow: "0 8px 32px rgba(244,200,74,0.3)",
        }}
      />
      <div
        aria-hidden
        className="absolute"
        style={{
          left: "50%",
          top: "50%",
          transform: "translate(-90px, -52%) translateY(-62px)",
          width: 54,
          height: 54,
          marginLeft: 23,
          background: "rgba(244,200,74,0.9)",
          borderRadius: "50%",
          animation: "fokusBreathe 4s ease-in-out infinite",
        }}
      />
      {/* Child figure */}
      <div
        aria-hidden
        className="absolute"
        style={{
          left: "50%",
          top: "50%",
          transform: "translate(18px, -40%)",
          width: 68,
          height: 82,
          background: "rgba(197,191,239,0.85)",
          borderRadius: "50% 50% 44% 44%",
          animation: "fokusBreathe 4s 0.6s ease-in-out infinite",
          boxShadow: "0 6px 22px rgba(197,191,239,0.3)",
        }}
      />
      <div
        aria-hidden
        className="absolute"
        style={{
          left: "50%",
          top: "50%",
          transform: "translate(18px, -40%) translateY(-44px)",
          width: 38,
          height: 38,
          marginLeft: 15,
          background: "rgba(197,191,239,0.92)",
          borderRadius: "50%",
          animation: "fokusBreathe 4s 0.6s ease-in-out infinite",
        }}
      />
      {/* Connection line */}
      <svg
        aria-hidden
        className="absolute"
        style={{ left: "50%", top: "50%", transform: "translate(-40px, -50%)" }}
        width="60"
        height="24"
        viewBox="0 0 60 24"
        fill="none"
      >
        <path
          d="M4 12 Q30 4 56 12"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="4 3"
        />
      </svg>
      <div className="absolute bottom-[18px] left-0 right-0 flex justify-center gap-8">
        <span
          className="text-[10px] font-bold uppercase"
          style={{ color: "rgba(244,200,74,0.6)", letterSpacing: "0.06em" }}
        >
          Parent
        </span>
        <span
          className="text-[10px] font-bold uppercase"
          style={{ color: "rgba(197,191,239,0.6)", letterSpacing: "0.06em" }}
        >
          Child
        </span>
      </div>
    </div>
  );
}

function RingsIllo() {
  return (
    <div className="flex h-full items-center justify-center">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          aria-hidden
          className="absolute rounded-full border-[1.5px]"
          style={{
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            width: 240,
            height: 240,
            borderColor: "rgba(156,165,255,0.18)",
            animation: `fokusRingOut 3s ${i}s ease-out infinite`,
          }}
        />
      ))}
      <span
        aria-hidden
        className="absolute rounded-full border-[1.5px]"
        style={{
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: 148,
          height: 148,
          borderColor: "rgba(156,165,255,0.28)",
        }}
      />
      <Blob width={180} height={180} top={undefined} left={undefined} color="var(--accent)" blur={45} opacity={0.55} animation="" />
      <div
        className="relative flex h-[92px] w-[92px] items-center justify-center rounded-full"
        style={{
          background: "var(--accent)",
          animation: "fokusCenterGlow 3s ease-in-out infinite",
        }}
      >
        <span
          aria-hidden
          className="flex h-9 w-9 items-center justify-center rounded-full text-[18px]"
          style={{ background: "rgba(255,255,255,0.25)" }}
        >
          ✦
        </span>
      </div>
      <div
        aria-hidden
        className="absolute left-0 right-0 text-center text-[11px] font-bold uppercase"
        style={{
          top: 20,
          color: "rgba(255,255,255,0.3)",
          letterSpacing: "0.08em",
        }}
      >
        one moment a day
      </div>
    </div>
  );
}

// ---------- Setup slide (light bg, form) ----------

function SetupSlide({
  childName,
  setChildName,
  parentName,
  setParentName,
  bandIdx,
  setBandIdx,
  onBegin,
  busy,
}: {
  childName: string;
  setChildName: (v: string) => void;
  parentName: string;
  setParentName: (v: string) => void;
  bandIdx: number;
  setBandIdx: (i: number) => void;
  onBegin: () => void;
  busy: boolean;
}) {
  return (
    <section
      className="flex h-full flex-col bg-bg"
      style={{ animation: "fokusObFade 0.5s cubic-bezier(.22,1,.36,1)" }}
    >
      <div className="flex flex-1 flex-col px-8 pt-2 pb-4">
        <p
          className="text-[11px] font-bold uppercase"
          style={{ color: "var(--accent)", letterSpacing: "0.08em" }}
        >
          Welcome to Fokus
        </p>
        <h1
          className="mt-3 text-[38px] font-extrabold text-ink"
          style={{ lineHeight: 1.1, letterSpacing: "-0.03em" }}
        >
          Let&apos;s begin.
        </h1>
        <p className="mt-2 text-[14px] text-ink-secondary" style={{ lineHeight: 1.6 }}>
          A quiet space to notice
          <br />
          what matters most.
        </p>
        <div className="mt-6">
          <Dots active={4} total={5} />
        </div>

        <div className="mt-6 flex flex-1 flex-col gap-3.5">
          <Field label="Your child's name">
            <input
              className="h-[52px] w-full rounded-md border-[1.5px] bg-white px-4 text-[16px] text-ink"
              style={{ borderColor: "var(--line)" }}
              value={childName}
              onChange={(e) => setChildName(e.target.value)}
              placeholder="Their name"
              autoComplete="off"
              spellCheck={false}
            />
          </Field>
          <Field label="Your name">
            <input
              className="h-[52px] w-full rounded-md border-[1.5px] bg-white px-4 text-[16px] text-ink"
              style={{ borderColor: "var(--line)" }}
              value={parentName}
              onChange={(e) => setParentName(e.target.value)}
              placeholder="Your name"
              autoComplete="given-name"
              spellCheck={false}
            />
          </Field>
          <Field label="Child's age">
            <div className="flex flex-wrap gap-2">
              {AGE_BANDS.map((band, i) => {
                const on = bandIdx === i;
                return (
                  <button
                    type="button"
                    key={band.label}
                    onClick={() => setBandIdx(i)}
                    className="rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors"
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
          </Field>
        </div>
      </div>

      <div className="px-8 pb-[calc(env(safe-area-inset-bottom)+44px)]">
        <button
          type="button"
          onClick={onBegin}
          disabled={busy}
          className="h-[54px] w-full rounded-full bg-ink text-[16px] font-bold text-white transition-opacity disabled:opacity-60"
        >
          {busy ? "Setting up…" : "Begin your journey →"}
        </button>
        <p className="mt-2.5 text-center text-[12px] text-ink-quaternary">
          Your data stays private, always.
        </p>
      </div>
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        className="mb-1.5 block text-[11px] font-bold uppercase"
        style={{ color: "var(--ink-secondary)", letterSpacing: "0.05em" }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}
