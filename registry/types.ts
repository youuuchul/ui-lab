export type Category = "components" | "blocks";

export type Group = "input" | "navigation" | "status" | "overlay" | "chat" | "media" | "motion";

export const GROUPS: { key: Group; label: string }[] = [
  { key: "input", label: "입력" },
  { key: "navigation", label: "탐색" },
  { key: "status", label: "상태" },
  { key: "overlay", label: "오버레이" },
  { key: "chat", label: "채팅" },
  { key: "media", label: "미디어" },
  { key: "motion", label: "모션" },
];

export interface ItemMeta {
  title: string;
  /** 상세 상단 한 줄 설명 */
  summary: string;
  category: Category;
  /** 컴포넌트만. 사이드바 분류 */
  group?: Group;
  /** 같은 분류 안 정렬 (작을수록 위) */
  order?: number;
  tags: string[];
  added: string;
  source?: { project: string; url?: string };
  /** 사용 기준 */
  rules?: { do: string[]; dont: string[] };
  /** 적용 사례만. 쓰인 컴포넌트 slug (예: "components/chat-bubble") */
  uses?: string[];
  /** 갤러리 미리보기 영역 높이를 키울 때 */
  tall?: boolean;
}
