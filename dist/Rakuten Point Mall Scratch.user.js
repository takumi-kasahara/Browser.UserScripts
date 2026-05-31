// ==UserScript==
// @name        Rakuten Point Mall Scratch
// @description Automatically clicks the scratch card in Rakuten Point Mall Scratch page.
// @version     1.0.0
// @match       https://pointmall.rakuten.co.jp/scratch
// @grant       none
// ==/UserScript==
(() => {
  // src/scripts/Rakuten Point Mall Scratch.user.js
  window.addEventListener("load", async () => {
    const target = document.getElementById("main-inner");
    if (!target) throw new Error("Target not found");
    new MutationObserver((mutations) => {
      for (const mutation of mutations)
        for (const node of mutation.addedNodes)
          if (node instanceof HTMLElement) {
            const e2 = node.querySelector(".glitter:not(.no-play)");
            if (e2 instanceof HTMLElement) e2.click();
            else continue;
          }
    }).observe(target, {
      subtree: true,
      childList: true
    });
    const e = document.querySelector(".start_btn") ?? document.querySelector(".glitter:not(.no-play)");
    if (e instanceof HTMLElement) e.click();
  });
})();
