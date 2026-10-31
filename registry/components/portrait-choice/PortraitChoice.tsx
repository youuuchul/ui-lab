"use client";

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
  return (
    <div role="radiogroup" aria-label={label} className="space-y-2">
      {options.map((o) => {
        const selected = o.id === value;
        return (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => onChange(o.id)}
            className={`w-full rounded-md px-4 py-3.5 text-left font-semibold transition-[transform,background-color,box-shadow] active:scale-[0.96] disabled:opacity-40 ${
              selected ? "bg-accent/10 text-fg ring-1 ring-accent ring-inset" : "bg-line text-muted hover:bg-line/70 hover:text-fg"
            }`}
          >
            <span className="flex items-center gap-3">
              {o.image && (
                <span className="relative block aspect-[3/4] w-14 shrink-0 overflow-hidden rounded-xl bg-black/40 outline-1 -outline-offset-1 outline-white/10">
                  <img src={o.image} alt="" className="h-full w-full object-cover object-center" loading="lazy" decoding="async" />
                </span>
              )}
              <span className={selected ? "text-fg" : "text-fg/90"}>{o.name}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
