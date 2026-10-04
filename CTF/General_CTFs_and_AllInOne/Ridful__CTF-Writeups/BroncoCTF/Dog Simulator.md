# Dog Simulator

## Challenge info

- **Name:** Dog Simulator
- **Category:** Reverse Engineering
- **Author:** dot.t
- **File:** `dog-sim-mac`

The challenge puts us in control of a dog for six days.

Each day, we choose one action such as barking, fetching, sitting, eating, doing zoomies, or speaking. Following the correct routine eventually reveals the flag.

The intended solution appears to involve recovering the exact sequence of actions and spoken words. I took a different route and skipped directly to the flag-generation logic.

## First look

I started with the usual file check:

```bash
file dog-sim-mac
```

The result showed an ARM64 Mach-O executable:

```text
dog-sim-mac: Mach-O 64-bit arm64 executable
```

I was working from an x86 Linux machine, so running the binary directly was not an option.

Fortunately, the executable was small, with only around 3.7 KB of actual code, which made static analysis manageable.

Checking the printable strings revealed most of the game interface:

```text
Day %d: Owner says: "%s"
1) Bark (+%d)
2) Fetch (+%d)
3) Sit (+%d)
4) Eat (+%d)
5) Zoomies (%d)
6) Speak (type a command)
Owner: the routine felt right, but the timing was off.
Owner: he keeps repeating what he heard... but it's not quite right.
Who's a good reverse engineer?
```

The flag itself was not present in the strings output.

The final message suggested that the flag was generated or decrypted at runtime rather than stored as plaintext.

## Tooling

My usual disassembly tools did not handle the Mach-O file particularly well, so I built a small Python-based workflow using:

- **LIEF** to parse the Mach-O structure
- **Capstone** to disassemble the ARM64 code

LIEF was useful for extracting sections and resolving chained fixups. In particular, it allowed me to map entries in `__got` back to imported functions such as `printf` and `fgets`.

I also added a small annotation pass that:

- resolved `adrp` and `add` pairs into referenced strings
- labeled branch targets with imported function names

That turned raw instructions like:

```asm
0x100000678: add x0, x0, #0x674
0x10000067c: bl  #0x1000013e4
```

into something much easier to follow:

```asm
0x100000678: add x0, x0, #0x674
             ; "(End of day %d) Score=%d Bond=%d Energy=%d Mood=%s\n"

0x10000067c: bl  #0x1000013e4
             ; -> _printf
```

## How the game works

The main loop runs for six days.

Each day consists of exactly one action, followed by an end-of-day status update.

The available actions are:

```text
1. Bark
2. Fetch
3. Sit
4. Eat
5. Zoomies
6. Speak
```

Each action updates several pieces of state, including:

- score
- energy
- action counters
- combo-related values
- a rolling hash

The rolling hash is stored in `w23` and uses an xorshift and multiplication mixer. Each action selects a different set of constants.

The `Speak` action has some extra logic.

It reads a word, normalizes it to lowercase letters, and calculates a 32-bit FNV-1a hash using the standard constants:

```text
Offset basis: 0x811c9dc5
Prime:        0x01000193
```

The final validation includes several checks involving the spoken words:

- one word must hash to `0x9f58d866`
- another word must be exactly `gremlin`
- both spoken words must contain a total of 19 letters

## The final checks

After day six, the program reaches a long chain of conditional comparisons.

The required conditions include:

- exactly one `Sit`
- exactly one `Fetch`
- exactly one `Eat`
- no `Zoomies`
- exactly two `Speak` actions
- `w25 == 24`
- `w26 > 20`
- `w22 > 2`
- the required FNV hash
- the literal word `gremlin`
- a combined spoken length of 19
- `w23 == 0xf5d38524`
- `[sp+0x60] == 0x740a8a98`

If any condition fails, the game prints one of several themed failure messages.

If everything passes, execution reaches the flag-generation block.

## How the flag is generated

The flag bytes are not stored directly in the binary.

Instead, the program generates a NEON-based keystream and XORs it against ciphertext constants stored in `__const`.

The important observation was that this keystream depends on only three final state values:

```text
w22
w25
w26
```

The seed is calculated as:

```c
seed = ((w25 * 31)
      ^ (w22 * 0x13579bdf)
      ^ (w26 * 13))
      ^ 0x510211db;

seed = murmur3_fmix32(seed);
```

This separates the challenge into two parts.

The large set of game checks determines whether execution is allowed to reach the flag routine.

The actual contents of the flag depend only on `w22`, `w25`, and `w26`.

That meant I did not need to recover the intended six-day routine, solve the FNV preimage, or satisfy the rolling-hash checks.

I only needed to find three values that generated readable plaintext.

## Emulating the flag routine

I used Unicorn to emulate only the ARM64 flag-generation block.

The plan was:

1. Map the Mach-O sections at their expected virtual addresses.
2. Create a valid stack and frame pointer.
3. Jump directly into the flag-generation code.
4. Set candidate values for `w22`, `w25`, and `w26`.
5. Set `w28` to the Murmur multiplier expected by the code.
6. Read the 24-byte output buffer from `x29 - 0xe0`.

The relevant instruction range was:

```text
0x100000ee8 through 0x1000011e0
```

The emulation function looked like this:

```python
def run(w22, w25, w26):
    uc.reg_write(UC_ARM64_REG_SP, sp)
    uc.reg_write(UC_ARM64_REG_X29, fp)

    uc.reg_write(UC_ARM64_REG_W22, w22)
    uc.reg_write(UC_ARM64_REG_W25, w25)
    uc.reg_write(UC_ARM64_REG_W26, w26)

    uc.reg_write(
        UC_ARM64_REG_W28,
        0x846CA68B,
    )

    uc.emu_start(
        0x100000EE8,
        0x1000011E0,
        count=3000,
    )

    return bytes(
        uc.mem_read(fp - 0xE0, 24)
    )
```

I then searched small ranges for the three registers and looked for output containing the expected flag prefix:

```python
for w22 in range(40):
    for w25 in range(64):
        for w26 in range(64):
            output = run(w22, w25, w26)

            if b"bron" in output:
                print(w22, w25, w26, output)
```

The flag is exactly 24 bytes long:

```text
bronco{            7 bytes
mans_best_friend  16 bytes
}                  1 byte
                      24 bytes total
```

So the output buffer could be checked directly without needing a null terminator.

## Recovered values

The search quickly found:

```text
w22 = 0
w25 = 20
w26 = 2
```

Those values produced:

```text
bronco{mans_best_friend}
```

A second combination also generated the same plaintext.

That happened because the earlier seed expression mapped both combinations to the same value before the final mixing step.

## Flag

```text
bronco{mans_best_friend}
```

## Final thoughts

This was a fun reversing challenge where the validation logic was much more complicated than the actual flag dependency.

The game contains checks for action counts, ordering, spoken words, hashes, energy, score, and several final state values. However, those checks only control access to the flag routine. They do not affect the encrypted data or change the decryption algorithm.

Once the seed was reduced to three registers, emulating the small flag-generation block was much cleaner than solving the full routine.

The main lesson is that when a flag is generated at runtime, it helps to separate two questions:

1. What conditions allow execution to reach the flag code?
2. What values actually determine the flag?

In this case, the first question was complicated. The second was only a small three-variable search.
