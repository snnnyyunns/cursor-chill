"use client";

import { useEffect, useRef } from "react";

export function Envelope({ onOpen }: { onOpen: () => void }) {
  const opened = useRef(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        open();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function open() {
    if (opened.current) return;
    opened.current = true;
    const el = document.getElementById("envelope");
    el?.classList.add("open");
    window.setTimeout(onOpen, 1100);
  }

  return (
    <div className="stage">
      <div>
        <div id="envelope" className="envelope" onClick={open} role="button" tabIndex={0}>
          <div className="flap" />
          <div className="pocket" />
          <div className="heart">
            <div className="heart-shape" />
          </div>
        </div>
        <p className="hint">Click the heart</p>
      </div>
    </div>
  );
}
