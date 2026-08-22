export type Effect = "typewriter" | "fade" | "slide" | "instant";

export type Beat = {
  id: string;
  text: string;
  durationMs: number;
  effect: Effect;
  newParagraph?: boolean;
  imageDataUrl?: string;
  imageUrl?: string;
  imageSide?: "left" | "right";
  handwritingDataUrl?: string;
  handwritingSide?: "left" | "right";
  audioDataUrl?: string;
  videoUrl?: string;
};

export type Letter = {
  id: string;
  title: string;
  to: string;
  from: string;
  beats: Beat[];
  createdAt: number;
};

export const DEFAULT_DURATION_MS = 4000;

export const EFFECTS: { id: Effect; label: string }[] = [
  { id: "typewriter", label: "Typewriter" },
  { id: "fade", label: "Fade" },
  { id: "slide", label: "Rise" },
  { id: "instant", label: "Instant" },
];
