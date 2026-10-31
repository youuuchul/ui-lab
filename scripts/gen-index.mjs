import { readdirSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const registry = join(dirname(fileURLToPath(import.meta.url)), "..", "registry");
const entries = [];
for (const category of ["components", "blocks"]) {
  const dir = join(registry, category);
  if (!existsSync(dir)) continue;
  for (const slug of readdirSync(dir).sort()) {
    if (existsSync(join(dir, slug, "demo.tsx"))) entries.push(`${category}/${slug}`);
  }
}

const lines = entries.map((e, i) => `import D${i} from "./${e}/demo";`);
lines.push("", "export const demos = [");
entries.forEach((e, i) => lines.push(`  { slug: "${e}", Demo: D${i} },`));
lines.push("];", "");
writeFileSync(join(registry, "index.gen.ts"), lines.join("\n"));
console.log(`registry/index.gen.ts: ${entries.length} items`);
