"use client";
import { useState } from "react";
import { ChatInput } from "./ChatInput";

export default function Demo() {
  const [sent, setSent] = useState<string[]>([]);
  return (
    <div className="flex h-64 w-80 flex-col justify-end gap-3 rounded-2xl bg-gradient-to-b from-[#2b2f45] to-[#151722] p-4">
      <ul className="flex flex-col items-end gap-1 overflow-hidden text-sm text-white/80">
        {sent.slice(-3).map((s, i) => (
          <li key={i} className="rounded-xl bg-accent/80 px-3 py-1.5">{s}</li>
        ))}
      </ul>
      <ChatInput
        onSend={(t) => setSent((l) => [...l, t])}
        suggestions={["오늘 어땠어?", "산책 갈래?", "좋아하는 노래 알려줘"]}
        hintDelayMs={3000}
        wrap={{ marker: "*", placeholder: "행동", label: "행동 입력" }}
      />
    </div>
  );
}
