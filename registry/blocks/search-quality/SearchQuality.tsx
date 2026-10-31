"use client";
import { useState } from "react";
import { KpiScoreboard, type KpiItem } from "../../components/kpi-scoreboard/KpiScoreboard";
import { SegmentedControl } from "../../components/segmented-control/SegmentedControl";
import { SortableTable } from "../../components/sortable-table/SortableTable";
import { TrendChart } from "../../components/trend-chart/TrendChart";

export type IntentRow = {
  intent: string;
  searches: number;
  /** 비율은 0~100 */
  success: number;
  zero: number;
  /** 결과가 없으면 null */
  clickRate: number | null;
  firstClick: number | null;
  reformulate: number;
};

export interface SearchPeriod {
  key: string;
  label: string;
  range: string;
  caption: string;
  kpis: KpiItem[];
  /** 일별 검색 성공률·결과 0건 비율 (0~100) */
  daily: { labels: string[]; success: number[]; zero: number[] };
  intents: IntentRow[];
}

export interface SearchQualityProps {
  periods: SearchPeriod[];
  defaultPeriod?: string;
}

const pct = (v: number) => `${v.toFixed(1)}%`;

const COLUMNS = [
  { key: "intent", label: "의도 유형" },
  { key: "searches", label: "검색 수", align: "right" as const },
  { key: "success", label: "성공률", align: "right" as const, format: pct },
  { key: "zero", label: "결과 0건", align: "right" as const, format: pct },
  { key: "clickRate", label: "결과 클릭률", align: "right" as const, format: pct },
  { key: "firstClick", label: "첫 클릭 순위", align: "right" as const, format: (v: number) => v.toFixed(2) },
  { key: "reformulate", label: "재검색률", align: "right" as const, format: pct },
];

export function SearchQuality({ periods, defaultPeriod }: SearchQualityProps) {
  const [key, setKey] = useState(defaultPeriod ?? periods[0].key);
  const p = periods.find((x) => x.key === key) ?? periods[0];

  return (
    <div className="flex flex-col gap-4 text-fg">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SegmentedControl label="기간" options={periods.map((x) => ({ value: x.key, label: x.label }))} value={key} onChange={setKey} className="w-60" />
        <p className="text-xs text-muted tabular-nums">{p.range}</p>
      </div>
      <KpiScoreboard caption={p.caption} items={p.kpis} className="grid-cols-2 @xl:grid-cols-3 @4xl:grid-cols-6" />
      <section className="min-w-0 rounded-card border border-line bg-surface p-4">
        <header className="mb-3 flex items-baseline gap-2">
          <h3 className="text-sm font-semibold">검색 성공률 · 결과 0건 비율</h3>
          <span className="text-xs text-muted">일별</span>
        </header>
        <TrendChart
          title="검색 성공률 · 결과 0건 비율"
          labels={p.daily.labels}
          series={[
            { label: "검색 성공률", values: p.daily.success },
            { label: "결과 0건", values: p.daily.zero },
          ]}
          format={pct}
          height={220}
        />
      </section>
      <section className="min-w-0 rounded-card border border-line bg-surface p-4">
        <header className="mb-1">
          <h3 className="text-sm font-semibold">의도 유형별</h3>
        </header>
        <SortableTable
          caption="의도 유형별 검색 품질"
          columns={COLUMNS}
          rows={p.intents}
          rowKey="intent"
          defaultSort={{ key: "searches", dir: "desc" }}
        />
      </section>
    </div>
  );
}
