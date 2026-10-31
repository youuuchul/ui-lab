import type { ReactNode } from "react";

export interface QuoteOffer {
  title: string;
  what: string;
  output: string;
  /** 오른쪽 숫자 칸 (기간·가격 등) */
  value: string;
}

export interface QuoteProps {
  kicker?: string;
  title: string;
  sub?: string;
  groups: { name: string; offers: QuoteOffer[] }[];
  /** 오른쪽 숫자 칸 위의 작은 라벨 */
  valueLabel?: string;
  /** 결과물 칸 라벨 */
  outputLabel?: string;
  notes?: string[];
  steps?: { k: string; v: string }[];
  footer?: ReactNode;
  /** 제목 태그 수준. 쓰는 페이지에 이미 h1이 있으면 올려 맞춘다. 묶음 제목은 한 단계 아래 */
  headingLevel?: 1 | 2 | 3 | 4;
  className?: string;
}

/** 업무별 범위·결과물·기간을 한 장에 정리하는 견적 안내 시트. */
export function Quote({
  kicker,
  title,
  sub,
  groups,
  valueLabel = "기간",
  outputLabel = "결과물",
  notes,
  steps,
  footer,
  headingLevel = 2,
  className = "",
}: QuoteProps) {
  const H = `h${headingLevel}` as "h1" | "h2" | "h3" | "h4";
  const G = `h${Math.min(headingLevel + 1, 6)}` as "h2" | "h3" | "h4" | "h5";
  const O = `h${Math.min(headingLevel + 2, 6)}` as "h3" | "h4" | "h5" | "h6";
  return (
    <div className={`@container text-fg ${className}`}>
      <header>
        {kicker && <p className="text-sm font-bold text-accent">{kicker}</p>}
        <H className="mt-2 text-[clamp(26px,4vw,40px)] leading-tight font-extrabold tracking-[-0.035em]">{title}</H>
        {sub && <p className="mt-3 text-fg/70">{sub}</p>}
      </header>

      {groups.map((g) => (
        <section key={g.name} className="mt-10" aria-label={g.name}>
          <G className="border-b-2 border-fg pb-2.5 text-[13px] font-extrabold tracking-[0.04em] text-accent">{g.name}</G>
          <ul>
            {g.offers.map((o) => (
              <li
                key={o.title}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-5 gap-y-3 border-b border-line py-4 @xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1.5fr)_72px]"
              >
                <div>
                  <O className="text-[17px] font-extrabold tracking-[-0.02em]">{o.title}</O>
                  <p className="mt-1.5 text-sm leading-relaxed text-fg/85">{o.what}</p>
                </div>
                <dl className="col-span-full row-start-2 grid grid-cols-[52px_minmax(0,1fr)] gap-2 text-[13px] leading-normal @xl:col-span-1 @xl:row-start-auto">
                  <dt className="font-bold text-muted">{outputLabel}</dt>
                  <dd>{o.output}</dd>
                </dl>
                <p className="col-start-2 row-start-1 flex flex-col items-end font-mono text-[15px] font-bold whitespace-nowrap @xl:col-start-auto @xl:row-start-auto">
                  <small className="font-sans text-[11.5px] font-medium text-muted">{valueLabel}</small>
                  {o.value}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ))}

      {notes && notes.length > 0 && (
        <ul className="mt-6 list-disc pl-[18px] text-[13.5px] text-fg/70">
          {notes.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      )}

      {steps && steps.length > 0 && (
        <ol className="mt-10 grid gap-2.5 @xl:grid-cols-[repeat(auto-fit,minmax(0,1fr))]" aria-label="진행 순서">
          {steps.map((st, i) => (
            <li key={st.k} className="flex flex-col gap-1 rounded-xl bg-fg/5 p-3.5 text-[13px] leading-normal">
              <span className="font-mono text-[11px] text-accent">{String(i + 1).padStart(2, "0")}</span>
              <strong className="text-[14.5px]">{st.k}</strong>
              <span className="text-fg/80">{st.v}</span>
            </li>
          ))}
        </ol>
      )}

      {footer && <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-bold">{footer}</div>}
    </div>
  );
}
