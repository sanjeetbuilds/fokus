/**
 * Per-activity hook lines, ≤8 words each. Surface text for the
 * Library bottom sheet (shown under the title on untried rows).
 *
 * Rules per spec:
 *  - 5–8 words maximum
 *  - present tense, active voice
 *  - what the parent literally does with the child
 *  - no jargon, no "foster", no "cultivate"
 *
 * Keyed by activity id. The merge happens in lib/content/activities.ts
 * the same way ACTIVITY_EXAMPLES and ACTIVITY_ICONS do.
 */
export const ACTIVITY_HOOKS: Record<string, string> = {
  // Curiosity
  cu1: "Ask why five times in a row.",
  cu2: "Open up a broken thing together.",
  cu3: "Save one question they had today.",
  cu4: "Guess how it works before looking.",
  cu5: "Spot three weird things on a walk.",
  cu6: "Ask a stranger one real question.",
  cu7: "Draw what's inside before opening.",
  cu8: "List five things you don't know about an animal.",

  // Language confidence
  la1: "Five minutes about today, English only.",
  la2: "Name everything you see in a picture.",
  la3: "Build a story line by line.",
  la4: "Use one new word three times today.",
  la5: "Order something yourself from a shopkeeper.",
  la6: "Take turns reading a page aloud.",
  la7: "They teach you something in English.",
  la8: "Call a relative in English.",

  // Emotional awareness
  em1: "Name three feelings today, with intensity.",
  em2: "Practice the breath before the storm.",
  em3: "Guess what the other person felt.",
  em4: "Give your day a weather word.",
  em5: "Build a box of when-angry moves.",
  em6: "Practice the four-part apology together.",
  em7: "Read the feelings in a story.",
  em8: "Name three specific moments from today.",

  // Thinking clarity
  th1: "Ask how do we know that.",
  th2: "Find two reasons before picking one.",
  th3: "Sort ten things three different ways.",
  th4: "Draw something from memory, then check.",
  th5: "Find five sames and five differents.",
  th6: "Trace five dominoes from one event.",
  th7: "Defend true, false, or not sure.",
  th8: "Plan dinner backward from eight pm.",

  // Resilience
  re1: "Sit with something slightly too hard.",
  re2: "Try a new skill five times.",
  re3: "Share one mistake from today each.",
  re4: "Twenty minutes with no plan or screen.",
  re5: "Finish something you abandoned weeks ago.",
  re6: "Play a game and don't let them win.",
  re7: "Splash cold water, notice it pass.",
  re8: "Three mindful bites of a hard food.",

  // Creativity
  cr1: "List twenty unusual uses for one thing.",
  cr2: "Pick a wild what-if and explore it.",
  cr3: "Design an animal for a weird place.",
  cr4: "Tell a story using three random words.",
  cr5: "Redesign something for a different user.",
  cr6: "Build with no theme and no goal.",
  cr7: "List ten terrible ways to solve it.",
  cr8: "Make a four-line song about something boring.",

  // Observation
  ob1: "Memorise ten items in thirty seconds.",
  ob2: "Move one thing, they spot it.",
  ob3: "Map every sound around you, eyes closed.",
  ob4: "Guess a stranger's story from clues.",
  ob5: "Find ten things you've never noticed.",
  ob6: "Find ten different textures around the house.",
  ob7: "Count one thing all day, check your guess.",
  ob8: "Read mood from small signs, then verify.",

  // Decisiveness
  de1: "They choose what the family eats tonight.",
  de2: "Pick between two options in a minute.",
  de3: "Name what they lose before choosing.",
  de4: "They plan and run a weekend day.",
  de5: "They walk in and buy it alone.",
  de6: "Take a side and give three reasons.",
  de7: "Sort choices into fast or slow.",
  de8: "Sit with the choice you made.",
};
