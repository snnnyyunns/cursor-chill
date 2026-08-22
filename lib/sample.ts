import { Letter } from "./types";

export const SAMPLE_LETTER: Letter = {
  id: "demo",
  title: "A letter",
  to: "you",
  from: "me",
  createdAt: 0,
  beats: [
    {
      id: "b1",
      text: "I sat down to write you something simple, because the true things usually are.",
      durationMs: 4500,
      effect: "typewriter",
    },
    {
      id: "b2",
      text: "I love you. Not as a line in a song. As the quiet I look for when the day is loud.",
      durationMs: 4800,
      effect: "typewriter",
    },
    {
      id: "b3",
      text: "I love how you enter a room without trying to own it, and still the air changes.",
      durationMs: 4600,
      effect: "typewriter",
      newParagraph: true,
    },
    {
      id: "b4",
      text: "I love the way you remember small details I forget I mentioned.",
      durationMs: 4000,
      effect: "fade",
    },
    {
      id: "b5",
      text: "I love that I can be tired next to you and not have to perform being fine.",
      durationMs: 4200,
      effect: "typewriter",
    },
    {
      id: "b6",
      text: "There is a night I keep: streetlight, your laugh, my hand finding yours without asking.",
      durationMs: 5000,
      effect: "typewriter",
      newParagraph: true,
    },
    {
      id: "b7",
      text: "I did not know a person could feel like arriving home while we were still walking.",
      durationMs: 4800,
      effect: "slide",
    },
    {
      id: "b8",
      text: "If I am lucky, I get a long string of ordinary days with you in them.",
      durationMs: 4500,
      effect: "typewriter",
      newParagraph: true,
    },
    {
      id: "b9",
      text: "That is the life I want. Breakfast. Bad jokes. Your head on my shoulder on the way back.",
      durationMs: 4800,
      effect: "typewriter",
    },
    {
      id: "b10",
      text: "So this is the whole letter: I choose you, today, and the days I have not met yet.",
      durationMs: 5200,
      effect: "typewriter",
      newParagraph: true,
    },
    {
      id: "b11",
      text: "Keep this. I meant every line.",
      durationMs: 3800,
      effect: "fade",
    },
  ],
};
