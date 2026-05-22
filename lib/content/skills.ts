import type { SkillKey } from "@/types";

/**
 * Single source of truth for the 8 spec skills: id, label, color, icon.
 * Skill colors are the canonical 8 hexes; nothing else in the app should
 * hardcode a skill color. The Lucide icon name is resolved at render time
 * by SkillIcon / ActivityIcon so this module stays a pure data island
 * the engine can import without pulling in lucide-react.
 */
export interface SkillDefinition {
  label: string;
  description: string;
  iconName: string;
  color: string;
  /**
   * One-sentence "why start here" note shown in the Today first-time
   * context block. Generic to the skill (not personalised to the
   * child), explaining why this category is a comfortable on-ramp.
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
    firstTimeNote:
      "Easy anywhere, no setup needed.",
  },
  language: {
    label: "Language confidence",
    description:
      "Speaking up in English without freezing. Fluency before accuracy, voice before vocabulary.",
    iconName: "BookOpen",
    color: "#9CA5FF",
    firstTimeNote:
      "Great for the car or dinner table.",
  },
  emotional: {
    label: "Emotional awareness",
    description:
      "Naming what's happening inside, sitting with it for a moment, and reading the same thing in other people.",
    iconName: "Heart",
    color: "#E89070",
    firstTimeNote:
      "Works best in calm moments together.",
  },
  thinking: {
    label: "Thinking clarity",
    description:
      "Separating knowing from hearing-and-repeating, generating alternatives, and reasoning out loud.",
    iconName: "Brain",
    color: "#6B5B95",
    firstTimeNote:
      "Good for kids who like to figure things out.",
  },
  resilience: {
    label: "Resilience",
    description:
      "Staying with hard things long enough to learn from them, and recovering when something doesn't go their way.",
    iconName: "Anchor",
    color: "#5DC87A",
    firstTimeNote:
      "Especially good after a hard day.",
  },
  creativity: {
    label: "Creativity",
    description:
      "Generating possibilities before evaluating them, and feeling free enough to be silly, weird, and wrong on the way to good.",
    iconName: "Wind",
    color: "#E8836A",
    firstTimeNote:
      "Works anywhere you have 10 minutes and some imagination.",
  },
  observation: {
    label: "Observation",
    description:
      "Seeing what's there (sounds, textures, faces, small changes) instead of moving past it on autopilot.",
    iconName: "Eye",
    color: "#5FB8B0",
    firstTimeNote:
      "Perfect for walks or waiting rooms.",
  },
  decisiveness: {
    label: "Decisiveness",
    description:
      "Making real choices, sitting with the consequences, and matching the speed of the decision to the size of its stakes.",
    iconName: "Compass",
    color: "#3D5A80",
    firstTimeNote:
      "Good for kids who struggle to choose.",
  },
};

export const SKILL_KEYS: SkillKey[] = Object.keys(SKILLS) as SkillKey[];
