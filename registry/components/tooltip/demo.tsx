"use client";
import { useState } from "react";
import { Tooltip } from "./Tooltip";

const ICONS: Record<string, string> = {
  bold: "M7 5h6a3.5 3.5 0 0 1 0 7H7zM7 12h7a3.5 3.5 0 0 1 0 7H7z",
  link: "M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1",
  list: "M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01",
  undo: "M9 14 4 9l5-5M4 9h11a5 5 0 0 1 0 10h-3",
};

const TOOLS = [
  { key: "bold", label: "굵게", shortcut: "⌘B" },
  { key: "link", label: "링크 넣기", shortcut: "⌘K" },
  { key: "list", label: "글머리 목록" },
  { key: "undo", label: "되돌리기", shortcut: "⌘Z" },
];

export default function Demo() {
  const [active, setActive] = useState<string[]>(["bold"]);
  return (
    <div className="flex w-80 flex-col gap-3 rounded-card border border-line bg-bg p-3 pt-12">
      <div role="toolbar" aria-label="서식" className="flex gap-1 rounded-xl bg-fg/5 p-1">
        {TOOLS.map((t) => {
          const on = active.includes(t.key);
          return (
            <Tooltip key={t.key} content={t.shortcut ? `${t.label} ${t.shortcut}` : t.label}>
              <button
                type="button"
                aria-label={t.label}
                aria-pressed={t.key === "undo" ? undefined : on}
                onClick={() => t.key !== "undo" && setActive((l) => (on ? l.filter((k) => k !== t.key) : [...l, t.key]))}
                className={`flex h-10 w-10 items-center justify-center rounded-lg focus-visible:outline-2 focus-visible:outline-accent ${on ? "bg-fg/15 text-fg" : "text-muted hover:bg-fg/10 hover:text-fg"}`}
              >
                <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d={ICONS[t.key]} />
                </svg>
              </button>
            </Tooltip>
          );
        })}
      </div>
      <p className={`px-1 text-sm leading-relaxed text-fg/80 ${active.includes("bold") ? "font-bold" : ""}`}>회의록 초안을 공유합니다.</p>
    </div>
  );
}
