// ==UserScript==
// @name        Redirect on Pixiv
// @description Redirects Pixiv jump links to their target URLs.
// @version     1.0.0
// @match       https://www.pixiv.net/jump.php?*
// @grant       none
// ==/UserScript==
import { getHttpUrl } from '../modules/UrlExtensions.js';
(() => {
  const params = new URL(location.href).searchParams;
  function redirect(candidate: string) {
    const url = getHttpUrl(candidate, location.href);
    if (url) location.replace(url);
  }
  if (params.has('url')) {
    const url = params.get('url');
    if (url) redirect(url);
  }
  else if (params.size === 1)
    for (const [url, empty] of params) if (empty === '') redirect(url);
})();
