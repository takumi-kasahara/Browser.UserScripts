// ==UserScript==
// @name      Rakuten Point Mall Mail de Point Item
// @namespace https://github.com/takumi-kasahara
// @version   1.0.0
// @match     https://member.pointmail.rakuten.co.jp/box/ItemDetail/?witem_id=*
// @grant     none
// ==/UserScript==
"use strict";
(() => {
  // src/scripts/Rakuten Point Mall Mail de Point Item.user.ts
  window.addEventListener("load", () => {
    const e = document.querySelector(
      '.point_url > a[href^="https://pmrd.rakuten.co.jp/?r="]'
    ) ?? document.querySelector('a[href^="https://pmrd.rakuten.co.jp/?r="]');
    if (e instanceof HTMLElement) e.click();
  });
})();
