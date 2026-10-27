// ==UserScript==
// @name        Notify RSS
// @namespace   https://github.com/takumi-kasahara
// @version     1.0.0
// @description Notifies RSS feed URLs and copies them to the clipboard.
// @author      takumi-kasahara
// @match       https://*/*
// @grant       GM.listValues
// @grant       GM.getValue
// @grant       GM.setValue
// @grant       GM.deleteValue
// @grant       GM.notification
// @grant       GM.registerMenuCommand
// @grant       GM.setClipboard
// @noframes
// ==/UserScript==
import { download } from '../modules/DocumentExtensions.js';
import { exists } from '../modules/WindowExtensions.js';
if (window.top === window.self)
  window.addEventListener('load', async () => {
    const urls: string[] = JSON.parse(
      String(await GM.getValue(location.origin, JSON.stringify([]))),
    );
    if (urls.length > 0)
      GM.registerMenuCommand(`Copy ${urls.length} RSS URL(s)`, () =>
        GM.setClipboard(urls.join('\n')),
      );
    GM.registerMenuCommand(`Export RSS URL(s) as JSON`, async () => {
      const result: Record<string, string[]> = {};
      for (const name of await GM.listValues())
        result[name] = JSON.parse(
          String(await GM.getValue(name, JSON.stringify([]))),
        );
      download(result, 'application/json', 'RSS.json');
    });
    GM.registerMenuCommand(`Clear RSS URL(s)`, async () => {
      GM.notification({
        text: 'Click to clear stored values.',
        onclick: async () => {
          for (const name of await GM.listValues()) await GM.deleteValue(name);
        },
      });
    });

    /**
     * @param target
     * @param addedNodes
     * @param reason
     */
    async function handle(
      target: Node,
      addedNodes: NodeList,
      ...reason: string[]
    ) {
      const links = Array.from(addedNodes)
        .filter((e): e is HTMLLinkElement => e instanceof HTMLLinkElement)
        .filter(e => e.rel === 'alternate')
        .filter(
          e =>
            e.type === 'application/atom+xml' ||
            e.type === 'application/rss+xml',
        )
        .filter(async e => await exists(e.href));
      if (links.length === 0) return;
      for (const link of links) console.debug('Mutated:', ...reason, link);

      const stored: string[] = JSON.parse(
        String(await GM.getValue(location.origin, JSON.stringify([]))),
      );
      for (const link of links) console.debug('RSS Feed found:', link);
      const urls = links
        .map(e => {
          const url = new URL(e.href);
          switch (url.origin) {
            case 'https://github.com':
              url.searchParams.delete('token');
              break;
          }
          return url.href;
        })
        .filter(href => !stored.includes(href));
      if (urls.length === 0) return;

      GM.notification({
        text: `Found ${urls.length} RSS URL(s).`,
        title: location.hostname,
        onclick: () => GM.setClipboard(urls.join('\n')),
      });
      const updated = [...new Set([...stored, ...urls])];
      await GM.setValue(location.origin, JSON.stringify(updated.sort()));
    }

    new MutationObserver(async mutations => {
      for (const mutation of mutations)
        switch (mutation.type) {
          case 'childList':
            await handle(mutation.target, mutation.addedNodes, mutation.type);
            break;
          case 'attributes':
            await handle(
              mutation.target,
              mutation.addedNodes,
              mutation.type,
              mutation.attributeName ?? '',
            );
            break;
        }
    }).observe(document.documentElement, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['href', 'rel', 'type'],
    });

    await handle(document.documentElement, document.querySelectorAll('link'));
  });
