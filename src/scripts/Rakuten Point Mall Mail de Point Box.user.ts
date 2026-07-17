// ==UserScript==
// @name        Rakuten Point Mall Mail de Point Box
// @description Automatically opens new unread mails in Rakuten Point Mall Mail de Point Box.
// @version     1.0.0
// @match       https://member.pointmail.rakuten.co.jp/box
// @grant       none
// ==/UserScript==
window.addEventListener('load', () => {
  const target = document.querySelector('.mailListBox');
  if (!target) throw new Error('Target not found.');

  new MutationObserver(async (mutations, observer) => {
    for (const mutation of mutations)
      for (const node of mutation.addedNodes)
        if (node instanceof HTMLElement && node.classList.contains('mailboxBox')) {
          const urls = Array.from(node.querySelectorAll('.unread > .listCont > a'))
            .filter((e): e is HTMLAnchorElement => e instanceof HTMLAnchorElement)
            .map(a => a.href);
          if (urls.length === 0) continue;
          for (const url of urls) window.open(url, '_blank', 'noreferrer');
          observer.disconnect();
        }
  }).observe(target, {
    childList: true,
  });
});
