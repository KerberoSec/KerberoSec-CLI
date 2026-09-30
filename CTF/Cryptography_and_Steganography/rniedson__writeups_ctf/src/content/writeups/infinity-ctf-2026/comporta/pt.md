---
title: 'Comporta: Writeup completo'
description: '"Comporta" é a metáfora perfeita: a represa que devia conter os dados transborda, e a correnteza vai parar exatamente no lugar da memória do programa que decide o que executar em seguida.'
event: 'Infinity CTF 2026 (Harpia Security + SENAC)'
category: 'pwn'
subcategory: 'Buffer Overflow'
difficulty: 'hard'
tags:
  - buffer-overflow
  - ret2win
pubDate: 2026-08-21
author: 'Niedson'
draft: false
---

> [!NOTE/Sobre o desafio]
> **Plataforma:** Infinity CTF 2026 (Harpia Security + SENAC)
> **Categoria:** Pwn (root) · **Dificuldade:** Hard · **Pontos:** 662
> **Vulnerabilidades:** Buffer overflow de pilha → ret2win direto (sem ROP de libc)
> **Flag:** `flag{infinity_ctf_2026_comporta_7185bb7617}` (fixa nesta instância: o formato varia por desafio)

Se o [Orbita](/pt/writeups/infinity-ctf-2026/orbita/) precisou de duas vulnerabilidades encadeadas,
o Comporta é o caso mais simples possível de **buffer overflow de pilha**: uma das falhas mais
clássicas de segurança em programas escritos em C/C++, que acontece quando o programa copia dados do
usuário para um espaço de memória de tamanho fixo (um "buffer") sem checar se os dados cabem ali.
Se o programa não limitar o tamanho, dados demais "transbordam" (_overflow_) o buffer e sobrescrevem
o que vem logo depois dele na memória: nesse caso, informação de controle da própria execução do
programa. Aqui, o próprio binário já tem uma função que resolve o desafio, e o único trabalho é
convencer o programa a pular pra ela.

> [!NOTE/Por que sobrescrever memória faz o programa "pular" para outro lugar?]
> Toda vez que uma função é chamada, o processador guarda numa área de memória chamada **pilha**
> (_stack_) o **endereço de retorno**: o ponto exato do código para onde a execução deve voltar
> quando aquela função terminar. Esse endereço fica guardado logo depois do espaço reservado para as
> variáveis locais da função: inclusive logo depois de qualquer buffer local. Se um overflow
> escrever dados demais nesse buffer, ele acaba sobrescrevendo o endereço de retorno também. Quando a
> função termina, o processador não volta para onde deveria: ele "retorna" para o endereço que o
> atacante escreveu ali. Essa técnica, de escolher esse endereço para apontar direto a uma função que
> já resolve o desafio (em vez de construir um exploit mais complexo), é chamada de **ret2win**
> ("return to win").

---

## 1. Contexto

Mesma "família" de binário dos outros desafios `root` deste CTF: todos compilados com as mesmas
proteções (ou falta delas), que dá pra checar com uma ferramenta como `checksec`:

- **No-PIE**: o executável sempre carrega no MESMO endereço de memória, toda vez que roda (sem essa
  proteção, o sistema operacional randomizaria essa base a cada execução). Isso importa muito aqui,
  porque significa que um endereço de função descoberto uma vez (como o de `abrir_comporta`) vai ser
  válido em qualquer execução nova do mesmo binário.
- **Sem canário de pilha**: um "canário" é um valor secreto colocado entre o buffer e o endereço de
  retorno, que o programa confere antes de retornar: se o valor mudou, é sinal de overflow, e o
  programa aborta em vez de seguir com um endereço de retorno corrompido. Sem essa proteção, o
  overflow simplesmente funciona sem alarme nenhum.
- **NX ligado** (_No-eXecute_): a pilha não pode conter código executável: então não dá pra simplesmente
  escrever um shellcode no buffer e pular pra ele; o endereço de retorno precisa apontar para código
  que já existe no binário (como é o caso aqui).
- **Partial RELRO**: uma proteção parcial de outra estrutura de memória, que não é relevante para
  este exploit específico.

O serviço expõe um comando `processar_comando` que recebe dados do usuário: e o próprio nome do
desafio ("abrir a comporta") sugere que existe, em algum lugar do binário, uma função literal
chamada algo como `abrir_comporta`.

## 2. Reconhecimento

Testando `processar_comando` com entradas cada vez maiores, o serviço não crasha até um certo
tamanho: sinal de que existe um buffer de tamanho fixo recebendo os dados sem checagem de limite.
O comando lê até `0x200` (512) bytes num buffer de 64, exatamente como no Orbita: o mesmo padrão de
`read()` sem validação que se repete nesta família de desafios.

## 3. Encontrando a vulnerabilidade

Com No-PIE e sem canário, um overflow de pilha aqui é o caminho mais direto possível: sobrescrever o
endereço de retorno salvo com o endereço de qualquer função que já exista no binário. A pergunta é
só **qual** função.

> [!TIP/Procure a "função-prêmio" antes de montar ROP]
> Antes de partir para uma cadeia ROP completa (como no Orbita), vale sempre checar se o próprio
> binário já tem uma função que resolve o desafio sozinha: geralmente com um nome sugestivo
> (`win`, `flag`, `abrir_X`, `debug_shell`). Se existir e não pedir argumento nenhum, o exploit vira
> só "sobrescrever o retorno com esse endereço".

Aqui a função existia: `abrir_comporta` (endereço `0x401236`), que aparentemente imprime a flag ao
ser chamada: mas pedia primeiro que um valor "mágico" estivesse no registrador certo antes de
executar a lógica de fato, funcionando como uma checagem de autorização embutida no próprio binário.

## 4. Exploração

O padding até o retorno salvo foi, de novo, **72 bytes** (buffer de 64 + `rbp` salvo de 8). A cadeia
de exploração:

```text
payload = b"A" * 72
        + p64(pop_rdi_ret)          # gadget: pop rdi; ret (0x401509)
        + p64(0x436f6d706f727441)   # valor MAGIC esperado: bytes ASCII de "ComportA"
        + p64(abrir_comporta)       # 0x401236
```

`abrir_comporta` espera receber o valor mágico como argumento, e em Linux x86-64 o primeiro
argumento de uma função é passado no registrador `rdi`: não dá pra simplesmente "passar um
argumento" a partir de um endereço de retorno sobrescrito, então o exploit usa um **gadget**: um
pequeno trecho de instruções que já existe dentro do próprio binário (aqui, `pop rdi; ret`: "tire o topo da pilha e coloque em `rdi`, depois retorne") e que é reaproveitado fora de contexto.
Encadeando endereços de retorno um atrás do outro (`pop_rdi_ret` → valor mágico → `abrir_comporta`),
o programa primeiro carrega o valor certo em `rdi` e só depois pula pra função: é uma versão mínima
da técnica chamada **ROP** (_Return-Oriented Programming_), que no Orbita precisa de vários gadgets
encadeados e aqui usa só um.

O valor mágico `0x436f6d706f727441` não é aleatório: decodificado como bytes ASCII (pouco-endian),
ele soletra literalmente **"ComportA"**: uma checagem "estética" plantada de propósito no desafio,
não uma proteção de segurança real. `abrir_comporta` lê esse valor de `rdi` (carregado pelo gadget
`pop_rdi`), confere que bate com a string mágica, e só então libera a saída: nesse caso, a flag.

> [!IMPORTANT/Sem `ret` de alinhamento aqui: diferente do Orbita]
> No Orbita, a cadeia precisou de um `ret` extra antes de chamar `system` por causa do alinhamento de
> pilha exigido por instruções `movaps` dentro da libc. Aqui, `abrir_comporta` é uma função simples
> do próprio binário (compilada sem esse tipo de instrução SSE alinhada): chamar direto, sem
> gadget de alinhamento, funcionou sem problema. **Não existe uma regra fixa de "sempre alinhar";
> depende do que a função de destino faz internamente.** Teste os dois jeitos se um deles falhar
> silenciosamente.

## 5. Capturando a flag

Ao rodar o payload, `abrir_comporta` executa e imprime a flag diretamente na resposta do serviço: sem precisar de shell nem de leitura de variável de ambiente:

### 🚩 Flag

```
flag{infinity_ctf_2026_comporta_7185bb7617}
```

## 6. Lições

- **Ret2win direto é sempre a primeira coisa a checar.** Antes de montar uma cadeia ROP inteira
  (Orbita), vale a pena vasculhar o binário atrás de uma função que já faça o trabalho sozinha.
- **"Valores mágicos" que soletram uma palavra em ASCII são um padrão comum** em desafios de CTF: quando um `p64()` parecer um número aleatório, vale decodificar como string antes de descartar.
- **Alinhamento de pilha não é sempre necessário.** Comparado ao Orbita, este desafio mostra bem que
  a exigência de `RSP % 16 == 0` depende do que a função chamada faz por dentro: não é uma regra
  universal de todo ret2win.
- Na vida real, a correção seria a mesma do Orbita: validar o tamanho lido contra o tamanho real do
  buffer antes de gravar, e nunca confiar em "checagem de valor mágico" como controle de acesso.

---

_Writeup do desafio Comporta (Infinity CTF 2026 · Pwn · Hard)._
