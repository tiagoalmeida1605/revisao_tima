# Conteúdo Markdown

Este diretório guarda materiais didáticos em Markdown para a central de explicações.

## Estrutura

```text
content/
  README.md
  explanations/
    matematica/
      funcoes.md
      matrizes.md
    portugues/
      interpretacao-textual.md
    historia/
      diaspora-africana.md
```

## Como adicionar uma nova explicação

1. Crie uma pasta para a disciplina, se ela ainda não existir.
2. Crie um arquivo `.md` com o conteúdo em Markdown.
3. Registre o tópico em `assets/js/explanations.js` usando o campo `file` e `slug`.
4. Opcionalmente, adicione vídeos ao array `videos` para a explicação.
5. Mantenha os textos em linguagem didática e utilize links, listas e exemplos resolvidos.

## Modelo recomendado

```md
# Funções

## Introdução

Uma função relaciona cada valor de entrada com um único valor de saída.

## Conceitos fundamentais

- Domínio
- Imagem
- Gráfico

## Exemplos resolvidos

```python
print('Exemplo')
```
```

A renderização usa `marked` para converter Markdown e `DOMPurify` para sanitizar a saída. Os arquivos são carregados localmente e não dependem de CDN para funcionar.
