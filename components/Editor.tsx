"use client";

import { HandPad } from "@/components/HandPad";
import { compressImage, readFileAsDataUrl } from "@/lib/image";
import { emptyBeat, saveLocal, shareUrl } from "@/lib/letter";
import { Beat, DEFAULT_DURATION_MS, EFFECTS, Letter } from "@/lib/types";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

type Menu = { x: number; y: number; beatId: string } | null;

function groupsOf(beats: Beat[]) {
  const groups: Beat[][] = [];
  for (const beat of beats) {
    if (!groups.length || beat.newParagraph) groups.push([beat]);
    else groups[groups.length - 1].push(beat);
  }
  return groups;
}

export function Editor({ initial }: { initial: Letter }) {
  const [letter, setLetter] = useState(initial);
  const [active, setActive] = useState(initial.beats[0]?.id);
  const [menu, setMenu] = useState<Menu>(null);
  const [link, setLink] = useState("");
  const [status, setStatus] = useState("");
  const [pad, setPad] = useState(false);
  const imageInput = useRef<HTMLInputElement>(null);
  const handInput = useRef<HTMLInputElement>(null);
  const audioInput = useRef<HTMLInputElement>(null);
  const pendingBeat = useRef<string | null>(null);
  const pendingKind = useRef<"image" | "hand">("image");
  const menuRef = useRef<HTMLDivElement>(null);

  function updateBeat(id: string, patch: Partial<Beat>) {
    setLetter((cur) => ({
      ...cur,
      beats: cur.beats.map((b) => (b.id === id ? { ...b, ...patch } : b)),
    }));
  }

  function addBeat(afterId?: string, asParagraph = false) {
    const beat = emptyBeat("");
    if (asParagraph) beat.newParagraph = true;
    setLetter((cur) => {
      const next = [...cur.beats];
      const i = afterId ? next.findIndex((b) => b.id === afterId) : next.length - 1;
      next.splice(i + 1, 0, beat);
      return { ...cur, beats: next };
    });
    setActive(beat.id);
  }

  function removeBeat(id: string) {
    setLetter((cur) => {
      const beats = cur.beats.filter((b) => b.id !== id);
      const next = beats.length ? beats : [emptyBeat("")];
      if (active === id) setActive(next[0].id);
      return { ...cur, beats: next };
    });
  }

  async function onPickFile(file: File) {
    const id = pendingBeat.current;
    if (!id) return;
    if (pendingKind.current === "hand") {
      const data = await compressImage(file, 640, 0.7);
      updateBeat(id, { handwritingDataUrl: data, handwritingSide: "right" });
      return;
    }
    const data = await compressImage(file);
    updateBeat(id, { imageDataUrl: data, imageSide: "left" });
  }

  async function onAudio(file: File) {
    const id = pendingBeat.current;
    if (!id) return;
    try {
      const data = await readFileAsDataUrl(file);
      updateBeat(id, { audioDataUrl: data });
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Audio failed");
    }
  }

  async function publish() {
    setStatus("Saving…");
    saveLocal(letter);
    try {
      const res = await fetch("/api/letters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(letter),
      });
      if (!res.ok) throw new Error("save failed");
      const data = (await res.json()) as { id: string };
      const saved = { ...letter, id: data.id };
      setLetter(saved);
      saveLocal(saved);
      const url = shareUrl(saved);
      setLink(url);
      await navigator.clipboard.writeText(url).catch(() => {});
      setStatus("Short link copied.");
    } catch {
      const url = shareUrl(letter);
      setLink(url);
      await navigator.clipboard.writeText(url).catch(() => {});
      setStatus("Saved on this browser.");
    }
  }

  useLayoutEffect(() => {
    if (!menu || !menuRef.current) return;
    const el = menuRef.current;
    const rect = el.getBoundingClientRect();
    let left = menu.x;
    let top = menu.y;
    const padN = 8;
    if (left + rect.width > window.innerWidth - padN) left = window.innerWidth - rect.width - padN;
    if (top + rect.height > window.innerHeight - padN) top = window.innerHeight - rect.height - padN;
    if (left < padN) left = padN;
    if (top < padN) top = padN;
    el.style.left = `${left}px`;
    el.style.top = `${top}px`;
  }, [menu]);

  useEffect(() => {
    if (!menu) return;
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenu(null);
    };
    window.addEventListener("mousedown", close);
    return () => window.removeEventListener("mousedown", close);
  }, [menu]);

  const extras = useMemo(
    () =>
      letter.beats.flatMap((b) => {
        const bits: { id: string; src: string; side: "left" | "right"; kind: string }[] = [];
        if (b.imageDataUrl) bits.push({ id: `${b.id}-img`, src: b.imageDataUrl, side: b.imageSide ?? "left", kind: "photo" });
        if (b.handwritingDataUrl) {
          bits.push({
            id: `${b.id}-hand`,
            src: b.handwritingDataUrl,
            side: b.handwritingSide ?? "right",
            kind: "hand",
          });
        }
        return bits;
      }),
    [letter.beats],
  );

  const groups = groupsOf(letter.beats);

  return (
    <div className="create-page">
      <div className="create-top">
        <div>
          <div className="letter-kicker">Creator</div>
          <h1 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: 36, margin: 0 }}>Write the letter</h1>
        </div>
        <div className="row">
          <button
            className="btn ghost"
            onClick={() => {
              saveLocal(letter);
              window.location.href = shareUrl(letter);
            }}
          >
            Preview
          </button>
          <button className="btn rose" onClick={publish}>
            Copy share link
          </button>
        </div>
      </div>

      <div className="scene creator-scene">
        <aside className="rail">
          {extras
            .filter((x) => x.side === "left")
            .map((x) => (
              <img key={x.id} src={x.src} alt="" className={`side-card ${x.kind}`} />
            ))}
        </aside>
        <div className="paper-letter growing">
          <div className="letter-kicker">{letter.to ? `For ${letter.to}` : letter.title}</div>
          {groups.map((group, gi) => (
            <p key={gi} className="letter-p">
              {group.map((b, i) => (
                <span key={b.id} className={active === b.id ? "live-span" : ""}>
                  {i > 0 ? " " : null}
                  {b.text || "…"}
                </span>
              ))}
            </p>
          ))}
          {letter.from ? <p className="signoff">— {letter.from}</p> : null}
        </div>
        <aside className="rail">
          {extras
            .filter((x) => x.side === "right")
            .map((x) => (
              <img key={x.id} src={x.src} alt="" className={`side-card ${x.kind}`} />
            ))}
        </aside>
      </div>

      <div className="card timeline-card">
        <div className="meta">
          <input placeholder="Title" value={letter.title} onChange={(e) => setLetter({ ...letter, title: e.target.value })} />
          <input placeholder="To" value={letter.to} onChange={(e) => setLetter({ ...letter, to: e.target.value })} />
          <input placeholder="From" value={letter.from} onChange={(e) => setLetter({ ...letter, from: e.target.value })} />
        </div>
        {letter.beats.map((beat, i) => (
          <div
            key={beat.id}
            className={`beat-row ${active === beat.id ? "active" : ""} ${beat.newParagraph ? "para" : ""}`}
            onClick={() => setActive(beat.id)}
            onContextMenu={(e) => {
              e.preventDefault();
              setActive(beat.id);
              setMenu({ x: e.clientX, y: e.clientY, beatId: beat.id });
            }}
          >
            {beat.newParagraph ? <div className="para-tag">New paragraph</div> : null}
            <textarea
              rows={2}
              placeholder={`Sentence ${i + 1}`}
              value={beat.text}
              onChange={(e) => updateBeat(beat.id, { text: e.target.value })}
            />
            <div className="beat-tools">
              <span>
                {beat.effect}
                {beat.imageDataUrl ? " · photo" : ""}
                {beat.handwritingDataUrl ? " · handwriting" : ""}
                {beat.audioDataUrl ? " · sound" : ""}
                {" · "}
                <input
                  type="number"
                  min={1}
                  step={0.5}
                  value={beat.durationMs / 1000}
                  onChange={(e) =>
                    updateBeat(beat.id, {
                      durationMs: Math.max(1000, Number(e.target.value) * 1000 || DEFAULT_DURATION_MS),
                    })
                  }
                  style={{ width: 64 }}
                />
                s
              </span>
              <button
                type="button"
                className="linkish"
                onClick={(e) => {
                  e.stopPropagation();
                  removeBeat(beat.id);
                  setMenu(null);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        <div className="row" style={{ justifyContent: "flex-start" }}>
          <button className="btn ghost" onClick={() => addBeat(letter.beats.at(-1)?.id)}>
            Add sentence
          </button>
          <button className="btn ghost" onClick={() => addBeat(letter.beats.at(-1)?.id, true)}>
            New paragraph
          </button>
        </div>
        <p style={{ color: "var(--ink-soft)", fontSize: 13 }}>
          The page in the middle is the letter. Photos and handwriting sit outside it. Right-click a sentence to attach
          them. Next sentence stays on this page.
        </p>
        {status ? <p>{status}</p> : null}
        {link ? <div className="share-box">{link}</div> : null}
      </div>

      <input
        ref={imageInput}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onPickFile(file);
          e.target.value = "";
        }}
      />
      <input
        ref={handInput}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          pendingKind.current = "hand";
          const file = e.target.files?.[0];
          if (file) onPickFile(file);
          e.target.value = "";
        }}
      />
      <input
        ref={audioInput}
        type="file"
        accept="audio/*"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onAudio(file);
          e.target.value = "";
        }}
      />

      {pad ? (
        <HandPad
          onClose={() => setPad(false)}
          onSave={(data) => {
            const id = pendingBeat.current ?? active;
            if (id) updateBeat(id, { handwritingDataUrl: data, handwritingSide: "right" });
            setPad(false);
          }}
        />
      ) : null}

      {menu ? (
        <div ref={menuRef} className="menu" style={{ left: menu.x, top: menu.y }}>
          {EFFECTS.map((fx) => (
            <button
              key={fx.id}
              onClick={() => {
                updateBeat(menu.beatId, { effect: fx.id });
                setMenu(null);
              }}
            >
              Effect: {fx.label}
            </button>
          ))}
          <button
            onClick={() => {
              pendingBeat.current = menu.beatId;
              pendingKind.current = "image";
              imageInput.current?.click();
              setMenu(null);
            }}
          >
            Add photo (beside letter)
          </button>
          <button
            onClick={() => {
              const beat = letter.beats.find((b) => b.id === menu.beatId);
              updateBeat(menu.beatId, { imageSide: beat?.imageSide === "right" ? "left" : "right" });
              setMenu(null);
            }}
          >
            Flip photo side
          </button>
          <button
            onClick={() => {
              pendingBeat.current = menu.beatId;
              setMenu(null);
              setPad(true);
            }}
          >
            Write by hand
          </button>
          <button
            onClick={() => {
              pendingBeat.current = menu.beatId;
              pendingKind.current = "hand";
              handInput.current?.click();
              setMenu(null);
            }}
          >
            Upload handwriting
          </button>
          <button
            onClick={() => {
              const beat = letter.beats.find((b) => b.id === menu.beatId);
              updateBeat(menu.beatId, { handwritingSide: beat?.handwritingSide === "left" ? "right" : "left" });
              setMenu(null);
            }}
          >
            Flip handwriting side
          </button>
          <button
            onClick={() => {
              pendingBeat.current = menu.beatId;
              audioInput.current?.click();
              setMenu(null);
            }}
          >
            Add sound (once)
          </button>
          <button
            onClick={() => {
              const beat = letter.beats.find((b) => b.id === menu.beatId);
              updateBeat(menu.beatId, { newParagraph: !beat?.newParagraph });
              setMenu(null);
            }}
          >
            Toggle new paragraph
          </button>
          <button
            onClick={() => {
              addBeat(menu.beatId);
              setMenu(null);
            }}
          >
            Insert sentence below
          </button>
          <button
            onClick={() => {
              removeBeat(menu.beatId);
              setMenu(null);
            }}
          >
            Delete sentence
          </button>
        </div>
      ) : null}
    </div>
  );
}
