"use client";
import { useId, useState } from "react";

export interface ToggleProps {
  /** 설정 이름. 화면에 보이며 스위치의 접근성 이름이 된다 */
  label: string;
  description?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  /** 라벨을 시각적으로 숨김 (접근성 이름은 유지) */
  hideLabel?: boolean;
  className?: string;
}

export function Toggle({
  label,
  description,
  checked,
  defaultChecked = false,
  onChange,
  disabled = false,
  hideLabel = false,
  className = "",
}: ToggleProps) {
  const id = useId();
  const [inner, setInner] = useState(defaultChecked);
  const on = checked ?? inner;

  const toggle = () => {
    if (disabled) return;
    if (checked === undefined) setInner(!on);
    onChange?.(!on);
  };

  return (
    <div className={`flex items-center justify-between gap-4 ${disabled ? "opacity-50" : ""} ${className}`}>
      <div className={hideLabel ? "sr-only" : "min-w-0"}>
        <span id={`${id}-label`} className="block text-sm text-fg">
          {label}
        </span>
        {description && (
          <span id={`${id}-desc`} className="mt-0.5 block text-xs text-muted">
            {description}
          </span>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-labelledby={`${id}-label`}
        aria-describedby={description ? `${id}-desc` : undefined}
        disabled={disabled}
        onClick={toggle}
        className={`relative inline-flex h-6 w-11 shrink-0 after:absolute after:-inset-y-2 after:inset-x-0 after:content-[''] items-center rounded-full transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed motion-reduce:transition-none ${
          on ? "bg-accent" : "bg-fg/20"
        }`}
      >
        <span
          className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 motion-reduce:transition-none ${
            on ? "translate-x-[22px]" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}
