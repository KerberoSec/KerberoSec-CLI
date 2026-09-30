# TrustedHash Writeup

This was a neat “you own the VM, but not the trust boundary” challenge. We get root on a Linux VM, but the checker/attester is supposed to only ever send the flag into a TPM-backed kernel path that returns `SHA256(flag)`, not the flag itself.

Final flag:

```text
r3ctf{TH3_V3rif1Er-owNs-thE_TruST-BUt_YOu_Own_The-r4m79}
```

## The setup, in normal words

There are two sides:

- **Our VM**: we can SSH in as root and control userspace.
- **The attester/checker**: a remote service that periodically checks the VM, encrypts the flag to a key inside the VM's TPM flow, and asks the VM to hash it.

The intended “secure” flow is:

1. The attester connects to `trusted_hash_agent` on the VM.
2. The agent forwards JSON requests to `/dev/trusted_hash`.
3. `/dev/trusted_hash` is handled by a signed kernel module.
4. The kernel module creates TPM-backed keys and returns attestation evidence.
5. The attester verifies PCR values, EK cert, AK/decrypt key, and a module-signer signature.
6. If everything looks good, the attester encrypts the flag to the returned decrypt key.
7. The kernel module asks the TPM to decrypt the flag, hashes the plaintext in kernel memory, and returns only the SHA-256 digest.

So from userspace we see something like:

```text
trusted_hash_result=5489e9e805c0b14357fc9a6a8b8af966e67b1b1586208e89008a33934bc0d9ed
```

That digest is not enough by itself; we need the actual flag.

## First idea: hook the decrypt function

Looking at the source, the juicy function is in the kernel module:

```c
rc = tpm2_rsa_decrypt(..., plaintext, ..., &plaintext_size);
sha256_update(&hash_ctx, plaintext, plaintext_size);
sha256_final(&hash_ctx, req->result);
```

Locally, I made a tiny kernel module with a kretprobe on `tpm2_rsa_decrypt`. It grabbed the `plaintext` pointer and dumped it through `/proc`. That worked in the dev environment.

But remotely this fails because the production VM is in kernel lockdown mode:

```text
Lockdown: unsigned module loading is restricted
```

So we cannot just load our own kernel module.

## Other dead ends

A few things were blocked by lockdown too:

- `/dev/mem` / `/proc/kcore` kernel memory reads
- raw PCI/MMIO access to sniff the TPM bus
- unsafe perf/kprobe usage
- unsigned modules
- BPF helpers that directly read kernel memory, like `bpf_probe_read_kernel`

The TPM emulator trick also worked locally: tracing `swtpm` on the host lets you see the TPM response containing the plaintext. But on the hosted challenge we only control the guest VM, not the host running `swtpm`, so that was not usable remotely.

## The actual leak: hash state, not TPM state

The important observation was: the flag does not only exist in the TPM decrypt output buffer.

Before returning the hash, the kernel module feeds the plaintext into Linux's SHA-256 code:

```c
struct sha256_ctx hash_ctx;

sha256_init(&hash_ctx);
sha256_update(&hash_ctx, plaintext, plaintext_size);
sha256_final(&hash_ctx, req->result);
```

For small inputs, SHA-256 stores the pending bytes inside its context buffer before finalizing. The flag is short, so right before `sha256_final()` runs, `hash_ctx` still contains the original flag bytes in its internal 64-byte block buffer.

In other words, even though the module later wipes `plaintext`, the flag has already been copied into the SHA-256 context on the kernel stack.

So instead of leaking the TPM decrypt buffer, I leaked the argument to `sha256_final()`.

## Why BPF worked here

Regular BPF memory reads were blocked, but BPF fentry has typed access to function arguments using kernel BTF info.

`/sys/kernel/btf/vmlinux` exposed BTF metadata. From that, I found the BTF id for `sha256_final`:

```text
sha256_final -> BTF id 152045
```

Then I attached a BPF fentry program to `sha256_final`. Its argument is:

```c
void sha256_final(struct sha256_ctx *sctx, u8 *out)
```

The BPF program copies the `sha256_ctx` structure into a BPF map. It does **not** use `bpf_probe_read_kernel`, so lockdown did not reject it.

The relevant idea is basically:

```c
SEC("fentry/sha256_final")
int BPF_PROG(capture, struct sha256_ctx *ctx, u8 *out) {
    saved_ctx = *ctx;
    return 0;
}
```

I implemented this manually with raw `bpf()` syscalls because the VM did not have a full dev toolchain or bpftool/libbpf.

## Result

Once the fentry probe was attached, I waited for the periodic attester run. The first captured SHA-256 context was unrelated attestation data, but the next one was clearly the flag sitting in the SHA-256 buffer:

```text
count=56
buf_hex=72336374667b5448335f56337269663145722d6f774e732d7468455f54727553542d4255745f594f755f4f776e5f5468652d72346d37397d0000000000000000
ascii=r3ctf{TH3_V3rif1Er-owNs-thE_TruST-BUt_YOu_Own_The-r4m79}........
```

So the flag was:

```text
r3ctf{TH3_V3rif1Er-owNs-thE_TruST-BUt_YOu_Own_The-r4m79}
```

## Takeaway

The TPM design mostly did its job: I did not break the TPM key, forge attestation, or decrypt the RSA blob in userspace.

The leak came from a much smaller detail: after decrypting the flag, the kernel code copied it into a normal SHA-256 context. That context lived in kernel memory, and BPF fentry could observe the typed function argument at exactly the right moment.

So the lesson is: if a secret touches normal memory, every later copy of it matters too, not just the original buffer.
