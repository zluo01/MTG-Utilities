// ==UserScript==
// @name        Sort Combo Entries
// @namespace   sort-combos
// @match       *://edhrec.com/combos/*
// @version     1.1
// @description Sort ComboView_comboEntry elements by card combo count, then by percentage
// @grant       none
// ==/UserScript==

(function () {
  'use strict';

  function getCardCount(entry) {
    const match = entry.textContent.match(/(\d+)\s+card combo/);
    return match ? parseInt(match[1], 10) : Infinity;
  }

  function getPercentage(entry) {
    const match = entry.textContent.match(/\(([\d.]+)%\s+of\s+/);
    return match ? parseFloat(match[1]) : -1;
  }

  function removeUnwanted() {
    document.querySelectorAll('div[class*="ComboView_hint"], div[class*="ComboView_trailingBlankSpace"]')
      .forEach((el) => el.remove());
  }

  function sortCombos() {
    const allEntries = document.querySelectorAll('div[class*="ComboView_comboEntry"]');
    if (allEntries.length < 2) return false;

    const parent = allEntries[0].parentElement;
    if (!parent) return false;

    removeUnwanted();

    const entries = Array.from(allEntries);

    entries.sort((a, b) => {
      const cardA = getCardCount(a);
      const cardB = getCardCount(b);
      if (cardA !== cardB) return cardA - cardB;

      const pctA = getPercentage(a);
      const pctB = getPercentage(b);
      return pctB - pctA;
    });

    entries.forEach((entry) => parent.appendChild(entry));
    return true;
  }

  function init() {
    sortCombos();

    let debounceTimer;
    const observer = new MutationObserver(() => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        observer.disconnect();
        sortCombos();
        observe();
      }, 200);
    });

    function observe() {
      const target = document.querySelector('div[class*="ComboView_comboEntry"]')?.parentElement
        || document.querySelector('div[class*="ComboView"]');
      if (target) {
        observer.observe(target, { childList: true, subtree: true });
      }
    }

    observe();

    // Re-initialize on SPA navigation
    const navObserver = new MutationObserver(() => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        if (sortCombos()) {
          observer.disconnect();
          observe();
        }
      }, 500);
    });
    navObserver.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(init, 500));
  } else {
    setTimeout(init, 500);
  }
})();
