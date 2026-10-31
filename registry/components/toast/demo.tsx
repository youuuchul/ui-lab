"use client";
import { useState } from "react";
import { Toast } from "./Toast";

export default function Demo() {
  const [items, setItems] = useState(["장보기 목록", "주간 회의 메모", "여행 일정"]);
  const [removed, setRemoved] = useState<{ name: string; index: number } | null>(null);
  const [open, setOpen] = useState(false);

  const remove = (i: number) => {
    setRemoved({ name: items[i], index: i });
    setItems((l) => l.filter((_, j) => j !== i));
    setOpen(true);
  };
  const undo = () => {
    if (!removed) return;
    setItems((l) => [...l.slice(0, removed.index), removed.name, ...l.slice(removed.index)]);
  };

  return (
    <div className="relative h-64 w-80 overflow-hidden rounded-card border border-line bg-bg p-4">
      <ul className="flex flex-col gap-2">
        {items.map((name, i) => (
          <li key={name} className="flex items-center justify-between rounded-xl bg-fg/5 px-3 py-2.5 text-sm">
            {name}
            <button type="button" onClick={() => remove(i)} className="rounded-md px-2 py-0.5 text-xs text-muted hover:bg-fg/10 hover:text-fg focus-visible:outline-2 focus-visible:outline-accent">
              삭제
            </button>
          </li>
        ))}
        {items.length === 0 && <li className="py-6 text-center text-sm text-muted">메모가 없어요</li>}
      </ul>
      <Toast
        scope="parent"
        open={open}
        onOpenChange={setOpen}
        message={`'${removed?.name ?? ""}'을 삭제했어요`}
        action={{ label: "실행 취소", onClick: undo }}
        duration={4000}
      />
    </div>
  );
}
