// ==UserScript==
// @name      Rakuten Point Mall Treasure BINGO
// @namespace https://github.com/takumi-kasahara
// @version   1.0.0
// @match     https://pointmall.rakuten.co.jp/game/bingo/get_card
// @grant     none
// ==/UserScript==
"use strict";
(() => {
  // src/scripts/Rakuten Point Mall Treasure BINGO.user.ts
  window.addEventListener("load", () => {
    const e = document.getElementById("video-add-modal-skip-btn");
    if (e instanceof HTMLElement) e.click();
  });
})();
