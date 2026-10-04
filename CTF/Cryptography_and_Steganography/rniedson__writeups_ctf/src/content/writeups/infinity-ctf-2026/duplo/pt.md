---
title: 'Duplo: Writeup completo'
description: '"Duplo" é o nome mais literal do lote: a exploração inteira é mandar a mesma informação duas vezes no mesmo pedido: uma parte do sistema olha pra primeira cópia, a outra usa a segunda, e ninguém tinha percebido a diferença.'
event: 'Infinity CTF 2026 (Harpia Security + SENAC)'
category: 'web'
subcategory: 'HTTP Parameter Pollution'
difficulty: 'medium'
tags:
  - http-parameter-pollution
pubDate: 2026-08-22
author: 'Niedson'
draft: false
---

> [!NOTE/Sobre o desafio]
> **Plataforma:** Infinity CTF 2026 (Harpia Security + SENAC)
> **Categoria:** Web · **Dificuldade:** Medium · **Pontos:** 282
> **Vulnerabilidades:** HTTP Parameter Pollution: validação e aplicação leem posições diferentes da mesma lista de parâmetros
> **Flag:** `flag{infinity_ctf_2026_duplo_1d50f3c87e}`

Este writeup mostra como um checkout simples: um endpoint que aplica cupom de desconto: caiu por
um bug clássico e barato de testar: mandar o **mesmo parâmetro duas vezes** numa URL. Se você nunca
ouviu falar de HTTP Parameter Pollution, vale a leitura: é uma das técnicas mais rentáveis pra testar
em qualquer API, porque custa segundos pra tentar e pode expor uma diferença de comportamento entre
duas partes do código que deveriam concordar sobre o valor de um campo: mas não concordam.

---

## 1. Contexto

O desafio "Duplo" é um app de checkout para parceiros de uma empresa fictícia. O fluxo principal é um
único endpoint HTTP:

```
GET /api/finalizar?valor=<valor>&cupom=<codigo>
```

Você informa um valor de pedido e um código de cupom, e a API responde se o pedido foi finalizado e
com que desconto. A home do app tinha um log "Pedidos recentes": uma lista de pedidos anteriores,
aparentemente só decorativa: mas era, na prática, a pista principal do desafio.

### 1.1. A primeira hipótese (e por que ela não foi por onde este writeup vai)

A descrição do desafio dizia algo como "checkout para parceiros integrados, aplique um cupom antes
de fechar o pedido". Lida de um certo jeito, essa frase soa como uma dica de **race condition** (ou
TOCTOU: _Time-Of-Check to Time-Of-Use_: quando existe uma janela de tempo entre o servidor
_checar_ uma condição e o servidor _usar_ o resultado dessa checagem, e um atacante consegue mudar o
estado nessa janela): por exemplo, aplicar o cupom e fechar o pedido em paralelo, torcendo pra o
servidor processar o desconto duas vezes, ou aceitar o fechamento antes de revalidar o cupom.

Vale registrar essa hipótese porque ela é um reflexo saudável diante da palavra "antes" numa
descrição de desafio: mas o nome do desafio ("Duplo") e o fato de o endpoint inteiro ser um único
`GET` sem nenhuma etapa "checar depois usar" separada (não existe um passo de "aplicar cupom" e
depois um passo distinto de "fechar pedido"; é tudo resolvido numa chamada só) já eram sinais de que
o vetor real era outro. A investigação abaixo confirma isso.

## 2. Reconhecimento

Olhando o log "Pedidos recentes" na home, um dos pedidos usava um cupom chamado
`FUNCIONARIO-INTERNO`, com uma nota ao lado dizendo algo como "ajuste RH" e desconto de **100%**.
Isso é um sinal claro: existe um cupom privilegiado, reservado pra uso interno, que não deveria estar
disponível pra um parceiro externo.

Testamos direto:

```
GET /api/finalizar?valor=100&cupom=FUNCIONARIO-INTERNO
```

Resposta: **"cupom inválido"**. Então o cupom existe (não é um erro genérico de "cupom não
encontrado"), mas alguma checagem específica está bloqueando esse código em particular: provavelmente
uma lista de cupons permitidos pra uso externo, ou uma flag de "restrito" no cadastro do cupom.

## 3. Encontrando a vulnerabilidade

A pergunta natural: **onde exatamente essa checagem acontece, e ela olha pro mesmo lugar que o
resto da aplicação usa pra aplicar o desconto?**

Em APIs construídas sobre frameworks web em Python (é o caso mais comum pra esse tipo de app leve),
quando você manda o MESMO parâmetro de **query string** (a parte da URL depois do `?`, no formato
`chave=valor&chave2=valor2`) duas vezes, o parser de query string (`urllib.parse.parse_qs`, por
exemplo: a função que separa essa string e transforma em um dicionário de valores) não descarta a
repetição: ele guarda TODOS os valores numa
lista, na ordem em que apareceram: `cupom=A&cupom=B` vira `{"cupom": ["A", "B"]}`.

O que cada trecho de código faz com essa lista, porém, pode ser diferente. Um trecho pode pegar só o
primeiro valor (`lista[0]`), pensando que só existe um parâmetro. Outro trecho, escrito por outra
pessoa ou em outro momento, pode pegar o último (`lista[-1]`). Se a **validação** usa uma posição e a
**aplicação do desconto** usa outra, dá pra colar um valor "de fachada" na posição que a validação
olha, e o valor real na posição que o resto do sistema usa.

> [!TIP/HTTP Parameter Pollution em uma frase]
> Sempre que uma API aceita um parâmetro repetido sem erro, vale testar se duas partes diferentes do
> backend leem posições diferentes dessa lista: é rápido de tentar e, quando funciona, costuma ser
> um bypass completo de validação.

## 4. Exploração

Testamos repetir o parâmetro `cupom`, colocando primeiro um cupom comum e válido (`BEMVINDO`) e
depois o restrito:

```
GET /api/finalizar?valor=100&cupom=BEMVINDO&cupom=FUNCIONARIO-INTERNO
```

Funcionou: o pedido foi finalizado com o desconto de 100% do cupom `FUNCIONARIO-INTERNO`. A
hipótese se confirmou: a camada de validação inicial olhou só o **primeiro** valor da lista
(`BEMVINDO`, um cupom legítimo, então passou), mas a lógica que de fato calcula o desconto usou o
**último** valor (`FUNCIONARIO-INTERNO`).

Testamos a ordem invertida pra confirmar que o comportamento é mesmo posicional e não, por exemplo,
"o primeiro cupom restrito que aparecer, não importa a posição":

```
GET /api/finalizar?valor=100&cupom=FUNCIONARIO-INTERNO&cupom=BEMVINDO
```

Essa ordem **falhou**: confirma que é mesmo uma questão de posição na lista, não de qual cupom
aparece.

Também testamos a sintaxe de array estilo PHP, comum em outros stacks:

```
GET /api/finalizar?valor=100&cupom[]=BEMVINDO&cupom[]=FUNCIONARIO-INTERNO
```

Não teve efeito: confirma que o parser por trás dessa API não é do tipo que trata `cupom[]`
especialmente; ele só empilha valores repetidos do mesmo nome de parâmetro (`parse_qs` puro).

## 5. Capturando a flag

Com o cupom `FUNCIONARIO-INTERNO` aplicado via parameter pollution, a resposta do endpoint incluiu a
flag:

```
flag{infinity_ctf_2026_duplo_1d50f3c87e}
```

## 6. Por que a aplicação era vulnerável (e como corrigir)

1. **A causa raiz não é "HTTP Parameter Pollution" em si**: é ter duas implementações separadas
   lendo o mesmo parâmetro da requisição sem uma única fonte de verdade. A correção certa não é só
   "bloquear parâmetros duplicados" (embora isso também ajude); é garantir que **só existe um lugar**
   no código que extrai o valor de `cupom` da requisição, e todo o resto do fluxo usa esse valor já
   resolvido: nunca relê a query string por conta própria em outro ponto do handler.
2. **Rejeitar explicitamente parâmetros duplicados em campos sensíveis** (cupom, preço, quantidade,
   qualquer coisa que afete valor monetário ou permissão) é uma defesa barata: se o framework web
   permite configurar isso globalmente ou por rota, vale ativar: um request com `cupom` duplicado
   deveria virar erro `400`, não uma ambiguidade que cada parte do código resolve do seu jeito.
3. **Escolher uma convenção única e documentá-la.** Se "o backend sempre usa o primeiro valor de um
   parâmetro repetido" for a regra, todo o código precisa seguir essa regra: inclusive código
   escrito depois, por outra pessoa, sem contexto da decisão original. Na prática isso quase sempre
   significa centralizar a extração de parâmetros numa única função/camada, nunca deixar handlers
   individuais chamarem o parser de query string diretamente.
4. **Testes de regressão para parâmetros críticos deveriam incluir o caso duplicado.** Um teste que
   só verifica "cupom válido funciona, cupom inválido falha" nunca captura esse bug: é preciso um
   terceiro caso de teste com o mesmo parâmetro repetido em ambas as ordens.

## 7. Lições para levar

- **Parâmetro repetido não é edge case raro: é uma técnica de teste barata.** Custa uma requisição
  extra e pode revelar que duas partes do sistema (validação e aplicação de regra de negócio) não
  concordam sobre qual valor usar. Vale testar em qualquer endpoint que decide algo sensível
  (desconto, preço, permissão, papel de usuário) a partir de um parâmetro de query string ou de
  formulário.
- **Nem toda pista textual aponta pro vetor certo.** A descrição sugeria fortemente uma race
  condition: vale sempre anotar e testar a primeira hipótese antes de descartá-la, mas não travar
  nela: o nome do desafio e a forma real do endpoint (uma chamada única, sem etapas separadas de
  "checar" e "usar") acabaram sendo pistas mais confiáveis que a descrição.
- **A causa raiz não é "HTTP Parameter Pollution" em si**: é ter duas implementações separadas lendo
  o mesmo parâmetro sem uma única fonte de verdade. A correção certa não é "bloquear parâmetros
  duplicados" (embora isso também ajude); é garantir que **só existe um lugar** no código que
  extrai o valor de `cupom` da requisição, e todo o resto do fluxo usa esse valor já resolvido: nunca
  relê a query string por conta própria.
- **Pistas visuais no app valem a pena.** O log "Pedidos recentes" não era decoração: foi o que
  revelou a existência do cupom `FUNCIONARIO-INTERNO` e seu desconto de 100%, sem o qual não haveria
  motivo pra sequer procurar esse vetor.

---

_Writeup do desafio Duplo (Infinity CTF 2026 · Web · Medium)._
