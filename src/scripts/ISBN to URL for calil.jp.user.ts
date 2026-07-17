// ==UserScript==
// @name        ISBN to URL for calil.jp
// @description Add buttons to convert ISBN to URL on calil.jp
// @version     1.0.0
// @match       https://calil.jp/list/*
// @match       https://calil.jp/recipe/*
// @grant       none
// ==/UserScript==
import { open } from '../modules/WindowExtensions.js';
window.addEventListener('load', () => {
  addButton('booklog', isbn10 => `https://booklog.jp/item/1/${isbn10}`);
  addButton('bookmeter', isbn10 => `https://bookmeter.com/b/${isbn10}`);
  addButton('calil', isbn10 => `https://calil.jp/book/${isbn10}`);

  /**
   * @param label
   * @param from
   */
  function addButton(label: string, from: (isbn10: string) => string): void {
    const button = document.createElement('button');
    button.appendChild(document.createTextNode(label));
    button.setAttribute('type', 'button');
    button.addEventListener(
      'click',
      async () => {
        const urls = extract().map(isbn10 => from(isbn10));
        await open(urls);
      },
    );
    document.querySelector('.container')?.insertBefore(
      button,
      document.querySelector('.right'),
    );
  }
  function extract(): string[] {
    if (location.pathname.startsWith('/list/'))
      return Array.from(document.querySelectorAll('td.title > a'))
        .filter((e): e is HTMLAnchorElement => e instanceof HTMLAnchorElement)
        .filter(a => a.origin === location.origin)
        .map(a => a.pathname.replace('/book/', ''))
        .reverse();
    if (location.pathname.startsWith('/recipe/'))
      return Array.from(document.querySelectorAll('div.cover > a'))
        .filter((e): e is HTMLAnchorElement => e instanceof HTMLAnchorElement)
        .filter(a => a.origin === location.origin)
        .map(a => a.pathname.replace('/book/', ''))
        .reverse();
    return [];
  }
});
