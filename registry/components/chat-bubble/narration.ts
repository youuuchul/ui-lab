export type Segment = { type: "dialogue" | "narration"; text: string };

function push(list: Segment[], type: Segment["type"], text: string) {
  const t = text.trim();
  if (t) list.push({ type, text: t });
}

/**
 * `*지문*` 구간을 narration으로, 나머지를 dialogue로 나눈다.
 * 닫히지 않은 `*`는 allowOpenNarration이면 끝까지 지문으로, 아니면 전체를 대사로 본다.
 */
export function parseNarration(content: string, allowOpenNarration = false): Segment[] {
  const list: Segment[] = [];
  let cursor = 0;
  while (cursor < content.length) {
    const open = content.indexOf("*", cursor);
    if (open === -1) {
      push(list, "dialogue", content.slice(cursor));
      break;
    }
    const close = content.indexOf("*", open + 1);
    if (close === -1) {
      if (!allowOpenNarration) return content.trim() ? [{ type: "dialogue", text: content.trim() }] : [];
      push(list, "dialogue", content.slice(cursor, open));
      push(list, "narration", content.slice(open + 1));
      return list;
    }
    const narration = content.slice(open + 1, close);
    if (!narration.trim()) return content.trim() ? [{ type: "dialogue", text: content.trim() }] : [];
    push(list, "dialogue", content.slice(cursor, open));
    push(list, "narration", narration);
    cursor = close + 1;
  }
  return list;
}
