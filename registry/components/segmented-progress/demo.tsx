"use client";
import { useState } from "react";
import { SegmentedProgress } from "./SegmentedProgress";

export default function Demo() {
  const [done, setDone] = useState(false);
  return (
    <div className="flex aspect-[4/3] w-72 flex-col justify-between rounded-2xl bg-gradient-to-br from-accent/60 to-surface p-4">
      <SegmentedProgress segments={4} duration={1200} onComplete={() => setDone(true)} />
      <span className="text-sm text-fg/80">{done ? "완료" : "재생 중"}</span>
    </div>
  );
}
