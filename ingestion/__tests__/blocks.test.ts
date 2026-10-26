import { describe, expect, it } from "vitest";
import { extractBlocks } from "../parsers/blocks.js";

describe("extractBlocks", () => {
  it("returns one block per paragraph with normalized whitespace", () => {
    const html = `<p>Art. 1º A República
      Federativa do Brasil</p><p>I - a soberania;</p>`;

    expect(extractBlocks(html)).toEqual([
      "Art. 1º A República Federativa do Brasil",
      "I - a soberania;",
    ]);
  });

  it("removes <strike> content (repealed text)", () => {
    const html = `<p><strike>Art. 6º texto antigo</strike></p><p>Art. 6º texto novo</p>`;

    expect(extractBlocks(html)).toEqual(["Art. 6º texto novo"]);
  });

  it("keeps the label of an article repealed in full", () => {
    const html = `<p><a name="art117"></a><strike>Art. 117. O mandato dos representantes</strike>.
      <a href="emc24.htm">(Revogado pela Emenda Constitucional nº 24, de 1999)</a></p>`;

    expect(extractBlocks(html)).toEqual(["Art. 117. . (Revogado pela Emenda Constitucional nº 24, de 1999)"]);
  });

  it.each([
    ["§ 3º Texto antigo", "§ 3º"],
    ["Parágrafo único. Texto antigo", "Parágrafo único"],
    ["XXIX - texto antigo", "XXIX -"],
    ["b) texto antigo", "b)"],
  ])("keeps the repealed label of %s", (riscado, rotulo) => {
    const html = `<p><strike>${riscado}</strike> (Revogado pela Emenda Constitucional nº 6, de 1995)</p>`;

    expect(extractBlocks(html)).toEqual([`${rotulo} (Revogado pela Emenda Constitucional nº 6, de 1995)`]);
  });

  it("does not keep the label when text in force remains besides the note", () => {
    const html = `<p><strike>Art. 6º texto antigo</strike></p><p>Art. 6º texto novo (Revogado em parte)</p>`;

    expect(extractBlocks(html)).toEqual(["Art. 6º texto novo (Revogado em parte)"]);
  });

  it("removes elements with text-decoration: line-through", () => {
    const html = `<p><span style="text-transform: uppercase; text-decoration: line-through">TÍTULO IV</span></p>
      <p><span style="text-transform: uppercase">TÍTULO IV</span></p>`;

    expect(extractBlocks(html)).toEqual(["TÍTULO IV"]);
  });

  it("turns &nbsp; into a regular space and drops empty blocks", () => {
    const html = `<p>&nbsp;</p><p>&nbsp;<a name="art5"></a>Art. 5º Todos são iguais&nbsp;&nbsp;</p>`;

    expect(extractBlocks(html)).toEqual(["Art. 5º Todos são iguais"]);
  });

  it.each([
    ["Art. 6<sup>o</sup> São direitos sociais", "Art. 6º São direitos sociais"],
    ["§ 1\n  <sup>\n   <u>\n    o</u></sup> A Câmara Municipal", "§ 1º A Câmara Municipal"],
  ])("turns a superscript o into the ordinal sign: %s", (paragraph, expected) => {
    expect(extractBlocks(`<p>${paragraph}</p>`)).toEqual([expected]);
  });

  it("drops the leftover label of a superseded version of an article", () => {
    const html = `<p><strike>Art. 115. Os Tribunais Regionais do Trabalho serão compostos</strike></p>
      <p><strike>II - advogados e membros do Ministério Público</strike></p>
      <p><a name="art115piii"></a>III<strike>- classistas indicados</strike> (Revogado pela Emenda Constitucional nº 24, de 1999)</p>
      <p>Art. 115. Os Tribunais Regionais do Trabalho compõem-se</p>`;

    expect(extractBlocks(html)).toEqual(["Art. 115. Os Tribunais Regionais do Trabalho compõem-se"]);
  });

  it("keeps a repealed label that belongs to an article repealed in full", () => {
    const html = `<p><strike>Art. 171. São consideradas</strike> (Revogado pela Emenda Constitucional nº 6, de 1995)</p>
      <p>§ 2º - <strike>Na aquisição de bens</strike>. (Revogado pela Emenda Constitucional nº 6, de 1995)</p>`;

    expect(extractBlocks(html)).toEqual([
      "Art. 171. (Revogado pela Emenda Constitucional nº 6, de 1995)",
      "§ 2º - . (Revogado pela Emenda Constitucional nº 6, de 1995)",
    ]);
  });

  it("treats <br> as a block break", () => {
    const html = `<p>CAPÍTULO I<br>DOS DIREITOS</p>`;

    expect(extractBlocks(html)).toEqual(["CAPÍTULO I", "DOS DIREITOS"]);
  });

  it("ignores script and style", () => {
    const html = `<style>p{}</style><p>texto</p><script>var x = 1;</script>`;

    expect(extractBlocks(html)).toEqual(["texto"]);
  });

  describe("provisional measures with lapsed validity", () => {
    it("drops text struck by a measure that lapsed", () => {
      const html = `<p><strike>Art. 12-A. Fica autorizado (Incluído pela Medida Provisória nº 905, de 2019)</strike>
        <a>(Vigência encerrada)</a></p><p>Art. 13 Texto em vigor.</p>`;

      expect(extractBlocks(html)).toEqual(["Art. 13 Texto em vigor."]);
    });

    it("keeps the text in force without the lapsed measure's note", () => {
      const html = `<p>§ 1º Texto em vigor. (Revogado pela Medida Provisória nº 905, de 2019) (Vigência encerrada)</p>`;

      expect(extractBlocks(html)).toEqual(["§ 1º Texto em vigor."]);
    });

    it("handles notes wrapped in an extra pair of parentheses", () => {
      const html = `<p>Art. 557 - Texto. ((Revogado pela Medida Provisória nº 905, de 2019) (Vigência encerrada))</p>`;

      expect(extractBlocks(html)).toEqual(["Art. 557 - Texto."]);
    });
  });

  describe("articles struck in full", () => {
    it("keeps the label of an article struck without a note and without another version", () => {
      const html = `<p>Art. 87 - Texto.</p><p><strike>Art. 88 - Texto antigo</strike></p>
        <p><strike>§ 1º Texto antigo</strike></p><p>Art. 89 - Texto.</p>`;

      expect(extractBlocks(html)).toEqual(["Art. 87 - Texto.", "Art. 88", "Art. 89 - Texto."]);
    });

    it("drops every version struck without a note except the last one", () => {
      const html = `<p><strike>Art. 18. Versão 1</strike></p><p><strike>Art. 18 Versão 2</strike></p>
        <p><strike>Art. 18 - Versão 3</strike> (Revogado pela Lei nº 7.855, de 1989)</p>`;

      expect(extractBlocks(html)).toEqual(["Art. 18 (Revogado pela Lei nº 7.855, de 1989)"]);
    });

    it("drops a struck version whose number is a typo out of sequence", () => {
      const html = `<p>Art. 669 - Texto.</p><p><strike>Art. 670. Versão antiga</strike></p>
        <p><strike>Art. 60. Outra versão antiga</strike></p><p>Art. 670 - Texto em vigor.</p>`;

      expect(extractBlocks(html)).toEqual(["Art. 669 - Texto.", "Art. 670 - Texto em vigor."]);
    });

    it("drops the repeal of an article restored later", () => {
      const html = `<p><strike>Art. 500. Texto</strike> (Revogado pela Lei nº 5.562, de 1968)</p>
        <p>Art. 500 - Texto restaurado.</p>`;

      expect(extractBlocks(html)).toEqual(["Art. 500 - Texto restaurado."]);
    });

    it("drops repealed provisions of a superseded version", () => {
      const html = `<p><strike>Art. 708. Versão antiga</strike></p>
        <p><strike>a) texto antigo</strike> (Revogado pela Lei nº 14.824, de 2024)</p>
        <p>Art. 708. Texto em vigor.</p>`;

      expect(extractBlocks(html)).toEqual(["Art. 708. Texto em vigor."]);
    });
  });

  describe("Planalto typos around struck text", () => {
    it("joins the first letter left outside the strike", () => {
      const html = `<p>A<strike>rt. 28. Texto antigo</strike> (Revogado pela Lei nº 7.855, de 1989)</p>`;

      expect(extractBlocks(html)).toEqual(["Art. 28. (Revogado pela Lei nº 7.855, de 1989)"]);
    });

    it("drops the end of a struck note left outside the strike", () => {
      const html = `<p><strike>a) texto (Redação dada pelo Decreto-lei nº 8.740, de 1946,</strike>
        com vigência suspensa pelo Decreto-lei nº 8.987-A, de 1946)</p>`;

      expect(extractBlocks(html)).toEqual([]);
    });

    it("does not read a following capital letter as an article suffix", () => {
      const html = `<p><strike>Art. 46 -A renda proveniente</strike> (Revogado pelo Decreto-Lei nº 229, de 1967)</p>`;

      expect(extractBlocks(html)).toEqual(["Art. 46 (Revogado pelo Decreto-Lei nº 229, de 1967)"]);
    });

    it.each([
      ["(Suprimido pelo Decreto-lei nº 8.737, de 1946)"],
      ["(Revogado pela Lei nº 12.010, de 2009) Vigência"],
    ])("keeps the label of a provision repealed with %s", (note) => {
      const html = `<p><strike>§ 1º Texto antigo</strike> ${note}</p>`;

      expect(extractBlocks(html)).toEqual([`§ 1º ${note}`]);
    });
  });

  it("keeps the label of a provision whose repeal note lacks the closing parenthesis", () => {
    const html = `<p><strike>Art. 233. Submeter criança a tortura:</strike> (Revogado pela Lei nº 9.455, de 7.4.1997</p>`;

    expect(extractBlocks(html)).toEqual(["Art. 233. (Revogado pela Lei nº 9.455, de 7.4.1997"]);
  });
});
