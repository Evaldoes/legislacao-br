import { describe, expect, it } from "vitest";
import { buildStructure, readableName, type StructureOptions } from "../parsers/structure.js";

const options: StructureOptions = {
  start: /^PREÂMBULO$/,
  end: /^Brasília, 5 de outubro de 1988/,
  annexes: [{ marker: /^ATO DAS DISPOSIÇÕES CONSTITUCIONAIS TRANSITÓRIAS$/, part: "adct" }],
};

describe("buildStructure", () => {
  it("ignores what comes before the start and keeps the preamble", () => {
    const law = buildStructure(
      ["Menu do site", "PREÂMBULO", "Nós, representantes do povo", "TÍTULO I", "Dos Princípios", "Art. 1º Texto."],
      options,
    );

    expect(law.preamble).toEqual(["Nós, representantes do povo"]);
    expect(law.articles).toHaveLength(1);
  });

  it("applies the title, chapter and section hierarchy to the article", () => {
    const law = buildStructure(
      [
        "PREÂMBULO",
        "TÍTULO VIII",
        "Da Ordem Social",
        "CAPÍTULO II",
        "DA SEGURIDADE SOCIAL",
        "Seção II",
        "DA SAÚDE",
        "Art. 196. A saúde é direito de todos.",
      ],
      options,
    );

    expect(law.articles[0]).toMatchObject({
      part: "principal",
      number: "196",
      caput: ["A saúde é direito de todos."],
      hierarchy: {
        title: "Título VIII – Da Ordem Social",
        chapter: "Capítulo II – Da Seguridade Social",
        section: "Seção II – Da Saúde",
      },
    });
  });

  it("a new title clears the previous chapter and section", () => {
    const law = buildStructure(
      [
        "PREÂMBULO",
        "TÍTULO I",
        "Dos Princípios",
        "CAPÍTULO I",
        "Dos Direitos",
        "Art. 1º x.",
        "TÍTULO II",
        "Da Organização",
        "Art. 2º y.",
      ],
      options,
    );

    expect(law.articles[1]!.hierarchy).toEqual({ title: "Título II – Da Organização" });
  });

  it("nests clauses under the caput and, after a paragraph, under the paragraph", () => {
    const law = buildStructure(
      [
        "PREÂMBULO",
        "Art. 5º Todos são iguais:",
        "I - homens e mulheres;",
        "II - ninguém será obrigado;",
        "§ 1º As normas têm aplicação imediata.",
        "§ 2º Os direitos não excluem:",
        "I - outros;",
      ],
      options,
    );

    const article = law.articles[0]!;
    expect(article.children.map((p) => `${p.type}:${p.number}`)).toEqual([
      "clause:I",
      "clause:II",
      "paragraph:1",
      "paragraph:2",
    ]);
    expect(article.children[3]!.children).toMatchObject([{ type: "clause", number: "I", text: ["outros;"] }]);
  });

  it("nests subclauses under the last clause", () => {
    const law = buildStructure(
      ["PREÂMBULO", "Art. 12. São brasileiros:", "I - natos:", "a) os nascidos no Brasil;", "b) os filhos;"],
      options,
    );

    const clause = law.articles[0]!.children[0]!;
    expect(clause.children.map((p) => p.number)).toEqual(["a", "b"]);
  });

  it("splits notes and attaches them to the provision", () => {
    const law = buildStructure(
      [
        "PREÂMBULO",
        "Art. 6º São direitos sociais. (Redação dada pela Emenda Constitucional nº 90, de 2015)",
        "IV - os valores sociais;",
        "(Vide Lei nº 13.874, de 2019)",
      ],
      options,
    );

    const article = law.articles[0]!;
    expect(article.notes).toEqual(["Redação dada pela Emenda Constitucional nº 90, de 2015"]);
    expect(article.children[0]!.notes).toEqual(["Vide Lei nº 13.874, de 2019"]);
  });

  it("keeps a repealed provision with empty text and its note", () => {
    const law = buildStructure(["PREÂMBULO", "Art. 7º Direitos:", "XXIX - (Revogado)."], options);

    expect(law.articles[0]!.children[0]).toMatchObject({ number: "XXIX", text: [], notes: ["Revogado"] });
  });

  it("uses the next block as caput when the article comes without text", () => {
    const law = buildStructure(["PREÂMBULO", "Art. 1º.", "O Presidente da República prestará compromisso."], options);

    expect(law.articles[0]!.caput).toEqual(["O Presidente da República prestará compromisso."]);
  });

  it("appends loose text as a continuation of the last provision", () => {
    const law = buildStructure(["PREÂMBULO", "Art. 1º Texto:", "I - inciso;", "continuação do inciso"], options);

    expect(law.articles[0]!.children[0]!.text).toEqual(["inciso;", "continuação do inciso"]);
  });

  it("keeps an article repealed in full (label and note only)", () => {
    const law = buildStructure(
      ["PREÂMBULO", "Art. 116. Texto.", "Art. 117. . (Revogado pela Emenda Constitucional nº 24, de 1999)"],
      options,
    );

    expect(law.articles[0]!.notes).toEqual([]);
    expect(law.articles[1]).toMatchObject({
      number: "117",
      caput: [],
      notes: ["Revogado pela Emenda Constitucional nº 24, de 1999"],
    });
  });

  it("merges a repealed provision that appears twice (struck label kept + explicit '(Revogado)')", () => {
    const law = buildStructure(
      [
        "PREÂMBULO",
        "Art. 101. Texto:",
        "§ 4º (Revogado pela Emenda Constitucional nº 109, de 2021)",
        "I - (Revogado pela Emenda Constitucional nº 109, de 2021)",
        "§ 4º (Revogado). (Redação dada pela Emenda Constitucional nº 109, de 2021)",
        "I - (revogado);",
        "§ 5º Em vigor.",
      ],
      options,
    );

    const article = law.articles[0]!;
    expect(article.children.map((p) => p.number)).toEqual(["4", "5"]);
    expect(article.children[0]).toMatchObject({
      text: [],
      notes: ["Revogado pela Emenda Constitucional nº 109, de 2021", "Revogado", "Redação dada pela Emenda Constitucional nº 109, de 2021"],
    });
    expect(article.children[0]!.children.map((p) => p.number)).toEqual(["I"]);
    expect(law.warnings).toEqual([]);
  });

  it("warns about a repeated provision that has text", () => {
    const law = buildStructure(["PREÂMBULO", "Art. 1º Texto:", "I - um;", "I - outro;"], options);

    expect(law.warnings).toContain("duplicate provision: principal 1 clause I");
  });

  it("drops residues", () => {
    const law = buildStructure(["PREÂMBULO", "Art. 12. Texto:", "c) ;", "c", "a) alínea;"], options);

    expect(law.articles[0]!.children).toHaveLength(1);
  });

  it("stops at the end and resumes at the annex (ADCT), with its own numbering", () => {
    const law = buildStructure(
      [
        "PREÂMBULO",
        "TÍTULO IX",
        "Das Disposições",
        "Art. 250. Último.",
        "Brasília, 5 de outubro de 1988.",
        "Ulysses Guimarães",
        "ATO DAS DISPOSIÇÕES CONSTITUCIONAIS TRANSITÓRIAS",
        "Art. 1º Primeiro do ADCT.",
        "Brasília, 5 de outubro de 1988.",
        "Art. 999. Lixo depois do fim.",
      ],
      options,
    );

    expect(law.articles.map((a) => `${a.part}:${a.number}`)).toEqual(["principal:250", "adct:1"]);
    expect(law.articles[1]!.hierarchy).toEqual({});
  });

  it("warns about a duplicate article in the same part", () => {
    const law = buildStructure(["PREÂMBULO", "Art. 1º a.", "Art. 1º b."], options);

    expect(law.warnings).toContain("duplicate article: principal 1");
  });

  describe("lines right after a heading", () => {
    it("continues a heading name broken in two lines", () => {
      const law = buildStructure(
        ["PREÂMBULO", "Seção IV", "Do Incidente de Desconsideração da", "Personalidade Jurídica", "Art. 855-A. Texto."],
        options,
      );

      expect(law.articles[0]!.hierarchy.section).toBe("Seção IV – Do Incidente de Desconsideração da Personalidade Jurídica");
      expect(law.warnings).toEqual([]);
    });

    it("continues a heading name with an all-caps line", () => {
      const law = buildStructure(
        [
          "PREÂMBULO",
          "CAPÍTULO III-A",
          "DO PROCESSO DE JURISDIÇÃO VOLUNTÁRIA",
          "PARA HOMOLOGAÇÃO DE ACORDO EXTRAJUDICIAL",
          "Art. 855-B. Texto.",
        ],
        options,
      );

      expect(law.articles[0]!.hierarchy.chapter).toBe(
        "Capítulo III-A – Do Processo de Jurisdição Voluntária para Homologação de Acordo Extrajudicial",
      );
    });

    it("drops a loose caption under a named heading", () => {
      const law = buildStructure(
        ["PREÂMBULO", "CAPÍTULO II", "DA REMUNERAÇÃO", "Alimentação", "Art. 457 - Texto."],
        options,
      );

      expect(law.articles[0]!.hierarchy.chapter).toBe("Capítulo II – Da Remuneração");
      expect(law.warnings).toEqual([]);
    });
  });

  it("drops a caption between articles", () => {
    const law = buildStructure(
      ["PREÂMBULO", "Art. 66 Entre 2 jornadas haverá descanso.", "Trabalho aos domingos", "Art. 67 Será assegurado descanso."],
      options,
    );

    expect(law.articles[0]!.caput).toEqual(["Entre 2 jornadas haverá descanso."]);
  });

  it("keeps the articles another law quotes as text of the quoting article", () => {
    const law = buildStructure(
      [
        "PREÂMBULO",
        "Art. 263. O Código Penal passa a vigorar com as seguintes alterações:",
        "1) Art. 121 ......",
        "§ 4º No homicídio culposo, a pena é aumentada.",
        "Art. 264. Texto.",
      ],
      options,
    );

    expect(law.articles[0]!.children).toEqual([]);
    expect(law.articles[0]!.caput).toEqual([
      "O Código Penal passa a vigorar com as seguintes alterações:",
      "1) Art. 121 ......",
      "§ 4º No homicídio culposo, a pena é aumentada.",
    ]);
    expect(law.articles[1]!.number).toBe("264");
  });

  describe("provisions listed twice", () => {
    const paragraphs = (blocks: string[]) =>
      buildStructure(["PREÂMBULO", "Art. 634 - Texto.", ...blocks], options);

    it("keeps the provision in force over the repeal of an older version", () => {
      const law = paragraphs(["§ 1º Texto em vigor.", "§ 1º (Revogado pelo Decreto-lei nº 8.740, de 1946)"]);

      expect(law.articles[0]!.children).toMatchObject([{ number: "1", text: ["Texto em vigor."], notes: [] }]);
      expect(law.warnings).toEqual([]);
    });

    it("merges the same text listed twice", () => {
      const law = paragraphs(["Parágrafo único - Texto.", "Parágrafo único - Texto."]);

      expect(law.articles[0]!.children).toHaveLength(1);
      expect(law.warnings).toEqual([]);
    });

    it("replaces a repealed provision restored later", () => {
      const law = paragraphs(["§ 2º (Revogado pela Lei nº 1, de 1950)", "§ 2º Texto restaurado."]);

      expect(law.articles[0]!.children).toMatchObject([{ number: "2", text: ["Texto restaurado."] }]);
    });

    it("still warns about two different texts in force", () => {
      const law = paragraphs(["§ 1º Um texto.", "§ 1º Outro texto."]);

      expect(law.warnings).toEqual(["duplicate provision: principal 634 paragraph 1"]);
    });
  });
});

describe("readableName", () => {
  it.each([
    ["DOS DIREITOS E DEVERES INDIVIDUAIS E COLETIVOS", "Dos Direitos e Deveres Individuais e Coletivos"],
    ["DA ORGANIZAÇÃO POLÍTICO-ADMINISTRATIVA", "Da Organização Político-Administrativa"],
    ["DO PRESIDENTE E DO VICE-PRESIDENTE DA REPÚBLICA", "Do Presidente e do Vice-Presidente da República"],
    ["Dos Princípios Fundamentais", "Dos Princípios Fundamentais"],
  ])("%s", (input, output) => {
    expect(readableName(input)).toBe(output);
  });
});
