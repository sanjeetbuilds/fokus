/**
 * Onboarding chip options. Each option appears in exactly ONE step (audited
 * after onboarding feedback round 1) so the engine's keyword matches aren't
 * double-weighted by the same string surfacing on two facets.
 */

export const GRADE_OPTIONS = [
  "Nursery",
  "KG",
  "1st",
  "2nd",
  "3rd",
  "4th",
  "5th",
] as const;

// Step 2: What do they love doing? (soft hint: top 3-5)
export const GOES_DEEP_ON_OPTIONS = [
  "Drawing",
  "Building/Lego",
  "Reading",
  "Sports/Running",
  "Stories",
  "Pretend play",
  "Music",
  "Games (board/cards)",
  "Watching shows",
  "Cooking with you",
  "Outdoor exploring",
] as const;

// Step 3: What do they avoid? (any, can skip)
// "Speaking in English" and "Reading aloud" removed (covered by Step 4 language)
// and Step 7 (Reading struggles) respectively, so we don't double-count.
export const FLEES_FROM_OPTIONS = [
  "Studying / homework",
  "Eating slowly",
  "Writing",
  "Math practice",
  "Tidying up",
  "Sitting still",
  "Listening to long instructions",
  "Meeting new people",
] as const;

export const PRIMARY_LANGUAGE_OPTIONS = [
  "Hindi",
  "Marathi",
  "Tamil",
  "Telugu",
  "Bengali",
  "Gujarati",
  "Kannada",
  "Malayalam",
  "Punjabi",
  "Other",
] as const;

// Step 5: What lights them up? (purely thematic interests)
// Stripped of activity categories (Stories, Music, Drawing) which moved to Step 2.
// Step 5 + "Add your own" lets parents type custom interests.
export const INTEREST_OPTIONS = [
  "Animals",
  "Space",
  "Vehicles",
  "Dinosaurs",
  "Cricket / sports",
  "Cartoons",
  "Nature",
  "Trains",
  "Bugs",
  "Cooking",
  "Dancing",
] as const;

// Step 6: What are they good at? (soft hint: top 3-5)
export const STRENGTH_OPTIONS = [
  "Curious",
  "Talkative",
  "Patient",
  "Funny",
  "Caring",
  "Active",
  "Detail-noticing",
  "Brave",
  "Calm",
  "Creative",
  "Persistent",
  "Independent",
] as const;

// Step 7: Where do they get stuck? (any, can skip)
// "Asking questions" removed because activities themselves build question-asking,
// no point flagging it as a struggle.
export const STRUGGLE_OPTIONS = [
  "Speaking English",
  "Sitting still",
  "Sharing",
  "Trying new things",
  "Finishing what they start",
  "Losing games",
  "Talking to strangers",
  "Big feelings",
  "Reading",
  "Following multi-step instructions",
] as const;

/**
 * Recommended (NOT enforced) ranges for the chip multi-selects. Used to
 * render a gentle hint below each step's chip group. Continue is never
 * disabled by these counts. Only Step 1 (name + DOB + grade) is hard-required.
 */
export const ONBOARDING_RECOMMENDED = {
  goesDeepOn: { min: 3, max: 5 },
  interests: { min: 3, max: 5 },
  strengths: { min: 3, max: 5 },
} as const;

/** Age range supported by the activity library (per SPEC §8). */
export const SUPPORTED_AGE_RANGE = { min: 5, max: 10 } as const;
