// ==UserScript==
// @name        Honto Footmark
// @description Automatically opens the footmark lottery popup on the Honto footmark page.
// @version     1.0.0
// @match       https://honto.jp/my/account/point/footmark.html*
// @match       https://honto.jp/my/account/point/footmark/*
// @grant       none
// ==/UserScript==
import { waitForElement } from '../modules/DocumentExtensions.js';
window.addEventListener('load', async () => {
  document.getElementById('pbBlock2656959')?.remove();
  document.getElementById('pbBlock2656998')?.remove();

  const target = await waitForElement('#fancybox-wrap');
  if (!target) throw new Error('Target not found.');

  new MutationObserver((mutations, observer) => {
    for (const mutation of mutations)
      for (const node of mutation.addedNodes)
        if (node instanceof HTMLElement) {
          const e = node.querySelector('#imgfootMarkLot>area');
          if (e instanceof HTMLElement) e.click();
          else continue;
          observer.disconnect();
        }
  }).observe(target, {
    subtree: true,
    childList: true,
  });
  const e = document.querySelector('a[href="#lotBox"]');
  if (e instanceof HTMLElement) e.click();
});
