# 📼 Old Cassette: THEM?!CTF 2026 Writeup

A detailed writeup for the **Old Cassette** reverse-engineering challenge from THEM?!CTF 2026.

> **Live writeup →** [advaybagaria.github.io/Old_Cassette](https://advaybagaria.github.io/Old_Cassette/)

---

## Challenge Info

| Field | Details |
|---|---|
| **Name** | Old Cassette |
| **Points** | 100 |
| **Category** | Reverse Engineering |
| **Author** | SISUBENY |
| **CTF** | [THEM?!CTF 2026](https://ctf.themctf.com/challenges?categories=sanity%2Cmisc%2Crev%2Cpwn%2Cforensics%2Cweb%2Ccrypto%2Cosint%2Cweb3#Old%20Cassette-6) |

### Problem Statement

> I found this old cassette tape in my drawer XD

### Challenge File

`main.bin`: a 3,282-byte CHIP-8 ROM that draws a flag to a 64×32 virtual display, encrypted behind a PRNG with a trillion-step delay timer.

---

## TL;DR

The binary is a **CHIP-8 ROM**: an interpreted virtual machine from the 1970s, originally loaded from cassette tape. It draws 32 flag characters one at a time, each XOR-encrypted with two PRNG registers (VA, VB). Between draws, the PRNG advances by exponentially increasing steps, eventually reaching **~1.1 trillion steps per character**.

The key insight: the PRNG state is only 16 bits (256 × 256 = 65,536 possible states). By the pigeonhole principle, it must cycle. Walking it forward reveals a **cycle length of 34** starting at step 328. A trillion-step advance reduces to:

```
1,095,216,660,225 mod 34 = 17
```

One modular division replaces 18 minutes of simulation per character. Recover VA and VB at each draw step, XOR-decrypt the sprite data, and read the flag.

## Flag

```
THEM?!CTF{0LD_T4P3_N3V3R_D1E5K7}
```

*K7 is French slang for "cassette" (ka-sept → cassette). The whole challenge was one long pun.*

---

## Repository Structure

```
Old_Cassette/
├── index.html          # Full writeup (GitHub Pages)
├── main.bin            # Challenge binary (CHIP-8 ROM)
├── README.md           # This file
└── .github/
    └── workflows/
        └── deploy.yml  # GitHub Pages deployment
```

## Solved By

**optimus_prime** · Team e0_
