(function () {
  'use strict';
  document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('[data-home-card]');
    cards.forEach((card, index) => {
      card.style.animationDelay = `${index * 40}ms`;
    });
  });
})();
