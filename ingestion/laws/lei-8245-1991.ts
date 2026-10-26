import type { LawConfig } from "./types.js";

export const lei8245: LawConfig = {
  url: "https://www.planalto.gov.br/ccivil_03/leis/l8245.htm",
  description: {
    law: "lei-8245-1991",
    type: "lei",
    name: "Lei do Inquilinato",
    date: "1991-10-18",
    aliases: ["inquilinato", "Lei do Inquilinato", "Lei de Locações", "Lei nº 8.245/1991"],
    parts: {},
  },
  structure: {
    start: /^O PRESIDENTE DA REPÚBLICA Faço saber/,
    end: /^Brasília, 18 de outubro de 1991/,
    annexes: [],
  },
};
