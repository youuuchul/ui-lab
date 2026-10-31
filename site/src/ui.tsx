import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ComponentType, type ReactNode } from "react";
import { Marked, type Renderer, type Tokens } from "marked";

export const SITE = "https://youuuchul.github.io/ui-lab";

export function Icon({ children, size = 18 }: { children: ReactNode; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

export const icons = {
  replay: <path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5" />,
  copy: <path d="M8 8h11v11H8zM16 8V5H5v11h3" />,
  check: <path d="M5 12l5 5L20 7" />,
  doc: <path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8zM14 3v5h5M9 13h6M9 17h6" />,
  arrow: <path d="M7 17L17 7M9 7h8v8" />,
};

export function IconButton({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-muted outline-none hover:bg-fg/10 hover:text-fg focus-visible:ring-2 focus-visible:ring-accent"
    >
      <Icon>{children}</Icon>
    </button>
  );
}

export function useCopy() {
  const [state, setState] = useState<"idle" | "done" | "failed">("idle");
  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setState("done");
    } catch {
      setState("failed");
    }
    setTimeout(() => setState("idle"), 1500);
  };
  return { state, copy };
}

export function CopyButton({ text, label = "코드 복사" }: { text: string; label?: string }) {
  const { state, copy } = useCopy();
  const msg = state === "done" ? "복사됨" : state === "failed" ? "복사하지 못함" : "";
  return (
    <>
      <IconButton label={msg || label} onClick={() => copy(text)}>
        {state === "done" ? icons.check : icons.copy}
      </IconButton>
      <span role="status" className="sr-only">
        {msg}
      </span>
    </>
  );
}

/** 데모를 박스 안에 두고, 넘칠 때만 비율을 유지한 채 줄인다 */
export function Preview({ Demo, run, className = "" }: { Demo: ComponentType; run: number; className?: string }) {
  const box = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const b = box.current;
    const i = inner.current;
    if (!b || !i) return;
    const fit = () => {
      const child = i.firstElementChild as HTMLElement | null;
      if (!child) return;
      const pad = 24;
      const s = Math.min(1, (b.clientWidth - pad * 2) / child.offsetWidth, (b.clientHeight - pad * 2) / child.offsetHeight);
      setScale(s > 0 ? s : 1);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(b);
    ro.observe(i);
    if (i.firstElementChild) ro.observe(i.firstElementChild);
    return () => ro.disconnect();
  }, [run]);

  return (
    <div ref={box} className={`relative flex items-center justify-center overflow-hidden ${className}`}>
      <div
        ref={inner}
        className="flex w-full max-w-full items-center justify-center px-6 [&>*]:shrink-0"
        style={scale < 1 ? { transform: `scale(${scale})`, transformOrigin: "center" } : undefined}
      >
        <Demo key={run} />
      </div>
    </div>
  );
}

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-|-$/g, "");

const escapeHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const md = new Marked({
  renderer: {
    heading(this: Renderer, { tokens, depth }: Tokens.Heading): string {
      const html = this.parser.parseInline(tokens);
      return `<h${depth} id="${slugify(html)}">${html}</h${depth}>\n`;
    },
    code({ text, lang }: Tokens.Code): string {
      return `<div class="code-block${lang === "text" ? " wrap" : ""}"><div class="code-head"><span>${escapeHtml(lang ?? "")}</span><button type="button" data-copy aria-label="복사">복사</button></div><pre><code>${escapeHtml(text)}</code></pre></div>`;
    },
    link(this: Renderer, { href, tokens }: Tokens.Link): string {
      const text = this.parser.parseInline(tokens);
      const external = /^https?:/.test(href);
      return `<a href="${href}"${external ? ' target="_blank" rel="noreferrer"' : ""}>${text}</a>`;
    },
  },
});

export const headingsOf = (body: string, depth = 2) =>
  md
    .lexer(body)
    .filter((t: Tokens.Generic): t is Tokens.Heading => t.type === "heading" && t.depth === depth)
    .map((t: Tokens.Heading) => ({ id: slugify(t.text), text: t.text.replace(/`/g, "") }));

export function Markdown({ body }: { body: string }) {
  const html = useMemo(
    () =>
      md
        .parse(body, { async: false })
        .replace(/<code>(#[0-9a-fA-F]{6})<\/code>/g, '<span class="swatch" style="background:$1"></span><code>$1</code>'),
    [body],
  );
  return (
    <div
      className="doc"
      dangerouslySetInnerHTML={{ __html: html }}
      onClick={async (e) => {
        const btn = (e.target as HTMLElement).closest<HTMLButtonElement>("[data-copy]");
        if (!btn) return;
        const code = btn.closest(".code-block")?.querySelector("code")?.textContent ?? "";
        try {
          await navigator.clipboard.writeText(code);
          btn.textContent = "복사됨";
        } catch {
          btn.textContent = "복사하지 못함";
        }
        setTimeout(() => (btn.textContent = "복사"), 1500);
      }}
    />
  );
}

export function scrollToId(id: string) {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.getElementById(id)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
}

/** 오른쪽 페이지 목차. 화면에 들어온 섹션을 표시 */
export function Toc({ items }: { items: { id: string; text: string; depth?: number }[] }) {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    const els = items.map((i) => document.getElementById(i.id)).filter((e): e is HTMLElement => !!e);
    const io = new IntersectionObserver(
      (entries) => {
        const top = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (top) setActive(top.target.id);
      },
      { rootMargin: "-80px 0px -65% 0px" },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, [items]);
  if (items.length < 2) return null;
  return (
    <nav aria-label="페이지 목차" className="sticky top-24 hidden max-h-[calc(100vh-7rem)] overflow-y-auto text-sm xl:block">
      <ul className="flex flex-col gap-1 border-l border-line">
        {items.map((i) => (
          <li key={i.id}>
            <button
              type="button"
              onClick={() => scrollToId(i.id)}
              className={`-ml-px min-h-10 border-l py-2 text-left ${i.depth === 3 ? "pl-6" : "pl-4"} ${active === i.id ? "border-fg text-fg" : "border-transparent text-muted hover:text-fg"}`}
            >
              {i.text}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
