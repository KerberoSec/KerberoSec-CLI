---
title: "PadaSentry #03: o hook que não dá pra ver"
description: "Etapa 1 do roadmap na prática: o primeiro tapa na cara chega cedo. WH_KEYBOARD_LL não é enumerável do user space, e boa parte dos keyloggers reais nem usa hook. O plano muda antes da primeira linha de detecção."
date: 2026-07-16
platform: "dev-log"
tags: ["windows", "c", "win32", "keylogger", "malware-analysis"]
series: "padasentry"
part: 3
draft: false
---

Comecei o **PadaSentry** com uma ideia que soava óbvia: se um keylogger instala um hook de teclado, então basta listar os hooks instalados no sistema e ver quem não devia estar ali. Escrever isso em C, colar na frente de um `printf`, pronto: detector no ar num fim de semana.

Durou até a primeira hora de leitura da documentação da Win32.

O alvo neste primeiro post é o mecanismo mais famoso de captura de teclas no Windows: `SetWindowsHookEx` com o tipo `WH_KEYBOARD_LL`, o _low-level keyboard hook_. É o que aparece em 90% dos tutoriais de "faça seu keylogger" e no código de boa parte do malware de commodity.

---

## Fase 0: a suposição ingênua

O plano original era mais ou menos assim, em pseudocódigo:

```c
// o sonho:
Hook hooks[256];
int n = EnumerateInstalledHooks(hooks, 256);   // <- essa função não existe
for (int i = 0; i < n; i++)
    if (is_suspicious(hooks[i].owner))
        alert(&hooks[i]);
```

O problema mora naquela linha do meio. **A Win32 não expõe nenhuma API pública para enumerar hooks instalados.** Não tem `EnumWindowsHooks`, não tem `GetHookInfo`, não tem nada. A tabela de hooks vive dentro do `win32k.sys`, no kernel, indexada por _desktop_, e a única forma de tocar nela do user space é através de estruturas não documentadas que mudam entre versões do Windows. Ou seja: dá pra fazer, mas você vira refém de offsets internos que a Microsoft pode trocar em qualquer Patch Tuesday. Fundação de areia pra uma ferramenta de segurança.

## Fase 1: por que os LL hooks são invisíveis

Aqui vale entender _por que_ o `WH_KEYBOARD_LL` é especialmente escorregadio, porque isso muda o resto do projeto.

Os hooks "normais" (`WH_KEYBOARD` sem o `_LL`) exigem uma DLL que é **injetada em todo processo que recebe input**. Isso, ironicamente, seria fácil de detectar: bastava varrer os módulos carregados de cada processo e procurar uma DLL estranha aparecendo em todo lugar. Uma assinatura gorda e óbvia.

Só que o `WH_KEYBOARD_LL` não funciona assim. O callback de um low-level hook roda **no contexto da própria thread que instalou o hook**: o sistema serializa os eventos de teclado e os entrega via message queue daquele processo. Não há DLL injetada em lugar nenhum. O keylogger fica sentado sozinho no processo dele, com um message loop rodando, e o sistema operacional educadamente entrega cada tecla que você digita na porta dele.

> Sem DLL injetada, não há artefato compartilhado pra caçar. O hook "não existe" em nenhum lugar que o user space consiga apontar o dedo. Essa é a raiz do problema.

_"Então o mecanismo mais documentado é justamente o que menos deixa rastro convencional"_: foi mais ou menos esse o pensamento que me fez fechar a doc e repensar a arquitetura inteira.

## Fase 2: e tem pior: nem todo keylogger usa hook

O prego final no caixão da abordagem "enumera hooks" é que **uma parcela enorme dos keyloggers reais nem chega a chamar `SetWindowsHookEx`.** Os dois caminhos alternativos, ambos triviais de implementar:

- **Polling com `GetAsyncKeyState` / `GetKeyboardState`**: um loop apertado perguntando "essa tecla está pressionada agora?" 60 vezes por segundo, para as 256 virtual-keys. Zero hooks. Zero API que grite "sou um keylogger". Só um `while(1)` e aritmética.
- **Raw Input (`RegisterRawInputDevices`)**: a API legítima que jogos usam pra ler o teclado com baixa latência. Um keylogger registra um dispositivo raw input, recebe `WM_INPUT`, e lê tudo. Perfeitamente dentro do "uso pretendido" da API.

Se o PadaSentry só olhasse pra hooks, ele seria cego pra essas duas famílias inteiras. Um detector que erra o alvo mais comum não é um detector, é um teatro.

## O pivô

Então o projeto muda de eixo antes mesmo da primeira linha de detecção de verdade. Sai a ideia de **enumerar hooks** (impossível de forma limpa e incompleta mesmo se fosse possível), entra a ideia de **caçar o comportamento**:

1. Varrer processos e seus módulos/imports procurando a combinação suspeita: `SetWindowsHookEx` + `GetAsyncKeyState` + `RegisterRawInputDevices` num binário sem cara de app legítimo.
2. Sinalizar processos ocultos com message loop e sem janela visível.
3. Correlacionar com escrita em disco: quem lê o teclado _e_ escreve um arquivo que cresce a cada tecla é um forte candidato.

Nenhum desses sinais é prova sozinho: jogos leem raw input, ferramentas de acessibilidade usam `GetAsyncKeyState` de forma legítima. A graça vai estar em **combinar** os sinais e pontuar, não em achar uma bala de prata. Que é, no fim, como quase toda detecção decente funciona.

No próximo post eu começo a parte concreta: enumerar processos e seus módulos carregados com a `ToolHelp32` e a `psapi`, e montar o primeiro esqueleto de scoring em C. A partir daqui é código de verdade compilando com o MinGW.

`har har mahadev.`