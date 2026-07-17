/**
 * Vitest setup for jsdom environment.
 *
 * jsdom does not implement every browser API the user scripts rely on.
 * This file installs minimal polyfills/mocks so module code can run under test.
 */

// jsdom lacks ClipboardItem (used by NavigatorExtensions.copyToClipboard).
if (typeof globalThis.ClipboardItem === 'undefined') {
  class ClipboardItemPolyfill {
    readonly types: ReadonlyArray<string>;
    readonly items: Record<string, Blob>;
    constructor(items: Record<string, Blob>) {
      this.items = items;
      this.types = Object.freeze(Object.keys(items));
    }
  }
  // @ts-expect-error - assigning polyfill to global
  globalThis.ClipboardItem = ClipboardItemPolyfill;
}

// jsdom lacks navigator.clipboard.writeText / write.
if (!navigator.clipboard) {
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: {
      writeText: async (_text: string): Promise<void> => { },
      write: async (_items: ClipboardItem[]): Promise<void> => { },
    },
  });
}

// jsdom lacks Element.setHTML; fall back to textContent so createAnchorElement works.
// @ts-expect-error - setHTML is not in the current @types/web DOM lib
if (typeof HTMLElement.prototype.setHTML !== 'function') {
  // @ts-expect-error - assigning polyfill
  HTMLElement.prototype.setHTML = function setHTML(text: string) {
    this.textContent = text;
  };
}

// jsdom does not compute HTMLAnchorElement.origin from href; derive it so
// DocumentExtensions.collectAnchorElements can filter by origin under test.
if (typeof Object.getOwnPropertyDescriptor(HTMLAnchorElement.prototype, 'origin')?.get !== 'function') {
  Object.defineProperty(HTMLAnchorElement.prototype, 'origin', {
    configurable: true,
    get(this: HTMLAnchorElement) {
      try {
        return new URL(this.href).origin;
      }
      catch {
        return '';
      }
    },
  });
}
