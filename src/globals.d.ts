// Greasemonkey API (granted via @grant in the UserScript metadata header).
declare const GM: {
  /** @see {@link https://wiki.greasespot.net/GM.listValues} */
  listValues(): Promise<string[]>;
  /** @see {@link https://wiki.greasespot.net/GM.getValue} */
  getValue(
    name: string,
    defaultValue?: string | number | boolean,
  ): Promise<string | number | boolean | undefined>;
  /** @see {@link https://wiki.greasespot.net/GM.setValue} */
  setValue(name: string, value: string | number | boolean): Promise<void>;
  /** @see {@link https://wiki.greasespot.net/GM.deleteValue} */
  deleteValue(name: string): Promise<void>;
  /** @see {@link https://wiki.greasespot.net/GM.notification} */
  notification(options: {
    text: string;
    title?: string;
    image?: unknown;
    onclick?: () => void;
    ondone?: () => void;
  }): void;
  /** @see {@link https://wiki.greasespot.net/GM.openInTab} */
  openInTab(url: string, open_in_background?: boolean): void;
  /** @see {@link https://wiki.greasespot.net/GM.registerMenuCommand} */
  registerMenuCommand(
    caption: string,
    commandFunc: () => void,
    accessKey?: string,
  ): void;
  /** @see {@link https://wiki.greasespot.net/GM.setClipboard} */
  setClipboard(text: string): void;
};

/** @see {@link https://www.jsdelivr.com/package/npm/tldts} */
declare const tldts: {
  parse(url: string): { subdomain?: string };
};
