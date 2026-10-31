export interface KpiDelta {
  /** 직전 기간 대비 변화. null이면 계산 불가(`—`) */
  value: number | null;
  /** 건수·금액은 "%", 비율은 "%p" */
  unit: "%" | "%p";
  /** 좋아지는 방향. 색만 바꾸고 화살표는 실제 방향을 따른다 */
  good?: "up" | "down";
}

export interface KpiItem {
  label: string;
  /** 표시용으로 만든 값 (예: "6,314", "4,530만", "9.73%") */
  value: string;
  unit?: string;
  delta?: KpiDelta;
  /** 분모·기준일 등 값 해석에 필요한 한 줄 */
  sub?: string;
}

export interface KpiScoreboardProps {
  items: KpiItem[];
  /** 위 소제목 (예: "핵심 지표 · 직전 28일 대비") */
  caption?: string;
  /** 칸 배치(grid 열). 스코어보드 자신의 폭 기준 컨테이너 쿼리(@xl: 등)를 쓴다. 기본은 좁으면 2열, 48rem 이상이면 한 줄 */
  className?: string;
}

function Delta({ delta }: { delta: KpiDelta }) {
  const { value, unit, good = "up" } = delta;
  if (value === null) return <span className="text-muted">—</span>;
  const abs = Math.abs(value).toFixed(1);
  if (Number(abs) === 0) return <span className="text-muted">{`0.0${unit}`}</span>;
  const up = value > 0;
  const better = up === (good === "up");
  return (
    <span className={better ? "text-emerald-300" : "text-red-400"}>
      <span aria-hidden="true">{up ? "▲" : "▼"} </span>
      <span className="sr-only">{up ? "증가" : "감소"} </span>
      {abs}
      {unit}
    </span>
  );
}

export function KpiScoreboard({ items, caption, className = "grid-cols-2 @3xl:grid-flow-col @3xl:auto-cols-fr @3xl:grid-cols-none" }: KpiScoreboardProps) {
  return (
    <section aria-label={caption ?? "지표"} className="@container">
      {caption && <p className="mb-2 text-xs text-muted">{caption}</p>}
      <dl className={`grid gap-px overflow-hidden rounded-2xl border border-line bg-line ${className}`}>
        {items.map((it) => (
          <div key={it.label} className="flex min-w-0 flex-col gap-1 bg-surface px-4 py-3.5">
            <dt className="truncate text-xs text-muted">{it.label}</dt>
            <dd className="flex items-baseline gap-1 text-fg">
              <span className="text-xl font-semibold tracking-tight tabular-nums sm:text-2xl">{it.value}</span>
              {it.unit && <span className="text-sm text-fg/70">{it.unit}</span>}
            </dd>
            <dd className="min-h-4 text-xs leading-4 whitespace-nowrap tabular-nums">{it.delta && <Delta delta={it.delta} />}</dd>
            {it.sub && <dd className="text-xs text-muted tabular-nums">{it.sub}</dd>}
          </div>
        ))}
      </dl>
    </section>
  );
}
