import type { ItemMeta } from "../../types";

export const meta: ItemMeta = {
  title: "검색 품질 대시보드",
  summary: "검색 성공률·결과 0건 비율 같은 검색 품질 지표를 기간별 스코어보드, 일별 추이, 의도 유형별 표로 보는 화면.",
  category: "blocks",
  blockGroup: "dashboard",
  order: 6,
  tall: true,
  tags: ["대시보드", "검색", "품질"],
  added: "2026-11-01",
  source: { project: "PlaceWave", url: "https://placewave-analytics.vercel.app" },
  uses: ["components/segmented-control", "components/kpi-scoreboard", "components/trend-chart", "components/sortable-table"],
  rules: {
    do: [
      "검색 지표의 분모는 서버 검색 요청으로 통일한다. 수집 누락이 있는 클라이언트 이벤트는 분모로 쓰지 않는다.",
      "결과 0건 비율이 튄 날짜를 추이에서 찾고, 의도 유형별 표에서 어느 유형이 원인인지 정렬로 확인한다.",
    ],
    dont: [
      "실험 구간 표식이나 실험 판정을 이 화면에 섞지 않는다. 실험 맥락은 보고서에 둔다.",
      "결과 클릭률만 단독으로 보지 않는다. 결과 0건이 줄면 분모가 바뀌어 클릭률이 내려가 보일 수 있다.",
    ],
  },
};
