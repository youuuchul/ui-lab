"use client";
import { useCallback, useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { flushSync } from "react-dom";

export interface ChatInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
  placeholder?: string;
  /** 추천 답변. 없으면 추천 버튼을 숨긴다 */
  suggestions?: string[];
  suggestionsLoading?: boolean;
  loadingLabel?: string;
  onSuggestionUsed?: (suggestion: string, index: number) => void;
  /** 입력이 비어 있는 채로 이 시간(ms)이 지나면 추천 버튼을 강조 */
  hintDelayMs?: number;
  /** 선택한 글자를 marker로 감싸는 버튼. 선택이 없으면 placeholder를 넣고 선택해 둔다 */
  wrap?: { marker: string; placeholder: string; label: string };
  maxHeight?: number;
}

export function ChatInput({
  onSend,
  disabled = false,
  placeholder = "메시지 입력",
  suggestions,
  suggestionsLoading = false,
  loadingLabel = "불러오는 중",
  onSuggestionUsed,
  hintDelayMs = 8000,
  wrap,
  maxHeight = 120,
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);
  const [hint, setHint] = useState(false);
  const hintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const hasSuggestions = suggestions !== undefined;

  const cancelHint = useCallback(() => {
    if (hintTimer.current) clearTimeout(hintTimer.current);
    hintTimer.current = null;
    setHint(false);
  }, []);

  const armHint = useCallback(() => {
    if (!hasSuggestions) return;
    if (hintTimer.current) clearTimeout(hintTimer.current);
    hintTimer.current = setTimeout(() => setHint(true), hintDelayMs);
  }, [hasSuggestions, hintDelayMs]);

  // 입력 가능해지는 순간(시작·응답 끝) 강조 카운트를 시작하고, 비활성·패널 열림이면 끈다.
  // input은 onChange에서 직접 처리하므로 의존성에서 뺀다.
  useEffect(() => {
    if (disabled || open) cancelHint();
    else if (!input.trim()) armHint();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabled, open]);

  useEffect(() => () => {
    if (hintTimer.current) clearTimeout(hintTimer.current);
  }, []);

  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => {
      if (e.target instanceof Node && rootRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, maxHeight)}px`;
  }, [input, maxHeight]);

  const replace = (next: string, selStart: number, selEnd: number) => {
    flushSync(() => {
      setInput(next);
      setOpen(false);
    });
    cancelHint();
    taRef.current?.focus();
    taRef.current?.setSelectionRange(selStart, selEnd);
  };

  const submit = () => {
    const text = input.trim();
    if (!text || disabled) return;
    onSend(text);
    setInput("");
    setOpen(false);
    cancelHint();
  };

  // 데스크톱은 Enter 전송·Shift+Enter 줄바꿈, 터치 기기는 Enter 줄바꿈. IME 조합 중 Enter는 확정용이라 무시.
  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== "Enter" || e.shiftKey || e.nativeEvent.isComposing) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    e.preventDefault();
    submit();
  };

  const onWrap = () => {
    if (!wrap || disabled) return;
    const ta = taRef.current;
    const start = ta?.selectionStart ?? input.length;
    const end = ta?.selectionEnd ?? input.length;
    const selected = input.slice(start, end);
    const m = wrap.marker;
    const insert = `${m}${selected || wrap.placeholder}${m}`;
    const next = input.slice(0, start) + insert + input.slice(end);
    if (selected) replace(next, start + insert.length, start + insert.length);
    else replace(next, start + m.length, start + m.length + wrap.placeholder.length);
  };

  const round = "flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all disabled:opacity-50";

  return (
    <div ref={rootRef} className="relative">
      {open && (
        <div className="absolute right-0 bottom-full left-0 mb-2 flex flex-col gap-1.5 p-2">
          {suggestionsLoading ? (
            <div className="rounded-xl border border-white/10 bg-surface/95 px-3 py-2 text-sm text-white/60 shadow-lg shadow-black/40">{loadingLabel}</div>
          ) : (
            suggestions?.map((s, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  onSuggestionUsed?.(s, i);
                  replace(s, s.length, s.length);
                }}
                className="rounded-xl border border-white/10 bg-surface/95 px-3 py-2 text-left text-sm text-white/85 shadow-lg shadow-black/40 hover:bg-line"
              >
                {s}
              </button>
            ))
          )}
        </div>
      )}

      <form
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          submit();
        }}
        className="flex items-end gap-2"
      >
        {hasSuggestions && (
          <button
            type="button"
            onClick={() => {
              cancelHint();
              setOpen((o) => !o);
            }}
            disabled={disabled}
            aria-label="추천 답변"
            aria-expanded={open}
            title="추천 답변"
            className={`${round} ${hint && !open ? "animate-pulse bg-accent/30 text-white ring-2 ring-accent/60" : "bg-white/10 text-white/60 hover:bg-white/20"}`}
          >
            ?
          </button>
        )}
        <textarea
          ref={taRef}
          value={input}
          rows={1}
          disabled={disabled}
          placeholder={placeholder}
          onKeyDown={onKeyDown}
          onChange={(e) => {
            const next = e.target.value;
            setInput(next);
            if (!next.trim() && !disabled && !open) armHint();
            else cancelHint();
          }}
          onFocus={() => {
            if (!input.trim() && !disabled && !open) armHint();
          }}
          onBlur={cancelHint}
          className="min-w-0 flex-1 resize-none rounded-2xl bg-white/10 px-4 py-2.5 text-sm leading-5 text-white outline-none backdrop-blur-md placeholder:text-white/40 focus:bg-white/15 disabled:opacity-50"
        />
        {wrap && (
          <button type="button" onClick={onWrap} disabled={disabled} aria-label={wrap.label} title={wrap.label} className={`${round} bg-white/10 text-white/70 hover:bg-white/20 active:scale-90`}>
            <span className="translate-y-[1.5px] text-xl leading-none">{wrap.marker}</span>
          </button>
        )}
        <button type="submit" disabled={disabled || !input.trim()} aria-label="보내기" className={`${round} bg-accent text-white active:scale-90`}>
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </form>
    </div>
  );
}
