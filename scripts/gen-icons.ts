/**
 * Icon generator; runs once at build time to produce the three PNGs
 * referenced by the manifest. Source is a hand-authored SVG so the design
 * stays version-controlled; PNGs are committed (small files) so the build
 * doesn't depend on sharp at runtime.
 *
 * Run:  npx tsx scripts/gen-icons.ts
 */
import { writeFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

// Brand: accent blue, white "F". Restrained, sans-serif, single weight.
// The "F" sits center-optical (not center-pixel) so it doesn't look
// bottom-heavy at small sizes.
function makeSvg({ size, padding }: { size: number; padding: number }): string {
  const inner = size - padding * 2;
  // Letter is roughly 60% of the inner box height.
  const letterFontPx = Math.round(inner * 0.62);
  // Center-optical shift; sans-serif capitals sit slightly low without it.
  const baseline = size / 2 + letterFontPx * 0.34;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="#3A4FCC"/>
  <text
    x="50%"
    y="${baseline}"
    text-anchor="middle"
    font-family="-apple-system, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif"
    font-weight="700"
    font-size="${letterFontPx}"
    fill="#FFFFFF"
    letter-spacing="-0.04em"
  >F</text>
</svg>`;
}

interface IconTarget {
  filename: string;
  size: number;
  /** Inner safe-area padding (used by maskable spec). */
  padding: number;
}

const TARGETS: IconTarget[] = [
  { filename: "icon-192.png", size: 192, padding: 0 },
  { filename: "icon-512.png", size: 512, padding: 0 },
  // Maskable icons need ~20% padding around the visible mark so adaptive
  // masks (circle/squircle/teardrop) don't crop the letter on Android.
  { filename: "icon-maskable-512.png", size: 512, padding: 96 },
];

async function main() {
  const outDir = path.join(process.cwd(), "public", "icons");

  // Ship the master SVG too; useful for Android Chrome (supports SVG icons)
  // and for re-rendering at any future size without re-running this script.
  const svgMaster = makeSvg({ size: 512, padding: 0 });
  writeFileSync(path.join(outDir, "icon.svg"), svgMaster, "utf8");

  for (const t of TARGETS) {
    const svg = makeSvg({ size: t.size, padding: t.padding });
    const out = path.join(outDir, t.filename);
    await sharp(Buffer.from(svg, "utf8"))
      .png({ compressionLevel: 9 })
      .toFile(out);
    console.log(`✓ ${t.filename} (${t.size}×${t.size}${t.padding ? `, pad ${t.padding}` : ""})`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
