import type { ItemMeta } from "../../types";

export const meta: ItemMeta = {
  title: "세그먼트 프로그레스",
  summary: "정해진 단계 수를 차례로 채우는 진행 표시.",
  category: "components",
  group: "status",
  order: 3,
  tags: ["진행", "애니메이션"],
  added: "2026-10-31",
  rules: {"do": ["스토리·온보딩처럼 단계 수가 고정되고 자동으로 넘어가는 흐름에 쓴다.", "현재 단계가 무엇인지 화면 다른 곳(제목·이미지)에서도 함께 보여준다."], "dont": ["끝을 알 수 없는 로딩에 쓰지 않는다. 스켈레톤이나 스피너를 쓴다.", "단계가 7개를 넘으면 칸이 너무 얇아진다. 숫자 진행(3/12)으로 바꾼다."]},
};
