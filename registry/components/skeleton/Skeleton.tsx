export interface SkeletonProps {
  /** rect: 상자, circle: 원, text: 글줄 */
  shape?: "rect" | "circle" | "text";
  /** text일 때 줄 수. 마지막 줄은 짧게 */
  lines?: number;
  className?: string;
}

const BASE = "animate-pulse bg-fg/10 motion-reduce:animate-none";

export function Skeleton({ shape = "rect", lines = 1, className = "" }: SkeletonProps) {
  if (shape === "text") {
    return (
      <span aria-hidden="true" className={`flex flex-col gap-2 ${className}`}>
        {Array.from({ length: lines }, (_, i) => (
          <span key={i} className={`${BASE} block h-3 rounded-full ${i === lines - 1 && lines > 1 ? "w-3/5" : "w-full"}`} />
        ))}
      </span>
    );
  }
  return <span aria-hidden="true" className={`${BASE} block ${shape === "circle" ? "rounded-full" : "rounded-xl"} ${className}`} />;
}
