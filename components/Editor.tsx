"use client";

import { compressImage, readFileAsDataUrl } from "@/lib/image";
import { emptyBeat, saveLocal, shareUrl } from "@/lib/letter";
import { Beat, DEFAULT_DURATION_MS, EFFECTS, Letter } from "@/lib/types";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

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
      setStatus("Saved on this browser. Share may not work on another phone until save succeeds.");
    }
  }

  useLayoutEffect(() => {
    if (!menu || !menuRef.current) return;
    const el = menuRef.current;
    const rect = el.getBoundingClientRect();
    let left = menu.x;
    let top = menu.y;
    const pad = 8;
    if (left + rect.width > window.innerWidth - pad) left = window.innerWidth - rect.width - pad;
    if (top + rect.height > window.innerHeight - pad) top = window.innerHeight - rect.height - pad;
    if (left < pad) left = pad;
    if (top < pad) top = pad;
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
        </div>

        <div className="card">
          <p style={{ marginTop: 0, color: "var(--ink-soft)" }}>
            Sentences stay on one page and stack downward. Use <b>New paragraph</b> for a break. Right-click for
            effect, image, or sound. Delete is on each row.
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
          <button
            onClick={() => {
              pendingBeat.current = menu.beatId;
              imageInput.current?.click();
              setMenu(null);
            }}
          >
            Add image
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
