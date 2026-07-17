// ==UserScript==
// @name        Rakuten Point Mall Omikuji
// @description Automatically clicks start button in Rakuten Point Mall Omikuji page.
// @version     1.0.0
// @match       https://pointmall.rakuten.co.jp/omikuji
// @grant       none
// ==/UserScript==
import { available } from '../modules/HtmlExtensions.js';
window.addEventListener('load', () => {
  const target = document.getElementsByClassName('omikuji_result_wrapper')[0]
    ?? document.getElementById('main-inner');

  new MutationObserver((mutations, observer) => {
    for (const mutation of mutations)
      if (mutation.target instanceof HTMLElement) {
        const es = Array.from(mutation.target.querySelectorAll('.result_present > .present_btn > a[role="button"]'))
          .filter((e): e is HTMLElement => e instanceof HTMLElement)
          .filter(e => available(e));
        if (es.length === 0) continue;
        for (const e of es) e.click();
        observer.disconnect();
      }
  }).observe(target, {
    subtree: true,
    attributes: true,
    attributeFilter: [
      'class',
    ],
  });

  const es = Array.from(document.querySelectorAll('.omikuji_start > .btn_area > a'))
    .filter((e): e is HTMLElement => e instanceof HTMLElement)
    .filter(e => available(e));
  if (es.length > 0) for (const e of es) e.click();
});
