// ==UserScript==
// @name      Rakuten Lucky Kuji
// @namespace https://github.com/takumi-kasahara
// @version   1.0.0
// @match     https://kuji.rakuten.co.jp/*
// @grant     none
// ==/UserScript==
import { available, visible } from '../modules/HtmlExtensions.js';
window.addEventListener('load', () => {
  if (location.href.match(/\/(lose|win|already)/)) window.close();

  const target = document.getElementById('entry');
  if (!target) throw new Error('Target not found.');

  new MutationObserver((mutations, observer) => {
    for (const mutation of mutations)
      if (
        mutation.target instanceof HTMLElement
        && available(mutation.target)
        && visible(mutation.target)
      ) {
        mutation.target.click();
        observer.disconnect();
      }
  }).observe(target, {
    attributes: true,
    attributeFilter: ['style'],
  });
});
