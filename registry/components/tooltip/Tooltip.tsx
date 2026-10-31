"use client";
import { cloneElement, useEffect, useId, useRef, useState, type ReactElement } from "react";

export interface TooltipProps {
  /** 짧은 설명 한 줄 */
  content: string;
  /** 트리거. 포커스를 받을 수 있는 요소 하나 (button 등) */
  children: ReactElement<{ "aria-describedby"?: string }>;
  side?: "top" | "bottom";
  /** 마우스를 올린 뒤 열릴 때까지(ms). 키보드 포커스는 바로 열린다 */
  delay?: number;
}

export function Tooltip({ content, children, side = "top", delay = 300 }: TooltipProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clear = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };
  const show = (wait: number) => {
    clear();
    timer.current = setTimeout(() => setOpen(true), wait);
  };
  const hide = () => {
    clear();
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && hide();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => clear, []);

  return (
    <span
      className="relative inline-flex"
      onPointerEnter={(e) => e.pointerType === "mouse" && show(delay)}
      onPointerLeave={hide}
      onFocus={(e) => e.target.matches(":focus-visible") && show(0)}
      onBlur={hide}
    >
      {cloneElement(children, { "aria-describedby": id })}
      <span
        id={id}
        role="tooltip"
        className={`pointer-events-none absolute left-1/2 z-50 w-max max-w-56 -translate-x-1/2 rounded-lg border border-line bg-fg px-2.5 py-1.5 text-xs font-medium text-bg shadow-lg shadow-black/30 transition-[opacity,translate] motion-reduce:transition-none ${
          side === "top" ? "bottom-full mb-2" : "top-full mt-2"
        } ${open ? "translate-y-0 opacity-100 duration-150" : `duration-100 ${side === "top" ? "translate-y-1" : "-translate-y-1"} invisible opacity-0`}`}
      >
        {content}
      </span>
    </span>
  );
}
