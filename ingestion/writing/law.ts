import { stringify } from "yaml";
import type { HeadingType } from "../parsers/classify.js";
import type { Article } from "../parsers/structure.js";
import { articleLabel, fileName } from "./markdown.js";

export type LawDescription = {
  law: string;
  type: string;
  name: string;
  date: string;
  aliases: string[];
  source: string;
  capturedAt: string;
  /** Display names of parts with their own numbering (e.g. adct). */
  parts: Record<string, string>;
};

const LEVELS: HeadingType[] = ["title", "chapter", "section", "subsection"];

const withFrontmatter = (data: object, lines: string[]) =>
  `---\n${stringify(data, { lineWidth: 0 })}---\n${lines.join("\n")}`;

export function preambleToMarkdown(paragraphs: string[], d: LawDescription): string {
  return withFrontmatter(
    {
      id: `${d.law}-preambulo`,
      norma: d.law,
      rotulo: "Preâmbulo",
      fonte: d.source,
      capturado_em: d.capturedAt,
    },
    ["", "# Preâmbulo", "", ...paragraphs.flatMap((p) => [p, ""])],
  );
}

export function lawToMarkdown(articles: Article[], d: LawDescription, options: { preamble: boolean }): string {
  const lines = ["", `# ${d.name}`, ""];
  if (options.preamble) lines.push("[Preâmbulo](preambulo.md)", "");

  let links: string[] = [];
  const flushLinks = () => {
    if (links.length) lines.push(links.join(" · "), "");
    links = [];
  };

  let part = "principal";
  let current: Article["hierarchy"] = {};
  for (const article of articles) {
    if (article.part !== part) {
      flushLinks();
      part = article.part;
      current = {};
      lines.push(`## ${d.parts[part] ?? part}`, "");
    }

    const changed = LEVELS.findIndex((level) => article.hierarchy[level] !== current[level]);
    if (changed >= 0) {
      flushLinks();
      LEVELS.slice(changed).forEach((level, i) => {
        const name = article.hierarchy[level];
        if (name) lines.push(`${"#".repeat(changed + i + 2)} ${name}`, "");
      });
      current = article.hierarchy;
    }

    links.push(`[${articleLabel(article)}](${fileName(article)})`);
  }
  flushLinks();

  const counts: Record<string, number> = {};
  for (const a of articles) counts[a.part] = (counts[a.part] ?? 0) + 1;

  // Frontmatter keys are the public data contract of legislacao-br (Portuguese).
  return withFrontmatter(
    {
      norma: d.law,
      tipo: d.type,
      nome: d.name,
      data: d.date,
      apelidos: d.aliases,
      fonte: d.source,
      capturado_em: d.capturedAt,
      artigos: counts,
    },
    lines,
  );
}
