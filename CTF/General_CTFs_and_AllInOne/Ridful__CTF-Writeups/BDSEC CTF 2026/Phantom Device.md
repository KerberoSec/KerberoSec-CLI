
# Phantom Device: BDSEC CTF Writeup

**Challenge:** Phantom Device  
**Category:** Pwn  
**Author:** NomanProdhan

## tl;dr

this one was basically a use-after-free caused by broken handle duplication.

the program lets us duplicate a device handle, but it forgets to increase the device's reference count. so when we release the duplicated handle, the device gets freed even though the original handle is still active.

that leaves us with a stale handle pointing to freed heap memory.

we then make the program allocate a session in that same chunk, use the stale device handle to read and edit the session, change its role to privileged, fix the integrity value, and ask for the flag.

final flag:

```
BDSEC{ph4nt0m_h4ndl35_n3v3r_d13}
```

---

## challenge info

the service gave us a menu-driven binary and a remote connection:

```
nc 45.56.67.129 51429
```

the interesting menu actions were basically:

- allocate device
    
- duplicate handle
    
- read device
    
- write device
    
- release handle
    
- create session
    
- request privileged data
    

the whole thing looks like a little fake device/session manager, but the handle lifetime logic is cooked.

---

## finding the bug

a normal reference-counted object should work like this:

1. allocate object
    
2. create handle
    
3. duplicate handle
    
4. increment reference count
    
5. release one handle
    
6. object stays alive because another handle still exists
    

but here, duplicating a handle copies the pointer without increasing the reference count.

so the flow becomes:

1. allocate a device
    
2. duplicate its handle
    
3. release the duplicate
    
4. the program thinks the last reference is gone
    
5. the device memory gets freed
    
6. the original handle is still marked active
    

now the original handle points to freed heap memory.

that's our use-after-free.

---

## first attempt

the first idea was simple:

1. allocate one device
    
2. duplicate its handle
    
3. release the duplicate
    
4. create a session
    
5. hope the session reuses the freed device chunk
    
6. read the session through the stale handle
    

locally, this kind of layout looked reasonable.

but on remote, the stale handle leaked this instead:

```
0x23f37
```

that wasn't the session magic. it was allocator metadata from a freed chunk.

so the session allocation did **not** reuse the chunk we wanted.

---

## why the first attempt failed

the freed device chunk went into glibc's tcache.

the session was created with `calloc`, and on the remote libc it didn't immediately reclaim that exact tcache entry the way the first exploit expected.

so the dangling pointer was valid, but it was still pointing at a plain freed chunk instead of the new session.

basically:

```
stale handle -> freed tcache chunk
session      -> different chunk
```

no overlap, no win.

---

## fixing the heap layout

the fix was to use multiple dangling chunks instead of relying on one.

we allocated:

- 8 candidate devices
    
- 1 extra guard device
    

the guard keeps the final candidate from sitting right next to the top chunk and getting merged in an annoying way.

for every candidate, we:

1. duplicated its handle
    
2. released the duplicate
    
3. kept the original handle active
    

that gave us 8 stale handles.

with the usual tcache count, the first 7 freed chunks fill the tcache bin. the 8th chunk has to go through a different allocator path.

then we created a session and scanned all 8 stale handles.

the output showed:

```
[*] Handle 0: first_qword=0x00000000000293b6
[*] Handle 1: first_qword=0x000000002939f116
[*] Handle 2: first_qword=0x000000002939f006
[*] Handle 3: first_qword=0x000000002939f776
[*] Handle 4: first_qword=0x000000002939f666
[*] Handle 5: first_qword=0x000000002939f556
[*] Handle 6: first_qword=0x000000002939f446
[*] Handle 7: first_qword=0x504853455353494f
```

handle 7 contained:

```
0x504853455353494f
```

which is the exact session magic.

so now we had:

```
stale device handle 7 -> live session object
```

nice.

---

## session layout

the first `0x30` bytes of the session looked like this:

|Offset|Field|
|---|---|
|`0x00`|magic|
|`0x08`|uid|
|`0x10`|role|
|`0x18`|nonce|
|`0x20`|tag1|
|`0x28`|tag2|
|`0x30`|name|

the important values were:

```
SESSION_MAGIC = 0x504853455353494F
PRIVILEGED_ROLE = 0x1337133713371337
TAG_CONSTANT = 0xA55AA55AA55AA55A
UID_CONSTANT = 0x5478547854785478
```

the initial role was just:

```
1
```

so changing only the role wasn't enough. the program also checks integrity values.

---

## recovering the secret

the first integrity tag was calculated like this:

```
tag1 = ROL64(uid XOR secret, 17)
       XOR nonce
       XOR 0xA55AA55AA55AA55A
```

because we could leak `uid`, `nonce`, and `tag1`, we could reverse it:

```
secret = ROR64(
    tag1 XOR nonce XOR 0xA55AA55AA55AA55A,
    17
) XOR uid
```

after recovering the secret, we recalculated `tag1` and checked that it matched the leaked value.

that validation step was important because there were only 10 flag submissions allowed. no guessing.

---

## building the privileged session

the privileged data check expected another tag:

```
tag2 = ROL64(nonce, 11)
       XOR secret
       XOR ROL64(uid + 0x5478547854785478, 29)
```

so the final overwrite starting at offset `0x10` was:

```
role  = 0x1337133713371337
nonce = original nonce
tag1  = original valid tag1
tag2  = newly calculated privileged tag2
```

we wrote 32 bytes through the stale device handle:

```
payload = (
    p64(PRIVILEGED_ROLE)
    + p64(nonce)
    + p64(tag1)
    + p64(privileged_tag2)
)
```

then we used the normal **request privileged data** menu option with the session ID.

---

## exploit flow

the final exploit was basically:

```
allocate 8 candidate devices
allocate 1 guard device

for each candidate:
    duplicate handle
    release duplicate
    keep original stale handle

create session

for each stale handle:
    read first 0x30 bytes
    check for exact session magic

once found:
    leak uid, nonce, tag1
    recover secret
    calculate privileged tag2
    overwrite role + integrity fields
    request privileged data
```

the script only continued after finding the exact session magic:

```
0x504853455353494f
```

and it only printed a value matching:

```
BDSEC{...}
```

that kept the exploit safe from false flags and accidental submissions.

---

## result

the remote service returned:

```
BDSEC{ph4nt0m_h4ndl35_n3v3r_d13}
```

## flag

```
BDSEC{ph4nt0m_h4ndl35_n3v3r_d13}
```

