"use client";
import { useState } from "react";
import { EvidenceRow } from "./EvidenceRow";

const A = "/ui-lab/assets/murder-mystery";

export default function Demo() {
  const [opened, setOpened] = useState("");
  return (
    <div className="w-80 space-y-2">
      <EvidenceRow
        title="시계 분해 도구"
        meta="서재"
        description="책상 서랍 안쪽, 천에 싸인 채 발견된 정밀 공구 세트. 핀 하나가 비어 있다."
        image={`${A}/clue-watch-tools.webp`}
        onClick={() => setOpened("시계 분해 도구")}
      />
      <EvidenceRow title="익명의 쪽지" meta="현관" description="현관 매트 아래에서 나온 접힌 종이. 글씨가 번져 있다." onClick={() => setOpened("익명의 쪽지")} />
      <p className="h-5 text-center text-xs text-muted">{opened && `${opened} 열림`}</p>
    </div>
  );
}
