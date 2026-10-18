/**
 * Vitest setup for jsdom environment.
 *
 * jsdom does not implement every browser API the user scripts rely on.
 * This file installs minimal polyfills/mocks so module code can run under test.
 */

// jsdom lacks the Greasemonkey API.
if (typeof (globalThis as { GM?: unknown }).GM === 'undefined') {
  (globalThis as { GM?: unknown }).GM = {
    getValue: async () => JSON.stringify([]),
    setValue: async () => {},
    deleteValue: async () => {},
    notification: () => {},
    openInTab: () => {},
    setClipboard: () => {},
  };
}
