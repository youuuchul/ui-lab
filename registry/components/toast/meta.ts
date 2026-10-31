import type { ItemMeta } from "../../types";

export const meta: ItemMeta = {
  title: "토스트",
  summary: "동작 결과를 화면 하단에 잠깐 알리고 스스로 사라지는 메시지. 실행 취소 버튼을 붙일 수 있다.",
  category: "components",
  group: "overlay",
  order: 1,
  tags: ["오버레이", "기본", "피드백"],
  added: "2026-10-31",
  rules: {
    do: [
      "삭제·보관처럼 되돌릴 수 있는 동작 뒤에 결과와 '실행 취소'를 함께 띄운다.",
      "메시지는 '삭제했어요'처럼 일어난 일을 한 문장으로 쓴다.",
    ],
    dont: [
      "결제 실패처럼 사용자가 꼭 처리해야 하는 오류를 토스트로만 알리지 않는다. 화면 안에 남는 안내를 쓴다.",
      "토스트를 여러 개 겹쳐 띄우지 않는다. 새 메시지가 오면 이전 것을 바꾼다.",
    ],
  },
};
