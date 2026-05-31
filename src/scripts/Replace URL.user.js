// ==UserScript==
// @name        Replace URL
// @description Replaces the current URL with the canonical URL or normalized URL if they differ.
// @version     1.0.0
// @exclude     https://*.translate.goog/*
// @exclude     https://translate.google.com/*
// @exclude     https://www.hanmoto.com/bd/search/top?*
// @exclude     https://www.maruzenjunkudo.co.jp/search?*
// @grant       GM.notification
// @require     https://cdn.jsdelivr.net/npm/tldts/dist/index.umd.min.js
// @noframes
// ==/UserScript==
/* global GM */
/* global tldts */
import { from, equiv, tryFetch } from '../modules/WindowExtensions.js';
if (window.top === window.self) window.addEventListener('load', async () => {
  new MutationObserver(async mutations => {
    for (const mutation of mutations)
      switch (mutation.type) {
        case 'childList':
          await handle(mutation.target, mutation.addedNodes, mutation.type);
          break;
        case 'attributes':
          await handle(mutation.target, mutation.addedNodes, mutation.type, mutation.attributeName ?? '');
          break;
      }

    /**
     * @param {Node} target
     * @param {NodeList} addedNodes
     * @param {...string} reason
     */
    async function handle(target, addedNodes, ...reason) {
      const children = Array.from(addedNodes)
        .filter(e => e instanceof HTMLLinkElement)
        .filter(e => e.rel === 'canonical');
      const self = target instanceof HTMLLinkElement && target.rel === 'canonical'
        ? target
        : null;
      const links = self ? [self, ...children] : children;
      for (const link of links) {
        console.debug('Mutated:', ...reason, link);
        const result = await tryFetch(link);
        if (result.exists) assign(result.url);
      }
    }
  }).observe(document.documentElement, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: [
      'href',
      'rel',
    ],
  });

  const canonical = await getCanonical();
  if (canonical) assign(new URL(canonical));

  /**
   * @param {URL | string | { href: string } | { src: string }} urlLike
   */
  function assign(urlLike) {
    const url = from(urlLike);
    if (equiv(location, url)) return;
    if (
      (hasLocalePrefix(location) && !hasLocalePrefix(url))
      || (!hasLocalePrefix(location) && hasLocalePrefix(url))
    ) return;

    if (location.origin === url.origin) {
      console.info('Old URL:', location.href);
      console.info('New URL:', url.href);
      history.pushState(null, '', url.href);
    }
    // @ts-ignore
    else GM.notification({
      text: `${location.href}\n${url.href}`,
      title: 'Redirecting',
      image: undefined,
      onclick: () => location.assign(url.href),
    });

    /**
     * @param {URL | string | { href: string } | { src: string }} urlLike
     */
    function hasLocalePrefix(urlLike) {
      const url = from(urlLike);
      const first = url.pathname.split('/').filter(Boolean).at(0) ?? '';
      return /^[a-z]{2}(?:-[a-z]{2})?$/i.test(first);
    }
  }
  async function getCanonical() {
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical instanceof HTMLLinkElement) {
      if (equiv(location, canonical)) return canonical.href;
      const result = await tryFetch(canonical);
      if (result.exists) {
        console.debug('Canonical URL found:', result.url);
        return result.url;
      }
    }
    const normalized = await normalize();
    if (normalized) {
      console.debug('Normalized URL found:', normalized);
      return normalized;
    }
    return null;

    async function normalize() {
      const url = new URL(await fetchShortened());
      const paths = url.pathname.split('/');
      if (
        paths.at(-1)?.length === 0
        || paths.at(-1)?.match(/index\.\w+/)
      ) paths.pop();
      const result = await tryFetch(`${url.origin}${paths.join('/')}${url.search}${url.hash}`);
      return result.exists ? result.url : null;

      async function fetchShortened() {
        // @ts-ignore
        const parsed = tldts.parse(location.origin);
        if (parsed.subdomain !== 'www')
          return location.href;

        const shorten = `${location.protocol}//${location.host.replace(/^www\./, '')}${location.pathname}${location.search}${location.hash}`;
        const result = await tryFetch(shorten);
        return result.exists
          ? result.url
          : location.href;
      }
    }
  }
});
