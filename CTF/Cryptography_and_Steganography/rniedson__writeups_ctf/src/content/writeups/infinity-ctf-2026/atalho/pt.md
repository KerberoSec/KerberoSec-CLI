---
title: 'Atalho: Writeup completo'
description: '"Atalho" não é força de expressão: bastam 4 caracteres no fim do endereço: .css: pra o site achar que você está pedindo só uma imagem ou um estilo visual, e não a página protegida por trás dele.'
event: 'Infinity CTF 2026 (Harpia Security + SENAC)'
category: 'web'
subcategory: 'Cache Deception'
difficulty: 'medium'
tags:
  - cache-deception
  - auth-bypass
pubDate: 2026-08-22
author: 'Niedson'
draft: false
---

> [!NOTE/Sobre o desafio]
> **Plataforma:** Infinity CTF 2026 (Harpia Security + SENAC)
> **Categoria:** Web · **Dificuldade:** Medium · **Pontos:** 310
> **Vulnerabilidades:** Auth bypass por extensão estática ("cache/auth deception")
> **Flag:** `flag{infinity_ctf_2026_atalho_7791dad13f}`

Esse desafio resolve em uma linha de URL, mas o raciocínio por trás dela é o tipo de coisa que
aparece em pentest de verdade o tempo todo: **duas camadas diferentes olhando pra mesma URL e
discordando sobre o que ela é.** Vale a pena entender bem, porque essa mesma técnica (colar uma
extensão de arquivo estático no fim de uma rota protegida) funciona contra aplicações reais, não só
contra CTF.

---

## 1. Contexto

O app tinha uma rota `/relatorios/interno`: um painel que devolve dados sensíveis (relatórios
internos da empresa fictícia do desafio), e que exige sessão autenticada via **SSO** (_Single
Sign-On_: um login único e centralizado que várias aplicações da mesma empresa compartilham, em vez
de cada uma ter sua própria tela de senha: você loga uma vez no provedor de identidade e as outras
aplicações confiam nesse login).

O fluxo legítimo seria: fazer login pelo SSO, receber um cookie/token de sessão, e só então acessar
`/relatorios/interno`, que checa esse cookie antes de mostrar qualquer coisa. Sem sessão, a resposta
era um `403 Forbidden` seco (o código HTTP que significa "eu entendi seu pedido, mas você não tem
permissão"), sem margem pra engano: a rota claramente tinha um **gate de autenticação**: um ponto de
checagem, geralmente um _middleware_ (um pedaço de código que intercepta toda requisição antes dela
chegar na lógica final da rota) que decide se a requisição pode passar: na frente dela.

O nome do desafio já é uma pista e tanto: "Atalho". A pergunta certa não é "como eu quebro o SSO", é
"existe algum jeito de chegar no MESMO conteúdo por um CAMINHO diferente que não passe pelo gate?".

---

## 2. Conceito explicado do zero: por que um `.css` no fim de uma URL importa

Antes de testar qualquer coisa no alvo, vale entender **por que** essa ideia sequer faz sentido: ela vem de como aplicações web reais costumam ser montadas em camadas.

Um site moderno raramente é "um programa só". É comum ter, na frente da aplicação de verdade, uma ou
mais camadas de infraestrutura: um **proxy reverso**, um **CDN** (_Content Delivery Network_, uma
rede de servidores espalhados geograficamente que guarda cópias de arquivos pra entregar mais rápido)
ou um **cache**: cada uma dessas camadas existe para melhorar performance, e elas costumam ter uma
regra especial: **arquivos "estáticos"**: CSS, JavaScript, imagens, fontes: não mudam a cada
usuário, então não faz sentido gastar tempo rodando autenticação, banco de dados etc. só pra servir
um arquivo `.css`. Essas camadas frequentemente reconhecem esse tipo de arquivo **pela extensão do
nome** e tratam a requisição de um jeito mais direto/rápido, às vezes pulando etapas que uma rota
"de verdade" passaria.

O problema nasce quando duas camadas diferentes da mesma aplicação concordam em _quase_ tudo sobre
uma URL, menos numa regra: **o que conta como "arquivo estático"**. Se o middleware de autenticação
usa uma regra (ex.: "isso é uma rota protegida se o path bater exatamente com `/relatorios/interno`")
e o roteador da aplicação usa outra regra mais flexível (ex.: "se o path termina em `.css`, `.js` ou
similar, sirva como recurso auxiliar da rota correspondente"), existe uma **lacuna**: um path que uma
camada não reconhece como protegido, mas que a outra camada ainda entrega o conteúdo de.

Essa classe de bug tem até nome na literatura de segurança web: **web cache deception** / **static
extension auth bypass** ("engano de cache/autenticação via extensão estática"). A receita genérica é
sempre a mesma: pegue uma rota protegida, cole uma extensão de arquivo estático no final, e veja se o
conteúdo protegido volta sem autenticação.

> [!TIP/Por que isso não é "só sorte"]
> Esse bypass não depende de adivinhar nada: é uma pergunta binária e barata de testar em qualquer
> alvo: "essa rota se comporta diferente se eu colar `.css` no fim?". Por isso é um dos primeiros
> testes que vale rodar contra qualquer rota autenticada, mesmo fora de CTF.

---

## 3. Reconhecimento

Testando a rota sem sessão, do jeito óbvio:

```http
GET /relatorios/interno HTTP/1.1
Host: atalho-<instancia>.vm.harpiasecurity.com.br

HTTP/1.1 403 Forbidden
Content-Type: application/json

{"error": "Acesso negado. Faça login via SSO."}
```

Comportamento esperado: sem cookie de sessão, sem acesso. Até aqui, nada incomum: é exatamente o
que um gate de autenticação bem implementado deveria fazer.

A pergunta da seção anterior guiou o próximo teste: será que existe uma rota "irmã" que devolve o
mesmo conteúdo sem passar pelo mesmo gate? O nome do desafio ("Atalho") e a categoria do bug
(auth/cache deception) apontam direto pra hipótese de extensão estática.

---

## 4. Encontrando a vulnerabilidade

A ideia é simples de testar: e se eu pedir a mesma rota, só que fingindo que ela é um arquivo CSS?

```http
GET /relatorios/interno.css HTTP/1.1
Host: atalho-<instancia>.vm.harpiasecurity.com.br

HTTP/1.1 200 OK
Content-Type: application/json

{"relatorio": "...", "dados_internos": "..."}
```

Funcionou. Sem sessão, sem cookie, sem nada: só colar `.css` no final da URL. O mesmo teste repetido
em outra rota protegida da aplicação (`/relatorios/geral.css`) confirmou que não era coincidência: o
padrão se repete em qualquer rota sob `/relatorios/`.

Um detalhe que confirma o mecanismo exato: o `Content-Type` da resposta continuou sendo
JSON/HTML: **não** `text/css`. Ou seja, o servidor nunca tratou aquilo como um arquivo CSS de
verdade; ele devolveu exatamente o mesmo conteúdo protegido de sempre. Isso descarta a hipótese de
"existe um arquivo `.css` real com o mesmo nome" e confirma que é o **gate de autenticação** que está
sendo enganado, não a rota em si.

> [!TIP/A causa raiz]
> O middleware de autenticação faz o match **pelo path exato**: ele reconhece `/relatorios/interno`
> como "rota protegida" olhando pra essa string literal. Quando a URL vira
> `/relatorios/interno.css`, esse middleware simplesmente não reconhece mais o padrão e deixa passar
> (não é a rota que ele estava vigiando). Só que o roteador/handler da aplicação, mais adiante, é
> menos rígido: ele trata o sufixo `.css`/`.js` como decoração de um "ativo estático servido por
> outra camada" e devolve o handler de `/relatorios/interno` do mesmo jeito, ignorando a extensão.
> Ou seja: **o gate de auth e o roteador da aplicação têm regras diferentes pra decidir "o que é essa
> URL", e a extensão estática cai exatamente na lacuna entre as duas.**

---

## 5. Exploração

Não tem payload nenhum além da própria URL: é literalmente isso:

```bash
curl -i https://atalho-<instancia>.vm.harpiasecurity.com.br/relatorios/interno.css
```

Sem header de autenticação, sem cookie, sem corpo de requisição especial. Uma única requisição GET
anônima, com um sufixo de quatro caracteres colado no path, e o conteúdo protegido sai inteiro.

## 6. Capturando a flag

A flag estava no próprio conteúdo devolvido por `/relatorios/interno.css`:

```
flag{infinity_ctf_2026_atalho_7791dad13f}
```

---

## 7. Recapitulando a cadeia

```
1. /relatorios/interno exige sessão via SSO → 403 sem cookie (comportamento esperado)

2. Hipótese: middleware de auth e roteador da aplicação podem discordar sobre
   "o que é uma rota protegida" quando a URL parece um arquivo estático

3. Teste: /relatorios/interno.css
   → middleware não reconhece o path (não bate com a string exata vigiada) → deixa passar
   → roteador da aplicação trata ".css" como sufixo decorativo → serve o handler original mesmo assim
   → 200 OK com o conteúdo protegido, Content-Type continua JSON/HTML (não é um CSS de verdade)

4. Confirmado em outra rota (/relatorios/geral.css) → não é coincidência, é um padrão da aplicação

5. Flag estava no próprio corpo da resposta
```

---

## 8. Por que a aplicação era vulnerável (e como corrigir)

A causa raiz é a mesma de outros bugs "de borda" desse CTF: **duas partes do sistema decidindo, cada
uma com sua própria regra, o que uma mesma URL significa.**

1. **O gate de autenticação não deveria comparar o path como uma string isolada.** Ele precisa usar
   exatamente a mesma lógica de normalização/roteamento que a aplicação usa de verdade: idealmente
   rodando **depois** que a aplicação já decidiu qual rota/handler vai atender aquela URL, não antes.
2. **Nunca tratar sufixo de arquivo (`.css`, `.js`, `.json`, `.png`...) como sinal confiável de "isso
   é estático e não precisa de auth".** Se a aplicação realmente serve estáticos separadamente, eles
   deveriam estar fisicamente numa pasta/domínio diferente, nunca compartilhando o mesmo espaço de
   rotas que as páginas autenticadas.
3. **A correção "errada" e comum é tentar bloquear extensões específicas** (`.css`, depois `.js`,
   depois `.json`...): isso vira um jogo de gato-e-rato: sempre sobra alguma extensão não prevista.
   A correção de verdade elimina a lacuna entre as duas camadas, não os sintomas dela.
4. **Testar o próprio middleware com variações de path é parte do processo de hardening**: qualquer
   rota autenticada deveria ser testada com sufixos comuns antes de ir pra produção.

---

## 9. Lições para levar

- **"Path matching" e "roteamento" não são a mesma verificação**, mesmo quando parecem ser: cada
  camada da aplicação pode ter sua própria ideia de "o que é essa URL", e um atacante só precisa
  achar UM ponto onde essas ideias divergem.
- **Extensões de arquivo estático (`.css`, `.js`, `.png`...) são um vetor clássico chamado "cache/auth
  deception"** justamente porque servidores web reais costumam ter uma exceção de performance pra
  esse tipo de arquivo (não vale a pena rodar todo o pipeline de auth pra servir um CSS): e é fácil
  essa exceção vazar pra rotas que não deveriam ser tratadas como estáticas. Se você quiser praticar
  essa técnica em outro alvo, o teste mais simples é pegar qualquer rota protegida e tentar `.css`,
  `.js`, `.json`, `.png` e `.txt` no final do path, comparando sempre a resposta com e sem sessão.
- **Content-Type "errado" na resposta é uma pista valiosa.** Se você pediu algo terminado em `.css` e
  a resposta não é `text/css`, é sinal de que uma camada foi enganada: o servidor devolveu o
  conteúdo real de outra rota, não um arquivo estático de verdade.
- **A correção certa não é "bloquear .css"**: é fazer o gate de autenticação usar a MESMA lógica de
  normalização/roteamento que a aplicação usa de verdade, em vez de comparar a string do path
  isoladamente.

---

_Writeup do desafio Atalho (Infinity CTF 2026 · Web · Medium)._
