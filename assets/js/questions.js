(function () {
  'use strict';

  const filters = {
    subject: 'Todas as disciplinas',
    source: 'Todas as origens',
    institution: 'Todas as instituições',
    year: 'Todos os anos',
    topic: 'Todos os assuntos',
    difficulty: 'Todas as dificuldades'
  };

  const state = {
    pool: [],
    selected: [],
    currentIndex: 0,
    answers: new Map()
  };

  function fisherYates(items) {
    const shuffled = [...items];
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
    }
    return shuffled;
  }

  function byBalancedTopics(items) {
    const topics = new Map();
    fisherYates(items).forEach((question) => {
      const topic = question.assunto || 'Sem assunto';
      if (!topics.has(topic)) topics.set(topic, []);
      topics.get(topic).push(question);
    });

    const topicNames = fisherYates([...topics.keys()]);
    const balanced = [];
    while (topicNames.some((topic) => topics.get(topic).length > 0)) {
      topicNames.forEach((topic) => {
        const question = topics.get(topic).pop();
        if (question) balanced.push(question);
      });
    }
    return balanced;
  }

  function textElement(tagName, text, className) {
    const element = document.createElement(tagName);
    element.textContent = text;
    if (className) element.className = className;
    return element;
  }

  function toSlug(value) {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase('pt-BR')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  function appendOption(select, value, label) {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = label;
    select.appendChild(option);
  }

  function populateSelect(elementId, defaultLabel, values) {
    const select = document.getElementById(elementId);
    if (!select) return;

    select.replaceChildren();
    appendOption(select, defaultLabel, defaultLabel);
    [...new Set(values.filter((value) => value !== undefined && value !== null && value !== ''))]
      .sort((first, second) => String(first).localeCompare(String(second), 'pt-BR', { numeric: true }))
      .forEach((value) => appendOption(select, String(value), String(value)));
  }

  function populateFilters() {
    populateSelect('questionSubject', filters.subject, state.pool.map((question) => question.materia));
    populateSelect('questionSource', filters.source, state.pool.map((question) => question.origem));
    populateSelect('questionInstitution', filters.institution, state.pool.map((question) => question.instituicao));
    populateSelect('questionYear', filters.year, state.pool.map((question) => question.ano));
    populateSelect('questionTopic', filters.topic, state.pool.map((question) => question.assunto));
    populateSelect('questionDifficulty', filters.difficulty, state.pool.map((question) => question.dificuldade));
  }

  function applyUrlFilters() {
    const params = new URLSearchParams(window.location.search);
    const subjectSlug = params.get('materia');
    const topicSlug = params.get('topico');
    const slug = (value) => value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase('pt-BR')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    if (subjectSlug) {
      const option = [...document.getElementById('questionSubject').options]
        .find((item) => item.value !== filters.subject && slug(item.value) === subjectSlug);
      if (option) document.getElementById('questionSubject').value = option.value;
    }
    if (topicSlug) {
      const option = [...document.getElementById('questionTopic').options]
        .find((item) => item.value !== filters.topic && slug(item.value) === topicSlug);
      if (option) document.getElementById('questionTopic').value = option.value;
    }
  }

  function getFilters() {
    return {
      subject: document.getElementById('questionSubject')?.value || filters.subject,
      source: document.getElementById('questionSource')?.value || filters.source,
      institution: document.getElementById('questionInstitution')?.value || filters.institution,
      year: document.getElementById('questionYear')?.value || filters.year,
      topic: document.getElementById('questionTopic')?.value || filters.topic,
      difficulty: document.getElementById('questionDifficulty')?.value || filters.difficulty,
      quantity: Number(document.getElementById('questionQuantity')?.value || 15)
    };
  }

  function matchesFilters(question, selectedFilters) {
    return (selectedFilters.subject === filters.subject || question.materia === selectedFilters.subject)
      && (selectedFilters.source === filters.source || question.origem === selectedFilters.source)
      && (selectedFilters.institution === filters.institution || question.instituicao === selectedFilters.institution)
      && (selectedFilters.year === filters.year || String(question.ano) === selectedFilters.year)
      && (selectedFilters.topic === filters.topic || question.assunto === selectedFilters.topic)
      && (selectedFilters.difficulty === filters.difficulty || question.dificuldade === selectedFilters.difficulty);
  }

  function setStatus(message) {
    const status = document.getElementById('countWarning');
    if (status) status.textContent = message;
  }

  function renderQuestion(question) {
    const container = document.getElementById('simulationStage');
    if (!container) return;

    const currentNumber = state.currentIndex + 1;
    const progress = (currentNumber / state.selected.length) * 100;
    const card = document.createElement('section');
    card.className = 'simulation-card';
    card.setAttribute('aria-labelledby', 'currentQuestion');

    const header = document.createElement('div');
    header.className = 'simulation-header';
    const metadata = document.createElement('div');
    metadata.className = 'question-meta';
    metadata.append(
      textElement('span', `Questão ${currentNumber}/${state.selected.length}`, 'badge'),
      textElement('span', `${question.materia} · ${question.origem}`, 'mini-note')
    );
    header.append(metadata, textElement('span', `Disponíveis: ${state.selected.length}`, 'mini-note'));

    const progressTrack = document.createElement('div');
    progressTrack.className = 'progress-bar';
    progressTrack.setAttribute('role', 'progressbar');
    progressTrack.setAttribute('aria-label', 'Progresso do simulado');
    progressTrack.setAttribute('aria-valuemin', '0');
    progressTrack.setAttribute('aria-valuemax', String(state.selected.length));
    progressTrack.setAttribute('aria-valuenow', String(currentNumber));
    const progressFill = document.createElement('span');
    progressFill.className = 'progress-fill';
    progressFill.style.width = `${progress}%`;
    progressTrack.appendChild(progressFill);

    const surface = document.createElement('div');
    surface.className = 'question-surface';
    surface.appendChild(textElement('h3', question.enunciado, 'question-prompt'));
    const options = document.createElement('div');
    options.className = 'option-list';
    options.setAttribute('role', 'group');
    options.setAttribute('aria-label', 'Alternativas');

    question.alternativas.forEach((option) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `option-item${state.answers.get(question.id) === option.id ? ' selected' : ''}`;
      button.setAttribute('aria-pressed', String(state.answers.get(question.id) === option.id));
      button.append(textElement('span', option.id), textElement('span', option.texto));
      button.addEventListener('click', () => {
        state.answers.set(question.id, option.id);
        renderQuestion(question);
      });
      options.appendChild(button);
    });
    surface.appendChild(options);
    card.append(header, progressTrack, surface);
    container.replaceChildren(card);
  }

  function appendReview(reviewList, question, index) {
    const selectedAnswer = state.answers.get(question.id);
    const correct = selectedAnswer === question.respostaCorreta;
    const review = document.createElement('article');
    review.className = `review-item ${correct ? 'correct' : 'incorrect'}`;
    const top = document.createElement('div');
    top.className = 'review-top';
    top.append(
      textElement('strong', `Questão ${index + 1}`),
      textElement('span', correct ? 'Acertou' : 'Errou')
    );
    review.append(
      top,
      textElement('p', `Resposta do aluno: ${selectedAnswer || 'Não respondida'}`),
      textElement('p', `Gabarito: ${question.respostaCorreta}`),
      textElement('p', question.explicacao)
    );

    if (question.materia && question.assunto) {
      const questionLink = document.createElement('a');
      questionLink.href = `explicacoes.html?materia=${encodeURIComponent(toSlug(question.materia))}&topico=${encodeURIComponent(toSlug(question.assunto))}`;
      questionLink.textContent = `Ver explicação ou status: ${question.assunto}`;
      review.appendChild(questionLink);
    }
    reviewList.appendChild(review);
  }

  function renderSummary() {
    const resultCard = document.getElementById('resultsCard');
    if (!resultCard) return;

    const correctCount = state.selected.filter((question) => (
      state.answers.get(question.id) === question.respostaCorreta
    )).length;
    const total = state.selected.length;
    const errorCount = total - correctCount;
    const percentage = total ? Math.round((correctCount / total) * 100) : 0;
    const summary = document.createElement('section');
    summary.className = 'results-card';
    summary.appendChild(textElement('h3', 'Resultado final'));

    const counts = document.createElement('div');
    counts.className = 'answer-summary-grid';
    [
      [correctCount, 'Acertos'],
      [errorCount, 'Erros'],
      [`${percentage}%`, 'Aproveitamento']
    ].forEach(([value, label]) => {
      const chip = document.createElement('div');
      chip.className = 'answer-chip';
      chip.append(textElement('strong', String(value)), document.createTextNode(label));
      counts.appendChild(chip);
    });

    const reviewList = document.createElement('div');
    reviewList.className = 'review-list';
    state.selected.forEach((question, index) => appendReview(reviewList, question, index));
    const restart = document.createElement('button');
    restart.type = 'button';
    restart.className = 'button button-primary';
    restart.textContent = 'Realizar outro simulado';
    restart.addEventListener('click', resetQuiz);
    summary.append(counts, reviewList, restart);
    resultCard.replaceChildren(summary);
  }

  function renderCurrentQuestion() {
    renderQuestion(state.selected[state.currentIndex]);
    const previous = document.getElementById('prevQuestion');
    const next = document.getElementById('nextQuestion');
    if (previous) previous.disabled = state.currentIndex === 0;
    if (next) next.disabled = state.currentIndex === state.selected.length - 1;
  }

  function startQuiz() {
    const selectedFilters = getFilters();
    const available = state.pool.filter((question) => matchesFilters(question, selectedFilters));
    const requestedCount = Math.max(15, Math.min(20, selectedFilters.quantity));
    const count = Math.min(available.length, requestedCount);

    if (available.length < requestedCount) {
      setStatus(`Há ${available.length} questão(ões) disponíveis para estes filtros; o simulado usará todas, sem duplicação.`);
    } else {
      setStatus(`${available.length} questão(ões) disponíveis. O simulado usará ${count}.`);
    }

    state.selected = byBalancedTopics(available).slice(0, count);
    state.currentIndex = 0;
    state.answers.clear();
    document.getElementById('resultsCard')?.replaceChildren();

    const actions = document.getElementById('simulationActions');
    if (actions) actions.hidden = state.selected.length === 0;

    if (state.selected.length === 0) {
      document.getElementById('simulationStage')?.replaceChildren(
        textElement('div', 'Nenhuma questão corresponde aos filtros escolhidos. Tente outra combinação.', 'empty-state')
      );
      return;
    }

    renderCurrentQuestion();
  }

  function resetQuiz() {
    state.selected = [];
    state.answers.clear();
    state.currentIndex = 0;
    document.getElementById('resultsCard')?.replaceChildren();
    document.getElementById('simulationActions').hidden = true;
    document.getElementById('simulationStage')?.replaceChildren(
      textElement('div', 'Ajuste os filtros e inicie outro simulado.', 'empty-state')
    );
    setStatus('O banco contém questões autorais revisadas. A disponibilidade depende dos filtros escolhidos.');
  }

  function showLoadError(error) {
    const stage = document.getElementById('simulationStage');
    if (stage) {
      stage.replaceChildren(textElement('div', error.message || 'Não foi possível carregar o banco de questões.', 'empty-state'));
    }
    const startButton = document.getElementById('startQuiz');
    if (startButton) startButton.disabled = true;
    console.error('Falha ao carregar o banco de questões.', error);
  }

  document.addEventListener('DOMContentLoaded', async () => {
    try {
      state.pool = await window.TI01MA_QUESTION_DATA.loadQuestions();
      populateFilters();
      applyUrlFilters();
      setStatus(`Banco carregado: ${state.pool.length} questão(ões) disponíveis.`);
    } catch (error) {
      showLoadError(error);
      return;
    }

    document.getElementById('startQuiz')?.addEventListener('click', startQuiz);
    document.getElementById('prevQuestion')?.addEventListener('click', () => {
      if (state.currentIndex > 0) {
        state.currentIndex -= 1;
        renderCurrentQuestion();
      }
    });
    document.getElementById('nextQuestion')?.addEventListener('click', () => {
      if (state.currentIndex < state.selected.length - 1) {
        state.currentIndex += 1;
        renderCurrentQuestion();
      }
    });
    document.getElementById('finishQuiz')?.addEventListener('click', () => {
      if (!window.confirm('Deseja finalizar o simulado?')) return;
      renderSummary();
      document.getElementById('resultsCard')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
})();
