// ==UserScript==
// @name        Rakuten Point Card Janken
// @description Automatically clicks Rakuten Point Card Janken game.
// @version     1.0.0
// @match       https://pointcard.rakuten.co.jp/campaign/entire/janken_challenge/*
// @grant       none
// ==/UserScript==
import { sleep } from '../modules/DocumentExtensions.js';
window.addEventListener('load', async () => {
  document.getElementById('janken-score')?.remove();

  const start = document.getElementById('js-cpn-janken-start')?.querySelector('.js-start-btn');
  if (start)
    new MutationObserver((mutations, observer) => {
      for (const mutation of mutations)
        if (mutation.target instanceof HTMLElement) {
          mutation.target.click();
          const e = document.querySelector('.js-janken-main-btn-animation:not(.select)[data-hand-type]');
          if (e instanceof HTMLElement) e.click();
          observer.disconnect();
        }
    }).observe(start, {
      attributes: true,
      attributeFilter: [
        'class',
      ],
    });

  await sleep(1000);
  const bonus = document.getElementById('janken-bonus');
  if (bonus instanceof HTMLElement) {
    const es = bonus.querySelectorAll('.js-bonus-banner-base:not(.cpn-end):not(.cpn-prior)');
    for (const e of es) if (e instanceof HTMLElement) e.click();
  }
});
