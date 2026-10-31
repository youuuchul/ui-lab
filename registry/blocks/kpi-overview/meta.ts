import type { ItemMeta } from "../../types";

export const meta: ItemMeta = {
  title: "KPI 개요 대시보드",
  summary: "기간을 바꾸면 핵심 지표 스코어보드와 북극성 지표 추이·분해 타일이 함께 바뀌는 개요 화면.",
  category: "blocks",
  blockGroup: "dashboard",
  order: 4,
  tall: true,
  tags: ["대시보드", "KPI", "추이"],
  added: "2026-11-01",
  source: { project: "PlaceWave", url: "https://placewave-analytics.vercel.app" },
  uses: ["components/segmented-control", "components/kpi-scoreboard", "components/trend-chart"],
  rules: {
    do: [
      "스코어보드 첫 칸과 첫 추이 카드를 북극성 지표로 맞춘다. 추이 카드 순서는 스코어보드 순서를 따른다.",
      "기간·필터와 무관한 기준일 현황(누적 회원 등)은 스코어보드와 다른 줄에 둔다.",
    ],
    dont: [
      "스코어보드에 없는 지표의 추이 카드를 추가하지 않는다.",
      "필터가 걸려도 값이 안 바뀌는 칸을 남겨 두지 않는다. 축이 없는 지표는 숨긴다.",
    ],
  },
};
