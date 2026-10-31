import type { ItemMeta } from "../../types";

export const meta: ItemMeta = {
  title: "정렬 표",
  summary: "열 머리를 눌러 정렬하는 숫자 위주 데이터 표.",
  category: "components",
  group: "data",
  order: 5,
  tall: true,
  tags: ["표", "정렬", "대시보드"],
  added: "2026-11-01",
  source: { project: "PlaceWave", url: "https://placewave-analytics.vercel.app" },
  rules: {
    do: [
      "의도 유형별·검색어별처럼 같은 지표를 대상마다 비교하는 표에 쓴다. 기본 정렬은 그 표가 답하는 질문의 열로 둔다.",
      "값이 없는 칸은 null로 넘긴다. —로 보이고 어느 방향으로 정렬해도 맨 아래에 놓인다.",
    ],
    dont: [
      "행이 수백 개면 그대로 쓰지 않는다. 상위 N개와 더 보기를 쓰는 쪽에서 나눈다.",
      "숫자를 미리 문자열로 만들어 넘기지 않는다. 문자열 정렬이 되어 9가 10보다 위로 간다.",
    ],
  },
};
