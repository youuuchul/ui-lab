"use client";
import { useLayoutEffect, useMemo, useRef, type ReactNode } from "react";
import { ForceGraph, type GraphInput } from "./graph";

export interface ForceGraphHeroProps {
  data: GraphInput;
  /** 그래프 위에 겹치는 제목 영역 */
  children?: ReactNode;
  entry?: "settle" | "timelapse";
  /** 선·라벨 글자색 */
  ink?: string;
  /** 라벨 테두리색 (바탕과 같게) */
  halo?: string;
  className?: string;
  /** 스크린리더용 요약. 비우면 데이터에서 노드 수·연결 수·큰 노드(허브)로 만든다 */
  label?: string;
}

/** 첫 화면용 3D 힘 그래프 + 제목 오버레이. 그래프는 자동으로 돌고, 끌어서 돌리고, 노드에 올리면 이웃만 남긴다. */
export function ForceGraphHero({ data, children, entry = "settle", ink = "#f2f2f2", halo = "#1b1b1b", className = "", label }: ForceGraphHeroProps) {
  const host = useRef<HTMLDivElement>(null);
  const summary = useMemo(() => {
    const name = new Map(data.nodes.map((n) => [n.id, n.label]));
    const near = new Map<string, string[]>();
    for (const l of data.links) {
      near.set(l.source, [...(near.get(l.source) ?? []), name.get(l.target) ?? l.target]);
      near.set(l.target, [...(near.get(l.target) ?? []), name.get(l.source) ?? l.source]);
    }
    const hubs = data.nodes.filter((n) => n.big).map((n) => n.label);
    const text = `노드 ${data.nodes.length}개, 연결 ${data.links.length}개${hubs.length ? `. 주요 노드: ${hubs.join(", ")}` : ""}`;
    return { text, items: data.nodes.map((n) => ({ id: n.id, label: n.label, near: near.get(n.id) ?? [] })) };
  }, [data]);

  // 레이아웃 단계에서 만들어 첫 그리기부터 무대 크기에 맞춘다
  useLayoutEffect(() => {
    const el = host.current;
    if (!el) return;
    const g = new ForceGraph(el, data);
    g.entry = entry;
    g.ink = ink;
    g.halo = halo;
    g.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let alive = true;
    // 라벨 폭 계산이 맞도록 글꼴을 먼저 받고 진입 연출
    document.fonts
      .load("500 14px Pretendard")
      .catch(() => undefined)
      .then(() => alive && g.replay());
    return () => {
      alive = false;
      g.destroy();
    };
  }, [data, entry, ink, halo]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div ref={host} role="img" aria-label={label ?? summary.text} className="absolute inset-0" />
      <ul className="sr-only" aria-label="그래프 노드와 연결">
        {summary.items.map((n) => (
          <li key={n.id}>
            {n.label}
            {n.near.length > 0 && `: ${n.near.join(", ")}`}
          </li>
        ))}
      </ul>
      {children && <div className="pointer-events-none relative">{children}</div>}
    </div>
  );
}
