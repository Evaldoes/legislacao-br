import * as cheerio from "cheerio";

// Internal block separator; never appears in legal text.
const BREAK = " ";

const BLOCK_ELEMENTS = "p, div, tr, li, h1, h2, h3, h4, h5, h6, center, blockquote";

// A paragraph whose only non-struck content is notes, one of them a repeal
// note, sometimes followed by loose links ("(Revogado ...) Vigência").
const ONLY_NOTES = /^[\s.;,]*(?:(?:\([^()]*\)|Vigência|Regulamento|Produção de efeitos?)[\s.;,]*)+$/u;
const REPEAL = /\((?:Revogad|Suprimid)/u;
const isOnlyNotes = (text: string) => !text.trim() || ONLY_NOTES.test(text);

// End of a note whose beginning is struck: text up to a ")" with no "(".
const NOTE_TAIL = /^[^()]*\)/;

// "Art. 28", "Art. . 154", "Art. 12-A" anywhere in a paragraph's text.
const ARTICLE_KEY = /^\s*Art\.?(?:\s*\.)?\s*(\d+)(?:\s*\.?\s*[º°])?(?:-?([A-Z])(?![a-zà-ú]))?/u;

function articleKey(text: string): string | undefined {
  const m = ARTICLE_KEY.exec(text.replace(/\s+/g, " "));
  return m ? (m[2] ? `${m[1]}-${m[2]}` : m[1]) : undefined;
}

// Marks an ordinal sign written as a superscript "o"; glued to the number later.
const ORDINAL_MARK = "\uE000";
const ORDINAL_GLUE = new RegExp(String.raw`\s*${ORDINAL_MARK}`, "g");

// Text in force that is only a provision label ("III"), apart from notes.
const LONE_LABEL = /^\s*(?:Art\.?\s*\d+\S*|§\s*\d+\S*|Parágrafo único|[IVXLCDM]+(?:-[A-Z])?|[a-z]\))\s*[-–—.:]?\s*$/u;
const NOTE = /\([^()]*\)/g;

// A note of a provisional measure that lapsed, followed by Planalto's
// "(Vigência encerrada)" link, sometimes with an extra pair of parentheses:
// "((Revogado pela Medida Provisória nº 905, de 2019) (Vigência encerrada))".
// What the measure included, rewrote or repealed no longer stands.
const LAPSED =
  /\s*\(?\s*(?:\([^()]*\)\s*)?\(?\s*Vigência\s+encerrada\s*\)?\s*\)?/giu;

const LAPSED_MARK = /Vigência\s+encerrada/iu;

const withoutLapsed = (text: string) => text.replace(LAPSED, " ");

// Provision label at the start of a struck text.
const LABEL =
  /^(Art\.?\s*\d+(?:\s*\.?\s*[º°])?(?:-[A-Z](?![a-zà-ú]))?\.?|§\s*\d+(?:\s*\.?\s*[º°])?(?:-[A-Z](?![a-zà-ú]))?|Parágrafo único|[IVXLCDM]+(?:-[A-Z])?\s*[-–—]|[a-z]\))/u;

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

  const paragraphs = $("p").toArray();
  const keys = paragraphs.map((p) => articleKey($(p).text()));
  const inForce = paragraphs.map((p) => {
    const rest = $(p).clone();
    rest.find("[data-struck]").remove();
    return articleKey(rest.text()) !== undefined;
  });

  // Paragraphs that start an article, up to a few in each direction.
  const nearby = (index: number, step: 1 | -1) => {
    const found: number[] = [];
    for (let i = index + step; i >= 0 && i < paragraphs.length && found.length < 10; i += step) {
      if (keys[i]) found.push(i);
    }
    return found;
  };
  const hasVersionInForce = (index: number) =>
    [...nearby(index, -1), ...nearby(index, 1)].some((i) => inForce[i] && keys[i] === keys[index]);

  // A struck caput without a note is an old version of the article when
  // another version follows it or is in force, or when its number is out of
  // sequence (Planalto typos such as "Art. 60." among versions of Art. 670).
  // Otherwise it is an article Planalto struck without a repeal note.
  const isOldVersion = (index: number) => {
    const key = keys[index];
    const number = parseInt(key ?? "", 10);
    const before = nearby(index, -1).find((i) => keys[i] !== key);
    const after = nearby(index, 1).find((i) => keys[i] !== key);
    return (
      hasVersionInForce(index) ||
      nearby(index, 1).some((i) => keys[i] === key) ||
      (before !== undefined && parseInt(keys[before]!, 10) > number) ||
      (after !== undefined && parseInt(keys[after]!, 10) < number)
    );
  };

  paragraphs.forEach((p, index) => {
    const struck = $(p).find("[data-struck]");
    const rest = $(p).clone();
    rest.find("[data-struck]").remove();

    const original = rest.text();
    let struckText = struck.text().replace(/\s+/g, " ").trimStart();
    let notes = original;

    // "A<strike>rt. 28 ...</strike>": the first letter left outside the strike.
    if (/^rt\b/.test(struckText) && /^\s*A(?!\p{L})/u.test(notes)) {
      struckText = `A${struckText}`;
      notes = notes.replace(/^\s*A/u, "");
    }

    const lapsed = LAPSED_MARK.test(notes);
    notes = withoutLapsed(notes);

    // The end of a struck note left outside the strike:
    // "<strike>... (Redação dada pelo Decreto-lei nº 8.740, de 1946,</strike>
    // com vigência suspensa pelo Decreto-lei nº 8.987-A, de 1946)".
    const tail = NOTE_TAIL.exec(notes);
    if (struck.length && tail && isOnlyNotes(notes.slice(tail[0].length))) {
      notes = notes.slice(tail[0].length);
    }

    if (/^\s*Art\./.test(notes)) superseded = false;
    if (!struck.length) return;

    // Text struck by Planalto whose only remark is that the measure lapsed.
    if (lapsed && !/[\p{L}\p{N}]/u.test(notes)) {
      $(p).remove();
      return;
    }

    const label = LABEL.exec(struckText)?.[1];

    if (!notes.trim() && /^Art\./.test(struckText)) {
      if (isOldVersion(index)) {
        superseded = true;
        $(p).remove();
      } else {
        superseded = false;
        $(p).text(label ?? "");
      }
      return;
    }
    if (superseded && LONE_LABEL.test(notes.replace(NOTE, "").replace(/[\s.;,]+$/, ""))) {
      $(p).remove();
      return;
    }

    // Provision repealed in full: Planalto strikes the label along with the
    // text and leaves only the "(Revogado ...)" note. Without the label the
    // note would refer to nothing, so the label is kept.
    const repealed = isOnlyNotes(notes) && REPEAL.test(notes);
    if (repealed && /^Art/.test(struckText)) {
      // An article repealed and later restored: the version in force stands.
      if (hasVersionInForce(index)) {
        $(p).remove();
        return;
      }
      superseded = false;
    } else if (repealed && superseded) {
      // A provision of the superseded version, repealed along with it.
      $(p).remove();
      return;
    }
    if (notes !== original) {
      $(p).text(repealed && label ? `${label} ${notes}` : notes);
    } else if (repealed && label) {
      $(p).prepend(`${label} `);
    }
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
    .map((block) => withoutLapsed(block).replace(/[\s ]+/g, " ").replace(ORDINAL_GLUE, "").trim())
    .filter((block) => block.length > 0);
}
