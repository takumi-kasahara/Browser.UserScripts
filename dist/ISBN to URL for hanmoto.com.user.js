// ==UserScript==
// @name        ISBN to URL for hanmoto.com
// @description Add buttons to convert ISBN to URL on hanmoto.com
// @version     1.0.0
// @match       https://www.hanmoto.com/bd/isbn/*
// @match       https://www.hanmoto.com/bd/search/*
// @grant       none
// ==/UserScript==
(() => {
  // src/modules/NavigatorExtensions.js
  async function copyToClipboard(message, item) {
    try {
      if (typeof item === "string") await navigator.clipboard.writeText(item);
      else if (item instanceof ClipboardItem) await navigator.clipboard.write([item]);
      window.alert(message);
    } catch (e) {
      if (!(e instanceof Error)) throw e;
      console.warn(e.message);
      void window.prompt(message, String(item));
    }
  }

  // src/modules/WindowExtensions.js
  async function open(urls) {
    if (!urls || urls.length === 0) return;
    const PAGE_SIZE = 20;
    const digits = String(urls.length).length;
    for (const [index, url] of urls.entries()) {
      const remaining = urls.length - index;
      if (urls.length > 1 && remaining > 0 && mod(index, PAGE_SIZE) === 0 && !window.confirm(`Open ${Math.min(remaining, PAGE_SIZE)} URL(s)? (${String(index).padStart(digits, "0")} / ${urls.length})`)) {
        await copyToClipboard(`Copy ${urls.length - index} URL(s):`, urls.slice(index).join("\n"));
        return;
      }
      window.open(url, "_blank", "noreferrer");
    }
    function mod(number, divisor) {
      return number - Math.floor(number / divisor) * divisor;
    }
  }

  // src/scripts/ISBN to URL for hanmoto.com.user.js
  window.addEventListener("load", () => {
    if (location.pathname.startsWith("/bd/isbn/")) {
      let addButton = function(label, from) {
        const button = document.createElement("button");
        button.appendChild(document.createTextNode(label));
        button.setAttribute("type", "button");
        button.classList.add("btn", "btn-sm", "btn-default");
        button.addEventListener(
          "click",
          async () => {
            const urls = extract().map((isbn10) => from(isbn10));
            await open(urls);
          }
        );
        element.appendChild(button);
      }, extract = function() {
        const isbn10 = document.querySelector('span[itemprop="isbn10"]')?.textContent?.trim();
        return isbn10 ? [isbn10] : [];
      };
      const element = document.createElement("section");
      element.classList.add("sidebar", "book-col-mb-1");
      addButton("booklog", (isbn10) => `https://booklog.jp/item/1/${isbn10}`);
      addButton("bookmeter", (isbn10) => `https://bookmeter.com/b/${isbn10}`);
      addButton("calil", (isbn10) => `https://calil.jp/book/${isbn10}`);
      document.querySelector(".book-col-frame")?.insertBefore(
        element,
        document.querySelector(".book-cart")
      );
    } else if (location.pathname.startsWith("/bd/search/")) {
      let addButton = function(label, from) {
        const button = document.createElement("button");
        button.appendChild(document.createTextNode(label));
        button.setAttribute("type", "button");
        button.classList.add("btn", "btn-sm");
        button.addEventListener(
          "click",
          async () => {
            const urls = extract().filter(Boolean).map((isbn10) => from(isbn10));
            await open(urls);
          }
        );
        element.appendChild(button);
      }, extract = function() {
        return Array.from(document.querySelectorAll("a.bd-img-image")).filter((e) => e instanceof HTMLAnchorElement).filter((a) => a.origin === location.origin).map((a) => a.pathname.replace("/bd/isbn/", "")).map((isbn13) => toISBN10(isbn13)).reverse();
      }, toISBN10 = function(isbn13) {
        if (!/^\d{13}$/.test(isbn13)) throw new TypeError("Invalid ISBN13 format.");
        const core = isbn13.slice(3, -1);
        const checkDigit = (11 - Array.from(core, (d, i) => Number.parseInt(d, 10) * (10 - i)).reduce((s, v) => s + v, 0) % 11) % 11;
        return `${core}${checkDigit === 10 ? "X" : checkDigit}`;
      };
      const element = document.createElement("div");
      addButton("booklog.jp", (isbn10) => `https://booklog.jp/item/1/${isbn10}`);
      addButton("bookmeter", (isbn10) => `https://bookmeter.com/b/${isbn10}`);
      addButton("calil.jp", (isbn10) => `https://calil.jp/book/${isbn10}`);
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
