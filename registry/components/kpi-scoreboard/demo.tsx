import { KpiScoreboard } from "./KpiScoreboard";

export default function Demo() {
  return (
    <div className="w-full max-w-[1000px]">
      <KpiScoreboard
        caption="검색 · 직전 28일 대비"
        className="grid-cols-2 @xl:grid-cols-3 @4xl:grid-cols-6"
        items={[
          { label: "검색 이용자", value: "4,872", unit: "명", delta: { value: -3.2, unit: "%" } },
          { label: "검색 성공률", value: "44.0%", delta: { value: -0.7, unit: "%p" }, sub: "결과 클릭률 46.4%" },
          { label: "결과 0건 비율", value: "5.2%", delta: { value: 1.8, unit: "%p", good: "down" }, sub: "검색 9,713건 중" },
          { label: "평균 첫 클릭 순위", value: "1.88", unit: "위", delta: { value: -0.5, unit: "%", good: "down" } },
          { label: "재검색률", value: "39.5%", delta: { value: 0.6, unit: "%p", good: "down" } },
          { label: "검색 세션 신청 전환", value: "4.63%", delta: { value: 0, unit: "%p" }, sub: "검색 세션 5,676 중" },
        ]}
      />
    </div>
  );
}
