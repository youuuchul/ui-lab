import type { ItemMeta } from "../../types";

export const meta: ItemMeta = {
  title: "탭",
  summary: "같은 화면 안에서 관련 내용을 나눠 바꿔 보는 탭. 밑줄이 선택을 표시한다.",
  category: "components",
  group: "navigation",
  order: 1,
  tags: ["탐색", "기본"],
  added: "2026-10-31",
  rules: {
    do: [
      "상품의 상세 정보·리뷰·문의처럼 한 대상에 속한 내용을 나눌 때 쓴다.",
      "탭 라벨에 리뷰 수 같은 짧은 숫자를 붙여 들어가기 전에 양을 알려준다.",
    ],
    dont: [
      "탭을 바꿀 때마다 입력 중이던 내용이 사라지게 만들지 않는다. 패널은 숨김 처리라 상태가 남는다.",
      "탭이 화면 폭을 넘을 만큼 많이 두지 않는다. 5개를 넘으면 구조를 다시 나눈다.",
    ],
  },
};
