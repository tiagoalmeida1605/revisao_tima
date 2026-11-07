(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    const filterInput = document.getElementById('materiaFilter');
    const cards = document.querySelectorAll('[data-materia-card]');

    if (!filterInput || cards.length === 0) return;

    filterInput.addEventListener('input', () => {
      const term = filterInput.value.trim().toLowerCase();
      cards.forEach((card) => {
        const text = card.textContent.toLowerCase();
        card.hidden = !!term && !text.includes(term);
      });
    });
  });
})();
