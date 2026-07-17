// ==UserScript==
// @name        Rakuten Lucky Kuji
// @description Automatically clicks Rakuten Lucky Kuji.
// @version     1.0.0
// @match       https://kuji.rakuten.co.jp/*
// @grant       none
// ==/UserScript==
"use strict";
(() => {
  // src/modules/HtmlExtensions.ts
  function available(element) {
    if (!element) throw new TypeError("Element is required.");
    if (!element.isConnected) return false;
    if ((element instanceof HTMLButtonElement || element instanceof HTMLFieldSetElement || element instanceof HTMLInputElement || element instanceof HTMLOptGroupElement || element instanceof HTMLOptionElement || element instanceof HTMLSelectElement || element instanceof HTMLTextAreaElement) && element.disabled) return false;
    if (window.getComputedStyle(element).pointerEvents === "none") return false;
    if (!element.parentElement) return true;
    return available(element.parentElement);
  }
  function visible(element) {
    if (!element) throw new TypeError("Element is required.");
    if (element.hidden) return false;
    if (window.getComputedStyle(element).display === "none") return false;
    if (window.getComputedStyle(element).visibility === "hidden") return false;
    if (!element.parentElement) return true;
    return visible(element.parentElement);
  }

  // src/scripts/Rakuten Lucky Kuji.user.ts
  window.addEventListener("load", () => {
    if (location.href.match(/\/(lose|win|already)/))
      window.open("about:blank", "_self")?.close();
    const target = document.getElementById("entry");
    if (!target) throw new Error("Target not found.");
    new MutationObserver((mutations, observer) => {
      for (const mutation of mutations)
        if (mutation.target instanceof HTMLElement && available(mutation.target) && visible(mutation.target)) {
          mutation.target.click();
          observer.disconnect();
        }
    }).observe(target, {
      attributes: true,
      attributeFilter: [
        "style"
      ]
    });
  });
})();
