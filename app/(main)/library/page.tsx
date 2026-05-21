"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

import SkillTile from "@/components/SkillTile";
import ActivitiesSheet from "@/components/activity/ActivitiesSheet";
import AppHeader from "@/components/layout/AppHeader";
import { getActivityById } from "@/lib/content/activities";
import { SKILL_KEYS } from "@/lib/content/skills";
import { useActivityLog } from "@/lib/use-activity-log";
import type { SkillKey } from "@/types";

type LibraryTab = "all" | "tried";

/**
 * Library is now a tile grid behind two tabs.
 *
 *   AppHeader (Fokus wordmark only)
 *   "Activity Library"  (28-30 / 700 ink)
 *   Tabs: All {n}   Done before {n}     ← bottom-border underline on
 *                                         active, hair line full-width
 *   2-column SkillTile grid
 *     - "All" tab: every skill (8 tiles)
 *     - "Done before" tab: only skills with ≥1 tried activity
 *       Empty state: muted "Nothing tried yet. Pick a skill from All."
 *
 * Tapping a tile opens ActivitiesSheet scoped to that skill.
 */
export default function LibraryPage() {
  return (
    <Suspense fallback={null}>
      <LibraryBody />
    </Suspense>
  );
}

function isSkillKey(value: string | null): value is SkillKey {
  return value !== null && (SKILL_KEYS as string[]).includes(value);
}

function LibraryBody() {
  const searchParams = useSearchParams();
  const skillParam = searchParams?.get("skill") ?? null;

  const { rows: activityLog } = useActivityLog();

  // Distinct tried activity count per skill, computed once.
  const triedBySkill = useMemo(() => {
    const map = new Map<SkillKey, Set<string>>();
    for (const k of SKILL_KEYS) map.set(k, new Set());
    for (const r of activityLog) {
      const skill = getActivityById(r.activity_id)?.skill;
      if (!skill) continue;
      map.get(skill)?.add(r.activity_id);
    }
    return map;
  }, [activityLog]);

  const triedSkillCount = useMemo(
    () =>
      SKILL_KEYS.reduce(
        (acc, k) => acc + ((triedBySkill.get(k)?.size ?? 0) > 0 ? 1 : 0),
        0,
      ),
    [triedBySkill],
  );

  const [tab, setTab] = useState<LibraryTab>("all");
  const [openSkill, setOpenSkill] = useState<SkillKey | null>(null);

  // If we arrived with ?skill=, open that skill's sheet on mount.
  useEffect(() => {
    if (isSkillKey(skillParam)) {
      setOpenSkill(skillParam);
    }
  }, [skillParam]);

  const tilesForTab = useMemo<SkillKey[]>(() => {
    if (tab === "all") return [...SKILL_KEYS];
    return SKILL_KEYS.filter(
      (k) => (triedBySkill.get(k)?.size ?? 0) > 0,
    );
  }, [tab, triedBySkill]);

  return (
    <main className="mx-auto flex min-h-[100svh] max-w-[640px] flex-col bg-bg pb-[calc(env(safe-area-inset-bottom)+96px)] pt-[calc(env(safe-area-inset-top)+8px)]">
      <AppHeader />

      <div className="px-6 pt-1">
        <h1
          style={{
            paddingTop: 6,
            fontSize: 30,
            fontWeight: 700,
            color: "#1A1A1A",
            letterSpacing: "-0.01em",
            lineHeight: 1.1,
            marginBottom: 20,
          }}
        >
          Activity Library
        </h1>

        <Tabs
          tab={tab}
          allCount={SKILL_KEYS.length}
          triedCount={triedSkillCount}
          onChange={setTab}
        />

        {tab === "tried" && tilesForTab.length === 0 ? (
          <EmptyTried />
        ) : (
          <div
            style={{
              marginTop: 20,
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
            }}
          >
            {tilesForTab.map((k) => (
              <SkillTile
                key={k}
                skillId={k}
                variant={tab === "tried" ? "tried" : "all"}
                triedCount={triedBySkill.get(k)?.size ?? 0}
                onClick={() => setOpenSkill(k)}
              />
            ))}
          </div>
        )}
      </div>

      <ActivitiesSheet
        open={openSkill !== null}
        onClose={() => setOpenSkill(null)}
        skillId={openSkill}
        activityLog={activityLog}
        fromContext="library"
      />
    </main>
  );
}

function Tabs({
  tab,
  allCount,
  triedCount,
  onChange,
}: {
  tab: LibraryTab;
  allCount: number;
  triedCount: number;
  onChange: (tab: LibraryTab) => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap: 24,
        borderBottom: "0.5px solid #EEEEEE",
      }}
    >
      <TabButton
        active={tab === "all"}
        label="All"
        count={allCount}
        onClick={() => onChange("all")}
      />
      <TabButton
        active={tab === "tried"}
        label="Done before"
        count={triedCount}
        onClick={() => onChange("tried")}
      />
    </div>
  );
}

function TabButton({
  active,
  label,
  count,
  onClick,
}: {
  active: boolean;
  label: string;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: "transparent",
        border: "none",
        padding: "10px 0",
        position: "relative",
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "baseline",
        gap: 6,
      }}
      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-md"
    >
      <span
        style={{
          fontSize: 15,
          fontWeight: active ? 700 : 400,
          color: active ? "#1A1A1A" : "#6B6B6B",
          letterSpacing: "-0.005em",
        }}
      >
        {label}
      </span>
      <span style={{ fontSize: 13, color: "#8A8A8A" }}>{count}</span>
      {active ? (
        <span
          aria-hidden
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: -1,
            height: 2,
            background: "#1A1A1A",
            borderRadius: 1,
          }}
        />
      ) : null}
    </button>
  );
}

function EmptyTried() {
  return (
    <div
      style={{
        marginTop: 48,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <p
        style={{
          fontSize: 14,
          color: "#6B6B6B",
          textAlign: "center",
          lineHeight: 1.5,
          maxWidth: 280,
        }}
      >
        Nothing tried yet. Pick a skill from All.
      </p>
    </div>
  );
}
