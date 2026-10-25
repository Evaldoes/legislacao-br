import * as cheerio from "cheerio";

// Internal block separator; never appears in legal text.
const BREAK = " ";

const BLOCK_ELEMENTS = "p, div, tr, li, h1, h2, h3, h4, h5, h6, center, blockquote";

// A paragraph whose only non-struck content is notes, one of them a repeal note.
const ONLY_NOTES = /^[\s.;,]*(?:\([^()]*\)[\s.;,]*)+$/;

// Marks an ordinal sign written as a superscript "o"; glued to the number later.
const ORDINAL_MARK = "\uE000";
const ORDINAL_GLUE = new RegExp(String.raw`\s*${ORDINAL_MARK}`, "g");

// Text in force that is only a provision label ("III"), apart from notes.
const LONE_LABEL = /^\s*(?:Art\.?\s*\d+\S*|§\s*\d+\S*|Parágrafo único|[IVXLCDM]+(?:-[A-Z])?|[a-z]\))\s*[-–—.:]?\s*$/u;
const NOTE = /\([^()]*\)/g;

// Provision label at the start of a struck text.
const LABEL =
  /^(Art\.?\s*\d+\s*(?:\.?\s*[º°])?(?:-[A-Z])?\.?|§\s*\d+\s*(?:\.?\s*[º°])?(?:-[A-Z])?|Parágrafo único|[IVXLCDM]+(?:-[A-Z])?\s*[-–—]|[a-z]\))/u;

/**
 * Converts a law's HTML into a list of text blocks, one per paragraph,
 * dropping struck-through content (repealed text).
 */
export function extractBlocks(html: string): string[] {
  const $ = cheerio.load(html);

  $("script, style").remove();
  $("strike, s, del").attr("data-struck", "");
  $("[style]")
    .filter((_, el) => /line-through/i.test($(el).attr("style") ?? ""))
    .attr("data-struck", "");

  // A caput struck in full, with no note, belongs to a superseded version of
  // the article. Planalto sometimes leaves the labels of that version's
  // provisions outside the <strike> ("III <strike>- classistas</strike>"):
  // until the article in force starts, such leftovers are dropped.
  let superseded = false;

  $("p").each((_, p) => {
    const struck = $(p).find("[data-struck]");
    const rest = $(p).clone();
    rest.find("[data-struck]").remove();
    const notes = rest.text();

    if (/^\s*Art\./.test(notes)) superseded = false;
    if (!struck.length) return;

    if (!notes.trim() && /^\s*Art\./.test(struck.text())) {
      superseded = true;
      return;
    }
    if (superseded && LONE_LABEL.test(notes.replace(NOTE, "").replace(/[\s.;,]+$/, ""))) {
      $(p).remove();
      return;
    }

    // Provision repealed in full: Planalto strikes the label along with the
    // text and leaves only the "(Revogado ...)" note. Without the label the
    // note would refer to nothing, so the label is kept.
    if (!ONLY_NOTES.test(notes) || !notes.includes("(Revogad")) return;

    const label = LABEL.exec(struck.text().replace(/\s+/g, " ").trimStart())?.[1];
    if (label) $(p).prepend(`${label} `);
  });

  $("[data-struck]").remove();

  // "§ 1<sup>o</sup>": the ordinal sign in superscript.
  $("sup")
    .filter((_, sup) => /^\s*[oº°]\s*$/u.test($(sup).text()))
    .replaceWith(`${ORDINAL_MARK}º`);

  // The source HTML breaks lines mid-sentence; only block boundaries count
  // as breaks.
  $("*")
    .contents()
    .each((_, node) => {
      if (node.type === "text") node.data = node.data.replace(/\s+/g, " ");
    });

  $("br").replaceWith(BREAK);
  $(BLOCK_ELEMENTS).each((_, el) => {
    $(el).prepend(BREAK).append(BREAK);
  });

  return $.root()
    .text()
    .split(BREAK)
    .map((block) => block.replace(/[\s ]+/g, " ").replace(ORDINAL_GLUE, "").trim())
    .filter((block) => block.length > 0);
}
