"use client";
import { useEffect, useId, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";

export interface TrendSeries {
  label: string;
  /** labels와 같은 길이. null이면 선을 끊는다 */
  values: (number | null)[];
  /** 전기(비교 기간) 같은 참고선 */
  dashed?: boolean;
}

export interface TrendChartProps {
  /** 차트 이름. 스크린리더 요약과 대체 표의 제목 */
  title: string;
  /** x축 구간 이름 (예: "8/24", "9/1~9/7") */
  labels: string[];
  series: TrendSeries[];
  /** 값 표시 (축·툴팁·표) */
  format?: (v: number) => string;
  /** 스크린리더용 요약. 없으면 첫 선의 처음·끝 값으로 만든다 */
  summary?: string;
  height?: number;
}

const SOLID = ["var(--color-accent)", "#fbbf24", "#34d399"];
const MARK = ["circle", "square", "diamond"] as const;
const PAD = { l: 44, r: 10, t: 10, b: 24 };

function niceMax(max: number) {
  if (max <= 0) return 1;
  const raw = max / 4;
  const p = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].find((m) => m * p >= raw)! * p;
  return step * 4;
}

function Marker({ kind, x, y, color }: { kind: (typeof MARK)[number]; x: number; y: number; color: string }) {
  if (kind === "square") return <rect x={x - 3.5} y={y - 3.5} width={7} height={7} fill={color} />;
  if (kind === "diamond") return <path d={`M${x},${y - 4.5}L${x + 4.5},${y}L${x},${y + 4.5}L${x - 4.5},${y}Z`} fill={color} />;
  return <circle cx={x} cy={y} r={3.5} fill={color} />;
}

function Swatch({ i, dashed }: { i: number; dashed?: boolean }) {
  const color = dashed ? "rgb(242 242 242 / 0.45)" : SOLID[i % SOLID.length];
  return (
    <svg width="22" height="10" aria-hidden="true" className="shrink-0">
      <line x1="1" y1="5" x2="21" y2="5" stroke={color} strokeWidth="2" strokeDasharray={dashed ? "3 3" : undefined} />
      {!dashed && <Marker kind={MARK[i % MARK.length]} x={11} y={5} color={color} />}
    </svg>
  );
}

export function TrendChart({ title, labels, series, format = (v) => v.toLocaleString("ko-KR"), summary, height = 220 }: TrendChartProps) {
  const box = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(640);
  const [active, setActive] = useState<number | null>(null);
  const captionId = useId();

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(Math.max(240, Math.floor(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => setActive(null), [labels]);

  const n = labels.length;
  const all = series.flatMap((s) => s.values).filter((v): v is number => v !== null);
  const yMax = niceMax(Math.max(0, ...all));
  const iw = width - PAD.l - PAD.r;
  const ih = height - PAD.t - PAD.b;
  const x = (i: number) => PAD.l + (n > 1 ? (i * iw) / (n - 1) : iw / 2);
  const y = (v: number) => PAD.t + ih - (v / yMax) * ih;
  const marks = n <= 31;
  const every = Math.max(1, Math.ceil(n / Math.max(2, Math.floor(iw / 72))));

  let solidIndex = -1;
  const styled = series.map((s) => {
    if (!s.dashed) solidIndex += 1;
    const si = s.dashed ? -1 : solidIndex;
    const last = s.values.reduce<number>((acc, v, i) => (v === null ? acc : i), -1);
    return { ...s, si, last, color: s.dashed ? "rgb(242 242 242 / 0.45)" : SOLID[si % SOLID.length] };
  });

  const path = (vals: (number | null)[]) =>
    vals.reduce((d, v, i) => (v === null ? d : d + `${i === 0 || vals[i - 1] === null ? "M" : "L"}${x(i)},${y(v)}`), "");

  const first = series[0];
  const firstVal = first?.values.find((v) => v !== null);
  const lastVal = first ? [...first.values].reverse().find((v) => v !== null) : undefined;
  const autoSummary =
    first && firstVal != null && lastVal != null
      ? `${title}. ${first.label} ${labels[0]} ${format(firstVal)}에서 ${labels[n - 1]} ${format(lastVal)}.`
      : `${title}. 값 없음.`;

  const onPointer = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - r.left;
    setActive(Math.min(n - 1, Math.max(0, Math.round(((px - PAD.l) / iw) * (n - 1)))));
  };

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const map: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1 };
    if (e.key in map) setActive((a) => Math.min(n - 1, Math.max(0, (a ?? (map[e.key] > 0 ? -1 : n)) + map[e.key])));
    else if (e.key === "Home") setActive(0);
    else if (e.key === "End") setActive(n - 1);
    else if (e.key === "Escape") setActive(null);
    else return;
    e.preventDefault();
  };

  const tipLeft = active === null ? 0 : x(active) > width / 2 ? x(active) - 12 : x(active) + 12;

  return (
    <figure className="min-w-0">
      <ul className="mb-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-fg/80">
        {styled.map((s) => (
          <li key={s.label} className="flex items-center gap-1.5">
            <Swatch i={Math.max(0, s.si)} dashed={s.dashed} />
            {s.label}
          </li>
        ))}
      </ul>
      <div
        ref={box}
        role="img"
        tabIndex={0}
        aria-label={`${summary ?? autoSummary} 좌우 화살표로 구간별 값을 읽는다.`}
        onPointerMove={onPointer}
        onPointerLeave={() => setActive(null)}
        onKeyDown={onKey}
        onBlur={() => setActive(null)}
        className="relative touch-pan-y overflow-hidden rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-accent"
        style={{ height }}
      >
        <svg width={width} height={height} aria-hidden="true" className="block">
          {[0, 1, 2, 3, 4].map((k) => {
            const v = (yMax / 4) * k;
            return (
              <g key={k}>
                <line x1={PAD.l} x2={width - PAD.r} y1={y(v)} y2={y(v)} stroke="var(--color-line)" />
                <text x={PAD.l - 6} y={y(v)} dy="0.32em" textAnchor="end" className="fill-muted text-[10px] tabular-nums">
                  {format(v)}
                </text>
              </g>
            );
          })}
          {labels.map((l, i) =>
            i === n - 1 || (i % every === 0 && n - 1 - i >= every / 2) ? (
              <text key={i} x={x(i)} y={height - 6} textAnchor={i === 0 ? "start" : i === n - 1 ? "end" : "middle"} className="fill-muted text-[10px] tabular-nums">
                {l.split("~")[0]}
              </text>
            ) : null,
          )}
          {active !== null && <line x1={x(active)} x2={x(active)} y1={PAD.t} y2={PAD.t + ih} stroke="rgb(242 242 242 / 0.3)" />}
          {styled.map((s) => (
            <g key={s.label}>
              <path d={path(s.values)} fill="none" stroke={s.color} strokeWidth={s.dashed ? 1.5 : 2} strokeDasharray={s.dashed ? "4 4" : undefined} strokeLinejoin="round" />
              {!s.dashed &&
                s.values.map((v, i) =>
                  v !== null && (marks || i === active || i === s.last) ? (
                    <Marker key={i} kind={MARK[s.si % MARK.length]} x={x(i)} y={y(v)} color={s.color} />
                  ) : null,
                )}
            </g>
          ))}
        </svg>
        {active !== null && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-2 z-10 min-w-36 rounded-xl border border-line bg-bg/95 px-3 py-2 text-xs shadow-lg"
            style={{ left: tipLeft, transform: x(active) > width / 2 ? "translateX(-100%)" : undefined }}
          >
            <div className="mb-1 font-medium text-fg tabular-nums">{labels[active]}</div>
            {styled.map((s) => (
              <div key={s.label} className="flex items-center justify-between gap-4 tabular-nums">
                <span className="flex items-center gap-1.5 text-fg/70">
                  <Swatch i={Math.max(0, s.si)} dashed={s.dashed} />
                  {s.label}
                </span>
                <span className="text-fg">{s.values[active] === null ? "—" : format(s.values[active]!)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <p aria-live="polite" className="sr-only">
        {active !== null && `${labels[active]}: ${styled.map((s) => `${s.label} ${s.values[active] === null ? "값 없음" : format(s.values[active]!)}`).join(", ")}`}
      </p>
      <table className="sr-only" aria-labelledby={captionId}>
        <caption id={captionId}>{title}</caption>
        <thead>
          <tr>
            <th scope="col">구간</th>
            {series.map((s) => (
              <th key={s.label} scope="col">
                {s.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {labels.map((l, i) => (
            <tr key={l + i}>
              <th scope="row">{l}</th>
              {series.map((s) => (
                <td key={s.label}>{s.values[i] === null ? "—" : format(s.values[i]!)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
