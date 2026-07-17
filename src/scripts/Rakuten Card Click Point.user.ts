// ==UserScript==
// @name        Rakuten Card Click Point
// @description Automatically clicks on new click point banners on Rakuten Card's click point page.
// @version     1.0.0
// @match       https://www.rakuten-card.co.jp/e-navi/members/point/click-point/*
// @grant       none
// ==/UserScript==
window.addEventListener('load', () => {
  const target = document.getElementById('js-click-point-banner-list');
  if (!target) throw new Error('Target not found.');

  new MutationObserver((mutations, observer) => {
    for (const mutation of mutations)
      for (const node of mutation.addedNodes)
        if (node instanceof HTMLElement && node.matches('li:not(.is-clicked)')) {
          const es = Array.from(node.querySelectorAll('a.click-point-banner-link'))
            .filter((e): e is HTMLAnchorElement => e instanceof HTMLAnchorElement);
          if (es.length === 0) continue;
          for (const e of es) e.click();
          observer.disconnect();
        }
  }).observe(target, {
    childList: true,
  });
});
