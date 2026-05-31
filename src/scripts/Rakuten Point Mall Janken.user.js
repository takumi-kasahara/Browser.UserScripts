// ==UserScript==
// @name        Rakuten Point Mall Janken
// @description Automatically clicks Rakuten Point Mall Janken game.
// @version     1.0.0
// @match       https://pointmall.rakuten.co.jp/janken
// @grant       none
// ==/UserScript==
window.addEventListener('load', () => {
  const target = document.getElementById('main-inner');
  if (!target) throw new Error('Target not found.');

  new MutationObserver((mutations, observer) => {
    for (const mutation of mutations)
      for (const node of mutation.addedNodes)
        if (node instanceof HTMLElement) {
          const e = node.querySelector('div[role="button"]');
          if (e instanceof HTMLElement) e.click();
          else continue;
          observer.disconnect();
        }
  }).observe(target, {
    childList: true,
  });

  const e = document.querySelector('.janken > .btn_area');
  if (e instanceof HTMLElement) e.click();
});
