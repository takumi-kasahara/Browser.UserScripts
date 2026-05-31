// ==UserScript==
// @name        Rakuten Point Mall Gacha
// @description Automatically clicks the Rakuten Point Mall Gacha game.
// @version     1.0.0
// @match       https://pointmall.rakuten.co.jp/gacha
// @grant       none
// ==/UserScript==
(() => {
  // src/scripts/Rakuten Point Mall Gacha.user.js
  window.addEventListener("load", () => {
    const e = document.querySelector(".normal_start");
    if (e instanceof HTMLElement) e.click();
  });
})();
