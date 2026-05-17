export interface IntroScreen {
  id: number; // 1..5
  body: string;
}

/**
 * The five intro screens shown before signup. Copy is verbatim from
 * SPEC §1 "The parent's introduction".
 */
export const INTRO_SCREENS: IntroScreen[] = [
  {
    id: 1,
    body: "School measures what's easy to measure. Marks. Behavior. Speed.",
  },
  {
    id: 2,
    body: "But the people who do well in life — not just careers, life — usually share a different list of skills. How to think. How to recover. How to read other people. How to start something hard. How to lose. How to keep going.",
  },
  {
    id: 3,
    body: "These aren't taught anywhere. They're built at home, in small moments, between ages 5 and 15. Most parents miss them — not because they don't care, but because nobody told them what the moments are.",
  },
  {
    id: 4,
    body: "Fokus gives you one thing to focus on each day. Ten minutes. Designed for who your child actually is. You'll know what you're building, what to watch for, and what to leave alone.",
  },
  {
    id: 5,
    body: "This is a tool for you, not for them. They'll never see this app. They'll just feel a parent who's quietly paying attention to the right things.",
  },
];
