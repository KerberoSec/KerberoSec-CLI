# Hackel

**Category:** Crypto  ·  **Flag:** `ASIS{sEm1d!r3c7_gr0uP_pr3S3nt4T10n____k3y___r3C0verY_4TtacK!!}`

## Challenge Description

A remote service (`nc <host> 3771`) themed around permutation groups and algebraic
presentations. It advertises a search space of more than 1.6 quadrillion possible states
and challenges you to recover an "equivalent key" or beat an interactive speed challenge.

The menu:

```text
[1] View Public Parameters & Relations
[2] View Training Samples & Encrypted Flag Words
[3] Homomorphic Word Concatenation Oracle
[4] Submit Recovered Equivalent Key (Unlock Flag)
[5] Interactive Speed Challenge (Unlock Flag)
[6] Exit
```

## Initial Analysis

Option 1 shows a group presentation with generators `A`: `E` / `a`: `e` and relations such
as `AB = C`, `AD = BC`, `CD = E`. The "intended" hard problem is to recover how these
abstract moves act as permutations of 11 objects, giving an apparent search space of

```text
(11!)^2 = 1,593,350,922,240,000
```

which is where the "over 1.6 quadrillion states" theme comes from.

Option 2 provides 16 known-zero words and 16 known-one words. The number of `a`
characters varies, so the list looks random, but the underlying structure is trivial:

```text
Known zero: a^k        (only the letter a)
Known one:  a^k b       (an a-run followed by exactly one b)
```

## Vulnerability / Core Concept

The training data leaks its own labels. Every one-word contains a `b`; no zero-word does.
The "classifier" the whole group-theory construction is supposed to hide reduces to a
single test:

```text
word contains b  ->  1
word has no b    ->  0
```

No permutation recovery, no quadrillion-state search: the spelling of each word gives
away the bit. This is the classic "expensive lock with a red sticker on every key" trap:
before attempting cryptanalysis, compare the labelled examples and look for a structural
difference.

The encrypted flag (option 2) is 496 such words. Converting each word to `0`/`1` and
packing into bytes yields readable ASCII, but the cleanest route is the speed challenge,
which lets the server confirm the answer directly.

## Exploitation

Option 5 sends 16 fresh words and asks for a classification within a 5-second window.
For each word we send `1` if it contains `b`, else `0`. See `solve.py`:

```python
challenge = recv_until(sock, b"Your Classification Bits: ")
words = re.search(rb"Challenge Words: (.+)\n", challenge).group(1).split()

# Every zero training sample is a^k, and every one sample is a^k*b.
bits = b"".join(b"1" if b"b" in word else b"0" for word in words)
sock.sendall(bits + b"\n")
```

The same rule applied to the 496 flag words also decodes it offline:

```python
bits = "".join("1" if "b" in word else "0" for word in flag_words)
flag = bytes(int(bits[i:i + 8], 2) for i in range(0, len(bits), 8))
```

Running the solver:

```text
[+] CHALLENGE PASSED!
[+] FLAG: ASIS{sEm1d!r3c7_gr0uP_pr3S3nt4T10n____k3y___r3C0verY_4TtacK!!}
```

## Flag

`ASIS{sEm1d!r3c7_gr0uP_pr3S3nt4T10n____k3y___r3C0verY_4TtacK!!}`

## Key Takeaways

- Fancy mathematics cannot rescue data that leaks its label directly.
- Always compare the known/labelled examples for a simple structural difference before
  committing to expensive cryptanalysis. Here, one letter (`b`) collapsed an alleged
  quadrillion-state search to a one-line rule.
