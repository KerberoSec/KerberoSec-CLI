# Challenge Write-up: **Character** (950 pts, Very Easy)

**Path:** `practice/hack-the-box/misc_character`
---

## Summary / Problem statement

In this challenge, we're given an IP address and a port number. When we connect to the server via TCP, it asks us to input the index of the character in the flag. It then returns the character at that index and asks for the next index:

```
Which character (index) of the flag do you want? Enter an index:
```

You send a decimal index (0-based). The service replies with:

* `Character at Index N: <char>` when the index is valid, or
* `Index out of range!` when the index is beyond the flag length.

Manually querying every index is tedious for long flags, so we automate the process: iterate indices from `0` upward, collect characters, and stop when the server replies `Index out of range!`.

---

## Manual interaction example

```bash
$ nc 83.136.253.59 53104
Which character (index) of the flag do you want? Enter an index: 0
Character at Index 0: H
Which character (index) of the flag do you want? Enter an index: 1
Character at Index 1: T
Which character (index) of the flag do you want? Enter an index: 2
Character at Index 2: T
Which character (index) of the flag do you want? Enter an index: 3
Character at Index 3: {
...
Which character (index) of the flag do you want? Enter an index: 110
Index out of range!
```

---

## Solution

### Approach / Strategy

1. Open a TCP socket to the target IP and port.
2. Starting from index `0`, send the index followed by `\n`.
3. Read the server response and extract the returned character.
4. Append the character to a `ctf_flag` string.
5. Increment the index and repeat.
6. Stop when the server replies with `Index out of range!` (the indicator that we've reached the end of the flag) or the connection closes.

This is straightforward automation: the service gives you exactly what you request; you just have to ask all indices until the service refuses further indices.

---

## `solution.py`: automated client

```python
#!/usr/bin/env python3
"""
solution.py
Automates the "Character" challenge: repeatedly query indices until
the server responds "Index out of range!" and collect the flag.
"""
import socket

client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

# IP address and port change at each spawn
server_addr = ("83.136.253.59", 53104)
client.connect(server_addr)

i = 0
ctf_flag = ""

while True:
    request = client.recv(1024).decode("utf-8").strip()
    print(request, "\n")
    if "Index out of range!" in request:
        break
    if "Character at Index" in request:
        ctf_flag += request.split("\n")[0][-1]

    client.sendall(f"{i}\n".encode("utf-8"))
    i += 1
client.close()

print(ctf_flag)
```

---

## What I learned / Why this is useful

* Practice with raw TCP sockets (`nc`, `socket` module).
* Parsing and robust network I/O: handling prompts, partial reads, timeouts.
* Automating repetitive tasks to save time while preserving the manual logic of the challenge.

---
