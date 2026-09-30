# Scheduler (schduler)

**Category:** Reversing | **Difficulty:** Medium-Hard (350 pts) | **Flag:** `IIITL{pr10r1ty_b005t_4ct1v4t3d_52194357123987345}`

## TL;DR

A statically-linked binary implements a custom preemptive thread scheduler with a hash-based flag gate. The hash only produces the target value if all 4 threads are given equal priority, forcing the scheduler into a round-robin pattern that interleaves exactly one write per quantum. The "mistake" is that burst timing and round-robin behavior combine to produce the magic interleaving pattern only under equal-priority conditions.

## What We're Given

A netcat challenge: `nc ctf.axiosiiitl.dev 1337`

The binary is `scheduler_challenge`: a 64-bit ELF, statically linked, stripped. The challenge description says:

> "DarkNinja got bored during OS lecture so he decided to make his own schduler, however he had to do it fast before the prof catches him so he made some mistakes...."

That hint about "mistakes" is doing a lot of work: it's basically telling us the scheduler behaves unexpectedly in some way, and that weirdness is the key.

Running the binary:
```
==================================================
      SEQURI QUEST: THE SCHEDULER VAULT           
==================================================
Welcome. You have access to the system task queue.
Submit your thread parameters to access the vault.
Max concurrent tasks: 4

> How many threads to spawn? (1-4): 
> Select payload (1: X77, 2: Y88, 3: Z99, 4: W66): 
> Priority (0 = Highest, 99 = Lowest): 
> Burst Time Limit:
```

A scheduler simulator. We're picking threads, payloads, priorities, and burst times. The scheduler runs them and presumably prints a flag if conditions are met.

## Initial Recon

```bash
file scheduler_challenge
# ELF 64-bit LSB executable, x86-64, statically linked, stripped

checksec scheduler_challenge
# No canary, NX enabled, No PIE
```

`strings` output is mostly garbage: no plaintext "flag" or obvious strings. That's suspicious. Running `strings | grep -i ictf` turns up nothing.

The first real find: the binary XOR-encodes all its strings with `0x5a`. The function `sub_407c25` decodes each byte before printing. That's why "SEQURI", "X77", "Y88", "Z99", "W66" don't appear as plaintext: the binary decodes them at runtime. This is a light obfuscation technique, not real crypto, and it just means we need Binary Ninja or similar to follow execution rather than lean on strings.

No PIE means addresses are fixed, which makes static analysis much cleaner.

## The Architecture: A State Machine Running Fake Threads

The heart of the binary is `sub_4084f3`: a state machine dispatcher. States and what they do:

| State | Action |
|-------|--------|
| `0x8a1b` | Initialize, read stdin |
| `0x1c2d` | Display welcome message |
| `0x3b4a` | Read number of threads (1-4), validate |
| `0x5d6e` | Check if all thread params entered |
| `0x7f8c` | Read payload/priority/burst for each thread |
| `0x9a0b` | Spawn thread via `sub_4f7255` |
| `0xb1c2` | Spin-wait until all threads finish (TCB status == 3) |
| `0xd3e4` | Validate conditions and print flag via `sub_4083c1` |

The binary implements real preemptive scheduling using `SIGALRM` (fires every 10ms) and `swapcontext`: that's the POSIX call for saving/restoring a thread's execution context (registers, stack pointer, etc.). This isn't simulated scheduling; the binary is genuinely switching between execution contexts based on timer interrupts.

**TCB (Thread Control Block) layout**: the struct for each thread lives at a fixed offset:
```
+0x00  id        (int)
+0x04  priority  (int)
+0x08  burst     (int, decremented each timer tick)
+0x0c  status    (0=READY, 1=RUNNING, 3=DONE)
```
Total struct size: `0x43d8` bytes: mostly the saved context.

**4 payload types**, each thread runs a loop of 16 iterations. Each iteration:
1. Acquires a mutex (the "token")
2. Writes one magic value to a shared global array `data_717060` at index `data_717164++`
3. Busy-waits ~50 million cycles
4. Releases mutex

Magic values per payload:
- Payload 1 (X77): `0x13371337`
- Payload 2 (Y88): `0xdeadbeef`
- Payload 3 (Z99): `0xcafebabe`
- Payload 4 (W66): `0xbaadf00d`

The global array has 64 slots (4 threads × 16 writes = 64). After all threads finish, the 64-element array records which thread wrote in what order.

## The Vulnerability / Trick

### The Validation Gate

`sub_4083c1` checks two conditions before printing the flag:

**Condition 1:** `sub_4f8284()` returns 1:
- All 64 slots in `data_717060` must be non-zero
- A custom hash of the 64-slot array must equal `0xe903d23a`

**Condition 2:** No duplicate burst times among threads.

The hash function (`sub_4f7f84`) is the crux of everything. Let's look at it:

```python
def custom_hash(arr):
    var_1c = 0x811c9dc5  # FNV offset basis
    var_18 = 0
    var_14 = 0           # transition counter
    for i in range(len(arr)):
        var_1c = (var_1c + arr[i]) & 0xffffffff
        var_18 = (var_18 ^ ((arr[i] >> 2) * 0x1000193)) & 0xffffffff
        if i > 0 and arr[i] != arr[i-1]:
            var_14 += 1
    var_c = var_1c ^ var_18
    if var_14 > 44:         # > 0x2c transitions
        var_c ^= 0x1337beef
    return var_c & 0xffffffff
```

Here's the critical insight: `var_1c` and `var_18` are computed with **commutative operations**: addition and XOR. The actual values in the array matter, but not their order. With 4 threads each writing the same magic value 16 times, those two accumulators will always be identical regardless of scheduling order.

The ONLY order-dependent part is `var_14`: the count of adjacent **transitions** (positions where `arr[i] != arr[i-1]`).

And that transition count determines whether we XOR with `0x1337beef` at the end.

### Working Out the Target Hash

We need the final hash to be `0xe903d23a`. We can compute what `var_c` (before the conditional XOR) will be for any valid 4-thread run: it's always `0xfa346cd5` (since all runs use the same 4 payload types, same 16 writes each).

So:
- If `var_14 <= 44`: final hash = `0xfa346cd5` ❌
- If `var_14 > 44`: final hash = `0xfa346cd5 ^ 0x1337beef = 0xe903d23a` ✓

We need **more than 44 transitions**. Now the question is: what scheduling pattern produces enough transitions?

### Scheduling Patterns and Transition Counts

With 4 threads and 4 distinct magic values, the write order depends entirely on how the scheduler interleaves threads. Two extreme cases:

**FCFS (First-Come-First-Served) / thread completes before switching:**
```
[P1, P1, P1, ...(16x), P2, P2, ...(16x), P3, P3, ...(16x), P4, P4, ...(16x)]
```
Transitions: only 3 (at positions 16, 32, 48). Way below 44. Hash = `0xfa346cd5` ❌

**Perfect round-robin (switch every write):**
```
[P1, P2, P3, P4, P1, P2, P3, P4, ...(repeating)]
```
Transitions: 63 (almost every position). 63 > 44. Hash = `0xe903d23a` ✓

The scheduler uses priority to decide who runs next. The function `sub_4f734a` picks the next thread: it looks for threads with status READY (0) or RUNNING (1), skips DONE (3), and among equal priorities it round-robins starting from `(current_thread + 1) % N`.

**The key:** if all 4 threads have the **same priority**, the scheduler perfectly round-robins between them. Combined with the timer firing every 10ms and the busy-wait being ~16ms per write, each context switch happens at approximately the 1-write boundary, giving us the interleaved pattern with 63 transitions.

That's DarkNinja's "mistake": when equal-priority threads interact with the timing of the busy-wait loop, the scheduler produces an interleaving pattern that was probably not the intended output, and that specific pattern is what produces the magic hash.

## Building the Exploit

There's no exploit script needed here: just the right input values. Once you understand the scheduling mechanics, it's just picking the correct parameters:

1. **4 threads**: to fill all 64 slots (4 threads × 16 writes = 64)
2. **All same priority**: forces true round-robin, hitting the >44 transitions threshold
3. **Unique burst times**: condition 2 rejects duplicates
4. **Burst large enough**: all 16 writes must complete before the burst timer kills the thread; 200+ is safe

```
4
1        <- payload X77
5        <- priority 5
200      <- burst 200

2        <- payload Y88
5        <- priority 5 (same!)
201      <- burst 201

3        <- payload Z99
5        <- priority 5 (same!)
202      <- burst 202

4        <- payload W66
5        <- priority 5 (same!)
203      <- burst 203
```

We confirmed this with a Python simulation of the hash before throwing it at the remote:

```python
# Simulate what the array looks like after round-robin scheduling
arr = []
for _ in range(16):
    arr += [0x13371337, 0xdeadbeef, 0xcafebabe, 0xbaadf00d]

# Run the hash
var_1c = 0x811c9dc5
var_18 = 0
var_14 = 0
for i in range(len(arr)):
    var_1c = (var_1c + arr[i]) & 0xffffffff
    var_18 = (var_18 ^ ((arr[i] >> 2) * 0x1000193)) & 0xffffffff
    if i > 0 and arr[i] != arr[i-1]:
        var_14 += 1

var_c = var_1c ^ var_18
if var_14 > 44:
    var_c ^= 0x1337beef

print(hex(var_c))  # 0xe903d23a: bingo
```

Once the simulation matched the target, it was just a matter of submitting.

## Running It

```
$ nc ctf.axiosiiitl.dev 1337
==================================================
      SEQURI QUEST: THE SCHEDULER VAULT           
==================================================
Welcome. You have access to the system task queue.
Submit your thread parameters to access the vault.
Max concurrent tasks: 4

> How many threads to spawn? (1-4): 4
> Select payload (1: X77, 2: Y88, 3: Z99, 4: W66): 1
> Priority (0 = Highest, 99 = Lowest): 5
> Burst Time Limit: 200
> Select payload (1: X77, 2: Y88, 3: Z99, 4: W66): 2
> Priority (0 = Highest, 99 = Lowest): 5
> Burst Time Limit: 201
> Select payload (1: X77, 2: Y88, 3: Z99, 4: W66): 3
> Priority (0 = Highest, 99 = Lowest): 5
> Burst Time Limit: 202
> Select payload (1: X77, 2: Y88, 3: Z99, 4: W66): 4
> Priority (0 = Highest, 99 = Lowest): 5
> Burst Time Limit: 203

[+] 0xHASH_MATCH: IIITL{pr10r1ty_b005t_4ct1v4t3d_52194357123987345}
```

The flag name itself is a cheeky nod to the solution: `pr10r1ty_b005t_4ct1v4t3d`: priority boost activated.

## Key Takeaways

**The core technique:** Hash functions that depend on the ordering of data (here, transition count) can be gated on specific execution patterns. When a scheduler controls ordering, you need to understand the scheduling algorithm to control the pattern.

**Commutativity analysis saves time:** When you see a hash function, check which parts are order-dependent and which aren't. Here, most of the hash was commutative: only the transition counter cared about order. That narrowed the problem massively.

**"Made mistakes" in CTF descriptions = the behavior is wrong by design.** The challenge author tells you something's off. In this case, equal-priority round-robin combined with specific busy-wait timing produces a very particular interleaving. The "mistake" is that a real scheduler might not behave this deterministically.

**Tools that helped:**
- Binary Ninja: decompiling a stripped, statically-linked binary is painful in IDA's free version; Binja handles it better
- GDB with hardware breakpoints at the validation function: confirming what values were in `data_717060` at check time
- Python simulation: always verify your hash math offline before burning remote attempts

**Gotcha:** The binary uses `swapcontext` for context switching: a POSIX function that's not commonly seen in CTF binaries. If you see it in a disassembly, you're looking at a coroutine or user-space threading implementation, and context switches happen at explicit yield points or signal handlers. That shapes how you reason about execution order.
