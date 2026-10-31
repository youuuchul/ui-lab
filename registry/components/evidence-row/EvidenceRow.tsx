"use client";

export interface EvidenceRowProps {
  title: string;
  /** 문서·사물 이미지. 정사각 썸네일 안에 잘리지 않게 담는다 */
  image?: string;
  /** 위치 등 위쪽 보조 정보 */
  meta?: string;
  description?: string;
  onClick: () => void;
}

export function EvidenceRow({ title, image, meta, description, onClick }: EvidenceRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3.5 rounded-md border border-line p-3.5 text-left transition-colors hover:bg-line/40"
    >
      {image ? (
        <span className="relative block h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-black/40 outline-1 -outline-offset-1 outline-white/10">
          <img src={image} alt="" className="h-full w-full object-contain" loading="lazy" decoding="async" />
        </span>
      ) : (
        <span className="grid h-16 w-16 shrink-0 place-items-center rounded-lg bg-line text-lg font-bold text-muted">
          {(title || "?").slice(0, 1)}
        </span>
      )}
      <span className="min-w-0 flex-1">
        {meta && (
          <span className="flex items-center gap-1 text-[12px] text-muted">
            <svg viewBox="0 0 256 256" className="h-3 w-3 shrink-0 fill-current" aria-hidden="true">
              <path d="M128 16a88.1 88.1 0 0 0-88 88c0 75.3 80 132.17 83.41 134.55a8 8 0 0 0 9.18 0C136 236.17 216 179.3 216 104a88.1 88.1 0 0 0-88-88Zm0 56a32 32 0 1 1-32 32 32 32 0 0 1 32-32Z" />
            </svg>
            <span className="truncate">{meta}</span>
          </span>
        )}
        <span className="mt-0.5 block truncate text-[16px] font-bold text-fg">{title}</span>
        {description && <span className="mt-1 line-clamp-2 text-[13px] leading-5 text-fg/60">{description}</span>}
      </span>
      <svg viewBox="0 0 256 256" className="h-5 w-5 shrink-0 fill-current text-muted" aria-hidden="true">
        <path d="M184.49 136.49l-80 80a12 12 0 0 1-17-17L159 128 87.51 56.49a12 12 0 1 1 17-17l80 80a12 12 0 0 1-.02 17Z" />
      </svg>
    </button>
  );
}
