# The Professor's Last Command: 50pts

**Category:** Reverse Engineering  
**Flag:** `K4P{Pr0f3ss0r_F1n4l_C0mm4nd_3x3cut3d}`

---

## Overview

A stripped ELF binary recovered from a USB drive. Running it shows a Bank of Spain vault terminal with a boot log and an interactive prompt. The challenge is to extract the flag hidden inside.

---

## Solution

### Step 1: Identify the binary format

```
$ file professors_terminal
professors_terminal: ELF 64-bit LSB executable, x86-64, dynamically linked, stripped
$ strings professors_terminal | grep -i pyi
Could not load PyInstaller's embedded PKG archive...
```

The binary is a **PyInstaller-packaged Python 3.14** executable.

### Step 2: Extract the PyInstaller archive

```bash
python3 pyinstxtractor.py professors_terminal
# [+] Possible entry point: terminal.pyc
# [+] Successfully extracted pyinstaller archive
```

This yields `terminal.pyc` among other files.

### Step 3: Decompile / disassemble

No decompiler supports Python 3.14 yet, so I fell back to the standard library:

```python
import dis, marshal

with open('professors_terminal_extracted/terminal.pyc', 'rb') as f:
    f.read(16)  # skip header
    code = marshal.loads(f.read())

dis.dis(code)
```

### Step 4: Map the anti-analysis layers

The code contains several decoys:

| Symbol | Content |
|---|---|
| `_DIAG_FLAGS` | List of 7 fake flags (`K4P{H3lp_W0nt_S4v3_Y0u}`, `K4P{Y0u_F0und_N0th1ng}`, etc.) |
| `_internal_secret_decode` | base64 → `K4P{N0t_Th3_R34l_Fl4g}` |
| `_vault_master_token` | base64 with a corrupted byte → mojibake |
| `_check_ptrace` / `_CORRUPTION_ACTIVE` | Anti-debug: if a debugger is detected, `_xor_key_base` returns `75 ^ 255 = 180` instead of `75`, producing garbage output |

The real decoding path (when `_CORRUPTION_ACTIVE` is `False`):

```
_decode_real_flag()
  └── _decode_bytes(_REAL_FLAG_ENC)
        └── key = _xor_key_base()  # returns 75
            for each byte b in _REAL_FLAG_ENC: b ^ 75
```

### Step 5: Extract `_REAL_FLAG_ENC` and decode

`_REAL_FLAG_ENC` is built inline as a `bytes` object from integer literals in the bytecode. I scraped them from the instruction stream:

```python
instructions = list(dis.get_instructions(code))

enc_bytes = []
for i, inst in enumerate(instructions):
    if inst.opname == 'BUILD_LIST':
        for j in range(i, len(instructions)):
            if instructions[j].opname == 'STORE_NAME' and instructions[j].argval == '_REAL_FLAG_ENC':
                enc_bytes = [instructions[k].argval for k in range(i, j)
                             if instructions[k].opname == 'LOAD_SMALL_INT']
                break

flag = bytes(b ^ 75 for b in enc_bytes).decode()
print(flag)
```

Output:

```
K4P{Pr0f3ss0r_F1n4l_C0mm4nd_3x3cut3d}
```

---

## Key takeaways

- PyInstaller binaries unpack cleanly with `pyinstxtractor` regardless of Python version.
- When decompilers fail, `dis` + `marshal` still expose constants and control flow.
- The anti-debug corruption flips the XOR key (`75 → 180`): static analysis sidesteps it entirely.
