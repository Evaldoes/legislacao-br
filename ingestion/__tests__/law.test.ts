import { describe, expect, it } from "vitest";
import { parse } from "yaml";
import type { Article } from "../parsers/structure.js";
import { lawToMarkdown, preambleToMarkdown, type LawDescription } from "../writing/law.js";

const description: LawDescription = {
  law: "constituicao-1988",
  type: "constituicao",
  name: "Constituição da República Federativa do Brasil de 1988",
  date: "1988-10-05",
  aliases: ["cf88", "CF/88"],
  source: "https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm",
  capturedAt: "2026-10-21",
  parts: { adct: "Ato das Disposições Constitucionais Transitórias" },
};

const article = (part: string, number: string, hierarchy: Article["hierarchy"] = {}): Article => ({
  part,
  number,
  hierarchy,
  caput: ["texto"],
  notes: [],
  children: [],
});

const frontmatter = (md: string) => parse(md.split("---\n")[1]!);
const body = (md: string) => md.split("---\n").slice(2).join("---\n");

describe("preambleToMarkdown", () => {
  it("writes the preamble with its own frontmatter", () => {
    const md = preambleToMarkdown(["Nós, representantes do povo brasileiro."], description);

    expect(frontmatter(md)).toEqual({
      id: "constituicao-1988-preambulo",
      norma: "constituicao-1988",
      rotulo: "Preâmbulo",
      fonte: description.source,
      capturado_em: "2026-10-21",
    });
    expect(body(md)).toBe("\n# Preâmbulo\n\nNós, representantes do povo brasileiro.\n");
  });
});

describe("lawToMarkdown", () => {
  it("writes metadata and an index by hierarchy with links", () => {
    const md = lawToMarkdown(
      [
        article("principal", "1", { title: "Título I – Dos Princípios" }),
        article("principal", "2", { title: "Título I – Dos Princípios" }),
        article("principal", "5", { title: "Título II – Dos Direitos", chapter: "Capítulo I – Dos Deveres" }),
        article("adct", "1"),
      ],
      description,
      { preamble: true },
    );

    expect(frontmatter(md)).toEqual({
      norma: "constituicao-1988",
      tipo: "constituicao",
      nome: description.name,
      data: "1988-10-05",
      apelidos: ["cf88", "CF/88"],
      fonte: description.source,
      capturado_em: "2026-10-21",
      artigos: { principal: 3, adct: 1 },
    });
    expect(body(md)).toBe(
      [
        "",
        "# Constituição da República Federativa do Brasil de 1988",
        "",
        "[Preâmbulo](preambulo.md)",
        "",
        "## Título I – Dos Princípios",
        "",
        "[Art. 1º](art-001.md) · [Art. 2º](art-002.md)",
        "",
        "## Título II – Dos Direitos",
        "",
        "### Capítulo I – Dos Deveres",
        "",
        "[Art. 5º](art-005.md)",
        "",
        "## Ato das Disposições Constitucionais Transitórias",
        "",
        "[Art. 1º do ADCT](adct-art-001.md)",
        "",
      ].join("\n"),
    );
  });
});
