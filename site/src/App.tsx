import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  blocks,
  byGroup,
  categoryLabel,
  components,
  docSections,
  docs,
  find,
  groupLabel,
  readmeBody,
  usedBy,
  type Item,
} from "./registry";
import { CopyButton, IconButton, Icon, Markdown, Preview, SITE, Toc, headingsOf, icons, scrollToId } from "./ui";

const NAV = [
  { key: "blocks", label: "적용 사례" },
  { key: "components", label: "컴포넌트" },
  { key: "docs", label: "문서" },
] as const;

function useRoute() {
  const read = () => location.hash.replace(/^#\/?/, "").split("/").filter(Boolean);
  const [route, setRoute] = useState(read);
  useEffect(() => {
    const on = () => {
      setRoute(read());
      window.scrollTo(0, 0);
    };
    addEventListener("hashchange", on);
    return () => removeEventListener("hashchange", on);
  }, []);
  // 예전 주소 #/item/<층>/<이름>
  if (route[0] === "item") return route.slice(1);
  return route;
}

export function App() {
  const [section = "blocks", slug] = useRoute();
  useEffect(() => {
    const item = slug && section !== "docs" ? find(`${section}/${slug}`) : undefined;
    const doc = section === "docs" ? docs.find((d) => d.slug === slug) ?? docs[0] : undefined;
    const name = item?.meta.title ?? doc?.title ?? NAV.find((n) => n.key === section)?.label;
    document.title = name ? `${name} · youuuchul's UI Lab` : "youuuchul's UI Lab";
  }, [section, slug]);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-6 px-5 md:gap-10">
          <a href="#/" className="flex shrink-0 items-baseline gap-1.5 whitespace-nowrap">
            <span className="text-[15px] font-medium text-muted">youuuchul's</span>
            <span className="text-lg font-bold tracking-tight">UI Lab</span>
          </a>
          <nav className="flex gap-5 overflow-x-auto text-[15px] [scrollbar-width:none]">
            {NAV.map((n) => (
              <a key={n.key} href={`#/${n.key}`} className={`whitespace-nowrap ${section === n.key ? "text-fg" : "text-muted hover:text-fg"}`}>
                {n.label}
              </a>
            ))}
          </nav>
          <a href="https://github.com/youuuchul/ui-lab" target="_blank" rel="noreferrer" className="ml-auto hidden text-sm text-muted hover:text-fg sm:block">
            GitHub
          </a>
        </div>
      </header>
      <main className="mx-auto max-w-[1440px] px-5 pb-24">
        {section === "docs" ? (
          <DocPage slug={slug} />
        ) : section === "components" ? (
          slug ? <Detail item={find(`components/${slug}`)} /> : <ComponentIndex />
        ) : slug ? (
          <Detail item={find(`blocks/${slug}`)} />
        ) : (
          <BlockGallery />
        )}
      </main>
    </div>
  );
}

/* ---------- 레이아웃 ---------- */

function Sidebar({ current }: { current?: string }) {
  const link = (href: string, label: string, active: boolean) => (
    <a key={href} href={href} className={`block rounded-lg px-3 py-1.5 ${active ? "bg-fg/10 text-fg" : "text-muted hover:text-fg"}`}>
      {label}
    </a>
  );
  const body = (
    <div className="flex flex-col gap-6 text-sm">
      {docSections.map((s) => (
        <section key={s.label}>
          <h2 className="mb-1.5 px-3 font-semibold text-fg">{s.label}</h2>
          {s.docs.map((d) => link(`#/docs/${d.slug}`, d.title, current === `docs/${d.slug}`))}
        </section>
      ))}
      <section>
        <h2 className="mb-1.5 px-3 font-semibold text-fg">적용 사례</h2>
        {blocks.map((b) => link(`#/${b.id}`, b.meta.title, current === b.id))}
      </section>
      <section>
        <h2 className="mb-1.5 px-3 font-semibold text-fg">컴포넌트</h2>
        {byGroup.map((g) => (
          <div key={g.key} className="mb-3">
            <h3 className="px-3 py-1 text-xs font-medium text-muted/70">{g.label}</h3>
            {g.items.map((c) => link(`#/${c.id}`, c.meta.title, current === c.id))}
          </div>
        ))}
      </section>
    </div>
  );
  return (
    <>
      <details className="mb-6 rounded-xl border border-line bg-surface px-4 py-3 lg:hidden">
        <summary className="cursor-pointer text-sm text-muted">전체 목록</summary>
        <div className="mt-4">{body}</div>
      </details>
      <aside className="sticky top-16 hidden max-h-[calc(100vh-4rem)] overflow-y-auto py-8 pr-4 [scrollbar-width:thin] lg:block">{body}</aside>
    </>
  );
}

function DocsLayout({ current, toc, children }: { current?: string; toc: { id: string; text: string; depth?: number }[]; children: ReactNode }) {
  return (
    <div className="lg:grid lg:grid-cols-[230px_minmax(0,1fr)] lg:gap-10 xl:grid-cols-[230px_minmax(0,1fr)_190px]">
      <Sidebar current={current} />
      <article className="min-w-0 py-8 lg:py-10">
        <div className="mx-auto max-w-3xl">{children}</div>
      </article>
      <div className="hidden py-10 xl:block">
        <Toc items={toc} />
      </div>
    </div>
  );
}

function PageHead({ crumbs, title, summary }: { crumbs?: { href: string; label: string }[]; title: string; summary?: string }) {
  return (
    <header className="mb-10">
      {crumbs && (
        <nav aria-label="경로" className="mb-4 flex flex-wrap items-center gap-1.5 text-sm text-muted">
          {crumbs.map((c, i) => (
            <span key={c.href + i} className="flex items-center gap-1.5">
              {i > 0 && <span aria-hidden="true">/</span>}
              <a href={c.href} className="hover:text-fg">
                {c.label}
              </a>
            </span>
          ))}
        </nav>
      )}
      <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>
      {summary && <p className="mt-3 text-lg leading-relaxed text-muted">{summary}</p>}
    </header>
  );
}

const H2 = ({ id, children }: { id: string; children: ReactNode }) => (
  <h2 id={id} className="mt-14 mb-5 scroll-mt-24 border-b border-line pb-3 text-xl font-semibold">
    {children}
  </h2>
);

/* ---------- 적용 사례 갤러리 ---------- */

function BlockGallery() {
  const projects = useMemo(() => [...new Set(blocks.map((b) => b.meta.source?.project).filter((p): p is string => !!p))], []);
  const [project, setProject] = useState<string | null>(null);
  const shown = project ? blocks.filter((b) => b.meta.source?.project === project) : blocks;
  return (
    <div className="py-8">
      <Chips options={projects} value={project} onChange={setProject} />
      <div className="grid gap-5 lg:grid-cols-2">
        {shown.map((b) => (
          <Card key={b.id} item={b} height="h-[34rem]" />
        ))}
      </div>
    </div>
  );
}

function Chips({ options, value, onChange }: { options: string[]; value: string | null; onChange: (v: string | null) => void }) {
  return (
    <div role="radiogroup" aria-label="출처 프로젝트" className="mb-6 flex flex-wrap gap-2">
      {[null, ...options].map((o) => (
        <button
          key={o ?? "all"}
          type="button"
          role="radio"
          aria-checked={value === o}
          onClick={() => onChange(o)}
          className={`rounded-full px-4 py-1.5 text-sm ${value === o ? "bg-fg text-bg" : "bg-surface text-muted hover:text-fg"}`}
        >
          {o ?? "전체"}
        </button>
      ))}
    </div>
  );
}

function Card({ item, height }: { item: Item; height: string }) {
  const [run, setRun] = useState(0);
  return (
    <article className="flex min-w-0 flex-col overflow-hidden rounded-card border border-line bg-surface">
      <Preview Demo={item.Demo} run={run} className={height} />
      <footer className="flex items-center gap-1 border-t border-line px-5 py-3">
        <a href={`#/${item.id}`} className="mr-auto min-w-0">
          <span className="block truncate text-[15px] font-medium hover:underline">{item.meta.title}</span>
          {item.meta.source && <span className="block truncate text-xs text-muted">{item.meta.source.project}</span>}
        </a>
        <IconButton label="다시 재생" onClick={() => setRun((r) => r + 1)}>
          {icons.replay}
        </IconButton>
        <CopyButton text={item.source[0]?.code ?? ""} />
        <a href={`#/${item.id}`} aria-label="문서" title="문서" className="rounded-lg p-2 text-muted hover:bg-fg/10 hover:text-fg">
          <Icon>{icons.doc}</Icon>
        </a>
      </footer>
    </article>
  );
}

/* ---------- 컴포넌트 목록 ---------- */

function ComponentIndex() {
  return (
    <DocsLayout current="components" toc={byGroup.map((g) => ({ id: g.key, text: g.label }))}>
      <PageHead title="컴포넌트" summary={`${components.length}개 · 기본 UI와 프로젝트에서 만든 도메인 컴포넌트`} />
      {byGroup.map((g) => (
        <section key={g.key}>
          <H2 id={g.key}>{g.label}</H2>
          <div className="grid gap-4 sm:grid-cols-2">
            {g.items.map((c) => (
              <Card key={c.id} item={c} height="h-64" />
            ))}
          </div>
        </section>
      ))}
    </DocsLayout>
  );
}

/* ---------- 상세 ---------- */

function Detail({ item }: { item?: Item }) {
  const [run, setRun] = useState(0);
  const [file, setFile] = useState(0);
  useEffect(() => setFile(0), [item]);
  if (!item) return <p className="py-24 text-center text-muted">항목을 찾을 수 없음</p>;

  const { meta } = item;
  const isBlock = meta.category === "blocks";
  const body = readmeBody(item.readme);
  const related = isBlock ? (meta.uses ?? []).map(find).filter((x): x is Item => !!x) : usedBy(item.id);
  const install = `npx shadcn@latest add ${SITE}/r/${item.slug}.json`;
  const toc = [
    { id: "preview", text: "미리보기" },
    ...(meta.rules ? [{ id: "rules", text: "사용 기준" }] : []),
    ...headingsOf(body),
    { id: "install", text: "설치" },
    { id: "code", text: "코드" },
    ...(related.length ? [{ id: "related", text: isBlock ? "구성 컴포넌트" : "적용 사례" }] : []),
  ];
  const crumbs = isBlock
    ? [{ href: "#/blocks", label: categoryLabel.blocks }]
    : [
        { href: "#/components", label: categoryLabel.components },
        { href: "#/components", label: groupLabel(meta.group) },
      ];
  const current = item.source[file] ?? item.source[0];

  return (
    <DocsLayout current={item.id} toc={toc}>
      <PageHead crumbs={[...crumbs, { href: `#/${item.id}`, label: meta.title }]} title={meta.title} summary={meta.summary} />
      {meta.source && (
        <p className="-mt-6 mb-8 text-sm text-muted">
          적용 프로젝트 ·{" "}
          {meta.source.url ? (
            <a className="underline hover:text-fg" href={meta.source.url} target="_blank" rel="noreferrer">
              {meta.source.project}
            </a>
          ) : (
            meta.source.project
          )}
        </p>
      )}

      <h2 id="preview" className="sr-only">
        미리보기
      </h2>
      <div className="overflow-hidden rounded-card border border-line bg-surface">
        <Preview Demo={item.Demo} run={run} className={isBlock || meta.tall ? "h-[38rem]" : "h-[22rem]"} />
      </div>
      <div className="mt-2 flex justify-end gap-1">
        <IconButton label="다시 재생" onClick={() => setRun((r) => r + 1)}>
          {icons.replay}
        </IconButton>
        <CopyButton text={item.source[0]?.code ?? ""} />
      </div>

      {meta.rules && (
        <>
          <H2 id="rules">사용 기준</H2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Rule tone="do" items={meta.rules.do} />
            <Rule tone="dont" items={meta.rules.dont} />
          </div>
        </>
      )}

      {body.trim() && (
        <div className="mt-14">
          <Markdown body={body} />
        </div>
      )}

      <H2 id="install">설치</H2>
      <Markdown body={"```bash\n" + install + "\n```"} />
      <p className="mt-3 text-sm text-muted">
        직접 복사할 때는 아래 파일을 같은 폴더 구조로 둔다. <a href="#/docs/installation" className="underline hover:text-fg">설치 안내</a>
      </p>

      <H2 id="code">코드</H2>
      <section className="overflow-hidden rounded-card border border-line bg-surface">
        <div className="flex items-center gap-1 border-b border-line pr-2 pl-3">
          <div role="tablist" aria-label="파일" className="flex min-w-0 flex-1 gap-1 overflow-x-auto py-2 [scrollbar-width:none]">
            {item.source.map((s, i) => (
              <button
                key={s.file}
                type="button"
                role="tab"
                aria-selected={i === file}
                onClick={() => setFile(i)}
                className={`shrink-0 rounded-md px-2.5 py-1 font-mono text-[13px] ${i === file ? "bg-fg/10 text-fg" : "text-muted hover:text-fg"}`}
              >
                {s.file}
              </button>
            ))}
          </div>
          {current && <CopyButton text={current.code} />}
        </div>
        <pre className="max-h-[36rem] overflow-auto p-5 font-mono text-[13px] leading-6">
          <code>{current?.code}</code>
        </pre>
      </section>

      {related.length > 0 && (
        <>
          <H2 id="related">{isBlock ? "구성 컴포넌트" : "적용 사례"}</H2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {related.map((r) => (
              <li key={r.id}>
                <a href={`#/${r.id}`} className="flex items-start justify-between gap-3 rounded-xl border border-line bg-surface p-4 hover:border-fg/30">
                  <span className="min-w-0">
                    <span className="block font-medium">{r.meta.title}</span>
                    <span className="mt-1 block text-sm text-muted">{r.meta.summary}</span>
                  </span>
                  <span className="text-muted">
                    <Icon>{icons.arrow}</Icon>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </>
      )}
    </DocsLayout>
  );
}

function Rule({ tone, items }: { tone: "do" | "dont"; items: string[] }) {
  const ok = tone === "do";
  return (
    <div className={`rounded-xl border p-5 ${ok ? "border-emerald-400/25 bg-emerald-400/5" : "border-red-400/25 bg-red-400/5"}`}>
      <h3 className={`mb-3 text-sm font-semibold ${ok ? "text-emerald-300" : "text-red-300"}`}>{ok ? "Do" : "Don't"}</h3>
      <ul className="flex flex-col gap-2 text-[15px] leading-relaxed text-fg/85">
        {items.map((t) => (
          <li key={t} className="flex gap-2">
            <span aria-hidden="true" className={ok ? "text-emerald-300" : "text-red-300"}>
              {ok ? "✓" : "✕"}
            </span>
            <span>{t}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------- 문서 ---------- */

function DocPage({ slug }: { slug?: string }) {
  const doc = docs.find((d) => d.slug === slug) ?? docs[0];
  const toc = useMemo(() => (doc ? headingsOf(doc.body) : []), [doc]);
  useEffect(() => {
    const id = new URLSearchParams(location.hash.split("?")[1]).get("s");
    if (id) scrollToId(id);
  }, [doc]);
  if (!doc) return null;
  const idx = docs.indexOf(doc);
  const prev = docs[idx - 1];
  const next = docs[idx + 1];
  return (
    <DocsLayout current={`docs/${doc.slug}`} toc={toc}>
      <PageHead crumbs={[{ href: "#/docs", label: "문서" }, { href: `#/docs/${doc.slug}`, label: doc.section }]} title={doc.title} summary={doc.summary} />
      <Markdown body={doc.body} />
      <nav className="mt-16 grid gap-3 border-t border-line pt-6 sm:grid-cols-2">
        {prev ? (
          <a href={`#/docs/${prev.slug}`} className="rounded-xl border border-line p-4 hover:border-fg/30">
            <span className="block text-xs text-muted">이전</span>
            {prev.title}
          </a>
        ) : (
          <span />
        )}
        {next && (
          <a href={`#/docs/${next.slug}`} className="rounded-xl border border-line p-4 text-right hover:border-fg/30">
            <span className="block text-xs text-muted">다음</span>
            {next.title}
          </a>
        )}
      </nav>
    </DocsLayout>
  );
}
