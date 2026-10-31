import type { ItemMeta } from "../../types";

export const meta: ItemMeta = {
  title: "퍼널 분석 대시보드",
  summary: "전환 스코어보드 → 단계 전환율 추이 → 세그먼트별 퍼널 → 경로 생키 순서로 이탈 지점을 좁혀 가는 화면.",
  category: "blocks",
  blockGroup: "dashboard",
  order: 5,
  tall: true,
  tags: ["대시보드", "퍼널", "저니"],
  added: "2026-11-01",
  source: { project: "PlaceWave", url: "https://placewave-analytics.vercel.app" },
  uses: ["components/kpi-scoreboard", "components/trend-chart", "components/funnel-heatmap", "components/path-sankey"],
  rules: {
    do: [
      "어느 단계가(스코어보드), 언제부터(추이), 어느 집단에서(세그먼트 표), 어떤 경로로(생키) 나빠졌는지 위에서 아래로 답하게 둔다.",
      "단계는 같은 날 누적 조건으로 세어 뒤 단계가 앞 단계보다 커지지 않게 한다.",
    ],
    dont: [
      "기간 고유 사람 수 대신 일별 사람 수를 더한 값을 '명'으로 쓰지 않는다.",
      "생키를 첫 화면 맨 위에 두지 않는다. 숫자로 지점을 좁힌 뒤 드릴다운으로 쓴다.",
    ],
  },
};
