"use client";

import { Database, Trash2, UserPlus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Sheet from "@/components/ui/Sheet";
import { useToast } from "@/components/ui/Toast";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

import {
  createChild,
  createObservation,
  createParent,
  createSession,
  db,
  getCurrentParent,
  listChildren,
  wipeAllData,
} from "@/lib/db";
import { today } from "@/lib/utils/dates";
import type { Child, Observation, Parent, Session } from "@/types";

interface Counts {
  parents: number;
  children: number;
  sessions: number;
  observations: number;
}

interface Recent {
  parents: Parent[];
  children: Child[];
  sessions: Session[];
  observations: Observation[];
}

const ZERO_COUNTS: Counts = {
  parents: 0,
  children: 0,
  sessions: 0,
  observations: 0,
};

const EMPTY_RECENT: Recent = {
  parents: [],
  children: [],
  sessions: [],
  observations: [],
};

export default function DbDevPage() {
  const { toast } = useToast();
  const [counts, setCounts] = useState<Counts>(ZERO_COUNTS);
  const [recent, setRecent] = useState<Recent>(EMPTY_RECENT);
  const [busy, setBusy] = useState(false);
  const [wipeOpen, setWipeOpen] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [pCount, cCount, sCount, oCount] = await Promise.all([
        db.parents.count(),
        db.children.count(),
        db.sessions.count(),
        db.observations.count(),
      ]);
      const [parents, children, sessions, observations] = await Promise.all([
        db.parents.orderBy("updatedAt").reverse().limit(5).toArray(),
        db.children.orderBy("updatedAt").reverse().limit(5).toArray(),
        db.sessions.orderBy("date").reverse().limit(5).toArray(),
        db.observations.orderBy("date").reverse().limit(5).toArray(),
      ]);
      setCounts({
        parents: pCount,
        children: cCount,
        sessions: sCount,
        observations: oCount,
      });
      setRecent({ parents, children, sessions, observations });
      setDbError(null);
    } catch (err) {
      console.error("[/dev/db] refresh failed:", err);
      setDbError(
        err instanceof Error
          ? err.message
          : "Could not read database. See browser console.",
      );
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const runAction = async (
    label: string,
    fn: () => Promise<void>,
  ): Promise<void> => {
    if (busy) return;
    setBusy(true);
    try {
      await fn();
      await refresh();
    } catch (err) {
      console.error(`[/dev/db] ${label} failed:`, err);
      toast(`${label} failed. See console.`, { tone: "danger" });
    } finally {
      setBusy(false);
    }
  };

  const onSampleParent = () =>
    runAction("Create parent", async () => {
      const parent = await createParent("Anna");
      toast(`Created parent ${parent.name}.`, { tone: "success" });
    });

  const onSampleChild = () =>
    runAction("Create child", async () => {
      let parent = await getCurrentParent();
      if (!parent) {
        parent = await createParent("Anna");
      }
      const child = await createChild({
        parentId: parent.id,
        name: "Aarav",
        age: 7,
        grade: "1st",
        birthMonth: 4,
        birthYear: 2018,
        engagement: {
          fleesFrom: ["Studying", "Eating slowly", "Speaking in English"],
          goesDeepOn: ["Drawing", "Building/Lego", "Pretend play"],
          inBetween: ["Games", "Watching shows"],
        },
        primaryLanguage: "Hindi",
        interests: ["Animals", "Space", "Drawing", "Dinosaurs"],
        strengths: ["Curious", "Patient", "Detail-noticing"],
        struggles: ["Speaking English", "Big feelings", "Losing games"],
      });
      toast(`Created child ${child.name}.`, { tone: "success" });
    });

  const onSampleSession = () =>
    runAction("Create session", async () => {
      const parent = await getCurrentParent();
      if (!parent) {
        toast("Create a parent first.", { tone: "danger" });
        return;
      }
      const children = await listChildren(parent.id);
      if (children.length === 0) {
        toast("Create a child first.", { tone: "danger" });
        return;
      }
      const child = children[0]!;
      const session = await createSession({
        childId: child.id,
        activityId: "why-chain",
        date: today(),
        response: "engaged",
        note: "Asked 7 layers deep about why we sleep. Surprising.",
        duration: 12,
        context: { timeAvailable: "medium", childMood: "normal" },
      });
      toast(`Session ${session.id.slice(0, 8)}… saved.`, { tone: "success" });
    });

  const onSampleObservation = () =>
    runAction("Create observation", async () => {
      const parent = await getCurrentParent();
      if (!parent) {
        toast("Create a parent first.", { tone: "danger" });
        return;
      }
      const children = await listChildren(parent.id);
      if (children.length === 0) {
        toast("Create a child first.", { tone: "danger" });
        return;
      }
      const child = children[0]!;
      const obs = await createObservation({
        childId: child.id,
        date: today(),
        text: "Switched to Hindi when stuck. Brave for trying anyway.",
        tags: ["language", "confidence"],
      });
      toast(`Observation ${obs.id.slice(0, 8)}… saved.`, { tone: "success" });
    });

  const onConfirmWipe = () =>
    runAction("Wipe", async () => {
      await wipeAllData();
      setWipeOpen(false);
      toast("All Fokus data wiped.", { tone: "success" });
    });

  return (
    <main className="mx-auto max-w-[720px] px-5 pb-40">
      <div className="flex items-center justify-between pt-8 pb-6">
        <div>
          <p className="text-footnote uppercase tracking-[0.08em] text-ink-tertiary">
            Internal · DB Console
          </p>
          <h1 className="mt-1 text-display text-ink">Database</h1>
        </div>
        <ThemeToggle />
      </div>

      {dbError ? (
        <Card className="mb-6 border border-danger/40 bg-bg-elevated">
          <h3 className="text-title-3 text-danger">Database unavailable</h3>
          <p className="mt-2 text-body text-ink-secondary">{dbError}</p>
        </Card>
      ) : null}

      {/* Actions */}
      <section className="mb-10">
        <h2 className="mb-3 text-title-2 text-ink">Create sample data</h2>
        <p className="mb-4 text-footnote text-ink-tertiary">
          Buttons go through the public DB API. Direct table writes from this
          page are deliberately avoided.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={onSampleParent}
            disabled={busy}
            leftIcon={<UserPlus size={18} strokeWidth={1.75} />}
          >
            Parent
          </Button>
          <Button
            variant="secondary"
            onClick={onSampleChild}
            disabled={busy}
          >
            Child
          </Button>
          <Button
            variant="secondary"
            onClick={onSampleSession}
            disabled={busy}
          >
            Session
          </Button>
          <Button
            variant="secondary"
            onClick={onSampleObservation}
            disabled={busy}
          >
            Observation
          </Button>
          <Button
            variant="destructive"
            onClick={() => setWipeOpen(true)}
            disabled={busy}
            leftIcon={<Trash2 size={18} strokeWidth={1.75} />}
          >
            Wipe all
          </Button>
        </div>
      </section>

      {/* Counts */}
      <section className="mb-10">
        <h2 className="mb-3 text-title-2 text-ink">Counts</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Parents" value={counts.parents} />
          <StatCard label="Children" value={counts.children} />
          <StatCard label="Sessions" value={counts.sessions} />
          <StatCard label="Observations" value={counts.observations} />
        </div>
      </section>

      <RecentSection
        title="Recent parents"
        rows={recent.parents}
        empty="No parents yet."
        render={(p) => (
          <RecentRow
            key={p.id}
            heading={p.name}
            meta={`onboarded: ${String(p.preferences.onboarded)}`}
            timestamp={p.updatedAt}
            id={p.id}
          />
        )}
      />

      <RecentSection
        title="Recent children"
        rows={recent.children}
        empty="No children yet."
        render={(c) => (
          <RecentRow
            key={c.id}
            heading={c.name}
            meta={`age ${c.age} · ${c.grade}`}
            timestamp={c.updatedAt}
            id={c.id}
          />
        )}
      />

      <RecentSection
        title="Recent sessions"
        rows={recent.sessions}
        empty="No sessions yet."
        render={(s) => (
          <RecentRow
            key={s.id}
            heading={`${s.activityId} · ${s.response}`}
            meta={
              s.note ? truncate(s.note, 80) : `mood ${s.context.childMood}`
            }
            timestamp={s.date}
            id={s.id}
          />
        )}
      />

      <RecentSection
        title="Recent observations"
        rows={recent.observations}
        empty="No observations yet."
        render={(o) => (
          <RecentRow
            key={o.id}
            heading={truncate(o.text, 80)}
            meta={o.tags?.join(" · ") ?? ""}
            timestamp={o.date}
            id={o.id}
          />
        )}
      />

      {/* Wipe confirmation sheet */}
      <Sheet
        open={wipeOpen}
        onClose={() => setWipeOpen(false)}
        title="Wipe all data?"
      >
        <div className="flex flex-col gap-4">
          <p className="text-body text-ink-secondary">
            This deletes every parent, child, session, and observation from
            this device. There is no undo.
          </p>
          <div className="flex gap-3 pt-2">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setWipeOpen(false)}
              disabled={busy}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              fullWidth
              onClick={onConfirmWipe}
              disabled={busy}
            >
              Wipe all
            </Button>
          </div>
        </div>
      </Sheet>
    </main>
  );
}

// ---------- subcomponents ----------

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card className="flex flex-col gap-1">
      <span className="text-caption uppercase tracking-[0.08em] text-ink-tertiary">
        {label}
      </span>
      <span className="text-title-1 text-ink">{value}</span>
    </Card>
  );
}

function RecentSection<T>({
  title,
  rows,
  empty,
  render,
}: {
  title: string;
  rows: T[];
  empty: string;
  render: (row: T) => React.ReactNode;
}) {
  return (
    <section className="mb-8">
      <div className="mb-3 flex items-center gap-3">
        <Database size={18} strokeWidth={1.75} className="text-ink-tertiary" />
        <h2 className="text-title-3 text-ink">{title}</h2>
      </div>
      {rows.length === 0 ? (
        <Card>
          <p className="text-body text-ink-tertiary">{empty}</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">{rows.map(render)}</div>
      )}
    </section>
  );
}

function RecentRow({
  heading,
  meta,
  timestamp,
  id,
}: {
  heading: string;
  meta: string;
  timestamp: string;
  id: string;
}) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-body font-extrabold text-ink">{heading}</p>
          {meta ? (
            <p className="mt-1 truncate text-footnote text-ink-secondary">
              {meta}
            </p>
          ) : null}
        </div>
        <span className="shrink-0 text-caption text-ink-tertiary">
          {timestamp}
        </span>
      </div>
      <p className="mt-2 truncate font-mono text-caption text-ink-quaternary">
        {id}
      </p>
    </Card>
  );
}

function truncate(text: string, max: number): string {
  return text.length > max ? text.slice(0, max - 1) + "…" : text;
}
