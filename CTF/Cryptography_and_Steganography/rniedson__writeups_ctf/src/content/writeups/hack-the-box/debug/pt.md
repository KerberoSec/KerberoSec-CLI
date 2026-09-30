---
title: 'O Segredo do Satélite: Writeup completo'
description: 'Por que "O Segredo do Satélite"? Porque o chiado que parecia só interferência escondia duas coisas ao mesmo tempo: uma mensagem inteira sussurrada por baixo do barulho, e a prova de que a rede do satélite tinha sido invadida.'
event: 'Hack The Box'
category: 'hardware'
subcategory: 'UART'
tags:
  - uart
  - serial
  - logic-analyzer
  - fft
  - leetspeak
pubDate: 2026-08-25
author: 'Niedson'
draft: false
---

> [!NOTE/Sobre o desafio]
> **Plataforma:** Hack The Box · **Categoria:** Hardware ("Debug")
> **Técnica:** Decodificação de um sinal serial (UART) capturado por analisador lógico, separando a
> mensagem real de uma interferência sobreposta
> **Flag:** `HTB{***REDACTED***}` (formato: `HTB{...}`)

> [!IMPORTANT/Flag redigida de propósito]
> Este desafio ainda está **ativo** na Hack The Box no momento da publicação. Publicar a flag
> completa de um desafio ativo viola os termos da plataforma. O restante da técnica é real e
> reproduzível: só a flag final (e os trechos que permitiriam remontá-la) ficam ocultos até o
> desafio ser retirado, quando este writeup será atualizado com o valor completo.

> **Enredo.** Uma antena de satélite transmitia a localização de uma relíquia, mas a conexão começou
> a falhar por causa de uma _interferência_ de origem desconhecida. A interface de debug da placa
> cospe um _boot log_ pela porta serial ao ligar. Alguém capturou esse sinal com um analisador
> lógico. **Missão:** decodificar o serial, achar a flag `HTB{...}` e identificar a fonte da
> interferência.

| Item          | Valor                                                     |
| ------------- | --------------------------------------------------------- |
| Arquivo       | `hw_debug.sal` (Saleae Logic 2)                           |
| Amostragem    | 25 MHz · 1 amostra = 40 ns                                |
| Canais        | `TX` (mudo) · `RX` (o sinal)                              |
| Protocolo     | UART assíncrono, **115200 8N1**                           |
| Interferência | portadora quadrada ~163 kHz                               |
| Flag          | `HTB{***REDACTED***}` → _"satellite network compromised"_ |

---

## 1. UART: conversa por um fio só

O **UART** é a serial mais comum em hardware. Existe um fio de dados que, em repouso, fica em nível
alto (`1`). Para enviar um byte:

1. a linha **desce** por 1 tempo de bit → o **start bit**;
2. seguem os **8 bits de dados**, do menos significativo ao mais significativo (**LSB primeiro**);
3. a linha **sobe** por 1 tempo → o **stop bit**.

Não há relógio compartilhado: os dois lados só precisam concordar na velocidade, o **baud rate**.
Aqui o baud é **115200**. Como cada amostra dura 40 ns, o tamanho de 1 bit em amostras é:

```python
>>> 25_000_000 / 115200
217.01     # ~217 amostras por bit; 10 bits por byte (start + 8 + stop)
```

Anatomia de um quadro 8N1 enviando a letra **`H`** (`0x48` = `0b0100_1000`, transmitido LSB
primeiro → `0 0 0 1 0 0 1 0`):

```
nível
  1  ──┐        ┌──┐     ┌──┐   ┌──   (idle/stop = alto)
       │        │  │     │  │   │
  0    └────────┘  └─────┘  └───┘     (start + bits 0)
     idle start D0 D1 D2 D3 D4 D5 D6 D7 stop
```

O receptor acha a borda de descida (start), espera meio bit e amostra **1 ponto no centro** de cada
bit, a cada ~217 amostras.

---

## 2. O arquivo `.sal` por dentro

### Como sabemos que um `.sal` é só um ZIP

Três evidências independentes:

```bash
$ file hw_debug.sal
hw_debug.sal: Zip archive data, at least v2.0 to extract, compression method=deflate

$ head -c 4 hw_debug.sal | od -An -tx1
 50 4b 03 04            # = ASCII "PK\x03\x04"
```

Os primeiros 4 bytes `50 4b 03 04` são a **assinatura universal de todo arquivo ZIP**: os
caracteres `PK` (iniciais de _Phil Katz_, criador do formato) seguidos de `03 04`. Todo `.zip`,
`.docx`, `.xlsx`, `.jar` e `.apk` começa com esses bytes. O comando `file` chega à mesma conclusão
lendo justamente esse cabeçalho (os "magic bytes"). Confirmação final: `unzip` abre normalmente.

```bash
$ unzip hw_debug.sal
  inflating: digital-0.bin   # canal TX: 88 KB
  inflating: digital-1.bin   # canal RX: 178 KB  ← o sinal está aqui
  inflating: meta.json       # metadados da captura

$ python3 -c "import json; d=json.load(open('meta.json'));
   print(d['data']['captureSettings']['connectedDevice']['settings']['sampleRate'])"
{'digital': 25000000}        # 25 MHz
```

### O formato interno dos `.bin`

Os `digital-N.bin` **não** são a lista de amostras crua: são um contêiner interno da Saleae. Os
primeiros bytes entregam a assinatura, e em seguida vêm blocos com um cabeçalho de 6 inteiros de 64
bits (little-endian):

```
$ head -c 16 digital-1.bin | od -An -tx1
  3c 53 41 4c 45 41 45 3e 01 00 00 00 64 00 00 00
  <  S  A  L  E  A  E  >                          ← assinatura "<SALEAE>"

>>> u64 = lambda o: struct.unpack('<Q', d[o:o+8])[0]
>>> [u64(51 + i*8) for i in range(6)]     # cabeçalho do 1º bloco
[0, 835584, 835584, 25000000, 1, 3]
#  start  end    length  sample_rate flag cnt
```

Depois do cabeçalho vêm `cnt` bytes de **deltas** (run-length): cada byte diz quantas amostras a
linha permanece no nível atual antes de **inverter**. Reconstruindo os deltas em transições e
ignorando os blocos ociosos (`cnt ≤ 3`), confirma-se o essencial:

```python
>>> ativos = lambda f: sum(1 for c in chunks(f) if c.cnt > 3)
>>> ativos('digital-0.bin'), ativos('digital-1.bin')
(0, 219)     # TX: 0 blocos com dados  |  RX: 219 rajadas de texto
```

**O TX está 100% mudo; todo o sinal está no RX.**

---

## 3. Achando a fonte da interferência

O RX não vinha limpo: sobre as piscadas do UART havia uma **onda quadrada rápida e regular**
embolada com o sinal. Para caçá-la, o truque clássico é ir ao **domínio da frequência** com uma FFT: um tom parasita aparece como um **pico** nítido, enquanto texto UART espalha energia por toda a
banda.

```python
>>> import numpy as np
>>> freq = np.fft.rfftfreq(len(w), 1/25e6)
>>> mag  = np.abs(np.fft.rfft(w))
>>> freq[mag.argsort()[: -1][:2]] / 1e3     # 2 picos mais fortes (kHz)
array([167.4, 194.3])                       # ← a portadora da interferência
```

O pico em **167 kHz** corresponde a uma portadora de período de **153 amostras** (25 MHz ÷ 153 ≈ 163
kHz). Esse zumbido regular tem cara de **clock de fonte chaveada (SMPS)** vazando no fio do RX: a
"fonte da interferência" que o desafio pede para identificar.

---

## 4. Decodificando o serial

Com o protocolo (UART) e a velocidade (115200) na mão, o caminho reto é o **analisador de
protocolo** da própria Saleae, o Logic 2, que amostra a linha no centro de cada bit e remonta os
bytes:

```
# Logic 2 (GUI):  Analyzers ▸ Async Serial
   Channel  = RX
   Bit Rate = 115200
   Bits = 8,  Stop = 1,  Parity = none        # "8N1"
# Saída em ASCII/Terminal → o boot log aparece, com a flag no fim.
```

Alternativa em linha de comando, com o **sigrok** (motor do PulseView, open-source):

```bash
$ sigrok-cli -i hw_debug.sr -P uart:baudrate=115200:rx=RX -A uart:rx-data
... [boot log] ... HTB{***REDACTED***}
```

**O detalhe esperto:** a interferência tem período de 153 amostras, _menor_ que 1 bit (217
amostras). Como o UART amostra **1 ponto por bit, no centro**, o nível verdadeiro do bit vence o
chiado na maior parte das vezes: por isso a mensagem sai legível, ainda que com alguns bytes
corrompidos ("broken between reference codes").

---

## 5. A flag e o leetspeak

```
HTB{***REDACTED***}
```

Hackers costumam escrever mensagens em **leet** (leetspeak): números no lugar de letras parecidas
(`3`→E, `0`→O, `1`→L/I, `7`→T, `5`→S, `4`→A, `2`→R). A flag deste desafio, decodificada, forma a
frase **"satellite network compromised"**: a própria flag fecha a história: a interferência não era
acidente, era o sintoma de que a rede do satélite havia sido comprometida.

> [!NOTE/Por que não mostrar a tabela de decodificação aqui]
> Normalmente este writeup mostraria uma tabela trecho-a-trecho da flag decodificada. Como o
> desafio ainda está ativo, isso equivaleria a publicar a flag em pedaços fáceis de remontar: a
> tabela completa entra aqui assim que o "Debug" for retirado da HTB. Como ilustração genérica do
> mesmo princípio, sem usar a flag real: `H4CK3R` decodifica pra `HACKER` usando exatamente esse
> alfabeto (`4`→A, `3`→E).

---

## 6. Runbook: reproduzir do zero

```bash
# 1) o .sal é um zip → extrai canais + metadados
unzip hw_debug.sal

# 2) confirma taxa (25 MHz) e qual canal tem sinal (RX mudo? TX mudo?)
python3 parse.py                # TX mudo, RX = 219 rajadas

# 3) caça a interferência no espectro (pico ~163 kHz)
python3 fft.py                  # picos em 167 / 194 kHz

# 4) decodifica o UART a 115200 8N1 no canal RX
#    Logic 2 (Async Serial)  : ou: 
sigrok-cli -i hw_debug.sr -P uart:baudrate=115200:rx=RX -A uart

# 5) traduz o leetspeak da flag → satellite network compromised
# HTB{***REDACTED***}  ✅  (valor completo publicado após o desafio ser retirado)
```

---

## 7. Lições aprendidas

Este desafio foi resolvido, mas **não em linha reta**: erramos bastante antes de chegar lá, e essa
parte é tão instrutiva quanto a solução.

### O que deu errado

- **Partimos de uma premissa errada.** A reconstrução do `.sal` produziu um sinal dominado por uma
  portadora rápida (o padrão "1100" repetido). Assumimos que _isso era o dado_ e passamos muito
  tempo tentando demodular a própria portadora.
- **Força-bruta cega.** Testamos por conta própria quase **30 esquemas** de decodificação sobre essa
  premissa errada: UART em toda a faixa de baud, largura de pulso (PWM), Manchester, biphase
  FM0/FM1, NRZ/NRZI, deframing HDLC, ciclo de trabalho (duty), recuperação de clock por PLL,
  símbolos por período (3T/4T)... Todos davam lixo repetido, porque estávamos decodificando a
  _interferência_, não a mensagem.
- **A narrativa nos enganou.** "Satélite" sugeria modulação exótica (PSK/FSK). Investimos em
  FFT/demodulação de rádio achando que era algo sofisticado: mas era **serial trivial** (UART
  115200).
- **Quase confiamos num atalho.** Um agente auxiliar "achou" a flag copiando de um write-up externo.
  O fragmento **não reproduziu** no nosso próprio dado: bom lembrete de que resposta de terceiro só
  vale se você reproduz.

### O que levamos

1. **Cheque o enunciado e se é um desafio conhecido antes de mergulhar.** Reconhecer que era o
   "Debug" (UART 115200 padrão) teria economizado horas.
2. **Use a ferramenta certa em vez de reimplementar.** O analisador de protocolo do Logic 2 resolve
   em 3 cliques o que tentamos reescrever em código por dias. Não reinvente o decoder.
3. **Muitas tentativas falhando com pequenas variações? O problema é a PREMISSA, não os
   parâmetros.** Pare e questione o modelo. Aqui, "a portadora é o dado" estava errado: ela era a
   interferência.
4. **Separe sinal de interferência cedo.** A FFT foi o instinto certo: um tom parasita salta como
   pico e fica fácil de nomear (e depois de filtrar/tolerar).
5. **Entenda o modelo de amostragem.** O UART lê 1 ponto no centro de cada bit; por isso
   interferência mais rápida que 1 bit é tolerável. Isso explica por que "funciona apesar do ruído".
6. **Troque de representação quando travar.** Ver o sinal como forma de onda e como espectro (a dica
   de usar uma ferramenta tipo editor de áudio) destrava mais rápido que insistir na força-bruta.
7. **Resposta de terceiro não é prova.** Só conte como resolvido o que você consegue reproduzir no
   seu próprio dado.

---

## Glossário técnico

| Termo                         | Definição curta                                                                                             |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------- |
| **UART / 8N1**                | Serial assíncrona: start + 8 dados (LSB primeiro) + 1 stop, sem paridade. Sem clock; só o baud é combinado. |
| **Baud rate**                 | Bits por segundo. 115200 baud @ 25 MHz ⇒ 217 amostras/bit.                                                  |
| **Analisador lógico**         | Amostra fios digitais a alta taxa (aqui 25 MHz) e grava as transições.                                      |
| **Formato `.sal`**            | ZIP (assinatura `PK\x03\x04`) contendo `.bin` por canal (assinatura interna `<SALEAE>`) + `meta.json`.      |
| **Magic bytes**               | Primeiros bytes de um arquivo que identificam seu formato (ex.: `PK` = ZIP).                                |
| **FFT**                       | Leva o sinal ao domínio da frequência; um tom parasita vira um pico nítido.                                 |
| **Portadora / interferência** | Onda quadrada ~163 kHz (período 153 amostras) sobreposta ao RX; provável clock de fonte chaveada.           |
| **Boot log**                  | Mensagens que o firmware imprime na serial ao iniciar.                                                      |
| **Leetspeak**                 | Cifra visual: números no lugar de letras parecidas (3→E, 0→O, 7→T…).                                        |

---

_Desafio autorizado da Hack The Box (Hardware · "Debug"). Documento com fins educativos e de treino
em segurança ofensiva._
