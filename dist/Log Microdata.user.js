// ==UserScript==
// @name        Log Microdata
// @description Logs Microdata to the console and updates the document title based on the data.
// @version     1.0.0
// @grant       none
// @noframes
// ==/UserScript==
(() => {
  // src/modules/HtmlExtensions.js
  function extractElement(element, scopeAttribute, propertyAttribute, ...properties) {
    const grouped = Object.groupBy(
      Array.from(element.querySelectorAll(`[${propertyAttribute}]`)).filter((e) => e instanceof HTMLElement).filter((e) => properties.length === 0 || properties.includes(e)).filter((e) => e.parentElement?.closest(`[${scopeAttribute}]`) === element || e.closest(`[${scopeAttribute}]`) === null),
      (e) => e.getAttribute(propertyAttribute) ?? ""
    );
    if (Object.keys(grouped).length === 0) return null;
    const data = /* @__PURE__ */ new Map();
    for (const [key, group] of Object.entries(grouped)) {
      if (!key || !group || group.length === 0) continue;
      const first = group.at(0);
      if (!first) continue;
      data.set(key, group.length === 1 ? getValue(first, scopeAttribute, propertyAttribute) : group.map((e) => getValue(e, scopeAttribute, propertyAttribute)));
    }
    return Object.fromEntries(data);
    function getValue(element2, scopeAttribute2, propertyAttribute2) {
      if (element2.matches(`[${scopeAttribute2}]`)) return extractElement(element2, scopeAttribute2, propertyAttribute2);
      if (element2.hasAttribute("content")) return element2.getAttribute("content");
      if (element2 instanceof HTMLMetaElement) return element2.content;
      if (element2 instanceof HTMLAudioElement)
        return element2.src ?? Array.from(element2.children).find((e) => e instanceof HTMLSourceElement || e instanceof HTMLTrackElement)?.src;
      if (element2 instanceof HTMLEmbedElement) return element2.src;
      if (element2 instanceof HTMLIFrameElement) return element2.src;
      if (element2 instanceof HTMLImageElement) return element2.src ?? element2.srcset;
      if (element2 instanceof HTMLSourceElement) return element2.src ?? element2.srcset;
      if (element2 instanceof HTMLTrackElement) return element2.src;
      if (element2 instanceof HTMLVideoElement)
        return element2.src ?? Array.from(element2.children).find((e) => e instanceof HTMLSourceElement || e instanceof HTMLTrackElement)?.src;
      if (element2 instanceof HTMLAnchorElement) return element2.href;
      if (element2 instanceof HTMLAreaElement) return element2.href;
      if (element2 instanceof HTMLLinkElement) return element2.href;
      if (element2 instanceof HTMLObjectElement) return element2.data;
      if (element2 instanceof HTMLDataElement) return element2.value;
      if (element2 instanceof HTMLMeterElement) return element2.value;
      if (element2 instanceof HTMLTimeElement) return element2.dateTime;
      return (element2.textContent ?? "").trim();
    }
  }

  // src/scripts/Log Microdata.user.js
  if (window.top === window.self) window.addEventListener("load", () => {
    for (const element of [document.documentElement, ...document.querySelectorAll("[itemscope]")]) {
      const data = extractElement(element, "itemscope", "itemprop");
      if (!data) continue;
      const type = element.getAttribute("itemtype") ?? "";
      console.log("Microdata:", type, data);
      fromElement(data, type);
    }
    new MutationObserver((mutations) => {
      for (const mutation of mutations)
        switch (mutation.type) {
          case "childList":
            handle(mutation.target, mutation.addedNodes, mutation.type);
            break;
          case "attributes":
            handle(mutation.target, mutation.addedNodes, mutation.type, mutation.attributeName ?? "");
            break;
          case "characterData":
            handle(mutation.target.parentElement ?? mutation.target, mutation.addedNodes, mutation.type);
            break;
        }
      function handle(target, addedNodes, ...reason) {
        if (!(target instanceof HTMLElement)) return;
        const closest = target.closest("[itemscope]") ?? document.documentElement;
        const type = closest.getAttribute("itemtype") ?? "";
        const children = Array.from(addedNodes).filter((e) => e instanceof HTMLElement).filter((node) => node.getAttribute("itemprop"));
        const properties = target.hasAttribute("itemprop") ? [target, ...children] : children;
        if (properties.length === 0) return;
        const data = extractElement(closest, "itemscope", "itemprop", ...properties);
        if (!data) return;
        console.debug("Mutated:", ...reason, properties);
        console.log("Microdata:", type, data);
        fromElement(data, type);
      }
    }).observe(document.documentElement, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: [
        "itemid",
        "itemprop",
        "itemref",
        "itemscope",
        "itemtype",
        "content",
        "src",
        "href",
        "data",
        "value",
        "datetime"
      ],
      characterData: true
    });
    function fromElement(data, type) {
      switch (type) {
        case "http://schema.org/Product":
          if (Object.hasOwn(data, "name"))
            setTitle(String(data["name"]));
          break;
      }
    }
    function setTitle(title) {
      if (!title) return;
      const oldTitle = document.title.normalize("NFKC");
      const newTitle = title.normalize("NFKC");
      if (newTitle === oldTitle) return;
      if (oldTitle.includes(newTitle)) {
        console.info("Old Title:", oldTitle);
        console.info("New Title:", newTitle);
        document.title = title;
      }
    }
  });
})();
