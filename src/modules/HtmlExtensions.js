/**
 * @param {string} text
 */
export function escape(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
/**
 * @param {HTMLElement} element
 */
export function available(element) {
  if (!element) throw new TypeError('Element is required.');

  if (!element.isConnected) return false;
  if ((
    element instanceof HTMLButtonElement
    || element instanceof HTMLFieldSetElement
    || element instanceof HTMLInputElement
    || element instanceof HTMLOptGroupElement
    || element instanceof HTMLOptionElement
    || element instanceof HTMLSelectElement
    || element instanceof HTMLTextAreaElement
  ) && element.disabled) return false;
  if (window.getComputedStyle(element).pointerEvents === 'none') return false;

  if (!element.parentElement) return true;
  return available(element.parentElement);
}
/**
 * @param {HTMLElement} element
 */
export function visible(element) {
  if (!element) throw new TypeError('Element is required.');

  if (element.hidden) return false;
  if (window.getComputedStyle(element).display === 'none') return false;
  if (window.getComputedStyle(element).visibility === 'hidden') return false;

  if (!element.parentElement) return true;
  return visible(element.parentElement);
}
/**
 * @param {Element} element
 * @param {string} scopeAttribute
 * @param {string} propertyAttribute
 * @param {...HTMLElement} properties
 * @returns {Record<string, unknown> | null}
 */
export function extractElement(element, scopeAttribute, propertyAttribute, ...properties) {
  const grouped = Object.groupBy(
    Array.from(element.querySelectorAll(`[${propertyAttribute}]`))
      .filter(e => e instanceof HTMLElement)
      .filter(e => properties.length === 0 || properties.includes(e))
      .filter(e => e.parentElement?.closest(`[${scopeAttribute}]`) === element || e.closest(`[${scopeAttribute}]`) === null),
    e => e.getAttribute(propertyAttribute) ?? '');
  if (Object.keys(grouped).length === 0) return null;
  const data = new Map();
  for (const [key, group] of Object.entries(grouped)) {
    if (!key || !group || group.length === 0) continue;
    const first = group.at(0);
    if (!first) continue;
    data.set(key, group.length === 1 ? getValue(first, scopeAttribute, propertyAttribute) : group.map(e => getValue(e, scopeAttribute, propertyAttribute)));
  }
  return Object.fromEntries(data);

  /**
   * @see {@link https://html.spec.whatwg.org/multipage/microdata.html#values}
   * @param {HTMLElement} element
   * @param {string} scopeAttribute
   * @param {string} propertyAttribute
   */
  function getValue(element, scopeAttribute, propertyAttribute) {
    if (element.matches(`[${scopeAttribute}]`)) return extractElement(element, scopeAttribute, propertyAttribute);
    if (element.hasAttribute('content')) return element.getAttribute('content');
    if (element instanceof HTMLMetaElement) return element.content;
    if (element instanceof HTMLAudioElement)
      return element.src ?? Array.from(element.children)
        .find(e => e instanceof HTMLSourceElement || e instanceof HTMLTrackElement)?.src;
    if (element instanceof HTMLEmbedElement) return element.src;
    if (element instanceof HTMLIFrameElement) return element.src;
    if (element instanceof HTMLImageElement) return element.src ?? element.srcset;
    if (element instanceof HTMLSourceElement) return element.src ?? element.srcset;
    if (element instanceof HTMLTrackElement) return element.src;
    if (element instanceof HTMLVideoElement)
      return element.src ?? Array.from(element.children)
        .find(e => e instanceof HTMLSourceElement || e instanceof HTMLTrackElement)?.src;
    if (element instanceof HTMLAnchorElement) return element.href;
    if (element instanceof HTMLAreaElement) return element.href;
    if (element instanceof HTMLLinkElement) return element.href;
    if (element instanceof HTMLObjectElement) return element.data;
    if (element instanceof HTMLDataElement) return element.value;
    if (element instanceof HTMLMeterElement) return element.value;
    if (element instanceof HTMLTimeElement) return element.dateTime;
    return (element.textContent ?? '').trim();
  }
}
