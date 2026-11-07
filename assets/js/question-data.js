(function () {
  'use strict';

  let questionPromise;

  function isQuestion(question) {
    return question
      && typeof question.id === 'string'
      && typeof question.materia === 'string'
      && typeof question.assunto === 'string'
      && typeof question.origem === 'string'
      && typeof question.enunciado === 'string'
      && Array.isArray(question.alternativas)
      && question.alternativas.length > 0
      && question.alternativas.every((option) => (
        option
        && typeof option.id === 'string'
        && typeof option.texto === 'string'
      ))
      && question.alternativas.some((option) => option.id === question.respostaCorreta)
      && typeof question.explicacao === 'string';
  }

  async function loadQuestions() {
    if (!questionPromise) {
      questionPromise = (async () => {
        const manifestResponse = await fetch('data/questions/manifest.json');
        if (!manifestResponse.ok) {
          throw new Error('Não foi possível carregar o manifesto do banco de questões.');
        }

        const manifest = await manifestResponse.json();
        if (!manifest || !Array.isArray(manifest.files) || manifest.files.length === 0) {
          throw new Error('O manifesto do banco de questões está vazio ou inválido.');
        }

        const questionSets = await Promise.all(manifest.files.map(async (file) => {
          if (typeof file !== 'string' || !/^[a-z0-9-]+\.json$/i.test(file)) {
            throw new Error(`Nome de arquivo inválido no manifesto: ${String(file)}`);
          }

          const response = await fetch(`data/questions/${file}`);
          if (!response.ok) {
            throw new Error(`Não foi possível carregar o arquivo de questões ${file}.`);
          }

          const questions = await response.json();
          if (!Array.isArray(questions) || !questions.every(isQuestion)) {
            throw new Error(`O arquivo ${file} contém questões em formato inválido.`);
          }
          return questions;
        }));

        const questions = questionSets.flat();
        const ids = new Set();
        for (const question of questions) {
          if (ids.has(question.id)) {
            throw new Error(`O identificador de questão "${question.id}" está duplicado.`);
          }
          ids.add(question.id);
        }
        return questions;
      })().catch((error) => {
        questionPromise = undefined;
        throw error;
      });
    }

    return questionPromise;
  }

  window.TI01MA_QUESTION_DATA = { loadQuestions };
})();
