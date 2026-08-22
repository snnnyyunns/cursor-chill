import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import type { Letter } from "./types";

const g = globalThis as typeof globalThis & { __letters?: Map<string, Letter> };
const DIR = path.join("/tmp", "loveletters");

function mem() {
  if (!g.__letters) g.__letters = new Map();
  return g.__letters;
}

export async function putLetter(letter: Letter) {
  mem().set(letter.id, letter);
  try {
    await mkdir(DIR, { recursive: true });
    await writeFile(path.join(DIR, `${letter.id}.json`), JSON.stringify(letter), "utf8");
  } catch {
    /* serverless fs can fail; memory still holds it */
  }
}

export async function getLetter(id: string): Promise<Letter | null> {
  const hit = mem().get(id);
  if (hit) return hit;
  try {
    const letter = JSON.parse(await readFile(path.join(DIR, `${id}.json`), "utf8")) as Letter;
    mem().set(id, letter);
    return letter;
  } catch {
    return null;
  }
}

export async function publishRemote(letter: Letter): Promise<string | null> {
  try {
    const res = await fetch("https://paste.rs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(letter),
    });
    if (!res.ok) return null;
    const url = (await res.text()).trim();
    const id = url.split("/").filter(Boolean).pop();
    return id ?? null;
  } catch {
    return null;
  }
}

export async function fetchRemote(id: string): Promise<Letter | null> {
  try {
    const res = await fetch(`https://paste.rs/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    const letter = (await res.json()) as Letter;
    if (!letter?.beats) return null;
    return { ...letter, id };
  } catch {
    return null;
  }
}
