"use client";
import { useState } from "react";
import { parseNarration } from "./narration";

export interface ChatBubbleProps {
  role: "user" | "assistant" | "system";
  content: string;
  /** 최신 메시지로부터의 거리 (0 = 가장 최근) */
  distanceFromLatest?: number;
  /** 과거 대화를 읽는 중이면 흐림을 끈다 */
  forceReadable?: boolean;
}

/** 최신 왕복(거리 0·1)은 그대로, 그 위로 밀린 메시지는 점점 흐리게 */
function fade(distance: number) {
  if (distance <= 1) return 1;
  return [0.42, 0.22, 0.12][distance - 2] ?? 0.06;
}

export function ChatBubble({ role, content, distanceFromLatest = 0, forceReadable = false }: ChatBubbleProps) {
  const [pressed, setPressed] = useState(false);
  const [focused, setFocused] = useState(false);
  const opacity = pressed || focused || forceReadable ? 1 : fade(distanceFromLatest);
  const recent = distanceFromLatest <= 1;
  const press = {
    onPointerDown: () => setPressed(true),
    onPointerUp: () => setPressed(false),
    onPointerLeave: () => setPressed(false),
    onPointerCancel: () => setPressed(false),
    tabIndex: 0,
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
  };

  if (role === "system") {
    return (
      <div role="status" className="flex justify-center py-2">
        <span className="rounded-full bg-yellow-500/20 px-4 py-1.5 text-xs text-yellow-200 transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent duration-200" style={{ opacity }} {...press}>
          {content}
        </span>
      </div>
    );
  }

  const isUser = role === "user";
  const segments = parseNarration(content, !isUser);

  if (!isUser) {
    return (
      <div className="flex justify-start transition-opacity duration-200" style={{ opacity }}>
        <div {...press} className="max-w-[82%] cursor-pointer space-y-1.5 select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
          {segments.length === 0 ? (
            <div className="rounded-2xl rounded-bl-sm bg-black/65 px-4 py-2.5 text-sm motion-safe:animate-pulse">...</div>
          ) : (
            segments.map((s, i) =>
              s.type === "narration" ? (
                <p key={i} className="px-1 text-[15px] leading-relaxed whitespace-pre-wrap break-words text-white/85 italic [text-shadow:0_1px_3px_rgb(0_0_0/0.95),0_0_12px_rgb(0_0_0/0.75)]">
                  {s.text}
                </p>
              ) : (
                <div
                  key={i}
                  className={`rounded-2xl rounded-bl-sm border px-4 py-2.5 text-[15px] leading-relaxed whitespace-pre-wrap break-words text-white shadow-lg shadow-black/45 ${
                    recent ? "border-white/15 bg-zinc-950/80 backdrop-blur-md" : "border-white/10 bg-zinc-950/40 backdrop-blur-sm"
                  }`}
                >
                  {s.text}
                </div>
              ),
            )
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-end transition-opacity duration-200" style={{ opacity }}>
      <div
        {...press}
        className={`max-w-[75%] cursor-pointer rounded-2xl rounded-br-sm px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words text-white shadow-lg shadow-black/40 backdrop-blur-md select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
          recent ? "bg-accent/95" : "bg-accent/70"
        }`}
      >
        <span className="flex flex-col gap-1">
          {segments.map((s, i) => (
            <span key={i} className={s.type === "narration" ? "text-xs leading-snug text-white/60 italic" : undefined}>
              {s.text}
            </span>
          ))}
        </span>
      </div>
    </div>
  );
}
