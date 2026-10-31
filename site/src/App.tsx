import { useEffect, useMemo, useState, type ReactNode } from "react";
import { BLOCK_GROUPS } from "../../registry/types";
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

const LINKS = [
  { href: "https://youuuchul.github.io/", label: "포트폴리오" },
  { href: "https://github.com/youuuchul/ui-lab", label: "GitHub" },
];

const NAV = [
  { key: "blocks", label: "블록" },
  { key: "components", label: "컴포넌트" },
  { key: "docs", label: "문서" },
] as const;

function useRoute() {
  const read = () => location.hash.replace(/^#\/?/, "").split("?")[0].split("/").filter(Boolean);
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
  /** 상세 페이지는 문서 탭 소속 */
  const tab = slug && section !== "docs" ? "docs" : section;
  useEffect(() => {
    const item = slug && section !== "docs" ? find(`${section}/${slug}`) : undefined;
    const doc = section === "docs" ? docs.find((d) => d.slug === slug) ?? docs[0] : undefined;
    const name = item?.meta.title ?? doc?.title ?? NAV.find((n) => n.key === section)?.label;
    document.title = name ? `${name} · youuuchul's UI Lab` : "youuuchul's UI Lab";
  }, [section, slug]);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-4 px-4 sm:gap-6 sm:px-5 md:gap-10">
          <a href="#/" className="flex h-16 shrink-0 items-center gap-1.5 whitespace-nowrap">
            <span className="hidden text-[15px] font-medium text-muted min-[480px]:inline">youuuchul's</span>
            <span className="text-lg font-bold tracking-tight">UI Lab</span>
          </a>
          <nav className="flex h-16 min-w-0 items-stretch gap-4 sm:gap-5 overflow-x-auto text-[15px] [scrollbar-width:none] [&>a]:h-16">
            {NAV.map((n) => (
              <a
                key={n.key}
                href={`#/${n.key}`}
                aria-current={tab === n.key ? "page" : undefined}
                className={`flex min-h-10 min-w-10 items-center justify-center border-b-2 whitespace-nowrap ${tab === n.key ? "border-fg text-fg" : "border-transparent text-muted hover:text-fg"}`}
              >
                {n.label}
              </a>
            ))}
          </nav>
          <div className="ml-auto flex shrink-0 items-center gap-1">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                target="_blank"
                rel="noreferrer"
                className="hidden min-h-10 items-center rounded-lg px-3 text-sm text-muted outline-none hover:text-fg focus-visible:ring-2 focus-visible:ring-accent md:flex"
              >
                {l.label}
              </a>
            ))}
            <a
              href="mailto:dbcjf25@gmail.com"
              className="ml-1 flex min-h-10 items-center rounded-full bg-fg px-4 text-sm font-medium text-bg outline-none transition-transform hover:bg-fg/90 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg active:scale-[0.96] motion-reduce:transition-none"
            >
              문의
            </a>
          </div>
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
  const link = (href: string, label: string, active: boolean, alias?: string) => (
    <a
      key={href}
      href={href}
      aria-current={active ? "page" : undefined}
      className={`flex min-h-10 items-center rounded-lg px-3 ${active ? "bg-fg/10 text-fg" : "text-muted hover:text-fg"}`}
    >
      {label}
      {alias && <span className="ml-1.5 text-xs text-muted/70">{alias}</span>}
    </a>
  );
  const section = (title: string, children: ReactNode) => (
    <section key={title} className="border-t border-line pt-5 first:border-t-0 first:pt-0">
      <h2 className="mb-2 px-3 text-[13px] font-bold tracking-wide text-fg">{title}</h2>
      {children}
    </section>
  );
  const docSection = (label: string) => {
    const s = docSections.find((d) => d.label === label);
    return s ? section(s.label, s.docs.map((d) => link(`#/docs/${d.slug}`, d.title, current === `docs/${d.slug}`))) : null;
  };
  const body = (
    <div className="flex flex-col gap-5 text-sm">
      {docSection("시작하기")}
      {docSection("기획")}
      {section("블록", blocks.map((b) => link(`#/${b.id}`, b.meta.title, current === b.id)))}
      {docSection("요소")}
      {section(
        "컴포넌트",
        byGroup.map((g) => (
          <div key={g.key} className="mt-3 first:mt-0">
            <p aria-hidden="true" className="px-3 pb-1 text-[11px] font-medium tracking-wider text-muted/60 select-none">
              {g.label}
            </p>
            <div role="group" aria-label={g.label} className="ml-3 border-l border-line pl-1.5">
              {g.items.map((c) => link(`#/${c.id}`, c.meta.title, current === c.id, c.meta.alias))}
            </div>
          </div>
        )),
      )}
    </div>
  );
  return (
    <>
      <details className="mb-6 rounded-xl border border-line bg-surface px-4 py-1 lg:hidden">
        <summary className="flex min-h-10 cursor-pointer items-center rounded-md text-sm text-muted outline-none focus-visible:ring-2 focus-visible:ring-accent">전체 목록</summary>
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

function PageHead({ crumbs, title, alias, summary }: { crumbs?: { href: string; label: string }[]; title: string; alias?: string; summary?: string }) {
  return (
    <header className="mb-10">
      {crumbs && (
        <nav aria-label="경로" className="mb-2 flex flex-wrap items-center gap-1.5 text-sm text-muted">
          {crumbs.map((c, i) => (
            <span key={c.href + i} className="flex items-center gap-1.5">
              {i > 0 && <span aria-hidden="true">/</span>}
              <a href={c.href} className="inline-flex min-h-10 min-w-10 items-center justify-center hover:text-fg">
                {c.label}
              </a>
            </span>
          ))}
        </nav>
      )}
      <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>
      {alias && <p className="mt-2 text-sm font-medium text-muted">{alias}</p>}
      {summary && <p className="mt-3 text-lg leading-relaxed text-muted">{summary}</p>}
    </header>
  );
}

const H2 = ({ id, children }: { id: string; children: ReactNode }) => (
  <h2 id={id} className="mt-14 mb-5 scroll-mt-24 border-b border-line pb-3 text-xl font-semibold">
    {children}
  </h2>
);

/* ---------- 블록 갤러리 ---------- */

function BlockGallery() {
  const options = useMemo(() => BLOCK_GROUPS.filter((g) => blocks.some((b) => b.meta.blockGroup === g.key)), []);
  const [group, setGroup] = useState<string | null>(null);
  const shown = group ? blocks.filter((b) => b.meta.blockGroup === group) : blocks;
  return (
    <div className="py-8">
      <Chips label="블록 분류" options={options} value={group} onChange={setGroup} />
      <div className="grid gap-5 lg:grid-cols-2">
        {shown.map((b) => (
          <Card key={b.id} item={b} height="h-[34rem]" />
        ))}
      </div>
    </div>
  );
}

function Chips({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { key: string; label: string }[];
  value: string | null;
  onChange: (v: string | null) => void;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="mb-6 flex flex-wrap gap-2">
      {[{ key: null, label: "전체" }, ...options].map((o) => (
        <button
          key={o.key ?? "all"}
          type="button"
          role="radio"
          aria-checked={value === o.key}
          onClick={() => onChange(o.key)}
          className={`min-h-10 rounded-full px-4 text-sm ${value === o.key ? "bg-fg text-bg" : "bg-surface text-muted hover:text-fg"}`}
        >
          {o.label}
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
          {(item.meta.alias || item.meta.source) && (
            <span className="block truncate text-xs text-muted">{[item.meta.alias, item.meta.source?.project].filter(Boolean).join(" · ")}</span>
          )}
        </a>
        <IconButton label="다시 재생" onClick={() => setRun((r) => r + 1)}>
          {icons.replay}
        </IconButton>
        <CopyButton text={item.source[0]?.code ?? ""} />
        <a
          href={`#/${item.id}`}
          aria-label="문서"
          title="문서"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-muted outline-none hover:bg-fg/10 hover:text-fg focus-visible:ring-2 focus-visible:ring-accent"
        >
          <Icon>{icons.doc}</Icon>
        </a>
      </footer>
    </article>
  );
}

/* ---------- 컴포넌트 목록 ---------- */

function ComponentIndex() {
  const [group, setGroup] = useState<string | null>(null);
  const shown = group ? components.filter((c) => c.meta.group === group) : components;
  return (
    <div className="py-8">
      <Chips label="컴포넌트 분류" options={byGroup} value={group} onChange={setGroup} />
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {shown.map((c) => (
          <Card key={c.id} item={c} height="h-72" />
        ))}
      </div>
    </div>
  );
}

/* ---------- 상세 ---------- */

const viewFromHash = (): "dev" | "plan" => (new URLSearchParams(location.hash.split("?")[1]).get("v") === "plan" ? "plan" : "dev");

function Detail({ item }: { item?: Item }) {
  const [view, setView] = useState(viewFromHash);
  useEffect(() => {
    const on = () => setView(viewFromHash());
    addEventListener("hashchange", on);
    return () => removeEventListener("hashchange", on);
  }, []);
  if (!item) return <p className="py-24 text-center text-muted">항목을 찾을 수 없음</p>;
  return view === "plan" && item.spec ? <PlanView item={item} /> : <DevView item={item} />;
}

function ViewSwitch({ item, view }: { item: Item; view: "dev" | "plan" }) {
  if (!item.spec) return null;
  const opts = [
    { key: "dev", label: "개발", href: `#/${item.id}` },
    { key: "plan", label: "기획", href: `#/${item.id}?v=plan` },
  ] as const;
  return (
    <nav aria-label="문서 보기" className="-mt-4 mb-10 inline-flex rounded-xl border border-line bg-surface p-1">
      {opts.map((o) => (
        <a
          key={o.key}
          href={o.href}
          aria-current={view === o.key ? "page" : undefined}
          className={`flex min-h-10 items-center rounded-lg px-5 text-sm ${view === o.key ? "bg-fg text-bg" : "text-muted hover:text-fg"}`}
        >
          {o.label}
        </a>
      ))}
    </nav>
  );
}

function crumbsOf(item: Item) {
  const { meta } = item;
  const base =
    meta.category === "blocks"
      ? [{ href: "#/blocks", label: categoryLabel.blocks }]
      : [
          { href: "#/components", label: categoryLabel.components },
          { href: "#/components", label: groupLabel(meta.group) },
        ];
  return [...base, { href: `#/${item.id}`, label: meta.title }];
}

function SourceLine({ item }: { item: Item }) {
  const s = item.meta.source;
  if (!s) return null;
  return (
    <p className="-mt-6 mb-8 text-sm text-muted">
      적용 프로젝트 ·{" "}
      {s.url ? (
        <a className="underline hover:text-fg" href={s.url} target="_blank" rel="noreferrer">
          {s.project}
        </a>
      ) : (
        s.project
      )}
    </p>
  );
}

function PlanView({ item }: { item: Item }) {
  const body = readmeBody(item.spec);
  const toc = headingsOf(body);
  return (
    <DocsLayout current={item.id} toc={toc}>
      <PageHead crumbs={crumbsOf(item)} title={item.meta.title} alias={item.meta.alias} summary={item.meta.summary} />
      <SourceLine item={item} />
      <ViewSwitch item={item} view="plan" />
      <Markdown body={body} />
      <p className="mt-12 border-t border-line pt-6 text-sm text-muted">
        문서 형식: <a href="#/docs/feature-spec" className="underline hover:text-fg">기능 명세서</a>
        {item.meta.category === "blocks" && (
          <>
            {" · "}
            <a href="#/docs/prd" className="underline hover:text-fg">PRD</a>
          </>
        )}
        {" · "}
        <a href="#/docs/overview" className="underline hover:text-fg">기획 문서 지도</a>
      </p>
    </DocsLayout>
  );
}

function DevView({ item }: { item: Item }) {
  const [run, setRun] = useState(0);
  const [file, setFile] = useState(0);
  useEffect(() => setFile(0), [item]);

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
    ...(related.length ? [{ id: "related", text: isBlock ? "구성 컴포넌트" : "블록" }] : []),
  ];
  const current = item.source[file] ?? item.source[0];

  return (
    <DocsLayout current={item.id} toc={toc}>
      <PageHead crumbs={crumbsOf(item)} title={meta.title} alias={meta.alias} summary={meta.summary} />
      <SourceLine item={item} />
      <ViewSwitch item={item} view="dev" />

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
          <div role="tablist" aria-label="파일" className="flex min-w-0 flex-1 gap-1 overflow-x-auto py-1 [scrollbar-width:none]">
            {item.source.map((s, i) => (
              <button
                key={s.file}
                type="button"
                role="tab"
                aria-selected={i === file}
                onClick={() => setFile(i)}
                className={`min-h-10 shrink-0 rounded-md px-3 font-mono text-[13px] ${i === file ? "bg-fg/10 text-fg" : "text-muted hover:text-fg"}`}
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
          <H2 id="related">{isBlock ? "구성 컴포넌트" : "블록"}</H2>
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
