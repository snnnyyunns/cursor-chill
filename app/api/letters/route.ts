import type { Letter } from "@/lib/types";

const g = globalThis as typeof globalThis & { __letters?: Map<string, Letter> };

function store() {
  if (!g.__letters) g.__letters = new Map();
  return g.__letters;
}

export async function GET() {
  return Response.json({ ids: [...store().keys()] });
}

export async function POST(req: Request) {
  const letter = (await req.json()) as Letter;
  if (!letter?.id || !Array.isArray(letter.beats)) {
    return Response.json({ error: "Invalid letter" }, { status: 400 });
  }
  store().set(letter.id, letter);
  return Response.json({ id: letter.id });
}
