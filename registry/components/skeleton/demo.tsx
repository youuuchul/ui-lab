"use client";
import { useEffect, useState } from "react";
import { Skeleton } from "./Skeleton";

const PEOPLE = [
  { name: "김하늘", role: "프로덕트 디자이너", initial: "하" },
  { name: "이도윤", role: "프런트엔드 개발자", initial: "도" },
];

export default function Demo() {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1800);
    return () => clearTimeout(t);
  }, []);
  return (
    <div aria-busy={loading} className="flex w-80 flex-col gap-3 rounded-card border border-line bg-bg p-4">
      {PEOPLE.map((p) => (
        <div key={p.name} className="flex items-center gap-3">
          {loading ? (
            <>
              <Skeleton shape="circle" className="h-10 w-10 shrink-0" />
              <Skeleton shape="text" lines={2} className="flex-1" />
            </>
          ) : (
            <>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/20 text-sm font-semibold text-accent">{p.initial}</span>
              <div className="flex-1">
                <p className="text-sm font-medium">{p.name}</p>
                <p className="text-xs text-muted">{p.role}</p>
              </div>
            </>
          )}
        </div>
      ))}
      {loading ? <Skeleton className="h-20 w-full" /> : <p className="rounded-xl bg-fg/5 p-3 text-sm leading-relaxed text-fg/80">이번 주 회의는 목요일 오후 2시로 옮겼어요.</p>}
    </div>
  );
}
