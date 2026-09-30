# 🧩 CTF Writeup: Web2

## 📝 Challenge Description

* **Category:** Web
* **Difficulty:** Hard: 2
* **Objective:** Reverse a custom PHP encryption algorithm to retrieve the flag from the provided encoded string `$miwen`.

The challenge provides the following source code:

```php
<?php
$miwen="a1zLbgQsCESEIqRLwuQAyMwLyq2L5VwBxqGA3RQAyumZ0tmMvSGM2ZwB4tws";

function encode($str){
    $_o=strrev($str);
        
    for($_0=0;$_0<strlen($_o);$_0++){
        $_c=substr($_o,$_0,1);
        $__=ord($_c)+1;
        $_c=chr($__);
        $_=$_.$_c;   
    } 
    return str_rot13(strrev(base64_encode($_)));
}

highlight_file(__FILE__);
?>

```

---

## 🔍 Analysis

By tracing the `encode()` function, we can determine the transformation pipeline applied to the flag. The developer used confusing variable names (like `$_`, `$_0`, and `$_o`) to obfuscate the logic, but the steps are linear:

1. **Reverse:** `strrev($str)`
2. **ASCII Increment:** Each character's ASCII value is increased by 1 (`ord($_c)+1`).
3. **Base64 Encode:** The resulting string is Base64 encoded.
4. **Reverse Again:** The Base64 string is reversed.
5. **ROT13:** Finally, `str_rot13` is applied.

---

## 🔓 Decryption Strategy

To recover the flag, we must apply the inverse operations in the **exact reverse order**:

| Step | Operation | Inverse Action |
| --- | --- | --- |
| 1 | `str_rot13` | **ROT13** (it is its own inverse) |
| 2 | `strrev` | **Reverse** the string |
| 3 | `base64_encode` | **Base64 Decode** |
| 4 | `+1 ASCII Shift` | **-1 ASCII Shift** |
| 5 | `strrev` | **Reverse** the string |

---

## 🛠️ Solve Script (Python)

```python
import base64

def decode_string(miwen):
    rot_13 =""
    for ch in miwen:
        if ch.isalpha():
            val = ord(ch)
            if val >=65 and val<=90:
                if val - 13 >=65:
                    rot_13 += chr(val-13)
                else:
                    rot_13 += chr(90 - (12-(val-65)))
            elif val >=97 and val<=122:
                if val - 13 >=97:
                    rot_13 += chr(val-13)
                else:
                    rot_13 += chr(122 - (12-(val-97)))
        else:
            rot_13 += ch
    revstr = rot_13[::-1]
    fstr = base64.b64decode(revstr).decode()
    flag = ""
    for ch in fstr:
        flag += chr(ord(ch) - 1)
    return flag[::-1]

print(decode_string("a1zLbgQsCESEIqRLwuQAyMwLyq2L5VwBxqGA3RQAyumZ0tmMvSGM2ZwB4tws"))
```