"use client";

import { ArrowRight, Bell } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import ActivityIcon from "@/components/activity/ActivityIcon";
import ActivityRow from "@/components/activity/ActivityRow";
import CategoryPills, {
  type CategoryValue,
} from "@/components/layout/CategoryPills";
import EmptyState from "@/components/ui/EmptyState";
import { ACTIVITIES } from "@/lib/content/activities";
import { SKILLS } from "@/lib/content/skills";

export default function LibraryPage() {
  const [filter, setFilter] = useState<CategoryValue>("all");

  const filtered = useMemo(
    () =>
      filter === "all"
        ? ACTIVITIES
        : ACTIVITIES.filter((a) => a.skill === filter),
    [filter],
  );

  // Featured = first activity in the active filter, used as "Today's Pick".
  const featured = filtered[0];
  const rest = featured ? filtered.slice(1) : filtered;

  return (
    <main className="mx-auto flex min-h-[100svh] max-w-[640px] flex-col px-5 pt-[calc(env(safe-area-inset-top)+12px)] pb-[calc(env(safe-area-inset-bottom)+96px)]">
      {/* Top: title block + bell */}
      <div className="flex items-start justify-between pt-1">
        <div>
          <h1 className="font-display text-[27px] font-bold tracking-[-0.02em] text-ink">
            Activity Library
          </h1>
          <p className="mt-1 text-[13px] text-ink-tertiary">
            Browse by what matters today.
          </p>
        </div>
        <button
          type="button"
          aria-label="Notifications"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md text-ink-secondary transition-colors duration-fast ease-out hover:text-ink"
        >
          <Bell size={20} strokeWidth={1.8} aria-hidden />
        </button>
      </div>

      <div className="mt-5">
        <CategoryPills selected={filter} onChange={setFilter} />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          className="mt-10"
          title="No activities in this skill yet."
          description="The library should have eight per skill. If you see this, something's wrong with the content file."
        />
      ) : (
        <>
          {featured ? (
            <FeaturedPick activityId={featured.id} />
          ) : null}

          <section className="mt-7">
            <p className="mb-3 text-[17px] font-bold text-ink">
              All Activities
            </p>
            <ul className="flex flex-col gap-2.5">
              {(featured ? rest : filtered).map((activity) => (
                <li key={activity.id}>
                  <Link
                    href={`/activity/${activity.id}?from=library`}
                    className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-[18px]"
                  >
                    <ActivityRow activity={activity} />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </main>
  );
}

// ---------- Today's Pick featured card ----------

function FeaturedPick({ activityId }: { activityId: string }) {
  const activity = ACTIVITIES.find((a) => a.id === activityId);
  if (!activity) return null;
  const skill = SKILLS[activity.skill];

  return (
    <section className="mt-7">
      <p className="mb-3 text-[17px] font-bold text-ink">Today&apos;s Pick</p>
      <Link
        href={`/activity/${activity.id}?from=library`}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-[18px]"
      >
        <div
          className="flex items-center gap-3.5 rounded-[18px] p-4"
          style={{ backgroundColor: "var(--accent-bg)" }}
        >
          <div className="min-w-0 flex-1">
            <span className="inline-flex items-center rounded-full bg-accent-pale px-2.5 py-1 text-[11px] font-semibold text-accent-deep">
              Recommended
            </span>
            <h2
              className="mt-2 font-display text-[18px] font-bold leading-tight"
              style={{ color: skill.color }}
            >
              {activity.title}
            </h2>
            <p className="mt-1 line-clamp-2 text-[12px] leading-[1.5] text-ink-secondary">
              {activity.description}
            </p>
            <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-[12px] font-semibold text-white">
              Start now
              <ArrowRight size={12} strokeWidth={2.5} aria-hidden />
            </span>
          </div>
          <div
            className="flex h-[88px] w-[88px] shrink-0 flex-col items-center justify-center gap-1 rounded-[14px] text-white"
            style={{ backgroundColor: skill.color }}
            aria-hidden
          >
            <ActivityIcon
              iconName={activity.iconName}
              skill={activity.skill}
              size={28}
              strokeWidth={1.6}
            />
            <span className="text-[11px] font-semibold uppercase tracking-[0.08em] opacity-80">
              {activity.duration}m
            </span>
          </div>
        </div>
      </Link>
    </section>
  );
}
