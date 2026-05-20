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
 * Round-4 bottom nav: icon stacked over label, inactive items render in
 * gray-lt at 38% opacity, active item gets full purple. No background
 * pill — selection is communicated via color + weight transitions only.
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
      <ul className="mx-auto flex w-full max-w-[540px] items-start justify-around pt-2.5">
        {tabs.slice(0, 4).map((tab) => {
          const isActive = tab.key === activeKey;
          const Icon = tab.icon;
          return (
            <li key={tab.key} className="min-w-[60px]">
              <button
                type="button"
                aria-current={isActive ? "page" : undefined}
                onClick={() => {
                  tab.onClick?.();
                  onChange?.(tab.key);
                }}
                className={cn(
                  "flex h-[68px] w-full flex-col items-center justify-start gap-[3px] select-none",
                  "focus-visible:outline-none focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-accent",
                )}
              >
                <span
                  aria-hidden
                  className="transition-opacity duration-fast ease-out"
                  style={{
                    opacity: isActive ? 1 : 0.38,
                    color: isActive ? "var(--accent)" : "var(--ink-quaternary)",
                  }}
                >
                  <Icon
                    size={22}
                    strokeWidth={2}
                    aria-hidden
                    stroke="currentColor"
                  />
                </span>
                <span
                  className="text-[11px] leading-none transition-colors duration-fast ease-out"
                  style={{
                    color: isActive ? "var(--accent)" : "var(--ink-quaternary)",
                    fontWeight: isActive ? 800 : 400,
                  }}
                >
                  {tab.label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
