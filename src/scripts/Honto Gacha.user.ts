// ==UserScript==
// @name      Honto Gacha
// @namespace https://github.com/takumi-kasahara
// @version   1.0.0
// @match     https://honto.jp/cp/hybrid/campaign/gacha.html*
// @grant     none
// ==/UserScript==
window.addEventListener('load', () => {
  const e = document.getElementById('gacha-button');
  if (e instanceof HTMLElement) e.click();
});
