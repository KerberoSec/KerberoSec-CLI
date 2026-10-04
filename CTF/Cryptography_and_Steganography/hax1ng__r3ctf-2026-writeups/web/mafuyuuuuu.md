# mafuyuuuuu: Full Writeup

**Event:** R3CTF 2026
**Challenge:** `mafuyuuuuu` (aka *SEKAI Filing Live* / *PaperTrailDesk*)
**Target:** `http://challenge.ctf2026.r3kapig.com:31503`
**Category:** Web, with a crypto/PRNG lock on the door

> *"Take a short break and listen to some music. But can you find the true feelings Mafuyu has hidden behind these cold melodies?"*

**Flag:**
```
r3ctf{OTome_K4lbou_de_aSoBOU_yO-D0KId0KI-5H1Tal-JAN_ka_dare_datte_congrats_finding_the_correct_solution0}
```

This is the whole story, start to finish, written to be readable even if you're not a crypto person, but with enough detail to reproduce. The short version: there's a hidden "run a shell command" button in the web app, but it only works if you can guess a secret random number the server just rolled. The server uses a strong, well-seeded random generator and only shows you part of each number, so this looks impossible. It isn't: because of one subtle detail in how .NET turns a random number into an `int`. Get that detail right and the rest is algebra.

---

## 1. Recon: a cute Project Sekai app with a debug backdoor

The handout is a .NET 8 ASP.NET web app (`PaperTrailDesk.dll`) behind nginx, themed around *Project Sekai*'s Mafuyu / 25-ji Nightcord. Decompiling it, the interesting surface is a little templating language ("Story Lab") you can POST to and have rendered:

```http
POST /api/sekai/story-lab/render
{"template":"{{ upper user }}","user":"world"}   ->  "WORLD"
```

There's a sandbox (`StorySandbox`) that blocks the dangerous reflection-y stuff: `type`, `member`, `call` are clamped to a tiny allow-list (`Math.Abs`, `Guid.NewGuid`, …), file/process/assembly words are banned, and so on. All the "obvious" template-injection escapes are decoys.

The real door is one compatibility function the sandbox deliberately lets through:

```
{{ debug(<ticket>, <command>) }}
```

Decompiled, it does this:

```csharp
public string RunDebug(string ticket, string command)
{
    string right;
    lock (_gate) { right = NextWeakBase64(); }   // roll ONE fresh random value
    if (!FixedEquals(ticket, right))              // must match, constant-time
        return "DebugDenied<" + Short(ticket) + ">";
    return RunCommand(command);                   // -> /bin/bash -lc <command>
}
```

So `debug(ticket, "/readflag")` runs the setuid `/readflag` helper (which prints the root-only `/flag`) **if and only if** your `ticket` equals a value the server randomly generated at that exact moment. The comparison is constant-time (no timing leak) and a wrong ticket just echoes itself back (no oracle). One shot per call, and each call burns a fresh random draw.

**The entire challenge reduces to: predict the server's next random number.**

We get exactly one place that leaks the RNG: `POST /api/desk/posts` returns two consecutive random values as base64 decimals:

```csharp
// IssuePostToken: two draws, both revealed as id / csp
return new DebugLeaseToken(NextWeakBase64(), NextWeakBase64(), lane, ++_postCount);

// NextWeakBase64: base64( ascii( decimal( _random.Next(0, int.MaxValue) ) ) )
```

So: harvest outputs from `/api/desk/posts`, reconstruct the RNG, predict the next value, feed it to `debug`. Simple plan. All the difficulty is the "reconstruct the RNG" part.

---

## 2. The RNG: xoshiro256\*\* and the truncation wall

`new Random()` on .NET 6+ is **xoshiro256\*\***: 256 bits of state (`s0,s1,s2,s3`), and each call:

**produces an output** from the state: `output = rotl(s1*5, 7) * 9` (mod 2^64, depends only on `s1`), and then **scrambles the state** with a pile of XORs and shifts.

Two facts drive everything:

- **The state update is linear over GF(2)** (pure XOR/shift). So every bit of every future state is just an XOR of some fixed subset of the original 256 state bits. Very friendly to linear algebra.
- **The output step multiplies** (by 5, by 9). Multiplication makes *carries*, which mix low bits into high bits in a non-XOR way. That nonlinearity is the whole problem.

If the server gave us the *full* 64-bit outputs, this would be a five-minute solve: multiplication by 5 and 9 is invertible, so recover `s1`, collect four, solve a linear system, done. But `Next(0, int.MaxValue)` returns a ~31-bit `int`: we only ever see the top chunk of each 64-bit output, and the bits we're missing are exactly the ones the carries depend on. This is "truncated xoshiro recovery," and it has a reputation for eating solvers alive. An earlier analysis pass threw SAT, SMT, lattice, and custom search at it and every one hit a wall.

---

## 3. The one detail that changes everything

The trap: you *assume* `Next(0, int.MaxValue)` chops the 64-bit output to its top 31 bits (`output >> 33`). Every failed solver was built on that assumption. **It's wrong.**

I only caught it because I built a tiny C# **ground-truth harness**: use reflection to reach into a live `Random` and read its *actual* private `s0..s3`, and dump both the true state and the values `Next` produced. Now every theory is a one-line experiment against reality instead of a guess.

The first experiment showed my "obvious" formula was off by 1, again and again. After fitting a few hundred samples, the real rule fell out with **zero mismatches**:

```
NextUInt32 = (uint)(output >> 32)                  // take the HIGH 32 bits
real       = (NextUInt32 * 2147483647) >> 32       // 32-bit Lemire multiply-reduce
```

.NET grabs the top 32 bits and does a **Lemire multiply-and-shift** range reduction: *not* a clean truncation. Versus `output >> 33`, this differs about **79% of the time**. So a solver built on `>>33` is fed mostly-false equations, no consistent solution exists, and it fails forever. The crypto was never the wall: the wrong reduction formula was.

Two consequences of the correct formula, both verified 300/300 against the harness:

- Knowing `real` pins the top of `output` to a width-2 interval → we cleanly know the **top ~31 bits of each output**.
- Those known bits reduce to a beautifully clean statement:

```
top 31 bits of output  ==  bits 26..56 of (45 * s1)
```

`45 = 5×9`, and `45*s1 = s1 + (s1<<2) + (s1<<3) + (s1<<5)`: sparse and tidy. Now: **for each leaked value we know a 31-bit window of `45·s1_t`, where `s1_t` is a known XOR-combination of the 256 unknown starting bits.**

---

## 4. Cracking the state: guess-and-linearize + meet-in-the-middle

Bit `k` of `45·s1` is `s1[k] ⊕ s1[k-2] ⊕ s1[k-3] ⊕ s1[k-5] ⊕ carry_k`. Everything is a clean XOR except the `carry`. If we knew the carries, every known bit becomes a linear equation in the 256 unknowns, and ~9 leaked values over-determine everything → solve, done.

To get the carries, **guess a little and derive the rest**: for each observation, guess the 5 low bits `s1[21..25]` plus the 2-bit carry into bit 26, then walk upward: each known output bit yields the next `s1` bit, which yields the next carry exactly. That's **7 guessed bits → ~36 linear equations per observation.**

Naively that's 7 bits × 8 observations = 2^56 guesses, and a plain search drowns (the guesses don't contradict anything until you've stacked enough equations, so the tree is astronomically wide before it prunes: I confirmed this; it never finishes).

The escape is **meet-in-the-middle**. Stack 8 observations' equations. The coefficient matrix is *fixed* (only the right-hand sides depend on guesses). One Gaussian elimination gives (a) a matrix that rebuilds the full state from the right-hand sides, and (b) ~30 "consistency check" relations the right-hand sides must satisfy. Those 30 bits are the handshake:

- **Left half:** enumerate `128^4 = 2^28` guess combos, file each by its 30 check bits in a sorted table.
- **Right half:** enumerate `2^28` combos, look up the value that cancels its check bits in the table.
- Each colliding pair → rebuild the 256-bit state → **verify** by regenerating a dozen outputs. Wrong candidates die on the first mismatch; the true state reproduces everything.

Small real-world wrinkles, all handled: the 8-observation system had rank 254-253 (a 2-3-dim "don't care" space → just enumerate the handful and verify), and there are ~2^26 spurious collisions to check: cheap, and the whole scan is embarrassingly parallel, so it's fanned out across all 48 CPU cores.

**Proof it works** (fed 22 outputs from a `Random` whose true state we secretly reflected out):

```
[mitm] N=284 rank=254 R(checks)=30, nullDim=2
[mitm] enumerating H1 (2^28)... sorting... streaming H2 in parallel (cores=48)...
[mitm] FOUND
RESULT_STATE0 8104534023035742417 13697123528475029788 1732295281706054841 5306601245101494750
[mitm] MATCH GT: True        <-- exactly the state we hid
```

Sub-minute recovery, exact match. From `s0..s3` we can now roll the generator forward and predict every future value.

---

## 5. Going remote: harvest, recover, predict, fire

Predicting locally is one thing; the live server is a shared, noisy, moving target. There's a single `Random` behind a lock, and *everyone* draws from it in one serialized line:

- our `posts` → **+2**, our `debug` render → **+1** per call,
- **`/healthz` → +3**, and the backend hits its own `/healthz` **every 5 seconds** (an internal health probe), so 3 draws silently vanish on a heartbeat,
- other players' requests → more unpredictable draws.

**Harvesting a clean burst.** Recovery needs *truly consecutive* outputs. Each `posts` gives a consecutive pair, but the 5-second heartbeat can punch a hole between two calls. So: fire posts **sequentially** (concurrency would scramble the order), grab 11 of them (22 outputs) fast (~2.5s), and let the MITM tool itself be the gap detector: it only recovers a state if its observations are genuinely consecutive, and then it re-verifies against the collected values. A gapped burst simply fails → collect a fresh one. That's not hypothetical; it's the live run:

```
attempt 1: 22 outputs in 2.76s -> mitm 85s -> NOT FOUND   (heartbeat gap in the burst)
attempt 2: 22 outputs in 2.47s -> mitm 40s -> FOUND
           state reproduces first 22/22 collected outputs   (unambiguously correct)
```

**The timing race.** We re-anchor before each shot: one `posts` returns `d[j], d[j+1]`; find that pair in our predicted stream → the server's next draw is `d[j+2]`. But between our anchor and our render, an unknown number of draws `g` may sneak in (a heartbeat = +3, a rival = +2, …), so the `debug` call actually rolls `d[j+2+g]`. We can't binary-search `g` (wrong tickets leak nothing), and the tempting fix: chaining consecutive tickets: covers only `g=0` (the calls draw consecutively too, so they only line up when there's no drift).

**The trick that works: a drift-covering spray.** Put `K+1` `debug` calls in one render, but **space the tickets by two**: ticket for call #k = `base64(d[pos + 2k])`. During the render, call #k draws `d[pos + g + k]`, so it matches when `pos + 2k == pos + g + k` ⟺ `k == g`. **Whatever the drift is, call #g lines up and fires.** One render deterministically covers every `g` in `[0, K]`. (The sandbox caps a template at 48 expressions, so `K ≤ ~47`; I use `K=30`, covering up to ~10 heartbeats of drift.)

Template sent (31 chained calls):
```
{{ debug(<b64 d[pos+0]>, /readflag) }}{{ debug(<b64 d[pos+2]>, /readflag) }} ... {{ debug(<b64 d[pos+60]>, /readflag) }}
```

---

## 6. The kill

First attack attempt landed it. The response (HTML, so `<` shows as `&lt;`):

```
r3ctf{OTome_K4lbou_de_aSoBOU_yO-D0KId0KI-5H1Tal-JAN_ka_dare_datte_congrats_finding_the_correct_solution0}
/bin/bash: /root/.bash_profile: Permission denied
DebugDenied<NTQzOTg4NTc5>DebugDenied<MTg2MTQ5OTM3OQ==>DebugDenied<...>...
```

- The **flag is first** → call #0 won, so drift `g=0` this time (a heartbeat-free window).
- The `/root/.bash_profile: Permission denied` is harmless: `bash -lc` behaves like a login shell and can't read root's profile: stderr noise before `/readflag` runs.
- The trailing `DebugDenied` entries are the rest of the spray (calls #1, #2, …). With `g=0`, call #k draws `d[pos+k]` but its ticket is `d[pos+2k]`, which only agrees at `k=0`, so every other call correctly denies. The prediction was exactly right; those denials are the model confirming itself.

End to end: two burst attempts + one 40s recovery + one render ≈ a couple of minutes.

---

## 7. Takeaways

- **Instrument the real library; don't reason from memory.** The whole "unsolvable wall" was a single wrong reduction formula. A 40-line reflection harness settled it in seconds and turned every assumption into a testable experiment.
- **The killer fact:** `Random.Next(0,max)` on .NET is a 32-bit **Lemire** reduce of the high half: `((output>>32)*max)>>32`: *not* `output>>33`. Assume the truncation and every solver fails on contradictory equations.
- **Truncated xoshiro is beatable** with guess-and-linearize + meet-in-the-middle; parallelize the scan so retries are cheap.
- **The shared self-draining RNG is the remote boss.** Model the 5-second heartbeat, detect bad samples for free (state must reproduce the burst), and cover the unknowable timing drift deterministically (space spray tickets by 2 so call #k fires at drift k).

And the flag signs off the joke itself: *"…congrats finding the correct solution."* The correct solution being: don't trust the truncation; it's Lemire all the way down.

---

### Artifacts

- `harness/`: C# ground-truth generator (reflects real `Random` state; validates the xoshiro model and the Lemire formula).
- `mitm/`: parallel meet-in-the-middle state recoverer (consecutive outputs → verified 256-bit state).
- `exploit.py`: full remote chain (harvest → recover → predict → drift-covering spray → flag).
- Companion writeups: `mafuyuuuuu_local_writeup.md` (the crypto crack in depth) and `mafuyuuuuu_remote_writeup.md` (the remote exploitation in depth).
