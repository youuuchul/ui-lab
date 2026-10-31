import type { ItemMeta } from "../../types";

export const meta: ItemMeta = {
  title: "툴팁",
  summary: "아이콘 버튼에 마우스를 올리거나 포커스하면 이름과 단축키를 짧게 보여주는 말풍선.",
  category: "components",
  group: "overlay",
  order: 2,
  tags: ["오버레이", "기본"],
  added: "2026-10-31",
  rules: {
    do: [
      "라벨 없는 아이콘 버튼에 기능 이름과 단축키를 붙인다.",
      "한 줄, 다섯 단어 안으로 쓴다.",
    ],
    dont: [
      "작업에 꼭 필요한 정보를 툴팁에만 두지 않는다. 터치 기기에서는 보이지 않는다.",
      "툴팁 안에 링크나 버튼을 넣지 않는다. 포인터를 옮기면 닫힌다. 눌러야 하면 팝오버를 쓴다.",
    ],
  },
};
