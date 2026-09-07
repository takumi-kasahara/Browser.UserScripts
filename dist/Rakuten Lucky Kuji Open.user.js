// ==UserScript==
// @name        Rakuten Lucky Kuji Open
// @description Automatically opens all lucky kuji links on Rakuten Lucky Kuji page.
// @version     1.0.0
// @match       https://rakucoin.appspot.com/rakuten/kuji/
// @grant       none
// ==/UserScript==
"use strict";
(() => {
  // src/scripts/Rakuten Lucky Kuji Open.user.ts
  window.addEventListener("load", async () => {
    const urls = Array.from(
      document.querySelectorAll('table[class="table"]')
    ).flatMap(
      (e) => Array.from(e.getElementsByTagName("a"), (a) => a.href)
    );
    for (const url of urls) {
      await new Promise((resolve) => setTimeout(resolve, 5e3));
      window.open(url, "_blank", "noreferrer");
    }
  });
})();
