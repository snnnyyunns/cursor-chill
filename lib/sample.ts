import { Letter } from "./types";

export const SAMPLE_LETTER: Letter = {
  id: "demo",
  title: "For you",
  to: "you",
  from: "me",
  createdAt: 0,
  beats: [
    {
      id: "b1",
      text: "I keep a small list of ordinary things that still feel like luck.",
      durationMs: 4500,
      effect: "typewriter",
    },
    {
      id: "b2",
      text: "Your name is near the top. It has been for a while.",
      durationMs: 4200,
      effect: "fade",
    },
    {
      id: "b3",
      text: "This is not a grand speech. It is a letter I can finally hand you.",
      durationMs: 5000,
      effect: "slide",
      newParagraph: true,
    },
  ],
};
