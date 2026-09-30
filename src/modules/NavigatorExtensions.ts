/**
 * @param {string} message
 * @param {string | ClipboardItem} item
 */
export async function copyToClipboard(
  message: string,
  item: string | ClipboardItem,
): Promise<void> {
  try {
    if (typeof item === 'string') await navigator.clipboard.writeText(item);
    else if (item instanceof ClipboardItem)
      await navigator.clipboard.write([item]);
    window.alert(message);
  }
  catch (e) {
    if (!(e instanceof Error)) throw e;
    console.warn(e.message);
    void window.prompt(message, String(item));
  }
}
