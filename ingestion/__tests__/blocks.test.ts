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
});
