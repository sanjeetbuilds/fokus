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
        "fixed inset-x-0 bottom-0 z-40 border-t border-line-subtle bg-bg",
        "pb-[env(safe-area-inset-bottom)]",
        className,
      )}
    >
      <ul className="mx-auto flex w-full max-w-[540px] items-stretch justify-around">
        {tabs.slice(0, 4).map((tab) => {
          const isActive = tab.key === activeKey;
          const Icon = tab.icon;
          return (
            <li key={tab.key} className="flex-1">
              <button
                type="button"
                aria-current={isActive ? "page" : undefined}
                onClick={() => {
                  tab.onClick?.();
                  onChange?.(tab.key);
                }}
                className={cn(
                  "flex h-14 w-full select-none flex-col items-center justify-center gap-1",
                  "transition-colors duration-fast ease-out",
                  "focus-visible:outline-none focus-visible:bg-bg-elevated",
                  isActive ? "text-accent" : "text-ink-quaternary hover:text-ink-tertiary",
                )}
              >
                <Icon size={20} strokeWidth={1.75} aria-hidden />
                <span
                  className={cn(
                    "text-[10px] leading-none",
                    isActive ? "font-medium" : "font-normal",
                  )}
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
