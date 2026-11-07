# 1TIMA · Portal de Estudos

Portal estático educativo para a turma TI01MA, com foco em organização acadêmica, revisão de conteúdos e prática em simulados locais.

## Objetivo

O projeto foi reestruturado para funcionar como um guia de estudos profissional, responsivo e acessível, mantendo a identidade visual da marca 1TIMA com foco em educação, organização e leitura.

## Estrutura do diretório

```text
.
├── README.md
├── index.html
├── agenda.html
├── materias.html
├── questoes.html
├── explicacoes.html
├── fontes.html
├── vercel.json
├── assets/
│   ├── css/
│   │   ├── tokens.css
│   │   ├── base.css
│   │   ├── layout.css
│   │   ├── components.css
│   │   ├── pages.css
│   │   ├── questions.css
│   │   ├── explanations.css
│   │   ├── responsive.css
│   │   └── styles.css
│   ├── js/
│   │   ├── brand-config.js
│   │   ├── theme.js
│   │   ├── navigation.js
│   │   ├── home.js
│   │   ├── agenda.js
│   │   ├── materias.js
│   │   ├── questions.js
│   │   ├── explanations.js
│   │   ├── markdown.js
│   │   └── ...
│   ├── vendor/
│   │   ├── marked.min.js
│   │   ├── purify.min.js
│   │   └── LICENSES.md
│   └── img/
│       ├── brand/
│       └── mascots/
├── content/
│   ├── README.md
│   └── explanations/
│       ├── matematica/
│       ├── portugues/
│       └── historia/
├── data/
│   └── questions/
│       ├── matematica.json
│       ├── portugues.json
│       ├── literatura.json
│       ├── biologia.json
│       ├── historia.json
│       ├── geografia.json
│       ├── fisica.json
│       ├── quimica.json
│       └── ingles.json
└── .
```

## Como executar localmente

Na raiz do projeto, rode:

```bash
python3 -m http.server 5500
```

Depois abra:

```text
http://localhost:5500
```

Use um servidor HTTP local em vez de abrir os arquivos diretamente com `file://` porque a página de questões faz leitura de arquivos locais via fetch e o navegador exige origem HTTP.

## Como publicar na Vercel

1. Importe o repositório no painel da Vercel.
2. Selecione o framework como `Other`.
3. Deixe o build command vazio.
4. Defina `Output Directory` como `.`.
5. Publique.

O arquivo `vercel.json` mantém URLs limpas e a publicação em modo estático.

## Como adicionar uma disciplina

1. Atualize a navegação e o resumo da página inicial, se necessário.
2. Acrescente a nova disciplina na página `materias.html`.
3. Registre a disciplina dentro do filtro do simulador em `assets/js/questions.js`, caso precise de novas entradas de banco.
4. Se for uma disciplina com explicações em Markdown, crie o arquivo em `content/explanations/...` e registre o tema em `assets/js/explanations.js`.

## Como adicionar uma questão

1. Crie ou edite o arquivo JSON correspondente em `data/questions/`.
2. Mantenha o formato da estrutura:

```json
{
  "id": "mat-103",
  "materia": "Matemática",
  "assunto": "Funções",
  "dificuldade": "media",
  "origem": "AUTORAL",
  "instituicao": "TI01MA",
  "ano": 2026,
  "numero": 10,
  "tipo": "autoral",
  "enunciado": "Texto da questão",
  "alternativas": [
    { "id": "A", "texto": "Alternativa A" },
    { "id": "B", "texto": "Alternativa B" },
    { "id": "C", "texto": "Alternativa C" },
    { "id": "D", "texto": "Alternativa D" }
  ],
  "respostaCorreta": "C",
  "explicacao": "Explicação da alternativa correta.",
  "fonteUrl": "https://example.com",
  "statusRevisao": "revisada",
  "licenca": "autoral"
}
```

3. Use somente materiais próprios ou licenças adequadas; nunca invente questões como se fossem provas oficiais.

## Como cadastrar uma fonte

As fontes oficiais ficam na página `fontes.html`.

Para incluir uma nova referência:

```html
<article class="source-card">
  <span class="source-tag">SIGLA</span>
  <h3>Nome da instituição</h3>
  <p>Descrição da fonte.</p>
  <a href="https://exemplo.com" target="_blank" rel="noopener noreferrer">Abrir site ↗</a>
</article>
```

Use `target="_blank"` e `rel="noopener noreferrer"` em todos os links externos.

## Como adicionar uma explicação Markdown

1. Crie a pasta da disciplina em `content/explanations/`.
2. Adicione o arquivo `.md` com conteúdo em Markdown.
3. Registre a página em `assets/js/explanations.js` com `slug`, `title` e `file`.
4. Opcionalmente, adicione vídeos em `videos`.

Exemplo de arquivo:

```md
# Funções

## Introdução

Uma função relaciona cada valor de entrada com um único valor de saída.

## Conceitos fundamentais

- Domínio
- Imagem
- Gráfico

## Exemplos resolvidos

```text
f(x) = 2x + 3
f(1) = 5
```
```

## Como cadastrar um vídeo

Cada explicação pode incluir uma lista de vídeos em metadados do arquivo JavaScript. A embed usa `youtube-nocookie.com` com carregamento lazy e a URL do vídeo é montada pelo script.

Exemplo:

```js
videos: [{
  title: 'Funções e gráficos',
  channel: 'Mundo da Matemática',
  id: 'bgmH0Z5qVb8'
}]
```

## Como substituir o logo

O caminho do logo principal está centralizado em `assets/js/brand-config.js`.

```js
window.TI01MA_BRAND = {
  logo: 'assets/img/brand/1tima-logo-horizontal.svg',
  symbol: 'assets/img/brand/1tima-raven-symbol.svg',
  ravenStudy: 'assets/img/mascots/raven-27-study.png',
  ravenTech: 'assets/img/mascots/raven-27-tech.png'
};
```

Se os arquivos não existirem, o portal usa uma alternativa tipográfica em vez de quebrar a interface.

## Como substituir as imagens do Raven

Também ficam centralizadas em `assets/js/brand-config.js`. O script verifica se o arquivo existe antes de carregar. Caso o arquivo esteja ausente, o sistema usa um fallback textual sem expor imagem quebrada no layout.

## Como configurar os temas

O tema é gerenciado por `assets/js/theme.js` e salvo no `localStorage` com as chaves:

```js
localStorage.setItem('ti01ma-theme', 'dark');
```

A aplicação respeita `prefers-color-scheme` na primeira visita e mantém o modo claro/escuro em todas as páginas.

## Marcação e sanitização de Markdown

A renderização usa `marked` para converter o conteúdo e `DOMPurify` para sanitizar a saída HTML. Os arquivos da biblioteca local são carregados de `assets/vendor/` e não dependem de CDN para funcionar em produção.

## Licenças e dependências locais

As bibliotecas usadas em `assets/vendor/` possuem versões e referências documentadas em `assets/vendor/LICENSES.md`.

## Validação

Antes de finalizar,

- revise todos os HTMLs para links e caminhos corretos;
- confirme que as páginas carregam em servidor HTTP;
- valide sintaxe JavaScript com `node --check`;
- confirme que o acervo local de questões funciona sem API externa;
- teste o tema claro/escuro e o layout mobile.
