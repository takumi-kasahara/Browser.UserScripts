// ==UserScript==
// @name        Booklog Edit Date
// @description Automatically clears the date fields on the Booklog edit page.
// @version     1.0.0
// @match       https://booklog.jp/edit/1/*
// @grant       none
// ==/UserScript==
"use strict";
(() => {
  // src/scripts/Booklog Edit Date.user.ts
  window.addEventListener("load", () => {
    setValue(document.getElementById("create_on_y"), null);
    setValue(document.getElementById("create_on_m"), null);
    setValue(document.getElementById("create_on_d"), null);
    setValue(document.getElementById("create_on_h"), null);
    setValue(document.getElementById("create_on_i"), null);
    setValue(document.getElementById("create_on_s"), null);
    setChecked(document.getElementById("read_at_null"), true);
    function setValue(element, value) {
      if (element instanceof HTMLInputElement)
        element.value = value ?? "";
    }
    function setChecked(element, checked) {
      if (element instanceof HTMLInputElement)
        element.checked = checked;
    }
  });
})();
