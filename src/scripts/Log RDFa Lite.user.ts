// ==UserScript==
// @name        Log RDFa Lite
// @description Logs RDFa Lite to the console and updates the document title based on the data.
// @version     1.0.0
// @grant       none
// @noframes
// ==/UserScript==
import { extractElement } from '../modules/HtmlExtensions.js';
if (window.top === window.self)
  window.addEventListener('load', () => {
    for (const element of [
      document.documentElement,
      ...document.querySelectorAll('[typeof]'),
    ]) {
      const data = extractElement(element, 'typeof', 'property');
      if (!data) continue;
      const type = element.getAttribute('typeof') ?? '';
      console.log('RDFa Lite:', type, data);
      fromElement(data, type);
    }

    new MutationObserver(mutations => {
      for (const mutation of mutations)
        switch (mutation.type) {
          case 'childList':
            handle(mutation.target, mutation.addedNodes, mutation.type);
            break;
          case 'attributes':
            handle(
              mutation.target,
              mutation.addedNodes,
              mutation.type,
              mutation.attributeName ?? '',
            );
            break;
          case 'characterData':
            handle(
              mutation.target.parentElement ?? mutation.target,
              mutation.addedNodes,
              mutation.type,
            );
            break;
        }

      /**
       * @param target
       * @param addedNodes
       * @param reason
       */
      function handle(
        target: Node,
        addedNodes: NodeList,
        ...reason: string[]
      ): void {
        if (!(target instanceof HTMLElement)) return;
        const closest = target.closest('[typeof]') ?? document.documentElement;
        const type = closest.getAttribute('typeof') ?? '';
        const children = Array.from(addedNodes)
          .filter((e): e is HTMLElement => e instanceof HTMLElement)
          .filter(node => node.getAttribute('property'));
        const properties = target.hasAttribute('property')
          ? [target, ...children]
          : children;
        if (properties.length === 0) return;
        const data = extractElement(
          closest,
          'typeof',
          'property',
          ...properties,
        );
        if (!data) return;
        console.debug('Mutated:', ...reason, properties);
        console.log('RDFa Lite:', type, data);
        fromElement(data, type);
      }
    }).observe(document.documentElement, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: [
        'vocab',
        'typeof',
        'property',
        'resource',
        'prefix',
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
        default:
          if (Object.hasOwn(data, 'twitter:title'))
            setTitle(String(data['twitter:title']));
          else if (Object.hasOwn(data, 'og:title'))
            setTitle(String(data['og:title']));
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
