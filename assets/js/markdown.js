(function () {
  'use strict';

  window.TI01MA_MARKDOWN = {
    render(content) {
      if (!content) return '';
      if (!window.marked || typeof window.marked.parse !== 'function') {
        throw new Error('A biblioteca Marked não está disponível.');
      }
      if (!window.DOMPurify || typeof window.DOMPurify.sanitize !== 'function') {
        throw new Error('A biblioteca DOMPurify não está disponível.');
      }

      return window.DOMPurify.sanitize(
        window.marked.parse(content, { breaks: true, gfm: true })
      );
    }
  };
})();
