(function () {
  'use strict';

  const THEME_KEY = 'ti01ma-theme';
  const root = document.documentElement;
  const preferredTheme = () => (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

  function applyTheme(theme, persist = false) {
    const safeTheme = theme === 'dark' ? 'dark' : 'light';
    root.dataset.theme = safeTheme;
    const toggle = document.getElementById('themeToggle');
    const label = document.getElementById('themeToggleLabel');
    const icon = document.getElementById('themeToggleIcon');
    const meta = document.getElementById('themeColorMeta');

    if (toggle) {
      const isDark = safeTheme === 'dark';
      toggle.setAttribute('aria-pressed', String(isDark));
      toggle.setAttribute('aria-label', isDark ? 'Ativar modo claro' : 'Ativar modo escuro');
    }
    if (label) label.textContent = safeTheme === 'dark' ? 'Modo claro' : 'Modo escuro';
    if (icon) icon.textContent = safeTheme === 'dark' ? '☀' : '☾';
    if (meta) meta.setAttribute('content', safeTheme === 'dark' ? '#151b22' : '#f3ecdf');

    if (persist) {
      try { localStorage.setItem(THEME_KEY, safeTheme); } catch (error) { console.warn('Não foi possível salvar a preferência de tema.', error); }
    }
  }

  try {
    const saved = localStorage.getItem(THEME_KEY);
    applyTheme(saved || preferredTheme(), false);
  } catch (error) {
    applyTheme(preferredTheme(), false);
  }

  document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('themeToggle');
    if (!toggle) return;
    toggle.addEventListener('click', () => {
      const nextTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
      applyTheme(nextTheme, true);
    });
  });
})();
