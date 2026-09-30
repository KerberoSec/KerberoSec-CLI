# ringtrue: HackTheBox reversing writeup

**Category:** Reverse Engineering
**Flag:** `HTB{h3y_s1gn3t_1_4m_y0ur_k1ng}`

## Challenge

`ringtrue` is a not-stripped, PIE, x86-64 ELF that boots into a fake console
UI ("BrineROM / CinderOS") themed around a relic that needs to be "attuned."
The prompt asks for eight space-separated integers:

```
attune>
```

The flavor text says these are compared against a "resonance core": an embedded neural network, and that getting it right unseals a vault
containing a "sealed vow" ciphertext.

## Static analysis

`objdump -d` on `main` shows the input is read with `fgets` + `sscanf`
(`"%d %d %d %d %d %d %d %d"`) into 8 integers, which are then cast to
`double` and pushed through three back-to-back calls to a helper function
named `dense`:

```
dense(out, in, weights, bias)   // y = W*x + b, then leaky-activation in main
```

Symbols in the binary (not stripped) named the relevant data:

- `L0_W`, `L0_B`: first layer weights (8x8, int8) and biases (8x int32)
- `L1_W`, `L1_B`: second layer
- `L2_W`, `L2_B`: third layer
- `ECHO_S`: the fixed target output vector (8x int64)
- `VOW_CIPHER`: 30-byte ciphertext ("the sealed vow")
- `VOW_LEN`: length of the cipher (30)
- `W_SCALE`: int8 quantization scale constants

So: `main` builds an 8-8-8-8 MLP where each layer computes
`y = W·x + b` followed by a leaky-ReLU-style activation (values are halved
when negative, based on the disassembly around the FPU comparison/branch
code). The program computes the network's output for whatever tones the
user typed, and compares it against the fixed `ECHO_S` vector: a match
means "the mark rings true."

Critically, the weights are **fixed constants baked into the binary**, and
the target output `ECHO_S` is also fixed. That means there's exactly one
correct input (up to the network's injectivity), and we don't need to
brute-force 8 unknowns or run the binary at all to find it. We can just
invert the math.

## Recovering the correct input analytically

Each layer is an affine transform followed by an elementwise nonlinearity:

```
h = leaky(W·x + b)
```

Since `W` is a small 8x8 integer matrix, it's invertible over the
rationals, and leaky-ReLU is invertible too (dividing negative values by
the same slope used going forward). So starting from the known final
output `ECHO_S`, we can walk **backwards** through the network:

```
ECHO_S  --[invert L2: solve W2·h1 + b2 = ECHO_S for h1]-->  a1
a1      --[undo leaky: negative entries * 2]-->             h1
h1      --[invert L1]-->                                    a0
a0      --[undo leaky]-->                                   h0
h0      --[invert L0]-->                                    x   (the input!)
```

Using `sympy.Matrix.inv()` for each `W` and reversing the leaky-activation
(halving negative pre-activation values, since the forward pass appeared
to divide negatives by 2), this recovers:

```
x = [83, 97, 108, 116, 67, 114, 119, 110]
```

Interpreted as ASCII bytes, that's:

```
83 97 108 116 67 114 119 110  →  "SaltCrwn"
```: a nod to the ciphertext's name ("salt-mask boot" / "Brine Signet") and
the CTF's project title.

## Verifying and getting the flag

Feeding that exact sequence to the running binary at the `attune>` prompt:

```
$ ./ringtrue
...
attune> 83 97 108 116 67 114 119 110
```

produces:

```
IT RINGS TRUE
The First Mark is yours.

vault-seal: OPEN

+-- ash-vault - sealed vow ---------------------------------+
|  HTB{h3y_s1gn3t_1_4m_y0ur_k1ng}                            |
+-----------------------------------------------------------+
```

The 30-byte `VOW_CIPHER` blob is decrypted internally (XOR stream keyed
off the attunement) once the network check passes, revealing the flag
directly in the program's own output: no manual decryption needed.

## Flag

```
HTB{h3y_s1gn3t_1_4m_y0ur_k1ng}
```

## Key takeaways

- **Don't brute-force what you can invert.** An 8-8-8-8 MLP with only
  linear layers + a piecewise-linear activation is fully invertible by
  hand (well, by `sympy`) once weights/biases/target are known constants.
- **Symbol names are free intel.** The binary wasn't stripped, so `nm`
  and `objdump` handed over meaningful names (`ECHO_S`, `VOW_CIPHER`,
  `dense`) that made the network's structure obvious without deep
  disassembly of the FPU code.
- **Quantization details matter.** Weights were int8, biases int32: getting the dtypes right when reading `.data` out of the binary (via
  `struct.unpack`) was necessary before the matrix inversion would give
  clean integer results.
