---
authors:
    - Lukas Daubner
date: 16-01-2024
---

# Misc: Canvas

The source code contains obfuscated javascript

We can use online tool to deopfuscate it (e.g., https://deobfuscate.io/)

But that will still give us bunch of gibberish. But if we look closely, the flag is right there! `var res = String.fromCharCode(72, 84, 66, 123, 87, 51, 76, 99, 48, 109, 51, 95, 55, 48, 95, 74, 52, 86, 52, 53, 67, 82, 49, 112, 55, 95, 100, 51, 48, 98, 70, 117, 53, 67, 52, 55, 49, 48, 78, 125, 10);`