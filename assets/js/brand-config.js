window.TI01MA_BRAND = {
  logo: 'assets/img/brand/1tima-logo-horizontal.svg',
  symbol: 'assets/img/brand/1tima-raven-symbol.svg',
  ravenStudy: 'assets/img/mascots/raven-27-study.png',
  ravenTech: 'assets/img/mascots/raven-27-tech.png',
  fallbackText: '1TIMA'
};

window.TI01MA_BRAND.applyBrandAssets = function () {
  const brandTargets = [
    { selector: '[data-brand-logo]', asset: this.logo },
    { selector: '[data-brand-symbol]', asset: this.symbol },
    { selector: '[data-raven-study]', asset: this.ravenStudy },
    { selector: '[data-raven-tech]', asset: this.ravenTech }
  ];

  brandTargets.forEach(({ selector, asset }) => {
    document.querySelectorAll(selector).forEach((element) => {
      const img = new Image();
      img.onload = () => {
        element.src = asset;
        element.alt = element.getAttribute('data-alt') || 'Marca 1TIMA';
        element.hidden = false;
      };
      img.onerror = () => {
        element.hidden = true;
        const fallback = document.createElement('span');
        fallback.className = 'brand-fallback';
        fallback.textContent = '1TIMA';
        if (element.parentElement) {
          element.parentElement.replaceChildren(fallback);
        }
      };
      img.src = asset;
    });
  });
};

document.addEventListener('DOMContentLoaded', () => {
  window.TI01MA_BRAND.applyBrandAssets();
});
