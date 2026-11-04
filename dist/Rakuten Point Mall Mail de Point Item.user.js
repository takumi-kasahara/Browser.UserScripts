// ==UserScript==
// @name      Rakuten Point Mall Mail de Point Item
// @namespace https://github.com/takumi-kasahara
// @version   1.0.0
// @match     https://member.pointmail.rakuten.co.jp/box/ItemDetail/?witem_id=*
// @grant     GM.openInTab
// ==/UserScript==
"use strict";
(() => {
  // src/scripts/Rakuten Point Mall Mail de Point Item.user.ts
  window.addEventListener("load", () => {
    const urls = Array.from(document.querySelectorAll(".point_url > a")).filter((e) => e instanceof HTMLAnchorElement).filter(
      (e) => e.origin === "https://pmrd.rakuten.co.jp" && new URL(e.href).searchParams.has("r")
    ).map((a) => a.href);
    for (const url of urls) GM.openInTab(url);
  });
})();
