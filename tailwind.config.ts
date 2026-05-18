import type { Config } from "tailwindcss";

/**
 * Fokus Tailwind config — maps CSS variables (see styles/tokens.css)
 * to utilities so colors / type / spacing stay in one source of truth
 * and switch automatically with .dark.
 *
 * Examples:
 *   bg-bg, bg-bg-elevated
 *   text-ink, text-ink-secondary
 *   border-line, border-line-subtle
 *   bg-accent, text-accent
 *   text-display, text-title-1, text-body, text-footnote
 *   rounded-lg, p-5, shadow-md
 */
const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "var(--bg)",
          elevated: "var(--bg-elevated)",
          input: "var(--bg-input)",
          alt: "var(--bg-alt)",
          overlay: "var(--bg-overlay)",
        },
        ink: {
          DEFAULT: "var(--ink)",
          secondary: "var(--ink-secondary)",
          tertiary: "var(--ink-tertiary)",
          quaternary: "var(--ink-quaternary)",
        },
        line: {
          DEFAULT: "var(--line)",
          subtle: "var(--line-subtle)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          pressed: "var(--accent-pressed)",
          bg: "var(--accent-bg)",
          deep: "var(--accent-deep)",
          mid: "var(--accent-mid)",
          soft: "var(--accent-soft)",
          pale: "var(--accent-pale)",
        },
        warm: {
          text: "var(--warm-text)",
          mid: "var(--warm-mid)",
          bg: "var(--warm-bg)",
        },
        coral: {
          text: "var(--coral-text)",
          mid: "var(--coral-mid)",
          bg: "var(--coral-bg)",
        },
        mulberry: "var(--mulberry)",
        success: "var(--success)",
        warning: "var(--warning)",
        danger: "var(--danger)",
      },
      fontFamily: {
        // Body — Inter (loaded by next/font in app/layout.tsx) with a system
        // fallback for the brief paint before the font ships.
        sans: [
          "var(--font-body)",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        // Display — Fraunces variable serif. Opt-in via the `font-display`
        // utility on headlines; body text continues to use sans.
        display: [
          "var(--font-display)",
          "'Iowan Old Style'",
          "Palatino",
          "Georgia",
          "Cambria",
          "serif",
        ],
      },
      fontSize: {
        display: ["var(--text-display)", { lineHeight: "1.2", letterSpacing: "-0.02em", fontWeight: "700" }],
        "title-1": ["var(--text-title-1)", { lineHeight: "1.2", letterSpacing: "-0.02em", fontWeight: "700" }],
        "title-2": ["var(--text-title-2)", { lineHeight: "1.25", fontWeight: "600" }],
        "title-3": ["var(--text-title-3)", { lineHeight: "1.3", fontWeight: "600" }],
        headline: ["var(--text-headline)", { lineHeight: "1.4", fontWeight: "600" }],
        body: ["var(--text-body)", { lineHeight: "1.5", fontWeight: "400" }],
        "body-large": ["var(--text-body-large)", { lineHeight: "1.6", fontWeight: "400" }],
        callout: ["var(--text-callout)", { lineHeight: "1.5", fontWeight: "400" }],
        subhead: ["var(--text-subhead)", { lineHeight: "1.5", fontWeight: "400" }],
        // footnote + caption use weight 350 (one step lighter than body).
        // Pairs with the light-mode --ink-tertiary collapse: now that
        // secondary and tertiary share a color, the lighter weight on
        // captions/footnotes is what restores the hierarchy. 350 is a
        // variable-font weight; static fonts round to 400, which is fine.
        footnote: ["var(--text-footnote)", { lineHeight: "1.45", fontWeight: "350" }],
        caption: ["var(--text-caption)", { lineHeight: "1.4", fontWeight: "350" }],
      },
      spacing: {
        1: "var(--space-1)",
        2: "var(--space-2)",
        3: "var(--space-3)",
        4: "var(--space-4)",
        5: "var(--space-5)",
        6: "var(--space-6)",
        8: "var(--space-8)",
        10: "var(--space-10)",
        12: "var(--space-12)",
        16: "var(--space-16)",
        20: "var(--space-20)",
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        full: "var(--radius-full)",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
      },
      transitionTimingFunction: {
        out: "var(--ease-out)",
        "in-out": "var(--ease-in-out)",
      },
      transitionDuration: {
        fast: "150ms",
        base: "250ms",
        slow: "400ms",
      },
    },
  },
  plugins: [],
};

export default config;
