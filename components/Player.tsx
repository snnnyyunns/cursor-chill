"use client";

import { Envelope } from "@/components/Envelope";
import { Beat, Letter } from "@/lib/types";
import { useEffect, useMemo, useRef, useState } from "react";

function groupsOf(beats: { beat: Beat; text: string }[]) {
  const groups: { beat: Beat; text: string }[][] = [];
  for (const item of beats) {
    if (!groups.length || item.beat.newParagraph) groups.push([item]);
    else groups[groups.length - 1].push(item);
  }
  return groups;
}

function sideOf(kind: "image" | "hand", beat: Beat): "left" | "right" {
  if (kind === "image") return beat.imageSide ?? "left";
  return beat.handwritingSide ?? "right";
}

export function Player({ letter }: { letter: Letter }) {
  const [opened, setOpened] = useState(false);
  const [index, setIndex] = useState(0);
  const [mode, setMode] = useState<"auto" | "manual">("auto");
  const [typed, setTyped] = useState("");
  const [done, setDone] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const beat = letter.beats[index];

  const kicker = useMemo(() => {
    if (letter.to) return `For ${letter.to}`;
    return letter.title || "A letter";
  }, [letter]);

  const visible = useMemo(() => {
    const last = done ? letter.beats.length - 1 : index;
    return letter.beats.slice(0, Math.max(0, last + 1)).map((b, i) => ({
      beat: b,
      text: !done && i === index && b.effect === "typewriter" ? typed : !done && i === index ? typed || b.text : b.text,
      revealed: done || i < index || b.effect !== "typewriter" || typed === b.text || typed.length >= b.text.length,
    }));
  }, [letter.beats, index, typed, done]);

  useEffect(() => {
    if (!opened || !beat || done) return;
    setTyped(beat.effect === "typewriter" ? "" : beat.text);
    let cancelled = false;
    audioRef.current?.pause();
    if (beat.audioDataUrl) {
      const a = new Audio(beat.audioDataUrl);
      audioRef.current = a;
      a.play().catch(() => {});
    }

    const chars = [...beat.text];
    const typeMs =
      beat.effect === "typewriter" ? Math.min(2800, Math.max(900, beat.durationMs * 0.62)) : beat.effect === "instant" ? 0 : 420;
    let frame = 0;
    if (beat.effect === "typewriter") {
      const started = performance.now();
      const tick = (now: number) => {
        if (cancelled) return;
        const t = Math.min(1, (now - started) / Math.max(1, typeMs));
        const n = Math.round(t * chars.length);
        setTyped(chars.slice(0, n).join(""));
        if (t < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    }

    const advance = () => {
      if (cancelled) return;
      audioRef.current?.pause();
      if (index >= letter.beats.length - 1) setDone(true);
      else setIndex((n) => n + 1);
    };

    let hold: number | undefined;
    const waitThen = () => {
      if (mode === "manual") return;
      hold = window.setTimeout(advance, Math.max(400, beat.durationMs - typeMs));
    };
    const ready = window.setTimeout(waitThen, typeMs);

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      window.clearTimeout(ready);
      if (hold) window.clearTimeout(hold);
    };
  }, [opened, index, beat, mode, done, letter.beats.length]);

  if (!opened) return <Envelope onOpen={() => setOpened(true)} />;
  if (!beat && !done) return null;

  const groups = groupsOf(visible);
  const extras = visible.flatMap((item) => {
    if (!item.revealed) return [];
    const bits: { id: string; src: string; side: "left" | "right"; kind: string }[] = [];
    if (item.beat.imageDataUrl) {
      bits.push({
        id: `${item.beat.id}-img`,
        src: item.beat.imageDataUrl,
        side: sideOf("image", item.beat),
        kind: "photo",
      });
    }
    if (item.beat.handwritingDataUrl) {
      bits.push({
        id: `${item.beat.id}-hand`,
        src: item.beat.handwritingDataUrl,
        side: sideOf("hand", item.beat),
        kind: "hand",
      });
    }
    return bits;
  });

  function continueLetter() {
    audioRef.current?.pause();
    if (index >= letter.beats.length - 1) setDone(true);
    else setIndex(index + 1);
  }

  return (
    <div className="stage reading">
      <div className="scene scene-enter">
        <aside className="rail">
          {extras
            .filter((x) => x.side === "left")
            .map((x) => (
              <img key={x.id} src={x.src} alt="" className={`side-card ${x.kind}`} />
            ))}
        </aside>
        <div className="paper-letter growing">
          <div className="letter-kicker">{kicker}</div>
          {groups.map((group, gi) => (
            <p key={gi} className="letter-p">
              {group.map((item, i) => (
                <span
                  key={item.beat.id}
                  className={!done && item.beat.id === beat?.id && item.beat.effect !== "typewriter" ? "ink-in" : ""}
                >
                  {i > 0 ? " " : null}
                  {item.text}
                  {!done && item.beat.id === beat?.id && item.beat.effect === "typewriter" && item.text !== item.beat.text ? (
                    <i className="caret" />
                  ) : null}
                </span>
              ))}
            </p>
          ))}
          {done && letter.from ? <p className="signoff">— {letter.from}</p> : null}
        </div>
        <aside className="rail">
          {extras
            .filter((x) => x.side === "right")
            .map((x) => (
              <img key={x.id} src={x.src} alt="" className={`side-card ${x.kind}`} />
            ))}
        </aside>
      </div>
      <div className="player-bar floating">
        <div className="toggle">
          <button className={mode === "auto" ? "on" : ""} onClick={() => setMode("auto")}>
            Auto
          </button>
          <button className={mode === "manual" ? "on" : ""} onClick={() => setMode("manual")}>
            Manual
          </button>
        </div>
        {done ? (
          <span style={{ color: "var(--ink-soft)", fontSize: 12 }}>Same page. Keep scrolling the letter.</span>
        ) : mode === "manual" ? (
          <button className="btn" onClick={continueLetter}>
            Next sentence
          </button>
        ) : (
          <span style={{ color: "var(--ink-soft)", fontSize: 12 }}>
            Writing on this page · {Math.round((beat?.durationMs || 0) / 1000)}s
          </span>
        )}
      </div>
    </div>
  );
}
