import { describe, expect, it } from "vitest";
import { parseArticle } from "./read.js";

const ART_6 = `---
id: constituicao-1988-art-006
norma: constituicao-1988
artigo: "6"
rotulo: Art. 6º
hierarquia:
  titulo: Título II – Dos Direitos e Garantias Fundamentais
  capitulo: Capítulo II – Dos Direitos Sociais
fonte: https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm
capturado_em: 2026-10-22
revogado: false
notas:
  - dispositivo: caput
    texto: Redação dada pela Emenda Constitucional nº 90, de 2015
  - dispositivo: par-unico
    texto: Incluído pela Emenda Constitucional nº 114, de 2021
---

# Art. 6º

São direitos sociais a educação, a saúde.

## <a id="par-unico"></a>Parágrafo único

Todo brasileiro em situação de vulnerabilidade social terá direito a uma renda básica familiar.
`;

const NESTED = `---
id: constituicao-1988-art-037
norma: constituicao-1988
artigo: "37"
rotulo: Art. 37
fonte: f
capturado_em: 2026-10-22
revogado: false
notas: []
---

# Art. 37

A administração pública obedecerá:

segundo parágrafo do caput.

## <a id="inc-16"></a>Inciso XVI

é vedada a acumulação:

### <a id="inc-16-al-a"></a>Alínea a

a de dois cargos de professor;

## <a id="inc-29"></a>Inciso XXIX

*(Revogado)*

## <a id="par-3"></a>§ 3º

A lei disciplinará:

### <a id="par-3-inc-1"></a>Inciso I

as reclamações;
`;

const REPEALED = `---
id: constituicao-1988-adct-art-091
norma: constituicao-1988
artigo: "91"
rotulo: Art. 91 do ADCT
fonte: f
capturado_em: 2026-10-22
revogado: true
notas:
  - dispositivo: caput
    texto: Revogado pela Emenda Constitucional nº 109, de 2021
---

# Art. 91 do ADCT

*(Revogado)*
`;

describe("parseArticle", () => {
  it("reads identification, hierarchy, caput and notes", () => {
    expect(parseArticle("art-006.md", ART_6)).toEqual({
      slug: "constituicao-1988-art-006",
      part: "principal",
      number: "6",
      label: "Art. 6º",
      hierarchy: {
        title: "Título II – Dos Direitos e Garantias Fundamentais",
        chapter: "Capítulo II – Dos Direitos Sociais",
      },
      caput: "São direitos sociais a educação, a saúde.",
      repealed: false,
      provisions: [
        {
          type: "paragraph",
          anchor: "par-unico",
          parentAnchor: null,
          label: "Parágrafo único",
          text: "Todo brasileiro em situação de vulnerabilidade social terá direito a uma renda básica familiar.",
          repealed: false,
          position: 0,
        },
      ],
      notes: [
        { anchor: null, text: "Redação dada pela Emenda Constitucional nº 90, de 2015" },
        { anchor: "par-unico", text: "Incluído pela Emenda Constitucional nº 114, de 2021" },
      ],
    });
  });

  it("reads nested provisions with their parent, in file order", () => {
    const article = parseArticle("art-037.md", NESTED);

    expect(article.caput).toBe("A administração pública obedecerá:\n\nsegundo parágrafo do caput.");
    expect(article.provisions.map((p) => [p.position, p.type, p.anchor, p.parentAnchor])).toEqual([
      [0, "clause", "inc-16", null],
      [1, "subclause", "inc-16-al-a", "inc-16"],
      [2, "clause", "inc-29", null],
      [3, "paragraph", "par-3", null],
      [4, "clause", "par-3-inc-1", "par-3"],
    ]);
    expect(article.hierarchy).toEqual({});
  });

  it("turns *(Revogado)* into a repealed provision with null text", () => {
    const clause = parseArticle("art-037.md", NESTED).provisions[2];

    expect(clause).toMatchObject({ anchor: "inc-29", label: "Inciso XXIX", text: null, repealed: true });
  });

  it("reads an article repealed in full, deriving the part from the file name", () => {
    expect(parseArticle("adct-art-091.md", REPEALED)).toMatchObject({
      part: "adct",
      number: "91",
      caput: "",
      repealed: true,
      provisions: [],
    });
  });
});
