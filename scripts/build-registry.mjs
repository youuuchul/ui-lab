// registry/ → site/public/r/*.json (shadcn registry-item), llms.txt, llms-full.txt, 문서의 항목 표
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SITE = "https://youuuchul.github.io/ui-lab";
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const reg = join(root, "registry");
const out = join(root, "site/public/r");
mkdirSync(out, { recursive: true });

const pkg = JSON.parse(readFileSync(join(root, "site/package.json"), "utf8"));
const versions = { ...pkg.dependencies, ...pkg.devDependencies };
const GROUPS = Object.fromEntries([...readFileSync(join(reg, "types.ts"), "utf8").matchAll(/key: "(\w+)", label: "([^"]+)"/g)].map((m) => [m[1], m[2]]));

const field = (src, k) => src.match(new RegExp(`"?${k}"?: "([^"]*)"`))?.[1];
const list = (src, k) => {
  const m = src.match(new RegExp(`"?${k}"?: \\[([^\\]]*)\\]`));
  return m ? [...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]) : [];
};

const items = [];
for (const category of ["blocks", "components"]) {
  const dir = join(reg, category);
  if (!existsSync(dir)) continue;
  for (const slug of readdirSync(dir).sort()) {
    const base = join(dir, slug);
    if (!existsSync(join(base, "meta.ts"))) continue;
    const meta = readFileSync(join(base, "meta.ts"), "utf8");
    const files = readdirSync(base).filter((f) => /\.(tsx?|css)$/.test(f) && f !== "demo.tsx" && f !== "meta.ts");
    const deps = new Set();
    const regDeps = new Set();
    const fileEntries = files.map((f) => {
      const content = readFileSync(join(base, f), "utf8");
      for (const m of content.matchAll(/from "([^"]+)"/g)) {
        const spec = m[1];
        if (spec.startsWith("../../components/")) regDeps.add(`${SITE}/r/${spec.split("/")[3]}.json`);
        else if (!spec.startsWith(".") && !/^react(-dom)?(\/|$)/.test(spec)) {
          const name = spec.startsWith("@") ? spec.split("/").slice(0, 2).join("/") : spec.split("/")[0];
          deps.add(versions[name] ? `${name}@${versions[name]}` : name);
        }
      }
      return {
        path: `registry/${category}/${slug}/${f}`,
        type: category === "blocks" ? "registry:block" : "registry:component",
        target: `components/ui-lab/${category}/${slug}/${f}`,
        content,
      };
    });
    const item = {
      $schema: "https://ui.shadcn.com/schema/registry-item.json",
      name: slug,
      type: category === "blocks" ? "registry:block" : "registry:component",
      title: field(meta, "title"),
      description: field(meta, "summary"),
      dependencies: [...deps],
      registryDependencies: [`${SITE}/r/tokens.json`, ...regDeps],
      files: fileEntries,
      categories: [category, field(meta, "group")].filter(Boolean),
    };
    writeFileSync(join(out, `${slug}.json`), JSON.stringify(item, null, 2));
    const readme = existsSync(join(base, "README.md")) ? readFileSync(join(base, "README.md"), "utf8") : "";
    items.push({ category, slug, meta, item, readme, group: field(meta, "group"), source: field(meta, "project") });
  }
}

const tokens = readFileSync(join(reg, "tokens.css"), "utf8");
writeFileSync(
  join(out, "tokens.json"),
  JSON.stringify(
    {
      $schema: "https://ui.shadcn.com/schema/registry-item.json",
      name: "tokens",
      type: "registry:file",
      title: "디자인 토큰",
      description: "색·모서리·글꼴 토큰. 전역 CSS에서 tailwindcss 다음에 import한다.",
      files: [{ path: "registry/tokens.css", type: "registry:file", target: "styles/ui-lab-tokens.css", content: tokens }],
    },
    null,
    2,
  ),
);

writeFileSync(
  join(out, "index.json"),
  JSON.stringify(
    {
      $schema: "https://ui.shadcn.com/schema/registry.json",
      name: "ui-lab",
      homepage: SITE,
      items: items.map(({ item }) => ({ name: item.name, type: item.type, title: item.title, description: item.description })),
    },
    null,
    2,
  ),
);

const line = (i) => `- [${i.item.title}](${SITE}/#/${i.category}/${i.slug}): ${i.item.description} 설치: ${SITE}/r/${i.slug}.json`;
const llms = [
  "# youuuchul's UI Lab",
  "",
  "> React + TypeScript + Tailwind 4 컴포넌트와 적용 사례 모음. Vite·Next 공용. shadcn 레지스트리 형식으로 설치한다.",
  "",
  `설치: \`npx shadcn@latest add ${SITE}/r/<name>.json\` — 토큰(${SITE}/r/tokens.json)이 함께 설치된다. 전역 CSS에서 \`@import "tailwindcss";\` 다음 줄에 \`@import "./styles/ui-lab-tokens.css";\`를 넣는다.`,
  "",
  "## 적용 사례",
  ...items.filter((i) => i.category === "blocks").map(line),
  "",
  ...Object.entries(GROUPS).flatMap(([k, label]) => {
    const g = items.filter((i) => i.category === "components" && i.group === k);
    return g.length ? [`## 컴포넌트 · ${label}`, ...g.map(line), ""] : [];
  }),
  "## 문서",
  `- 전체 참조: ${SITE}/llms-full.txt`,
  `- 레지스트리 인덱스: ${SITE}/r/index.json`,
  "",
].join("\n");
writeFileSync(join(root, "site/public/llms.txt"), llms);

const docsDir = join(root, "docs");
const docText = readdirSync(docsDir)
  .sort()
  .flatMap((d) =>
    existsSync(join(docsDir, d)) && !d.endsWith(".md")
      ? readdirSync(join(docsDir, d)).sort().map((f) => readFileSync(join(docsDir, d, f), "utf8"))
      : [],
  );
writeFileSync(
  join(root, "site/public/llms-full.txt"),
  [llms, "\n---\n", ...docText, "\n---\n", ...items.map((i) => `${i.readme}\n\n설치: ${SITE}/r/${i.slug}.json\n`)].join("\n"),
);

// 원문에서도 표로 보이게 열 폭을 맞춘다 (한글·한자 2칸)
const cw = (str) => [...str].reduce((n, ch) => n + (/[\u1100-\u11ff\u2e80-\ua4cf\uac00-\ud7a3\uf900-\ufaff\uff00-\uffef]/.test(ch) ? 2 : 1), 0);
const alignTable = (rows) => {
  const widths = rows[0].map((_, c) => Math.max(3, ...rows.map((r) => (r === "sep" ? 3 : cw(r[c])))));
  return rows
    .map((r) => (r === "sep" ? `|${widths.map((w) => "-".repeat(w + 2)).join("|")}|` : `| ${r.map((cell, c) => cell + " ".repeat(widths[c] - cw(cell))).join(" | ")} |`))
    .join("\n");
};

// 문서의 항목 표
const regDoc = join(docsDir, "getting-started/04-registry.md");
if (existsSync(regDoc)) {
  const table = alignTable([
    ["이름", "종류", "분류", "레지스트리 주소"],
    "sep",
    ...items.map((i) => [
      `[${i.item.title}](#/${i.category}/${i.slug})`,
      i.category === "blocks" ? "적용 사례" : "컴포넌트",
      i.category === "blocks" ? i.source ?? "" : GROUPS[i.group] ?? "",
      `\`/r/${i.slug}.json\``,
    ]),
  ]);
  const src = readFileSync(regDoc, "utf8");
  writeFileSync(regDoc, src.replace(/<!-- items:start -->[\s\S]*<!-- items:end -->/, `<!-- items:start -->\n${table}\n<!-- items:end -->`));
}

// README 카탈로그
const readmePath = join(root, "README.md");
const catalog = alignTable([
  ["이름", "종류", "분류", "출처"],
  "sep",
  ...items.map((i) => [
    `[${i.item.title}](registry/${i.category}/${i.slug})`,
    i.category === "blocks" ? "적용 사례" : "컴포넌트",
    i.category === "blocks" ? "" : GROUPS[i.group] ?? "",
    i.source ?? "",
  ]),
]);
writeFileSync(
  readmePath,
  readFileSync(readmePath, "utf8").replace(/<!-- catalog:start -->[\s\S]*<!-- catalog:end -->/, `<!-- catalog:start -->\n${catalog}\n<!-- catalog:end -->`),
);

console.log(`registry: ${items.length} items → site/public/r, llms.txt`);
