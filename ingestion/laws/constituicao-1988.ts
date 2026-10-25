import type { LawConfig } from "./types.js";

export const constituicao1988: LawConfig = {
  url: "https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm",
  description: {
    law: "constituicao-1988",
    type: "constituicao",
    name: "Constituição da República Federativa do Brasil de 1988",
    date: "1988-10-05",
    aliases: ["cf88", "CF/88", "Constituição Federal", "Constituição Cidadã"],
    parts: { adct: "Ato das Disposições Constitucionais Transitórias" },
  },
  structure: {
    start: /^PREÂMBULO$/,
    end: /^Brasília, 5 de outubro de 1988/,
    annexes: [{ marker: /^ATO DAS DISPOSIÇÕES CONSTITUCIONAIS TRANSITÓRIAS$/, part: "adct" }],
  },
};
