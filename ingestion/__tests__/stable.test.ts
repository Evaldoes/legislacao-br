import { describe, expect, it } from "vitest";
import { keepIfOnlyCaptureDateChanged } from "../writing/stable.js";

const file = (date: string, text = "Todos são iguais.") => `---
id: constituicao-1988-art-005
norma: constituicao-1988
capturado_em: ${date}
revogado: false
---

# Art. 5º

${text}
`;

describe("keepIfOnlyCaptureDateChanged", () => {
  it("keeps the previous file when only the capture date changed", () => {
    expect(keepIfOnlyCaptureDateChanged(file("2026-10-22"), file("2026-11-01"))).toBe(file("2026-10-22"));
  });

  it("takes the new file when the content changed", () => {
    const next = file("2026-11-01", "Todos são iguais perante a lei.");
    expect(keepIfOnlyCaptureDateChanged(file("2026-10-22"), next)).toBe(next);
  });

  it("takes the new file when there was none", () => {
    expect(keepIfOnlyCaptureDateChanged(undefined, file("2026-11-01"))).toBe(file("2026-11-01"));
  });

  it("only ignores the capture date line of the frontmatter", () => {
    const withDateInBody = (date: string) => file("2026-10-22", `capturado_em: ${date}`);
    const next = withDateInBody("2026-11-01");
    expect(keepIfOnlyCaptureDateChanged(withDateInBody("2026-10-22"), next)).toBe(next);
  });
});
