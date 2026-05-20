/**
 * Round-7 verification screenshots — Today + Activity Detail restructured.
 *
 *   v13-today           — eyebrow + smaller title + activity card on top
 *   v13-activity-top    — activity detail upper half (hero + WHAT TO DO + EXAMPLE)
 *   v13-activity-learn  — same activity, scrolled, with Learn More expanded
 *
 * Run: BASE=http://localhost:3015 npx tsx scripts/screenshot-round7.ts
 */
import { mkdirSync } from "node:fs";
import puppeteer from "puppeteer-core";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE = process.env.BASE ?? "http://localhost:3015";
const OUT = "screenshots";

async function seed(page: import("puppeteer-core").Page) {
  await page.evaluate(async () => {
    const Dexie = (
      await import("https://cdn.jsdelivr.net/npm/dexie@4.4.2/+esm")
    ).default;
    try { await Dexie.delete("fokus_db"); } catch { /* ignore */ }
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
      name: "",
      createdAt: now,
      updatedAt: now,
      preferences: { onboarded: true, hasSeenWelcomeModal: true },
      _syncStatus: "local",
    });
    // 6 years 9 months old. Pick a DOB ~6.75 years ago relative to today.
    const dob = new Date();
    dob.setFullYear(dob.getFullYear() - 6);
    dob.setMonth(dob.getMonth() - 9);
    const dobIso = dob.toISOString().slice(0, 10);
    await db.children.put({
      id: childId,
      parentId,
      name: "Honey",
      age: 6,
      dateOfBirth: dobIso,
      grade: "",
      engagement: { goesDeepOn: [], fleesFrom: [], inBetween: [] },
      primaryLanguage: "",
      interests: [],
      strengths: [],
      struggles: [],
      photoUrl: null,
      gender: "unspecified",
      createdAt: now,
      updatedAt: now,
      _syncStatus: "local",
    });
    window.localStorage.setItem(
      "fokus_app_state",
      JSON.stringify({
        state: { parentId, activeChildId: childId, lastPickContext: null },
        version: 2,
      }),
    );
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
    await page.setViewport({ width: 412, height: 1200, deviceScaleFactor: 2 });

    page.on("pageerror", (err) => console.log(`[error] ${err.message}`));

    const waitForText = async (text: string, timeout = 30_000) => {
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

    // Seed first.
    await page.goto(`${BASE}/today`, { waitUntil: "domcontentloaded" });
    await seed(page);

    // ---------- Today restructured ----------
    await page.goto(`${BASE}/today`, { waitUntil: "load" });
    await waitForText("Tonight with");
    await new Promise((r) => setTimeout(r, 700));
    await page.screenshot({
      path: `${OUT}/v13-today.png`,
      type: "png",
      fullPage: true,
    });

    // ---------- Activity detail top ----------
    // Grab the engine pick id from localStorage so we screenshot the actual
    // one Today is recommending.
    const activityId = await page.evaluate(() => {
      const raw = window.localStorage.getItem("fokus_app_state");
      if (!raw) return null;
      try {
        const parsed = JSON.parse(raw);
        return parsed?.state?.lastPickContext?.activityId ?? null;
      } catch {
        return null;
      }
    });
    const detailUrl = activityId
      ? `${BASE}/activity/${activityId}?from=today`
      : `${BASE}/activity/la1?from=today`;
    await page.goto(detailUrl, { waitUntil: "load" });
    await waitForText("What to do tonight");
    await new Promise((r) => setTimeout(r, 500));
    await page.screenshot({
      path: `${OUT}/v13-activity-top.png`,
      type: "png",
    });

    // ---------- Activity detail with Learn More expanded ----------
    // Scroll into view of Learn More then click expand on a couple of cards.
    await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll("button[aria-expanded]"));
      // Click the first three "Learn more" expander buttons.
      rows.slice(0, 3).forEach((btn) => (btn as HTMLButtonElement).click());
    });
    // Scroll the Learn More area into view.
    await page.evaluate(() => {
      const learn = Array.from(document.querySelectorAll("p")).find((p) =>
        (p.textContent ?? "").toLowerCase().includes("learn more"),
      );
      learn?.scrollIntoView({ behavior: "instant" as ScrollBehavior, block: "start" });
      window.scrollBy(0, -32);
    });
    await new Promise((r) => setTimeout(r, 400));
    await page.screenshot({
      path: `${OUT}/v13-activity-learn.png`,
      type: "png",
      fullPage: true,
    });

    console.log("Done.");
  } finally {
    await browser.close();
  }
}

main().catch((err) => { console.error(err); process.exit(1); });
