"use client";
import { ChatScene } from "./ChatScene";

const A = "/ui-lab/assets/heart-table";
const IMAGES = {
  default: `${A}/sera-default.webp`,
  smile: `${A}/sera-smile.webp`,
  shy: `${A}/sera-shy.webp`,
  surprised: `${A}/sera-surprised.webp`,
};

const REPLIES = [
  { content: "*눈을 동그랗게 뜬다* 정말?", expression: "surprised" },
  { content: "그거 좋다. *웃으며 고개를 끄덕인다*", expression: "smile" },
  { content: "*살짝 시선을 피한다* 그런 말은 처음 들어봐.", expression: "shy" },
];
let n = 0;

export default function Demo() {
  return (
    <div className="h-[30rem] w-[17rem] overflow-hidden rounded-[1.75rem] border border-line">
      <ChatScene
        images={IMAGES}
        initial={[{ role: "assistant", content: "*자리에 앉으며 손을 흔든다* 왔구나. 여기 분위기 괜찮지?" }]}
        suggestions={["응, 조명이 예쁘다", "오래 기다렸어?", "*맞은편에 앉는다*"]}
        seconds={90}
        reply={() => new Promise((r) => setTimeout(() => r(REPLIES[n++ % REPLIES.length]), 900))}
      />
    </div>
  );
}
