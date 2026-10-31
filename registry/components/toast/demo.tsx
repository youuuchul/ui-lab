"use client";
import { useState } from "react";
import { Toast } from "./Toast";

export default function Demo() {
  const [items, setItems] = useState(["장보기 목록", "주간 회의 메모", "여행 일정"]);
  const [removed, setRemoved] = useState<{ name: string; index: number } | null>(null);
  const [open, setOpen] = useState(false);
  const [tone, setTone] = useState<"default" | "error">("default");

  const remove = (i: number) => {
    setRemoved({ name: items[i], index: i });
    setItems((l) => l.filter((_, j) => j !== i));
    setTone("default");
    setOpen(true);
  };
  const fail = () => {
    setTone("error");
    setOpen(true);
  };
  const undo = () => {
    if (!removed) return;
    setItems((l) => [...l.slice(0, removed.index), removed.name, ...l.slice(removed.index)]);
  };

  return (
    <div className="relative h-72 w-80 overflow-hidden rounded-card border border-line bg-bg p-4">
      <ul className="flex flex-col gap-2">
        {items.map((name, i) => (
          <li key={name} className="flex items-center justify-between min-h-10 rounded-xl bg-fg/5 py-0 pl-3 pr-1 text-sm">
            {name}
            <button type="button" onClick={() => remove(i)} className="h-10 min-w-10 rounded-lg px-3 text-xs text-muted hover:bg-fg/10 hover:text-fg focus-visible:outline-2 focus-visible:outline-accent">
              삭제
            </button>
          </li>
        ))}
        {items.length === 0 && <li className="py-6 text-center text-sm text-muted">메모가 없어요</li>}
      </ul>
      <button type="button" onClick={fail} className="mt-3 h-10 rounded-lg bg-fg/10 px-4 text-sm font-medium text-fg hover:bg-fg/15 focus-visible:outline-2 focus-visible:outline-accent">
        변경 사항 저장
      </button>
      <Toast
        scope="parent"
        open={open}
        onOpenChange={setOpen}
        tone={tone}
        message={tone === "error" ? "저장하지 못했어요. 네트워크를 확인해 주세요" : `'${removed?.name ?? ""}'을 삭제했어요`}
        action={tone === "error" ? undefined : { label: "실행 취소", onClick: undo }}
        duration={4000}
      />
    </div>
  );
}
