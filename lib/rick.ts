import { Letter } from "./types";

const GIFS = [
  { url: "https://media.giphy.com/media/Vuw9m5wXviFsQ/giphy.gif", side: "left" as const },
  { url: "https://media.giphy.com/media/g7GKcSzwQfugw/giphy.gif", side: "right" as const },
  { url: "https://media.giphy.com/media/Ju7l5y9osyymQ/giphy.gif", side: "left" as const },
  { url: "https://media.giphy.com/media/5kq0GdjR3jz4s/giphy.gif", side: "right" as const },
];

export const RICK_LETTER: Letter = {
  id: "rick",
  title: "A letter",
  to: "you",
  from: "Rick",
  createdAt: 0,
  beats: [
    {
      id: "r1",
      text: "Never gonna give you up.",
      durationMs: 2800,
      effect: "typewriter",
    },
    {
      id: "r2",
      text: "Never gonna let you down.",
      durationMs: 2800,
      effect: "typewriter",
    },
    {
      id: "r3",
      text: "Never gonna run around and desert you.",
      durationMs: 3200,
      effect: "typewriter",
      newParagraph: true,
    },
    {
      id: "r4",
      text: "You know the rest.",
      durationMs: 2400,
      effect: "fade",
    },
    {
      id: "r5",
      text: "",
      durationMs: 3500,
      effect: "instant",
      newParagraph: true,
      sideGifs: GIFS,
    },
    {
      id: "r6",
      text: "Sound on.",
      durationMs: 16000,
      effect: "slide",
      newParagraph: true,
      videoUrl: "https://www.youtube.com/embed/dQw4w9wgGcQ?autoplay=1&rel=0",
    },
  ],
};
