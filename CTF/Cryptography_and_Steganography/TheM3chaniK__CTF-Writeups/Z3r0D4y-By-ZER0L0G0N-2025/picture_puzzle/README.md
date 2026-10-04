# 🧩 Challenge: Directory of Dread

**Category:** Web

**Points:** 250

---

### 🔖 Challenge Description

> Welcome to the gallery! The photos might look ordinary, but the real art lies in arranging them correctly. Shuffle the images, find the perfect order, and reveal the hidden code within the frames. Every picture tells a story: can you piece it together to find the flag?
>
> challenge: [https://emperor1947.github.io/Challenge3/](https://emperor1947.github.io/Challenge3/)

---

### 🧭 Initial Reconnaissance

The first thing I did was run `ffuf` to look for hidden directories, then opened the page source: nothing juicy at first glance. 

I fuzzed the site:
```bash
ffuf -w /usr/share/wordlists/dirb/common.txt -u https://emperor1947.github.io/Challenge3/FUZZ

        /'___\  /'___\           /'___\
       /\ \__/ /\ \__/  __  __  /\ \__/
       \ \ ,__\\ \ ,__\/\ \/\ \ \ \ ,__\
        \ \ \_/ \ \ \_/\ \ \_\ \ \ \ \_/
         \ \_\   \ \_\  \ \____/  \ \_\
          \/_/    \/_/   \/___/    \/_/

       v2.1.0
________________________________________________

 :: Method           : GET
 :: URL              : https://emperor1947.github.io/Challenge3/FUZZ
 :: Wordlist         : FUZZ: /usr/share/wordlists/dirb/common.txt
 :: Follow redirects : false
 :: Calibration      : false
 :: Timeout          : 10
 :: Threads          : 40
 :: Matcher          : Response status: 200-299,301,302,307,401,403,405,500
________________________________________________

                        [Status: 200, Size: 1756, Words: 410, Lines: 47, Duration: 271ms]
assets                  [Status: 301, Size: 162, Words: 5, Lines: 8, Duration: 270ms]
index                   [Status: 200, Size: 1756, Words: 410, Lines: 47, Duration: 252ms]
index.html              [Status: 200, Size: 1756, Words: 410, Lines: 47, Duration: 249ms]
:: Progress: [4614/4614] :: Job [1/1] :: 115 req/sec :: Duration: [0:00:35] :: Errors: 0 ::
```

`ffuf` didn’t reveal much, so I dug into the page source and found scattered “flag” fragments in comments/attributes: promising.

---

### 🔍 Analysis & Enumeration

I noticed this comment in `script.js`:

```html
// Add extra spacing flag-emVyb3t0(position 5) class for spaces
```
And on `shuffle.html`:
```html
*[Image: Photo 5]*
```
So there were multiple `flag-<part>(position N)` fragments buried in the source. Rather than hunting them manually I have to find some easy way hackerstyle. 
I notice the address bar, in the url it have `github.io` so its a github hosted static page, maybe its source code is in a public repo.
Usually the hosted page follows a pattern

```text
https://username.github.io/Repo_Name
```

And its respective repo link is

```text
https://github.com/username/Repo_Name
```

So I converted the pages url `https://emperor1947.github.io/Challenge3/` into this `https://github.com/Emperor1947/Challenge3.git` following the same pattern and wallah I found the repo.

Then I clone it in my local machine

```bash
$ git clone https://github.com/Emperor1947/Challenge3.git
```

Then I grepped for `flag` parts:

```bash
$ strings * | grep flag
    sparkle.style.boxShadow = '0 0 10px flag-Zm9yIHR(position 1) rgba(255, 255, 255, 0.8)';
        radial-gradient(circle, rgba(255, 255, 255, 0.3) 1px, flag-oZSBzaH(position 6) transparent 1px),
            // Add extra spacing flag-emVyb3t0(position 5) class for spaces
    transform: scale(0.5) flag-VmZmxp(position 2) rotate(-10deg);
                    *[Image: Photo 5]*
        transform: flag- bmd9(position 3) translateY(0);

```
I collected all parts and their positions:
```text
flag-Zm9yIHR(position 1)
flag-VmZmxp(position 2)
flag-bmd9(position 3)
flag-aGFua3Mg(position 4)
flag-emVyb3t0(position 5)
flag-oZSBzaH(position 6)
```

And as you can see all flag parts are printed on my terminal I didnt have to manually dig all of them.
Then I arrange all flag parts according to the mentioned position beside them. I found a encoded text possibly base64 `Zm9yIHRVmZmxpbmd9aGFua3MgemVyb3t0oZSBzaH`. Then to decode this I did

```bash
$ echo "Zm9yIHRVmZmxpbmd9aGFua3MgemVyb3t0oZSBzaH" | base64 -d
for tÚR6
```

But as you can see the ouput data is gibberish its not the flag. Then I spent a lot of time using different base encoders to decode this via [CyberChef](https://cyberchef.org/)

> P.S You can use [CyberChef](https://cyberchef.org/) to decode various type of encryption very handy in CTFs

But nothing worked. I though maybe I missed something then I recheck the site. There I saw the site mention about shuffeling position of photos. Then I though maybe I also have to shuffle the flag parts in order to find the actual flag. So I made a simple python script which will shuffle the parts in every possible combination and decode them.  Here is the script

```python
import base64
from itertools import permutations

parts = ["bmd9", "emVyb3t0", "oZSBzaH", "VmZmxp", "Zm9yIHR", "aGFua3Mg"]

for perm in permutations(parts):
    combined = "".join(perm)
    try:
        decoded = base64.b64decode(combined).decode("utf-8")
        print(f"{combined} -> {decoded}")
    except Exception:
        pass

```

Running it revealed the correct ordering and decoded string:
```bash
$ python decoder.py
bmd9emVyb3t0Zm9yIHRoZSBzaHVmZmxpaGFua3Mg -> ng}zero{tfor the shufflihanks
bmd9emVyb3t0aGFua3MgZm9yIHRoZSBzaHVmZmxp -> ng}zero{thanks for the shuffli
bmd9Zm9yIHRoZSBzaHVmZmxpemVyb3t0aGFua3Mg -> ng}for the shufflizero{thanks
bmd9Zm9yIHRoZSBzaHVmZmxpaGFua3MgemVyb3t0 -> ng}for the shufflihanks zero{t
bmd9aGFua3MgemVyb3t0Zm9yIHRoZSBzaHVmZmxp -> ng}hanks zero{tfor the shuffli
bmd9aGFua3MgZm9yIHRoZSBzaHVmZmxpemVyb3t0 -> ng}hanks for the shufflizero{t
emVyb3t0bmd9Zm9yIHRoZSBzaHVmZmxpaGFua3Mg -> zero{tng}for the shufflihanks
emVyb3t0bmd9aGFua3MgZm9yIHRoZSBzaHVmZmxp -> zero{tng}hanks for the shuffli
emVyb3t0Zm9yIHRoZSBzaHVmZmxpbmd9aGFua3Mg -> zero{tfor the shuffling}hanks
emVyb3t0Zm9yIHRoZSBzaHVmZmxpaGFua3Mgbmd9 -> zero{tfor the shufflihanks ng}
emVyb3t0aGFua3Mgbmd9Zm9yIHRoZSBzaHVmZmxp -> zero{thanks ng}for the shuffli
emVyb3t0aGFua3MgZm9yIHRoZSBzaHVmZmxpbmd9 -> zero{thanks for the shuffling}
Zm9yIHRoZSBzaHVmZmxpbmd9emVyb3t0aGFua3Mg -> for the shuffling}zero{thanks
Zm9yIHRoZSBzaHVmZmxpbmd9aGFua3MgemVyb3t0 -> for the shuffling}hanks zero{t
Zm9yIHRoZSBzaHVmZmxpemVyb3t0bmd9aGFua3Mg -> for the shufflizero{tng}hanks
Zm9yIHRoZSBzaHVmZmxpemVyb3t0aGFua3Mgbmd9 -> for the shufflizero{thanks ng}
Zm9yIHRoZSBzaHVmZmxpaGFua3Mgbmd9emVyb3t0 -> for the shufflihanks ng}zero{t
Zm9yIHRoZSBzaHVmZmxpaGFua3MgemVyb3t0bmd9 -> for the shufflihanks zero{tng}
aGFua3Mgbmd9emVyb3t0Zm9yIHRoZSBzaHVmZmxp -> hanks ng}zero{tfor the shuffli
aGFua3Mgbmd9Zm9yIHRoZSBzaHVmZmxpemVyb3t0 -> hanks ng}for the shufflizero{t
aGFua3MgemVyb3t0bmd9Zm9yIHRoZSBzaHVmZmxp -> hanks zero{tng}for the shuffli
aGFua3MgemVyb3t0Zm9yIHRoZSBzaHVmZmxpbmd9 -> hanks zero{tfor the shuffling}
aGFua3MgZm9yIHRoZSBzaHVmZmxpbmd9emVyb3t0 -> hanks for the shuffling}zero{t
aGFua3MgZm9yIHRoZSBzaHVmZmxpemVyb3t0bmd9 -> hanks for the shufflizero{tng}

```

So by seeing the output this `emVyb3t0aGFua3MgZm9yIHRoZSBzaHVmZmxpbmd9 -> zero{thanks for the shuffling}` is the correct flag I can tell that as it follows the flag format.
So we found the flag
### ⚙️ Exploitation Process
- Locate flag-<part>(position N) snippets in the repo/source.

- Assemble parts according to their intended positions (or brute-force permutations).

- Base64-decode the correct concatenation to reveal the flag.

---

### 🏁 Flag

```
zero{thanks for the shuffling}
```

---

### 💡 Takeaways
- You don't have to manually hunt every fragment: automate collection and testing (grep/strings + a small script) to scale your hustle.

- GitHub Pages often exposes a public repo: try mapping the page URL to the repo.

- When fragments look encoded, collect all pieces first, then decode in the right order (or script the permutations).

- If the site asks you to shuffle: let your script shuffle faster than your patience.

---

**Solved by TheM3chanik: [contact@them3chanik.com](mailto:contact@them3chanik.com)**
