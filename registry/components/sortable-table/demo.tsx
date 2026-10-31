"use client";
import { SortableTable } from "./SortableTable";

const pct = (v: number) => `${v.toFixed(1)}%`;

export default function Demo() {
  return (
    <div className="w-full max-w-[760px] rounded-2xl border border-line bg-surface p-4">
      <SortableTable
        caption="검색어 · 검색 20건 이상"
        rowKey="query"
        defaultSort={{ key: "zero", dir: "desc" }}
        columns={[
          { key: "query", label: "검색어" },
          { key: "intent", label: "의도" },
          { key: "searches", label: "검색 수", align: "right" },
          { key: "zero", label: "결과 0건", align: "right", format: pct },
          { key: "success", label: "성공률", align: "right", format: pct },
          { key: "reformulate", label: "재검색률", align: "right", format: pct },
          { key: "evalDate", label: "평가 편입일", align: "right" },
        ]}
        rows={[
          { query: "신촌·마포", intent: "상권", searches: 73, zero: 23.3, success: 26.0, reformulate: 50.7, evalDate: "8/24" },
          { query: "홍대·합정·연남", intent: "상권", searches: 327, zero: 20.8, success: 45.6, reformulate: 40.7, evalDate: "8/24" },
          { query: "강남·역삼·논현", intent: "상권", searches: 232, zero: 17.2, success: 43.1, reformulate: 43.1, evalDate: "8/24" },
          { query: "이태원·한남", intent: "상권", searches: 270, zero: 15.6, success: 48.5, reformulate: 35.2, evalDate: "8/24" },
          { query: "성수·건대", intent: "상권", searches: 168, zero: 11.9, success: 51.2, reformulate: 28.6, evalDate: "8/24" },
          { query: "hiphop", intent: "장르", searches: 175, zero: 0, success: 54.3, reformulate: 34.3, evalDate: "8/24" },
          { query: "k-pop/팝", intent: "장르", searches: 212, zero: 0, success: 50.9, reformulate: 32.1, evalDate: "8/24" },
          { query: "lunar", intent: "공간명", searches: 44, zero: 0, success: 56.8, reformulate: 20.5, evalDate: "8/24" },
          { query: "압구정·청담", intent: "상권", searches: 140, zero: 17.1, success: 49.3, reformulate: 36.4, evalDate: "8/24" },
        ]}
      />
    </div>
  );
}
