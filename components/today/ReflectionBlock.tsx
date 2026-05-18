"use client";

import {
  buildFullReflection,
  fullReflectionClosing,
  todayFocusBullets,
} from "@/lib/content/reflection";
import type { Child } from "@/types";

/**
 * "What Fokus knows about [Child] so far" — a per-session-count
 * reflection rendered between the page header and the time chips on
 * /today. Renders one of three layouts depending on how many sessions
 * the active child has logged.
 *
 *   0 sessions       → FULL card (profile summary + closing line)
 *   1-2 sessions     → MEDIUM card (eyebrow + bulleted focus list)
 *   3+ sessions      → COLLAPSED single-line caption
 *
 * The component intentionally has no children and no callbacks. It
 * reflects what the parent told the app back at them; it never claims
 * what the child will become.
 */
export default function ReflectionBlock({
  child,
  sessionCount,
}: {
  child: Child;
  sessionCount: number;
}) {
  if (sessionCount === 0) return <FullBlock child={child} />;
  if (sessionCount < 3) return <MediumBlock child={child} />;
  return <CollapsedLine child={child} />;
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-[11px] font-semibold uppercase text-ink-tertiary"
      style={{ letterSpacing: "0.1em" }}
    >
      {children}
    </p>
  );
}

function FullBlock({ child }: { child: Child }) {
  const sentences = buildFullReflection(child);
  return (
    <section
      className="my-4 rounded-sm border border-line bg-bg-elevated p-5"
      aria-label={`What Fokus knows about ${child.name} so far`}
    >
      <Eyebrow>What Fokus knows about {child.name} so far</Eyebrow>
      <div className="mt-3 space-y-1.5">
        {sentences.map((s) => (
          <p
            key={s.id}
            className="text-[15px] text-ink"
            style={{ lineHeight: 1.5 }}
          >
            {s.text}
          </p>
        ))}
      </div>
      <hr className="my-3 border-t border-line-subtle" />
      <p
        className="text-[14px] italic text-ink-secondary"
        style={{ lineHeight: 1.5 }}
      >
        {fullReflectionClosing(child)}
      </p>
    </section>
  );
}

function MediumBlock({ child }: { child: Child }) {
  const bullets = todayFocusBullets(child);
  if (bullets.length === 0) return null;
  return (
    <section
      className="my-4 rounded-sm border border-line bg-bg-elevated p-5"
      aria-label="What Fokus is paying attention to"
    >
      <Eyebrow>What Fokus is paying attention to</Eyebrow>
      <ul className="mt-3 space-y-2">
        {bullets.map((b) => (
          <li
            key={b}
            className="flex items-start gap-2.5 text-[14px] text-ink"
            style={{ lineHeight: 1.5 }}
          >
            <span
              aria-hidden
              className="mt-[7px] inline-block h-1 w-1 shrink-0 rounded-full bg-accent"
            />
            <span>{b}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[12px] text-ink-tertiary">
        This shifts as you log how moments go.
      </p>
    </section>
  );
}

function CollapsedLine({ child }: { child: Child }) {
  const bullets = todayFocusBullets(child).map((b) =>
    b.charAt(0).toLowerCase() + b.slice(1),
  );
  if (bullets.length === 0) return null;
  const text =
    bullets.length === 1
      ? `Fokus is paying attention to ${bullets[0]}.`
      : `Fokus is paying attention to ${bullets[0]} and ${bullets[1]}.`;
  return (
    <p className="my-4 text-[13px] text-ink-tertiary" style={{ lineHeight: 1.5 }}>
      {text}
    </p>
  );
}
