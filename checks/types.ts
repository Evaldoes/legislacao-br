export type ProvisionType = "paragraph" | "clause" | "subclause";

export type Hierarchy = {
  title?: string;
  chapter?: string;
  section?: string;
  subsection?: string;
};

export type ProvisionData = {
  type: ProvisionType;
  anchor: string;
  /** Anchor of the parent provision; null when directly under the caput. */
  parentAnchor: string | null;
  label: string;
  /** Null when repealed. */
  text: string | null;
  repealed: boolean;
  /** Order within the article. */
  position: number;
};

export type NoteData = {
  /** Anchor of the provision; null for the caput. */
  anchor: string | null;
  text: string;
};

export type ArticleData = {
  slug: string;
  part: string;
  number: string;
  label: string;
  hierarchy: Hierarchy;
  caput: string;
  repealed: boolean;
  provisions: ProvisionData[];
  notes: NoteData[];
};

export type LawData = {
  slug: string;
  type: string;
  name: string;
  date: string;
  aliases: string[];
  source: string;
  capturedAt: string;
  preamble: string | null;
  /** In official order (position = index in this array). */
  articles: ArticleData[];
};
