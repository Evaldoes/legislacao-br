// Loose links that sometimes follow a note, without parentheses.
const COMPLEMENT = String.raw`Vigência|Regulamento|Produção de efeitos?|Vide [^()]+?`;

// Editorial notes Planalto appends to provisions, such as
// "(Redação dada pela Emenda Constitucional nº 90, de 2015)", optionally
// followed by loose complements and a stray "]". A note at the very end of a
// block may lack its closing parenthesis.
// Some notes start with the label of the provision they refer to:
// "(Parágrafo único renumerado para § 1º pela Emenda Constitucional nº 29, de 2000)",
// "(Inciso incluído pelo Decreto-lei nº 229, de 28.2.1967)".
const NOTE_SUBJECT = String.raw`(?:(?:Parágrafo único|§\s*\d+\S*|Inciso\s+[IVXLCDM]+|Alínea\s+[a-z]|Parágrafo|Inciso|Alínea|Artigo|Item)\s+)?`;

const TRAILING_NOTE = new RegExp(
  String.raw`\s*\((${NOTE_SUBJECT}(?:Incluíd[oa]|Redação|Vide|Revogad[oa]|Suprimid[oa]|Produção|Renumerad[oa]|Numerad[oa]|Transformad[oa]|Regulamento|Vigência)[^()]*)(?:\)[.;]?|$)((?:\s+(?:${COMPLEMENT}))*)[\s\]]*$`,
  "iu",
);

const COMPLEMENTS = new RegExp(COMPLEMENT.replace("+?", "+"), "giu");

export type TextWithNotes = { text: string; notes: string[] };

export function splitNotes(block: string): TextWithNotes {
  let text = block.trim();
  const notes: string[] = [];

  for (let m = TRAILING_NOTE.exec(text); m; m = TRAILING_NOTE.exec(text)) {
    const [, note = "", links = ""] = m;
    const complements = (links.match(COMPLEMENTS) ?? []).map((c) => c.trim());
    notes.unshift(complements.length ? `${note} (${complements.join(", ")})` : note);
    text = text.slice(0, m.index).trimEnd();
  }

  return { text, notes };
}
