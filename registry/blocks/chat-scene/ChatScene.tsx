"use client";
import { useEffect, useRef, useState } from "react";
import { ChatBubble } from "../../components/chat-bubble/ChatBubble";
import { ChatInput } from "../../components/chat-input/ChatInput";
import { CountdownRing } from "../../components/countdown-ring/CountdownRing";
import { CrossfadeImageStack } from "../../components/crossfade-image-stack/CrossfadeImageStack";

export interface SceneMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatSceneProps {
  /** 표정 키 → 배경 이미지 */
  images: Record<string, string>;
  initial: SceneMessage[];
  suggestions: string[];
  /** 라운드 길이(초) */
  seconds: number;
  /** 유저 메시지를 받아 상대 답과 표정 키를 돌려준다 */
  reply: (text: string) => Promise<{ content: string; expression: string }>;
}

export function ChatScene({ images, initial, suggestions, seconds, reply }: ChatSceneProps) {
  const [log, setLog] = useState(initial);
  const [expression, setExpression] = useState("default");
  const [left, setLeft] = useState(seconds);
  const [busy, setBusy] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const round = useRef(0);
  const over = left <= 0;

  useEffect(() => {
    if (over) return;
    const t = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [left, over]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [log]);

  const send = async (text: string) => {
    const mine = round.current;
    setLog((l) => [...l, { role: "user", content: text }, { role: "assistant", content: "" }]);
    setBusy(true);
    try {
      const r = await reply(text);
      if (mine !== round.current) return;
      setExpression(r.expression);
      setLog((l) => [...l.slice(0, -1), { role: "assistant", content: r.content }]);
    } catch {
      if (mine !== round.current) return;
      setLog((l) => [...l.slice(0, -1), { role: "system", content: "답을 받지 못했어요. 다시 보내 주세요" }]);
    } finally {
      if (mine === round.current) setBusy(false);
    }
  };

  const restart = () => {
    round.current += 1;
    setLog(initial);
    setExpression("default");
    setLeft(seconds);
    setBusy(false);
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      <div className="absolute inset-0">
        <CrossfadeImageStack images={images} activeKey={expression} fallbackKey="default" alt="상대 캐릭터" className="h-full w-full" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80" />
      <div className="absolute top-3 left-3">
        <CountdownRing progress={left / seconds} label={`${Math.floor(Math.max(left, 0) / 60)}:${String(Math.max(left, 0) % 60).padStart(2, "0")}`} />
      </div>
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-3">
        <div ref={listRef} className="flex max-h-48 flex-col gap-2 overflow-y-auto [scrollbar-width:none]">
          {log.map((m, i) => (
            <ChatBubble key={i} {...m} distanceFromLatest={log.length - 1 - i} />
          ))}
        </div>
        {over && (
          <button
            type="button"
            onClick={restart}
            className="h-10 self-center rounded-full bg-white/15 px-5 text-sm font-semibold text-white backdrop-blur transition-[transform,background-color] hover:bg-white/25 active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            다시 시작
          </button>
        )}
        <ChatInput
          onSend={send}
          disabled={busy || over}
          placeholder={over ? "시간 종료" : "메시지 입력"}
          suggestions={suggestions}
          wrap={{ marker: "*", placeholder: "행동", label: "행동 입력" }}
        />
      </div>
    </div>
  );
}
