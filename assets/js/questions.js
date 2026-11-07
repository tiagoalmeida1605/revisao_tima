(function () {
  'use strict';

  const questionFiles = [
    'matematica',
    'portugues',
    'literatura',
    'biologia',
    'historia',
    'geografia',
    'fisica',
    'quimica',
    'ingles'
  ];

  const questionState = {
    pool: [],
    selected: [],
    currentIndex: 0,
    answers: new Map(),
    result: null
  };

  function fisherYates(items) {
    const copy = [...items];
    for (let idx = copy.length - 1; idx > 0; idx -= 1) {
      const randomIndex = Math.floor(Math.random() * (idx + 1));
      [copy[idx], copy[randomIndex]] = [copy[randomIndex], copy[idx]];
    }
    return copy;
  }

  function parseNumber(value, fallback) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  async function loadQuestionPool() {
    const results = await Promise.all(questionFiles.map(async (file) => {
      const response = await fetch(`data/questions/${file}.json`, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`Não foi possível carregar ${file}.json`);
      }
      return response.json();
    }));
    questionState.pool = results.flat();
    populateFilters();
  }

  function populateFilters() {
    const subjectFilter = document.getElementById('questionSubject');
    const sourceFilter = document.getElementById('questionSource');
    const institutionFilter = document.getElementById('questionInstitution');
    const yearFilter = document.getElementById('questionYear');
    const difficultyFilter = document.getElementById('questionDifficulty');

    if (!subjectFilter || !sourceFilter || !institutionFilter || !yearFilter || !difficultyFilter) return;

    const subjects = [...new Set(questionState.pool.map((question) => question.materia).filter(Boolean))].sort();
    const sources = [...new Set(questionState.pool.map((question) => question.origem).filter(Boolean))].sort();
    const institutions = [...new Set(questionState.pool.map((question) => question.instituicao).filter(Boolean))].sort();
    const years = [...new Set(questionState.pool.map((question) => parseNumber(question.ano, 0)).filter((year) => year > 0))].sort((a, b) => a - b);
    const difficulties = [...new Set(questionState.pool.map((question) => question.dificuldade).filter(Boolean))].sort();

    buildSelect(subjectFilter, ['Todas as disciplinas', ...subjects], 'Todas as disciplinas');
    buildSelect(sourceFilter, ['Todas as origens', ...sources], 'Todas as origens');
    buildSelect(institutionFilter, ['Todas as instituições', ...institutions], 'Todas as instituições');
    buildSelect(yearFilter, ['Todos os anos', ...years.map(String)], 'Todos os anos');
    buildSelect(difficultyFilter, ['Todas as dificuldades', ...difficulties], 'Todas as dificuldades');
  }

  function buildSelect(selectElement, options, defaultValue) {
    selectElement.innerHTML = options.map((option) => {
      const value = typeof option === 'string' ? option : option.value;
      const label = typeof option === 'string' ? option : option.label;
      const selected = value === defaultValue ? 'selected' : '';
      return `<option value="${value}" ${selected}>${label}</option>`;
    }).join('');
  }

  function getFilters() {
    return {
      subject: document.getElementById('questionSubject')?.value || 'Todas as disciplinas',
      source: document.getElementById('questionSource')?.value || 'Todas as origens',
      institution: document.getElementById('questionInstitution')?.value || 'Todas as instituições',
      year: document.getElementById('questionYear')?.value || 'Todos os anos',
      difficulty: document.getElementById('questionDifficulty')?.value || 'Todas as dificuldades',
      quantity: parseNumber(document.getElementById('questionQuantity')?.value || '15', 15)
    };
  }

  function matchesFilters(question, filters) {
    if (filters.subject !== 'Todas as disciplinas' && question.materia !== filters.subject) return false;
    if (filters.source !== 'Todas as origens' && question.origem !== filters.source) return false;
    if (filters.institution !== 'Todas as instituições' && question.instituicao !== filters.institution) return false;
    if (filters.year !== 'Todos os anos' && String(question.ano) !== String(filters.year)) return false;
    if (filters.difficulty !== 'Todas as dificuldades' && question.dificuldade !== filters.difficulty) return false;
    return true;
  }

  function renderQuestionCard(question, index, total) {
    const container = document.getElementById('simulationStage');
    if (!container) return;

    const answerValue = questionState.answers.get(question.id) || '';
    const progress = ((index + 1) / total) * 100;

    container.innerHTML = `
      <div class="simulation-card">
        <div class="simulation-header">
          <div class="question-meta">
            <span class="badge">Questão ${index + 1}/${total}</span>
            <span class="mini-note">${question.materia} · ${question.origem}</span>
          </div>
          <span class="mini-note">Disponíveis: ${questionState.selected.length}</span>
        </div>
        <div class="progress-bar" aria-label="Progresso do simulado">
          <span class="progress-fill" style="width:${progress}%"></span>
        </div>
        <div class="question-surface">
          <h3>${question.enunciado}</h3>
          <div class="option-list">
            ${(question.alternativas || []).map((option) => {
              const isSelected = answerValue === option.id;
              const classes = isSelected ? 'option-item selected' : 'option-item';
              return `
                <button type="button" class="${classes}" data-option-id="${option.id}" data-question-id="${question.id}">
                  <span>${option.id}</span>
                  <span>${option.texto}</span>
                </button>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;

    container.querySelectorAll('[data-option-id]').forEach((button) => {
      button.addEventListener('click', () => {
        questionState.answers.set(question.id, button.dataset.optionId);
        renderQuestionCard(question, index, total);
      });
    });
  }

  function renderSummary() {
    const resultCard = document.getElementById('resultsCard');
    if (!resultCard) return;

    const answers = Array.from(questionState.answers.entries());
    const correctCount = questionState.selected.filter((question) => question.respostaCorreta === questionState.answers.get(question.id)).length;
    const total = questionState.selected.length;
    const errors = total - correctCount;
    const percent = total ? Math.round((correctCount / total) * 100) : 0;

    resultCard.innerHTML = `
      <div class="results-card">
        <h3>Resultado final</h3>
        <div class="answer-summary-grid">
          <div class="answer-chip"><strong>${correctCount}</strong>Acertos</div>
          <div class="answer-chip"><strong>${errors}</strong>Erros</div>
          <div class="answer-chip"><strong>${percent}%</strong>Aproveitamento</div>
        </div>
        <div class="review-list">
          ${questionState.selected.map((question, index) => {
            const userAnswer = questionState.answers.get(question.id) || '—';
            const isCorrect = userAnswer === question.respostaCorreta;
            const itemClass = isCorrect ? 'correct' : 'incorrect';
            return `
              <article class="review-item ${itemClass}">
                <div class="review-top">
                  <strong>Questão ${index + 1}</strong>
                  <span>${isCorrect ? 'Acertou' : 'Errou'}</span>
                </div>
                <p><strong>Resposta do aluno:</strong> ${userAnswer}</p>
                <p><strong>Gabarito:</strong> ${question.respostaCorreta}</p>
                <p>${question.explicacao}</p>
              </article>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  function startQuiz() {
    const filters = getFilters();
    const filtered = questionState.pool.filter((question) => matchesFilters(question, filters));
    const maximumAvailable = Math.min(filtered.length, filters.quantity);

    const countWarning = document.getElementById('countWarning');
    if (countWarning) {
      countWarning.textContent = `Disponíveis: ${filtered.length}. Será usado ${maximumAvailable} item(ns) nesta sessão.`;
    }

    const usable = fisherYates(filtered).slice(0, Math.max(0, maximumAvailable));
    questionState.selected = usable;
    questionState.answers = new Map();
    questionState.currentIndex = 0;
    questionState.result = null;

    const actionBar = document.getElementById('simulationActions');
    if (actionBar) actionBar.hidden = false;

    if (!usable.length) {
      document.getElementById('simulationStage').innerHTML = '<div class="empty-state">Nenhuma questão atende aos filtros selecionados. Tente outro filtro.</div>';
      return;
    }

    renderQuestionCard(usable[0], 0, usable.length);
    renderNavigation();
  }

  function renderNavigation() {
    const actionBar = document.getElementById('simulationActions');
    if (!actionBar) return;

    const previousButton = document.getElementById('prevQuestion');
    const nextButton = document.getElementById('nextQuestion');
    const finishButton = document.getElementById('finishQuiz');

    previousButton.disabled = questionState.currentIndex === 0;
    nextButton.textContent = questionState.currentIndex === questionState.selected.length - 1 ? 'Próxima' : 'Próxima';
    finishButton.hidden = questionState.selected.length === 0;
  }

  function showCurrentQuestion() {
    if (!questionState.selected.length) return;
    renderQuestionCard(questionState.selected[questionState.currentIndex], questionState.currentIndex, questionState.selected.length);
    renderNavigation();
  }

  document.addEventListener('DOMContentLoaded', async () => {
    await loadQuestionPool();

    const startButton = document.getElementById('startQuiz');
    const previousButton = document.getElementById('prevQuestion');
    const nextButton = document.getElementById('nextQuestion');
    const finishButton = document.getElementById('finishQuiz');

    startButton?.addEventListener('click', startQuiz);

    previousButton?.addEventListener('click', () => {
      if (questionState.currentIndex > 0) {
        questionState.currentIndex -= 1;
        showCurrentQuestion();
      }
    });

    nextButton?.addEventListener('click', () => {
      if (questionState.currentIndex < questionState.selected.length - 1) {
        questionState.currentIndex += 1;
        showCurrentQuestion();
      }
    });

    finishButton?.addEventListener('click', () => {
      const confirmed = window.confirm('Deseja finalizar o simulado?');
      if (!confirmed) return;
      renderSummary();
      const resultsCard = document.getElementById('resultsCard');
      if (resultsCard) resultsCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
})();
