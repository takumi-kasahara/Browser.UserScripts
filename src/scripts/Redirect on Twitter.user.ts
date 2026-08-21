// ==UserScript==
// @name        Redirect on Twitter
// @description Redirects Twitter media pages to include a specific filter.
// @version     1.0.0
// @match       https://x.com/*/media
// @grant       none
// ==/UserScript==
(() => {
  const url = new URL(location.href);
  if (!url.searchParams.has('filter')) {
    url.searchParams.set('filter', 'photo');
    location.replace(url.href);
  }
})();
