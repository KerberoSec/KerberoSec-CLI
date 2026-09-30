# 🧩 Challenge: Directory of Dread

**Category:** Web

**Points:** 200

---

### 🔖 Challenge Description

> A cozy blog about Courage has gone a little weird: pages list pictures, but some secrets are written where humans don’t usually look. Explore the static folders and convince the app to reveal files it wasn’t meant to show. Find the flags and calm the dog.
>
> [Courage Blog](https://courage-blog.onrender.com/)

---

### 🧭 Initial Reconnaissance

I opened the site (Courage the Cowardly Dog vibes confirmed)

and viewed the source: nothing juicy. Next I ran a quick directory fuzz with `ffuf` to find hidden endpoints:

```bash
$ ffuf -w /usr/share/wordlists/dirb/common.txt -u https://courage-blog.onrender.com/FUZZ

        /'___\  /'___\           /'___\
       /\ \__/ /\ \__/  __  __  /\ \__/
       \ \ ,__\\ \ ,__\/\ \/\ \ \ \ ,__\
        \ \ \_/ \ \ \_/\ \ \_\ \ \ \ \_/
         \ \_\   \ \_\  \ \____/  \ \_\
          \/_/    \/_/   \/___/    \/_/

       v2.1.0
________________________________________________

 :: Method           : GET
 :: URL              : https://courage-blog.onrender.com/FUZZ
 :: Wordlist         : FUZZ: /usr/share/wordlists/dirb/common.txt
 :: Follow redirects : false
 :: Calibration      : false
 :: Timeout          : 10
 :: Threads          : 40
 :: Matcher          : Response status: 200-299,301,302,307,401,403,405,500
________________________________________________

                        [Status: 200, Size: 1618, Words: 308, Lines: 44, Duration: 142ms]
help                    [Status: 200, Size: 335, Words: 51, Lines: 8, Duration: 252ms]
view                    [Status: 200, Size: 38, Words: 2, Lines: 1, Duration: 194ms]
:: Progress: [4614/4614] :: Job [1/1] :: 164 req/sec :: Duration: [0:00:28] :: Errors: 0 ::
```

Results showed two interesting directories: `help` and `view`.

---

### 🔍 Analysis & Enumeration

Visiting `/help` gave an intentional hint:

```html
CTF Hint Page This site is intentionally insecure. Try: Browsing:
/static/images/ and /static/ Using the LFI endpoint: /view?file=/flag.txt or
/view?file=/static/images/flag.txt
```

Tried the direct LFI URLs `/view?file=/flag.txt` and `/view?file=/static/images/flag.txt`: both returned "File not found." So I inspected the static folders the hint recommended.

`/static/images/` directory listing contained `flag2.txt`:

```html
Index of /static/images [.. parent] [FILE] courage1.jpg [FILE] courage2.jpg
[FILE] courage3.jpg [FILE] courage4.jpg [FILE] flag2.txt
```

`flag2.txt` contained:

```text
_l34rns_LFI}
```

Then I checked `/static/` and found `flag1.txt`:

```html
Index of /static/ [DIR] css [FILE] flag1.txt [DIR] images
```

`flag1.txt` contained:

```text
zero{c0ur4ge
```

---

### ⚙️ Exploitation Process

Combine the two parts from the static directories to reconstruct the full flag:

```
flag1.txt -> zero{c0ur4ge
flag2.txt -> _l34rns_LFI}
=> zero{c0ur4ge_l34rns_LFI}
```

No fancy LFI payloads required: the site literally hinted where the pieces lived.

---

### 🏁 Flag

```
zero{c0ur4ge_l34rns_LFI}
```

---

### 💡 Takeaways

- When an app tells you to “browse /static/”, they’re not kidding: static folders are CTF candy.
- Helpful hints in `/help` are the developer equivalent of leaving a sticky note on the fridge.
- Directory listing + a little curiosity = rescued courage (and a flag).

---

**Solved by TheM3chanik: [contact@them3chanik.com](mailto:contact@them3chanik.com)**
