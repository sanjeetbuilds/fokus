import type { ActivityExample } from "@/types";

/**
 * Worked examples: one short, real dialogue per activity. Indian-parent
 * voice, English first language. `{childName}` is interpolated at render
 * time. 2 to 5 exchanges, 50 to 100 words.
 *
 * The example is the thing that makes Fokus actually useful. It shows the
 * parent what the activity *looks like* in their kitchen, not in a textbook.
 */
export const ACTIVITY_EXAMPLES: Record<string, ActivityExample> = {
  // -------------------- CURIOSITY --------------------

  cu1: {
    setup: "Walking past a ceiling fan after school.",
    exchange: [
      { speaker: "you", line: "Why does the fan have three blades?" },
      { speaker: "child", line: "Because more would be heavy?" },
      { speaker: "you", line: "Why does heavy matter?" },
      { speaker: "child", line: "It might fall down." },
      { speaker: "you", line: "Why?" },
    ],
    closing: "Stop there. That last guess is the whole point.",
  },

  cu2: {
    setup: "Old ballpoint pen on the table.",
    exchange: [
      { speaker: "you", line: "Want to see what's inside?" },
      { speaker: "child", line: "What if it breaks?" },
      { speaker: "you", line: "It's already empty. Open it." },
      { speaker: "child", line: "There's a spring." },
      { speaker: "you", line: "What do you think it's for?" },
    ],
    closing: "Whatever they guess, they're thinking like a builder.",
  },

  cu3: {
    setup: "End of the day, jar on the counter.",
    exchange: [
      { speaker: "you", line: "One question from today?" },
      { speaker: "child", line: "Why is the sky blue." },
      { speaker: "you", line: "Good one. Into the jar." },
      { speaker: "child", line: "Should I draw it?" },
      { speaker: "you", line: "However you want." },
    ],
    closing: "Saturday you pick one and look it up together.",
  },

  cu4: {
    setup: "Sitting under the ceiling fan.",
    exchange: [
      { speaker: "you", line: "How does this thing actually spin?" },
      { speaker: "child", line: "Electricity?" },
      { speaker: "you", line: "Sure. But how does electricity become spin?" },
      { speaker: "child", line: "Maybe magnets?" },
      { speaker: "you", line: "Could be. Draw your best guess first." },
    ],
    closing: "Wrong reasoning beats a right answer they didn't earn.",
  },

  cu5: {
    setup: "Short walk around the block after dinner.",
    exchange: [
      { speaker: "you", line: "Three new things on this walk. Go." },
      { speaker: "child", line: "That tree has a crack down the trunk." },
      { speaker: "you", line: "Nice. Two more." },
      { speaker: "child", line: "The streetlight buzzes." },
      { speaker: "you", line: "I never heard that. One more." },
    ],
    closing: "Same lane every day. They've never actually seen it.",
  },

  cu6: {
    setup: "In an auto on the way to the market.",
    exchange: [
      { speaker: "you", line: "Ask the driver one thing about his work." },
      { speaker: "child", line: "What do I ask?" },
      { speaker: "you", line: "What's the hardest part of his day?" },
      { speaker: "child", line: "Bhaiya, what's the hardest part of driving?" },
    ],
    closing: "One real question to a stranger. Bigger than it looks.",
  },

  cu7: {
    setup: "About to cut an apple for snack.",
    exchange: [
      { speaker: "you", line: "Before I cut, draw what's inside." },
      { speaker: "child", line: "White, with brown bits in the middle." },
      { speaker: "you", line: "What are the brown bits?" },
      { speaker: "child", line: "Seeds." },
      { speaker: "you", line: "Why are they in the middle and not on the skin?" },
    ],
    closing: "Their answer is a real hypothesis, not a fact yet.",
  },

  cu8: {
    setup: "Choosing an animal for tonight.",
    exchange: [
      { speaker: "you", line: "Pick one. Five things we don't know." },
      { speaker: "child", line: "Octopus." },
      { speaker: "you", line: "Good. What do we want to find out?" },
      { speaker: "child", line: "How they sleep. And how many hearts." },
      { speaker: "you", line: "I had no idea. Let's check." },
    ],
    closing: "{childName} just decided what to learn tonight. That's the lesson.",
  },

  // -------------------- LANGUAGE --------------------

  la1: {
    setup: "Dinner table, no screens.",
    exchange: [
      { speaker: "you", line: "Tell me about your day. In English." },
      { speaker: "child", line: "School was good." },
      { speaker: "you", line: "What was the best part?" },
      { speaker: "child", line: "Lunch. Aman gave me his samosa." },
      { speaker: "you", line: "And what did you say to him?" },
      { speaker: "child", line: "I said thank you. And I gave him a chocolate." },
    ],
    closing: "Four full sentences in English. Don't correct grammar. Just keep them talking.",
  },

  la2: {
    setup: "Showing them a random photo on your phone.",
    exchange: [
      { speaker: "you", line: "Describe this picture without saying what it is." },
      { speaker: "child", line: "There's a tall thing with green parts on top. People walking around it." },
      { speaker: "you", line: "How tall?" },
      { speaker: "child", line: "Bigger than our building." },
      { speaker: "you", line: "What's the weather doing?" },
      { speaker: "child", line: "Cloudy. Looks like it might rain." },
    ],
    closing: "Five details, all in English, all unprompted. That's the goal.",
  },

  la3: {
    setup: "Bedtime, lights low, one sentence to start.",
    exchange: [
      { speaker: "you", line: "A boy opened a door he wasn't supposed to. Inside, he saw…" },
      { speaker: "child", line: "A dragon!" },
      { speaker: "you", line: "What did the dragon say?" },
      { speaker: "child", line: "He said his cave was being too cold." },
      { speaker: "you", line: "Was being too cold, or was getting too cold?" },
      { speaker: "child", line: "Was getting too cold." },
    ],
    closing: "One tiny grammar fix, mid-story. They kept the thread going. That's the win.",
  },

  la4: {
    setup: "Breakfast, new word on a sticky note.",
    exchange: [
      { speaker: "you", line: "Today's word is 'reluctant.' It means not really wanting to do something." },
      { speaker: "child", line: "Like when I have to do homework?" },
      { speaker: "you", line: "Use it in a sentence." },
      { speaker: "child", line: "I am reluctant about homework." },
      { speaker: "you", line: "Close. Try 'I am reluctant to do homework.' One more time." },
      { speaker: "child", line: "I am reluctant to do homework." },
    ],
    closing: "By dinner, ask them to use it again. That's how a word actually sticks.",
  },

  la5: {
    setup: "At a café. You sit. They order.",
    exchange: [
      { speaker: "you", line: "You order today. I'm just going to read." },
      { speaker: "child", line: "(to server) Umm… one cold coffee, please." },
      { speaker: "child", line: "(server: sugar?) Yes please." },
      { speaker: "you", line: "After: what was the hard part?" },
      { speaker: "child", line: "I didn't know if I should say please or not." },
    ],
    closing: "Tiny social muscle. First time is the hardest. Tenth time is automatic.",
  },

  la6: {
    setup: "A library book {childName} picked.",
    exchange: [
      { speaker: "child", line: "The girl ran fast through the…" },
      { speaker: "child", line: "…(stuck on 'meadow')" },
      { speaker: "you", line: "Sound it out." },
      { speaker: "child", line: "Meh-doh?" },
      { speaker: "you", line: "Meadow. It's a kind of field. Keep going." },
      { speaker: "child", line: "The girl ran fast through the meadow." },
    ],
    closing: "Only stop on the words that block them. Every other word is reading practice.",
  },

  la7: {
    setup: "{childName} learned long division at school today.",
    exchange: [
      { speaker: "you", line: "Teach me how to do long division. Pretend I don't know anything." },
      { speaker: "child", line: "First you take the big number…" },
      { speaker: "you", line: "Slower. What does 'take' mean?" },
      { speaker: "child", line: "I mean, you look at the first digit and see how many times the small number fits…" },
      { speaker: "you", line: "Show me on paper. I'm copying you." },
    ],
    closing: "When they teach, they find the gaps in what they actually understand. The hesitation is the lesson.",
  },

  la8: {
    setup: "Friday evening call to grandparents.",
    exchange: [
      { speaker: "you", line: "You start the call this time." },
      { speaker: "child", line: "(dialing) Hello, Nani?" },
      { speaker: "child", line: "(Nani: Hello beta!) How are you, Nani?" },
      { speaker: "child", line: "(Nani: Good. And you?) I'm fine. School was good today." },
    ],
    closing: "Two minutes of just them talking. That's the whole thing.",
  },

  // -------------------- EMOTIONAL --------------------

  em1: {
    setup: "{childName} comes home quiet, drops bag.",
    exchange: [
      { speaker: "you", line: "What's going on?" },
      { speaker: "child", line: "Aryan didn't sit with me at lunch." },
      { speaker: "you", line: "How did that feel? Sad? Or more left-out?" },
      { speaker: "child", line: "Left-out. Like… invisible." },
    ],
    closing: "Invisible is a specific word for a real feeling. Just name it. Don't fix it.",
  },

  em2: {
    setup: "Meltdown about not getting the tablet.",
    exchange: [
      { speaker: "child", line: "BUT I WANT IT NOW!" },
      { speaker: "you", line: "I hear you. Three breaths first, then we talk." },
      { speaker: "child", line: "(breathing) …okay." },
      { speaker: "you", line: "What were you really upset about?" },
      { speaker: "child", line: "I just don't want today to end." },
    ],
    closing: "Underneath the tablet was something else. There usually is.",
  },

  em3: {
    setup: "After a fight with their younger sister.",
    exchange: [
      { speaker: "you", line: "Why do you think Riya pushed you?" },
      { speaker: "child", line: "Because she's MEAN." },
      { speaker: "you", line: "Maybe. But what was happening for her right before?" },
      { speaker: "child", line: "Mom told her she couldn't go to the park." },
      { speaker: "you", line: "So she was already angry when you walked in?" },
      { speaker: "child", line: "…yeah." },
    ],
    closing: "Doesn't excuse her. Just explains her. That's the leap.",
  },

  em4: {
    setup: "Car ride to school.",
    exchange: [
      { speaker: "you", line: "What's your weather today?" },
      { speaker: "child", line: "Cloudy. With a chance of a math test." },
      { speaker: "you", line: "Ha. Mine is sunny but tired." },
      { speaker: "child", line: "What does that mean?" },
      { speaker: "you", line: "Happy. But my brain needs more chai." },
    ],
    closing: "Weather lets {childName} name a mixed feeling without explaining it. That's the trick.",
  },

  em5: {
    setup: "{childName} is seething after a bad coach call at football.",
    exchange: [
      { speaker: "you", line: "Put it in the box. We'll come back to it." },
      { speaker: "child", line: "(writing) Coach was unfair." },
      { speaker: "you", line: "Lid on. Dinner." },
      { speaker: "you", line: "(later) Want to open the box?" },
      { speaker: "child", line: "I'm not even that angry now." },
    ],
    closing: "Sometimes the box just lets the heat out. That counts.",
  },

  em6: {
    setup: "{childName} broke their sister's headphones, says sorry.",
    exchange: [
      { speaker: "you", line: "What does a real apology look like?" },
      { speaker: "child", line: "Sorry?" },
      { speaker: "you", line: "Try again. Name what you did, and what you'll do about it." },
      { speaker: "child", line: "Sorry I broke your headphones. I'll save my pocket money to get you new ones." },
    ],
    closing: "The second one is an apology. The first one is just a word.",
  },

  em7: {
    setup: "Reading a Harry Potter chapter at bedtime.",
    exchange: [
      { speaker: "you", line: "How do you think Harry felt when his name came out of the cup?" },
      { speaker: "child", line: "Scared?" },
      { speaker: "you", line: "Just scared? Or more like…" },
      { speaker: "child", line: "Like… he didn't want it, but also a little excited?" },
    ],
    closing: "Two feelings at once. Most real moments are like that. Story is the easiest place to notice.",
  },

  em8: {
    setup: "Lights-out chat under the blanket.",
    exchange: [
      { speaker: "you", line: "Three good things from today." },
      { speaker: "child", line: "Maggi for lunch. Football practice. And…" },
      { speaker: "you", line: "Take your time." },
      { speaker: "child", line: "Nani called." },
    ],
    closing: "Most days, three is harder than it sounds. The pause IS the practice.",
  },

  // -------------------- PERSPECTIVE --------------------

  pe1: {
    setup: "Reading Cinderella again at bedtime.",
    exchange: [
      { speaker: "you", line: "What if the stepmother told this story?" },
      { speaker: "child", line: "She'd say Cinderella was lazy." },
      { speaker: "you", line: "Maybe. What else might she say?" },
      { speaker: "child", line: "That she really wanted her own daughters to be happy." },
    ],
    closing: "Same events. Different inside. That's the whole skill.",
  },

  pe2: {
    setup: "{childName} mentions a friend was rude at lunch.",
    exchange: [
      { speaker: "child", line: "Aarav was so mean today." },
      { speaker: "you", line: "What might be a reason?" },
      { speaker: "child", line: "He doesn't like me anymore." },
      { speaker: "you", line: "Could be. What's another reason?" },
      { speaker: "child", line: "Maybe his mama yelled at him this morning." },
    ],
    closing: "Three reasons. None proved. But you held more than one.",
  },

  pe3: {
    setup: "Park bench, watching a woman scroll her phone.",
    exchange: [
      { speaker: "you", line: "How do you think she's feeling?" },
      { speaker: "child", line: "Worried." },
      { speaker: "you", line: "How can you tell?" },
      { speaker: "child", line: "Her shoulders are up. She's reading the phone fast." },
    ],
    closing: "We don't know if you're right. But you read her body.",
  },

  pe4: {
    setup: "After a small argument about screen time.",
    exchange: [
      { speaker: "you", line: "Okay, switch. Why am I wrong?" },
      { speaker: "child", line: "You said no screens but I finished homework." },
      { speaker: "you", line: "Good. Switch again. Why might I say no anyway?" },
      { speaker: "child", line: "Because too much screen makes your eyes hurt the next day." },
    ],
    closing: "Two real reasons, both yours. Most fights are like that.",
  },

  pe5: {
    setup: "Walking home, talking about {childName}'s teacher.",
    exchange: [
      { speaker: "you", line: "What did Ms. Sharma do this morning before school?" },
      { speaker: "child", line: "Drank chai. Got the kids ready." },
      { speaker: "you", line: "What was hard about her day?" },
      { speaker: "child", line: "Some kids didn't listen. She had to repeat everything." },
    ],
    closing: "Same school day. Two completely different insides.",
  },

  pe6: {
    setup: "At the playground after a new boy joins.",
    exchange: [
      { speaker: "you", line: "What's the new kid not knowing right now?" },
      { speaker: "child", line: "He doesn't know which game we play." },
      { speaker: "you", line: "What does he feel?" },
      { speaker: "child", line: "Shy. Maybe scared we don't want him." },
      { speaker: "you", line: "What would help?" },
      { speaker: "child", line: "I could ask his name." },
    ],
    closing: "You went and asked. That was the help.",
  },

  pe7: {
    setup: "Mama walks into the kitchen looking tired.",
    exchange: [
      { speaker: "child", line: "Why is mama like that?" },
      { speaker: "you", line: "I won't say. How do you think she's feeling? What's the clue?" },
      { speaker: "child", line: "She's slow. Her face is flat. Tired?" },
      { speaker: "you", line: "Good guess. What might help?" },
      { speaker: "child", line: "I'll make space on the sofa." },
    ],
    closing: "You read her. You didn't need me to translate.",
  },

  pe8: {
    setup: "Dinner table, baba is reading the newspaper.",
    exchange: [
      { speaker: "child", line: "Baba's water glass is empty." },
      { speaker: "you", line: "What does that mean?" },
      { speaker: "child", line: "He'll want more soon. I'll bring it." },
    ],
    closing: "Care that's just noticing. Nobody needed to ask.",
  },

  // -------------------- THINKING --------------------

  th1: {
    setup: "Driving home at night, moon visible.",
    exchange: [
      { speaker: "child", line: "The moon is following our car." },
      { speaker: "you", line: "How do you know?" },
      { speaker: "child", line: "Because it stays with us." },
      { speaker: "you", line: "Could there be another explanation?" },
      { speaker: "child", line: "Maybe it's so far away that it looks like it's moving with us?" },
    ],
    closing: "Two explanations is better than one. Don't say which is right. Let it sit.",
  },

  th2: {
    setup: "At dinner, neutral question.",
    exchange: [
      { speaker: "you", line: "Why do people like spicy food?" },
      { speaker: "child", line: "Because it tastes nice." },
      { speaker: "you", line: "Give me a second reason. A different kind." },
      { speaker: "child", line: "Maybe they got used to it as kids." },
      { speaker: "you", line: "One more." },
      { speaker: "child", line: "Showing off?" },
    ],
    closing: "Three reasons, three categories. That's actual analysis. {childName} just did it without noticing.",
  },

  th3: {
    setup: "Pile of crayons spilled on the floor.",
    exchange: [
      { speaker: "you", line: "Sort these however makes sense to you." },
      { speaker: "child", line: "(sorts by color)" },
      { speaker: "you", line: "Now resort. Different rule." },
      { speaker: "child", line: "(sorts by length)" },
      { speaker: "you", line: "One more way." },
      { speaker: "child", line: "By favorite?" },
    ],
    closing: "That's a real category, just a subjective one. Don't correct it.",
  },

  th4: {
    setup: "Made-up story with a deliberate gap.",
    exchange: [
      { speaker: "you", line: "He went to the kitchen, opened the fridge, and started crying. Why?" },
      { speaker: "child", line: "There was nothing inside?" },
      { speaker: "you", line: "Maybe. What else?" },
      { speaker: "child", line: "Someone ate his birthday cake?" },
      { speaker: "you", line: "Both work. The story never said. You filled in the missing piece." },
    ],
    closing: "Inferring the unstated middle: that's reading comprehension and detective work.",
  },

  th5: {
    setup: "A spoon and a key on the dining table.",
    exchange: [
      { speaker: "you", line: "How are these the same?" },
      { speaker: "child", line: "Both made of metal." },
      { speaker: "you", line: "Different?" },
      { speaker: "child", line: "One opens things. One moves food." },
      { speaker: "you", line: "One more 'same' I wouldn't think of." },
      { speaker: "child", line: "Both fit in a pocket. But one keeps a secret, the other doesn't." },
    ],
    closing: "That last answer is metaphor. {childName} is doing poetry without knowing.",
  },

  th6: {
    setup: "Heavy rain. School announced closed.",
    exchange: [
      { speaker: "you", line: "Why is school closed today?" },
      { speaker: "child", line: "Because it rained." },
      { speaker: "you", line: "But rain doesn't close schools by itself. What's between?" },
      { speaker: "child", line: "The roads flooded. So buses can't run. So kids can't come." },
      { speaker: "you", line: "Three steps from rain to closure. That's a chain." },
    ],
    closing: "Rain → flood → bus → kid. Now they'll see chains everywhere.",
  },

  th7: {
    setup: "Random trivia over dinner.",
    exchange: [
      { speaker: "you", line: "True or false: bats are blind." },
      { speaker: "child", line: "True!" },
      { speaker: "you", line: "Are you sure?" },
      { speaker: "child", line: "Hmm… not sure?" },
      { speaker: "you", line: "Good. 'Not sure' is the right answer when you don't know. We can look it up." },
    ],
    closing: "Most adults pretend to know. Not-sure is a power.",
  },

  th8: {
    setup: "Planning {childName}'s birthday party for Saturday at 5.",
    exchange: [
      { speaker: "you", line: "Party Saturday at 5. What needs to happen by then?" },
      { speaker: "child", line: "Cake. Friends. Balloons." },
      { speaker: "you", line: "Cake by when?" },
      { speaker: "child", line: "Friday morning?" },
      { speaker: "you", line: "Before you order, what needs to happen?" },
      { speaker: "child", line: "Pick the flavor. And count who's coming." },
    ],
    closing: "Reverse plan from the end date. It's how every adult who finishes things actually works.",
  },

  // -------------------- RESILIENCE --------------------

  re1: {
    setup: "{childName} stuck on a 100-piece puzzle, ready to give up.",
    exchange: [
      { speaker: "child", line: "I CAN'T DO THIS. It's impossible." },
      { speaker: "you", line: "Three more minutes. I'll sit next to you. No helping." },
      { speaker: "child", line: "(grumbles, keeps trying)" },
      { speaker: "child", line: "…wait. This one fits." },
    ],
    closing: "The 'I can't' was three minutes too early. Mark that out loud later.",
  },

  re2: {
    setup: "{childName} trying to skip rope, keeps tripping.",
    exchange: [
      { speaker: "child", line: "I'm just bad at this." },
      { speaker: "you", line: "Once more. I'm counting how many tries it takes." },
      { speaker: "child", line: "(tries, trips at 3)" },
      { speaker: "you", line: "Try 4 was 3 jumps. Try 5?" },
      { speaker: "child", line: "Five jumps!" },
    ],
    closing: "It wasn't about being good. It was about the next try. That's the entire skill.",
  },

  re3: {
    setup: "Bedtime, lights dim.",
    exchange: [
      { speaker: "you", line: "Want to hear about a time I messed up at work?" },
      { speaker: "child", line: "What happened?" },
      { speaker: "you", line: "I sent an email to the wrong person. A client saw a draft meant for my boss." },
      { speaker: "child", line: "What did you do?" },
      { speaker: "you", line: "I called the client, apologized, fixed it. Felt sick all evening. Everyone forgot in a week." },
    ],
    closing: "I tell you this so when you mess up, you know I have too. That's the whole point.",
  },

  re4: {
    setup: "Rainy Sunday. No devices.",
    exchange: [
      { speaker: "child", line: "I'm SO bored." },
      { speaker: "you", line: "Good." },
      { speaker: "child", line: "What do you mean GOOD?" },
      { speaker: "you", line: "Bored is what comes before you make something. Wait it out." },
      { speaker: "child", line: "(twenty minutes later) I'm making a city out of cushions." },
    ],
    closing: "The thing they made would not exist if you'd handed them a screen.",
  },

  re5: {
    setup: "1000-piece puzzle. Day three. Half-done.",
    exchange: [
      { speaker: "child", line: "Can we just put this away?" },
      { speaker: "you", line: "Half an hour more. Then decide." },
      { speaker: "child", line: "(30 minutes later) I got the whole sky done." },
      { speaker: "you", line: "Want to put it away now?" },
      { speaker: "child", line: "…no. Let's keep going." },
    ],
    closing: "Push through one barrier and the second wind shows up. That's the lesson.",
  },

  re6: {
    setup: "Playing carrom together.",
    exchange: [
      { speaker: "you", line: "I'm actually trying this time. No going easy." },
      { speaker: "child", line: "(loses) That's not FAIR, you're bigger." },
      { speaker: "you", line: "Yeah. Sometimes you'll play people better than you. What do we do?" },
      { speaker: "child", line: "Play again?" },
    ],
    closing: "That's the whole thing. Play again. {childName} just stated the rule themselves.",
  },

  re7: {
    setup: "Shower. {childName} always picks warm.",
    exchange: [
      { speaker: "you", line: "Twenty seconds cold at the end. I'll do it with you." },
      { speaker: "child", line: "NO." },
      { speaker: "you", line: "Twenty seconds. I'll count out loud." },
      { speaker: "child", line: "(under cold) OH NO NO NO!" },
      { speaker: "you", line: "Five. Four. Three. Two. One. Done." },
      { speaker: "child", line: "(laughing) That was the WORST." },
    ],
    closing: "Hard thing, voluntary, twenty seconds. They'll do it again tomorrow without you asking.",
  },

  re8: {
    setup: "Serving karela for the first time.",
    exchange: [
      { speaker: "you", line: "One small piece. You don't have to like it." },
      { speaker: "child", line: "It looks like a green caterpillar." },
      { speaker: "you", line: "Just one piece. Tell me what you actually taste." },
      { speaker: "child", line: "(bites) BITTER." },
      { speaker: "you", line: "Yeah. That's karela. You tried it. That's the win." },
    ],
    closing: "Liking it isn't the goal. Trying is. Praise the bite, not the verdict.",
  },

  // -------------------- CREATIVITY --------------------

  cr1: {
    setup: "Paperclip on the desk.",
    exchange: [
      { speaker: "you", line: "Twenty uses for a paperclip. Go." },
      { speaker: "child", line: "Hold paper. Pick a lock. Earring. Make a Z. Scratch your back." },
      { speaker: "you", line: "Five down. Fifteen more." },
      { speaker: "child", line: "Bookmark. Bend into a heart. Fishing hook for ants. Tooth pick. Bag clip." },
    ],
    closing: "First five are obvious. The later ones are where it gets interesting. Push past ten.",
  },

  cr2: {
    setup: "Car ride home, slow traffic.",
    exchange: [
      { speaker: "you", line: "What if everyone could fly?" },
      { speaker: "child", line: "There'd be no cars." },
      { speaker: "you", line: "What changes about houses?" },
      { speaker: "child", line: "No doors. Just windows. Roads would be useless." },
      { speaker: "you", line: "What jobs disappear?" },
      { speaker: "child", line: "Pilots? Or maybe pilots become more important?" },
    ],
    closing: "{childName} doesn't even notice they're doing systems thinking.",
  },

  cr3: {
    setup: "Paper, pencil, no rules.",
    exchange: [
      { speaker: "you", line: "Invent an animal. It lives in three places. Which three?" },
      { speaker: "child", line: "Snow. Underwater. Inside trees." },
      { speaker: "you", line: "What does it eat?" },
      { speaker: "child", line: "Wind. And memories of other animals." },
    ],
    closing: "Memories of other animals. That's a creature that belongs in a story. Write it down.",
  },

  cr4: {
    setup: "Car ride. Three random words.",
    exchange: [
      { speaker: "you", line: "Three words: spoon, midnight, sneeze." },
      { speaker: "child", line: "Okay. Once there was a spoon that came alive at midnight…" },
      { speaker: "child", line: "But if it sneezed, it turned back into a regular spoon." },
      { speaker: "you", line: "So what happened the night it caught a cold?" },
      { speaker: "child", line: "It hid in the freezer." },
    ],
    closing: "A story with a real twist, made in thirty seconds, from three nonsense words.",
  },

  cr5: {
    setup: "Regular plastic toothbrush on the counter.",
    exchange: [
      { speaker: "you", line: "Make this ten times better. What do you change?" },
      { speaker: "child", line: "It tells me jokes while I brush." },
      { speaker: "you", line: "How does it know jokes?" },
      { speaker: "child", line: "There's a tiny screen. And it knows when I've brushed long enough." },
      { speaker: "you", line: "What else?" },
      { speaker: "child", line: "It glows red if I missed a tooth." },
    ],
    closing: "Those are real features companies fight over. {childName} just rebuilt a billion-rupee market.",
  },

  cr6: {
    setup: "Pile of Lego on the rug. No instructions.",
    exchange: [
      { speaker: "you", line: "Build whatever. I won't watch." },
      { speaker: "child", line: "(forty minutes later) Come see!" },
      { speaker: "you", line: "What is it?" },
      { speaker: "child", line: "It's a hotel for spies. The roof opens." },
    ],
    closing: "Best part: you didn't tell them what to make. The roof opening was their idea.",
  },

  cr7: {
    setup: "Dinner table, silly mood.",
    exchange: [
      { speaker: "you", line: "Worst possible business idea. Go." },
      { speaker: "child", line: "Selling rain to Mumbai during monsoon." },
      { speaker: "you", line: "Beautiful. Worse?" },
      { speaker: "child", line: "An umbrella with holes." },
      { speaker: "you", line: "Why holes?" },
      { speaker: "child", line: "So you can see the rain while you walk." },
    ],
    closing: "That hole-y umbrella might secretly be a real product. Bad-idea play unlocks real ideas.",
  },

  cr8: {
    setup: "In the kitchen, making dinner together.",
    exchange: [
      { speaker: "you", line: "Make a song about what we ate today." },
      { speaker: "child", line: "(singing) Dal chawal in the morning, dal chawal at noon…" },
      { speaker: "child", line: "Dal chaaaaaawal under the mooooooon." },
      { speaker: "you", line: "Make it dumber." },
      { speaker: "child", line: "(louder) DAL CHAWAL FOREVER, DAL CHAWAL ALWAYSSSSS." },
    ],
    closing: "The point isn't a song. The point is a song they made, which is a completely different thing.",
  },

  // -------------------- OBSERVATION --------------------

  ob1: {
    setup: "Eight small objects on a tray, cloth on top.",
    exchange: [
      { speaker: "you", line: "Look for 30 seconds. Try to remember everything." },
      { speaker: "child", line: "(staring intently)" },
      { speaker: "you", line: "(covers) Tell me everything you saw." },
      { speaker: "child", line: "Watch. Comb. Phone. Pen. Eraser. Two coins. Bottle cap." },
      { speaker: "you", line: "Seven of eight. You missed the rubber band." },
    ],
    closing: "Next time, eight of eight. Memory is just attention paid earlier.",
  },

  ob2: {
    setup: "You moved three things in the living room while {childName} was out.",
    exchange: [
      { speaker: "child", line: "(walks in) …you moved something." },
      { speaker: "you", line: "Three things. Find them." },
      { speaker: "child", line: "The plant is on the other side. The book is upside down. And…" },
      { speaker: "you", line: "One more." },
      { speaker: "child", line: "The clock! It's running fast. No, slow." },
    ],
    closing: "Their own home, and they've never really looked. Now they have.",
  },

  ob3: {
    setup: "Balcony, eyes closed, evening.",
    exchange: [
      { speaker: "you", line: "Five different sounds. Listen for one minute." },
      { speaker: "child", line: "Auto horn. Someone's TV. Pigeon." },
      { speaker: "child", line: "Dog far away. And… water in a pipe?" },
      { speaker: "you", line: "That last one is what most people miss." },
    ],
    closing: "Quiet sounds are skill. Most adults can't pull five out either.",
  },

  ob4: {
    setup: "Café. An uncle at the next table on a phone call.",
    exchange: [
      { speaker: "you", line: "Just watch him for one minute. Don't say anything yet." },
      { speaker: "child", line: "(one minute of watching)" },
      { speaker: "you", line: "What's happening?" },
      { speaker: "child", line: "He's angry but pretending not to be. His free hand keeps tapping the cup." },
    ],
    closing: "Body said one thing, mouth said another. {childName} caught the mismatch.",
  },

  ob5: {
    setup: "Standing in your own living room.",
    exchange: [
      { speaker: "you", line: "Three things you've never really looked at." },
      { speaker: "child", line: "The ceiling has a crack like a tiny river." },
      { speaker: "you", line: "Two more." },
      { speaker: "child", line: "The corner of the rug is faded. And our doorknob has a scratch like an X." },
    ],
    closing: "Walked past all three a thousand times. Today they actually saw them.",
  },

  ob6: {
    setup: "Empty bowl on the table.",
    exchange: [
      { speaker: "you", line: "Fill this with five different textures from around the house." },
      { speaker: "child", line: "(returns) Towel piece, jute mat, a leaf, the rough side of velcro, a smooth marble." },
      { speaker: "you", line: "Close your eyes. Touch one. Tell me which." },
      { speaker: "child", line: "(eyes closed, touching) The leaf. The veins." },
    ],
    closing: "Naming textures is the start of describing the world with precision.",
  },

  ob7: {
    setup: "At breakfast. A silly target word for the day.",
    exchange: [
      { speaker: "you", line: "Today, count how many times someone says 'okay.' Tell me at dinner." },
      { speaker: "child", line: "(at dinner) Forty-seven." },
      { speaker: "you", line: "Who said it the most?" },
      { speaker: "child", line: "You. By a lot." },
    ],
    closing: "Counting forces attention to background patterns adults stop hearing.",
  },

  ob8: {
    setup: "Nani is over and seems a little off today.",
    exchange: [
      { speaker: "you", line: "Watch Nani. What's her mood?" },
      { speaker: "child", line: "She's smiling but her shoulders are tight." },
      { speaker: "you", line: "What could be going on?" },
      { speaker: "child", line: "Maybe her back hurts? Or she's worried about something?" },
    ],
    closing: "Maybe both. {childName} just read the whole person, not just the face.",
  },

  // -------------------- DECISIVENESS --------------------

  de1: {
    setup: "6pm. Fridge is open. You've stepped back.",
    exchange: [
      { speaker: "you", line: "You pick dinner. Whatever you want, you decide." },
      { speaker: "child", line: "Anything?" },
      { speaker: "you", line: "Anything that's possible. You decide what's possible." },
      { speaker: "child", line: "Maggi with extra egg?" },
      { speaker: "you", line: "Done. You're cooking it with me." },
    ],
    closing: "The choice plus the follow-through is the lesson. Don't override later.",
  },

  de2: {
    setup: "Three movies to choose from. Sunday night.",
    exchange: [
      { speaker: "you", line: "Three options. Sixty seconds. Then we go with whatever you say." },
      { speaker: "child", line: "But what if I..." },
      { speaker: "you", line: "Forty seconds." },
      { speaker: "child", line: "…okay, the second one." },
    ],
    closing: "{childName} didn't get the perfect choice. They got a choice. That's the skill.",
  },

  de3: {
    setup: "Toy section, fixed budget.",
    exchange: [
      { speaker: "you", line: "Big Lego or two small ones. Not both." },
      { speaker: "child", line: "Why not?" },
      { speaker: "you", line: "Same money. You decide which matters more." },
      { speaker: "child", line: "…the big one. The small ones will be done in a day." },
    ],
    closing: "They named the trade-off out loud. That's adult-level reasoning.",
  },

  de4: {
    setup: "Saturday morning. Whole day open.",
    exchange: [
      { speaker: "you", line: "You plan today. What happens, in what order?" },
      { speaker: "child", line: "Cycle first. Then breakfast. Then library." },
      { speaker: "you", line: "Lunch?" },
      { speaker: "child", line: "After library. Then nap. Then ice cream." },
    ],
    closing: "Whatever they planned, follow it. The plan working is the lesson.",
  },

  de5: {
    setup: "Kirana store. Hundred rupees in {childName}'s hand.",
    exchange: [
      { speaker: "you", line: "I'll wait outside. We need bread, eggs, salt." },
      { speaker: "child", line: "(returns) I got bread and eggs. They didn't have small salt so I left it." },
      { speaker: "you", line: "Smart. Didn't waste the money. We'll get salt later." },
    ],
    closing: "Knowing what NOT to buy is half of buying things. Eight-year-old just learned it.",
  },

  de6: {
    setup: "Dinner story. Mira found 500 rupees in a park.",
    exchange: [
      { speaker: "you", line: "Should she keep it or try to find the owner?" },
      { speaker: "child", line: "Keep it." },
      { speaker: "you", line: "Why?" },
      { speaker: "child", line: "There's no real way to find the owner." },
      { speaker: "you", line: "Defend it more. What if someone says she's being selfish?" },
      { speaker: "child", line: "She didn't take it from anyone. If she gives it to a guard, the guard just keeps it." },
    ],
    closing: "They stated a position and defended it. That's hard for adults too.",
  },

  de7: {
    setup: "{childName} cut their own hair with kitchen scissors. Disaster.",
    exchange: [
      { speaker: "you", line: "Is this reversible or not?" },
      { speaker: "child", line: "It'll grow back?" },
      { speaker: "you", line: "How long?" },
      { speaker: "child", line: "Two months?" },
      { speaker: "you", line: "So… reversible. Worth being this upset?" },
      { speaker: "child", line: "…not really." },
    ],
    closing: "They'll use this question for years. The frame is the gift.",
  },

  de8: {
    setup: "{childName} picked chips over chocolate. Now regrets it.",
    exchange: [
      { speaker: "child", line: "I should have got the chocolate." },
      { speaker: "you", line: "Maybe. That was the choice." },
      { speaker: "child", line: "Can I have the chocolate too?" },
      { speaker: "you", line: "No. You picked chips. Eat the chips." },
      { speaker: "child", line: "(sulks, eats chips)" },
    ],
    closing: "Tomorrow they choose differently. Rescue them and they don't learn anything.",
  },
};
