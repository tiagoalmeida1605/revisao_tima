# TI01MA · Guia de Estudos

Site estático de revisão para a semana de avaliações do 4º bimestre (09 a 13 de novembro de 2026), organizado para a turma TI01MA.

## O que tem no site

- Calendário de avaliações por dia.
- Conteúdos organizados por disciplina, com tópicos expansíveis.
- Banco de questões do ENEM consultado sob demanda pela API comunitária `enem.dev`.
- Treino da TI01MA com 17 questões autorais e correção imediata.
- Links para acervos e provas anteriores.
- Tema claro e escuro, com preferência salva no navegador.
- Layout responsivo para celular, tablet e computador.
- Identidade visual tipográfica da TI01MA, sem mascote.

## Estrutura

```text
.
├── index.html
├── vercel.json
├── README.md
└── assets/
    ├── css/
    │   └── styles.css
    ├── img/
    │   └── ti01ma.svg
    └── js/
        ├── app.js
        ├── enem-api.js
        └── quiz-data.js
```

O projeto usa HTML, CSS e JavaScript puro. Não precisa de framework nem etapa de build.

## Executar localmente

Na pasta do projeto, rode:

```bash
python3 -m http.server 5500
```

Abra `http://localhost:5500` no navegador. O servidor local é recomendado porque a área do Banco ENEM consulta uma API externa com `fetch`.

## Publicar na Vercel

1. Envie o conteúdo desta pasta para a raiz de um repositório GitHub.
2. Na Vercel, importe o repositório em **Add New → Project**.
3. Use **Other** como Framework Preset.
4. Deixe Build Command vazio e defina Output Directory como `.`.
5. Publique o projeto.

O arquivo `vercel.json` mantém a publicação como site estático.

## Banco ENEM

A integração consulta `https://api.enem.dev/v1` no navegador:

- `GET /exams/{year}/questions?limit=200&offset=0`.
- Anos disponíveis no seletor: 2009 a 2023.
- O filtro de área é aplicado no navegador com base nos dados retornados.
- As consultas são feitas somente quando a pessoa clica em **Buscar questões**.
- O cache local dura 12 horas e o código espera entre chamadas para reduzir o risco de limite de taxa.

A API é comunitária e não é afiliada ao INEP/MEC. Gabaritos exibidos são os dados retornados pela API; confira a prova e o gabarito original do INEP quando precisar de validação.

## Conteúdo e procedência

- Datas e conteúdos escolares foram organizados a partir da sistemática e do cronograma fornecidos para a turma.
- Quando a sistemática não especifica capítulos, unidades ou obras, o guia sinaliza essa limitação em vez de inventar conteúdo.
- As questões do **Treino da TI01MA** são autorais e não são itens oficiais do ENEM ou de vestibulares.
- As questões do **Banco ENEM** são obtidas da API comunitária identificada acima.

## Tecnologias

HTML5, CSS3, JavaScript, Fetch API, localStorage e SVG.
