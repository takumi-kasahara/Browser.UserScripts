// ==UserScript==
// @name        Log Microdata
// @description Logs Microdata to the console and updates the document title based on the data.
// @version     1.0.0
// @grant       none
// @noframes
// ==/UserScript==
import { extractElement } from '../modules/HtmlExtensions.js';
if (window.top === window.self) window.addEventListener('load', () => {
  for (const element of [document.documentElement, ...document.querySelectorAll('[itemscope]')]) {
    const data = extractElement(element, 'itemscope', 'itemprop');
    if (!data) continue;
    const type = element.getAttribute('itemtype') ?? '';
    console.log('Microdata:', type, data);
    fromElement(data, type);
  }

  new MutationObserver(mutations => {
    for (const mutation of mutations)
      switch (mutation.type) {
        case 'childList':
          handle(mutation.target, mutation.addedNodes, mutation.type);
          break;
        case 'attributes':
          handle(mutation.target, mutation.addedNodes, mutation.type, mutation.attributeName ?? '');
          break;
        case 'characterData':
          handle(mutation.target.parentElement ?? mutation.target, mutation.addedNodes, mutation.type);
          break;
      }

    /**
     * @param target
     * @param addedNodes
     * @param reason
     */
    function handle(target: Node, addedNodes: NodeList, ...reason: string[]): void {
      if (!(target instanceof HTMLElement)) return;
      const closest = target.closest('[itemscope]') ?? document.documentElement;
      const type = closest.getAttribute('itemtype') ?? '';
      const children = Array.from(addedNodes)
        .filter((e): e is HTMLElement => e instanceof HTMLElement)
        .filter(node => node.getAttribute('itemprop'));
      const properties = target.hasAttribute('itemprop')
        ? [target, ...children]
        : children;
      if (properties.length === 0) return;
      const data = extractElement(closest, 'itemscope', 'itemprop', ...properties);
      if (!data) return;
      console.debug('Mutated:', ...reason, properties);
      console.log('Microdata:', type, data);
      fromElement(data, type);
    }
  }).observe(document.documentElement, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: [
      'itemid',
      'itemprop',
      'itemref',
      'itemscope',
      'itemtype',
      'content',
      'src',
      'href',
      'data',
      'value',
      'datetime',
    ],
    characterData: true,
  });

  /**
   * @param data
   * @param type
   */
  function fromElement(data: Record<string, unknown>, type: string): void {
    switch (type) {
      case 'http://schema.org/Product':
        if (Object.hasOwn(data, 'name'))
          setTitle(String(data['name']));
        break;
    }
  }
  /**
   * @param title
   */
  function setTitle(title: string): void {
    if (!title) return;
    const oldTitle = document.title.normalize('NFKC');
    const newTitle = title.normalize('NFKC');
    if (newTitle === oldTitle) return;
    if (oldTitle.includes(newTitle)) {
      console.info('Old Title:', oldTitle);
      console.info('New Title:', newTitle);
      document.title = title;
    }
  }
});
