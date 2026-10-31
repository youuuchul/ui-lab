import type { ItemMeta } from "../../types";

export const meta: ItemMeta = {
  title: "KPI 스코어보드",
  summary: "핵심 지표를 값·직전 기간 대비 증감·분모 한 줄로 한 줄에 늘어놓는 스코어보드.",
  category: "components",
  group: "data",
  order: 1,
  tags: ["대시보드", "지표", "KPI"],
  added: "2026-11-01",
  source: { project: "PlaceWave", url: "https://placewave-analytics.vercel.app" },
  rules: {
    do: [
      "탭이나 화면 맨 위에 그 화면이 답하는 지표만 4~6칸 둔다. 첫 칸은 북극성 지표다.",
      "비율의 증감은 %p, 건수·금액은 %로 적고, 낮을수록 좋은 지표(결과 0건 비율, 재검색률)는 good: \"down\"으로 색을 뒤집는다.",
      "값 해석에 분모·기준일이 필요한 칸에만 보조 줄(sub)을 단다.",
    ],
    dont: [
      "설명 문장을 칸에 넣지 않는다. 라벨·단위·분모 한 줄로 푼다.",
      "직전 기간이 데이터 범위 밖이면 0으로 채우지 않는다. delta를 빼거나 null(—)로 둔다.",
    ],
  },
};
