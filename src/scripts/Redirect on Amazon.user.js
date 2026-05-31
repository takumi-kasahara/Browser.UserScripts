// ==UserScript==
// @name        Redirect on Amazon
// @description Redirects Amazon search results to include a specific seller filter.
// @version     1.0.0
// @match       https://www.amazon.co.jp/s?*
// @grant       none
// ==/UserScript==
(() => {
  const url = new URL(location.href);
  if (url.searchParams.has('k') && !url.searchParams.has('rh')) {
    url.searchParams.set('rh', 'n:8465952051,p_6:AN1VRQENFRJN5');
    location.replace(url.href);
  }
})();
