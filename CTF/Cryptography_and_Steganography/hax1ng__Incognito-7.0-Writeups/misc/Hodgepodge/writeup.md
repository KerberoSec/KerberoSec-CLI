# Hodgepodge

**Category:** Misc | **Difficulty:** Hard | **Points:** 400 | **Flag:** `iiitl{d39end3nc3_15_n0t_4lway5_64d_4nd_p13as3_c0m3_back}`

## TL;DR

A React SPA hides a login portal behind an XOR-obfuscated route. Deobfuscating the bundle and auditing a suspicious npm package gives you the username. A 414 MB zip file hidden in a base64-encoded OAuth STATE parameter leads (eventually, through a lot of noise) to a dev server IP. A full port scan of that IP finds a hidden interactive puzzle on port 1338: solve 32 test cases of "find the zero in an array", and you get the password. Put them together, encode through a 12-step pipeline, and the flag drops.

The challenge name is very on-brand.

## What We're Given

A URL: `https://hodgepodge-ctf.vercel.app/`

That's it. The page has a navbar, a login button that hits a fake GitHub OAuth flow, and a title: **Independence**. No files, no source, no hints: just a live web app and a challenge description that says *"It's just hodgepodge around here, there must be a workaround through this mess."*

The description is accurate. Strap in.

## Initial Recon

First things first: let's see what we're actually dealing with.

```bash
curl -sI https://hodgepodge-ctf.vercel.app/
# → Vercel, 566 bytes of index.html
```

React SPA deployed on Vercel. The actual JavaScript bundle is a single 1.6 MB file, heavily obfuscated with `javascript-obfuscator`: it uses RC4 string arrays, so all the string literals are encrypted and looked up through a decoder at runtime. Not fun to read manually.

Enter **webcrack**: a tool that reverses common JavaScript bundler/obfuscator patterns and recovers something close to the original source structure:

```bash
curl -s https://hodgepodge-ctf.vercel.app/DzWdv6Cm.js -o bundle.js
npx webcrack bundle.js -o src/
```

This doesn't decrypt the RC4 string arrays (it can't, without running the code), but it does recover the file structure, function names, and control flow. We get a readable `src/` tree including `pages/`, `utils/`, and `components/`.

## The Vulnerability / Trick

There are actually four interlocking tricks here, each one revealing the next piece of the puzzle. Let's walk through them.

### Trick 1: The Hidden Route (`_seg.js`)

After deobfuscation, `src/utils/_seg.js` contains this:

```js
const _D = new Uint8Array([
  0x7D, 0x5D, 0x14, 0x48, 0x70, 0x37, 0x27, 0x4E,
  0xFB, 0xCF, 0x97, 0xAE, 0x83, 0xD5,
]);
function _rs() {
  let _s = '';
  for (let _i = 0; _i < _D.length; _i++) {
    _s += String.fromCharCode(_D[_i] ^ ((_i * 17 + 5) & 0xFF));
  }
  return _s;
}
export const _PSEG = _rs();
```

This is a classic "hide the route so it doesn't appear as a plaintext string" trick. Each byte in `_D` is XOR'd with `(index * 17 + 5) mod 256` to produce a character. A quick Python one-liner reveals it:

```python
d = [0x7D,0x5D,0x14,0x48,0x70,0x37,0x27,0x4E,0xFB,0xCF,0x97,0xAE,0x83,0xD5]
print(''.join(chr(b ^ ((i*17+5) & 0xff)) for i, b in enumerate(d)))
# → xK3p9mL2vQ8nR7
```

Navigating to `https://hodgepodge-ctf.vercel.app/xK3p9mL2vQ8nR7` shows a proper login form: username, password, sign-in button. It POSTs to `/api/auth`. Now we have something to aim at.

### Trick 2: The Suspicious npm Package (`symatrix`)

The encoding utility imports from a package called `symatrix`:

```js
import { xorEncode, substitute } from 'symatrix'
```

`symatrix` is published by a user called `uknowmeiknowu1`, uploaded three days before the CTF started. Fresh publish, suspicious maintainer, provocative name: this is a plant.

Pulling down the package source, the exported functions (`xorEncode`, `substitute`) look totally normal. But buried inside is a dormant function called `_fromBlob()` that is never called during normal operation:

```js
const _PIPELINE_SEED = 0x53594D41;  // "SYMA" in ASCII

function _fromBlob() {
  if (typeof process === 'undefined') return '';
  const _b = require('fs').readFileSync(require('path').join(__dirname, 'data.bin'));
  const _sz = _b.length;
  const _n = 0x10;   // 16 bytes of output
  let _v = _PIPELINE_SEED;
  const _out = [];
  for (let _k = 0; _k < _n; _k++) {
    _v = _lcg(_v);             // advance LCG state
    let _o = _v % _sz;
    while (_o < _HEADER_SIZE) { _v = _lcg(_v); _o = _v % _sz; }
    _out.push(_b[_o] ^ (_o & 0xff));   // extract and unmask one byte
  }
  return Buffer.from(_out).toString('ascii');
}
```

An **LCG** (Linear Congruential Generator: a simple pseudorandom number generator seeded with a constant) picks 16 byte offsets from a bundled 25 MB `data.bin` file. Each byte is unmasked with `(offset & 0xff)`. The result is a 16-character ASCII string.

Running it gives us: `uwillnotcomeback`

This is our username. We don't know it yet, we file it away and keep digging.

### Trick 3: The 414 MB Zip in an OAuth Parameter

Back in `Navbar.jsx`, there's a fake GitHub OAuth "Sign In" button. The OAuth URL has a `state` parameter:

```js
const STATE = 'aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMUtsSmRHbEN2N3dEZ05YM1lhYjIyeHUwWWVWRTc2YjBRP3VzcD1zaGFyaW5n'
```

The OAuth `state` parameter is normally used to prevent CSRF: it's supposed to be a random nonce, not interesting data. But this one base64-decodes to:

```
https://drive.google.com/drive/folders/1KlJdGlCv7wDgNX3Yab22xu0YeVE76b0Q?usp=sharing
```

There's a 414 MB zip file sitting in that Google Drive folder: `hodgepodge.zip`.

#### Inside the zip: a lot of noise

Unzipping reveals:
- The full React frontend source (matches what we deobfuscated: confirms our earlier work)
- A `.git/` directory with a 400 MB pack file containing a full clone of `openclaw/openclaw`: a completely unrelated open source project. Pure noise.
- A `.git/.git/` directory (yes, a git repo inside a git repo's git dir) with the ACTUAL challenge commit history, authored under fake personas like `n3tw0rk_j`, `s3rv_acc01`, and `r00t_patcher`
- Matryoshka-style tarballs: `symatrix-1.2.3.tgz` containing `symatrix-1.2.2.tgz` containing `symatrix-1.2.1.tgz`: all three have identical contents

The commit messages base64-decode to a mix of mundane dev notes and trolling (`"thanks for wasting your time"`). One commit message contains `symatrix:XROENCODE_KEY=0xAAFF9987: init_vector=0xDEADBEEF`, which looks exciting but leads nowhere.

The genuinely useful find is in blob `4d15dee0`: an old `vite.config.js`:

```js
server: {
  proxy: {
    '/api': { target: 'http://34.126.212.8:5000', ... }
  }
}
```

That's the dev backend IP: `34.126.212.8:5000`.

### Trick 4: Port 1338: The Oracle of Equality

Port 5000 just gives us the same Flask backend as the Vercel-proxied version. But we haven't checked ALL ports yet.

```bash
nmap -p 1-65535 34.126.212.8
# 22/tcp   open  ssh
# 1338/tcp open  ???
# 5000/tcp open  http
```

Port 1338. Connecting with netcat:

```
nc 34.126.212.8 1338
```

```
================= ORACLE OF EQUALITY =================
Hidden array 'a' of length 2n. Each 1..n appears once. Remaining n positions are 0.
Find any k with a[k]=0. Query "? i j" returns 1 iff a[i]==a[j]. Budget: n+1 queries per test.
Solve ALL test cases correctly to earn the secret.
======================================================
```

So we have an array of length 2n. Half the values are zeros, and the other half are distinct nonzero values 1 through n. We need to find any index that holds a zero, using at most n+1 queries. Each query asks "are positions i and j equal?" and gets a 1 or 0 in response.

**The key insight:** since all nonzero values are globally unique, `query(i, j) = 1` if and only if `a[i] == a[j] == 0`. A "1" response tells us BOTH positions are zero. So we just need any query that returns 1.

**The strategy:** fire off all n pair queries `(1,2), (3,4), ..., (2n-1, 2n)` in one go. That's n queries. If ANY pair returns 1, both elements of that pair are zero: we answer with either index. We've used at most n queries, within budget.

What if all n pairs return 0? Every pair has mismatched values: meaning in each pair, exactly one element is zero and one is nonzero. We can spend our last query on `(1, 3)`. If that's 1, positions 1 and 3 are both zero. If not, then position 2 must be zero (since pair (1,2) returned 0 and position 1 isn't zero).

## Building the Exploit

### The Oracle Solver

The main challenge with the oracle isn't the logic: it's speed. There are 32 test cases, and n can be up to 1300. If we do each query as a separate round-trip (send query, wait for response), that's 1300 × 260ms ≈ 5+ minutes per large test case. We'd time out.

The fix is **pipelining**: send all n queries in a single `sendall()` call, then read all n responses. Combined with `TCP_NODELAY` to disable Nagle's algorithm (which would buffer small packets: we want them sent immediately), this collapses n round-trips into roughly one.

```python
import socket

class Oracle:
    def __init__(self):
        self.s = socket.socket()
        self.s.setsockopt(socket.IPPROTO_TCP, socket.TCP_NODELAY, 1)
        self.s.settimeout(120)
        self.s.connect(('34.126.212.8', 1338))
        self.buf = b''

    def pipeline_pairs(self, pairs):
        """Send all queries at once, read all responses after."""
        q_bytes = b''.join(f"? {a} {b}\n".encode() for (a, b) in pairs)
        self.s.sendall(q_bytes)
        return [int(self.read_line().strip()) for _ in pairs]
```

The solve logic for each test case:

```python
def solve_tc(orc, n):
    pairs = [(2*i-1, 2*i) for i in range(1, n+1)]  # pair up adjacent indices
    results = orc.pipeline_pairs(pairs)

    # If any pair both equal, we found two zeros
    for i, r in enumerate(results):
        if r == 1:
            orc.answer(pairs[i][0])  # both are zero, answer with either
            return

    # All pairs differ: use one more query
    if n >= 2:
        r = orc.query(1, 3)
        if r == 1:
            orc.answer(1)   # positions 1 and 3 are both zero
            return
    # Position 2 must be zero (pair (1,2) differed, so 1 is nonzero)
    orc.answer(2)
```

The full solver is in `solver.py`.

### The Encoding Pipeline

Once we have username and password, we can't just POST them directly. The frontend encodes both through a 12-step pipeline defined in `src/utils/encoding.js`. We replicated this in `encode.cjs`:

1. XOR encode (symatrix's `xorEncode`): XORs each char with `0x37`, outputs comma-separated decimals
2. Base64
3. Reverse the string
4. Atbash cipher: maps a↔z, b↔y, etc.
5. Base32
6. ROT13
7. Hex encode
8. Base64 again
9. Reverse again
10. ROT47: rotates printable ASCII characters
11. `substitute` (symatrix's substitution table)
12. Final Base64

This looks intimidating but it's actually a red herring as far as attacks go: every step is invertible, so there's no information loss and no exploitable bypass. The chain is decoration. We just need to run it correctly.

```js
const [,,u,p] = process.argv;
console.log(JSON.stringify({username: enc(u), password: enc(p)}));
```

```bash
node encode.cjs "uwillnotcomeback" "neverbedependentonuwillnotcomeback" | \
  curl -s -X POST http://34.126.212.8:5000/api/auth \
       -H 'Content-Type: application/json' -d @-
```

## Running It

After solving all 32 oracle test cases:

```
TC 30: n=800
  -> ans=421
TC 31: n=42
  -> ans=5
TC 32: n=15
  -> ans=17
Got non-number: 'END'
The oracle is satisfied.
Here is your reward:
Password: neverbedependentonuwillnotcomeback
```

And then the final auth call:

```bash
node encode.cjs "uwillnotcomeback" "neverbedependentonuwillnotcomeback" | \
  curl -s -X POST http://34.126.212.8:5000/api/auth \
       -H 'Content-Type: application/json' -d @-

{"flag":"iiitl{d39end3nc3_15_n0t_4lway5_64d_4nd_p13as3_c0m3_back}"}
```

## The Wordplay Payoff

Step back and look at what we assembled:

- **Username:** `uwillnotcomeback` (from the symatrix backdoor)
- **Password:** `neverbedependentonuwillnotcomeback` (from the oracle reward)
- **Site name:** Independence

Read the password out loud: "never be dependent on u-will-not-come-back." The flag decodes to something about dependence not always being bad and please come back. The entire challenge is a pun on the site's "Independence" branding. The challenge author trolled us across 400 MB of fake git history and matryoshka tarballs and paid it off with a wordplay flag.

Respect.

## Dead Ends Worth Knowing About

**The openclaw/openclaw git pack (400 MB of noise).** The outer `.git/` in the zip is a full clone of a real open source project that has nothing to do with the challenge. We ran `git log --all`, `git fsck --unreachable`, and searched packed-refs before realizing it was pure misdirection. Lesson: when a CTF challenge hands you a massive binary blob, check if there's another artifact _next to_ it before deep-diving the blob.

**Matryoshka tarballs.** `symatrix-1.2.3.tgz` → `symatrix-1.2.2.tgz` → `symatrix-1.2.1.tgz`. All three are bit-for-bit identical once unpacked. This was just to make the zip larger and look scarier.

**Hunting for an encoding bypass.** We spent real time trying to find a collision or fixed-point in the 12-step encoding pipeline that might let us authenticate without knowing the real credentials. There isn't one: every step is bijective. Also tried JSON type confusion (`{"$ne":null}`), duplicate keys, XML body, parameter pollution. The backend returns `{"error":"invalid"}` for everything except the correct pair.

**Commit message base64 decodes.** Every "hint" in the fake git history decoded to flavor text (`"thanks for wasting your time"`) or red-herring constants (`0xDEADBEEF`, `C2_CHECKPOINT`). None were actionable.

**Credential guessing.** We tried `uwillnotcomeback` as a password with every plausible username before realizing it was the username. This is why you always run a full port scan before giving up.

## Key Takeaways

- **Always run a full port scan on any IP you find.** Port 1338 was the entire challenge. `nmap -p 1-65535` takes a few minutes; skipping it cost us an hour.
- **Suspicious npm packages are a CTF trope.** Fresh publish + unknown maintainer + bundled binary blob = read every function, including the unused ones.
- **OAuth `state` parameters are a great hiding spot for out-of-band hints.** Anything base64 in a URL that "shouldn't" be information-bearing is worth decoding.
- **Pipelining matters for interactive puzzles.** TCP round-trip latency multiplied by thousands of queries will blow your time budget. Batch your queries with `sendall()` and `TCP_NODELAY`.
- **When a challenge drops 400 MB of data, look for what's hiding next to it, not inside it.** The real commit history was in `.git/.git/`, a subdirectory of the noise.
- **A 12-step encoding chain with all-bijective steps is not the vulnerability.** It's a wall to make you feel like you're missing something. You're not.

If you want to go deeper on the oracle-style puzzle, it's related to the classic "find the counterfeit coin" problem. The key property we exploited: that `query(i,j)=1` iff both are zero: reduces it from a comparison problem to a "find a matching pair" problem, which is solvable in n queries with the pairing strategy.
