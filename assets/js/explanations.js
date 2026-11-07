(function () {
  'use strict';

  const explanatoryMap = {
    matematica: {
      title: 'Matemática',
      topics: [
        { slug: 'funcoes', title: 'Funções', file: 'content/explanations/matematica/funcoes.md', videos: [{ title: 'Funções e gráficos', channel: 'Mundo da Matemática', id: 'bgmH0Z5qVb8' }] },
        { slug: 'matrizes', title: 'Matrizes', file: 'content/explanations/matematica/matrizes.md', videos: [] }
      ]
    },
    portugues: {
      title: 'Português',
      topics: [
        { slug: 'interpretacao-textual', title: 'Interpretação textual', file: 'content/explanations/portugues/interpretacao-textual.md', videos: [{ title: 'Como interpretar textos', channel: 'Aula de Português', id: 'f_EK0JM7vHk' }] }
      ]
    },
    historia: {
      title: 'História',
      topics: [
        { slug: 'diaspora-africana', title: 'Diáspora africana', file: 'content/explanations/historia/diaspora-africana.md', videos: [{ title: 'História da escravidão e diáspora', channel: 'História em Foco', id: 'M6X0Zl4Q5YI' }] }
      ]
    }
  };

  const topicLookup = Object.entries(explanatoryMap).flatMap(([materia, data]) =>
    data.topics.map((topic) => ({ materia, subjectTitle: data.title, ...topic }))
  );

  function getCurrentTopic() {
    const params = new URLSearchParams(window.location.search);
    const materia = params.get('materia') || 'matematica';
    const topico = params.get('topico') || explanatoryMap[materia]?.topics[0]?.slug || 'funcoes';
    return { materia, topico };
  }

  function renderSidebar(activeMateria, activeTopic) {
    const sidebar = document.getElementById('topicSidebar');
    if (!sidebar) return;
    const html = Object.entries(explanatoryMap).map(([materia, data]) => {
      const items = data.topics.map((topic) => `
        <button type="button" class="topic-button ${topic.slug === activeTopic && materia === activeMateria ? 'is-active' : ''}" data-materia="${materia}" data-topic="${topic.slug}">
          ${data.title}: ${topic.title}
        </button>
      `).join('');
      return `
        <div class="meta-row">
          <span class="badge">${data.title}</span>
        </div>
        <div class="topic-list-buttons">${items}</div>
      `;
    }).join('');
    sidebar.innerHTML = html;

    sidebar.querySelectorAll('.topic-button').forEach((button) => {
      button.addEventListener('click', () => {
        const nextMateria = button.dataset.materia;
        const nextTopic = button.dataset.topic;
        const url = new URL(window.location.href);
        url.searchParams.set('materia', nextMateria);
        url.searchParams.set('topico', nextTopic);
        window.location.href = url.toString();
      });
    });
  }

  function renderVideos(videos) {
    const container = document.getElementById('videoList');
    if (!container) return;
    if (!videos || videos.length === 0) {
      container.innerHTML = '<div class="empty-video">Nenhuma aula em vídeo cadastrada para este tema ainda.</div>';
      return;
    }
    container.innerHTML = videos.map((video) => `
      <article class="video-card">
        <iframe
          src="https://www.youtube-nocookie.com/embed/${video.id}"
          title="${video.title}"
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerpolicy="strict-origin-when-cross-origin"
          allowfullscreen>
        </iframe>
        <div class="video-copy">
          <h4>${video.title}</h4>
          <p>${video.channel}</p>
        </div>
      </article>
    `).join('');
  }

  async function loadExplanation() {
    const { materia, topico } = getCurrentTopic();
    const topicData = explanatoryMap[materia]?.topics.find((item) => item.slug === topico);
    if (!topicData) {
      document.getElementById('explanationContent').innerHTML = '<p>Conteúdo ainda não disponível.</p>';
      return;
    }

    renderSidebar(materia, topico);
    document.getElementById('pageEyebrow').textContent = `${explanatoryMap[materia].title.toUpperCase()} · ${topicData.title.toUpperCase()}`;
    document.getElementById('pageHeading').textContent = topicData.title;

    try {
      const response = await fetch(topicData.file, { cache: 'no-store' });
      if (!response.ok) throw new Error('Arquivo não encontrado');
      const markdown = await response.text();
      const html = window.TI01MA_MARKDOWN.render(markdown);
      document.getElementById('explanationContent').innerHTML = html;
      renderVideos(topicData.videos || []);
    } catch (error) {
      document.getElementById('explanationContent').innerHTML = '<p>Não foi possível carregar este conteúdo didático.</p>';
      renderVideos([]);
      console.error(error);
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('explanationContent')) {
      loadExplanation();
    }
  });
})();
