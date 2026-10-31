import type { ItemMeta } from "../../types";

export const meta: ItemMeta = {
  title: "은하수 글로브",
  summary: "기록 하나가 별빛 하나로 쌓이는 스노우글로브. 은하수 밀도층과 이름 있는 별빛, 내 별빛을 한 구 안에 겹쳐 그린다.",
  category: "components",
  group: "motion",
  order: 3,
  tags: ["모션", "캔버스", "데이터 시각화"],
  added: "2026-10-31",
  source: { project: "PetGlobe", url: "https://petglobe.app" },
  tall: true,
  rules: {
    do: [
      "쌓인 기록의 양을 숫자 대신 밀도로 보여줄 때 쓴다.",
      "별빛 위치는 기록 id에서 결정론적으로 만든다(lightFromMemory). 다시 열어도 같은 자리에 있어야 한다.",
      "새 기록이 생긴 순간에만 lightUp 연출을 재생한다.",
    ],
    dont: [
      "정확한 수치 비교가 필요한 화면에 쓰지 않는다. 별빛 개수는 읽히지 않는다.",
      "한 화면에 글로브를 여러 개 띄우지 않는다. 캔버스 층이 여러 장이라 비용이 크다.",
      "무지갯빛을 강조색처럼 넓게 쓰지 않는다. 저채도 오팔이 은은하게 섞이는 정도까지만.",
    ],
  },
};
