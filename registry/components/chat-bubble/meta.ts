import type { ItemMeta } from "../../types";

export const meta: ItemMeta = {
  title: "흐려지는 채팅 말풍선",
  summary: "최신 왕복만 선명하고 위로 밀린 메시지는 흐려지는 말풍선.",
  category: "components",
  group: "chat",
  order: 1,
  tags: ["채팅", "캐릭터"],
  added: "2026-10-31",
  source: {"project": "HeartTable AI", "url": "https://heart-table-ai.vercel.app"},
  rules: {"do": ["배경 이미지 위에 대화를 띄워 장면을 가리지 않아야 할 때 쓴다.", "과거 대화를 스크롤로 읽는 중에는 forceReadable로 흐림을 끈다."], "dont": ["상담·업무 채팅처럼 기록을 다시 읽는 게 중요한 곳에는 쓰지 않는다.", "지문(*...*)을 쓰지 않는 서비스에서는 일반 텍스트로만 넘긴다."]},
};
