// ==UserScript==
// @name      Rakuten Lucky Kuji Open
// @namespace https://github.com/takumi-kasahara
// @version   1.0.0
// @match     https://rakucoin.appspot.com/rakuten/kuji/
// @grant     GM.openInTab
// ==/UserScript==
window.addEventListener('load', async () => {
  const urls = Array.from(
    document.querySelectorAll('table[class="table"]'),
  ).flatMap(e =>
    Array.from(e.getElementsByTagName('a'), (a): string => a.href),
  );
  for (const url of urls) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    GM.openInTab(url);
  }
});
