---
title: "Syscalls, SysWhisper e mecanismos de detecção contra este tipo de tecnica"
description: "Este artigo explora o funcionamento interno das syscalls no Windows demonstrando o fluxo via LSTAR e KiServiceTable até a calling convention x64. Alem disso, apresenta as técnicas de evasão baseadas nelas: direct e indirect syscalls com SysWhispers (v1, v2 e v3), egghunter e jitter randomizer. Na sequência, apresenta como os EDRs detectam essas técnicas (hooks no ntdll, checagem de return address, instrumentation callbacks e ETW) e os bypasses clássicos documentados para cada camada."
tags: ["Syscall", "Hooks", "SysWhisper", "ETW", "EDR", "Bypass"]
date: 2026-08-15
draft: false
---

#### 1. Como uma syscall funciona

##### 1.1: TL;DR sobre syscalls
1. O programa em Ring 3 coloca o número do syscall em `EAX`.
2. Os argumentos vão em registradores: `R10`, `RDX`, `R8`, `R9` (e o resto na pilha).
3. O CPU consulta o MSR `LSTAR` e pula para `KiSystemCall64` no kernel.
4. O kernel usa `EAX` como índice na `KiServiceTable` (a SSDT) para encontrar o handler real (`NtOpenProcess` do kernel, `NtCreateFile`, etc.).
5. Retorno: `sysret` volta para o endereço salvo em `RCX`.

##### 1.2: Calling Convention
É a ordem em que os registradores são passados para o stub que, por sua vez, manda os mesmos valores para o kernel executá-los.

Na convenção do Windows x64, os 4 primeiros argumentos são passados em `RCX`, `RDX`, `R8`, `R9` (nessa ordem), e o resto vai na pilha. Mas repara numa pegadinha: a instrução `syscall` **clobbera o `RCX`**: ela salva o endereço de retorno nele automaticamente. Por isso o stub move o primeiro argumento de `RCX` para `R10` antes de disparar a syscall: para o argumento não ser sobrescrito no momento da transição.

Detalhes de bônus sobre a convenção:
- **Shadow space**: o chamador reserva 32 bytes na pilha (4 slots de 8 bytes) para o callee usar, mesmo que a função tenha poucos argumentos.
- **Alinhamento de pilha**: a pilha deve estar alinhada em 16 bytes no momento da chamada. O kernel inclusive exige um alinhamento específico (64 bytes) para o instrumentation callback, como veremos lá na seção 6.2.

##### 1.3: SSN
O número/índice que a syscall possui dentro do registrador `RAX`/`EAX` (não é um endereço: é o valor usado para indexar a `KiServiceTable`).

##### 1.4: Stub
Tem apenas uma função: a transição entre os valores que estão sendo setados pelos registradores até chegar no kernel. Essa transição é realizada através da organização dos registradores e da chamada para a syscall do sistema.

Exemplo:
> Um exemplo seria um entregador dos correios que organiza a correspondência correta em sua bolsa (organização dos registradores) de acordo com a numeração da casa (SSN: o número presente no EAX) e o formato da correspondência: por exemplo, nome do remetente, conteúdo e destinatário serão a calling convention. Aí sim ele chama alguém para receber a correspondência (syscall). O dono da casa recebe e visualiza o conteúdo presente na correspondência (kernel pega os valores da syscall e executa).

##### 1.5: MSR
Conjunto de registradores que não estão na lista dos registradores de controle padrão da arquitetura x86/x86-64. Suas características serão listadas abaixo:
- Não são iguais aos registradores de gerenciamento padrão como `rax`, `rbx`, `rcx`, etc.
- Esses registradores podem controlar coisas internas da CPU, como cache, energia e virtualização, bem como os mecanismos de syscall.
- Apenas o kernel consegue lê-los/escrevê-los via instruções `RDMSR`/`WRMSR`.

##### 1.6: LSTAR
Também pode ser chamado de Long System Target Address Register, MSR (`0xC0000082`). É especificamente o registrador que guarda o endereço para o qual a CPU pula quando a syscall é executada.

O fluxo aplicado por esse registrador, desde o boot até a execução de uma syscall, pode ser observado abaixo:
- No boot, o Windows escreve em LSTAR o endereço da função do kernel que trata as syscalls. Sim, existe uma função específica no kernel apenas para tratar as syscalls, chamada `KiSystemCall64`.
- Ao executar/disparar uma syscall, acontece o seguinte:
	- A CPU pega o endereço de retorno em `RCX`.
	- Também pega as `RFLAGS` e manda para `R11`.
	- Lê o `LSTAR` e pula para a função do kernel que executa essa syscall, diretamente.
	- Com isso, o kernel usa o valor de `EAX` (o SSN) para indexar a `KiServiceTable`, que é uma tabela estática pronta para receber os valores presentes na syscall.

OBS: a `KiServiceTable` é um array estático que nasce dentro da imagem do kernel, na seção `.rdata`, montado na compilação do ntoskrnl. Mas aprofundar em kernel não é o intuito desse artigo.

##### 1.7: Outros MSRs que completam o mecanismo:
- `STAR`: define os segmentos CS/SS usados na entrada da syscall.
- `CSTAR`: endereço alvo do syscall em modo compatibilidade (substitui o LSTAR em 32-bit).
- `SFMASK`: máscara de flags que o CPU zera na entrada.

Só mais um detalhe, prometo. As entradas da `KiServiceTable` não são ponteiros absolutos: na verdade, são offsets relativos de 32 bits (um valor de base somado a um offset fixo na compilação). O que acontece a cada syscall não é o offset "mudar", e sim o **cálculo** base + offset ser feito na hora do lookup: favorecendo o mecanismo de ASLR e economia de espaço.

##### 1.8: SSN vs SSDT
SSN (System Service Number) é o valor que vai dentro de `EAX` para ser indexado na tabela `KiServiceTable` citada anteriormente.

SSDT é a estrutura de dados que guarda as tabelas. O `KeServiceDescriptorTable` do kernel é um array de descritores, cada um apontando para uma coisa diferente:
- `KiServiceTable` → o array de handlers.
- `KiArgumentTable` → quantos bytes de argumentos cada syscall consome.
- `KiServiceLimit` → quantas syscalls existem.

A relação fica da seguinte maneira:
- `SSDT[descritor]` ──> `KiServiceTable[SSN]` ──> handler do kernel.

##### 1.9: Ciclo Completo de uma Syscall

```
Stub do ntdll → syscall → CPU lê LSTAR → KiSystemCall64
→ bounds check (EAX < KiServiceLimit?) → KiServiceTable[EAX] → handler (NtOpenProcess do kernel)

Handler termina → KiSystemServiceExit (ou KiSystemCallExit)
→ sysret → CPU carrega RIP = RCX, RFLAGS = R11
```

Dessa vez, com foco na segunda metade do ciclo de uma syscall, temos:
- `KiSystemServiceExit`: função do kernel que restaura o trap frame e executa a instrução `sysretq`.
- Detalhe: o `sysretq` só existe quando o retorno é para user-mode 64-bit, com o endereço canônico.
- Caso contrário, é executado o `KiSystemCallExit2`, que usa `iretq`: retorno para processos WOW64/32-bit.
- Último caso: se o endereço não for canônico, o `iretq` também será usado, pois o `sysret` bugaria nesses casos.

O stub padrão do ntdll.dll para `NtOpenProcess` é literalmente isso:
```asm
; ntdll.dll!NtOpenProcess
mov r10, rcx       ; primeiro argumento (ProcessHandle) vai para R10
mov eax, 26h       ; SSN: System Service Number de NtOpenProcess nesta build
syscall            ; salta para o kernel
ret                ; volta para o chamador
```

O SysWhispers ajuda a tratar um problema que é a mudança do valor inserido no `eax` (SSN), que muda entre builds/versões diferentes do Windows.

O motivo raiz dessa mudança é o que chamamos de **contrato de build**: o ntdll e o ntoskrnl são compilados juntos, e os índices dos syscalls são "combinados" entre os dois nessa compilação. Quando a Microsoft adiciona/remove um syscall numa build nova, os índices de todos os syscalls seguintes deslocam: e o número que funcionava ontem pode nem existir mais hoje.

#### 2. Hooks no ntdll
A técnica mais comum é o inline hook: o **EDR** sobrescreve os primeiros bytes do stub do ntdll com um `jmp` para o código dele: colocando-se **antes** do stub original da syscall. Com isso, quando o programa chama `NtOpenProcess`, ele cai no hook primeiro, o EDR inspeciona os argumentos (processo alvo, access mask, etc.) e pode logar ou bloquear. O **bypass** é o que o SysWhispers faz *depois*: chamar o syscall sem passar por esse stub hookado.

Exemplo:
```
Antes:
mov r10, rcx
mov eax, 26h
syscall

Depois:
jmp <código do EDR>
<stub original que vem após na memória>
syscall
```

Outra ideia do SysWhispers: invocar a função que está contida dentro do ntdll, porém chamá-la "por fora" da DLL: invocando diretamente seu código através da syscall.
```mov eax, SSN; syscall```

Antes de seguir, vale nomear os dois termos que aparecem daqui pra frente, porque eles confundem fácil na pesquisa:

- **Direct syscall**: você mesmo monta o stub (`mov r10, rcx; mov eax, SSN; syscall`) no seu próprio código e executa o `syscall` de lá. O problema: o endereço de retorno aponta para o seu módulo, e não para a ntdll: o que EDRs detectam.
- **Indirect syscall**: você monta o stub no seu código, mas em vez de executar o `syscall` aí, faz um `jmp` para a instrução `syscall; ret` que já existe **dentro do ntdll**. O endereço de retorno na pilha durante a execução do kernel aponta para a ntdll: confundindo as checagens de return address. (É a técnica do SW3, na seção 3.3.)

#### 3. Versões do SysWhispers
##### 3.1: SysWhispers v1
Essa versão tem como **característica** gerar headers + stubs em `.asm` com os SSNs **hardcoded** para uma versão específica do Windows (você dizia quais syscalls queria e para qual build, e ele gerava o código com os números fixos). O **problema** dessa versão é que, como os valores são fixados de acordo com a versão, precisa rebuildar a cada nova versão do Windows.

##### 3.2: SysWhispers v2
Em vez de números fixos, o SW2 resolve o número na hora da execução, escaneando o ntdll do próprio sistema. A lógica (a mesma de técnicas como Hell's Gate):

```text
1. Encontra o endereço de NtOpenProcess no ntdll (via GetProcAddress ou
   parseando o export directory).
2. Lê os bytes do stub. O stub tem um formato conhecido:
    mov r10, rcx     ; 4C 8B D1
    mov eax, <SSN>   ; B8 XX (o byte XX é o número!)
    syscall          ; 0F 05
    ret              ; C3
    NtOpenProcess ENDP
3. Extrai o byte na posição certa: o SSN: naquela máquina, naquela build.
4. Guarda num array e usa nos stubs gerados.
```

O problema dessa versão: a syscall acontece dentro do seu módulo (módulo do SysWhispers). Com isso, é possível rastrear o endereço de retorno presente no `RCX` e saber para qual `.exe`/`.dll` o stub está apontando na instrução `ret`: diferente de uma syscall legítima, que apontaria para ntdll.

##### 3.3: SysWhispers v3
A novidade dessa versão é que, ao invés de realizar a syscall e retorná-la dentro do próprio módulo, ela é realizada através de um jmp para o endereço de memória legítimo dentro da ntdll.

```text
NtOpenProcess PROC
    mov r10, rcx
    mov eax, <SSN>
    jmp qword ptr [addr_of_syscall_in_ntdll] ; lugar que seria a syscall no ntdll
    NtOpenProcess ENDP
```

Como resultado, a syscall é executada na `KiSystemCall64` do kernel e, no retorno, o endereço apontado pelo `RIP` salvo em `RCX` é o da ntdll: confundindo determinadas checagens que validam se a syscall veio do ntdll.

#### 4. Outras Melhorias (v3)

##### 4.1: Egghunter / Halo's Gate
A contramedida para o SW2 seria o EDR mudar o stub do ntdll para uma versão falsa ou apagar a assinatura: corrompendo os primeiros bytes do stub. O **egghunter** do SW3 escaneia a ntdll inteira procurando stubs **sobreviventes** em meio a bytes modificados: se o padrão exato estiver corrompido, ele varre as páginas vizinhas atrás do stub real "próximo" e emenda os bytes para extrair o SSN mesmo assim. É uma versão mais robusta do Hell's Gate: que só funciona com stubs limpos: e é a mesma ideia do Halo's Gate.

##### 4.2: Jitter Randomizer
O stub em ASM é formado num buffer em runtime. Para randomizar a assinatura binária do stub é necessário alterar a ordem com que as instruções são escritas. Pode-se inserir diversos NOPs entre instruções para tal ação.

#### 5. Detecção pelos Sistemas Defensivos
- **Checagem de Return Address**: já discutida anteriormente; verifica se o endereço de retorno da pilha é referente à ntdll legítima.
- **Hardware Breakpoints**: colocar antes do endereço da syscall no ntdll um breakpoint para interromper todo o processo de evasão.
- **Instrumentation Callbacks** (`SetProcessMitigationPolicy` → `ProcessInstrumentationCallback`): o kernel notifica assinantes de cada syscall. *(Cuidado: `KeSetEvent` não é telemetria: é uma API genérica de sincronização de threads/drivers. E ETW também não é um callback por syscall: é logging. Vou separá-los abaixo.)*
- **ETW**: sistema de logging do Windows. Providers (user-mode ou kernel) gravam eventos em sessions; quem consome são os EDRs. Não é um callback por syscall.
- **Kernel callbacks de thread** (`PsSetCreateThreadNotifyRoutine`): o kernel visualiza threads criadas recentemente no sistema e checa se o endereço de início está no módulo e não na ntdll.
- **Registrador `RSP` alinhado / valores de trap frame**: o kernel guarda o stack pointer de user-mode; EDRs com kernel driver podem auditar esses frames.

#### 6. Bypasses Clássicos (Documentados Publicamente)

##### 6.1: TL;DR
```text
┌─────────────────────────┬─────────────────────────┬────────────────────────┐
│ Camada                  │ Exemplo                 │ Bypass possível em     │
│                         │                         │ userland?              │
├─────────────────────────┼─────────────────────────┼────────────────────────┤
│ Hook em ntdll           │ inline hook do EDR      │ Sim: direct syscall   │
│ (userland)              │                         │ (SysWhispers)          │
├─────────────────────────┼─────────────────────────┼────────────────────────┤
│ Instrumentation         │ ProcessInstrumentation… │ Sim: patch da função  │
│ callback (kernel        │                         │ em memória             │
│ invoca, função          │                         │                        │
│ user-mode)              │                         │                        │
├─────────────────────────┼─────────────────────────┼────────────────────────┤
│ ETW user-mode           │ EtwEventWrite           │ Sim: patch do export  │
├─────────────────────────┼─────────────────────────┼────────────────────────┤
│ Notify routine / ETW    │ PsSetCreateProcessNoti… │ Não: só com acesso de │
│ kernel                  │ Microsoft-Windows-Thre… │ kernel                 │
└─────────────────────────┴─────────────────────────┴────────────────────────┘
```

##### 6.2: Instrumentation Callback (ProcessInstrumentationCallback)
Quando a política é aplicada a um processo, o kernel, no caminho da syscall (dentro de `KiSystemServiceStart`), faz um call indireto para a função do callback, que mora no seu processo (é um endereço user-mode guardado em estruturas do kernel). Ela é chamada na entrada e na saída de cada syscall, com uma exigência de alinhamento de pilha de 64 bytes.

###### 6.2.1: Métodos de Bypass:
- **Patch do callback em memória**: o callback é mapeado como uma função executada em user-mode. Alterando a região de memória com `VirtualProtect`, é possível reescrever o valor de retorno da função para sempre retornar NULL, por exemplo: não fazendo nada. Entretanto, se o kernel possuir um kernel driver re-armando o patch, é necessário bypass a nível de kernel.
- **Rodar fora do processo instrumentado**: ao invés de tentar bypassar a instrumentação do processo (como no caso acima), mapeia os processos e identifica aqueles que não possuem instrumentação.
- **Roubar a corrida (race)**: a política é aplicada em algum momento. Se executar o que precisa antes dela acontecer, o callback ainda não existe.
- **Patch no kernel**: sobrescrever o ponteiro do callback que está dentro da tabela no kernel e, com isso, fazer o kernel retornar a cada syscall naquele processo para uma função escrita pelo atacante, ou simplesmente fazer NULL.

##### 6.3: ETW
Código instrumentado chama `EtwEventWrite*` (ntdll) → `NtTraceEvent` → kernel `EtwpLogEvent`, que entrega o evento à session. O EDR normalmente usa uma session de kernel (ex.: `Microsoft-Windows-Threat-Intelligence`, `Microsoft-Windows-Kernel-Process`) para ver criação de processo, alocação de memória, etc.

###### 6.3.1: Métodos de Bypass:
- **Patch de exports na ntdll**: mudar o começo do stub por `xor eax, eax; ret (33 C0 C3)`, fazendo a syscall retornar 0 sem logar nada para o EDR.
- **Patch do check de enable bit**: na memória do processo existe uma lista de bits (bitmap) onde cada bit é ativado individualmente quando determinado provider (um GUID): código que gera os eventos utilizando chamadas ETW: está com uma session ativa. Sendo assim, zerando o valor desse bitmap, nenhuma informação de criação de processo, alocação de memória, etc., é logada.
- **Patch no kernel**: necessário principalmente quando o provider é **kernel-mode** (ex.: `Microsoft-Windows-Threat-Intelligence`): ele é chamado de dentro do próprio ntoskrnl e **não passa pelo ntdll de jeito nenhum**, então o patch user-mode nunca o alcança. O alvo passa a ser a função do kernel (`EtwpLogEvent`), o que exige acesso de escrita em ring 0: e é aí que entra o elo com BYOVD (escrita arbitrária via driver vulnerável). Motivo secundário: mesmo para providers user-mode, como o ntdll é recarregado do disco a cada processo, o patch precisa ser reaplicado por processo: o patch no kernel resolve de uma vez.

#### Linha do tempo da evolução
```text
┌────────┬────────────────────────┬─────────────────────────┬──────────────────────────────┐
│ Versão │ Técnica                │ Fraqueza que ataca      │ Nova fraqueza                │
├────────┼────────────────────────┼─────────────────────────┼──────────────────────────────┤
│ v1     │ SSN hardcoded          │ Hooks no ntdll          │ Quebra com novas builds      │
├────────┼────────────────────────┼─────────────────────────┼──────────────────────────────┤
│ v2     │ SSN resolvido em       │ Builds diferentes       │ Return address aponta pro    │
│        │ runtime (scan no ntdll)│                         │ próprio módulo               │
├────────┼────────────────────────┼─────────────────────────┼──────────────────────────────┤
│ v3     │ Indirect syscall +     │ Detecção por return     │ Instrumentation callbacks de │
│        │ egghunter + JIT        │ address / assinatura    │ kernel (não contornável em   │
│        │ randomizer             │ do stub                 │ userland)                    │
└────────┴────────────────────────┴─────────────────────────┴──────────────────────────────┘
```

#### Links
https://github.com/klezVirus/SysWhispers3
https://klezvirus.github.io/posts/NoSysWhispers/
https://www.ired.team/offensive-security/code-injection-process-injection/how-to-hook-windows-api-using-c++