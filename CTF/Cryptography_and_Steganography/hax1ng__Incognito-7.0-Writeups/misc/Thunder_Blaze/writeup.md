# Thunder-Blaze

**Category:** Misc | **Difficulty:** Medium | **Flag:** `IIITL{C_15_41w4y5_f4573r_7h4n_py7h0n_ec0175769fed}`

## TL;DR

A netcat service gives you one second to solve two tasks: trivial arithmetic, then compute S_50000000 of a recurrence relation whose parameters are hidden inside noisy ASCII-art digits. Naive Python is 400x too slow. The win is a custom 3x5 font OCR to extract the parameters plus Brent's cycle detection compiled to a shared library and called from Python via ctypes: 18ms total.

Oh, and the flag itself tells you the punchline: "C is always faster than Python."

## What We're Given

A netcat service at `34.131.216.230:1337`. Connect and you get "THE GAUNTLET": a 1-second wall-clock timer enforced by a server-side SIGALRM signal. Miss the deadline and the connection closes with "Alarm clock". Two tasks:

**Task 1: warmup:** `Calculate: A * B` (or +/-). Dead simple arithmetic. Just to make sure you're paying attention.

**Task 2: the actual challenge:** A recurrence relation:

```
S_i = ((S_{i-1} * C) ^ (S_{i-2} + D)) % E
```

S_0 and S_1 are given as plain integers. But C, D, and E are presented as 3x5 ASCII-art digits: rendered with noise. "On" pixels might be `#`, `@`, `%`, or `*`. "Off" pixels might be `.`, `-`, `:`, or a space. The server then asks: *"Find the value of S_50000000."*

Fifty million steps. One second. Good luck.

## Initial Recon

The first connection makes it pretty clear what we're dealing with. The task framing is aggressive by design: 50 million iterations of a recurrence is not something you solve by accident. Let's think about the two sub-problems separately:

1. **Parse the noisy ASCII art** to recover C, D, and E as integers.
2. **Compute S_50000000** fast enough to beat the timer.

For parsing, the font is a standard 3x5 grid where each digit is 3 columns wide and 5 rows tall, separated by 2 spaces. The noise characters are just a distraction: we only care whether each cell is "on" or "off". Any character in `{#, @, %, *}` is on; everything else is off.

For the computation, let's think about what we're actually up against.

## The Vulnerability / Trick

### Part 1: The OCR problem

The ASCII art uses a fixed 3x5 pixel font. Here's an example: digit `2`:

```
###
..#
###
#..
###
```

With noise, `#` might show up as `@` or `%`, and `.` might show up as `-` or `:`. But the structure is still there. We hardcode all ten digit templates as clean `#`/`.` strings, then for each candidate digit in the input we compute the Hamming distance (how many cells differ) to every template and pick the closest one. This is nearest-neighbor classification: a one-liner concept, and completely robust to the noise levels in this challenge.

### Part 2: The speed problem

The recurrence `S_i = ((S_{i-1}*C) ^ (S_{i-2}+D)) % E` has a two-element state: the pair `(S_{i-1}, S_i)`. Because E is capped around 10^6, there are at most ~10^12 possible states, but in practice the sequence cycles *very* quickly. We measured cycle lengths around 5000 steps. If we can find where the cycle starts and how long it is, we can skip from step 0 to step 50,000,000 in essentially zero time.

That's **Brent's cycle detection** algorithm: a classic trick for iterated functions. Think of it like Floyd's tortoise-and-hare, but more cache-friendly. You run a "hare" that advances through states while a "tortoise" gets periodically reset to the hare's last reset position. When they meet, you've found the cycle length lambda. Then a second pass finds mu, the index where the cycle begins.

Once you have lambda and mu, computing S_N reduces to:
- If N < mu: just iterate N steps directly (the tail is short)
- If N >= mu: iterate to step `mu + (N - mu) % lambda`

Either way, you're doing at most a few thousand iterations instead of fifty million.

Now for the final piece: Python is too slow even for the "fast path." Here's how the numbers shook out:

| Approach | Time |
|---|---|
| Python, naive 50M iterations | 7.3s |
| Python, dict-based cycle detection | 1.6s |
| C shared library, naive 50M iterations | 0.35s |
| C shared library, Brent's cycle detection | 18ms |

The 1-second budget is server-side CPU time, but our network latency is about 2.3s just to connect. So the computation itself needs to be done in the blink of an eye: which 18ms absolutely is.

The winning combo: implement Brent's in C, compile it to a shared object (`seq.so`), and call it from Python via `ctypes`. Python handles all the parsing and I/O; C handles the math.

## Building the Exploit

### Step 1: Compile the C library

`seq.c` implements one function, `compute(S0, S1, C, D, E, N)`, which returns S_N:

```c
uint64_t compute(uint64_t S0, uint64_t S1, uint64_t C, uint64_t D, uint64_t E, uint64_t N);
```

Compile it as a shared library once before connecting:

```bash
gcc -O2 -shared -fPIC -o seq.so seq.c
```

The `-O2` optimization flag matters: we want the compiler to actually try. `-shared -fPIC` are the magic flags that make it loadable by Python's `ctypes`.

### Step 2: Load the library in Python

```python
lib = ctypes.CDLL('./seq.so')
lib.compute.restype = ctypes.c_uint64
lib.compute.argtypes = [ctypes.c_uint64] * 6
```

We have to tell `ctypes` the return type and argument types explicitly, otherwise it assumes everything is 32-bit int and silently truncates your numbers. Don't skip this step: it cost us a debugging session.

### Step 3: Parse the noisy ASCII art

```python
FONT = {
    '0': '###\n#.#\n#.#\n#.#\n###',
    '1': '..#\n..#\n..#\n..#\n..#',
    # ... all 10 digits
}
SOLID = set('#@%*')

def parse_number(block_text):
    rows = block_text.split('\n')[:5]
    w = max(len(r) for r in rows)
    ndig = (w + 2) // 5   # each digit is 3 cols + 2-col separator
    out = ''
    for d in range(ndig):
        start = d * 5
        pat = []
        for r in rows:
            r2 = r.ljust(w)
            pat.append(''.join('#' if r2[start+c] in SOLID else '.' for c in range(3)))
        best, bd = None, 99
        for dd, f in FONT.items():
            dist = sum(a != b for x, y in zip(pat, f) for a, b in zip(x, y))
            if dist < bd:
                bd, best = dist, dd
        out += best
    return int(out)
```

Walk through what's happening here:
- `SOLID` is the set of "on" characters: `#`, `@`, `%`, `*`.
- For each digit position, we extract its 3x5 column of characters and normalize them to clean `#`/`.` by checking SOLID membership.
- We compute the Hamming distance to every template digit and keep the closest match.
- `ndig = (w + 2) // 5` because each digit occupies 3 columns + 2 columns of separator, so a 4-digit number like `1503` would have width `3 + 2 + 3 + 2 + 3 + 2 + 3 = 18`, and `(18+2)//5 = 4`. 

### Step 4: Extract parameters and call C

```python
def solve_task2(prompt):
    S0 = int(re.search(r'S_0 = (\d+)', prompt).group(1))
    S1 = int(re.search(r'S_1 = (\d+)', prompt).group(1))
    C = parse_number(extract_block(prompt, 'C'))
    D = parse_number(extract_block(prompt, 'D'))
    E = parse_number(extract_block(prompt, 'E'))
    N = int(re.search(r'S_(\d+)', prompt.split('Find')[1]).group(1))
    return str(lib.compute(S0, S1, C, D, E, N))
```

S0 and S1 are plain text integers in the prompt: easy regex. C, D, E each have a labeled block we extract with another regex and hand to `parse_number`. N (the index to find, always 50000000) comes from the "Find the value of S_..." line.

The Brent's cycle detection in `seq.c` is the real hero here. The core loop in C:

```c
// Advance hare, periodically reset tortoise
while (ta != ha || tb != hb) {
    if (power == lam) {
        ta = ha; tb = hb;   // reset tortoise to hare's position
        power *= 2;
        lam = 0;
    }
    uint64_t n = ((hb*C) ^ (ha+D)) % E;
    ha = hb; hb = n;
    lam++;
}
```

`power` doubles each time we reset: this is what makes Brent's more cache-friendly than Floyd's. Once the loop exits, `lam` is the cycle length. A second pass finds `mu` (where the cycle starts). Then we walk to position `mu + (N - mu) % lam` and read off the answer.

### Step 5: Connect and respond

```python
r = remote('34.131.216.230', 1337)
buf = ''
while True:
    chunk = r.recv(timeout=3).decode(errors='replace')
    buf += chunk
    if buf.rstrip().endswith('>'):   # prompt is always terminated by '>'
        ans = handle(buf)
        r.sendline(ans.encode())
        buf = ''
```

We accumulate received data until we see a `>` prompt character, parse and answer it, then clear the buffer. `pwntools` handles the connection plumbing: it's the standard CTF library for talking to remote services, so we don't have to wrestle with raw sockets.

## Running It

```
$ gcc -O2 -shared -fPIC -o seq.so seq.c
$ python3 solve.py
[+] Opening connection to 34.131.216.230 on port 1337: Done
handle: 0.001s  ans='93518009'   # task 1: arithmetic, trivial
S0=32 S1=36 C=1503 D=2561 E=693279 N=50000000
handle: 0.021s  ans='358184'     # task 2: OCR + Brent's, 21ms
Task 2: ACCEPTED
Congratulations! IIITL{C_15_41w4y5_f4573r_7h4n_py7h0n_ec0175769fed}
```

Task 1 in 1ms, task 2 in 21ms. The server's 1-second budget never even broke a sweat.

## Key Takeaways

**The main lesson: when a tight wall-clock deadline makes Python too slow, drop hot loops into C and call them via `ctypes`.** This is a one-compile-step solution and the ctypes API is straightforward. You keep all the nice Python tooling (pwntools, regex, whatever) and just delegate the math-heavy inner loop to C. The speedup here was roughly 400x over naive Python.

**The secondary lesson: Brent's cycle detection is your friend for iterated-map recurrences.** Any recurrence `S_i = f(S_{i-1}, S_{i-2})` over a bounded state space will eventually cycle: usually after O(sqrt(state_space)) or fewer steps. Brent's algorithm finds that cycle in linear time and constant memory. Once you have the cycle, finding S_N for any N is O(cycle_length), not O(N).

**The tertiary lesson: noisy pixel-font OCR is just nearest-neighbor classification.** If you know the font, hardcode the templates and classify by Hamming distance. It's five lines of code and it handles any reasonable noise level.

**The gotcha that burned us:** Forgetting to set `lib.compute.argtypes` and `lib.compute.restype` in ctypes causes silent 32-bit truncation of arguments. When E is 693279 and C is 1503, everything fits, but you'll get wrong answers and scratch your head for a while. Always declare your types explicitly.

And the flag itself: `IIITL{C_15_41w4y5_f4573r_7h4n_py7h0n_ec0175769fed}`: "C is always faster than Python." The challenge designers hid the punchline in the prize. Well played.

If you want to go deeper on cycle detection: [Brent's algorithm on Wikipedia](https://en.wikipedia.org/wiki/Cycle_detection#Brent's_algorithm) has a clean walkthrough. For ctypes, the [Python docs](https://docs.python.org/3/library/ctypes.html) are actually pretty readable for once.
