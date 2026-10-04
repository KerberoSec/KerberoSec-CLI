# Borrowed Memory

## Challenge info

- **Name:** Borrowed Memory
- **Category:** Reverse Engineering
- **Event:** BDSEC CTF 2026
- **File:** `borrowed_memory.bdsec`

The challenge name gives a pretty strong hint about what is happening. The program walks through an internal memory table and expects us to return the exact sequence of addresses it visits.

## First look

I started with the usual file check:

```bash
file borrowed_memory.bdsec
```

Despite the custom extension, the challenge file was a stripped 64-bit PIE executable:

```text
borrowed_memory.bdsec: ELF 64-bit LSB pie executable, x86-64, stripped
```

Since the binary was stripped, there were no useful function names beyond the imported PLT entries.

Checking the printable strings revealed an ASCII-art banner and a few interesting messages:

```text
BORROWED MEMORY
0x???? -> 0x???? -> 0x????
Return what was borrowed.
rejected
```

So the basic idea was clear. The program expects a sequence of values, and anything incorrect reaches the rejection path.

## Input handling

Looking through the disassembly showed that the program reads twelve numbers.

Each value is parsed using `strtoul` with base `0`, which means both decimal and hexadecimal input are accepted.

Every number must fall within this range:

```text
0x4000 through 0x47ff
```

If a value is outside that range, the program rejects the input immediately.

At this stage, the binary is not checking whether the numbers are correct. It is only checking whether they look like valid addresses inside the expected region.

Once all twelve values have been stored, the real validation begins.

## The internal VM

The program creates a scrambled 2048-byte memory table during startup using a small xorshift-style pseudorandom number generator.

After reading the input, it enters a twelve-round VM loop.

The VM begins with an internal address and performs roughly the following steps during each round:

1. Add `0x4000` to the current internal offset.
2. Compare that address against the value supplied by the user.
3. Decode one of four possible operations from the scrambled table.
4. Use table lookups and a running hash state to calculate the next offset.
5. Subtract `0x111` from a checksum value.

The user's twelve numbers must match the exact sequence of addresses visited by the VM.

In other words, the program is asking us to provide its own execution path back to it.

## Confirming the round count

The checksum begins at:

```text
0xbeef
```

Each round subtracts:

```text
0x111
```

After twelve rounds:

```text
0xbeef - (12 * 0x111) = 0xb223
```

The final target checked by the binary is also:

```text
0xb223
```

That confirms that the VM is expected to complete exactly twelve rounds, matching the twelve input values.

## The important observation

The next VM address does not depend on the user's input.

It is calculated entirely from:

- the scrambled memory table
- fixed constants inside the binary
- the current VM state
- the running hash value

The supplied number is only compared against the address after the program has already calculated it.

That means the input cannot change the address chain. It can only be correct or incorrect.

So there was no need to fully reproduce the VM's hash and table logic by hand. The binary already calculates every required value during execution.

The simplest approach was to let it compute the sequence and use GDB to record the answers.

## Extracting the sequence with GDB

Because the binary uses PIE, the first step was to determine its runtime load address.

I started the program inside GDB and inspected the process mappings:

```gdb
starti
info proc mappings
```

I then supplied twelve placeholder values:

```text
0x4000
0x4000
0x4000
0x4000
0x4000
0x4000
0x4000
0x4000
0x4000
0x4000
0x4000
0x4000
```

These values pass the initial range checks and allow execution to reach the VM loop.

From there, I recovered:

- the initial VM offset, `0x1a4`
- the address of the scrambled memory table
- the address of the comparison instruction inside the VM loop

The table could also be dumped for further analysis:

```gdb
dump binary memory table.bin $rbx $rbx+0x800
```

The comparison between the expected address and the user's value was performed by an instruction similar to:

```asm
cmp r8w, ax
```

At that point, `eax` contained the value the binary expected.

I placed a breakpoint on the comparison and attached a GDB command block:

```gdb
break *ADDR_OF_CMP
commands
  silent
  printf "REQ %x\n", $eax & 0xffff
  set $r8 = ($eax & 0xffff)
  continue
end

run < dummy_input.txt
```

Each time the breakpoint fired, GDB did three things:

1. Printed the expected value.
2. Replaced the user's incorrect value with the expected one.
3. Continued execution into the next VM round.

Patching the register allowed the program to complete all twelve rounds in a single run.

## Recovered address chain

The required hexadecimal values were:

```text
41a4
42f0
4143
436c
421d
44a8
40f6
455b
4317
468c
425a
473d
```

Converted to decimal, the sequence becomes:

```text
16804
17136
16707
17260
16925
17576
16630
17755
17175
18060
16986
18237
```

## Verification

I passed those twelve values into the original, unmodified binary:

```text
16804
17136
16707
17260
16925
17576
16630
17755
17175
18060
16986
18237
```

The program accepted the complete address chain, decrypted the flag, and printed:

```text
[+] BDSEC{p01nt3rs_l13_bUt_0ffs3ts_r3m3mb3r}
```

So the sequence was verified directly against the original challenge binary.

## Flag

```text
BDSEC{p01nt3rs_l13_bUt_0ffs3ts_r3m3mb3r}
```

## Final thoughts

This was a fun reversing challenge built around a small memory-walking VM.

At first, the stripped binary, scrambled table, and custom state mixing make the validation look like something that needs a complete static reimplementation. The key observation was that the user's input never affects the VM's path. The binary calculates the full address chain independently and only compares our values against it.

Once that was clear, GDB was the cleanest solution. A breakpoint command block recorded each expected address, patched the comparison value, and allowed the entire chain to be recovered in one run.

The flag fits the challenge nicely. The supplied pointers can lie, but the internal offsets always remember where the VM is going.
