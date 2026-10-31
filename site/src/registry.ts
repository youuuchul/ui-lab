import type { ComponentType } from "react";
import type { Category, ItemMeta } from "../../registry/types";

const metas = import.meta.glob<{ meta: ItemMeta }>("../../registry/*/*/meta.ts", { eager: true });
const demos = import.meta.glob<{ default: ComponentType }>("../../registry/*/*/demo.tsx", { eager: true });
const readmes = import.meta.glob<string>("../../registry/*/*/README.md", { eager: true, query: "?raw", import: "default" });
const sources = import.meta.glob<string>("../../registry/*/*/[A-Z]*.tsx", { eager: true, query: "?raw", import: "default" });
const docFiles = import.meta.glob<string>("../../docs/*.md", { eager: true, query: "?raw", import: "default" });

export interface Item {
  slug: string;
  meta: ItemMeta;
  Demo: ComponentType;
  readme: string;
  source: { file: string; code: string }[];
}

const dirOf = (path: string) => path.split("/").slice(3, 5).join("/");

export const items: Item[] = Object.entries(metas)
  .map(([path, mod]) => {
    const dir = dirOf(path);
    const base = `../../registry/${dir}`;
    return {
      slug: dir,
      meta: mod.meta,
      Demo: demos[`${base}/demo.tsx`].default,
      readme: readmes[`${base}/README.md`] ?? "",
      source: Object.entries(sources)
        .filter(([p]) => p.startsWith(`${base}/`))
        .map(([p, code]) => ({ file: p.split("/").pop()!, code })),
    };
  })
  .sort((a, b) => b.meta.added.localeCompare(a.meta.added));

export const byCategory = (c: Category) => items.filter((i) => i.meta.category === c);

export const docs = Object.entries(docFiles)
  .map(([path, body]) => ({
    slug: path.split("/").pop()!.replace(/\.md$/, ""),
    title: body.match(/^# (.+)$/m)?.[1] ?? path,
    body,
  }))
  .sort((a, b) => (a.slug === "README" ? -1 : b.slug === "README" ? 1 : a.slug.localeCompare(b.slug)));
