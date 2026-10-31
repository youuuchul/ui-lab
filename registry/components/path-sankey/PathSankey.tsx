"use client";
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";

export interface PathLink {
  /** 1 = 첫 화면 → 두 번째 화면 */
  step: number;
  from: string;
  to: string;
  value: number;
}

export interface PathGroup {
  label: string;
  color: string;
  /** 이 묶음에 속한 화면 이름 */
  members: string[];
}

export interface PathSankeyProps {
  /** 차트 이름. 스크린리더 요약과 대체 표의 제목 */
  title: string;
  /** 열 이름 (예: ["랜딩", "2번째 화면", ...]) */
  columns: string[];
  links: PathLink[];
  /** 색 묶음과 범례 */
  groups: PathGroup[];
  /** 세션이 끝난 노드. 열 맨 아래에 회색으로 둔다 */
  exitLabel?: string;
  /** 묶인 나머지 노드. 이탈 바로 위에 둔다 */
  otherLabel?: string;
  height?: number;
  /** 이보다 좁으면 가로 스크롤 */
  minWidth?: number;
}

interface Node {
  id: string;
  col: number;
  name: string;
  value: number;
  y: number;
  h: number;
}

interface Band {
  id: string;
  col: number;
  src: Node;
  dst: Node;
  value: number;
  sy: number;
  ty: number;
  h: number;
}

const NODE_W = 10;
const GAP = 8;
const HEAD = 22;
const EXIT_COLOR = "#5f5f5f";

export function PathSankey({ title, columns, links, groups, exitLabel = "이탈", otherLabel = "기타", height = 420, minWidth = 640 }: PathSankeyProps) {
  const box = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(minWidth);
  const [hoverBand, setHoverBand] = useState<string | null>(null);
  const [focus, setFocus] = useState<string | null>(null);
  const [tip, setTip] = useState<{ x: number; y: number } | null>(null);
  const captionId = useId();

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(Math.max(minWidth, Math.floor(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, [minWidth]);

  const colorOf = (name: string) => (name === exitLabel ? EXIT_COLOR : (groups.find((g) => g.members.includes(name))?.color ?? "#8c8c8c"));
  const rank = (name: string) => (name === exitLabel ? 2 : name === otherLabel ? 1 : 0);

  const g = useMemo(() => {
    const cols = columns.length;
    const vals: Map<string, number>[] = Array.from({ length: cols }, () => new Map());
    for (const l of links) {
      if (l.step === 1) vals[0].set(l.from, (vals[0].get(l.from) ?? 0) + l.value);
      vals[l.step]?.set(l.to, (vals[l.step].get(l.to) ?? 0) + l.value);
    }
    const inner = height - HEAD;
    let k = Infinity;
    for (const m of vals) {
      const tot = [...m.values()].reduce((a, b) => a + b, 0);
      if (tot > 0) k = Math.min(k, (inner - GAP * (m.size - 1)) / tot);
    }
    if (!Number.isFinite(k)) k = 0;
    const nodes = new Map<string, Node>();
    const byCol: Node[][] = [];
    vals.forEach((m, col) => {
      let y = HEAD;
      byCol[col] = [...m.entries()]
        .filter(([, v]) => v > 0)
        .sort((a, b) => rank(a[0]) - rank(b[0]) || b[1] - a[1])
        .map(([name, value]) => {
          const h = Math.max(1.5, value * k);
          const n = { id: `${col}|${name}`, col, name, value, y, h };
          y += h + GAP;
          nodes.set(n.id, n);
          return n;
        });
    });
    const bands: Band[] = [];
    for (const l of links) {
      const src = nodes.get(`${l.step - 1}|${l.from}`);
      const dst = nodes.get(`${l.step}|${l.to}`);
      if (src && dst && l.value > 0) bands.push({ id: `${l.step}|${l.from}|${l.to}`, col: l.step - 1, src, dst, value: l.value, sy: 0, ty: 0, h: l.value * k });
    }
    const stack = (key: "src" | "dst", other: "src" | "dst", out: "sy" | "ty") => {
      const by = new Map<string, Band[]>();
      for (const b of bands) by.set(b[key].id, [...(by.get(b[key].id) ?? []), b]);
      for (const [id, bs] of by) {
        let y = nodes.get(id)!.y;
        for (const b of bs.sort((a, c) => a[other].y - c[other].y)) {
          b[out] = y;
          y += b.h;
        }
      }
    };
    stack("src", "dst", "sy");
    stack("dst", "src", "ty");
    const total = byCol[0]?.reduce((a, n) => a + n.value, 0) ?? 0;
    return { byCol, nodes, bands, total };
  }, [links, columns.length, height, exitLabel, otherLabel]);

  const span = width - NODE_W;
  const x = (c: number) => (columns.length > 1 ? (c * span) / (columns.length - 1) : 0);
  const path = (b: Band) => {
    const x0 = x(b.col) + NODE_W;
    const x1 = x(b.col + 1);
    const xm = (x0 + x1) / 2;
    const h = Math.max(b.h, 0.8);
    return `M${x0},${b.sy}C${xm},${b.sy} ${xm},${b.ty} ${x1},${b.ty}L${x1},${b.ty + h}C${xm},${b.ty + h} ${xm},${b.sy + h} ${x0},${b.sy + h}Z`;
  };

  const focusNode = focus ? g.nodes.get(focus) : undefined;
  const band = hoverBand ? g.bands.find((b) => b.id === hoverBand) : undefined;
  const lit = (b: Band) => (band ? b.id === band.id : focusNode ? b.src.id === focusNode.id || b.dst.id === focusNode.id : true);
  const outOf = (n: Node) => g.bands.filter((b) => b.src.id === n.id).reduce((a, b) => a + b.value, 0) || n.value;
  const pct = (v: number, d: number) => (d ? `${((v / d) * 100).toFixed(1)}%` : "—");
  const num = (v: number) => v.toLocaleString("ko-KR");

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const cur = focusNode ?? g.byCol[0]?.[0];
    if (!cur) return;
    const list = g.byCol[cur.col];
    const idx = list.indexOf(cur);
    let next: Node | undefined;
    if (!focusNode && ["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown"].includes(e.key)) next = cur;
    else if (e.key === "ArrowDown") next = list[Math.min(list.length - 1, idx + 1)];
    else if (e.key === "ArrowUp") next = list[Math.max(0, idx - 1)];
    else if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      const col = g.byCol[cur.col + (e.key === "ArrowRight" ? 1 : -1)];
      next = col?.find((n) => n.name === cur.name) ?? col?.[0] ?? cur;
    } else if (e.key === "Escape") {
      setFocus(null);
      setTip(null);
      e.preventDefault();
      return;
    } else return;
    e.preventDefault();
    setHoverBand(null);
    setFocus(next.id);
    setTip({ x: x(next.col) + (next.col === columns.length - 1 ? -12 : NODE_W + 12), y: next.y + next.h / 2 });
  };

  const nodeText = (n: Node) => {
    const outs = g.bands
      .filter((b) => b.src.id === n.id)
      .sort((a, b) => b.value - a.value)
      .slice(0, 3)
      .map((b) => `${b.dst.name} ${pct(b.value, outOf(n))}`);
    return { head: `${n.name} · ${columns[n.col]}`, lines: [["세션", num(n.value)], ["전체 세션 대비", pct(n.value, g.total)], ...(outs.length ? [["다음 화면", outs.join(", ")]] : [])] };
  };
  const bandText = (b: Band) => ({
    head: `${b.src.name} → ${b.dst.name} · ${columns[b.col]} → ${columns[b.col + 1]}`,
    lines: [["세션", num(b.value)], [`${b.src.name} 세션 중`, pct(b.value, outOf(b.src))], ["전체 세션 대비", pct(b.value, g.total)]],
  });
  const detail = band ? bandText(band) : focusNode ? nodeText(focusNode) : null;
  const flipTip = tip ? tip.x > width / 2 : false;

  return (
    <figure className="min-w-0">
      <div className="overflow-x-auto p-1">
        <div
          ref={box}
          role="img"
          tabIndex={0}
          aria-label={`${title}. ${columns[0]} 세션 ${num(g.total)}. 화살표로 화면 노드를 옮겨 다니며 값을 읽는다.`}
          onKeyDown={onKey}
          onBlur={() => {
            setFocus(null);
            setTip(null);
          }}
          onPointerLeave={() => {
            setHoverBand(null);
            setFocus(null);
            setTip(null);
          }}
          className="relative rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-accent"
          style={{ minWidth, height }}
        >
          <svg width={width} height={height} aria-hidden="true" className="block">
            {columns.map((c, i) => (
              <text key={c} x={i === columns.length - 1 ? x(i) + NODE_W : x(i)} y={12} textAnchor={i === columns.length - 1 ? "end" : "start"} className="fill-muted text-[11px]">
                {c}
              </text>
            ))}
            {g.bands.map((b) => {
              const strong = band?.id === b.id;
              const on = lit(b);
              return (
                <path
                  key={b.id}
                  d={path(b)}
                  fill={b.dst.name === exitLabel ? EXIT_COLOR : colorOf(b.src.name)}
                  fillOpacity={strong ? 0.7 : on ? (band || focusNode ? 0.5 : 0.28) : 0.06}
                  onPointerMove={(e) => {
                    const r = box.current!.getBoundingClientRect();
                    setFocus(null);
                    setHoverBand(b.id);
                    setTip({ x: e.clientX - r.left, y: e.clientY - r.top });
                  }}
                />
              );
            })}
            {[...g.nodes.values()].map((n) => (
              <rect
                key={n.id}
                x={x(n.col)}
                y={n.y}
                width={NODE_W}
                height={n.h}
                rx={2}
                fill={colorOf(n.name)}
                stroke={focus === n.id ? "var(--color-fg)" : "none"}
                strokeWidth={2}
                onPointerMove={(e) => {
                  const r = box.current!.getBoundingClientRect();
                  setHoverBand(null);
                  setFocus(n.id);
                  setTip({ x: e.clientX - r.left, y: e.clientY - r.top });
                }}
              />
            ))}
            {[...g.nodes.values()]
              .filter((n) => n.h >= 12)
              .map((n) => {
                const right = n.col !== columns.length - 1;
                return (
                  <text
                    key={`t${n.id}`}
                    x={right ? x(n.col) + NODE_W + 5 : x(n.col) - 5}
                    y={n.y + n.h / 2}
                    dy="0.35em"
                    textAnchor={right ? "start" : "end"}
                    className="pointer-events-none text-[11px] tabular-nums"
                    style={{ paintOrder: "stroke", stroke: "var(--color-surface)", strokeWidth: 3, strokeLinejoin: "round" }}
                  >
                    <tspan className="fill-fg/85">{n.name}</tspan>
                    <tspan className="fill-muted"> {num(n.value)}</tspan>
                  </text>
                );
              })}
          </svg>
          {detail && tip && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute z-10 w-max max-w-64 rounded-xl border border-line bg-bg/95 px-3 py-2 text-xs shadow-lg"
              style={{ left: flipTip ? tip.x - 12 : tip.x + 12, top: Math.min(Math.max(0, tip.y - 10), height - 96), transform: flipTip ? "translateX(-100%)" : undefined }}
            >
              <div className="mb-1 font-medium text-fg">{detail.head}</div>
              {detail.lines.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 tabular-nums">
                  <span className="shrink-0 text-fg/70">{k}</span>
                  <span className="text-right text-fg">{v}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-fg/80">
        {[...groups, { label: exitLabel, color: EXIT_COLOR, members: [] }].map((gr) => (
          <li key={gr.label} className="flex items-center gap-1.5">
            <span aria-hidden="true" className="size-2.5 rounded-sm" style={{ backgroundColor: gr.color }} />
            {gr.label}
          </li>
        ))}
      </ul>
      <p aria-live="polite" className="sr-only">
        {focusNode && `${nodeText(focusNode).head}: ${nodeText(focusNode).lines.map(([k, v]) => `${k} ${v}`).join(", ")}`}
      </p>
      <table className="sr-only" aria-labelledby={captionId}>
        <caption id={captionId}>{title} 경로별 세션</caption>
        <thead>
          <tr>
            <th scope="col">구간</th>
            <th scope="col">출발</th>
            <th scope="col">도착</th>
            <th scope="col">세션</th>
            <th scope="col">출발 화면 세션 중</th>
          </tr>
        </thead>
        <tbody>
          {g.bands.map((b) => (
            <tr key={b.id}>
              <td>{`${columns[b.col]} → ${columns[b.col + 1]}`}</td>
              <td>{b.src.name}</td>
              <td>{b.dst.name}</td>
              <td>{num(b.value)}</td>
              <td>{pct(b.value, outOf(b.src))}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
