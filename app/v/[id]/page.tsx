"use client";

import { Player } from "@/components/Player";
import { decodeLetter, loadLocal } from "@/lib/letter";
import { SAMPLE_LETTER } from "@/lib/sample";
import { Letter } from "@/lib/types";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ViewPage() {
  const { id } = useParams<{ id: string }>();
  const [letter, setLetter] = useState<Letter | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "");
    const fromHash = hash ? decodeLetter(hash) : null;
    if (fromHash) {
      setLetter(fromHash);
      return;
    }
    if (id === "demo") {
      setLetter(SAMPLE_LETTER);
      return;
    }
    fetch(`/api/letters/${id}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("missing");
        setLetter(await res.json());
      })
      .catch(() => {
        const local = loadLocal(id);
        if (local) setLetter(local);
        else setError("This letter is not here. Ask the creator for their share link.");
      });
  }, [id]);

  if (error) {
    return (
      <div className="stage">
        <p>{error}</p>
      </div>
    );
  }
  if (!letter) {
    return (
      <div className="stage">
        <p>Opening the envelope…</p>
      </div>
    );
  }
  return <Player letter={letter} />;
}
