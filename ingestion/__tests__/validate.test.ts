import { describe, expect, it } from "vitest";
import type { Article } from "../parsers/structure.js";
import { findGaps } from "../validate.js";

const article = (part: string, number: string): Article => ({
  part,
  number,
  hierarchy: {},
  caput: [],
  notes: [],
  children: [],
});

describe("findGaps", () => {
  it("reports missing numbers in each part's sequence", () => {
    const articles = ["1", "2", "4", "4-A", "6"].map((n) => article("principal", n));
    articles.push(article("adct", "1"), article("adct", "3"));

    expect(findGaps(articles)).toEqual({ principal: ["3", "5"], adct: ["2"] });
  });

  it("reports nothing when the sequence is complete", () => {
    expect(findGaps(["1", "2", "2-A", "3"].map((n) => article("principal", n)))).toEqual({});
  });
});
