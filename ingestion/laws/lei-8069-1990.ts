import type { LawConfig } from "./types.js";

export const lei8069: LawConfig = {
  url: "https://www.planalto.gov.br/ccivil_03/leis/l8069.htm",
  description: {
    law: "lei-8069-1990",
    type: "lei",
    name: "Estatuto da Criança e do Adolescente",
    date: "1990-07-13",
    aliases: ["eca", "ECA", "Lei nº 8.069/1990"],
    parts: {},
  },
  structure: {
    start: /^O PRESIDENTE DA REPÚBLICA: Faço saber/,
    end: /^Brasília, 13 de julho de 1990/,
    annexes: [],
  },
};
