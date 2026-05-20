"use client";

import { Settings, Trash2, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import AppHeader from "@/components/layout/AppHeader";
import SkillFrequencyTiles from "@/components/track/SkillFrequencyTiles";
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

/**
 * Profile — child journey for the parent. SPEC §2 means no goals, no
 * scores, no "growing fast" editorializing. The page is identity +
 * markers + at-a-glance frequency + the parent's own switching/settings
 * affordances.
 */
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
          className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-[13px] font-extrabold text-white"
        >
          <UserPlus size={14} strokeWidth={2} />
          Add a child
        </Link>
      </main>
    );
  }

  const featuredSessions = sessions.filter((s) => s.childId === featured.id);
  const subtitle = ageSubtitle(featured);

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
          journey.
        </h1>

        <ChildHero child={featured} subtitle={subtitle} />

        <MarkersSection child={featured} />

        <p
          className="mb-3 text-[12px] font-extrabold uppercase"
          style={{ color: "var(--ink-tertiary)", letterSpacing: "0.06em" }}
        >
          At a glance
        </p>
        <SkillFrequencyTiles sessions={featuredSessions} />

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
              className="inline-flex items-center gap-1 font-extrabold text-accent-deep hover:text-accent-pressed"
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
                className="h-[48px] flex-1 rounded-full bg-bg-alt text-[14px] font-extrabold text-ink"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void onConfirmDelete()}
                disabled={busy}
                className="h-[48px] flex-1 rounded-full text-[14px] font-extrabold text-white disabled:opacity-50"
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

function ChildHero({ child, subtitle }: { child: Child; subtitle: string }) {
  return (
    <div className="mb-6 flex flex-col items-center">
      <Avatar
        name={child.name}
        size="lg"
        photoUrl={child.photoUrl}
        className="h-24 w-24 text-[40px]"
      />
      <p
        className="mt-4 text-center text-[28px] font-extrabold text-ink"
        style={{ letterSpacing: "-0.025em", marginBottom: 3 }}
      >
        {child.name}
      </p>
      <p className="text-center text-[14px] text-ink-tertiary">{subtitle}</p>
    </div>
  );
}

function MarkersSection({ child }: { child: Child }) {
  const markers = collectMarkers(child);
  if (markers.length === 0) {
    return (
      <section className="mb-5">
        <p
          className="mb-2.5 text-[12px] font-extrabold uppercase"
          style={{ color: "var(--ink-tertiary)", letterSpacing: "0.06em" }}
        >
          What {child.name} loves
        </p>
        <Link
          href="/profile/settings"
          className="inline-flex rounded-full px-3 py-1.5 text-[12px] font-extrabold"
          style={{ background: "var(--bg-alt)", color: "var(--ink)" }}
        >
          + Add interests
        </Link>
      </section>
    );
  }
  return (
    <section className="mb-5">
      <p
        className="mb-2.5 text-[12px] font-extrabold uppercase"
        style={{ color: "var(--ink-tertiary)", letterSpacing: "0.06em" }}
      >
        What {child.name} loves
      </p>
      <div className="flex flex-wrap gap-2">
        {markers.map((m) => (
          <span
            key={`${m.kind}:${m.label}`}
            className="rounded-full px-3 py-1.5 text-[12px] font-extrabold"
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
      </div>
    </section>
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
    <section className="mt-2">
      <p
        className="mb-2.5 text-[12px] font-extrabold uppercase"
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
              className="flex items-center gap-3.5 rounded-[18px] bg-bg-elevated p-3.5"
              style={{ border: "1.5px solid var(--line)" }}
            >
              <Avatar
                name={c.name}
                size="md"
                photoUrl={c.photoUrl}
                className="h-12 w-12 text-[20px]"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-[15px] font-extrabold text-ink">
                    {c.name}
                  </p>
                  {isActive && children.length > 1 ? (
                    <span
                      className="rounded-full px-2 py-0.5 text-[11px] font-extrabold"
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
                  {ageSubtitle(c)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {!isActive ? (
                  <button
                    type="button"
                    onClick={() => onSwitch(c.id)}
                    className="rounded-full bg-bg-alt px-3 py-1.5 text-[12px] font-extrabold text-ink"
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
    if (out.length >= 6) return out;
  }
  for (const label of child.strengths) {
    const key = label.trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push({ label: key, kind: "strength" });
    if (out.length >= 6) return out;
  }
  return out;
}

/**
 * "Age 6" or "Age 6 · 1st standard" — no editorialised growth verb. The
 * round-4 "Growing fast" / "Growing well" subtitle implies judgment;
 * SPEC §2 keeps observations factual.
 */
function ageSubtitle(child: Child): string {
  const grade = (child.grade ?? "").trim();
  const ageBit = child.ageBand?.trim() || `Age ${child.age}`;
  if (grade) return `${ageBit} · ${grade} standard`;
  return ageBit;
}
