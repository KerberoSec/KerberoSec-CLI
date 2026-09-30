---
tags: [ctf, rev, vm, bytecode, obfuscation]
created: 2026-05-02
---

# 🎰 VM (Virtual Machine) Reversing

> Binary ที่มี **bytecode VM ของตัวเอง**: real logic encoded เป็น bytecode, native code = interpreter loop
>
> ทำให้ direct decompile ไม่เห็น logic: เห็นแค่ "loop เลือก opcode → ทำ operation"

---

## 🤔 Concept

### Normal binary
```
input → main() → check_password() → return result
```

Decompile → เห็น check_password ตรงๆ

### VM-based binary
```
input → main() → vm_run(bytecode) → return result

vm_run = loop {
    op = bytecode[pc++]
    switch (op) {
        case 0x01: ...      (custom semantics)
        case 0x02: ...
        ...
    }
}

bytecode = [0x01, 0x05, 0x02, 0x42, ...]   ← real logic
```

Decompile → เห็น dispatch loop, ไม่เห็น logic
- Logic อยู่ใน bytecode array
- ต้อง reverse VM (handlers) → understand opcodes → disassemble bytecode → reverse logic ใน bytecode

---

## 🎯 Recognize VM

### Signs
- Tight loop with `switch` on byte
- Large array of bytes (initialized with constants)
- Functions with similar shape (each handles 1 opcode)
- `pc` (program counter) variable
- Stack/registers manipulated by handlers

### Common VM types
- **Stack-based** (like JVM, Python): operations on stack
- **Register-based** (like Lua, Dalvik): explicit registers

### Pattern in code (Ghidra view)
```c
while (running) {
    op = bytecode[pc];
    pc++;
    
    switch (op) {
        case 0x01:  // PUSH
            stack[sp++] = bytecode[pc++];
            break;
        case 0x02:  // ADD
            stack[sp-2] = stack[sp-2] + stack[sp-1];
            sp--;
            break;
        case 0x03:  // CMP
            ...
        ...
    }
}
```

---

## 🛠 Workflow

### 1. Identify VM components
- **Dispatch loop**: main switch
- **Bytecode array**: usually large constant
- **VM state**: PC, stack, registers, memory
- **Halt condition**

### 2. Reverse each opcode handler

ใส่ comment + label ใน Ghidra:
```c
case 0x01: /* OP_PUSH_IMM */
    stack[sp++] = bytecode[pc++];
    break;

case 0x02: /* OP_PUSH_REG */
    stack[sp++] = registers[bytecode[pc++]];
    break;

case 0x03: /* OP_ADD */
    stack[sp-2] += stack[sp-1];
    sp--;
    break;

case 0x04: /* OP_XOR */
    stack[sp-2] ^= stack[sp-1];
    sp--;
    break;

case 0x05: /* OP_LOAD_INPUT */
    stack[sp++] = input[bytecode[pc++]];
    break;

case 0xFF: /* OP_HALT */
    running = false;
    break;
```

### 3. Build disassembler

Custom Python script ที่อ่าน bytecode + opcodes ที่ reverse แล้ว:

```python
opcodes = {
    0x01: ("PUSH_IMM", 1),    # 1 byte operand
    0x02: ("PUSH_REG", 1),
    0x03: ("ADD", 0),
    0x04: ("XOR", 0),
    0x05: ("LOAD_INPUT", 1),
    0xFF: ("HALT", 0),
}

bytecode = bytes.fromhex("01050201020503...")

pc = 0
while pc < len(bytecode):
    op = bytecode[pc]
    name, num_operands = opcodes.get(op, (f"UNK_{op:02X}", 0))
    operands = bytecode[pc+1:pc+1+num_operands]
    print(f"{pc:04x}: {name} {' '.join(f'{b:02x}' for b in operands)}")
    pc += 1 + num_operands
```

Output:
```
0000: PUSH_IMM 05
0002: PUSH_REG 01
0004: XOR
...
```

### 4. Reverse logic in bytecode

ตอนนี้อ่านได้เหมือน assembly: trace logic:
- Where input comes in
- What checks performed
- What "win" condition

### 5. Solve

- Brute force all inputs (if small)
- Symbolic execution with custom VM
- Z3 solver: express VM logic as constraints

---

## 🎯 Common VM Tricks ใน CTF

### Trick 1: Encrypted bytecode
- Bytecode = encrypted blob
- Decrypted at runtime (XOR with key, AES, etc.)
- → trace decryption first → recover plaintext bytecode

### Trick 2: Dispatch table jumbled
- ไม่ใช้ `switch`: ใช้ `jmp_table[opcode]`
- เป็น array of function pointers
- Easy in Ghidra: identify each pointer → name function `op_NN_handler`

### Trick 3: Multiple VMs
- VM ที่ inner runs another VM
- Each layer adds obfuscation

### Trick 4: Self-modifying bytecode
- Bytecode มี opcode ที่แก้ bytecode array
- → trace dynamic: dump after self-modify

### Trick 5: Anti-VM-reversing
- Opcodes randomized each run
- Garbage instructions inserted
- Junk handlers (do nothing)

---

## 🐍 Symbolic Execution on Custom VM

ถ้า VM logic ซับซ้อน: implement VM ใน Python ด้วย symbolic values:

```python
import z3

class SymbolicVM:
    def __init__(self, bytecode, input_size):
        self.bc = bytecode
        self.pc = 0
        self.stack = []
        self.input = [z3.BitVec(f'in_{i}', 8) for i in range(input_size)]
        self.constraints = []
    
    def step(self):
        op = self.bc[self.pc]
        self.pc += 1
        
        if op == 0x01:    # PUSH_IMM
            self.stack.append(z3.BitVecVal(self.bc[self.pc], 32))
            self.pc += 1
        elif op == 0x05:    # LOAD_INPUT
            idx = self.bc[self.pc]
            self.pc += 1
            self.stack.append(z3.ZeroExt(24, self.input[idx]))
        elif op == 0x04:    # XOR
            b = self.stack.pop()
            a = self.stack.pop()
            self.stack.append(a ^ b)
        elif op == 0x10:    # CHECK (must equal 0)
            a = self.stack.pop()
            self.constraints.append(a == 0)
        # ... more ops
    
    def solve(self):
        s = z3.Solver()
        for c in self.constraints:
            s.add(c)
        if s.check() == z3.sat:
            m = s.model()
            return bytes(m[v].as_long() for v in self.input)

vm = SymbolicVM(bytecode, 8)
while not vm.halted:
    vm.step()

print(vm.solve())
```

---

## 🎯 ตัวอย่าง CTF Pattern

### Challenge: "VM crackme"
1. Open in Ghidra
2. main() → loop ที่ดู switch on byte
3. Identify bytecode array (constant)
4. Reverse 20-30 opcode handlers manually
5. Write Python disassembler
6. Look at disassembly → typical password check pattern
7. Either:
   - Brute force (if input small)
   - Reverse algorithm (XOR/transform reverse)
   - Symbolic solve (z3)

### ตัวอย่างจริง
- **Flare-On challenges**: มี VM-based ทุกปี
- **Google CTF**: มี VM challenges
- **PicoCTF**: บางปีมี

---

## 🎯 Special VMs in real-world

### eBPF (Linux kernel)
- In-kernel VM: verifier ensures safety
- ใน CTF: kernel pwn ที่เกี่ยว eBPF

### Wasm (WebAssembly)
- Web/desktop apps
- Tools: wabt (wasm2wat for disasm)

### .NET CIL
- C# bytecode
- dnSpy decompile to C# directly

### JVM
- Java bytecode
- jadx / CFR / JD-GUI decompile

### Lua bytecode
- Compiled .luac files
- **luadec** decompiler

### Python bytecode
- .pyc files
- **uncompyle6** / **decompyle3** → source

```bash
pip install decompyle3
decompyle3 file.pyc > file.py
```

---

## 🛠 Tools

- **Ghidra**: manual reverse
- **Custom Python**: disassembler/interpreter (95% of work)
- **z3-solver**: symbolic
- **angr**: automated symbolic execution (sometimes works)

---

## 🎓 Practice

- **Flare-On** ⭐ (Mandiant CTF): every year has VM challenges
- **HackTheBox Reverse**: some VM
- **crackmes.one**: search "VM"

---

## 🔗 ที่เกี่ยวข้อง

- [../05-Reverse-Engineering/RE-Intro](../05-Reverse-Engineering/RE-Intro.md)
- [../05-Reverse-Engineering/Anti-Debug-Tricks](../05-Reverse-Engineering/Anti-Debug-Tricks.md)
- [Misc-Challenges](Misc-Challenges.md)

## 📚 References

- "Practical Reverse Engineering": Bruce Dang (chapter on virtualization)
- "VM-Based Software Protection: A Reverse Engineering Approach"
- Flare-On past writeups (mandiant.com)

---

#ctf #rev #vm #bytecode
