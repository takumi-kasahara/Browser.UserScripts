// ==UserScript==
// @name        Rakuten PointClub Kuji
// @description Automatically clicks the tametoku mode kuji links in Rakuten PointClub Kuji page.
// @version     1.0.0
// @match       https://point.rakuten.co.jp/doc/tametokumodekuji/*
// @grant       none
// ==/UserScript==
"use strict";
(() => {
  // src/modules/HtmlExtensions.ts
  function visible(element) {
    if (!element) throw new TypeError("Element is required.");
    if (element.hidden) return false;
    if (window.getComputedStyle(element).display === "none") return false;
    if (window.getComputedStyle(element).visibility === "hidden") return false;
    if (!element.parentElement) return true;
    return visible(element.parentElement);
  }

  // src/scripts/Rakuten PointClub Kuji.user.ts
  window.addEventListener("load", () => {
    if (location.search)
      window.open("about:blank", "_self")?.close();
    const target = document.getElementById("tametoku-mode-kuji-contents");
    if (!target) throw new Error("Target not found.");
    new MutationObserver((mutations, observer) => {
      for (const mutation of mutations)
        if (mutation.target instanceof HTMLElement) {
          const es1 = Array.from(mutation.target.querySelectorAll(".is-pc > .cta_btn")).filter((e) => e instanceof HTMLElement).filter((e) => visible(e));
          for (const e1 of es1) e1.click();
          const es2 = Array.from(mutation.target.querySelectorAll(".is-pc > .js-tametoku-mode-kuji-start-btn")).filter((e) => e instanceof HTMLElement).filter((e) => visible(e));
          for (const e2 of es2) e2.click();
          if (es1.length === 0 || es2.length === 0) continue;
          observer.disconnect();
        }
    }).observe(target, {
      subtree: true,
      attributes: true
    });
  });
})();
