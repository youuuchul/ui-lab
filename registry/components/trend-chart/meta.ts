import type { ItemMeta } from "../../types";

export const meta: ItemMeta = {
  title: "추이 선 차트",
  summary: "구간별 값을 선으로 잇고 전기를 점선으로 겹치는, 키보드로도 값을 읽는 추이 차트.",
  category: "components",
  group: "data",
  order: 2,
  tags: ["차트", "대시보드", "SVG"],
  added: "2026-11-01",
  source: { project: "PlaceWave", url: "https://placewave-analytics.vercel.app" },
  rules: {
    do: [
      "같은 단위의 지표 1~2개와 직전 동일 길이 기간(점선)을 함께 그린다.",
      "기간이 길면 입자를 키운다(14일 이하 일별, 그 이상 주별). 버킷 범위는 라벨에 \"9/1~9/7\"처럼 적는다.",
    ],
    dont: [
      "단위가 다른 지표를 한 차트에 겹치지 않는다. 이중 축 대신 차트를 나눈다.",
      "값이 없는 구간을 0으로 채우지 않는다. null로 두면 선이 끊긴다.",
    ],
  },
};
