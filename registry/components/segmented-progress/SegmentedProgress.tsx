"use client";
import { useEffect, useRef, useState } from "react";

export interface SegmentedProgressProps {
  segments: number;
  duration?: number;
  onComplete?: () => void;
  className?: string;
  /** 진행 막대의 접근성 이름 */
  ariaLabel?: string;
}

export function SegmentedProgress({
  segments,
  duration = 2000,
  onComplete,
  className = "",
  ariaLabel = "진행률",
}: SegmentedProgressProps) {
  const [active, setActive] = useState(0);
  const fills = useRef<(HTMLDivElement | null)[]>([]);
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  });

  useEffect(() => {
    if (active >= segments) {
      onCompleteRef.current?.();
      return;
    }
    const el = fills.current[active];
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.style.transform = "scaleX(1)";
      const t = setTimeout(() => setActive((a) => a + 1), duration);
      return () => clearTimeout(t);
    }
    const anim = el.animate(
      [{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }],
      { duration, easing: "linear", fill: "forwards" },
    );
    anim.onfinish = () => setActive((a) => a + 1);
    return () => anim.cancel();
  }, [active, segments, duration]);

  return (
    <div
      className={`flex gap-1.5 ${className}`}
      role="progressbar"
      aria-label={ariaLabel}
      aria-valuemin={0}
      aria-valuemax={segments}
      aria-valuenow={Math.min(active, segments)}
    >
      {Array.from({ length: segments }, (_, i) => (
        <div key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-fg/25">
          <div
            ref={(el) => {
              fills.current[i] = el;
            }}
            className="h-full origin-left rounded-full bg-fg"
            style={{ transform: i < active ? "scaleX(1)" : "scaleX(0)" }}
          />
        </div>
      ))}
    </div>
  );
}
