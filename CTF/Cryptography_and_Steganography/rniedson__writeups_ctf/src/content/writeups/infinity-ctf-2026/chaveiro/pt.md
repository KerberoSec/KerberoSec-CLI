---
title: 'Chaveiro: Writeup completo'
description: '"Chaveiro" é o personagem certo: o sistema deixa você mesmo indicar qual chave deve confirmar sua identidade: e apontando pra um lugar vazio, a "chave" usada também fica vazia, e qualquer pessoa consegue usá-la pra se passar por administrador.'
event: 'Infinity CTF 2026 (Harpia Security + SENAC)'
category: 'web'
subcategory: 'JWT'
difficulty: 'medium'
tags:
  - jwt
  - kid-header-injection
pubDate: 2026-08-22
author: 'Niedson'
draft: false
---

> [!NOTE/Sobre o desafio]
> **Plataforma:** Infinity CTF 2026 (Harpia Security + SENAC)
> **Categoria:** Web · **Dificuldade:** Medium · **Pontos:** 304
> **Vulnerabilidades:** JWT `kid` header injection: chave de assinatura lida de um caminho de
> arquivo controlado pelo atacante
> **Flag:** `flag{infinity_ctf_2026_chaveiro_75f1462dee}`

Mais um desafio de JWT (_JSON Web Token_, o mesmo tipo de token do writeup do Carimbo: vale a pena
ler os dois, pois cada um ataca uma parte diferente do mesmo mecanismo), mas com uma superfície de
ataque diferente: aqui o problema não está no algoritmo declarado, está em **como o servidor decide
qual chave usar pra verificar a assinatura**.

---

## 1. Contexto

Um JWT tem três partes: `header.payload.signature`: e o **header** é um JSON pequeno que descreve
metadados sobre como o token foi assinado, como o algoritmo (`alg`). Muitas implementações de JWT
suportam um campo opcional no header chamado `kid` (**k**ey **ID**): ele existe justamente pra
permitir que um sistema tenha **várias chaves de assinatura ativas ao mesmo tempo**: por exemplo,
durante uma rotação de chaves (trocar a chave antiga por uma nova sem invalidar tokens já emitidos),
ou quando times/ambientes diferentes usam chaves diferentes. O token diz "eu fui assinado com a
chave chamada X", e o servidor consulta qual chave corresponde a X antes de verificar a assinatura.

O desafio documentava isso de forma explícita: o `kid` do JWT era usado como um **caminho** pra
localizar o arquivo da chave correspondente no sistema de arquivos do servidor. Essa é literalmente a
superfície de ataque: a documentação já entregava onde olhar.

## 2. Conceito explicado do zero: por que `kid` como caminho de arquivo é perigoso

Um detalhe crucial sobre JWT que costuma passar despercebido: **o header não é secreto, e o cliente
o escreve.** Quando você recebe um JWT de um servidor, o header e o payload são só JSON codificado em
base64url: qualquer um pode decodificar E reescrever essas partes. O que impede alguém de mudar o
payload (por exemplo, de `role: parceiro` pra `role: admin`) é a **assinatura**: se você muda um byte
do header ou do payload sem recalcular a assinatura com a chave certa, a verificação falha.

Só que, se um dos campos do header (`kid`, ou variantes como `jku`/`x5u` em outros ataques
conhecidos) **influencia qual chave o servidor vai usar pra verificar**, o atacante ganha um controle
insidioso: ele escolhe o `kid`, escolhe a chave correspondente sabendo (ou controlando) o conteúdo
dela, e então **assina o próprio token com essa mesma chave**: passando na verificação porque ele
literalmente usou a chave que o servidor vai consultar. Em outras palavras: o atacante não está
quebrando a assinatura, está enganando o servidor pra verificar com uma chave que ele mesmo já sabe.

Quando esse `kid` é resolvido **como um caminho de arquivo**: `chave = ler_arquivo(f"chaves/{kid}")`
ou parecido: dois problemas nascem ao mesmo tempo:

1. **Path traversal**: se o servidor não sanitiza o valor, `kid=../../etc/passwd` (ou caminhos
   parecidos) poderia ler qualquer arquivo do sistema como se fosse uma chave.
2. **Arquivos com conteúdo previsível**: mesmo sem conseguir "escapar" pra fora da pasta de chaves,
   apontar pra um arquivo cujo conteúdo já é conhecido (ou sempre vazio) já é suficiente, porque o
   atacante só precisa **saber** qual vai ser a chave, não roubá-la.

---

## 3. Reconhecimento

Um token normal, emitido pelo próprio app após login, tinha um header decodificado assim:

```json
{ "alg": "HS256", "kid": "chaves/producao.key", "typ": "JWT" }
```

Ou seja: o servidor, ao verificar um token, pega o valor de `kid`, resolve como um caminho relativo a
uma pasta de chaves, lê o conteúdo desse arquivo e usa esse conteúdo como segredo pra verificar a
assinatura **HMAC** (uma função que combina uma mensagem com um segredo pra gerar um "carimbo" curto e
verificável; pra forjar um token válido é preciso conhecer exatamente esse mesmo segredo: se o
servidor usa HMAC pra assinar E verificar, quem tiver o segredo pode fazer as duas coisas).

O payload de um token comum trazia `{"usuario": "<nome>", "role": "parceiro"}`: igual ao padrão
visto no Carimbo, papéis elevados (`admin`) nunca eram emitidos pelo fluxo normal de login.

---

## 4. Encontrando a vulnerabilidade

Como o header do JWT não é assinado por si só (a assinatura cobre `header + "." + payload`, mas
qualquer atacante pode reescrever o header inteiro e recalcular a assinatura do zero: o ponto é
justamente que ele está tentando controlar QUAL chave o servidor vai usar para aquele cálculo), a
pergunta natural é: **dá pra apontar esse caminho pra um arquivo cujo conteúdo eu já sei de antemão?**

> [!TIP/A sacada]
> `/dev/null` é um arquivo especial disponível em qualquer sistema Unix/Linux que sempre tem
> **conteúdo vazio**: ler dele devolve zero bytes, sempre, garantido, em qualquer instância, sem
> depender de nenhum arquivo específico da aplicação. Se o servidor lê o conteúdo do arquivo apontado
> por `kid` sem validar que ele está dentro de uma pasta de chaves confiável (sem checar uma
> allow-list, por exemplo), apontar `kid=/dev/null` faz o servidor carregar uma chave de verificação
> **vazia**: uma string/bytes vazios, que é um segredo tão previsível quanto existe: todo mundo já
> sabe que ela é `b""`.

---

## 5. Exploração

Com a chave "vazia" identificada, o ataque é forjar um token novo com `kid=/dev/null` no header e
assinar com uma chave vazia, elevando o papel no payload:

```python
import jwt  # PyJWT

payload = {"usuario": "auditor", "role": "admin"}
headers = {"kid": "/dev/null"}

token_forjado = jwt.encode(payload, b"", algorithm="HS256", headers=headers)
# por trás dos panos: header {"alg":"HS256","kid":"/dev/null","typ":"JWT"} + payload
# são codificados em base64url, e o HMAC-SHA256 é calculado com b"" (bytes vazios) como chave
```

```bash
curl -H "Authorization: Bearer $TOKEN_FORJADO" https://chaveiro-<instancia>.../painel
```

O painel administrativo aceitou o token direto: o servidor leu `/dev/null` (vazio), calculou a
assinatura HMAC esperada usando bytes vazios como chave, e ela bateu exatamente com a assinatura que
já tínhamos gerado usando a mesma chave vazia, porque os dois lados fizeram a mesma conta com o mesmo
segredo previsível.

## 6. Capturando a flag

```
flag{infinity_ctf_2026_chaveiro_75f1462dee}
```

---

## 7. Recapitulando a cadeia

```
1. JWT usa "kid" no header para escolher qual chave de assinatura verificar

2. Servidor resolve kid como caminho de arquivo: chave = ler_arquivo("chaves/" + kid)
   → sem validar se o caminho fica dentro da pasta de chaves confiável

3. Header do JWT é reescrevível pelo cliente (não é protegido por si só,
   só a assinatura final é verificada)

4. kid = "/dev/null" → arquivo Unix garantidamente vazio → chave = b""

5. Token forjado: header{kid:/dev/null} + payload{role:admin},
   assinado com HMAC-SHA256 usando chave vazia

6. Servidor lê /dev/null, obtém a mesma chave vazia, valida a assinatura → aceita

7. /painel com token forjado → flag
```

---

## 8. Por que a aplicação era vulnerável (e como corrigir)

1. **Nunca resolver `kid` (ou qualquer campo do header do JWT) como caminho de arquivo direto.** A
   correção central é usar um identificador **opaco** (por exemplo um UUID ou um nome de chave fixo)
   que funciona apenas como **chave de consulta** num dicionário/mapa fixo de chaves confiáveis já
   carregadas em memória no servidor: nunca interpretado como caminho de sistema de arquivos.
2. **Validar o `kid` contra uma allow-list explícita** antes de usá-lo de qualquer forma: se o valor
   recebido não corresponde a nenhuma chave conhecida, rejeitar o token imediatamente, sem tentar
   "resolver" nada.
3. **Nunca deixar que a etapa de "escolher a chave" dependa de um valor que o próprio token
   (potencialmente forjado) controla**, sem que esse valor já tenha sido validado contra algo que o
   atacante não controla.
4. **Monitorar/alertar sobre tentativas de `kid` fora do padrão esperado** (caminhos com `/`, `..`,
   nomes de arquivos do sistema): esses são sinais fortes de tentativa de exploração.

---

## 9. Lições para levar

- **O header de um JWT não é confiável só porque "faz parte do token".** Só a assinatura garante
  integridade: e ela cobre o header + payload, não o processo de escolher QUAL chave usar pra
  verificar essa assinatura. Se o mecanismo de escolha da chave (`kid`, `jku`, `x5u`...) é
  controlável pelo atacante, ele pode escolher uma chave que ele mesmo conhece.
- **`kid` como caminho de arquivo é perigoso por dois motivos ao mesmo tempo**: dá pra fazer path
  traversal pra ler arquivos arbitrários do sistema (não foi o vetor usado aqui, mas é sempre a
  primeira coisa a testar em qualquer `kid`/`jku` controlável), e dá pra apontar pra arquivos com
  conteúdo PREVISÍVEL (`/dev/null`, `/etc/hostname`, etc.) mesmo sem conseguir ler arquivos
  arbitrários fora da pasta esperada.
- **Sempre decodifique e leia o header completo de qualquer JWT que encontrar**, não só o payload: `kid`, `jku`, `x5u`, `alg` são campos que, se manipuláveis, quebram toda a garantia de segurança do
  token.
- **A correção certa**: nunca resolver `kid` como caminho de arquivo direto: usar um identificador
  opaco que é apenas uma CHAVE de consulta num dicionário fixo de chaves confiáveis no servidor,
  nunca interpretado como caminho.

---

_Writeup do desafio Chaveiro (Infinity CTF 2026 · Web · Medium)._
