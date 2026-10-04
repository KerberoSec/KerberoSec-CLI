---
# Título do writeup como vai aparecer no site.
title: 'Nome do Desafio: Writeup completo'

# Resumo de 1-2 frases (aparece no card da listagem, no <meta description> e no compartilhamento).
description: 'Resumo curto da vulnerabilidade e da solução.'

# Nome do CTF/plataforma que organizou o desafio (aparece como filtro "Organizadora").
event: 'Nome do CTF'

# Categoria: precisa ser exatamente um destes valores (em inglês, minúsculo):
# web | pwn | reverse | crypto | forensics | misc | osint | hardware
category: 'web'

# Subcategoria: opcional, texto livre. É a classe de vulnerabilidade específica dentro da
# categoria (aparece agrupada por categoria no filtro lateral: Web > IDOR, Web > XXE, Pwn > ROP...).
# Use um nome curto e reconhecível: IDOR, XXE, SSTI, JWT, Path Traversal, Buffer Overflow,
# Format String, Heap Exploitation, RSA, etc. Se não souber/não fizer sentido, apague esta linha.
subcategory: 'IDOR'

# Dificuldade: opcional. Se não souber/não fizer sentido, apague esta linha.
# easy | medium | hard
difficulty: 'easy'

# Tags livres (aparecem como filtro "Tema" e como #hashtags no rodapé do writeup).
# Use kebab-case, sem acento: sql-injection, jwt, race-condition, etc.
tags:
  - tag-um
  - tag-dois

# Data de publicação (formato AAAA-MM-DD). É o que ordena a listagem e aparece como filtro "Mês".
pubDate: 2026-01-01

# Opcional: só inclua se o writeup for atualizado depois de publicado.
# updatedDate: 2026-01-05

# Seu nome (aparece no card, no topo do writeup e no filtro "Autor"). Campo obrigatório.
author: 'Seu Nome'

# true esconde o writeup do site (listagem, RSS, sitemap) sem apagar o arquivo: # útil pra escrever aos poucos antes de publicar. Mude pra false quando terminar.
draft: true
---

> [!NOTE/Sobre o desafio]
> **Plataforma:** Nome do CTF
> **Categoria:** Web · **Dificuldade:** Easy · **Pontos:** 100
> **Vulnerabilidades:** liste aqui, em uma frase
> **Flag:** `FLAG{...}` (ou "dinâmica: muda a cada instância", se for o caso)

Um parágrafo curto de abertura: para quem é este writeup, o que o leitor vai entender ao final.

---

## 1. Contexto

Explique o que é o desafio, o que a aplicação/binário/serviço faz, e o que o alvo parece oferecer
antes de qualquer exploração.

## 2. Reconhecimento

Como você mapeou o alvo: endpoints, funcionalidades, código-fonte disponível, banners, etc. Mostre
comandos e saídas reais em blocos de código.

```bash
comando-que-voce-rodou --com-flags
```

## 3. Encontrando a vulnerabilidade

O raciocínio até identificar a falha. Se fizer sentido, separe hipóteses testadas (inclusive as que
não deram certo: isso ajuda quem está aprendendo).

> [!TIP/Uma sacada importante]
> Use este tipo de bloco para destacar um insight-chave que o leitor não pode perder. Outros tipos
> disponíveis: `[!NOTE]` (informação de apoio), `[!IMPORTANT]` (ponto crucial), `[!WARNING]` e
> `[!CAUTION]` (avisos). Dá pra dar um título próprio como acima (`[!TIP/Título aqui]`).

## 4. Exploração

O payload/exploit passo a passo, com os comandos e o resultado de cada etapa.

```json
{
  "exemplo": "de payload ou resposta da API"
}
```

## 5. Capturando a flag

Como a flag foi obtida e qual é o resultado final (você pode ocultar a flag real e mostrar só o
formato, se a plataforma pedir sigilo).

## 6. Lições

O que fica de aprendizado geral: a causa raiz da vulnerabilidade e como ela poderia ser evitada.

---

_Writeup do desafio [Nome do Desafio] ([Nome do CTF] · Categoria · Dificuldade)._
