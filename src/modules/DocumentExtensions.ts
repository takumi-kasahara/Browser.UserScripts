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
