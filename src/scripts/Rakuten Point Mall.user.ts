// ==UserScript==
// @name        Rakuten Point Mall
// @description Automatically clicks the dream kuji links in Rakuten Point Mall main page.
// @version     1.0.0
// @match       https://pointmall.rakuten.co.jp/
// @grant       none
// ==/UserScript==
window.addEventListener('load', async () => {
  const es = Array.from(document.querySelectorAll('.dreamkuji-item > a'))
    .filter((e): e is HTMLAnchorElement => e instanceof HTMLAnchorElement)
    .filter(a =>
      a.href.startsWith('https://rd.pointmall.rakuten.co.jp/lottery/grant/'),
    );
  for (const e of es) e.click();
});
