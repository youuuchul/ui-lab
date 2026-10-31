"use client";
import { useState } from "react";
import { CrossfadeImageStack } from "./CrossfadeImageStack";

const face = (bg: string, mouth: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 150"><rect width="120" height="150" fill="${bg}"/><circle cx="60" cy="70" r="38" fill="#f4e4d4"/><circle cx="46" cy="64" r="4" fill="#222"/><circle cx="74" cy="64" r="4" fill="#222"/><path d="${mouth}" stroke="#222" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`,
  )}`;

const IMAGES = {
  default: face("#3b4a6b", "M48 86 L72 86"),
  smile: face("#4b6b5a", "M46 82 Q60 96 74 82"),
  surprised: face("#6b4b5a", "M56 88 a4 6 0 1 0 8 0 a4 6 0 1 0 -8 0"),
};

export default function Demo() {
  const [key, setKey] = useState("default");
  return (
    <div className="flex flex-col items-center gap-4">
      <CrossfadeImageStack images={IMAGES} activeKey={key} fallbackKey="default" alt="캐릭터 표정" className="h-48 w-40 rounded-2xl" />
      <div className="flex gap-2">
        {Object.keys(IMAGES).map((k) => (
          <button key={k} onClick={() => setKey(k)} className={`rounded-full px-3 py-1 text-xs ${k === key ? "bg-fg/20" : "bg-fg/5 text-muted"}`}>
            {k}
          </button>
        ))}
      </div>
    </div>
  );
}
