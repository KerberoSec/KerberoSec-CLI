---
title: 'Como publicar um writeup'
description: 'Passo a passo para adicionar um novo writeup ao site pelo GitHub, do modelo até o ar.'
---

Este site é gerado a partir de arquivos Markdown guardados neste [repositório no
GitHub](https://github.com/rniedson/writeups_ctf). Não existe painel de administração: publicar um
writeup é criar (ou editar) arquivos, enviar pro GitHub e deixar a automação (GitHub Actions) cuidar
do resto. Qualquer pessoa com acesso ao repositório pode seguir este guia.

## 1. Preparar o ambiente local

Clone o repositório (só precisa fazer isso uma vez):

```bash
git clone git@github.com:rniedson/writeups_ctf.git
cd writeups_ctf
npm install
```

Antes de começar um writeup novo, crie uma branch a partir da `main` atualizada:

```bash
git checkout main
git pull
git checkout -b writeup/nome-do-desafio
```

## 2. Duplicar o modelo

Os arquivos de modelo ficam em [`templates/writeup/`](https://github.com/rniedson/writeups_ctf/tree/main/templates/writeup): `pt.md`, `es.md`, `en.md` e uma pasta `imagens/` vazia. Copie essa pasta inteira para dentro de
`src/content/writeups/`, com o nome do evento e do desafio em minúsculas e sem espaços (o caminho
vira parte da URL):

```bash
mkdir -p "src/content/writeups/<evento-slug>/<desafio-slug>"
cp templates/writeup/pt.md templates/writeup/es.md templates/writeup/en.md \
   "src/content/writeups/<evento-slug>/<desafio-slug>/"
cp -r templates/writeup/imagens "src/content/writeups/<evento-slug>/<desafio-slug>/"
```

Você não precisa preencher os três idiomas de uma vez: pode publicar só `pt.md` agora e traduzir
depois. Enquanto uma tradução não existir, o site mostra a versão em português nessa rota, com um
aviso de "tradução pendente".

## 3. Preencher o frontmatter

Cada arquivo `.md` começa com um bloco de metadados entre `---`. O modelo já vem com um comentário
explicando cada campo: os principais são:

| Campo         | O que é                                                                                                                                                         |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `title`       | Título exibido no site                                                                                                                                          |
| `description` | Resumo de 1-2 frases (aparece no card e ao compartilhar)                                                                                                        |
| `event`       | Nome do CTF/plataforma: vira o filtro "Organizadora"                                                                                                           |
| `category`    | `web`, `pwn`, `reverse`, `crypto`, `forensics`, `misc`, `osint` ou `hardware`                                                                                   |
| `subcategory` | Classe de vulnerabilidade dentro da categoria: texto livre, ex.: `IDOR`, `XXE`, `SSTI`, `JWT` (opcional, vira o filtro "Subcategoria", agrupado por categoria) |
| `difficulty`  | `easy`, `medium` ou `hard` (opcional)                                                                                                                           |
| `tags`        | Lista livre de temas: viram o filtro "Tema"                                                                                                                    |
| `pubDate`     | Data de publicação (`AAAA-MM-DD`)                                                                                                                               |
| `author`      | Seu nome: campo obrigatório, aparece no filtro "Autor"                                                                                                         |
| `draft`       | `true` esconde o writeup do site até você trocar pra `false`                                                                                                    |

> [!IMPORTANT/Frontmatter inválido quebra a build]
> Se `category` tiver um valor fora da lista, ou faltar um campo obrigatório como `author`, o build
> falha: tanto localmente (`npm run check`) quanto no GitHub Actions do pull request. É assim que o
> site garante que nenhum writeup mal formatado vá pro ar.

## 4. Escrever o conteúdo

Abaixo do frontmatter é Markdown normal. Alguns recursos que o site já suporta:

- **Callouts**: `> [!NOTE]`, `[!TIP]`, `[!IMPORTANT]`, `[!WARNING]` ou `[!CAUTION]` na primeira
  linha do bloco de citação, com título opcional (`[!TIP/Um título aqui]`).
- **Blocos de código com linguagem** (` ```json `, ` ```bash `, etc.) ganham realce de sintaxe,
  numeração de linha e botão de copiar automaticamente.
- **Imagens** vão na pasta `imagens/` ao lado do `.md` e são referenciadas com caminho relativo: `*[Image: texto alternativo]*`: o Astro otimiza o arquivo no build.
- **Arquivos para download** (scripts de exploit, por exemplo) vão em
  `public/writeups/<evento>/<desafio>/` e são referenciados com caminho absoluto a partir da raiz do
  site: `baixar solve.py`.

## 5. Testar localmente (recomendado)

```bash
npm run dev
```

Abra `http://localhost:4321/pt/writeups/<evento-slug>/<desafio-slug>/` e confira o resultado. Rode
também a validação completa antes de enviar:

```bash
npm run check
npm run format
npm run build
```

`npm run format` corrige a formatação automaticamente (Prettier); os outros dois só checam.

## 6. Commit, push e pull request

```bash
git add src/content/writeups/<evento-slug>/<desafio-slug>/
git commit -m "Add writeup: <nome do desafio>"
git push -u origin writeup/nome-do-desafio
```

Abra um pull request no GitHub da sua branch para `main`. O workflow de CI roda `astro check`,
`format:check` e `build` automaticamente: se algo passar batido localmente mas quebrar lá, o PR
mostra exatamente o quê.

## 7. Merge e publicação automática

Depois que o PR for aprovado e mesclado (_merge_) em `main`, o workflow `Deploy to GitHub Pages`
dispara sozinho e publica o site atualizado: sem nenhum passo manual. Acompanhe pela aba **Actions**
do repositório; em geral leva menos de um minuto.

---

Dúvidas sobre a estrutura do projeto? Veja o [`README.md`](https://github.com/rniedson/writeups_ctf#readme)
do repositório, que tem mais detalhes técnicos sobre arquitetura, deploy e política de publicação
responsável.
