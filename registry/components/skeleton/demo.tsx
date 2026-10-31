"use client";
import { useEffect, useState } from "react";
import { Skeleton } from "./Skeleton";

const PEOPLE = [
  { name: "김하늘", role: "프로덕트 디자이너", initial: "하" },
  { name: "이도윤", role: "프런트엔드 개발자", initial: "도" },
];

/** 로딩(1.6초) → 내용(2.4초)을 반복한다. 두 상태의 크기가 같아 전환 때 레이아웃이 밀리지 않는다 */
export default function Demo() {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading((l) => !l), loading ? 1600 : 2400);
    return () => clearTimeout(t);
  }, [loading]);

  return (
    <div aria-busy={loading} className="flex w-80 flex-col gap-3 rounded-card border border-line bg-bg p-4">
      {PEOPLE.map((p) => (
        <div key={p.name} className="flex h-10 items-center gap-3">
          {loading ? (
            <>
              <Skeleton shape="circle" className="h-10 w-10 shrink-0" />
              <div className="flex flex-1 flex-col gap-1.5">
                <Skeleton className="h-3.5 w-16 rounded-full" />
                <Skeleton className="h-3 w-28 rounded-full" />
              </div>
            </>
          ) : (
            <>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/20 text-sm font-semibold text-accent">{p.initial}</span>
              <div className="flex-1">
                <p className="text-sm leading-5 font-medium">{p.name}</p>
                <p className="text-xs leading-4 text-muted">{p.role}</p>
              </div>
            </>
          )}
        </div>
      ))}
      {loading ? (
        <Skeleton className="h-12 w-full" />
      ) : (
        <p className="flex h-12 items-center rounded-xl bg-fg/5 px-3 text-sm text-fg/80">이번 주 회의는 목요일 오후 2시로 옮겼어요.</p>
      )}
    </div>
  );
}
