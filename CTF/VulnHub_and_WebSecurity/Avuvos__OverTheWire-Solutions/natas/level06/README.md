# Natas Level 6 -> 7

## Goal

Find the password for natas7.

## Key Concept

Exposed source files / include path disclosure.

## Solution

The page shows PHP source code that includes a secret from `includes/secret.inc`:

```php
include "includes/secret.inc";
```

Navigating to `/includes/secret.inc` exposes the secret value. Submit this secret to the form to get the password.

`solve.py`

```bash
uv run level06/solve.py
```
