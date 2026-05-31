/**
 * @param {string} url
 * @param {string} text
 */
export function createAnchorElement(url, text) {
  const a = document.createElement('a');
  a.href = url;
  a.rel = 'noreferrer';
  a.target = '_blank';
  a.setHTML(text ? text : url);
  return a.outerHTML;
}
/**
 * @param {number} ms
 */
export async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
/**
 * @param {string} selector
 * @param {number} maxRetry
 */
export async function waitForElement(selector, maxRetry = 10) {
  for (let i = 0; i < maxRetry; i++) {
    const element = document.querySelector(selector);
    if (element) return element;
    await sleep(1000);
  }
  return null;
}
