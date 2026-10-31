import type { ItemMeta } from "../../types";

export const meta: ItemMeta = {
  title: "원형 카운트다운",
  summary: "남은 시간을 둘레 길이로 보여주는 원형 타이머.",
  category: "components",
  group: "status",
  order: 4,
  tags: ["타이머", "게임"],
  added: "2026-10-31",
  source: {"project": "HeartTable AI", "url": "https://hearttable.shop"},
  rules: {"do": ["라운드·인증번호처럼 시간이 지나면 행동이 막히는 곳에 쓴다.", "경고 구간(기본 20%)에 들어가면 색과 깜빡임으로 한 번 더 알린다."], "dont": ["남은 시간이 행동에 영향이 없으면 쓰지 않는다. 긴장만 높인다.", "1초보다 짧은 간격으로 progress를 바꾸지 않는다. 전환(0.7초)과 겹쳐 떨린다."]},
};
