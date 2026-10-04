# Natas Level 8 -> 9

## Goal

Find the password for natas9.

## Key Concept

Source code inspection / reversing encoding operations.

## Solution

The page shows PHP source code with an encoded secret and the encoding function:

```php
$encodedSecret = "...";

function encodeSecret($secret) {
    return bin2hex(strrev(base64_encode($secret)));
}
```

We're given the encoded value `y` and the encoding function `f`. We need to find `x` such that `f(x) = y`. Since `f` is easily invertible, we simply compute `x = f⁻¹(y)`:

```
f(x) = bin2hex(strrev(base64_encode(x))) = y
x = base64_decode(strrev(hex2bin(y)))
```

Reverse the operations in opposite order:
1. `hex2bin` - convert hex string to bytes
2. `strrev` - reverse the string
3. `base64_decode` - decode base64

Submit the decoded secret to get the password.

`solve.py`

```bash
uv run level08/solve.py
```
