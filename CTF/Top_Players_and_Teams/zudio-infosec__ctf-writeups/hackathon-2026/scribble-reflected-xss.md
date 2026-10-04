# ✏️ Scribble (Web: Reflected XSS)

## Challenge Info

| Field | Details |
|---|---|
| Platform | Cybersecurity Hackathon 2026 (CydeaRange) |
| Category | Web Exploitation |
| Tools Used | Burp Suite, browser |

---

## 🧩 Description

A minimal "Scribble" page: a single text input that echoes back whatever
you type. No obvious auth, no other endpoints. The kind of page that
exists purely to test whether input gets reflected unsafely.

---

## 🔍 Reconnaissance

**Step 1: Confirm the reflection**

Typed a plain marker string into the box and submitted. It came back
verbatim in the page output: no encoding, no filtering. That's the
signal: whatever goes in comes straight back into the HTML.

---

## ⚔️ Attack Process

**Step 1: Set up Burp to watch the response**

With Burp Suite's proxy intercepting, submitted a basic XSS payload
(`<script>...</script>`) into the input field instead of plain text.

**Step 2: Submit and capture**

Forwarded the request through Burp and watched the response come back: the script tag was reflected unescaped directly into the page.

**Step 3: Read the flag**

The flag was embedded directly in the server's response once it
recognized the payload had actually executed/reflected as a script,
visible straight in the Burp response pane: no need to actually pop an
alert in a live browser to grab it.

---

## 🚩 Flag
```
flag{...}   <!-- fill in exact string -->
```

---

## 💡 Lessons Learned

- Reflected XSS doesn't need a complex payload to prove: a bare
  `<script>` tag reflected unescaped is enough to demonstrate the
  vulnerability
- Burp Suite is often faster than a live browser for confirming
  reflection: you see the exact raw HTML the server sends back, not
  what the DOM renders
- Any user-controlled input echoed into HTML without encoding is a
  reflected-XSS candidate: worth testing on sight

---

## 🛠️ Tools Used

- **Burp Suite**: payload injection and response capture
- **Browser**: initial reflection test

---

*Solved during Cybersecurity Hackathon 2026: legal, authorized CTF environment*
