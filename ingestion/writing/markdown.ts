import { stringify } from "yaml";
import type { Article, Provision } from "../parsers/structure.js";

export type LawMeta = {
  /** Law folder name in the data repository, such as "constituicao-1988". */
  law: string;
  source: string;
  capturedAt: string;
};

const ROMAN: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };

function romanToArabic(roman: string): number {
  let total = 0;
  for (let i = 0; i < roman.length; i++) {
    const current = ROMAN[roman[i]!]!;
    const next = ROMAN[roman[i + 1] ?? ""] ?? 0;
    total += current < next ? -current : current;
  }
  return total;
}

/** "5" → "5º", "10" → "10", "4-A" → "4º-A" */
function ordinal(number: string): string {
  const [base = "", letter] = number.split("-");
  const withOrdinal = Number(base) < 10 ? `${base}º` : base;
  return letter ? `${withOrdinal}-${letter}` : withOrdinal;
}

export function fileName(article: Article): string {
  const [base = "", letter] = article.number.split("-");
  const number = base.padStart(3, "0") + (letter ? `-${letter.toLowerCase()}` : "");
  const prefix = article.part === "principal" ? "" : `${article.part}-`;
  return `${prefix}art-${number}.md`;
}

export function articleLabel(article: Article): string {
  const label = `Art. ${ordinal(article.number)}`;
  return article.part === "principal" ? label : `${label} do ${article.part.toUpperCase()}`;
}

function provisionLabel(p: Provision): string {
  switch (p.type) {
    case "paragraph":
      return p.number === "unico" ? "Parágrafo único" : `§ ${ordinal(p.number)}`;
    case "clause":
      return `Inciso ${p.number}`;
    case "subclause":
      return `Alínea ${p.number}`;
  }
}

function anchor(p: Provision, parent?: string): string {
  const [base = "", letter] = p.number.split("-");
  const suffix = letter ? `-${letter.toLowerCase()}` : "";
  const own = {
    paragraph: `par-${base}${suffix}`,
    clause: `inc-${romanToArabic(base)}${suffix}`,
    subclause: `al-${p.number}`,
  }[p.type];
  return parent ? `${parent}-${own}` : own;
}

const isRepeal = (note: string) => /^(?:Revogad|Suprimid)[oa]/i.test(note);

const inForce = (p: Provision): boolean => p.text.length > 0 || p.children.some(inForce);

const paragraphs = (text: string[]) => (text.length ? text : ["*(Revogado)*"]);

export function articleToMarkdown(article: Article, meta: LawMeta): string {
  const notes: { dispositivo: string; texto: string }[] = article.notes.map((texto) => ({
    dispositivo: "caput",
    texto,
  }));
  const lines = ["", `# ${articleLabel(article)}`, ""];

  // Planalto sometimes strikes a whole article without a repeal note.
  const repealed =
    article.caput.length === 0 && (article.notes.some(isRepeal) || !article.children.some(inForce));
  if (article.caput.length || repealed) {
    for (const p of paragraphs(article.caput)) lines.push(p, "");
  }

  const write = (p: Provision, level: number, parent?: string) => {
    const id = anchor(p, parent);
    notes.push(...p.notes.map((texto) => ({ dispositivo: id, texto })));
    lines.push(`${"#".repeat(level)} <a id="${id}"></a>${provisionLabel(p)}`, "");
    for (const text of paragraphs(p.text)) lines.push(text, "");
    for (const child of p.children) write(child, Math.min(level + 1, 6), id);
  };
  for (const p of article.children) write(p, 2);

  // Frontmatter keys are the public data contract of legislacao-br (Portuguese).
  const frontmatter = {
    id: `${meta.law}-${fileName(article).replace(/\.md$/, "")}`,
    norma: meta.law,
    artigo: article.number,
    rotulo: articleLabel(article),
    ...(Object.keys(article.hierarchy).length ? { hierarquia: hierarchyKeys(article.hierarchy) } : {}),
    fonte: meta.source,
    capturado_em: meta.capturedAt,
    revogado: repealed,
    notas: notes,
  };

  return `---\n${stringify(frontmatter, { lineWidth: 0 })}---\n${lines.join("\n")}`;
}

const PUBLIC_HIERARCHY_KEYS = { title: "titulo", chapter: "capitulo", section: "secao", subsection: "subsecao" } as const;

function hierarchyKeys(hierarchy: Article["hierarchy"]): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, publicKey] of Object.entries(PUBLIC_HIERARCHY_KEYS)) {
    const value = hierarchy[key as keyof typeof PUBLIC_HIERARCHY_KEYS];
    if (value) result[publicKey] = value;
  }
  return result;
}
