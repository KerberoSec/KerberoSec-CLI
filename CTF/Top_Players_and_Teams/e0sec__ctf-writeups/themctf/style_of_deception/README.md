# Style of Deception

| Field | Details |
|-------|---------|
| **Challenge** | Style of Deception |
| **Platform** | themctf.com |
| **Category** | Web / Steganography |
| **Flag** | `THEM?!CTF{CSS_M4G1C}` |

---

## Overview

The flag is hidden inside a CSS file using Unicode escape sequences stored as custom properties (CSS variables) in the `:root` block.

---

## Analysis

`theme.css` contains the following block:

```css
:root {
    --c1: "\54"; --c2: "\48"; --c3: "\45"; --c4: "\4d";
    --c5: "\3f"; --c6: "\21"; --c7: "\43"; --c8: "\54";
    --c9: "\46"; --c10: "\7b"; --c11: "\43"; --c12: "\53";
    --c13: "\53"; --c14: "\5f"; --c15: "\4d"; --c16: "\34";
    --c17: "\47"; --c18: "\31"; --c19: "\43"; --c20: "\7d";
}
```

The hex values in order:

```
54 48 45 4d 3f 21 43 54 46 7b 43 53 53 5f 4d 34 47 31 43 7d
```

Converting each to ASCII:

```
T  H  E  M  ?  !  C  T  F  {  C  S  S  _  M  4  G  1  C  }
```

---

## Flag

```
THEM?!CTF{CSS_M4G1C}
```
