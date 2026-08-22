import { Letter } from "./types";

const SIDES = [
  { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Rick_Astley_2019.jpg/640px-Rick_Astley_2019.jpg", side: "left" as const },
  { url: "https://media.giphy.com/media/Ju7l5y9osyymQ/giphy.gif", side: "right" as const },
  { url: "https://media.giphy.com/media/5kq0GdjR3jz4s/giphy.gif", side: "left" as const },
  { url: "https://media.giphy.com/media/Vuw9m5wXviFsQ/giphy.gif", side: "right" as const },
  { url: "https://media.giphy.com/media/g7GKcSzwQfugw/giphy.gif", side: "left" as const },
];

export const RICK_LETTER: Letter = {
  id: "rick",
  title: "For you",
  to: "you",
  from: "me",
  createdAt: 0,
  beats: [
    {
      id: "s1",
      text: "I have started this letter more times than I will admit.",
      durationMs: 4200,
      effect: "typewriter",
    },
    {
      id: "s2",
      text: "Each draft sounded too small for what I mean, or too loud for how quietly I carry it.",
      durationMs: 4800,
      effect: "typewriter",
    },
    {
      id: "s3",
      text: "I keep a night in my pocket: the walk home, your laugh, my hand finding yours without asking.",
      durationMs: 5000,
      effect: "typewriter",
      newParagraph: true,
    },
    {
      id: "s4",
      text: "I did not know a person could feel like a room getting warmer.",
      durationMs: 4200,
      effect: "fade",
    },
    {
      id: "s5",
      text: "If the years get heavy, I am still here. That is the whole promise.",
      durationMs: 4500,
      effect: "typewriter",
      newParagraph: true,
    },
    {
      id: "s6",
      text: "So let me say it the way a letter should end. Slowly. Like a vow.",
      durationMs: 4000,
      effect: "fade",
    },
    {
      id: "m1",
      text: "Never gonna give you up.",
      durationMs: 2800,
      effect: "typewriter",
      newParagraph: true,
    },
    {
      id: "m2",
      text: "Never gonna let you down.",
      durationMs: 2800,
      effect: "typewriter",
    },
    {
      id: "m3",
      text: "Never gonna run around and desert you.",
      durationMs: 3200,
      effect: "typewriter",
    },
    {
      id: "g1",
      text: "",
      durationMs: 18000,
      effect: "instant",
      newParagraph: true,
      sideGifs: SIDES,
      audioUrl: "/sting.wav",
    },
  ],
};
