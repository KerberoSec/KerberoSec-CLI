# Binary-Encodings1 CTF Solution

## Overview

In this challenge, we’re given 32 pairs of \((p_i, f_i)\) values. Each \(p_i\) is a prime number, and each \(f_i\) represents a remainder when a secret integer (derived from the flag) is divided by \(p_i\). Our goal is to use these pairs to reconstruct the original flag. 

## How It Works

1. **Binarify**  
   The challenge’s code defines a function `binarify(flag_bytes)` which:
   - Interprets `flag_bytes` as a big integer, calls it \(M\).
   - Converts \(M\) to a binary string of the form `"0b101010..."`.
   - Converts that binary string to bytes and then once again to a big integer \(x\).
   Essentially, \(x\) = integer representation of the string `"0b" + (binary form of M)`.

2. **Congruences**  
   We know \(x \bmod p_i = f_i\). With 32 distinct primes \(p_i\), we have 32 modular equations:
   \[
   \begin{aligned}
   x &\equiv f_0 \pmod{p_0},\\
   x &\equiv f_1 \pmod{p_1},\\
   &\quad\vdots\\
   x &\equiv f_{31} \pmod{p_{31}}.
   \end{aligned}
   \]
   By the **Chinese Remainder Theorem** (CRT), these equations have a unique solution for \(x\) modulo the product of all primes.

3. **Reconstructing**  
   Once we find \(x\) via the CRT, we:
   - Convert \(x\) back to bytes to get the ASCII string `"0b1010..."`.
   - Strip off the `"0b"`.
   - Parse the remaining `"1010..."` as a binary number.
   - Convert that binary number into 31 bytes (since the original flag is 31 bytes).

## Step-by-Step

1. **Read the pairs**: Copy all \(p_i\) (primes) and \(f_i\) (remainders) from `output.txt`.
2. **Apply CRT**: Use a standard CRT function or implement it yourself:
   - Multiply all primes to get a large product \(P\).
   - Iteratively solve for \(x\) so it satisfies each congruence.
3. **Decode**:
   - Turn \(x\) into a byte string.  
   - Read that byte string as ASCII (it should start with `"0b"`).  
   - Remove `"0b"`, convert the rest of the string from binary to an integer.  
   - Convert that integer to a 31-byte sequence to get the flag.

## Example Code

Below is a condensed Python script that performs these steps:

```python
#!/usr/bin/env python3

p_list = [
    9768317032740503603,
    18156330420060477793,
    10476762262519913959,
    9347882639404620023,
    11430937203592009097,
    17656701845837939561,
    10011069635378637821,
    9303859140428609923,
    9430685689565848129,
    17610703349508968921,
    18140526684492216101,
    13376315490931891063,
    14024438832046178891,
    14707324533024715489,
    9978269176741957331,
    13426850418503228437,
    17886189966641892589,
    12567016417937207657,
    11734576994202379979,
    18381970530468107443,
    15834975197593730861,
    11304987454211866601,
    13069720355679787001,
    9607164897014498981,
    9825483122269264409,
    9608454472360228451,
    11677408947673812151,
    11577075391109060227,
    15098908071687008909,
    11940695074819110637,
    9277500110378312383,
    11325145340975252239
]

f_list = [
    9575104083177283048,
    654829914826964428,
    8717987845758977868,
    3299732009405467865,
    10473741261900299814,
    2405639366022411754,
    2194862298102476068,
    6748703991871530302,
    3454422808257998182,
    13565185375904130809,
    8709537670581362149,
    12293453432959068747,
    13229847825294716454,
    3056173638526417581,
    65599736668218521,
    11398473528376442350,
    8576657917939379051,
    9129425845766533589,
    8594293513869774248,
    5775640393641471384,
    349917141893968095,
    3066029727228120275,
    5587833707329530308,
    9401495996680306807,
    8904901928481653836,
    7591248352665021199,
    10878696646715348869,
    10506002541042515302,
    4781246273357667663,
    7834587634360970146,
    2068533696716192161,
    6693265025140266855
]

def solve_crt(primes, remainders):
    """
    Iterative CRT solver: finds the unique x in [0, P) where:
        x ≡ r_i (mod p_i) for each i,
    with P = p_0 * p_1 * ... * p_{n-1}.
    """
    x = remainders[0]
    M = primes[0]
    for i in range(1, len(primes)):
        p_i = primes[i]
        r_i = remainders[i]
        dx = (r_i - x) % p_i
        inv_M = pow(M, p_i - 2, p_i)  # Using Fermat's Little Theorem (p_i is prime)
        x = (x + dx * M * inv_M) % (M * p_i)
        M *= p_i
    return x

# Reconstruct x = binarify(flag) using CRT
x = solve_crt(p_list, f_list)

# Convert x to bytes. This should be the ASCII string "0b101010..."
x_bytes = x.to_bytes((x.bit_length() + 7) // 8, 'big')
bin_string = x_bytes.decode('ascii')  # Should start with "0b"
if not bin_string.startswith("0b"):
    raise ValueError("Decoded string doesn't begin with '0b'!")

# Strip "0b" and convert the rest of the binary string to an integer
flag_int = int(bin_string[2:], 2)

# Convert that integer to 31 bytes (the original flag length)
flag_bytes = flag_int.to_bytes(31, 'big')

print("Recovered flag:", flag_bytes)
try:
    print("Flag text:", flag_bytes.decode('utf-8'))
except UnicodeDecodeError:
    print("Flag is non-ASCII, bytes shown above only.")
```

## Final Flag

When the above code is run with our `p_list` and `f_list`, it prints:

```
Recovered flag: b'DDC{crt_to_the_m0100010110001n}'
Flag text: DDC{crt_to_the_m0100010110001n}
```

That is the final flag for the challenge!
