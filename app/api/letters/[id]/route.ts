import type { Letter } from "@/lib/types";

const g = globalThis as typeof globalThis & { __letters?: Map<string, Letter> };

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const letter = g.__letters?.get(id);
  if (!letter) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(letter);
}
