"use client";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { EvidenceRow } from "../../components/evidence-row/EvidenceRow";
import { PortraitChoice, type PortraitOption } from "../../components/portrait-choice/PortraitChoice";

export interface Clue {
  id: string;
  title: string;
  location: string;
  description: string;
  image?: string;
  /** true면 모두에게 공개된 단서, 아니면 내 보유 단서 */
  public?: boolean;
}

export interface MysteryPlayProps {
  clues: Clue[];
  suspects: PortraitOption[];
  question: string;
  /** 투표하는 사람 수 */
  voters: number;
  /** 제출하면 호출. 다른 사람 투표 수가 늘어나는 흐름은 쓰는 쪽이 voteCount로 넘긴다 */
  /** Promise를 돌려주면 끝날 때까지 기다리고, 실패하면 확인 단계에 머문다 */
  onVote?: (id: string) => void | Promise<void>;
  voteCount: number;
  /** 강조색. 원본 다크 테마 브랜드 값 */
  accent?: string;
}

type Tab = "clues" | "vote";
type Sub = "owned" | "public";

export function MysteryPlay({ clues, suspects, question, voters, onVote, voteCount, accent = "#e0525c" }: MysteryPlayProps) {
  const [tab, setTab] = useState<Tab>("clues");
  const [sub, setSub] = useState<Sub>("owned");
  const [opened, setOpened] = useState<Clue | null>(null);
  const [pick, setPick] = useState("");
  const [stage, setStage] = useState<"pick" | "confirm" | "done">("pick");
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState(false);
  const submit = async () => {
    setSending(true);
    setFailed(false);
    try {
      await onVote?.(pick);
      setStage("done");
    } catch {
      setFailed(true);
    } finally {
      setSending(false);
    }
  };
  const baseRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const returnRef = useRef<HTMLElement | null>(null);
  const confirmRef = useRef<HTMLParagraphElement>(null);
  const picked = suspects.find((o) => o.id === pick);

  const owned = clues.filter((c) => !c.public);
  const shared = clues.filter((c) => c.public);
  const byLocation = [...new Set(shared.map((c) => c.location))].map((loc) => ({ loc, list: shared.filter((c) => c.location === loc) }));

  const open = (c: Clue) => {
    returnRef.current = document.activeElement as HTMLElement | null;
    setOpened(c);
  };
  const close = () => setOpened(null);

  useEffect(() => {
    if (!opened) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpened(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [opened]);

  useEffect(() => {
    const el = baseRef.current;
    if (!el) return;
    if (opened) {
      el.setAttribute("inert", "");
      return;
    }
    el.removeAttribute("inert");
    returnRef.current?.focus();
  }, [opened]);

  useEffect(() => {
    if (stage === "confirm") confirmRef.current?.focus();
  }, [stage]);

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-[#09090b] text-fg" style={{ "--color-accent": accent } as CSSProperties}>
      <div ref={baseRef} className="flex min-h-0 flex-1 flex-col">
      <nav role="tablist" aria-label="플레이 메뉴" className="flex shrink-0 border-b border-line text-[14px] font-semibold">
        {(["clues", "vote"] as const).map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            id={`mp-tab-${t}`}
            aria-selected={tab === t}
            aria-controls="mp-panel"
            onClick={() => setTab(t)}
            className={`relative flex-1 py-3 transition-colors ${tab === t ? "text-fg" : "text-muted hover:text-fg"}`}
          >
            {t === "clues" ? "단서" : "투표"}
            {tab === t && <span className="absolute inset-x-6 bottom-0 h-0.5 rounded-full bg-fg" />}
          </button>
        ))}
      </nav>

      <div id="mp-panel" role="tabpanel" aria-labelledby={`mp-tab-${tab}`} className="min-h-0 flex-1 overflow-y-auto p-4 [scrollbar-width:none]">
        {tab === "clues" && (
          <div className="space-y-3">
            <div className="flex rounded-[10px] bg-line p-1">
              {(["owned", "public"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  aria-pressed={sub === s}
                  onClick={() => setSub(s)}
                  className={`h-10 flex-1 rounded-md px-3 text-[13px] font-semibold transition-colors ${sub === s ? "bg-[#09090b] text-fg shadow-sm" : "text-muted hover:text-fg"}`}
                >
                  {s === "owned" ? `보유 단서 (${owned.length})` : `공개 단서 (${shared.length})`}
                </button>
              ))}
            </div>

            {sub === "owned" &&
              (owned.length === 0 ? (
                <p className="py-12 text-center text-sm text-muted">보유한 단서가 없습니다</p>
              ) : (
                <div className="space-y-2">
                  {owned.map((c) => (
                    <EvidenceRow key={c.id} title={c.title} meta={c.location} description={c.description} image={c.image} onClick={() => open(c)} />
                  ))}
                </div>
              ))}

            {sub === "public" &&
              (shared.length === 0 ? (
                <p className="py-12 text-center text-sm text-muted">아직 공개된 단서가 없습니다</p>
              ) : (
                <>
                  <p className="text-[13px] text-fg/60">
                    모두에게 공개된 단서 <b className="font-semibold text-fg tabular-nums">{shared.length}</b>
                  </p>
                  {byLocation.map((g) => (
                    <div key={g.loc}>
                      <p className="pb-2 text-[12px] font-semibold text-muted">
                        {g.loc} <span className="tabular-nums">· {g.list.length}</span>
                      </p>
                      <div className="space-y-2">
                        {g.list.map((c) => (
                          <EvidenceRow key={c.id} title={c.title} description="공개 단서" image={c.image} onClick={() => open(c)} />
                        ))}
                      </div>
                    </div>
                  ))}
                </>
              ))}
          </div>
        )}

        {tab === "vote" &&
          (stage === "done" ? (
            <div className="space-y-4">
              <div className="rounded-md bg-accent/[0.08] py-8 text-center">
                <p className="font-semibold text-accent">투표 완료</p>
                {picked && <p className="mt-1 text-sm text-fg/80">내가 고른 사람: {picked.name}</p>}
              </div>
              <div className="text-center">
                <p className="text-sm text-muted tabular-nums">
                  {voteCount} / {voters}명 투표 완료
                </p>
                <div className="mx-auto mt-2 h-2 max-w-xs overflow-hidden rounded-full bg-line">
                  <div className="h-full rounded-full bg-accent transition-[width] duration-500" style={{ width: `${voters > 0 ? (voteCount / voters) * 100 : 0}%` }} />
                </div>
                <p className="mt-2 text-xs text-muted">전원 투표 시 자동으로 결과가 공개됩니다.</p>
              </div>
            </div>
          ) : stage === "confirm" ? (
            <div className="space-y-4">
              <div className="rounded-md bg-line py-8 text-center">
                <p ref={confirmRef} tabIndex={-1} className="font-semibold text-balance outline-none">
                  {picked?.name}님으로 제출할까요?
                </p>
                <p className="mt-1 text-xs text-muted">제출하면 바꿀 수 없어요</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={sending}
                  onClick={() => {
                    setFailed(false);
                    setStage("pick");
                  }}
                  className="h-12 flex-1 rounded-xl bg-line font-semibold text-fg transition-[transform,background-color] hover:bg-line/70 active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  다시 고르기
                </button>
                <button
                  type="button"
                  disabled={sending}
                  aria-disabled={sending}
                  onClick={submit}
                  className="h-12 flex-1 rounded-xl bg-accent font-semibold text-[#09090b] transition-[transform,background-color] hover:bg-accent/90 active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg"
                >
                  {sending ? "제출 중" : "제출"}
                </button>
              </div>
              {failed && (
                <p role="alert" className="text-center text-xs text-accent">
                  제출하지 못했어요. 다시 시도해 주세요
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="py-2 text-center">
                <p className="font-semibold text-balance text-fg/90">{question}</p>
                {!pick && <p className="mt-1 text-xs text-muted">한 명을 고르세요</p>}
                <p className="mt-1 text-xs text-muted tabular-nums">
                  {voteCount} / {voters}명 투표 완료
                </p>
              </div>
              <PortraitChoice label={question} options={suspects} value={pick} onChange={setPick} />
              <button
                type="button"
                disabled={!pick}
                onClick={() => setStage("confirm")}
                className="w-full rounded-xl bg-accent py-3.5 font-semibold text-[#09090b] transition-[transform,background-color] hover:bg-accent/90 active:scale-[0.96] disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg"
              >
                이 사람으로 제출
              </button>
            </div>
          ))}
      </div>
      </div>

      {opened && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 p-4 backdrop-blur-[2px]" onClick={close}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label={opened.title}
            className="max-h-[85%] w-full max-w-sm space-y-4 overflow-y-auto rounded-2xl bg-[#09090b] p-5 ring-1 ring-line [scrollbar-width:none]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-lg leading-tight font-bold text-balance">{opened.title}</p>
                <p className="mt-1 text-xs text-muted">{opened.public ? "공개 단서" : opened.location}</p>
              </div>
              <button
                ref={closeRef}
                type="button"
                aria-label="닫기"
                onClick={close}
                className="-mt-2 -mr-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-line hover:text-fg focus-visible:outline-2 focus-visible:outline-accent"
              >
                <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
                  <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" />
                </svg>
              </button>
            </div>
            {opened.image && (
              <div className="aspect-[4/5] w-full overflow-hidden rounded-lg bg-black/40 outline-1 -outline-offset-1 outline-white/10">
                <img src={opened.image} alt={opened.title} className="h-full w-full object-contain" />
              </div>
            )}
            <p className="text-sm leading-relaxed text-pretty text-fg/80">{opened.description}</p>
          </div>
        </div>
      )}
    </div>
  );
}
