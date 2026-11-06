(function () {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  // Theme preference: respects the saved choice and falls back to system settings.
  const themeToggle = $("#themeToggle");
  const themeToggleIcon = $("#themeToggleIcon");
  const themeToggleLabel = $("#themeToggleLabel");
  const themeColorMeta = $("#themeColorMeta");

  function applyTheme(theme, persist = false) {
    const safeTheme = theme === "dark" ? "dark" : "light";
    document.documentElement.dataset.theme = safeTheme;
    const isDark = safeTheme === "dark";
    if (themeToggle) {
      themeToggle.setAttribute("aria-pressed", String(isDark));
      themeToggle.setAttribute("aria-label", isDark ? "Ativar modo claro" : "Ativar modo escuro");
    }
    if (themeToggleIcon) themeToggleIcon.textContent = isDark ? "☀" : "◐";
    if (themeToggleLabel) themeToggleLabel.textContent = isDark ? "Modo claro" : "Modo escuro";
    if (themeColorMeta) themeColorMeta.setAttribute("content", isDark ? "#12161c" : "#f2f0ec");

    if (persist) {
      try {
        localStorage.setItem("ti01ma-theme", safeTheme);
      } catch (error) {
        console.warn("Não foi possível salvar a preferência de tema.", error);
      }
    }
  }

  applyTheme(document.documentElement.dataset.theme || "light");
  themeToggle?.addEventListener("click", () => {
    const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(nextTheme, true);
  });

  // Mobile navigation
  const menuToggle = $("#menuToggle");
  const mainNav = $("#mainNav");

  function closeMobileMenu() {
    mainNav?.classList.remove("open");
    menuToggle?.setAttribute("aria-expanded", "false");
    if (menuToggle) menuToggle.innerHTML = '<span aria-hidden="true">☰</span>';
  }

  menuToggle?.addEventListener("click", () => {
    if (!mainNav) return;
    const isOpen = mainNav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.innerHTML = isOpen ? '<span aria-hidden="true">×</span>' : '<span aria-hidden="true">☰</span>';
  });

  $$("#mainNav a").forEach((link) => link.addEventListener("click", closeMobileMenu));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMobileMenu();
  });

  // API controls
  const searchButton = $("#searchEnem");
  const apiStatus = $("#apiStatus");
  const resultsContainer = $("#enemResults");
  const areaSelect = $("#enemArea");
  const languageWrap = $("#languageWrap");
  const languageSelect = $("#enemLanguage");
  let currentQuestions = [];

  function setApiStatus(message, kind = "") {
    apiStatus.textContent = message;
    apiStatus.className = `api-status ${kind}`.trim();
  }

  function safeImageUrl(value) {
    try {
      const url = new URL(value);
      if (url.protocol !== "https:") return "";
      if (!/(^|\.)enem\.dev$/i.test(url.hostname)) return "";
      return url.href;
    } catch {
      return "";
    }
  }

  function appendApiImage(container, url, alt) {
    const safeUrl = safeImageUrl(url);
    if (!safeUrl) return;
    const img = document.createElement("img");
    img.src = safeUrl;
    img.alt = alt || "Imagem da questão";
    img.loading = "lazy";
    img.referrerPolicy = "no-referrer";
    container.appendChild(img);
  }

  function getQuestionAreaLabel(question) {
    const map = {
      "ciencias-humanas": "Ciências Humanas",
      "ciencias-natureza": "Ciências da Natureza",
      "linguagens": "Linguagens",
      "matematica": "Matemática"
    };
    return map[String(question.discipline || "").toLowerCase()] || question.discipline || "Área não informada";
  }

  function renderApiQuestions(questions, year) {
    resultsContainer.replaceChildren();
    if (!questions.length) {
      const empty = document.createElement("div");
      empty.className = "api-empty";
      empty.textContent = "Nenhuma questão encontrada com esse filtro. Experimente outra área ou ano.";
      resultsContainer.appendChild(empty);
      return;
    }

    questions.forEach((question, position) => {
      const card = document.createElement("article");
      card.className = "api-question";

      const head = document.createElement("div");
      head.className = "api-question-head";
      const label = document.createElement("b");
      label.textContent = `ENEM ${question.year || year} · Questão ${question.index ?? position + 1}`;
      const area = document.createElement("span");
      area.textContent = getQuestionAreaLabel(question);
      head.append(label, area);
      card.appendChild(head);

      const context = document.createElement("p");
      context.className = "api-context";
      context.textContent = question.context || question.title || "Enunciado não disponível.";
      card.appendChild(context);

      if (Array.isArray(question.files)) {
        question.files.forEach((file) => appendApiImage(card, file, "Imagem ou texto de apoio da questão"));
      }

      if (question.alternativesIntroduction) {
        const intro = document.createElement("p");
        intro.className = "api-context";
        intro.textContent = question.alternativesIntroduction;
        card.appendChild(intro);
      }

      const optionsBox = document.createElement("div");
      optionsBox.className = "api-alternatives";
      const groupName = `enem-${year}-${question.index ?? position}`;
      (question.alternatives || []).forEach((alternative) => {
        const labelNode = document.createElement("label");
        labelNode.className = "api-option";
        const input = document.createElement("input");
        input.type = "radio";
        input.name = groupName;
        input.value = alternative.letter;
        const text = document.createElement("span");
        text.textContent = `${alternative.letter}) ${alternative.text || "Alternativa"}`;
        labelNode.append(input, text);
        optionsBox.appendChild(labelNode);
        if (alternative.file) appendApiImage(labelNode, alternative.file, `Imagem da alternativa ${alternative.letter}`);
      });
      card.appendChild(optionsBox);

      const result = document.createElement("div");
      result.className = "api-question-result";
      result.hidden = true;
      card.appendChild(result);

      const actions = document.createElement("div");
      actions.className = "api-question-actions";
      const submit = document.createElement("button");
      submit.className = "button button-red";
      submit.type = "button";
      submit.textContent = "Conferir resposta";
      const sourceText = document.createElement("span");
      sourceText.className = "micro-note";
      sourceText.textContent = `Fonte: API ENEM · edição ${year}`;
      submit.addEventListener("click", () => {
        const selected = $(`input[name="${CSS.escape(groupName)}"]:checked`, card);
        if (!selected) {
          result.hidden = false;
          result.className = "api-question-result wrong";
          result.textContent = "Marque uma alternativa antes de conferir.";
          return;
        }
        const correct = question.correctAlternative;
        result.hidden = false;
        const isCorrect = selected.value === correct;
        result.className = `api-question-result ${isCorrect ? "correct" : "wrong"}`;
        result.textContent = isCorrect
          ? `Correto! Alternativa ${correct}.`
          : `Não foi dessa vez. Gabarito registrado na API: ${correct || "não informado"}.`;
      });
      actions.append(submit, sourceText);
      card.appendChild(actions);
      resultsContainer.appendChild(card);
    });
  }

  async function searchEnem() {
    if (!window.EnemAPI) {
      setApiStatus("O módulo da API não foi carregado. Atualize a página.", "error");
      return;
    }
    const year = $("#enemYear").value;
    const area = areaSelect.value;
    const language = area === "linguagens" ? languageSelect.value : "";
    searchButton.disabled = true;
    searchButton.textContent = "Buscando…";
    setApiStatus("Consultando a edição selecionada. Pode levar alguns segundos…", "loading");
    resultsContainer.replaceChildren();

    try {
      const response = await window.EnemAPI.fetchExamQuestions({ year, language });
      currentQuestions = response.questions.filter((question) => window.EnemAPI.matchesArea(question, area));
      if (area === "linguagens" && language) {
        currentQuestions = currentQuestions.filter((question) => window.EnemAPI.matchesLanguage(question, language));
      }
      const cacheLabel = response.cached ? " · carregado do cache local" : " · consulta nova";
      setApiStatus(`${currentQuestions.length} questão(ões) encontradas para o filtro selecionado${cacheLabel}.`, "success");
      renderApiQuestions(currentQuestions.slice(0, 20), year);
      if (currentQuestions.length > 20) {
        const note = document.createElement("p");
        note.className = "micro-note";
        note.textContent = `Exibindo as primeiras 20 de ${currentQuestions.length} questões filtradas.`;
        resultsContainer.appendChild(note);
      }
    } catch (error) {
      setApiStatus(error.message || "Falha ao consultar a API.", "error");
      const fallback = document.createElement("div");
      fallback.className = "api-empty";
      fallback.textContent = "O restante do site continua funcionando. Use os links de acervos oficiais na seção Fontes enquanto a API estiver indisponível.";
      resultsContainer.appendChild(fallback);
    } finally {
      searchButton.disabled = false;
      searchButton.innerHTML = 'Buscar questões <span aria-hidden="true">↗</span>';
    }
  }

  searchButton?.addEventListener("click", searchEnem);
  areaSelect?.addEventListener("change", () => {
    languageWrap.hidden = areaSelect.value !== "linguagens";
    if (areaSelect.value !== "linguagens") languageSelect.value = "";
  });
  languageWrap.hidden = areaSelect.value !== "linguagens";

  // Author-created question set
  const quizContainer = $("#localQuiz");
  const quizProgress = $("#quizProgress");
  const quizSummary = $("#quizSummary");
  const selectedAnswers = new Map();
  const answerLetters = ["A", "B", "C", "D", "E"];

  function renderLocalQuiz() {
    if (!Array.isArray(window.CLASS_QUESTIONS) || !quizContainer) return;
    quizContainer.replaceChildren();
    window.CLASS_QUESTIONS.forEach((question, index) => {
      const article = document.createElement("article");
      article.className = "local-question";
      article.dataset.index = String(index);
      const meta = document.createElement("div");
      meta.className = "local-question-head";
      const subject = document.createElement("span");
      subject.textContent = question.subject;
      const day = document.createElement("span");
      day.textContent = question.day;
      meta.append(subject, day);
      const title = document.createElement("h4");
      title.textContent = `${index + 1}. ${question.prompt}`;
      article.append(meta, title);

      question.options.forEach((option, optionIndex) => {
        const label = document.createElement("label");
        label.className = "local-option";
        const input = document.createElement("input");
        input.type = "radio";
        input.name = `local-${index}`;
        input.value = String(optionIndex);
        input.addEventListener("change", () => {
          selectedAnswers.set(index, optionIndex);
          updateProgress();
        });
        const text = document.createElement("span");
        text.textContent = `${answerLetters[optionIndex]}) ${option}`;
        label.append(input, text);
        article.appendChild(label);
      });
      const feedback = document.createElement("div");
      feedback.className = "local-feedback";
      feedback.id = `local-feedback-${index}`;
      article.appendChild(feedback);
      quizContainer.appendChild(article);
    });
    updateProgress();
  }

  function updateProgress() {
    const total = window.CLASS_QUESTIONS?.length || 0;
    if (quizProgress) quizProgress.textContent = `${selectedAnswers.size} de ${total} respondidas`;
  }

  function gradeLocalQuiz() {
    let correctCount = 0;
    window.CLASS_QUESTIONS.forEach((question, index) => {
      const feedback = $(`#local-feedback-${index}`);
      const answer = selectedAnswers.get(index);
      const correct = answer === question.answer;
      if (correct) correctCount += 1;
      feedback.hidden = false;
      feedback.className = `local-feedback show ${correct ? "correct" : "wrong"}`;
      feedback.textContent = answer === undefined
        ? `Sem resposta. Gabarito: ${answerLetters[question.answer]}. ${question.explanation}`
        : `${correct ? "Acertou!" : `Gabarito: ${answerLetters[question.answer]}.`} ${question.explanation}`;
    });
    const total = window.CLASS_QUESTIONS.length;
    const percent = Math.round((correctCount / total) * 100);
    quizSummary.hidden = false;
    quizSummary.innerHTML = `<strong>${correctCount}/${total}</strong><p>${percent}% de aproveitamento. Veja os comentários de cada questão para revisar o que errou.</p><p class="summary-note">Questões autorais preparadas para a TI01MA. Não são itens oficiais de provas.</p>`;
    quizSummary.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  $("#gradeQuiz")?.addEventListener("click", gradeLocalQuiz);
  renderLocalQuiz();
})();
