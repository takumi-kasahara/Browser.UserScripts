// ==UserScript==
// @name        Rakuten Card Point Plus
// @description Automatically clicks on new point plus entries on Rakuten Card's point plus page.
// @version     1.0.0
// @match       https://www.rakuten-card.co.jp/e-navi/members/point/shop-point/*
// @grant       none
// ==/UserScript==
window.addEventListener('load', () => {
  const target = document.querySelector('.xlo-tab-contents');
  if (!target) throw new Error('Target not found.');

  new MutationObserver((mutations, observer) => {
    for (const mutation of mutations)
      for (const node of mutation.addedNodes)
        if (node instanceof HTMLElement && node.id === 'xlo-tab-undone') {
          const es = Array.from(
            node.getElementsByClassName('xlo-store-entry'),
          ).filter((e): e is HTMLElement => e instanceof HTMLElement);
          if (es.length === 0) continue;
          for (const e of es) e.click();
          observer.disconnect();
        }
  }).observe(target, {
    childList: true,
  });
});
