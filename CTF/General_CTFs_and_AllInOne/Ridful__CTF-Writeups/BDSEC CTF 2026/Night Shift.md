# Night Shift

## Challenge info

- **Name:** Night Shift
- **Category:** Reverse Engineering
- **File:** `night_shift.bdsec`

The challenge provides a file called:

```text
night_shift.bdsec
```

Despite the custom extension, it is just a normal Linux ELF binary.

## First look

I started with the usual file and strings checks:

```bash
file night_shift.bdsec
strings -a night_shift.bdsec
```

A few useful messages showed up:

```text
shift code>
Eight assignments remain.
The shift report was rejected.
The morning report has been approved.
```

So the program expects some kind of shift code containing eight values. If the code passes validation, it prints the approved report and presumably the flag.

Running it with random input confirmed that it reads one line, validates it immediately, and rejects anything incorrect.

## Input format

The binary was stripped, so there were no helpful function names. Looking through the disassembly showed that the input is parsed using `strtok_r` and `strtoul`.

The expected format is eight numbers separated by spaces:

```text
d0 d1 d2 d3 d4 d5 d6 d7
```

Each number must be between `0` and `4`.

Any invalid token, value outside that range, or incorrect number of entries sends execution directly to the rejection path.

So the full search space is:

```text
5^8 = 390,625
```

That is small enough to brute-force comfortably.

## Threaded validation

After parsing the input, the program creates five worker threads.

The threads share a mutex and condition variable, which forces them to process the eight positions in a strict order. Each thread is responsible for positions whose digit matches its thread ID.

For example, the thread associated with value `3` handles every position where the input digit is `3`.

Despite the multithreaded setup, the condition variable makes the actual validation deterministic. Only one position is processed at a time, and the positions are handled in order.

The threaded design mainly acts as obfuscation around what is effectively a sequential state update.

## State mixing

The validator maintains four accumulator values, along with a separate FNV-style running state.

Some of the initial constants include:

```text
0xC001D00D
0x0BADF00D
```

For each of the eight positions, the current digit selects one of five mixing branches through a jump table.

The mixing function uses an invertible xorshift and multiplication sequence similar to the `lowbias32` integer hash. The selected branch updates the accumulator state, while the FNV-style value is updated alongside it.

Once all eight positions have been processed, the binary compares the final state against several hardcoded targets:

```text
0x75a2cc729c8a97dc
0x4969e73d1d87ef0f
0x4455cee8
```

There is also a count check to confirm that all eight positions were processed correctly.

If every comparison succeeds, the program reaches the approved-report path. Otherwise, it prints the rejection message.

## Brute-forcing the code

It would be possible to study each mixing operation and try to reverse the state transitions by hand, but that is unnecessary here.

There are only 390,625 possible shift codes, so the cleanest approach is to reproduce the validation logic in Python and test the entire input space.

The brute-force loop looks roughly like this:

```python
for digits in itertools.product(range(5), repeat=8):
    state, positions, fnv = process(digits)

    if (
        fnv == TARGET_FNV
        and state == [
            TARGET_S0,
            TARGET_S1,
            TARGET_S2,
            TARGET_S3,
        ]
    ):
        print("found:", digits)
        break
```

The Python implementation reproduces:

- all five digit-specific mixing branches
- the `lowbias32`-style transformations
- the FNV-style accumulator
- the final state comparisons

Searching the full input space produced exactly one valid code:

```text
2 0 4 1 3 0 2 4
```

## A failed detour

After recovering the correct code, I also tried to reproduce the binary's final flag-decoding routine in Python.

The success path decrypts 36 bytes using a keystream generated from another `lowbias32`-style transformation. The keystream depends on the recovered digits, the current position, rotations, and an internal position table.

My first reimplementation had a mistake somewhere in that logic, likely in the table indexing or rotation calculation, and produced non-printable output instead of the flag.

Fortunately, none of that was needed.

The shift code had already been verified against the exact hardcoded state comparisons used by the binary. Instead of debugging a second implementation of the decoder, I could simply pass the confirmed code back into the original program.

## Verification

I ran the binary with the recovered shift code:

```bash
echo "2 0 4 1 3 0 2 4" | ./night_shift
```

The program printed:

```text
========================================
              NIGHT SHIFT
========================================

The building is closed.
Eight assignments remain.

shift code> The morning report has been approved.
BDSEC{0rd3r_h1d3s_b3tw33n_th3_l1n3s}
```

So the result was verified directly with the original challenge binary.

## Flag

```text
BDSEC{0rd3r_h1d3s_b3tw33n_th3_l1n3s}
```

## Final thoughts

This was a fun reversing challenge with a nice concurrency theme.

The five-thread setup initially makes the validation look more complicated, but the mutex and condition variable force everything to happen in a predictable order. Once the state transitions are reproduced, the problem becomes a small brute-force search over only 390,625 possible codes.

The main lesson was also a practical one. Once the recovered input satisfied the binary's real validation checks, there was no need to perfectly reimplement the final decoder. Feeding the confirmed code into the original program was simpler and more reliable.
