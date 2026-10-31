"use client";
import type { ReactNode } from "react";
import { FunnelHeatmap, type FunnelRow } from "../../components/funnel-heatmap/FunnelHeatmap";
import { KpiScoreboard, type KpiItem } from "../../components/kpi-scoreboard/KpiScoreboard";
import { PathSankey, type PathGroup, type PathLink } from "../../components/path-sankey/PathSankey";
import { TrendChart, type TrendSeries } from "../../components/trend-chart/TrendChart";

export interface FunnelAnalysisProps {
  /** 오른쪽 위 기간 표시 */
  range: string;
  /** 스코어보드 소제목 (예: "전환 · 직전 28일 대비") */
  caption: string;
  kpis: KpiItem[];
  stepTrend: { note: string; labels: string[]; series: TrendSeries[] };
  segments: { steps: string[]; rows: FunnelRow[] };
  path: { note: string; columns: string[]; links: PathLink[]; groups: PathGroup[] };
}

function Card({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <section className="min-w-0 rounded-card border border-line bg-surface p-4">
      <header className="mb-3 flex flex-wrap items-baseline gap-x-2">
        <h3 className="text-sm font-semibold">{title}</h3>
        {note && <span className="text-xs text-muted tabular-nums">{note}</span>}
      </header>
      {children}
    </section>
  );
}

const pct = (v: number) => `${v.toFixed(1)}%`;

export function FunnelAnalysis({ range, caption, kpis, stepTrend, segments, path }: FunnelAnalysisProps) {
  return (
    <div className="@container flex flex-col gap-4 text-fg">
      <p className="self-end text-xs text-muted tabular-nums">{range}</p>
      <KpiScoreboard caption={caption} items={kpis} className="grid-cols-2 @2xl:grid-cols-4" />
      <div className="grid gap-4 @5xl:grid-cols-2">
        <Card title="단계 전환율 추이" note={stepTrend.note}>
          <TrendChart title="단계 전환율 추이" labels={stepTrend.labels} series={stepTrend.series} format={pct} height={230} />
        </Card>
        <Card title="세그먼트별 퍼널" note="랜딩 대비 도달률 · 명">
          <FunnelHeatmap title="세그먼트별 퍼널" steps={segments.steps} rows={segments.rows} />
        </Card>
      </div>
      <Card title="경로 탐색" note={path.note}>
        <PathSankey title="경로 탐색" columns={path.columns} links={path.links} groups={path.groups} />
      </Card>
    </div>
  );
}
