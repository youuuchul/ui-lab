"use client";
import { useEffect, useState, type CSSProperties } from "react";
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
  onVote?: (id: string) => void;
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
  const [submitted, setSubmitted] = useState(false);

  const owned = clues.filter((c) => !c.public);
  const shared = clues.filter((c) => c.public);
  const byLocation = [...new Set(shared.map((c) => c.location))].map((loc) => ({ loc, list: shared.filter((c) => c.location === loc) }));

  useEffect(() => {
    if (!opened) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpened(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [opened]);

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-[#09090b] text-fg" style={{ "--color-accent": accent } as CSSProperties}>
      <nav className="flex shrink-0 border-b border-line text-[14px] font-semibold">
        {(["clues", "vote"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`relative flex-1 py-3 transition-colors ${tab === t ? "text-fg" : "text-muted hover:text-fg"}`}
          >
            {t === "clues" ? "단서" : "투표"}
            {tab === t && <span className="absolute inset-x-6 bottom-0 h-0.5 rounded-full bg-fg" />}
          </button>
        ))}
      </nav>

      <div className="min-h-0 flex-1 overflow-y-auto p-4 [scrollbar-width:none]">
        {tab === "clues" && (
          <div className="space-y-3">
            <div className="flex rounded-md bg-line p-1">
              {(["owned", "public"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSub(s)}
                  className={`h-9 flex-1 rounded px-3 text-[13px] font-semibold transition-colors ${sub === s ? "bg-[#09090b] text-fg shadow-sm" : "text-muted hover:text-fg"}`}
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
                    <EvidenceRow key={c.id} title={c.title} meta={c.location} description={c.description} image={c.image} onClick={() => setOpened(c)} />
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
                          <EvidenceRow key={c.id} title={c.title} description="공개 단서" image={c.image} onClick={() => setOpened(c)} />
                        ))}
                      </div>
                    </div>
                  ))}
                </>
              ))}
          </div>
        )}

        {tab === "vote" &&
          (submitted ? (
            <div className="space-y-4">
              <div className="rounded-md bg-accent/[0.08] py-8 text-center">
                <p className="font-semibold text-accent">투표 완료</p>
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
          ) : (
            <div className="space-y-4">
              <div className="py-2 text-center">
                <p className="font-semibold text-balance text-fg/90">{question}</p>
                <p className="mt-1 text-xs text-muted tabular-nums">
                  {voteCount} / {voters}명 투표 완료
                </p>
              </div>
              <PortraitChoice label={question} options={suspects} value={pick} onChange={setPick} />
              <button
                type="button"
                disabled={!pick}
                onClick={() => {
                  setSubmitted(true);
                  onVote?.(pick);
                }}
                className="w-full rounded-xl bg-accent py-3.5 font-semibold text-[#09090b] transition-[transform,background-color] hover:bg-accent/90 active:scale-[0.96] disabled:opacity-40"
              >
                투표 제출
              </button>
            </div>
          ))}
      </div>

      {opened && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 p-4 backdrop-blur-[2px]" onClick={() => setOpened(null)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label={opened.title}
            className="max-h-[85%] w-full max-w-sm space-y-4 overflow-y-auto rounded-2xl bg-[#09090b] p-5 ring-1 ring-line [scrollbar-width:none]"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <p className="text-lg leading-tight font-bold text-balance">{opened.title}</p>
              <p className="mt-1 text-xs text-muted">{opened.public ? "공개 단서" : opened.location}</p>
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
