# Grawlix

**Category:** Misc | **Difficulty:** 250 pts | **Flag:** `IIITL{C4lv1nb4ll_57r34m_0v3r104d_8762_n0_5l33p_4c1eb8edac59}`

## TL;DR

The server blasts 100 million single-character arithmetic operations over TCP and expects the final computed value back within 2 seconds. Python tops out at 5M ops/sec: nowhere near fast enough. The solution is a streaming C solver that processes ops as they arrive off the wire and fires back the answer the instant the stream ends.

## What We're Given

A TCP service at `34.131.216.230:1339`. No files, no source: just a port and flavor text about "screaming into the void" and "distilling chaos." The server is named "Calvinball Stream," which is already a hint if you know your Calvin and Hobbes: in Calvinball, the rules change every single game. That's exactly what's happening here.

Connecting with `nc` shows us the protocol right away:

```
Starting Value (V) = 482910341
@ : V = V + 79123    (mod 1000000007)
# : V = V * 6571     (mod 1000000007)
$ : V = V ^ 31337    (bitwise XOR)
% : V = V/2 if even, (V*3+1) % MOD if odd
& : V = (~V) & 0xFFFFF

[INCOMING STREAM]
@#$%&@@@##$%&@#@#$...  (100,000,000 characters)
```

Five operators. One hundred million of them. Then silence: the server closes its write side and waits for your answer. Get it right within 2 seconds or it responds with `...killed.` and hangs up.

The starting value `V`, the add constant, the multiply constant, and the XOR value are all randomized every connection. Hence: Calvinball.

## Initial Recon

Before writing any solver, we wrote `probe.py`: a quick script that just connects, slurps all the data, prints the last 500 bytes, then sends a garbage value to see what the failure response looks like:

```python
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect((HOST, PORT))

data = b''
s.settimeout(5)
try:
    while True:
        chunk = s.recv(65536)
        if not chunk:
            break
        data += chunk
except socket.timeout:
    pass

# Show last 500 bytes to understand stream termination
print(repr(data[-500:]))
s.sendall(b"12345\n")
resp = s.recv(4096)
print(f"Got: {resp}")
```

This confirmed several things: the stream is exactly one enormous line, it ends with a newline, and the failure response is the literal string `...killed.` The dots in that response will matter later.

We also confirmed the stream is about 100MB and the server does a proper TCP half-close (closes write, keeps read open) after sending it. So we know we can't just wait for the connection to drop: we need to detect the newline ourselves.

Now let's think about the math. 100 million ops in 2 seconds means we need at least 50 million ops/second. First instinct: Python.

## The Vulnerability / Trick

This isn't a vulnerability challenge: it's a **performance challenge disguised as arithmetic**. The "trick" is recognizing that Python is the wrong language before you waste real time on it.

Python's interpreter overhead means you'll top out at roughly **5 million iterations per second** in a tight character-processing loop, and that's being generous. 100M ops at 5M/sec is 20 seconds. We have 2. That's not a close call you can optimize your way out of; it's a fundamental ceiling.

C with `-O3`, on the other hand, compiles this to raw register operations. A tight loop over a character buffer runs at **100+ million iterations per second** on any modern machine: comfortably inside the window even accounting for network time.

The second key insight: we don't need to buffer all 100MB before starting. We can **stream and compute simultaneously**: read a 64KB chunk, process every op in it, read the next chunk, repeat. This keeps our working memory tiny and our latency low.

## Building the Exploit

Here's the full solve, broken into the three moving parts.

**Part 1: Parse the header.**

The server sends a human-readable config block before the stream. We buffer incoming bytes until we see the `[INCOMING STREAM]` marker, then parse the constants out of the header text using `strstr` and `atoll` ("ASCII to long long": reads a decimal integer from wherever you point it):

```c
char *sv = strstr(header, "Starting Value (V) = ");
if (sv) V = atoll(sv + strlen("Starting Value (V) = "));

char *at_rule = strstr(header, "@ : V = V + ");
if (at_rule) add_val = atoll(at_rule + strlen("@ : V = V + "));

char *hash_rule = strstr(header, "# : V = V * ");
if (hash_rule) mul_val = atoll(hash_rule + strlen("# : V = V * "));

char *dollar_rule = strstr(header, "$ : V = V ^ ");
if (dollar_rule) xor_val = atoll(dollar_rule + strlen("$ : V = V ^ "));
```

Note that `%` (Collatz) and `&` (masked NOT) don't have variable constants: their behavior is fixed, so we hardcode those.

**Part 2: Process ops in a streaming loop.**

Once we've seen the `[INCOMING STREAM]` marker, every subsequent byte from the server is an op character: until we hit a newline, which means the stream is done. We process each chunk immediately:

```c
while (p < end) {
    char op = *p++;
    if (op == '\n' || op == '\r') {
        stream_done = 1;
        break;
    }
    count++;
    if (op == '@')      V = (V + add_val) % MOD;
    else if (op == '#') V = (V * mul_val) % MOD;
    else if (op == '$') V = V ^ xor_val;
    else if (op == '%') { if (V%2==0) V=V/2; else V=(V*3+1)%MOD; }
    else if (op == '&') V = (~V) & 0xFFFFFLL;
}
```

A few things worth noting:

- `MOD` is `1000000007`: a large prime, the standard CTF modulus. All add and multiply results get reduced mod this to keep V in range.
- The XOR (`$`) has no mod: it's a raw bitwise operation. V can temporarily be outside the mod range after XOR, which is fine because the next arithmetic op will bring it back. Don't add a mod here or your answer will be wrong.
- The `0xFFFFFLL` mask on the NOT (`&`) operation is critical. Bitwise NOT on a 64-bit integer flips all 64 bits: without the mask, `~V` would be a huge negative number that corrupts all subsequent arithmetic. The mask keeps us to 20 bits (the LL suffix makes it a `long long` constant so the mask itself is wide enough).
- The Collatz step (`%`) does NOT use mod on the divide-by-2 case: only on the `3n+1` case. This matches the server's rules exactly.

**Part 3: Send the answer and read the response.**

Once the stream ends, we format `V` as a decimal string and write it back on the same socket:

```c
char answer[64];
int len = snprintf(answer, sizeof(answer), "%lld\n", V);
write(sock, answer, len);
```

Then we poll for the server's response, which is either the flag or `...killed.`

**Compile with `-O3`: this is not optional:**

```bash
gcc -O3 -o solve3 solve3.c
./solve3
```

The `-O3` flag enables aggressive loop optimization and auto-vectorization. The difference between `-O0` and `-O3` on a tight arithmetic loop is easily 5-10x. On a performance challenge, skipping it means failing.

## The Dead Ends

We went through three iterations before landing on a working solve: worth knowing about because each failure was educational.

**Dead end 1: Python.** The first solver was clean Python with correct parsing and arithmetic. It took ~20 seconds on the ops alone. We timed it, did the math, and immediately knew there was no saving it. Python is out.

**Dead end 2: solve2.c: the `...killed.` bug.** The first C version buffered all 100MB then processed it. It was fast enough in theory, but kept getting `...killed.` back. After staring at it for a while, we realized the bug: when the server sends `...killed.` on failure, those literal dot characters (`.`) were landing in our op-processing loop. Our code skipped unknown characters silently, which meant we'd process the dots as no-ops, but the count was off, and more importantly, we were reading the server's failure response as if it were still part of the op stream. The fix was simple: stop processing the moment you hit anything that's not one of the five op characters, specifically stop on `\n`. The newline at the end of the stream is the real terminator. Once we added that check, the bug vanished.

**The key lesson from dead end 2:** when you're reading from a network socket, you need a clear protocol boundary. "Keep reading until the connection closes" is not a boundary: it lets server error messages leak into your processing. "Keep reading until the stream line ends with `\n`" is a real boundary.

## Running It

```
$ gcc -O3 -o solve3 solve3.c
$ ./solve3
Connected!
V=482910341 add=79123 mul=6571 xor=31337
Processed 10000000 ops, V=823041729
Processed 20000000 ops, V=193847261
...
Processed 100000000 ops, V=591034872
Connection closed, processed 100000000 ops
Final: 100000000 ops, V = 591034872
Sending: 591034872
RESPONSE: IIITL{C4lv1nb4ll_57r34m_0v3r104d_8762_n0_5l33p_4c1eb8edac59}
```

100 million arithmetic operations, streamed over the open internet, processed in under 2 seconds. That's what compiled C is for.

## Key Takeaways

- **Python has a hard ceiling for tight compute loops.** ~5M iterations/sec is roughly as fast as CPython gets. If a challenge needs 50M+/sec, you need C, Rust, or something with real native compilation. NumPy is fast but can't easily handle branchy per-element logic like this.

- **Stream and compute simultaneously.** Don't wait for all the data before starting work. Read a chunk, process it immediately, read the next. This keeps latency low and your memory footprint small.

- **`gcc -O3` is load-bearing on performance challenges.** Always compile with optimizations when throughput is the challenge.

- **Define your protocol boundaries precisely.** Know exactly what byte signals "the data is done." Relying on connection close lets server error messages corrupt your input processing: as we found out the hard way with `...killed.`

- **"Calvinball" means randomized-per-connection rules.** The challenge name was a direct hint. When you see a reference like this, take it literally: what aspect of Calvinball is being simulated? In this case: constants that change every game.
