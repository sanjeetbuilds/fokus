import type { Config } from "tailwindcss";

/**
 * Fokus Tailwind config — maps CSS variables (see styles/tokens.css)
 * to utilities so colors / type / spacing stay in one source of truth.
 *
 * Plus Jakarta Sans, weights 300-800 (300 reserved for quiet
 * taglines / footer hints; headlines run 800). Headlines use
 * letterSpacing -0.025em. Color names like accent-* still resolve
 * so existing call sites do not have to be rewritten for the rebrand.
 */
const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Skill palette — single source of truth, mirrors lib/content/skills.ts.
        // Reference-remapped: amber / purple / coral / green dominate;
        // emotional shifted to a warmer salmon to stay distinguishable
        // from creativity's coral.
        skill: {
          curiosity: "#F4C84A",
          language: "#9CA5FF",
          emotional: "#E89070",
          thinking: "#6B5B95",
          resilience: "#5DC87A",
          creativity: "#E8836A",
          observation: "#5FB8B0",
          decisiveness: "#3D5A80",
        },
        // Neutral aliases (preferred for new code). Reference-tone'd.
        muted: "#8E8D9B",
        hint: "#C2C0CB",
        hair: "#E5E3DA",
        fill: "#FBFAF7",
        "surface-tint": "#FBFAF7",

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
        amber: {
          DEFAULT: "var(--amber)",
          bg: "var(--amber-bg)",
          text: "var(--amber-text)",
        },
        lav: {
          DEFAULT: "var(--lav)",
          bg: "var(--lav-bg)",
        },
        coral: {
          DEFAULT: "var(--coral)",
          bg: "var(--coral-bg)",
          text: "var(--coral-text)",
          mid: "var(--coral-mid)",
        },
        green: {
          DEFAULT: "var(--green)",
          bg: "var(--green-bg)",
          text: "var(--green-text)",
        },
        "lt-purple": "var(--lt-purple)",
        // Compat aliases for existing call sites
        warm: {
          text: "var(--warm-text)",
          mid: "var(--warm-mid)",
          bg: "var(--warm-bg)",
        },
        mulberry: "var(--mulberry)",
        success: "var(--success)",
        warning: "var(--warning)",
        danger: "var(--danger)",
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "'Plus Jakarta Sans'", "sans-serif"],
      },
      fontSize: {
        display: ["var(--text-display)", { lineHeight: "1.05", letterSpacing: "-0.035em", fontWeight: "800" }],
        "title-1": ["var(--text-title-1)", { lineHeight: "1.1", letterSpacing: "-0.03em", fontWeight: "800" }],
        "title-2": ["var(--text-title-2)", { lineHeight: "1.15", letterSpacing: "-0.025em", fontWeight: "800" }],
        "title-3": ["var(--text-title-3)", { lineHeight: "1.2", letterSpacing: "-0.02em", fontWeight: "700" }],
        headline: ["var(--text-headline)", { lineHeight: "1.3", letterSpacing: "-0.01em", fontWeight: "700" }],
        body: ["var(--text-body)", { lineHeight: "1.5", fontWeight: "400" }],
        "body-large": ["var(--text-body-large)", { lineHeight: "1.55", fontWeight: "400" }],
        callout: ["var(--text-callout)", { lineHeight: "1.5", fontWeight: "500" }],
        subhead: ["var(--text-subhead)", { lineHeight: "1.5", fontWeight: "400" }],
        footnote: ["var(--text-footnote)", { lineHeight: "1.5", fontWeight: "600" }],
        caption: ["var(--text-caption)", { lineHeight: "1.4", fontWeight: "600" }],
        micro: ["var(--text-micro)", { lineHeight: "1.4", letterSpacing: "0.05em", fontWeight: "700" }],
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
        "2xl": "var(--radius-2xl)",
        full: "var(--radius-full)",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        card: "var(--shadow-card)",
      },
      transitionTimingFunction: {
        out: "var(--ease-out)",
        "in-out": "var(--ease-in-out)",
        spring: "var(--ease-spring)",
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
