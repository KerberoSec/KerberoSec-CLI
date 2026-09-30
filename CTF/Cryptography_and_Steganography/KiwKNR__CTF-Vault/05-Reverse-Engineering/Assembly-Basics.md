---
tags: [ctf, rev, assembly, x86]
created: 2026-05-01
---

# 🔧 Assembly Basics: อ่าน assembly ให้ได้

> ใน decompile-able binary มัก decompile ได้สวย: แต่บางครั้งต้องอ่าน assembly เพราะ:
>: Decompiler ผิด/พลาด
>: Optimization ทำให้ pseudocode ดูแปลก
>: Anti-decompile / inline asm
>: shellcode (encoded → manual disassemble)

หน้านี้ focus x86_64 (พบบ่อยที่สุด) + แนวคิด generalize ไปอื่นได้

---

## 📐 Architecture: x86_64

### Registers (x86_64)

#### General-purpose 64-bit
| 64 | 32 | 16 | 8 (high) | 8 (low) | Purpose |
|----|----|----|----|----|---------|
| `rax` | `eax` | `ax` | `ah` | `al` | Return value, accumulator |
| `rbx` | `ebx` | `bx` | `bh` | `bl` | Callee-saved |
| `rcx` | `ecx` | `cx` | `ch` | `cl` | Arg 4 (Linux), counter |
| `rdx` | `edx` | `dx` | `dh` | `dl` | Arg 3, return high |
| `rsi` | `esi` | `si` |: | `sil` | Arg 2 (Linux), source |
| `rdi` | `edi` | `di` |: | `dil` | Arg 1 (Linux), destination |
| `rbp` | `ebp` | `bp` |: | `bpl` | Frame pointer |
| `rsp` | `esp` | `sp` |: | `spl` | Stack pointer |
| `r8`-`r15` | `r8d`-`r15d` | `r8w`-`r15w` |: | `r8b`-`r15b` | More args/storage |

#### Special
- `rip`: Instruction Pointer (โปรแกรม counter)
- `rflags`: Status flags (zero, carry, sign, overflow, ...)

### Linux x86_64 Calling Convention (System V)
```
Args 1-6: rdi, rsi, rdx, rcx, r8, r9
Args 7+ : stack (right-to-left)
Return  : rax
Caller-saved: rax, rcx, rdx, rsi, rdi, r8-r11, xmm0-xmm15
Callee-saved: rbx, rbp, r12-r15, rsp
```

→ จำตามหลัก mnemonic: **D**iane's **S**ilk **D**ress **C**ost **8**9 (`rdi rsi rdx rcx r8 r9`)

### Windows x86_64
```
Args 1-4: rcx, rdx, r8, r9
Args 5+ : stack
Return  : rax
+ shadow space 32 bytes ก่อน call
```

---

## 📜 Common Instructions

### Data Movement
```asm
mov rax, rbx                ; rax = rbx
mov rax, 0x42               ; rax = 0x42 (immediate)
mov rax, [rbx]              ; rax = *rbx (load from memory)
mov [rax], rbx              ; *rax = rbx (store)
mov rax, [rbx + 8]          ; rax = *(rbx + 8)
mov rax, [rbx + rcx*4]      ; rax = *(rbx + rcx*4)  (array indexing!)
mov rax, [rbx + rcx*4 + 0x10]

lea rax, [rbx + 8]          ; rax = rbx + 8 (no dereference!)
                            ; ใช้สำหรับ:
                            ; - คำนวณ address ของ string/struct
                            ; - หรือ "smart add" (lea rax, [rbx*2 + rcx])

push rax                    ; rsp -= 8; *rsp = rax
pop rax                     ; rax = *rsp; rsp += 8

xchg rax, rbx               ; swap
```

### Arithmetic
```asm
add rax, 1                  ; rax += 1
add rax, rbx                ; rax += rbx
sub rax, rbx                ; rax -= rbx
inc rax                     ; rax++
dec rax                     ; rax--
neg rax                     ; rax = -rax

imul rax, rbx               ; rax *= rbx (signed)
imul rax, rbx, 5            ; rax = rbx * 5
mul rbx                     ; rdx:rax = rax * rbx (unsigned, 128-bit)
idiv rbx                    ; rax = rdx:rax / rbx; rdx = remainder

shl rax, 2                  ; rax <<= 2 (= rax * 4)
shr rax, 1                  ; rax >>= 1 (= rax / 2 unsigned)
sar rax, 1                  ; rax >>= 1 (signed, sign-extend)
rol/ror                     ; rotate
```

### Bitwise
```asm
and rax, 0xff               ; rax &= 0xff (mask)
or  rax, rbx                ; rax |= rbx
xor rax, rbx                ; rax ^= rbx
xor rax, rax                ; rax = 0 (idiom!)
not rax                     ; rax = ~rax
test rax, rax               ; AND but discards (sets flags)
test rax, 1                 ; check if bit 0 set
```

### Compare + Jump
```asm
cmp rax, rbx                ; sets flags (rax - rbx)
                            ; flags ที่ตามมา:
                            ; ZF (zero) = rax == rbx
                            ; SF (sign) = sign of rax - rbx

je   label                  ; jump if equal (ZF=1)
jne  label                  ; jump if not equal (ZF=0)
jl   label                  ; jump if less (signed)
jle  label                  ; ≤ signed
jg   label                  ; > signed
jge  label                  ; ≥ signed
jb   label                  ; < unsigned (below)
jbe  label                  ; ≤ unsigned
ja   label                  ; > unsigned (above)
jae  label                  ; ≥ unsigned
jz   label                  ; zero (= je)
jnz  label                  ; not zero (= jne)
js   label                  ; sign set (negative)
jns  label                  ; sign not set
```

### Functions
```asm
call function               ; push return addr, jump to function
ret                         ; pop return addr, jump back
ret 0x10                    ; pop + add 0x10 to rsp (clean stack)

jmp  label                  ; unconditional jump
jmp  rax                    ; jump to address in rax (indirect)
jmp  [rax]                  ; jump to *rax
```

### Stack Frame
```asm
; Function prologue
push rbp
mov  rbp, rsp
sub  rsp, 0x20              ; reserve 32 bytes for locals

; ... function body ...

; Function epilogue
mov  rsp, rbp               ; restore rsp
pop  rbp
ret

; Or shorthand:
leave                       ; mov rsp, rbp; pop rbp
ret
```

---

## 🧩 Recognize Common Patterns

### Loop
```asm
mov rcx, 0                  ; i = 0
.loop:
    cmp rcx, 10             ; i < 10?
    jge .end
    ; ... body ...
    inc rcx
    jmp .loop
.end:
```

```c
for (int i = 0; i < 10; i++) { ... }
```

### If-else
```asm
cmp rax, 0
je  .else
    ; if branch
    jmp .end
.else:
    ; else branch
.end:
```

### switch / jump table
```asm
cmp rax, 5
ja  .default                ; if (val > 5) goto default
jmp [.table + rax*8]        ; jump table indexing

.table:
    .quad .case0
    .quad .case1
    ...
```

### array access
```asm
mov rax, [rbp - 0x10]       ; load array base
mov rax, [rax + rcx*4]      ; arr[i]  (4-byte int)
```

### struct access
```asm
mov rax, [rbp - 0x10]       ; pointer to struct
mov ebx, [rax + 8]          ; struct.field_at_offset_8
```

### function call
```asm
mov rdi, arg1
mov rsi, arg2
mov rdx, arg3
call function
mov rax, rax                ; result in rax
```

### string compare
```asm
mov rdi, user_input
mov rsi, password
call strcmp
test rax, rax
jne .wrong                  ; if (strcmp != 0) wrong
```

---

## 🎯 CTF Common Patterns

### Pattern 1: XOR loop
```asm
xor rcx, rcx                 ; i = 0
.loop:
    mov al, [rdi + rcx]      ; al = input[i]
    xor al, 0x42             ; al ^= 0x42
    cmp al, [rsi + rcx]      ; al == expected[i]?
    jne .wrong
    inc rcx
    cmp rcx, 8               ; i < 8?
    jl .loop
```

→ password = expected XOR 0x42 ทุก byte

### Pattern 2: Stack string
```asm
mov dword ptr [rbp - 0x10], 0x47414c46    ; "FLAG" (little-endian)
mov dword ptr [rbp - 0xc], 0x6f6c6c65     ; "ello"
mov byte ptr [rbp - 0x8], 0
```

→ string ฝังใน code ตรงๆ: `0x47414c46` little-endian = bytes `46 4c 41 47` = "FLAG"

### Pattern 3: Dispatch table (state machine / VM)
```asm
mov rax, [opcode]
cmp rax, 0xFF
jbe .valid
jmp .error
.valid:
jmp [.handler_table + rax*8]
```

→ VM bytecode interpreter: ดู [VM-Reversing](../16-Misc/VM-Reversing.md)

### Pattern 4: Encrypted constants
```asm
mov rax, 0x4e535e4c4d574b00
xor rax, 0x0d171a2e2832210f    ; → 0x434446726565... ?
```

→ 2 constants XOR กัน → ได้ string จริง

---

## 🔍 Reading Optimized Code

Compiler optimize ทำให้ assembly ดูแปลก:

### Multiplication trick
```asm
; x * 5
lea rax, [rdi + rdi*4]       ; rdi + rdi*4 = rdi * 5
```

```asm
; x * 9
lea rax, [rdi + rdi*8]       ; rdi * 9
```

### Division by constant: magic numbers
```asm
; x / 7 (unsigned, 32-bit)
mov edx, 0x24924925
mul edx
shr edx, 2
; rdx = x / 7
```

→ compiler ใช้ "magic constant multiplication" หลีกเลี่ยง div instruction (ช้า)

### Recognize via tools
- **GodBolt** (godbolt.org): เขียน C → ดู assembly จริง
- **Compiler Explorer**: เทียบ optimization levels

---

## 📦 String Handling (memcpy/strcpy)

### Inlined memcpy
```asm
; แทน call memcpy(dst, src, 16)
mov rax, [rsi]
mov [rdi], rax
mov rax, [rsi+8]
mov [rdi+8], rax
```

### Inlined memset
```asm
; เคลียร์ buffer 32 bytes
xor rax, rax
mov [rdi], rax
mov [rdi+8], rax
mov [rdi+16], rax
mov [rdi+24], rax
```

หรือ:
```asm
; rep stosb
mov rcx, 32
xor al, al
mov rdi, buffer
rep stosb              ; while(rcx--) *rdi++ = al
```

---

## 🔥 ARM Assembly (mobile/IoT)

ARM ต่างจาก x86 หลายอย่าง:

### Registers
- `r0-r12`: general
- `r13` = `sp`
- `r14` = `lr` (link register, return addr)
- `r15` = `pc`
- `cpsr`: flags

### ARM64
- `x0-x30` (64-bit), `w0-w30` (32-bit)
- `x29` = frame pointer (`fp`)
- `x30` = link register (`lr`)
- `sp` separate

### Common ARM
```arm
mov r0, #5                ; r0 = 5
add r0, r1, r2            ; r0 = r1 + r2 (3-operand!)
ldr r0, [r1]              ; r0 = *r1 (load)
str r0, [r1]              ; *r1 = r0 (store)
b   label                 ; branch
bl  function              ; branch and link (= call)
bx  lr                    ; return (= bx lr)
ldr r0, [r1, #4]!         ; pre-index (r1 += 4 first)
ldr r0, [r1], #4          ; post-index (r1 += 4 after)
```

### Calling convention (ARM)
- Args: `r0-r3`
- Return: `r0`
- Callee-saved: `r4-r11`

### Calling convention (ARM64)
- Args: `x0-x7`
- Return: `x0`
- Callee-saved: `x19-x28`

---

## 🛠 Disasm Tools

### objdump
```bash
objdump -d binary           # disassemble all
objdump -d -M intel binary  # Intel syntax
objdump -d --section=.text binary
objdump -D binary           # all sections
```

### radare2 quick disasm
```bash
r2 -A binary
[]> pdf @ main              # print disasm of main
[]> pd 50                   # 50 instructions from current
```

### Online
- **godbolt.org**: C → asm
- **defuse.ca/online-x86-assembler**: assemble bytes ↔ asm

---

## 🔗 ต่อไป

- [Static-Analysis](Static-Analysis.md)
- [Dynamic-Analysis](Dynamic-Analysis.md)
- [Anti-Debug-Tricks](Anti-Debug-Tricks.md)
- [Pwn: ใช้ asm มาก](../06-Binary-Exploitation/Buffer-Overflow.md)

## 📚 References

- "Reverse Engineering for Beginners": Dennis Yurichev (ฟรี ภาษาไทย/อังกฤษ มี)
- godbolt.org: interactive
- felixcloutier.com/x86: x86 instruction reference

---

#ctf #rev #assembly
