/**
 * @param {string} text
 * @returns {Record<string, unknown> | Record<string, unknown>[] | null}
 */
export function tryParse(text) {
  const cleaned = text.replaceAll('\n', '')
    .replaceAll(/\/\*\s*<!\[CDATA\[\s*\*\//g, '')
    .replaceAll(/\/\*\s*\]\]>\s*\*\//g, '')
    .trim();
  try {
    return JSON.parse(cleaned);
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
export function extractObjects(data) {
  return Array.from(new Set(visit(data)));

  /**
   * @param {Record<string, unknown> | Record<string, unknown>[] | null} data
   * @returns {Record<string, unknown>[]}
   */
  function visit(data) {
    if (data === null || typeof data !== 'object') return [];
    if (Array.isArray(data)) return data.flatMap(visit);
    const children = Object.values(data).flatMap(value => visit(
      /** @type {Record<string, unknown> | Record<string, unknown>[] | null} */(value)));
    return [data, ...children];
  }
}
