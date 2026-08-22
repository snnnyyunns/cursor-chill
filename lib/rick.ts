import { Letter } from "./types";

const GIFS = {
  dance: "https://media.giphy.com/media/Vuw9m5wXviFsQ/giphy.gif",
  roll: "https://media.giphy.com/media/g7GKcSzwQfugw/giphy.gif",
  astley: "https://media.giphy.com/media/Ju7l5y9osyymQ/giphy.gif",
  mic: "https://media.giphy.com/media/5kq0GdjR3jz4s/giphy.gif",
};

export const RICK_LETTER: Letter = {
  id: "rick",
  title: "A letter for the room",
  to: "Salaya",
  from: "the house",
  createdAt: 0,
  beats: [
    {
      id: "r1",
      text: "We wrote you a love letter. Click the heart. Stay with it.",
      durationMs: 4200,
      effect: "typewriter",
    },
    {
      id: "r2",
      text: "This slot is for someone we appreciate: all of you, right now, in this room.",
      durationMs: 4300,
      effect: "typewriter",
    },
    {
      id: "r3",
      text: "A small confession, though. The next attachments are not from our camera roll.",
      durationMs: 4500,
      effect: "fade",
      newParagraph: true,
      imageUrl: GIFS.dance,
      imageSide: "left",
    },
    {
      id: "r4",
      text: "If this looks familiar, you are already too late.",
      durationMs: 3800,
      effect: "typewriter",
      imageUrl: GIFS.roll,
      imageSide: "right",
    },
    {
      id: "r5",
      text: "Thank you for watching our demo so carefully.",
      durationMs: 3600,
      effect: "typewriter",
      newParagraph: true,
      imageUrl: GIFS.astley,
      imageSide: "left",
    },
    {
      id: "r6",
      text: "One last gift. Sound on, if the room allows it.",
      durationMs: 3500,
      effect: "fade",
      imageUrl: GIFS.mic,
      imageSide: "right",
    },
    {
      id: "r7",
      text: "Rick Astley, 1987. You know the title. You have been rolled.",
      durationMs: 14000,
      effect: "slide",
      newParagraph: true,
      videoUrl: "https://www.youtube.com/embed/dQw4w9wgGcQ?autoplay=1&rel=0",
    },
  ],
};
