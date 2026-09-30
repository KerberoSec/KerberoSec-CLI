# Crack Me Vault

## Challenge info

- **Name:** Crack Me Vault
- **Category:** Reverse Engineering
- **File:** `crack_me_vault.bdsec`

The challenge provides a single binary called:

```text
crack_me_vault.bdsec
```

The name and presentation suggest that the flag is protected by some kind of custom bytecode or virtual machine logic.

## First look

I started with the usual file check:

```bash
file crack_me_vault.bdsec
```

The result showed a stripped 64-bit Linux ELF binary:

```text
crack_me_vault.bdsec: ELF 64-bit LSB pie executable, x86-64, stripped
```

After making it executable and running it:

```bash
chmod +x crack_me_vault.bdsec
./crack_me_vault.bdsec
```

The program displayed an ASCII-art vault labeled:

```text
THE BYTECODE VAULT
```

It then asked for the flag:

```text
Enter the flag:
```

The vault title was a useful hint that some VM-style or bytecode-based logic was probably hiding inside the binary.

## Poking around

Checking the printable strings did not reveal the flag, so I moved on to the disassembly:

```bash
objdump -d crack_me_vault.bdsec
```

Since the binary was stripped, there were no useful function names. Most of the relevant code appeared inside the `.text` section starting around `0x10c0`.

The input handling was normal. The program reads a line using `fgets` and removes the trailing newline using `strcspn`.

After that, the more interesting logic begins.

The binary reads four encrypted bytes from a table in `.rodata` at `0x22f2`. Each byte is XORed with a rolling key that starts at `0xa5` and increases by `0x11` after every step.

The decoded values are used as opcodes:

```text
0x11
0x37
0x6b
0xe0
```

Each opcode selects one operation:

- `0x11` checks whether the input length is exactly 50 bytes.
- `0x37` builds a transformed table from the user input.
- `0x6b` decrypts another embedded array and compares it against the generated table.
- `0xe0` prints the success message if every previous check passed.

So the vault does contain a small bytecode program, but the VM is mostly a dressed-up dispatch loop. Once the opcodes are decrypted, the control flow becomes straightforward.

## The transformation logic

The main validation happens in two loops.

### Loop A

Opcode `0x37` transforms the 50-byte user input and stores the result in a table.

For each input position `k`, from 0 through 49, the program calculates:

```python
xor_key = (0x41 + 0x1d * k) & 0xff
shift = (k % 7) + 1

rotated = rol8(input[k] ^ xor_key, shift)

offset = ((11 * k) & 0xff) ^ 0x17
index = (17 * k) % 50

table[index] = (offset + rotated) & 0xff
```

There are four operations involved:

1. XOR the input byte with a rolling key.
2. Rotate the result to the left.
3. Add a position-dependent value.
4. Store it at a permuted index.

The permutation is:

```text
(17 * k) mod 50
```

### Loop B

Opcode `0x6b` processes a second 50-byte array stored in `.rodata` at `0x22c0`.

The program decrypts each byte using another rolling XOR key and compares it against the transformed input table.

The important detail is that this loop accesses the table using the same permutation:

```text
(17 * k) mod 50
```

Loop A writes each transformed input byte to that position, and Loop B reads from the same position.

Because both loops use the identical permutation, it cancels out when solving the validation logic. Input byte `k` is compared directly against encrypted target byte `k`.

There are no dependencies between different characters. Instead of one large 50-byte equation, the check becomes 50 independent single-byte equations.

So there was no need to brute-force the flag or use symbolic execution. Every operation could be reversed directly.

## Reversing the operations

For each position `k`, the validation can be inverted in reverse order:

```python
target = encrypted[k] ^ key(k)

offset = ((11 * k) & 0xff) ^ 0x17
rotated = (target - offset) & 0xff

shift = (k % 7) + 1
xor_key = (0x41 + 0x1d * k) & 0xff

input_byte = ror8(rotated, shift) ^ xor_key
```

This reverses each step:

1. XOR decrypt the embedded target byte.
2. Subtract the position-dependent offset.
3. Rotate right to undo the left rotation.
4. XOR with the rolling key to recover the original input byte.

Running this process across all 50 positions recovered the complete flag:

```text
BDSEC{c0nTr0L_fl0w_1s_4_l13_bUt_bYt3c0d3_d03s_n0t}
```

## Verification

Before submitting the result, I passed the recovered flag into the original binary.

The program printed:

```text
[+] Access granted.
```

So the flag was verified locally using the actual challenge binary.

This was especially useful because the challenge allowed only ten submission attempts.

## Flag

```text
BDSEC{c0nTr0L_fl0w_1s_4_l13_bUt_bYt3c0d3_d03s_n0t}
```

## Final thoughts

This was a fun reversing challenge with a nice obfuscation theme.

At first, the encrypted opcode table and bytecode dispatch make the validation look more complicated than it really is. After decoding the four opcodes, the program turns out to perform a length check, transform the input, compare it against an encrypted array, and print the result.

The key observation was that both transformation loops use the same permutation. That removes any cross-character dependency and reduces the entire check to 50 independent equations.

Once that was clear, reversing the arithmetic was much cleaner than brute-forcing or emulating the VM.
