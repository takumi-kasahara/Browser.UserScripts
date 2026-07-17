// ==UserScript==
// @name        ISBN to URL for bookmeter.com
// @description Add buttons to convert ISBN to URL on bookmeter.com
// @version     1.0.0
// @match       https://bookmeter.com/books/*
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
    button.style.position = 'relative';
    button.style.top = '50%';
    button.style.transform = 'translateY(-50%)';
    button.addEventListener(
      'click',
      async () => {
        const urls = extract().map(isbn10 => from(isbn10));
        await open(urls);
      },
    );
    const element = document.createElement('div');
    element.style.float = 'left';
    element.style.height = '36px';
    element.appendChild(button);
    const container = document.querySelector('.global__inner');
    if (!(container instanceof HTMLElement)) return;
    const target = document.querySelector('.inner__registrations');
    container.insertBefore(element, target);
  }
  function extract(): string[] {
    const e = document.querySelector('.image__cover');
    return e instanceof HTMLAnchorElement
      ? [e.href.replace('https://bookmeter.com/books/', '').slice(0, 10)]
      : [];
  }
});
