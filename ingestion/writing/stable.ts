const FRONTMATTER = /^---\n([\s\S]*?)\n---\n/;
const CAPTURE_DATE = /^capturado_em: .*$/m;

/** The text without the capture date line of its frontmatter (the body is left untouched). */
function withoutCaptureDate(text: string): string {
  return text.replace(FRONTMATTER, (_, frontmatter: string) => `---\n${frontmatter.replace(CAPTURE_DATE, "")}\n---\n`);
}

/**
 * What to write for a file: the previous version when the only difference is
 * the capture date, so that capturing again an unchanged law changes nothing.
 */
export function keepIfOnlyCaptureDateChanged(previous: string | undefined, next: string): string {
  return previous !== undefined && withoutCaptureDate(previous) === withoutCaptureDate(next) ? previous : next;
}
