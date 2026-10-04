# 🐍 Python Bytecode Reversal CTF: Write-Up

## 📌 Challenge Overview

In this challenge, we are given two files:

* A **`.pyc` file**: a compiled Python bytecode file
* An **`output.txt`**: containing a long list of integers, representing transformed character codes

The goal is to **reverse the bytecode logic**, retrieve the hidden flag, and understand how the transformation pipeline works.

This challenge tests:

* Knowledge of Python bytecode (`.pyc`)
* Decompilation
* Reversing arithmetic/bitwise transformations
* Understanding how data is embedded in ASCII art

---

# 🧩 What Is a `.pyc` File?

A `.pyc` file is a **Python bytecode** file generated automatically whenever Python runs a script. Instead of executing raw `.py`, Python compiles it into bytecode first, stored in `.pyc`.

### Why do `.pyc` files exist?

* Faster startup on subsequent runs
* Contains low-level instructions (not CPU assembly)
* Still portable across machines **as long as Python version matches**

### Can `.pyc` files be reversed?

Yes. Tools like:

* `uncompyle6`
* `decompyle3`
* `pycdc`

can reconstruct human-readable Python code.

### In This Challenge:

We were expected to:

1. **Decompile the provided `.pyc`** to recover the real logic
2. **Reverse the operations** to extract the flag

---

# 🕵️‍♂️ Extracting the Source Code

After running:

```
decompyle3 challenge.pyc
```

We obtained the following source code:

```
import pyfiglet
file = open('flag.txt', 'r')
flag = file.read()
font = 'slant'
words = 'MASONCC IS THE BEST CLUB EVER'
flag_track = 0
art = list(pyfiglet.figlet_format(words, font=font))
i = len(art) % 10
for ind in range(len(art)):
    if ind == i and flag_track < len(flag):
        art[ind] = flag[flag_track]
        i += 28
        flag_track += 1
art_str = ''.join(art)
first_val = 5
second_val = 6
first_half = art_str[:len(art_str) // 2]
second_half = art_str[len(art_str) // 2:]
first = [~ord(char) ^ first_val for char in first_half]
second = [~ord(char) ^ second_val for char in second_half]
output = second + first
print(output)
```

---

# 🧠 Understanding the Encryption Logic

The script:

1. Generates ASCII art using **pyfiglet** from the string:

   ```
   "MASONCC IS THE BEST CLUB EVER"
   ```
2. Converts the ASCII art into a list of characters.
3. Inserts characters of the **flag** at positions:

   ```
   start = len(art) % 10
   step = 28
   ```
4. Joins the art into a long string.
5. Splits into two halves.
6. Applies bitwise encoder:

### **First half**:

```
encoded = ~ord(char) ^ 5
```

### **Second half**:

```
encoded = ~ord(char) ^ 6
```

7. Outputs a long integer list → this is `output.txt`.

---

# 🔄 Reversing the Transformation

Given the output list, we reversed all operations.

### ✔ Step 1: Split the output back into halves

```
first_half = output[len(output)//2:]
second_half = output[:len(output)//2]
```

### ✔ Step 2: Reverse the bitwise transformation

```
first = [chr(~val ^ first_val) for val in first_half]
second = [chr(~val ^ second_val) for val in second_half]
```

This reconstructs the ASCII art string.

### ✔ Step 3: Merge the parts in correct order

```
final = first + second
```

### ✔ Step 4: Extract characters inserted at every +28 offset

The original script inserted flag characters at:

```
index_start = len(art) % 10   # this equals 2
next index = 2 + 28 + 28 + ...
```

Your reverse extraction:

```
i = 2
for ind in range(len(final)):
    if i == ind:
        print(final[i], end="")
        i = i + 28
```

This prints only the embedded flag characters.

---

# 🏁 Final Flag

Running the reverse solver reconstructs the hidden flag.

**pctf{obFusc4ti0n_i5n't_EncRypt1oN}**

---

# ✔ Summary

This challenge mixed together:

* Python `.pyc` decompilation
* ASCII-art generation
* Bitwise encoding (`~`, `^`)
* Strategic embedding of flag characters every 28 bytes

You solved it through:

1. **Decompiling the bytecode** to recover the exact logic.
2. **Reversing each transformation mathematically**.
3. **Identifying the flag positions inside figlet-generated ASCII art**.
4. **Extracting characters at correct intervals**.

A great warm-up in reverse engineering Python internals! 🚀
