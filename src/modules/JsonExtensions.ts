type Json = Record<string, unknown> | unknown[];

/**
 * @param {string} text
 * @returns {Record<string, unknown> | Record<string, unknown>[] | null}
 */
export function tryParse(text: string): Json | null {
  const cleaned = text
    .replaceAll('\n', '')
    .replaceAll(/\/\*\s*<!\[CDATA\[\s*\*\//g, '')
    .replaceAll(/\/\*\s*\]\]>\s*\*\//g, '')
    .trim();
  try {
    return JSON.parse(cleaned) as Json;
  }
  catch (e) {
    if (!(e instanceof Error)) throw e;
    console.warn(e.message, cleaned);
    return null;
  }
}

/**
 * @param {Record<string, unknown> | Record<string, unknown>[] | null} data
 * @returns {Record<string, unknown>[]}
 */
export function extractObjects(data: Json | null): Record<string, unknown>[] {
  return Array.from(new Set(visit(data)));

  /**
   * @param {Record<string, unknown> | Record<string, unknown>[] | null} data
   * @returns {Record<string, unknown>[]}
   */
  function visit(data: Json | null): Record<string, unknown>[] {
    if (data === null || typeof data !== 'object') return [];
    if (Array.isArray(data))
      return data.flatMap(item => visit(item as Json | null));
    const children = Object.values(data).flatMap((value: unknown) =>
      visit(value as Json | null),
    );
    return [data as Record<string, unknown>, ...children];
  }
}
