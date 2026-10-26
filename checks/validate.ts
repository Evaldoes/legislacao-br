import { FrontmatterError, indexOrder, parseArticleBody, partFromFileName, splitFrontmatter, type FileParts, type LawFolder, type RawFile } from "./read.js";

export type Issue = { file: string; message: string };

const LAW_FIELDS = ["norma", "tipo", "nome", "data", "fonte", "capturado_em"];
const ARTICLE_FIELDS = ["id", "norma", "artigo", "rotulo", "revogado", "notas"];
const PREAMBLE_FIELDS = ["norma"];

/**
 * Checks a law folder before anything is written. Returns every problem
 * found (file + reason); an empty list means the folder can be imported.
 */
export function validateLaw(folder: LawFolder): Issue[] {
  const issues: Issue[] = [];
  const report = (file: string, message: string) => issues.push({ file, message });

  const read = (file: RawFile, required: string[]): FileParts | null => {
    let parts: FileParts;
    try {
      parts = splitFrontmatter(file.content);
    } catch (e) {
      if (e instanceof FrontmatterError) {
        report(file.name, e.message);
        return null;
      }
      throw e;
    }
    for (const field of required) {
      if (parts.frontmatter[field] === undefined || parts.frontmatter[field] === null) {
        report(file.name, `missing field "${field}"`);
      }
    }
    const law = parts.frontmatter.norma;
    if (law !== undefined && law !== folder.slug) {
      report(file.name, `field "norma" is "${String(law)}", expected "${folder.slug}"`);
    }
    return parts;
  };

  if (!folder.lawFile) {
    report("_norma.md", "file not found");
    return issues;
  }
  const lawParts = read(folder.lawFile, LAW_FIELDS);
  if (folder.preambleFile) read(folder.preambleFile, PREAMBLE_FIELDS);

  const ids = new Set<string>();
  const numbersByPart = new Map<string, Set<number>>();
  for (const file of folder.articleFiles) {
    // Number from the file name ("art-103-a.md" counts as 103), so lettered
    // articles never fill or open a gap and unreadable files still count.
    const base = Number(/art-(\d+)/.exec(file.name)?.[1]);
    if (base > 0) {
      const part = partFromFileName(file.name);
      if (!numbersByPart.has(part)) numbersByPart.set(part, new Set());
      numbersByPart.get(part)!.add(base);
    }

    const parts = read(file, ARTICLE_FIELDS);
    if (!parts) continue;

    const id = parts.frontmatter.id;
    if (typeof id === "string") {
      if (ids.has(id)) report(file.name, `duplicate id "${id}"`);
      ids.add(id);
      const expected = `${folder.slug}-${file.name.replace(/\.md$/, "")}`;
      if (id !== expected) report(file.name, `id "${id}" does not match the file name (expected "${expected}")`);
    }


    const anchors = new Set<string>();
    for (const { anchor } of parseArticleBody(parts.body).provisions) {
      if (anchors.has(anchor)) report(file.name, `duplicate anchor "${anchor}"`);
      anchors.add(anchor);
    }

    const notes = parts.frontmatter.notas;
    if (notes !== undefined && !Array.isArray(notes)) {
      report(file.name, 'field "notas" must be a list');
    } else {
      for (const note of (notes as unknown[] | undefined) ?? []) {
        const { dispositivo, texto } = (note ?? {}) as Record<string, unknown>;
        if (typeof dispositivo !== "string" || typeof texto !== "string") {
          report(file.name, "malformed note (expected dispositivo and texto)");
        } else if (dispositivo !== "caput" && !anchors.has(dispositivo)) {
          report(file.name, `note refers to nonexistent provision "${dispositivo}"`);
        }
      }
    }
  }

  if (lawParts) {
    const indexed = indexOrder(lawParts.body);
    const indexedSet = new Set(indexed);
    const present = new Set(folder.articleFiles.map((f) => f.name));

    for (const name of indexed) {
      if (!present.has(name)) report("_norma.md", `index links to missing file "${name}"`);
    }
    for (const file of folder.articleFiles) {
      if (!indexedSet.has(file.name)) report(file.name, "not listed in the _norma.md index");
    }
  }

  for (const [part, numbers] of numbersByPart) {
    const missing: number[] = [];
    for (let n = 1; n <= Math.max(...numbers); n++) if (!numbers.has(n)) missing.push(n);
    if (missing.length) report("_norma.md", `missing articles in ${part}: ${missing.join(", ")}`);
  }

  return issues;
}
