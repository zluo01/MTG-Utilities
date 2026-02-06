// ==UserScript==
// @name        Sort Combo Entries
// @namespace   sort-combos
// @match       *://*/*
// @version     1.0
// @description Sort ComboView_comboEntry elements by card combo count, then by percentage
// @grant       none
// ==/UserScript==

(function () {
  'use strict';

  function getCardCount(entry) {
    // Look for text like "2 card combo"
    const match = entry.textContent.match(/(\d+)\s+card combo/);
    return match ? parseInt(match[1], 10) : Infinity;
  }

  function getPercentage(entry) {
    // Look for text like "(7.16% of ...)"
    const match = entry.textContent.match(/\(([\d.]+)%\s+of\s+/);
    return match ? parseFloat(match[1]) : -1;
  }

  function removeUnwanted() {
    document.querySelectorAll('div[class*="ComboView_hint"], div[class*="ComboView_trailingBlankSpace"]')
      .forEach((el) => el.remove());
  }

  function sortCombos() {
    removeUnwanted();

    // Find the parent container that holds combo entries
    const allEntries = document.querySelectorAll('div[class*="ComboView_comboEntry"]');
    if (allEntries.length < 2) return;

    const parent = allEntries[0].parentElement;
    if (!parent) return;

    const entries = Array.from(allEntries);

    entries.sort((a, b) => {
      const cardA = getCardCount(a);
      const cardB = getCardCount(b);
      if (cardA !== cardB) return cardA - cardB; // fewer cards first

      const pctA = getPercentage(a);
      const pctB = getPercentage(b);
      return pctB - pctA; // higher percentage first
    });

    // Re-append in sorted order
    entries.forEach((entry) => parent.appendChild(entry));
  }

  // Run after page loads; use MutationObserver for dynamically loaded content
  function init() {
    sortCombos();

    // Re-sort when new content is added (e.g., infinite scroll / SPA navigation)
    const observer = new MutationObserver(() => {
      observer.disconnect(); // pause to avoid loops
      sortCombos();
      observe();
    });

    function observe() {
      const target = document.querySelector('div[class*="ComboView_comboEntry"]')?.parentElement;
      if (target) {
        observer.observe(target, { childList: true });
      }
    }

    observe();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(init, 500));
  } else {
    setTimeout(init, 500);
  }
})();
