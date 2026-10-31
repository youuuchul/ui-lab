import type { ComponentType } from "react";
import { GROUPS, type Category, type Group, type ItemMeta } from "../../registry/types";

const metas = import.meta.glob<{ meta: ItemMeta }>("../../registry/*/*/meta.ts", { eager: true });
const demos = import.meta.glob<{ default: ComponentType }>("../../registry/*/*/demo.tsx", { eager: true });
const readmes = import.meta.glob<string>("../../registry/*/*/README.md", { eager: true, query: "?raw", import: "default" });
const sources = import.meta.glob<string>(["../../registry/*/*/*.{ts,tsx}", "!**/demo.tsx", "!**/meta.ts"], {
  eager: true,
  query: "?raw",
  import: "default",
});
const specs = import.meta.glob<string>("../../registry/*/*/spec.md", { eager: true, query: "?raw", import: "default" });
const docFiles = import.meta.glob<string>("../../docs/*/*.md", { eager: true, query: "?raw", import: "default" });

export interface Item {
  /** "components/chat-bubble" */
  id: string;
  slug: string;
  meta: ItemMeta;
  Demo: ComponentType;
  readme: string;
  /** 기획 문서 (기능 명세, 적용 사례는 PRD 요약 포함) */
  spec: string;
  source: { file: string; code: string }[];
}

export const items: Item[] = Object.entries(metas).map(([path, mod]) => {
  const id = path.split("/").slice(3, 5).join("/");
  const base = `../../registry/${id}`;
  return {
    id,
    slug: id.split("/")[1],
    meta: mod.meta,
    Demo: demos[`${base}/demo.tsx`].default,
    readme: readmes[`${base}/README.md`] ?? "",
    spec: specs[`${base}/spec.md`] ?? "",
    source: Object.entries(sources)
      .filter(([p]) => p.startsWith(`${base}/`))
      .map(([p, code]) => ({ file: p.split("/").pop()!, code }))
      .sort((a, b) => Number(/^[a-z]/.test(a.file)) - Number(/^[a-z]/.test(b.file)) || a.file.localeCompare(b.file)),
  };
});

export const find = (id: string) => items.find((i) => i.id === id);

const groupIndex = (g?: Group) => GROUPS.findIndex((x) => x.key === g);

export const components = items
  .filter((i) => i.meta.category === "components")
  .sort((a, b) => groupIndex(a.meta.group) - groupIndex(b.meta.group) || (a.meta.order ?? 99) - (b.meta.order ?? 99));

/** order(실제 에셋이 있는 사례가 앞), 그다음 추가일 역순 */
export const blocks = items
  .filter((i) => i.meta.category === "blocks")
  .sort((a, b) => (a.meta.order ?? 99) - (b.meta.order ?? 99) || b.meta.added.localeCompare(a.meta.added));

export const byGroup = GROUPS.map((g) => ({ ...g, items: components.filter((c) => c.meta.group === g.key) })).filter((g) => g.items.length);

export const usedBy = (id: string) => blocks.filter((b) => b.meta.uses?.includes(id));

export const groupLabel = (g?: Group) => GROUPS.find((x) => x.key === g)?.label ?? "";

export const categoryLabel: Record<Category, string> = { blocks: "적용 사례", components: "컴포넌트" };

const SECTIONS: Record<string, string> = { "getting-started": "시작하기", pm: "기획", elements: "요소" };

export interface Doc {
  slug: string;
  section: string;
  title: string;
  summary: string;
  body: string;
}

const sectionRank = (path: string) => Object.keys(SECTIONS).indexOf(path.split("/").slice(-2)[0]);

export const docs: Doc[] = Object.entries(docFiles)
  .sort(([a], [b]) => sectionRank(a) - sectionRank(b) || a.localeCompare(b))
  .map(([path, raw]) => {
    const [dir, file] = path.split("/").slice(-2);
    const title = raw.match(/^# (.+)$/m)?.[1] ?? file;
    const afterTitle = raw.replace(/^# .+\n+/, "");
    const summary = afterTitle.match(/^([^\n#|`<-][^\n]*)\n/)?.[1] ?? "";
    return {
      slug: file.replace(/^\d+-/, "").replace(/\.md$/, ""),
      section: SECTIONS[dir] ?? dir,
      title,
      summary,
      body: summary ? afterTitle.slice(afterTitle.indexOf(summary) + summary.length) : afterTitle,
    };
  });

export const docSections = Object.values(SECTIONS)
  .map((label) => ({ label, docs: docs.filter((d) => d.section === label) }))
  .filter((s) => s.docs.length);

/** README에서 제목과 첫 문단(= summary와 겹침)을 뺀 본문 */
export const readmeBody = (md: string) => md.replace(/^# .+\n+/, "").replace(/^(?!#|\||`|<|-)[^\n]+\n+/, "");
