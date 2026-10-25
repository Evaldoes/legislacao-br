import { describe, expect, it } from "vitest";
import { classifyBlock } from "../parsers/classify.js";

describe("classifyBlock", () => {
  describe("articles", () => {
    it.each([
      ["Art. 1º A República Federativa", "1", "A República Federativa"],
      ["Art. 10. É assegurada", "10", "É assegurada"],
      ["Art. 42 Os membros das Polícias", "42", "Os membros das Polícias"],
      ["Art. 5º. Não se aplicam", "5", "Não se aplicam"],
      ["Art. 29-A. O total da despesa", "29-A", "O total da despesa"],
      ["Art. 1º.", "1", ""],
    ])("%s", (block, number, text) => {
      expect(classifyBlock(block)).toEqual({ type: "article", number, text });
    });
  });

  describe("paragraphs", () => {
    it.each([
      ["§ 1º As normas definidoras", "1", "As normas definidoras"],
      ["§ 10 - O mandato eletivo", "10", "O mandato eletivo"],
      ["§ 1º - A lei disporá", "1", "A lei disporá"],
      ["§ 4º-A. Poderão ser estabelecidos", "4-A", "Poderão ser estabelecidos"],
      ["§ 19-A. A União fica", "19-A", "A União fica"],
      ["§ 1.º O Presidente", "1", "O Presidente"],
      ["§ 1 º O Presidente", "1", "O Presidente"],
      ["§ 2° Nenhuma lei", "2", "Nenhuma lei"],
      ["§ 3º", "3", ""],
    ])("%s", (block, number, text) => {
      expect(classifyBlock(block)).toEqual({ type: "paragraph", number, text });
    });

    it("Parágrafo único", () => {
      expect(classifyBlock("Parágrafo único. A República buscará")).toEqual({
        type: "paragraph",
        number: "unico",
        text: "A República buscará",
      });
    });
  });

  describe("clauses (incisos)", () => {
    it.each([
      ["I - a soberania;", "I", "a soberania;"],
      ["LXXVIII - a todos, no âmbito", "LXXVIII", "a todos, no âmbito"],
      ["V- doações, de qualquer natureza", "V", "doações, de qualquer natureza"],
      ["II-A - o Tribunal Superior do Trabalho;", "II-A", "o Tribunal Superior do Trabalho;"],
      ["I-A o Conselho Nacional de Justiça;", "I-A", "o Conselho Nacional de Justiça;"],
      ["IV -", "IV", ""],
    ])("%s", (block, number, text) => {
      expect(classifyBlock(block)).toEqual({ type: "clause", number, text });
    });

    it("does not mistake an all-caps word for a roman numeral", () => {
      expect(classifyBlock("CIVIL E COMERCIAL")).toEqual({
        type: "text",
        text: "CIVIL E COMERCIAL",
      });
    });
  });

  describe("subclauses (alíneas)", () => {
    it("a) text", () => {
      expect(classifyBlock("a) os cargos, empregos e funções")).toEqual({
        type: "subclause",
        letter: "a",
        text: "os cargos, empregos e funções",
      });
    });

    it("a ) text, with a space before the parenthesis", () => {
      expect(classifyBlock("a ) no ano 2000, o montante")).toEqual({
        type: "subclause",
        letter: "a",
        text: "no ano 2000, o montante",
      });
    });
  });

  describe("headings", () => {
    it.each([
      ["TÍTULO I", "title", "I", ""],
      ["CAPÍTULO II", "chapter", "II", ""],
      ["Seção IV", "section", "IV", ""],
      ["Subseção III", "subsection", "III", ""],
      ["CAPÍTULO VII - DA ADMINISTRAÇÃO PÚBLICA", "chapter", "VII", "DA ADMINISTRAÇÃO PÚBLICA"],
    ])("%s", (block, type, number, name) => {
      expect(classifyBlock(block)).toEqual({ type, number, name });
    });
  });

  it("removes the loose links Regulamento/Vigência from the end of a text", () => {
    expect(classifyBlock("DA POLÍTICA AGRÍCOLA E FUNDIÁRIA E DA REFORMA AGRÁRIA Regulamento")).toEqual({
      type: "text",
      text: "DA POLÍTICA AGRÍCOLA E FUNDIÁRIA E DA REFORMA AGRÁRIA",
    });
  });

  it.each(["- ;", ".", ";", "c"])("residue without content (%s) is discardable", (block) => {
    expect(classifyBlock(block)).toEqual({ type: "residue" });
  });

  it.each([
    ["c) ;", { type: "subclause", letter: "c", text: "" }],
    ["Art. 117. .", { type: "article", number: "117", text: "" }],
  ])("provision with only punctuation (%s) gets empty text", (block, expected) => {
    expect(classifyBlock(block)).toEqual(expected);
  });

  it("anything else is text", () => {
    expect(classifyBlock("Dos Princípios Fundamentais")).toEqual({
      type: "text",
      text: "Dos Princípios Fundamentais",
    });
  });
});
