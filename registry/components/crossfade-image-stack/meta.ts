import type { ItemMeta } from "../../types";

export const meta: ItemMeta = {
  title: "크로스페이드 이미지 스택",
  summary: "표정처럼 자주 바뀌는 이미지를 깜빡임 없이 바꾸는 겹침 스택.",
  category: "components",
  group: "media",
  order: 1,
  tags: ["이미지", "캐릭터"],
  added: "2026-10-31",
  source: {"project": "HeartTable AI", "url": "https://heart-table-ai.vercel.app"},
  rules: {"do": ["캐릭터 표정·상품 색상처럼 같은 틀에서 이미지만 바뀌는 곳에 쓴다.", "변형은 4~6장 안으로 묶는다. 처음에 모두 받는다."], "dont": ["수십 장 갤러리에 쓰지 않는다. 처음 로드가 무거워진다.", "크기가 다른 이미지를 섞지 않는다. 겹칠 때 어긋난다."]},
};
