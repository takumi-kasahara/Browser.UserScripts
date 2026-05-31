// ==UserScript==
// @name        Log JSON Linked Data
// @description Logs JSON Linked Data to the console and updates the document title based on the data.
// @version     1.0.0
// @grant       none
// @noframes
// ==/UserScript==
import { extractObjects, tryParse } from '../modules/JsonExtensions.js';
if (window.top === window.self) window.addEventListener('load', () => {
  const ldObjects = Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
    .flatMap(e => extractObjects(tryParse(e.textContent?.trim() ?? '')));
  for (const data of ldObjects) {
    console.log('JSON Linked Data:', data['@type'], data);
    fromJson(data);
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
     * @param {Node} target
     * @param {NodeList} addedNodes
     * @param {...string} reason
     */
    function handle(target, addedNodes, ...reason) {
      const children = Array.from(addedNodes)
        .filter(e => e instanceof HTMLScriptElement)
        .filter(e => e.type === 'application/ld+json');
      const self = target instanceof HTMLScriptElement && target.type === 'application/ld+json'
        ? target
        : null;
      const scripts = self ? [self, ...children] : children;
      for (const script of scripts) {
        console.debug('Mutated:', ...reason, script);
        for (const data of extractObjects(tryParse(script.textContent?.trim() ?? ''))) {
          console.log('JSON Linked Data:', data['@type'], data);
          fromJson(data);
        }
      }
    }
  }).observe(document.documentElement, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: [
      'type',
    ],
    characterData: true,
  });

  /**
   * @param {Record<string, unknown>} data
   */
  function fromJson(data) {
    if (Object.hasOwn(data, 'headline'))
      setTitle(String(data['headline']));
    if (Object.hasOwn(data, '@type'))
      for (const type of Array.isArray(data['@type']) ? data['@type'] : [data['@type']])
        switch (type) {
          case 'VideoObject':
            setTitle(String(data['name'] ?? ''));
            break;
        }
  }
  /**
   * @param {string} title
   */
  function setTitle(title) {
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
