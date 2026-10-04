---
title: "PadaSentry #02: C e os tipos que o Windows inventou"
description: "Vindo do Zhirkov, ponteiros não são o problema. O problema é o layer de typedef que a Win32 coloca em cima do C que você já conhece: e as convenções que só fazem sentido quando você entende de onde vieram."
date: 2026-07-15
platform: "dev-log"
tags: ["c", "win32", "mingw", "toolchain", "abi"]
series: "padasentry"
part: 2
draft: false
---

Quando o roadmap listou "ponteiros para ponteiros, pointer arithmetic, casting explícito" como pré-requisito da etapa 1, eu fiquei feliz porque ja tinha visto isso no livro *Low Level Programming*: Zhirkov.

Mas ainda havia uma barreira de conhecimento que o Zhirkov não cobre. O layer que a Win32 empilha em cima do C, e esse layer é o que essa etapa foi de verdade.

---

## o sistema de typedef da Win32 

A primeira coisa que você encontra nos headers do Windows não é uma API. É uma parede de `typedef`. A reação errada é decorar como vocabulário novo. A reação certa é mapear cada um pro tipo primitivo que você já conhece do Zhirkov:

```c
BYTE        → uint8_t        // um byte, sem sinal
WORD        → uint16_t       // dois bytes
DWORD       → uint32_t       // quatro bytes: PIDs, flags, tamanhos
DWORD64     → uint64_t       // oito bytes
ULONG_PTR   → uintptr_t      // inteiro do tamanho de um ponteiro (32 ou 64 bits)
LPVOID      → void *         // ponteiro genérico: o "LP" é lixo do Win16, ignora
LPDWORD     → uint32_t *     // ponteiro pra DWORD: aparece em parâmetros de output
BOOL        → int            // NÃO é _Bool: é int com 0 e não-zero
```

O `ULONG_PTR` merece atenção especial. Zhirkov usa `uintptr_t` do `<stdint.h>` quando precisa de um inteiro do tamanho de ponteiro pra aritmética de endereço. `ULONG_PTR` é exatamente a mesma coisa, só com nome Win32. Você vai escrever `(ULONG_PTR)base + offset` o tempo inteiro no parser de PE: é a mesma operação que você faz em assembly quando some um offset a um endereço base, só que em C com cast explícito pra dizer ao compilador "isso é um inteiro, não um ponteiro".

---

## `HANDLE`: o ponteiro que você nunca dereferenceia

No mundo do Zhirkov, um ponteiro aponta pra algo e você dereferenceia pra chegar lá. `HANDLE` quebra essa intuição: é definido como `void *`, mas você **nunca** dereferenceia. É um token opaco que o kernel te dá e que você passa de volta pras APIs quando quer fazer algo. O que ele aponta internamente fica no kernel space, inacessível...

```c
HANDLE proc = OpenProcess(PROCESS_QUERY_INFORMATION | PROCESS_VM_READ, FALSE, pid);
// proc é um void *: mas fazer *proc ou (alguma_struct *)proc é errado
// você só passa ele pra outras APIs:
EnumProcessModules(proc, mods, sizeof(mods), &needed);
CloseHandle(proc);  // devolve o handle pro sistema quando acabar
```

O padrão de fechar o handle com `CloseHandle` é o equivalente Win32 do `close(fd)` do Linux. Esquecer isso num loop que abre processo atrás de processo é um leak de handle que o sistema reclama tarde demais.

---

## `BOOL`: a armadilha que parece óbvia

`BOOL` é `int`. Não é `_Bool`, não é `stdbool.h bool`. Isso importa numa situação específica:

```c
// ERRADO: pode falhar mesmo quando a função retorna "sucesso"
if (SomeApi() == TRUE) { ... }

// CERTO: qualquer valor não-zero é sucesso
if (SomeApi()) { ... }
// ou equivalentemente:
if (SomeApi() != FALSE) { ... }
```

Por quê? Porque algumas APIs retornam valores não-zero que não são `1`. Se você compara com `TRUE` (que é `#define TRUE 1`), você rejeita um `2` ou um `-1` que eram perfeitamente válidos como "sucesso". O Zhirkov cobre isso indiretamente quando fala sobre como C trata verdade e falsidade: qualquer não-zero é verdadeiro: mas Win32 tem casos reais onde isso morde.

---

## a convenção de calling que mudou

Zhirkov ensina a ABI System V AMD64: parâmetros em `rdi`, `rsi`, `rdx`, `rcx`, `r8`, `r9`. Esse é o padrão Linux/macOS. Win64 usa a **Microsoft x64 ABI**: parâmetros em `rcx`, `rdx`, `r8`, `r9`. A ordem é diferente, o shadow space de 32 bytes na stack é obrigatório, e `rdi`/`rsi` são callee-saved em vez de scratch, dificultando minha primeira compreensao sobre registradores na nova ABI.

Pra C puro isso é indiferente, o compilador cuida. Mas lendo a disassembly de uma API da Win32 (ou de um hook inline, que é exatamente o que o PadaSentry vai fazer), a diferença aparece na hora. O que no Linux você lê como "primeiro argumento em `rdi`" no Windows está em `rcx`. 

---

## o padrão `dwSize`: versionamento de struct na raça

Esse padrão não tem equivalente no C que o Zhirkov ensina, mas aparece em quase toda API da Win32 que recebe uma struct:

```c
PROCESSENTRY32 entry;
entry.dwSize = sizeof(PROCESSENTRY32);  // obrigatório antes de chamar qualquer coisa
Process32First(snap, &entry);
```

O campo `dwSize` que você preenche com o tamanho da struct é um mecanismo de versionamento. A API compara com os tamanhos que ela conhece pra decidir qual versão da struct você está usando. Esquecer essa linha e a chamada falha com `ERROR_BAD_LENGTH`: sem mensagem de erro decente, só um código numérico que você busca no `GetLastError()`.

---

## toolchain: MinGW no lugar do nasm + gcc no Linux

O setup do Zhirkov é nasm + gcc no Linux. Aqui é MinGW + gcc no Windows, com dois detalhes que diferem:

As flags de link são explícitas: o Linux linka `libc` por padrão; no Windows você precisa declarar as bibliotecas:

```bash
gcc -Wall -Wextra -o padasentry.exe main.c -lkernel32 -lpsapi
```

`-lkernel32` contém as APIs de processo e handles. `-lpsapi` contém `EnumProcessModules`, `GetModuleFileNameEx`, `GetModuleInformation`. Esquecer `-lpsapi` e o linker não encontra os símbolos: mesmo que o header declare as funções, o símbolo resolvido não está lá.

Makefile mínimo pra não ter que lembrar as flags toda vez:

```makefile
CC      = gcc
CFLAGS  = -Wall -Wextra -O2
LDFLAGS = -lkernel32 -lpsapi
TARGET  = padasentry.exe

$(TARGET): main.c
	$(CC) $(CFLAGS) -o $(TARGET) main.c $(LDFLAGS)

clean:
	del $(TARGET)
```

---

## exercício que fechou a etapa

Um enumerador de processos: recebe um argumento e imprime PID + nome de tudo que está rodando. Parece simples, mas força você a usar `CreateToolhelp32Snapshot`, navegar numa `PROCESSENTRY32` com o `dwSize` obrigatório, e desenvolver o hábito de fechar handles:

```c
#include <windows.h>
#include <tlhelp32.h>
#include <stdio.h>

int main(void) {
    HANDLE snap = CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0);
    if (snap == INVALID_HANDLE_VALUE) {
        fprintf(stderr, "snapshot falhou: %lu\n", GetLastError());
        return 1;
    }

    PROCESSENTRY32 entry;
    entry.dwSize = sizeof(PROCESSENTRY32);

    if (Process32First(snap, &entry)) {
        do {
            printf("[%6lu] %s\n", entry.th32ProcessID, entry.szExeFile);
        } while (Process32Next(snap, &entry));
    }

    CloseHandle(snap);
    return 0;
}
```

O `szExeFile` é um `char[MAX_PATH]`: array de bytes, exatamente como o Zhirkov descreve strings em C. Sem mistério aí. O que é novo é o `snap == INVALID_HANDLE_VALUE` como checagem de erro (Win32 usa esse sentinela em vez de `NULL` pra handles de snapshot), e o `GetLastError()` pra saber o que quebrou.

---

Zhirkov deu o modelo mental que importa: memória como bytes, ponteiros como endereços, aritmética como soma de inteiros. A Win32 empilha um vocabulário em cima disso, muda a ABI, e adiciona algumas convenções que só fazem sentido com contexto histórico. A diferenca não é gritante, mas ignorá-lo é o tipo de coisa que te faz perder duas horas debugando um `dwSize` faltando hahah..

Na parte 03 o estudo vai pro mecanismo que motivou o projeto inteiro: e a primeira descoberta real é que o hook mais famoso do Windows é deliberadamente invisível pro user space.

`har har mahadev.`