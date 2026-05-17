/**
 * Capture screenshots of /dev/identity sections for design review.
 * Run: npx tsx scripts/screenshot-identity.ts
 */
import { mkdirSync } from "node:fs";
import puppeteer from "puppeteer-core";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const URL = process.env.URL ?? "http://localhost:3008/dev/identity";
const OUT_DIR = "screenshots";

interface ShotSpec {
  filename: string;
  selectorText: string; // Eyebrow text to scroll to
}

const SHOTS: ShotSpec[] = [
  { filename: "section-3-today.png", selectorText: "Section 3 — Today" },
  { filename: "section-4-activity.png", selectorText: "Section 4 — Activity" },
];

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
  });
  try {
    const page = await browser.newPage();
    await page.setViewport({
      width: 412,
      height: 900,
      deviceScaleFactor: 2,
    });
    await page.goto(URL, { waitUntil: "networkidle0", timeout: 30_000 });

    for (const shot of SHOTS) {
      // Find the eyebrow that starts the section, then capture the wrapping
      // <section> at its natural height.
      const handle = await page.evaluateHandle((needle: string) => {
        const all = Array.from(
          document.querySelectorAll("p, h1, h2, h3, span"),
        );
        const el = all.find((n) =>
          (n.textContent ?? "").includes(needle),
        ) as HTMLElement | undefined;
        if (!el) return null;
        // Walk up to the nearest <section>
        let cur: HTMLElement | null = el;
        while (cur && cur.tagName !== "SECTION") cur = cur.parentElement;
        return cur ?? el;
      }, shot.selectorText);

      const element = handle.asElement();
      if (!element) {
        console.error(`Could not locate section for "${shot.selectorText}"`);
        continue;
      }
      const box = await element.boundingBox();
      if (!box) {
        console.error(`No bounding box for "${shot.selectorText}"`);
        continue;
      }

      // Pad the capture so the surrounding cream + eyebrow get included.
      const pad = 24;
      await page.screenshot({
        path: `${OUT_DIR}/${shot.filename}`,
        clip: {
          x: Math.max(0, box.x - pad),
          y: Math.max(0, box.y - pad),
          width: Math.min(412, box.width + pad * 2),
          height: box.height + pad * 2,
        },
        type: "png",
      });
      console.log(`✓ ${shot.filename}  (${Math.round(box.width)}×${Math.round(box.height + pad * 2)})`);
    }
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
