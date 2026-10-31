"use client";
import { KpiOverview, type OverviewPeriod } from "./KpiOverview";

const PERIODS: OverviewPeriod[] = [
  {
    key: "7",
    label: "7일",
    range: "2026-09-14 ~ 09/20 · 7일",
    caption: "핵심 지표 · 직전 7일 대비",
    kpis: [
      { label: "결제", value: "1,720", unit: "건", delta: { value: 25.8, unit: "%" } },
      { label: "방문자", value: "20,082", unit: "명", delta: { value: 0.2, unit: "%" } },
      { label: "가입", value: "646", unit: "명", delta: { value: 0.6, unit: "%" } },
      { label: "활성 구독자", value: "2,001", unit: "명", delta: { value: 2.8, unit: "%" }, sub: "9/20 기준" },
      { label: "파트너 공간", value: "180", unit: "곳", delta: { value: 2.3, unit: "%" }, sub: "파트너 거래액 비중 67.3%" },
      { label: "플랫폼 매출", value: "1,262만", unit: "원", delta: { value: 11.7, unit: "%" } },
    ],
    trend: {
      title: "결제",
      note: "일별 · 9/14~9/20 · 전기 9/7~9/13",
      labels: ["9/14", "9/15", "9/16", "9/17", "9/18", "9/19", "9/20"],
      series: [
        { label: "결제", values: [247, 269, 265, 286, 256, 225, 172] },
        { label: "신청", values: [404, 446, 486, 465, 395, 383, 267] },
        { label: "전기 결제", values: [202, 224, 222, 193, 163, 204, 159], dashed: true },
      ],
      tiles: [
        { label: "결제", value: "1,720", unit: "건", delta: { value: 25.8, unit: "%" } },
        { label: "객단가", value: "4.1만", unit: "원", delta: { value: 4.4, unit: "%" } },
        { label: "거래액", value: "6,829만", unit: "원", delta: { value: 40.5, unit: "%" } },
      ],
    },
  },
  {
    key: "28",
    label: "28일",
    range: "2026-08-24 ~ 09/20 · 28일",
    caption: "핵심 지표 · 직전 28일 대비",
    kpis: [
      { label: "결제", value: "6,314", unit: "건", delta: { value: 9.0, unit: "%" } },
      { label: "방문자", value: "43,383", unit: "명", delta: { value: -1.7, unit: "%" } },
      { label: "가입", value: "2,451", unit: "명", delta: { value: -16.0, unit: "%" } },
      { label: "활성 구독자", value: "2,001", unit: "명", delta: { value: 13.0, unit: "%" }, sub: "9/20 기준" },
      { label: "파트너 공간", value: "180", unit: "곳", delta: { value: 10.4, unit: "%" }, sub: "파트너 거래액 비중 68.9%" },
      { label: "플랫폼 매출", value: "4,530만", unit: "원", delta: { value: 20.1, unit: "%" } },
    ],
    trend: {
      title: "결제",
      note: "주별 · 8/24~9/20 · 전기 7/27~8/23",
      labels: ["8/24~8/30", "8/31~9/6", "9/7~9/13", "9/14~9/20"],
      series: [
        { label: "결제", values: [1658, 1569, 1367, 1720] },
        { label: "신청", values: [3035, 2752, 2718, 2846] },
        { label: "전기 결제", values: [1196, 1538, 1488, 1570], dashed: true },
      ],
      tiles: [
        { label: "결제", value: "6,314", unit: "건", delta: { value: 9.0, unit: "%" } },
        { label: "객단가", value: "3.9만", unit: "원", delta: { value: 10.5, unit: "%" } },
        { label: "거래액", value: "2.25억", unit: "원", delta: { value: 26.9, unit: "%" } },
      ],
    },
  },
  {
    key: "90",
    label: "90일",
    range: "2026-06-23 ~ 09/20 · 90일",
    caption: "핵심 지표 · 직전 90일 대비",
    kpis: [
      { label: "결제", value: "18,617", unit: "건", delta: { value: 81.0, unit: "%" } },
      { label: "방문자", value: "94,682", unit: "명", delta: { value: 67.8, unit: "%" } },
      { label: "가입", value: "8,074", unit: "명", delta: { value: 67.3, unit: "%" } },
      { label: "활성 구독자", value: "2,001", unit: "명", delta: { value: 57.7, unit: "%" }, sub: "9/20 기준" },
      { label: "파트너 공간", value: "180", unit: "곳", delta: { value: 41.7, unit: "%" }, sub: "파트너 거래액 비중 72.3%" },
      { label: "플랫폼 매출", value: "1.28억", unit: "원", delta: { value: 60.4, unit: "%" } },
    ],
    trend: {
      title: "결제",
      note: "주별 · 6/23~9/20 · 전기 3/25~6/22",
      labels: ["6/23~6/29", "6/30~7/6", "7/7~7/13", "7/14~7/20", "7/21~7/27", "7/28~8/3", "8/4~8/10", "8/11~8/17", "8/18~8/24", "8/25~8/31", "9/1~9/7", "9/8~9/14", "9/15~9/20"],
      series: [
        { label: "결제", values: [747, 1371, 1512, 1580, 1485, 1221, 1547, 1499, 1577, 1666, 1527, 1412, 1473] },
        { label: "신청", values: [1283, 2084, 2284, 2448, 2437, 2282, 2812, 2777, 2897, 3074, 2664, 2726, 2442] },
        { label: "전기 결제", values: [677, 741, 824, 692, 698, 833, 843, 951, 901, 858, 858, 781, 628], dashed: true },
      ],
      tiles: [
        { label: "결제", value: "18,617", unit: "건", delta: { value: 81.0, unit: "%" } },
        { label: "객단가", value: "4만", unit: "원", delta: { value: -3.1, unit: "%" } },
        { label: "거래액", value: "6.65억", unit: "원", delta: { value: 74.3, unit: "%" } },
      ],
    },
  },
];

export default function Demo() {
  return (
    <div className="h-[34rem] w-full max-w-[1100px] overflow-y-auto rounded-2xl border border-line bg-bg p-4">
      <KpiOverview
        asOf={{ label: "9/20 기준", items: [{ label: "누적 회원", value: "22,008명" }, { label: "등록 공간", value: "1,800곳" }, { label: "파트너 공간", value: "180곳" }] }}
        periods={PERIODS}
        defaultPeriod="28"
      />
    </div>
  );
}
