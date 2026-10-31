"use client";
import { useEffect, useRef } from "react";

export interface LoadingOverlayProps {
  active: boolean;
  message: string;
  /** 이 시간(ms)이 지나도 active면 onTimeout 호출 */
  timeoutMs?: number;
  onTimeout?: () => void;
  /** viewport: 화면 전체, parent: 가장 가까운 relative 부모 */
  scope?: "viewport" | "parent";
}

export function LoadingOverlay({ active, message, timeoutMs = 60000, onTimeout, scope = "viewport" }: LoadingOverlayProps) {
  const onTimeoutRef = useRef(onTimeout);
  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  });

  useEffect(() => {
    if (!active) return;
    const t = setTimeout(() => onTimeoutRef.current?.(), timeoutMs);
    return () => clearTimeout(t);
  }, [active, timeoutMs]);

  if (!active) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`${scope === "viewport" ? "fixed" : "absolute"} inset-0 z-50 flex items-center justify-center bg-bg/90 px-6 backdrop-blur-sm`}
    >
      <div className="flex w-full max-w-sm items-center gap-3 rounded-2xl border border-white/10 bg-surface p-6">
        <div className="h-10 w-10 shrink-0 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        <p className="text-sm font-semibold text-fg">{message}</p>
      </div>
    </div>
  );
}
