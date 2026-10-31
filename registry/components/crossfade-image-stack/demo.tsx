"use client";
import { useState } from "react";
import { CrossfadeImageStack } from "./CrossfadeImageStack";

const A = "/ui-lab/assets/heart-table";
const LABELS: Record<string, string> = { default: "기본", smile: "웃음", shy: "수줍음", surprised: "놀람" };
const IMAGES = Object.fromEntries(Object.keys(LABELS).map((k) => [k, `${A}/sera-${k}.webp`]));

export default function Demo() {
  const [key, setKey] = useState("default");
  return (
    <div className="flex items-center gap-5">
      <CrossfadeImageStack images={IMAGES} activeKey={key} fallbackKey="default" alt="캐릭터 표정" className="aspect-[9/16] w-40 rounded-2xl bg-surface" />
      <div className="flex flex-col gap-1.5" role="radiogroup" aria-label="표정">
        {Object.entries(LABELS).map(([k, label]) => (
          <button
            key={k}
            role="radio"
            aria-checked={k === key}
            onClick={() => setKey(k)}
            className={`rounded-full px-4 py-1.5 text-left text-sm transition-colors ${k === key ? "bg-fg text-bg" : "bg-fg/5 text-muted hover:text-fg"}`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
