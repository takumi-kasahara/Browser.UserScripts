// ==UserScript==
// @name        Honto Gacha
// @description Automatically opens the gacha lottery on the Honto gacha campaign page.
// @version     1.0.0
// @match       https://honto.jp/cp/hybrid/campaign/gacha.html*
// @grant       none
// ==/UserScript==
window.addEventListener('load', () => {
  const e = document.getElementById('gacha-button');
  if (e instanceof HTMLElement) e.click();
});
