import LZString from "lz-string";
import { Beat, DEFAULT_DURATION_MS, Letter } from "./types";

const STORE_KEY = "loveletters.v1";

export function uid() {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 10);
}

export function emptyBeat(text = ""): Beat {
  return {
    id: uid(),
    text,
    durationMs: DEFAULT_DURATION_MS,
    effect: "typewriter",
  };
}

export function emptyLetter(): Letter {
  return {
    id: uid(),
    title: "A letter",
    to: "",
    from: "",
    beats: [emptyBeat("I wanted to tell you this in person.")],
    createdAt: Date.now(),
  };
}

export function loadAll(): Record<string, Letter> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY) || "{}");
  } catch {
    return {};
  }
}

export function saveLocal(letter: Letter) {
  const all = loadAll();
  all[letter.id] = letter;
  localStorage.setItem(STORE_KEY, JSON.stringify(all));
}

export function loadLocal(id: string): Letter | null {
  return loadAll()[id] ?? null;
}

export function encodeLetter(letter: Letter) {
  return LZString.compressToEncodedURIComponent(JSON.stringify(letter));
}

export function decodeLetter(payload: string): Letter | null {
  try {
    const json = LZString.decompressFromEncodedURIComponent(payload);
    if (!json) return null;
    const letter = JSON.parse(json) as Letter;
    if (!letter?.id || !Array.isArray(letter.beats)) return null;
    return letter;
  } catch {
    return null;
  }
}

export function shareUrl(letter: Letter) {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/v/${letter.id}#${encodeLetter(letter)}`;
}
