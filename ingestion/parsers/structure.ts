import { classifyBlock, type HeadingType, type ProvisionType } from "./classify.js";
import { splitNotes } from "./notes.js";

export type StructureOptions = {
  /** Block where the law's text starts (anything before it is site navigation). */
  start: RegExp;
  /** Block that ends a part (signatures and footer come after it). */
  end: RegExp;
  /** Parts with their own numbering that start after the end, such as the ADCT. */
  annexes: { marker: RegExp; part: string }[];
};

export type Hierarchy = Partial<Record<HeadingType, string>>;

export type Provision = {
  type: ProvisionType;
  number: string;
  text: string[];
  notes: string[];
  children: Provision[];
};

export type Article = {
  part: string;
  number: string;
  hierarchy: Hierarchy;
  caput: string[];
  notes: string[];
  children: Provision[];
};

export type StructuredLaw = {
  preamble: string[];
  articles: Article[];
  warnings: string[];
};

const LEVELS: HeadingType[] = ["title", "chapter", "section", "subsection"];

const HEADING_LABELS: Record<HeadingType, string> = {
  title: "Título",
  chapter: "Capítulo",
  section: "Seção",
  subsection: "Subseção",
};

type Target = { text: string[]; notes: string[] };

export function buildStructure(blocks: string[], options: StructureOptions): StructuredLaw {
  const law: StructuredLaw = { preamble: [], articles: [], warnings: [] };
  const seen = new Set<string>();

  let started = false;
  let part: string | null = null;
  let hierarchy: Hierarchy = {};
  let unnamedHeading: HeadingType | null = null;
  // Last heading while no article has started under it.
  let openHeading: HeadingType | null = null;
  let article: Article | null = null;
  let paragraph: Provision | null = null;
  let clause: Provision | null = null;
  let target: Target | null = null;

  const closeArticle = () => {
    article = paragraph = clause = target = null;
  };

  const newProvision = (type: ProvisionType, number: string, text: string, notes: string[]): Provision => ({
    type,
    number,
    text: text ? [text] : [],
    notes,
    children: [],
  });

  // Adds a provision to its parent. Planalto sometimes lists a provision twice
  // (the struck original, whose label is kept, and an explicit "(Revogado)"
  // line; or an old repeal next to the version in force); they become one.
  const attach = (owner: Article, parent: { children: Provision[] }, created: Provision): Provision => {
    const existing = parent.children.find((c) => c.type === created.type && c.number === created.number);
    let attached = created;
    if (!existing) {
      parent.children.push(created);
    } else if (existing.text.length === 0 && created.text.length === 0) {
      for (const note of created.notes) if (!existing.notes.includes(note)) existing.notes.push(note);
      attached = existing;
    } else if (created.text.length === 0 || existing.text.join("\n") === created.text.join("\n")) {
      // The repeal of an older version of a provision now in force, or the
      // same text listed twice: the provision in force stands.
      attached = existing;
    } else if (existing.text.length === 0) {
      // A repealed provision restored later.
      parent.children[parent.children.indexOf(existing)] = created;
    } else {
      law.warnings.push(`duplicate provision: ${owner.part} ${owner.number} ${created.type} ${created.number}`);
      parent.children.push(created);
    }
    target = attached;
    return attached;
  };

  for (const [index, raw] of blocks.entries()) {
    if (part === null) {
      if (!started && options.start.test(raw)) {
        started = true;
        part = "principal";
      } else if (started) {
        const annex = options.annexes.find((a) => a.marker.test(raw));
        if (annex) {
          part = annex.part;
          hierarchy = {};
        }
      }
      continue;
    }

    if (options.end.test(raw)) {
      part = null;
      closeArticle();
      continue;
    }

    const { text, notes } = splitNotes(raw);
    if (!text) {
      target?.notes.push(...notes);
      continue;
    }

    const b = classifyBlock(text);

    // A provision without text only makes sense with a note explaining it (repealed).
    const empty = b.type !== "residue" && "text" in b && !b.text && notes.length === 0;
    if (b.type === "residue" || (empty && b.type !== "article")) continue;

    switch (b.type) {
      case "title":
      case "chapter":
      case "section":
      case "subsection": {
        for (const level of LEVELS.slice(LEVELS.indexOf(b.type))) delete hierarchy[level];
        const label = `${HEADING_LABELS[b.type]} ${b.number}`;
        hierarchy[b.type] = b.name ? `${label} – ${readableName(b.name)}` : label;
        unnamedHeading = b.name ? null : b.type;
        openHeading = b.type;
        closeArticle();
        continue;
      }

      case "article": {
        const key = `${part} ${b.number}`;
        if (seen.has(key)) law.warnings.push(`duplicate article: ${key}`);
        seen.add(key);

        const created: Article = {
          part,
          number: b.number,
          hierarchy: { ...hierarchy },
          caput: b.text ? [b.text] : [],
          notes,
          children: [],
        };
        law.articles.push(created);
        article = created;
        paragraph = clause = null;
        target = { text: created.caput, notes: created.notes };
        unnamedHeading = openHeading = null;
        continue;
      }

      case "paragraph": {
        if (!article) {
          law.warnings.push(`paragraph outside article: ${text.slice(0, 60)}`);
          continue;
        }
        paragraph = attach(article, article, newProvision("paragraph", b.number, b.text, notes));
        clause = null;
        continue;
      }

      case "clause": {
        const parent = paragraph ?? article;
        if (!article || !parent) {
          law.warnings.push(`clause outside article: ${text.slice(0, 60)}`);
          continue;
        }
        clause = attach(article, parent, newProvision("clause", b.number, b.text, notes));
        continue;
      }

      case "subclause": {
        const parent = clause ?? paragraph ?? article;
        if (!article || !parent) {
          law.warnings.push(`subclause outside article: ${text.slice(0, 60)}`);
          continue;
        }
        attach(article, parent, newProvision("subclause", b.letter, b.text, notes));
        continue;
      }

      case "text": {
        if (unnamedHeading) {
          hierarchy[unnamedHeading] += ` – ${readableName(b.text)}`;
          unnamedHeading = null;
        } else if (openHeading && !target) {
          // A heading name broken in two lines ("Do Incidente de
          // Desconsideração da" / "Personalidade Jurídica") continues;
          // a loose caption under a named heading ("Alimentação") is
          // not part of the law's structure and is dropped.
          const name = hierarchy[openHeading] ?? "";
          if (continuesName(name, b.text)) hierarchy[openHeading] = `${name} ${readableName(b.text, true)}`;
        } else if (target && isCaption(b.text, blocks[index + 1])) {
          // A caption between articles ("Trabalho aos domingos") is not
          // part of the text of the article before it.
          continue;
        } else if (target) {
          target.text.push(b.text);
          target.notes.push(...notes);
        } else if (part === "principal" && law.articles.length === 0 && !hierarchy.title) {
          law.preamble.push(b.text);
        } else {
          law.warnings.push(`text outside article: ${b.text.slice(0, 60)}`);
        }
        continue;
      }
    }
  }

  return law;
}

// Short line without final punctuation followed by an article or heading.
function isCaption(text: string, next: string | undefined): boolean {
  if (!next || /[.;:,!?)\]]$/.test(text) || !/^\p{Lu}/u.test(text) || text.length > 80) return false;
  const following = classifyBlock(splitNotes(next).text).type;
  return following === "article" || LEVELS.includes(following as HeadingType);
}

function continuesName(name: string, text: string): boolean {
  const last = name.split(" ").at(-1)?.toLowerCase() ?? "";
  return PARTICLES.has(last) || (text === text.toUpperCase() && /\p{L}/u.test(text));
}

const PARTICLES = new Set(
  "a à ao aos as às com da das de do dos e em entre na nas no nos o os ou para pela pelas pelo pelos por".split(" "),
);

/** Converts all-caps names ("DA SAÚDE") to the style used in the text itself ("Da Saúde"). */
export function readableName(name: string, continuing = false): string {
  if (name !== name.toUpperCase()) return name;

  return name
    .toLowerCase()
    .split(" ")
    .map((word, i) =>
      (i > 0 || continuing) && PARTICLES.has(word)
        ? word
        : word
            .split("-")
            .map((piece) => piece.charAt(0).toUpperCase() + piece.slice(1))
            .join("-"),
    )
    .join(" ");
}
