"use client";
import { useEffect, useRef, useState } from "react";

export interface ToastProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message: string;
  /** 오른쪽 버튼 (예: 실행 취소) */
  action?: { label: string; onClick: () => void };
  /** 자동으로 닫히는 시간(ms). 0이면 닫지 않음 */
  duration?: number;
  tone?: "default" | "error";
  /** viewport: 화면 하단 고정, parent: 가장 가까운 relative 부모 하단 */
  scope?: "viewport" | "parent";
}

const EXIT_MS = 150;

export function Toast({ open, onOpenChange, message, action, duration = 3000, tone = "default", scope = "viewport" }: ToastProps) {
  const [mounted, setMounted] = useState(open);
  const [shown, setShown] = useState(false);
  const [paused, setPaused] = useState(false);
  const onOpenChangeRef = useRef(onOpenChange);
  useEffect(() => {
    onOpenChangeRef.current = onOpenChange;
  });

  useEffect(() => {
    setPaused(false);
    if (open) {
      setMounted(true);
      const raf = requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)));
      return () => cancelAnimationFrame(raf);
    }
    setShown(false);
    const t = setTimeout(() => setMounted(false), EXIT_MS);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open || paused || duration <= 0) return;
    const t = setTimeout(() => onOpenChangeRef.current(false), duration);
    return () => clearTimeout(t);
  }, [open, paused, duration, message]);

  if (!mounted) return null;

  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      aria-live={tone === "error" ? "assertive" : "polite"}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className={`${scope === "viewport" ? "fixed bottom-6" : "absolute bottom-4"} left-1/2 z-50 flex w-[min(24rem,calc(100%-2rem))] -translate-x-1/2 items-center gap-3 rounded-2xl border border-line px-4 py-3 shadow-lg shadow-black/40 transition-[opacity,translate] motion-reduce:transition-none ${
        shown ? "translate-y-0 opacity-100 duration-200" : "translate-y-3 opacity-0 duration-150"
      } ${tone === "error" ? "bg-red-500/95 text-white" : "bg-fg text-bg"}`}
    >
      <p className="min-w-0 flex-1 text-sm font-medium">{message}</p>
      {action && (
        <button
          type="button"
          onClick={() => {
            action.onClick();
            onOpenChangeRef.current(false);
          }}
          className={`-my-2 -mr-2 inline-flex min-h-10 min-w-10 shrink-0 items-center justify-center rounded-lg px-3 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-current ${
            tone === "error" ? "text-white underline" : "text-accent hover:bg-bg/10"
          }`}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
