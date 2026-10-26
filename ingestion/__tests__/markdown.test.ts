import { describe, expect, it } from "vitest";
import { parse } from "yaml";
import type { Article } from "../parsers/structure.js";
import { articleLabel, articleToMarkdown, fileName } from "../writing/markdown.js";

const meta = {
  law: "constituicao-1988",
  source: "https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm",
  capturedAt: "2026-10-21",
};

const article = (partial: Partial<Article>): Article => ({
  part: "principal",
  number: "1",
  hierarchy: {},
  caput: [],
  notes: [],
  children: [],
  ...partial,
});

const frontmatter = (md: string) => parse(md.split("---\n")[1]!);
const body = (md: string) => md.split("---\n").slice(2).join("---\n");

describe("fileName", () => {
  it.each([
    [article({ number: "5" }), "art-005.md"],
    [article({ number: "196" }), "art-196.md"],
    [article({ number: "103-A" }), "art-103-a.md"],
    [article({ number: "1", part: "adct" }), "adct-art-001.md"],
  ])("%#", (a, name) => {
    expect(fileName(a)).toBe(name);
  });
});

describe("articleLabel", () => {
  it.each([
    [article({ number: "5" }), "Art. 5º"],
    [article({ number: "10" }), "Art. 10"],
    [article({ number: "103-A" }), "Art. 103-A"],
    [article({ number: "2", part: "adct" }), "Art. 2º do ADCT"],
  ])("%#", (a, label) => {
    expect(articleLabel(a)).toBe(label);
  });
});

describe("articleToMarkdown", () => {
  it("writes frontmatter with identification, hierarchy and source", () => {
    const md = articleToMarkdown(
      article({
        number: "196",
        hierarchy: { title: "Título VIII – Da Ordem Social", section: "Seção II – Da Saúde" },
        caput: ["A saúde é direito de todos."],
      }),
      meta,
    );

    expect(frontmatter(md)).toEqual({
      id: "constituicao-1988-art-196",
      norma: "constituicao-1988",
      artigo: "196",
      rotulo: "Art. 196",
      hierarquia: { titulo: "Título VIII – Da Ordem Social", secao: "Seção II – Da Saúde" },
      fonte: meta.source,
      capturado_em: "2026-10-21",
      revogado: false,
      notas: [],
    });
    expect(body(md)).toBe("\n# Art. 196\n\nA saúde é direito de todos.\n");
  });

  it("writes clauses, paragraphs and subclauses with stable anchors", () => {
    const md = articleToMarkdown(
      article({
        number: "5",
        caput: ["Todos são iguais:"],
        children: [
          { type: "clause", number: "I", text: ["homens e mulheres;"], notes: [], children: [] },
          {
            type: "clause",
            number: "XXVIII",
            text: ["são assegurados:"],
            notes: [],
            children: [{ type: "subclause", number: "a", text: ["a proteção;"], notes: [], children: [] }],
          },
          { type: "paragraph", number: "1", text: ["As normas."], notes: [], children: [] },
          { type: "paragraph", number: "4-A", text: ["Acrescido."], notes: [], children: [] },
          {
            type: "paragraph",
            number: "unico",
            text: ["Único:"],
            notes: [],
            children: [{ type: "clause", number: "II-A", text: ["acrescido;"], notes: [], children: [] }],
          },
        ],
      }),
      meta,
    );

    expect(body(md)).toBe(
      [
        "",
        "# Art. 5º",
        "",
        "Todos são iguais:",
        "",
        '## <a id="inc-1"></a>Inciso I',
        "",
        "homens e mulheres;",
        "",
        '## <a id="inc-28"></a>Inciso XXVIII',
        "",
        "são assegurados:",
        "",
        '### <a id="inc-28-al-a"></a>Alínea a',
        "",
        "a proteção;",
        "",
        '## <a id="par-1"></a>§ 1º',
        "",
        "As normas.",
        "",
        '## <a id="par-4-a"></a>§ 4º-A',
        "",
        "Acrescido.",
        "",
        '## <a id="par-unico"></a>Parágrafo único',
        "",
        "Único:",
        "",
        '### <a id="par-unico-inc-2-a"></a>Inciso II-A',
        "",
        "acrescido;",
        "",
      ].join("\n"),
    );
  });

  it("lists notes with the provision they refer to", () => {
    const md = articleToMarkdown(
      article({
        number: "6",
        caput: ["São direitos sociais."],
        notes: ["Redação dada pela Emenda Constitucional nº 90, de 2015"],
        children: [
          { type: "paragraph", number: "unico", text: ["Todo brasileiro."], notes: ["Incluído pela EC 114"], children: [] },
        ],
      }),
      meta,
    );

    expect(frontmatter(md).notas).toEqual([
      { dispositivo: "caput", texto: "Redação dada pela Emenda Constitucional nº 90, de 2015" },
      { dispositivo: "par-unico", texto: "Incluído pela EC 114" },
    ]);
  });

  it("marks an article repealed in full and writes (Revogado) in the body", () => {
    const md = articleToMarkdown(
      article({
        number: "117",
        notes: ["Revogado pela Emenda Constitucional nº 24, de 1999"],
        children: [{ type: "paragraph", number: "unico", text: [], notes: ["Revogado pela EC 24"], children: [] }],
      }),
      meta,
    );

    expect(frontmatter(md).revogado).toBe(true);
    expect(body(md)).toBe(
      ["", "# Art. 117", "", "*(Revogado)*", "", '## <a id="par-unico"></a>Parágrafo único', "", "*(Revogado)*", ""].join(
        "\n",
      ),
    );
  });

  it("recognizes a lowercase repeal note", () => {
    const md = articleToMarkdown(article({ number: "171", notes: ["revogado"] }), meta);

    expect(frontmatter(md).revogado).toBe(true);
  });

  it("omits an empty hierarchy", () => {
    const md = articleToMarkdown(article({ number: "1", part: "adct", caput: ["Texto."] }), meta);

    expect(frontmatter(md)).not.toHaveProperty("hierarquia");
    expect(frontmatter(md).id).toBe("constituicao-1988-adct-art-001");
  });

  it("marks as repealed an article struck without a repeal note", () => {
    const md = articleToMarkdown(
      article({
        number: "88",
        children: [{ type: "paragraph", number: "2", text: [], notes: ["Revogado pela Lei nº 4.589, de 1964"], children: [] }],
      }),
      meta,
    );

    expect(frontmatter(md).revogado).toBe(true);
    expect(body(md)).toContain("# Art. 88\n\n*(Revogado)*");
  });

  it("treats a suppression note as a repeal", () => {
    const md = articleToMarkdown(article({ number: "691", notes: ["Suprimido pelo Decreto-lei nº 8.737, de 1946"] }), meta);

    expect(frontmatter(md).revogado).toBe(true);
  });
});
