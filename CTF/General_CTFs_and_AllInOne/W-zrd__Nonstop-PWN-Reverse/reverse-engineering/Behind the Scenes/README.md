**Keyword: UD2, Undefined Instruction**

**Challenge URL:** https://app.hackthebox.com/challenges/Behind%2520the%2520Scenes

Given an executable file in 64-bit ELF format. If you run the program, it will ask you a password in order to get the flag. Actually this challenge can be done easily by opening the executable file using Radare2 like shown on the image below.

*[Image: alt]*

Unlike Ghidra or IDA, Radare2 tends to be more permissive with invalid instructions which will continue disassembling even after encountering unusual instructions like `UD2` (we'll talk about this later). As you can see, there are several parts of the string that are stored in separate memory addresses. This method is definitely the easiest way to solve the challenge, but let's learn the basic and forget this method.

Open the binary file in Ghidra to see disassembled result of that file.

*[Image: alt]*

Let’s begin with the highlighted part of the decompiled code, which is `invalidInstructionException()`. When you select `invalidInstructionException()` in the decompiled code, Ghidra highlights the following opcode:

```c
001012e6  0f  0b           UD2
```

After the `UD2` instruction, we see a series of byte values that Ghidra couldn't properly disassemble. However, these bytes are likely to be valid instructions.

```c
001012e6 0f 0b           UD2
001012e8 83              ??         83h
001012e9 bd              ??         BDh
001012ea 5c              ??         5Ch
001012eb ff              ??         FFh
001012ec ff              ??         FFh
001012ed ff              ??         FFh
001012ee 02              ??         02h
001012ef 74              ??         74h
001012f0 1a              ??         1Ah
```

These bytes can be interpreted as valid x86-64 assembly instructions:

```c
001012e8 83 bd 5c ff ff ff 02    CMP DWORD PTR [RBP-0xa4],0x2
001012ef 74 1a                   JE  0x10130b
```

**The `UD2` (Undefined Instruction) opcode is specifically designed to generate an invalid opcode exception**. This is because, in normal circumstances, code execution would stop at this point due to the generated exception.

To continue the disassembly process of the bytes value after `UD2`, you can block all instructions that the value are still `??` then press the `D` key on the keyboard. Then, replace all `UD2` instructions with `NOP` instructions using `CTRL+Shift+G`.

*[Image: alt]*

There are several conditions that will checks if the string starts with some characters. If all these conditions are met, it prints the flag in the format: `HTB{<full_string>}`. So we can simply run `./behindthescenes Itz_0nLy_UD2` to get the flag.