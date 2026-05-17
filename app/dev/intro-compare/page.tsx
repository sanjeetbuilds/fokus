"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";

import Card from "@/components/ui/Card";

interface Variant {
  href: string;
  label: string;
  blurb: string;
}

const VARIANTS: Variant[] = [
  {
    href: "/intro",
    label: "Baseline (current)",
    blurb: "Plain body text, centered, no chrome beyond the carousel dots.",
  },
  {
    href: "/dev/intro-typography",
    label: "Typography pass",
    blurb:
      "Editorial serif type, one emphasized phrase per slide, abstract visuals.",
  },
  {
    href: "/dev/intro-illustrated",
    label: "Illustrated",
    blurb:
      "Same body copy, with a small line-art SVG above each slide.",
  },
];

export default function IntroCompareDevPage() {
  return (
    <main className="mx-auto max-w-[640px] px-5 pb-20 pt-12">
      <p className="text-footnote uppercase tracking-[0.08em] text-ink-tertiary">
        Internal · Intro variants
      </p>
      <h1 className="mt-1 text-display text-ink">
        Compare intro versions. Pick the one that feels right.
      </h1>
      <p className="mt-3 text-body text-ink-secondary">
        Each opens the full carousel. Use Esc / browser back to return.
      </p>

      <ul className="mt-10 flex flex-col gap-3">
        {VARIANTS.map((v) => (
          <li key={v.href}>
            <Link href={v.href} className="block">
              <Card variant="interactive" className="flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-title-3 text-ink">{v.label}</p>
                  <p className="mt-1 text-footnote text-ink-secondary">
                    {v.blurb}
                  </p>
                  <p className="mt-2 font-mono text-caption text-ink-tertiary">
                    {v.href}
                  </p>
                </div>
                <ArrowRight
                  size={20}
                  strokeWidth={1.75}
                  aria-hidden
                  className="shrink-0 text-ink-tertiary"
                />
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
