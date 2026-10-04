---
title: 'Pergaminho: Writeup completo'
description: 'Por que "Pergaminho"? Porque o desafio importa "contratos" num formato de documento bem antigo: e formato antigo, vulnerabilidade clássica: dava pra esconder, dentro do próprio documento, um pedido pra que o servidor lesse arquivos do seu próprio disco.'
event: 'Infinity CTF 2026 (Harpia Security + SENAC)'
category: 'web'
subcategory: 'XXE'
difficulty: 'medium'
tags:
  - xxe
pubDate: 2026-08-22
author: 'Niedson'
draft: false
---

> [!NOTE/Sobre o desafio]
> **Plataforma:** Infinity CTF 2026 (Harpia Security + SENAC)
> **Categoria:** Web · **Dificuldade:** Medium · **Pontos:** 308
> **Vulnerabilidades:** XXE (XML External Entity): leitura arbitrária de arquivo
> **Flag:** `flag{infinity_ctf_2026_pergaminho_77e9f0fa1b}`

Este writeup parte do zero: se você nunca ouviu falar de XXE, a ideia é que ao final você entenda **por que** um formato de arquivo tão comum quanto XML pode virar uma porta pra ler arquivos do servidor: e por que a técnica clássica de bypass às vezes esbarra num obstáculo bem mais chato do que a própria vulnerabilidade.

---

## 1. Contexto

"Pergaminho" era um app de importação de contratos: você mandava um XML descrevendo um contrato (remetente, destinatário, valor, observações) e o servidor processava esse documento. Formulários assim: que aceitam XML direto do usuário: são um dos alvos clássicos de uma classe de vulnerabilidade chamada **XXE (XML External Entity)**.

### 1.1. O que é XML e por que ele tem "entidades"

XML é um formato de texto estruturado em tags, parecido com HTML:

```xml
<contrato>
  <remetente>Empresa A</remetente>
  <valor>1000</valor>
</contrato>
```

O padrão XML permite declarar um cabeçalho especial chamado `DOCTYPE`, que pode definir **entidades**: atalhos que o parser substitui pelo valor real antes de processar o documento. É parecido com um "find and replace" automático. A sintaxe:

```xml
<!DOCTYPE contrato [
  <!ENTITY nome "Empresa A">
]>
<contrato>
  <remetente>&nome;</remetente>
</contrato>
```

Aqui `&nome;` vira `Empresa A` na hora de processar. Até aqui, inofensivo: é só uma forma de reutilizar texto dentro do próprio documento.

### 1.2. Onde mora o perigo: entidades externas

O problema é que o padrão XML também permite que uma entidade aponte pra um recurso **externo**, incluindo um arquivo no disco do servidor:

```xml
<!DOCTYPE contrato [
  <!ENTITY xxe SYSTEM "file:///etc/passwd">
]>
<contrato>
  <observacoes>&xxe;</observacoes>
</contrato>
```

Se o parser XML do servidor não estiver configurado pra bloquear entidades externas (comportamento padrão em muitas bibliotecas, inclusive antigas), ele vai literalmente **ler o arquivo do disco** e colocar o conteúdo no lugar de `&xxe;` antes de processar o documento: e se a aplicação depois exibe ou ecoa esse campo de volta pra você, você acabou de ler um arquivo arbitrário do servidor só enviando um XML malicioso. Isso é **XXE**.

---

## 2. Reconhecimento

O endpoint de importação era `POST /importar`, recebendo o XML como um campo de formulário chamado `xml` (não como corpo bruto da requisição: detalhe que importa: mandar o XML como `application/xml` puro no corpo não funcionava, tinha que ir dentro de um campo de form `multipart/form-data` ou `x-www-form-urlencoded`).

Testando a técnica básica de XXE com um arquivo clássico de prova de conceito:

```xml
<!DOCTYPE contrato [
  <!ENTITY xxe SYSTEM "file:///etc/passwd">
]>
<contrato>
  <observacoes>&xxe;</observacoes>
</contrato>
```

O servidor devolveu o conteúdo de `/etc/passwd` na resposta. **XXE confirmado.** `/etc/hostname` e `/etc/os-release` também leram limpo: a vulnerabilidade funcionava de verdade, não era um falso positivo.

---

## 3. O primeiro beco sem saída: arquivos com conteúdo XML inválido

Com leitura arbitrária confirmada, o próximo passo óbvio era ler o **código-fonte da aplicação** (`/app/app.py`) pra entender exatamente o que estava rodando e onde a flag poderia estar.

Só que essa tentativa deu erro: **"XML inválido"**.

> [!IMPORTANT/O arquivo lido vira conteúdo XML: e precisa ser XML válido]
> Isso é um detalhe sutil que confunde muita gente começando com XXE: a entidade externa **funciona** (o arquivo é lido de verdade), mas o conteúdo lido entra no lugar de `&xxe;` **como se fosse texto dentro de um elemento XML**. Se esse conteúdo tiver um caractere `<` ou `&` cru: coisa comum em código-fonte (`if a < b`, comparações, strings com `&`): o documento XML inteiro vira malformado depois da substituição, e o parser rejeita tudo antes mesmo de processar. A leitura "funcionou" no sentido técnico, mas você nunca vê o resultado.

Isso explicava por que `/app/app.py` dava erro mesmo com a técnica correta: o código Python quase certamente tinha um `<` ou `&` em algum lugar (comparações, imports, o que for).

A tentativa seguinte foi uma técnica clássica de bypass pra esse exato problema: usar uma **entidade de parâmetro** (`%`) combinada com `CDATA` e exfiltração _out-of-band_ (OOB) via uma URI `data:`: a ideia geral é empacotar o conteúdo problemático dentro de um bloco `CDATA` (que o parser XML trata como texto literal, sem interpretar `<`/`&`) antes de reinjetar no documento. Só que essa técnica **não funcionou**: nem para `/app/app.py`, nem para um arquivo seguro de controle como `/etc/hostname` (que deu "inválido" mesmo sendo um arquivo totalmente limpo, sem `<`/`&`). Isso indicava que o parser (provavelmente `expat` via `xml.sax`, com `external_pes` desligado) só resolvia **entidades gerais** externas, não **entidades de parâmetro**: e sem um servidor próprio pra hospedar um DTD (DTD = _Document Type Definition_, um documento que pode declarar entidades "por fora", hospedado em outro lugar), não havia como fazer exfiltração _out-of-band_ (enviar o conteúdo lido embutido numa requisição pra um servidor que você controla, em vez de recebê-lo direto na resposta).

Outra tentativa: `/proc/self/environ` (variáveis de ambiente do processo, um alvo clássico quando se procura uma flag guardada como variável de ambiente). Essa também falhou sempre: arquivos em `/proc` costumam ter **bytes NUL** no conteúdo, que também quebram um documento XML, pelo mesmo motivo: conteúdo que não é válido dentro de um elemento XML.

Ou seja: **duas pistas óbvias (código-fonte e env vars) esbarraram no mesmo tipo de obstáculo**: não porque a vulnerabilidade não funcionasse, mas porque o _conteúdo_ desses arquivos não é compatível com o formato que está transportando o resultado de volta.

---

## 4. O segundo obstáculo: o template só aceita campos reconhecidos

Enquanto isso, havia um segundo problema, independente do primeiro: colocar a entidade em qualquer lugar do XML **não bastava**. Se o documento não tivesse os campos que o template de contrato esperava (`remetente`, `destinatário`, `valor`), a aplicação respondia **"Nenhum campo reconhecido"**: mesmo com um XML tecnicamente válido e a entidade corretamente processada. Isso parecia, à primeira vista, uma falha na técnica, mas na verdade era só a aplicação recusando processar um documento fora do formato esperado.

A solução: colocar a entidade **dentro de um campo que o template de fato reconhece** (`<observacoes>`), junto dos outros campos obrigatórios:

```xml
<!DOCTYPE contrato [
  <!ENTITY xxe SYSTEM "file:///caminho/do/arquivo">
]>
<contrato>
  <remetente>Empresa A</remetente>
  <destinatario>Empresa B</destinatario>
  <valor>1000</valor>
  <observacoes>&xxe;</observacoes>
</contrato>
```

Com essa estrutura completa, o app processava o documento normalmente e devolvia o conteúdo lido dentro do campo `observacoes` da resposta.

---

## 5. Achando o arquivo certo

Com os dois obstáculos entendidos: (1) o conteúdo do arquivo precisa ser compatível com XML, e (2) a entidade precisa estar num campo reconhecido pelo template: faltava só achar **qual arquivo** guardava a flag. `/app/app.py` e `/proc/self/environ` estavam descartados pelo motivo (1).

A flag estava, de forma direta, em `/tmp/flag.txt`: um caminho que ainda não tinha sido testado nas tentativas anteriores (o foco tinha ido primeiro para o código-fonte e variáveis de ambiente, os alvos "óbvios").

```xml
<!DOCTYPE contrato [
  <!ENTITY xxe SYSTEM "file:///tmp/flag.txt">
]>
<contrato>
  <remetente>Empresa A</remetente>
  <destinatario>Empresa B</destinatario>
  <valor>1000</valor>
  <observacoes>&xxe;</observacoes>
</contrato>
```

A resposta trouxe a flag dentro do campo `observacoes`.

### 🚩 Flag

```
flag{infinity_ctf_2026_pergaminho_77e9f0fa1b}
```

---

## 6. Recapitulando a cadeia

```
1. Recon
   └─ POST /importar (campo de form "xml", nao body raw) processa XML enviado pelo usuario

2. XXE confirmado
   └─ <!ENTITY xxe SYSTEM "file:///etc/passwd"> + &xxe; dentro de <observacoes>
      → servidor le o arquivo e devolve o conteudo

3. Beco sem saida #1: conteudo vira XML invalido
   └─ /app/app.py e /proc/self/environ falham ("XML invalido")
      → codigo-fonte tem "<"/"&" cru; /proc tem bytes NUL
      → tecnica de bypass (parameter entity + OOB via data:) tambem falha:
        parser so resolve entidades GERAIS externas, nao PARAMETRO

4. Beco sem saida #2: template rejeita estrutura desconhecida
   └─ entidade fora dos campos esperados (remetente/destinatario/valor) -> "Nenhum campo reconhecido"
      → resolvido colocando &xxe; dentro de <observacoes>, junto dos campos exigidos

5. Achando o arquivo certo
   └─ /tmp/flag.txt (nao testado antes, fora do foco inicial em codigo-fonte/env vars)
      → flag devolvida dentro do campo observacoes da resposta
```

## 7. Por que a aplicação era vulnerável (e como corrigir)

1. **A causa raiz não é "esquecer de validar o XML"**: é o parser aceitar, por padrão, resolver
   entidades externas. A correção certa é desabilitar isso na configuração do parser (em Python,
   por exemplo, usar a biblioteca [`defusedxml`](https://pypi.org/project/defusedxml/) no lugar do
   `xml.sax`/`xml.etree` padrão, ou configurar explicitamente `resolve_entities=False` e desabilitar
   `DOCTYPE` por completo): não existe forma segura de "escapar melhor" o XML de entrada, o
   processamento de entidade externa precisa estar **desligado**.
2. **Nunca aceitar `DOCTYPE`/DTD em XML vindo de um usuário não confiável.** A imensa maioria das
   aplicações não tem nenhum uso legítimo para entidades customizadas em XML enviado por formulário: rejeitar qualquer documento que contenha `<!DOCTYPE` já elimina a classe inteira de ataque, sem
   nem precisar mexer na lógica de resolução de entidades.
3. **Princípio do menor privilégio no processo que roda o parser.** Mesmo com o parser corrigido,
   vale rodar o processo de importação com o mínimo de acesso a arquivo possível: se ele não
   precisa ler `/tmp`, `/proc` ou o próprio código-fonte da aplicação, um sandbox/contêiner separado
   reduz o estrago de qualquer XXE que passe despercebido no futuro.
4. **Nunca ecoar de volta o conteúdo bruto de um campo processado a partir de entrada do usuário**,
   mesmo que pareça inofensivo (como um campo de "observações"). Foi justamente esse eco que
   permitiu a exfiltração _in-band_ (sem precisar de servidor próprio pra OOB): sem ele, o ataque
   ainda existiria, mas seria bem mais difícil de confirmar e explorar.

## 8. Lições

- **XXE não é só "conseguir ler o arquivo"**: é conseguir ler o arquivo **e** o resultado sobreviver como XML válido **e** a aplicação aceitar o documento no formato que ela espera. As três condições são independentes, e cada uma pode te fazer achar que a técnica "não funcionou" quando na verdade só falta ajustar uma delas.
- **Conteúdo com `<`, `&` cru ou bytes NUL quebra a substituição da entidade.** Isso descarta alvos "óbvios" como código-fonte cheio de comparações/imports, ou arquivos virtuais de `/proc`: não porque a leitura falhe, mas porque o resultado não é um XML válido depois de colado no lugar da entidade.
- **Quando os alvos óbvios falharem, teste um arquivo de controle simples primeiro** (tipo `/etc/hostname`) pra confirmar se o problema é a técnica ou é especificamente o conteúdo daquele arquivo.
- **Formulários com template esperam campos específicos.** Um XML tecnicamente correto ainda pode ser rejeitado se não tiver a "forma" que a aplicação espera: vale sempre colocar o payload dentro da estrutura normal de uso, não isolado.
- Sem servidor próprio pra hospedar um DTD externo, **exfiltração fora-de-banda (OOB) com entidades de parâmetro não é garantida**: depende de como o parser está configurado. Vale testar, mas não assumir que vai funcionar.

---

_Writeup do desafio Pergaminho (Infinity CTF 2026 · Web · Medium)._
