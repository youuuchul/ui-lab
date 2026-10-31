import type { ItemMeta } from "../../types";

export const meta: ItemMeta = {
  title: "마스크 텍스트 등장",
  summary: "글자를 마스크 아래에서 올리고 위로 밀어내는 텍스트 전환.",
  category: "components",
  group: "motion",
  order: 1,
  tags: ["타이포", "전환"],
  added: "2026-10-31",
  source: {"project": "portfolio-site"},
  rules: {"do": ["화면 전환 때 제목·정보 패널을 줄 단위로 바꿔 시선을 이끈다.", "부모에서 hidden/show/out 상태를 한 번에 내려 순서를 맞춘다."], "dont": ["본문 문단 전체에 쓰지 않는다. 읽기 전에 기다리게 된다.", "같은 화면에서 여러 묶음을 동시에 올리지 않는다."]},
};
