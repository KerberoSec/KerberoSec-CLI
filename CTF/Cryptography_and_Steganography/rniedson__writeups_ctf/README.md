# writeups_ctf

Plataforma pública de writeups de CTF (Capture The Flag): [Astro](https://astro.build), Markdown,
GitHub Actions e GitHub Pages. Conteúdo trilíngue: **português**, **espanhol** e **inglês**.

Site publicado (após habilitar o deploy, veja [Deploy](#deploy)): `https://writeups.g01x5.com.br/`

## Arquitetura

- **Astro** (site estático, sem framework de UI: só `.astro` + CSS puro).
- **Content Collections** (`src/content.config.ts`) validam o frontmatter de cada writeup com Zod;
  frontmatter inválido quebra `astro check`/`astro build`.
- **i18n** via roteamento nativo do Astro (`astro.config.mjs`), com prefixo de idioma sempre presente
  (`/pt/`, `/es/`, `/en/`) e páginas dinâmicas em `src/pages/[locale]/...`: uma única página Astro
  cobre os três idiomas via `getStaticPaths`, em vez de triplicar arquivos.
- **Fallback de tradução**: se um writeup não tem versão num idioma, a rota daquele idioma existe
  mesmo assim e mostra o conteúdo em português com um aviso ("tradução pendente"). Lógica em
  `src/lib/writeups.ts`.
- **Sitemap** (`@astrojs/sitemap`, com tags `hreflang` por idioma) e **RSS** (`@astrojs/rss`, um feed
  por idioma em `/<locale>/rss.xml`).
- Realce de sintaxe via Shiki (embutido no Astro), com tema claro/escuro via toggle manual: **escuro
  é o padrão do site** (não segue `prefers-color-scheme`); claro só ativa se a pessoa escolher
  explicitamente (persistido em `localStorage`).
- **Imagem de compartilhamento (`og:image`) gerada por build**, uma por writeup e uma genérica por
  idioma, via `satori` + `@resvg/resvg-js` (`src/lib/og-image.ts`, endpoints `og.png.ts` e
  `[...slug].png.ts`). Fonte vendorizada em `src/assets/fonts/` (IBM Plex Mono, OFL).
- **Sumário lateral fixo** nos writeups (gerado a partir dos headings `##`/`###` que o próprio Astro
  já extrai do Markdown: sem parser extra), com **destaque da seção atual** conforme a rolagem
  (`IntersectionObserver`) e rolagem suave ao clicar. **Botão de copiar** em todo bloco de código, com
  numeração de linha e etiqueta da linguagem quando o bloco declara uma.
- **Busca client-side** na listagem de writeups (filtra por título/descrição/evento/categoria/tags,
  sem dependência nem índice: o conteúdo já está todo renderizado na página), com atalho `/` para
  focar o campo.
- **Badge de dificuldade** (campo opcional `difficulty` no frontmatter) e **ícone por categoria**.
- **Barra de progresso de leitura** fixa no topo dos writeups.
- **Tipografia de leitura**: corpo do texto em serifada (Lora, OFL: variável, vendorizada em
  `src/styles/fonts/`), títulos/UI continuam no sans-serif do sistema.
- **Callouts** (`> [!NOTE]`, `[!TIP]`, `[!IMPORTANT]`, `[!WARNING]`, `[!CAUTION]`: sintaxe padrão do
  GitHub) via `remark-github-blockquote-alert`, com título localizável por writeup
  (`[!TIP/Sacada do desafio]`) e cor por tipo.
- **A home é o catálogo completo**: sidebar de filtros (busca + categoria, dificuldade, organizadora
  do CTF: o campo `event`, autor, mês de publicação, tema/tag) sobre todos os writeups, tudo
  client-side (sem index nem dependência), com estado refletido na URL (`?tag=rce&category=web`, por
  exemplo) pra dar link direto de uma busca filtrada. `/writeups/` virou um redirect pra home;
  `/writeups/category/<categoria>/` e `/tags/<tag>/` continuam existindo como páginas estáticas à
  parte (bom pra SEO e link direto). `author` é campo obrigatório no frontmatter: o site é pensado
  pra ter vários autores diferentes, não só quem mantém o repositório.
- **Guia de publicação no próprio site** (`/<idioma>/guide/`, coleção `guides` em
  `src/content/guides/`) e **modelos de writeup** em [`templates/writeup/`](templates/writeup/)
  (`pt.md`/`es.md`/`en.md` com o frontmatter comentado campo a campo): ficam fora de
  `src/content/writeups/` de propósito, então nunca entram na validação de schema dos writeups reais.

```text
templates/writeup/              pt.md, es.md, en.md (frontmatter comentado) + imagens/ vazia: para
                                 duplicar ao começar um writeup novo (não é conteúdo do site)
src/
├── assets/fonts/               fonte do og-image (IBM Plex Mono, OFL)
├── components/                 Header, Footer, LanguageSwitcher, ThemeToggle, WriteupCard,
│                                CategoryIcon, DifficultyBadge, ReadingProgress
├── content/
│   ├── writeups/
│   │   └── <evento>/
│   │       └── <desafio>/
│   │           ├── pt.md      conteúdo em português
│   │           ├── es.md      conteúdo em espanhol (opcional até existir)
│   │           ├── en.md      conteúdo em inglês (opcional até existir)
│   │           └── imagens/   imagens referenciadas com caminho relativo no .md (otimizadas pelo Astro)
│   └── guides/
│       └── how-to-publish/    pt.md, es.md, en.md: o guia publicado em /<idioma>/guide/
├── layouts/                   BaseLayout (head/SEO/OG/tema), WriteupLayout, GuideLayout
├── i18n/                      dicionário de strings da UI (ui.ts) + helpers (utils.ts)
├── lib/
│   ├── writeups.ts             agrupamento de traduções + resolução de fallback
│   ├── guides.ts                mesma ideia, pra coleção guides
│   ├── og-image.ts              renderização das imagens de compartilhamento (satori + resvg)
│   ├── reading-time.ts
│   └── prose-enhancements.client.ts   TOC com scrollspy + botão de copiar (WriteupLayout e GuideLayout)
├── pages/
│   ├── index.astro            redireciona "/" -> "/pt/"
│   └── [locale]/
│       ├── index.astro        home = catálogo (busca + sidebar de filtros, client-side)
│       ├── guide.astro         guia de publicação (coleção guides)
│       ├── about.astro
│       ├── rss.xml.js
│       ├── og.png.ts          imagem de compartilhamento genérica do idioma
│       ├── tags/
│       └── writeups/
│           ├── index.astro    redireciona pra home (conteúdo migrou pra lá)
│           ├── category/[category].astro   página estática por categoria (link direto/SEO)
│           ├── [...slug].astro             página do writeup (evento/desafio)
│           └── [...slug].png.ts            imagem de compartilhamento do writeup
└── styles/
    ├── global.css              tokens de cor claro/escuro, tipografia, prosa
    └── fonts/                  fonte de leitura do corpo (Lora, OFL)
public/
└── writeups/<evento>/<desafio>/   arquivos para download linkados no writeup (ex.: solve.py)
```

Scripts de exploit para download (não são imagens) ficam em `public/writeups/<evento>/<desafio>/` e são
linkados no `.md` com caminho absoluto a partir da raiz do site (sem `base`: o site não usa mais
prefixo de caminho), ex.:

```md
baixar solve.py
```

## Pré-requisitos

- **Node.js >= 24** (definido em `package.json#engines`)
- **npm** (gerenciador do projeto: só existe `package-lock.json`; não misture com pnpm/yarn/bun)

## Instalação local

```sh
npm install
```

## Desenvolvimento

```sh
npm run dev       # http://localhost:4321
npm run build     # astro check && astro build -> ./dist
npm run preview   # serve o build de ./dist
npm run check     # só o type-check (astro check)
npm run format        # formata tudo com Prettier
npm run format:check  # confere formatação sem alterar arquivos
```

## Como adicionar um novo writeup

Guia completo, passo a passo, publicado no próprio site em **`/<idioma>/guide/`** (ex.:
`/pt/guide/`): é a fonte que fica atualizada conforme o projeto muda, então comece por ali.
Resumo rápido:

1. Duplique [`templates/writeup/`](templates/writeup/) para
   `src/content/writeups/<evento-slug>/<desafio-slug>/` (slugs em minúsculas, sem espaços/acentos: viram parte da URL). Os três arquivos de modelo (`pt.md`, `es.md`, `en.md`) já vêm com o
   frontmatter comentado campo a campo e uma pasta `imagens/` vazia.
2. Preencha o frontmatter. Campos obrigatórios: `title`, `description`, `event`, `category` (um dos
   valores de `CATEGORIES` em `src/consts.ts`), `pubDate`, `author`. Opcionais: `difficulty`,
   `updatedDate`, `tags`, `draft`. O nome do arquivo (`pt.md`/`es.md`/`en.md`) é o que define o
   idioma: não existe campo `lang`. Publicar só `pt.md` já funciona: as rotas `/es/`/`/en/` mostram
   a versão em português com aviso de tradução pendente até alguém traduzir.
3. Escreva o corpo em Markdown normal. Callouts do GitHub (`> [!TIP]`, `[!NOTE]`, `[!IMPORTANT]`,
   `[!WARNING]`, `[!CAUTION]`, com título opcional via `[!TIP/Título aqui]`) e imagens relativas
   (`./imagens/nome.png`) funcionam automaticamente; scripts para download vão em
   `public/writeups/<evento>/<desafio>/`.
4. `npm run check`: frontmatter inválido (categoria errada, `author` faltando, data mal formatada)
   quebra aqui antes mesmo de gerar o build.
5. `npm run dev` e confira em `http://localhost:4321/pt/writeups/<evento-slug>/<desafio-slug>/`.
6. Commit, push, PR. O workflow `CI` roda `astro check`, `format:check` e `build`. Depois do merge
   em `main`, o `Deploy to GitHub Pages` publica sozinho.

## Deploy

O deploy é automático via GitHub Actions (`.github/workflows/deploy.yml`) a cada push em `main`, ou
manualmente pela aba **Actions** do repositório (`workflow_dispatch`).

**Passo manual necessário uma única vez** (não foi feito por esta sessão: requer acesso às
configurações do repositório): em **Settings → Pages**, defina **Source: GitHub Actions**.

### URL esperada

`https://writeups.g01x5.com.br/`

### Domínio próprio

Já configurado: `site` em `astro.config.mjs` aponta para `https://writeups.g01x5.com.br` (sem `base`: o site vive na raiz do subdomínio) e `public/CNAME` tem o domínio. Falta o lado do GitHub/DNS
(nenhum dos dois passos abaixo foi feito por esta sessão: exigem acesso à conta):

1. No provedor de DNS de `g01x5.com.br`, aponte um registro `CNAME` de `writeups` para
   `rniedson.github.io`.
2. Em **Settings → Pages** do repositório, adicione `writeups.g01x5.com.br` como domínio customizado
   e habilite "Enforce HTTPS" quando o certificado for emitido (pode levar alguns minutos depois do
   DNS propagar).

Se o domínio próprio for removido no futuro, reverta `site` para
`https://rniedson.github.io`, adicione `base: '/writeups_ctf'` de volta em `astro.config.mjs` e
apague `public/CNAME`.

## Política de publicação responsável

- Publique um writeup **somente depois do encerramento do CTF** (ou conforme as regras específicas do
  evento: alguns permitem publicação imediata, outros não).
- Remova cookies de sessão, tokens de API, IPs internos de infraestrutura real e qualquer dado pessoal
  antes de publicar.
- Verifique a licença/termos da plataforma do CTF antes de redistribuir arquivos do desafio (binários,
  código-fonte, anexos): muitas plataformas proíbem redistribuição fora da competição.
- Não hospede malware funcional sem isolamento, aviso explícito e justificativa clara do propósito
  educacional.

## Decisões e suposições

- Repositório estava vazio: projeto Astro foi inicializado do zero (template `minimal`), não havia
  nada para preservar.
- `typescript@latest` resolveu para a major `7.0.2`, incompatível com o peer dependency de
  `@astrojs/check` (`^5 || ^6`): fixado em `6.0.3` (última estável da série 6).
- i18n implementado com o roteamento nativo do Astro (sem biblioteca extra) e fallback para português
  escrito à mão em `src/lib/writeups.ts`, já que o content layer do Astro não tem fallback de tradução
  embutido para content collections livres.
- Domínio próprio (`writeups.g01x5.com.br`) configurado em `site`/`public/CNAME`, sem `base`: falta
  só o CNAME no DNS e o domínio customizado em Settings → Pages, que exigem acesso à conta.
- Bandeiras no seletor de idioma: 🇧🇷 pt, 🇺🇸 en e, por pedido explícito, 🇲🇽 (México) para es em vez
  de 🇪🇸 (Espanha): mantém `aria-label`/`title` com o nome completo do idioma para acessibilidade.
- Fonte da imagem de compartilhamento (IBM Plex Mono, OFL: licença em
  `src/assets/fonts/OFL.txt`) escolhida por ter pesos estáticos Bold/Regular prontos; a maioria das
  fontes do Google Fonts hoje só distribui variável, que o satori não interpola bem.
- Tempo de leitura é uma estimativa simples (contagem de palavras do Markdown bruto, ~200 palavras/min,
  ignorando blocos de código): não usa nenhuma lib de NLP.
- Fonte do corpo do texto (Lora, OFL: licença em `src/styles/fonts/OFL.txt`) usada na variante
  variável (upright + itálico), diferente da mono do `og-image.ts`: aqui é CSS puro no navegador, não
  o satori, então o navegador interpola o peso sem precisar de arquivos estáticos por peso.
- O Astro 7 trocou o processador de Markdown padrão; plugins remark/rehype (usados pelos callouts)
  exigem instalar `@astrojs/markdown-remark` à parte: Astro avisa isso sozinho se faltar.
- Nenhum push/commit foi feito automaticamente: só o `git clone` inicial. Revisão e publicação ficam
  a cargo de quem revisar este trabalho (veja abaixo).

## Instruções para revisar e publicar

1. Revise o diff local em `projetos/writeups-ctf/writeups_ctf/` (`git status` / `git diff`).
2. Rode a validação completa: `npm ci && npm run check && npm run format:check && npm run build`.
3. Rode `npm run dev` e navegue pelo site localmente, incluindo os três idiomas.
4. Se estiver tudo certo, `git add`, `git commit` e `git push origin main` (a branch principal já
   existe e está vazia no remoto: o primeiro push cria o histórico).
5. Em **Settings → Pages**, defina **Source: GitHub Actions** (passo manual, feito uma única vez).
6. Configure o domínio próprio (DNS + domínio customizado em Settings → Pages: veja
   [Domínio próprio](#domínio-próprio)).
7. Acompanhe a aba **Actions**: o workflow `Deploy to GitHub Pages` deve rodar automaticamente após o
   push e publicar em `https://writeups.g01x5.com.br/`.
