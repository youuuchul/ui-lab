"use client";
import { useState } from "react";
import { Button } from "./Button";

const Plus = (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export default function Demo() {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const publish = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
    }, 1200);
  };
  return (
    <div className="flex w-[22rem] flex-col gap-5">
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant="secondary" leadingIcon={Plus}>태그 추가</Button>
        <Button size="sm" variant="ghost">미리보기</Button>
        <Button size="sm" variant="danger">삭제</Button>
      </div>
      <div className="rounded-card border border-line bg-bg p-4">
        <p className="text-sm text-fg/80">{saved ? "게시했어요" : "작성 중인 글 1개"}</p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" disabled={saving}>취소</Button>
          <Button variant="secondary" disabled={saving}>임시 저장</Button>
          <Button loading={saving} disabled={saved} onClick={publish}>게시</Button>
        </div>
      </div>
    </div>
  );
}
