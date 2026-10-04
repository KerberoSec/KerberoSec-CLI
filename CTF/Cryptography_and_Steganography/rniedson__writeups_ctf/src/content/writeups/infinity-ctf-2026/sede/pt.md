---
title: 'Sede: Writeup completo'
description: 'Por que "Sede"? Porque o alvo final é literalmente a matriz de uma empresa que você nunca deveria acessar: chegando lá ao explorar uma discordância entre a portaria que checa sua identidade e o corredor interno que decide pra onde você realmente vai.'
event: 'Infinity CTF 2026 (Harpia Security + SENAC)'
category: 'web'
subcategory: 'Path Traversal'
difficulty: 'hard'
tags:
  - path-traversal
  - auth-bypass
  - edge-routing
pubDate: 2026-08-22
author: 'Niedson'
draft: false
---

> [!NOTE/Sobre o desafio]
> **Plataforma:** Infinity CTF 2026 (Harpia Security + SENAC)
> **Categoria:** Web (pivoting) · **Dificuldade:** Hard · **Pontos:** 976 (o mais alto entre os desafios que resolvemos)
> **Vulnerabilidades:** Confusão de path entre borda e roteador interno → bypass de isolamento entre empresas
> **Flag:** `flag{infinity_ctf_2026_sede_e85ea669ac}`

Este é o writeup mais técnico do lote: e também o mais valioso, porque a técnica que resolve "Sede" não é específica desse desafio: é um padrão de bug que aparece em qualquer aplicação que tenha **duas camadas de infraestrutura na frente**, uma checando autorização e outra fazendo o roteamento de verdade. Vale a pena entender bem, porque ela se repete em pentests e outros CTFs.

---

## 1. Contexto

"Sede" era um app multi-empresa (multi-tenant): cada empresa logada só deveria conseguir ver os próprios dados: nesse caso, um "cofre" de arquivos por empresa, acessado por uma rota do tipo `/empresa/<id>/cofre`. O nome "pivoting" na categoria já é uma pista: o objetivo não é achar uma falha isolada, é usar um pequeno vazamento de acesso pra "pivotar" de uma empresa comum até uma empresa com privilégio.

Nossa sessão logava como a empresa `1337` (um id comum, sem privilégio especial).

### 1.1. Como funcionava a sessão

O cookie de sessão (`sede_session`) tinha a forma:

```
base64(json {"companyId": "1337"}) + "." + assinatura
```

A assinatura (provavelmente HMAC-SHA256, 32 bytes) era **verificada de verdade**: forjar um cookie com `companyId` trocado mas a assinatura antiga não passava; o servidor simplesmente reemitia um cookie default. Ou seja: **não dava pra simplesmente editar o cookie e virar outra empresa.** A autenticação em si estava correta. O bug tinha que estar em outro lugar.

---

## 2. Primeira vulnerabilidade real: prefix-match em vez de match exato

Investigando a rota `/empresa/<id>/cofre`, apareceu o primeiro achado real: o _check_ de "essa empresa é a sua mesmo?" comparava o path assim:

```python
if path.startswith("/empresa/" + minha_empresa):
    # autorizado
```

Repare no problema: isso é um **prefixo**, não uma igualdade. Se `minha_empresa = "1337"`, então `path.startswith("/empresa/1337")` também é `True` para `/empresa/13372/cofre`, `/empresa/1337999/cofre`, ou qualquer id que **comece** com os dígitos `1337`: mesmo sendo, na prática, uma empresa completamente diferente.

> [!TIP/Prefix-match onde deveria ser match exato]
> Esse é um bug clássico e fácil de reproduzir em código real: `startswith()` (ou equivalentes em outras linguagens) parece "quase" um match de igualdade, mas não é. Sempre que uma checagem de autorização usa `startswith`/`includes` num identificador que devia ser comparado por igualdade exata, vale testar ids que compartilham só o **prefixo** do valor esperado.

O problema prático: essa técnica só alcança empresas cujo ID **começa literalmente com os dígitos `1337`**: e isso é sorte de numeração, não uma falha explorável de forma ampla. Uma varredura sequencial de sufixos (`13370` a `1337280`, depois `13371780` a `13372450`, aproximadamente) não achou nenhuma empresa real com esse prefixo.

> [!IMPORTANT/Armadilha de infraestrutura]
> A instância desse desafio derrubava com muito pouca concorrência: por volta de 10 a 15 conexões **simultâneas** já geravam "connection refused". Testar com 30 threads ao mesmo tempo derrubava a instância inteira. A lição prática: em qualquer alvo desconhecido, comece sequencial ou com poucos workers (3-5) e só aumente a concorrência depois de confirmar que a instância aguenta: descobrir o limite quebrando a instância custa tempo de recuperação.

Nesse ponto o vetor estava certo, mas emperrado: sem saber um ID de empresa que realmente comece com `1337`, a técnica de prefixo sozinha não levava a lugar nenhum. Era preciso outra forma de alcançar um ID arbitrário: não só um vizinho por prefixo.

---

## 3. A virada: dois estágios de parsing de path que discordam

A pista para o vetor final não estava escondida: estava no texto do próprio desafio: _"migramos a validação de acesso por empresa para a borda, antes do roteador interno montar a página."_ Lida como _flavor text_, essa frase passa despercebida. Lida literalmente, ela descreve exatamente a arquitetura do bug: **duas camadas diferentes de infraestrutura, cada uma interpretando o path de um jeito.**

- A **borda** (proxy/gateway na frente da aplicação) faz o check de autorização: e faz isso olhando a **string crua** do path, sem decodificar nada.
- O **roteador interno** da aplicação, depois de passar pela borda, faz o roteamento de verdade: e esse sim **decodifica** sequências como `%2f` (equivalente a `/`) e **resolve** `../` normalmente, como qualquer resolução de caminho de arquivo faria.

Se essas duas camadas discordam sobre o que o mesmo path _significa_, dá pra construir um path que a borda lê de um jeito (e libera) e que o roteador interno lê de outro jeito (e executa):

```
/empresa/1337%2f..%2f9001/cofre
```

- **Na borda**: a string crua começa literalmente com `/empresa/1337`: passa no `startswith`, autorizado.
- **No roteador interno**: `%2f` vira `/`, então o path decodificado é `/empresa/1337/../9001/cofre`. Resolvendo o `../` normalmente (assim como `cd 1337 && cd .. && cd 9001` no sistema de arquivos), isso aponta pra empresa **`9001`**: uma empresa completamente diferente da nossa.

A resposta confirmou a mudança: em vez de "Acesso negado" (o que apareceria se a borda tivesse barrado), veio **"Empresa não encontrada"** para ids inválidos e, com o id certo, o conteúdo real da empresa `9001`: que se revelou ser **"Diretoria"**, uma conta administrativa.

> [!TIP/O padrão geral, reutilizável em qualquer app com duas camadas]
> Sempre que uma aplicação tem **borda + roteador interno** (ou qualquer duas camadas de infraestrutura em sequência), e uma delas valida o path como **string crua** enquanto a outra faz **decode + resolução de `../`/`%2f`**, existe uma classe inteira de bug de confusão de path entre as duas camadas. Não é uma falha do código da aplicação em si: é uma discordância entre dois estágios de parsing. Vale testar essa técnica em qualquer alvo com autorização baseada em ID no path, especialmente quando há menção a "borda"/"gateway"/"edge" na descrição ou na arquitetura observada.

---

## 4. Capturando a flag

Dentro da página da empresa `9001` ("Diretoria") estava um `vault_id`: um identificador hexadecimal de aparência aleatória (`a82c4f19be`, ~40 bits, não brutável em tempo razoável).

A rota que de fato serve o conteúdo do cofre não exige autenticação nenhuma:

```
GET /api/cofre/a82c4f19be
```

Sem essa vulnerabilidade de path, esse endpoint seria seguro: o `vault_id` funciona como um "segredo" de posse (quem tem o id, acessa), e só quem já estivesse dentro da página da empresa 9001 saberia o valor. O bypass de path traversal foi exatamente o que permitiu chegar até essa página sem autorização.

### 🚩 Flag

```
flag{infinity_ctf_2026_sede_e85ea669ac}
```

---

## 5. Recapitulando a cadeia

```
1. Sessão via cookie assinado (companyId=1337): assinatura verificada de verdade,
   não dá pra forjar diretamente.

2. Achado parcial: check de autorização em /empresa/<id> usa startswith()
   em vez de comparação exata.
   → só alcança empresas cujo id COMEÇA com "1337": sorte de prefixo,
     sweep sequencial não achou nada assim.

3. Virada: a pista textual do desafio ("validação migrou pra borda, antes do
   roteador montar a página") descreve dois estágios de parsing de path.
   → /empresa/1337%2f..%2f9001/cofre
     borda: vê string crua "/empresa/1337..." → autoriza
     roteador interno: decodifica %2f, resolve ../ → rota pra empresa 9001

4. Empresa 9001 = "Diretoria"/admin → vault_id exposto na página

5. GET /api/cofre/<vault_id> sem autenticação → flag
```

---

## 6. Por que a aplicação era vulnerável (e como corrigir)

A causa raiz não está em um único ponto de código: está na **arquitetura**: duas camadas fazendo validação/roteamento de path de formas incompatíveis.

1. **A borda deveria validar o path DEPOIS de normalizado**, não antes: ou seja, decodificar `%2f` e resolver `../` primeiro, e só então comparar com a lista de prefixos/ids autorizados. Validar a string crua é sempre arriscado quando existe uma etapa de decodificação em algum lugar depois.
2. **Usar comparação exata, não prefixo, para autorização por ID.** `path == "/empresa/" + minha_empresa + "/cofre"` (ou extrair o segmento do path e comparar o valor inteiro) elimina o problema do prefixo por completo, independente do bug de decodificação.
3. **Endpoints que servem dados sensíveis por ID "secreto" (como o `vault_id`) não deveriam ser a única camada de proteção.** Se o `vault_id` vaza por qualquer outro caminho (como aconteceu aqui), não há segunda barreira.
4. **Borda e aplicação deveriam compartilhar exatamente a mesma lógica de normalização de path**: na prática, isso costuma significar: fazer a validação de autorização **depois** do roteamento final, dentro da própria aplicação, e não numa camada de infraestrutura separada que só vê a string crua.

---

## 7. Lições para levar

- **Leia a descrição do desafio (ou de qualquer sistema real) como uma afirmação técnica, não só como tema.** "Migramos a validação pra borda, antes do roteador montar a página" não era decoração: era literalmente a arquitetura do bug.
- **`startswith()`/prefix-match em vez de igualdade exata é um padrão de bug reconhecível**: vale testar sempre que uma checagem de autorização compara um ID dentro de um path.
- **Duas camadas de infraestrutura na frente de uma aplicação são, por si só, uma superfície de ataque**: não pelo que cada uma faz sozinha, mas pela possibilidade de discordarem sobre o mesmo dado. `%2f` e `../` são os candidatos óbvios pra testar essa discordância em qualquer sistema com proxy/gateway + roteador interno.
- **Meça a capacidade da instância antes de brutar.** Um sweep agressivo demais pode derrubar o próprio alvo e desperdiçar tempo de recuperação: comece conservador.
- **Retomar o trabalho de outra pessoa vale a pena.** O achado que travou (prefix-match, sorte de prefixo) não foi descartado: foi a base que levou à pista certa (duas camadas de parsing) na sessão seguinte.
