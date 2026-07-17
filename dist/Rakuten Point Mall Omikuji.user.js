// ==UserScript==
// @name        Rakuten Point Mall Omikuji
// @description Automatically clicks start button in Rakuten Point Mall Omikuji page.
// @version     1.0.0
// @match       https://pointmall.rakuten.co.jp/omikuji
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

  // src/scripts/Rakuten Point Mall Omikuji.user.ts
  window.addEventListener("load", () => {
    const target = document.getElementsByClassName("omikuji_result_wrapper")[0] ?? document.getElementById("main-inner");
    new MutationObserver((mutations, observer) => {
      for (const mutation of mutations)
        if (mutation.target instanceof HTMLElement) {
          const es2 = Array.from(mutation.target.querySelectorAll('.result_present > .present_btn > a[role="button"]')).filter((e) => e instanceof HTMLElement).filter((e) => available(e));
          if (es2.length === 0) continue;
          for (const e of es2) e.click();
          observer.disconnect();
        }
    }).observe(target, {
      subtree: true,
      attributes: true,
      attributeFilter: [
        "class"
      ]
    });
    const es = Array.from(document.querySelectorAll(".omikuji_start > .btn_area > a")).filter((e) => e instanceof HTMLElement).filter((e) => available(e));
    if (es.length > 0) for (const e of es) e.click();
  });
})();
