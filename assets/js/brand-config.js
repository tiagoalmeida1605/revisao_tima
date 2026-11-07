window.TI01MA_BRAND = {
  logo: 'assets/img/brand/1tima-logo-horizontal.svg',
  symbol: 'assets/img/brand/1tima-raven-symbol.svg',
  ravenStudy: 'assets/img/Studious Canada Raccoon at Desk.png',
  ravenTech: 'assets/img/Focused Raccoon Tech Study Mascot.png'
};

window.TI01MA_BRAND.applyBrandAssets = function () {
  const brandTargets = [
    { selector: '[data-brand-logo]', asset: this.logo },
    { selector: '[data-brand-symbol]', asset: this.symbol },
    { selector: '[data-raven-study]', asset: this.ravenStudy, fallback: 'RAVEN #27 · STUDY' },
    { selector: '[data-raven-tech]', asset: this.ravenTech, fallback: 'RAVEN #27 · TECH' }
  ];

  brandTargets.forEach(({ selector, asset, fallback }) => {
    document.querySelectorAll(selector).forEach((element) => {
      const img = new Image();
      img.onload = () => {
        element.src = asset;
        element.alt = element.getAttribute('data-alt') || 'Marca 1TIMA';
        element.hidden = false;
      };
      img.onerror = () => {
        element.hidden = true;
        if (fallback && element.parentElement && !element.parentElement.querySelector('.raven-fallback')) {
          const fallbackElement = document.createElement('span');
          fallbackElement.className = 'raven-fallback';
          fallbackElement.textContent = fallback;
          element.parentElement.appendChild(fallbackElement);
        }
      };
      img.src = asset;
    });
  });
};

document.addEventListener('DOMContentLoaded', () => {
  window.TI01MA_BRAND.applyBrandAssets();
});
