import { fetchRemote, getLetter, putLetter } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const local = await getLetter(id);
  if (local) return Response.json(local);
  const remote = await fetchRemote(id);
  if (remote) {
    await putLetter(remote);
    return Response.json(remote);
  }
  return Response.json({ error: "Not found" }, { status: 404 });
}
