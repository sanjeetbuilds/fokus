import type { Activity, SkillKey } from "@/types";

/**
 * Today screen daily-pick logic.
 *
 * The same date always yields the same skill, the same hero activity,
 * and the same swap permutation on any device. No personalisation.
 */

// Fixed rotation order per spec; (day-of-year) mod 8.
export const SKILL_ROTATION: readonly SkillKey[] = [
  "curiosity",
  "language",
  "emotional",
  "thinking",
  "resilience",
  "creativity",
  "observation",
  "decisiveness",
] as const;

/**
 * 1-based day of year in UTC. Jan 1 → 1, Dec 31 → 365 (or 366 in a
 * leap year). UTC so the result doesn't shift with the local timezone.
 */
export function dayOfYear(d: Date): number {
  const start = Date.UTC(d.getUTCFullYear(), 0, 0);
  const now = Date.UTC(
    d.getUTCFullYear(),
    d.getUTCMonth(),
    d.getUTCDate(),
  );
  return Math.floor((now - start) / 86_400_000);
}

/** YYYYMMDD as a single integer; used as the date seed. */
export function dateSeed(d: Date): number {
  return (
    d.getUTCFullYear() * 10_000 +
    (d.getUTCMonth() + 1) * 100 +
    d.getUTCDate()
  );
}

export function todaysSkill(d: Date): SkillKey {
  return SKILL_ROTATION[dayOfYear(d) % SKILL_ROTATION.length]!;
}

/** Mulberry32 PRNG; deterministic from a 32-bit seed. */
function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  };
}

function shuffleSeeded<T>(arr: readonly T[], seed: number): T[] {
  const rng = mulberry32(seed);
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

/**
 * Default hero pick for the day: today's skill, then index = dateSeed
 * mod (number of activities in that skill).
 */
export function todaysHeroActivity(
  d: Date,
  activities: readonly Activity[],
): Activity {
  const skill = todaysSkill(d);
  const inSkill = activities.filter((a) => a.skill === skill);
  const pool = inSkill.length > 0 ? inSkill : activities;
  const idx = dateSeed(d) % pool.length;
  return pool[idx]!;
}

/**
 * Today's full-deck permutation of all activities, seeded by the date.
 * Stable for the whole day, varies across days.
 */
export function todaysSwapOrder(
  d: Date,
  activities: readonly Activity[],
): Activity[] {
  return shuffleSeeded(activities, dateSeed(d));
}

/**
 * Pick a random untried activity, excluding the current hero. If every
 * activity has been tried, fall back to a random pick from the full
 * deck excluding the current hero. `rand` is injectable so tests can
 * pin the choice; defaults to Math.random.
 */
export function pickRandomSwap(
  current: Activity,
  activities: readonly Activity[],
  triedIds: ReadonlySet<string>,
  rand: () => number = Math.random,
): Activity {
  const candidates = activities.filter(
    (a) => a.id !== current.id && !triedIds.has(a.id),
  );
  const pool =
    candidates.length > 0
      ? candidates
      : activities.filter((a) => a.id !== current.id);
  if (pool.length === 0) return current;
  return pool[Math.floor(rand() * pool.length)]!;
}

/**
 * Two "Other ideas today" tiles: first two date-seeded activities that
 * aren't the current hero and (if possible) aren't tried yet.
 */
export function otherIdeasForToday(
  d: Date,
  hero: Activity,
  activities: readonly Activity[],
  triedIds: ReadonlySet<string>,
  count = 2,
): Activity[] {
  const order = todaysSwapOrder(d, activities);
  const untriedCount = activities.filter((a) => !triedIds.has(a.id)).length;
  // Spec: if fewer than 3 untried total, pick from all regardless.
  const useTriedFallback = untriedCount < count + 1;
  const picks: Activity[] = [];
  for (const a of order) {
    if (a.id === hero.id) continue;
    if (!useTriedFallback && triedIds.has(a.id)) continue;
    picks.push(a);
    if (picks.length >= count) break;
  }
  return picks;
}

/** Sanity-warn (dev only) if an activity ships without a hook. */
export function warnMissingHooks(activities: readonly Activity[]): string[] {
  const missing: string[] = [];
  for (const a of activities) {
    if (!a.hook || a.hook.trim().length === 0) missing.push(a.id);
  }
  if (missing.length > 0 && typeof console !== "undefined") {
    console.warn(
      `[today-pick] ${missing.length} activities missing a hook: ${missing.join(", ")}`,
    );
  }
  return missing;
}
