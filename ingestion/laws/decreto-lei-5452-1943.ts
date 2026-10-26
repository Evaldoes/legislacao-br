import type { LawConfig } from "./types.js";

export const decretoLei5452: LawConfig = {
  url: "https://www.planalto.gov.br/ccivil_03/decreto-lei/del5452.htm",
  description: {
    law: "decreto-lei-5452-1943",
    type: "decreto-lei",
    name: "Consolidação das Leis do Trabalho",
    date: "1943-05-01",
    aliases: ["clt", "CLT", "Decreto-Lei nº 5.452/1943"],
    parts: {},
  },
  structure: {
    // The page starts with the decree that approves the CLT (its own Art. 1º
    // and 2º); the consolidation itself starts at its title.
    start: /^CONSOLIDAÇÃO DAS LEIS DO TRABALHO$/,
    // The annex is the table referred to by Art. 577, not articles.
    end: /^ANEXO$/,
    annexes: [],
  },
};
