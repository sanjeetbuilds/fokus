import type { SkillKey } from "@/types";

/**
 * Single source of truth for the 8 spec skills. Each skill carries
 * five color values used across the app's color-on-color system:
 *
 *   bg    light tint for tile/card backgrounds
 *   blob  rgba blob colour for the depth/illustration layer
 *   icon  darkest tone, used for icons + primary text on tinted bg
 *   mid   mid-dark tone, used for labels and counts on tinted bg
 *   color full saturation, used for hero card bg, stat cards, recent
 *         icon strokes, etc. (alias: "full" in the spec)
 *
 * Nothing else in the app should hardcode a skill colour. The Lucide
 * icon name is resolved at render time by SkillIcon / ActivityIcon so
 * this module stays a pure data island the engine can import without
 * pulling in lucide-react.
 */
export interface SkillDefinition {
  label: string;
  description: string;
  iconName: string;
  /** Full-saturation skill colour. */
  color: string;
  /** Light tint, used as the surface of tinted tiles. */
  bg: string;
  /** Decorative blob colour (rgba) for depth-without-illustration. */
  blob: string;
  /** Darkest tone; icon glyph + primary text on tinted surfaces. */
  iconColor: string;
  /** Mid-dark tone; labels, captions and count text on tinted surfaces. */
  mid: string;
  /**
   * One-sentence "why start here" note shown in the Today first-time
   * context block.
   */
  firstTimeNote: string;
}

export const SKILLS: Record<SkillKey, SkillDefinition> = {
  curiosity: {
    label: "Curiosity",
    description:
      "The reflex to look behind appearances and keep asking why instead of accepting the first answer.",
    iconName: "Sparkles",
    color: "#F4C84A",
    bg: "#FFF6DC",
    blob: "rgba(244,200,74,0.15)",
    iconColor: "#5C3D00",
    mid: "#8A6200",
    firstTimeNote: "Easy anywhere, no setup needed.",
  },
  language: {
    label: "Language confidence",
    description:
      "Speaking up in English without freezing. Fluency before accuracy, voice before vocabulary.",
    iconName: "BookOpen",
    color: "#9CA5FF",
    bg: "#EEEDFE",
    blob: "rgba(156,165,255,0.18)",
    iconColor: "#1A1A70",
    mid: "#4040B8",
    firstTimeNote: "Great for the car or dinner table.",
  },
  emotional: {
    label: "Emotional awareness",
    description:
      "Naming what's happening inside, sitting with it for a moment, and reading the same thing in other people.",
    iconName: "Heart",
    color: "#E8A4B8",
    bg: "#FCEEF4",
    blob: "rgba(232,164,184,0.18)",
    iconColor: "#5C1030",
    mid: "#A02858",
    firstTimeNote: "Works best in calm moments together.",
  },
  thinking: {
    label: "Thinking clarity",
    description:
      "Separating knowing from hearing-and-repeating, generating alternatives, and reasoning out loud.",
    iconName: "Brain",
    color: "#6B5B95",
    bg: "#EEEAF8",
    blob: "rgba(107,91,149,0.16)",
    iconColor: "#281860",
    mid: "#4A3480",
    firstTimeNote: "Good for kids who like to figure things out.",
  },
  resilience: {
    label: "Resilience",
    description:
      "Staying with hard things long enough to learn from them, and recovering when something doesn't go their way.",
    iconName: "Anchor",
    color: "#5DC87A",
    bg: "#E8F9EE",
    blob: "rgba(93,200,122,0.16)",
    iconColor: "#0A4020",
    mid: "#207838",
    firstTimeNote: "Especially good after a hard day.",
  },
  creativity: {
    label: "Creativity",
    description:
      "Generating possibilities before evaluating them, and feeling free enough to be silly, weird, and wrong on the way to good.",
    iconName: "Wind",
    color: "#E8806B",
    bg: "#FCEEE8",
    blob: "rgba(232,128,107,0.16)",
    iconColor: "#581800",
    mid: "#943200",
    firstTimeNote:
      "Works anywhere you have 10 minutes and some imagination.",
  },
  observation: {
    label: "Observation",
    description:
      "Seeing what's there (sounds, textures, faces, small changes) instead of moving past it on autopilot.",
    iconName: "Eye",
    color: "#5FB8B0",
    bg: "#E4F7F5",
    blob: "rgba(95,184,176,0.18)",
    iconColor: "#062E28",
    mid: "#0C5850",
    firstTimeNote: "Perfect for walks or waiting rooms.",
  },
  decisiveness: {
    label: "Decisiveness",
    description:
      "Making real choices, sitting with the consequences, and matching the speed of the decision to the size of its stakes.",
    iconName: "Compass",
    color: "#3D5A80",
    bg: "#E4EBF5",
    blob: "rgba(61,90,128,0.16)",
    iconColor: "#0E1E38",
    mid: "#203860",
    firstTimeNote: "Good for kids who struggle to choose.",
  },
};

export const SKILL_KEYS: SkillKey[] = Object.keys(SKILLS) as SkillKey[];
