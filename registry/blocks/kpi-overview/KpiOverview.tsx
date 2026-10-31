"use client";
import { useId, useState } from "react";
import { KpiScoreboard, type KpiItem } from "../../components/kpi-scoreboard/KpiScoreboard";
import { SegmentedControl } from "../../components/segmented-control/SegmentedControl";
import { TrendChart, type TrendSeries } from "../../components/trend-chart/TrendChart";

export interface OverviewPeriod {
  key: string;
  /** 기간 선택 버튼 글자 (예: "28일") */
  label: string;
  /** 오른쪽 위 기간 표시 (예: "2026-08-24 ~ 09/20 · 28일") */
  range: string;
  /** 스코어보드 소제목 (예: "핵심 지표 · 직전 28일 대비") */
  caption: string;
  kpis: KpiItem[];
  trend: {
    title: string;
    /** 제목 옆 입자·범위 (예: "주별 · 8/24~9/20 · 전기 7/27~8/23") */
    note: string;
    labels: string[];
    series: TrendSeries[];
    /** 차트 오른쪽 분해 타일 */
    tiles: KpiItem[];
  };
}

export interface KpiOverviewProps {
  /** 필터와 무관한 기준일 현황 */
  asOf: { label: string; items: { label: string; value: string }[] };
  periods: OverviewPeriod[];
  defaultPeriod?: string;
}

export function KpiOverview({ asOf, periods, defaultPeriod }: KpiOverviewProps) {
  const [key, setKey] = useState(defaultPeriod ?? periods[0].key);
  const headId = useId();
  const p = periods.find((x) => x.key === key) ?? periods[0];

  return (
    <div className="@container flex flex-col gap-4 text-fg">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SegmentedControl label="기간" options={periods.map((x) => ({ value: x.key, label: x.label }))} value={key} onChange={setKey} className="w-60" />
        <p className="text-xs text-muted tabular-nums">{p.range}</p>
      </div>
      <p className="flex flex-wrap gap-x-5 gap-y-1 rounded-2xl border border-line px-4 py-2.5 text-xs text-muted tabular-nums">
        <span>{asOf.label}</span>
        {asOf.items.map((s) => (
          <span key={s.label}>
            {s.label} <strong className="font-semibold text-fg">{s.value}</strong>
          </span>
        ))}
      </p>
      <KpiScoreboard caption={p.caption} items={p.kpis} className="grid-cols-2 @xl:grid-cols-3 @4xl:grid-cols-6" />
      <section aria-labelledby={headId} className="rounded-card border border-line bg-surface p-4">
        <header className="mb-3 flex flex-wrap items-baseline gap-x-2">
          <h3 id={headId} className="text-sm font-semibold">
            {p.trend.title}
          </h3>
          <span className="text-xs text-muted tabular-nums">{p.trend.note}</span>
        </header>
        <div className="grid gap-4 @4xl:grid-cols-[minmax(0,1fr)_12rem]">
          <TrendChart title={`${p.trend.title} 추이`} labels={p.trend.labels} series={p.trend.series} height={240} />
          <KpiScoreboard items={p.trend.tiles} className="grid-cols-1 @md:grid-cols-3" />
        </div>
      </section>
    </div>
  );
}
