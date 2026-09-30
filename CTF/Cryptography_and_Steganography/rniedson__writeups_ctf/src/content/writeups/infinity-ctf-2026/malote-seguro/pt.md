---
title: 'Malote Seguro: Writeup completo'
description: '"Malote Seguro" promete segurança em dobro: no nome e numa proteção de memória do próprio sistema. As duas caíram juntas: um erro clássico de gerenciamento de memória bastou pra desmontar essa proteção e sequestrar o controle do programa.'
event: 'Infinity CTF 2026 (Harpia Security + SENAC)'
category: 'pwn'
subcategory: 'Heap Exploitation'
difficulty: 'hard'
tags:
  - use-after-free
  - heap
  - safe-linking
pubDate: 2026-08-21
author: 'Niedson'
draft: false
---

> [!NOTE/Sobre o desafio]
> **Plataforma:** Infinity CTF 2026 (Harpia Security + SENAC)
> **Categoria:** Pwn/Heap (root) · **Dificuldade:** Hard · **Pontos:** 715 · **First blood**
> **Vulnerabilidades:** Use-After-Free + bypass de safe-linking (glibc 2.36) → sequestro de callback
> **Flag:** `flag{infinity_ctf_2026_malote_86a037fcc0}` (fixa nesta instância: o formato varia por desafio)

Malote Seguro foi o desafio de heap do CTF, e o primeiro a cair (first blood). Diferente dos overflow
de pilha dos outros `root` deste evento, aqui o alvo é o **alocador de memória dinâmica**: e a
"proteção" do próprio glibc moderno (safe-linking) vira, ironicamente, a peça que dá as coordenadas
exatas de onde atacar.

---

## 1. Contexto

O serviço simula um "malote seguro": você cadastra itens (com um campo de nome), remove itens, edita
itens, e chama um comando `diagnosticar`. Por baixo, cada item cadastrado é um bloco alocado
dinamicamente (heap): e a versão do glibc em uso (2.36) já vem com **safe-linking**, uma mitigação
específica contra o tipo de ataque que vamos fazer aqui.

> [!NOTE/O que é safe-linking, rapidamente]
> Antes do safe-linking, listas de blocos de heap livres (`tcache`/`fastbin`: estruturas internas do
> glibc que guardam, numa lista encadeada, os blocos que já foram liberados e podem ser reaproveitados
> na próxima alocação) guardavam o ponteiro pro **próximo bloco livre** em texto puro: se um bug (tipo Use-After-Free) deixasse o atacante
> editar esse ponteiro, dava pra apontar a próxima alocação pra **qualquer endereço de memória**. O
> safe-linking ofusca esse ponteiro com XOR contra a própria posição dele na memória
> (`ponteiro_real XOR (endereço_do_slot >> 12)`), então editar o ponteiro "às cegas" corrompe tudo: > **a menos que você já saiba o endereço do slot**, e aí a ofuscação vira reversível.

## 2. Reconhecimento

O fluxo de comandos do "malote" é o típico de desafio de heap (cadastrar/remover/editar/diagnosticar: o esqueleto clássico de um "heap note challenge"). O ponto de partida é sempre o mesmo: existe
algum bug de **Use-After-Free** (usar um bloco depois de já tê-lo liberado)? A resposta veio ao
remover um item e, em seguida, ainda conseguir **editar** o conteúdo daquele slot: o programa não
invalida a referência depois do `remover`.

## 3. Encontrando a vulnerabilidade

Com o UAF confirmado, o plano de ataque em heap moderno com safe-linking segue um roteiro conhecido:

1. **Cadastrar dois itens, A e B.** Ao listar/consultar os itens depois, os ponteiros retornados
   (que deveriam ser opacos) vazam os endereços ofuscados dos slots: `L_A` e `L_B`.
2. **Remover os slots 0 e 1** (A e B): mas o programa **não zera o conteúdo do slot ao remover**,
   só marca como livre. É exatamente esse "não zerar" que abre a porta pro próximo passo.
3. **Editar o slot 1 (que era o B)** escrevendo, no lugar do ponteiro "próximo livre" que o alocador
   guarda ali, o valor `(L_B >> 12) XOR endereco_alvo`: onde `endereco_alvo` é o endereço de um
   **callback de auditoria** (`audit_cb`) que o programa chama em algum ponto, `0x4040f0`. Como já
   temos `L_B` vazado do passo 1, essa conta desfaz a ofuscação do safe-linking na hora de escrever: o alocador vai "acreditar" que o próximo bloco livre está no endereço de `audit_cb`.

> [!TIP/Por que isso funciona: XOR é a própria reversão]
> Safe-linking ofusca com XOR porque XOR é **auto-inverso**: `A XOR B XOR B = A`. Se o atacante sabe
> o valor de `B` (aqui, `L_B >> 12`, o próprio endereço do slot deslocado), ele consegue calcular
> exatamente qual valor escrever para que, depois do glibc aplicar o XOR de volta na hora de alocar,
> o resultado seja o endereço que ele quer: nesse caso, `audit_cb`.

4. **Cadastrar um novo item C.** Isso consome o slot B do topo da lista de livres (realocando aquele
   bloco): e como o "próximo livre" foi trocado no passo 3, o **próximo** `cadastrar` depois deste
   vai entregar um bloco de memória que na verdade é o endereço de `audit_cb`.
5. **Cadastrar mais um item, com o campo "nome" igual aos bytes de `0x4012fb`** (o endereço da função
   `imprimir_flag` do próprio binário, escrito em **little-endian**: a ordem em que processadores
   x86-64 armazenam bytes na memória, do byte menos significativo para o mais significativo, então o
   número `0x4012fb` vira os bytes `\xfb\x12\x40` em sequência). Como esse cadastro está
   escrevendo dentro do slot que É o `audit_cb`, o `strncpy` do nome sobrescreve o próprio callback
   com o endereço de `imprimir_flag`.

## 4. Exploração

Resumindo a sequência de comandos:

```text
1. cadastrar A          -> vaza L_A na resposta
2. cadastrar B          -> vaza L_B na resposta
3. remover 0            (remove A, sem zerar o slot)
4. remover 1            (remove B, sem zerar o slot)
5. editar 1, valor = (L_B >> 12) XOR 0x4040f0      # desmascara o safe-linking, aponta pro audit_cb
6. cadastrar C           # consome o slot B do topo da lista, "prepara" o próximo cadastro
7. cadastrar nome = b"\xfb\x12\x40"   # escreve em cima do audit_cb -> vira imprimir_flag (0x4012fb)
8. diagnosticar           # chama audit_cb -> na verdade chama imprimir_flag
```

O comando `diagnosticar` executa algo equivalente a `call [audit_cb]` internamente: como esse
ponteiro agora aponta para `imprimir_flag`, é essa função que roda.

## 5. Capturando a flag

Ao rodar `diagnosticar` depois da sequência acima, o programa chama `imprimir_flag` no lugar do
callback de auditoria original, e a flag sai direto na resposta do serviço.

### 🚩 Flag

```
flag{infinity_ctf_2026_malote_86a037fcc0}
```

## 6. Lições

- **Use-After-Free vira perigoso quando o programa não zera memória ao "liberar".** A checagem que
  faltava aqui era simples: apagar o conteúdo do slot no momento do `remover`, não só marcá-lo como
  livre.
- **Safe-linking não é infalível: só exige um leak antes.** A mitigação assume que o atacante não
  sabe o endereço do slot; como o programa vazava esse endereço na hora de cadastrar, a ofuscação
  virou reversível.
- **Sequestrar um callback (function pointer, um ponteiro que o programa guarda e depois chama como
  função) é geralmente mais direto que sequestrar `rip` (o registrador que guarda qual instrução o
  processador vai executar em seguida) via pilha.** Se o programa já chama algo do tipo
  `(*callback)()` em algum ponto, esse ponteiro é um alvo natural para heap exploitation: não
  precisa de ROP (Return-Oriented Programming, a técnica de encadear pedaços de código já existentes
  no binário para montar uma execução arbitrária) nenhum.
- Correção: zerar blocos ao liberar (`explicit_bzero` antes do `free`), e não expor endereços de heap
  em nenhuma resposta ao usuário.

---

_Writeup do desafio Malote Seguro (Infinity CTF 2026 · Pwn/Heap · Hard)._
