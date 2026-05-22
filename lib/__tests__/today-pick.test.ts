import { describe, expect, it } from "vitest";

import { ACTIVITIES } from "@/lib/content/activities";
import {
  SKILL_ROTATION,
  dateSeed,
  dayOfYear,
  otherIdeasForToday,
  pickNextSwap,
  todaysHeroActivity,
  todaysSkill,
  todaysSwapOrder,
} from "@/lib/today-pick";

const utc = (s: string) => new Date(`${s}T12:00:00Z`);

describe("today-pick — date math", () => {
  it("dayOfYear is 1-based and stable across the year", () => {
    expect(dayOfYear(utc("2026-01-01"))).toBe(1);
    expect(dayOfYear(utc("2026-12-31"))).toBe(365);
  });

  it("dateSeed packs YYYYMMDD", () => {
    expect(dateSeed(utc("2026-05-22"))).toBe(20260522);
  });
});

describe("today-pick — skill rotation", () => {
  it("rotates through all 8 skills in fixed order across 8 days", () => {
    const start = utc("2026-01-01");
    const seen: string[] = [];
    for (let i = 0; i < 8; i++) {
      const d = new Date(start);
      d.setUTCDate(start.getUTCDate() + i);
      seen.push(todaysSkill(d));
    }
    // dayOfYear(2026-01-01) === 1 → starts at SKILL_ROTATION[1] (language).
    // We just need to confirm the 8 consecutive days hit every skill exactly once.
    expect(new Set(seen).size).toBe(8);
    expect(seen.sort()).toEqual([...SKILL_ROTATION].sort());
  });

  it("the same date always picks the same skill", () => {
    expect(todaysSkill(utc("2026-05-22"))).toBe(
      todaysSkill(utc("2026-05-22")),
    );
  });
});

describe("today-pick — hero activity", () => {
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

describe("today-pick — swap order", () => {
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

describe("today-pick — pickNextSwap", () => {
  it("skips tried ids and never returns the current activity", () => {
    const d = utc("2026-05-22");
    const current = todaysHeroActivity(d, ACTIVITIES);
    const tried = new Set([current.id]);
    const next = pickNextSwap(current, d, ACTIVITIES, tried);
    expect(next.id).not.toBe(current.id);
    expect(tried.has(next.id)).toBe(false);
  });

  it("cycles through anyway when everything has been tried", () => {
    const d = utc("2026-05-22");
    const current = todaysHeroActivity(d, ACTIVITIES);
    const tried = new Set(ACTIVITIES.map((a) => a.id));
    const next = pickNextSwap(current, d, ACTIVITIES, tried);
    expect(next.id).not.toBe(current.id);
  });
});

describe("today-pick — otherIdeasForToday", () => {
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
