export type HeadingType = "title" | "chapter" | "section" | "subsection";

/** Provision types: paragraph (§), clause (inciso, roman numeral), subclause (alínea, letter). */
export type ProvisionType = "paragraph" | "clause" | "subclause";

export type Block =
  | { type: HeadingType; number: string; name: string }
  | { type: "article"; number: string; text: string }
  | { type: "paragraph"; number: string; text: string }
  | { type: "clause"; number: string; text: string }
  | { type: "subclause"; letter: string; text: string }
  | { type: "text"; text: string }
  | { type: "residue" };

// Suffix of articles/paragraphs/clauses added by amendment: "29-A", "4º-A",
// sometimes without the hyphen ("401A"). Always attached; with spaces it is
// a separator ("§ 10 - O mandato").
const SUFFIX = String.raw`(?:-?([A-Z])(?![a-zà-ú]))?`;
const ORDINAL = String.raw`(?:\s*\.?\s*[º°])?`;
const SEPARATOR = String.raw`\s*[.\-–—]?\s*`;

const ARTICLE = new RegExp(String.raw`^Art\.?(?:\s*\.)?\s*(\d+)${ORDINAL}${SUFFIX}${SEPARATOR}(.*)$`, "su");
const PARAGRAPH = new RegExp(String.raw`^§\s*(\d+)${ORDINAL}${SUFFIX}${SEPARATOR}(.*)$`, "su");
const SOLE_PARAGRAPH = /^Parágrafo\s+único\s*[.\-–—:]?\s*(.*)$/isu;
const CLAUSE = /^([IVXLCDM]+)(?:-([A-Z])(?![a-zà-ú]))?(?:\s*[-–—]\s*|\s+)(.*)$/su;
const SUBCLAUSE = /^([a-z])\s?\)\s*(.*)$/su;
// Planalto sometimes drops the accents ("CAPITULO VII").
const HEADING = /^(T[ÍI]TULO|CAP[ÍI]TULO|SE[ÇC][ÃA]O|SUBSE[ÇC][ÃA]O)\s+([IVXLC]+(?:-[A-Z])?)\s*(?:[-–—.]\s*(.*))?$/iu;

// Loose links Planalto leaves at the end of headings and sentences.
const TRAILING_LINKS = /(?:\s+(?:Regulamento|Vigência))+\s*$/u;

const VALID_ROMAN = /^M{0,3}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/;

const HEADING_TYPES: Record<string, HeadingType> = {
  TITULO: "title",
  CAPITULO: "chapter",
  SECAO: "section",
  SUBSECAO: "subsection",
};

const withSuffix = (number: string, letter?: string) => (letter ? `${number}-${letter}` : number);

const hasContent = (text: string, minimum = 1) => (text.match(/[\p{L}\p{N}]/gu) ?? []).length >= minimum;

// Roman numeral typed with a lowercase L for I ("Il - colaborar").
const ROMAN_TYPO = /^([IVXLC]*l[IVXLCl]*)(?=\s*[-–—])/;

// Suffix written apart from its number: "§ 2º -A. O prazo".
const DETACHED_SUFFIX = /^((?:Art\.?|§)\s*\d+\s*[º°]?)\s+-([A-Z])\./u;

export function classifyBlock(input: string): Block {
  const block = input
    .replace(TRAILING_LINKS, "")
    .replace(DETACHED_SUFFIX, "$1-$2.")
    .replace(ROMAN_TYPO, (numeral) => numeral.replaceAll("l", "I"));
  const b = classifyProvision(block);

  // Leftovers of struck text removed halfway, such as a lone ".".
  if (b.type === "text") return hasContent(b.text, 2) ? b : { type: "residue" };

  // Label followed only by punctuation ("c) ;", "Art. 117. ."): the provision
  // gets empty text, and whoever knows the notes decides whether it stands.
  if ("text" in b && !hasContent(b.text)) return { ...b, text: "" };
  return b;
}

function classifyProvision(block: string): Block {
  let m: RegExpExecArray | null;

  if ((m = HEADING.exec(block))) {
    const [, word = "", number = "", name = ""] = m;
    const key = word.toUpperCase().normalize("NFD").replace(/\p{M}/gu, "");
    return { type: HEADING_TYPES[key]!, number, name: name.trim() };
  }
  if ((m = ARTICLE.exec(block))) {
    const [, number = "", letter, text = ""] = m;
    return { type: "article", number: withSuffix(number, letter), text: text.trim() };
  }
  if ((m = PARAGRAPH.exec(block))) {
    const [, number = "", letter, text = ""] = m;
    return { type: "paragraph", number: withSuffix(number, letter), text: text.trim() };
  }
  if ((m = SOLE_PARAGRAPH.exec(block))) {
    return { type: "paragraph", number: "unico", text: (m[1] ?? "").trim() };
  }
  if ((m = CLAUSE.exec(block)) && VALID_ROMAN.test(m[1] ?? "")) {
    const [, number = "", letter, text = ""] = m;
    return { type: "clause", number: withSuffix(number, letter), text: text.trim() };
  }
  if ((m = SUBCLAUSE.exec(block))) {
    return { type: "subclause", letter: m[1] ?? "", text: (m[2] ?? "").trim() };
  }
  return { type: "text", text: block };
}
