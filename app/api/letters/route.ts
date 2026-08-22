import { publishRemote, putLetter } from "@/lib/store";
import type { Letter } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const letter = (await req.json()) as Letter;
  if (!letter?.id || !Array.isArray(letter.beats)) {
    return Response.json({ error: "Invalid letter" }, { status: 400 });
  }
  const remoteId = await publishRemote(letter);
  const saved = { ...letter, id: remoteId || letter.id };
  await putLetter(saved);
  return Response.json({ id: saved.id });
}

export async function GET() {
  return Response.json({ ok: true });
}
