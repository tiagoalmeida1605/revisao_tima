(function () {
  'use strict';
  const agendaData = [
    { day: 'Segunda', date: '09/11', subjects: ['Português', 'Literatura'], href: 'materias.html#segunda' },
    { day: 'Terça', date: '10/11', subjects: ['Matemática', 'Biologia'], href: 'materias.html#terca' },
    { day: 'Quarta', date: '11/11', subjects: ['História', 'Geografia'], href: 'materias.html#quarta' },
    { day: 'Quinta', date: '12/11', subjects: ['Inglês'], href: 'materias.html#quinta' },
    { day: 'Sexta', date: '13/11', subjects: ['Física', 'Química'], href: 'materias.html#sexta' }
  ];

  document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('agendaList');
    if (!container) return;

    container.innerHTML = agendaData.map((item) => `
      <a class="schedule-card" href="${item.href}">
        <span class="schedule-day">${item.day.slice(0, 3).toUpperCase()}</span>
        <span class="schedule-date">${item.date.split('/')[0]}<span>/${item.date.split('/')[1]}</span></span>
        <span class="schedule-subjects">${item.subjects.map((subject) => `${subject}<br>`).join('')}</span>
        <span class="schedule-arrow">↗</span>
      </a>
    `).join('');
  });
})();
