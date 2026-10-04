---
title: 'Torniquete: Writeup completo'
description: 'Por que "Torniquete"? Porque o console pede sua identificação antes de liberar a passagem: só que o "torniquete" não verifica nada de verdade, apenas repete de volta o que você digitou, e essa brecha foi usada pra ler segredos escondidos na memória do programa até achar a flag.'
event: 'Infinity CTF 2026 (Harpia Security + SENAC)'
category: 'pwn'
subcategory: 'Format String'
difficulty: 'hard'
tags:
  - format-string
pubDate: 2026-08-21
author: 'Niedson'
draft: true
---

> [!WARNING/Rascunho: falta confirmar a flag exata]
> Este writeup foi reconstruído a partir das notas da sessão (o desafio foi resolvido por outra
> pessoa do time, não por quem escreveu este texto) e ainda não tem a flag exata registrada.
> `draft: true` até confirmar o valor certo: trocar para `false` depois de preencher.

> [!NOTE/Sobre o desafio]
> **Plataforma:** Infinity CTF 2026 (Harpia Security + SENAC)
> **Categoria:** Pwn (root) · **Dificuldade:** Hard · **Pontos:** 758
> **Vulnerabilidades:** Format string: eco verbatim do crachá informado
> **Flag:** `flag{infinity_ctf_2026_torniquete_...}` (valor exato ainda não confirmado nas notas)

Torniquete é outro format string do mesmo lote de desafios `root`, notável menos pela técnica (a
mesma varredura de `%N$s` do [Vitrola](/pt/writeups/infinity-ctf-2026/vitrola/)) e mais por um
detalhe de design: o desafio tenta parecer mais sofisticado do que é.

---

## 1. Contexto

O serviço simula um "console de controle de acesso": pede **"Informe o cracha do operador:"**, e
depois oferece um "comando de diagnóstico". O texto associado ao desafio menciona um "módulo de
auditoria em modo restrito", sugerindo algum tipo de sandbox ou jail limitando o que dá pra fazer.

## 2. Reconhecimento

### 2.1. O que é um bug de "format string" (se você nunca viu um)

Em C, a função `printf` recebe uma **string de formato**: algo como `printf("Ola, %s!", nome)`: onde `%s`, `%d`, `%x`, `%p` etc. são "buracos" que a função preenche com os argumentos seguintes
(`nome`, no exemplo). O bug acontece quando um programa faz `printf(entrada)`, passando **diretamente
o texto que o usuário digitou** como se fosse a string de formato, em vez de usar algo seguro como
`printf("%s", entrada)`.

Se isso acontecer, e você digitar `%p` ou `%x` como sua "entrada", o `printf` vai tentar preencher
esses buracos com argumentos: só que, como você não passou nenhum argumento de verdade, ele lê o que
**já estava na pilha de memória** naquele momento (endereços, lixo de chamadas anteriores, o que
sobrou lá) e devolve isso como se fosse dado legítimo. Ou seja: **você consegue espiar memória crua
do processo só mandando `%x`/`%p` como entrada.**

Indo além, `%N$s` (onde `N` é um número) é uma variação que diz ao `printf`: "trate o N-ésimo valor
da pilha como um **ponteiro** e imprima a string que está naquele endereço". Testando vários valores
de `N` em sequência, dá pra vasculhar a pilha inteira atrás de um ponteiro que aponte para algo
interessante: como, neste caso, uma variável de ambiente com a flag.

### 2.2. Confirmando o bug aqui

Testar o campo do crachá com entradas de formato (`%p`, `%x`) mostrou o sinal clássico descrito
acima: a resposta trazia valores hexadecimais em vez do texto literal digitado. O crachá informado
era **ecoado verbatim** direto num `printf(entrada)`, sem nenhum `"%s"` fixo na frente protegendo a
chamada: exatamente o mesmo bug do [Vitrola](/pt/writeups/infinity-ctf-2026/vitrola/), outro
desafio deste CTF com a mesma falha.

O "comando de diagnóstico" separado, por outro lado, aceitava qualquer input e sempre respondia
`"Diagnostico concluido. Sessao encerrada."` de forma instantânea: sem custo de CPU perceptível,
o que descarta a hipótese de ser um `eval` ou interpretador de verdade rodando o input. Era só
decoração.

## 3. Encontrando a vulnerabilidade

> [!TIP/Nem toda "proteção" mencionada no enunciado é real]
> O texto "módulo de auditoria em modo restrito" soa como se houvesse alguma sandbox ativa
> limitando comandos perigosos: mas nenhuma das duas rotas do desafio (crachá, diagnóstico) tinha
> qualquer lógica de restrição observável. A fraqueza real estava só no campo do crachá, sem relação
> nenhuma com o texto de "auditoria". Vale sempre separar o que é **flavor text** do que é
> comportamento real testável.

Com o bug de format string confirmado no campo do crachá, a exploração seguiu o mesmo roteiro do
Vitrola: varrer índices posicionais (`%N$s`) até encontrar, em algum lugar da pilha, um ponteiro para
a variável de ambiente que guarda a flag (`RCTF_FLAG`: um padrão comum nos desafios `root` deste
CTF: em vez de a flag estar escrita fixa no código, ela é carregada como variável de ambiente do
processo no momento em que o serviço sobe).

## 4. Exploração

```python
for n in range(1, 200):
    resposta = enviar_cracha(f"%{n}$s")
    if "flag{" in resposta:
        print(n, resposta)
        break
```

O laço acima testa, um a um, cada índice `N` de `%N$s`: cada tentativa pergunta ao `printf` "trate a
posição `N` da pilha como ponteiro e imprima a string ali". Assim como no Vitrola, algum índice
específico da pilha continha justamente o ponteiro para `RCTF_FLAG`, e `%N$s` nesse índice devolveu
a flag diretamente na resposta.

## 5. Capturando a flag

A flag saiu na resposta ao crachá formatado com o índice certo: mas o valor exato não ficou
registrado nas notas desta sessão (o desafio foi resolvido por outra pessoa do time).

### 🚩 Flag

```
flag{infinity_ctf_2026_torniquete_...}
```

## 6. Lições

- **Descrições de desafio (flavor text) podem ser red herrings.** "Módulo de auditoria em modo
  restrito" não correspondia a nenhuma proteção real: o bug estava em outro lugar, sem relação com
  o texto.
- **O mesmo bug de format string pode aparecer várias vezes no mesmo CTF** com nomes/contextos
  diferentes: reconhecer o padrão rápido (eco verbatim → `%p`/`%N$s`) economiza bastante tempo.
- Corrigir: o mesmo do Vitrola: nunca passar entrada externa como string de formato direta de
  `printf`.

---

_Writeup do desafio Torniquete (Infinity CTF 2026 · Pwn · Hard): rascunho, falta confirmar a flag._
