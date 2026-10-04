# pewpew: R3CTF 2026 (pwn) Writeup

> *"The spaceship is making noises again. Management says this is normal. Engineering says not to press the red buttons. The flight computer says everything is perfectly calibrated. Have fun."*

**Category:** pwn (Windows binary exploitation)
**Target:** `nc pewpew.ctf2026.r3kapig.com 4444`: a service running on **Windows Server 2025**
**Goal:** read `flag.txt` off the remote box and get it back to us over the socket
**Rule:** must be reliable in **fewer than 10 tries**: no brute force

**Flag:** `r3ctf{e5537f8a-78e4-9f29-714c-fba0fa9774e6}`

---

## The 30-second version (for the layman)

The server is a little "spaceship control" text menu. It has a bug: it hands out a menu option that lets you keep poking at a chunk of memory *after* that memory has already been thrown away and reused for something else (a classic **use-after-free**). By carefully controlling what that reused memory contains, we can trick the program into treating attacker-supplied data as a **list of function pointers**, and eventually hand us the ability to run whatever code we want.

The hard part wasn't getting code execution. It was answering a dumb-sounding question: **"where is flag.txt, exactly?"** The program runs from a randomly-named temporary folder that changes every single time you connect, and the flag lives next to it. So we had to make the exploit **ask Windows where it's currently running, find the flag, read it, and hand it back: all in a single connection.** That's the fun part below.

---

## Setting the scene

You connect and get three gates before the actual menu:

1. **`team token>`**: paste your team token.
2. **Proof of Work**: the server prints `sha256(input) starts with <7 hex digits>` and you have to find *any* string whose SHA-256 hash starts with those 7 hex digits (28 bits of work). That's ~268 million hashes on average: a few seconds across 48 CPU cores. The candidate strings the reference solver uses look like `<number>_pewpow`.
3. **The menu**: a "flight computer" with options to allocate "scouts" and "pilots", "maneuver the ship", view/reload/eject scouts, etc.

I was working from a Windows box where WSL2 wouldn't start (virtualization disabled), so I couldn't use the usual Linux `pwntools` setup. Everything here is **plain native-Windows Python**: a hand-rolled socket wrapper, and the PoW reimplemented with `hashlib` + `multiprocessing`.

### The objects in play

Two kinds of heap objects, both 0x50 (80) bytes:

- **Pilot**: a proper object. Its first 8 bytes are a **vtable pointer** (a pointer to a table of function pointers). This is the important part.
- **Scout**: a raw buffer you fill with your own hex bytes. Crucially, allocating a scout **does not zero the memory first**, so a fresh scout can still contain whatever the *previous* occupant left behind.

### The bug: use-after-free

The "launch pilot" maneuver does this:

- **frees** the pilot's memory, but
- **keeps the pointer to it** (a dangling pointer), and
- lets you keep operating on it through the "circuit" maneuvers: with no check that the pilot is still valid.

So the plan writes itself:

1. Spray a few hundred empty scouts to groom the heap allocator (Windows' **Low-Fragmentation Heap** hands out 0x50 chunks in a randomized order, which is exactly why the challenge demands "reliable in <10 tries" instead of "every time").
2. Allocate a pilot, then **launch (free) it**.
3. Allocate one empty scout. Roughly 1 in 3 times, the allocator reuses the *just-freed pilot's* memory for our scout.
4. **View** that scout. Because view leaks the raw bytes and the memory still holds the freed pilot's contents, we get:
   - the pilot's vtable pointer → reveals the **program's base address** (defeats ASLR for the EXE),
   - a pointer the pilot stored to itself → reveals the **heap address** of our object.

Now we control an object that the program still believes is a valid pilot with a valid vtable. Whatever we write as the "vtable" gets treated as a list of function pointers, and the "circuit" maneuvers will happily **call** through it.

### The building blocks hidden in the binary

The program contains a few small helper functions that become superpowers once we can point the vtable at them:

| Nickname | What it does |
|---|---|
| **tap-scan** | reads memory at a cursor and prints it → **arbitrary read** (this is our leak engine) |
| **readline** | reads bytes from the socket straight into our object → **arbitrary write of attacker bytes** |
| **WriteFile-wrapper** | writes a buffer to the program's stdout → and here's the kicker: **the program's stdout IS the socket** |

That last one matters a *lot*: it means if we can get the flag into a buffer and call the WriteFile-wrapper, the flag comes straight back to us. No tricks with child processes needed.

Using tap-scan on the program's import table, we also leak the base addresses of **`ntdll.dll`** and **`kernel32.dll`** (these are the same for every connection until the machine reboots). That gives us the addresses of every Windows API function and every ROP gadget we could want.

---

## Getting real code execution

Reading and writing memory is nice, but to read a *file* we need to actually **call functions with arguments we choose**. On x64 Windows the first four arguments go in the registers `rcx, rdx, r8, r9`, and we don't control those just by calling through the vtable.

The trick: Windows has a function called **`NtContinue`**, whose entire job is "here is a snapshot of every CPU register: load all of them and jump." It's meant for the OS to resume a thread after handling an exception. For us, it's a gift: we use our arbitrary-write (readline) to lay down a fake register snapshot (a `CONTEXT` structure) in our object, then call `NtContinue` on it. It loads **every register we specified**: including a fresh stack pointer, and jumps wherever we say.

We point that fresh stack pointer at a **ROP chain**: a list of tiny instruction snippets ("gadgets") ending in `ret`, borrowed from `ntdll`, that we string together to set up and make one function call after another. Think of it as a to-do list the CPU walks down, where each item is "load this value into that register" or "now call this function."

I verified the mechanism worked by reproducing a known-good test (call the WriteFile-wrapper to dump a chunk of the import table back to myself) before building anything complicated.

### The dead end: spawning a shell

The obvious move is `WinExec("cmd /c type flag.txt")`. I tried it. **It returns nothing.** Two reasons conspire:

- `WinExec` is **asynchronous**: it launches the child and returns immediately, so the parent instantly crashes on the garbage return address, closing the socket *before* `cmd` can print anything. I patched that with an infinite-loop "keep the parent alive" gadget…
- …and it *still* returned nothing, because the child `cmd` process **doesn't inherit our socket** as its output. So even a perfect `type flag.txt` writes into the void.

So spawning a process was out. We had to read the file **ourselves**, inside the pewpew process, and hand it back through pewpew's own socket (the WriteFile-wrapper).

---

## The real problem: *where is flag.txt?*

To open a file with the low-level `NtOpenFile`, you need the **full NT path**. So, what's the current directory?

First surprise: the normal way to ask, `GetCurrentDirectoryA`, **crashes** through our ROP pivot. (It's a heavy Win32 API with a deep internal call tree; something in there doesn't like being called from our improvised stack.) But the lightweight **syscall stubs** in `ntdll`: the thin functions that just drop into the kernel: work perfectly. So the rule became: *stick to `Nt*` syscall functions.*

I used one of them, `NtQueryInformationProcess`, to ask Windows for the program's own image path. Out came:

```
\Device\HarddiskVolume4\Users\PEWPEW~1\AppData\Local\Temp\1\pewpew_njcb15rh\pewpew_ce525f9b90f8564d.exe
```

Second surprise: the program runs from a **temporary extraction folder**: some launcher unpacks it into `...\Temp\1\pewpew_XXXXXXXX\` and runs it there. And that random `XXXXXXXX` part **changes on every connection** (I saw `xcogx6ru`, then `njcb15rh`). The flag lives in that folder, but you can't hardcode the path, because next connection it's different.

That kills any "leak the path on connection 1, use it on connection 2" plan. Everything: **find the folder, open the flag, read it, send it: has to happen in one single connection.**

### Walking Windows' own bookkeeping to find the folder

Every Windows process has an internal structure chain that knows its current directory:

```
PEB  →  ProcessParameters  →  CurrentDirectory  →  { the path string, and a HANDLE to that directory }
```

That last item is the key: an already-open **handle to the current directory**. If I can grab it, I don't need the path string at all: I can just ask to open `"flag.txt"` *relative to that directory handle*. No string surgery, no guessing.

The catch is that walking this chain means **following pointers**, and my ROP gadgets can copy a value from memory into the *next function call's argument slot* only 8 bytes at a time. So I built a little "dereference" primitive out of `NtReadVirtualMemory` (which reads the process's own memory into a buffer): each step reads one pointer and drops it exactly into the slot the next step will pick up. Chained together:

1. Ask for the **PEB** address (`NtQueryInformationProcess`).
2. Deref **PEB → ProcessParameters**.
3. Deref **ProcessParameters → CurrentDirectory handle**.
4. Copy that handle straight into an `OBJECT_ATTRIBUTES.RootDirectory` field.
5. **`NtOpenFile("flag.txt")`** relative to the directory handle → get a handle to the flag file.
6. **`NtReadFile`** it into a buffer.
7. **WriteFile-wrapper** dumps that buffer to the socket. 🎉

All of that is a single ROP chain: roughly nine chained calls: laid into the object by the readline primitive and kicked off by `NtContinue`. A couple of engineering notes that mattered:

- **Payload size:** the readline write happens on the heap, and if you write past the committed region the whole thing faults. I probed empirically and found ~0x800 bytes is safe: plenty for the chain.
- **Bad bytes:** readline stops at newline characters, so any address in the payload containing `0x0a` or `0x0d` ruins the attempt. Fixed addresses (ntdll gadgets) are clean; the per-connection heap/EXE addresses occasionally aren't, so we just reconnect and try again.
- **Passing the file handle:** `NtOpenFile` writes the new handle into a memory location you give it. I pointed that location *at the exact stack slot the next gadget pops into the register*, so the freshly-opened handle flows straight into `NtReadFile`'s first argument with zero extra work.

### Result

```
=== try 3 len=512 ===
b'r3ctf{e5537f8a-78e4-9f29-714c-fba0fa9774e6}\r\n\x00\x00...'
[+++] FLAG
```

Third try: comfortably inside the 10-try budget. The only randomness left is the ~1-in-3 heap-reuse and the occasional bad-byte reconnect.

---

## Why it's reliable in <10 tries

Two independent dice rolls per connection:

- **Heap reuse (~1/3):** the freed pilot must be handed back to our next scout. Grooming with ~400 sprayed scouts pushes this to about one in three.
- **Clean payload (~most of the time):** no `0x0a`/`0x0d` in the per-connection addresses.

Multiply those and you're landing the flag every few connections: no brute force, exactly as required.

---

## TL;DR chain

```
UAF (launch pilot, reuse chunk with empty scout)
  → leak EXE base + heap addr (view residual pilot)
  → firmware "tap-scan" arbitrary read → leak ntdll + kernel32 bases
  → "readline" arbitrary write lays down a fake CONTEXT + ROP chain
  → NtContinue loads registers + pivots stack into the ROP chain:
       NtQueryInformationProcess  → PEB
       NtReadVirtualMemory  ×3     → PEB → Params → CurrentDirectory HANDLE
       (handle written into OBJECT_ATTRIBUTES.RootDirectory)
       NtOpenFile("flag.txt", relative to that handle)
       NtReadFile
       WriteFile-wrapper  → flag out through pewpew's own socket
```

**Flag:** `r3ctf{e5537f8a-78e4-9f29-714c-fba0fa9774e6}`

*Key insight of the whole challenge: don't spawn a shell (the child won't inherit the socket): read the file yourself, and since the process runs from a randomized temp folder, grab the current-directory **handle** out of the PEB and open the flag relative to it, all in one shot.*
