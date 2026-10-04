---
title: 'Esquema: Writeup completo'
description: '"Esquema" é literalmente a lista de informações que você pode escolher receber de volta: só que ninguém filtrou essa lista, e dava pra pedir informações internas que nunca deveriam estar disponíveis.'
event: 'Infinity CTF 2026 (Harpia Security + SENAC)'
category: 'web'
subcategory: 'Over-fetching'
difficulty: 'medium'
tags:
  - idor
  - over-fetching
pubDate: 2026-08-22
author: 'Niedson'
draft: false
---

> [!NOTE/Sobre o desafio]
> **Plataforma:** Infinity CTF 2026 (Harpia Security + SENAC)
> **Categoria:** Web · **Dificuldade:** Medium · **Pontos:** 249
> **Vulnerabilidades:** Over-fetching via parâmetro de seleção de campos sem whitelist
> **Flag:** `flag{infinity_ctf_2026_esquema_9215b8506e}`

Um dos bugs mais simples de explicar e mais fáceis de introduzir sem perceber: uma API que deixa o
cliente escolher **quais campos** quer de volta numa resposta, sem checar se algum desses campos é
sensível demais pra sair. Esse writeup mostra como isso vazou uma credencial inteira só de pedir.

---

## 1. Contexto

O desafio "Esquema" simula um sistema interno de funcionários. Existe um "diretório" acessível na
home do app, listando funcionários com seus ids: informação que parece inofensiva por si só. A API
por trás desse diretório é:

```
GET /api/funcionarios/<id>?campos=<lista-de-campos>
```

O parâmetro `campos` deixa o cliente pedir explicitamente quais atributos do funcionário quer na
resposta: um padrão comum em APIs que querem economizar banda, deixando o front-end pedir só o que
precisa em cada tela (às vezes chamado de "sparse fieldsets" ou "field selection", e é literalmente
a mesma ideia por trás de deixar o cliente escolher `?fields=id,nome` numa API REST ou escrever uma
query customizada num endpoint GraphQL: o servidor guarda um objeto inteiro internamente e devolve
só o pedaço que o cliente pediu).

A descrição do desafio já dava a dica em texto simples: algo como "a busca deixa você escolher quais
campos quer de volta". Isso, sozinho, já é o suficiente pra levantar a hipótese principal antes mesmo
de tocar no alvo: **será que existe uma lista de campos permitidos, ou o parâmetro aceita qualquer
nome de atributo que o objeto tiver internamente?**

## 2. Reconhecimento

O diretório de funcionários na home listava nome, cargo e id de cada pessoa: pensado como uma tela
de consulta comum, tipo um "quem é quem" da empresa. Entre os funcionários normais (atendimento,
vendas, financeiro), um se destacava por trabalhar em **TI/Infraestrutura**: um cargo que, por
natureza, costuma ter acesso a mais coisas no sistema do que um funcionário comum, o que o tornava um
alvo mais interessante de mirar primeiro.

Uma chamada básica na API por trás do diretório:

```
GET /api/funcionarios/42?campos=nome,cargo

→ 200 OK
{"nome": "...", "cargo": "Analista de Infraestrutura"}
```

devolvia exatamente `{"nome": "...", "cargo": "..."}`: confirma que o parâmetro `campos` controla
literalmente quais chaves aparecem no JSON de resposta, sem nenhuma outra transformação. Nenhuma
autenticação extra, nenhum token: só o id do funcionário (já visível no próprio diretório) e a lista
de campos desejada.

## 3. Encontrando a vulnerabilidade

A pergunta óbvia diante de um parâmetro assim: **existe alguma lista de campos permitidos, ou a API
devolve qualquer atributo que o modelo do funcionário tiver, sem checar se é apropriado expor?**

Testamos pedir um nome de campo que não aparecia em nenhuma tela do app, mas que soa como algo que
só um sistema de TI/suporte interno usaria: recuperação de acesso:

```
GET /api/funcionarios/42?campos=chave_recuperacao
```

> [!IMPORTANT/Sem whitelist é o bug inteiro]
> Não existe nada de exótico no ataque em si: é literalmente pedir um nome de campo que a gente
> chutou que poderia existir. O bug real é a AUSÊNCIA de uma lista de campos permitidos no backend:
> a API confia que o cliente só vai pedir campos "razoáveis", em vez de expor apenas um subconjunto
> fixo e seguro de atributos por padrão.

## 4. Exploração

A resposta confirmou que o campo existe e foi devolvido sem nenhuma checagem extra:

```json
{
  "chave_recuperacao": "..."
}
```

Não foi necessário nenhum bypass de autenticação, nenhuma injeção: só pedir o campo certo, no id
certo (o id do funcionário de TI, já visível no diretório da home).

## 5. Capturando a flag

O valor devolvido em `chave_recuperacao` era a flag:

```
flag{infinity_ctf_2026_esquema_9215b8506e}
```

## 6. Por que a aplicação era vulnerável (e como corrigir)

1. **A causa raiz é a ausência de uma whitelist (lista de permissão) de campos no backend.** A
   correção não é tentar adivinhar quais nomes de campo "parecem perigosos" e bloqueá-los um a um: é inverter a lógica: por padrão, nenhum campo sai, exceto os que estiverem explicitamente numa
   lista de campos seguros para aquele endpoint/perfil de quem está pedindo.
2. **A whitelist deveria variar por quem está perguntando, não só por endpoint.** Um painel de RH
   consultando o próprio sistema pode legitimamente precisar de campos que um "diretório público"
   nunca deveria expor: a mesma rota pode precisar de mais de uma lista de campos permitidos,
   dependendo do papel de quem autentica a chamada.
3. **Atributos sensíveis (chaves de recuperação, tokens, hashes, segredos de qualquer tipo) não
   deveriam viver no mesmo objeto/model que dados públicos como nome e cargo.** Separar dados
   sensíveis num objeto/tabela à parte, com seu próprio controle de acesso, é uma defesa em camadas:
   mesmo que a whitelist falhe de novo no futuro, um objeto separado limita o que pode vazar.
4. **Revisar esse tipo de endpoint sempre que o modelo de dados ganha um campo novo.** Como a
   superfície de ataque cresce silenciosamente (um campo novo no banco vira, automaticamente, um
   campo pedível via `?campos=`, a menos que a whitelist seja atualizada em conjunto), vale um
   processo: automatizado, se possível: que avise quando o modelo e a whitelist saem de sincronia.

## 7. Lições para levar

- **"Sparse fieldsets" (deixar o cliente escolher os campos) é uma feature legítima e comum, mas
  precisa de whitelist por endpoint/perfil de acesso.** Nunca basta filtrar campos "óbvios demais"
  como senha em texto puro: qualquer atributo interno (tokens, chaves de recuperação, flags de
  permissão) precisa estar numa lista explícita de "isso pode sair", não numa lista implícita de
  "isso não deveria sair, então não vou pedir".
- **Over-fetching é um tipo de IDOR "silencioso"** (IDOR = Insecure Direct Object Reference, ou
  "referência direta insegura a objeto": a classe de bug em que a API confia demais num id ou nome
  fornecido pelo cliente para decidir o que devolver, sem checar se aquilo deveria mesmo ser
  acessível): em vez de trocar um id na URL pra acessar o
  recurso de outra pessoa, você troca um nome de campo pra acessar um ATRIBUTO que não deveria ser
  visível: a superfície de ataque cresce com cada campo novo que o modelo de dados ganha ao longo do
  tempo, mesmo sem ninguém mexer no endpoint.
- **Leia a descrição do desafio como uma afirmação técnica.** "A busca deixa você escolher quais
  campos quer de volta" não era decoração: era literalmente a existência do parâmetro `campos` sendo
  anunciada. O mesmo hábito vale fora de CTF: changelogs, documentação de API e até tooltips da UI
  costumam denunciar features de seleção de campo que raramente têm whitelist implementada com
  cuidado.
- **Ids visíveis na UI (mesmo que "só de leitura") ajudam o atacante a mirar exatamente no alvo
  certo**: o diretório da home não precisava expor o id do funcionário de TI pra funcionar como
  diretório; bastava mostrar nome e cargo. Cargos que sugerem privilégio elevado (TI, infraestrutura,
  suporte interno, financeiro) são sempre o primeiro alvo a testar quando existe uma lista de
  pessoas visível.
- **Teste nomes de campo "adivinhados" por analogia**, não só os que aparecem na UI: se a tela
  mostra `nome` e `cargo`, vale tentar variações plausíveis do mesmo domínio (`senha`, `senha_hash`,
  `token`, `chave_recuperacao`, `email`, `telefone`, `permissoes`) mesmo sem nenhuma pista direta de
  que existem.

---

_Writeup do desafio Esquema (Infinity CTF 2026 · Web · Medium)._
