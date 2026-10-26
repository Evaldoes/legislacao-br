const FILE_HEADER = /^diff --git a\/(normas\/([^/]+)\/[^ ]+) b\//;
const ADDED_NOTE = /^\+\s+texto: (.+)$/;
const AMENDMENT = /Emenda Constitucional nº (\d+), de (\d{4})/;
const LAW = /Lei(?: Complementar)? nº ([\d.]+), de (\d{4})/;
const MAX_REFERENCES = 3;

/** "Emenda Constitucional nº 141, de 2026" → "EC 141/2026"; "Lei nº 14.601, de 2023" → "Lei 14.601/2023". */
function referenceOf(note: string): string | null {
  const ec = AMENDMENT.exec(note);
  if (ec) return `EC ${ec[1]}/${ec[2]}`;
  const law = LAW.exec(note);
  return law ? `Lei ${law[1]}/${law[2]}` : null;
}

/**
 * Title and description of an update pull request, from the unified diff of
 * normas/: the laws and files that changed, the new notes, and the amendments
 * or laws those notes cite (or the date when there is none).
 */
export function describeChanges(diff: string, date: string): { title: string; body: string } {
  const laws = new Set<string>();
  const files: string[] = [];
  const notes: string[] = [];

  for (const line of diff.split("\n")) {
    const header = FILE_HEADER.exec(line);
    if (header) {
      laws.add(header[2]!);
      if (!header[1]!.endsWith("/_norma.md")) files.push(header[1]!);
      continue;
    }
    const note = ADDED_NOTE.exec(line);
    if (note && !notes.includes(note[1]!)) notes.push(note[1]!);
  }

  const references = [...new Set(notes.map(referenceOf).filter((r): r is string => r !== null))].slice(0, MAX_REFERENCES);
  const about = references.length ? references.join(", ") : date;
  const lawList = [...laws];
  const title =
    lawList.length === 1
      ? `${lawList[0]}: atualização do Planalto (${about})`
      : `atualização do Planalto: ${lawList.join(", ")} (${about})`;

  const body = [
    `Captura automática do Portal da Legislação do Planalto em ${date}.`,
    "",
    "**Revise o diff antes de juntar:** o texto deve ser idêntico ao oficial em vigor.",
    "",
    `### Arquivos alterados (${files.length})`,
    ...files.map((f) => `- \`${f}\``),
    ...(notes.length ? ["", "### Notas novas", ...notes.map((n) => `- ${n}`)] : []),
  ].join("\n");

  return { title, body };
}
