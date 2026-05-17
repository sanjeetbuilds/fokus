"use client";

import type { ComponentType, ReactNode, SVGProps } from "react";

import Card from "@/components/ui/Card";

export interface StatCardProps {
  label: string;
  value: ReactNode;
  icon?: ComponentType<
    SVGProps<SVGSVGElement> & { size?: number; strokeWidth?: number }
  >;
}

/**
 * Small numeric stat tile used in the Map header row. Label on top in
 * caps small, value below in title-1 weight. Optional icon shown faintly
 * next to the label.
 */
export default function StatCard({ label, value, icon: Icon }: StatCardProps) {
  return (
    <Card className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5 text-caption uppercase tracking-[0.1em] text-ink-tertiary">
        {Icon ? (
          <Icon size={12} strokeWidth={1.75} aria-hidden />
        ) : null}
        <span>{label}</span>
      </div>
      <div className="text-title-1 text-ink">{value}</div>
    </Card>
  );
}
