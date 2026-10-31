import type { ItemMeta } from "../../types";

export const meta: ItemMeta = {
  title: "생키 다이어그램",
  alias: "저니 플로우",
  summary: "세션이 화면에서 화면으로 넘어가는 흐름을 열별 노드와 띠 두께로 보여주는 생키 다이어그램.",
  category: "components",
  group: "data",
  order: 4,
  tall: true,
  tags: ["생키", "Sankey", "저니", "SVG"],
  added: "2026-11-01",
  source: { project: "PlaceWave", url: "https://placewave-analytics.vercel.app" },
  rules: {
    do: [
      "랜딩 뒤 몇 번째 화면에서 어디로 빠지는지(이탈 노드) 볼 때 쓴다. 열은 3~5개가 읽힌다.",
      "열마다 세션 상위 화면만 이름을 두고 나머지는 기타로 묶는다.",
    ],
    dont: [
      "전환율 한 숫자를 보여주려고 쓰지 않는다. 그건 퍼널 표나 스코어보드가 낫다.",
      "색 묶음을 6개보다 많이 만들지 않는다. 노드 이름이 1차 구분이다.",
    ],
  },
};
