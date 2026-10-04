---
title: "PadaSentry #01: o plano antes do código"
description: "PadaSentry é um detector de hooks de teclado escrito em C no Windows. Este post abre a série com o roadmap de estudo completo: das fundações de C com Win32 até detecção de inline hook, IAT hook e memória unbacked."
date: 2026-07-15
platform: "dev-log"
tags: ["windows", "c", "win32", "keylogger", "malware-analysis", "roadmap"]
series: "padasentry"
part: 1
draft: false
---

Keyloggers são um dos malwares mais antigos e mais subestimados. A maioria das pessoas imagina que detectar um é trivial, afinal, se ele está lendo o teclado, ele deve deixar algum rastro óbvio em algum lugar. A realidade é mais inconveniente: os mecanismos mais comuns de captura de teclas no Windows foram deliberadamente projetados de forma que o sistema operacional não os expõe de nenhuma forma limpa e pública pro user space.

**PadaSentry** é a minha tentativa de construir uma ferramenta que seja útil e ao mesmo tempo forneça grande conhecimento sobre Windows, C, Win32 e análise de malware. Realizando um brainstorming de possibilidades, decidi realizar o projeto C e futuramente migrar para Rust, dessa forma, extraindo o máximo possível de aprendizados referentes aos tópicos anteriormente citados. O projeto começa do zero, tanto o código quanto o estudo que o antecede.

Este post é esse estudo. Antes de escrever uma linha de detecção de verdade, eu precisava mapear exatamente o que é necessário saber, em qual ordem, e por quê. O resultado é o roadmap abaixo, sete etapas que vão de ponteiros e tipos Win32 até comparação de memória contra disco pra encontrar hooks inline. Cada etapa seguinte da série vai cobrir uma dessas etapas em código real.

---

## etapa 1: C no contexto Win32

Antes de tocar em qualquer API do Windows:

- Ponteiros para ponteiros (`**ptr`), pointer arithmetic
- Structs, unions, bitfields
- Casting explícito (`(BYTE *)`, `(ULONG_PTR)`)
- `typedef`, `#define` e os tipos Win32 (`DWORD`, `HANDLE`, `LPVOID`, `BOOL`): entender o que cada um é por baixo
- Compilar com `cl.exe` (MSVC) ou `gcc` no MinGW, linkando com `-lkernel32 -lpsapi`

**referência:** K&R + qualquer artigo "Win32 C from scratch"

---

## etapa 2: modelo de processos e memória do Windows

Conceitos antes de escrever uma linha:

- **Virtual address space**: cada processo tem o seu, user space vs kernel space
- **Handles**: o que são, como obter (`OpenProcess`), privilégios necessários (`PROCESS_VM_READ`, `PROCESS_QUERY_INFORMATION`)
- **Regiões de memória**: committed, reserved, free e atributos de proteção (`PAGE_EXECUTE_READ`, `PAGE_EXECUTE_READWRITE`, etc)
- **Como DLLs são mapeadas**: o loader mapeia a DLL no espaço do processo; múltiplos processos podem compartilhar as páginas físicas

**APIs:**
```c
OpenProcess()
VirtualQueryEx()        // enumerar regiões de memória
ReadProcessMemory()     // ler memória de outro processo
CloseHandle()
```

**exercício:** programa que lista todas as regiões de memória de um processo alvo (PID como argumento): base address, tamanho, proteção, tipo (image/mapped/private).

---

## etapa 3: enumeração de processos e módulos

**via Toolhelp32 (começa aqui):**
```c
CreateToolhelp32Snapshot()
Process32First() / Process32Next()   // enumerar processos
Module32First() / Module32Next()     // enumerar módulos de um processo
```

**via PSAPI (mais controle):**
```c
EnumProcesses()
EnumProcessModules()
GetModuleFileNameEx()    // path do arquivo em disco da DLL carregada
GetModuleInformation()   // base address, tamanho em memória
```

Extrair de cada módulo: base address em memória, tamanho, e path do arquivo em disco.

**exercício:** dado um PID, listar todos os módulos carregados com base address e path.

---

## etapa 4: formato PE

A etapa mais densa e mais importante. Você vai navegar nas estruturas manualmente.

**estrutura em ordem:**
```
DOS Header       → IMAGE_DOS_HEADER    → e_magic ("MZ"), e_lfanew
NT Headers       → IMAGE_NT_HEADERS   → Signature ("PE\0\0")
File Header      → IMAGE_FILE_HEADER  → Machine, NumberOfSections
Optional Header  → IMAGE_OPTIONAL_HEADER → ImageBase, AddressOfEntryPoint, DataDirectory[]
Section Headers  → IMAGE_SECTION_HEADER  → Name, VirtualAddress, SizeOfRawData, PointerToRawData
```

**Data Directories relevantes:**
- `IMAGE_DIRECTORY_ENTRY_EXPORT` (índice 0): Export Directory → funções por nome
- `IMAGE_DIRECTORY_ENTRY_IMPORT` (índice 1): Import Directory → IAT walk

**conceito de RVA:** Relative Virtual Address: offset relativo ao ImageBase. Você vai escrever uma função `rva_to_ptr(base, rva)` e usar centenas de vezes.

```c
void *rva_to_ptr(void *base, DWORD rva) {
    return (void *)((uintptr_t)base + rva);
}
```

**exercício:** parser de PE em C que imprime todos os exports de uma DLL: nome da função, RVA, endereço calculado.

**referência:** corkami PE101/PE102 (visual) → depois `winnt.h` diretamente para as structs reais.

---

## etapa 5: inline hook detection

Combina tudo que veio antes. A lógica:

```
1. pega a DLL carregada em memória (base address do módulo)
2. abre o arquivo correspondente em disco
3. mapeia o arquivo em memória com CreateFileMapping / MapViewOfFile
4. pra cada export, compara os primeiros N bytes (8-16) da versão em memória vs disco
5. se divergir → hook detectado
```

**como um inline hook se parece:**
```asm
; versão limpa (disco)
mov r10, rcx
mov eax, 0x??
syscall

; versão hookada (memória)
jmp 0x????????   ; 0xE9 = jmp relativo / 0xFF 0x25 = jmp absoluto indireto
```

**APIs novas:**
```c
CreateFile()
CreateFileMapping()
MapViewOfFile()
UnmapViewOfFile()
```

**exercício:** dado um PID e um nome de DLL (ex: `user32.dll`), comparar os primeiros 16 bytes de cada export entre memória e disco e imprimir qualquer divergência.

---

## etapa 6: IAT hook detection

Mais simples que inline hook conceitualmente. A lógica:

```
1. pra cada módulo do processo alvo
2. parseia o Import Directory (DATA_DIRECTORY[1])
3. pra cada import, pega o endereço resolvido na IAT
4. verifica se esse endereço cai dentro do range do módulo que deveria conter a função
5. se cair fora → IAT hook
```

```c
// verificação de range
HMODULE expected_module = GetModuleHandle("user32.dll");
MODULEINFO modinfo;
GetModuleInformation(proc, expected_module, &modinfo, sizeof(modinfo));

uintptr_t func_addr = iat_entry;
uintptr_t mod_start = (uintptr_t)modinfo.lpBaseOfDll;
uintptr_t mod_end   = mod_start + modinfo.SizeOfImage;

if (func_addr < mod_start || func_addr >= mod_end) {
    // IAT hook detectado
}
```

---

## etapa 7: memória unbacked

Bônus que dá profundidade ao projeto. Usando `VirtualQueryEx` da etapa 2, você acha regiões suspeitas:

```c
// flags que indicam suspeita
MEM_PRIVATE + PAGE_EXECUTE_*   // executável mas privado (não backed por arquivo)
```

Região executável sem arquivo por trás em processo legítimo é red flag: rastro de process hollowing, injeção de shellcode, reflective DLL loading.

---

## sequência de estudo

```
etapa 1 → C + tipos Win32 + toolchain          3-5 dias
etapa 2 → processos, handles, VirtualQueryEx   4-6 dias
etapa 3 → enumeração de módulos                2-3 dias
etapa 4 → PE format                            1-2 semanas
etapa 5 → inline hook detection                1 semana
etapa 6 → IAT hook detection                   4-5 dias
etapa 7 → memória unbacked                     2-3 dias
```

---

## referências principais

| recurso | por quê |
|---|---|
| `winnt.h` + `psapi.h` | lê os headers direto: são a melhor documentação |
| *Windows Internals Part 1* | capítulos de memória virtual e loader |
| corkami PE101 / PE102 | visual, obrigatório antes de meter a mão no PE |
| `malapi.io` | catálogo de APIs com contexto ofensivo/defensivo |
| `hasherezade/pe-bear` | entender como um PE parser real é estruturado |

---

Na próxima parte da série eu começo a estudar de verdade, revendo conceitos sobre C e aprendendo coisas sobre a Win32.

`har har mahadev.`