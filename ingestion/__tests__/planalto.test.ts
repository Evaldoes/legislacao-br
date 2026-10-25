import { describe, expect, it } from "vitest";
import iconv from "iconv-lite";
import { decode } from "../sources/planalto.js";

describe("decode", () => {
  it("defaults to windows-1252 (old Planalto pages)", () => {
    const bytes = iconv.encode("<p>Constituição</p>", "win1252");

    expect(decode(bytes)).toBe("<p>Constituição</p>");
  });

  it("honors the UTF-8 charset declared in Content-Type", () => {
    const bytes = Buffer.from("<p>Constituição</p>", "utf8");

    expect(decode(bytes, "text/html; charset=UTF-8")).toBe("<p>Constituição</p>");
  });

  it("honors the charset declared in the meta tag", () => {
    const bytes = Buffer.from('<meta charset="utf-8"><p>Seção</p>', "utf8");

    expect(decode(bytes)).toBe('<meta charset="utf-8"><p>Seção</p>');
  });
});
