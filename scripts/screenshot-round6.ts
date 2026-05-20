/**
 * Round-6 verification screenshots.
 *
 *   v12-splash     — white bg, pulsing dot, "fokus." wordmark, tagline
 *   v12-onboarding — single screen with name + age + English filled in
 *   v12-welcome    — sunset modal over /today
 *
 * Run: BASE=http://localhost:3014 npx tsx scripts/screenshot-round6.ts
 */
import { mkdirSync } from "node:fs";
import puppeteer from "puppeteer-core";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE = process.env.BASE ?? "http://localhost:3014";
const OUT = "screenshots";

async function wipe(page: import("puppeteer-core").Page) {
  await page.evaluate(async () => {
    const Dexie = (
      await import("https://cdn.jsdelivr.net/npm/dexie@4.4.2/+esm")
    ).default;
    try { await Dexie.delete("fokus_db"); } catch { /* ignore */ }
    try { window.localStorage.clear(); } catch { /* ignore */ }
    try { window.sessionStorage.clear(); } catch { /* ignore */ }
  });
}

async function seedAfterOnboarding(page: import("puppeteer-core").Page) {
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
      preferences: { onboarded: true, hasSeenWelcomeModal: false },
      _syncStatus: "local",
    });
    await db.children.put({
      id: childId,
      parentId,
      name: "Honey",
      age: 7,
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
    window.sessionStorage.setItem("show_welcome_modal", "true");
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

    // ---------- Splash ----------
    // Land on /today first to establish a same-origin context, wipe all
    // storage, then *reload* — that re-triggers the SplashGate useEffect
    // with an empty sessionStorage so the splash fires for real.
    await page.goto(`${BASE}/intro`, { waitUntil: "domcontentloaded" });
    await wipe(page);
    await page.reload({ waitUntil: "domcontentloaded" });
    // Wait just past the initial paint + useEffect tick. Splash holds
    // 2500ms, so capture at 800ms.
    await new Promise((r) => setTimeout(r, 800));
    await page.screenshot({ path: `${OUT}/v12-splash.png`, type: "png" });

    // ---------- Onboarding form filled in ----------
    await wipe(page);
    // Set splash flag so the splash doesn't reappear in the next nav.
    await page.evaluate(() => {
      window.sessionStorage.setItem("fokus_splash_shown", "1");
    });
    await page.goto(`${BASE}/onboarding`, { waitUntil: "load" });
    await waitForText("Let's begin");
    // Fill name
    await page.evaluate(() => {
      const input = document.querySelector(
        "input[placeholder='What do you call them?']",
      ) as HTMLInputElement | null;
      if (input) {
        const setter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          "value",
        )?.set;
        setter?.call(input, "Honey");
        input.dispatchEvent(new Event("input", { bubbles: true }));
      }
    });
    // Click age 7 and English "In progress"
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      btns.find((b) => (b.textContent ?? "").trim() === "7")?.click();
      btns.find((b) => (b.textContent ?? "").trim() === "In progress")?.click();
    });
    await new Promise((r) => setTimeout(r, 300));
    await page.screenshot({ path: `${OUT}/v12-onboarding.png`, type: "png" });

    // ---------- Welcome modal over Today ----------
    await seedAfterOnboarding(page);
    await page.goto(`${BASE}/today`, { waitUntil: "load" });
    await waitForText("Welcome to Fokus");
    await new Promise((r) => setTimeout(r, 400));
    await page.screenshot({ path: `${OUT}/v12-welcome.png`, type: "png" });

    console.log("Done.");
  } finally {
    await browser.close();
  }
}

main().catch((err) => { console.error(err); process.exit(1); });
