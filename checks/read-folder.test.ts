import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { parseLaw, readLawFolder, type LawFolder } from "./read.js";

const article = (id: string, number: string, label: string) => `---
id: ${id}
norma: constituicao-1988
artigo: "${number}"
rotulo: ${label}
fonte: f
capturado_em: 2026-10-22
revogado: false
notas: []
---

# ${label}

Texto do ${label}.
`;

const LAW = `---
norma: constituicao-1988
tipo: constituicao
nome: Constituição da República Federativa do Brasil de 1988
data: 1988-10-05
apelidos:
  - cf88
  - CF/88
fonte: https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm
capturado_em: 2026-10-22
artigos:
  principal: 3
  adct: 1
---

# Constituição da República Federativa do Brasil de 1988

[Preâmbulo](preambulo.md)

## Título IV – Da Organização dos Poderes

[Art. 103](art-103.md) · [Art. 103-A](art-103-a.md) · [Art. 104](art-104.md)

## Ato das Disposições Constitucionais Transitórias

[Art. 1º do ADCT](adct-art-001.md)
`;

const PREAMBLE = `---
id: constituicao-1988-preambulo
norma: constituicao-1988
rotulo: Preâmbulo
fonte: f
capturado_em: 2026-10-22
---

# Preâmbulo

Nós, representantes do povo brasileiro.
`;

const folder = (): LawFolder => ({
  slug: "constituicao-1988",
  lawFile: { name: "_norma.md", content: LAW },
  preambleFile: { name: "preambulo.md", content: PREAMBLE },
  articleFiles: [
    // Alphabetical file order differs from the official order.
    { name: "adct-art-001.md", content: article("constituicao-1988-adct-art-001", "1", "Art. 1º do ADCT") },
    { name: "art-103-a.md", content: article("constituicao-1988-art-103-a", "103-A", "Art. 103-A") },
    { name: "art-103.md", content: article("constituicao-1988-art-103", "103", "Art. 103") },
    { name: "art-104.md", content: article("constituicao-1988-art-104", "104", "Art. 104") },
  ],
});

describe("parseLaw", () => {
  it("reads the law metadata and the preamble", () => {
    const law = parseLaw(folder());

    expect(law).toMatchObject({
      slug: "constituicao-1988",
      type: "constituicao",
      name: "Constituição da República Federativa do Brasil de 1988",
      date: "1988-10-05",
      aliases: ["cf88", "CF/88"],
      source: "https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm",
      capturedAt: "2026-10-22",
      preamble: "Nós, representantes do povo brasileiro.",
    });
  });

  it("orders the articles by the _norma.md index", () => {
    const law = parseLaw(folder());

    expect(law.articles.map((a) => `${a.part}:${a.number}`)).toEqual([
      "principal:103",
      "principal:103-A",
      "principal:104",
      "adct:1",
    ]);
  });

  it("accepts a law without a preamble", () => {
    expect(parseLaw({ ...folder(), preambleFile: null }).preamble).toBeNull();
  });
});

describe("readLawFolder", () => {
  let dir: string;

  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  it("reads the law file, the preamble and the article files from disk", () => {
    dir = mkdtempSync(join(tmpdir(), "law-"));
    const lawDir = join(dir, "constituicao-1988");
    const f = folder();
    mkdirSync(lawDir);
    writeFileSync(join(lawDir, "_norma.md"), LAW);
    writeFileSync(join(lawDir, "preambulo.md"), PREAMBLE);
    for (const file of f.articleFiles) writeFileSync(join(lawDir, file.name), file.content);
    writeFileSync(join(lawDir, "notas-soltas.txt"), "ignored");

    const read = readLawFolder(lawDir);

    expect(read.slug).toBe("constituicao-1988");
    expect(read.lawFile?.content).toBe(LAW);
    expect(read.preambleFile?.content).toBe(PREAMBLE);
    expect(read.articleFiles.map((a) => a.name).sort()).toEqual(f.articleFiles.map((a) => a.name).sort());
  });
});
