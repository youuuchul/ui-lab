"use client";
import { useRef, useState, type KeyboardEvent } from "react";

export interface PortraitOption {
  id: string;
  name: string;
  /** 세로(3:4) 인물 이미지. 없으면 이름만 */
  image?: string;
}

export interface PortraitChoiceProps {
  options: PortraitOption[];
  value: string;
  onChange: (id: string) => void;
  /** 스크린리더용 묶음 이름 (예: 질문 문구) */
  label: string;
  disabled?: boolean;
}

export function PortraitChoice({ options, value, onChange, label, disabled = false }: PortraitChoiceProps) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const found = options.findIndex((o) => o.id === value);
  const tabStop = found >= 0 ? found : 0;

  const onKeyDown = (e: KeyboardEvent) => {
    const n = options.length;
    const step: Record<string, number> = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
    if (disabled || !(e.key in step) || n === 0) return;
    e.preventDefault();
    const from = Math.max(refs.current.findIndex((el) => el === document.activeElement), 0);
    const next = (from + step[e.key] + n) % n;
    onChange(options[next].id);
    refs.current[next]?.focus();
  };

  return (
    <div role="radiogroup" aria-label={label} onKeyDown={onKeyDown} className="space-y-2">
      {options.map((o, i) => {
        const selected = o.id === value;
        return (
          <button
            key={o.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            tabIndex={i === tabStop ? 0 : -1}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => onChange(o.id)}
            className={`w-full text-left ${o.image ? "rounded-[22px] p-2.5 pr-4" : "min-h-10 rounded-xl px-4 py-3.5"} font-semibold transition-[transform,background-color,box-shadow] active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-40 ${
              selected ? "bg-accent/10 text-fg ring-1 ring-accent ring-inset" : "bg-line text-muted hover:bg-line/70 hover:text-fg"
            }`}
          >
            <span className="flex items-center gap-3">
              {o.image && (
                <Portrait src={o.image} name={o.name} />
              )}
              <span className={selected ? "text-fg" : "text-fg/90"}>{o.name}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

/** 이미지를 못 불러오면 이름 첫 글자로 대신한다 */
function Portrait({ src, name }: { src: string; name: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <span className="relative grid aspect-[3/4] w-14 shrink-0 place-items-center overflow-hidden rounded-xl bg-black/40 text-lg font-bold text-muted outline-1 -outline-offset-1 outline-white/10">
      {failed ? (
        name.slice(0, 1)
      ) : (
        <img src={src} alt="" onError={() => setFailed(true)} className="h-full w-full object-cover object-center" loading="lazy" decoding="async" />
      )}
    </span>
  );
}
