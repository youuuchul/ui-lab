"use client";
import { useState } from "react";
import { SegmentedControl } from "./SegmentedControl";

const PERIODS = [
  { value: "day", label: "일" },
  { value: "week", label: "주" },
  { value: "month", label: "월" },
  { value: "year", label: "년" },
] as const;

const BARS: Record<string, number[]> = {
  day: [30, 55, 40, 70, 50, 65, 45],
  week: [60, 45, 75, 50, 80, 55, 70],
  month: [40, 70, 55, 85, 60, 75, 90],
  year: [70, 60, 80, 65, 90, 85, 95],
};

export default function Demo() {
  const [period, setPeriod] = useState<string>("week");
  return (
    <div className="flex w-80 flex-col gap-4 rounded-card border border-line bg-bg p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">방문자</span>
        <SegmentedControl label="집계 기간" size="sm" options={[...PERIODS]} value={period} onChange={setPeriod} className="w-44" />
      </div>
      <div className="flex h-28 items-end gap-2">
        {BARS[period].map((h, i) => (
          <div key={i} className="flex-1 rounded-t-md bg-accent/70 transition-[height] duration-300 motion-reduce:transition-none" style={{ height: `${h}%` }} />
        ))}
      </div>
      <SegmentedControl label="보기 방식" options={[{ value: "list", label: "목록" }, { value: "map", label: "지도" }]} defaultValue="list" />
    </div>
  );
}
