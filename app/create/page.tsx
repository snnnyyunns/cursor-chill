"use client";

import { Editor } from "@/components/Editor";
import { emptyLetter, loadLocal } from "@/lib/letter";
import { Letter } from "@/lib/types";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function CreateInner() {
  const params = useSearchParams();
  const [initial, setInitial] = useState<Letter | null>(null);
  useEffect(() => {
    const id = params.get("id");
    setInitial(id ? loadLocal(id) ?? emptyLetter() : emptyLetter());
  }, [params]);
  if (!initial) return <div className="wrap">Opening the desk…</div>;
  return <Editor initial={initial} />;
}

export default function CreatePage() {
  return (
    <Suspense>
      <CreateInner />
    </Suspense>
  );
}
