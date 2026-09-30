---
title: 'Orbita: Writeup completo'
description: '"Órbita" é algo que sobe e depois volta: uma primeira falha faz o sistema revelar, sem querer, um endereço interno de memória; uma segunda falha usa exatamente esse endereço pra assumir o controle do programa.'
event: 'Infinity CTF 2026 (Harpia Security + SENAC)'
category: 'pwn'
subcategory: 'ROP'
difficulty: 'hard'
tags:
  - format-string
  - buffer-overflow
  - rop
pubDate: 2026-08-21
author: 'Niedson'
draft: false
---

> [!NOTE/Sobre o desafio]
> **Plataforma:** Infinity CTF 2026 (Harpia Security + SENAC)
> **Categoria:** Pwn (root) · **Dificuldade:** Hard · **Pontos:** 662
> **Vulnerabilidades:** Format string (leak de endereço) → overflow de pilha → ROP para `system("/bin/sh")`
> **Flag:** `flag{infinity_ctf_2026_orbita_6d649a9471}` (fixa nesta instância: o formato varia por desafio)

Orbita é um serviço TCP/TLS binário: sem código-fonte, sem painel web, só um socket que aceita
comandos. É o tipo de desafio onde cada bug sozinho não te leva a lugar nenhum: um vaza um
endereço, o outro estoura um buffer, e a vitória é perceber que os dois juntos formam a exploração
completa.

---

## 1. Contexto

O binário do Orbita segue o "padrão da família" que apareceu em vários desafios `root` deste CTF:
No-PIE, NX ligado, sem canário de pilha, RELRO parcial. Essas quatro siglas são só nomes para
proteções de segurança que um binário pode (ou não) ter ligadas na hora da compilação: e saber
quais estão ausentes já diz muito antes de qualquer engenharia reversa:

- **PIE** (Position-Independent Executable) faria o binário carregar em um endereço de memória
  diferente a cada execução, como uma versão de ASLR para o próprio código do programa (não só para
  bibliotecas). **No-PIE** significa que essa proteção está desligada: todo endereço de função no
  binário é fixo, igual em toda execução. Não precisa vazar a base do binário, só usar os endereços
  direto do `objdump`/`readelf`.
- **Canário de pilha** é um valor secreto colocado entre as variáveis locais e o endereço de retorno;
  se um overflow sobrescrever esse valor, o programa percebe e aborta antes de desviar a execução.
  **Sem canário** significa que essa checagem não existe: um overflow de pilha pode sobrescrever o
  endereço de retorno sem ser detectado.
- **NX** (No-eXecute) é a proteção que marca a pilha como "não executável": mesmo que você consiga
  escrever código malicioso ali, o processador se recusa a rodá-lo. **NX ligado** aqui significa que
  não dá pra simplesmente injetar shellcode e executar direto na pilha; a exploração precisa reusar
  código que já existe dentro do próprio binário: a técnica chamada ROP (Return-Oriented
  Programming, encadear pequenos trechos de código já existentes, chamados "gadgets", para montar uma
  chamada de função inteira): ou usar `ret2libc` (pular direto para uma função já pronta na
  biblioteca padrão do sistema, como `system`).
- **RELRO** (RELocation Read-Only) protege certas tabelas internas do binário contra sobrescrita
  depois que o programa termina de carregar; aqui está só "parcial", o que deixa margem para algumas
  técnicas de exploração que não foram necessárias neste caso.

O serviço tem pelo menos dois comandos relevantes: um `handshake` inicial e um comando
`telemetria`. A ideia do nome do desafio ("órbita") sugere algo que "sobe" e depois "reentra": o
handshake antes da telemetria de verdade.

## 2. Reconhecimento

Sem binário disponibilizado publicamente (diferente de outros desafios `root` do mesmo CTF, cujos
binários vinham em `/uploads/<hash>/<nome>`), a exploração aqui foi feita **contra o serviço remoto
diretamente**, testando cada comando e observando o comportamento.

O `handshake` aceita uma entrada de texto livre e a devolve de volta formatada de algum jeito: o
sinal clássico de um bug de format string é justamente esse: quando a sua entrada aparece "processada"
de volta, e não só ecoada verbatim.

> [!TIP/Como reconhecer format string sem ver o código-fonte]
> Mande `%p %p %p` (ou `%x %x %x`) como entrada. Se a resposta trouxer valores hexadecimais em vez do
> texto literal `%p %p %p`, o seu input está sendo usado como **string de formato** de um `printf`
> (ou equivalente): e não como argumento. Isso significa que dá pra ler (e às vezes escrever) memória
> arbitrária do processo usando os especificadores `%N$p`/`%N$s`/`%N$n`.

## 3. Encontrando a vulnerabilidade

O handshake confirmou o padrão de format string. Como o binário é No-PIE, o objetivo natural é vazar
o endereço de uma função da libc (por exemplo `system`) para depois pular pra ela.

Quando um binário usa bibliotecas dinâmicas (como a `libc`, a biblioteca padrão do C), ele mantém uma
tabela interna chamada **GOT** (Global Offset Table) que guarda o endereço real de cada função
externa: endereço esse que só é descoberto em tempo de execução, por uma rotina interna chamada
`dlsym`. Ou seja: em algum ponto da pilha, o programa já tinha o endereço verdadeiro de `system`
guardado, resolvido dinamicamente pelo próprio processo: e um leak de format string consegue ler
esse valor como qualquer outro dado da pilha. Variando o índice do especificador posicional
(`%N$p`, onde `N` é a posição do argumento que você quer ler), o índice **6** deu o buffer de entrada
(confirmando o offset do format string), e o índice **24** (`%24$p`) devolveu o endereço de `system`
na libc.

```text
entrada:  %24$p
resposta: 0x7f3c1a2b3d40   (endereço real de system() nesta instância)
```

> [!IMPORTANT/Por que dois bugs, e não um só]
> Vazar `system` não executa nada sozinho: só te dá um endereço. Pra usar esse endereço, ainda
> precisa de um jeito de **redirecionar a execução** do programa pra lá. É aí que entra o segundo
> bug: o comando `telemetria` tem um overflow de pilha clássico.

O comando `telemetria` lê até `0x200` (512) bytes para dentro de um buffer de apenas 64 bytes: sem
checar o tamanho. Isso é um **buffer overflow de pilha padrão**: qualquer coisa além dos 64 bytes do
buffer começa a sobrescrever o que vem depois na pilha (variáveis locais, ponteiro de quadro salvo, e
por fim o endereço de retorno).

## 4. Exploração

O padding até o endereço de retorno salvo foi de **72 bytes** (64 do buffer + 8 do `rbp` salvo: o
mesmo padrão 64→72 que se repetiu em outros binários desta família de desafios). Depois dos 72 bytes,
o próximo qword na pilha é o endereço de retorno.

A cadeia ROP monta uma chamada equivalente a `system("/bin/sh")` encadeando gadgets já existentes no
binário:

```text
payload = b"A" * 72
        + p64(pop_rdi_ret)      # gadget: pop rdi; ret  (0x401575 nesta instância)
        + p64(endereco_bin_sh)  # string "/bin/sh" no binário (0x4040b0)
        + p64(ret_gadget)       # ret "solto" (0x401016): só para realinhar a pilha
        + p64(system_addr)      # endereço vazado no passo 3 (%24$p)
```

- Em x86-64 Linux, o primeiro argumento de uma chamada de função vai sempre no registrador `rdi` (é
  parte da convenção de chamada da arquitetura: a "regra combinada" de onde cada argumento deve
  estar antes de uma função ser chamada). O gadget `pop_rdi_ret` (um trecho de código já existente no
  binário que faz `pop rdi; ret`) tira o próximo valor da pilha e coloca dentro de `rdi`: nesse caso,
  o endereço de `"/bin/sh"`: e então continua a execução no próximo endereço da pilha.
- O `ret` solto antes de `system` não faz nada funcionalmente: só consome 8 bytes da pilha para
  **realinhar `rsp` (o ponteiro de topo da pilha) em um múltiplo de 16**, uma exigência da convenção
  de chamada x86-64 para funções que usam instruções `movaps` internamente (a `system` da libc usa).
  Sem esse alinhamento, a chamada crasha antes de completar.
- Por fim, `system_addr` é o endereço vazado no handshake: chamado com `"/bin/sh"` em `rdi`, abre
  uma shell.

> [!TIP/O gadget de alinhamento é uma armadilha recorrente]
> Vários binários desta família de desafios exigiam (ou não) esse `ret` extra dependendo de quantos
> `push`/`call` já tinham acontecido até aquele ponto. Não tem como adivinhar sem testar: se o
> `ret2win`/ROP falha silenciosamente (a conexão cai sem erro visível), o alinhamento de pilha é o
> primeiro suspeito.

## 5. Capturando a flag

Com a shell aberta via `system("/bin/sh")`, o próximo passo é simplesmente listar as variáveis de
ambiente do processo: o padrão desta família de desafios guarda a flag ali, não em arquivo:

```bash
$ env | grep RCTF_FLAG
RCTF_FLAG=flag{infinity_ctf_2026_orbita_6d649a9471}
```

### 🚩 Flag

```
flag{infinity_ctf_2026_orbita_6d649a9471}
```

## 6. Lições

- **Format string não é só "vazar um valor solto"**: quando combinado com um segundo bug (overflow,
  neste caso), vira a peça que faltava para transformar "leio memória" em "executo código".
- **No-PIE facilita demais.** Sem ASLR de código, todo endereço de gadget/função é constante entre
  execuções: dá pra montar a cadeia ROP offline, sem precisar recalcular nada em tempo real.
- **Alinhamento de pilha (`RSP % 16`) é a causa mais comum de um ret2win "correto" falhar.** Vale
  sempre ter, como plano B, a versão do payload com um `ret` extra de sobra.
- Corrigir na origem seria simples: nunca passar entrada do usuário como primeiro argumento de
  `printf`/`fprintf` (usar `printf("%s", input)` em vez de `printf(input)`), e validar o tamanho lido
  em `telemetria` contra o tamanho real do buffer.

---

_Writeup do desafio Orbita (Infinity CTF 2026 · Pwn · Hard)._
