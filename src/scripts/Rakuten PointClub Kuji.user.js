// ==UserScript==
// @name        Rakuten PointClub Kuji
// @description Automatically clicks the tametoku mode kuji links in Rakuten PointClub Kuji page.
// @version     1.0.0
// @match       https://point.rakuten.co.jp/doc/tametokumodekuji/*
// @grant       none
// ==/UserScript==
import { visible } from '../modules/HtmlExtensions.js';
window.addEventListener('load', () => {
  if (location.search)
    window.open('about:blank', '_self')?.close();

  const target = document.getElementById('tametoku-mode-kuji-contents');
  if (!target) throw new Error('Target not found.');

  new MutationObserver((mutations, observer) => {
    for (const mutation of mutations)
      if (mutation.target instanceof HTMLElement) {
        const es1 = Array.from(mutation.target.querySelectorAll('.is-pc > .cta_btn'))
          .filter(e => e instanceof HTMLElement)
          .filter(e => visible(e));
        for (const e1 of es1) e1.click();
        const es2 = Array.from(mutation.target.querySelectorAll('.is-pc > .js-tametoku-mode-kuji-start-btn'))
          .filter(e => e instanceof HTMLElement)
          .filter(e => visible(e));
        for (const e2 of es2) e2.click();
        if (es1.length === 0 || es2.length === 0) continue;
        observer.disconnect();
      }
  }).observe(target, {
    subtree: true,
    attributes: true,
  });
});
