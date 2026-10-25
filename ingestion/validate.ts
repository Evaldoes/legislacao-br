import type { Article } from "./parsers/structure.js";

/** Article numbers missing between 1 and the highest number of each part. */
export function findGaps(articles: Article[]): Record<string, string[]> {
  const byPart = new Map<string, Set<number>>();
  for (const a of articles) {
    const base = Number(a.number.split("-")[0]);
    if (!byPart.has(a.part)) byPart.set(a.part, new Set());
    byPart.get(a.part)!.add(base);
  }

  const result: Record<string, string[]> = {};
  for (const [part, numbers] of byPart) {
    const missing: string[] = [];
    for (let n = 1; n <= Math.max(...numbers); n++) if (!numbers.has(n)) missing.push(String(n));
    if (missing.length) result[part] = missing;
  }
  return result;
}
