import type { ItemMeta } from "../../types";

export const meta: ItemMeta = {
  title: "원형 3D 캐러셀",
  summary: "항목을 원 둘레에 세우고 가운데가 선택이 되는 캐러셀.",
  category: "components",
  group: "navigation",
  order: 3,
  tags: ["캐러셀", "3D", "제스처"],
  added: "2026-10-31",
  source: {"project": "portfolio-site"},
  rules: {"do": ["서비스·작품처럼 5~10개를 한 번에 훑고 하나를 고르는 곳에 쓴다.", "끌기·휠·키보드·버튼을 모두 열어 둔다."], "dont": ["목록이 길어 찾기가 중요한 곳에는 쓰지 않는다. 검색·그리드를 쓴다.", "카드 안에 다시 가로 스크롤을 넣지 않는다. 제스처가 겹친다."]},
};
