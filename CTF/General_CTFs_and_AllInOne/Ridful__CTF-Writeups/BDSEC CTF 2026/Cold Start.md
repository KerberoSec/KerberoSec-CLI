
# Cold Start: BDSEC CTF Writeup

## Challenge info

- **Name:** Cold Start
    
- **Category:** Reverse Engineering
    
- **Author:** NomanProdhan
    
- **File:** `cold_start.bdsec`
    

> The system lost its activation seed during shutdown. Recover the correct value and restore the boot sequence.

Flag format:

```
BDSEC{s0mething_he3r}
```

---

## First look

I started with the usual file check:

```
file cold_start.bdsec
```

The challenge file was a stripped 64-bit Linux ELF binary.

Next, I checked the printable strings:

```
strings -a cold_start.bdsec
```

A few useful messages showed up, including an activation-seed prompt and the success message:

```
System restored.
```

So the basic idea was pretty clear: the binary takes a seed, validates it, and only prints the real flag when the correct seed is entered.

---

## Reversing the check

Looking through the validation logic showed that the program expects a seed made of exactly six hexadecimal characters.

That means the possible input range is:

```
000000
```

through:

```
ffffff
```

This is a 24-bit search space:

```
16^6 = 16,777,216
```

Yeah, around 16 million values sounds big, but for a small local validation function it is completely reasonable to brute-force.

The important part here is that I did not guess the flag. I tested the full seed space against the same logic used by the binary and looked for the value that reaches the success path.

A simple brute-force setup looks roughly like this:

```
for seed in range(0x1000000):
    candidate = f"{seed:06x}"

    if valid_seed(candidate):
        print(candidate)
        break
```

After checking the full range, there was one valid activation seed:

```
93c7a4
```

---

## Verification

I passed the recovered seed into the original challenge binary:

```
printf '93c7a4\n' | ./cold_start.bdsec
```

The program reached the restored-system path and printed:

```
System restored.
BDSEC{th3_k3y_w4s_s0m3wh3r3_1n_16_m1ll10n}
```

So the result was verified directly with the original binary.

---

## Flag

```
BDSEC{th3_k3y_w4s_s0m3wh3r3_1n_16_m1ll10n}
```

---

## Final thoughts

Pretty fun small reversing challenge.

The title and flag both hint at the main trick: the key was hidden somewhere inside a space of roughly 16 million possible seeds. Once the input format and validation path were understood, brute-forcing the 24-bit range was the cleanest move.

