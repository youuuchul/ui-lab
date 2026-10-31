"use client";
import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

export interface TabItem {
  value: string;
  label: ReactNode;
  content: ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  items: TabItem[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** 탭 목록의 접근성 이름 */
  label: string;
  /** 탭을 칸 폭에 맞춰 같은 너비로 */
  fitted?: boolean;
  className?: string;
}

export function Tabs({ items, value, defaultValue, onChange, label, fitted = false, className = "" }: TabsProps) {
  const id = useId();
  const [inner, setInner] = useState(defaultValue ?? items.find((t) => !t.disabled)?.value);
  const current = value ?? inner;
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const select = (v: string) => {
    if (value === undefined) setInner(v);
    if (v !== current) onChange?.(v);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    const enabled = items.map((t, i) => (t.disabled ? -1 : i)).filter((i) => i >= 0);
    const pos = enabled.indexOf(items.findIndex((t) => t.value === current));
    let next: number | undefined;
    if (e.key === "ArrowRight") next = enabled[(pos + 1) % enabled.length];
    else if (e.key === "ArrowLeft") next = enabled[(pos - 1 + enabled.length) % enabled.length];
    else if (e.key === "Home") next = enabled[0];
    else if (e.key === "End") next = enabled[enabled.length - 1];
    if (next === undefined) return;
    e.preventDefault();
    select(items[next].value);
    refs.current[next]?.focus();
  };

  return (
    <div className={className}>
      <div role="tablist" aria-label={label} onKeyDown={onKeyDown} className={`flex border-b border-line ${fitted ? "" : "gap-5"}`}>
        {items.map((t, i) => {
          const selected = t.value === current;
          return (
            <button
              key={t.value}
              ref={(el) => {
                refs.current[i] = el;
              }}
              id={`${id}-tab-${i}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`${id}-panel-${i}`}
              tabIndex={selected ? 0 : -1}
              disabled={t.disabled}
              onClick={() => select(t.value)}
              className={`relative -mb-px h-11 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none ${
                fitted ? "flex-1" : "px-0.5"
              } ${selected ? "text-fg" : "text-muted hover:text-fg/80"}`}
            >
              {t.label}
              <span
                aria-hidden="true"
                className={`absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-fg transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none ${
                  selected ? "scale-x-100" : "scale-x-0"
                }`}
              />
            </button>
          );
        })}
      </div>
      {items.map((t, i) => (
        <div
          key={t.value}
          id={`${id}-panel-${i}`}
          role="tabpanel"
          aria-labelledby={`${id}-tab-${i}`}
          tabIndex={0}
          hidden={t.value !== current}
          className="pt-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {t.content}
        </div>
      ))}
    </div>
  );
}
