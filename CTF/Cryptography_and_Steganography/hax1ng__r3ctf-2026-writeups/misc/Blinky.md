# Blinky

**Category:** Misc (RTL / Hardware Security) | **Difficulty:** Medium | **Flag:** `r3ctf{s3cuR3-@n@LYZlNg-pERfOrmANC3-wOrKFLOWc06c}` *(local; server key is random per run)*

## TL;DR

A MIPS64r6 soft-core CPU uses Pointer Authentication (PAC) to guard kernel entry: you need a correctly-tagged pointer to JR into the kernel. The data-load path reuses the exact same PAC verification as the JR gate, so a tagged `ld` instruction is a tag-validity oracle. Setting `Status.EXL=1` via `mtc0` silences the fault rate-limiter, letting us brute-force all 256 possible tag bytes for free. Once we know the tag, one `jr` delivers us to the kernel flag routine.

## What We're Given

The challenge hands us the full SystemVerilog RTL of a custom MIPS64r6 SoC, a pre-built Verilator simulator (`SOC_run_sim`), and a Docker build environment. The pitch:

> A silicon startup ships a "secure by construction" soft-core. The flag routine is at a **fixed, publicly documented kernel address** (0x2030). They'll boot **whatever user-mode code you send them**. They believe the PAC system makes the address irrelevant. They shipped you the RTL. They think that's safe.

Our job is to submit a `memory.mem` user region (loaded at 0x0, must fit below 0x2000). The simulator boots, ERETs into our code at 0x0c, and if we can get the kernel at 0x2030 to run, it writes the flag to stdout.

The memory map:

```
0x0c            entry point (eret target: our code starts here)
0x00            user exception vector (we own this)
0x2030          kernel flag routine (the win condition)
0x20000010      stdout MMIO (write bytes here to print)
0x20000000      cycle counter MMIO (read for timing)
```

One catch: the server randomizes the PAC key on every run. A solution that works on our local copy is useless if it hardcodes the local key.

## Initial Recon

First we need to understand what PAC even is here.

Pointer Authentication is a technique originally from ARM (AArch64) where secret-key MACs are stored in the unused high bits of a pointer. Before doing a sensitive operation (like an indirect jump), hardware recomputes the expected MAC and faults if it doesn't match. The idea is that even if an attacker controls data memory, they can't forge a valid tagged pointer without knowing the key.

In this challenge, pointer layout is:

```
 63       56 55                                           0
+-----------+-----------------------------------------------+
|  PAC tag  |          kernel virtual address               |
+-----------+-----------------------------------------------+
      8 bits                  56 bits

jr_ptr = (tag << 56) | VA
```

The tag is computed as: `tag = PRF(VA, modifier=0, key)[7:0]`: where PRF is a 4-round keyed ARX (Add-Rotate-XOR) function defined in `rtl/modules/pac.sv`. The key lives in CP0 register 22, user code cannot read it, and there is no `PACGA` instruction or anything that would let us sign a pointer ourselves.

So we need the right 8-bit tag to jump to 0x2030. The tag is `PRF(0x2030, 0, secret_key) & 0xFF`. With a random key per run and 256 possible values, we need to figure out which byte is correct without just guessing.

There's also a **rate limiter**. One committed bad-tag fault (exception code 0x10) permanently locks the PAC gate. The core never answers again. So naive brute force: try all 256 values of the JR tag until one works: burns your single guess on the first wrong attempt and locks you out permanently.

At first this looked impossible. No oracle, no signing instruction, one shot. Then we read the RTL more carefully.

## The Vulnerability

### The Load Oracle

Reading `core_EX.sv`, we find a second PAC verification instance that nobody mentioned in the marketing materials:

```systemverilog
// A load whose address register carries a non-zero PAC tag in bits
// [63:64-TAG_BITS] is authenticated against pac_key (PRF over the
// stripped VA); it never dereferences the authenticated (kernel) VA.
//   * good tag -> load proceeds to the USER line PAC_PROBE_ADDR; no fault.
//   * bad tag  -> NO_LOAD (no cache access) + a deferred PAC fault (cp0 exc 0x10)
```

If we do `ld $t3, 0($ptr)` where `$ptr` has nonzero bits in the top 8 bits, the hardware treats it as a PAC-gated load. It authenticates those tag bits against the same key and modifier as the JR gate. If the tag is right:

- The load **redirects to PROBE_ADDR (0x1000)** and reads whatever is at that user-space address
- No fault

If the tag is wrong:

- The load becomes NO_LOAD: the destination register keeps its old value
- A deferred fault (exception 0x10) is queued

This is a perfect tag-validity oracle. We construct `ptr = (guess << 56) | 0x2030`, issue a load, and if the destination register comes back with whatever we put at 0x1000, the guess is the correct JR tag. The same PRF, same key, same modifier, so a tag that satisfies the load gate **will also satisfy the JR gate.**

### Beating the Rate Limiter: Setting EXL=1

We have an oracle, but using it naively means every wrong guess commits a fault. The first wrong guess would lock us out permanently (PAC_FAULT_LIMIT=1). We need all 255 bad-tag probes to be *silent*.

Here's the key. From `cp0.sv`:

```systemverilog
takenHandler = (takenInterrupt || takenException) && (!status_reg[1]);  // EXL = 0
committed_pac_fault = takenHandler && (next_exc_code == 5'h10);
```

The rate limiter only counts **committed** faults. A fault commits by going through `takenHandler`. And `takenHandler` is gated on `!EXL`: where EXL is bit 1 of the MIPS Status register.

`EXL` (Exception Level) is the MIPS "we are currently handling an exception" bit. When EXL=1, the CPU suppresses taking new synchronous exceptions (otherwise nested exceptions would trash your EPC). What we care about here is that with EXL=1, `takenHandler=0` always, so any bad-tag fault is silently dropped: never committed, never counted. The rate limiter never sees it.

And crucially: **user code can write EXL directly** via `mtc0`. The `cp0.sv` Status register write path has no `kernel_mode` guard:

```systemverilog
register #(32) user_status_reg (
    user_status,
    wr_data[31:0],
    clock,
    MTC0 && (regnum == STATUS_REGISTER) && (sel == 0),
    reset
);
```

No privilege check. User code can freely set `Status.EXL=1`. One instruction before the loop and every bad-tag probe is free.

### Why This Works (Putting It Together)

With EXL=1:
- We probe `ld $t3, 0((guess<<56)|0x2030)` for every guess from 1 to 255
- Right guess → `$t3 = *(0x1000)` = our sentinel value → we found the tag
- Wrong guess → `$t3` is unchanged (NO_LOAD), no fault committed, no lock
- After finding the tag, we set up the real authenticated JR pointer and jump
- The JR gate sees a valid tag → `pac_gate_ok=1` → `true_kernel` is raised → we're in the kernel → flag prints

### The Intended Path (Spectre-Style, Not Needed)

The challenge RTL also plants a different, more complex escape route. There's a `drain_load` mechanism: if a load is on the wrong path of a mispredicted branch, it gets drained through the pipeline as "speculative" (`EX_regs.spec=1`). A speculative instruction's fault is squashed and it never architecturally commits. But here's the thing: for a *good* tag, the cache access still happens. The data cache line at PROBE_ADDR (0x1000) gets warmed.

This means you could use cache timing as a side channel:
- Put the probe load on a mispredicted branch path
- Good tag warms cache → load takes 2 cycles next time
- Bad tag → NO_LOAD, cache cold → load takes 5 cycles
- Read the cycle counter MMIO at 0x20000000 to distinguish hit (2 cycles) vs miss (5 cycles)

We confirmed this works (miss=5 vs hit=2 cycles in the Verilator sim). But it requires a working BTB/BHT misprediction gadget, careful cache eviction between guesses, and dealing with MIPS64r6's compact-branch forbidden-slot semantics making the timing loop fiddly. The EXL architectural oracle is simpler, fully validated, and we used it instead.

## Building the Exploit

Here's the full exploit as MIPS64r6 assembly. It's short enough to go inline:

```asm
    .set noreorder
    .section .boot, "ax"
    .balign 4
    .org 0x0
_uexc:
    j    _uexc                     # 0x00: user exception vector (spin if anything
    nop                            #       unexpected fires -- shouldn't happen)
    .org 0x0c
__start:                           # 0x0c: eret target, we start here
    li     $t9, 0x20000010         # stdout MMIO (not used here, but handy)
    li     $t0, 0x2                # Status.EXL = 1 (bit 1)
    mtc0   $t0, $12                # write Status register -- suppresses fault commits
    ehb                            # execution hazard barrier (CP0 write takes effect)
    dli    $s1, 0xcafebabe0000abcd # our sentinel value (matches the .dword below)
    dli    $s2, 0x2030             # kernel VA we want to authenticate
    li     $s0, 1                  # tag guess starts at 1

loop:
    dsll   $t2, $s0, 56            # ptr = (guess << 56) | 0x2030
    or     $t2, $t2, $s2
    ld     $t3, 0($t2)             # PAC-gated load oracle
    nop                            # pipeline drain -- let the load settle
    nop
    nop
    beq    $t3, $s1, found         # sentinel came back? that's our tag
    nop
    daddiu $s0, $s0, 1             # guess++
    sltiu  $t8, $s0, 256           # while guess < 256
    bnez   $t8, loop
    nop
    move   $s0, $zero              # nothing matched 1-255 => tag must be 0

found:
    dsll   $t2, $s0, 56            # forge the authenticated pointer
    or     $t2, $t2, $s2
    jr     $t2                     # jump to (tag<<56)|0x2030 -- PAC gate passes
    nop
h:
    j    h                         # never reached (kernel handles exit)
    nop

    .balign 8
    .org 0x1000                    # PROBE_ADDR -- what a good-tag load reads
    .dword 0xcafebabe0000abcd      # static sentinel, pre-loaded before our code runs
```

**Step by step:**

1. `mtc0 $t0, $12` with bit 1 set writes EXL=1 into the Status register. The `ehb` (Execution Hazard Barrier) ensures the CP0 write is visible before the next instruction uses it: without this, the processor might execute a few instructions before the write takes effect.

2. We pre-load a sentinel value into `$s1`. This needs to exactly match the `.dword` sitting at 0x1000 in our image. One gotcha here: we tried a runtime `sd` to 0x1000 followed by an immediate `ld` to verify, but got stale data: there's a store→load ordering hazard on this core (store buffer not forwarded on a cache miss). The fix is to put the sentinel in the binary as **static data** using `.org 0x1000; .dword ...`. It's memory-resident from reset, no store needed.

3. The loop builds `ptr = (guess << 56) | 0x2030`. The `dsll` (doubleword shift-left logical) shifts our guess byte up to the tag position. We load from this address: the PAC hardware authenticates the tag, and if it's right, redirects the load to PROBE_ADDR and puts `*(0x1000)` = `0xcafebabe0000abcd` into `$t3`. If the tag is wrong, `$t3` is unchanged (still whatever garbage it had from before the loop, definitely not `0xcafebabe`).

4. The `nop` trio after the load is a pipeline drain. In MIPS, load results aren't immediately available to the next instruction (load-use hazard). Three NOPs is conservative but correct: we just need the result to be stable before the `beq`.

5. A quick note on register naming: the N64 ABI (which mips64el toolchains use by default) doesn't have `$t4`-`$t7`. Those registers are `$a4`-`$a7` in N64. If you try to use `$t4` in the assembler, it'll error with "invalid operand." Stick to `$t0`-`$t3`, `$t8`, `$t9`, and `$s0`-`$s7`.

6. After finding the tag (or falling through to tag=0 as an edge case), we construct the final authenticated pointer and `jr` to it. The JR gate in `core_branch.sv` sees `pac_cross=1` (user-mode, kernel-region target), calls `pac_verify`, gets `pac_gate_ok=1`, and signals `cp0.sv` to raise `true_kernel`. The kernel code at 0x2030 runs with privilege, copies the flag from 0x20f8 to stdout, and exits.

**Building it:**

```sh
docker build -t blinky-build .
docker run --rm -v "$PWD:/work" blinky-build exploit.s
# -> exploit.bin, exploit.mem
```

**Testing locally:**

```sh
./run_local.sh exploit.mem
# local key is fixed (0x0123456789abcdef), tag=0xe5, should print r3ctf{s3cuR3-@n@LYZlNg-pERfOrmANC3-wOrKFLOWc06c}
```

**Submitting:**

```sh
curl --data-binary @exploit.mem http://HOST:PORT/submit
```

The server has a different random key per run, so the exploit recovers the real tag live before jumping.

## Running It

Local run with the example kernel (fixed key 0x0123456789abcdef, correct tag is 0xe5):

```
$ ./run_local.sh exploit.mem
r3ctf{s3cuR3-@n@LYZlNg-pERfOrmANC3-wOrKFLOWc06c}
```

The exploit probes tags 1 through 228 (0xe4), gets NO_LOAD for each, then hits tag=0xe5 which returns the sentinel, then jumps into the kernel. Against the server the loop still runs but lands on whatever 8-bit value PRF(0x2030, 0, random_key) produces, and prints the real flag.

We validated this against 6 additional patched keys (expected tags 0xaf, 0x4b, 0x8b, 0x04, 0xeb, 0xbe) plus a tag=0 edge case. All recovered the flag correctly.

## Key Takeaways

**The oracle problem.** Whenever a hardware security mechanism reuses a verification operation for a secondary purpose, that secondary operation is an oracle: even if the "signing" instruction is absent. Here, the PAC-gated load uses the exact same PRF call as the JR gate. The designers protected the JR path but gave away its key validity check for free through the load path.

**EXL as a rate-limiter bypass.** Hardware fault rate-limiters only count *committed* faults. A fault commits through the normal synchronous-exception machinery, which in MIPS is gated on `!EXL`. If you can set EXL=1 before the faulting operation, the fault is silently swallowed. The critical question is always: "who guards the write to EXL?" In this core, nobody does. One `mtc0` from user mode turns 255 destructive probes into 255 silent no-ops.

**`true_kernel` vs Status.KSU.** The challenge's real privilege bit is `true_kernel` in CP0: a custom register that only gets set by a verified PAC gate. It deliberately does NOT use `Status.KSU`, because KSU is writable from user mode via the same unguarded `mtc0` path. This is actually correct design: the designers knew EXL/KSU were reachable and built a separate privilege layer. They just didn't notice the load oracle.

**Static data beats runtime stores for probes.** If your side channel or oracle reads from a fixed address, pre-initialize that address as static data in your binary. A runtime `sd` → immediate `ld` can return stale data on simple in-order cores due to store-buffer ordering, especially on a cache miss.

**Spectre is the hard path.** The intended solution probably involved the speculative drain mechanism: getting the load on a mispredicted-branch wrong path so its fault is squashed but its cache access survives. That's a valid approach (confirmed 5-vs-2 cycle timing channel) but requires a stable misprediction gadget and careful cache management. When an architectural bypass exists, take it.
