"use client";
import { ChatBubble, type ChatBubbleProps } from "./ChatBubble";

const LOG: Pick<ChatBubbleProps, "role" | "content">[] = [
  { role: "system", content: "대화를 시작했어요" },
  { role: "assistant", content: "*창밖을 보다가 고개를 돌린다* 왔어?" },
  { role: "user", content: "응, 조금 늦었지" },
  { role: "assistant", content: "괜찮아. *컵을 밀어준다* 따뜻할 때 마셔." },
  { role: "user", content: "고마워 *한 모금 마신다*" },
  { role: "assistant", content: "오늘은 무슨 얘기부터 할까?" },
];

export default function Demo() {
  return (
    <div className="flex h-72 w-80 flex-col justify-end gap-2 overflow-hidden rounded-2xl bg-gradient-to-b from-[#2b2f45] to-[#151722] p-4">
      {LOG.map((m, i) => (
        <ChatBubble key={i} {...m} distanceFromLatest={LOG.length - 1 - i} />
      ))}
    </div>
  );
}
