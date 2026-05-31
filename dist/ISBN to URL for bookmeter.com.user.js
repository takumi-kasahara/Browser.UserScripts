// ==UserScript==
// @name        ISBN to URL for bookmeter.com
// @description Add buttons to convert ISBN to URL on bookmeter.com
// @version     1.0.0
// @match       https://bookmeter.com/books/*
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

  // src/scripts/ISBN to URL for bookmeter.com.user.js
  window.addEventListener("load", () => {
    addButton("booklog", (isbn10) => `https://booklog.jp/item/1/${isbn10}`);
    addButton("bookmeter", (isbn10) => `https://bookmeter.com/b/${isbn10}`);
    addButton("calil", (isbn10) => `https://calil.jp/book/${isbn10}`);
    function addButton(label, from) {
      const button = document.createElement("button");
      button.appendChild(document.createTextNode(label));
      button.setAttribute("type", "button");
      button.style.position = "relative";
      button.style.top = "50%";
      button.style.transform = "translateY(-50%)";
      button.addEventListener(
        "click",
        async () => {
          const urls = extract().map((isbn10) => from(isbn10));
          await open(urls);
        }
      );
      const element = document.createElement("div");
      element.style.float = "left";
      element.style.height = "36px";
      element.appendChild(button);
      const container = document.querySelector(".global__inner");
      if (!(container instanceof HTMLElement)) return;
      const target = document.querySelector(".inner__registrations");
      container.insertBefore(element, target);
    }
    function extract() {
      const e = document.querySelector(".image__cover");
      return e instanceof HTMLAnchorElement ? [e.href.replace("https://bookmeter.com/books/", "").slice(0, 10)] : [];
    }
  });
})();
