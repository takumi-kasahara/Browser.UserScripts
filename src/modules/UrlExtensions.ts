/**
 * Resolves a URL only when it uses a web-safe protocol.
 * @param candidate
 * @param baseUrl
 */
export function getHttpUrl(candidate: string, baseUrl: string): string | null {
  try {
    const url = new URL(candidate, baseUrl);
    return /^https?:$/.test(url.protocol) ? url.href : null;
  }
  catch {
    return null;
  }
}
