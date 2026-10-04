---
title: 'Pauta: Writeup completo'
description: '"Pauta" era pra ser a regra que restringe o que pode ser recarregado na memória do programa: só que a regra checava apenas QUEM estava sendo carregado, nunca O QUE esse alguém fazia ao ser carregado, e essa brecha foi suficiente pra rodar comandos no servidor.'
event: 'Infinity CTF 2026 (Harpia Security + SENAC)'
category: 'web'
subcategory: 'Deserialização'
difficulty: 'hard'
tags:
  - pickle
  - deserialization
  - rce
pubDate: 2026-08-21
author: 'Niedson'
draft: false
---

> [!NOTE/Sobre o desafio]
> **Plataforma:** Infinity CTF 2026 (Harpia Security + SENAC)
> **Categoria:** Web/Deserialização (root) · **Dificuldade:** Hard · **Pontos:** 696
> **Vulnerabilidades:** Desserialização insegura de pickle (RCE: Remote Code Execution, execução de
> código arbitrário no servidor) com exfiltração via monkeypatch de `json.dumps`
> **Flag:** `flag{infinity_ctf_2026_pauta_eb84b93970}` (fixa nesta instância: o formato varia por desafio)

Pauta é um desafio de desserialização Python: o `pickle` do padrão da linguagem, quando desserializa
dados não confiáveis, pode executar código arbitrário: e mesmo quando o desenvolvedor tenta
restringir isso, ainda sobra espaço para RCE se a restrição for na classe errada.

---

## 1. Contexto

O app tem uma rota `POST /api/rascunho/restaurar` que recebe `{"dados": "<pickle em base64>"}`: ou
seja, o cliente manda um objeto Python serializado, e o servidor desserializa de volta. Esse é o
padrão mais clássico de desserialização insegura em Python.

> [!IMPORTANT/Por que pickle é perigoso por padrão]
> Diferente de JSON, o formato `pickle` do Python não serializa só dados: ele serializa **instruções
> de como reconstruir objetos**, incluindo, potencialmente, chamar qualquer classe/função importável
> no processo que faz a desserialização. Se o atacante controla os bytes do pickle, ele controla, em
> boa medida, o que o processo executa ao restaurar aquele objeto.

## 2. Reconhecimento

O primeiro teste óbvio: montar um pickle que chama `os.system` ou `subprocess` diretamente: foi
bloqueado: o servidor usa um `Unpickler` customizado com `find_class` restrito, que só permite
carregar classes do módulo `app_models` (qualquer coisa fora disso, como `os`/`builtins`/
`subprocess`, retorna erro 400).

Isso descarta o ataque "de manual" mais simples, mas não fecha a porta: só significa que o gadget
de execução precisa vir de **dentro** de `app_models`.

## 3. Encontrando a vulnerabilidade

Vasculhando as classes permitidas, `app_models.ConfiguracaoExtensao` tinha um método
`__setstate__` que guardava um campo `codigo_python` recebido do objeto desserializado: e o
servidor **executava esse campo via `exec`** em algum ponto do processo de restauração.

> [!TIP/`__setstate__` é um gadget clássico de pickle]
> Quando o `pickle` reconstrói um objeto, ele chama `__setstate__` (se existir) passando o estado
> serializado. Se essa função fizer qualquer coisa "perigosa" com o estado recebido: e aqui,
> literalmente rodar `exec` nele: não importa que o `find_class` tenha restringido as classes: o
> código malicioso não precisa vir de fora de `app_models`, só precisa estar **dentro** do payload
> de estado de uma classe que já é permitida.

Para confirmar que era `exec` de verdade (e não algum parser que só lia o campo sem rodar nada), o
teste foi mandar um `codigo_python` que dormia por alguns segundos:

```python
codigo_python = "__import__('time').sleep(6)"
```

A resposta HTTP demorou os mesmos ~6 segundos: confirmando execução real no servidor.

## 4. Exploração

Com RCE confirmado, o próximo problema era **como ler a flag de volta**. A resposta da API não
refletia nem o namespace do `exec`, nem nenhum atributo do objeto restaurado: `"extensao": {}`
sempre fixo, sem eco de nada. Sem canal óbvio de exfiltração:

- Não havia rota de listagem de arquivos nem servindo estático além de um `/app_models.py` fixo.
- O namespace do `exec` não tinha `self` disponível, e a instrução `import` (statement) quebrava
  dentro dele: só `__import__(...)` funcionava como chamada.

A solução foi **fazer o próprio processo vazar a flag na resposta seguinte**, usando uma técnica
chamada monkeypatch: trocar, em tempo de execução, uma função já carregada na memória do processo
por uma versão sua, sem alterar o código-fonte original. Aqui, o alvo foi a própria função que monta
o JSON de saída:

```python
codigo_python = """
j = __import__('json')
j._orig_dumps = j.dumps
def _hook(o, *a, **k):
    try:
        o['leak'] = __import__('os').environ.get('RCTF_FLAG')
    except Exception:
        pass
    return j._orig_dumps(o, *a, **k)
j.dumps = _hook
"""
```

> [!IMPORTANT/A ordem de execução é o que faz o truque funcionar]
> A resposta HTTP da própria requisição de restauração é serializada com `json.dumps` **depois** que
> o `exec` do `__setstate__` já rodou. Ao substituir (monkeypatch) `json.dumps` por uma versão que
> injeta a flag em qualquer objeto que for serializado, a exfiltração acontece **na mesma
> requisição**: sem precisar de uma segunda chamada nem de canal externo nenhum.

## 5. Capturando a flag

Ao mandar o pickle malicioso com esse `codigo_python`, a própria resposta da requisição de
`/api/rascunho/restaurar` já veio com o campo `leak` preenchido com o conteúdo de `RCTF_FLAG`.

### 🚩 Flag

```
flag{infinity_ctf_2026_pauta_eb84b93970}
```

## 6. Lições

- **Restringir `find_class` no `pickle` reduz a superfície, mas não fecha o problema**: qualquer
  classe permitida que faça algo perigoso com o estado desserializado (como rodar `exec` num campo)
  ainda é um gadget de RCE completo.
- **Quando a exfiltração não tem canal óbvio, pense em modificar o comportamento do próprio
  processo**, não só em ler dados existentes: sequestrar uma função de serialização usada pela
  resposta HTTP é uma técnica reaproveitável sempre que há RCE mas nenhum eco direto.
- **Exfiltração "in-band" (na própria resposta) é sempre preferível** quando canais externos (SSH,
  requisições para servidor próprio) podem estar bloqueados por firewall/classificador de segurança
  do ambiente de ataque.
- Corrigir na origem: **nunca usar `pickle` para dados não confiáveis**, ponto final: trocar por
  um formato de serialização que não execute código (JSON, msgpack) e, se precisar reconstruir
  objetos complexos, validar campo a campo manualmente em vez de confiar em `__setstate__`.

---

_Writeup do desafio Pauta (Infinity CTF 2026 · Web/Deserialização · Hard)._
