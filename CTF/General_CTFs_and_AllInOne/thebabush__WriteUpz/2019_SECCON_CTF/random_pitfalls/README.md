# random\_pitfalls

We are given a program and its source code, let's see...

## The Server

Ok, so what `server.c` does is simple, more or less:

1. Create a buffer and fills it with zeros
2. Maps 64 contiguous pages as `PROT_NONE`
3. Takes one of them and maps it `PROT_READ | PROT_WRITE`
4. Fills it with random data
5. Xor `buffer` with the current page
6. Repeat from 3. a bunch of times
7. Read the flag in one of the remaining pages
8. Xor the flag page with `buffer`

(This is a simplified version of the thing)

Then it reads our 4096 bytes of shellcode and jump into them, but it does so
after a seccomp filter that only allows `write`s from `buffer` to `stdout` and
`exit`.
Since the authors are nice, they also make sure to clear every register
(including the stack pointer).

## The Plan

What we want to achieve is pretty straightforward: we need to XOR together all
the valid pages so as to get the original flag back
(remember that `a ^ b ^ b = a`).

There's a catch though: how do we read all the valid pages avoiding the
`PROT_NONE` ones?
If we try to read from those, we die.

The server prints to us the flags from `/proc/cpuinfo` and that's probably an
hint.
I was thinking some crazy stuff like cache-based side-channels, but a teammate
suggested I take a look at Intel's
[Transactional Synchronization Extensions](https://en.wikipedia.org/wiki/Transactional_Synchronization_Extensions)
and that's what I did.

TSX is an hardware extension that enables transactional memory on x86.
What this means, is that you can write a bunch of memory locations and be
sure that either all of them were written or none of them.
TSX has also another nice feature: it allows the programmer to handle the errors
occurred during the transactions.

See the problem? We can start a transaction, read from one of the pages, and
catch the likely page fault from our own code without crashing the server :)

### The Shellcode

The complete shellcode is in [shell.asm](./shell.asm), but the basic idea is
this:

```python
def shellcode(mem, buffer):
    for page in mem:
        # begin transaction
        xbegin()
        # xor the page with the output buffer
        buffer ^= page
        # end the transaction
        xend()
    write(stdout, buffer)
```

## The Win

```sh
$ nasm -o shell.bin -f bin ./shell.asm && ./x.py
flags        : fpu vme de pse tsc msr pae mce cx8 apic sep mtrr pge mca cmov pat pse36 clflush mmx fxsr sse sse2 ht syscall nx pdpe1gb rdtscp lm constant_tsc rep_good nopl xtopology cpuid aperfmperf pni pclmulqdq ssse3 fma cx16 pcid sse4_1 sse4_2 x2apic movbe popcnt tsc_deadline_timer aes xsave avx f16c rdrand hypervisor lahf_lm abm 3dnowprefetch cpuid_fault invpcid_single pti fsgsbase bmi1 hle avx2 smep bmi2 erms invpcid rtm rdseed adx xsaveopt

SECCON{7h1S_ch4L_Is_in5p1r3d_by_sgx-rop}
```

*babush*

P.S.: Sometimes the server returns random data. I haven't had the time to
      investigate why that's the case.
      Still, got the flag right? :)

