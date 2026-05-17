"use client";

import { Settings, Trash2, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import Wordmark from "@/components/shared/Wordmark";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Sheet from "@/components/ui/Sheet";
import { useToast } from "@/components/ui/Toast";
import {
  db,
  deleteChild,
  getCurrentParent,
  listChildren,
} from "@/lib/db";
import { useAppStore } from "@/lib/store/useAppStore";
import type { Child } from "@/types";

interface ChildRow {
  child: Child;
  sessionCount: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const activeChildId = useAppStore((s) => s.activeChildId);
  const setActiveChild = useAppStore((s) => s.setActiveChild);

  const [rows, setRows] = useState<ChildRow[]>([]);
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
      toast("Couldn't remove — see console.", { tone: "danger" });
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

  return (
    <main className="mx-auto flex min-h-[100svh] max-w-[640px] flex-col px-5 pt-[calc(env(safe-area-inset-top)+16px)] pb-[calc(env(safe-area-inset-bottom)+96px)]">
      <div className="flex items-center justify-between">
        <Wordmark size="sm" />
      </div>
      <header className="mt-6">
        <h1
          className="font-display text-[36px] font-semibold tracking-[-0.02em] text-ink"
          style={{ lineHeight: 1.1 }}
        >
          {rows.length === 1 ? "Your child" : "Children"}
        </h1>
        {parentName ? (
          <p className="mt-2 text-footnote text-ink-secondary">
            Signed in as {parentName}
          </p>
        ) : null}
      </header>

      <ul className="mt-8 flex flex-col gap-3">
        {rows.map(({ child, sessionCount }) => {
          const isActive = child.id === activeChildId;
          return (
            <li key={child.id}>
              <Card className="flex items-center gap-4">
                <Avatar name={child.name} size="lg" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-title-3 text-ink">
                      {child.name}
                    </p>
                    {isActive && rows.length > 1 ? (
                      <span className="rounded-full bg-accent-bg px-2 py-0.5 text-caption font-medium text-accent-deep">
                        Active
                      </span>
                    ) : null}
                  </div>
                  <p className="text-footnote text-ink-secondary">
                    Age {child.age} · {child.grade}
                  </p>
                  <p className="text-footnote text-ink-tertiary">
                    {sessionCount} session{sessionCount === 1 ? "" : "s"}
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
                    title={
                      isActive
                        ? "Switch to another child first."
                        : `Remove ${child.name}`
                    }
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md text-ink-tertiary transition-colors duration-fast ease-out hover:bg-bg hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Trash2 size={18} strokeWidth={1.75} aria-hidden />
                  </button>
                </div>
              </Card>
            </li>
          );
        })}
      </ul>

      {/* Add another child */}
      <Link
        href="/onboarding/child?return=profile"
        className="mt-3 inline-flex h-14 w-full items-center justify-center gap-2 rounded-md border border-dashed border-line text-callout text-ink-secondary transition-colors duration-fast ease-out hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <UserPlus size={16} strokeWidth={1.75} aria-hidden />
        Add another child
      </Link>

      {/* About Fokus card */}
      <Card className="mt-10">
        <h2 className="text-title-3 text-ink">About Fokus</h2>
        <p className="mt-2 text-body text-ink-secondary">
          One small moment a day with your child. Fokus is built for the parts
          school can&apos;t measure — curiosity, language confidence, emotional
          awareness, and the rest of the 70% that quietly shape a life.
        </p>
        <Link
          href="/profile/settings"
          className="mt-4 inline-flex items-center gap-1 text-callout text-accent hover:text-accent-pressed"
        >
          <Settings size={14} strokeWidth={1.75} aria-hidden />
          Settings →
        </Link>
      </Card>

      {/* Delete confirmation sheet */}
      <Sheet
        open={confirmDelete !== null}
        onClose={() => (busy ? undefined : setConfirmDelete(null))}
        title={confirmDelete ? `Remove ${confirmDelete.name}?` : undefined}
      >
        {confirmDelete ? (
          <div className="flex flex-col gap-4">
            <p className="text-body text-ink-secondary">
              This removes <span className="text-ink">{confirmDelete.name}</span>{" "}
              and every session and observation logged for them. It can&apos;t
              be undone.
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
