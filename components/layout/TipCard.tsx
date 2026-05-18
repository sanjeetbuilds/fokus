"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type Tone = "warm" | "coral";

export interface TipCardProps {
  tone: Tone;
  icon?: ReactNode;
  title: string;
  body: ReactNode;
  className?: string;
}

const TONE: Record<Tone, { bg: string; text: string }> = {
  warm: { bg: "bg-warm-bg", text: "text-warm-text" },
  coral: { bg: "bg-coral-bg", text: "text-coral-text" },
};

/**
 * Pastel tip / stat tile matching the design's two-up row on Today.
 * Neutral information container — daily prompts, frequency stats, etc.
 * Does NOT carry "level" or "score" semantics.
 */
export default function TipCard({
  tone,
  icon,
  title,
  body,
  className,
}: TipCardProps) {
  const t = TONE[tone];
  return (
    <div className={cn("flex-1 rounded-[18px] p-4", t.bg, className)}>
      {icon ? <div className="mb-1.5 text-[18px]">{icon}</div> : null}
      <p className={cn("text-[14px] font-bold", t.text)}>{title}</p>
      <p className="mt-1 text-[12px] leading-[1.5] text-ink-secondary">
        {body}
      </p>
    </div>
  );
}
