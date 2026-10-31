import { useEffect, useMemo, useState, type ReactNode } from "react";
import { marked } from "marked";
import type { Category } from "../../registry/types";
import { byCategory, docs, items, type Item } from "./registry";

const NAV: { key: Category | "docs"; label: string }[] = [
  { key: "components", label: "컴포넌트" },
  { key: "blocks", label: "적용 사례" },
  { key: "docs", label: "문서" },
];

function useHash() {
  const [hash, setHash] = useState(location.hash.slice(2));
  useEffect(() => {
    const on = () => {
      setHash(location.hash.slice(2));
      window.scrollTo(0, 0);
    };
    addEventListener("hashchange", on);
    return () => removeEventListener("hashchange", on);
  }, []);
  return hash.split("/").filter(Boolean);
}

export function App() {
  const [section = "components", ...rest] = useHash();
  return (
    <div className="mx-auto max-w-6xl px-5 pb-24">
      <header className="flex items-center gap-8 py-6">
        <a href="#/" className="text-xl font-bold tracking-tight">ui-lab</a>
        <nav className="flex gap-5 text-[15px]">
          {NAV.map((n) => (
            <a key={n.key} href={`#/${n.key}`} className={section === n.key || (section === "item" && rest[0] === n.key) ? "text-fg" : "text-muted hover:text-fg"}>
              {n.label}
            </a>
          ))}
        </nav>
      </header>
      {section === "docs" ? (
        <Docs slug={rest[0]} />
      ) : section === "item" ? (
        <Detail item={items.find((i) => i.slug === rest.join("/"))} />
      ) : (
        <Gallery category={section === "blocks" ? "blocks" : "components"} />
      )}
    </div>
  );
}

function Gallery({ category }: { category: Category }) {
  const list = byCategory(category);
  const tags = useMemo(() => [...new Set(list.flatMap((i) => i.meta.tags))], [list]);
  const [tag, setTag] = useState<string | null>(null);
  useEffect(() => setTag(null), [category]);
  const shown = tag ? list.filter((i) => i.meta.tags.includes(tag)) : list;

  if (list.length === 0) return <p className="py-20 text-center text-muted">아직 등록된 항목 없음</p>;
  return (
    <>
      <div className="mb-5 flex flex-wrap gap-2">
        {[null, ...tags].map((t) => (
          <button key={t ?? "all"} onClick={() => setTag(t)} className={`rounded-full px-4 py-1.5 text-sm ${tag === t ? "bg-fg/15 text-fg" : "bg-surface text-muted hover:text-fg"}`}>
            {t ?? "전체"}
          </button>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {shown.map((item) => <Card key={item.slug} item={item} />)}
      </div>
    </>
  );
}

function Card({ item }: { item: Item }) {
  const [run, setRun] = useState(0);
  const { Demo } = item;
  return (
    <article className="flex flex-col rounded-card border border-line bg-surface">
      <div className="flex h-80 items-center justify-center overflow-hidden p-6">
        <Demo key={run} />
      </div>
      <footer className="flex items-center gap-1 px-6 pb-5">
        <a href={`#/item/${item.slug}`} className="mr-auto text-[15px] hover:underline">{item.meta.title}</a>
        <IconButton label="다시 재생" onClick={() => setRun((r) => r + 1)}><path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5" /></IconButton>
        <CopyButton code={item.source[0]?.code ?? ""} />
        <a href={`#/item/${item.slug}`} aria-label="문서" title="문서" className="rounded-lg p-2 text-muted hover:bg-fg/10 hover:text-fg">
          <Icon><path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8zM14 3v5h5M9 13h6M9 17h6" /></Icon>
        </a>
      </footer>
    </article>
  );
}

function Detail({ item }: { item?: Item }) {
  const [run, setRun] = useState(0);
  if (!item) return <p className="py-20 text-center text-muted">항목을 찾을 수 없음</p>;
  const { Demo } = item;
  return (
    <div className="grid gap-8">
      <div className="relative flex h-96 items-center justify-center rounded-card border border-line bg-surface">
        <Demo key={run} />
        <div className="absolute right-4 bottom-4">
          <IconButton label="다시 재생" onClick={() => setRun((r) => r + 1)}><path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5" /></IconButton>
        </div>
      </div>
      {item.meta.source && (
        <p className="text-sm text-muted">
          적용 프로젝트 · {item.meta.source.url ? <a className="underline" href={item.meta.source.url}>{item.meta.source.project}</a> : item.meta.source.project}
        </p>
      )}
      <Markdown body={item.readme} />
      {item.source.map((s) => (
        <section key={s.file} className="rounded-card border border-line bg-surface">
          <div className="flex items-center justify-between border-b border-line px-5 py-2 font-mono text-sm text-muted">
            {s.file}
            <CopyButton code={s.code} />
          </div>
          <pre className="max-h-[32rem] overflow-auto p-5 font-mono text-[13px] leading-6"><code>{s.code}</code></pre>
        </section>
      ))}
    </div>
  );
}

function Docs({ slug }: { slug?: string }) {
  const doc = docs.find((d) => d.slug === slug) ?? docs[0];
  return (
    <div className="grid gap-10 md:grid-cols-[200px_1fr]">
      <aside className="flex flex-col gap-1 text-sm">
        {docs.map((d) => (
          <a key={d.slug} href={`#/docs/${d.slug}`} className={`rounded-lg px-3 py-2 ${d === doc ? "bg-fg/10 text-fg" : "text-muted hover:text-fg"}`}>{d.title}</a>
        ))}
      </aside>
      {doc && <Markdown body={doc.body} />}
    </div>
  );
}

function Markdown({ body }: { body: string }) {
  const html = useMemo(() => marked.parse(body, { async: false }), [body]);
  return <div className="doc max-w-3xl" dangerouslySetInnerHTML={{ __html: html }} />;
}

function CopyButton({ code }: { code: string }) {
  const [done, setDone] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setDone(true);
    setTimeout(() => setDone(false), 1500);
  };
  return (
    <IconButton label={done ? "복사됨" : "코드 복사"} onClick={copy}>
      {done ? <path d="M5 12l5 5L20 7" /> : <path d="M8 8h11v11H8zM16 8V5H5v11h3" />}
    </IconButton>
  );
}

function IconButton({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button onClick={onClick} aria-label={label} title={label} className="rounded-lg p-2 text-muted hover:bg-fg/10 hover:text-fg">
      <Icon>{children}</Icon>
    </button>
  );
}

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}
