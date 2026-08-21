import { copyToClipboard } from './NavigatorExtensions.js';

export function select(): Selection | null {
  const selection = window.getSelection();
  if (!selection) return null;
  if (selection.rangeCount === 0) return null;

  const range = selection.getRangeAt(0);
  const ancestor = range.commonAncestorContainer;
  const node
    = ancestor instanceof HTMLElement ? ancestor : ancestor.parentElement;
  if (!node) return selection;
  range.selectNodeContents(node);
  selection.removeAllRanges();
  selection.addRange(range);
  return selection;
}

/**
 * @param {string[]} urls
 */
export async function open(urls: string[]): Promise<void> {
  if (!urls || urls.length === 0) return;
  const PAGE_SIZE = 20;
  const digits = String(urls.length).length;
  for (const [index, url] of urls.entries()) {
    const remaining = urls.length - index;
    if (
      urls.length > 1
      && remaining > 0
      && mod(index, PAGE_SIZE) === 0
      && !window.confirm(
        `Open ${Math.min(remaining, PAGE_SIZE)} URL(s)? (${String(index).padStart(digits, '0')} / ${urls.length})`,
      )
    ) {
      await copyToClipboard(
        `Copy ${urls.length - index} URL(s):`,
        urls.slice(index).join('\n'),
      );
      return;
    }
    window.open(url, '_blank', 'noreferrer');
  }

  /**
   * @param {number} number
   * @param {number} divisor
   */
  function mod(number: number, divisor: number): number {
    return number - Math.floor(number / divisor) * divisor;
  }
}

/**
 * @param {string} domain
 */
export function is(domain: string): boolean {
  return (
    location.hostname.split('.').slice(-domain.split('.').length).join('.')
    === domain
  );
}

/**
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status}
 * @param {URL} urlLike
 */
export async function tryFetch(
  urlLike: URL | string | { href: string } | { src: string },
): Promise<{ exists: boolean; url: string }> {
  const url = from(urlLike);
  if (equiv(location, url)) return { exists: true, url: url.href };
  try {
    const head = await fetch(url, { method: 'HEAD' });
    if (head.ok) return { exists: equiv(url, head.url), url: head.url };
    if ([403, 405].includes(head.status)) {
      const get = await fetch(url, { method: 'GET' });
      if (get.ok) return { exists: equiv(url, get.url), url: get.url };
    }
    return { exists: false, url: url.href };
  }
  catch (e) {
    if (!(e instanceof Error)) throw e;
    console.warn(e.message, url);
    return { exists: false, url: url.href };
  }
}

/**
 * @param {URL} urlLike
 */
export async function exists(
  urlLike: URL | string | { href: string } | { src: string },
): Promise<boolean> {
  const url = from(urlLike);
  if (location.href === url.href) return true;
  try {
    const head = await fetch(url, { method: 'HEAD' });
    if (head.ok) return equiv(url, head.url);
    if ([403, 405].includes(head.status)) {
      const get = await fetch(url, { method: 'GET' });
      if (get.ok) return equiv(url, get.url);
    }
    return false;
  }
  catch (e) {
    if (!(e instanceof Error)) throw e;
    console.warn(e.message, url.href);
    return false;
  }
}

/**
 * @param {URL | string | { href: string } | { src: string }} urlLike1
 * @param {URL | string | { href: string } | { src: string }} urlLike2
 */
export function equiv(
  urlLike1: URL | string | { href: string } | { src: string },
  urlLike2: URL | string | { href: string } | { src: string },
): boolean {
  const url1 = from(urlLike1);
  const url2 = from(urlLike2);
  if (url1.origin !== url2.origin) return false;
  if (
    url1.pathname.replaceAll(/\/\/+/g, '/').replace(/\/$/, '')
    !== url2.pathname.replaceAll(/\/\/+/g, '/').replace(/\/$/, '')
  )
    return false;
  if (url1.searchParams.size !== url2.searchParams.size) return false;
  for (const [key, value] of url1.searchParams)
    if (url2.searchParams.get(key) !== value) return false;

  return true;
}

/**
 * @param {URL | string | { href: string } | { src: string }} urlLike
 */
export function from(
  urlLike: URL | string | { href: string } | { src: string },
): URL {
  if (urlLike instanceof URL) return urlLike;
  if (typeof urlLike === 'string') return new URL(urlLike);
  if ('href' in urlLike) return new URL(urlLike.href);
  if ('src' in urlLike) return new URL(urlLike.src);
  throw new TypeError('Invalid URL-like object.');
}
