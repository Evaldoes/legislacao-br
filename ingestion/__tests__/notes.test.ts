import { describe, expect, it } from "vitest";
import { splitNotes } from "../parsers/notes.js";

describe("splitNotes", () => {
  it("splits a wording note from the end of the text", () => {
    expect(
      splitNotes(
        "Art. 6º São direitos sociais a educação. (Redação dada pela Emenda Constitucional nº 90, de 2015)",
      ),
    ).toEqual({
      text: "Art. 6º São direitos sociais a educação.",
      notes: ["Redação dada pela Emenda Constitucional nº 90, de 2015"],
    });
  });

  it("splits several consecutive notes, keeping their order", () => {
    expect(
      splitNotes(
        "II - operações relativas; (Redação dada pela Emenda Constitucional nº 3, de 1993) (Vide Emenda Constitucional nº 132, de 2023)",
      ),
    ).toEqual({
      text: "II - operações relativas;",
      notes: [
        "Redação dada pela Emenda Constitucional nº 3, de 1993",
        "Vide Emenda Constitucional nº 132, de 2023",
      ],
    });
  });

  it("attaches the loose words Vigência and Regulamento to the previous note", () => {
    expect(
      splitNotes(
        "§ 2º No recurso especial. (Incluído pela Emenda Constitucional nº 125, de 2022) (Regulamento) Vigência",
      ),
    ).toEqual({
      text: "§ 2º No recurso especial.",
      notes: ["Incluído pela Emenda Constitucional nº 125, de 2022", "Regulamento (Vigência)"],
    });
  });

  it("attaches a loose 'Produção de efeitos' to the previous note", () => {
    expect(
      splitNotes("receitas dos servidores; (Incluído dada pela Emenda constitucional nº 93, de 2016) Produção de efeitos"),
    ).toEqual({
      text: "receitas dos servidores;",
      notes: ["Incluído dada pela Emenda constitucional nº 93, de 2016 (Produção de efeitos)"],
    });
  });

  it("attaches a 'Vide' without parentheses to the previous note", () => {
    expect(
      splitNotes("na forma da lei. (Redação dada pela Emenda Constitucional nº 15, de 1996) Vide art. 96 - ADCT"),
    ).toEqual({
      text: "na forma da lei.",
      notes: ["Redação dada pela Emenda Constitucional nº 15, de 1996 (Vide art. 96 - ADCT)"],
    });
  });

  it("recognizes a repeal note followed by a semicolon", () => {
    expect(splitNotes("I - (revogado);")).toEqual({ text: "I -", notes: ["revogado"] });
  });

  it("ignores a stray bracket after the note", () => {
    expect(
      splitNotes("da Constituição. (Renumerado do parágrafo único, pela Emenda Constitucional nº 10, de 1996) ]"),
    ).toEqual({
      text: "da Constituição.",
      notes: ["Renumerado do parágrafo único, pela Emenda Constitucional nº 10, de 1996"],
    });
  });

  it("does not remove a 'vide' that is part of the legal text", () => {
    const text = "observado o disposto no art. 5º, vide o regulamento.";

    expect(splitNotes(text)).toEqual({ text, notes: [] });
  });

  it("recognizes a block that is only a note", () => {
    expect(splitNotes("(Vide Lei nº 13.874, de 2019)")).toEqual({
      text: "",
      notes: ["Vide Lei nº 13.874, de 2019"],
    });
  });

  it("recognizes a repeal note followed by a period", () => {
    expect(splitNotes("IV - (Revogado).")).toEqual({
      text: "IV -",
      notes: ["Revogado"],
    });
  });

  it("does not mistake legal-text parentheses for a note", () => {
    const text = "pela manifestação de 2/3 (dois terços) dos membros do órgão (art. 5º).";

    expect(splitNotes(text)).toEqual({ text, notes: [] });
  });

  it("recognizes feminine and renumbering notes", () => {
    expect(
      splitNotes(
        "a) texto; (Incluída pela Emenda Constitucional nº 42, de 2003) (Renumerado do § 1º pela Emenda Constitucional nº 45, de 2004)",
      ).notes,
    ).toEqual([
      "Incluída pela Emenda Constitucional nº 42, de 2003",
      "Renumerado do § 1º pela Emenda Constitucional nº 45, de 2004",
    ]);
  });

  it.each([
    "(Parágrafo único renumerado para § 1º pela Emenda Constitucional nº 29, de 2000)",
    "(§ 2º renumerado para § 3º pela Emenda Constitucional nº 10, de 1996)",
    "(Inciso IV renumerado pela Emenda Constitucional nº 5, de 1995)",
  ])("recognizes a note that starts with the provision label: %s", (note) => {
    expect(splitNotes(`Texto do parágrafo. ${note}`)).toEqual({ text: "Texto do parágrafo.", notes: [note.slice(1, -1)] });
  });

  it("accepts a final note missing its closing parenthesis", () => {
    expect(splitNotes("(Redação dada pelo Decreto-lei nº 1.535, de 13.4.1977")).toEqual({
      text: "",
      notes: ["Redação dada pelo Decreto-lei nº 1.535, de 13.4.1977"],
    });
  });

  it("splits a suppression note", () => {
    expect(splitNotes("Art. 691 (Suprimido pelo Decreto-lei nº 8.737, de 19.1.1946)")).toEqual({
      text: "Art. 691",
      notes: ["Suprimido pelo Decreto-lei nº 8.737, de 19.1.1946"],
    });
  });
});
