import iconv from "iconv-lite";

const CHARSET = /charset\s*=\s*["']?([\w-]+)/i;

/**
 * Planalto pages are mostly windows-1252 without declaring a charset; a
 * declared one (header or meta tag) wins when present.
 */
export function decode(bytes: Buffer, contentType?: string): string {
  const declared =
    CHARSET.exec(contentType ?? "")?.[1] ?? CHARSET.exec(bytes.subarray(0, 4096).toString("latin1"))?.[1];
  const charset = declared && iconv.encodingExists(declared) ? declared : "win1252";
  return iconv.decode(bytes, charset);
}

export async function download(url: string): Promise<{ bytes: Buffer; html: string }> {
  const response = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (legislacao-br)" } });
  if (!response.ok) throw new Error(`Failed to download ${url}: HTTP ${response.status}`);

  const bytes = Buffer.from(await response.arrayBuffer());
  return { bytes, html: decode(bytes, response.headers.get("content-type") ?? undefined) };
}
