import type { ItemMeta } from "../../types";

export const meta: ItemMeta = {
  title: "캐릭터 대화 화면",
  summary: "캐릭터와 제한 시간 안에 대화하는 라운드 화면.",
  category: "blocks",
  order: 1,
  tags: ["채팅", "게임", "캐릭터"],
  added: "2026-10-31",
  source: {"project": "HeartTable AI", "url": "https://heart-table-ai.vercel.app"},
  uses: ["components/crossfade-image-stack", "components/countdown-ring", "components/chat-bubble", "components/chat-input"],
  tall: true,
};
