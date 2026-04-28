// ==UserScript==
// @name        Sort Combo Entries
// @namespace   sort-combos
// @match       *://edhrec.com/combos/*
// @version     2.1
// @description Sort ComboView_comboEntry elements by card combo count, then by percentage
// @grant       none
// ==/UserScript==

(function () {
  'use strict';

  // Read the textContent of every ComboView_splitStatItem inside the entry.
  // This avoids picking up unrelated digits (e.g. card prices like "$20.13")
  // that get glued onto the card-count number when textContent is taken from
  // the whole entry.
  function getStatTexts(entry) {
    return Array.from(
      entry.querySelectorAll('div[class*="ComboView_splitStatItem"]')
    ).map(function (el) { return el.textContent; });
  }

  function getCardCount(entry) {
    var texts = getStatTexts(entry);
    for (var i = 0; i < texts.length; i++) {
      var m = texts[i].match(/(\d+)\s*card combo/i);
      if (m) return parseInt(m[1], 10);
    }
    return Infinity;
  }

  function getPercentage(entry) {
    var texts = getStatTexts(entry);
    for (var i = 0; i < texts.length; i++) {
      // The DOM renders percentages like "( 6.44 % of  2151225 )"
      // (note the space before %), so allow optional whitespace.
      var m = texts[i].match(/\(\s*([\d.]+)\s*%\s*of/i);
      if (m) return parseFloat(m[1]);
    }
    return -1;
  }

  function sortCombos() {
    var entries = Array.from(document.querySelectorAll('div[class*="ComboView_comboEntry"]'));
    if (entries.length < 2) return;

    var parent = entries[0].parentElement;
    if (!parent) return;

    // Remove unwanted elements
    parent.querySelectorAll('div[class*="ComboView_hint"], div[class*="ComboView_trailingBlankSpace"]')
      .forEach(function (el) { el.remove(); });

    // Pre-compute keys so we don't re-parse textContent on every comparison.
    var keyed = entries.map(function (entry) {
      return {
        entry: entry,
        cards: getCardCount(entry),
        pct: getPercentage(entry)
      };
    });

    // Sort by card count ascending, then by percentage descending
    keyed.sort(function (a, b) {
      if (a.cards !== b.cards) return a.cards - b.cards;
      return b.pct - a.pct;
    });

    keyed.forEach(function (k) { parent.appendChild(k.entry); });
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
