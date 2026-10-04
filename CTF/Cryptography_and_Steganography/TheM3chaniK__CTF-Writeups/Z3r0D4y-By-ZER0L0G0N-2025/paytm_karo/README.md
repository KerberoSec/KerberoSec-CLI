# 🧩 Challenge: Paytm Karo

**Category:** Reverse Engineering
**Points:** 300

---

### 🔖 **Challenge Description**

> Scanning a QR will give you its contents. But what if... there were a hundred of them?

---

### 📎 **Attachments**

* `qr.zip`: (provided)

---

### 🧭 **First Impressions**

Oh look: a hundred QR codes. Because doing one QR scan would be too mainstream. Someone clearly said “let’s mass-produce annoyance” and called it a CTF. Time to stop pretending we enjoy repetitive tasks and automate like civilized hackers. 🧑‍🍳➡️🤖

---

### 🛠 **Environment & Tools**

* OS: I use Arch Btw (of course).
* Tools: python3, zbar (the swiss-army eye for QR shrapnel).
* Assumptions: QR payloads are readable by zbar and most are just boring base64-encoded text (i.e., nobody hid a ransomware inside a PNG, yet).

---

### 🔬 **Static Analysis**

I unzip `qr.zip` and gasp dramatically. 100 images stare back. I scan one out of mild optimism and get:

```text
cG90YXRvIGZhcm1pbmcgaW4gYSB0eXBpY2FsIHBvdGF0byBmYXJtLCBub3RoaW5nIHN1cw==
```

Base64! Which decodes to:

```bash
$ echo "cG90YXRv..." | base64 -d
potato farming in a typical potato farm, nothing sus
```

So the theme is: each QR stores a base64 blob that decodes to mundane English sentences. Either this is art, or someone has a weird potato obsession.

---

### ▶️ **Dynamic Analysis**

Manual scanning = soul erosion. I wrote `decoder.py` (the tiny hero) that:

1. Finds all images.
2. Runs zbar to rip QR payloads.
3. Detects base64-like strings and attempts decode.
4. Writes `filename<TAB>decoded-text` to `decoded_messages.txt`.

Before running the script you need to install system deps for zbar and Python deps. I used Arch, so:

For Arch:

```bash
$ sudo pacman -S zbar
```

For Debian/Ubuntu:

```bash
$ sudo apt install libzbar0
```

For Fedora:

```bash
$ sudo dnf install zbar
```

For Windows:

```bash
# Dude you seriously use windows? Have some shame!
```

Then set up the Python environment and install requirements:

```bash
$ python3 -m venv env
$ source ./env/bin/activate
$ pip install -r requirements.txt
```

Run the decoder like a responsible adult:

```bash
$ python3 decoder.py
Done. Wrote 100 lines to /home/m3chanik/ZeroLogon_CTF/writeups/paytm_karo/qr/decoded_messages.txt
```

> P.S Run the decoder in the unzipped qr dir only

My script didn’t judge me for outsourcing tedium. It only judged the QR author.

*Assumptions noted:* zbar extracts payloads cleanly; decoded blobs are short UTF-8 (mostly English, sometimes suspiciously veggie-related).

---

### ⚙️ **Patching / Exploitation / Decoding Process**

Steps I actually did (because reading is for chumps):

1. Unzip `qr.zip`.
2. Drop `decoder.py` in the folder.
3. Install zbar + Python deps (see above).
4. `python3 decoder.py`: watch the script eat QR files like Pac-Man.
5. `grep` for CTFs flag format because we’re efficient and not romantically attached to lines 1-99.

```bash
$ cat decoded_messages.txt | grep zero                                              <<<
41.png  zero{in_the_randomness_of_qr}
```

Boom: `41.png` is the one that decided to be useful.

---

### 🔁 **Recovery & Artifacts**

```bash
$ cat decoded_messages.txt | grep zero                                              <<<
41.png  zero{in_the_randomness_of_qr}
```

Artifacts you care about: `decoded_messages.txt` (100 glorious lines), `decoder.py` (the script that saved my evening), and `41.png` (the show-off that hid the flag).

---

### ✅ **Validation**

Why I’m not hallucinating the flag:

* The flag text was present verbatim in the decoded QR payload: not guessed, not inferred, not drunk-postulated.
* It matches the `zero{...}` CTF format we love and fear.
* The decode process is reproducible: run the script, grep for `zero`, collect your imaginary trophy.

---

### 🏁 **Flag**

```
zero{in_the_randomness_of_qr}
```

---

### 💡 **Takeaways**

* Automate the boring stuff: your retinas will file a formal complaint otherwise. 🥱➡️🤖
* Base64 is the duct tape of lazy encodings: everything gets wrapped in it at some point. 🥔🔤
* `grep` is the metal detector of CTFs: loud, reliable, and oddly satisfying. 🧲
* Tools combo: zbar + Python = batch-decoding bliss. If it were a band, I'd buy the T-shirt. 🎸
* If one QR contains the flag, celebrate quietly: the others are probably writing love letters to potatoes.

---

**Solved by TheM3chanik: [contact@them3chanik.com](mailto:contact@them3chanik.com)**

