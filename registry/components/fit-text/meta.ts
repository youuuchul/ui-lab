import type { ItemMeta } from "../../types";

export const meta: ItemMeta = {
  title: "폭 맞춤 타이포",
  summary: "큰 제목 줄을 컨테이너 폭에 꼭 맞추는 훅.",
  category: "components",
  group: "motion",
  order: 2,
  tags: ["타이포", "반응형"],
  added: "2026-10-31",
  source: { project: "웹 포트폴리오", url: "https://youuuchul.github.io/" },
  rules: {"do": ["포스터형 첫 화면처럼 제목이 레이아웃 자체인 곳에 쓴다.", "좁은 화면용 비율(data-fit-m)을 따로 준다."], "dont": ["본문·버튼 글자에 쓰지 않는다. 크기 체계가 무너진다.", "패딩이 있는 박스에 ref를 바로 붙이지 않는다. 안쪽 래퍼에 붙인다."]},
};
