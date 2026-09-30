# Escape CET Writeup

**CTF:** R3CTF 2026  
**Category:** Pwn  
**Challenge:** Escape CET  
**Flag:** `r3ctf{coNGRaTS_YoU-hElp3D_cR@Zym4N-P4SS_c3T_WlTH-sHAD0W_Stack_and_ibt🎉0}`

## Short version

This challenge is a pwn challenge about Intel CET, especially shadow stacks. The binary gives us three weird menu options:

- **Ring**: one 4-byte write into libc memory.
- **Slab**: a controlled `mmap` area where we can write a big payload.
- **Bridge**: an indirect function call, but guarded by a nasty integrity checker and CET/SDE.

At first I tried treating the target like a normal CET bypass: fake context, `setcontext`, shadow-stack tricks, etc. Locally some ideas looked promising, but the remote was running under Intel SDE, which changed the rules. The final exploit abuses a glibc locale/gconv path to get a controlled write into the thread-local storage area, sets the CET feature bits, reaches `setcontext`, disables shadow-stack enforcement with `arch_prctl`, and then uses SROP to make raw syscalls.

After getting arbitrary file read, `/flag` was not directly plaintext. It was an encrypted wrapper saying the flag had been hacked by `t1d`. The important trick was that `/home/ctf/key` changes while being sent because the challenge server censors the exact key into `*` characters. Reading the key normally gives `********************************`, but leaking it byte-by-byte with newlines avoids the censor. Then the encrypted `/flag` decrypts cleanly with AES-256-CBC, zero IV.

## The files

The attachment had:

```text
pwn
libc.so.6
ld-linux-x86-64.so.2
```

The binary had all the annoying protections:

- PIE
- Full RELRO
- Canary
- NX
- CET properties: IBT + SHSTK
- Seccomp filter

The challenge prompt hints at the three primitives:

> A ring that cuts one truth into stone,  
> A slab that remembers every mark,  
> A bridge that answers only when crossed.

Those are not just flavor. They map directly to the three menu options.

## Understanding the menu

### 1. The Ring

The ring lets us write a 32-bit value to an address inside libc's writable range.

In simple terms:

```c
*(uint32_t *)addr = value;
```

But only if `addr` is in a certain libc data/BSS window. Also, the ring is single-use. After we use it once, it is considered spent.

This write also unlocks the bridge.

### 2. The Slab

The slab is a controlled memory area. The program maps a chunk of memory near libc and prints its address.

The leak is very useful because the relationship between slab and libc is fixed:

```python
libc = slab + 0x10000000 + span + 0xa000
```

So the slab leak gives us libc base too.

The slab is where we put fake objects, fake contexts, strings like `/flag`, SROP frames, and other data.

### 3. The Bridge

The bridge does the dangerous indirect call. Before it calls our function pointer, it runs a big checker. The checker verifies things like:

- stdio vtables
- `_IO_list_all`
- exit handler area
- TCB self pointer

So many classic libc attacks are killed before they start.

The bridge then eventually calls a function pointer we can set once. After that, the pointer is locked.

## First wrong path: native CET assumptions

At first, I thought the intended solution was to use native CET behavior and jump through glibc's `setcontext` shadow-stack path.

The idea was:

1. Put a fake `ucontext_t` in the slab.
2. Use a libc gadget to call into `setcontext`.
3. Let `setcontext` load registers from the fake context.
4. Use `openat2` and `splice`/`read`/`write` to print the flag.

This works in a native-CET-like setup if glibc's CET feature bit is set correctly. But on the real remote this was not enough.

The remote printed SDE messages, meaning it was running under Intel Software Development Emulator. Under SDE, glibc's CET bookkeeping did not look like native hardware CET. In particular, the useful `setcontext` path was not naturally enabled.

So the assumption “just use native CET setcontext behavior” was wrong for remote.

## Second wrong path: normal file read gives a fake key

Once arbitrary syscalls worked, I read `/flag` and got this:

```text
your flag has been hacked by t1d！

encrypted flag (base64):
...

encryptor: /home/ctf/encryptor
key: /home/ctf/key
```

Then I read `/home/ctf/key` and got:

```text
********************************
```

That looked like the AES key, so I tried decrypting the flag with 32 literal `*` bytes.

It failed.

That was another bad assumption. The stars were not the real key; they were the result of output filtering/censoring.

## The actual pwn idea

The remote target used SDE and shadow-stack checks, so the goal became:

> Get enough control to call `arch_prctl(ARCH_CET_DISABLE, 2)`, then use SROP for normal syscalls.

The hard part is reaching that point while CET is still active.

The solution abuses a libc path involving locale/gconv and obstack behavior. The rough idea:

1. Use the **ring** write to redirect a libc locale pointer to fake locale data in the slab.
2. Use the **slab** to hold fake locale/gconv/obstack structures.
3. Trigger the path by making the bridge call `getwchar`.
4. The fake structures cause libc code to copy controlled data into thread-local storage.
5. This sets the needed CET-related fields.
6. Then execution reaches `setcontext` with a controlled fake context.
7. The fake context calls `arch_prctl(ARCH_CET_DISABLE, 2)`.
8. After CET is disabled, use SROP frames to do normal syscalls.

This is much easier to understand if we split the payload into parts.

## Important offsets

The exploit used these libc offsets:

```python
GETW          = 0x8ff80      # getwchar
OFF_LOCALE_PTR = 0x213380   # locale pointer to overwrite
OBNEW         = 0xb6ee0      # _obstack_newchunk
H_ERRNO_LOC   = 0x146b00     # __h_errno_location
SETCONTEXT    = 0x4be80
ARCH_PRCTL    = 0x138480
POP_RAX       = 0xe5e47
SYSCALL_RET   = 0xa0c46
```

And the remote libc base was recovered from the slab leak:

```python
libc = slab + 0x10000000 + span + 0xa000
```

## Building the fake slab data

The slab contained several important regions:

```python
O_LOC   = 0x500
O_PTR   = 0x540
O_COPY  = 0x560
O_A     = 0x1000
O_B     = 0x1800
O_CTX   = 0x2000
O_SRC   = 0x3000
O_FP    = 0x3900
O_STACK = 0x3a00
O_PATH  = 0x4600
O_HOW   = 0x4620
O_BUF   = 0x4700
```

The fake locale chain points eventually into a fake obstack object. `_obstack_newchunk` is abused because it copies data around and calls function pointers stored in the fake object.

A controlled pattern was copied into TLS:

```python
PAT = 0x0000000200000002
```

The key result is that glibc's CET feature field is set in a way that lets the next stage work.

## Disabling CET

The fake context first jumps to:

```c
arch_prctl(ARCH_CET_DISABLE, 2)
```

The exploit used:

```python
ARCH_CET_DISABLE = 0x3002
```

After this call, the fake stack contains SROP frames.

SROP means “sigreturn oriented programming”. Instead of finding lots of tiny gadgets, we fake a signal frame and make the kernel restore all registers for us. That gives easy syscalls even with very few gadgets.

The syscall chain for arbitrary file read was basically:

```text
openat2(AT_FDCWD, path, &how, 24)
read(fd, buf, size)
write(1, buf, size)
```

On this remote, fds 3 through 9 were already used by the SDE/runtime, so our opened file landed at fd **10**.

That detail mattered. Assuming fd 3 gave confusing garbage.

## Triggering the chain

The bridge function pointer is overwritten with `getwchar`:

```python
p.send(b'A' * 0x20 + p64(libc + GETW))
```

Then one byte is sent to stdin to make the wide-character path do work:

```python
p.send(b'Z')
```

That is enough to trigger the fake locale/gconv path and begin the chain.

## Getting arbitrary file read

With the SROP chain, I could read files from the remote container. For example:

```bash
python3 solve_remote_cet.py challenge.ctf2026.r3kapig.com 31116 /flag
```

This produced the encrypted wrapper, not the real flag.

Reading `/home/ctf/encryptor` showed it was a tiny static ELF. Reversing it showed:

- AES-256-CBC
- zero IV
- PKCS#7 padding
- key is 32 bytes

Reading `/home/ctf/key` normally gave stars:

```text
********************************
```

But decrypting with `b'*' * 32` did not work.

## The key censorship trick

At this point, the important question was:

> What if `/home/ctf/key` is real, but the output is being filtered?

The server process had a censor/filter behavior. It looked for the whole secret key in output and replaced it with stars.

So instead of printing the key as one 32-byte string, I used `writev` to print it one byte at a time with a newline between every byte:

```text
k0\n
k1\n
k2\n
...
```

This prevents the filter from seeing the full contiguous key.

That leaked the real key:

```text
6
B
L
3
M
c
C
a
f
i
Q
a
a
i
G
g
S
e
4
D
u
i
f
3
A
1
5
D
p
I
9
M
```

So the real AES key was:

```text
6BL3McCafiQaaiGgSe4Duif3A15DpI9M
```

## Decrypting the flag

In the same process, I leaked the key and then read `/flag`, because the flag ciphertext/key can change between instances.

The ciphertext I got in that run was:

```text
F6GHAMEspgjEoQB4UGfUZZYiwj/VFkocyKYdombNj+WTQmaCnI1hE9ODdJetLKDnOID8pz3orrjBVt3Z01Z0Z9eqxyu1ilGOkEbU88J355Y=
```

Decrypting with AES-256-CBC and a zero IV:

```python
from Crypto.Cipher import AES
import base64

key = b'6BL3McCafiQaaiGgSe4Duif3A15DpI9M'
ct = base64.b64decode(
    'F6GHAMEspgjEoQB4UGfUZZYiwj/VFkocyKYdombNj+WTQmaCnI1hE9ODdJetLKDnOID8pz3orrjBVt3Z01Z0Z9eqxyu1ilGOkEbU88J355Y='
)

pt = AES.new(key, AES.MODE_CBC, b'\0' * 16).decrypt(ct)
print(pt[:-pt[-1]])
```

Output:

```text
r3ctf{coNGRaTS_YoU-hElp3D_cR@Zym4N-P4SS_c3T_WlTH-sHAD0W_Stack_and_ibt🎉0}
```

## Final flag

```text
r3ctf{coNGRaTS_YoU-hElp3D_cR@Zym4N-P4SS_c3T_WlTH-sHAD0W_Stack_and_ibt🎉0}
```

## Lessons learned

The biggest mistakes were assumptions:

1. **Assuming native CET behavior.**  
   The remote was SDE, and that changed how glibc/CET behaved.

2. **Assuming the key file output was literal.**  
   `/home/ctf/key` was being censored when printed as a full string.

3. **Assuming new files open at fd 3.**  
   SDE already used several file descriptors, so our file was fd 10.

The final solve needed both a pwn exploit and a small “think around the filter” trick.
