import type { ItemMeta } from "../../types";

export const meta: ItemMeta = {
  title: "세그먼트 컨트롤",
  summary: "2~5개 선택지 중 하나를 고르는 붙은 버튼 묶음. 선택 표시가 미끄러지며 옮겨 간다.",
  category: "components",
  group: "input",
  order: 3,
  tags: ["입력", "기본"],
  added: "2026-10-31",
  rules: {
    do: [
      "기간(일·주·월)이나 보기 방식(목록·지도)처럼 같은 내용을 다르게 보여줄 때 쓴다.",
      "선택지 라벨은 한두 단어로 짧게 맞춰 칸 폭이 고르게 보이게 한다.",
    ],
    dont: [
      "선택지가 6개를 넘거나 라벨이 길면 쓰지 않는다. 드롭다운이나 탭을 쓴다.",
      "서로 다른 페이지로 이동하는 메뉴로 쓰지 않는다. 탭이나 내비게이션을 쓴다.",
    ],
  },
};
