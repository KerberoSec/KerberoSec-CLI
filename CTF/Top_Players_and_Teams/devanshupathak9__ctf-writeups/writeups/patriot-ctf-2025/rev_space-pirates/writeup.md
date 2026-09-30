# 🏴‍☠️ Space Pirates CTF: Transmission Decoder Write-Up

## 📌 Challenge Overview

You intercept a transmission from **space pirates**, who have encrypted the coordinates to their hidden treasure. The encryption system applies a sequence of reversible transformations to the input. Your objective is to reverse these transformations and retrieve the original plaintext: the **flag**.

The given C code performs the following 4 operations on the provided input:

1. **XOR with a rotating 5-byte key**
2. **Swap adjacent bytes pairwise**
3. **Add a magic constant (0x2A)** modulo 256
4. **XOR each byte with its index**

If the final processed bytes match a fixed `TARGET` array, the flag is correct.

Your job: **undo all operations in reverse order**.

---

## 🔍 Challenge Code Summary

The target bytes stored in the binary:

```
TARGET = [ 0x5A,0x3D,0x5B,0x9C,0x98,0x73,0xAE,0x32,0x25,0x47,
           0x48,0x51,0x6C,0x71,0x3A,0x62,0xB8,0x7B,0x63,0x57,
           0x25,0x89,0x58,0xBF,0x78,0x34,0x98,0x71,0x68,0x59 ]
```

Other constants:

```
XOR_KEY = [0x42, 0x73, 0x21, 0x69, 0x37]
MAGIC_ADD = 0x2A
FLAG_LEN = 30
```

The operations applied **in forward direction**:

```
1. XOR with rotating XOR_KEY
2. Swap every (i, i+1)
3. Add MAGIC_ADD
4. XOR with index i
```

To find the original input, we reverse them.

---

## 🔁 Solution Strategy: Reversing the Transformations

To decrypt, we apply the exact reverse of each step:

### ✔ Step 1 (Reverse of Operation 4)

Original: `buffer[i] ^= i`
Reverse:  `buffer[i] ^= i` (XOR is self-inverting)

### ✔ Step 2 (Reverse of Operation 3)

Original: `buffer[i] = (buffer[i] + MAGIC_ADD) % 256`
Reverse:  `buffer[i] -= MAGIC_ADD`

### ✔ Step 3 (Reverse of Operation 2)

Original swapped adjacent bytes.
Reverse: swap again.

### ✔ Step 4 (Reverse of Operation 1)

Original: `buffer[i] ^= XOR_KEY[i % 5]`
Reverse:  same XOR again.

---

## 🧠 Final Python Solver

```python
target =  [0x5A,0x3D,0x5B,0x9C,0x98,0x73,0xAE,0x32,0x25,0x47,0x48,0x51,0x6C,0x71,0x3A,0x62,0xB8,0x7B,0x63,0x57,0x25,0x89,0x58,0xBF,0x78,0x34,0x98,0x71,0x68,0x59]
XOR_KEY = [0x42, 0x73, 0x21, 0x69, 0x37]
MAGIC_ADD = 0x2A

buff = target.copy()

# Reverse step 4: XOR with index
target_len = len(buff)
for i in range(target_len):
    buff[i] ^= i

# Reverse step 3: subtract MAGIC_ADD
for i in range(target_len):
    buff[i] = (buff[i] - MAGIC_ADD) % 256

# Reverse step 2: swap back
for i in range(0, target_len - 1, 2):
    buff[i], buff[i+1] = buff[i+1], buff[i]

# Reverse step 1: XOR with rotating key
for i in range(target_len):
    buff[i] ^= XOR_KEY[i % 5]

# Print flag
print("".join(chr(x) for x in buff))
```

---

## 🎉 Final Output

Running the script reveals the flag:

```
PCTF{0x_M4rks_tH3_sp0t_M4t3y}
```

---

## 🏁 Conclusion

This challenge demonstrates how layered reversible transformations can look intimidating, but each step is straightforward if reversed carefully. XOR-based schemes especially are simple to undo because XOR is symmetric.

This was a fun reversing task involving:

* Byte-level manipulation
* XOR streams
* Position-dependent transformations
* Reversing a transformation pipeline

Happy hacking, space explorer! 🚀✨
