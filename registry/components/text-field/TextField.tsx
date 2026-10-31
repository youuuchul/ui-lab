"use client";
import { useId, useRef, useState, type InputHTMLAttributes, type ReactNode } from "react";

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "defaultValue" | "onChange" | "size"> {
  label: string;
  /** 입력 규칙 안내. 오류가 있으면 오류 문구로 바뀐다 */
  helperText?: string;
  /** 오류 문구. 있으면 오류 상태 */
  error?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** maxLength와 함께 글자 수 표시 */
  showCount?: boolean;
  /** 입력칸 오른쪽 단위·버튼 */
  trailing?: ReactNode;
}

export function TextField({
  label,
  helperText,
  error,
  value,
  defaultValue = "",
  onChange,
  showCount = false,
  maxLength,
  trailing,
  disabled,
  id: idProp,
  className = "",
  ...rest
}: TextFieldProps) {
  const auto = useId();
  const id = idProp ?? auto;
  const inputRef = useRef<HTMLInputElement>(null);
  const [inner, setInner] = useState(defaultValue);
  const text = value ?? inner;
  const message = error ?? helperText;
  const hasCount = showCount && maxLength !== undefined;

  return (
    <div className={`flex flex-col gap-1.5 ${disabled ? "opacity-50" : ""} ${className}`}>
      <label htmlFor={id} className="text-[13px] font-medium text-fg/85">
        {label}
      </label>
      <div
        onMouseDown={(e) => {
          if (e.target === e.currentTarget && !disabled) {
            e.preventDefault();
            inputRef.current?.focus();
          }
        }}
        className={`flex h-11 items-center gap-2 rounded-xl border bg-fg/5 px-3.5 transition-colors focus-within:bg-fg/[0.07] focus-within:ring-2 focus-within:ring-accent/40 motion-reduce:transition-none ${
          error ? "border-red-400/80" : "border-line focus-within:border-accent"
        }`}
      >
        <input
          ref={inputRef}
          id={id}
          value={text}
          maxLength={maxLength}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={[message && `${id}-msg`, hasCount && `${id}-count`].filter(Boolean).join(" ") || undefined}
          onChange={(e) => {
            if (value === undefined) setInner(e.target.value);
            onChange?.(e.target.value);
          }}
          className="h-full min-w-0 flex-1 bg-transparent text-sm text-fg outline-none placeholder:text-fg/35 disabled:cursor-not-allowed"
          {...rest}
        />
        {trailing}
      </div>
      <div className="flex min-h-4 justify-between gap-3 text-xs">
        <span id={`${id}-msg`} className={error ? "text-red-300" : "text-muted"} aria-live="polite">
          {message}
        </span>
        {hasCount && (
          <span id={`${id}-count`} className="shrink-0 font-mono text-muted tabular-nums">
            {text.length}/{maxLength}
          </span>
        )}
      </div>
    </div>
  );
}
