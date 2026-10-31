"use client";
import { useEffect, useRef } from "react";

export interface LoadingOverlayProps {
  active: boolean;
  message: string;
  /** 이 시간(ms)이 지나도 active면 onTimeout 호출 */
  timeoutMs?: number;
  onTimeout?: () => void;
  /** 있으면 취소 버튼을 보인다 */
  onCancel?: () => void;
  /** viewport: 화면 전체, parent: 가장 가까운 relative 부모 */
  scope?: "viewport" | "parent";
}

export function LoadingOverlay({ active, message, timeoutMs = 60000, onTimeout, onCancel, scope = "viewport" }: LoadingOverlayProps) {
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
        <div className="h-10 w-10 shrink-0 motion-safe:animate-spin rounded-full border-2 border-accent border-t-transparent" />
        <p className="min-w-0 flex-1 text-sm font-semibold text-fg">{message}</p>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="min-h-10 shrink-0 rounded-lg bg-fg/10 px-4 text-sm font-medium text-fg transition-[background-color,transform] hover:bg-fg/15 active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-reduce:transition-none"
          >
            취소
          </button>
        )}
      </div>
    </div>
  );
}
