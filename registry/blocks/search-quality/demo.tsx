"use client";
import { SearchQuality, type SearchPeriod } from "./SearchQuality";

const PERIODS: SearchPeriod[] = [
  {
    key: "7",
    label: "7일",
    range: "2026-09-14 ~ 09/20 · 7일",
    caption: "검색 · 직전 7일 대비",
    kpis: [
      { label: "검색 이용자", value: "1,287", unit: "명", delta: { value: 0.4, unit: "%" } },
      { label: "검색 성공률", value: "45.8%", delta: { value: 0.5, unit: "%p" }, sub: "결과 클릭률 46.8%" },
      { label: "결과 0건 비율", value: "2.1%", delta: { value: -0.6, unit: "%p", good: "down" }, sub: "검색 2,336건 중" },
      { label: "평균 첫 클릭 순위", value: "1.89", unit: "위", delta: { value: -1.0, unit: "%", good: "down" } },
      { label: "재검색률", value: "38.9%", delta: { value: 0.3, unit: "%p", good: "down" } },
      { label: "검색 세션 신청 전환", value: "5.10%", delta: { value: 0.5, unit: "%p" }, sub: "검색 세션 1,372 중" },
    ],
    daily: {
      labels: ["9/14", "9/15", "9/16", "9/17", "9/18", "9/19", "9/20"],
      success: [46.6, 46.8, 43.0, 45.6, 50.1, 47.1, 41.4],
      zero: [2.3, 2.5, 2.1, 2.2, 1.8, 0.9, 2.7],
    },
    intents: [
      { intent: "장르", searches: 894, success: 52.9, zero: 0.0, clickRate: 52.9, firstClick: 1.83, reformulate: 33.0 },
      { intent: "상권", searches: 602, success: 57.1, zero: 0.0, clickRate: 57.1, firstClick: 1.85, reformulate: 32.6 },
      { intent: "공간명", searches: 417, success: 29.3, zero: 0.0, clickRate: 29.3, firstClick: 1.84, reformulate: 48.0 },
      { intent: "행사 유형", searches: 375, success: 34.9, zero: 0.0, clickRate: 34.9, firstClick: 2.27, reformulate: 50.1 },
      { intent: "해석 못 함", searches: 48, success: 0.0, zero: 100.0, clickRate: null, firstClick: null, reformulate: 62.5 },
    ],
  },
  {
    key: "28",
    label: "28일",
    range: "2026-08-24 ~ 09/20 · 28일",
    caption: "검색 · 직전 28일 대비",
    kpis: [
      { label: "검색 이용자", value: "4,872", unit: "명", delta: { value: -3.2, unit: "%" } },
      { label: "검색 성공률", value: "44.0%", delta: { value: -0.7, unit: "%p" }, sub: "결과 클릭률 46.4%" },
      { label: "결과 0건 비율", value: "5.2%", delta: { value: 1.8, unit: "%p", good: "down" }, sub: "검색 9,713건 중" },
      { label: "평균 첫 클릭 순위", value: "1.88", unit: "위", delta: { value: -0.5, unit: "%", good: "down" } },
      { label: "재검색률", value: "39.5%", delta: { value: 0.6, unit: "%p", good: "down" } },
      { label: "검색 세션 신청 전환", value: "4.63%", delta: { value: 0.0, unit: "%p" }, sub: "검색 세션 5,676 중" },
    ],
    daily: {
      labels: ["8/24", "8/25", "8/26", "8/27", "8/28", "8/29", "8/30", "8/31", "9/1", "9/2", "9/3", "9/4", "9/5", "9/6", "9/7", "9/8", "9/9", "9/10", "9/11", "9/12", "9/13", "9/14", "9/15", "9/16", "9/17", "9/18", "9/19", "9/20"],
      success: [42.1, 43.2, 48.8, 48.3, 45.0, 45.0, 47.5, 43.7, 35.9, 35.6, 36.9, 38.6, 45.7, 40.7, 44.4, 39.0, 48.4, 50.3, 48.2, 42.0, 45.9, 46.6, 46.8, 43.0, 45.6, 50.1, 47.1, 41.4],
      zero: [3.8, 4.0, 2.2, 2.1, 4.1, 2.8, 3.9, 2.6, 18.3, 20.9, 19.1, 17.7, 1.7, 3.7, 3.2, 2.2, 2.4, 3.8, 1.5, 4.0, 1.3, 2.3, 2.5, 2.1, 2.2, 1.8, 0.9, 2.7],
    },
    intents: [
      { intent: "장르", searches: 3686, success: 53.3, zero: 0.0, clickRate: 53.3, firstClick: 1.87, reformulate: 32.9 },
      { intent: "상권", searches: 2436, success: 50.6, zero: 9.6, clickRate: 55.9, firstClick: 1.86, reformulate: 35.0 },
      { intent: "공간명", searches: 1817, success: 30.6, zero: 0.0, clickRate: 30.6, firstClick: 1.83, reformulate: 49.6 },
      { intent: "행사 유형", searches: 1503, success: 34.9, zero: 0.0, clickRate: 34.9, firstClick: 2.04, reformulate: 46.2 },
      { intent: "해석 못 함", searches: 271, success: 0.0, zero: 100.0, clickRate: null, firstClick: null, reformulate: 64.2 },
    ],
  },
  {
    key: "90",
    label: "90일",
    range: "2026-06-23 ~ 09/20 · 90일",
    caption: "검색 · 직전 90일 대비",
    kpis: [
      { label: "검색 이용자", value: "12,214", unit: "명", delta: { value: 54.5, unit: "%" } },
      { label: "검색 성공률", value: "37.7%", delta: { value: 14.6, unit: "%p" }, sub: "결과 클릭률 42.3%" },
      { label: "결과 0건 비율", value: "11.1%", delta: { value: -15.7, unit: "%p", good: "down" }, sub: "검색 31,733건 중" },
      { label: "평균 첫 클릭 순위", value: "1.91", unit: "위", delta: { value: -5.1, unit: "%", good: "down" } },
      { label: "재검색률", value: "43.1%", delta: { value: -8.1, unit: "%p", good: "down" } },
      { label: "검색 세션 신청 전환", value: "4.24%", delta: { value: 1.1, unit: "%p" }, sub: "검색 세션 17,507 중" },
    ],
    daily: {
      labels: ["6/23", "6/24", "6/25", "6/26", "6/27", "6/28", "6/29", "6/30", "7/1", "7/2", "7/3", "7/4", "7/5", "7/6", "7/7", "7/8", "7/9", "7/10", "7/11", "7/12", "7/13", "7/14", "7/15", "7/16", "7/17", "7/18", "7/19", "7/20", "7/21", "7/22", "7/23", "7/24", "7/25", "7/26", "7/27", "7/28", "7/29", "7/30", "7/31", "8/1", "8/2", "8/3", "8/4", "8/5", "8/6", "8/7", "8/8", "8/9", "8/10", "8/11", "8/12", "8/13", "8/14", "8/15", "8/16", "8/17", "8/18", "8/19", "8/20", "8/21", "8/22", "8/23", "8/24", "8/25", "8/26", "8/27", "8/28", "8/29", "8/30", "8/31", "9/1", "9/2", "9/3", "9/4", "9/5", "9/6", "9/7", "9/8", "9/9", "9/10", "9/11", "9/12", "9/13", "9/14", "9/15", "9/16", "9/17", "9/18", "9/19", "9/20"],
      success: [23.1, 21.7, 24.0, 25.5, 24.8, 22.2, 23.4, 24.4, 22.7, 21.9, 22.9, 24.1, 22.9, 21.6, 19.8, 22.3, 25.1, 20.0, 22.9, 18.8, 27.8, 27.4, 32.3, 34.0, 31.0, 33.3, 34.1, 33.7, 35.1, 31.2, 29.9, 35.6, 28.5, 33.9, 43.1, 41.6, 46.3, 40.5, 46.9, 48.4, 41.5, 41.6, 41.7, 47.5, 40.3, 48.4, 44.5, 44.4, 45.5, 45.0, 46.9, 42.0, 44.0, 42.5, 47.8, 42.5, 50.3, 50.5, 46.5, 44.0, 42.2, 45.4, 42.1, 43.2, 48.8, 48.3, 45.0, 45.0, 47.5, 43.7, 35.9, 35.6, 36.9, 38.6, 45.7, 40.7, 44.4, 39.0, 48.4, 50.3, 48.2, 42.0, 45.9, 46.6, 46.8, 43.0, 45.6, 50.1, 47.1, 41.4],
      zero: [28.5, 28.9, 27.6, 28.6, 20.8, 27.4, 24.4, 26.0, 22.5, 24.4, 27.0, 26.5, 30.8, 29.2, 27.4, 27.2, 29.2, 28.7, 22.7, 25.8, 18.2, 18.7, 17.2, 17.7, 17.9, 16.0, 15.9, 18.5, 13.7, 16.7, 14.8, 14.4, 16.6, 13.9, 3.7, 5.1, 3.9, 5.1, 2.5, 2.9, 4.0, 1.8, 2.4, 2.0, 2.6, 2.4, 3.9, 3.8, 1.5, 4.0, 4.5, 4.5, 4.7, 3.3, 3.7, 1.4, 3.4, 2.8, 3.3, 3.5, 4.1, 3.3, 3.8, 4.0, 2.2, 2.1, 4.1, 2.8, 3.9, 2.6, 18.3, 20.9, 19.1, 17.7, 1.7, 3.7, 3.2, 2.2, 2.4, 3.8, 1.5, 4.0, 1.3, 2.3, 2.5, 2.1, 2.2, 1.8, 0.9, 2.7],
    },
    intents: [
      { intent: "장르", searches: 12256, success: 44.7, zero: 7.9, clickRate: 48.5, firstClick: 1.92, reformulate: 38.4 },
      { intent: "상권", searches: 7841, success: 45.6, zero: 13.6, clickRate: 52.7, firstClick: 1.87, reformulate: 37.4 },
      { intent: "공간명", searches: 5802, success: 25.7, zero: 2.7, clickRate: 26.4, firstClick: 1.92, reformulate: 52.8 },
      { intent: "행사 유형", searches: 4828, success: 29.3, zero: 6.5, clickRate: 31.3, firstClick: 2.03, reformulate: 49.2 },
      { intent: "해석 못 함", searches: 1006, success: 0.0, zero: 100.0, clickRate: null, firstClick: null, reformulate: 60.7 },
    ],
  },
];

export default function Demo() {
  return (
    <div className="h-[34rem] w-full max-w-[1100px] overflow-y-auto rounded-2xl border border-line bg-bg p-4">
      <SearchQuality periods={PERIODS} defaultPeriod="28" />
    </div>
  );
}
