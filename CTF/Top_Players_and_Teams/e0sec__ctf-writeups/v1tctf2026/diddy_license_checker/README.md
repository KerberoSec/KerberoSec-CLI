# DIDDY LICENSE CHECKER: v1t CTF 2026

**Category:** Misc  
**Points:** 100  
**Flag:** `v1t{435_f1b0_w3bs1t3}`

---

## Overview

A Linux x86-64 ELF binary that acts as a "license checker". It asks three security questions, fetches an AES key from the CTF server, and decrypts a hardcoded ciphertext to produce the flag.

```
$ file diddy
diddy: ELF 64-bit LSB pie executable, x86-64, dynamically linked, not stripped
```

---

## Analysis

Disassemble `main` and the helper functions (`xor_bytes`, `base64_decode`, `http_get`, `write_cb`, `fib`). Three checks gate the flag:

### 1: Pet type

```asm
cmpl $0x6b637564, -0x3b0(%rbp)   ; compare 4 bytes to 'duck' (little-endian)
cmpb $0x0, -0x3ac(%rbp)          ; fifth byte must be NUL (exact match)
```

Answer: **`duck`**

### 2: Lucky number

A 32-character string is read with `%32s`. The first byte must be `'0'`. Then for each subsequent position `i` (1 ≤ i ≤ 31), the digit is validated against `fib(i) % 9`:

```
F(1)%9=1, F(2)%9=1, F(3)%9=2, F(4)%9=3, F(5)%9=5, F(6)%9=8,
F(7)%9=4, F(8)%9=3, F(9)%9=7, F(10)%9=1, F(11)%9=8, F(12)%9=0,
F(13)%9=8, F(14)%9=8, F(15)%9=7, F(16)%9=6, F(17)%9=4, F(18)%9=1,
F(19)%9=5, F(20)%9=6, F(21)%9=2, F(22)%9=8, F(23)%9=1, F(24)%9=0,
F(25)%9=1, F(26)%9=1, F(27)%9=2, F(28)%9=3, F(29)%9=5, F(30)%9=8, F(31)%9=4
```

Answer: **`01123584371808876415628101123584`**

This 32-character string is also the hex-encoded AES IV used later.

### 3: License name

The license name is appended to a base64-decoded URL:

```
base64_decode("aHR0cDovL3YxdC5zaXRlLw==") → "http://v1t.site/"
url = "http://v1t.site/" + license_name
```

`http_get(url)` fetches the response: a 32-hex-char AES key.

The hardcoded `arr` (96 4-byte ints in `.data`) is XOR'd byte-by-byte with the license name (cycling) to produce the hex-encoded AES ciphertext:

```
ciphertext_hex[i] = arr[i] ^ license_name[i % len(license_name)]
```

For this to yield a valid hex string, the license name must be exactly **`license-for-user-deadbeef-diddy`** (31 chars). This is a file served by the CTF server's backing [GitHub repo](https://github.com/xuanlockun/v1t).

```
$ curl http://v1t.site/license-for-user-deadbeef-diddy
7631745f3433355f6b33795f66726672
```

---

## Decryption

All values recovered:

| Parameter | Value |
|-----------|-------|
| AES Key (from server) | `7631745f3433355f6b33795f66726672` (`v1t_435_k3y_frfr`) |
| AES IV (lucky number) | `01123584371808876415628101123584` |
| Ciphertext (arr ⊕ license name, hex decoded) | `9fad7f446b751ae0f12d06736710eb70110cd73f69976c5bfed1c5dc6432b8823d1378094fa60d347d9b4da3399db570` |

```python
from Crypto.Cipher import AES

arr = bytes.fromhex(
    '550f020159155119500d4518441200424b55570554545256501a555901064e5c'
    '5852550d17521e00594b14424506474f02000555015001051b505a5606415'
    '45b50015f4052155656464b144555161e5052055d005101071e57505d001b595e53'
)
license_name = b'license-for-user-deadbeef-diddy'
ciphertext   = bytes.fromhex(
    bytes([arr[i] ^ license_name[i % len(license_name)]
           for i in range(len(arr))]).decode()
)
key = bytes.fromhex('7631745f3433355f6b33795f66726672')
iv  = bytes.fromhex('01123584371808876415628101123584')

plaintext = AES.new(key, AES.MODE_CBC, iv).decrypt(ciphertext)
# plaintext = b'7631747b3433355f663162305f773362733174337d\x06\x06...'

flag = bytes.fromhex(plaintext.split(b'\x06')[0].decode())
print(flag)  # b'v1t{435_f1b0_w3bs1t3}'
```

The AES plaintext is itself a hex string (double-encoded). Decoding it gives the flag.

---

**Flag:** `v1t{435_f1b0_w3bs1t3}`
