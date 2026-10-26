import type { LawConfig } from "./types.js";

export const lei8078: LawConfig = {
  url: "https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm",
  description: {
    law: "lei-8078-1990",
    type: "lei",
    name: "Código de Defesa do Consumidor",
    date: "1990-09-11",
    aliases: ["cdc", "CDC", "Lei nº 8.078/1990"],
    parts: {},
  },
  structure: {
    start: /^O PRESIDENTE DA REPÚBLICA, faço saber/,
    end: /^Brasília, 11 de setembro de 1990/,
    annexes: [],
  },
};
