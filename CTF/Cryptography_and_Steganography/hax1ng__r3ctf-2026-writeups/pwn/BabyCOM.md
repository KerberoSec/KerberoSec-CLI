# BabyCOM: R3CTF 2026 Writeup

**Category:** Windows / pwn (COM service exploitation)
**Flag:** `r3ctf{intended-flag-extraction-without-code-exec}`

---

## TL;DR

A Windows service running as **SYSTEM** (the all‑powerful account) hands out the contents of a
config file to anyone who asks: including a lowly `hacker` user: if you give it the "wrong version
number". The catch: the config file is boring (`1.0.0`), and the *real* prize (the flag) lives on a
raw disk that only SYSTEM can read.

The intended trick is **not** to plant a symlink (you can't: the folder is locked) and **not** to
pop a full SYSTEM shell with ROP. Instead you abuse a tiny **timing bug** (a "race condition") between
two of the service's functions to trick it into doing a single **out‑of‑bounds memory write**. You use
that one write to reach into the service's own memory and change the string
`C:\ProgramData\Vault\Version.txt` into `\\.\PhysicalDrive1`. Now when you ask for the "version", the
SYSTEM service dutifully reads the flag disk for you and hands the flag back. The flag name literally
says it: *intended‑flag‑extraction‑without‑code‑exec*.

---

## 1. The setup: what are we even attacking?

We're given a handful of files:

- `vaultsvc.exe`: a Windows **service** (runs in the background as `LocalSystem`).
- `vaultsvc_ps.dll`: a "proxy/stub" DLL, the plumbing that lets other programs call the service.
- `vaultsvc.idl` / `.tlb`: the **contract**: the list of functions the service exposes.
- `babycom.qcow2`: a full disk image of the target machine (for offline poking).

The service speaks **COM** (Component Object Model): think of it as Windows' way of letting one
program call functions inside another program, even across security boundaries. The contract
(`IVaultService`) offers a session‑based "vault" for storing data, with functions like:

| Function | What it does |
|---|---|
| `OpenSession` / `CloseSession` | start/stop a session |
| `StoreEntry` / `RetrieveEntry` | save/load a named value |
| `StageVault` → `AppendVaultData` → `ResizeVault` → `CommitVault` | build up a binary "vault" blob step by step |
| `QueryVaultInfo` | ask for metadata about a vault |

Every single function also takes a `requesterVersion` string and can return a `pServiceVersion`
string. That "version handshake" turns out to be the whole ballgame.

**Where's the flag?** The challenge tells us: `\\.\PhysicalDrive1`: a **raw second hard disk**, with
the flag sitting at the very first sector. Raw disks like this can only be read by Administrators or
SYSTEM. A normal user (our `hacker` account) gets "Access Denied" if they try to read it directly. So
we need to get **SYSTEM to read it for us**.

---

## 2. The "version handshake" is a data leak

Reversing `vaultsvc.exe` (with Python's `capstone` disassembler), one helper function
(`fcn.140001a70`) shows up at the start of *every* method. In plain English it does:

1. Open `C:\ProgramData\Vault\Version.txt` **as SYSTEM**.
2. Read its contents (normally the text `1.0.0`).
3. Compare it against the `requesterVersion` you sent.
   - **Match** → "ok, carry on."
   - **Mismatch (or you sent nothing)** → return the file's contents back to you as `pServiceVersion`,
     with error code `0x8007051A` ("revision mismatch").

Read that again: **on a version mismatch, the SYSTEM service hands you the contents of a file it read
as SYSTEM.** That's an information‑disclosure bug. Normally it just leaks `1.0.0`: useless. But there's
a striking detail: the file‑reading code has a special **fallback path** that only makes sense for
reading **raw disk devices** (it re‑reads using a page‑aligned buffer, which is exactly what Windows
requires for `\\.\PhysicalDrive1`). The author *built in* the ability to read a raw device here. That's
a giant neon sign: **the intended attack makes `Version.txt` point at the flag disk.**

So the plan writes itself:
> Make the service open `\\.\PhysicalDrive1` instead of `Version.txt`, then trigger a version mismatch → SYSTEM reads the flag disk → hands us the flag.

---

## 3. The obvious path, and why it's a dead end

The classic Windows move is a **symlink**: replace `Version.txt` with a link that points at
`\\.\PhysicalDrive1`. But:

- Creating a file symlink needs a special privilege (`SeCreateSymbolicLinkPrivilege`) that our `hacker`
  user **doesn't have**.
- The folder `C:\ProgramData\Vault` is **locked down** to SYSTEM + Administrators only (verified by
  reading the disk image's NTFS permissions offline with the `dissect` toolkit, and again live on the
  box). `hacker` can't create, delete, rename, or even list files in it.
- The junction/`\RPC Control` trick (the usual way around the privilege requirement) needs a folder in
  the path that we control, and every folder here is locked.

We confirmed all of this **on the real remote box** as `hacker`:

```
whoami /priv   ->  only SeChangeNotifyPrivilege, SeIncreaseWorkingSetPrivilege  (basically nothing)
icacls C:\ProgramData\Vault  ->  Access is denied
open \\.\PhysicalDrive1      ->  Access is denied
```

So the "easy" symlink solution is **impossible** for the intended player. The locked folder isn't an
accident: it's there specifically to force you toward the real bug. (This is exactly the kind of wrong
assumption that's worth throwing out early: the earlier notes on this challenge assumed you needed
Admin to plant a symlink; the truth is you're *not supposed to* plant a symlink at all.)

---

## 4. The real bug: a race condition in the "vault" functions

Time to look at the vault‑building functions. They track sizes **by hand across multiple calls**,
which is a classic breeding ground for bugs. The vault lives in a global table; each slot has:

- a **declaredLen** (the promised size, set by `StageVault`, changeable by `ResizeVault`)
- a **currentOffset** (how much data you've appended)
- a **data buffer**

`CommitVault` is where it goes wrong. Simplified, it does this **in order**:

```
1. read declaredLen; if declaredLen > 128  ->  reject          (the safety check)
2. open + write a temp "stage" file on disk                    (SLOW: disk I/O)
3. memcpy(declaredLen bytes) into a 264-byte buffer on the stack (the copy)
4. ... only NOW does it grab the lock ...
```

Two problems jump out:

1. **The safety check (step 1) and the copy (step 3) are far apart**, with slow disk I/O in between.
2. The lock that's *supposed* to make this safe is only taken at **step 4: after the dangerous copy.**

And its sibling `ResizeVault`? It changes `declaredLen` (allowing values up to `0x1000`) and takes
**no lock at all.**

That's a textbook **TOCTOU race** (Time‑Of‑Check to Time‑Of‑Use):

- **Thread A** calls `CommitVault`. It reads `declaredLen = 1` (tiny, passes the check), then gets
  stuck for a moment writing the stage file to disk.
- **Thread B** calls `ResizeVault` and sets `declaredLen = 0x100` **during that gap**.
- **Thread A** wakes up and does `memcpy(0x100 bytes)` into a **264‑byte buffer** → **overflow**, and
  the bytes it copies are ones we chose earlier via `AppendVaultData`. We control the overflow.

---

## 5. From "overflow" to "one clean write" (no ROP needed)

A stack overflow normally means fighting the **stack cookie** (a canary that detects tampering and
crashes the program). But we don't have to. Looking closely at the stack layout:

- The buffer starts at `rsp+0x50`.
- At offset **0x80** into that buffer sits a **pointer** (`[rbp-0x30]`) that `CommitVault` uses a moment
  later as the **destination of a second `memcpy`**, and that second copy happens **before** the
  cookie is ever checked.
- The stack cookie is way further up (offset `0x320`).

So if we overflow with `declaredLen = 0x100` (which reaches offset `0x80` but stops well short of
`0x320`), we:

- **overwrite that destination pointer** with any address we like, and
- **never touch the cookie** → the program doesn't crash.

Then `CommitVault` happily does `memcpy(our_chosen_address, our_chosen_data, up to 128 bytes)`.
That's a clean **write‑what‑where** primitive. No ROP, no shellcode.

**What do we write, and where?** Remember the neon sign from step 2. The service stores the string
`C:\ProgramData\Vault\Version.txt` in its own writable memory (at `base + 0x26000`). We overwrite it
with `\\.\PhysicalDrive1`. From that moment on, the "version file" *is the flag disk.*

Two small details to make it reliable:

- **ASLR (address randomization):** we need the service's base address. `QueryVaultInfo` has a
  *separate* minor bug: it copies more bytes out than it fills in, leaking leftover stack memory. One
  of those leaked values is a code pointer, so `base = leaked_value − 0x2610`. Confirmed live: base =
  `0x7FF7DC6B0000`.
- **A tiny XOR "encryption":** the second `memcpy` runs our data through a 1‑byte XOR whose key comes
  from a time‑seeded random generator (`key = ((seconds*0x343fd + 0x269ec3) >> 16) & 0xFF`). It's the
  same for every call within the same second, and `CommitVault` conveniently *returns* XOR'd data too, so we just commit a known byte, see what comes back, and recover the key. Then we pre‑XOR our device
  path so it lands correctly. (Recomputing the key every attempt means a won race *always* writes the
  right bytes, so a mis‑timed attempt can never corrupt the string and brick the service.)

---

## 6. Putting it together

The exploit (written in C#, driven over SSH as `hacker`) does:

1. **Leak** the module base via `QueryVaultInfo`.
2. Loop:
   1. **Recover the current XOR key** (commit a known byte, read it back).
   2. **Craft the payload**: `[0x00..0x80]` = `"\\.\PhysicalDrive1"` (UTF‑16) XOR key; `[0x80..0x88]` =
      the address of the path string (`base + 0x26000`).
   3. `StageVault(len=1)` + `AppendVaultData(payload)`.
   4. Fire up several background threads spamming `ResizeVault(slot, 0x100)`.
   5. Call `CommitVault`, and hope a `ResizeVault` lands in the gap.
   6. **Test the leak**: `OpenSession("WRONGVER")` → if the reply contains `r3ctf{...}`, we win.

The race is easy to win because of that slow disk write in the middle. In practice it landed on the
**very first iteration**:

```
[+] leaked module base = 0x7FF7DC6B0000
[+] path string addr   = 0x7FF7DC6D6000
[+][+][+] FLAG @ iter 0 key=0xC0 : r3ctf{intended-flag-extraction-without-code-exec}
```

---

## 7. The flag

```
r3ctf{intended-flag-extraction-without-code-exec}
```

The name is the author confirming our approach: the intended solution extracts the flag **without
code execution**: no ROP, no shellcode, no SYSTEM shell. Just one surgical out‑of‑bounds write that
turns the service's own "read a config file" feature into "read the secret disk for me."

---

## 8. Lessons / why each defense failed

| Defense | Why it didn't save them |
|---|---|
| Folder locked to SYSTEM+Admins | Stopped the *symlink* solve, but pushed players to the real memory‑corruption bug. |
| Stack cookie | Bypassed entirely: the useful write happens *before* the cookie check. |
| ASLR | Defeated by the `QueryVaultInfo` info‑leak. |
| "It's only a 128‑byte value copy" | The `declaredLen` used for the copy can be changed by another thread *after* it's validated. |
| Lock around the vault table | Taken *after* the dangerous check‑and‑copy, so it protected nothing that mattered. |

**Root cause in one sentence:** a check‑then‑use race (`CommitVault` validates a size, does slow I/O,
then copies: all before locking; `ResizeVault` changes that size with no lock at all), turning a
size‑validated copy into an attacker‑controlled arbitrary write.

---

## Appendix: tools used

- **capstone** + **pefile** (Python): static disassembly of `vaultsvc.exe` / `vaultsvc_ps.dll`.
- **dissect** (Python, pure‑software): read the `babycom.qcow2` disk image *offline* (NTFS ACLs, SAM/
  SECURITY registry hives, file contents) without booting the VM, since this workstation had hardware
  virtualization disabled.
- **paramiko** (Python): scripted the SSH session to the remote box.
- **C# via PowerShell `Add-Type`**: the multi‑threaded COM race exploit (`exploit/exploit_race.cs`).
