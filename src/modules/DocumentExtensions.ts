/**
 * @param {unknown} data
 * @param {string} type
 * @param {string} name
 */
export function download(data: unknown, type: string, name: string): void {
  const blob = new Blob([JSON.stringify(data)], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}
/**
 * @param {number} ms
 */
export async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
/**
 * @param {string} selector
 * @param {number} maxRetry
 */
export async function waitForElement(
  selector: string,
  maxRetry = 10,
): Promise<Element | null> {
  for (let i = 0; i < maxRetry; i++) {
    const element = document.querySelector(selector);
    if (element) return element;
    await sleep(1000);
  }
  return null;
}
