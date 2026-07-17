// ==UserScript==
// @name        ISBN to URL for hanmoto.com
// @description Add buttons to convert ISBN to URL on hanmoto.com
// @version     1.0.0
// @match       https://www.hanmoto.com/bd/isbn/*
// @match       https://www.hanmoto.com/bd/search/*
// @grant       none
// ==/UserScript==
import { open } from '../modules/WindowExtensions.js';
window.addEventListener('load', () => {
  if (location.pathname.startsWith('/bd/isbn/')) {
    const element = document.createElement('section');
    element.classList.add('sidebar', 'book-col-mb-1');

    addButton('booklog', isbn10 => `https://booklog.jp/item/1/${isbn10}`);
    addButton('bookmeter', isbn10 => `https://bookmeter.com/b/${isbn10}`);
    addButton('calil', isbn10 => `https://calil.jp/book/${isbn10}`);

    document.querySelector('.book-col-frame')?.insertBefore(
      element,
      document.querySelector('.book-cart'),
    );

    /**
     * @param label
     * @param from
     */
    function addButton(label: string, from: (isbn10: string) => string): void {
      const button = document.createElement('button');
      button.appendChild(document.createTextNode(label));
      button.setAttribute('type', 'button');
      button.classList.add('btn', 'btn-sm', 'btn-default');
      button.addEventListener(
        'click',
        async () => {
          const urls = extract().map(isbn10 => from(isbn10));
          await open(urls);
        },
      );
      element.appendChild(button);
    }
    function extract(): string[] {
      const isbn10 = document.querySelector('span[itemprop="isbn10"]')?.textContent?.trim();
      return isbn10 ? [isbn10] : [];
    }
  }
  else if (location.pathname.startsWith('/bd/search/')) {
    const element = document.createElement('div');

    addButton('booklog.jp', isbn10 => `https://booklog.jp/item/1/${isbn10}`);
    addButton('bookmeter', isbn10 => `https://bookmeter.com/b/${isbn10}`);
    addButton('calil.jp', isbn10 => `https://calil.jp/book/${isbn10}`);

    new MutationObserver((mutations, observer) => {
      for (const mutation of mutations)
        for (const node of mutation.addedNodes)
          if (
            node instanceof HTMLElement
            && node.classList.contains('booksearch-sideformtitle')
          ) {
            node.insertBefore(
              element,
              document.querySelector('.sideformtitle'),
            );
            observer.disconnect();
          }
    }).observe(document.body, {
      subtree: true,
      childList: true,
    });

    /**
     * @param label
     * @param from
     */
    function addButton(label: string, from: (isbn10: string) => string): void {
      const button = document.createElement('button');
      button.appendChild(document.createTextNode(label));
      button.setAttribute('type', 'button');
      button.classList.add('btn', 'btn-sm');
      button.addEventListener(
        'click',
        async () => {
          const urls = extract().map(isbn10 => from(isbn10));
          await open(urls);
        },
      );
      element.appendChild(button);
    }
    function extract(): string[] {
      const isbn13 = document.querySelector('span[itemprop="isbn13"]')?.textContent?.trim();
      if (!isbn13) return [];
      const isbn10 = toISBN10(isbn13);
      return isbn10 ? [isbn10] : [];
    }
    /**
     * @param isbn13
     */
    function toISBN10(isbn13: string): string | null {
      if (!/^\d{13}$/.test(isbn13)) return null;
      const sum = Array.from(isbn13.slice(0, 12), (d, i) => Number.parseInt(d, 10) * (i % 2 === 0 ? 1 : 3))
        .reduce((s, v) => s + v, 0);
      const check = (10 - (sum % 10)) % 10;
      return `${isbn13.slice(0, 9)}${check}`;
    }
  }
});
