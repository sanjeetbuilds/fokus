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
 * Bottom nav with the dark-pill treatment.
 *
 *   Active:   #252630 pill containing the icon (20px white, stroke 2)
 *             + the label (13/700 white, -0.005em tracking). The pill
 *             carries the name; no label appears below.
 *   Inactive: icon-only at 20px #C2C0CB (stroke 1.75) with the label
 *             10/600 #C2C0CB centred 2px beneath.
 *
 * Each tab cell uses matching vertical padding so the nav row height
 * doesn't shift when selection changes. The pill bg + label fade in
 * via CSS transitions on each tab cell so a switch reads as a
 * continuous animation rather than a hard swap.
 */
const ACTIVE_BG = "#252630";
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
        "fixed inset-x-0 bottom-0 z-50 bg-white",
        className,
      )}
      style={{
        borderTop: "0.5px solid rgba(0,0,0,0.07)",
        boxShadow: "0 -1px 0 rgba(0,0,0,0.04)",
        paddingTop: 10,
        paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 10px)",
        paddingLeft: 16,
        paddingRight: 16,
      }}
    >
      <ul
        className="mx-auto flex w-full max-w-[540px] items-center"
        style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
          justifyContent: "space-around",
        }}
      >
        {tabs.slice(0, 4).map((tab) => {
          const isActive = tab.key === activeKey;
          const Icon = tab.icon;
          return (
            <li
              key={tab.key}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 48,
              }}
            >
              <button
                type="button"
                aria-current={isActive ? "page" : undefined}
                aria-label={tab.label}
                onClick={() => {
                  tab.onClick?.();
                  onChange?.(tab.key);
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  background: "transparent",
                  border: "none",
                  padding: 0,
                }}
                className={cn(
                  "select-none",
                  "focus-visible:outline-none focus-visible:rounded-full",
                  "focus-visible:ring-2 focus-visible:ring-[#252630] focus-visible:ring-offset-2",
                )}
              >
                {isActive ? (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      background: ACTIVE_BG,
                      color: "#FFFFFF",
                      padding: "9px 16px",
                      borderRadius: 999,
                      transition:
                        "background-color 200ms ease-out, padding 200ms ease-out",
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
                        fontSize: 13,
                        fontWeight: 700,
                        lineHeight: 1,
                        letterSpacing: "-0.005em",
                        color: "#FFFFFF",
                        animation:
                          "fokusTabLabelIn 200ms ease-out both",
                      }}
                    >
                      {tab.label}
                    </span>
                  </span>
                ) : (
                  <span
                    style={{
                      display: "inline-flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 3,
                      padding: "7px 12px",
                    }}
                  >
                    <span
                      aria-hidden
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: INACTIVE,
                      }}
                    >
                      <Icon
                        size={20}
                        strokeWidth={1.75}
                        aria-hidden
                        stroke="currentColor"
                      />
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        lineHeight: 1,
                        letterSpacing: "0.01em",
                        color: INACTIVE,
                        marginTop: 2,
                      }}
                    >
                      {tab.label}
                    </span>
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
      <style jsx global>{`
        @keyframes fokusTabLabelIn {
          0% { opacity: 0; transform: translateX(-8px); }
          100% { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </nav>
  );
}
