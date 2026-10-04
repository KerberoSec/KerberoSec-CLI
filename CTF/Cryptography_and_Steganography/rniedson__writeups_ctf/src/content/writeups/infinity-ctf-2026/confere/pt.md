---
title: 'Confere: Writeup completo'
description: 'O nome é irônico de propósito: a única coisa que a rota de "Confere" não confere de verdade é a senha: um jeito inesperado de perguntar "e se eu simplesmente não mandar nada" foi o suficiente pra passar direto pela checagem.'
event: 'Infinity CTF 2026 (Harpia Security + SENAC)'
category: 'web'
subcategory: 'Type Confusion'
difficulty: 'medium'
tags:
  - type-confusion
  - api
pubDate: 2026-08-22
author: 'Niedson'
draft: false
---

> [!NOTE/Sobre o desafio]
> **Plataforma:** Infinity CTF 2026 (Harpia Security + SENAC)
> **Categoria:** Web · **Dificuldade:** Medium · **Pontos:** 224
> **Vulnerabilidades:** Type confusion (confusão de tipo: o backend espera receber sempre uma string, mas aceita sem reclamar um valor de outro tipo, e a lógica se comporta de um jeito inesperado): campo de senha aceita tipo não-string e quebra a checagem
> **Flag:** `flag{infinity_ctf_2026_crivo_ca044801c3}`

> Internamente na plataforma esse desafio usa o slug `crivo` (é o que aparece na flag): o nome de
> exibição é "Confere".

Esse desafio é um lembrete de que **o formulário HTML não é a API**. A interface que você vê no
navegador é só um dos jeitos possíveis de falar com o backend: e às vezes ela é bem mais restrita
do que a API que está por trás dela.

---

## 1. Contexto

O app tinha uma tela de consulta usada por atendentes: você digita o código de um cliente e uma
"senha de consulta" (um segredo curto associado àquele cliente específico, não a senha da sua
própria conta) para liberar os dados dele. Preenchendo o formulário normalmente:

```
POST /api/consulta
Content-Type: application/x-www-form-urlencoded

codigo_cliente=1234&senha_consulta=abc123
```

Senha errada devolvia "consulta negada". O formulário HTML, sendo um `<input type="text">` comum,
só é capaz de mandar texto: não tem como, pela UI, mandar um número, uma lista ou um objeto no
lugar da senha. A caixinha de texto do navegador **é uma restrição da interface**, não uma garantia
de que o servidor por trás dela só sabe lidar com strings.

## 2. O que é "type confusion" (explicado do zero)

Em linguagens dinamicamente tipadas: Python, JavaScript, PHP, e é o caso aqui: uma variável não
tem um tipo fixo declarado; ela é o que quer que tenha sido atribuído a ela em tempo de execução.
Isso é conveniente para escrever código rápido, mas cria uma armadilha: um trecho de código escrito
_assumindo_ que um valor sempre vai ser uma string pode se comportar de um jeito completamente
inesperado: sem lançar erro nenhum, na maioria das vezes: quando alguém entrega um tipo diferente
(um número, uma lista, `null`, ou um objeto/dicionário). Isso é **type confusion**: o programa
"confunde" o tipo que esperava com o tipo que efetivamente recebeu, e a lógica que dependia
implicitamente daquele tipo quebra de forma silenciosa.

O detalhe crucial para quem está começando: **a interface (UI) restringe o que você pode mandar,
mas a API por trás dela quase nunca restringe da mesma forma.** Um formulário HTML só sabe mandar
texto. Mas se esse mesmo formulário, nos bastidores, faz uma chamada `fetch()`/`XMLHttpRequest` para
uma API que aceita JSON puro: muito comum em aplicações modernas que reaproveitam o mesmo backend
para a página web e para chamadas programáticas: nada impede você de montar essa chamada JSON à
mão, fora do navegador, e mandar qualquer estrutura de dado permitida pelo formato: string, número,
booleano, `null`, lista ou objeto.

## 3. Reconhecimento

O endpoint real por trás do formulário aceita JSON também:

```
POST /api/consulta
Content-Type: application/json

{"codigo_cliente": "1234", "senha_consulta": "abc123"}
```

A tela inicial do app também listava uma seção de "Atividade recente" com códigos de clientes
consultados por outros usuários: foi ali que apareceu `suporte-interno`, um código de cliente com
nome claramente administrativo, bem diferente dos códigos numéricos comuns. Isso virou o alvo: se
existisse algum jeito de burlar a checagem de senha, `suporte-interno` era o cliente que valia a
pena consultar.

## 4. Encontrando a vulnerabilidade

A pergunta que guiou o teste: será que o código no backend, ao comparar a senha enviada com a senha
esperada, assume cegamente que os dois lados da comparação são strings? Se sim, o que acontece
quando eu mando um tipo diferente?

Testei uma bateria de tipos não-string no campo `senha_consulta`:

```json
{"codigo_cliente": "1234", "senha_consulta": null}    → nega
{"codigo_cliente": "1234", "senha_consulta": false}   → nega
{"codigo_cliente": "1234", "senha_consulta": []}      → nega
{"codigo_cliente": "1234", "senha_consulta": 0}       → nega
{"codigo_cliente": "1234", "senha_consulta": {}}      → SUCESSO: consulta liberada!
```

Só o **dict vazio** (`{}`) quebrou a checagem: os outros tipos (null, false, lista vazia, zero)
foram tratados normalmente como "senha errada".

> [!IMPORTANT/A causa raiz provável]
> Um dict vazio é um valor **verdadeiro (truthy) em Python** (diferente de `None`, `False`, `[]` ou
> `0`, que são todos falsy): então se o código faz algo como
> `if senha_consulta and senha_consulta == senha_esperada:` combinado com algum tratamento de
> exceção genérico ao redor da comparação (ex. um `try/except` que engole `TypeError` quando tenta
> comparar `dict == str`), o `{}` passa pela primeira parte do `if` (é truthy) e a comparação
> seguinte pode estar caindo num caminho de erro que, por engano, trata "não consegui comparar" como
> "não precisa validar" em vez de "nega por padrão". O sintoma bate exatamente com esse tipo de bug:
> uma comparação que quebra silenciosamente quando o tipo não é o esperado, em vez de **"falhar
> fechado"**: ou seja, em vez de negar o acesso por padrão sempre que algo dá errado na validação,
> o código acaba, sem querer, liberando o acesso quando encontra um caso que não sabe tratar.

## 5. Exploração

Com o tipo vazador identificado, o ataque é só repetir a requisição mirando no cliente encontrado no
recon (`suporte-interno`):

```bash
curl -X POST https://confere-<instancia>.../api/consulta \
  -H "Content-Type: application/json" \
  -d '{"codigo_cliente": "suporte-interno", "senha_consulta": {}}'
```

## 6. Capturando a flag

A resposta veio com sucesso e os dados completos do cliente consultado: incluindo o campo
`observacoes`, onde estava a flag:

```
flag{infinity_ctf_2026_crivo_ca044801c3}
```

## 7. Por que a aplicação era vulnerável (e como corrigir)

A causa raiz não é "o dict vazio é mágico": é que a validação de tipo nunca existiu de forma
explícita. O bug só escolhe `{}` como gatilho porque, muito provavelmente, o código por trás faz
algo equivalente a:

```python
if senha_consulta and senha_consulta == senha_esperada:
    liberar_consulta()
```

combinado a um bloco `try/except` genérico em volta da comparação (ou um `.get()`/checagem mal
feita) que engole silenciosamente o erro de tipo em vez de negar o acesso. `{}` é **truthy** em
Python (diferente de `None`, `False`, `[]` ou `0`, que são todos falsy), então passa pela primeira
metade do `if`; e a comparação seguinte, ao tentar comparar um `dict` com uma `str` esperada, cai
num caminho de erro que: por engano: é tratado como "não deu pra validar, deixa passar" em vez de
"nega por padrão".

Correções concretas, da mais específica à mais estrutural:

1. **Validar o tipo do campo explicitamente, antes de qualquer lógica de negócio**: `isinstance(senha_consulta, str)`, rejeitando com erro 400 qualquer coisa que não seja string,
   antes mesmo de tentar comparar.
2. **Nunca deixar um `try/except` genérico decidir o resultado de uma checagem de autorização.**
   Se uma exceção acontecer durante a validação de acesso, o caminho de erro deve **sempre** negar: nunca liberar por padrão ("falhar fechado", não "falhar aberto").
3. **Usar uma biblioteca de validação de schema** (como `pydantic` ou `marshmallow`, em Python) para
   declarar o formato esperado do corpo JSON logo na entrada da rota. Isso rejeita automaticamente
   qualquer campo fora do tipo esperado antes mesmo de a lógica de negócio ser executada, eliminando
   essa classe inteira de bug de uma vez.

## 8. Lições

- **Nunca teste só pelo formulário: teste a API crua.** O formulário HTML é uma restrição da
  interface, não do backend. Sempre vale montar a requisição JSON/raw diretamente e testar tipos
  que a UI nunca conseguiria mandar sozinha.
- **"Type confusion" em linguagens dinamicamente tipadas (Python, JS, PHP...) é uma classe de bug
  recorrente**: sempre que um campo pode, em teoria, receber qualquer tipo JSON (string, número,
  bool, null, lista, objeto), vale testar cada um: comparações, checagens de truthy/falsy e
  serializações se comportam de formas bem diferentes dependendo do tipo.
- **Páginas de "atividade recente"/logs visíveis na própria UI costumam vazar identificadores
  valiosos** (aqui, o código de cliente `suporte-interno`): sempre vale mapear esse tipo de painel
  antes de partir para o ataque em si, para já saber qual alvo mirar assim que a falha for
  confirmada.
- **A correção certa é validar o TIPO do campo explicitamente** antes de qualquer lógica de negócio: nunca deixar a checagem de tipo ser "implícita" dentro de uma comparação ou de um `try/except`
  genérico.

---

_Writeup do desafio Confere (Infinity CTF 2026 · Web · Medium)._
