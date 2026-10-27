// ==UserScript==
// @name        Notify RSS
// @namespace   https://github.com/takumi-kasahara
// @version     1.0.0
// @description Notifies RSS feed URLs and copies them to the clipboard.
// @author      takumi-kasahara
// @match       https://*/*
// @grant       GM.listValues
// @grant       GM.getValue
// @grant       GM.setValue
// @grant       GM.deleteValue
// @grant       GM.notification
// @grant       GM.registerMenuCommand
// @grant       GM.setClipboard
// @noframes
// ==/UserScript==
"use strict";
(() => {
  // src/modules/DocumentExtensions.ts
  function download(data, type, name) {
    const blob = new Blob([JSON.stringify(data)], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  }

  // src/modules/WindowExtensions.ts
  async function exists(urlLike) {
    const url = from(urlLike);
    if (!/^https?:$/.test(url.protocol)) return false;
    if (equiv(location, url)) return true;
    try {
      const head = await fetch(url, { method: "HEAD" });
      if (head.ok) return equiv(url, head.url);
      if ([403, 405].includes(head.status)) {
        const get = await fetch(url, { method: "GET" });
        if (get.ok) return equiv(url, get.url);
      }
      return false;
    } catch (e) {
      if (!(e instanceof Error)) throw e;
      console.warn(e.message, url.href);
      return false;
    }
  }
  function equiv(urlLike1, urlLike2) {
    const url1 = from(urlLike1);
    const url2 = from(urlLike2);
    if (url1.origin !== url2.origin) return false;
    if (url1.pathname.replaceAll(/\/\/+/g, "/").replace(/\/$/, "") !== url2.pathname.replaceAll(/\/\/+/g, "/").replace(/\/$/, ""))
      return false;
    if (url1.searchParams.size !== url2.searchParams.size) return false;
    for (const [key, value] of url1.searchParams)
      if (url2.searchParams.get(key) !== value) return false;
    return true;
  }
  function from(urlLike) {
    if (urlLike instanceof URL) return urlLike;
    if (typeof urlLike === "string") return new URL(urlLike);
    if ("href" in urlLike) return new URL(urlLike.href);
    if ("src" in urlLike) return new URL(urlLike.src);
    throw new TypeError("Invalid URL-like object.");
  }

  // src/scripts/Notify RSS.user.ts
  if (window.top === window.self)
    window.addEventListener("load", async () => {
      const urls = JSON.parse(
        String(await GM.getValue(location.origin, JSON.stringify([])))
      );
      if (urls.length > 0)
        GM.registerMenuCommand(
          `Copy ${urls.length} RSS URL(s)`,
          () => GM.setClipboard(urls.join("\n"))
        );
      GM.registerMenuCommand(`Export RSS URL(s) as JSON`, async () => {
        const result = {};
        for (const name of await GM.listValues())
          result[name] = JSON.parse(
            String(await GM.getValue(name, JSON.stringify([])))
          );
        download(result, "application/json", "RSS.json");
      });
      GM.registerMenuCommand(`Clear RSS URL(s)`, async () => {
        GM.notification({
          text: "Click to clear stored values.",
          onclick: async () => {
            for (const name of await GM.listValues()) await GM.deleteValue(name);
          }
        });
      });
      async function handle(target, addedNodes, ...reason) {
        const links = Array.from(addedNodes).filter((e) => e instanceof HTMLLinkElement).filter((e) => e.rel === "alternate").filter(
          (e) => e.type === "application/atom+xml" || e.type === "application/rss+xml"
        ).filter(async (e) => await exists(e.href));
        if (links.length === 0) return;
        for (const link of links) console.debug("Mutated:", ...reason, link);
        const stored = JSON.parse(
          String(await GM.getValue(location.origin, JSON.stringify([])))
        );
        for (const link of links) console.debug("RSS Feed found:", link);
        const urls2 = links.map((e) => {
          const url = new URL(e.href);
          switch (url.origin) {
            case "https://github.com":
              url.searchParams.delete("token");
              break;
          }
          return url.href;
        }).filter((href) => !stored.includes(href));
        if (urls2.length === 0) return;
        GM.notification({
          text: `Found ${urls2.length} RSS URL(s).`,
          title: location.hostname,
          onclick: () => GM.setClipboard(urls2.join("\n"))
        });
        const updated = [.../* @__PURE__ */ new Set([...stored, ...urls2])];
        await GM.setValue(location.origin, JSON.stringify(updated.sort()));
      }
      new MutationObserver(async (mutations) => {
        for (const mutation of mutations)
          switch (mutation.type) {
            case "childList":
              await handle(mutation.target, mutation.addedNodes, mutation.type);
              break;
            case "attributes":
              await handle(
                mutation.target,
                mutation.addedNodes,
                mutation.type,
                mutation.attributeName ?? ""
              );
              break;
          }
      }).observe(document.documentElement, {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter: ["href", "rel", "type"]
      });
      await handle(document.documentElement, document.querySelectorAll("link"));
    });
})();
