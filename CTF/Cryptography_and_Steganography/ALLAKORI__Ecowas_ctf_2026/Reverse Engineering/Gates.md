# 🧠 Gates: Reverse Engineering Writeup

**Category:** Reverse Engineering
**Difficulty:** Easy
**Points:** 100

---

## 📜 Description

> *"I hid the most secrets away for you not to see everything!"*

We are given a binary (`gates`) inside a zip file.

---

## 📂 Initial Analysis

```bash
unzip gates.zip
file gates
```

Output:

```text
Mach-O 64-bit arm64 executable
```

### ⚠️ Key Observations

* **Mach-O format** → macOS binary
* **ARM64 architecture**
* Cannot run directly on a typical **Linux x86_64 (Kali)** environment
* → Must use **static analysis**

---

## 🔍 Strings Analysis

```bash
strings gates
```

We immediately notice:

* A large number of fake flags:

  ```text
  EcowasCTF{n0m4d_tr41l_w1nd3s}
  EcowasCTF{fl4m1ng0_d4nc3s}
  EcowasCTF{vultur3_c1rcl3s}
  ...
  ```
* Messages in the binary:

  ```text
  That gate is a decoy. %d gates remain.
  That's not even a gate.
  The gate opens! You found the real flag.
  ```

### 💡 Insight

* Many **decoy flags**
* Only **one real flag**
* Must locate how the program validates input

---

## 🧩 Reverse Engineering (Core Logic)

Decompiling with **Ghidra / radare2**, we find the main logic:

```c
if (((local_b8 == 0x54437361776f6345 && lStack_b0 == 0x305f796c6e307b46) &&
    (local_a8 == 0x5f337434675f336e && CONCAT17(local_99,uStack_a0) == 0x68745f736e337030)) &&
    CONCAT71(uStack_98,local_99) == 0x7d7934775f3368)
{
    puts("The gate opens! You found the real flag.");
}
```

---

## ⚠️ Important Detail

The program **does NOT use `strcmp` for the real flag**.

Instead, it compares the input using **raw 64-bit values**.

👉 This is a classic trick to hide the flag and avoid easy extraction via `strings`.

---

## 🧠 Endianness Trick

The values are stored in **little-endian format**, meaning:

> Bytes must be reversed **per block** before decoding.

---

## 🔓 Decoding the Flag

### Step-by-step

#### 1️⃣ First block

```text
0x54437361776f6345
```

Hex bytes:

```text
54 43 73 61 77 6f 63 45
```

Reverse:

```text
45 63 6f 77 61 73 43 54
```

ASCII:

```text
EcowasCT
```

---

#### 2️⃣ Second block

```text
0x305f796c6e307b46 → F{0nly_0
```

#### 3️⃣ Third block

```text
0x5f337434675f336e → n3_g4t3_
```

#### 4️⃣ Fourth block

```text
0x68745f736e337030 → 0p3ns_th
```

#### 5️⃣ Last block

```text
0x7d7934775f3368 → h3_w4y}
```

---

## 🧩 Final Reconstruction

```text
EcowasCTF{0nly_0n3_g4t3_0p3ns_th3_w4y}
```

---

## 🧪 Program Behavior

* If input matches hidden flag → ✅ success message
* If input matches one of the fake flags → ❌ decoy message
* Otherwise → ❌ "That's not even a gate."

---

## 🏁 Flag

```text
EcowasCTF{0nly_0n3_g4t3_0p3ns_th3_w4y}
```

---

## 💡 Key Takeaways

* Don't trust `strings` → may contain decoys
* Look for **manual comparisons** instead of `strcmp`
* Always consider **endianness**
* Static analysis > dynamic when binary is incompatible

---

## 🛠️ Tools Used

* `strings`
* `file`
* `radare2` / `ghidra`

---

## 🔥 Final Thought

> Not every visible flag is the real one: sometimes the truth is hidden in the **binary logic itself**.

---
