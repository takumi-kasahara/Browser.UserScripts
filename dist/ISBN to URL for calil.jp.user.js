// ==UserScript==
// @name      ISBN to URL for calil.jp
// @namespace https://github.com/takumi-kasahara
// @version   1.0.0
// @match     https://calil.jp/list/*
// @match     https://calil.jp/recipe/*
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

  // src/scripts/ISBN to URL for calil.jp.user.ts
  window.addEventListener("load", () => {
    addButton("booklog", (isbn10) => `https://booklog.jp/item/1/${isbn10}`);
    addButton("bookmeter", (isbn10) => `https://bookmeter.com/b/${isbn10}`);
    addButton("calil", (isbn10) => `https://calil.jp/book/${isbn10}`);
    function addButton(label, from) {
      const button = document.createElement("button");
      button.appendChild(document.createTextNode(label));
      button.setAttribute("type", "button");
      button.addEventListener("click", async () => {
        const urls = extract().map((isbn10) => from(isbn10));
        open(urls);
      });
      document.querySelector(".container")?.insertBefore(button, document.querySelector(".right"));
    }
    function extract() {
      if (location.pathname.startsWith("/list/"))
        return Array.from(document.querySelectorAll("td.title > a")).filter((e) => e instanceof HTMLAnchorElement).filter((a) => a.origin === location.origin).map((a) => a.pathname.replace("/book/", "")).reverse();
      if (location.pathname.startsWith("/recipe/"))
        return Array.from(document.querySelectorAll("div.cover > a")).filter((e) => e instanceof HTMLAnchorElement).filter((a) => a.origin === location.origin).map((a) => a.pathname.replace("/book/", "")).reverse();
      return [];
    }
  });
})();
