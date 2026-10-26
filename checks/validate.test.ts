import { describe, expect, it } from "vitest";
import type { LawFolder, RawFile } from "./read.js";
import { validateLaw } from "./validate.js";

const LAW = `---
norma: lei-1-2000
tipo: lei
nome: Lei nº 1, de 2000
data: 2000-01-01
apelidos: []
fonte: f
capturado_em: 2026-10-22
---

# Lei nº 1, de 2000

[Art. 1º](art-001.md) · [Art. 2º](art-002.md)
`;

type Fields = Record<string, string>;

const frontmatterOf = (fields: Fields) =>
  Object.entries(fields)
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");

const articleContent = (overrides: Fields = {}, body = "Texto.") => {
  const fields: Fields = {
    id: "lei-1-2000-art-001",
    norma: "lei-1-2000",
    artigo: '"1"',
    rotulo: "Art. 1º",
    fonte: "f",
    capturado_em: "2026-10-22",
    revogado: "false",
    notas: "[]",
    ...overrides,
  };
  for (const [k, v] of Object.entries(fields)) if (v === "<omit>") delete fields[k];
  return `---\n${frontmatterOf(fields)}\n---\n\n# Art.\n\n${body}\n`;
};

const folder = (articleFiles?: RawFile[]): LawFolder => ({
  slug: "lei-1-2000",
  lawFile: { name: "_norma.md", content: LAW },
  preambleFile: null,
  articleFiles: articleFiles ?? [
    { name: "art-001.md", content: articleContent() },
    { name: "art-002.md", content: articleContent({ id: "lei-1-2000-art-002", artigo: '"2"', rotulo: "Art. 2º" }) },
  ],
});

const replaceFirst = (content: string): LawFolder => {
  const f = folder();
  f.articleFiles[0] = { name: "art-001.md", content };
  return f;
};

describe("validateLaw", () => {
  it("accepts a valid folder", () => {
    expect(validateLaw(folder())).toEqual([]);
  });

  it("requires _norma.md", () => {
    expect(validateLaw({ ...folder(), lawFile: null })).toEqual([
      { file: "_norma.md", message: "file not found" },
    ]);
  });

  it("rejects a file without frontmatter", () => {
    expect(validateLaw(replaceFirst("# Art. 1º\n\nTexto.\n"))).toEqual([
      { file: "art-001.md", message: "missing frontmatter" },
    ]);
  });

  it("rejects malformed frontmatter", () => {
    const [issue] = validateLaw(replaceFirst("---\nid: [unclosed\n---\n\nTexto.\n"));

    expect(issue).toMatchObject({ file: "art-001.md" });
    expect(issue?.message).toMatch(/^malformed frontmatter/);
  });

  it.each(["id", "norma", "artigo", "rotulo", "revogado", "notas"])("requires the field %s", (field) => {
    expect(validateLaw(replaceFirst(articleContent({ [field]: "<omit>" })))).toContainEqual({
      file: "art-001.md",
      message: `missing field "${field}"`,
    });
  });

  it("requires the fields of _norma.md", () => {
    const f = folder();
    f.lawFile = { name: "_norma.md", content: LAW.replace("nome: Lei nº 1, de 2000\n", "") };

    expect(validateLaw(f)).toEqual([{ file: "_norma.md", message: 'missing field "nome"' }]);
  });

  it("rejects a norma field different from the folder", () => {
    expect(validateLaw(replaceFirst(articleContent({ norma: "outra-lei" })))).toEqual([
      { file: "art-001.md", message: 'field "norma" is "outra-lei", expected "lei-1-2000"' },
    ]);
  });

  it("rejects a duplicate id", () => {
    const f = folder();
    f.articleFiles[1] = { name: "art-002.md", content: articleContent() };

    expect(validateLaw(f)).toContainEqual({ file: "art-002.md", message: 'duplicate id "lei-1-2000-art-001"' });
  });

  it("rejects a duplicate anchor in the same article", () => {
    const body = '## <a id="inc-1"></a>Inciso I\n\na;\n\n## <a id="inc-1"></a>Inciso I\n\nb;';

    expect(validateLaw(replaceFirst(articleContent({}, body)))).toEqual([
      { file: "art-001.md", message: 'duplicate anchor "inc-1"' },
    ]);
  });

  it("rejects a note pointing to a nonexistent provision", () => {
    const content = articleContent({ notas: "\n  - dispositivo: inc-99\n    texto: Vide X" });

    expect(validateLaw(replaceFirst(content))).toEqual([
      { file: "art-001.md", message: 'note refers to nonexistent provision "inc-99"' },
    ]);
  });

  it("rejects an article file missing from the index", () => {
    const f = folder();
    f.articleFiles.push({ name: "art-003.md", content: articleContent({ id: "lei-1-2000-art-003", artigo: '"3"' }) });

    expect(validateLaw(f)).toEqual([{ file: "art-003.md", message: "not listed in the _norma.md index" }]);
  });

  it("rejects an index link to a missing file", () => {
    const f = folder();
    f.articleFiles.pop();

    expect(validateLaw(f)).toEqual([{ file: "_norma.md", message: 'index links to missing file "art-002.md"' }]);
  });

  it("reports every problem, not just the first", () => {
    const f = folder();
    f.articleFiles[0] = { name: "art-001.md", content: articleContent({ rotulo: "<omit>" }) };
    f.articleFiles[1] = { name: "art-002.md", content: "sem frontmatter" };

    expect(validateLaw(f)).toHaveLength(2);
  });

  it("rejects an id that does not match the file name", () => {
    const issues = validateLaw(replaceFirst(articleContent({ id: "lei-1-2000-art-009" })));
    expect(issues).toContainEqual({ file: "art-001.md", message: 'id "lei-1-2000-art-009" does not match the file name (expected "lei-1-2000-art-001")' });
  });

  it("reports articles missing from the numbering of each part", () => {
    const law = LAW.replace("[Art. 2º](art-002.md)", "[Art. 3º](art-003.md)");
    const issues = validateLaw({
      ...folder([
        { name: "art-001.md", content: articleContent() },
        { name: "art-003.md", content: articleContent({ id: "lei-1-2000-art-003", artigo: '"3"', rotulo: "Art. 3º" }) },
      ]),
      lawFile: { name: "_norma.md", content: law },
    });
    expect(issues).toEqual([{ file: "_norma.md", message: "missing articles in principal: 2" }]);
  });

  it("does not count lettered articles as gaps", () => {
    const law = LAW.replace("[Art. 2º](art-002.md)", "[Art. 1º-A](art-001-a.md) · [Art. 2º](art-002.md)");
    const issues = validateLaw({
      ...folder([
        { name: "art-001.md", content: articleContent() },
        { name: "art-001-a.md", content: articleContent({ id: "lei-1-2000-art-001-a", artigo: '"1-A"', rotulo: "Art. 1º-A" }) },
        { name: "art-002.md", content: articleContent({ id: "lei-1-2000-art-002", artigo: '"2"', rotulo: "Art. 2º" }) },
      ]),
      lawFile: { name: "_norma.md", content: law },
    });
    expect(issues).toEqual([]);
  });
});

