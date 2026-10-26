import { describe, expect, it } from "vitest";
import { describeChanges } from "../changes.js";

const fileDiff = (path: string, added: string[]) =>
  [`diff --git a/${path} b/${path}`, `--- a/${path}`, `+++ b/${path}`, "@@ -1,3 +1,4 @@", ...added.map((l) => `+${l}`)].join("\n");

describe("describeChanges", () => {
  it("names the law and the amendments of the new notes", () => {
    const diff = [
      fileDiff("normas/constituicao-1988/art-007.md", [
        "  - dispositivo: inc-15",
        "    texto: Redação dada pela Emenda Constitucional nº 141, de 2026",
      ]),
      fileDiff("normas/constituicao-1988/_norma.md", ["capturado_em: 2026-12-21"]),
    ].join("\n");

    const { title, body } = describeChanges(diff, "2026-12-21");

    expect(title).toBe("constituicao-1988: atualização do Planalto (EC 141/2026)");
    expect(body).toContain("- `normas/constituicao-1988/art-007.md`");
    expect(body).not.toContain("_norma.md`");
    expect(body).toContain("Redação dada pela Emenda Constitucional nº 141, de 2026");
  });

  it("cites laws too, at most 3 references, without repeating", () => {
    const diff = fileDiff("normas/constituicao-1988/art-006.md", [
      "    texto: Incluído pela Emenda Constitucional nº 114, de 2021",
      "    texto: Vide Lei nº 14.601, de 2023",
      "    texto: Redação dada pela Emenda Constitucional nº 114, de 2021",
      "    texto: Redação dada pela Emenda Constitucional nº 90, de 2015",
      "    texto: Redação dada pela Emenda Constitucional nº 64, de 2010",
    ]);

    expect(describeChanges(diff, "2026-11-02").title).toBe(
      "constituicao-1988: atualização do Planalto (EC 114/2021, Lei 14.601/2023, EC 90/2015)",
    );
  });

  it("uses the date when no reference is found", () => {
    const diff = fileDiff("normas/constituicao-1988/art-198.md", ["Texto corrigido."]);
    expect(describeChanges(diff, "2026-11-02").title).toBe("constituicao-1988: atualização do Planalto (2026-11-02)");
  });

  it("groups several laws", () => {
    const diff = [
      fileDiff("normas/constituicao-1988/art-007.md", ["a"]),
      fileDiff("normas/lei-8078-1990/art-006.md", ["b"]),
    ].join("\n");
    expect(describeChanges(diff, "2026-11-02").title).toBe(
      "atualização do Planalto: constituicao-1988, lei-8078-1990 (2026-11-02)",
    );
  });
});
