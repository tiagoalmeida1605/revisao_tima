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

  function renderVideos(container, videos = []) {
    if (!videos.length) {
      container.replaceChildren(createElement('p', 'A aula em vídeo ainda não foi adicionada para este assunto.', 'empty-video'));
      return;
    }

    const cards = videos.map((video) => {
      if (!video || typeof video.title !== 'string' || typeof video.channel !== 'string' || typeof video.url !== 'string') {
        console.error('Metadados de vídeo inválidos; vídeo ignorado.');
        return null;
      }

      let embedUrl;
      try {
        const url = new URL(video.url);
        const isYoutube = ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be'].includes(url.hostname);
        const videoId = url.hostname === 'youtu.be'
          ? url.pathname.slice(1)
          : url.searchParams.get('v') || url.pathname.match(/^\/embed\/([A-Za-z0-9_-]+)/)?.[1];
        if (url.protocol !== 'https:' || !isYoutube || !videoId || !/^[A-Za-z0-9_-]+$/.test(videoId)) {
          throw new Error('URL do vídeo não é um endereço HTTPS reconhecido do YouTube.');
        }
        embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}`;
      } catch (error) {
        console.error(`Vídeo "${video.title}" ignorado:`, error);
        return null;
      }

      const card = createElement('article', '', 'video-card');
      const iframe = document.createElement('iframe');
      iframe.src = embedUrl;
      iframe.title = video.title;
      iframe.loading = 'lazy';
      iframe.referrerPolicy = 'strict-origin-when-cross-origin';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      iframe.allowFullscreen = true;

      const copy = createElement('div', '', 'video-copy');
      copy.append(createElement('h4', video.title), createElement('p', video.channel));
      const sourceLink = document.createElement('a');
      sourceLink.href = video.url;
      sourceLink.target = '_blank';
      sourceLink.rel = 'noopener noreferrer';
      sourceLink.textContent = 'Abrir vídeo original ↗';
      copy.appendChild(sourceLink);
      card.append(iframe, copy);
      return card;
    }).filter(Boolean);

    container.replaceChildren(...(cards.length
      ? cards
      : [createElement('p', 'Nenhum vídeo validado está disponível para este assunto.', 'empty-video')]));
  }

  function toSlug(value) {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase('pt-BR')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  async function renderRelatedQuestions(container, materia, topic) {
    try {
      const questions = await window.TI01MA_QUESTION_DATA.loadQuestions();
      const related = questions.filter((question) => (
        toSlug(question.materia) === materia && toSlug(question.assunto) === topic.slug
      ));

      const title = createElement('h3', 'Questões relacionadas');
      const section = createElement('section', '', 'related-questions');
      const list = createElement('ul', '', 'related-question-list');
      related.forEach((question) => {
        const item = createElement('li');
        item.append(
          createElement('span', question.enunciado),
          createElement('span', question.origem, 'badge')
        );
        list.appendChild(item);
      });

      const practiceLink = document.createElement('a');
      practiceLink.className = 'button button-secondary';
      practiceLink.href = related.length
        ? `questoes.html?materia=${encodeURIComponent(materia)}&topico=${encodeURIComponent(topic.slug)}`
        : `questoes.html?materia=${encodeURIComponent(materia)}`;
      practiceLink.textContent = related.length
        ? `Praticar ${related.length} questão(ões) relacionada(s)`
        : 'Abrir banco de questões';

      section.append(title);
      if (related.length) {
        section.append(list);
      } else {
        section.appendChild(createElement('p', 'Ainda não há questões locais cadastradas para este tema.'));
      }
      section.appendChild(practiceLink);
      container.replaceChildren(section);
    } catch (error) {
      container.replaceChildren(createElement('p', 'Não foi possível carregar as questões relacionadas.'));
      console.error('Falha ao carregar questões relacionadas.', error);
    }
  }

  async function loadExplanation() {
    const content = document.getElementById('explanationContent');
    const videoList = document.getElementById('videoList');
    const relatedQuestions = document.getElementById('relatedQuestions');
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
      renderVideos(videoList, topic?.videos);
      return;
    }

    eyebrow.textContent = `${subject.title.toLocaleUpperCase('pt-BR')} · ${topic.title.toLocaleUpperCase('pt-BR')}`;
    heading.textContent = topic.title;
    await renderRelatedQuestions(relatedQuestions, materia, topic);

    if (!topic.file) {
      content.replaceChildren(createElement('p', `A explicação de ${topic.title} está em preparação.`));
      renderVideos(videoList, topic.videos);
      return;
    }

    try {
      const response = await fetch(topic.file);
      if (!response.ok) throw new Error(`O arquivo de explicação retornou HTTP ${response.status}.`);
      const markdown = await response.text();
      const sanitizedHtml = window.TI01MA_MARKDOWN.render(markdown);
      content.innerHTML = sanitizedHtml;
      renderVideos(videoList, topic.videos);
    } catch (error) {
      content.replaceChildren(createElement('p', 'Não foi possível carregar esta explicação. Tente novamente mais tarde.'));
      renderVideos(videoList, topic.videos);
      console.error('Falha ao carregar explicação.', error);
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('explanationContent')) loadExplanation();
  });
})();
