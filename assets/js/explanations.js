(function () {
  'use strict';

  const explanatoryMap = {
    matematica: {
      title: 'Matemática',
      topics: [
        { slug: 'funcoes', title: 'Funções', file: 'content/explanations/matematica/funcoes.md' },
        { slug: 'matrizes', title: 'Matrizes', file: 'content/explanations/matematica/matrizes.md' },
        { slug: 'geometria-analitica', title: 'Geometria analítica' },
        { slug: 'medidas-de-variabilidade', title: 'Medidas de variabilidade' }
      ]
    },
    portugues: {
      title: 'Português',
      topics: [
        { slug: 'interpretacao-textual', title: 'Interpretação textual', file: 'content/explanations/portugues/interpretacao-textual.md' },
        { slug: 'conectivos', title: 'Conectivos' },
        { slug: 'concordancia-nominal', title: 'Concordância nominal' }
      ]
    },
    literatura: {
      title: 'Literatura',
      topics: [
        { slug: 'romantismo-brasileiro', title: 'Romantismo brasileiro' }
      ]
    },
    biologia: {
      title: 'Biologia',
      topics: [
        { slug: 'desenvolvimento-embrionario', title: 'Desenvolvimento embrionário' },
        { slug: 'folhetos-embrionarios', title: 'Folhetos embrionários' }
      ]
    },
    historia: {
      title: 'História',
      topics: [
        { slug: 'absolutismo', title: 'Absolutismo' },
        { slug: 'mercantilismo-e-sistema-colonial', title: 'Mercantilismo e sistema colonial' },
        { slug: 'diaspora-africana', title: 'Diáspora africana', file: 'content/explanations/historia/diaspora-africana.md' },
        { slug: 'uniao-iberica-e-invasoes-holandesas', title: 'União Ibérica e invasões holandesas' }
      ]
    },
    geografia: {
      title: 'Geografia',
      topics: [
        { slug: 'densidade-demografica', title: 'Densidade demográfica' },
        { slug: 'eutrofizacao', title: 'Eutrofização' }
      ]
    },
    ingles: {
      title: 'Inglês',
      topics: [
        { slug: 'connectors', title: 'Connectors' }
      ]
    },
    fisica: {
      title: 'Física',
      topics: [
        { slug: 'alavancas', title: 'Alavancas' },
        { slug: 'empuxo', title: 'Empuxo' }
      ]
    },
    quimica: {
      title: 'Química',
      topics: [
        { slug: 'lei-de-lavoisier', title: 'Lei de Lavoisier' }
      ]
    }
  };

  function createElement(tagName, text, className) {
    const element = document.createElement(tagName);
    if (text) element.textContent = text;
    if (className) element.className = className;
    return element;
  }

  function getCurrentTopic() {
    const params = new URLSearchParams(window.location.search);
    const materia = params.get('materia') || 'matematica';
    const defaultTopic = explanatoryMap[materia]?.topics[0]?.slug || '';
    return { materia, topico: params.get('topico') || defaultTopic };
  }

  function renderSidebar(activeMateria, activeTopic) {
    const sidebar = document.getElementById('topicSidebar');
    if (!sidebar) return;

    const groups = Object.entries(explanatoryMap).map(([materia, data]) => {
      const heading = createElement('div', data.title, 'badge');
      const list = createElement('div', '', 'topic-list-buttons');
      data.topics.forEach((topic) => {
        const button = createElement(
          'button',
          topic.title,
          `topic-button${topic.slug === activeTopic && materia === activeMateria ? ' is-active' : ''}`
        );
        button.type = 'button';
        button.setAttribute('aria-current', String(topic.slug === activeTopic && materia === activeMateria));
        button.addEventListener('click', () => {
          const url = new URL(window.location.href);
          url.searchParams.set('materia', materia);
          url.searchParams.set('topico', topic.slug);
          window.location.assign(url);
        });
        list.appendChild(button);
      });

      const group = createElement('section', '', 'topic-group');
      group.append(heading, list);
      return group;
    });

    sidebar.replaceChildren(...groups);
  }

  function renderVideos(container) {
    const message = createElement('p', 'A aula em vídeo ainda não foi adicionada para este assunto.', 'empty-video');
    container.replaceChildren(message);
  }

  async function loadExplanation() {
    const content = document.getElementById('explanationContent');
    const videoList = document.getElementById('videoList');
    const eyebrow = document.getElementById('pageEyebrow');
    const heading = document.getElementById('pageHeading');
    const { materia, topico } = getCurrentTopic();
    const subject = explanatoryMap[materia];
    const topic = subject?.topics.find((item) => item.slug === topico);

    renderSidebar(materia, topico);

    if (!subject || !topic) {
      eyebrow.textContent = 'CENTRAL DE EXPLICAÇÕES';
      heading.textContent = 'Conteúdo não cadastrado';
      content.replaceChildren(createElement('p', 'Este assunto ainda não possui uma página cadastrada. Consulte Matérias para ver os conteúdos em preparação.'));
      renderVideos(videoList);
      return;
    }

    eyebrow.textContent = `${subject.title.toLocaleUpperCase('pt-BR')} · ${topic.title.toLocaleUpperCase('pt-BR')}`;
    heading.textContent = topic.title;

    if (!topic.file) {
      content.replaceChildren(createElement('p', `A explicação de ${topic.title} está em preparação.`));
      renderVideos(videoList);
      return;
    }

    try {
      const response = await fetch(topic.file);
      if (!response.ok) throw new Error(`O arquivo de explicação retornou HTTP ${response.status}.`);
      const markdown = await response.text();
      const sanitizedHtml = window.TI01MA_MARKDOWN.render(markdown);
      content.innerHTML = sanitizedHtml;
      renderVideos(videoList);
    } catch (error) {
      content.replaceChildren(createElement('p', 'Não foi possível carregar esta explicação. Tente novamente mais tarde.'));
      renderVideos(videoList);
      console.error('Falha ao carregar explicação.', error);
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('explanationContent')) loadExplanation();
  });
})();
