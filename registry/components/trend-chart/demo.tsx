"use client";
import { TrendChart } from "./TrendChart";

const LABELS = ["6/23~6/29", "6/30~7/6", "7/7~7/13", "7/14~7/20", "7/21~7/27", "7/28~8/3", "8/4~8/10", "8/11~8/17", "8/18~8/24", "8/25~8/31", "9/1~9/7", "9/8~9/14", "9/15~9/20"];

export default function Demo() {
  return (
    <div className="w-full max-w-[720px] rounded-2xl border border-line bg-surface p-4">
      <TrendChart
        title="주별 결제"
        labels={LABELS}
        series={[
          { label: "결제", values: [747, 1371, 1512, 1580, 1485, 1221, 1547, 1499, 1577, 1666, 1527, 1412, 1473] },
          { label: "신청", values: [1283, 2084, 2284, 2448, 2437, 2282, 2812, 2777, 2897, 3074, 2664, 2726, 2442] },
          { label: "전기 결제", values: [677, 741, 824, 692, 698, 833, 843, 951, 901, 858, 858, 781, 628], dashed: true },
        ]}
      />
    </div>
  );
}
