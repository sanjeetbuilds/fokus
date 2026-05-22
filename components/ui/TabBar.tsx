"use client";

import type { ComponentType, SVGProps } from "react";
import { cn } from "@/lib/utils/cn";

export type TabItem = {
  key: string;
  label: string;
  icon: ComponentType<
    SVGProps<SVGSVGElement> & { size?: number; strokeWidth?: number }
  >;
  onClick?: () => void;
};

export interface TabBarProps {
  tabs: TabItem[];
  activeKey: string;
  onChange?: (key: string) => void;
  className?: string;
}

/**
 * Bottom nav with the green-pill treatment.
 *
 *   Active:   icon + label inline inside a #EAF6EF pill, both in
 *             the deeper green #3D7A5C. No label below; the pill
 *             carries the name.
 *   Inactive: icon only, #C2C0CB. Label below in 10/600 #C2C0CB.
 *
 * Inactive items keep matching vertical padding so the row height
 * doesn't shift when selection changes.
 */
const ACTIVE_BG = "#EAF6EF";
const ACTIVE_FG = "#3D7A5C";
const INACTIVE = "#C2C0CB";

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
        "fixed inset-x-0 bottom-0 z-40 bg-bg-elevated",
        "pb-[env(safe-area-inset-bottom)]",
        className,
      )}
      style={{
        boxShadow: "var(--shadow-level-2)",
        height: `calc(76px + env(safe-area-inset-bottom, 0px))`,
      }}
    >
      <ul className="mx-auto flex h-[76px] w-full max-w-[540px] items-stretch justify-around pt-2.5">
        {tabs.slice(0, 4).map((tab) => {
          const isActive = tab.key === activeKey;
          const Icon = tab.icon;
          return (
            <li key={tab.key} className="min-w-[60px]">
              <button
                type="button"
                aria-current={isActive ? "page" : undefined}
                aria-label={tab.label}
                onClick={() => {
                  tab.onClick?.();
                  onChange?.(tab.key);
                }}
                className={cn(
                  "flex w-full flex-col items-center justify-center gap-1 select-none",
                  "transition-colors duration-fast ease-out",
                  "focus-visible:outline-none focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-accent",
                )}
              >
                {isActive ? (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      background: ACTIVE_BG,
                      color: ACTIVE_FG,
                      padding: "7px 14px",
                      borderRadius: 22,
                    }}
                  >
                    <Icon
                      size={20}
                      strokeWidth={2}
                      aria-hidden
                      stroke="currentColor"
                    />
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        lineHeight: 1,
                        color: ACTIVE_FG,
                      }}
                    >
                      {tab.label}
                    </span>
                  </span>
                ) : (
                  <>
                    <span
                      aria-hidden
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "7px 10px",
                        color: INACTIVE,
                      }}
                    >
                      <Icon
                        size={20}
                        strokeWidth={2}
                        aria-hidden
                        stroke="currentColor"
                      />
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        lineHeight: 1,
                        color: INACTIVE,
                      }}
                    >
                      {tab.label}
                    </span>
                  </>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
