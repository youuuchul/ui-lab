"use client";
import { useState } from "react";
import { Toggle } from "./Toggle";

export default function Demo() {
  const [push, setPush] = useState(true);
  return (
    <div className="w-80 divide-y divide-line rounded-card border border-line bg-bg px-4">
      <Toggle className="py-3.5" label="푸시 알림" description={push ? "새 댓글과 답글을 바로 알려요" : "알림을 받지 않아요"} checked={push} onChange={setPush} />
      <Toggle className="py-3.5" label="이메일 소식" description="한 달에 한 번" />
      <Toggle className="py-3.5" label="야간 방해 금지" description="푸시 알림을 켜야 쓸 수 있어요" disabled={!push} defaultChecked />
    </div>
  );
}
