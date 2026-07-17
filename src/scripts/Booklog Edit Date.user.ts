// ==UserScript==
// @name        Booklog Edit Date
// @description Automatically clears the date fields on the Booklog edit page.
// @version     1.0.0
// @match       https://booklog.jp/edit/1/*
// @grant       none
// ==/UserScript==
window.addEventListener('load', () => {
  setValue(document.getElementById('create_on_y'), null);
  setValue(document.getElementById('create_on_m'), null);
  setValue(document.getElementById('create_on_d'), null);
  setValue(document.getElementById('create_on_h'), null);
  setValue(document.getElementById('create_on_i'), null);
  setValue(document.getElementById('create_on_s'), null);
  setChecked(document.getElementById('read_at_null'), true);

  /**
   * @param element
   * @param value
   */
  function setValue(element: HTMLElement | null, value: string | null): void {
    if (element instanceof HTMLInputElement)
      element.value = value ?? '';
  }
  /**
   * @param element
   * @param checked
   */
  function setChecked(element: HTMLElement | null, checked: boolean): void {
    if (element instanceof HTMLInputElement)
      element.checked = checked;
  }
});
