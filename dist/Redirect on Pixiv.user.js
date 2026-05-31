// ==UserScript==
// @name        Redirect on Pixiv
// @description Redirects Pixiv jump links to their target URLs.
// @version     1.0.0
// @match       https://www.pixiv.net/jump.php?*
// @grant       none
// ==/UserScript==
(() => {
  // src/scripts/Redirect on Pixiv.user.js
  (() => {
    const params = new URL(location.href).searchParams;
    if (params.has("url")) {
      const url = params.get("url");
      if (url) location.replace(url);
    } else if (params.size === 1) {
      for (const [url, empty] of params) if (empty === "") location.replace(url);
    }
  })();
})();
