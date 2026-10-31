"use client";
import { useState } from "react";
import { LoadingOverlay } from "./LoadingOverlay";

type Phase = "idle" | "loading" | "slow";

export default function Demo() {
  const [phase, setPhase] = useState<Phase>("loading");
  return (
    <div className="relative flex h-56 w-80 items-center justify-center overflow-hidden rounded-2xl border border-line bg-bg">
      <button onClick={() => setPhase("loading")} className="min-h-10 rounded-full bg-fg/10 px-4 text-sm hover:bg-fg/20">
        다시 불러오기
      </button>
      <LoadingOverlay
        active={phase === "loading"}
        message="불러오는 중"
        timeoutMs={2500}
        onTimeout={() => setPhase("slow")}
        onCancel={() => setPhase("idle")}
        scope="parent"
      />
      {phase === "slow" && (
        <div role="alert" className="absolute inset-0 z-50 flex items-center justify-center bg-bg/90 px-6 backdrop-blur-sm">
          <div className="flex w-full max-w-sm items-center gap-3 rounded-2xl border border-line bg-surface p-6">
            <p className="min-w-0 flex-1 text-sm font-semibold text-fg">응답이 늦어요</p>
            <button onClick={() => setPhase("loading")} className="min-h-10 shrink-0 rounded-lg bg-accent px-4 text-sm font-semibold text-white active:scale-[0.96]">
              다시 시도
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
