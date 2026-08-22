"use client";

import { Envelope } from "@/components/Envelope";
import { Letter } from "@/lib/types";
import { useEffect, useMemo, useRef, useState } from "react";

export function Player({ letter }: { letter: Letter }) {
  const [opened, setOpened] = useState(false);
  const [index, setIndex] = useState(0);
  const [mode, setMode] = useState<"auto" | "manual">("auto");
  const [typed, setTyped] = useState("");
  const [done, setDone] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const beat = letter.beats[index];
  const finished = opened && (done || letter.beats.length === 0);

  const kicker = useMemo(() => {
    if (letter.to) return `For ${letter.to}`;
    return letter.title || "A letter";
  }, [letter]);

  useEffect(() => {
    if (!opened || !beat || done) return;
    setTyped(beat.effect === "typewriter" ? "" : beat.text);
    let cancelled = false;
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    if (beat.audioDataUrl) {
      const a = new Audio(beat.audioDataUrl);
      audioRef.current = a;
      a.play().catch(() => {});
    }

    const chars = [...beat.text];
    const typeMs = beat.effect === "typewriter" ? Math.min(2200, beat.durationMs * 0.55) : 0;
    const step = chars.length ? typeMs / chars.length : 0;
    let i = 0;
    let typeTimer: number | undefined;
    if (beat.effect === "typewriter") {
      typeTimer = window.setInterval(() => {
        i += 1;
        if (!cancelled) setTyped(chars.slice(0, i).join(""));
        if (i >= chars.length && typeTimer) window.clearInterval(typeTimer);
      }, Math.max(18, step));
    }

    const advance = () => {
      if (cancelled) return;
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
      if (typeTimer) window.clearInterval(typeTimer);
      window.clearTimeout(ready);
      if (hold) window.clearTimeout(hold);
      audioRef.current?.pause();
    };
  }, [opened, index, beat, mode, done, letter.beats.length]);

  if (!opened) return <Envelope onOpen={() => setOpened(true)} />;

  if (finished) {
    return (
      <div className="stage">
        <div className="paper-letter recap">
          <div className="letter-kicker">{kicker}</div>
          <h2>Keep this</h2>
          <p style={{ color: "var(--ink-soft)", marginTop: -8 }}>Words and pictures. The sound stays in the letter.</p>
          {letter.beats.map((b) => (
            <div className="recap-item" key={b.id}>
              {b.imageDataUrl ? <img src={b.imageDataUrl} alt="" /> : <div />}
              <p>{b.text}</p>
            </div>
          ))}
          {letter.from ? <p style={{ marginTop: 12 }}>— {letter.from}</p> : null}
        </div>
      </div>
    );
  }

  if (!beat) return null;

  return (
    <div className="stage">
      <div className="paper-letter">
        <div className="letter-kicker">{kicker}</div>
        <div className={`beat-text ${beat.effect === "fade" ? "fade" : beat.effect === "slide" ? "slide" : ""}`}>
          {typed}
        </div>
        {beat.imageDataUrl ? <img className="beat-image" src={beat.imageDataUrl} alt="" /> : null}
        <div className="player-bar">
          <div className="toggle">
            <button className={mode === "auto" ? "on" : ""} onClick={() => setMode("auto")}>
              Auto
            </button>
            <button className={mode === "manual" ? "on" : ""} onClick={() => setMode("manual")}>
              Manual
            </button>
          </div>
          <div className="dots">
            {letter.beats.map((b, i) => (
              <i key={b.id} className={i === index ? "on" : ""} />
            ))}
          </div>
          {mode === "manual" ? (
            <button className="btn" onClick={() => (index >= letter.beats.length - 1 ? setDone(true) : setIndex(index + 1))}>
              Next
            </button>
          ) : (
            <span style={{ color: "var(--ink-soft)", fontSize: 12 }}>{Math.round(beat.durationMs / 1000)}s</span>
          )}
        </div>
      </div>
    </div>
  );
}
