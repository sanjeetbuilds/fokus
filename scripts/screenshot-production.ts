/**
 * Capture screenshots of the production-identity propagation for review.
 * Seeds IndexedDB + localStorage so /today and /activity render properly
 * past the OnboardingGate.
 *
 * Run: BASE=http://localhost:3009 npx tsx scripts/screenshot-production.ts
 */
import { mkdirSync } from "node:fs";
import puppeteer from "puppeteer-core";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE = process.env.BASE ?? "http://localhost:3009";
const OUT = "screenshots";

async function seed(page: import("puppeteer-core").Page) {
  await page.evaluate(async () => {
    const Dexie = (
      await import("https://cdn.jsdelivr.net/npm/dexie@4.4.2/+esm")
    ).default;
    const db = new Dexie("fokus_db");
    db.version(1).stores({
      parents: "id, updatedAt",
      children: "id, parentId, updatedAt",
      sessions: "id, childId, date, activityId, [childId+date]",
      observations: "id, childId, date",
    });
    const now = new Date().toISOString();
    const parentId = "demo-parent";
    const childId = "demo-child";

    await db.parents.put({
      id: parentId,
      name: "Priya",
      createdAt: now,
      updatedAt: now,
      preferences: { onboarded: true },
      _syncStatus: "local",
    });
    await db.children.put({
      id: childId,
      parentId,
      name: "Leo",
      age: 7,
      grade: "1st",
      engagement: {
        goesDeepOn: ["Drawing", "Building/Lego"],
        fleesFrom: [],
        inBetween: [],
      },
      englishConfidence: "developing",
      primaryLanguage: "Hindi",
      interests: ["Animals", "Space"],
      strengths: ["Curious", "Patient"],
      struggles: [],
      createdAt: now,
      updatedAt: now,
      _syncStatus: "local",
    });

    // Seed 12 sessions across the last 28 days for the heatmap + focus areas
    // + recent moments to all have real data to render.
    const seeds: Array<{
      offset: number;
      activityId: string;
      response: string;
      note?: string;
    }> = [
      { offset: 0, activityId: "cu1", response: "loved", note: "He kept asking 'but why'. Surprised me." },
      { offset: 1, activityId: "la1", response: "engaged" },
      { offset: 2, activityId: "em1", response: "neutral" },
      { offset: 3, activityId: "cu5", response: "engaged" },
      { offset: 5, activityId: "th1", response: "loved" },
      { offset: 7, activityId: "la4", response: "neutral" },
      { offset: 9, activityId: "cu3", response: "engaged" },
      { offset: 11, activityId: "re1", response: "struggled" },
      { offset: 14, activityId: "cr1", response: "loved" },
      { offset: 17, activityId: "em4", response: "engaged" },
      { offset: 21, activityId: "cu1", response: "engaged" },
      { offset: 25, activityId: "ob1", response: "loved" },
    ];
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    for (const s of seeds) {
      const d = new Date(today);
      d.setDate(d.getDate() - s.offset);
      const iso = d.toISOString().slice(0, 10);
      await db.sessions.put({
        id: `sess-${s.offset}-${s.activityId}`,
        childId,
        activityId: s.activityId,
        date: iso,
        response: s.response,
        ...(s.note ? { note: s.note } : {}),
        context: { timeAvailable: "medium", childMood: "normal" },
        createdAt: d.toISOString(),
        _syncStatus: "local",
      });
    }

    window.localStorage.setItem(
      "fokus_app_state",
      JSON.stringify({
        state: { parentId, activeChildId: childId, lastPickContext: null },
        version: 2,
      }),
    );
  });
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
  });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 412, height: 900, deviceScaleFactor: 2 });

    await page.goto(`${BASE}/intro`, { waitUntil: "networkidle0" });
    await seed(page);

    // Wipe any sessions for today so /today shows the picker.
    await page.goto(`${BASE}/today`, { waitUntil: "networkidle0" });
    await page.evaluate(async () => {
      const Dexie = (
        await import("https://cdn.jsdelivr.net/npm/dexie@4.4.2/+esm")
      ).default;
      const db = new Dexie("fokus_db");
      db.version(1).stores({
        parents: "id, updatedAt",
        children: "id, parentId, updatedAt",
        sessions: "id, childId, date, activityId, [childId+date]",
        observations: "id, childId, date",
      });
      const today = new Date().toISOString().slice(0, 10);
      const todays = await db.sessions.where("date").equals(today).toArray();
      for (const s of todays) {
        await db.sessions.delete(s.id);
      }
    });

    // ---------- /today ----------
    await page.goto(`${BASE}/today`, { waitUntil: "networkidle0" });
    await page.waitForSelector("h1");
    await new Promise((r) => setTimeout(r, 600));
    await page.screenshot({
      path: `${OUT}/v5-today.png`,
      type: "png",
    });

    // ---------- /library ----------
    await page.goto(`${BASE}/library`, { waitUntil: "networkidle0" });
    await page.waitForSelector("h1");
    await new Promise((r) => setTimeout(r, 400));
    await page.screenshot({
      path: `${OUT}/v5-library.png`,
      type: "png",
    });

    // ---------- /map (Track) ----------
    await page.goto(`${BASE}/map`, { waitUntil: "networkidle0" });
    await page.waitForSelector("h1");
    await new Promise((r) => setTimeout(r, 500));
    await page.screenshot({
      path: `${OUT}/v5-track.png`,
      type: "png",
    });

    // ---------- /profile ----------
    await page.goto(`${BASE}/profile`, { waitUntil: "networkidle0" });
    await page.waitForSelector("h1");
    await new Promise((r) => setTimeout(r, 400));
    await page.screenshot({
      path: `${OUT}/v5-profile.png`,
      type: "png",
    });

    console.log("Captured: v5-today, v5-library, v5-track, v5-profile");
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
