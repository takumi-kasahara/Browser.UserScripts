// ==UserScript==
// @name        ISBN to URL for booklog.jp
// @description Add buttons to convert ISBN to URL on booklog.jp
// @version     1.0.0
// @match       https://booklog.jp/author/*
// @match       https://booklog.jp/item/1/*
// @match       https://booklog.jp/search?*
// @match       https://booklog.jp/users/*
// @exclude     https://booklog.jp/q/*
// @exclude     https://booklog.jp/timeline/*
// @exclude     https://booklog.jp/users/*/archives/1/*
// @exclude     https://booklog.jp/users/*/follower
// @exclude     https://booklog.jp/users/*/following
// @exclude     https://booklog.jp/users/*/goals
// @exclude     https://booklog.jp/users/*/phrases
// @exclude     https://booklog.jp/users/*/profile
// @exclude     https://booklog.jp/users/*/review/*
// @exclude     https://booklog.jp/users/*/stats
// @grant       none
// ==/UserScript==
import { open } from '../modules/WindowExtensions.js';
window.addEventListener('load', () => {
  addButton('booklog', isbn10 => isbn10 ? `https://booklog.jp/item/1/${isbn10}` : null);
  addButton('bookmeter', isbn10 => isbn10 ? `https://bookmeter.com/b/${isbn10}` : null);
  addButton('calil', isbn10 => isbn10 ? `https://calil.jp/book/${isbn10}` : null);
  addButton('hanmoto', isbn10 => isbn10 ? `https://www.hanmoto.com/bd/isbn/${isbn10}` : null);
  addButton('bookoff', (isbn10, isbn13) => isbn13 ? `https://shopping.bookoff.co.jp/search/keyword/${isbn13}` : null);
  addButton('netoff', (isbn10, isbn13) => isbn13 ? `https://www.netoff.co.jp/cmdtyallsearch?word=${isbn13}` : null);
  addButton('e-hon', isbn10 => isbn10 ? `https://www.e-hon.ne.jp/bec/SA/Detail?refBook=${isbn10}` : null);
  addButton('maruzenjunkudo', (isbn10, isbn13) => isbn13 ? `https://www.maruzenjunkudo.co.jp/products/${isbn13}` : null);
  addButton('kinokuniya', (isbn10, isbn13) => isbn13 ? `https://www.kinokuniya.co.jp/f/dsg-01-${isbn13}` : null);

  /**
   * @param {string} label
   * @param {(isbn10: string, isbn13: string) => string | null} from
   */
  function addButton(label, from) {
    const button = document.createElement('button');
    button.appendChild(document.createTextNode(label));
    button.setAttribute('type', 'button');
    button.addEventListener(
      'click',
      async () => {
        const isbn10 = extract().filter(isbn10 => isISBN10(isbn10));
        const isbn13 = await toISBN13(isbn10.join(','));
        const urls = isbn10
          .map((e, i) => from(e, isbn13.at(i) ?? ''))
          .filter(url => typeof url === 'string');
        await open(urls);
      },
    );
    const element = document.createElement('div');
    element.appendChild(button);
    element.style.alignItems = 'center';
    element.style.display = 'flex';
    const navigation = document.getElementById('global-navigation');
    if (!navigation) return;
    const right = document.querySelector('.right-navigation');
    navigation.insertBefore(element, right);
  }
  function extract() {
    if (location.pathname.startsWith('/item/1/'))
      return [location.pathname.replace('/item/1/', '')];
    if (location.pathname.startsWith('/author/') || location.pathname.startsWith('/search'))
      return Array.from(document.querySelectorAll('a.titleLink'))
        .filter(e => e instanceof HTMLAnchorElement)
        .filter(a => a.origin === location.origin)
        .map(a => a.pathname.replace('/item/1/', ''))
        .reverse();
    if (location.pathname.startsWith('/users/')) {
      return Array.from(document.querySelectorAll('div.item-wrapper'))
        .filter(e => e instanceof HTMLElement)
        .map(e => {
          if (e.dataset.itemId) return e.dataset.itemId;
          if (!e.dataset.book) return null;
          try {
            return String(JSON.parse(e.dataset.book).id);
          }
          catch {
            return null;
          }
        })
        .filter(value => typeof value === 'string')
        .reverse();
    }
    return [];
  }
  /**
   * @param {string} isbn10
   */
  function isISBN10(isbn10) {
    if (!/^\d{9}(?:\d|X)$/i.test(isbn10)) return false;

    return Array.from(
      isbn10.toUpperCase(), (d, i) => (
        d === 'X'
          ? 10
          : Number.parseInt(d, 10)
      ) * (10 - i))
      .reduce((s, v) => s + v, 0) % 11 === 0;
  }
  /**
   * @see {@link https://openbd.jp/}
   * @param {string} isbn10
   */
  async function toISBN13(isbn10) {
    const element = document.querySelector('span[itemprop="isbn"]');
    if (element) return [(element.textContent ?? '').trim()].filter(Boolean);
    try {
      const response = await fetch(`https://api.openbd.jp/v1/get?isbn=${isbn10}`);
      /** @type {{ summary: { isbn: string } }[]} */
      const books = await response.json();
      for (const book of books) console.debug(book);
      const values = books
        .filter(Boolean)
        .map(x => x.summary.isbn);
      if (values.length > 0) return values;
      throw new Error(`ISBN not found: ${isbn10}`);
    }
    catch (e) {
      if (!(e instanceof Error)) throw e;
      console.warn(e.message);
      return [];
    }
  }
});
