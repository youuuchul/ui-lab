"use client";
import { ChatScene } from "./ChatScene";

const face = (bg: string, mouth: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 160"><rect width="120" height="160" fill="${bg}"/><circle cx="60" cy="58" r="34" fill="#f4e4d4"/><circle cx="48" cy="54" r="3.5" fill="#222"/><circle cx="72" cy="54" r="3.5" fill="#222"/><path d="${mouth}" stroke="#222" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`,
  )}`;

const IMAGES = {
  default: face("#3b4a6b", "M50 72 L70 72"),
  smile: face("#4b6b5a", "M48 68 Q60 80 72 68"),
  surprised: face("#6b4b5a", "M56 72 a4 6 0 1 0 8 0 a4 6 0 1 0 -8 0"),
};

const REPLIES = [
  { content: "*눈을 동그랗게 뜬다* 정말?", expression: "surprised" },
  { content: "그거 좋다. *웃으며 고개를 끄덕인다*", expression: "smile" },
  { content: "음, 조금 더 얘기해줄래?", expression: "default" },
];
let n = 0;

export default function Demo() {
  return (
    <div className="h-80 w-64 overflow-hidden rounded-2xl">
      <ChatScene
        images={IMAGES}
        initial={[{ role: "assistant", content: "*자리에 앉으며* 왔구나." }]}
        suggestions={["오늘 어땠어?", "산책 갈래?"]}
        seconds={90}
        reply={() => new Promise((r) => setTimeout(() => r(REPLIES[n++ % REPLIES.length]), 900))}
      />
    </div>
  );
}
