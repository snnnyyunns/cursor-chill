"use client";

import { compressImage, readFileAsDataUrl } from "@/lib/image";
import { emptyBeat, saveLocal, shareUrl } from "@/lib/letter";
import { Beat, DEFAULT_DURATION_MS, EFFECTS, Letter } from "@/lib/types";
import { useRef, useState } from "react";

type Menu = { x: number; y: number; beatId: string } | null;

export function Editor({ initial }: { initial: Letter }) {
  const [letter, setLetter] = useState(initial);
  const [active, setActive] = useState(initial.beats[0]?.id);
  const [menu, setMenu] = useState<Menu>(null);
  const [link, setLink] = useState("");
  const [status, setStatus] = useState("");
  const imageInput = useRef<HTMLInputElement>(null);
  const audioInput = useRef<HTMLInputElement>(null);
  const pendingBeat = useRef<string | null>(null);

  function updateBeat(id: string, patch: Partial<Beat>) {
    setLetter((cur) => ({
      ...cur,
      beats: cur.beats.map((b) => (b.id === id ? { ...b, ...patch } : b)),
    }));
  }

  function addBeat(afterId?: string) {
    const beat = emptyBeat("");
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
      return { ...cur, beats: beats.length ? beats : [emptyBeat("")] };
    });
  }

  async function onImage(file: File) {
    const id = pendingBeat.current;
    if (!id) return;
    const data = await compressImage(file);
    updateBeat(id, { imageDataUrl: data });
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
      await fetch("/api/letters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(letter),
      });
    } catch {
      /* hash in the URL is the real share payload */
    }
    const url = shareUrl(letter);
    setLink(url);
    await navigator.clipboard.writeText(url).catch(() => {});
    setStatus("Link copied. Send it to the viewer.");
  }

  return (
    <div className="wrap">
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 16 }}>
        <div>
          <div className="letter-kicker">Creator</div>
          <h1 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: 42, margin: 0 }}>Write the letter</h1>
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

      <div className="editor">
        <div className="card">
          <div className="meta">
            <input
              placeholder="Title"
              value={letter.title}
              onChange={(e) => setLetter({ ...letter, title: e.target.value })}
            />
            <input placeholder="To" value={letter.to} onChange={(e) => setLetter({ ...letter, to: e.target.value })} />
            <input
              placeholder="From"
              value={letter.from}
              onChange={(e) => setLetter({ ...letter, from: e.target.value })}
            />
          </div>
          {letter.beats.map((beat, i) => (
            <div
              key={beat.id}
              className={`beat-row ${active === beat.id ? "active" : ""}`}
              onClick={() => setActive(beat.id)}
              onContextMenu={(e) => {
                e.preventDefault();
                setActive(beat.id);
                setMenu({ x: e.clientX, y: e.clientY, beatId: beat.id });
              }}
            >
              <textarea
                rows={2}
                placeholder={`Sentence ${i + 1}`}
                value={beat.text}
                onChange={(e) => updateBeat(beat.id, { text: e.target.value })}
              />
              {beat.imageDataUrl ? <img className="thumb" src={beat.imageDataUrl} alt="" /> : null}
              <div className="beat-tools">
                <span>
                  {beat.effect}
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
                <span>Right-click for effect / image / sound</span>
              </div>
            </div>
          ))}
          <button className="btn ghost" onClick={() => addBeat(letter.beats.at(-1)?.id)}>
            Add sentence
          </button>
        </div>

        <div className="card">
          <p style={{ marginTop: 0, color: "var(--ink-soft)" }}>
            Timeline: each sentence is a beat. Default runtime is {DEFAULT_DURATION_MS / 1000}s. Viewers can switch
            auto (cutscene) or manual (visual novel). Recap shows text and pictures, never sound.
          </p>
          {status ? <p>{status}</p> : null}
          {link ? <div className="share-box">{link}</div> : null}
        </div>
      </div>

      <input
        ref={imageInput}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onImage(file);
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

      {menu ? (
        <div className="menu" style={{ left: menu.x, top: menu.y }} onMouseLeave={() => setMenu(null)}>
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
              updateBeat(menu.beatId, { durationMs: 2500 });
              setMenu(null);
            }}
          >
            Runtime 2.5s
          </button>
          <button
            onClick={() => {
              updateBeat(menu.beatId, { durationMs: 4000 });
              setMenu(null);
            }}
          >
            Runtime 4s (default)
          </button>
          <button
            onClick={() => {
              updateBeat(menu.beatId, { durationMs: 7000 });
              setMenu(null);
            }}
          >
            Runtime 7s
          </button>
          <label
            onClick={() => {
              pendingBeat.current = menu.beatId;
              imageInput.current?.click();
              setMenu(null);
            }}
          >
            Add image
          </label>
          <label
            onClick={() => {
              pendingBeat.current = menu.beatId;
              audioInput.current?.click();
              setMenu(null);
            }}
          >
            Add sound (once)
          </label>
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
