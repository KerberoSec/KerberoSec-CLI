# Challenge Write-up: **pyjail** (Infobahn CTF, difficulty: Easy)

**Path:** `writeups/infobahn-ctf-2025/misc_pyjail`

## Summary / Problem statement

You are given a remote service (host:port) that accepts a single line of Python code, runs it inside a very restricted sandbox, and inspects the captured stdout. The server provides the following sample runner (this is the exact logic the remote instance uses):

```python
import io
import contextlib

with open("flag.txt", 'rb') as f:
    FLAG = f.read()

def run(code):
    buf = io.StringIO()
    try:
        with contextlib.redirect_stdout(buf):
            exec(code, {})
    except Exception:
        return None
    return buf.getvalue() or None

code = input("Enter your solution: ")

if len(code) > 15:
    print("Code too long")
    exit()

if not set(code) <= set("abcdefghijklmnopqrstuvwxyz "):
    print("Invalid characters")
    exit()

result = run(code)

if result is None:
    print("Error")
    exit()

if len(result) > 500:
    print(FLAG)
else:
    print("Output too short")
````

Constraints summary:

* The submitted code must be at most **15 characters** long.
* Allowed characters are only **lowercase a: z and space** (no digits, no punctuation, no uppercase).
* The code is executed with `exec(code, {})`: an empty globals dictionary (no pre-provided names except built-ins available through the default import mechanism).
* If the executed code prints more than **500 bytes** to stdout, the server will print the flag.

You are also given the host and port of the running instance. The task is to craft a payload that satisfies the character restrictions and length limit, and when executed on the remote, produces output longer than 500 bytes.

---

## Key observations

1. Although globals are empty, the Python import system is still usable from `exec` because `import` is a language statement and does not require pre-existing names. Importing standard library modules that print to stdout as a side effect is a useful trick.

2. The `this` module in the Python standard library prints the *Zen of Python* (a multi-line poem) as a side-effect when imported; this text is long (well over 500 characters). Therefore importing `this` will produce a long stdout payload.

3. The allowed character set includes the letters `i m p o r t` and the space character, so the exact phrase `import this` is valid and short enough (11 characters including the space).

4. When `exec("import this", {})` runs, the `this` module's import-time code writes the Zen to stdout, which the runner captures and measures, triggering the flag reveal.

---

## Solution / Payload

Submit the following one-line payload (exact text):

```
import this
```

Length: 11 characters (including the space). Allowed characters: only lowercase letters and a space.

---

## How to run against the remote instance

Use `nc` or `telnet` to connect and send the payload. Example using `nc`:

```bash
$ nc <host> <port>
Enter your solution: import this
```

If successful, the server will execute the code, capture the Zen of Python (which is >500 bytes), and print the flag.

---

## Zen of Python (output of import this)
```bash
The Zen of Python, by Tim Peters

Beautiful is better than ugly.
Explicit is better than implicit.
Simple is better than complex.
Complex is better than complicated.
Flat is better than nested.
Sparse is better than dense.
Readability counts.
Special cases aren't special enough to break the rules.
Although practicality beats purity.
Errors should never pass silently.
Unless explicitly silenced.
In the face of ambiguity, refuse the temptation to guess.
There should be one-- and preferably only one --obvious way to do it.
Although that way may not be obvious at first unless you're Dutch.
Now is better than never.
Although never is often better than *right* now.
If the implementation is hard to explain, it's a bad idea.
If the implementation is easy to explain, it may be a good idea.
Namespaces are one honking great idea -- let's do more of those!
```