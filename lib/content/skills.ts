import type { SkillKey } from "@/types";

/**
 * SkillDefinition: user-facing metadata for each of the 8 SkillKeys.
 *
 * `iconName` is the Lucide-React component name as a string; consumers
 * resolve it to a component at render time (keeps this file pure-data
 * so the engine can import it without pulling in icons).
 *
 * `color` palette is the Apple-restrained, desaturated set: warm earth +
 * dusty teal/violet that read well against bg + bg-elevated in both modes.
 */
export interface SkillDefinition {
  label: string;
  description: string;
  iconName: string;
  color: string;
}

export const SKILLS: Record<SkillKey, SkillDefinition> = {
  curiosity: {
    label: "Curiosity",
    description:
      "The reflex to look behind appearances and keep asking why instead of accepting the first answer.",
    iconName: "Sparkles",
    color: "#C9923E",
  },
  language: {
    label: "Language confidence",
    description:
      "Speaking up in English without freezing. Fluency before accuracy, voice before vocabulary.",
    iconName: "BookOpen",
    color: "#4A7C8E",
  },
  emotional: {
    label: "Emotional awareness",
    description:
      "Naming what's happening inside, sitting with it for a moment, and reading the same thing in other people.",
    iconName: "Heart",
    color: "#B5736E",
  },
  thinking: {
    label: "Thinking clarity",
    description:
      "Separating knowing from hearing-and-repeating, generating alternatives, and reasoning out loud.",
    iconName: "Brain",
    color: "#5E6B7A",
  },
  resilience: {
    label: "Resilience",
    description:
      "Staying with hard things long enough to learn from them, and recovering when something doesn't go their way.",
    iconName: "Anchor",
    color: "#6B8068",
  },
  creativity: {
    label: "Creativity",
    description:
      "Generating possibilities before evaluating them, and feeling free enough to be silly, weird, and wrong on the way to good.",
    iconName: "Wind",
    color: "#8A6E95",
  },
  observation: {
    label: "Observation",
    description:
      "Seeing what's there (sounds, textures, faces, small changes) instead of moving past it on autopilot.",
    iconName: "Eye",
    color: "#7A6E5C",
  },
  decisiveness: {
    label: "Decisiveness",
    description:
      "Making real choices, sitting with the consequences, and matching the speed of the decision to the size of its stakes.",
    iconName: "Compass",
    color: "#A8825E",
  },
};

export const SKILL_KEYS: SkillKey[] = Object.keys(SKILLS) as SkillKey[];
