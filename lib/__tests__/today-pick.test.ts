import { describe, expect, it } from "vitest";

import { ACTIVITIES } from "@/lib/content/activities";
import {
  SKILL_ROTATION,
  dateSeed,
  dayOfYear,
  otherIdeasForToday,
  pickRandomSwap,
  todaysHeroActivity,
  todaysSkill,
  todaysSwapOrder,
} from "@/lib/today-pick";

const utc = (s: string) => new Date(`${s}T12:00:00Z`);

describe("today-pick; date math", () => {
  it("dayOfYear is 1-based and stable across the year", () => {
    expect(dayOfYear(utc("2026-01-01"))).toBe(1);
    expect(dayOfYear(utc("2026-12-31"))).toBe(365);
  });

  it("dateSeed packs YYYYMMDD", () => {
    expect(dateSeed(utc("2026-05-22"))).toBe(20260522);
  });
});

describe("today-pick; skill rotation", () => {
  it("rotates through all 9 skills in fixed order across 9 days", () => {
    const start = utc("2026-01-01");
    const seen: string[] = [];
    for (let i = 0; i < 9; i++) {
      const d = new Date(start);
      d.setUTCDate(start.getUTCDate() + i);
      seen.push(todaysSkill(d));
    }
    // We just need to confirm 9 consecutive days hit every skill exactly once.
    expect(new Set(seen).size).toBe(9);
    expect(seen.sort()).toEqual([...SKILL_ROTATION].sort());
  });

  it("the same date always picks the same skill", () => {
    expect(todaysSkill(utc("2026-05-22"))).toBe(
      todaysSkill(utc("2026-05-22")),
    );
  });
});

describe("today-pick; hero activity", () => {
  it("the same date always returns the same hero activity", () => {
    const a = todaysHeroActivity(utc("2026-05-22"), ACTIVITIES);
    const b = todaysHeroActivity(utc("2026-05-22"), ACTIVITIES);
    expect(a.id).toBe(b.id);
  });

  it("the hero activity is always from the day's skill", () => {
    const d = utc("2026-05-22");
    const hero = todaysHeroActivity(d, ACTIVITIES);
    expect(hero.skill).toBe(todaysSkill(d));
  });
});

describe("today-pick; swap order", () => {
  it("permutes every activity exactly once", () => {
    const d = utc("2026-05-22");
    const order = todaysSwapOrder(d, ACTIVITIES);
    expect(order).toHaveLength(ACTIVITIES.length);
    expect(new Set(order.map((a) => a.id)).size).toBe(ACTIVITIES.length);
  });

  it("the same date yields the same permutation", () => {
    const d = utc("2026-05-22");
    const a = todaysSwapOrder(d, ACTIVITIES).map((x) => x.id);
    const b = todaysSwapOrder(d, ACTIVITIES).map((x) => x.id);
    expect(a).toEqual(b);
  });

  it("different dates yield different permutations", () => {
    const a = todaysSwapOrder(utc("2026-05-22"), ACTIVITIES).map((x) => x.id);
    const b = todaysSwapOrder(utc("2026-05-23"), ACTIVITIES).map((x) => x.id);
    expect(a).not.toEqual(b);
  });
});

describe("today-pick; pickRandomSwap", () => {
  it("skips tried ids and never returns the current activity", () => {
    const d = utc("2026-05-22");
    const current = todaysHeroActivity(d, ACTIVITIES);
    const tried = new Set([current.id]);
    // Pin rand() at 0 so the choice is deterministic for the test.
    const next = pickRandomSwap(current, ACTIVITIES, tried, () => 0);
    expect(next.id).not.toBe(current.id);
    expect(tried.has(next.id)).toBe(false);
  });

  it("falls back to any non-current activity when everything has been tried", () => {
    const d = utc("2026-05-22");
    const current = todaysHeroActivity(d, ACTIVITIES);
    const tried = new Set(ACTIVITIES.map((a) => a.id));
    const next = pickRandomSwap(current, ACTIVITIES, tried, () => 0);
    expect(next.id).not.toBe(current.id);
  });

  it("the pick spans the full untried pool across many calls", () => {
    const d = utc("2026-05-22");
    const current = todaysHeroActivity(d, ACTIVITIES);
    const tried = new Set([current.id]);
    const seen = new Set<string>();
    // Walk a deterministic sequence of rands across the full pool.
    // Mid-of-bucket sampling: (k + 0.5) / n avoids FP rounding that
    // can collapse k/n*n back to (k-1).0… for some pool sizes.
    const pool = ACTIVITIES.filter((a) => a.id !== current.id);
    for (let k = 0; k < pool.length; k++) {
      const r = (k + 0.5) / pool.length;
      seen.add(pickRandomSwap(current, ACTIVITIES, tried, () => r).id);
    }
    // Should cover every untried activity at least once.
    expect(seen.size).toBe(pool.length);
  });
});

describe("today-pick; otherIdeasForToday", () => {
  it("returns exactly 2 ideas, excluding the current hero", () => {
    const d = utc("2026-05-22");
    const hero = todaysHeroActivity(d, ACTIVITIES);
    const ideas = otherIdeasForToday(d, hero, ACTIVITIES, new Set());
    expect(ideas).toHaveLength(2);
    expect(ideas.find((i) => i.id === hero.id)).toBeUndefined();
  });

  it("falls back to tried activities when fewer than 3 untried exist", () => {
    const d = utc("2026-05-22");
    const hero = todaysHeroActivity(d, ACTIVITIES);
    // Mark everything except the hero as tried.
    const tried = new Set(
      ACTIVITIES.filter((a) => a.id !== hero.id).map((a) => a.id),
    );
    const ideas = otherIdeasForToday(d, hero, ACTIVITIES, tried);
    expect(ideas).toHaveLength(2);
  });
});
