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
│   │   ├── question-data.js
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
│       ├── manifest.json
│       ├── matematica.json
│       ├── portugues.json
│       ├── literatura.json
│       ├── biologia.json
│       ├── historia.json
│       ├── geografia.json
│       ├── fisica.json
│       ├── quimica.json
│       └── ingles.json
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
3. Crie `data/questions/<disciplina>.json` e inclua o nome do arquivo em `data/questions/manifest.json`.
4. Registre os tópicos em `assets/js/explanations.js`. Para tópicos ainda sem material, deixe o campo `file` ausente para a interface indicar que a explicação está em preparação.
5. Se for uma disciplina com explicações em Markdown, crie um arquivo em `content/explanations/...` e registre o caminho no tópico correspondente.

## Como adicionar uma questão

1. Crie ou edite o arquivo JSON correspondente em `data/questions/`.
2. Mantenha o formato da estrutura:

```json
{
  "id": "mat-103",
  "materia": "Matemática",
  "assunto": "Funções",
  "origem": "AUTORAL",
  "tipo": "autoral",
  "enunciado": "Texto da questão",
  "alternativas": [
    { "id": "A", "texto": "Alternativa A" },
    { "id": "B", "texto": "Alternativa B" },
    { "id": "C", "texto": "Alternativa C" },
    { "id": "D", "texto": "Alternativa D" },
    { "id": "E", "texto": "Alternativa E" }
  ],
  "respostaCorreta": "C",
  "explicacao": "Explicação da alternativa correta."
}
```

3. Mantenha `origem` como `AUTORAL` para conteúdo autoral. Não informe instituição, ano, número ou URL de fonte quando esses dados não forem comprovados.
4. Inclua cada novo arquivo no `data/questions/manifest.json`. O carregador valida IDs únicos, campos, alternativas e gabarito.
5. Os simulados mostram apenas itens realmente cadastrados; não duplique questões para alcançar uma quantidade mínima.

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
4. Para assuntos ainda não disponíveis, registre apenas o tópico sem arquivo Markdown; a central mostrará “explicação em preparação”.

Exemplo de arquivo (as quatro crases externas preservam o bloco de código Markdown interno):

````md
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
````

## Vídeos complementares

Só cadastre vídeos depois de confirmar que o vídeo existe, que o título e o canal conferem e que ele corresponde ao assunto. Os vídeos anteriormente listados foram removidos após a verificação de que os três retornavam HTTP 404. Até haver referências verificadas, a página informa que ainda não há aula em vídeo.

Vídeos devem ser cadastrados como metadados do assunto e incorporados com `youtube-nocookie.com` e carregamento `lazy`; não reutilize um ID de exemplo ou não verificado.

## Como substituir o logo e o símbolo

Os campos de logo e símbolo estão preparados em `assets/js/brand-config.js` para quando os arquivos individuais oficiais forem adicionados. Eles não apontam para a prancha completa; enquanto os arquivos individuais não existem, a marca é exibida em texto e o favicon usa o arquivo existente `assets/img/ti01ma.svg`.

```js
window.TI01MA_BRAND = {
  logo: 'assets/img/brand/1tima-logo-horizontal.svg',
  symbol: 'assets/img/brand/1tima-raven-symbol.svg',
  ravenStudy: 'assets/img/Studious Canada Raccoon at Desk.png',
  ravenTech: 'assets/img/Focused Raccoon Tech Study Mascot.png'
};
```

Não substitua esses caminhos por uma imagem genérica ou pela prancha com várias marcas. Se o logo individual não existir, mantenha a alternativa tipográfica 1TIMA.

## Como substituir as imagens do Raven

Os caminhos Raven Study e Raven Tech apontam para as imagens existentes em `assets/img/` e ficam centralizados em `assets/js/brand-config.js`. O script verifica cada imagem antes de exibi-la; se um arquivo faltar, usa uma alternativa textual discreta e não deixa ícone quebrado.

## Como configurar os temas

O tema é gerenciado por `assets/js/theme.js` e salvo no `localStorage` com as chaves:

```js
localStorage.setItem('ti01ma-theme', 'dark');
```

A aplicação respeita `prefers-color-scheme` na primeira visita e mantém o modo claro/escuro em todas as páginas.

## Marcação e sanitização de Markdown

A renderização usa `marked` para converter o conteúdo e `DOMPurify` para sanitizar a saída HTML antes de inseri-la no DOM. As bibliotecas são carregadas de `assets/vendor/`; se uma delas não carregar, o conteúdo HTML não é inserido. Os dados das questões são renderizados como texto, nunca interpretados como HTML.

## Licenças e dependências locais

As bibliotecas usadas em `assets/vendor/` possuem versões e referências documentadas em `assets/vendor/LICENSES.md`.

## Estado do acervo e conteúdos

O acervo atual tem 17 questões autorais migradas da versão anterior, organizadas por disciplina. Cada item preserva o enunciado, as alternativas, o gabarito e o comentário de origem. Metadados de ano, instituição ou fonte não são preenchidos sem comprovação. O simulador limita a sessão ao total realmente disponível após os filtros e não duplica itens.

A central de explicações tem materiais Markdown para Matemática (Funções e Matrizes), Português (Interpretação textual) e História (Diáspora africana). Os demais tópicos correspondentes ao cronograma aparecem como em preparação. Não há vídeos cadastrados atualmente; referências antigas foram removidas após retornarem HTTP 404.

## Validação

Antes de finalizar alterações, valide JSON, JavaScript, URLs internas, anchors, caminhos de assets e IDs duplicados. Compare questões e gabaritos com as fontes de origem e confirme que os resultados não contêm duplicações. Teste o banco local, a renderização sanitizada do Markdown e as páginas em larguras mobile. Não marque uma verificação como aprovada sem executá-la.
