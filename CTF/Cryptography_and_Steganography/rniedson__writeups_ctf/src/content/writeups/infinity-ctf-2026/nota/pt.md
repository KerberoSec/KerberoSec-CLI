---
title: 'Nota: Writeup completo'
description: '"Nota" é, literalmente, um app de anotações: e a ironia é dupla: a própria flag mora dentro de uma nota comum, que qualquer pessoa logada conseguia ler, mesmo sem nenhuma relação com quem criou aquela nota.'
event: 'Infinity CTF 2026 (Harpia Security + SENAC)'
category: 'web'
subcategory: 'IDOR'
difficulty: 'medium'
tags:
  - idor
pubDate: 2026-08-22
author: 'Niedson'
draft: false
---

> [!NOTE/Sobre o desafio]
> **Plataforma:** Infinity CTF 2026 (Harpia Security + SENAC)
> **Categoria:** Web · **Dificuldade:** Medium · **Pontos:** 287
> **Vulnerabilidades:** IDOR: leitura de recurso sem checar se pertence à sessão autenticada
> **Flag:** `flag{infinity_ctf_2026_nota_e0c2571fee}`

O writeup mais direto desse ciclo, e por isso um bom ponto de partida se você é novo em CTF: um
IDOR (Insecure Direct Object Reference) "de livro-texto": a aplicação verifica SE você está
autenticado, mas nunca verifica se o recurso que você está pedindo é seu.

---

## 1. Contexto

"Nota" é um app de anotações compartilhadas por workspace: cada equipe tem seu próprio espaço com
notas de texto. O fluxo de entrada:

```
POST /login
{"usuario": "<nome-do-workspace>"}
```

Repare: não existe campo de senha. Qualquer nome de workspace serve pra "entrar": a autenticação em
si já é intencionalmente fraca (provavelmente pra simplificar o desafio e concentrar a dificuldade
no vetor real), mas isso sozinho não é o bug principal do desafio.

## 2. Reconhecimento

A home, já logado com um workspace qualquer criado na hora, dava um exemplo de nome de nota:
`suporte-vip.txt`: um nome que soa deliberadamente como algo que não deveria ser público.

O endpoint de leitura de notas:

```
GET /notas/<titulo>.txt
```

## 3. Encontrando a vulnerabilidade

A pergunta de sempre num sistema "por workspace": **o servidor confere se a nota pedida pertence ao
workspace da sessão atual, ou só confere se existe ALGUMA sessão válida?**

Criamos um workspace qualquer, sem relação nenhuma com "suporte-vip", e pedimos a nota que a home
sugeriu:

```
POST /login
{"usuario": "workspace-qualquer-123"}

GET /notas/suporte-vip.txt
```

> [!TIP/A checagem que faltou]
> Um sistema multi-tenant (várias equipes/workspaces isolados) correto precisa checar DUAS coisas
> em cada leitura: (1) existe uma sessão válida, e (2) o recurso pedido pertence ao mesmo tenant
> dessa sessão. Aqui só a primeira checagem existia: qualquer sessão autenticada, de qualquer
> workspace, conseguia ler qualquer nota de qualquer outro workspace.

## 4. Exploração

A resposta ao `GET /notas/suporte-vip.txt`, mesmo autenticado com um workspace completamente
diferente, devolveu o conteúdo da nota normalmente: sem nenhum erro de permissão:

```
POST /login
Content-Type: application/json

{"usuario": "workspace-qualquer-123"}

→ 200 OK, Set-Cookie: session=<...>

GET /notas/suporte-vip.txt
Cookie: session=<...>

→ 200 OK
flag{infinity_ctf_2026_nota_e0c2571fee}
```

Não foi necessário nenhum bypass adicional além de estar logado com QUALQUER workspace: a
"vulnerabilidade" e a "exploração" são, literalmente, a mesma requisição: não existe um segundo
passo de escalada como nos outros desafios deste ciclo.

## 5. Capturando a flag

O conteúdo da nota `suporte-vip.txt` era a flag:

```
flag{infinity_ctf_2026_nota_e0c2571fee}
```

## 6. Por que a aplicação era vulnerável (e como corrigir)

A causa raiz é a ausência completa de uma checagem de posse (ownership) no endpoint de leitura: ele
verifica apenas "existe uma sessão válida", nunca "essa nota pertence a essa sessão".

1. **Toda leitura/escrita de um recurso "pertencente a alguém" precisa incluir explicitamente a
   condição de posse na consulta**: algo equivalente a
   `WHERE titulo = ? AND workspace = <workspace da sessão>`: nunca assumir que o identificador do
   recurso na URL já implica posse.
2. **Autenticação não deveria, por si só, já valer como autorização.** Mesmo que a autenticação
   fosse mais robusta (com senha de verdade), o bug continuaria existindo enquanto o servidor não
   checasse dono do recurso: os dois problemas são independentes e a correção de um não resolve o
   outro.
3. **Fortalecer o login (exigir senha real) reduziria o alcance do ataque, mas não o eliminaria.**
   Um atacante com uma conta legítima em qualquer workspace ainda conseguiria ler notas de outros
   workspaces até a checagem de posse ser implementada.

## 7. Lições

- **Autenticação (você é alguém?) e autorização (você pode acessar ESTE recurso específico?) são
  checagens diferentes, e um sistema precisa das duas.** É comum um endpoint verificar só a
  primeira e assumir, incorretamente, que "estar logado" já implica "só posso ver o que é meu".
- **Nomes de recursos previsíveis ou sugeridos na própria UI reduzem drasticamente o esforço de um
  IDOR.** Se o nome do arquivo/nota fosse um identificador aleatório e não-adivinhável, o bug de
  autorização continuaria existindo, mas explorá-lo exigiria descobrir o nome primeiro: o que já
  eleva a dificuldade real do ataque, mesmo sem corrigir a causa raiz.
- **IDOR costuma ser a primeira hipótese a testar** sempre que "estar logado" e "ser dono do
  recurso" parecem, na superfície, estar sendo tratados como a mesma coisa pela aplicação.
- **Em sistemas multi-tenant, todo endpoint de leitura/escrita de um recurso "pertencente a alguém"
  precisa incluir explicitamente `WHERE workspace = <workspace da sessão>` (ou equivalente) na
  consulta**: nunca confiar que o identificador do recurso na URL já implica posse.

---

_Writeup do desafio Nota (Infinity CTF 2026 · Web · Medium)._
