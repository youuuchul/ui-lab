"use client";
import { useState } from "react";
import { PortraitChoice } from "./PortraitChoice";

const A = "/ui-lab/assets/murder-mystery";
const OPTIONS = [
  { id: "a", name: "윤서준", image: `${A}/char-detective.webp` },
  { id: "b", name: "백도현", image: `${A}/char-gambler.webp` },
  { id: "c", name: "한지호", image: `${A}/char-storyteller.webp` },
];

export default function Demo() {
  const [v, setV] = useState("");
  return (
    <div className="w-72" style={{ ["--color-accent" as string]: "#e0525c" }}>
      <PortraitChoice label="범인이라 생각하는 사람은?" options={OPTIONS} value={v} onChange={setV} />
    </div>
  );
}
