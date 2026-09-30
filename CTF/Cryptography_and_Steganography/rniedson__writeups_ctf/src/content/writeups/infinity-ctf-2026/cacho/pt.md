---
title: 'Cacho: Writeup completo'
description: 'Por trás de "Cacho" está um nome ainda mais literal, "lote": o desafio é sobre pedir várias coisas de uma vez, numa cesta só: e bastava UM item legítimo no meio do cacho pra o sistema confiar, errado, em todos os outros.'
event: 'Infinity CTF 2026 (Harpia Security + SENAC)'
category: 'web'
subcategory: 'IDOR'
difficulty: 'medium'
tags:
  - idor
  - batch-authorization
pubDate: 2026-08-22
author: 'Niedson'
draft: false
---

> [!NOTE/Sobre o desafio]
> **Plataforma:** Infinity CTF 2026 (Harpia Security + SENAC)
> **Categoria:** Web · **Dificuldade:** Medium · **Pontos:** 264
> **Vulnerabilidades:** IDOR em lote: autorização vira "trava" (latch) compartilhada dentro do
> próprio request, em vez de ser checada item a item
> **Flag:** `flag{infinity_ctf_2026_lote_63e0dd9e1f}`

> Internamente na plataforma esse desafio usa o slug `lote` (é o que aparece na flag): o nome de
> exibição é "Cacho".

Todo mundo já ouviu falar de IDOR (Insecure Direct Object Reference): você troca um `id=42` por
`id=43` numa URL e acessa dado de outra pessoa. Esse desafio é uma variação mais sutil: o bug não
está em _qual_ id você pede, está em _quantos_ ids você pede ao mesmo tempo.

---

## 1. Contexto

O app simula um sistema de "consultas em lote" usado por uma rede de filiais (centro, norte, sul).
O login é bem simples: você escolhe a filial num formulário e recebe um cookie de sessão opaco (um
valor aleatório sem relação matemática com a filial escolhida; cada login gera um valor novo). O
painel mostra, pra cada filial, a faixa de ids que ela tem permissão de consultar (por exemplo, a
filial centro só pode ver os ids 101 a 103).

Cada usuário está logado numa filial específica e só deveria conseguir consultar dados da própria
filial. A rota principal é `POST /api/consulta`, que recebe uma lista de itens pra consultar de uma
vez só: a "consulta em lote" do nome do desafio, pensada pra economizar requisições quando você
precisa de vários registros ao mesmo tempo:

```json
{ "itens": [{ "alias": "cliente1", "id": 101 }] }
```

Existe também uma versão em formulário HTML da mesma tela, mas ela é só uma casca fina por cima
dessa mesma API JSON: ambas caem na mesma lógica de validação no servidor.

## 2. Reconhecimento

O primeiro teste óbvio é o IDOR clássico (você já viu esse termo no writeup do Esquema, se leu na
ordem: é a classe de bug em que a API confia demais num id fornecido pelo cliente): pedir um id de
outra filial sozinho.

```json
POST /api/consulta
{ "itens": [{ "alias": "x", "id": 205 }] }   // id de outra filial

→ 403 / erro de autorização
```

Isso falha **100% das vezes**, de forma consistente. Se fosse um IDOR clássico simples (o servidor
só olhando "essa sessão pode ver este id?" item a item), esse teste já teria vazado alguma coisa. Ele
não vazou: o que significa que existe alguma checagem de autorização real rodando por item, pelo
menos quando o item vem sozinho.

Antes de desistir da rota, vale sempre esgotar as hipóteses mais simples primeiro. Testamos uma bateria de variações no mesmo endpoint, cada uma tentando confundir a validação de um jeito diferente:

| Teste                                                                     | Resultado                                                                                              |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Id numérico fora de qualquer faixa conhecida (0, -1, 999...)              | ❌ sempre "acesso negado"                                                                              |
| Id como string, `null`, booleano, float, lista ou objeto em vez de número | ❌ negado (sem confusão de tipo, diferente do Confere)                                                 |
| Chave `id` duplicada dentro do mesmo item JSON                            | ❌ negado (o parser usa o último valor de forma **consistente** em toda a validação, sem dessincronia) |
| Campo extra `filial` dentro do item, tentando forçar outro contexto       | ❌ negado                                                                                              |
| Request sem cookie de sessão nenhum                                       | ❌ 401 "não autenticado" (não vaza nada)                                                               |

Nenhuma dessas variações revelou nada: a validação de um item isolado é robusta contra os truques
óbvios. Mas o campo `itens` é uma **lista**, não um id único. E o servidor processa a lista inteira
numa única passada. Isso levanta uma pergunta diferente das de cima, que nenhum dos testes acima
respondeu: será que o comportamento muda quando há **mais de um item no mesmo request**?

## 3. Encontrando a vulnerabilidade

A pergunta certa: será que a checagem de autorização é recalculada pra CADA item da lista, ou ela é
calculada uma vez e reaproveitada pro resto do array?

Testando misturar um id legítimo (da própria filial) com ids estrangeiros no MESMO request:

```json
POST /api/consulta
{
  "itens": [
    { "alias": "cliente_legitimo", "id": 101 },
    { "alias": "x", "id": 205 },
    { "alias": "y", "id": 9001 }
  ]
}

→ 200 OK: TODOS os itens vêm preenchidos, inclusive 205 e 9001
```

> [!IMPORTANT/A causa raiz]
> A autorização do endpoint funciona como uma **trava (latch)**: assim que o primeiro item do array
> pertence à sua própria filial, uma flag interna `autorizado = True` é setada: e a partir daí o
> servidor processa o RESTO do array sem checar autorização item a item de novo. Isso é diferente de
> um IDOR clássico (onde cada id é checado individualmente, sempre): aqui o bug está em **estado
> compartilhado dentro do processamento de um único request em lote**. Um id "de mentirinha" da sua
> própria filial no começo do array serve de chave-mestra pro resto da lista.

### 3.1. Por que endpoints de lote são especialmente propensos a esse bug

Vale entender o padrão de código que costuma gerar esse tipo de falha, porque ele se repete em
qualquer API que processa "vários itens numa chamada só": lotes de pagamento, envio de e-mails em
massa, importação de planilhas, etc. Um endpoint de item único normalmente tem uma função só, que
recebe um id e devolve "autorizado" ou "negado" pra aquele id específico. Quando esse mesmo endpoint
vira um endpoint de lote, é comum o código evoluir assim:

```python
# versão vulnerável (pseudocódigo do que provavelmente acontece no servidor)
autorizado = False
resultado = []
for item in itens:
    if pertence_a_minha_filial(item.id):
        autorizado = True          # seta a trava UMA vez
    if autorizado:                  # a partir daqui, qualquer item passa
        resultado.append(buscar_dado(item.id))
    else:
        resultado.append("acesso negado")
```

O erro é sutil porque o código _parece_ razoável de relance: "se pelo menos um item é meu, processa
a lista". Mas a checagem certa deveria acontecer **de novo, pra cada item**, e não reaproveitar uma
decisão tomada lá atrás no loop:

```python
# versão correta
resultado = []
for item in itens:
    if pertence_a_minha_filial(item.id):    # reavaliado a CADA iteração
        resultado.append(buscar_dado(item.id))
    else:
        resultado.append("acesso negado")
```

## 4. Exploração

Com a trava conhecida, o próximo passo é achar dados interessantes pra colocar no resto do array.
Testar só os ids "óbvios" das outras filiais (na faixa 101-304, o range normal visto na UI) não
revelou nada de especial: todos eram só dados de clientes comuns de outras filiais, sem valor de
flag.

A virada foi fazer um **sweep bem mais amplo de ids**, não só os que aparecem na interface:

```python
# pseudocódigo do sweep
meu_id_legitimo = 101
achados = []
for candidato in range(1, 10000):
    itens = [{"alias": "eu", "id": meu_id_legitimo}, {"alias": "x", "id": candidato}]
    resp = post("/api/consulta", json={"itens": itens})
    achados.append((candidato, resp.json()))
```

## 5. Capturando a flag

Fora do range normal das filiais (101-304), o id **9001** devolveu um registro completamente
diferente: um item chamado **"Auditoria Interna"**, que não é uma filial de verdade, é um registro
administrativo que só existe pra esse tipo de teste:

```json
{ "alias": "auditoria", "id": 9001, "conteudo": "flag{infinity_ctf_2026_lote_63e0dd9e1f}" }
```

```
flag{infinity_ctf_2026_lote_63e0dd9e1f}
```

## 6. Por que a aplicação era vulnerável (e como corrigir)

1. **A raiz do problema é reaproveitar uma decisão de autorização entre iterações de um loop.** A
   correção não é "adicionar mais uma checagem": é remover completamente a variável/flag
   compartilhada (`autorizado`) e recalcular a permissão dentro de cada iteração, olhando só para o
   item da vez.
2. **Trate cada item de um lote como uma requisição independente do ponto de vista de autorização.**
   Se ajudar, é útil pensar assim durante a implementação: "se esse item tivesse vindo sozinho num
   request separado, ele passaria?": e implementar literalmente chamando a mesma função de
   autorização de item único, sem atalho, dentro do loop.
3. **Testes automatizados de autorização deveriam cobrir explicitamente o caso de lote misto** (um
   item autorizado + um não-autorizado no mesmo request), não só o caso de item único autorizado e
   item único negado: são três casos de teste, não dois, e o terceiro é justamente onde esse bug
   mora.
4. **Registros administrativos/sensíveis (como o "Auditoria Interna" deste desafio) não deveriam
   viver no mesmo espaço de ids que registros comuns.** Separar por namespace, prefixo ou banco
   reduz o dano de qualquer falha de autorização futura, mesmo uma ainda não descoberta.

## 7. Lições para levar

- **IDOR em lote merece um teste específico**, diferente do IDOR de item único: teste um id
  estrangeiro sozinho (pra confirmar que existe autorização), depois teste o MESMO id estrangeiro
  misturado com um id legítimo no mesmo array. Se o resultado mudar, você achou um latch de
  autorização compartilhado.
- **Esgote as hipóteses simples antes de ir pra hipótese mais sutil.** A tabela de testes descartados
  (tipo de dado, chave duplicada, campo extra, sem sessão) não foi tempo perdido: foi o que
  confirmou que o bug não estava em nenhum lugar óbvio, e por eliminação apontou pro comportamento
  do array como o único candidato restante.
- **Não pare nos ids "óbvios"**. A flag estava deliberadamente fora do padrão numérico das filiais
  reais: um sweep amplo (milhares de ids, não só centenas) foi necessário pra achar o registro de
  "Auditoria Interna".
- **A correção certa é reautorizar cada item do array individualmente**, sem reaproveitar o
  resultado de uma checagem anterior: o mesmo princípio de "não confiar em estado calculado antes"
  que vale pra qualquer validação em lote (batch de pagamentos, batch de emails, etc.).
- **Esse padrão de bug tem "primos" na mesma família de desafios deste CTF**: confusão de tipo
  (Confere) e confusão de algoritmo de assinatura (Carimbo) são, no fundo, a mesma ideia geral: uma
  checagem de autorização/validação que existe, mas que pode ser contornada explorando um caminho de
  código que ela não previu.

---

_Writeup do desafio Cacho (Infinity CTF 2026 · Web · Medium)._
