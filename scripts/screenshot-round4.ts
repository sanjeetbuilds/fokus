/**
 * Capture verification screenshots for the round-4 design rollout.
 *
 * Shots:
 *   1. v10-splash             — dark blobs + parent-child SVG
 *   2. v10-intro-slide0       — schools measure
 *   3. v10-intro-slide1       — four traits
 *   4. v10-intro-setup        — light setup form
 *   5. v10-today              — 2x2 grid + child's diary
 *   6. v10-library            — pill filters + today's pick + rows
 *   7. v10-compass            — invisible strengths
 *   8. v10-profile            — child journey + milestones
 *   9. v10-settings           — tell-us-more form
 *
 * Run: BASE=http://localhost:3011 npx tsx scripts/screenshot-round4.ts
 */
import { mkdirSync } from "node:fs";
import puppeteer from "puppeteer-core";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE = process.env.BASE ?? "http://localhost:3011";
const OUT = "screenshots";

async function seed(
  page: import("puppeteer-core").Page,
  sessionCount: number,
) {
  await page.evaluate(async (count) => {
    const Dexie = (
      await import("https://cdn.jsdelivr.net/npm/dexie@4.4.2/+esm")
    ).default;
    try {
      await Dexie.delete("fokus_db");
    } catch { /* ignore */ }
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
      name: "Jenny",
      createdAt: now,
      updatedAt: now,
      preferences: { onboarded: true },
      _syncStatus: "local",
    });
    await db.children.put({
      id: childId,
      parentId,
      name: "Leo",
      age: 6,
      ageBand: "4-6 yrs",
      grade: "",
      engagement: {
        goesDeepOn: ["Drawing", "Building/Lego"],
        fleesFrom: ["Studying / homework"],
        inBetween: [],
      },
      primaryLanguage: "Hindi",
      interests: ["Animals", "Space"],
      strengths: ["Curious"],
      struggles: ["Sitting still"],
      createdAt: now,
      updatedAt: now,
      _syncStatus: "local",
    });
    const seeds = [
      { offset: 0, activityId: "la3", response: "loved" },
      { offset: 0, activityId: "ob1", response: "engaged" },
      { offset: 1, activityId: "em1", response: "loved" },
      { offset: 2, activityId: "cu1", response: "engaged" },
      { offset: 3, activityId: "th2", response: "loved" },
      { offset: 5, activityId: "re5", response: "engaged" },
      { offset: 7, activityId: "cr1", response: "loved" },
    ];
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    for (const s of seeds.slice(0, count)) {
      const d = new Date(today);
      d.setDate(d.getDate() - s.offset);
      const iso = d.toISOString().slice(0, 10);
      await db.sessions.put({
        id: `sess-${s.offset}-${s.activityId}`,
        childId,
        activityId: s.activityId,
        date: iso,
        response: s.response,
        context: { timeAvailable: "medium", childMood: "normal" },
        duration: 12,
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
    // Important: leave the splash flag UNSET for the splash shot, then set
    // it before subsequent navigations so the splash doesn't reappear.
  }, sessionCount);
}

async function dismissSplash(page: import("puppeteer-core").Page) {
  await page.evaluate(() => {
    window.sessionStorage.setItem("fokus_splash_shown", "1");
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
    page.setDefaultNavigationTimeout(90_000);
    await page.setViewport({ width: 412, height: 1500, deviceScaleFactor: 2 });

    page.on("console", (msg) => console.log(`[browser:${msg.type()}] ${msg.text()}`));
    page.on("pageerror", (err) => console.log(`[browser:error] ${err.message}`));

    const waitForText = async (text: string, timeout = 45_000) => {
      await page.waitForFunction(
        (needle: string) => {
          return Array.from(document.querySelectorAll("body *")).some((el) =>
            (el.textContent ?? "").toLowerCase().includes(needle.toLowerCase()),
          );
        },
        { timeout },
        text,
      );
    };

    // ---------- 1. Splash ----------
    await page.goto(`${BASE}/today`, { waitUntil: "load" });
    // Splash takes a beat to fade in fully
    await new Promise((r) => setTimeout(r, 1400));
    await page.screenshot({ path: `${OUT}/v10-splash.png`, type: "png" });

    // Now suppress splash + seed for the rest.
    await dismissSplash(page);

    // ---------- 2-4. Intro slides ----------
    await page.evaluate(async () => {
      const Dexie = (
        await import("https://cdn.jsdelivr.net/npm/dexie@4.4.2/+esm")
      ).default;
      try { await Dexie.delete("fokus_db"); } catch { /* ignore */ }
      window.localStorage.removeItem("fokus_app_state");
    });
    await page.goto(`${BASE}/intro`, { waitUntil: "load" });
    await waitForText("Schools measure");
    await new Promise((r) => setTimeout(r, 500));
    await page.screenshot({ path: `${OUT}/v10-intro-slide0.png`, type: "png" });

    // Click Continue to advance
    const clickContinue = async () => {
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll("button"));
        const c = btns.find((b) => (b.textContent ?? "").trim() === "Continue");
        c?.click();
      });
    };
    await clickContinue();
    await waitForText("Confidence");
    await new Promise((r) => setTimeout(r, 400));
    await page.screenshot({ path: `${OUT}/v10-intro-slide1.png`, type: "png" });

    await clickContinue();
    await waitForText("Parents don");
    await clickContinue();
    await waitForText("meaningful");
    await clickContinue();
    await waitForText("Let's begin");
    await new Promise((r) => setTimeout(r, 400));
    await page.screenshot({ path: `${OUT}/v10-intro-setup.png`, type: "png" });

    // ---------- 5. Today ----------
    await seed(page, 4);
    await page.goto(`${BASE}/today`, { waitUntil: "load" });
    await waitForText("Today's");
    await new Promise((r) => setTimeout(r, 700));
    await page.screenshot({
      path: `${OUT}/v10-today.png`,
      type: "png",
      fullPage: true,
    });

    // ---------- 6. Library ----------
    await page.goto(`${BASE}/library`, { waitUntil: "load" });
    await waitForText("Activity");
    await new Promise((r) => setTimeout(r, 500));
    await page.screenshot({
      path: `${OUT}/v10-library.png`,
      type: "png",
      fullPage: true,
    });

    // ---------- 7. Compass ----------
    await page.goto(`${BASE}/compass`, { waitUntil: "load" });
    await waitForText("Invisible");
    await new Promise((r) => setTimeout(r, 500));
    await page.screenshot({
      path: `${OUT}/v10-compass.png`,
      type: "png",
      fullPage: true,
    });

    // ---------- 8. Profile ----------
    await page.goto(`${BASE}/profile`, { waitUntil: "load" });
    await waitForText("Journey");
    await new Promise((r) => setTimeout(r, 500));
    await page.screenshot({
      path: `${OUT}/v10-profile.png`,
      type: "png",
      fullPage: true,
    });

    // ---------- 9. Settings (tell-us-more form) ----------
    await page.goto(`${BASE}/profile/settings`, { waitUntil: "load" });
    await waitForText("Settings");
    await new Promise((r) => setTimeout(r, 500));
    await page.screenshot({
      path: `${OUT}/v10-settings.png`,
      type: "png",
      fullPage: true,
    });

    console.log("Done.");
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
