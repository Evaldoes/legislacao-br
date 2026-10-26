import { existsSync, readdirSync, readFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { parse } from "yaml";
import type { ArticleData, Hierarchy, LawData, ProvisionData, ProvisionType } from "./types.js";

// Format of the public legislacao-br repository (see its README). Frontmatter
// keys and labels are in Portuguese: they are the data contract.

const FRONTMATTER = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
const PROVISION_HEADING = /^#{2,6} <a id="([^"]+)"><\/a>(.+)$/;
// A letter suffix ("inc-2-a") is a single letter, so it does not swallow the "al" of "inc-16-al-a".
const ANCHOR_SEGMENT = /inc-\d+(?:-[a-z](?![a-z]))?|par-(?:\d+(?:-[a-z](?![a-z]))?|unico)|al-[a-z]/g;
const REPEALED_BODY = "*(Revogado)*";

const SEGMENT_TYPES: Record<string, ProvisionType> = { inc: "clause", par: "paragraph", al: "subclause" };

const PUBLIC_HIERARCHY_KEYS: Record<string, keyof Hierarchy> = {
  titulo: "title",
  capitulo: "chapter",
  secao: "section",
  subsecao: "subsection",
};

export class FrontmatterError extends Error {}

export type FileParts = { frontmatter: Record<string, unknown>; body: string };

export function splitFrontmatter(content: string): FileParts {
  const m = FRONTMATTER.exec(content.replace(/\r\n/g, "\n"));
  if (!m) throw new FrontmatterError("missing frontmatter");

  let frontmatter: unknown;
  try {
    frontmatter = parse(m[1]!);
  } catch (e) {
    throw new FrontmatterError(`malformed frontmatter: ${(e as Error).message.split("\n")[0]}`);
  }
  if (typeof frontmatter !== "object" || frontmatter === null || Array.isArray(frontmatter)) {
    throw new FrontmatterError("malformed frontmatter: expected a mapping");
  }
  return { frontmatter: frontmatter as Record<string, unknown>, body: m[2]! };
}

/** Part of an article, derived from its file name: "adct-art-001.md" → "adct". */
export function partFromFileName(fileName: string): string {
  return /^([a-z]+)-art-/.exec(fileName)?.[1] ?? "principal";
}

export function parseArticleBody(body: string): { caput: string; provisions: ProvisionData[] } {
  const caput: string[] = [];
  const provisions: ProvisionData[] = [];
  let current: { data: ProvisionData; paragraphs: string[] } | null = null;

  const close = () => {
    if (!current) return;
    const text = current.paragraphs.join("\n\n");
    current.data.repealed = text === REPEALED_BODY;
    current.data.text = current.data.repealed ? null : text;
    provisions.push(current.data);
  };

  for (const paragraph of paragraphsOf(body)) {
    if (paragraph.startsWith("# ")) continue;

    const heading = PROVISION_HEADING.exec(paragraph);
    if (heading) {
      close();
      const [, anchor = "", label = ""] = heading;
      const segments = anchor.match(ANCHOR_SEGMENT) ?? [];
      const last = segments.at(-1) ?? "";
      current = {
        data: {
          type: SEGMENT_TYPES[last.split("-")[0]!]!,
          anchor,
          parentAnchor: segments.length > 1 ? segments.slice(0, -1).join("-") : null,
          label,
          text: null,
          repealed: false,
          position: provisions.length,
        },
        paragraphs: [],
      };
      continue;
    }

    (current ? current.paragraphs : caput).push(paragraph);
  }
  close();

  const caputText = caput.join("\n\n");
  return { caput: caputText === REPEALED_BODY ? "" : caputText, provisions };
}

export function parseArticle(fileName: string, content: string): ArticleData {
  const { frontmatter: fm, body } = splitFrontmatter(content);
  const { caput, provisions } = parseArticleBody(body);

  const hierarchy: Hierarchy = {};
  for (const [key, value] of Object.entries((fm.hierarquia as Record<string, string> | undefined) ?? {})) {
    const own = PUBLIC_HIERARCHY_KEYS[key];
    if (own) hierarchy[own] = value;
  }

  const notes = ((fm.notas as { dispositivo: string; texto: string }[] | undefined) ?? []).map((n) => ({
    anchor: n.dispositivo === "caput" ? null : n.dispositivo,
    text: n.texto,
  }));

  return {
    slug: String(fm.id),
    part: partFromFileName(fileName),
    number: String(fm.artigo),
    label: String(fm.rotulo),
    hierarchy,
    caput,
    repealed: fm.revogado === true,
    provisions,
    notes,
  };
}

/** Paragraphs separated by blank lines, trimmed, without empty ones. */
function paragraphsOf(body: string): string[] {
  return body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export type RawFile = { name: string; content: string };

export type LawFolder = {
  /** Folder name, which must match the "norma" field of every file. */
  slug: string;
  lawFile: RawFile | null;
  preambleFile: RawFile | null;
  articleFiles: RawFile[];
};

const ARTICLE_FILE = /^(?:[a-z]+-)?art-[\w-]+\.md$/;
const INDEX_LINK = /\]\(((?:[a-z]+-)?art-[\w-]+\.md)\)/g;

export function readLawFolder(dir: string): LawFolder {
  const read = (name: string): RawFile | null =>
    existsSync(join(dir, name)) ? { name, content: readFileSync(join(dir, name), "utf8") } : null;

  return {
    slug: basename(resolve(dir)),
    lawFile: read("_norma.md"),
    preambleFile: read("preambulo.md"),
    articleFiles: readdirSync(dir)
      .filter((name) => ARTICLE_FILE.test(name))
      .map((name) => read(name)!),
  };
}

/** Article file names in the order they appear in the _norma.md index. */
export function indexOrder(lawBody: string): string[] {
  return [...lawBody.matchAll(INDEX_LINK)].map((m) => m[1]!);
}

/** Converts a folder that already passed validation into law data. */
export function parseLaw(folder: LawFolder): LawData {
  const { frontmatter: fm, body } = splitFrontmatter(folder.lawFile!.content);
  const byName = new Map(folder.articleFiles.map((f) => [f.name, f]));

  return {
    slug: String(fm.norma),
    type: String(fm.tipo),
    name: String(fm.nome),
    date: String(fm.data),
    aliases: ((fm.apelidos as unknown[] | undefined) ?? []).map(String),
    source: String(fm.fonte),
    capturedAt: String(fm.capturado_em),
    preamble: folder.preambleFile ? parseArticleBody(splitFrontmatter(folder.preambleFile.content).body).caput : null,
    articles: indexOrder(body).map((name) => parseArticle(name, byName.get(name)!.content)),
  };
}
