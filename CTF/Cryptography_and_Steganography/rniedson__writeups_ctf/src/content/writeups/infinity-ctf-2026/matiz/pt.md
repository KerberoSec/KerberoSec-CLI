---
title: 'Matiz: Writeup completo'
description: '"Matiz" é, literalmente, tom de cor: o app deixa você personalizar a aparência da sua conta. O problema é que a função que salva essa personalização foi longe demais: ela deixava alterar praticamente qualquer configuração interna do sistema, não só as cores.'
event: 'Infinity CTF 2026 (Harpia Security + SENAC)'
category: 'web'
subcategory: 'Prototype Pollution'
difficulty: 'medium'
tags:
  - prototype-pollution
  - attribute-injection
pubDate: 2026-08-22
author: 'Niedson'
draft: false
---

> [!NOTE/Sobre o desafio]
> **Plataforma:** Infinity CTF 2026 (Harpia Security + SENAC)
> **Categoria:** Web · **Dificuldade:** Medium · **Pontos:** 381
> **Vulnerabilidades:** Attribute injection em Python via `getattr`/`setattr` livre numa função de merge genérica
> **Flag:** `flag{infinity_ctf_2026_matiz_dec454bab3}`

Em JavaScript existe uma classe de bug bem conhecida chamada "prototype pollution": um merge
genérico demais deixa um atacante escrever em `__proto__` (um atributo especial que todo objeto
JavaScript compartilha) e, com isso, afetar o comportamento de todos os objetos do processo, não só
o que foi mesclado. Este desafio é o equivalente quase direto disso em Python: mesmo se você nunca
ouviu falar do caso do JavaScript, o raciocínio abaixo é autocontido: usando o fato de que
**atributos de objetos, classes e módulos formam uma cadeia navegável** através de nomes especiais
como `__class__`, `__init__` e `__globals__`.

---

## 1. Contexto

"Matiz" é um app com um sistema de temas visuais customizáveis: o usuário manda um JSON com
preferências (cores, fontes, etc.) para um endpoint de sincronização, e o servidor "mescla" isso em
cima de uma configuração padrão já existente. A própria descrição do desafio já dava uma pista
direta, do tipo "a sincronização de preferências aceita qualquer estrutura": uma frase que, lida
com atenção, é quase um convite: se o endpoint realmente aceita "qualquer estrutura" sem restringir
o formato, o que acontece se eu mandar uma estrutura que ele claramente não deveria aceitar?

A home do app linkava diretamente o código-fonte do motor de temas:

```
GET /static/theme-engine.py
```

Ler o código-fonte de graça é sempre a primeira coisa a se aproveitar: economiza um bocado de
engenharia reversa por caixa-preta, e muda o desafio de "adivinhar a lógica" para "ler a lógica e
achar a falha nela".

## 2. Reconhecimento

O arquivo `theme-engine.py` continha uma função de merge recursivo, algo no formato:

```python
def deep_merge(target, patch):
    for key, value in patch.items():
        if isinstance(value, dict):
            deep_merge(getattr(target, key), value)
        else:
            setattr(target, key, value)
```

Repare no que essa função faz: em vez de tratar `target` como um dicionário (`target[key]`), ela usa
`getattr`/`setattr`: ou seja, ela navega e escreve em **atributos de verdade** do objeto Python, não
só chaves de um dicionário. Isso por si só já é um sinal de alerta: `getattr`/`setattr` com uma
chave controlada pelo usuário é a versão Python de acessar propriedades arbitrárias de um objeto.

## 3. Encontrando a vulnerabilidade

Em Python, praticamente tudo é um objeto com atributos navegáveis: inclusive objetos que não
deveriam estar ao alcance do usuário:

- `objeto.__class__`: a classe do objeto.
- `classe.__init__`: o método construtor da classe.
- `funcao.__globals__`: um dicionário com TODAS as variáveis globais do módulo onde aquela função
  foi definida (isso inclui configurações internas, segredos, o que for).

Encadeando esses três, dá pra sair de "uma instância qualquer" e chegar no **módulo inteiro**:
`instancia.__class__.__init__.__globals__` é o dicionário de globais do módulo: e como é um
dicionário exposto como atributo, o `deep_merge` recursivo consegue navegar até lá dentro e
sobrescrever qualquer variável global.

> [!TIP/O nome técnico é "attribute injection"]
> Quando uma função de merge/set genérica aceita chaves arbitrárias do usuário e usa
> `getattr`/`setattr` (ou o equivalente em outra linguagem) sem checar uma lista de atributos
> permitidos, ela vira uma ferramenta pro atacante navegar a árvore inteira de objetos do processo: > não só o objeto "de negócio" que era a intenção original.

## 4. Exploração

O payload que percorre a cadeia até `__globals__` e sobrescreve uma configuração compartilhada:

```json
POST /api/preferencias
Content-Type: application/json

{
  "__class__": {
    "__init__": {
      "__globals__": {
        "APP_CONFIG": {
          "diagnostics_enabled": true,
          "maintenance_mode": true
        }
      }
    }
  }
}
```

Cada nível do JSON corresponde a uma chamada recursiva de `deep_merge`: primeiro navega até
`__class__` (a classe do objeto de tema: a instância que representa "minhas preferências"), depois
até `__init__` (o construtor dessa classe, um método comum a todo objeto Python), depois até
`__globals__` (o módulo inteiro, exposto como um dicionário de nome → valor), e finalmente escreve
em `APP_CONFIG`: uma variável global do módulo, compartilhada por **todas** as requisições do
processo, não só pela sessão que enviou o merge. Note que os dois campos são setados juntos:
`diagnostics_enabled` (liga o modo de diagnóstico, que é o que de fato importa) e
`maintenance_mode` (ligado por segurança/efeito colateral observado durante os testes, sem
necessidade real para o exploit funcionar).

Um endpoint de diagnóstico separado, `GET /api/suporte/diagnostico`, lia essa mesma variável
`APP_CONFIG` pra decidir se devolvia informação extra: e com o valor sobrescrito via o merge, esse
endpoint passou a devolver a flag no campo `relatorio` da resposta.

## 5. Capturando a flag

Chamando `GET /api/suporte/diagnostico` depois do merge malicioso, a resposta trouxe a flag:

```
flag{infinity_ctf_2026_matiz_dec454bab3}
```

## 6. Por que a aplicação era vulnerável (e como corrigir)

A causa raiz é a mesma de qualquer prototype pollution/attribute injection: uma função de
merge/atualização genérica demais, que aceita **qualquer chave** vinda do usuário e a usa
diretamente para navegar/escrever numa estrutura real do programa, sem uma lista do que é permitido.

1. **Nunca use `getattr`/`setattr` (ou equivalentes de outras linguagens) com uma chave vinda direto
   do usuário, sem whitelist.** Se a intenção é fazer merge de um dicionário de configuração de
   preferências (cores, fontes), trate o alvo como dicionário (`target[key] = value`) e não como
   objeto: acessar chaves de dicionário nunca alcança `__class__`/`__globals__` do mesmo jeito
   perigoso.
2. **Mesmo tratando como dicionário, valide as chaves contra uma lista explícita de campos
   permitidos** (`cor_primaria`, `fonte`, etc.) antes de aplicar o merge: nunca aceite "qualquer
   estrutura", mesmo que pareça conveniente para o cliente.
3. **Configuração global mutável e compartilhada entre requisições (`APP_CONFIG`) é um risco por si
   só**, independente do bug de attribute injection: uma vez que ela pode ser alterada por qualquer
   caminho, o efeito vale para TODOS os usuários simultâneos do processo, não só quem enviou o
   payload. Preferências de diagnóstico/manutenção deveriam viver numa configuração de infraestrutura
   controlada por quem opera o sistema, nunca num objeto alcançável a partir de dados do usuário.

## 7. Lições

- **Qualquer objeto Python "vaza" o módulo inteiro através de `__class__.__init__.__globals__`
  (ou qualquer outro método/função do objeto)**: é um caminho genérico, não específico dessa app.
  Se seu código expõe qualquer forma de navegação livre de atributos a partir de um objeto de
  aplicação, o alcance real é "todo o processo", não só aquele objeto.
- **Leia a descrição do desafio como uma afirmação técnica.** "Aceita qualquer estrutura" não era
  força de expressão: era literalmente o comportamento do `deep_merge`.
- **Endpoints que expõem/linkam o próprio código-fonte** (`/static/*.py`, comentários "veja o
  código") são ouro: sempre leia antes de tentar engenharia reversa por caixa-preta.
- **A correção certa** é tratar o alvo do merge sempre como dado (dicionário com chaves
  permitidas), nunca como objeto navegável por atributo arbitrário.

---

_Writeup do desafio Matiz (Infinity CTF 2026 · Web · Medium)._
