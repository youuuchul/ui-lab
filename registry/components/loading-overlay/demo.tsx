"use client";
import { useState } from "react";
import { LoadingOverlay } from "./LoadingOverlay";

export default function Demo() {
  const [active, setActive] = useState(true);
  return (
    <div className="relative flex h-56 w-80 items-center justify-center overflow-hidden rounded-2xl border border-line bg-bg">
      <button onClick={() => setActive(true)} className="rounded-full bg-fg/10 px-4 py-2 text-sm hover:bg-fg/20">
        다시 불러오기
      </button>
      <LoadingOverlay active={active} message="불러오는 중" timeoutMs={2500} onTimeout={() => setActive(false)} scope="parent" />
    </div>
  );
}
