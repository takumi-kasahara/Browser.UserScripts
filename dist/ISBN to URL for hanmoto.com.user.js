// ==UserScript==
// @name      ISBN to URL for hanmoto.com
// @namespace https://github.com/takumi-kasahara
// @version   1.0.0
// @match     https://www.hanmoto.com/bd/isbn/*
// @match     https://www.hanmoto.com/bd/search/*
// @grant     GM.openInTab
// @grant     GM.setClipboard
// ==/UserScript==
"use strict";
(() => {
  // src/modules/WindowExtensions.ts
  function open(urls) {
    if (!urls || urls.length === 0) return;
    const PAGE_SIZE = 20;
    const digits = String(urls.length).length;
    for (const [index, url] of urls.entries()) {
      const remaining = urls.length - index;
      if (urls.length > 1 && remaining > 0 && mod(index, PAGE_SIZE) === 0 && !window.confirm(
        `Open ${Math.min(remaining, PAGE_SIZE)} URL(s)? (${String(index).padStart(digits, "0")} / ${urls.length})`
      )) {
        GM.setClipboard(urls.slice(index).join("\n"));
        window.alert(`Copy ${urls.length - index} URL(s):`);
        return;
      }
      GM.openInTab(url);
    }
    function mod(number, divisor) {
      return number - Math.floor(number / divisor) * divisor;
    }
  }

  // src/scripts/ISBN to URL for hanmoto.com.user.ts
  window.addEventListener("load", () => {
    if (location.pathname.startsWith("/bd/isbn/")) {
      let addButton2 = function(label, from) {
        const button = document.createElement("button");
        button.appendChild(document.createTextNode(label));
        button.setAttribute("type", "button");
        button.classList.add("btn", "btn-sm", "btn-default");
        button.addEventListener("click", async () => {
          const urls = extract2().map((isbn10) => from(isbn10));
          open(urls);
        });
        element.appendChild(button);
      }, extract2 = function() {
        const isbn10 = document.querySelector('span[itemprop="isbn10"]')?.textContent?.trim();
        return isbn10 ? [isbn10] : [];
      };
      var addButton = addButton2, extract = extract2;
      const element = document.createElement("section");
      element.classList.add("sidebar", "book-col-mb-1");
      addButton2("booklog", (isbn10) => `https://booklog.jp/item/1/${isbn10}`);
      addButton2("bookmeter", (isbn10) => `https://bookmeter.com/b/${isbn10}`);
      addButton2("calil", (isbn10) => `https://calil.jp/book/${isbn10}`);
      document.querySelector(".book-col-frame")?.insertBefore(element, document.querySelector(".book-cart"));
    } else if (location.pathname.startsWith("/bd/search/")) {
      let addButton2 = function(label, from) {
        const button = document.createElement("button");
        button.appendChild(document.createTextNode(label));
        button.setAttribute("type", "button");
        button.classList.add("btn", "btn-sm");
        button.addEventListener("click", async () => {
          const urls = extract2().map((isbn10) => from(isbn10));
          open(urls);
        });
        element.appendChild(button);
      }, extract2 = function() {
        const isbn13 = document.querySelector('span[itemprop="isbn13"]')?.textContent?.trim();
        if (!isbn13) return [];
        const isbn10 = toISBN102(isbn13);
        return isbn10 ? [isbn10] : [];
      }, toISBN102 = function(isbn13) {
        if (!/^\d{13}$/.test(isbn13)) return null;
        const sum = Array.from(
          isbn13.slice(0, 12),
          (d, i) => Number.parseInt(d, 10) * (i % 2 === 0 ? 1 : 3)
        ).reduce((s, v) => s + v, 0);
        const check = (10 - sum % 10) % 10;
        return `${isbn13.slice(0, 9)}${check}`;
      };
      var addButton = addButton2, extract = extract2, toISBN10 = toISBN102;
      const element = document.createElement("div");
      addButton2("booklog.jp", (isbn10) => `https://booklog.jp/item/1/${isbn10}`);
      addButton2("bookmeter", (isbn10) => `https://bookmeter.com/b/${isbn10}`);
      addButton2("calil.jp", (isbn10) => `https://calil.jp/book/${isbn10}`);
      new MutationObserver((mutations, observer) => {
        for (const mutation of mutations)
          for (const node of mutation.addedNodes)
            if (node instanceof HTMLElement && node.classList.contains("booksearch-sideformtitle")) {
              node.insertBefore(
                element,
                document.querySelector(".sideformtitle")
              );
              observer.disconnect();
            }
      }).observe(document.body, {
        subtree: true,
        childList: true
      });
    }
  });
})();
