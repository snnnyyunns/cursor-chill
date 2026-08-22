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

export function Player({ letter }: { letter: Letter }) {
  const [opened, setOpened] = useState(false);
  const [index, setIndex] = useState(0);
  const [mode, setMode] = useState<"auto" | "manual">("auto");
  const [typed, setTyped] = useState("");
  const [done, setDone] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);
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
    }));
  }, [letter.beats, index, typed, done]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [typed, index, done]);

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
      if (typeTimer) window.clearInterval(typeTimer);
      window.clearTimeout(ready);
      if (hold) window.clearTimeout(hold);
    };
  }, [opened, index, beat, mode, done, letter.beats.length]);

  if (!opened) return <Envelope onOpen={() => setOpened(true)} />;
  if (!beat && !done) return null;

  const groups = groupsOf(visible);

  return (
    <div className="stage reading">
      <div className="paper-letter growing">
        <div className="letter-kicker">{kicker}</div>
        {groups.map((group, gi) => (
          <p
            key={gi}
            className={`letter-p ${group[0]?.beat.effect === "fade" ? "fade" : group[0]?.beat.effect === "slide" ? "slide" : ""}`}
          >
            {group.map((item, i) => (
              <span key={item.beat.id}>
                {i > 0 ? " " : null}
                {item.text}
                {item.beat.imageDataUrl && item.text === item.beat.text ? (
                  <img className="beat-image" src={item.beat.imageDataUrl} alt="" />
                ) : null}
              </span>
            ))}
          </p>
        ))}
        {done && letter.from ? <p className="signoff">— {letter.from}</p> : null}
        <div ref={endRef} />
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
              <i key={b.id} className={i === index || (done && i === letter.beats.length - 1) ? "on" : ""} />
            ))}
          </div>
          {done ? (
            <span style={{ color: "var(--ink-soft)", fontSize: 12 }}>The letter stays. Sound does not.</span>
          ) : mode === "manual" ? (
            <button
              className="btn"
              onClick={() => {
                audioRef.current?.pause();
                if (index >= letter.beats.length - 1) setDone(true);
                else setIndex(index + 1);
              }}
            >
              Next
            </button>
          ) : (
            <span style={{ color: "var(--ink-soft)", fontSize: 12 }}>{Math.round((beat?.durationMs || 0) / 1000)}s</span>
          )}
        </div>
      </div>
    </div>
  );
}
