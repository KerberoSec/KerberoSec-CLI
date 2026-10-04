# HTB: Virtually Mad

## Challenge Overview

**Category:** Reverse Engineering  
**Platform:** Hack The Box  
**Challenge:** Virtually Mad  
**Binary:** `virtually.mad`  
**Architecture:** ELF 64-bit, x86-64, stripped

The challenge presents a custom virtual machine (VM). The program accepts hexadecimal input, interprets every 8 hexadecimal characters as one VM instruction, executes the instructions, and checks the resulting VM state to decide whether the input is correct.

---

## Initial Triage

The binary was first identified with `file`:

```bash
file virtually.mad
```
<img width="941" height="56" alt="Screenshot 2026-09-08 162037" src="https://github.com/user-attachments/assets/4a174176-1b32-45fe-a5bd-2805e8e04ebf" />

Output:

```text
virtually.mad: ELF 64-bit LSB pie executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, ... stripped
```

Useful strings included:

<img width="396" height="449" alt="Screenshot 2026-09-08 162020" src="https://github.com/user-attachments/assets/ac28d6a3-7b9f-4cb4-85b7-de985d9088d5" />

```text
Give me code to execute:
Invalid code.
Executing %d opcodes.
Invalid value.
Bad instruction!
Skipping opcode #%d, value too high (0x%x).
This is the right answer! Validate the challenge with HTB{%s}
```

The success string strongly suggested that the correct input itself would be placed inside the final `HTB{...}`.

---

## Understanding the Input Format

The main function checks:

```c
sVar5 = strlen(local_118);

if ((sVar5 & 7) == 0) {
    uVar2 = iVar1 >> 3;
    printf("Executing %d opcodes.\n", (ulong)uVar2);
    ...
}
else {
    puts("Invalid code.");
}
```
<img width="959" height="505" alt="fun_00101754" src="https://github.com/user-attachments/assets/b3205db7-d7eb-4b79-8d12-32b2bbde2d99" />

Therefore the input length must be divisible by 8.

Each 8-character chunk is copied into a buffer and converted from hexadecimal using:

```c
uVar7 = strtol(local_121, (char **)0x0, 0x10);
```

So every VM instruction is represented as an **8-digit hexadecimal value**.

The final success condition contains:

```c
&& (uVar2 == 5)
```

Therefore the correct program must contain exactly **5 opcodes**, giving a total input length of **40 hexadecimal characters**.

---

## VM State

The VM state is allocated by `FUN_001011c9()`:

```c
puVar1 = calloc(1,0x38);
*puVar1 = 0;
puVar1[1] = 0;
puVar1[2] = 0;
puVar1[3] = 0;
puVar1[0xc] = 0;
```

The important fields are:

| Field | Register |
|------:|----------|
| `piVar4[0]` | `a` |
| `piVar4[1]` | `b` |
| `piVar4[2]` | `c` |
| `piVar4[3]` | `d` |
| `piVar4[12]` | `flags` |

The state printer `FUN_0010125c()` confirms this layout:

```c
printf("=====\na: 0x%x\nb: 0x%x\nc: 0x%x\nd: 0x%x\nflags: 0x%x\n=====\n",
       (ulong)*param_1,
       (ulong)param_1[1],
       (ulong)param_1[2],
       (ulong)param_1[3],
       (ulong)param_1[0xc]);
```

The success condition in `main()` requires the final state to be:

```text
a     = 0x200
b     = 0xffffffff
c     = 0xffffffff
d     = 0x00000000
flags = 0x10000000
```

---

## Opcode Dispatcher

The VM executes instructions through `FUN_001016aa()`:

```c
(*apcStack_68[(int)(param_2 >> 0x18)])(param_1,param_2);
```
<img width="957" height="504" alt="fun_001016aa" src="https://github.com/user-attachments/assets/563eb5e1-0dc7-46bc-a9a2-7c6b38d4a1e8" />

The upper byte of the instruction therefore selects the VM operation.

The function-pointer table maps the operations as follows:

```text
0x01 → FUN_00101322
0x02 → FUN_001013e9
0x03 → FUN_001014c6
0x04 → FUN_001015bd
```
<img width="959" height="505" alt="fun_00101754" src="https://github.com/user-attachments/assets/640e1691-520e-4f6a-b5e6-c8f6ac778016" />

### Instruction Encoding

The handlers use this general layout:

```text
31........24 23....20 19....16 15....12 11.........0
   opcode       1        dst      mode       operand
```

The `mode` field is either:

```text
0 = immediate value
1 = register reference
```

---

## Opcode 0x02: ADD

`FUN_001013e9()` performs addition:

```c
local_1c = param_2 & 0xfff;

if (uVar2 == 1) {
    local_1c = **(uint **)(param_1 + ((long)((int)local_1c >> 8) + 2) * 8);
}

**(int **)(param_1 + ((long)(int)uVar1 + 2) * 8) =
    local_1c + **(int **)(param_1 + ((long)(int)uVar1 + 2) * 8);
```

<img width="959" height="506" alt="fun_001013e9" src="https://github.com/user-attachments/assets/952395e7-5219-4680-aabe-74471c57bfc5" />

Therefore:

```text
ADD dst, operand
```

---

## Opcode 0x03: SUB

`FUN_001014c6()` performs subtraction:

```c
**(int **)(param_1 + ((long)(int)uVar1 + 2) * 8) =
    **(int **)(param_1 + ((long)(int)uVar1 + 2) * 8) - local_1c;
```
<img width="959" height="503" alt="fun_001014c6" src="https://github.com/user-attachments/assets/e900fc7b-de7d-49b5-b0ea-26fd7975fb06" />

Therefore:

```text
SUB dst, operand
```

---

## Opcode 0x01: MOV / LOAD

`FUN_00101322()` writes the operand into the selected destination register:

```c
**(uint **)(param_1 + ((long)(int)((int)param_2 >> 0x10 & 0xf) + 2) * 8) = local_1c;
```

For `mode == 1`, the operand is taken from another register instead of being used directly.

<img width="956" height="504" alt="fun_00101322" src="https://github.com/user-attachments/assets/575007c0-8f29-4e3b-b195-b34cb09f3dfa" />

Therefore:

```text
MOV dst, operand
```

---

## Opcode 0x04: CMP

`FUN_001015bd()` compares the selected register against the operand:

```c
if (local_1c == **(uint **)(param_1 + ((long)(int)((int)param_2 >> 0x10 & 0xf) + 2) * 8)) {
    FUN_001012a9(param_1,1);
}
else {
    FUN_001012a9(param_1,0);
}
```

<img width="959" height="503" alt="fun_001015bd" src="https://github.com/user-attachments/assets/c2150970-0999-4174-9441-37eba0b71da2" />

This comparison controls the `flags` field.

`FUN_001012a9()` sets bit `0x10000000` when the comparison succeeds:

```c
*(uint *)(param_1 + 0x30) = *(uint *)(param_1 + 0x30) | 0x10000000;
```

<img width="959" height="503" alt="fun_001012a9" src="https://github.com/user-attachments/assets/38026bb1-552b-49d5-b54e-44290bbb76e7" />

For the final state we need this flag set, so the comparison must be equal.

---

## Deriving the Five Instructions

The validation logic in `main()` restricts the five instruction patterns to:

```text
#0: 02 10 ????
#1: 02 00 ????
#2: 03 11 ????
#3: 01 12 ????
#4: 04 13 ????
```

All operands must also be at most `0x100` because of:

```c
if ((uVar3 & 0xfff) < 0x101)
```

### Instruction 1

Start with:

```text
a = 0
```

Use:

```text
02100100
```

This performs:

```text
a += 0x100
```

Result:

```text
a = 0x100
```

### Instruction 2

Use the same operation again:

```text
02100100
```

Now:

```text
a = 0x200
```

This matches the required final value for `a`.

### Instruction 3

We need:

```text
b = 0xffffffff
```

Since `b` starts at zero, subtracting `1` using 32-bit arithmetic produces `0xffffffff`:

```text
03110001
```

This performs:

```text
b = b - 1
```

Result:

```text
b = 0xffffffff
```

### Instruction 4

Copy `b` into `c` using register mode:

```text
01121100
```

The `mode = 1` operand references register `b`, so:

```text
c = b
```

Result:

```text
c = 0xffffffff
```

### Instruction 5

`d` starts at zero. Compare it against the immediate value zero:

```text
04130000
```

Because:

```text
d == 0
```

`FUN_001012a9()` sets:

```text
flags = 0x10000000
```

---

## Final Opcode Sequence

The five instructions are:

```text
02100100
02100100
03110001
01121100
04130000
```

Concatenating them gives the complete 40-character input:

```text
0210010002100100031100010112110004130000
```

---

## Verification

Run the binary:

```bash
./virtually.mad
```

Provide:

```text
Give me code to execute: 0210010002100100031100010112110004130000
```

<img width="715" height="170" alt="Screenshot 2026-09-08 161955" src="https://github.com/user-attachments/assets/14ff6ed3-21f8-4ba6-a492-5eeab34721af" />

The resulting VM state should be:

```text
=====
a: 0x200
b: 0xffffffff
c: 0xffffffff
d: 0x0
flags: 0x10000000
=====
This is the right answer! Validate the challenge with HTB{0210010002100100031100010112110004130000}
```

---

## Flag

```text
HTB{0210010002100100031100010112110004130000}
```

---

## Conclusion

The challenge uses a small custom virtual machine with four relevant instructions: `MOV`, `ADD`, `SUB`, and `CMP`. The key was to reverse the instruction dispatcher and the individual opcode handlers, then work backwards from the exact VM state required by the success condition.

The final solution is a five-instruction VM program:

```text
02100100 02100100 03110001 01121100 04130000
```

which produces the required register and flag state and causes the binary to print the flag.
