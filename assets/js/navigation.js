(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.getElementById('menuToggle');
    const nav = document.getElementById('mainNav');
    const links = nav ? nav.querySelectorAll('a') : [];

    if (!menuToggle || !nav) return;

    const setMenuState = (open) => {
      nav.classList.toggle('open', open);
      menuToggle.setAttribute('aria-expanded', String(open));
      menuToggle.innerHTML = open ? '<span aria-hidden="true">×</span>' : '<span aria-hidden="true">☰</span>';
    };

    menuToggle.addEventListener('click', () => {
      const isOpen = nav.classList.contains('open');
      setMenuState(!isOpen);
    });

    links.forEach((link) => link.addEventListener('click', () => setMenuState(false)));
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') setMenuState(false);
    });
  });
})();
