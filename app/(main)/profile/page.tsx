"use client";

import { Bell, Settings, Trash2, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import Sheet from "@/components/ui/Sheet";
import { useToast } from "@/components/ui/Toast";
import {
  profileFocusAreas,
  whereHeadingSkills,
} from "@/lib/content/reflection";
import {
  db,
  deleteChild,
  getCurrentParent,
  listChildren,
} from "@/lib/db";
import { useAppStore } from "@/lib/store/useAppStore";
import type { Child, Session } from "@/types";

interface ChildRow {
  child: Child;
  sessionCount: number;
}

// Rotating swatches for the marker tags — purely visual, no hidden meaning.
const MARKER_TONES = [
  { bg: "var(--accent-bg)", text: "var(--accent-deep)" },
  { bg: "var(--warm-bg)", text: "var(--warm-text)" },
  { bg: "var(--coral-bg)", text: "var(--coral-text)" },
  { bg: "var(--accent-pale)", text: "var(--accent-deep)" },
];

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const activeChildId = useAppStore((s) => s.activeChildId);
  const setActiveChild = useAppStore((s) => s.setActiveChild);

  const [rows, setRows] = useState<ChildRow[]>([]);
  const [allSessions, setAllSessions] = useState<Session[]>([]);
  const [parentName, setParentName] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Child | null>(null);
  const [busy, setBusy] = useState(false);

  const reload = useCallback(async () => {
    const parent = await getCurrentParent();
    if (!parent) {
      setRows([]);
      setLoaded(true);
      return;
    }
    setParentName(parent.name);

    const [children, sessions] = await Promise.all([
      listChildren(parent.id),
      db.sessions.toArray(),
    ]);

    const counts = new Map<string, number>();
    for (const s of sessions) {
      counts.set(s.childId, (counts.get(s.childId) ?? 0) + 1);
    }

    setRows(
      children.map((c) => ({
        child: c,
        sessionCount: counts.get(c.id) ?? 0,
      })),
    );
    setAllSessions(sessions);
    setLoaded(true);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        await reload();
      } catch (err) {
        console.error("[/profile] load:", err);
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reload]);

  const onSwitch = useCallback(
    (childId: string) => {
      setActiveChild(childId);
      router.push("/today");
    },
    [router, setActiveChild],
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

  const activeRow = rows.find((r) => r.child.id === activeChildId);
  const featuredChild = activeRow ?? rows[0];
  const markers = featuredChild
    ? collectMarkers(featuredChild.child)
    : [];

  return (
    <main className="mx-auto flex min-h-[100svh] max-w-[640px] flex-col px-5 pt-[calc(env(safe-area-inset-top)+12px)] pb-[calc(env(safe-area-inset-bottom)+96px)]">
      {/* Top bar: spacer + centered title + bell */}
      <div className="flex items-center justify-between pt-1">
        <div className="w-9" />
        <p className="text-[16px] font-bold text-ink">
          {featuredChild
            ? `${featuredChild.child.name}'s Journey`
            : "Your Children"}
        </p>
        <button
          type="button"
          aria-label="Notifications"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md text-ink-secondary transition-colors duration-fast ease-out hover:text-ink"
        >
          <Bell size={20} strokeWidth={1.8} aria-hidden />
        </button>
      </div>

      {featuredChild ? (
        <>
          {/* Child hero */}
          <div className="mt-6 flex flex-col items-center">
            <div className="relative h-[88px] w-[88px]">
              <span
                aria-hidden
                className="absolute -inset-1.5 rounded-full border-[2.5px] border-dashed"
                style={{ borderColor: "var(--coral-mid)" }}
              />
              <Avatar
                name={featuredChild.child.name}
                size="lg"
                className="h-[88px] w-[88px] text-[36px]"
              />
            </div>
            <p
              className="mt-4 font-display text-[22px] font-bold text-ink"
              style={{ letterSpacing: "-0.01em" }}
            >
              {featuredChild.child.name}
            </p>
            <p className="mt-1 text-[13px] text-ink-tertiary">
              Age {featuredChild.child.age} ·{" "}
              {featuredChild.sessionCount} moment
              {featuredChild.sessionCount === 1 ? "" : "s"} together
            </p>
          </div>

          {/* Current Markers */}
          {markers.length > 0 ? (
            <section className="mt-7">
              <p className="mb-2.5 text-[12px] font-semibold uppercase tracking-[0.05em] text-accent-mid">
                Current Markers
              </p>
              <div className="flex flex-wrap gap-2">
                {markers.map((m, i) => {
                  const tone = MARKER_TONES[i % MARKER_TONES.length]!;
                  return (
                    <span
                      key={m}
                      className="inline-flex items-center rounded-full px-3 py-1.5 text-[12px] font-semibold"
                      style={{
                        backgroundColor: tone.bg,
                        color: tone.text,
                      }}
                    >
                      {m}
                    </span>
                  );
                })}
              </div>
            </section>
          ) : null}

          <FocusAreasSection child={featuredChild.child} />
          <WhereHeadingSection
            child={featuredChild.child}
            sessions={allSessions.filter(
              (s) => s.childId === featuredChild.child.id,
            )}
          />
        </>
      ) : null}

      {parentName ? (
        <p className="mt-7 text-[12px] text-ink-tertiary">
          Signed in as {parentName}
        </p>
      ) : null}

      <section className="mt-3">
        <p className="mb-2.5 text-[12px] font-semibold uppercase tracking-[0.05em] text-accent-mid">
          Children
        </p>
        <ul className="flex flex-col gap-2.5">
          {rows.map(({ child, sessionCount }) => {
            const isActive = child.id === activeChildId;
            return (
              <li key={child.id}>
                <div className="flex items-center gap-3.5 rounded-[18px] bg-bg-elevated p-3.5 shadow-md">
                  <Avatar
                    name={child.name}
                    size="md"
                    className="h-12 w-12 text-[20px]"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-[15px] font-semibold text-ink">
                        {child.name}
                      </p>
                      {isActive && rows.length > 1 ? (
                        <span className="rounded-full bg-accent-bg px-2 py-0.5 text-[11px] font-semibold text-accent-deep">
                          Active
                        </span>
                      ) : null}
                    </div>
                    <p className="text-[12px] text-ink-tertiary">
                      Age {child.age} · {child.grade} · {sessionCount} session
                      {sessionCount === 1 ? "" : "s"}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {!isActive ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => onSwitch(child.id)}
                      >
                        Switch
                      </Button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(child)}
                      disabled={isActive}
                      aria-label={
                        isActive
                          ? `Switch away to remove ${child.name}`
                          : `Remove ${child.name}`
                      }
                      className="inline-flex h-9 w-9 items-center justify-center rounded-md text-ink-tertiary transition-colors duration-fast ease-out hover:bg-bg-alt hover:text-danger disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Trash2 size={18} strokeWidth={1.75} aria-hidden />
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <Link
          href="/onboarding/child?return=profile"
          className="mt-2.5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-[18px] border border-dashed border-line text-[14px] text-ink-secondary transition-colors duration-fast ease-out hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <UserPlus size={16} strokeWidth={1.75} aria-hidden />
          Add another child
        </Link>
      </section>

      {/* About Fokus */}
      <div className="mt-7 rounded-[18px] bg-bg-elevated p-5 shadow-md">
        <h2 className="font-display text-[18px] font-bold text-ink">
          About Fokus
        </h2>
        <p className="mt-2 text-[14px] leading-[1.55] text-ink-secondary">
          One small moment a day with your child. Fokus is built for the parts
          school can&apos;t measure: curiosity, language confidence, emotional
          awareness, and the rest of the 70% that quietly shape a life.
        </p>
        <Link
          href="/profile/settings"
          className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-medium text-accent-mid hover:text-accent"
        >
          <Settings size={14} strokeWidth={1.75} aria-hidden />
          Settings →
        </Link>
      </div>

      {/* Delete confirmation sheet */}
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
              session and observation logged for them. It can&apos;t be undone.
            </p>
            <div className="flex gap-3 pt-2">
              <Button
                variant="secondary"
                size="md"
                className="flex-1"
                onClick={() => setConfirmDelete(null)}
                disabled={busy}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="md"
                className="flex-1"
                onClick={onConfirmDelete}
                disabled={busy}
              >
                {busy ? "Removing…" : "Remove"}
              </Button>
            </div>
          </div>
        ) : null}
      </Sheet>
    </main>
  );
}

function FocusAreasSection({ child }: { child: Child }) {
  const rows = profileFocusAreas(child);
  if (rows.length === 0) return null;
  return (
    <section className="mt-7">
      <p
        className="mb-2.5 text-[11px] font-semibold uppercase text-ink-tertiary"
        style={{ letterSpacing: "0.1em" }}
      >
        What Fokus is paying attention to with {child.name}
      </p>
      <div className="rounded-sm border border-line bg-bg-elevated p-5">
        <ul className="flex flex-col gap-4">
          {rows.map((r) => (
            <li key={r.title} className="flex items-start gap-3">
              <span
                aria-hidden
                className="mt-[9px] inline-block h-1 w-1 shrink-0 rounded-full bg-accent"
              />
              <div className="min-w-0 flex-1">
                <p
                  className="text-[15px] font-medium text-ink"
                  style={{ lineHeight: 1.4 }}
                >
                  {r.title}
                </p>
                <p
                  className="mt-1 text-[13px] italic text-ink-tertiary"
                  style={{ lineHeight: 1.5 }}
                >
                  {r.reason}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <p className="mt-3 text-[12px] text-ink-tertiary">
        This is how the app picks moments. It shifts as you log how things go.{" "}
        <Link
          href="/profile/settings"
          className="font-medium text-accent-mid hover:text-accent"
        >
          Adjust →
        </Link>
      </p>
    </section>
  );
}

function WhereHeadingSection({
  child,
  sessions,
}: {
  child: Child;
  sessions: Session[];
}) {
  const { primary, secondary, tertiary, quaternary } = whereHeadingSkills(
    child,
    sessions,
  );
  return (
    <section className="mt-7">
      <p
        className="mb-2.5 text-[11px] font-semibold uppercase text-ink-tertiary"
        style={{ letterSpacing: "0.1em" }}
      >
        Where things are heading
      </p>
      <p className="text-[17px] text-ink" style={{ lineHeight: 1.6 }}>
        For now, the focus is on {primary.toLowerCase()} and{" "}
        {secondary.toLowerCase()}.
      </p>
      <p
        className="mt-3 text-[17px] text-ink"
        style={{ lineHeight: 1.6 }}
      >
        Later, as {child.name} grows comfortable, we&apos;ll mix in{" "}
        {tertiary.toLowerCase()} and {quaternary.toLowerCase()}.
      </p>
      <p
        className="mt-3 text-[17px] italic text-ink-secondary"
        style={{ lineHeight: 1.6 }}
      >
        This is a current, not a plan. You&apos;re in charge.
      </p>
    </section>
  );
}

function collectMarkers(child: Child): string[] {
  // Markers are parent-supplied at onboarding: interests + strengths. They
  // are facts about the child the parent chose to share, not algorithm
  // outputs. Surfacing them here as tag pills is the spec-safe equivalent
  // of the design's "Current Markers" row.
  const seen = new Set<string>();
  const out: string[] = [];
  for (const t of [...child.interests, ...child.strengths]) {
    const key = t.trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(key);
    if (out.length >= 6) break;
  }
  return out;
}
