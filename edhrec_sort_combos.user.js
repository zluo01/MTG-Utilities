// ==UserScript==
// @name        Sort Combo Entries
// @namespace   sort-combos
// @match       *://edhrec.com/combos/*
// @version     2.0
// @description Sort ComboView_comboEntry elements by card combo count, then by percentage
// @grant       none
// ==/UserScript==

(function () {
  'use strict';

  function getCardCount(entry) {
    var match = entry.textContent.match(/(\d+)\s+card combo/);
    return match ? parseInt(match[1], 10) : Infinity;
  }

  function getPercentage(entry) {
    var match = entry.textContent.match(/\(([\d.]+)%\s+of\s+/);
    return match ? parseFloat(match[1]) : -1;
  }

  function sortCombos() {
    var entries = Array.from(document.querySelectorAll('div[class*="ComboView_comboEntry"]'));
    if (entries.length < 2) return;

    var parent = entries[0].parentElement;
    if (!parent) return;

    // Remove unwanted elements
    parent.querySelectorAll('div[class*="ComboView_hint"], div[class*="ComboView_trailingBlankSpace"]')
      .forEach(function (el) { el.remove(); });

    // Sort by card count ascending, then by percentage descending
    entries.sort(function (a, b) {
      var cardDiff = getCardCount(a) - getCardCount(b);
      if (cardDiff !== 0) return cardDiff;
      return getPercentage(b) - getPercentage(a);
    });

    entries.forEach(function (entry) { parent.appendChild(entry); });
  }

  // Wait for content to load, then sort once
  var retries = 30;
  var timer = setInterval(function () {
    var entries = document.querySelectorAll('div[class*="ComboView_comboEntry"]');
    if (entries.length >= 2) {
      clearInterval(timer);
      sortCombos();
    } else if (--retries <= 0) {
      clearInterval(timer);
    }
  }, 500);
})();
