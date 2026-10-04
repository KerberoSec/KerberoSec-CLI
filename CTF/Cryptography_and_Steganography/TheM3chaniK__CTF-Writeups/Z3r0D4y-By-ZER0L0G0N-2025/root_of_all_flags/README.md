# 🧩 Challenge: Root of All Flags

**Category:** Web

**Points:** 300

---

### 🔖 Challenge Description

> Welcome to the world of numbers! This website looks simple: just a few math problems to solve. But every correct answer brings you one step closer to uncovering the hidden clue that leads to the flag. Think logically, calculate carefully, and keep your eyes open… sometimes the numbers speak more than they seem.(the flag format for this challenge is zeroday{})
>
> [ challenge ](https://emperor1947.github.io/Challenge/)

---

### 🧭 Initial Reconnaissance

Ok let's be a good guy and do what the site was made for: solve the puzzles. I clicked through a few pages and played with the math inputs, but the site gave nothing obvious.

*[Image: index2]*
*[Image: index3]*
*[Image: index4]*
*[Image: index5]*
*[Image: hint]*

Since the puzzles yielded no immediate clue, I looked at the page source and fuzzed endpoints with `ffuf` to see if anything hidden popped up:

```bash
ffuf -w /usr/share/wordlists/dirb/common.txt -u https://emperor1947.github.io/Challenge/FUZZ

        /'___\  /'___\           /'___\
       /\ \__/ /\ \__/  __  __  /\ \__/
       \ \ ,__\\ \ ,__\/\ \/\ \ \ \ ,__\
        \ \ \_/ \ \ \_/\ \ \_\ \ \ \ \_/
         \ \_\   \ \_\  \ \____/  \ \_\
          \/_/    \/_/   \/___/    \/_/

       v2.1.0
________________________________________________

 :: Method           : GET
 :: URL              : https://emperor1947.github.io/Challenge/FUZZ
 :: Wordlist         : FUZZ: /usr/share/wordlists/dirb/common.txt
 :: Follow redirects : false
 :: Calibration      : false
 :: Timeout          : 10
 :: Threads          : 40
 :: Matcher          : Response status: 200-299,301,302,307,401,403,405,500
________________________________________________

                        [Status: 200, Size: 523, Words: 90, Lines: 18, Duration: 268ms]
assets                  [Status: 301, Size: 162, Words: 5, Lines: 8, Duration: 269ms]
index                   [Status: 200, Size: 523, Words: 90, Lines: 18, Duration: 272ms]
index.html              [Status: 200, Size: 523, Words: 90, Lines: 18, Duration: 272ms]
index2                  [Status: 200, Size: 1160, Words: 266, Lines: 31, Duration: 265ms]
index3                  [Status: 200, Size: 1432, Words: 359, Lines: 36, Duration: 264ms]
index1                  [Status: 200, Size: 523, Words: 90, Lines: 18, Duration: 325ms]
:: Progress: [4614/4614] :: Job [1/1] :: 150 req/sec :: Duration: [0:00:31] :: Errors: 0 ::
```

`ffuf` didn't directly give a flag, but reading sources revealed suspicious `flagpart` markers sprinkled in CSS/JS.

---

### 🔍 Analysis & Enumeration

In `slide1.css` I spotted:

```html
    background: linear-gradient(135deg,/* flag part1 - https://pri */ #667eea, #764ba2);
```

Digging more in the repo/source, I grepped for `flag` parts and found multiple hints:

```bash
$ strings * | grep flag                                                        
            <button onclick="appendToDisplay('4 <!-- flagpart5- whikxGhNAtK -->')">4</button>
    background: linear-gradient(135deg,/* flag part1 - https://pri */ #667eea, #764ba2);
    // Check if answer is correct (allow small flagpart2-vatebin.net/?a floating point differences)
    border: flagpart3 - efb18ae85881c0 3px solid #667eea;
    // Check if both roots are correct (order flagpart4-b#2Pw7KiuYZu doesn't matter)
    // You can add correct flagpart6-jRqHrUa1hFU answer validation here if needed
    animation: boxPulse 3s ease-in-out flagpart7-xKYcJtieN2m5 infinite;
```

Putting the discovered pieces together produced this URL-like string:

```text
https://privatebin.net/?aefb18ae85881c0b#2Pw7KiuYZuwhikxGhNAtKjRqHrUa1hFUxKYcJtieN2m5
```

That link contained a text file (`document-aefb18ae85881c0b.txt`) which turned out to be a base64 blob. Decoding it produced a JPEG (`decoded`) which contained additional data and metadata:

```bash
$ cat document-aefb18ae85881c0b.txt| base64 -d > decoded
$ file decoded
decoded: JPEG image data, JFIF standard 1.01, resolution (DPI), density 120x120, segment length 16, Exif Standard: [TIFF image data, big-endian, direntries=1, orientation=upper-left], comment: "Part2=nX2Z4MWNfejRndWZ9", baseline, precision 8, 1500x765, components 3
```

The image contained `Part1 =bXJlYnFubHtxMGF` (visually embedded) and the EXIF comment contained:
> P.S I didn't check the `file` command output XD So I had to check exif again.

```text
Comment                         : Part2=nX2Z4MWNfejRndWZ9
```

Combining parts:

```bash
$ echo "bXJlYnFubHtxMGFnX2Z4MWNfejRndWZ9" | base64 -d
mrebqnl{q0ag_fx1c_z4guf}
```

That output still looked scrambled. A quick ROT13 (easily done in [ CyberChef ](https://cyberchef.org/) revealed the final message:

```text
zeroday{d0nt_sk1p_m4ths}
```

---

### ⚙️ Exploitation Process
- Clone the GitHub Pages repo for the site and search the source for flag fragments.

- Collect the flagpart snippets and assemble the URL they form.

- Fetch and base64-decode the linked document to get a JPEG (decoded).

- Extract Part1 from the image and Part2 from EXIF comment; concatenate and base64-decode.

- Apply ROT13 to the decoded string to get the final flag.

> (Short, exact, and repeatable: clone → grep → decode → combine → transform → flag.)
---

### 🏁 Flag

```
zeroday{d0nt_sk1p_m4ths}
```

---

### 💡 Takeaways

* Don’t hunt fragments manually: automate collection and testing (grep/strings + a small script) to save time and avoid mistakes.
* Public GitHub Pages often expose repos: map `username.github.io/Repo` → `github.com/username/Repo` and clone it.
* Hidden data can live in images (visual text) and EXIF metadata: always check both.
* If an intermediate decode looks like garbage, try chaining decoders (base64 → other transforms like ROT13). Automation helps you try permutations fast.

---

**Solved by TheM3chanik: [contact@them3chanik.com](mailto:contact@them3chanik.com)**

