(function () {
  'use strict';

  window.TI01MA_MARKDOWN = {
    render(content) {
      if (!content) return '';
      if (window.marked && typeof window.marked.parse === 'function') {
        const html = window.marked.parse(content, { breaks: true, gfm: true });
        return window.DOMPurify ? DOMPurify.sanitize(html) : html;
      }
      return content
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\n/g, '<br>');
    }
  };
})();
