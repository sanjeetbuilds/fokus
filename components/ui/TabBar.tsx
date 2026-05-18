"use client";

import type { ComponentType, SVGProps } from "react";
import { cn } from "@/lib/utils/cn";

export type TabItem = {
  key: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement> & { size?: number; strokeWidth?: number }>;
  onClick?: () => void;
};

export interface TabBarProps {
  tabs: TabItem[];
  activeKey: string;
  onChange?: (key: string) => void;
  className?: string;
}

/**
 * Bottom navigation. Inactive tabs show icon + tiny label underneath.
 * Active tab collapses the label and renders icon + label inline inside a
 * light-green pill — mirrors the Fokus design's `.nb-pill` pattern.
 */
export default function TabBar({
  tabs,
  activeKey,
  onChange,
  className,
}: TabBarProps) {
  return (
    <nav
      aria-label="Primary"
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg-elevated",
        "pb-[env(safe-area-inset-bottom)]",
        className,
      )}
    >
      <ul className="mx-auto flex w-full max-w-[540px] items-start justify-around pt-2">
        {tabs.slice(0, 4).map((tab) => {
          const isActive = tab.key === activeKey;
          const Icon = tab.icon;
          return (
            <li key={tab.key} className="min-w-[56px]">
              <button
                type="button"
                aria-current={isActive ? "page" : undefined}
                onClick={() => {
                  tab.onClick?.();
                  onChange?.(tab.key);
                }}
                className={cn(
                  "flex h-14 w-full flex-col items-center justify-start gap-0.5 select-none",
                  "transition-colors duration-fast ease-out",
                  "focus-visible:outline-none focus-visible:rounded-full focus-visible:ring-2 focus-visible:ring-accent",
                )}
              >
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full transition-all duration-fast ease-out",
                    isActive
                      ? "bg-accent-bg px-3.5 py-1.5 text-accent-mid"
                      : "px-2.5 py-1.5 text-ink-quaternary",
                  )}
                >
                  <Icon size={20} strokeWidth={1.8} aria-hidden />
                  {isActive ? (
                    <span className="text-[13px] font-semibold leading-none">
                      {tab.label}
                    </span>
                  ) : null}
                </span>
                {!isActive ? (
                  <span className="text-[11px] leading-none text-ink-tertiary">
                    {tab.label}
                  </span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
