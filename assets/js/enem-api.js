/*
 * Integração com a API comunitária enem.dev.
 * Documentação: https://docs.enem.dev/
 * A API não é afiliada ao INEP. Cache local de 12 horas para reduzir chamadas.
 */
(function () {
  "use strict";

  const BASE_URL = "https://api.enem.dev/v1";
  const CACHE_PREFIX = "ti01ma-enem-v1";
  const CACHE_TTL = 12 * 60 * 60 * 1000;
  let lastNetworkRequest = 0;

  function cacheKey(year, language) {
    return `${CACHE_PREFIX}:${year}:${language || "all"}`;
  }

  function readCache(key) {
    try {
      const parsed = JSON.parse(localStorage.getItem(key) || "null");
      if (parsed && Date.now() - parsed.savedAt < CACHE_TTL && Array.isArray(parsed.questions)) {
        return parsed.questions;
      }
    } catch (error) {
      console.warn("Não foi possível ler o cache da API ENEM:", error);
    }
    return null;
  }

  function writeCache(key, questions) {
    try {
      localStorage.setItem(key, JSON.stringify({ savedAt: Date.now(), questions }));
    } catch (error) {
      console.warn("Cache local indisponível; a busca continuará sem cache.", error);
    }
  }

  async function waitForRateLimit() {
    const elapsed = Date.now() - lastNetworkRequest;
    if (elapsed < 1100) {
      await new Promise((resolve) => setTimeout(resolve, 1100 - elapsed));
    }
    lastNetworkRequest = Date.now();
  }

  async function fetchExamQuestions({ year, language = "" }) {
    const numericYear = Number(year);
    if (!Number.isInteger(numericYear) || numericYear < 2009 || numericYear > 2023) {
      throw new Error("Escolha um ano entre 2009 e 2023.");
    }

    const key = cacheKey(numericYear, language);
    const cached = readCache(key);
    if (cached) return { questions: cached, cached: true };

    await waitForRateLimit();
    const params = new URLSearchParams({ limit: "200", offset: "0" });
    if (language) params.set("language", language);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 18000);
    let response;
    try {
      response = await fetch(`${BASE_URL}/exams/${numericYear}/questions?${params.toString()}`, {
        method: "GET",
        headers: { Accept: "application/json" },
        signal: controller.signal
      });
    } catch (error) {
      if (error.name === "AbortError") {
        throw new Error("A API demorou demais para responder. Tente novamente em alguns instantes.");
      }
      throw new Error("Não foi possível conectar à API. Verifique sua internet ou tente mais tarde.");
    } finally {
      clearTimeout(timeoutId);
    }

    if (response.status === 429) {
      throw new Error("A API limitou as consultas temporariamente. Aguarde um pouco antes de tentar novamente.");
    }
    if (!response.ok) {
      throw new Error(`A API respondeu com erro HTTP ${response.status}. Tente outro ano ou volte mais tarde.`);
    }

    let payload;
    try {
      payload = await response.json();
    } catch (error) {
      throw new Error("A API retornou uma resposta que não pôde ser lida como JSON.");
    }

    const questions = Array.isArray(payload.questions) ? payload.questions : [];
    if (!questions.length) {
      throw new Error("Não foram encontradas questões para essa edição.");
    }
    writeCache(key, questions);
    return { questions, cached: false };
  }

  function matchesArea(question, area) {
    if (area === "all") return true;
    const discipline = String(question.discipline || "").toLowerCase();
    return discipline.includes(area);
  }

  function matchesLanguage(question, language) {
    if (!language) return true;
    return String(question.language || "").toLowerCase() === String(language).toLowerCase();
  }

  window.EnemAPI = { fetchExamQuestions, matchesArea, matchesLanguage };
})();
