import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * Custom tailwind-merge so it understands our token-named font sizes
 * (text-display, text-body, text-callout, ...). Without this, twMerge
 * treats them as text-colors and strips text-white when a button has
 * both a variant class (text-white) and a size class (text-callout).
 */
const FONT_SIZES = [
  "display",
  "title-1",
  "title-2",
  "title-3",
  "headline",
  "body",
  "body-large",
  "callout",
  "subhead",
  "footnote",
  "caption",
] as const;

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: [...FONT_SIZES] }],
    },
  },
});

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
