import type { ItemMeta } from "../../types";

export const meta: ItemMeta = {
  title: "채팅 입력창",
  summary: "추천 답변, 감싸기 버튼, 자동 높이를 갖춘 채팅 입력창.",
  category: "components",
  group: "chat",
  order: 2,
  tags: ["채팅", "입력", "IME"],
  added: "2026-10-31",
  source: {"project": "HeartTable AI", "url": "https://hearttable.shop"},
  rules: {"do": ["첫 메시지를 막막해하는 사용자에게 추천 답변을 준다. 고른 뒤 고칠 수 있게 입력창에만 채운다.", "한글 사용자가 있으면 IME 조합 중 Enter 처리를 그대로 둔다."], "dont": ["추천 답변을 고르자마자 보내지 않는다.", "모바일에서 Enter 전송을 강제하지 않는다. 줄바꿈이 막힌다."]},
};
