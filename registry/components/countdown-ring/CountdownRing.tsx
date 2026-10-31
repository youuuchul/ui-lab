"use client";

export interface CountdownRingProps {
  /** 남은 비율 0~1 */
  progress: number;
  /** 가운데 표시 (예: "0:24") */
  label: string;
  /** 이 비율 미만이면 경고 색과 깜빡임 */
  urgentBelow?: number;
  size?: number;
  /** 스크린리더용 이름 */
  ariaLabel?: string;
}

export function CountdownRing({ progress, label, urgentBelow = 0.2, size = 48, ariaLabel = "남은 시간" }: CountdownRingProps) {
  const urgent = progress < urgentBelow;
  const r = 22;
  const c = 2 * Math.PI * r;
  const p = Math.min(Math.max(progress, 0), 1);

  return (
    <div role="timer" aria-label={ariaLabel} className="relative" style={{ width: size, height: size }}>
      <svg viewBox="0 0 52 52" aria-hidden="true" className="h-full w-full -scale-x-100 -rotate-90">
        <circle cx="26" cy="26" r={r} fill="rgb(0 0 0 / 0.45)" stroke="rgb(255 255 255 / 0.15)" strokeWidth="3" />
        <circle
          cx="26"
          cy="26"
          r={r}
          fill="none"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - p)}
          className={`transition-[stroke-dashoffset,stroke] duration-700 ease-linear motion-reduce:transition-none ${urgent ? "stroke-red-400" : "stroke-accent"}`}
        />
      </svg>
      <span
        className={`absolute inset-0 flex items-center justify-center font-mono text-[10px] font-semibold tabular-nums ${
          urgent ? "motion-safe:animate-pulse text-red-300" : "text-white/90"
        }`}
      >
        {label}
      </span>
    </div>
  );
}
