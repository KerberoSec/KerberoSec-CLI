# 🧩 Challenge: HTTP Methods

**Category:** Web

**Points:** 100

---

### 🔖 Challenge Description

> What options do you have, believe me bruteforcing is not required.
>
> [Click Here](https://options-86uf.onrender.com/)

---

### 🧭 Initial Reconnaissance (aka "I flexed my high IQ brain")

I opened the page: Squid Game wallpaper, dramatic text, and the vibe of "do not press the red button." Naturally I hit **View Source** like a good CTF citizen and spotted two commented hints: `<!-- /flag -->` and `<!-- /home -->`. Curious, I navigated to `/flag` and got an unhelpful “Oops!! something went wrong :(” page. The request was a plain old **GET /flag**: boring. The title of the challenge was _HTTP Methods_, and my high IQ brain (self-verified) said: “Try another method.”

---

### 🔍 Analysis & Enumeration (aka "thinking like an HTTP janitor")

The server happily responded to GET with the same squid game wallpaper but a different text `Oops!! something went wrong :(`, but the challenge title screamed that the method mattered. So instead of brute-forcing parameters or performing interpretive dance, I intercepted the request with Caido (my proxy of choice) and swapped the method from **GET** to **PUT**: because sometimes servers expose different behavior for other verbs.

---

### ⚙️ Exploitation Process (aka "method switch, instant reward")

I sent a **PUT** request to `/flag`. The server stopped being coy and spat out the flag as HTML:

```html
<div class="messages">zero{H77p_m3th0d5_m4tt3r5_3b4873b}</div>
```

Reproducible with curl:

```bash
curl -s -X PUT https://options-86uf.onrender.com/flag
```

---

### 🏁 Flag

```
zero{H77p_m3th0d5_m4tt3r5_3b4873b}
```

---

### 💡 Takeaways (aka "bragging rights")

- Titles are clues: read them or they will haunt you.
- Not every endpoint wants a GET: sometimes you need to be bold (or PUT-y).
- Intercept, change, profit. Also, my high IQ brain says so.

---

**Solved by TheM3chanik: [contact@them3chanik.com](mailto:contact@them3chanik.com)**
