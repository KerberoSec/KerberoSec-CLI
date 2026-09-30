---
title: 'Vendix: Writeup completo'
description: 'Por que "Vendix"? Soa como o nome de um fabricante de dispositivo genérico: e é exatamente essa caixa-preta que o desafio simula: sem nenhum acesso ao programa por dentro, só uma resposta do aparelho que vazava, por acidente, pedaços de memória suficientes pra assumir o controle do sistema no escuro.'
event: 'Infinity CTF 2026 (Harpia Security + SENAC)'
category: 'pwn'
subcategory: 'Ret2win'
difficulty: 'hard'
tags:
  - ret2win
  - blind-exploitation
  - stack-canary-leak
pubDate: 2026-08-21
author: 'Niedson'
draft: false
---

> [!NOTE/Sobre o desafio]
> **Plataforma:** Infinity CTF 2026 (Harpia Security + SENAC)
> **Categoria:** Pwn (root) · **Dificuldade:** Hard · **Pontos:** 758 · **0-solve → first blood**
> **Vulnerabilidades:** Vazamento de memória não inicializada (canário + ponteiro PIE) → ret2win cego por brute-force
> **Flag:** `flag{infinity_ctf_2026_vendix_5cde77bff9}` (fixa nesta instância: o formato varia por desafio)

Vendix foi o único desafio `root` deste CTF resolvido **sem nunca ter acesso ao binário**: nem
publicado pela organização, nem extraído de alguma forma. Tudo o que existia era o serviço remoto e
um punhado de bytes vazados por acidente. É o exemplo mais puro de "ret2win às cegas" do evento.

---

## 1. Contexto

O serviço pede um "apelido do dispositivo" e depois um "pacote de diagnóstico". Sem binário, sem
código-fonte: só esses dois prompts para investigar. O nome "Vendix" e a estrutura de "diagnóstico"
sugerem algo tipo um sistema embarcado/IoT simulado.

## 2. Reconhecimento

Ao mandar o apelido do dispositivo, o servidor responde com um "pacote interno" de exatamente
**80 bytes**. Comparando várias respostas, uma parte desse pacote muda a cada conexão e outra parte
é sempre igual: sinal clássico de que esse "pacote" é, na verdade, **um buffer de memória
mal-inicializado** sendo devolvido praticamente cru: o programa alocou 80 bytes, escreveu só uma
parte com dado de verdade, e devolveu o buffer inteiro sem zerar o resto antes.

> [!IMPORTANT/Um buffer "quase certo" que vaza memória é ouro em CTF]
> Sempre que uma resposta parece ter dados "residuais": bytes que não fazem sentido junto ao
> conteúdo esperado: vale a pena decompor byte a byte. Muitas vezes é literalmente pilha antiga do
> processo, sobrando de uma chamada de função anterior.

Decompondo os 80 bytes vazados, dava pra identificar:

- Um **qword terminando em `00`**: característica de um **canário de pilha** (o glibc sempre zera o
  byte menos significativo do canário, justamente para que ele nunca seja tratado como parte de uma
  string C que termina em `\0`).
- Vários valores no formato `0x7fff...`: endereços típicos de **pilha** em processos x86-64 Linux.
- Um valor no formato `0x5f91...`: um endereço de **código**, mas numa faixa que muda pouco entre
  conexões, sugerindo que era um **ponteiro PIE** (executável com posição independente) cujos 12 bits
  menos significativos (`0x485` nesta instância) são estáveis.

O comando de "pacote de diagnóstico", por sua vez, tinha um overflow de pilha clássico: mandando
entradas cada vez maiores, o servidor emitia `*** stack smashing detected ***` a partir de **72
bytes**, confirmando: canário presente, no offset 72 (o mesmo padrão 64→72 desta família de
binários), sem nenhuma variável lógica extra entre o buffer e o canário.

## 3. Encontrando a vulnerabilidade

Com canário confirmado no offset 72, e sem nenhuma lógica extra pra contornar, a exploração é
puro **ret2win**: `padding + canário + rbp salvo + endereço de retorno forjado`. O problema é que,
sem o binário, **não existe nenhuma função "win" conhecida para apontar**: não sabemos onde fica.

> [!TIP/Ret2win cego funciona quando você tem os dois leaks certos]
> Um ret2win totalmente às cegas (sem binário) só é viável quando dá pra: (1) contornar o canário
> (aqui, porque ele mesmo vazou no "pacote interno") e (2) **ancorar** o brute-force do endereço de
> retorno em algo já vazado: aqui, o ponteiro de código PIE. Sem esse segundo leak, o espaço de
> endereços possíveis é grande demais pra tentar um por um.

Como o ASLR do serviço é previsível (o servidor usa um modelo de `fork` por conexão, então a base do
executável é a mesma em toda conexão nova daquela instância), o ponteiro de código vazado dá uma
**âncora**: a função "win" real deveria estar relativamente perto dele no mapa de memória.

## 4. Exploração

O payload de overflow:

```text
payload = b"B" * 72          # padding até o canário
        + canario_vazado     # 8 bytes, lido do "pacote interno"
        + rbp_qualquer        # 8 bytes: o rbp salvo não é checado, qualquer valor serve
        + p64(endereco_ret)   # candidato a testar
```

Como não existe um endereço de "win" conhecido, a solução foi fazer um **brute-force organizado**:
testar candidatos de retorno numa janela ao redor do ponteiro de código vazado: de
`codeptr - 0x900` até `codeptr + 0x200`, em paralelo (40 threads) para varrer a janela rápido antes
da instância expirar.

```python
# esboço da lógica de brute-force (pseudocódigo)
for offset in range(-0x900, 0x200, passo):
    candidato = codeptr_vazado + offset
    payload = b"B"*72 + canario + b"C"*8 + p64(candidato)
    resposta = enviar(payload)
    if "RCTF_FLAG" in resposta or contem_flag(resposta):
        print("achou:", hex(candidato))
        break
```

O acerto veio em **`codeptr - 0x20c`**: um deslocamento de pouco mais de 500 bytes abaixo do
endereço vazado, dentro da faixa testada.

> [!TIP/Instâncias frágeis exigem lote pequeno]
> Nos desafios `root` deste CTF, instâncias tendiam a degradar depois de umas 100-125 conexões
> seguidas (o balanceador começa a devolver erro genérico). O brute-force precisou ser dosado: > várias rodadas curtas em instâncias novas, em vez de uma varredura gigante numa instância só.

## 5. Capturando a flag

Ao acertar o endereço certo, o servidor executa a função de "win" (sem argumentos, como as outras
desta família de desafios) e imprime a flag direto na resposta.

### 🚩 Flag

```
flag{infinity_ctf_2026_vendix_5cde77bff9}
```

## 6. Lições

- **Memória não-inicializada devolvida ao cliente é uma das falhas mais valiosas em pwn.** Ela pode
  vazar exatamente as duas coisas que um ret2win cego precisa: proteção (canário) e âncora de
  endereço (ponteiro de código).
- **ASLR previsível (mesma base a cada conexão) transforma "impossível sem binário" em "viável com
  brute-force organizado".** Se a base muda a cada tentativa, a mesma técnica simplesmente não
  funcionaria.
- **Dosar o brute-force contra a fragilidade da infraestrutura importa tanto quanto a técnica em
  si**: descobrir empiricamente "quantas conexões a instância aguenta" foi decisivo pra não
  desperdiçar tentativas.
- Corrigir isso na origem: nunca devolver ao cliente um buffer que não foi 100% escrito pelo próprio
  programa (zerar antes de preencher), e habilitar PIE + ASLR de verdade (base diferente a cada
  processo, não só por conexão dentro do mesmo processo pai).

---

_Writeup do desafio Vendix (Infinity CTF 2026 · Pwn · Hard)._
