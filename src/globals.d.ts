// Ambient declarations for external UserScript globals that are not npm imports.
/* eslint-disable no-unused-vars */

// Greasemonkey API (granted via @grant in the UserScript metadata header).
declare const GM: {
  notification(opts: {
    text: string;
    title: string;
    image?: unknown;
    onclick: () => void;
  }): void;
};

// tldts UMD global, loaded via @require in the UserScript metadata header.
declare const tldts: {
  parse(url: string): { subdomain?: string };
};
