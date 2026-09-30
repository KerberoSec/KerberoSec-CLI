# Imagery (HTB Retired) ImageMagick RCE PoC

> **Educational PoC** derived from the retired Hack The Box machine **Imagery**.  
> Context: how unsafe composition of ImageMagick commands enables command injection / RCE.  
> No spoilers for active content; this repo is for local labs and defensive learning.

<p align="center">
  <img alt="scope" src="https://img.shields.io/badge/scope-HTB%20Imagery%20(retired)-blueviolet">
  <img alt="python" src="https://img.shields.io/badge/python-3.10%2B-orange">
  <img alt="license" src="https://img.shields.io/badge/license-MIT-green">
</p>

---

##  Context:

Imagery's media API accepts JSON like:

```json
{
  "imageId": "abc123",
  "transformType": "crop",
  "params": { "x": "10", "y": "20", "width": "128", "height": "128" }
}
```

The backend interpolates these fields directly into a shell string and runs it with `shell=True`, user input can cross the trust boundary and become shell syntax, not just data.

---

##  Root cause (code‑level):

The vulnerable pattern is exemplified by code like this:

```python
# Vulnerable: string interpolation + shell=True
command = f"{IMAGEMAGICK_CONVERT_PATH} {original_filepath} -crop {width}x{height}+{x}+{y} {output_filepath}"
subprocess.run(command, capture_output=True, text=True, shell=True, check=True)
```

**Why it’s dangerous**

- `width`, `height`, `x`, `y` (and even paths) may be user‑controlled.  
- With `shell=True`, the string is interpreted by a shell; metacharacters (`;`, `|`, `&`, backticks, `$()`, newlines, etc.) change control flow.  
- Result: attacker‑supplied values can inject additional commands, achieving RCE under the service account.

---

##  Quick start (local lab):

> Operate only in your own lab; do not target real services or active HTB machines.

```bash
git clone https://github.com/yourname/imagery-rce.git
cd imagery-rce
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt  # if present
python imagery-rce.py --help
```

## PoC (Screenshot):

*[Image: PoC]*

---

##  References:

- OWASP: Injection Prevention Cheat Sheet  
- PortSwigger Academy: Command Injection labs  
- MITRE CWE‑78: OS Command Injection  
- ImageMagick Security Policy (`policy.xml`) guide

---

##  Ethics & licensing:

- For **authorized research/education only**; follow HTB rules and local law.  
- No publication of active‑box spoilers, credentials, or payload strings.  
- License: MIT (see [LICENSE](./LICENSE)).
