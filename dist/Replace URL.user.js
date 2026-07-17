// ==UserScript==
// @name        Replace URL
// @description Replaces the current URL with the canonical URL or normalized URL if they differ.
// @version     1.0.0
// @exclude     https://*.translate.goog/*
// @exclude     https://translate.google.com/*
// @exclude     https://www.hanmoto.com/bd/search/top?*
// @exclude     https://www.maruzenjunkudo.co.jp/search?*
// @match       https://*/*
// @grant       GM.notification
// @require     https://cdn.jsdelivr.net/npm/tldts/dist/index.umd.min.js
// @noframes
// ==/UserScript==
"use strict";
(() => {
  // src/modules/WindowExtensions.ts
  async function tryFetch(urlLike) {
    const url = from(urlLike);
    if (equiv(location, url)) return { exists: true, url: url.href };
    try {
      const head = await fetch(url, { method: "HEAD" });
      if (head.ok) return { exists: equiv(url, head.url), url: head.url };
      if ([403, 405].includes(head.status)) {
        const get = await fetch(url, { method: "GET" });
        if (get.ok) return { exists: equiv(url, get.url), url: get.url };
      }
      return { exists: false, url: url.href };
    } catch (e) {
      if (!(e instanceof Error)) throw e;
      console.warn(e.message, url);
      return { exists: false, url: url.href };
    }
  }
  function equiv(urlLike1, urlLike2) {
    const url1 = from(urlLike1);
    const url2 = from(urlLike2);
    if (url1.origin !== url2.origin) return false;
    if (url1.pathname.replaceAll(/\/\/+/g, "/").replace(/\/$/, "") !== url2.pathname.replaceAll(/\/\/+/g, "/").replace(/\/$/, "")) return false;
    if (url1.searchParams.size !== url2.searchParams.size) return false;
    for (const [key, value] of url1.searchParams)
      if (url2.searchParams.get(key) !== value) return false;
    return true;
  }
  function from(urlLike) {
    if (urlLike instanceof URL)
      return urlLike;
    if (typeof urlLike === "string")
      return new URL(urlLike);
    if ("href" in urlLike)
      return new URL(urlLike.href);
    if ("src" in urlLike)
      return new URL(urlLike.src);
    throw new TypeError("Invalid URL-like object.");
  }

  // src/scripts/Replace URL.user.ts
  if (window.top === window.self) window.addEventListener("load", async () => {
    new MutationObserver(async (mutations) => {
      for (const mutation of mutations)
        switch (mutation.type) {
          case "childList":
            await handle(mutation.target, mutation.addedNodes, mutation.type);
            break;
          case "attributes":
            await handle(mutation.target, mutation.addedNodes, mutation.type, mutation.attributeName ?? "");
            break;
        }
      async function handle(target, addedNodes, ...reason) {
        const children = Array.from(addedNodes).filter((e) => e instanceof HTMLLinkElement).filter((e) => e.rel === "canonical");
        const self = target instanceof HTMLLinkElement && target.rel === "canonical" ? target : null;
        const links = self ? [self, ...children] : children;
        for (const link of links) {
          console.debug("Mutated:", ...reason, link);
          const result = await tryFetch(link);
          if (result.exists) assign(result.url);
        }
      }
    }).observe(document.documentElement, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: [
        "href",
        "rel"
      ]
    });
    const canonical = await getCanonical();
    if (canonical) assign(new URL(canonical));
    function assign(urlLike) {
      const url = from(urlLike);
      if (equiv(location, url)) return;
      if (hasLocalePrefix(location) && !hasLocalePrefix(url) || !hasLocalePrefix(location) && hasLocalePrefix(url)) return;
      if (location.origin === url.origin) {
        console.info("Old URL:", location.href);
        console.info("New URL:", url.href);
        history.pushState(null, "", url.href);
      } else GM.notification({
        text: `${location.href}
${url.href}`,
        title: "Redirecting",
        image: void 0,
        onclick: () => location.assign(url.href)
      });
      function hasLocalePrefix(urlLike2) {
        const url2 = from(urlLike2);
        const first = url2.pathname.split("/").filter(Boolean).at(0) ?? "";
        return /^[a-z]{2}(?:-[a-z]{2})?$/i.test(first);
      }
    }
    async function getCanonical() {
      const canonical2 = document.querySelector('link[rel="canonical"]');
      if (canonical2 instanceof HTMLLinkElement) {
        if (equiv(location, canonical2)) return canonical2.href;
        const result = await tryFetch(canonical2);
        if (result.exists) {
          console.debug("Canonical URL found:", result.url);
          return result.url;
        }
      }
      const normalized = await normalize();
      if (normalized) {
        console.debug("Normalized URL found:", normalized);
        return normalized;
      }
      return null;
      async function normalize() {
        const url = new URL(await fetchShortened());
        const paths = url.pathname.split("/");
        if (paths.at(-1)?.length === 0 || paths.at(-1)?.match(/index\.\w+/)) paths.pop();
        const result = await tryFetch(`${url.origin}${paths.join("/")}${url.search}${url.hash}`);
        return result.exists ? result.url : null;
        async function fetchShortened() {
          const parsed = tldts.parse(location.origin);
          if (parsed.subdomain !== "www")
            return location.href;
          const shorten = `${location.protocol}//${location.host.replace(/^www\./, "")}${location.pathname}${location.search}${location.hash}`;
          const result2 = await tryFetch(shorten);
          return result2.exists ? result2.url : location.href;
        }
      }
    }
  });
})();
