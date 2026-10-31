"use client";
import { useState } from "react";
import { ServiceCarousel } from "./ServiceCarousel";

const ITEMS = [
  { id: "a", name: "기록 앱", tone: "#6b8cff" },
  { id: "b", name: "예약 서비스", tone: "#c58b5f" },
  { id: "c", name: "학습 도구", tone: "#5fae9a" },
  { id: "d", name: "커뮤니티", tone: "#9a7cc4" },
  { id: "e", name: "리포트", tone: "#c4697c" },
];

export default function Demo() {
  const [i, setI] = useState(0);
  const [opened, setOpened] = useState<string | null>(null);
  return (
    <div className="flex w-[min(34rem,100%)] flex-col items-center gap-3">
      <ServiceCarousel
        className="h-60 w-full"
        items={ITEMS}
        getKey={(x) => x.id}
        ratio={1.6}
        maxItemWidth={120}
        pointerLabel="열기"
        onChange={setI}
        onOpen={(x) => setOpened(x.name)}
        renderItem={(x, active) => (
          <div
            className="flex h-full w-full items-end rounded-2xl p-3 shadow-[0_24px_40px_-20px_#0009] transition-[filter] duration-300"
            style={{ background: `linear-gradient(160deg, ${x.tone}, #151515)`, filter: active ? "none" : "brightness(0.7)" }}
          >
            <span className="text-sm font-bold text-white">{x.name}</span>
          </div>
        )}
      />
      <p className="text-sm text-muted">
        {String(i + 1).padStart(2, "0")} {ITEMS[i].name}
        {opened && <span className="text-fg"> · 열림: {opened}</span>}
      </p>
    </div>
  );
}
