/**
 * Generates a law's Markdown files for the public legislacao-br repository.
 *
 *   npm run ingest -- constituicao-1988 --out ../legislacao-br/normas
 *   npm run ingest -- constituicao-1988 --out ../legislacao-br/normas --html page.htm
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { parseArgs } from "node:util";
import { LAWS } from "./laws/index.js";
import { extractBlocks } from "./parsers/blocks.js";
import { buildStructure } from "./parsers/structure.js";
import { decode, download } from "./sources/planalto.js";
import { findGaps } from "./validate.js";
import { lawToMarkdown, preambleToMarkdown } from "./writing/law.js";
import { articleToMarkdown, fileName } from "./writing/markdown.js";
import { keepIfOnlyCaptureDateChanged } from "./writing/stable.js";

const GENERATED = /^(?:[a-z]+-)?art-[\w-]+\.md$/;

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    out: { type: "string" },
    html: { type: "string" },
    force: { type: "boolean", default: false },
  },
});

const [slug] = positionals;
const config = slug ? LAWS[slug] : undefined;
if (!config || !values.out) {
  console.error(`Usage: npm run ingest -- <law> --out <dir> [--html <file>] [--force]`);
  console.error(`Laws: ${Object.keys(LAWS).join(", ")}`);
  process.exit(2);
}

const capturedAt = new Date().toLocaleDateString("sv-SE");
let html: string;
if (values.html) {
  html = decode(readFileSync(values.html));
} else {
  console.log(`Downloading ${config.url}`);
  const page = await download(config.url);
  const rawDir = join(import.meta.dirname, "raw", config.description.law);
  mkdirSync(rawDir, { recursive: true });
  writeFileSync(join(rawDir, `${capturedAt}.htm`), page.bytes);
  html = page.html;
}

const structure = buildStructure(extractBlocks(html), config.structure);
const gaps = findGaps(structure.articles);

for (const warning of structure.warnings) console.warn(`warning: ${warning}`);
for (const [part, numbers] of Object.entries(gaps)) {
  console.warn(`warning: missing articles in ${part}: ${numbers.join(", ")}`);
}
if ((structure.warnings.length || Object.keys(gaps).length) && !values.force) {
  console.error("Aborted: fix the warnings or run with --force.");
  process.exit(1);
}

const description = { ...config.description, source: config.url, capturedAt };
const dir = join(values.out, description.law);
mkdirSync(dir, { recursive: true });

const files = new Map<string, string>();
files.set("_norma.md", lawToMarkdown(structure.articles, description, { preamble: structure.preamble.length > 0 }));
if (structure.preamble.length) files.set("preambulo.md", preambleToMarkdown(structure.preamble, description));
for (const article of structure.articles) {
  files.set(fileName(article), articleToMarkdown(article, { law: description.law, source: config.url, capturedAt }));
}

// Article files no longer present in the source (should not happen:
// repealed articles stay on the page).
const stale = readdirSync(dir).filter((f) => GENERATED.test(f) && !files.has(f));
for (const f of stale) rmSync(join(dir, f));

// Files change only when their content changes: a new capture date alone is
// not a change, and _norma.md takes the new date only if something changed.
const previous = (name: string) => (existsSync(join(dir, name)) ? readFileSync(join(dir, name), "utf8") : undefined);
const changed: string[] = [];
for (const [name, content] of files) {
  if (name === "_norma.md") continue;
  const before = previous(name);
  const after = keepIfOnlyCaptureDateChanged(before, content);
  if (after !== before) {
    writeFileSync(join(dir, name), after);
    changed.push(name);
  }
}
const lawBefore = previous("_norma.md");
const lawFile = files.get("_norma.md")!;
const lawAfter = changed.length || stale.length ? lawFile : keepIfOnlyCaptureDateChanged(lawBefore, lawFile);
if (lawAfter !== lawBefore) {
  writeFileSync(join(dir, "_norma.md"), lawAfter);
  changed.push("_norma.md");
}

const repealed = structure.articles.filter((a) => a.caput.length === 0).length;
console.log(`${files.size} files in ${dir}, ${changed.length} changed`);
console.log(`  articles: ${structure.articles.length} (${repealed} repealed in full)`);
if (stale.length) console.log(`  removed: ${stale.join(", ")}`);
