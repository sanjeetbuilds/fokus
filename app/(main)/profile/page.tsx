"use client";

import { Settings, Trash2, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import AppHeader from "@/components/layout/AppHeader";
import Avatar from "@/components/ui/Avatar";
import Sheet from "@/components/ui/Sheet";
import { useToast } from "@/components/ui/Toast";
import {
  db,
  deleteChild,
  getCurrentParent,
  listChildren,
} from "@/lib/db";
import { useAppStore } from "@/lib/store/useAppStore";
import type { Child, Session } from "@/types";

const WEEKLY_GOAL_MINUTES = 15 * 60; // 15 hours in minutes

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const activeChildId = useAppStore((s) => s.activeChildId);
  const setActiveChild = useAppStore((s) => s.setActiveChild);

  const [children, setChildren] = useState<Child[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [parentName, setParentName] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Child | null>(null);
  const [busy, setBusy] = useState(false);

  const reload = useCallback(async () => {
    const parent = await getCurrentParent();
    if (!parent) {
      setChildren([]);
      setLoaded(true);
      return;
    }
    setParentName(parent.name);
    const [kids, allSessions] = await Promise.all([
      listChildren(parent.id),
      db.sessions.toArray(),
    ]);
    setChildren(kids);
    setSessions(allSessions);
    setLoaded(true);
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const featured = useMemo(
    () =>
      children.find((c) => c.id === activeChildId) ?? children[0] ?? null,
    [activeChildId, children],
  );

  const onConfirmDelete = useCallback(async () => {
    if (!confirmDelete || busy) return;
    setBusy(true);
    try {
      await deleteChild(confirmDelete.id);
      toast(`Removed ${confirmDelete.name}.`);
      setConfirmDelete(null);
      await reload();
    } catch (err) {
      console.error("[/profile] deleteChild:", err);
      toast("Couldn't remove. See console.", { tone: "danger" });
    } finally {
      setBusy(false);
    }
  }, [busy, confirmDelete, reload, toast]);

  if (!loaded) {
    return (
      <main className="flex min-h-[100svh] items-center justify-center px-5">
        <p className="text-footnote text-ink-tertiary">Loading…</p>
      </main>
    );
  }

  if (!featured) {
    return (
      <main className="mx-auto flex min-h-[100svh] max-w-[640px] flex-col items-center justify-center px-6 text-center">
        <p className="text-body text-ink-secondary">No children yet.</p>
        <Link
          href="/onboarding/child"
          className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-[13px] font-bold text-white"
        >
          <UserPlus size={14} strokeWidth={2} />
          Add a child
        </Link>
      </main>
    );
  }

  const featuredSessions = sessions.filter((s) => s.childId === featured.id);
  const weeklyMinutes = computeWeeklyMinutes(featuredSessions);
  const weeklyHours = (weeklyMinutes / 60).toFixed(1);
  const weeklyPct = Math.min(
    100,
    Math.round((weeklyMinutes / WEEKLY_GOAL_MINUTES) * 100),
  );

  const activitiesTotal = featuredSessions.filter(
    (s) => s.response !== "skipped",
  ).length;
  const skillsTouched = new Set(
    featuredSessions
      .filter((s) => s.response !== "skipped")
      .map((s) => s.activityId),
  ).size;

  return (
    <main className="mx-auto flex min-h-[100svh] max-w-[640px] flex-col bg-bg pb-[calc(env(safe-area-inset-bottom)+96px)] pt-[calc(env(safe-area-inset-top)+8px)]">
      <AppHeader />

      <div className="px-6 pt-1">
        <h1
          className="text-[50px] font-extrabold text-ink"
          style={{
            lineHeight: 1.05,
            letterSpacing: "-0.035em",
            paddingTop: 6,
            marginBottom: 22,
          }}
        >
          {featured.name}&apos;s
          <br />
          Journey
        </h1>

        <ChildHero child={featured} />

        <MarkersSection child={featured} />

        <WeeklyCard
          weeklyHours={weeklyHours}
          weeklyPct={weeklyPct}
          weeklyMinutes={weeklyMinutes}
        />

        <div className="grid grid-cols-2 gap-3" style={{ marginBottom: 20 }}>
          <SmallStat
            label="Activities"
            value={`${activitiesTotal}`}
            bg="var(--green)"
          />
          <SmallStat
            label="Skills earned"
            value={`${String(skillsTouched).padStart(2, "0")}`}
            bg="var(--lt-purple)"
          />
        </div>

        <h2
          className="text-[22px] font-bold text-ink"
          style={{ letterSpacing: "-0.02em", marginBottom: 16 }}
        >
          Milestones journal
        </h2>

        <MilestonesScroll sessions={featuredSessions.slice(0, 6)} />

        <ChildrenList
          children={children}
          activeId={activeChildId}
          onSwitch={(id) => {
            setActiveChild(id);
            router.push("/today");
          }}
          onDelete={(c) => setConfirmDelete(c)}
        />

        {parentName ? (
          <p className="mt-6 text-[12px] text-ink-tertiary">
            Signed in as {parentName}.{" "}
            <Link
              href="/profile/settings"
              className="inline-flex items-center gap-1 font-semibold text-accent-deep hover:text-accent-pressed"
            >
              <Settings size={11} strokeWidth={2} />
              Settings
            </Link>
          </p>
        ) : null}
      </div>

      <Sheet
        open={confirmDelete !== null}
        onClose={() => (busy ? undefined : setConfirmDelete(null))}
        title={confirmDelete ? `Remove ${confirmDelete.name}?` : undefined}
      >
        {confirmDelete ? (
          <div className="flex flex-col gap-4">
            <p className="text-body text-ink-secondary">
              This removes{" "}
              <span className="text-ink">{confirmDelete.name}</span> and every
              session logged for them. It can&apos;t be undone.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                disabled={busy}
                className="h-[48px] flex-1 rounded-full bg-bg-alt text-[14px] font-bold text-ink"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void onConfirmDelete()}
                disabled={busy}
                className="h-[48px] flex-1 rounded-full text-[14px] font-bold text-white disabled:opacity-50"
                style={{ background: "var(--coral)" }}
              >
                {busy ? "Removing…" : "Remove"}
              </button>
            </div>
          </div>
        ) : null}
      </Sheet>
    </main>
  );
}

function ChildHero({ child }: { child: Child }) {
  return (
    <div className="mb-6 flex flex-col items-center">
      <div
        className="mb-3.5 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full text-[50px] text-white"
        style={{
          background:
            "linear-gradient(145deg, #5BC8F5, #29A8E0 60%, #1888C0)",
          boxShadow: "0 8px 28px rgba(41,168,224,0.38)",
        }}
      >
        {child.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={child.photoUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          "🙂"
        )}
      </div>
      <p
        className="text-center text-[28px] font-extrabold text-ink"
        style={{ letterSpacing: "-0.025em", marginBottom: 3 }}
      >
        {child.name}
      </p>
      <p className="text-center text-[14px] text-ink-tertiary">
        {child.ageBand ?? `Age ${child.age}`} · Growing fast
      </p>
    </div>
  );
}

function MarkersSection({ child }: { child: Child }) {
  const markers = collectMarkers(child);
  if (markers.length === 0) return null;
  return (
    <section className="mb-5">
      <p
        className="mb-2.5 text-[12px] font-bold uppercase"
        style={{ color: "var(--ink-tertiary)", letterSpacing: "0.06em" }}
      >
        What {child.name} loves
      </p>
      <div className="flex flex-wrap gap-2">
        {markers.map((m) => (
          <span
            key={`${m.kind}:${m.label}`}
            className="rounded-full px-3 py-1.5 text-[12px] font-semibold"
            style={{
              background:
                m.kind === "interest" ? "var(--accent-bg)" : "var(--coral-bg)",
              color:
                m.kind === "interest" ? "var(--accent-deep)" : "var(--coral-text)",
            }}
          >
            {m.label}
          </span>
        ))}
        <Link
          href="/profile/settings"
          className="rounded-full px-3 py-1.5 text-[12px] font-semibold"
          style={{ background: "var(--bg-alt)", color: "var(--ink)" }}
        >
          + Add
        </Link>
      </div>
    </section>
  );
}

function WeeklyCard({
  weeklyHours,
  weeklyPct,
  weeklyMinutes,
}: {
  weeklyHours: string;
  weeklyPct: number;
  weeklyMinutes: number;
}) {
  return (
    <div
      className="rounded-[20px] border-[1.5px] border-dashed bg-bg-elevated p-[18px]"
      style={{ borderColor: "var(--ink-quaternary)", marginBottom: 12 }}
    >
      <p className="mb-1 text-[13px] text-ink-tertiary">Weekly activity</p>
      <div className="mb-2.5 flex items-baseline justify-between">
        <span
          className="text-[32px] font-extrabold text-ink"
          style={{ letterSpacing: "-0.03em" }}
        >
          {weeklyHours} hrs
        </span>
        <span className="text-[13px] text-ink-quaternary">Goal 15 hrs</span>
      </div>
      <div className="h-2 rounded-full bg-bg-alt">
        <div
          className="h-full rounded-full"
          style={{
            width: `${weeklyPct}%`,
            background:
              "linear-gradient(90deg, var(--accent), var(--amber))",
          }}
        />
      </div>
      <p className="mt-2 text-[12px] text-ink-tertiary">
        {weeklyMinutes > 0
          ? `${weeklyMinutes} minutes this week`
          : "No minutes logged yet this week"}
      </p>
    </div>
  );
}

function SmallStat({
  label,
  value,
  bg,
}: {
  label: string;
  value: string;
  bg: string;
}) {
  return (
    <div
      className="relative flex min-h-[130px] flex-col justify-between overflow-hidden rounded-[20px] p-4"
      style={{ background: bg }}
    >
      <div>
        <p
          className="text-[12px] font-semibold"
          style={{ color: "rgba(255,255,255,0.65)", marginBottom: 8 }}
        >
          {label}
        </p>
        <p
          className="text-[28px] font-extrabold text-white"
          style={{ letterSpacing: "-0.025em", lineHeight: 1 }}
        >
          {value}
        </p>
      </div>
      <svg
        aria-hidden
        viewBox="0 0 140 32"
        preserveAspectRatio="none"
        className="pointer-events-none absolute bottom-0 left-0 right-0"
        height={32}
        width="100%"
      >
        <path
          d="M0 20C20 8 30 26 50 18C70 10 80 26 100 18C120 10 130 22 140 16"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          opacity={0.35}
        />
      </svg>
    </div>
  );
}

function MilestonesScroll({ sessions }: { sessions: Session[] }) {
  const cardTones = [
    "var(--accent-bg)",
    "var(--green-bg)",
    "var(--amber-bg)",
    "var(--coral-bg)",
  ];

  if (sessions.length === 0) {
    return (
      <div
        className="mb-6 rounded-[20px] border-[1.5px] border-dashed p-5 text-center"
        style={{ borderColor: "var(--ink-quaternary)" }}
      >
        <p className="text-[14px] text-ink-secondary" style={{ lineHeight: 1.55 }}>
          Your first milestones will land here. Log a moment from Today to fill
          this space.
        </p>
      </div>
    );
  }

  return (
    <div
      className="-mr-6 mb-6 flex gap-3 overflow-x-auto pb-1"
      style={{ scrollSnapType: "x mandatory" }}
    >
      {sessions.map((s, i) => (
        <div
          key={s.id}
          className="flex min-w-[148px] flex-shrink-0 flex-col rounded-[18px] p-3.5"
          style={{
            background: cardTones[i % cardTones.length],
            scrollSnapAlign: "start",
          }}
        >
          <p
            className="mb-2.5 text-[10px] font-bold uppercase"
            style={{ color: "var(--ink-tertiary)", letterSpacing: "0.05em" }}
          >
            {formatShortDate(s.date)}
          </p>
          <div
            className="relative mb-2.5 flex h-[68px] items-center justify-center overflow-hidden rounded-[12px]"
            style={{ background: "rgba(255,255,255,0.55)" }}
          >
            <span
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  "repeating-linear-gradient(-45deg, transparent, transparent 7px, rgba(0,0,0,0.04) 7px, rgba(0,0,0,0.04) 14px)",
              }}
            />
            <span
              className="relative text-[9px]"
              style={{ fontFamily: "monospace", color: "var(--ink-tertiary)" }}
            >
              memory
            </span>
          </div>
          <p
            className="text-[13px] font-bold text-ink"
            style={{ lineHeight: 1.3 }}
          >
            {s.response === "loved"
              ? "Loved this moment!"
              : s.response === "engaged"
                ? "Engaged together."
                : s.response === "skipped"
                  ? "Skipped today."
                  : "Worked through it."}
          </p>
          <p className="mt-1 text-[11px] text-ink-tertiary">
            {s.note ?? "Quiet attention."}
          </p>
        </div>
      ))}
    </div>
  );
}

function ChildrenList({
  children,
  activeId,
  onSwitch,
  onDelete,
}: {
  children: Child[];
  activeId: string | null;
  onSwitch: (id: string) => void;
  onDelete: (c: Child) => void;
}) {
  return (
    <section className="mt-3">
      <p
        className="mb-2.5 text-[12px] font-bold uppercase"
        style={{ color: "var(--ink-tertiary)", letterSpacing: "0.06em" }}
      >
        Children
      </p>
      <ul className="flex flex-col gap-2.5">
        {children.map((c) => {
          const isActive = c.id === activeId;
          return (
            <li
              key={c.id}
              className="flex items-center gap-3.5 rounded-[18px] bg-bg-elevated p-3.5 shadow-card"
            >
              <Avatar
                name={c.name}
                size="md"
                photoUrl={c.photoUrl}
                className="h-12 w-12 text-[20px]"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-[15px] font-bold text-ink">
                    {c.name}
                  </p>
                  {isActive && children.length > 1 ? (
                    <span
                      className="rounded-full px-2 py-0.5 text-[11px] font-bold"
                      style={{
                        background: "var(--accent-bg)",
                        color: "var(--accent-deep)",
                      }}
                    >
                      Active
                    </span>
                  ) : null}
                </div>
                <p className="text-[12px] text-ink-tertiary">
                  {c.ageBand ?? `Age ${c.age}`}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {!isActive ? (
                  <button
                    type="button"
                    onClick={() => onSwitch(c.id)}
                    className="rounded-full bg-bg-alt px-3 py-1.5 text-[12px] font-bold text-ink"
                  >
                    Switch
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => onDelete(c)}
                  disabled={isActive}
                  aria-label={`Remove ${c.name}`}
                  className="flex h-9 w-9 items-center justify-center rounded-md text-ink-tertiary hover:bg-bg-alt hover:text-coral disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Trash2 size={16} strokeWidth={1.75} />
                </button>
              </div>
            </li>
          );
        })}
      </ul>
      <Link
        href="/onboarding/child?return=profile"
        className="mt-2.5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-[18px] border border-dashed text-[14px] text-ink-secondary transition-colors hover:text-ink"
        style={{ borderColor: "var(--ink-quaternary)" }}
      >
        <UserPlus size={16} strokeWidth={1.75} />
        Add another child
      </Link>
    </section>
  );
}

// ---------- helpers ----------

interface Marker {
  label: string;
  kind: "interest" | "strength";
}

function collectMarkers(child: Child): Marker[] {
  const seen = new Set<string>();
  const out: Marker[] = [];
  for (const label of child.interests) {
    const key = label.trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push({ label: key, kind: "interest" });
    if (out.length >= 5) return out;
  }
  for (const label of child.strengths) {
    const key = label.trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push({ label: key, kind: "strength" });
    if (out.length >= 5) return out;
  }
  return out;
}

function computeWeeklyMinutes(sessions: readonly Session[]): number {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 7);
  const iso = cutoff.toISOString().slice(0, 10);
  let total = 0;
  for (const s of sessions) {
    if (s.date < iso) continue;
    if (s.response === "skipped") continue;
    total += s.duration ?? 10;
  }
  return total;
}

function formatShortDate(iso: string): string {
  const d = new Date(iso);
  const m = d.toLocaleString(undefined, { month: "short" }).toUpperCase();
  return `${m} ${d.getDate()}`;
}
