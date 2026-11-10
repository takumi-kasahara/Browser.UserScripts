// ==UserScript==
// @name      Rakuten Point Mall
// @namespace https://github.com/takumi-kasahara
// @version   1.0.0
// @match     https://pointmall.rakuten.co.jp/
// @grant     GM.openInTab
// ==/UserScript==
"use strict";
(() => {
  // src/scripts/Rakuten Point Mall.user.ts
  window.addEventListener("load", async () => {
    const urls = Array.from(document.querySelectorAll(".dreamkuji-item > a")).filter((e) => e instanceof HTMLAnchorElement).filter(
      (a) => a.origin === "https://rd.pointmall.rakuten.co.jp" && a.pathname.startsWith("/lottery/grant/")
    ).map((a) => a.href);
    for (const url of urls) GM.openInTab(url);
  });
})();
