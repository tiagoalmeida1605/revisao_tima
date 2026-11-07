(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', async () => {
    const cards = document.querySelectorAll('[data-home-card]');
    cards.forEach((card, index) => {
      card.style.animationDelay = `${index * 40}ms`;
    });

    const count = document.getElementById('homeQuestionCount');
    const label = document.getElementById('homeQuestionLabel');
    if (!count || !label) return;

    try {
      const questions = await window.TI01MA_QUESTION_DATA.loadQuestions();
      count.textContent = String(questions.length);
      label.textContent = questions.length === 1 ? 'questão no banco local' : 'questões no banco local';
    } catch (error) {
      count.textContent = '—';
      label.textContent = 'banco local indisponível';
      console.error('Não foi possível carregar a contagem de questões da página inicial.', error);
    }
  });
})();
