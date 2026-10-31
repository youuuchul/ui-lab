import type { ItemMeta } from "../../types";

export const meta: ItemMeta = {
  title: "아코디언",
  summary: "제목을 눌러 내용을 펼치고 접는 목록. 자주 묻는 질문처럼 훑어보고 골라 읽는 내용에 쓴다.",
  category: "components",
  group: "navigation",
  order: 2,
  tags: ["탐색", "기본"],
  added: "2026-10-31",
  rules: {
    do: [
      "자주 묻는 질문, 약관 세부 조항처럼 제목만 보고 필요한 것만 여는 내용에 쓴다.",
      "제목은 질문이나 항목 이름으로 써서 펼치지 않아도 안에 무엇이 있는지 알 수 있게 한다.",
    ],
    dont: [
      "모두가 꼭 읽어야 하는 정보(가격, 주의 사항)를 접어 두지 않는다.",
      "아코디언 안에 또 아코디언을 넣지 않는다. 깊이가 생기면 별도 화면으로 나눈다.",
    ],
  },
};
